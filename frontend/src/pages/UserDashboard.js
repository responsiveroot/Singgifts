import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, MapPin, Heart, LogOut, Edit2, Mail } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useCurrency } from '../context/CurrencyContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function UserDashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProfile, setEditProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const { convertAndFormat } = useCurrency();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setLoading(true);
    fetchData();
  }, [user, activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'orders') {
        const response = await axios.get(`${API}/orders`, { withCredentials: true });
        setOrders(response.data);
      } else if (activeTab === 'wishlist') {
        const response = await axios.get(`${API}/wishlist`, { withCredentials: true });
        setWishlist(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API}/users/profile`, profileData, { withCredentials: true });
      setUser(response.data);
      toast.success('Profile updated successfully');
      setEditProfile(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-playfair font-bold text-gray-900 mb-8">My Account</h1>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6">
                {/* User Info */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <User size={40} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 font-inter">{user?.name}</h3>
                  <p className="text-sm text-gray-600 font-inter">{user?.email}</p>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-inter ${
                      activeTab === 'orders' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Package size={20} />
                    <span>My Orders</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('wishlist')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-inter ${
                      activeTab === 'wishlist' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Heart size={20} />
                    <span>Wishlist</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-inter ${
                      activeTab === 'profile' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <User size={20} />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-inter"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-playfair font-bold mb-6">My Orders</h2>
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-sm text-gray-600 font-inter">Order #{order.id.substring(0, 8)}</p>
                              <p className="text-xs text-gray-500 font-inter">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-3 py-1 text-xs rounded-full font-inter ${getStatusColor(order.status || 'pending')}`}>
                              {order.status || 'pending'}
                            </span>
                          </div>
                          <div className="space-y-2 mb-4">
                            {order.cart_items?.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-700 font-inter">{item.product_name} × {item.quantity}</span>
                                <span className="text-gray-900 font-inter">{convertAndFormat(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t pt-4 flex justify-between items-center">
                            <span className="font-semibold text-gray-900 font-inter">Total</span>
                            <span className="font-bold text-primary text-lg font-inter">{convertAndFormat(order.amount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package size={64} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-600 font-inter">No orders yet</p>
                      <Link to="/products" className="text-primary hover:underline font-inter mt-2 inline-block">
                        Start Shopping
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-playfair font-bold mb-6">My Wishlist</h2>
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {wishlist.map((item) => (
                        <Link
                          key={item.product.id}
                          to={`/products/${item.product.id}`}
                          className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-48 object-cover" />
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 font-inter">{item.product.name}</h3>
                            <p className="text-primary font-bold font-inter">{convertAndFormat(item.product.sale_price || item.product.price)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart size={64} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-600 font-inter">Your wishlist is empty</p>
                      <Link to="/products" className="text-primary hover:underline font-inter mt-2 inline-block">
                        Browse Products
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-playfair font-bold">Profile Information</h2>
                    {!editProfile && (
                      <button
                        onClick={() => setEditProfile(true)}
                        className="flex items-center space-x-2 text-primary hover:underline font-inter"
                      >
                        <Edit2 size={18} />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>

                  {editProfile ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Name</label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Email</label>
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 font-inter"
                        />
                        <p className="text-xs text-gray-500 mt-1 font-inter">Email cannot be changed</p>
                      </div>
                      <div className="flex space-x-4">
                        <button type="submit" className="btn-primary">Save Changes</button>
                        <button
                          type="button"
                          onClick={() => setEditProfile(false)}
                          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-inter"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1 font-inter">Name</label>
                        <p className="text-lg text-gray-900 font-inter">{user?.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1 font-inter">Email</label>
                        <p className="text-lg text-gray-900 font-inter">{user?.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1 font-inter">Member Since</label>
                        <p className="text-lg text-gray-900 font-inter">{new Date(user?.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
