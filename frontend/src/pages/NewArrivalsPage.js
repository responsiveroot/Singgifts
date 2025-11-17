import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, TrendingUp } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function NewArrivalsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { convertAndFormat } = useCurrency();

  useEffect(() => {
    fetchNewArrivals();
  }, []);

  const fetchNewArrivals = async () => {
    try {
      const response = await axios.get(`${API}/products?limit=50`);
      // Sort by created_at to show newest first
      const sortedProducts = response.data.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setProducts(sortedProducts.slice(0, 24)); // Show top 24 newest products
    } catch (error) {
      console.error('Failed to fetch new arrivals:', error);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-80 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp size={48} className="animate-pulse" />
            <h1 className="text-5xl font-playfair font-bold">New Arrivals</h1>
          </div>
          <p className="text-xl font-inter max-w-2xl">
            Discover the latest additions to our Singapore gift collection
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-playfair font-bold">
            Latest Products ({products.length})
          </h2>
          <div className="text-sm text-gray-600 font-inter">
            Updated Daily
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-primary hover:shadow-xl transition-all relative"
            >
              {index < 6 && (
                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold shadow z-10">
                  NEW
                </div>
              )}
              <div className="aspect-square bg-gray-50 relative overflow-hidden">
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {product.sale_price && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold shadow">
                    -{Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 font-inter group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center mb-2">
                  <Star className="text-yellow-400 fill-current" size={14} />
                  <span className="text-sm text-gray-600 ml-1 font-inter">{product.rating}</span>
                  <span className="text-xs text-gray-400 ml-1 font-inter">({product.review_count})</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  {product.sale_price ? (
                    <>
                      <span className="text-lg font-bold text-primary font-inter">
                        {convertAndFormat(product.sale_price)}
                      </span>
                      <span className="text-sm text-gray-400 line-through font-inter">
                        {convertAndFormat(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-gray-900 font-inter">
                      {convertAndFormat(product.price)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 font-inter">No new arrivals at the moment.</p>
            <Link to="/products" className="mt-4 inline-block text-primary font-semibold hover:underline">
              Explore All Products
            </Link>
          </div>
        )}
      </section>

      {/* Newsletter CTA */}
      <section className="bg-gradient-to-r from-primary to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-playfair font-bold mb-4">Stay Updated</h2>
          <p className="text-lg font-inter mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter to be the first to know about new arrivals and exclusive deals
          </p>
          <div className="flex justify-center">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="px-6 py-3 rounded-l-xl w-80 text-gray-900 font-inter focus:outline-none"
            />
            <button className="bg-white text-primary px-8 py-3 rounded-r-xl font-bold hover:bg-gray-100 transition-colors font-inter">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default NewArrivalsPage;
