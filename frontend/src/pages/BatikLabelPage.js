import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, ShoppingCart } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function BatikLabelPage() {
  const [batikProducts, setBatikProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatikProducts();
  }, []);

  const fetchBatikProducts = async () => {
    try {
      const categoriesRes = await axios.get(`${API}/categories`);
      const batikCategory = categoriesRes.data.find(cat => cat.slug === 'batik');
      
      if (batikCategory) {
        const productsRes = await axios.get(`${API}/products`);
        const batikProds = productsRes.data.filter(p => p.category_id === batikCategory.id);
        setBatikProducts(batikProds);
      }
    } catch (error) {
      console.error('Failed to fetch Batik products:', error);
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1610706502858-6a0989239446?w=1200&h=600&fit=crop')" }}
        ></div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
          <h1 className="text-6xl font-playfair font-bold mb-4">Batik Label</h1>
          <p className="text-xl font-inter max-w-2xl">
            Discover our exclusive collection of traditional handcrafted Batik fabrics and accessories, 
            celebrating Singapore's rich cultural heritage
          </p>
        </div>
      </section>

      {/* About Batik */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-playfair font-bold mb-6">The Art of Batik</h2>
          <p className="text-lg text-gray-700 font-inter mb-4">
            Batik is a traditional fabric dyeing technique that uses wax-resist methods to create intricate patterns. 
            Each piece is a unique work of art, reflecting centuries of Southeast Asian craftsmanship.
          </p>
          <p className="text-lg text-gray-700 font-inter">
            Our Batik collection features authentic designs inspired by Singapore's multicultural heritage, 
            perfect for gifts, fashion, or home décor.
          </p>
        </div>

        {/* Products Grid */}
        <div className="mb-8">
          <h3 className="text-2xl font-playfair font-bold mb-6">Our Batik Collection</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {batikProducts.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-primary hover:shadow-xl transition-all"
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
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 font-inter group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center mb-2">
                    <Star className="text-yellow-400 fill-current" size={14} />
                    <span className="text-sm text-gray-600 ml-1 font-inter">{product.rating}</span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    {product.sale_price ? (
                      <>
                        <span className="text-lg font-bold text-primary font-inter">
                          ${product.sale_price}
                        </span>
                        <span className="text-sm text-gray-400 line-through font-inter">
                          ${product.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900 font-inter">
                        ${product.price}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {batikProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 font-inter">No Batik products available at the moment.</p>
            <Link to="/products" className="mt-4 inline-block text-primary font-semibold hover:underline">
              Explore All Products
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

export default BatikLabelPage;
