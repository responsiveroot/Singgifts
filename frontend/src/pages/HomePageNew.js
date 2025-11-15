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
    <div className="homepage-new bg-gray-50">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary via-red-600 to-blue-600 py-16 text-white" data-testid="hero-banner">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-5xl font-playfair font-bold mb-4">
                Welcome to SingGifts
              </h1>
              <p className="text-xl mb-6 opacity-90 font-inter">
                🇸🇬 Singapore's Premier Online Store for Authentic Gifts, Souvenirs & Premium Products
              </p>
              <div className="flex gap-4">
                <Link to="/products" className="bg-white text-primary px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors font-inter">
                  Shop Now
                </Link>
                <Link to="/deals" className="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-primary transition-colors font-inter">
                  View Deals
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1686455746257-0210c23f7064" 
                alt="Singapore" 
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Flash Deals Banner */}
      {deals.length > 0 && (
        <section className="bg-gradient-to-r from-amber-500 to-red-600 py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold font-playfair">🔥 Flash Deals</span>
                <span className="text-lg font-inter">Up to {deals[0].discount_percentage}% OFF</span>
              </div>
              <Link to="/deals" className="bg-white text-red-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors font-inter">
                View All
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Category Sections */}
      <div className="container mx-auto px-4 py-8">
        {categories.map((category, catIndex) => {
          const products = productsByCategory[category.id] || [];
          if (products.length === 0) return null;

          return (
            <section key={category.id} className="mb-12" data-testid={`category-section-${category.slug}`}>
              {/* Category Header with Banner */}
              <div className="bg-white rounded-xl overflow-hidden shadow-md mb-6">
                <div className="grid md:grid-cols-3 gap-0">
                  {/* Category Banner - Left Side */}
                  <div 
                    className="relative h-64 md:h-auto bg-cover bg-center"
                    style={{
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${category.image_url})`
                    }}
                  >
                    <div className="absolute inset-0 flex flex-col justify-center p-8 text-white">
                      <h2 className="text-3xl font-playfair font-bold mb-2">{category.name}</h2>
                      <p className="text-lg mb-4 opacity-90 font-inter">{category.description}</p>
                      <Link 
                        to={`/products?category=${category.id}`}
                        className="inline-flex items-center text-white font-semibold hover:text-accent transition-colors font-inter"
                      >
                        View All
                        <ChevronRight size={20} className="ml-1" />
                      </Link>
                    </div>
                  </div>

                  {/* Products Grid - Right Side */}
                  <div className="md:col-span-2 p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {products.map((product) => (
                        <Link
                          key={product.id}
                          to={`/products/${product.id}`}
                          className="group"
                          data-testid={`product-${product.slug}`}
                        >
                          <div className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-square bg-white relative overflow-hidden">
                              <img 
                                src={product.images[0]} 
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              {product.sale_price && (
                                <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                                  {Math.round(((product.price - product.sale_price) / product.price) * 100)}% OFF
                                </div>
                              )}
                            </div>
                            <div className="p-3">
                              <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 font-inter group-hover:text-primary transition-colors">
                                {product.name}
                              </h3>
                              <div className="flex items-center mb-2">
                                <div className="flex items-center">
                                  <Star className="text-yellow-400 fill-current" size={12} />
                                  <span className="text-xs text-gray-600 ml-1 font-inter">{product.rating}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {product.sale_price ? (
                                  <>
                                    <span className="text-lg font-bold text-primary font-inter">
                                      SGD {product.sale_price}
                                    </span>
                                    <span className="text-xs text-gray-500 line-through font-inter">
                                      SGD {product.price}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-lg font-bold text-gray-900 font-inter">
                                    SGD {product.price}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    
                    {products.length >= 6 && (
                      <div className="mt-4 text-center">
                        <Link 
                          to={`/products?category=${category.id}`}
                          className="inline-flex items-center text-primary font-semibold hover:underline font-inter"
                        >
                          View All {category.name} Products
                          <ArrowRight size={16} className="ml-1" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Divider */}
              {catIndex < categories.length - 1 && (
                <div className="border-t border-gray-200 my-8"></div>
              )}
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