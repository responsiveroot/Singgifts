import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, User, MapPin, Mail, Phone } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useCurrency } from '../context/CurrencyContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function DashboardPage({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const { convertAndFormat } = useCurrency();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`, { withCredentials: true });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'cancelled':
        return <XCircle className="text-red-600" size={20} />;
      case 'shipped':
        return <Package className="text-blue-600" size={20} />;
      default:
        return <Clock className="text-yellow-600" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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
    <div className="dashboard-page py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-playfair font-bold text-gray-900 mb-2" data-testid="dashboard-title">My Dashboard</h1>
          <p className="text-lg text-gray-600 font-inter">Welcome back, {user?.name}!</p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-8">
          <div className="flex items-center space-x-4">
            {user?.picture ? (
              <img src={user.picture} alt={user.name} className="w-16 h-16 rounded-full" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 font-inter">{user?.name}</h2>
              <p className="text-gray-600 font-inter">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div>
          <h2 className="text-3xl font-playfair font-bold text-gray-900 mb-6">My Orders</h2>

          {orders.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-md">
              <Package className="mx-auto mb-4 text-gray-300" size={64} />
              <h3 className="text-xl font-semibold text-gray-700 mb-2 font-inter">No orders yet</h3>
              <p className="text-gray-500 font-inter">Start shopping to see your orders here</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl p-6 shadow-md" data-testid={`order-${order.id}`}>
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between mb-6 pb-4 border-b border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600 font-inter">Order ID</p>
                      <p className="font-semibold text-gray-900 font-mono" data-testid="order-id">{order.id.slice(0, 8)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-inter">Date</p>
                      <p className="font-semibold text-gray-900 font-inter">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-inter">Total</p>
                      <p className="font-semibold text-gray-900 font-inter" data-testid="order-total">{convertAndFormat(order.total_amount)}</p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)} font-inter`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-2 capitalize">{order.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg"></div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 font-inter">{item.product_name}</p>
                          <p className="text-sm text-gray-600 font-inter">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-900 font-inter">SGD {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Address */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2 font-inter">Shipping Address</p>
                    <p className="text-sm text-gray-600 font-inter">
                      {order.shipping_address.fullName}<br />
                      {order.shipping_address.address}<br />
                      {order.shipping_address.city} {order.shipping_address.postalCode}<br />
                      {order.shipping_address.phone}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;