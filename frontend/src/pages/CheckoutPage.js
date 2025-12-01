import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Package, Lock, Tag } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useCurrency } from '../context/CurrencyContext';
import { trackBeginCheckout } from '../components/Analytics';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function CheckoutPage({ user }) {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { convertAndFormat, convertOnly, currency } = useCurrency();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: 'Singapore',
    postalCode: '',
    country: 'Singapore',
    paymentMethod: 'paypal'
  });
  const [showPayPal, setShowPayPal] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    fetchCart();
  }, [user]);

  useEffect(() => {
    if (cartItems.length > 0) {
      // Track begin checkout
      trackBeginCheckout(cartItems, calculateTotal());
    }
  }, [cartItems]);

  const fetchCart = async () => {
    try {
      // For logged-in users, fetch from backend cart
      if (user) {
        const response = await axios.get(`${API}/cart`, { withCredentials: true });
        if (response.data.length === 0) {
          toast.error('Your cart is empty');
          navigate('/cart');
          return;
        }
        setCartItems(response.data);
      } else {
        // For guests, get cart from localStorage
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        if (guestCart.length === 0) {
          toast.error('Your cart is empty');
          navigate('/cart');
          return;
        }
        
        // Fetch product details for guest cart items
        const cartWithProducts = await Promise.all(
          guestCart.map(async (item) => {
            try {
              const response = await axios.get(`${API}/products/${item.product_id}`);
              return {
                product: response.data,
                cart_item: {
                  id: item.id,
                  quantity: item.quantity
                }
              };
            } catch (error) {
              console.error('Failed to fetch product:', error);
              return null;
            }
          })
        );
        
        setCartItems(cartWithProducts.filter(item => item !== null));
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product.sale_price || item.product.price;
      return total + (price * item.cart_item.quantity);
    }, 0);
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    const subtotal = calculateSubtotal();
    
    if (appliedCoupon.discount_type === 'percentage') {
      return (subtotal * appliedCoupon.discount_value) / 100;
    } else {
      return appliedCoupon.discount_value;
    }
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return Math.max(0, subtotal - discount);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setApplyingCoupon(true);

    try {
      const response = await axios.post(`${API}/coupons/validate`, {
        code: couponCode.trim()
      }, { withCredentials: true });

      const subtotal = calculateSubtotal();
      
      // Check minimum purchase requirement
      if (subtotal < response.data.min_purchase) {
        toast.error(`Minimum purchase of $${response.data.min_purchase} required for this coupon`);
        setApplyingCoupon(false);
        return;
      }

      setAppliedCoupon(response.data);
      toast.success(`Coupon "${response.data.code}" applied successfully!`);
    } catch (error) {
      console.error('Coupon validation error:', error);
      toast.error(error.response?.data?.detail || 'Invalid coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Coupon removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.postalCode) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    // Show PayPal buttons
    setShowPayPal(true);
    toast.info('Please complete payment with PayPal');
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.detail || 'Failed to initiate checkout');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="checkout-page py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-playfair font-bold text-gray-900 mb-4" data-testid="checkout-title">Checkout</h1>
        
        {/* Guest Checkout Notice */}
        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 font-inter text-sm">
              <strong>Checking out as guest.</strong> You'll receive order confirmation via email. 
              <Link to="/auth" className="ml-2 underline hover:text-blue-900">
                Sign in
              </Link> to track orders and save your preferences.
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center mb-6">
                  <MapPin className="text-primary mr-3" size={24} />
                  <h2 className="text-2xl font-playfair font-bold text-gray-900">Shipping Information</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Full Name *</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                      required
                      data-testid="fullname-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                      required
                      data-testid="email-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                      required
                      data-testid="phone-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Postal Code *</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                      required
                      data-testid="postal-input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Address *</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                      required
                      data-testid="address-input"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center mb-6">
                  <CreditCard className="text-primary mr-3" size={24} />
                  <h2 className="text-2xl font-playfair font-bold text-gray-900">Payment Method</h2>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="credit_card"
                      checked={formData.paymentMethod === 'credit_card'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="mr-3"
                      data-testid="payment-credit-card"
                    />
                    <span className="font-inter">Credit / Debit Card</span>
                  </label>
                  <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="paynow"
                      checked={formData.paymentMethod === 'paynow'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="mr-3"
                      data-testid="payment-paynow"
                    />
                    <span className="font-inter">PayNow</span>
                  </label>
                  <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cash_on_delivery"
                      checked={formData.paymentMethod === 'cash_on_delivery'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="mr-3"
                      data-testid="payment-cod"
                    />
                    <span className="font-inter">Cash on Delivery</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary text-lg py-4 disabled:opacity-50 flex items-center justify-center space-x-2"
                data-testid="place-order-btn"
              >
                <Lock size={20} />
                <span>{submitting ? 'Redirecting to Stripe...' : 'Proceed to Payment'}</span>
              </button>
              <p className="text-xs text-center text-gray-500 mt-2">
                Secure payment powered by Stripe
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-md sticky top-24">
              <div className="flex items-center mb-6">
                <Package className="text-primary mr-3" size={24} />
                <h2 className="text-2xl font-playfair font-bold text-gray-900">Order Summary</h2>
              </div>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.cart_item.id} className="flex items-center space-x-4">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900 font-inter">{item.product.name}</p>
                      <p className="text-sm text-gray-600 font-inter">Qty: {item.cart_item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900 font-inter">
                      SGD {((item.product.sale_price || item.product.price) * item.cart_item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex items-center mb-3">
                  <Tag className="text-primary mr-2" size={18} />
                  <span className="font-semibold text-gray-900 font-inter">Have a Coupon?</span>
                </div>
                
                {!appliedCoupon ? (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter text-sm"
                      data-testid="coupon-input"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode.trim()}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 font-inter text-sm whitespace-nowrap"
                      data-testid="apply-coupon-btn"
                    >
                      {applyingCoupon ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <Tag className="text-green-600 mr-2" size={16} />
                      <span className="font-semibold text-green-800 font-inter text-sm">{appliedCoupon.code}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-red-600 hover:text-red-700 font-inter text-sm underline"
                      data-testid="remove-coupon-btn"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between font-inter">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold" data-testid="checkout-subtotal">{convertAndFormat(calculateSubtotal())}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between font-inter">
                    <span className="text-green-600">
                      Discount ({appliedCoupon.code})
                    </span>
                    <span className="font-semibold text-green-600" data-testid="checkout-discount">
                      -{convertAndFormat(calculateDiscount())}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-inter">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between font-inter">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-primary" data-testid="checkout-total">{convertAndFormat(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;