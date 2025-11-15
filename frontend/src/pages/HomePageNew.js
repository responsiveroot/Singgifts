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
      {/* Enhanced Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-blue-50" data-testid="hero-banner">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-white px-5 py-2 rounded-full shadow-lg mb-6">
                <span className="text-2xl mr-2">🇸🇬</span>
                <span className="font-bold text-gray-900 font-inter">Singapore's #1 Gift Store</span>
              </div>
              <h1 className="text-6xl font-playfair font-black mb-6 leading-tight">
                <span className="text-gray-900">Discover</span><br />
                <span className="bg-gradient-to-r from-primary to-red-700 bg-clip-text text-transparent">Authentic Singapore</span><br />
                <span className="text-gray-900">Products</span>
              </h1>
              <p className="text-xl mb-8 text-gray-700 font-inter leading-relaxed">
                From premium souvenirs to lifestyle essentials - shop 13 curated categories of authentic Singapore products
              </p>
              <div className="flex gap-4">
                <Link to="/products" className="bg-gradient-to-r from-primary to-red-700 text-white px-10 py-4 rounded-xl font-bold hover:shadow-2xl transition-all font-inter text-lg">
                  Explore Now →
                </Link>
                <Link to="/deals" className="bg-white border-2 border-gray-300 text-gray-900 px-10 py-4 rounded-xl font-bold hover:border-primary hover:text-primary transition-colors font-inter text-lg">
                  View Deals
                </Link>
              </div>
              <div className="mt-8 flex items-center space-x-6">
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-gray-900 font-playfair">500+</span>
                  <span className="text-sm text-gray-600 ml-2 font-inter">Products</span>
                </div>
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-gray-900 font-playfair">10k+</span>
                  <span className="text-sm text-gray-600 ml-2 font-inter">Customers</span>
                </div>
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-gray-900 font-playfair">4.9★</span>
                  <span className="text-sm text-gray-600 ml-2 font-inter">Rating</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary to-blue-500 rounded-2xl opacity-20 blur-2xl"></div>
                <img 
                  src="https://images.unsplash.com/photo-1686455746257-0210c23f7064" 
                  alt="Singapore Marina Bay" 
                  className="relative rounded-2xl shadow-2xl w-full transform hover:scale-105 transition-transform duration-300"
                />
              </div>
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
      <section className="bg-gray-100 py-10 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
              <div className="text-3xl">🇸🇬</div>
              <div>
                <h3 className="font-bold text-gray-900 font-inter">Authentic SG Products</h3>
                <p className="text-sm text-gray-600 font-inter">100% Genuine</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
              <div className="text-3xl">🚚</div>
              <div>
                <h3 className="font-bold text-gray-900 font-inter">Free Shipping</h3>
                <p className="text-sm text-gray-600 font-inter">Orders Over $100</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
              <div className="text-3xl">⭐</div>
              <div>
                <h3 className="font-bold text-gray-900 font-inter">Rated 4.9/5</h3>
                <p className="text-sm text-gray-600 font-inter">10k+ Reviews</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
              <div className="text-3xl">🔒</div>
              <div>
                <h3 className="font-bold text-gray-900 font-inter">Secure Payment</h3>
                <p className="text-sm text-gray-600 font-inter">SSL Protected</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePageNew;