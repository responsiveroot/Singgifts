import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import axios from 'axios';
import { useCurrency } from '../context/CurrencyContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { convertAndFormat } = useCurrency();

  useEffect(() => {
    if (sessionId) {
      fetchOrderDetails();
    } else {
      navigate('/');
    }
  }, [sessionId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`${API}/checkout/status/${sessionId}`, {
        withCredentials: true
      });
      setOrderDetails(response.data);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4 animate-bounce">
            <CheckCircle size={64} className="text-green-600" />
          </div>
          <h1 className="text-4xl font-playfair font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600 font-inter">
            Thank you for your purchase from SingGifts
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          {orderDetails && (
            <>
              {/* Order Info */}
              <div className="border-b border-gray-200 pb-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 font-inter">Order Number</p>
                    <p className="text-xl font-bold text-gray-900 font-inter">
                      {orderDetails.order_id || sessionId.substring(0, 20)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 font-inter">Payment Status</p>
                    <span className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-semibold uppercase">
                      {orderDetails.payment_status}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-inter">Total Paid:</span>
                    <span className="text-3xl font-bold text-primary font-inter">
                      {convertAndFormat(orderDetails.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* What's Next */}
              <div className="space-y-4">
                <h3 className="text-xl font-playfair font-bold text-gray-900 mb-4">
                  What happens next?
                </h3>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-full p-3 mt-1">
                    <Package size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 font-inter mb-1">
                      Order Processing
                    </h4>
                    <p className="text-gray-600 font-inter">
                      We're preparing your order for shipment. You'll receive a confirmation email shortly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 rounded-full p-3 mt-1">
                    <CheckCircle size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 font-inter mb-1">
                      Track Your Order
                    </h4>
                    <p className="text-gray-600 font-inter">
                      Visit your dashboard to track the status of your order and view order history.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/dashboard"
            className="flex-1 bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 font-inter"
          >
            <Package size={20} />
            <span>View Order Details</span>
            <ArrowRight size={20} />
          </Link>
          
          <Link
            to="/"
            className="flex-1 bg-gray-200 text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2 font-inter"
          >
            <Home size={20} />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Support Info */}
        <div className="text-center mt-8 text-gray-600 font-inter">
          <p>Need help? Contact us at <a href="mailto:support@singgifts.sg" className="text-primary font-semibold">support@singgifts.sg</a></p>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
