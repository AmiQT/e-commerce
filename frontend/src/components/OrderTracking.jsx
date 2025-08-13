import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const OrderTracking = ({ orderId }) => {
  const { token } = useUser();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId && token) {
      fetchOrderDetails();
    }
  }, [orderId, token]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`/api/orders/order/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOrder(response.data);
    } catch (err) {
      console.error('Failed to fetch order details:', err);
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return '📋';
    
    switch (status.toLowerCase()) {
      case 'pending':
        return '⏳';
      case 'processing':
        return '⚙️';
      case 'shipped':
        return '📦';
      case 'delivered':
        return '✅';
      case 'cancelled':
        return '❌';
      default:
        return '📋';
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { key: 'pending', label: 'Order Placed', description: 'Your order has been received' },
      { key: 'processing', label: 'Processing', description: 'We\'re preparing your order' },
      { key: 'shipped', label: 'Shipped', description: 'Your order is on its way' },
      { key: 'delivered', label: 'Delivered', description: 'Order completed successfully' }
    ];

    if (!order || !order.status) return steps;

    const currentIndex = steps.findIndex(step => 
      step.key === order.status.toLowerCase()
    );

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ea2a33] mx-auto mb-4"></div>
        <p className="text-[#994d51]">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-[#994d51]">Order not found</p>
      </div>
    );
  }

  const statusSteps = getStatusSteps();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#f3e7e8]">
      {/* Order Header */}
      <div className="border-b border-[#f3e7e8] pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-[#1b0e0e] mb-2">Order #{order.id || 'N/A'}</h2>
            <p className="text-[#994d51]">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
              <span className="mr-2">{getStatusIcon(order.status)}</span>
              {order.status || 'Unknown'}
            </div>
            <p className="text-sm text-[#994d51] mt-1">
              Total: ${order.total_amount || order.total || '0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* Order Timeline */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-[#1b0e0e] mb-4">Order Progress</h3>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#f3e7e8]"></div>
          
          {/* Timeline Steps */}
          <div className="space-y-6">
            {statusSteps.map((step, index) => (
              <div key={step.key} className="relative flex items-start">
                {/* Step Circle */}
                <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step.completed 
                    ? 'bg-[#ea2a33] border-[#ea2a33] text-white' 
                    : 'bg-white border-[#f3e7e8] text-[#994d51]'
                }`}>
                  {step.completed ? (
                    <span className="text-sm">✓</span>
                  ) : (
                    <span className="text-sm">{index + 1}</span>
                  )}
                </div>

                {/* Step Content */}
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-medium ${
                        step.current ? 'text-[#ea2a33]' : 'text-[#1b0e0e]'
                      }`}>
                        {step.label}
                      </h4>
                      <p className="text-sm text-[#994d51] mt-1">
                        {step.description}
                      </p>
                    </div>
                    {step.current && (
                      <span className="text-xs bg-[#ea2a33] text-white px-2 py-1 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Information */}
        <div className="bg-[#fcf8f8] rounded-xl p-4 border border-[#f3e7e8]">
          <h4 className="font-semibold text-[#1b0e0e] mb-3">Shipping Information</h4>
          <div className="space-y-2 text-sm">
            <p className="text-[#1b0e0e]">
              <span className="font-medium">Address:</span> {order.shipping_address || 'Not provided'}
            </p>
            <p className="text-[#1b0e0e]">
              <span className="font-medium">City:</span> {order.shipping_city || 'Not provided'}
            </p>
            <p className="text-[#1b0e0e]">
              <span className="font-medium">Postal Code:</span> {order.shipping_postal_code || 'Not provided'}
            </p>
            <p className="text-[#1b0e0e]">
              <span className="font-medium">Country:</span> {order.shipping_country || 'Not provided'}
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-[#fcf8f8] rounded-xl p-4 border border-[#f3e7e8]">
          <h4 className="font-semibold text-[#1b0e0e] mb-3">Order Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#994d51]">Items:</span>
              <span className="text-[#1b0e0e] font-medium">{order.order_items?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#994d51]">Subtotal:</span>
              <span className="text-[#1b0e0e] font-medium">${order.total_amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#994d51]">Status:</span>
              <span className={`font-medium ${getStatusColor(order.status).split(' ')[1]}`}>
                {order.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#994d51]">Order Date:</span>
              <span className="text-[#1b0e0e] font-medium">
                {formatDate(order.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      {order.order_items && order.order_items.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-[#1b0e0e] mb-3">Order Items</h4>
          <div className="space-y-3">
            {order.order_items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-[#fcf8f8] rounded-lg border border-[#f3e7e8]">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#f3e7e8] rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👗</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#1b0e0e]">{item.product_name || 'Product'}</p>
                    <p className="text-sm text-[#994d51]">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#1b0e0e]">${item.price}</p>
                  <p className="text-sm text-[#994d51]">Total: ${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estimated Delivery */}
      {order.status === 'shipped' && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🚚</span>
            <div>
              <h4 className="font-semibold text-blue-800">Estimated Delivery</h4>
              <p className="text-sm text-blue-600">
                Your order is expected to arrive within 3-5 business days
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contact Support */}
      <div className="mt-6 text-center">
        <p className="text-sm text-[#994d51] mb-2">
          Need help with your order?
        </p>
        <button className="text-[#ea2a33] hover:text-[#d4252e] font-medium text-sm underline">
          Contact Customer Support
        </button>
      </div>
    </div>
  );
};

export default OrderTracking;
