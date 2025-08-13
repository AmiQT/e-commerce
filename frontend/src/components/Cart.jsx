import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';

const Cart = () => {
  const navigate = useNavigate();

  const { cart, updateCartQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useUser();

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
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

    if (cart.length === 0) {
      toast.error('Your cart is empty. Add items before checking out.');
      return;
    }

    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#fcf8f8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-3xl font-bold text-[#1b0e0e] mb-4">Your Cart is Empty</h1>
          <p className="text-[#994d51] text-lg mb-8">Looks like you haven't added any items yet.</p>
          <Link
            to="/products"
            className="bg-[#ea2a33] text-white px-8 py-3 rounded-lg hover:bg-[#d4252e] transition-colors font-medium text-lg"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8f8] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-[#1b0e0e] mb-8 text-center">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-[#f3e7e8] overflow-hidden">
              <div className="p-6 border-b border-[#f3e7e8]">
                <h2 className="text-2xl font-semibold text-[#1b0e0e]">Cart Items ({cart.length})</h2>
              </div>
              
              <div className="divide-y divide-[#f3e7e8]">
                {cart.map((item) => (
                  <div key={item.id} className="p-6 flex items-center space-x-4">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06f2e0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#1b0e0e]">{item.name}</h3>
                      <p className="text-[#994d51] text-sm">${item.price}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-[#f3e7e8] text-[#1b0e0e] hover:bg-[#e8d8d9] transition-colors flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-12 text-center text-[#1b0e0e] font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-[#f3e7e8] text-[#1b0e0e] hover:bg-[#e8d8d9] transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-semibold text-[#ea2a33]">${(item.price * item.quantity).toFixed(2)}</p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#994d51] hover:text-[#ea2a33] transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-[#f3e7e8] p-6 sticky top-8">
              <h2 className="text-2xl font-semibold text-[#1b0e0e] mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-[#1b0e0e]">
                  <span>Subtotal:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#1b0e0e]">
                  <span>Shipping:</span>
                  <span className="text-[#994d51]">Free</span>
                </div>
                <div className="border-t border-[#f3e7e8] pt-4">
                  <div className="flex justify-between text-xl font-bold text-[#1b0e0e]">
                    <span>Total:</span>
                    <span className="text-[#ea2a33]">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleProceedToCheckout}
                disabled={cart.length === 0}
                className="w-full bg-[#ea2a33] text-white py-4 rounded-lg hover:bg-[#d4252e] transition-colors font-medium text-lg disabled:bg-[#f3e7e8] disabled:text-[#994d51] disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>
              
              <div className="mt-4 text-center">
                <Link
                  to="/products"
                  className="text-[#994d51] hover:text-[#ea2a33] transition-colors font-medium"
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
