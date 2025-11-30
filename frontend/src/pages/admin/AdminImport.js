import React, { useState } from 'react';
import { Upload, FileText, Users, Package, Download } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AdminImport() {
  const [importing, setImporting] = useState(false);
  const [importType, setImportType] = useState('products');

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('import_type', type);

      const response = await axios.post(`${API}/admin/import-csv`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(response.data.message || 'Import successful');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = (type) => {
    let csvContent = '';
    let filename = '';

    if (type === 'products') {
      csvContent = `name,description,price,sale_price,category_id,stock,images,sku
"Singapore Keychain","Beautiful keychain",12.50,9.90,cat-001,100,"https://example.com/image1.jpg,https://example.com/image2.jpg",SG-KEY-001
"Merlion Statue","Collectible statue",35.00,,cat-002,50,"https://example.com/image3.jpg",SG-STA-002`;
      filename = 'products_template.csv';
    } else if (type === 'customers') {
      csvContent = `name,email,phone
"John Doe","john@example.com","+6512345678"
"Jane Smith","jane@example.com","+6587654321"`;
      filename = 'customers_template.csv';
    } else if (type === 'explore_singapore') {
      csvContent = `name,description,price,sale_price,landmark_id,stock,images,sku
"Merlion Keychain","Iconic souvenir",15.90,12.90,merlion-park,100,"https://example.com/image.jpg",ESP-001`;
      filename = 'explore_singapore_template.csv';
    } else if (type === 'batik') {
      csvContent = `name,description,price,sale_price,stock,images,sku
"Batik Sarong","Traditional batik",65.00,55.00,30,"https://example.com/batik.jpg",BTK-001`;
      filename = 'batik_template.csv';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-8">Import Data</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Products Import */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Package size={32} className="text-primary" />
            <h2 className="text-2xl font-semibold font-inter">General Products</h2>
          </div>
          
          <p className="text-gray-600 mb-6 font-inter">
            Import multiple products at once using a CSV file. Download the template to see the required format.
          </p>

          <button
            onClick={() => downloadTemplate('products')}
            className="w-full mb-4 flex items-center justify-center space-x-2 px-4 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-inter"
          >
            <Download size={20} />
            <span>Download CSV Template</span>
          </button>

          <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
            <div className="text-center">
              <Upload className="mx-auto text-gray-400 mb-2" size={40} />
              <span className="text-sm text-gray-600 font-inter">
                {importing ? 'Importing...' : 'Click to upload products CSV'}
              </span>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileUpload(e, 'products')}
              disabled={importing}
              className="hidden"
            />
          </label>
        </div>

        {/* Customers Import */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Users size={32} className="text-primary" />
            <h2 className="text-2xl font-semibold font-inter">Customer Data</h2>
          </div>
          
          <p className="text-gray-600 mb-6 font-inter">
            Import customer emails and phone numbers for marketing campaigns (Email/WhatsApp).
          </p>

          <button
            onClick={() => downloadTemplate('customers')}
            className="w-full mb-4 flex items-center justify-center space-x-2 px-4 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-inter"
          >
            <Download size={20} />
            <span>Download CSV Template</span>
          </button>

          <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
            <div className="text-center">
              <Upload className="mx-auto text-gray-400 mb-2" size={40} />
              <span className="text-sm text-gray-600 font-inter">
                {importing ? 'Importing...' : 'Click to upload customers CSV'}
              </span>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileUpload(e, 'customers')}
              disabled={importing}
              className="hidden"
            />
          </label>
        </div>

        {/* Explore Singapore Products Import */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex items-center space-x-3 mb-6">
            <FileText size={32} className="text-primary" />
            <h2 className="text-2xl font-semibold font-inter">Explore Singapore Products</h2>
          </div>
          
          <p className="text-gray-600 mb-6 font-inter">
            Bulk import products for Explore Singapore landmarks.
          </p>

          <button
            onClick={() => downloadTemplate('explore_singapore')}
            className="w-full mb-4 flex items-center justify-center space-x-2 px-4 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-inter"
          >
            <Download size={20} />
            <span>Download CSV Template</span>
          </button>

          <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
            <div className="text-center">
              <Upload className="mx-auto text-gray-400 mb-2" size={40} />
              <span className="text-sm text-gray-600 font-inter">
                {importing ? 'Importing...' : 'Click to upload CSV'}
              </span>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileUpload(e, 'explore_singapore')}
              disabled={importing}
              className="hidden"
            />
          </label>
        </div>

        {/* Batik Products Import */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex items-center space-x-3 mb-6">
            <FileText size={32} className="text-primary" />
            <h2 className="text-2xl font-semibold font-inter">Batik Label Products</h2>
          </div>
          
          <p className="text-gray-600 mb-6 font-inter">
            Bulk import products for Batik Label collection.
          </p>

          <button
            onClick={() => downloadTemplate('batik')}
            className="w-full mb-4 flex items-center justify-center space-x-2 px-4 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-inter"
          >
            <Download size={20} />
            <span>Download CSV Template</span>
          </button>

          <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
            <div className="text-center">
              <Upload className="mx-auto text-gray-400 mb-2" size={40} />
              <span className="text-sm text-gray-600 font-inter">
                {importing ? 'Importing...' : 'Click to upload CSV'}
              </span>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileUpload(e, 'batik')}
              disabled={importing}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2 font-inter">📋 Import Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-2 font-inter">
          <li>• CSV files must follow the exact format provided in templates</li>
          <li>• Multiple images should be separated by commas</li>
          <li>• Prices should be in decimal format (e.g., 12.50)</li>
          <li>• For Explore Singapore products, landmark_id must match existing landmark IDs</li>
          <li>• Customer import will only add new emails (won't update existing)</li>
          <li>• Maximum file size: 5MB</li>
        </ul>
      </div>
    </div>
  );
}

export default AdminImport;
