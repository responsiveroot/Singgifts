import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, ArrowLeft, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useCurrency } from '../context/CurrencyContext';
import SEO from '../components/SEO';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Landmark information database
const LANDMARKS = {
  'marina-bay-sands': {
    name: 'Marina Bay Sands',
    description: 'Iconic integrated resort with rooftop infinity pool',
    fullDescription: 'Marina Bay Sands is an integrated resort fronting Marina Bay in Singapore. Developed by Las Vegas Sands, it is the world\'s most expensive standalone casino property at S$8 billion. The resort includes a 2,561-room hotel, a 120,000-square-metre convention-exhibition centre, the 74,000-square-metre The Shoppes at Marina Bay Sands mall, a museum, two large theatres, seven celebrity chef restaurants, two floating Crystal Pavilions, an ice skating rink, and the world\'s largest atrium casino with 500 tables and 1,600 slot machines.',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&h=600&fit=crop',
    highlights: [
      'SkyPark Observation Deck',
      'Infinity Pool',
      'ArtScience Museum',
      'The Shoppes at Marina Bay Sands',
      'Gardens by the Bay Views'
    ]
  },
  'gardens-by-the-bay': {
    name: 'Gardens by the Bay',
    description: 'Futuristic garden with iconic Supertrees',
    fullDescription: 'Gardens by the Bay is a nature park spanning 101 hectares in the Central Region of Singapore, adjacent to the Marina Reservoir. The park consists of three waterfront gardens: Bay South Garden, Bay East Garden and Bay Central Garden. The park is a showcase of horticulture and garden artistry that presents the plants and flowers of the world. It features the iconic Supertree structures, Flower Dome, and Cloud Forest.',
    image: 'https://images.unsplash.com/photo-1562992191-913952e43bef?w=1200&h=600&fit=crop',
    highlights: [
      'Supertree Grove',
      'Cloud Forest',
      'Flower Dome',
      'OCBC Skyway',
      'Garden Rhapsody Light Show'
    ]
  },
  'sentosa-island': {
    name: 'Sentosa Island',
    description: 'Island resort with beaches and attractions',
    fullDescription: 'Sentosa is a resort island in Singapore, visited by over twenty million people a year. The island is located to the south of Singapore\'s main island. It is home to numerous attractions including theme parks, beaches, hotels, golf courses, and a casino. Major attractions include Universal Studios Singapore, S.E.A. Aquarium, Adventure Cove Waterpark, and various beaches.',
    image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=1200&h=600&fit=crop',
    highlights: [
      'Universal Studios Singapore',
      'S.E.A. Aquarium',
      'Siloso Beach',
      'Sentosa Merlion',
      'Fort Siloso'
    ]
  },
  'merlion-park': {
    name: 'Merlion Park',
    description: 'Home to Singapore\'s iconic Merlion statue',
    fullDescription: 'The Merlion is the official mascot of Singapore. It is depicted as a mythical creature with a lion\'s head and the body of a fish. The Merlion was designed by Bruner Tong, a member of the Souvenir Committee, as an emblem for the Singapore Tourism Board. The design represents Singapore\'s history as a fishing village and its original name, Singapura (lion city).',
    image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=1200&h=600&fit=crop',
    highlights: [
      'Merlion Statue',
      'Marina Bay Views',
      'Waterfront Promenade',
      'City Skyline Views',
      'Photo Opportunities'
    ]
  },
  'chinatown': {
    name: 'Chinatown',
    description: 'Historic ethnic neighborhood with heritage shophouses',
    fullDescription: 'Singapore\'s Chinatown is an ethnic neighborhood featuring distinctly Chinese cultural elements and a historically concentrated ethnic Chinese population. Chinatown is located within the larger district of Outram. It is considerably less of an enclave than it once was. The precinct does serve as a major tourist attraction and a cultural focal point.',
    image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=1200&h=600&fit=crop',
    highlights: [
      'Buddha Tooth Relic Temple',
      'Chinatown Heritage Centre',
      'Traditional Shophouses',
      'Street Food',
      'Chinese Cultural Artifacts'
    ]
  },
  'little-india': {
    name: 'Little India',
    description: 'Vibrant Indian quarter with colorful streets',
    fullDescription: 'Little India is an ethnic district in Singapore. It is located east of the Singapore River and is located north of Chinatown. Little India is known for its Indian restaurants, shops, and temples. The area is particularly lively during the celebration of Deepavali (Diwali) and other Hindu festivals.',
    image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=1200&h=600&fit=crop',
    highlights: [
      'Sri Veeramakaliamman Temple',
      'Tekka Centre',
      'Mustafa Centre',
      'Indian Cuisine',
      'Colorful Architecture'
    ]
  }
};

function LandmarkPage() {
  const { landmarkId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { convertAndFormat } = useCurrency();
  
  const landmark = LANDMARKS[landmarkId];

  useEffect(() => {
    if (landmark) {
      fetchProducts();
    }
  }, [landmarkId]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products/by-location/${landmark.name}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!landmark) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Landmark Not Found</h2>
          <Link to="/explore-singapore" className="text-primary hover:underline">
            ← Back to Explore Singapore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title={`${landmark.name} - Singapore Landmark`}
        description={landmark.fullDescription}
        image={landmark.image}
        url={`/landmark/${landmarkId}`}
      />

      {/* Hero Section with Landmark Image */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src={landmark.image} 
          alt={landmark.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="flex items-center justify-center mb-4">
              <MapPin size={48} className="mr-3" />
              <h1 className="text-5xl font-playfair font-bold">{landmark.name}</h1>
            </div>
            <p className="text-xl font-inter">{landmark.description}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link to="/explore-singapore" className="inline-flex items-center text-primary hover:underline font-inter">
            <ArrowLeft size={20} className="mr-2" />
            Back to Explore Singapore
          </Link>
        </div>

        {/* Landmark Information */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-12">
          <h2 className="text-3xl font-playfair font-bold mb-6">About {landmark.name}</h2>
          <p className="text-gray-700 font-inter text-lg leading-relaxed mb-8">
            {landmark.fullDescription}
          </p>

          <h3 className="text-2xl font-playfair font-semibold mb-4">Highlights</h3>
          <ul className="grid md:grid-cols-2 gap-3">
            {landmark.highlights.map((highlight, index) => (
              <li key={index} className="flex items-center text-gray-700 font-inter">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        {/* Related Products */}
        <div>
          <h2 className="text-3xl font-playfair font-bold mb-6">
            Products Related to {landmark.name}
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-64">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.sale_price && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        SALE
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 font-inter line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                        />
                      ))}
                      <span className="ml-2 text-xs text-gray-600 font-inter">
                        ({product.review_count})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      {product.sale_price ? (
                        <div>
                          <span className="text-lg font-bold text-primary font-inter">
                            {convertAndFormat(product.sale_price)}
                          </span>
                          <span className="ml-2 text-sm text-gray-500 line-through font-inter">
                            {convertAndFormat(product.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-primary font-inter">
                          {convertAndFormat(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <p className="text-gray-600 font-inter text-lg">
                No products available for this landmark yet.
              </p>
              <p className="text-gray-500 font-inter mt-2">
                Check back soon for exclusive {landmark.name} merchandise!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LandmarkPage;
