import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Pages
import HomePage from './pages/HomePageNew';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import DealsPage from './pages/DealsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ExploreSingaporePage from './pages/ExploreSingaporePage';
import BatikLabelPage from './pages/BatikLabelPage';
import NewArrivalsPage from './pages/NewArrivalsPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import ShippingReturnsPage from './pages/ShippingReturnsPage';
import FAQPage from './pages/FAQPage';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import AIChat from './components/AIChat';

// Context
import { CurrencyProvider } from './context/CurrencyContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check for session_id in URL (Emergent Auth)
      const hash = window.location.hash;
      if (hash.includes('session_id=')) {
        const sessionId = hash.split('session_id=')[1].split('&')[0];
        const response = await axios.get(`${API}/auth/session-data`, {
          headers: { 'X-Session-ID': sessionId }
        });
        
        if (response.data.session_token) {
          document.cookie = `session_token=${response.data.session_token}; path=/; secure; samesite=none; max-age=${7*24*60*60}`;
          setUser(response.data);
          window.location.hash = '';
        }
      } else {
        // Check existing session
        const me = await axios.get(`${API}/auth/me`, { withCredentials: true });
        setUser(me.data);
      }
    } catch (error) {
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateCartCount = async () => {
    if (user) {
      try {
        const response = await axios.get(`${API}/cart`, { withCredentials: true });
        setCartCount(response.data.length);
      } catch (error) {
        console.error('Failed to fetch cart count');
      }
    }
  };

  useEffect(() => {
    if (user) {
      updateCartCount();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-inter text-gray-600">Loading SingGifts...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <CurrencyProvider>
        <div className="App min-h-screen flex flex-col bg-white">
          <Header user={user} cartCount={cartCount} logout={logout} />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage user={user} />} />
              <Route path="/products" element={<ProductsPage user={user} updateCartCount={updateCartCount} />} />
              <Route path="/products/:productId" element={<ProductDetailPage user={user} updateCartCount={updateCartCount} />} />
              <Route path="/deals" element={<DealsPage user={user} />} />
              <Route path="/cart" element={<CartPage user={user} updateCartCount={updateCartCount} />} />
              <Route path="/checkout" element={<CheckoutPage user={user} />} />
              <Route path="/order-success" element={<OrderSuccessPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={user ? <DashboardPage user={user} /> : <Navigate to="/auth" />} />
              <Route path="/explore-singapore" element={<ExploreSingaporePage />} />
              <Route path="/batik-label" element={<BatikLabelPage />} />
              <Route path="/new-arrivals" element={<NewArrivalsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-conditions" element={<TermsConditionsPage />} />
              <Route path="/shipping-returns" element={<ShippingReturnsPage />} />
              <Route path="/faq" element={<FAQPage />} />
            </Routes>
          </main>
          <Footer />
          <AIChat />
        </div>
      </CurrencyProvider>
    </BrowserRouter>
  );
}

export default App;