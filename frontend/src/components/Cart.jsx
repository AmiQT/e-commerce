import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import { getProductPlaceholder, getFallbackImage } from '../utils/placeholderImage';

const Cart = () => {
  const navigate = useNavigate();

  const { cart, updateCartQuantity, removeFromCart, clearCart, clearCorruptedCart } = useCart();
  const { user } = useUser();

  // Ensure cart is always an array
  const safeCart = Array.isArray(cart) ? cart : [];

  // Debug function to show cart data
  const debugCart = () => {
    console.log('Current cart state:', cart);
    console.log('Safe cart:', safeCart);
    console.log('Cart type:', typeof cart);
    console.log('Is array:', Array.isArray(cart));
    console.log('LocalStorage cart:', localStorage.getItem('cart'));
  };

  const calculateTotal = () => {
    console.log('Calculating total for cart:', safeCart);
    const total = safeCart.reduce((total, item) => total + (item.price * item.quantity), 0);
    console.log('Total calculated:', total);
    return total;
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartQuantity(productId, newQuantity);
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      toast.warn('Please log in to proceed to checkout.');
      navigate('/login');
      return;
    }

    if (safeCart.length === 0) {
      toast.error('Your cart is empty. Add items before checking out.');
      return;
    }

    navigate('/checkout');
  };

  if (safeCart.length === 0) {
    return (
      <div className="min-h-screen bg-[#fcf8f8] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1b0e0e] mb-4">Your Cart is Empty</h1>
          <p className="text-[#994d51] text-base sm:text-lg mb-8">Looks like you haven't added any items yet.</p>
          <Link
            to="/products"
            className="inline-block bg-[#ea2a33] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-[#d4252e] transition-colors font-medium text-base sm:text-lg"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8f8] py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1b0e0e] mb-6 sm:mb-8 text-center">
          Shopping Cart
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-[#f3e7e8] overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-[#f3e7e8]">
                <h2 className="text-xl sm:text-2xl font-semibold text-[#1b0e0e]">Cart Items ({safeCart.length})</h2>
              </div>
              
              <div className="divide-y divide-[#f3e7e8]">
                {safeCart.map((item) => (
                  <div key={item.id} className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                      <img
                        src={item.image_url || getProductPlaceholder(item.name)}
                        alt={item.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => {
                          e.target.src = getFallbackImage();
                        }}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-[#1b0e0e] mb-1 sm:mb-2">{item.name}</h3>
                        <p className="text-[#ea2a33] font-bold text-lg sm:text-xl mb-2 sm:mb-3">${item.price}</p>
                        
                        {/* Mobile Quantity Controls */}
                        <div className="sm:hidden flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="text-lg font-medium text-gray-700 min-w-[2rem] text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-2"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Desktop Quantity Controls */}
                        <div className="hidden sm:flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="text-lg font-medium text-gray-700 min-w-[2rem] text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Cart Actions */}
              <div className="p-4 sm:p-6 border-t border-[#f3e7e8] bg-gray-50">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={clearCart}
                    className="flex-1 sm:flex-none bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={debugCart}
                    className="flex-1 sm:flex-none bg-blue-100 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm sm:text-base"
                  >
                    Debug Cart
                  </button>
                  <button
                    onClick={clearCorruptedCart}
                    className="flex-1 sm:flex-none bg-red-100 text-red-700 px-4 py-3 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm sm:text-base"
                  >
                    Clear Corrupted
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-[#f3e7e8] p-4 sm:p-6 sticky top-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#1b0e0e] mb-4 sm:mb-6">Order Summary</h2>
              
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Subtotal ({safeCart.length} items)</span>
                  <span className="font-medium">${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${(calculateTotal() * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 sm:pt-4">
                  <div className="flex justify-between text-lg sm:text-xl font-bold text-[#1b0e0e]">
                    <span>Total</span>
                    <span>${(calculateTotal() * 1.08).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-[#ea2a33] text-white py-3 sm:py-4 px-6 rounded-lg hover:bg-[#d4252e] transition-colors font-semibold text-base sm:text-lg shadow-lg"
              >
                Proceed to Checkout
              </button>
              
              <div className="mt-4 sm:mt-6 text-center">
                <Link
                  to="/products"
                  className="text-[#ea2a33] hover:text-[#d4252e] text-sm sm:text-base font-medium transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
