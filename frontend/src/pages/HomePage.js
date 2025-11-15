import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, TrendingUp, Gift, Sparkles, Zap, Award, Package, Shield } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function HomePage({ user }) {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, featuredRes, bestsellersRes, dealsRes] = await Promise.all([
        axios.get(`${API}/categories`),
        axios.get(`${API}/products?is_featured=true&limit=8`),
        axios.get(`${API}/products?is_bestseller=true&limit=6`),
        axios.get(`${API}/deals`)
      ]);
      
      setCategories(categoriesRes.data);
      setFeaturedProducts(featuredRes.data);
      setBestsellers(bestsellersRes.data);
      setDeals(dealsRes.data);
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
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-gradient py-20 md:py-32 relative overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fadeIn">
              <div className="inline-block">
                <span className="bg-white px-6 py-2 rounded-full text-sm font-semibold text-primary shadow-md font-inter">
                  🇸🇬 Singapore's #1 Gift Store
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-playfair font-bold leading-tight text-gray-900" data-testid="hero-title">
                SingGifts — <br />
                <span className="sg-red">Singapore-Made Gifts,</span><br />
                Delivered Fast
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 font-inter leading-relaxed" data-testid="hero-subtitle">
                Curated souvenirs, local treats, and premium corporate gifts inspired by Singapore's rich culture and heritage.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/products?is_bestseller=true" className="btn-primary inline-flex items-center" data-testid="shop-bestsellers-btn">
                  <TrendingUp size={20} className="mr-2" />
                  Shop Bestsellers
                </Link>
                <Link to="/deals" className="btn-secondary inline-flex items-center" data-testid="explore-deals-btn">
                  <Sparkles size={20} className="mr-2" />
                  Explore Deals
                </Link>
              </div>
              
              <div className="flex items-center space-x-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900 font-playfair">500+</div>
                  <div className="text-sm text-gray-600 font-inter">Premium Products</div>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 font-playfair">10k+</div>
                  <div className="text-sm text-gray-600 font-inter">Happy Customers</div>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div>
                  <div className="flex items-center">
                    <Star className="text-yellow-400 fill-current" size={24} />
                    <span className="text-3xl font-bold text-gray-900 ml-2 font-playfair">4.9</span>
                  </div>
                  <div className="text-sm text-gray-600 font-inter">Rating</div>
                </div>
              </div>
            </div>
            
            <div className="relative animate-fadeIn">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1686455746257-0210c23f7064" 
                  alt="Singapore Marina Bay" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl max-w-xs">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Gift className="text-green-600" size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 font-inter">Free Shipping</div>
                    <div className="text-sm text-gray-600 font-inter">On orders over SGD 100</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white" data-testid="categories-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-gray-900 mb-4">Shop By Category</h2>
            <p className="text-lg text-gray-600 font-inter">Discover our curated collections of Singapore-inspired products</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="category-card group"
                data-testid={`category-card-${category.slug}`}
              >
                <div className="relative h-48 rounded-xl overflow-hidden">
                  <img 
                    src={category.image_url} 
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                    <h3 className="font-semibold text-lg font-inter">{category.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Deals Preview */}
      {deals.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-red-600 to-red-700 text-white" data-testid="deals-preview-section">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h2 className="text-3xl sm:text-4xl font-playfair font-bold mb-2">Flash Deals 🔥</h2>
                <p className="text-lg opacity-90 font-inter">Up to {deals[0].discount_percentage}% off on selected items</p>
              </div>
              <Link 
                to="/deals" 
                className="bg-white text-red-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-flex items-center font-inter"
                data-testid="view-all-deals-btn"
              >
                View All Deals
                <ArrowRight size={20} className="ml-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Bestsellers */}
      <section className="py-20 bg-gray-50" data-testid="bestsellers-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-gray-900 mb-4">Bestselling Products</h2>
            <p className="text-lg text-gray-600 font-inter">Customer favorites from our collection</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {bestsellers.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-md card-hover"
                data-testid={`bestseller-${product.slug}`}
              >
                <div className="product-image h-64 bg-gray-100">
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <Star className="text-yellow-400 fill-current" size={16} />
                    <span className="text-sm font-semibold text-gray-700 ml-1 font-inter">{product.rating}</span>
                    <span className="text-sm text-gray-500 ml-1 font-inter">({product.review_count})</span>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 font-inter">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 font-inter line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      {product.sale_price ? (
                        <>
                          <span className="text-xl font-bold text-primary font-inter">SGD {product.sale_price}</span>
                          <span className="text-sm text-gray-500 line-through ml-2 font-inter">SGD {product.price}</span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-gray-900 font-inter">SGD {product.price}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/products?is_bestseller=true" 
              className="btn-primary inline-flex items-center"
              data-testid="view-all-bestsellers-btn"
            >
              View All Bestsellers
              <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white" data-testid="featured-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600 font-inter">Handpicked favorites from Singapore</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-md card-hover"
                data-testid={`featured-${product.slug}`}
              >
                <div className="product-image h-48 bg-gray-100">
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 font-inter">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    {product.sale_price ? (
                      <div>
                        <span className="text-lg font-bold text-primary font-inter">SGD {product.sale_price}</span>
                        <span className="text-xs text-gray-500 line-through ml-1 font-inter">SGD {product.price}</span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-gray-900 font-inter">SGD {product.price}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/products" 
              className="btn-secondary inline-flex items-center"
              data-testid="view-all-products-btn"
            >
              View All Products
              <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Gift className="text-primary" size={32} />
              </div>
              <h3 className="font-semibold text-lg mb-2 font-inter">Authentic Singapore Gifts</h3>
              <p className="text-gray-600 font-inter">100% authentic products celebrating Singapore's heritage</p>
            </div>
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <svg className="text-primary" width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2 font-inter">Free Shipping</h3>
              <p className="text-gray-600 font-inter">Free delivery on orders over SGD 100</p>
            </div>
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <svg className="text-primary" width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2 font-inter">Secure Payment</h3>
              <p className="text-gray-600 font-inter">Safe and secure payment options</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;