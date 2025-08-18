import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { getProductPlaceholder, getFallbackImage } from '../utils/placeholderImage';

const Wishlist = () => {
  const { user, wishlist, removeFromWishlist } = useUser();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);

  // Ensure wishlist is always an array
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];

  useEffect(() => {
    setLoading(false);
    console.log('Wishlist data:', wishlist);
    if (wishlist && wishlist.length > 0) {
      console.log('First wishlist item structure:', wishlist[0]);
      console.log('Available keys:', Object.keys(wishlist[0]));
      console.log('First item ID:', wishlist[0].id);
      console.log('First item product_id:', wishlist[0].product_id);
    }
  }, [wishlist]);

  const handleRemoveFromWishlist = async (wishlistItemId) => {
    try {
      await removeFromWishlist(wishlistItemId);
      toast.success('Item removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove item from wishlist');
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleAddToCart = (item) => {
    addToCart(item);
    toast.success(`${item.name} added to cart!`);
  };

    if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf8f8] py-4 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/3 mb-6 sm:mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-3 sm:p-4">
                  <div className="h-48 sm:h-56 bg-gray-200 rounded mb-3 sm:mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8f8] py-4 sm:py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1b0e0e] mb-2 sm:mb-4">Your Wishlist</h1>
          <p className="text-base sm:text-lg text-[#994d51]">Save your favorite items for later</p>
        </div>
        
        {safeWishlist.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-5xl sm:text-6xl mb-4">💝</div>
            <h3 className="text-xl sm:text-2xl font-semibold text-[#1b0e0e] mb-2 sm:mb-4">Your Wishlist is Empty</h3>
            <p className="text-base sm:text-lg text-[#994d51] mb-6 sm:mb-8">Start adding items you love to your wishlist</p>
            <Link
              to="/products"
              className="inline-block bg-[#ea2a33] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-[#d4252e] transition-colors font-medium text-base sm:text-lg"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {safeWishlist.map((item) => {
              // Skip items without valid product ID
              if (!item.id) {
                console.warn('Wishlist item missing product ID:', item);
                return null;
              }
              
              return (
                <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <Link 
                  to={`/products/${item.id}`} 
                  className="block"
                  onClick={() => {
                    console.log('Clicking on product with ID:', item.id);
                    console.log('Navigating to:', `/products/${item.id}`);
                  }}
                >
                  <div className="aspect-w-1 aspect-h-1 w-full cursor-pointer">
                    <img
                      src={item.image_url || getProductPlaceholder(item.name || 'Product')}
                      alt={item.name || 'Product'}
                      className="w-full h-48 sm:h-56 object-cover hover:opacity-90 transition-opacity"
                      onError={(e) => {
                        e.target.src = getFallbackImage();
                      }}
                    />
                  </div>
                </Link>
                
                <div className="p-3 sm:p-4">
                  <Link 
                    to={`/products/${item.id}`} 
                    className="block"
                    onClick={() => {
                      console.log('Clicking on product title with ID:', item.id);
                    }}
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-[#1b0e0e] mb-2 hover:text-[#ea2a33] transition-colors cursor-pointer line-clamp-2">
                      {item.name || 'Product Name'}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                    {item.description || 'No description available'}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                    <span className="text-xl sm:text-2xl font-bold text-[#ea2a33]">
                      ${(parseFloat(item.price) || 0).toFixed(2)}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full w-fit">
                      Stock: {item.stock || 0}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Link
                      to={`/products/${item.id}`}
                      className="flex-1 bg-blue-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium text-center"
                      onClick={() => {
                        console.log('Clicking on View Details with ID:', item.id);
                      }}
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 bg-[#ea2a33] text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-[#d4242a] transition-colors text-xs sm:text-sm font-medium"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => {
                        const idToRemove = item.wishlist_id || item.id;
                        console.log('Removing item with ID:', idToRemove, 'Item:', item);
                        handleRemoveFromWishlist(idToRemove);
                      }}
                      className="bg-gray-200 text-gray-700 py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-gray-300 transition-colors text-xs sm:text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
