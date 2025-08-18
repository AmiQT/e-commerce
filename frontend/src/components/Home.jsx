import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { buildApiUrl } from '../config/api';
import { getProductPlaceholder, getFallbackImage } from '../utils/placeholderImage';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : [];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(buildApiUrl('/products'));
        if (response.ok) {
          const data = await response.json();
          // Ensure data is an array before setting
          const productsArray = Array.isArray(data) ? data : [];
          setProducts(productsArray.slice(0, 8)); // Show first 8 products
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] sm:h-[70vh] lg:h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Elevate Your Style
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-gray-200 max-w-2xl mx-auto px-4">
            Discover the latest trends and timeless classics to express your unique personality.
          </p>
          <Link
            to="/products"
            className="inline-block bg-[#ea2a33] hover:bg-[#d4252e] text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg w-full sm:w-auto max-w-xs sm:max-w-none"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1b0e0e] mb-3 sm:mb-4">
              Featured Products
            </h2>
            <p className="text-base sm:text-lg text-[#994d51] max-w-2xl mx-auto px-4">
              Discover our latest fashion arrivals
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ea2a33] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : safeProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {safeProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  <div className="aspect-w-1 aspect-h-1 w-full">
                    <img
                      src={product.image_url || getProductPlaceholder(product.name)}
                      alt={product.name}
                      className="w-full h-48 sm:h-56 object-cover"
                      onError={(e) => {
                        e.target.src = getFallbackImage();
                      }}
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-semibold text-[#1b0e0e] mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-[#ea2a33] font-bold text-lg sm:text-xl mb-2">
                      ${product.price}
                    </p>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description || 'Discover this amazing product from our collection.'}
                    </p>
                    <Link
                      to={`/products/${product.id}`}
                      className="block w-full bg-[#ea2a33] text-white text-center py-2 sm:py-3 px-4 rounded-lg hover:bg-[#d4252e] transition-colors font-medium text-sm sm:text-base"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1b0e0e] mb-3 sm:mb-4">
              Shop by Category
            </h2>
            <p className="text-base sm:text-lg text-[#994d51] max-w-2xl mx-auto px-4">
              Explore our curated collections
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { name: 'New Arrivals', icon: '🆕', slug: 'new-arrivals', color: 'bg-blue-100' },
              { name: 'Men', icon: '👔', slug: 'men', color: 'bg-green-100' },
              { name: 'Women', icon: '👗', slug: 'women', color: 'bg-pink-100' },
              { name: 'Accessories', icon: '👜', slug: 'accessories', color: 'bg-purple-100' },
              { name: 'Sale', icon: '🏷️', slug: 'sale', color: 'bg-red-100' },
              { name: 'Trending', icon: '🔥', slug: 'trending', color: 'bg-orange-100' }
            ].map((category, index) => (
              <Link
                key={index}
                to={`/category/${category.slug}`}
                className={`${category.color} rounded-xl p-4 sm:p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
              >
                <div className="text-3xl sm:text-4xl mb-3">{category.icon}</div>
                <h3 className="text-sm sm:text-base font-semibold text-[#1b0e0e]">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-[#1b0e0e]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to Transform Your Style?
          </h2>
          <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join thousands of fashion enthusiasts who trust StyleHub for their style needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="bg-[#ea2a33] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-[#d4252e] transition-colors text-base sm:text-lg"
            >
              Browse Collection
            </Link>
            <Link
              to="/register"
              className="bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-white hover:text-[#1b0e0e] transition-colors text-base sm:text-lg"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;