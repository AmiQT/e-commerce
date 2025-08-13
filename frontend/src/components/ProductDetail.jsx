import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import ProductReviews from './ProductReviews';
import RelatedProducts from './RelatedProducts';
import ProductRecommendations from './ProductRecommendations';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { addToCart } = useCart();
  const { addToWishlist, token, user } = useUser();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch product details');
      console.error('Error fetching product:', err);
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

  if (!product) return null;

  return (
    <div className="min-h-screen bg-[#fcf8f8] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#f3e7e8]">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06f2e0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8 md:w-1/2 flex flex-col justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#1b0e0e] mb-4">{product.name}</h1>
                <p className="text-[#994d51] mb-6">{product.description}</p>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-4xl font-bold text-[#ea2a33]">${product.price}</span>
                  <span className="text-md text-[#994d51] bg-[#f3e7e8] px-3 py-1 rounded-full">
                    Stock: {product.stock}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label htmlFor="quantity" className="text-lg font-medium text-[#1b0e0e]">Quantity:</label>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    max={product.stock}
                    className="w-20 border border-[#f3e7e8] rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-[#ea2a33]"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => addToCart(product, quantity)}
                    disabled={product.stock === 0}
                    className="flex-1 bg-[#ea2a33] text-white py-3 rounded-lg hover:bg-[#d4252e] transition-colors disabled:bg-[#f3e7e8] disabled:text-[#994d51] disabled:cursor-not-allowed font-medium"
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={() => addToWishlist(product.id)}
                    className="p-3 rounded-lg bg-gray-200 hover:bg-red-100 transition-colors"
                    aria-label="Add to wishlist"
                  >
                    <svg className="w-6 h-6 text-[#ea2a33]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Reviews */}
        <ProductReviews productId={product.id} />

        {/* Product Recommendations */}
        <div className="mt-12">
          <ProductRecommendations 
            userId={user?.id}
            currentProductId={product.id}
            categoryId={product.category_id}
          />
        </div>
        
        {/* Related Products */}
        <div className="mt-8">
          <RelatedProducts productId={product.id} currentProductName={product.name} />
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
