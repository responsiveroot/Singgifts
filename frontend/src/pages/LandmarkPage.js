import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ArrowLeft, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useCurrency } from '../context/CurrencyContext';
import SEO from '../components/SEO';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function LandmarkPage({ user, updateCartCount }) {
  const { landmarkId } = useParams();
  const [landmark, setLandmark] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { convertAndFormat } = useCurrency();

  useEffect(() => {
    fetchLandmarkAndProducts();
  }, [landmarkId]);

  const fetchLandmarkAndProducts = async () => {
    try {
      // Fetch all landmarks and find the one we need
      const landmarksRes = await axios.get(`${API}/landmarks`);
      const foundLandmark = landmarksRes.data.find(l => l.id === landmarkId || l.slug === landmarkId);
      
      if (!foundLandmark) {
        setLoading(false);
        return;
      }
      
      setLandmark(foundLandmark);

      // Fetch products for this landmark
      const productsRes = await axios.get(`${API}/explore-singapore-products?landmark_id=${foundLandmark.id}`);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load landmark data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      if (user) {
        // Logged-in user: add to server cart
        await axios.post(
          `${API}/cart`,
          { product_id: productId, quantity: 1, collection_type: 'explore_singapore' },
          { withCredentials: true }
        );
        if (updateCartCount) updateCartCount();
      } else {
        // Guest user: add to localStorage
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        
        // Check if item already exists
        const existingItemIndex = guestCart.findIndex(item => item.product_id === productId);
        
        if (existingItemIndex > -1) {
          // Update quantity
          guestCart[existingItemIndex].quantity += 1;
        } else {
          // Add new item
          guestCart.push({
            id: `guest-${Date.now()}-${productId}`,
            product_id: productId,
            quantity: 1,
            collection_type: 'explore_singapore'
          });
        }
        
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        if (updateCartCount) updateCartCount();
      }
      
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!landmark) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 font-playfair">Landmark Not Found</h2>
          <Link to="/explore-singapore" className="text-primary hover:underline font-inter">
            ← Back to Explore Singapore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title={`${landmark.name} - Singapore Landmark`}
        description={landmark.description}
        image={landmark.image}
        url={`/landmark/${landmarkId}`}
      />

      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden bg-gradient-to-r from-red-600 to-blue-600">
        {landmark.image && (
          <>
            <img 
              src={landmark.image} 
              alt={landmark.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white container mx-auto px-4">
            <Link 
              to="/explore-singapore" 
              className="inline-flex items-center text-white hover:text-gray-200 mb-4 font-inter"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Explore Singapore
            </Link>
            <div className="flex items-center justify-center space-x-3 mb-4">
              <MapPin size={32} />
              <h1 className="text-5xl font-playfair font-bold">{landmark.name}</h1>
            </div>
            <p className="text-xl font-inter max-w-2xl mx-auto">
              {landmark.description}
            </p>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-playfair font-bold mb-8">Featured Products from {landmark.name}</h2>
        
        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <MapPin size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 font-inter">No products available for this landmark yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const displayPrice = product.sale_price || product.price;
              return (
                <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <Link to={`/products/${product.id}`} className="block">
                    <div className="h-48 bg-gray-200">
                      {product.images && product.images[0] && (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 hover:text-primary font-inter line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-primary font-inter">
                          {convertAndFormat(displayPrice)}
                        </span>
                        {product.sale_price && (
                          <span className="text-sm text-gray-500 line-through ml-2 font-inter">
                            {convertAndFormat(product.price)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className="w-full mt-4 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2 font-inter"
                    >
                      <ShoppingCart size={18} />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default LandmarkPage;
