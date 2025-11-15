import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, Tag } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function DealsPage({ user }) {
  const [deals, setDeals] = useState([]);
  const [dealProducts, setDealProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await axios.get(`${API}/deals`);
      setDeals(response.data);

      // Fetch products for each deal
      const productsPromises = response.data.map(async (deal) => {
        const products = await Promise.all(
          deal.product_ids.slice(0, 6).map(id => 
            axios.get(`${API}/products/${id}`).catch(() => null)
          )
        );
        return { dealId: deal.id, products: products.filter(p => p !== null).map(p => p.data) };
      });

      const productsData = await Promise.all(productsPromises);
      const productsMap = {};
      productsData.forEach(({ dealId, products }) => {
        productsMap[dealId] = products;
      });
      setDealProducts(productsMap);
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

  if (deals.length === 0) {
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

        {/* Deals */}
        <div className="space-y-12">
          {deals.map((deal) => (
            <div key={deal.id} className="bg-white rounded-2xl shadow-xl overflow-hidden" data-testid={`deal-${deal.id}`}>
              {/* Deal Header */}
              <div className="relative">
                <img
                  src={deal.banner_image}
                  alt={deal.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="max-w-4xl">
                    <div className="inline-block bg-red-600 px-4 py-2 rounded-full text-sm font-bold mb-4">
                      {deal.discount_percentage}% OFF
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-playfair font-bold mb-2">{deal.title}</h2>
                    <p className="text-lg opacity-90 font-inter mb-4">{deal.description}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        <Clock size={18} className="mr-2" />
                        <span className="font-semibold font-inter">{calculateTimeLeft(deal.end_date)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deal Products */}
              <div className="p-8">
                {dealProducts[deal.id] && dealProducts[deal.id].length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dealProducts[deal.id].map((product) => (
                      <Link
                        key={product.id}
                        to={`/products/${product.id}`}
                        className="bg-gray-50 rounded-xl overflow-hidden shadow-md card-hover group"
                      >
                        <div className="product-image h-48 bg-gray-100 relative">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {deal.discount_percentage}% OFF
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex items-center mb-2">
                            <Star className="text-yellow-400 fill-current" size={14} />
                            <span className="text-sm font-semibold text-gray-700 ml-1 font-inter">{product.rating}</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2 font-inter line-clamp-2">{product.name}</h3>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xl font-bold text-primary font-inter">
                                SGD {(product.price * (1 - deal.discount_percentage / 100)).toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-500 line-through ml-2 font-inter">SGD {product.price}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8 font-inter">Loading products...</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DealsPage;