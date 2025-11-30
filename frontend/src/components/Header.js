import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, Search, Heart } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Header({ user, cartCount, logout }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'SGD');
  const [closeTimeout, setCloseTimeout] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
    window.dispatchEvent(new Event('currencyChange'));
  };

  const handleMouseEnter = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setActiveCategory(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveCategory(null);
    }, 300); // 300ms delay before closing
    setCloseTimeout(timeout);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSearchModal(false);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-red-600 to-blue-600 text-white py-2">
        <div className="container mx-auto px-4 text-center text-sm font-inter">
          🇸🇬 Free Shipping on Orders Over SGD 100 | Singapore's #1 Gift Store
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_a518ec26-715d-489b-87fc-44c951b31297/artifacts/7thk371k_singgifts-logo.jpeg" 
              alt="SingGifts Logo" 
              className="h-16 w-auto"
            />
          </Link>

          {/* Search Icon */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
            title="Search"
          >
            <Search className="text-gray-700" size={22} />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 font-inter font-medium">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors" data-testid="nav-home">
              Home
            </Link>
            
            {/* Categories Mega Menu with Images */}
            <div 
              className="relative group"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button className="text-gray-700 hover:text-primary transition-colors flex items-center font-semibold uppercase text-sm tracking-wide" data-testid="nav-categories">
                Categories
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {activeCategory && (
                <div 
                  className="absolute top-full left-0 mt-2 bg-white shadow-2xl border border-gray-200 animate-fadeIn" 
                  style={{ width: '800px', maxHeight: '500px', overflowY: 'auto' }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="grid grid-cols-4 gap-0">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/products?category=${cat.id}`}
                        className="group/item border-b border-r border-gray-100 hover:bg-gray-50 transition-all"
                        data-testid={`category-${cat.slug}`}
                      >
                        <div className="p-4">
                          {/* Category Image */}
                          <div className="w-full aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100">
                            <img 
                              src={cat.image_url} 
                              alt={cat.name}
                              className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                            />
                          </div>
                          {/* Category Name */}
                          <div className="text-center">
                            <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide group-hover/item:text-primary transition-colors mb-1">
                              {cat.name}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {cat.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link to="/explore-singapore" className="text-gray-700 hover:text-primary transition-colors" data-testid="nav-explore">
              Explore Singapore
            </Link>
            
            <Link to="/deals" className="text-gray-700 hover:text-primary transition-colors" data-testid="nav-deals">
              Deals
            </Link>
            
            <Link to="/batik-label" className="text-gray-700 hover:text-primary transition-colors" data-testid="nav-batik">
              Batik Label
            </Link>
            
            <Link to="/new-arrivals" className="text-gray-700 hover:text-primary transition-colors" data-testid="nav-new-arrivals">
              New Arrivals
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Currency Selector */}
            <select 
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="hidden md:block text-sm border border-gray-300 rounded-md px-2 py-1 font-inter focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="currency-selector"
            >
              <option value="SGD">SGD $</option>
              <option value="USD">USD $</option>
              <option value="EUR">EUR €</option>
              <option value="GBP">GBP £</option>
              <option value="AUD">AUD $</option>
              <option value="MYR">MYR RM</option>
              <option value="INR">INR ₹</option>
            </select>

            {user ? (
              <>
                <Link to="/dashboard" className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors" data-testid="nav-dashboard">
                  <User size={20} />
                  <span className="font-inter font-medium">{user.name}</span>
                </Link>
                <button 
                  onClick={logout} 
                  className="text-sm text-gray-600 hover:text-primary transition-colors font-inter"
                  data-testid="logout-btn"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="text-gray-700 hover:text-primary transition-colors font-inter font-medium"
                data-testid="nav-login"
              >
                Login / Sign Up
              </Link>
            )}

            <Link to="/wishlist" className="relative text-gray-700 hover:text-primary transition-colors hidden md:block" data-testid="wishlist-link">
              <Heart size={24} />
            </Link>

            <Link to="/cart" className="relative" data-testid="cart-btn">
              <ShoppingCart className="text-gray-700 hover:text-primary transition-colors" size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold" data-testid="cart-count">
                  {cartCount}
                </span>
              )}
            </Link>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="lg:hidden text-gray-700"
              data-testid="mobile-menu-btn"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - Full Screen */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-50 overflow-y-auto" data-testid="mobile-menu">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                <img 
                  src="https://customer-assets.emergentagent.com/job_a518ec26-715d-489b-87fc-44c951b31297/artifacts/7thk371k_singgifts-logo.jpeg" 
                  alt="SingGifts" 
                  className="h-10 w-auto"
                />
              </Link>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            {/* Menu Items */}
            <div className="space-y-1">
              <Link 
                to="/" 
                className="block py-3 px-4 text-gray-900 hover:bg-gray-50 rounded-lg font-inter font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                🏠 Home
              </Link>

              <Link 
                to="/products" 
                className="block py-3 px-4 text-gray-900 hover:bg-gray-50 rounded-lg font-inter font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                🛍️ All Products
              </Link>
              
              {/* Categories Section */}
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Shop by Category</div>
                <div className="space-y-1">
                  {categories.slice(0, 8).map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.id}`}
                      className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-50 rounded-lg font-inter"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                  {categories.length > 8 && (
                    <Link
                      to="/products"
                      className="block py-2 px-4 text-sm text-primary hover:bg-gray-50 rounded-lg font-inter font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      View All Categories →
                    </Link>
                  )}
                </div>
              </div>

              {/* Special Collections */}
              <div className="py-2 border-t border-gray-100">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Special Collections</div>
                <Link 
                  to="/explore-singapore" 
                  className="block py-3 px-4 text-gray-900 hover:bg-gray-50 rounded-lg font-inter font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🇸🇬 Explore Singapore
                </Link>
                <Link 
                  to="/batik-label" 
                  className="block py-3 px-4 text-gray-900 hover:bg-gray-50 rounded-lg font-inter font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🎨 Batik Label
                </Link>
                <Link 
                  to="/deals" 
                  className="block py-3 px-4 text-gray-900 hover:bg-gray-50 rounded-lg font-inter font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🔥 Deals
                </Link>
                <Link 
                  to="/new-arrivals" 
                  className="block py-3 px-4 text-gray-900 hover:bg-gray-50 rounded-lg font-inter font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ✨ New Arrivals
                </Link>
              </div>

              {/* User Actions */}
              <div className="py-2 border-t border-gray-100">
                <Link 
                  to="/wishlist" 
                  className="block py-3 px-4 text-gray-900 hover:bg-gray-50 rounded-lg font-inter font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ❤️ Wishlist
                </Link>
                <Link 
                  to="/cart" 
                  className="block py-3 px-4 text-gray-900 hover:bg-gray-50 rounded-lg font-inter font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🛒 Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
              </div>
              
              {/* Account Section */}
              <div className="py-2 border-t border-gray-100">
                {user ? (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="block py-3 px-4 text-gray-900 hover:bg-gray-50 rounded-lg font-inter font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      👤 My Account
                    </Link>
                    <button 
                      onClick={() => { logout(); setIsMenuOpen(false); }} 
                      className="block w-full text-left py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg font-inter font-medium"
                    >
                      🚪 Logout
                    </button>
                  </>
                ) : (
                  <Link 
                    to="/auth" 
                    className="block py-3 px-4 bg-primary text-white rounded-lg font-inter font-semibold text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login / Sign Up
                  </Link>
                )}
              </div>

              {/* Currency Selector Mobile */}
              <div className="py-4 border-t border-gray-100">
                <label className="block px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Currency</label>
                <select 
                  value={currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full mx-4 text-sm border border-gray-300 rounded-lg px-3 py-2 font-inter focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{ width: 'calc(100% - 2rem)' }}
                >
                  <option value="SGD">🇸🇬 SGD - Singapore Dollar</option>
                  <option value="USD">🇺🇸 USD - US Dollar</option>
                  <option value="EUR">🇪🇺 EUR - Euro</option>
                  <option value="GBP">🇬🇧 GBP - British Pound</option>
                  <option value="AUD">🇦🇺 AUD - Australian Dollar</option>
                  <option value="MYR">🇲🇾 MYR - Malaysian Ringgit</option>
                  <option value="INR">🇮🇳 INR - Indian Rupee</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold font-playfair">Search Products</h3>
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="w-full py-3 pl-12 pr-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-inter text-lg"
                    autoFocus
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                </div>
                <button
                  type="submit"
                  className="w-full mt-4 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark font-inter font-semibold"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;