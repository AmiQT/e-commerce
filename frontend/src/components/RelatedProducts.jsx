import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getProductPlaceholder, getFallbackImage } from '../utils/placeholderImage';

const RelatedProducts = ({ productId, currentProductName }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      fetchRelatedProducts();
    }
  }, [productId]);

  const fetchRelatedProducts = async () => {
    try {
      const response = await axios.get(`/api/products/${productId}/related`);
      setRelatedProducts(response.data);
    } catch (err) {
      console.error('Failed to fetch related products:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#f3e7e8]">
        <h2 className="text-2xl font-bold text-[#1b0e0e] mb-6">You Might Also Like</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ea2a33] mx-auto mb-4"></div>
          <p className="text-[#994d51]">Loading related products...</p>
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null; // Don't show component if no related products
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#f3e7e8]">
      <h2 className="text-2xl font-bold text-[#1b0e0e] mb-6">You Might Also Like</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="group block bg-[#fcf8f8] rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-105 border border-[#f3e7e8] hover:border-[#ea2a33]"
          >
            <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
              <img
                src={product.image_url || getProductPlaceholder(product.name)}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = getFallbackImage();
                }}
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-[#1b0e0e] group-hover:text-[#ea2a33] transition-colors line-clamp-2">
                {product.name}
              </h3>
              
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-[#ea2a33]">
                  ${product.price}
                </span>
                <span className="text-xs text-[#994d51] bg-[#f3e7e8] px-2 py-1 rounded-full">
                  {product.category_name}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#994d51]">
                  Stock: {product.stock}
                </span>
                <span className="text-[#ea2a33] font-medium group-hover:underline">
                  View Details →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="text-center mt-8">
        <Link
          to="/products"
          className="inline-flex items-center text-[#ea2a33] hover:text-[#d4252e] font-medium transition-colors"
        >
          <span>View All Products</span>
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default RelatedProducts;
