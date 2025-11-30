import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Upload, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AdminLandmarks() {
  const [landmarks, setLandmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLandmark, setEditingLandmark] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: ''
  });

  useEffect(() => {
    fetchLandmarks();
  }, []);

  const fetchLandmarks = async () => {
    try {
      const response = await axios.get(`${API}/landmarks`);
      setLandmarks(response.data);
    } catch (error) {
      toast.error('Failed to load landmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await axios.post(`${API}/admin/upload-image`, formDataUpload, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFormData({...formData, image: response.data.url});
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLandmark) {
        await axios.put(`${API}/admin/landmarks/${editingLandmark.id}`, formData, { withCredentials: true });
        toast.success('Landmark updated successfully');
      } else {
        await axios.post(`${API}/admin/landmarks`, formData, { withCredentials: true });
        toast.success('Landmark created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchLandmarks();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save landmark');
    }
  };

  const handleDelete = async (landmarkId) => {
    if (!window.confirm('Are you sure? This will also delete all products associated with this landmark.')) return;

    try {
      await axios.delete(`${API}/admin/landmarks/${landmarkId}`, { withCredentials: true });
      toast.success('Landmark deleted successfully');
      fetchLandmarks();
    } catch (error) {
      toast.error('Failed to delete landmark');
    }
  };

  const handleEdit = (landmark) => {
    setEditingLandmark(landmark);
    setFormData({
      name: landmark.name,
      description: landmark.description || '',
      image: landmark.image || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingLandmark(null);
    setFormData({ name: '', description: '', image: '' });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-playfair font-bold text-gray-900">Landmarks Management</h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-primary inline-flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Add Landmark
        </button>
      </div>

      {/* Landmarks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {landmarks.map((landmark) => (
          <div key={landmark.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gray-200 relative">
              {landmark.image ? (
                <img src={landmark.image} alt={landmark.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <MapPin size={48} className="text-gray-400" />
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 font-inter">{landmark.name}</h3>
              <p className="text-sm text-gray-600 mb-4 font-inter line-clamp-2">{landmark.description || 'No description'}</p>
              <div className="flex justify-end space-x-4">
                <button onClick={() => handleEdit(landmark)} className="text-blue-600 hover:text-blue-900">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(landmark.id)} className="text-red-600 hover:text-red-900">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {landmarks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <MapPin size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-inter">No landmarks yet. Create your first landmark!</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-playfair font-bold mb-6">{editingLandmark ? 'Edit Landmark' : 'Add New Landmark'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Landmark Name * (displays in large font)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-playfair"
                  placeholder="e.g., The Merlion Story"
                />
                <p className="text-xs text-gray-500 mt-1 font-inter">This will appear as the main title in large font on the frontend</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-inter text-base"
                  placeholder="Write a detailed description of the landmark. You can copy and paste long text here."
                />
                <p className="text-xs text-gray-500 mt-1 font-inter">Supports plain text. For formatting, you can use line breaks.</p>
              </div>
              
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Landmark Image</label>
                {formData.image ? (
                  <div className="relative">
                    <img src={formData.image} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, image: ''})}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <div className="text-center">
                      <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                      <span className="text-sm text-gray-600 font-inter">
                        {uploading ? 'Uploading...' : 'Click to upload image'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
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
                  {editingLandmark ? 'Update' : 'Create'} Landmark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLandmarks;
