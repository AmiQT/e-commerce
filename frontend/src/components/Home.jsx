import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { buildApiUrl } from '../config/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(buildApiUrl('/products'));
        if (response.ok) {
          const data = await response.json();
          setProducts(data.slice(0, 8)); // Show first 8 products
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
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
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Elevate Your Style
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Discover the latest trends and timeless classics to express your unique personality.
          </p>
          <Link
            to="/products"
            className="inline-block bg-[#ea2a33] hover:bg-[#d4252e] text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1b0e0e] mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-[#994d51] max-w-2xl mx-auto">
              Discover our latest fashion arrivals
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ea2a33] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  <div className="aspect-w-1 aspect-h-1 w-full">
                    <img
                      src={product.image_url || 'https://via.placeholder.com/300x300?text=Product'}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-[#1b0e0e] mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-[#ea2a33] font-bold text-xl mb-2">
                      ${product.price}
                    </p>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <Link
                      to={`/products/${product.id}`}
                      className="block w-full bg-[#ea2a33] hover:bg-[#d4252e] text-white text-center py-2 px-4 rounded-lg transition-colors"
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

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1b0e0e] mb-4">
              Why Choose StyleHub?
            </h2>
            <p className="text-lg text-[#994d51] max-w-2xl mx-auto">
              Experience fashion shopping like never before with our innovative features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 bg-white rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[#ea2a33] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1b0e0e] mb-2">Fast Delivery</h3>
              <p className="text-[#994d51]">Get your fashion items delivered to your doorstep in record time</p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 bg-white rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[#ea2a33] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1b0e0e] mb-2">Quality Guarantee</h3>
              <p className="text-[#994d51]">Premium quality fashion items with satisfaction guarantee</p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 bg-white rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[#ea2a33] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1b0e0e] mb-2">AI Recommendations</h3>
              <p className="text-[#994d51]">Smart AI-powered fashion suggestions tailored to your style</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1b0e0e] mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-[#994d51] max-w-2xl mx-auto">
              Explore our curated collections across different fashion categories
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Men's Fashion */}
            <Link to="/products?category=2" className="group">
              <div className="bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-[#1b0e0e] mb-2 group-hover:text-[#ea2a33] transition-colors">
                    Men's Fashion
                  </h3>
                  <p className="text-[#994d51]">Discover men's clothing and accessories</p>
                </div>
              </div>
            </Link>

            {/* Women's Fashion */}
            <Link to="/products?category=3" className="group">
              <div className="bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-[#1b0e0e] mb-2 group-hover:text-[#ea2a33] transition-colors">
                    Women's Fashion
                  </h3>
                  <p className="text-[#994d51]">Explore women's fashion and style</p>
                </div>
              </div>
            </Link>

            {/* Accessories */}
            <Link to="/products?category=4" className="group">
              <div className="bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v.01" />
                  </svg>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-[#1b0e0e] mb-2 group-hover:text-[#ea2a33] transition-colors">
                    Accessories
                  </h3>
                  <p className="text-[#994d51]">Fashion accessories and jewelry</p>
                </div>
              </div>
            </Link>

            {/* Sale Items */}
            <Link to="/products?category=5" className="group">
              <div className="bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-[#1b0e0e] mb-2 group-hover:text-[#ea2a33] transition-colors">
                    Sale Items
                  </h3>
                  <p className="text-[#994d51]">Discounted fashion items</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#ea2a33]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Style?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Join thousands of fashion enthusiasts who trust StyleHub for their style needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-block bg-white text-[#ea2a33] font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Shopping
            </Link>
            <Link
              to="/register"
              className="inline-block border-2 border-white text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-300 hover:bg-white hover:text-[#ea2a33]"
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