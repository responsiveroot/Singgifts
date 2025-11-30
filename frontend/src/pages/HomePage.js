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

  const getCategoryGradient = (categorySlug) => {
    const gradients = {
      'souvenirs': '#E31837, #FF6B6B',
      'food': '#FF8C00, #FFD700',
      'apparel': '#4A90E2, #7B68EE',
      'accessories': '#50C878, #32CD32',
      'home-decor': '#FF69B4, #FF1493',
      'books': '#8B4513, #D2691E',
      'electronics': '#708090, #2F4F4F',
      'toys': '#FF4500, #FF6347'
    };
    return gradients[categorySlug] || '#E31837, #FF6B6B';
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
      {/* Advanced Hero Section with Animations */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-50 via-blue-50 to-amber-50" data-testid="hero-section">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-secondary/20 rounded-full filter blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/10 rounded-full filter blur-2xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block"
              >
                <span className="bg-gradient-to-r from-primary to-red-700 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg font-inter animate-pulse">
                  🇸🇬 Singapore's #1 Premium Gift Store
                </span>
              </motion.div>
              
              <motion.h1 
                className="text-5xl sm:text-6xl lg:text-7xl font-playfair font-black leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                data-testid="hero-title"
              >
                <span className="bg-gradient-to-r from-gray-900 via-primary to-red-700 bg-clip-text text-transparent">
                  SingGifts
                </span>
                <br />
                <span className="text-gray-900">Singapore-Made</span>
                <br />
                <span className="bg-gradient-to-r from-primary to-red-600 bg-clip-text text-transparent">
                  Gifts, Delivered Fast
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-700 font-inter leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                data-testid="hero-subtitle"
              >
                Curated souvenirs, local treats, and premium corporate gifts celebrating Singapore's rich culture, heritage, and modern excellence.
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link to="/products?is_bestseller=true" className="group relative btn-primary inline-flex items-center overflow-hidden" data-testid="shop-bestsellers-btn">
                  <span className="relative z-10 flex items-center">
                    <TrendingUp size={20} className="mr-2" />
                    Shop Bestsellers
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
                <Link to="/deals" className="group relative btn-secondary inline-flex items-center overflow-hidden" data-testid="explore-deals-btn">
                  <span className="relative z-10 flex items-center">
                    <Sparkles size={20} className="mr-2" />
                    Explore Deals
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
              
              {/* Animated Stats */}
              <motion.div 
                className="flex items-center flex-wrap gap-8 pt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {[
                  { value: "500+", label: "Premium Products", icon: Package },
                  { value: "10k+", label: "Happy Customers", icon: Award },
                  { value: "4.9", label: "Rating", icon: Star, color: "text-yellow-400" }
                ].map((stat, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-3"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="bg-white p-3 rounded-xl shadow-md">
                      <stat.icon className={stat.color || "text-primary"} size={24} />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900 font-playfair">{stat.value}</div>
                      <div className="text-sm text-gray-600 font-inter">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            
            {/* Right Image with Advanced Animations */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                className="relative rounded-3xl overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1686455746257-0210c23f7064" 
                  alt="Singapore Marina Bay" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                
                {/* Floating Elements */}
                <motion.div
                  className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <span className="text-red-600 font-bold font-inter flex items-center">
                    <Zap size={16} className="mr-1" />
                    Flash Sale Live!
                  </span>
                </motion.div>
              </motion.div>
              
              {/* Feature Card */}
              <motion.div 
                className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-2xl max-w-xs border-2 border-primary/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
              >
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-xl"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Gift className="text-white" size={28} />
                  </motion.div>
                  <div>
                    <div className="font-bold text-gray-900 font-inter text-lg">Free Shipping</div>
                    <div className="text-sm text-gray-600 font-inter">Orders over SGD 100</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Trust Badge */}
              <motion.div
                className="absolute -top-6 -right-6 bg-gradient-to-br from-blue-500 to-blue-700 text-white p-4 rounded-2xl shadow-xl"
                animate={{ 
                  rotate: [0, 5, 0, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                <Shield size={32} />
                <div className="text-xs font-bold mt-1">Trusted</div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Enhanced Categories Section */}
      <section className="py-20 bg-white relative overflow-hidden" data-testid="categories-section">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle, #E31837 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-block mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="bg-gradient-to-r from-primary/10 to-blue-500/10 text-primary px-6 py-2 rounded-full text-sm font-bold font-inter">
                ✨ CURATED COLLECTIONS
              </span>
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-playfair font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-primary bg-clip-text text-transparent">
                Shop By Category
              </span>
            </h2>
            <p className="text-xl text-gray-600 font-inter max-w-2xl mx-auto">
              Discover our curated collections of authentic Singapore-inspired products
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/products?category=${category.id}`}
                  className="group block"
                  data-testid={`category-card-${category.slug}`}
                >
                  <motion.div 
                    className="relative h-48 sm:h-56 rounded-2xl overflow-hidden shadow-lg"
                    whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                    <img 
                      src={category.image_url} 
                      alt={category.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-125 group-hover:rotate-2"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 p-4 text-white z-20"
                      initial={{ y: 10 }}
                      whileHover={{ y: 0 }}
                    >
                      <h3 className="font-bold text-lg font-inter mb-1 group-hover:text-accent transition-colors">{category.name}</h3>
                      <p className="text-xs text-white/80 font-inter line-clamp-2">{category.description}</p>
                      <motion.div
                        className="mt-2 text-accent font-semibold text-sm flex items-center opacity-0 group-hover:opacity-100"
                        transition={{ delay: 0.1 }}
                      >
                        Explore <ArrowRight size={14} className="ml-1" />
                      </motion.div>
                    </motion.div>

                    {/* Animated Border */}
                    <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/30 rounded-2xl transition-all duration-300"></div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Category-Specific Product Sections */}
      {categories.slice(0, 4).map((category) => (
        <section key={category.id} className="py-8 md:py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            {/* Category Banner - Optimized for Mobile */}
            <div 
              className="relative rounded-2xl md:rounded-3xl overflow-hidden mb-6 p-6 md:p-12"
              style={{
                background: `linear-gradient(135deg, ${getCategoryGradient(category.slug)})`
              }}
            >
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-playfair font-bold text-white mb-2 leading-tight">
                    {category.name}
                  </h2>
                  <p className="text-sm md:text-lg text-white/90 font-inter max-w-md leading-snug">
                    {category.description}
                  </p>
                </div>
                <Link
                  to={`/products?category=${category.id}`}
                  className="inline-flex items-center justify-center bg-white text-gray-900 px-5 py-2.5 md:px-6 md:py-3 rounded-full font-semibold hover:bg-gray-100 transition-all shadow-lg font-inter text-sm md:text-base whitespace-nowrap"
                >
                  View All
                  <ArrowRight size={16} className="ml-2 md:ml-2" />
                </Link>
              </div>
            </div>

            {/* Product Grid - Responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all group"
                >
                  <div className="relative h-64 bg-gray-200 overflow-hidden">
                    {product.images && product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    )}
                    {product.sale_price && (
                      <span className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -20%
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 font-inter line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        {product.sale_price ? (
                          <>
                            <span className="text-xl font-bold text-primary">S${product.sale_price}</span>
                            <span className="text-sm text-gray-500 line-through ml-2">S${product.price}</span>
                          </>
                        ) : (
                          <span className="text-xl font-bold text-gray-900">S${product.price}</span>
                        )}
                      </div>
                    </div>
                    {product.rating && (
                      <div className="flex items-center mt-2">
                        <span className="text-yellow-400 mr-1">★</span>
                        <span className="text-sm text-gray-600">{product.rating} ({product.review_count || 10})</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Dynamic Promotional Banner */}
      <section className="py-0 bg-gradient-to-br from-primary via-red-700 to-blue-600 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: [
              "linear-gradient(45deg, #E31837 0%, #C4122F 50%, #1E88E5 100%)",
              "linear-gradient(90deg, #1E88E5 0%, #E31837 50%, #C4122F 100%)",
              "linear-gradient(135deg, #C4122F 0%, #1E88E5 50%, #E31837 100%)",
              "linear-gradient(45deg, #E31837 0%, #C4122F 50%, #1E88E5 100%)",
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-white"
            >
              <motion.h2 
                className="text-5xl font-playfair font-bold mb-6"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Singapore's Finest<br />Gifts & Souvenirs
              </motion.h2>
              <p className="text-xl mb-8 text-white/90 font-inter leading-relaxed">
                From iconic Merlion keepsakes to premium local delicacies, discover authentic Singapore products that tell our nation's story.
              </p>
              <Link to="/products" className="bg-white text-primary px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all inline-flex items-center shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 font-inter">
                Discover All Products
                <ArrowRight size={20} className="ml-2" />
              </Link>
            </motion.div>

            <motion.div 
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {[
                { icon: Gift, title: "Authentic", desc: "100% SG Made" },
                { icon: Zap, title: "Fast Delivery", desc: "Same Day" },
                { icon: Award, title: "Quality", desc: "Premium Only" },
                { icon: Shield, title: "Secure", desc: "Safe Payment" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                  transition={{ duration: 0.3 }}
                >
                  <item.icon className="text-white mb-3" size={32} />
                  <h3 className="text-xl font-bold text-white font-inter">{item.title}</h3>
                  <p className="text-white/80 text-sm font-inter">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Flash Deals Preview */}
      {deals.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-amber-500 via-red-600 to-red-700 text-white relative overflow-hidden" data-testid="deals-preview-section">
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
            }}
            animate={{ x: [0, 40] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              className="flex flex-col md:flex-row items-center justify-between"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="mb-6 md:mb-0">
                <motion.h2 
                  className="text-4xl sm:text-5xl font-playfair font-bold mb-3"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  🔥 Flash Deals
                </motion.h2>
                <p className="text-xl opacity-95 font-inter">
                  Up to <span className="text-3xl font-bold">{deals[0].discount_percentage}%</span> off on selected items
                </p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link 
                  to="/deals" 
                  className="bg-white text-red-600 px-10 py-4 rounded-full font-bold hover:bg-yellow-50 transition-all inline-flex items-center shadow-2xl font-inter text-lg"
                  data-testid="view-all-deals-btn"
                >
                  View All Deals
                  <ArrowRight size={24} className="ml-2" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Bestsellers with Enhanced Animations */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50" data-testid="bestsellers-section">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.span 
              className="inline-block bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-4 font-inter"
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⭐ TOP RATED
            </motion.span>
            <h2 className="text-4xl sm:text-5xl font-playfair font-bold text-gray-900 mb-4">Bestselling Products</h2>
            <p className="text-xl text-gray-600 font-inter max-w-2xl mx-auto">Customer favorites from our collection</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bestsellers.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/products/${product.id}`}
                  className="block group"
                  data-testid={`bestseller-${product.slug}`}
                >
                  <motion.div 
                    className="bg-white rounded-3xl overflow-hidden shadow-lg"
                    whileHover={{ y: -10, boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="product-image h-72 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                      {product.sale_price && (
                        <motion.div 
                          className="absolute top-4 right-4 z-10 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {Math.round(((product.price - product.sale_price) / product.price) * 100)}% OFF
                        </motion.div>
                      )}
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            size={18}
                          />
                        ))}
                        <span className="text-sm font-semibold text-gray-700 ml-2 font-inter">{product.rating}</span>
                        <span className="text-sm text-gray-500 ml-1 font-inter">({product.review_count})</span>
                      </div>
                      <h3 className="font-bold text-xl text-gray-900 mb-2 font-inter group-hover:text-primary transition-colors">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-4 font-inter line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                        <div>
                          {product.sale_price ? (
                            <>
                              <span className="text-2xl font-bold text-primary font-inter">SGD {product.sale_price}</span>
                              <span className="text-sm text-gray-500 line-through ml-2 font-inter">SGD {product.price}</span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-gray-900 font-inter">SGD {product.price}</span>
                          )}
                        </div>
                        <motion.button
                          className="bg-primary text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          whileHover={{ scale: 1.1, rotate: 15 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <ArrowRight size={20} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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