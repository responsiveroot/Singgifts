import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    order: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/admin/categories`, { withCredentials: true });
      setCategories(response.data.categories);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    // Upload image immediately
    setUploadingImage(true);
    try {
      const imageFormData = new FormData();
      imageFormData.append('file', file);

      const response = await axios.post(`${API}/admin/upload-image`, imageFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      setFormData({ ...formData, image_url: response.data.url });
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
      setImageFile(null);
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await axios.put(`${API}/admin/categories/${editingCategory.id}`, formData, { withCredentials: true });
        toast.success('Category updated successfully');
      } else {
        await axios.post(`${API}/admin/categories`, formData, { withCredentials: true });
        toast.success('Category created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save category');
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`${API}/admin/categories/${categoryId}`, { withCredentials: true });
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image_url: category.image_url || '',
      order: category.order
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', image_url: '', order: '' });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-playfair font-bold text-gray-900">Categories Management</h1>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary inline-flex items-center">
          <Plus size={20} className="mr-2" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            {category.image_url && (
              <img src={category.image_url} alt={category.name} className="w-full h-40 object-cover" />
            )}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 font-playfair">{category.name}</h3>
              <p className="text-sm text-gray-600 mb-3 font-inter">{category.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 font-inter">{category.product_count} products</span>
                <div className="flex space-x-2">
                  <button onClick={() => handleEdit(category)} className="text-blue-600 hover:text-blue-900">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-4">
            <h2 className="text-2xl font-playfair font-bold mb-6">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Category Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Image URL</label>
                <input type="url" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Order</label>
                <input type="number" value={formData.order} onChange={(e) => setFormData({...formData, order: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter" />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-inter">Cancel</button>
                <button type="submit" className="btn-primary">{editingCategory ? 'Update' : 'Create'} Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCategories;