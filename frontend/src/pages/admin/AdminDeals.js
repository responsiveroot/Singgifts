import React, { useState, useEffect } from 'react';
import { Tag, Calendar, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AdminDeals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, expired, upcoming

  useEffect(() => {
    fetchDealsProducts();
  }, []);

  const fetchDealsProducts = async () => {
    try {
      const response = await axios.get(`${API}/admin/products`, { withCredentials: true });
      // Filter products that have deals
      const dealProducts = response.data.products.filter(p => p.is_on_deal);
      setProducts(dealProducts);
    } catch (error) {
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const getDealStatus = (product) => {
    if (!product.deal_start_date || !product.deal_end_date) {
      return { status: 'active', label: 'Active (No dates)', color: 'green' };
    }

    const now = new Date();
    const startDate = new Date(product.deal_start_date);
    const endDate = new Date(product.deal_end_date);

    if (now < startDate) {
      return { status: 'upcoming', label: 'Upcoming', color: 'blue' };
    } else if (now > endDate) {
      return { status: 'expired', label: 'Expired', color: 'red' };
    } else {
      return { status: 'active', label: 'Active', color: 'green' };
    }
  };

  const calculateTimeLeft = (endDate) => {
    if (!endDate) return null;
    const difference = new Date(endDate) - new Date();
    if (difference <= 0) return 'Expired';

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Less than 1h left';
  };

  const filteredProducts = products.filter(product => {
    if (filterStatus === 'all') return true;
    const { status } = getDealStatus(product);
    return status === filterStatus;
  });

  const stats = {
    total: products.length,
    active: products.filter(p => getDealStatus(p).status === 'active').length,
    upcoming: products.filter(p => getDealStatus(p).status === 'upcoming').length,
    expired: products.filter(p => getDealStatus(p).status === 'expired').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-2">Deals Management</h1>
        <p className="text-gray-600 font-inter">Track and manage product deals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Tag className="text-primary" size={24} />
            <span className="text-2xl font-bold text-gray-900 font-inter">{stats.total}</span>
          </div>
          <p className="text-sm text-gray-600 font-inter">Total Deals</p>
        </div>

        <div className="bg-green-50 rounded-xl p-6 shadow-sm border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="text-green-600" size={24} />
            <span className="text-2xl font-bold text-green-600 font-inter">{stats.active}</span>
          </div>
          <p className="text-sm text-green-700 font-inter">Active Deals</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="text-blue-600" size={24} />
            <span className="text-2xl font-bold text-blue-600 font-inter">{stats.upcoming}</span>
          </div>
          <p className="text-sm text-blue-700 font-inter">Upcoming Deals</p>
        </div>

        <div className="bg-red-50 rounded-xl p-6 shadow-sm border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="text-red-600" size={24} />
            <span className="text-2xl font-bold text-red-600 font-inter">{stats.expired}</span>
          </div>
          <p className="text-sm text-red-700 font-inter">Expired Deals</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700 font-inter">Filter:</span>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-inter text-sm transition-colors ${
              filterStatus === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-lg font-inter text-sm transition-colors ${
              filterStatus === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active ({stats.active})
          </button>
          <button
            onClick={() => setFilterStatus('upcoming')}
            className={`px-4 py-2 rounded-lg font-inter text-sm transition-colors ${
              filterStatus === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upcoming ({stats.upcoming})
          </button>
          <button
            onClick={() => setFilterStatus('expired')}
            className={`px-4 py-2 rounded-lg font-inter text-sm transition-colors ${
              filterStatus === 'expired' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Expired ({stats.expired})
          </button>
        </div>
      </div>

      {/* Deals Table */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
          <Tag className="mx-auto mb-4 text-gray-300" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2 font-playfair">No Deals Found</h3>
          <p className="text-gray-600 mb-6 font-inter">
            {filterStatus === 'all' 
              ? 'Start by adding deals to your products in the Products section.' 
              : `No ${filterStatus} deals at the moment.`}
          </p>
          <Link to="/admin/products" className="btn-primary inline-block">
            Manage Products
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">Discount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">Period</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">Time Left</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const dealStatus = getDealStatus(product);
                  const timeLeft = calculateTimeLeft(product.deal_end_date);
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.images && product.images[0] ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.name} 
                              className="w-12 h-12 rounded-lg object-cover mr-3"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-200 mr-3 flex items-center justify-center">
                              <Tag size={20} className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 font-inter">{product.name}</div>
                            <div className="text-xs text-gray-500 font-inter">SKU: {product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-inter">
                          <div className="text-gray-900 font-semibold">S${product.price}</div>
                          {product.sale_price && (
                            <div className="text-xs text-green-600">Sale: S${product.sale_price}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800 font-inter">
                          <TrendingUp size={14} className="mr-1" />
                          {product.deal_percentage}% OFF
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-inter">
                          {product.deal_start_date ? (
                            <>
                              <div className="flex items-center text-xs text-gray-600">
                                <Calendar size={12} className="mr-1" />
                                {new Date(product.deal_start_date).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-600">
                                to {new Date(product.deal_end_date).toLocaleDateString()}
                              </div>
                            </>
                          ) : (
                            <span className="text-xs text-gray-500">No dates set</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-inter ${
                          dealStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                          dealStatus.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {dealStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 font-inter">
                          {timeLeft || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`/admin/products`}
                          className="text-primary hover:text-primary-dark font-inter"
                        >
                          Edit Product
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <AlertCircle className="text-blue-600 mr-3 flex-shrink-0 mt-1" size={20} />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1 font-inter">How Deals Work</h3>
            <ul className="text-sm text-blue-800 space-y-1 font-inter">
              <li>• Set deals on individual products in the Products section</li>
              <li>• Deals with start/end dates are automatically activated and deactivated</li>
              <li>• Active deals are displayed on the homepage and deals page</li>
              <li>• Discount percentage is shown as a badge on product listings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDeals;
