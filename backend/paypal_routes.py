from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import requests
import os
from datetime import datetime, timezone
from typing import Optional
from urllib.parse import urlencode, parse_qs

# PayPal Classic NVP API Configuration
PAYPAL_MODE = os.environ.get("PAYPAL_MODE", "live")
PAYPAL_API_ENDPOINT = "https://api-3t.paypal.com/nvp" if PAYPAL_MODE == "live" else "https://api-3t.sandbox.paypal.com/nvp"
PAYPAL_USER = os.environ.get("PAYPAL_CLIENT_ID")  # API Username
PAYPAL_PWD = os.environ.get("PAYPAL_CLIENT_SECRET")  # API Password
PAYPAL_SIGNATURE = os.environ.get("PAYPAL_SIGNATURE")
PAYPAL_VERSION = "204"

paypal_router = APIRouter()

def paypal_nvp_call(method: str, params: dict) -> dict:
    """Make PayPal NVP API call"""
    payload = {
        'METHOD': method,
        'USER': PAYPAL_USER,
        'PWD': PAYPAL_PWD,
        'SIGNATURE': PAYPAL_SIGNATURE,
        'VERSION': PAYPAL_VERSION,
    }
    payload.update(params)
    
    response = requests.post(PAYPAL_API_ENDPOINT, data=payload)
    
    # Parse NVP response
    response_dict = {}
    for pair in response.text.split('&'):
        if '=' in pair:
            key, value = pair.split('=', 1)
            response_dict[key] = requests.utils.unquote(value)
    
    return response_dict

class PayPalOrderCreate(BaseModel):
    amount: float
    currency: str = "SGD"
    order_id: str
    items: list

class PayPalOrderCapture(BaseModel):
    paymentID: str
    payerID: str
    order_id: str

@paypal_router.post("/paypal/create-payment")
async def create_paypal_payment(order_data: PayPalOrderCreate):
    """Create PayPal payment"""
    try:
        # Create payment object
        payment = paypalrestsdk.Payment({
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": f"{os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:3000')}/checkout/success",
                "cancel_url": f"{os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:3000')}/checkout/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [
                        {
                            "name": item.get("name", "Product"),
                            "sku": item.get("id", ""),
                            "price": str(item.get("price", 0)),
                            "currency": order_data.currency,
                            "quantity": item.get("quantity", 1)
                        }
                        for item in order_data.items
                    ]
                },
                "amount": {
                    "total": str(order_data.amount),
                    "currency": order_data.currency
                },
                "description": f"Order #{order_data.order_id}"
            }]
        })

        if payment.create():
            # Get approval URL
            for link in payment.links:
                if link.rel == "approval_url":
                    return {
                        "paymentID": payment.id,
                        "approvalUrl": str(link.href)
                    }
        else:
            raise HTTPException(status_code=400, detail=str(payment.error))

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PayPal payment creation failed: {str(e)}")


@paypal_router.post("/paypal/execute-payment")
async def execute_paypal_payment(payment_data: PayPalOrderCapture):
    """Execute/capture PayPal payment after user approval"""
    try:
        payment = paypalrestsdk.Payment.find(payment_data.paymentID)
        
        if payment.execute({"payer_id": payment_data.payerID}):
            # Payment successful
            return {
                "success": True,
                "payment_id": payment.id,
                "state": payment.state,
                "payer_email": payment.payer.payer_info.email if hasattr(payment.payer, 'payer_info') else None,
                "amount": payment.transactions[0].amount.total,
                "currency": payment.transactions[0].amount.currency
            }
        else:
            raise HTTPException(status_code=400, detail=str(payment.error))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PayPal payment execution failed: {str(e)}")


@paypal_router.get("/paypal/payment/{payment_id}")
async def get_payment_details(payment_id: str):
    """Get PayPal payment details"""
    try:
        payment = paypalrestsdk.Payment.find(payment_id)
        return {
            "id": payment.id,
            "state": payment.state,
            "amount": payment.transactions[0].amount.total,
            "currency": payment.transactions[0].amount.currency,
            "payer_email": payment.payer.payer_info.email if hasattr(payment.payer, 'payer_info') else None
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Payment not found: {str(e)}")
