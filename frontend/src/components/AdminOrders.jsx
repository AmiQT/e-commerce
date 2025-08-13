import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminOrders = () => {
  const { user, token } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    if (user && user.is_admin) {
      fetchOrders();
    }
  }, [user, token]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOrders(response.data.orders || []);
    } catch (err) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`/api/admin/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSelectedOrder(response.data.order);
      setShowOrderDetails(true);
    } catch (err) {
      toast.error('Failed to fetch order details');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to update order status');
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || !user.is_admin) {
    return (
      <div className="min-h-screen bg-[#fcf8f8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-[#1b0e0e] mb-4">Access Denied</h1>
          <p className="text-[#994d51] mb-6">You need administrator privileges to view this page.</p>
          <Link 
            to="/" 
            className="bg-[#ea2a33] text-white px-6 py-3 rounded-lg hover:bg-[#d4252e] transition-colors font-medium"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf8f8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-xl text-[#1b0e0e]">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8f8] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#1b0e0e] mb-2">Order Management</h1>
            <p className="text-xl text-[#994d51]">Track and manage customer orders</p>
          </div>
          <Link 
            to="/admin" 
            className="bg-[#f3e7e8] text-[#1b0e0e] px-4 py-2 rounded-lg hover:bg-[#e8d8d9] transition-colors font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#f3e7e8]">
          <div className="p-6 border-b border-[#f3e7e8]">
            <h2 className="text-xl font-bold text-[#1b0e0e]">All Orders ({orders.length})</h2>
          </div>
          
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f3e7e8] bg-[#fcf8f8]">
                    <th className="text-left py-4 px-6 font-medium text-[#1b0e0e]">Order ID</th>
                    <th className="text-left py-4 px-6 font-medium text-[#1b0e0e]">Customer</th>
                    <th className="text-left py-4 px-6 font-medium text-[#1b0e0e]">Total</th>
                    <th className="text-left py-4 px-6 font-medium text-[#1b0e0e]">Status</th>
                    <th className="text-left py-4 px-6 font-medium text-[#1b0e0e]">Date</th>
                    <th className="text-left py-4 px-6 font-medium text-[#1b0e0e]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-[#f3e7e8] hover:bg-[#fcf8f8]">
                      <td className="py-4 px-6 text-[#1b0e0e] font-medium">#{order.id}</td>
                      <td className="py-4 px-6 text-[#1b0e0e]">
                        <div>
                          <p className="font-medium">{order.customer_name || 'N/A'}</p>
                          <p className="text-sm text-[#994d51]">{order.customer_email || 'No email'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[#1b0e0e] font-medium">
                        ${(parseFloat(order.total) || 0).toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[#994d51]">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => fetchOrderDetails(order.id)}
                            className="text-[#ea2a33] hover:text-[#d4252e] font-medium text-sm"
                          >
                            View Details
                          </button>
                          <select
                            value={order.status || 'pending'}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="text-xs border border-[#f3e7e8] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#ea2a33]"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-[#994d51] mb-4">No orders found</p>
              <p className="text-sm text-[#994d51]">Orders will appear here when customers make purchases</p>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[#f3e7e8]">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-[#1b0e0e]">Order #{selectedOrder.id}</h2>
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="text-[#994d51] hover:text-[#1b0e0e] text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold text-[#1b0e0e] mb-3">Customer Information</h3>
                  <div className="bg-[#fcf8f8] p-4 rounded-lg">
                    <p><span className="font-medium">Name:</span> {selectedOrder.customer_name || 'N/A'}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.customer_email || 'N/A'}</p>
                    <p><span className="font-medium">Phone:</span> {selectedOrder.customer_phone || 'N/A'}</p>
                  </div>
                </div>

                {/* Order Details */}
                <div>
                  <h3 className="text-lg font-semibold text-[#1b0e0e] mb-3">Order Details</h3>
                  <div className="bg-[#fcf8f8] p-4 rounded-lg space-y-2">
                    <p><span className="font-medium">Order Date:</span> {formatDate(selectedOrder.created_at)}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status || 'Pending'}
                      </span>
                    </p>
                    <p><span className="font-medium">Total Amount:</span> ${(parseFloat(selectedOrder.total) || 0).toFixed(2)}</p>
                  </div>
                </div>

                {/* Order Items */}
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#1b0e0e] mb-3">Order Items</h3>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="bg-[#fcf8f8] p-3 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-[#994d51]">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-medium">${(parseFloat(item.price) || 0).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shipping Address */}
                {selectedOrder.shipping_address && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#1b0e0e] mb-3">Shipping Address</h3>
                    <div className="bg-[#fcf8f8] p-4 rounded-lg">
                      <p>{selectedOrder.shipping_address.street}</p>
                      <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip}</p>
                      <p>{selectedOrder.shipping_address.country}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
