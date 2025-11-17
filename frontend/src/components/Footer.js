import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-16 mt-auto">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <img 
              src="https://customer-assets.emergentagent.com/job_a518ec26-715d-489b-87fc-44c951b31297/artifacts/7thk371k_singgifts-logo.jpeg" 
              alt="SingGifts Logo" 
              className="h-16 w-auto mb-4 bg-white rounded-lg p-2"
            />
            <p className="text-gray-400 font-inter mb-4 max-w-md">
              Premium Singapore gifts, souvenirs, and unique products celebrating the best of Lion City culture.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-400">
                <Mail size={16} />
                <a href="mailto:support@singgifts.sg" className="hover:text-white transition-colors">support@singgifts.sg</a>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Phone size={16} />
                <span>+65 6123 4567</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <MapPin size={16} />
                <span>Singapore</span>
              </div>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="font-bold mb-4 font-inter text-lg">Shop</h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-gray-400 hover:text-white transition-colors font-inter">All Products</Link></li>
              <li><Link to="/new-arrivals" className="text-gray-400 hover:text-white transition-colors font-inter">New Arrivals</Link></li>
              <li><Link to="/deals" className="text-gray-400 hover:text-white transition-colors font-inter">Flash Deals</Link></li>
              <li><Link to="/batik-label" className="text-gray-400 hover:text-white transition-colors font-inter">Batik Label</Link></li>
              <li><Link to="/explore-singapore" className="text-gray-400 hover:text-white transition-colors font-inter">Explore Singapore</Link></li>
            </ul>
          </div>

          {/* Customer Service Column */}
          <div>
            <h4 className="font-bold mb-4 font-inter text-lg">Customer Service</h4>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors font-inter">Contact Us</Link></li>
              <li><Link to="/shipping-returns" className="text-gray-400 hover:text-white transition-colors font-inter">Shipping & Returns</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors font-inter">FAQ</Link></li>
              <li><Link to="/track-order" className="text-gray-400 hover:text-white transition-colors font-inter">Track Order</Link></li>
              <li><Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors font-inter">My Account</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-bold mb-4 font-inter text-lg">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors font-inter">About Us</Link></li>
              <li><Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors font-inter">Privacy Policy</Link></li>
              <li><Link to="/terms-conditions" className="text-gray-400 hover:text-white transition-colors font-inter">Terms & Conditions</Link></li>
              <li><Link to="/refund-policy" className="text-gray-400 hover:text-white transition-colors font-inter">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Social Media & Payment Methods */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-400 font-inter mb-2">Follow us on social media</p>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-primary transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-gray-400 font-inter mb-2">Secure Payment Methods</p>
            <div className="flex space-x-2">
              <span className="bg-gray-800 px-3 py-1 rounded text-xs">VISA</span>
              <span className="bg-gray-800 px-3 py-1 rounded text-xs">MASTERCARD</span>
              <span className="bg-gray-800 px-3 py-1 rounded text-xs">STRIPE</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 font-inter">
            &copy; {currentYear} SingGifts. All rights reserved. Made with ❤️ in Singapore
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;