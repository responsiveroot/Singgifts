import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, FolderTree, Users, Tag, MapPin, Palmtree, Upload, LogOut, Percent } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AdminLayout({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/auth');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: FolderTree, label: 'Categories', path: '/admin/categories' },
    { icon: MapPin, label: 'Landmarks', path: '/admin/landmarks' },
    { icon: Palmtree, label: 'Explore Singapore', path: '/admin/explore-singapore' },
    { icon: Tag, label: 'Batik Label', path: '/admin/batik-label' },
    { icon: Users, label: 'Customers', path: '/admin/customers' },
    { icon: Tag, label: 'Coupons', path: '/admin/coupons' },
    { icon: Upload, label: 'Import CSV', path: '/admin/import' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-playfair font-bold text-primary">
              SingGifts
            </Link>
            <span className="px-3 py-1 bg-primary text-white text-sm rounded-full font-inter">Admin</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-inter">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-inter"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md p-4 sticky top-8">
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-inter ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;