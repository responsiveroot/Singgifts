import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ChevronRight } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function HomePageNew({ user }) {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, productsRes, dealsRes] = await Promise.all([
        axios.get(`${API}/categories`),
        axios.get(`${API}/products?limit=100`),
        axios.get(`${API}/deals`)
      ]);
      
      setCategories(categoriesRes.data);
      setDeals(dealsRes.data);

      // Group products by category
      const grouped = {};
      productsRes.data.forEach(product => {
        if (!grouped[product.category_id]) {
          grouped[product.category_id] = [];
        }
        if (grouped[product.category_id].length < 6) {
          grouped[product.category_id].push(product);
        }
      });
      setProductsByCategory(grouped);
    } catch (error) {
      console.error('Failed to fetch data:', error);
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
    <div className="homepage-new bg-white">
      {/* Hero Banner - Clean Design */}
      <section className="relative overflow-hidden" style={{background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'}} data-testid="hero-banner">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-block bg-primary text-white px-4 py-1 rounded-full text-sm font-bold mb-4 font-inter">
                🇸🇬 TRUSTED SINGAPORE BRAND
              </div>
              <h1 className="text-5xl font-playfair font-bold mb-4 text-gray-900">
                Shop Authentic<br />
                <span className="text-primary">Singapore Products</span>
              </h1>
              <p className="text-lg mb-6 text-gray-700 font-inter">
                Premium gifts, souvenirs & lifestyle products from Singapore's finest brands
              </p>
              <div className="flex gap-4">
                <Link to="/products" className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors font-inter shadow-lg">
                  Start Shopping
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1686455746257-0210c23f7064" 
                alt="Singapore" 
                className="rounded-xl shadow-xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Flash Deals Banner */}
      {deals.length > 0 && (
        <section className="bg-yellow-400 py-3 border-y-4 border-yellow-500">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold font-playfair text-gray-900">⚡ Flash Sale</span>
                <span className="text-lg font-inter text-gray-900">Up to {deals[0].discount_percentage}% OFF</span>
              </div>
              <Link to="/deals" className="bg-gray-900 text-white px-6 py-2 rounded font-bold hover:bg-gray-800 transition-colors font-inter">
                Shop Now
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Category Sections - E-Commerce Style */}
      <div className="container mx-auto px-4 py-8">
        {categories.map((category, catIndex) => {
          const products = productsByCategory[category.id] || [];
          if (products.length === 0) return null;

          return (
            <section key={category.id} className="mb-8" data-testid={`category-section-${category.slug}`}>
              {/* Category Header with Banner - Professional Layout */}
              <div className="bg-white rounded-lg overflow-hidden shadow border border-gray-200">
                <div className="grid md:grid-cols-4 gap-0">
                  {/* Category Banner - Left Side (1 column) */}
                  <div 
                    className="relative h-72 md:h-auto bg-cover bg-center"
                    style={{
                      backgroundImage: `linear-gradient(rgba(227,24,55,0.85), rgba(227,24,55,0.95)), url(${category.image_url})`
                    }}
                  >
                    <div className="absolute inset-0 flex flex-col justify-center p-6 text-white">
                      <h2 className="text-2xl font-playfair font-bold mb-3 leading-tight">{category.name}</h2>
                      <p className="text-sm mb-4 opacity-90 font-inter leading-relaxed">{category.description}</p>
                      <Link 
                        to={`/products?category=${category.id}`}
                        className="inline-flex items-center text-white font-bold hover:text-yellow-300 transition-colors font-inter text-sm bg-white/20 px-4 py-2 rounded hover:bg-white/30"
                      >
                        View All
                        <ChevronRight size={18} className="ml-1" />
                      </Link>
                    </div>
                  </div>

                  {/* Products Grid - Right Side (3 columns) */}
                  <div className="md:col-span-3 p-6 bg-gray-50">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {products.map((product) => (
                        <Link
                          key={product.id}
                          to={`/products/${product.id}`}
                          className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-primary hover:shadow-md transition-all"
                          data-testid={`product-${product.slug}`}
                        >
                          <div className="aspect-square bg-white relative overflow-hidden border-b border-gray-100">
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {product.sale_price && (
                              <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold shadow">
                                {Math.round(((product.price - product.sale_price) / product.price) * 100)}% OFF
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 font-inter group-hover:text-primary transition-colors min-h-[40px]">
                              {product.name}
                            </h3>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center bg-green-50 px-2 py-1 rounded">
                                <Star className="text-green-600 fill-current" size={12} />
                                <span className="text-xs text-gray-700 ml-1 font-bold font-inter">{product.rating}</span>
                              </div>
                              <span className="text-xs text-gray-500 font-inter">({product.review_count})</span>
                            </div>
                            <div className="flex items-baseline space-x-2">
                              {product.sale_price ? (
                                <>
                                  <span className="text-xl font-bold text-primary font-inter">
                                    ${product.sale_price}
                                  </span>
                                  <span className="text-xs text-gray-500 line-through font-inter">
                                    ${product.price}
                                  </span>
                                </>
                              ) : (
                                <span className="text-xl font-bold text-gray-900 font-inter">
                                  ${product.price}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    
                    <div className="mt-5 text-center border-t border-gray-200 pt-4">
                      <Link 
                        to={`/products?category=${category.id}`}
                        className="inline-flex items-center text-primary font-bold hover:text-red-700 font-inter text-sm bg-primary/5 px-6 py-2 rounded-lg hover:bg-primary/10 transition-colors"
                      >
                        See All {category.name}
                        <ArrowRight size={16} className="ml-2" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Trust Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl mb-2">🇸🇬</div>
              <h3 className="font-bold text-lg mb-1 font-inter">100% Authentic</h3>
              <p className="text-sm opacity-90 font-inter">Singapore Products</p>
            </div>
            <div>
              <div className="text-4xl mb-2">🚚</div>
              <h3 className="font-bold text-lg mb-1 font-inter">Free Shipping</h3>
              <p className="text-sm opacity-90 font-inter">On Orders Over SGD 100</p>
            </div>
            <div>
              <div className="text-4xl mb-2">⭐</div>
              <h3 className="font-bold text-lg mb-1 font-inter">4.9 Rating</h3>
              <p className="text-sm opacity-90 font-inter">10,000+ Happy Customers</p>
            </div>
            <div>
              <div className="text-4xl mb-2">🔒</div>
              <h3 className="font-bold text-lg mb-1 font-inter">Secure Payment</h3>
              <p className="text-sm opacity-90 font-inter">Safe & Protected</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePageNew;