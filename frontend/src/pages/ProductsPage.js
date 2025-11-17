import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, ShoppingCart, Search, Filter, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useCurrency } from '../context/CurrencyContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function ProductsPage({ user, updateCartCount }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [showFilters, setShowFilters] = useState(false);
  const { convertAndFormat } = useCurrency();

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const categoryParam = searchParams.get('category') || '';
      const isBestseller = searchParams.get('is_bestseller') === 'true';
      const isFeatured = searchParams.get('is_featured') === 'true';
      const search = searchParams.get('search') || '';

      let url = `${API}/products?limit=50`;
      if (categoryParam) url += `&category_id=${categoryParam}`;
      if (isBestseller) url += `&is_bestseller=true`;
      if (isFeatured) url += `&is_featured=true`;
      if (search) url += `&search=${search}`;

      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(url),
        axios.get(`${API}/categories`)
      ]);

      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setSelectedCategory(categoryParam);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleCategoryFilter = (categoryId) => {
    const params = new URLSearchParams(searchParams);
    if (categoryId) {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchQuery('');
    setSelectedCategory('');
  };

  const addToCart = async (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await axios.post(
        `${API}/cart`,
        { product_id: productId, quantity: 1 },
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

  return (
    <div className="products-page py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-playfair font-bold text-gray-900 mb-4" data-testid="page-title">
            {searchParams.get('is_bestseller') === 'true' ? 'Bestsellers' :
             searchParams.get('is_featured') === 'true' ? 'Featured Products' :
             'All Products'}
          </h1>
          <p className="text-lg text-gray-600 font-inter">Discover our collection of Singapore-themed gifts</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 flex">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                data-testid="search-input"
              />
              <button
                onClick={handleSearch}
                className="bg-primary text-white px-6 py-3 rounded-r-lg hover:bg-red-700 transition-colors"
                data-testid="search-btn"
              >
                <Search size={20} />
              </button>
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-inter"
              data-testid="filter-toggle-btn"
            >
              <Filter size={20} className="mr-2" />
              Filters
            </button>
          </div>

          {/* Active Filters */}
          {(selectedCategory || searchParams.get('search')) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 font-inter">Active filters:</span>
              {selectedCategory && (
                <span className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-inter">
                  {categories.find(c => c.id === selectedCategory)?.name}
                  <button onClick={() => handleCategoryFilter('')} className="ml-2">
                    <X size={14} />
                  </button>
                </span>
              )}
              {searchParams.get('search') && (
                <span className="inline-flex items-center bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-inter">
                  Search: {searchParams.get('search')}
                </span>
              )}
              <button onClick={clearFilters} className="text-sm text-gray-600 hover:text-primary underline font-inter">
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters (Desktop) */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="font-semibold text-lg mb-4 font-inter">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleCategoryFilter('')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-inter ${
                      !selectedCategory ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    data-testid="category-all"
                  >
                    All Categories
                  </button>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => handleCategoryFilter(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-inter ${
                        selectedCategory === category.id ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                      data-testid={`category-filter-${category.slug}`}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-24 w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2 font-inter">No products found</h3>
                <p className="text-gray-500 font-inter">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-gray-600 font-inter" data-testid="product-count">
                    Showing <span className="font-semibold">{products.length}</span> products
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="bg-white rounded-xl overflow-hidden shadow-md card-hover group"
                      data-testid={`product-card-${product.slug}`}
                    >
                      <div className="product-image h-56 bg-gray-100 relative">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        {product.sale_price && (
                          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {Math.round(((product.price - product.sale_price) / product.price) * 100)}% OFF
                          </div>
                        )}
                        <button
                          onClick={(e) => addToCart(product.id, e)}
                          className="absolute bottom-3 right-3 bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white"
                          data-testid={`add-to-cart-${product.slug}`}
                        >
                          <ShoppingCart size={20} />
                        </button>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center mb-2">
                          <Star className="text-yellow-400 fill-current" size={14} />
                          <span className="text-sm font-semibold text-gray-700 ml-1 font-inter">{product.rating}</span>
                          <span className="text-xs text-gray-500 ml-1 font-inter">({product.review_count})</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 font-inter line-clamp-2">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-3 font-inter line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          {product.sale_price ? (
                            <div>
                              <span className="text-xl font-bold text-primary font-inter">SGD {product.sale_price}</span>
                              <span className="text-sm text-gray-500 line-through ml-2 font-inter">SGD {product.price}</span>
                            </div>
                          ) : (
                            <span className="text-xl font-bold text-gray-900 font-inter">SGD {product.price}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;