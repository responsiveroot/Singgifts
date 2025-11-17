import React from 'react';
import { Award, Heart, Globe, Users } from 'lucide-react';

function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary to-purple-600 py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl font-playfair font-bold mb-4">About SingGifts</h1>
          <p className="text-xl font-inter max-w-2xl mx-auto">
            Your premier destination for authentic Singapore gifts and souvenirs
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-playfair font-bold mb-6">Our Story</h2>
            <p className="text-gray-700 font-inter mb-4">
              Founded in 2025, SingGifts was born from a passion to celebrate Singapore's rich cultural heritage through premium gifts and souvenirs.
            </p>
            <p className="text-gray-700 font-inter">
              We curate the finest products from 20 categories, from traditional Batik to modern electronics, ensuring every item represents the best of Singapore.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <Award size={48} className="text-primary mx-auto mb-4" />
              <h3 className="font-bold text-2xl mb-2">500+</h3>
              <p className="text-gray-600">Products</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <Users size={48} className="text-primary mx-auto mb-4" />
              <h3 className="font-bold text-2xl mb-2">10K+</h3>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <Globe size={48} className="text-primary mx-auto mb-4" />
              <h3 className="font-bold text-2xl mb-2">50+</h3>
              <p className="text-gray-600">Countries</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <Heart size={48} className="text-primary mx-auto mb-4" />
              <h3 className="font-bold text-2xl mb-2">4.8/5</h3>
              <p className="text-gray-600">Rating</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-12 shadow-lg">
          <h2 className="text-3xl font-playfair font-bold text-center mb-8">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-blue-600" size={32} />
              </div>
              <h3 className="font-bold text-xl mb-2">Quality</h3>
              <p className="text-gray-600">Only the finest authentic products</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-green-600" size={32} />
              </div>
              <h3 className="font-bold text-xl mb-2">Passion</h3>
              <p className="text-gray-600">Celebrating Singapore culture</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="text-purple-600" size={32} />
              </div>
              <h3 className="font-bold text-xl mb-2">Global</h3>
              <p className="text-gray-600">Shipping worldwide</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;