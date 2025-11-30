import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function ExploreSingaporePage() {
  const [landmarks, setLandmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLandmarks();
  }, []);

  const fetchLandmarks = async () => {
    try {
      const response = await axios.get(`${API}/landmarks`);
      setLandmarks(response.data);
    } catch (error) {
      console.error('Failed to fetch landmarks:', error);
      toast.error('Failed to load landmarks');
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
      <section className="relative h-96 bg-gradient-to-r from-red-600 to-blue-600">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&h=600&fit=crop')" }}
        ></div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
          <h1 className="text-5xl font-playfair font-bold mb-4">Explore Singapore</h1>
          <p className="text-xl font-inter max-w-2xl">
            Discover the vibrant culture, stunning attractions, and unique experiences that make Singapore a world-class destination
          </p>
        </div>
      </section>

      {/* Landmarks Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-playfair font-bold text-center mb-12">Must-Visit Attractions</h2>
        {landmarks.length === 0 ? (
          <div className="text-center py-12">
            <MapPin size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 font-inter">No landmarks available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {landmarks.map((landmark) => (
              <Link key={landmark.id} to={`/landmark/${landmark.id}`} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="h-48 overflow-hidden bg-gray-200 flex items-center justify-center">{landmark.image ? (
                <img 
                  src={attraction.image} 
                  alt={attraction.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="text-xs text-primary font-semibold mb-2 font-inter">{attraction.category}</div>
                <h3 className="text-xl font-playfair font-bold mb-2">{attraction.name}</h3>
                <p className="text-gray-600 font-inter">{attraction.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-playfair font-bold mb-4">Bring Singapore Home</h2>
          <p className="text-lg font-inter mb-8 max-w-2xl mx-auto">
            Shop our curated collection of authentic Singapore gifts and souvenirs
          </p>
          <Link 
            to="/products"
            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors font-inter"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
}

export default ExploreSingaporePage;
