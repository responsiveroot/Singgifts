import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, Search } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Header({ user, cartCount, logout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'SGD');

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
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 font-inter font-medium">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors" data-testid="nav-home">
              Home
            </Link>
            
            {/* Categories Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setActiveCategory(true)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <button className="text-gray-700 hover:text-primary transition-colors flex items-center" data-testid="nav-categories">
                Categories
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {activeCategory && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-2 animate-fadeIn max-h-96 overflow-y-auto">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.id}`}
                      className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                      data-testid={`category-${cat.slug}`}
                    >
                      <img src={cat.image_url} alt={cat.name} className="w-10 h-10 rounded-lg object-cover mr-3" />
                      <div>
                        <div className="font-semibold text-gray-800">{cat.name}</div>
                        <div className="text-xs text-gray-500">{cat.description}</div>
                      </div>
                    </Link>
                  ))}
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
            {user ? (
              <>
                <Link to="/dashboard" className="hidden md:flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors" data-testid="nav-dashboard">
                  <User size={20} />
                  <span className="font-inter font-medium">{user.name}</span>
                </Link>
                <button 
                  onClick={logout} 
                  className="hidden md:block text-sm text-gray-600 hover:text-primary transition-colors font-inter"
                  data-testid="logout-btn"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="hidden md:block text-gray-700 hover:text-primary transition-colors font-inter font-medium"
                data-testid="nav-login"
              >
                Login / Sign Up
              </Link>
            )}

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

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 py-4 animate-fadeIn" data-testid="mobile-menu">
          <div className="container mx-auto px-4 space-y-4">
            <Link 
              to="/" 
              className="block py-2 text-gray-700 hover:text-primary transition-colors font-inter font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <div>
              <div className="font-semibold text-gray-800 mb-2 font-inter">Categories</div>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.id}`}
                  className="block py-2 pl-4 text-gray-600 hover:text-primary transition-colors font-inter"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
            <Link 
              to="/deals" 
              className="block py-2 text-gray-700 hover:text-primary transition-colors font-inter font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Deals
            </Link>
            <Link 
              to="/products" 
              className="block py-2 text-gray-700 hover:text-primary transition-colors font-inter font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              All Products
            </Link>
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="block py-2 text-gray-700 hover:text-primary transition-colors font-inter font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button 
                  onClick={() => { logout(); setIsMenuOpen(false); }} 
                  className="block py-2 text-gray-600 hover:text-primary transition-colors font-inter"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="block py-2 text-primary font-semibold font-inter"
                onClick={() => setIsMenuOpen(false)}
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;