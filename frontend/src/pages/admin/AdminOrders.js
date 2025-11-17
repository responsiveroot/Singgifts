import React, { useState, useEffect } from 'react';
import { Eye, Package } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/admin/orders`, {
        params: { status: statusFilter },
        withCredentials: true
      });
      setOrders(response.data.orders);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await axios.get(`${API}/admin/orders/${orderId}`, { withCredentials: true });
      setSelectedOrder(response.data);
      setShowModal(true);
    } catch (error) {
      toast.error('Failed to load order details');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API}/admin/orders/${orderId}/status`, { status: newStatus }, { withCredentials: true });
      toast.success('Order status updated successfully');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({...selectedOrder, status: newStatus});
      }
    } catch (error) {
      toast.error('Failed to update order status');
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

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-playfair font-bold text-gray-900">Orders Management</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-md mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                  {order.id.substring(0, 8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 font-inter">{order.user_email}</div>
                  {order.is_guest && <span className="text-xs text-gray-500 font-inter">Guest</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-inter">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 font-inter">
                  ${order.amount?.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full font-inter ${getStatusColor(order.status)}`}>
                    {order.status || 'pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleViewOrder(order.id)}
                    className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                  >
                    <Eye size={18} className="mr-1" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-12 text-gray-500 font-inter">No orders found</div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-playfair font-bold mb-6">Order Details</h2>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600 font-inter">Order ID</p>
                <p className="font-mono text-gray-900">{selectedOrder.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-inter">Date</p>
                <p className="text-gray-900 font-inter">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-inter">Customer Email</p>
                <p className="text-gray-900 font-inter">{selectedOrder.user_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-inter">Customer Type</p>
                <p className="text-gray-900 font-inter">{selectedOrder.is_guest ? 'Guest' : 'Registered'}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 font-playfair">Shipping Address</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 font-inter">{selectedOrder.shipping_address?.fullName}</p>
                <p className="text-gray-600 font-inter">{selectedOrder.shipping_address?.address}</p>
                <p className="text-gray-600 font-inter">
                  {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.postalCode}
                </p>
                <p className="text-gray-600 font-inter">{selectedOrder.shipping_address?.phone}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 font-playfair">Order Items</h3>
              <div className="space-y-3">
                {selectedOrder.cart_items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 font-inter">{item.product_name}</p>
                      <p className="text-sm text-gray-600 font-inter">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900 font-inter">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 font-inter">Subtotal</span>
                <span className="text-gray-900 font-inter">${selectedOrder.subtotal?.toFixed(2)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between mb-2">
                  <span className="text-green-600 font-inter">Discount</span>
                  <span className="text-green-600 font-inter">-${selectedOrder.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span className="font-inter">Total</span>
                <span className="text-primary font-inter">${selectedOrder.amount?.toFixed(2)}</span>
              </div>
            </div>

            {/* Status Update */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Update Order Status</label>
              <select
                value={selectedOrder.status || 'pending'}
                onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-inter"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;