import React, { useState, useEffect } from 'react';
import { Eye, Search } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/admin/customers`, {
        params: { search: searchTerm },
        withCredentials: true
      });
      setCustomers(response.data.customers);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomer = async (customer) => {
    try {
      const response = await axios.get(`${API}/admin/customers/${customer.id}/orders`, { withCredentials: true });
      setSelectedCustomer(customer);
      setCustomerOrders(response.data.orders);
      setShowModal(true);
    } catch (error) {
      toast.error('Failed to load customer orders');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-6">Customers Management</h1>

      <div className="bg-white rounded-xl p-4 shadow-md mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input type="text" placeholder="Search customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">Orders</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-inter">{customer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-inter">{customer.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-inter">{new Date(customer.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-inter">{customer.order_count}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleViewCustomer(customer)} className="text-blue-600 hover:text-blue-900 inline-flex items-center">
                    <Eye size={18} className="mr-1" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <div className="text-center py-12 text-gray-500 font-inter">No customers found</div>}
      </div>

      {showModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-playfair font-bold mb-6">Customer Details</h2>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600 font-inter">Name</p>
                <p className="font-semibold text-gray-900 font-inter">{selectedCustomer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-inter">Email</p>
                <p className="text-gray-900 font-inter">{selectedCustomer.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-inter">Joined</p>
                <p className="text-gray-900 font-inter">{new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-inter">Total Orders</p>
                <p className="text-gray-900 font-inter">{customerOrders.length}</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-3 font-playfair">Order History</h3>
            <div className="space-y-3">
              {customerOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900 font-inter text-sm">Order #{order.id.substring(0, 8)}</p>
                    <p className="text-xs text-gray-600 font-inter">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary font-inter">${order.amount?.toFixed(2)}</p>
                    <p className="text-xs text-gray-600 font-inter">{order.status || 'pending'}</p>
                  </div>
                </div>
              ))}
              {customerOrders.length === 0 && <p className="text-gray-500 text-center py-4 font-inter">No orders yet</p>}
            </div>

            <div className="flex justify-end mt-6">
              <button onClick={() => setShowModal(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-inter">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomers;