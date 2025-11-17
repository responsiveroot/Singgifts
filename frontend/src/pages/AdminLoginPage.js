import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AdminLoginPage({ setUser }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: 'admin@singgifts.sg',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/admin-login`, {
        email: formData.email,
        password: formData.password
      }, { withCredentials: true });
      
      setUser(response.data.user);
      toast.success('Admin login successful!');
      navigate('/admin');
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error(error.response?.data?.detail || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <Lock className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-600 font-inter">SingGifts Admin Panel</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                  placeholder="admin@singgifts.sg"
                  data-testid="admin-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                  placeholder="Enter admin password"
                  data-testid="admin-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50"
              data-testid="admin-login-btn"
            >
              {loading ? 'Logging in...' : 'Login to Admin Panel'}
            </button>
          </form>

          {/* Default Credentials Hint */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-inter text-center">
              <strong>Default Admin Credentials:</strong><br/>
              Email: admin@singgifts.sg<br/>
              Password: admin123
            </p>
          </div>

          {/* Back to Site */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-primary hover:underline font-inter text-sm"
            >
              ← Back to Main Site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
