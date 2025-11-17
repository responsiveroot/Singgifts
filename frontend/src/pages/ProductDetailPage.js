import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Link2, Check } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useCurrency } from '../context/CurrencyContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function ProductDetailPage({ user, updateCartCount }) {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [copied, setCopied] = useState(false);
  const { convertAndFormat } = useCurrency();

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      const [productRes, reviewsRes] = await Promise.all([
        axios.get(`${API}/products/${productId}`),
        axios.get(`${API}/reviews/${productId}`)
      ]);

      setProduct(productRes.data);
      setReviews(reviewsRes.data);

      // Fetch related products
      const relatedRes = await axios.get(`${API}/products?category_id=${productRes.data.category_id}&limit=4`);
      setRelatedProducts(relatedRes.data.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await axios.post(
        `${API}/cart`,
        { product_id: productId, quantity },
        { withCredentials: true }
      );
      toast.success('Added to cart!');
      updateCartCount();
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

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Product not found</h2>
          <Link to="/products" className="text-primary hover:underline">Browse all products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-gray-600 font-inter">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-primary">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        {/* Product Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg mb-4" data-testid="product-main-image">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="w-full h-[500px] object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-playfair font-bold text-gray-900 mb-4" data-testid="product-name">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="ml-2 text-gray-700 font-semibold font-inter">{product.rating}</span>
              <span className="ml-2 text-gray-500 font-inter">({product.review_count} reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              {product.sale_price ? (
                <div>
                  <span className="text-4xl font-bold text-primary font-inter" data-testid="sale-price">{convertAndFormat(product.sale_price)}</span>
                  <span className="text-2xl text-gray-500 line-through ml-4 font-inter" data-testid="original-price">{convertAndFormat(product.price)}</span>
                  <span className="ml-3 bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                    Save {Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                  </span>
                </div>
              ) : (
                <span className="text-4xl font-bold text-gray-900 font-inter" data-testid="price">{convertAndFormat(product.price)}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-700 mb-6 font-inter leading-relaxed" data-testid="product-description">
              {product.description}
            </p>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <span className="inline-flex items-center text-green-600 font-semibold font-inter">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="inline-flex items-center text-red-600 font-semibold font-inter">
                  <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                  Out of Stock
                </span>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 hover:bg-gray-100 transition-colors"
                  data-testid="decrease-quantity"
                >
                  -
                </button>
                <span className="px-6 py-3 border-x border-gray-300 font-semibold font-inter" data-testid="quantity-display">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-3 hover:bg-gray-100 transition-colors"
                  data-testid="increase-quantity"
                >
                  +
                </button>
              </div>
              <button
                onClick={addToCart}
                disabled={product.stock === 0}
                className="flex-1 btn-primary inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="add-to-cart-btn"
              >
                <ShoppingCart size={20} className="mr-2" />
                Add to Cart
              </button>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <Truck className="mx-auto mb-2 text-primary" size={24} />
                <p className="text-xs text-gray-600 font-inter">Free Shipping</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <Shield className="mx-auto mb-2 text-primary" size={24} />
                <p className="text-xs text-gray-600 font-inter">Secure Payment</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <RotateCcw className="mx-auto mb-2 text-primary" size={24} />
                <p className="text-xs text-gray-600 font-inter">Easy Returns</p>
              </div>
            </div>

            {/* Long Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-3 font-inter">Product Details</h3>
              <p className="text-gray-700 font-inter leading-relaxed">{product.long_description}</p>
              <div className="mt-4">
                <p className="text-sm text-gray-600 font-inter"><span className="font-semibold">SKU:</span> {product.sku}</p>
                <p className="text-sm text-gray-600 font-inter"><span className="font-semibold">Tags:</span> {product.tags.join(', ')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-playfair font-bold text-gray-900 mb-8">Customer Reviews</h2>
          {reviews.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center shadow-sm">
              <p className="text-gray-600 font-inter">No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 font-inter">{review.user_name}</p>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 font-inter">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className="text-gray-700 font-inter">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-playfair font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/products/${relatedProduct.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-md card-hover"
                >
                  <div className="product-image h-48 bg-gray-100">
                    <img
                      src={relatedProduct.images[0]}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 font-inter line-clamp-2">{relatedProduct.name}</h3>
                    <div className="flex items-center justify-between">
                      {relatedProduct.sale_price ? (
                        <div>
                          <span className="text-lg font-bold text-primary font-inter">{convertAndFormat(relatedProduct.sale_price)}</span>
                          <span className="text-xs text-gray-500 line-through ml-1 font-inter">{convertAndFormat(relatedProduct.price)}</span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-gray-900 font-inter">{convertAndFormat(relatedProduct.price)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetailPage;