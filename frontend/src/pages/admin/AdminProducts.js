import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Upload, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sale_price: '',
    category_id: '',
    stock: '',
    images: '',
    location: '',
    is_batik_label: false,
    is_on_deal: false,
    deal_percentage: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/admin/products`, {
        params: { search: searchTerm, category_id: selectedCategory },
        withCredentials: true
      });
      setProducts(response.data.products);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const uploadedUrls = [];

    try {
      for (const file of files) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        const response = await axios.post(`${API}/admin/upload-image`, formDataUpload, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        uploadedUrls.push(response.data.url);
      }

      setUploadedImages([...uploadedImages, ...uploadedUrls]);
      
      // Update formData images field
      const allImages = [...uploadedImages, ...uploadedUrls];
      setFormData({...formData, images: allImages.join(', ')});
      
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload images');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeUploadedImage = (urlToRemove) => {
    const updatedImages = uploadedImages.filter(url => url !== urlToRemove);
    setUploadedImages(updatedImages);
    setFormData({...formData, images: updatedImages.join(', ')});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        images: formData.images.split(',').map(url => url.trim()).filter(url => url)
      };

      if (editingProduct) {
        await axios.put(`${API}/admin/products/${editingProduct.id}`, productData, { withCredentials: true });
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${API}/admin/products`, productData, { withCredentials: true });
        toast.success('Product created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save product');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`${API}/admin/products/${productId}`, { withCredentials: true });
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setUploadedImages(product.images || []);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      sale_price: product.sale_price || '',
      category_id: product.category_id,
      stock: product.stock,
      images: product.images.join(', '),
      location: product.location || '',
      is_batik_label: product.is_batik_label || false,
      is_on_deal: product.is_on_deal || false,
      deal_percentage: product.deal_percentage || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setUploadedImages([]);
    setFormData({
      name: '',
      description: '',
      price: '',
      sale_price: '',
      category_id: '',
      stock: '',
      images: '',
      location: '',
      is_batik_label: false,
      is_on_deal: false,
      deal_percentage: ''
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-playfair font-bold text-gray-900">Products Management</h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-primary inline-flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const category = categories.find(c => c.id === product.category_id);
              return (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 font-inter">{product.name}</div>
                        <div className="text-xs text-gray-500 font-inter">{product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-inter">{category?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-inter">${product.price}</div>
                    {product.sale_price && <div className="text-xs text-green-600 font-inter">${product.sale_price}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-inter ${product.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900 mr-4">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500 font-inter">No products found</div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-playfair font-bold mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Sale Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({...formData, sale_price: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Category *</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Stock *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Image URLs (comma-separated)</label>
                <textarea
                  value={formData.images}
                  onChange={(e) => setFormData({...formData, images: e.target.value})}
                  rows={2}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Singapore Landmark (Optional)</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                >
                  <option value="">No specific location</option>
                  <option value="Marina Bay Sands">Marina Bay Sands</option>
                  <option value="Gardens by the Bay">Gardens by the Bay</option>
                  <option value="Sentosa Island">Sentosa Island</option>
                  <option value="Merlion Park">Merlion Park</option>
                  <option value="Chinatown">Chinatown</option>
                  <option value="Little India">Little India</option>
                </select>
                <p className="text-xs text-gray-500 mt-1 font-inter">Assign this product to a landmark for "Explore Singapore" feature</p>
              </div>

              {/* Deals & Labels */}
              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold text-gray-900 font-inter">Special Labels & Deals</h3>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_batik_label"
                    checked={formData.is_batik_label}
                    onChange={(e) => setFormData({...formData, is_batik_label: e.target.checked})}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="is_batik_label" className="text-sm text-gray-700 font-inter">
                    BATIC Label Product
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_on_deal"
                    checked={formData.is_on_deal}
                    onChange={(e) => setFormData({...formData, is_on_deal: e.target.checked})}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="is_on_deal" className="text-sm text-gray-700 font-inter">
                    On Deal
                  </label>
                </div>

                {formData.is_on_deal && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Deal Discount %</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={formData.deal_percentage}
                      onChange={(e) => setFormData({...formData, deal_percentage: e.target.value})}
                      placeholder="e.g., 20 for 20% off"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-inter"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Update' : 'Create'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;