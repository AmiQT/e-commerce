import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { buildApiUrl } from '../config/api';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getProductPlaceholder, getFallbackImage } from '../utils/placeholderImage';

const Orders = () => {
  const { user, token } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Ensure orders is always an array
  const safeOrders = Array.isArray(orders) ? orders : [];
  
  console.log('Orders state:', orders);
  console.log('SafeOrders:', safeOrders);
  console.log('SafeOrders length:', safeOrders.length);
  console.log('SafeOrders type:', typeof safeOrders);
  console.log('SafeOrders isArray:', Array.isArray(safeOrders));

  useEffect(() => {
    if (user && token) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders for user:', user?.id);
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      if (!user?.id || !token) {
        console.error('Missing user ID or token');
        setLoading(false);
        return;
      }

      const response = await axios.get(buildApiUrl(`/orders/${user.id}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Orders API response:', response.data);
      console.log('Orders API response type:', typeof response.data);
      console.log('Orders API response isArray:', Array.isArray(response.data));
      console.log('Orders API response keys:', response.data ? Object.keys(response.data) : 'No data');
      console.log('Orders API response length:', response.data ? (Array.isArray(response.data) ? response.data.length : 'Not an array') : 'No data');
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 404) {
        toast.error('Orders not found for this user.');
      } else {
        toast.error('Failed to fetch orders. Please try again.');
      }
      
      setOrders([]);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf8f8] py-4 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-12 sm:h-16 w-12 sm:w-16 border-b-2 border-[#ea2a33]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fcf8f8] py-4 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1b0e0e] mb-3 sm:mb-4">Your Orders</h1>
            <p className="text-base sm:text-lg text-[#994d51] mb-6 sm:mb-8">Please log in to view your orders.</p>
          </div>
        </div>
      </div>
    );
  }

  if (safeOrders.length === 0) {
    return (
      <div className="min-h-screen bg-[#fcf8f8] py-4 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1b0e0e] mb-3 sm:mb-4">Your Orders</h1>
            <p className="text-base sm:text-lg text-[#994d51] mb-6 sm:mb-8">You haven't placed any orders yet.</p>
            <a
              href="/products"
              className="inline-block bg-[#ea2a33] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-[#d4242a] transition-colors font-medium text-base sm:text-lg"
            >
              Start Shopping
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8f8] py-4 sm:py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1b0e0e] mb-2 sm:mb-4">Your Orders</h1>
          <p className="text-base sm:text-lg text-[#994d51]">Track your order history and status</p>
        </div>
        
        <div className="space-y-4 sm:space-y-6">
          {safeOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#1b0e0e]">Order #{order.id}</h3>
                    <p className="text-xs sm:text-sm text-[#994d51]">
                      {new Date(order.created_at).toLocaleDateString()} at{' '}
                      {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                    <p className="text-xs sm:text-sm text-[#994d51]">Status: {order.status || 'Pending'}</p>
                  </div>
                  
                  <div className="text-left sm:text-right">
                    <p className="text-xl sm:text-2xl font-bold text-[#ea2a33]">
                      ${(parseFloat(order.total_amount) || 0).toFixed(2)}
                    </p>
                    <button
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      className="text-[#ea2a33] hover:text-[#d4252e] text-xs sm:text-sm font-medium transition-colors"
                    >
                      {selectedOrder?.id === order.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {Array.isArray(order.items) && order.items.map((item) => (
                    <div key={`${order.id}-${item.product_id}`} className="flex items-center space-x-3 sm:space-x-4">
                      <img
                        src={item.product_image || getProductPlaceholder(item.product_name)}
                        alt={item.product_name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = getFallbackImage();
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-medium text-[#1b0e0e] truncate">{item.product_name}</h4>
                        <p className="text-xs sm:text-sm text-[#994d51]">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm sm:text-base font-medium text-[#1b0e0e]">
                          ${(item.price_at_time * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                    <div>
                      <p className="text-xs sm:text-sm text-[#994d51]">Shipping Address:</p>
                      <p className="text-sm sm:text-base text-[#1b0e0e]">{order.shipping_address || 'Not specified'}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs sm:text-sm text-[#994d51]">Total:</p>
                      <p className="text-xl sm:text-2xl font-bold text-[#ea2a33]">
                        ${(parseFloat(order.total_amount) || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
