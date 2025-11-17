import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Camera, Utensils, Building } from 'lucide-react';

function ExploreSingaporePage() {
  const attractions = [
    {
      id: 1,
      name: 'Marina Bay Sands',
      description: 'Iconic integrated resort with rooftop infinity pool',
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&h=400&fit=crop',
      category: 'Landmarks'
    },
    {
      id: 2,
      name: 'Gardens by the Bay',
      description: 'Futuristic botanical garden with Supertree Grove',
      image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=600&h=400&fit=crop',
      category: 'Nature'
    },
    {
      id: 3,
      name: 'Chinatown',
      description: 'Historic district with traditional shophouses and temples',
      image: 'https://images.unsplash.com/photo-1564868526705-a846c8826b43?w=600&h=400&fit=crop',
      category: 'Culture'
    },
    {
      id: 4,
      name: 'Sentosa Island',
      description: 'Resort island with beaches, attractions, and entertainment',
      image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=600&h=400&fit=crop',
      category: 'Recreation'
    },
    {
      id: 5,
      name: 'Hawker Centers',
      description: 'Experience authentic local cuisine at affordable prices',
      image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&h=400&fit=crop',
      category: 'Food'
    },
    {
      id: 6,
      name: 'Little India',
      description: 'Vibrant ethnic quarter with colorful streets and shops',
      image: 'https://images.unsplash.com/photo-1620766182966-c6eb5f3b1fb6?w=600&h=400&fit=crop',
      category: 'Culture'
    }
  ];

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

      {/* Attractions Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-playfair font-bold text-center mb-12">Must-Visit Attractions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {attractions.map((attraction) => (
            <div key={attraction.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-48 overflow-hidden">
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
            </div>
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
