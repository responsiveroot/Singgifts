import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, LogIn } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || 'dashboard';
  const [mode, setMode] = useState('login'); // 'login', 'register', 'otp'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [displayedOtp, setDisplayedOtp] = useState('');

  // Merge guest cart with user cart after login
  const mergeGuestCart = async () => {
    try {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      
      if (guestCart.length > 0) {
        // Add each guest cart item to user's cart
        for (const item of guestCart) {
          await axios.post(
            `${API}/cart`,
            { product_id: item.product_id, quantity: item.quantity },
            { withCredentials: true }
          );
        }
        
        // Clear guest cart after merging
        localStorage.removeItem('guestCart');
        toast.success('Your cart items have been saved!');
      }
    } catch (error) {
      console.error('Failed to merge guest cart:', error);
    }
  };

  const handleGoogleLogin = () => {
    const redirectUrl = encodeURIComponent(`${window.location.origin}/`);
    window.location.href = `https://auth.emergentagent.com/?redirect=${redirectUrl}`;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/register`, {
        email: formData.email,
        password: formData.password,
        name: formData.name
      });
      
      setDisplayedOtp(response.data.otp); // In production, OTP would be sent via email
      setOtpSent(true);
      setMode('otp');
      toast.success('OTP sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/verify-otp`, {
        email: formData.email,
        otp: formData.otp
      });
      
      toast.success('Registration successful!');
      
      // Merge guest cart if any
      await mergeGuestCart();
      
      // Redirect to intended page or dashboard
      window.location.href = redirectTo === 'checkout' ? '/checkout' : '/dashboard';
    } catch (error) {
      toast.error(error.response?.data?.detail || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        email: formData.email,
        password: formData.password
      });
      
      setDisplayedOtp(response.data.otp); // In production, OTP would be sent via email
      setOtpSent(true);
      setMode('login-otp');
      toast.success('OTP sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/verify-login-otp`, {
        email: formData.email,
        otp: formData.otp
      });
      
      toast.success('Login successful!');
      window.location.href = '/dashboard';
    } catch (error) {
      toast.error(error.response?.data?.detail || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8" data-testid="auth-form">
          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src="https://customer-assets.emergentagent.com/job_a518ec26-715d-489b-87fc-44c951b31297/artifacts/7thk371k_singgifts-logo.jpeg"
              alt="SingGifts Logo"
              className="h-16 mx-auto mb-4"
            />
            <h1 className="text-3xl font-playfair font-bold text-gray-900">
              {mode === 'register' ? 'Create Account' : 
               mode === 'otp' || mode === 'login-otp' ? 'Verify OTP' : 
               'Welcome Back'}
            </h1>
            <p className="text-gray-600 mt-2 font-inter">Sign in to continue shopping</p>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-300 rounded-lg px-6 py-3 hover:bg-gray-50 transition-colors mb-6 font-inter font-medium"
            data-testid="google-login-btn"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-inter">Or continue with email</span>
            </div>
          </div>

          {/* OTP Form */}
          {(mode === 'otp' || mode === 'login-otp') && (
            <form onSubmit={mode === 'otp' ? handleVerifyOtp : handleVerifyLoginOtp} className="space-y-6">
              {displayedOtp && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-blue-800 mb-2 font-inter">Your OTP (for demo):</p>
                  <p className="text-2xl font-bold text-blue-900 font-mono" data-testid="displayed-otp">{displayedOtp}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Enter OTP</label>
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                  required
                  maxLength={6}
                  data-testid="otp-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
                data-testid="verify-otp-btn"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'otp' ? 'register' : 'login');
                  setFormData({ ...formData, otp: '' });
                }}
                className="w-full text-center text-sm text-gray-600 hover:text-primary font-inter"
              >
                Back
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                    required
                    data-testid="name-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                    required
                    data-testid="email-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                    required
                    minLength={6}
                    data-testid="password-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
                data-testid="register-btn"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <p className="text-center text-sm text-gray-600 font-inter">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-primary font-semibold hover:underline"
                  data-testid="switch-to-login"
                >
                  Sign In
                </button>
              </p>
            </form>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                    required
                    data-testid="login-email-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                    required
                    data-testid="login-password-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
                data-testid="login-btn"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

              <p className="text-center text-sm text-gray-600 font-inter">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-primary font-semibold hover:underline"
                  data-testid="switch-to-register"
                >
                  Sign Up
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;