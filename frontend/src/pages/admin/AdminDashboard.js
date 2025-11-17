import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Package, ShoppingCart, Users, DollarSign, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/dashboard/stats`, { withCredentials: true });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-8">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-inter">Total Products</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_products || 0}</p>
            </div>
            <Package className="text-blue-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-inter">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_orders || 0}</p>
            </div>
            <ShoppingCart className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-inter">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_customers || 0}</p>
            </div>
            <Users className="text-purple-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-inter">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">${stats?.total_revenue?.toFixed(2) || 0}</p>
            </div>
            <DollarSign className="text-yellow-500" size={40} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-playfair font-bold text-gray-900 mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {stats?.recent_orders?.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900 font-inter text-sm">{order.user_email}</p>
                  <p className="text-xs text-gray-600 font-inter">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <span className="font-bold text-primary font-inter">${order.amount?.toFixed(2)}</span>
              </div>
            ))}
            {(!stats?.recent_orders || stats.recent_orders.length === 0) && (
              <p className="text-gray-500 text-center py-4 font-inter">No recent orders</p>
            )}
          </div>
          <Link to="/admin/orders" className="block mt-4 text-center text-primary hover:underline font-inter">
            View All Orders →
          </Link>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center mb-4">
            <AlertTriangle className="text-red-500 mr-2" size={24} />
            <h2 className="text-xl font-playfair font-bold text-gray-900">Low Stock Alert</h2>
          </div>
          <div className="space-y-3">
            {stats?.low_stock_products?.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 font-inter text-sm">{product.name}</p>
                  <p className="text-xs text-gray-600 font-inter">SKU: {product.sku}</p>
                </div>
                <span className="font-bold text-red-600 font-inter">{product.stock} left</span>
              </div>
            ))}
            {(!stats?.low_stock_products || stats.low_stock_products.length === 0) && (
              <p className="text-gray-500 text-center py-4 font-inter">All products in stock</p>
            )}
          </div>
          <Link to="/admin/products" className="block mt-4 text-center text-primary hover:underline font-inter">
            View All Products →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;