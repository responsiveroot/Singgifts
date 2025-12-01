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
    """Create PayPal payment using Express Checkout"""
    try:
        frontend_url = os.environ.get('REACT_APP_BACKEND_URL', 'https://batik-store.preview.emergentagent.com')
        
        # Build item details for PayPal
        item_params = {}
        for idx, item in enumerate(order_data.items):
            item_params[f'L_PAYMENTREQUEST_0_NAME{idx}'] = item.get("name", "Product")
            item_params[f'L_PAYMENTREQUEST_0_AMT{idx}'] = f"{item.get('price', 0):.2f}"
            item_params[f'L_PAYMENTREQUEST_0_QTY{idx}'] = str(item.get("quantity", 1))
        
        params = {
            'PAYMENTREQUEST_0_AMT': f"{order_data.amount:.2f}",
            'PAYMENTREQUEST_0_CURRENCYCODE': order_data.currency,
            'PAYMENTREQUEST_0_PAYMENTACTION': 'Sale',
            'RETURNURL': f"{frontend_url}/checkout/success",
            'CANCELURL': f"{frontend_url}/checkout/cancel",
            'PAYMENTREQUEST_0_DESC': f"Order #{order_data.order_id}",
            **item_params
        }
        
        response = paypal_nvp_call('SetExpressCheckout', params)
        
        if response.get('ACK') in ['Success', 'SuccessWithWarning']:
            token = response.get('TOKEN')
            
            # Build PayPal redirect URL
            paypal_url = "https://www.paypal.com/cgi-bin/webscr" if PAYPAL_MODE == "live" else "https://www.sandbox.paypal.com/cgi-bin/webscr"
            approval_url = f"{paypal_url}?cmd=_express-checkout&token={token}"
            
            return {
                "paymentID": token,
                "approvalUrl": approval_url,
                "token": token
            }
        else:
            error_msg = response.get('L_LONGMESSAGE0', response.get('L_SHORTMESSAGE0', 'Unknown error'))
            raise HTTPException(status_code=400, detail=f"PayPal error: {error_msg}")

    except HTTPException:
        raise
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
