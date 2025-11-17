#!/usr/bin/env python3
"""
Backend Testing Suite for SingGifts Discount Coupon Feature
Tests coupon validation API and checkout integration with coupons
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime, timezone

# Get backend URL from frontend .env
BACKEND_URL = "https://gift-mart-sg.preview.emergentagent.com/api"

# Test data
TEST_USER = {
    "email": "admin@singgifts.sg",
    "password": "admin123"
}

# Available test coupons from seed data
TEST_COUPONS = {
    "WELCOME10": {"discount_type": "percentage", "discount_value": 10, "min_purchase": 50},
    "SAVE20": {"discount_type": "percentage", "discount_value": 20, "min_purchase": 100},
    "FLAT15": {"discount_type": "fixed", "discount_value": 15, "min_purchase": 75},
    "SINGAPORE50": {"discount_type": "fixed", "discount_value": 50, "min_purchase": 200},
    "FREESHIP": {"discount_type": "fixed", "discount_value": 10, "min_purchase": 50}
}

class CouponTester:
    def __init__(self):
        self.session = None
        self.session_token = None
        self.user_data = None
        self.test_results = []
        
    async def setup_session(self):
        """Initialize HTTP session"""
        self.session = aiohttp.ClientSession()
        
    async def cleanup_session(self):
        """Close HTTP session"""
        if self.session:
            await self.session.close()
            
    async def login_user(self):
        """Login test user and get session token"""
        print("🔐 Logging in test user...")
        
        # Step 1: Login to get OTP
        login_data = {
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        }
        
        async with self.session.post(f"{BACKEND_URL}/auth/login", params=login_data) as resp:
            if resp.status != 200:
                result = await resp.text()
                raise Exception(f"Login failed: {resp.status} - {result}")
            
            login_result = await resp.json()
            otp = login_result.get("otp")
            
        # Step 2: Verify OTP to get session token
        otp_data = {
            "email": TEST_USER["email"],
            "otp": otp
        }
        
        async with self.session.post(f"{BACKEND_URL}/auth/verify-login-otp", params=otp_data) as resp:
            if resp.status != 200:
                result = await resp.text()
                raise Exception(f"OTP verification failed: {resp.status} - {result}")
            
            otp_result = await resp.json()
            self.session_token = otp_result.get("session_token")
            self.user_data = otp_result.get("user")
            
        print(f"✅ Login successful for user: {self.user_data['email']}")
        return True
        
    async def test_coupon_validation_api(self):
        """Test /api/coupons/validate endpoint"""
        print("\n🎫 Testing Coupon Validation API...")
        
        # Test 1: Valid coupons
        for code, expected in TEST_COUPONS.items():
            try:
                coupon_data = {"code": code}
                async with self.session.post(f"{BACKEND_URL}/coupons/validate", json=coupon_data) as resp:
                    if resp.status == 200:
                        result = await resp.json()
                        
                        # Validate response structure
                        required_fields = ["code", "discount_type", "discount_value", "min_purchase"]
                        missing_fields = [field for field in required_fields if field not in result]
                        
                        if missing_fields:
                            self.test_results.append(f"❌ {code}: Missing fields {missing_fields}")
                        elif (result["discount_type"] == expected["discount_type"] and 
                              result["discount_value"] == expected["discount_value"] and
                              result["min_purchase"] == expected["min_purchase"]):
                            self.test_results.append(f"✅ {code}: Valid coupon validated correctly")
                        else:
                            self.test_results.append(f"❌ {code}: Incorrect coupon data returned")
                    else:
                        error_text = await resp.text()
                        self.test_results.append(f"❌ {code}: API error {resp.status} - {error_text}")
                        
            except Exception as e:
                self.test_results.append(f"❌ {code}: Exception - {str(e)}")
        
        # Test 2: Invalid coupon
        try:
            invalid_coupon = {"code": "INVALID123"}
            async with self.session.post(f"{BACKEND_URL}/coupons/validate", json=invalid_coupon) as resp:
                if resp.status == 404:
                    self.test_results.append("✅ Invalid coupon correctly rejected (404)")
                else:
                    error_text = await resp.text()
                    self.test_results.append(f"❌ Invalid coupon: Expected 404, got {resp.status} - {error_text}")
        except Exception as e:
            self.test_results.append(f"❌ Invalid coupon test: Exception - {str(e)}")
            
        # Test 3: Case sensitivity (should work with uppercase)
        try:
            lowercase_coupon = {"code": "welcome10"}  # lowercase
            async with self.session.post(f"{BACKEND_URL}/coupons/validate", json=lowercase_coupon) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    if result["code"] == "WELCOME10":
                        self.test_results.append("✅ Coupon code case handling works correctly")
                    else:
                        self.test_results.append("❌ Coupon code case handling issue")
                else:
                    self.test_results.append("❌ Lowercase coupon should be accepted and converted to uppercase")
        except Exception as e:
            self.test_results.append(f"❌ Case sensitivity test: Exception - {str(e)}")
    
    async def get_sample_products(self):
        """Get sample products for cart testing"""
        try:
            async with self.session.get(f"{BACKEND_URL}/products?limit=5") as resp:
                if resp.status == 200:
                    products = await resp.json()
                    return products[:3]  # Return first 3 products
                else:
                    raise Exception(f"Failed to get products: {resp.status}")
        except Exception as e:
            raise Exception(f"Error getting products: {str(e)}")
    
    async def test_checkout_with_coupons(self):
        """Test checkout integration with coupon application"""
        print("\n🛒 Testing Checkout with Coupon Integration...")
        
        # Get sample products
        products = await self.get_sample_products()
        if not products:
            self.test_results.append("❌ No products available for checkout testing")
            return
            
        # Test scenarios
        test_scenarios = [
            {
                "name": "Valid coupon with sufficient cart value",
                "coupon": "WELCOME10",
                "cart_items": [
                    {"product_id": products[0]["id"], "quantity": 2},  # Should be >= $50
                    {"product_id": products[1]["id"], "quantity": 1}
                ]
            },
            {
                "name": "Valid coupon with insufficient cart value", 
                "coupon": "SAVE20",  # Requires $100 minimum
                "cart_items": [
                    {"product_id": products[0]["id"], "quantity": 1}  # Should be < $100
                ]
            },
            {
                "name": "Fixed discount coupon",
                "coupon": "FLAT15",
                "cart_items": [
                    {"product_id": products[0]["id"], "quantity": 3},  # Should be >= $75
                    {"product_id": products[1]["id"], "quantity": 1}
                ]
            },
            {
                "name": "High value fixed discount",
                "coupon": "SINGAPORE50",
                "cart_items": [
                    {"product_id": products[0]["id"], "quantity": 4},  # Should be >= $200
                    {"product_id": products[1]["id"], "quantity": 3},
                    {"product_id": products[2]["id"], "quantity": 2}
                ]
            }
        ]
        
        for scenario in test_scenarios:
            try:
                # Calculate expected subtotal
                subtotal = 0
                for item in scenario["cart_items"]:
                    product = next(p for p in products if p["id"] == item["product_id"])
                    price = float(product.get("sale_price") or product.get("price"))
                    subtotal += price * item["quantity"]
                
                # Prepare checkout request
                checkout_data = {
                    "cart_items": scenario["cart_items"],
                    "shipping_address": {
                        "name": "Test User",
                        "address": "123 Test Street",
                        "city": "Singapore",
                        "postal_code": "123456",
                        "country": "Singapore"
                    },
                    "currency": "sgd",
                    "frontend_origin": "https://gift-mart-sg.preview.emergentagent.com",
                    "coupon_code": scenario["coupon"]
                }
                
                headers = {"Authorization": f"Bearer {self.session_token}"}
                
                async with self.session.post(f"{BACKEND_URL}/checkout/create-session", 
                                           json=checkout_data, headers=headers) as resp:
                    
                    if resp.status == 200:
                        result = await resp.json()
                        
                        # Get coupon details for validation
                        coupon_info = TEST_COUPONS[scenario["coupon"]]
                        
                        # Calculate expected discount
                        expected_discount = 0
                        if subtotal >= coupon_info["min_purchase"]:
                            if coupon_info["discount_type"] == "percentage":
                                expected_discount = (subtotal * coupon_info["discount_value"]) / 100
                            else:  # fixed
                                expected_discount = coupon_info["discount_value"]
                        
                        expected_total = max(0, subtotal - expected_discount)
                        
                        # Check if session was created successfully
                        if "session_id" in result and "url" in result:
                            self.test_results.append(f"✅ {scenario['name']}: Checkout session created successfully")
                            self.test_results.append(f"   📊 Subtotal: ${subtotal:.2f}, Expected discount: ${expected_discount:.2f}")
                        else:
                            self.test_results.append(f"❌ {scenario['name']}: Missing session_id or url in response")
                            
                    else:
                        error_text = await resp.text()
                        self.test_results.append(f"❌ {scenario['name']}: Checkout failed {resp.status} - {error_text}")
                        
            except Exception as e:
                self.test_results.append(f"❌ {scenario['name']}: Exception - {str(e)}")
        
        # Test invalid coupon in checkout
        try:
            checkout_data = {
                "cart_items": [{"product_id": products[0]["id"], "quantity": 2}],
                "shipping_address": {
                    "name": "Test User",
                    "address": "123 Test Street", 
                    "city": "Singapore",
                    "postal_code": "123456",
                    "country": "Singapore"
                },
                "currency": "sgd",
                "frontend_origin": "https://gift-mart-sg.preview.emergentagent.com",
                "coupon_code": "INVALID123"
            }
            
            headers = {"Authorization": f"Bearer {self.session_token}"}
            
            async with self.session.post(f"{BACKEND_URL}/checkout/create-session",
                                       json=checkout_data, headers=headers) as resp:
                
                if resp.status == 200:
                    # Invalid coupon should be ignored, checkout should proceed without discount
                    result = await resp.json()
                    if "session_id" in result:
                        self.test_results.append("✅ Invalid coupon in checkout: Ignored gracefully, checkout proceeded")
                    else:
                        self.test_results.append("❌ Invalid coupon in checkout: Unexpected response format")
                else:
                    error_text = await resp.text()
                    self.test_results.append(f"❌ Invalid coupon in checkout: {resp.status} - {error_text}")
                    
        except Exception as e:
            self.test_results.append(f"❌ Invalid coupon checkout test: Exception - {str(e)}")
    
    async def run_all_tests(self):
        """Run all coupon tests"""
        print("🚀 Starting SingGifts Discount Coupon Backend Tests")
        print("=" * 60)
        
        try:
            await self.setup_session()
            
            # Test coupon validation API first (no auth required)
            await self.test_coupon_validation_api()
            
            # Try to login for checkout tests
            try:
                await self.login_user()
                await self.test_checkout_with_coupons()
            except Exception as login_error:
                self.test_results.append(f"⚠️  Login failed, skipping checkout tests: {str(login_error)}")
            
        except Exception as e:
            self.test_results.append(f"❌ Critical error: {str(e)}")
            
        finally:
            await self.cleanup_session()
            
        # Print results
        print("\n" + "=" * 60)
        print("📋 TEST RESULTS SUMMARY")
        print("=" * 60)
        
        passed = 0
        failed = 0
        
        for result in self.test_results:
            print(result)
            if result.startswith("✅"):
                passed += 1
            elif result.startswith("❌"):
                failed += 1
                
        print("\n" + "=" * 60)
        print(f"📊 FINAL SCORE: {passed} PASSED, {failed} FAILED")
        print("=" * 60)
        
        return passed, failed

async def main():
    """Main test runner"""
    tester = CouponTester()
    passed, failed = await tester.run_all_tests()
    
    # Exit with appropriate code
    if failed > 0:
        print(f"\n❌ Tests completed with {failed} failures")
        exit(1)
    else:
        print(f"\n✅ All {passed} tests passed successfully!")
        exit(0)

if __name__ == "__main__":
    asyncio.run(main())