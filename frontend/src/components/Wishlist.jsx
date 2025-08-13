import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Wishlist = () => {
  const { user, wishlist, removeFromWishlist } = useUser();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    console.log('Wishlist data:', wishlist);
  }, [wishlist]);

  const handleRemoveFromWishlist = async (wishlistItemId) => {
    try {
      const success = await removeFromWishlist(wishlistItemId);
      if (success) {
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = (product) => {
    try {
      addToCart(product, 1);
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ea2a33]"></div>
      </div>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Wishlist</h1>
          <p className="text-gray-600 mb-8">Your wishlist is empty. Start adding products you love!</p>
          <a
            href="/products"
            className="inline-block bg-[#ea2a33] text-white px-6 py-3 rounded-lg hover:bg-[#d4242a] transition-colors"
          >
            Browse Products
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Wishlist</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-w-1 aspect-h-1 w-full">
              <img
                src={item.image_url || '/placeholder-product.jpg'}
                alt={item.name || 'Product'}
                className="w-full h-48 object-cover"
              />
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.name || 'Product Name'}
              </h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {item.description || 'No description available'}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-[#ea2a33]">
                  ${(parseFloat(item.price) || 0).toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                  Stock: {item.stock || 0}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAddToCart(item)}
                  className="flex-1 bg-[#ea2a33] text-white py-2 px-4 rounded-md hover:bg-[#d4242a] transition-colors text-sm font-medium"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    const idToRemove = item.wishlist_id || item.id;
                    console.log('Removing item with ID:', idToRemove, 'Item:', item);
                    handleRemoveFromWishlist(idToRemove);
                  }}
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
