import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import ProductReviews from './ProductReviews';
import RelatedProducts from './RelatedProducts';
import ProductRecommendations from './ProductRecommendations';
import { toast } from 'react-toastify';
import { getProductPlaceholder, getFallbackImage } from '../utils/placeholderImage';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { addToCart } = useCart();
  const { addToWishlist, token, user } = useUser();

  // Debug logging
  console.log('ProductDetail rendered with params:', useParams());
  console.log('ProductDetail rendered with id:', id);
  console.log('Current window location:', window.location.href);

  useEffect(() => {
    console.log('ProductDetail useEffect triggered with id:', id);
    if (id) {
      fetchProduct();
    } else {
      console.error('ProductDetail: No ID found in params');
      setError('Product ID is missing from URL');
      setLoading(false);
    }
  }, [id]);

  const fetchProduct = async () => {
    if (!id) {
      setError('Product ID is required');
      setLoading(false);
      return;
    }
    
    console.log('Fetching product with ID:', id);
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching product with ID:', id, err);
      if (err.response?.status === 500) {
        setError(`Server error: Unable to fetch product details. Please try again.`);
      } else if (err.response?.status === 404) {
        setError('Product not found. It may have been removed or the link is invalid.');
      } else {
        setError('Failed to fetch product details. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.stock) {
      setQuantity(value);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf8f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ea2a33] mx-auto mb-4"></div>
          <p className="text-xl text-[#1b0e0e]">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fcf8f8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#ea2a33] text-xl mb-4">{error}</p>
          <button
            onClick={fetchProduct}
            className="bg-[#ea2a33] text-white px-6 py-3 rounded-lg hover:bg-[#d4252e] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-[#fcf8f8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-[#1b0e0e] mb-4">Routing Issue Detected</h2>
          <p className="text-[#994d51] mb-2">Product ID is missing from URL</p>
          <p className="text-[#994d51] mb-4">Current URL: {window.location.href}</p>
          <p className="text-[#994d51] mb-6">This suggests a navigation or routing problem.</p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Debug Info:</p>
            <p>useParams(): {JSON.stringify(useParams())}</p>
            <p>ID from params: {id}</p>
          </div>
          <Link 
            to="/products" 
            className="bg-[#ea2a33] text-white px-6 py-3 rounded-lg hover:bg-[#d4252e] transition-colors mt-4 inline-block"
          >
            Go to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#fcf8f8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-[#1b0e0e] mb-4">Product not found</p>
          <p className="text-[#994d51] mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/products" 
            className="bg-[#ea2a33] text-white px-6 py-3 rounded-lg hover:bg-[#d4252e] transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8f8] py-4 sm:py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="order-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#f3e7e8] p-4 sm:p-6">
              <img
                src={product.image_url || getProductPlaceholder(product.name)}
                alt={product.name}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = getFallbackImage();
                }}
              />
            </div>
          </div>

          {/* Product Information */}
          <div className="order-2">
            <div className="bg-white rounded-2xl shadow-lg border border-[#f3e7e8] p-4 sm:p-6 lg:p-8">
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1b0e0e] mb-3 sm:mb-4">{product.name}</h1>
                <p className="text-[#994d51] text-base sm:text-lg mb-4 sm:mb-6">{product.description}</p>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <span className="text-3xl sm:text-4xl font-bold text-[#ea2a33]">${product.price}</span>
                  <span className="text-sm sm:text-base text-[#994d51] bg-[#f3e7e8] px-3 py-2 rounded-full w-fit">
                    Stock: {product.stock}
                  </span>
                </div>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <label htmlFor="quantity" className="text-base sm:text-lg font-medium text-[#1b0e0e]">Quantity:</label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      value={quantity}
                      onChange={handleQuantityChange}
                      min="1"
                      max={product.stock}
                      className="w-16 sm:w-20 px-2 sm:px-3 py-2 text-center border border-[#f3e7e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => addToCart(product, quantity)}
                    disabled={product.stock === 0}
                    className="flex-1 bg-[#ea2a33] text-white py-3 sm:py-4 px-6 rounded-lg hover:bg-[#d4252e] transition-colors disabled:bg-[#f3e7e8] disabled:text-[#994d51] disabled:cursor-not-allowed font-semibold text-base sm:text-lg"
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={() => addToWishlist(product.id)}
                    className="px-4 py-3 sm:py-4 rounded-lg bg-gray-200 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    aria-label="Add to wishlist"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#ea2a33]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                    <span className="text-sm sm:text-base font-medium text-gray-700">Wishlist</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional Sections */}
        <div className="mt-8 sm:mt-12 space-y-6 sm:space-y-8">
          {/* Product Reviews */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#f3e7e8] p-4 sm:p-6 lg:p-8">
            <ProductReviews productId={product.id} />
          </div>

          {/* Product Recommendations */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#f3e7e8] p-4 sm:p-6 lg:p-8">
            <ProductRecommendations 
              userId={user?.id}
              currentProductId={product.id}
              categoryId={product.category_id}
            />
          </div>
          
          {/* Related Products */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#f3e7e8] p-4 sm:p-6 lg:p-8">
            <RelatedProducts productId={product.id} currentProductName={product.name} />
          </div>
        </div>
        
        <div className="text-center mt-8">
          <Link to="/products" className="text-[#ea2a33] hover:underline font-medium">
            &larr; Back to Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
