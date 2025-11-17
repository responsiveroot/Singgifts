import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ChevronRight, Clock, Zap, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { useCurrency } from '../context/CurrencyContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Flash Sale Component with Countdown Timer
function FlashSaleSection({ deal, productsByCategory }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const { convertAndFormat } = useCurrency();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const endTime = new Date(deal.end_date);
      const now = new Date();
      const difference = endTime - now;

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [deal.end_date]);

  // Get featured products for flash sale (first 6 products from first category)
  const featuredProducts = Object.values(productsByCategory).flat().slice(0, 6);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-pink-600 to-orange-500 py-12">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header with Countdown */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl animate-bounce">
              <Zap size={40} className="text-yellow-300" fill="currentColor" />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-playfair font-black text-white mb-2 tracking-tight">
                ⚡ Flash Sale
              </h2>
              <p className="text-white/90 font-inter text-lg">
                Up to <span className="font-black text-yellow-300 text-3xl">{deal.discount_percentage}%</span> OFF
              </p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center space-x-3">
            <Clock size={24} className="text-white" />
            <div className="flex space-x-2">
              <div className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-xl text-center min-w-[70px]">
                <div className="text-3xl font-black text-white font-mono">{String(timeLeft.hours).padStart(2, '0')}</div>
                <div className="text-xs text-white/80 font-inter uppercase tracking-wide">Hours</div>
              </div>
              <div className="text-3xl font-black text-white">:</div>
              <div className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-xl text-center min-w-[70px]">
                <div className="text-3xl font-black text-white font-mono">{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div className="text-xs text-white/80 font-inter uppercase tracking-wide">Minutes</div>
              </div>
              <div className="text-3xl font-black text-white">:</div>
              <div className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-xl text-center min-w-[70px]">
                <div className="text-3xl font-black text-white font-mono">{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div className="text-xs text-white/80 font-inter uppercase tracking-wide">Seconds</div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Products Carousel with Arrows */}
        <div className="mb-6 relative group">
          {/* Left Arrow */}
          <button
            onClick={() => {
              document.getElementById('flash-sale-slider').scrollBy({ left: -300, behavior: 'smooth' });
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-2xl rounded-full p-3 hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100 -ml-4"
          >
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Products Slider */}
          <div 
            id="flash-sale-slider"
            className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="flex-shrink-0 w-56 bg-white rounded-xl overflow-hidden shadow-2xl hover:shadow-3xl hover:scale-105 transition-all group/card"
              >
                <div className="relative">
                  <div className="aspect-square bg-gray-100">
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-black shadow-lg flex items-center space-x-1">
                    <TrendingUp size={14} />
                    <span>-{deal.discount_percentage}%</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 font-inter h-10">
                    {product.name}
                  </h3>
                  <div className="flex items-center mb-2">
                    <Star className="text-yellow-400 fill-current" size={14} />
                    <span className="text-sm text-gray-600 ml-1 font-inter">{product.rating}</span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-xl font-black text-red-600 font-inter">
                      {convertAndFormat(product.sale_price || product.price * 0.75)}
                    </span>
                    <span className="text-sm text-gray-400 line-through font-inter">
                      {convertAndFormat(product.price)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => {
              document.getElementById('flash-sale-slider').scrollBy({ left: 300, behavior: 'smooth' });
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-2xl rounded-full p-3 hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100 -mr-4"
          >
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link 
            to="/deals" 
            className="inline-flex items-center bg-white text-red-600 px-12 py-5 rounded-2xl font-black text-xl hover:bg-yellow-300 hover:text-red-700 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 font-inter"
          >
            <Zap size={24} className="mr-2" />
            Shop All Flash Deals
            <ArrowRight size={24} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function HomePageNew({ user }) {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { convertAndFormat, convertOnly } = useCurrency();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, productsRes, dealsRes] = await Promise.all([
        axios.get(`${API}/categories`),
        axios.get(`${API}/products?limit=200`),
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
      {/* E-Commerce Style Hero Banner */}
      <section className="bg-white" data-testid="hero-banner">
        <div className="container mx-auto px-4 py-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Main Banner */}
            <div className="md:col-span-2 relative overflow-hidden rounded-2xl" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
              <div className="grid md:grid-cols-2 h-full">
                <div className="p-10 flex flex-col justify-center text-white">
                  <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-bold mb-4 w-fit">
                    🇸🇬 Singapore's Finest
                  </div>
                  <h1 className="text-5xl font-playfair font-bold mb-4 leading-tight">
                    Premium<br />Singapore<br />Gifts
                  </h1>
                  <p className="text-lg mb-6 opacity-90 font-inter">
                    Shop authentic products from 20 curated categories
                  </p>
                  <Link to="/products" className="bg-white text-purple-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors font-inter inline-block w-fit">
                    Shop Now →
                  </Link>
                </div>
                <div className="hidden md:flex items-center justify-center p-4">
                  <img 
                    src="https://images.unsplash.com/photo-1686455746257-0210c23f7064" 
                    alt="Singapore" 
                    className="rounded-xl shadow-2xl w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Side Banners */}
            <div className="space-y-4">
              {/* Deal Banner */}
              <div className="relative overflow-hidden rounded-2xl h-48" style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              }}>
                <div className="p-6 text-white h-full flex flex-col justify-center">
                  <h3 className="text-3xl font-playfair font-bold mb-2">Flash<br />Deals</h3>
                  <p className="text-sm opacity-90 mb-3 font-inter">Up to 50% OFF</p>
                  <Link to="/deals" className="bg-white text-pink-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors font-inter inline-block w-fit text-sm">
                    View Deals
                  </Link>
                </div>
              </div>
              
              {/* Categories Banner */}
              <div className="relative overflow-hidden rounded-2xl h-48" style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
              }}>
                <div className="p-6 text-white h-full flex flex-col justify-center">
                  <h3 className="text-3xl font-playfair font-bold mb-2">20<br />Categories</h3>
                  <p className="text-sm opacity-90 mb-3 font-inter">500+ Products</p>
                  <Link to="/products" className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors font-inter inline-block w-fit text-sm">
                    Explore All
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Flash Sale Section with Countdown */}
      {deals.length > 0 && (
        <FlashSaleSection deal={deals[0]} productsByCategory={productsByCategory} />
      )}

      {/* Category Sections - Vibrant Colors with Product Slider */}
      <div className="container mx-auto px-4 py-8">
        {categories.map((category, catIndex) => {
          const products = productsByCategory[category.id] || [];
          if (products.length === 0) return null;

          // Vibrant unique colors for each category (more varied)
          const colorPalette = [
            'from-red-600 via-rose-500 to-pink-500',      // Vibrant Red-Pink
            'from-orange-500 via-amber-400 to-yellow-400', // Orange-Yellow
            'from-purple-600 via-violet-500 to-fuchsia-500', // Purple-Fuchsia
            'from-blue-700 via-blue-500 to-cyan-400',     // Blue-Cyan
            'from-sky-500 via-blue-400 to-indigo-500',    // Sky-Indigo
            'from-green-600 via-emerald-500 to-teal-400', // Green-Teal
            'from-amber-700 via-orange-600 to-red-600',   // Brown-Orange
            'from-yellow-500 via-orange-400 to-red-400',  // Yellow-Red
            'from-pink-500 via-rose-400 to-red-400',      // Pink-Rose
            'from-slate-700 via-gray-600 to-zinc-600',    // Slate-Gray
            'from-lime-500 via-green-500 to-emerald-600', // Lime-Green
            'from-teal-600 via-cyan-500 to-blue-500',     // Teal-Cyan
            'from-yellow-600 via-amber-500 to-orange-600', // Gold
            'from-indigo-600 via-blue-500 to-cyan-500',   // Indigo-Blue
            'from-stone-700 via-neutral-600 to-gray-700', // Stone
            'from-emerald-600 via-green-500 to-lime-500', // Emerald-Lime
            'from-green-700 via-lime-600 to-yellow-500',  // Green-Lime
            'from-teal-700 via-green-600 to-emerald-600', // Dark Teal
            'from-violet-600 via-purple-500 to-fuchsia-500', // Violet-Purple
            'from-fuchsia-600 via-purple-500 to-pink-500' // Fuchsia-Purple
          ];

          const gradientClass = colorPalette[catIndex % colorPalette.length];
          const sliderId = `slider-${category.id}`;

          return (
            <section key={category.id} className="mb-10" data-testid={`category-section-${category.slug}`}>
              {/* Vibrant Horizontal Category Banner */}
              <div 
                className={`relative h-52 rounded-2xl overflow-hidden shadow-xl mb-6 bg-gradient-to-r ${gradientClass}`}
              >
                {/* Background Image with Overlay */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-20"
                  style={{ backgroundImage: `url(${category.image_url})` }}
                ></div>
                
                {/* Content */}
                <div className="absolute inset-0 flex items-center justify-between px-12">
                  <div className="text-white max-w-2xl z-10">
                    <h2 className="text-6xl font-playfair font-black mb-3 tracking-tight drop-shadow-lg">
                      {category.name}
                    </h2>
                    <p className="text-2xl font-inter drop-shadow">
                      {category.description}
                    </p>
                  </div>
                  <Link 
                    to={`/products?category=${category.id}`}
                    className="bg-white text-gray-900 px-10 py-4 rounded-xl font-bold hover:scale-105 transition-all shadow-2xl font-inter text-lg flex items-center z-10"
                  >
                    View All
                    <ArrowRight size={22} className="ml-2" />
                  </Link>
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32"></div>
              </div>

              {/* Products Slider with Arrows */}
              <div className="relative group">
                {/* Left Arrow */}
                <button
                  onClick={() => {
                    document.getElementById(sliderId).scrollBy({ left: -300, behavior: 'smooth' });
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-2xl rounded-full p-3 hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100 -ml-4"
                  data-testid={`prev-${category.slug}`}
                >
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Products Slider */}
                <div 
                  id={sliderId}
                  className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="flex-shrink-0 w-48 group bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-primary hover:shadow-xl transition-all"
                      data-testid={`product-${product.slug}`}
                    >
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
                      <div className="p-3">
                        <h3 className="text-xs font-semibold text-gray-900 mb-2 line-clamp-2 font-inter group-hover:text-primary transition-colors h-8">
                          {product.name}
                        </h3>
                        <div className="flex items-center mb-2">
                          <Star className="text-yellow-400 fill-current" size={10} />
                          <span className="text-xs text-gray-600 ml-1 font-inter font-semibold">{product.rating}</span>
                          <span className="text-xs text-gray-400 ml-1 font-inter">({product.review_count})</span>
                        </div>
                        <div className="flex items-baseline space-x-1">
                          {product.sale_price ? (
                            <>
                              <span className="text-base font-bold text-primary font-inter">
                                {convertAndFormat(product.sale_price)}
                              </span>
                              <span className="text-xs text-gray-400 line-through font-inter">
                                {convertAndFormat(product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-base font-bold text-gray-900 font-inter">
                              {convertAndFormat(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Right Arrow */}
                <button
                  onClick={() => {
                    document.getElementById(sliderId).scrollBy({ left: 300, behavior: 'smooth' });
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-2xl rounded-full p-3 hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100 -mr-4"
                  data-testid={`next-${category.slug}`}
                >
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
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