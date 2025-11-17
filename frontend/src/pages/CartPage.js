import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useCurrency } from '../context/CurrencyContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function CartPage({ user, updateCartCount }) {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { convertAndFormat, convertOnly } = useCurrency();

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
      setCartItems(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      // Update locally first for better UX
      setCartItems(prev => prev.map(item => 
        item.cart_item.id === cartItemId 
          ? { ...item, cart_item: { ...item.cart_item, quantity: newQuantity } }
          : item
      ));
      
      // Then update on server (simplified - in real app you'd have an update endpoint)
      await removeFromCart(cartItemId);
      const item = cartItems.find(i => i.cart_item.id === cartItemId);
      await axios.post(
        `${API}/cart`,
        { product_id: item.product.id, quantity: newQuantity },
        { withCredentials: true }
      );
      updateCartCount();
    } catch (error) {
      toast.error('Failed to update quantity');
      fetchCart(); // Reload on error
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await axios.delete(`${API}/cart/${cartItemId}`, { withCredentials: true });
      setCartItems(prev => prev.filter(item => item.cart_item.id !== cartItemId));
      updateCartCount();
      toast.success('Removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product.sale_price || item.product.price;
      return total + (price * item.cart_item.quantity);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <ShoppingBag className="mx-auto mb-6 text-gray-300" size={80} />
          <h2 className="text-3xl font-playfair font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8 font-inter">Looks like you haven't added any items yet</p>
          <Link to="/products" className="btn-primary inline-flex items-center" data-testid="continue-shopping-btn">
            Start Shopping
            <ArrowRight size={20} className="ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-playfair font-bold text-gray-900 mb-8" data-testid="cart-title">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.cart_item.id} className="bg-white rounded-xl p-6 shadow-md" data-testid={`cart-item-${item.product.slug}`}>
                <div className="flex items-center space-x-6">
                  {/* Product Image */}
                  <Link to={`/products/${item.product.id}`} className="flex-shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1">
                    <Link to={`/products/${item.product.id}`} className="font-semibold text-lg text-gray-900 hover:text-primary transition-colors font-inter">
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1 font-inter">{item.product.description}</p>
                    <div className="mt-2">
                      {item.product.sale_price ? (
                        <>
                          <span className="text-xl font-bold text-primary font-inter">SGD {item.product.sale_price}</span>
                          <span className="text-sm text-gray-500 line-through ml-2 font-inter">SGD {item.product.price}</span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-gray-900 font-inter">SGD {item.product.price}</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.cart_item.id, item.cart_item.quantity - 1)}
                        className="px-3 py-2 hover:bg-gray-100 transition-colors"
                        data-testid={`decrease-quantity-${item.product.slug}`}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 py-2 border-x border-gray-300 font-semibold font-inter" data-testid={`quantity-${item.product.slug}`}>
                        {item.cart_item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cart_item.id, item.cart_item.quantity + 1)}
                        className="px-3 py-2 hover:bg-gray-100 transition-colors"
                        data-testid={`increase-quantity-${item.product.slug}`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.cart_item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      data-testid={`remove-item-${item.product.slug}`}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-md sticky top-24">
              <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between font-inter">
                  <span className="text-gray-600">Subtotal ({cartItems.reduce((sum, item) => sum + item.cart_item.quantity, 0)} items)</span>
                  <span className="font-semibold text-gray-900" data-testid="cart-subtotal">SGD {calculateTotal()}</span>
                </div>
                <div className="flex justify-between font-inter">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between font-inter">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-primary" data-testid="cart-total">SGD {calculateTotal()}</span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full btn-primary block text-center"
                data-testid="proceed-to-checkout-btn"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/products"
                className="w-full mt-3 text-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors inline-block font-inter font-medium"
                data-testid="continue-shopping-link"
              >
                Continue Shopping
              </Link>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-inter">
                  🇸🇬 <strong>Free Shipping</strong> on all orders over SGD 100!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;