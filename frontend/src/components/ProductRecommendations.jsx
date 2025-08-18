import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProductPlaceholder, getFallbackImage } from '../utils/placeholderImage';

const ProductRecommendations = ({ userId, currentProductId, categoryId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendationType, setRecommendationType] = useState('similar');

  useEffect(() => {
    fetchRecommendations();
  }, [userId, currentProductId, categoryId, recommendationType]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      let endpoint = '/api/products/recommendations';
      const params = new URLSearchParams();
      
      if (userId) params.append('userId', userId);
      if (currentProductId) params.append('productId', currentProductId);
      if (categoryId) params.append('categoryId', categoryId);
      params.append('type', recommendationType);
      
      const response = await fetch(`${endpoint}?${params}`);
      const data = await response.json();
      
      // Check if data is an array (success) or error object
      if (Array.isArray(data)) {
        setRecommendations(data.slice(0, 6)); // Limit to 6 recommendations
      } else {
        console.warn('Recommendations API returned error:', data);
        // Fallback to similar products if recommendations fail
        fetchSimilarProducts();
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Fallback to similar products if recommendations fail
      fetchSimilarProducts();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSimilarProducts = async () => {
    try {
      const response = await fetch(`/api/products?category=${categoryId}&limit=6`);
      const data = await response.json();
      setRecommendations(data.filter(p => p.id !== currentProductId));
    } catch (error) {
      console.error('Error fetching similar products:', error);
    }
  };

  const getRecommendationTitle = () => {
    switch (recommendationType) {
      case 'similar':
        return 'Similar Products';
      case 'trending':
        return 'Trending Now';
      case 'personalized':
        return 'Recommended for You';
      case 'bestsellers':
        return 'Best Sellers';
      default:
        return 'You Might Also Like';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Loading recommendations...</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-32 rounded-lg mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4 mb-1"></div>
              <div className="bg-gray-200 h-4 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{getRecommendationTitle()}</h3>
        
        {/* Recommendation Type Selector */}
        <div className="flex space-x-2">
          {['similar', 'trending', 'personalized', 'bestsellers'].map((type) => (
            <button
              key={type}
              onClick={() => setRecommendationType(type)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                recommendationType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {recommendations.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="group block hover:shadow-lg transition-shadow duration-200 rounded-lg overflow-hidden"
          >
            <div className="relative">
              <img
                src={product.image_url || getProductPlaceholder(product.name)}
                alt={product.name}
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  e.target.src = getFallbackImage();
                }}
              />
              
              {/* Discount Badge */}
              {product.discount_percentage > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  -{product.discount_percentage}%
                </div>
              )}
              
              {/* Stock Status */}
              {product.stock_quantity === 0 && (
                <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                  Out of Stock
                </div>
              )}
            </div>
            
            <div className="p-3">
              <h4 className="font-medium text-gray-800 text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {product.name}
              </h4>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {/* Rating Stars */}
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(product.average_rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                  <span className="text-xs text-gray-500 ml-1">
                    ({product.review_count || 0})
                  </span>
                </div>
              </div>
              
              <div className="mt-2">
                {product.discount_percentage > 0 ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-red-600">
                      ${(product.price * (1 - product.discount_percentage / 100)).toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ${product.price}
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-gray-800">
                    ${product.price}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* View All Button */}
      <div className="text-center mt-6">
        <Link
          to="/products"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          View All Products
          <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default ProductRecommendations;
