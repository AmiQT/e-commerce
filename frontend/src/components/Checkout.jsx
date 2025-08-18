import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { buildApiUrl } from '../config/api';
import { toast } from 'react-toastify';
import axios from 'axios';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user, token } = useUser();
  const navigate = useNavigate();

  // Ensure cart is always an array
  const safeCart = Array.isArray(cart) ? cart : [];

  const [formData, setFormData] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountError, setDiscountError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setValidationErrors({
      ...validationErrors,
      [e.target.name]: null,
    });
  };

  const handleDiscountApply = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code');
      return;
    }

    try {
      const response = await axios.post('/api/discounts/validate', {
        code: discountCode,
        orderAmount: safeCart.reduce((total, item) => total + (item.price * item.quantity), 0)
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.valid) {
        setDiscountApplied(true);
        setDiscountAmount(response.data.discountAmount);
        setDiscountError('');
        toast.success('Discount code applied successfully!');
      } else {
        setDiscountError(response.data.message || 'Invalid discount code');
        setDiscountApplied(false);
        setDiscountAmount(0);
      }
    } catch (error) {
      setDiscountError('Failed to apply discount code');
      setDiscountApplied(false);
      setDiscountAmount(0);
    }
  };

  const handleDiscountRemove = () => {
    setDiscountCode('');
    setDiscountApplied(false);
    setDiscountAmount(0);
    setDiscountError('');
  };

  const calculateTotal = () => {
    const subtotal = safeCart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = 0; // Free shipping
    const total = subtotal + shipping - discountAmount;
    return total;
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.address) errors.address = 'Address is required.';
    if (!formData.city) errors.city = 'City is required.';
    if (!formData.postalCode) errors.postalCode = 'Postal Code is required.';
    if (!formData.country) errors.country = 'Country is required.';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (safeCart.length === 0) {
      toast.error('Your cart is empty. Please add items before checking out.');
      navigate('/cart');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        user_id: user.id,
        total_amount: calculateTotal(),
        shipping_address: `${formData.address}, ${formData.city}, ${formData.postalCode}, ${formData.country}`,
        items: safeCart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price_at_time: item.price,
        })),
      };

      console.log('Creating order with data:', orderData);
      console.log('Using token:', token ? 'Token exists' : 'No token');

      const response = await axios.post(buildApiUrl('/orders'), orderData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Order created successfully:', response.data);

      if (response.status === 201) {
        toast.success('Order placed successfully!');
        clearCart();
        navigate(`/order-confirmation/${response.data.orderId}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
      console.error('Error placing order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      toast.warn('Please log in to proceed to checkout.');
      navigate('/login');
      return;
    }

    if (safeCart.length === 0) {
      toast.warn('Your cart is empty. Redirecting to cart.');
      navigate('/cart');
      return;
    }
  }, [user, safeCart.length, navigate]);

  if (!user || safeCart.length === 0) {
    return (
      <div className="min-h-screen bg-[#fcf8f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ea2a33] mx-auto mb-4"></div>
          <p className="text-xl text-[#1b0e0e]">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8f8] py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1b0e0e] mb-6 sm:mb-8 text-center">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Shipping Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-[#f3e7e8] p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#1b0e0e] mb-4 sm:mb-6">Shipping Information</h2>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-[#1b0e0e] mb-2">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`w-full px-3 sm:px-4 py-3 text-base border ${validationErrors.address ? 'border-red-500' : 'border-[#f3e7e8]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent`}
                placeholder="123 Main St"
              />
              {validationErrors.address && <p className="mt-1 text-sm text-red-500">{validationErrors.address}</p>}
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-[#1b0e0e] mb-2">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`w-full px-3 sm:px-4 py-3 text-base border ${validationErrors.city ? 'border-red-500' : 'border-[#f3e7e8]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent`}
                placeholder="Anytown"
              />
              {validationErrors.city && <p className="mt-1 text-sm text-red-500">{validationErrors.city}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-[#1b0e0e] mb-2">Postal Code</label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-3 text-base border ${validationErrors.postalCode ? 'border-red-500' : 'border-[#f3e7e8]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent`}
                  placeholder="12345"
                />
                {validationErrors.postalCode && <p className="mt-1 text-sm text-red-500">{validationErrors.postalCode}</p>}
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-[#1b0e0e] mb-2">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-3 text-base border ${validationErrors.country ? 'border-red-500' : 'border-[#f3e7e8]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent`}
                  placeholder="USA"
                />
                {validationErrors.country && <p className="mt-1 text-sm text-red-500">{validationErrors.country}</p>}
              </div>
            </div>

                {/* Discount Code Section */}
                <div className="border-t border-[#f3e7e8] pt-4 sm:pt-6 mt-4 sm:mt-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-[#1b0e0e] mb-3 sm:mb-4">Discount Code</h2>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-end">
                <div className="flex-1">
                  <label htmlFor="discountCode" className="block text-sm font-medium text-[#1b0e0e] mb-2">Enter discount code</label>
                  <input
                    type="text"
                    id="discountCode"
                    name="discountCode"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className={`w-full px-3 sm:px-4 py-3 text-base border ${discountError ? 'border-red-500' : 'border-[#f3e7e8]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent`}
                    placeholder="Enter discount code"
                    disabled={discountApplied}
                  />
                  {discountError && <p className="mt-1 text-sm text-red-500">{discountError}</p>}
                </div>
                {!discountApplied ? (
                  <button
                    type="button"
                    onClick={handleDiscountApply}
                    className="bg-[#ea2a33] text-white py-3 px-4 rounded-lg hover:bg-[#d4252e] transition-colors font-medium text-lg disabled:bg-[#f3e7e8] disabled:text-[#994d51] disabled:cursor-not-allowed"
                    disabled={!discountCode.trim()}
                  >
                    Apply
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDiscountRemove}
                    className="bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium text-lg"
                  >
                    Remove
                  </button>
                )}
              </div>
              {discountApplied && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">
                    ✅ Discount applied: -${discountAmount.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

                <button
                  type="submit"
                  disabled={loading || safeCart.length === 0}
                  className="w-full bg-[#ea2a33] text-white py-3 sm:py-4 rounded-lg hover:bg-[#d4252e] transition-colors font-semibold text-base sm:text-lg disabled:bg-[#f3e7e8] disabled:text-[#994d51] disabled:cursor-not-allowed"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-[#f3e7e8] p-4 sm:p-6 sticky top-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#1b0e0e] mb-4 sm:mb-6">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-6">
                {safeCart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image_url || '/placeholder-product.jpg'}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-[#1b0e0e] truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-[#1b0e0e]">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Summary Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Subtotal ({safeCart.length} items)</span>
                  <span className="font-medium">${safeCart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600 font-medium">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg sm:text-xl font-bold text-[#1b0e0e]">
                    <span>Total</span>
                    <span className="text-[#ea2a33]">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;