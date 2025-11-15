import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Package } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function CheckoutPage({ user }) {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: 'Singapore',
    postalCode: '',
    paymentMethod: 'credit_card'
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API}/cart`, { withCredentials: true });
      if (response.data.length === 0) {
        toast.error('Your cart is empty');
        navigate('/cart');
        return;
      }
      setCartItems(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product.sale_price || item.product.price;
      return total + (price * item.cart_item.quantity);
    }, 0).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const orderItems = cartItems.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.cart_item.quantity,
        price: item.product.sale_price || item.product.price
      }));

      const orderData = {
        items: orderItems,
        total_amount: parseFloat(calculateTotal()),
        shipping_address: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode
        },
        payment_method: formData.paymentMethod
      };

      await axios.post(`${API}/orders`, orderData, { withCredentials: true });
      
      toast.success('Order placed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to place order');
    } finally {
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
        <h1 className="text-4xl font-playfair font-bold text-gray-900 mb-8" data-testid="checkout-title">Checkout</h1>

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
                className="w-full btn-primary text-lg py-4 disabled:opacity-50"
                data-testid="place-order-btn"
              >
                {submitting ? 'Placing Order...' : 'Place Order'}
              </button>
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

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between font-inter">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold" data-testid="checkout-subtotal">SGD {calculateTotal()}</span>
                </div>
                <div className="flex justify-between font-inter">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between font-inter">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-primary" data-testid="checkout-total">SGD {calculateTotal()}</span>
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