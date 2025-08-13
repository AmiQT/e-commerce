import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import OrderTracking from './OrderTracking';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingOrderId, setTrackingOrderId] = useState(null);

  const { user, token } = useUser();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3001/api/orders/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setOrders(response.data);
    } catch (err) {
      toast.error('Failed to fetch orders.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf8f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ea2a33] mx-auto mb-4"></div>
          <p className="text-xl text-[#1b0e0e]">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#fcf8f8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h1 className="text-3xl font-bold text-[#1b0e0e] mb-4">No Orders Yet</h1>
          <p className="text-[#994d51] text-lg mb-8">Start shopping to see your order history here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8f8] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-[#1b0e0e] mb-8 text-center">Your Orders</h1>
        
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-lg border border-[#f3e7e8] overflow-hidden">
              <div className="p-6 border-b border-[#f3e7e8] bg-[#fcf8f8]">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-[#1b0e0e]">Order #{order.id}</h2>
                    <p className="text-[#994d51] text-sm">
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#ea2a33]">${order.total_amount}</p>
                    <p className="text-[#994d51] text-sm">
                      {order.items?.length || 0} items
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#1b0e0e]">Order Items</h3>
                  <button
                    onClick={() => setTrackingOrderId(trackingOrderId === order.id ? null : order.id)}
                    className="bg-[#ea2a33] text-white px-4 py-2 rounded-lg hover:bg-[#d4252e] transition-colors text-sm font-medium"
                  >
                    {trackingOrderId === order.id ? 'Hide Tracking' : 'Track Order'}
                  </button>
                </div>
                
                {/* Order Tracking */}
                {trackingOrderId === order.id && (
                  <div className="mb-6">
                    <OrderTracking orderId={order.id} />
                  </div>
                )}
                
                <div className="space-y-4">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-[#fcf8f8] rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-[#1b0e0e]">{item.product_name || `Product ${item.product_id}`}</h4>
                        <p className="text-[#994d51] text-sm">
                          Quantity: {item.quantity} × ${item.price_at_time}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#1b0e0e]">
                          ${(item.quantity * item.price_at_time).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
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
