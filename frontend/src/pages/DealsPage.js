import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, Tag } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function DealsPage({ user }) {
  const [dealProducts, setDealProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      // Fetch products that are on deal
      const response = await axios.get(`${API}/products/deals`);
      
      // Filter only active deals (within date range)
      const now = new Date();
      const activeDeals = response.data.filter(product => {
        if (!product.deal_start_date || !product.deal_end_date) {
          // If no dates set, consider it active
          return product.is_on_deal;
        }
        
        const startDate = new Date(product.deal_start_date);
        const endDate = new Date(product.deal_end_date);
        
        return product.is_on_deal && now >= startDate && now <= endDate;
      });
      
      setDealProducts(activeDeals);
    } catch (error) {
      console.error('Failed to fetch deals:', error);
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeLeft = (endDate) => {
    const difference = new Date(endDate) - new Date();
    if (difference <= 0) return 'Expired';

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (dealProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <Tag className="mx-auto mb-6 text-gray-300" size={80} />
          <h2 className="text-3xl font-playfair font-bold text-gray-900 mb-4">No Active Deals</h2>
          <p className="text-gray-600 mb-8 font-inter">Check back soon for amazing offers!</p>
          <Link to="/products" className="btn-primary inline-flex items-center">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="deals-page py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-playfair font-bold text-gray-900 mb-4" data-testid="deals-title">
            🔥 Flash Deals & Offers
          </h1>
          <p className="text-lg text-gray-600 font-inter">Limited time offers on Singapore's finest gifts</p>
        </div>

        {/* Deal Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dealProducts.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 group" data-testid={`deal-product-${product.id}`}>
              {/* Product Image */}
              <div className="relative h-64 bg-gray-100 overflow-hidden">
                <img
                  src={product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/300x300?text=No+Image'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                {/* Deal Badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    {product.deal_percentage}% OFF
                  </div>
                </div>
                
                {/* Countdown Timer */}
                {product.deal_end_date && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center">
                      <Clock size={14} className="mr-2" />
                      {calculateTimeLeft(product.deal_end_date)}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-5">
                <div className="flex items-center mb-2">
                  <Star className="text-yellow-400 fill-current" size={16} />
                  <span className="text-sm font-semibold text-gray-700 ml-1 font-inter">{product.rating || '0.0'}</span>
                  <span className="text-xs text-gray-500 ml-1 font-inter">({product.review_count || 0})</span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-3 font-inter line-clamp-2 h-12">
                  {product.name}
                </h3>
                
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-bold text-red-600 font-inter">
                      S${(product.price * (1 - product.deal_percentage / 100)).toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 line-through ml-2 font-inter">
                      S${product.price}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded font-inter">
                    Save S${(product.price * product.deal_percentage / 100).toFixed(2)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DealsPage;