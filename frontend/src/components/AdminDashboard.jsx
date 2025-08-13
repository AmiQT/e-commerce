import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, token } = useUser();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalCategories: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.is_admin) {
      fetchDashboardData();
    }
  }, [user, token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard statistics
      const statsResponse = await axios.get('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch recent orders
      const ordersResponse = await axios.get('/api/admin/recent-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setStats(statsResponse.data);
      
      setRecentOrders(ordersResponse.data.orders || []);
    } catch (err) {
      toast.error('Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
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
          <p className="text-xl text-[#1b0e0e]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8f8] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1b0e0e] mb-2">Admin Dashboard</h1>
          <p className="text-xl text-[#994d51]">Welcome back, {user.first_name || 'Administrator'}! 👋</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link 
            to="/admin/products" 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 border border-[#f3e7e8]"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">📦</div>
              <h3 className="text-lg font-semibold text-[#1b0e0e] mb-2">Manage Products</h3>
              <p className="text-[#994d51] text-sm">Add, edit, or remove products</p>
            </div>
          </Link>

          <Link 
            to="/admin/categories" 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 border border-[#f3e7e8]"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">🏷️</div>
              <h3 className="text-lg font-semibold text-[#1b0e0e] mb-2">Manage Categories</h3>
              <p className="text-[#994d51] text-sm">Organize your product catalog</p>
            </div>
          </Link>

          <Link 
            to="/admin/orders" 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 border border-[#f3e7e8]"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-lg font-semibold text-[#1b0e0e] mb-2">View Orders</h3>
              <p className="text-[#994d51] text-sm">Track and manage customer orders</p>
            </div>
          </Link>

                      <Link
              to="/admin/analytics"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 border border-[#f3e7e8]"
            >
              <div className="text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-lg font-semibold text-[#1b0e0e] mb-2">Analytics</h3>
                <p className="text-[#994d51] text-sm">View business insights & reports</p>
              </div>
            </Link>
            <Link
              to="/admin/advanced-analytics"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 border border-[#f3e7e8]"
            >
              <div className="text-center">
                <div className="text-4xl mb-3">🧠</div>
                <h3 className="text-lg font-semibold text-[#1b0e0e] mb-2">Advanced Analytics</h3>
                <p className="text-[#994d51] text-sm">AI-powered business intelligence</p>
              </div>
            </Link>
            <Link
              to="/admin/b2b-portal"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 border border-[#f3e7e8]"
            >
              <div className="text-center">
                <div className="text-4xl mb-3">🏢</div>
                <h3 className="text-lg font-semibold text-[#1b0e0e] mb-2">B2B Portal</h3>
                <p className="text-[#994d51] text-sm">Enterprise & wholesale management</p>
              </div>
            </Link>
            <Link
              to="/admin/performance"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 border border-[#f3e7e8]"
            >
              <div className="text-center">
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="text-lg font-semibold text-[#1b0e0e] mb-2">Performance</h3>
                <p className="text-[#994d51] text-sm">System monitoring & optimization</p>
              </div>
            </Link>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Management */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#f3e7e8]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1b0e0e]">Product Management</h2>
              <Link 
                to="/admin/products" 
                className="text-[#ea2a33] hover:text-[#d4252e] font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              <Link 
                to="/admin/products/new" 
                className="flex items-center justify-between p-3 bg-[#fcf8f8] rounded-lg hover:bg-[#f3e7e8] transition-colors"
              >
                <span className="text-[#1b0e0e]">➕ Add New Product</span>
                <span className="text-[#994d51]">→</span>
              </Link>
              <Link 
                to="/admin/products" 
                className="flex items-center justify-between p-3 bg-[#fcf8f8] rounded-lg hover:bg-[#f3e7e8] transition-colors"
              >
                <span className="text-[#1b0e0e]">✏️ Edit Products</span>
                <span className="text-[#994d51]">→</span>
              </Link>
              <Link 
                to="/admin/products" 
                className="flex items-center justify-between p-3 bg-[#fcf8f8] rounded-lg hover:bg-[#f3e7e8] transition-colors"
              >
                <span className="text-[#1b0e0e]">🗑️ Manage Inventory</span>
                <span className="text-[#994d51]">→</span>
              </Link>
            </div>
          </div>

          {/* Category Management */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#f3e7e8]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1b0e0e]">Category Management</h2>
              <Link 
                to="/admin/categories" 
                className="text-[#ea2a33] hover:text-[#d4252e] font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              <Link 
                to="/admin/categories/new" 
                className="flex items-center justify-between p-3 bg-[#fcf8f8] rounded-lg hover:bg-[#f3e7e8] transition-colors"
              >
                <span className="text-[#1b0e0e]">➕ Add New Category</span>
                <span className="text-[#994d51]">→</span>
              </Link>
              <Link 
                to="/admin/categories" 
                className="flex items-center justify-between p-3 bg-[#fcf8f8] rounded-lg hover:bg-[#f3e7e8] transition-colors"
              >
                <span className="text-[#1b0e0e]">✏️ Edit Categories</span>
                <span className="text-[#994d51]">→</span>
              </Link>
              <Link 
                to="/admin/categories" 
                className="flex items-center justify-between p-3 bg-[#fcf8f8] rounded-lg hover:bg-[#f3e7e8] transition-colors"
              >
                <span className="text-[#1b0e0e]">📊 Category Analytics</span>
                <span className="text-[#994d51]">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#f3e7e8]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1b0e0e]">Recent Orders</h2>
            <Link 
              to="/admin/orders" 
              className="text-[#ea2a33] hover:text-[#d4252e] font-medium"
            >
              View All Orders →
            </Link>
          </div>
          
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f3e7e8]">
                    <th className="text-left py-3 px-4 font-medium text-[#1b0e0e]">Order ID</th>
                    <th className="text-left py-3 px-4 font-medium text-[#1b0e0e]">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-[#1b0e0e]">Total</th>
                    <th className="text-left py-3 px-4 font-medium text-[#1b0e0e]">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-[#1b0e0e]">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    // Ensure order has required properties
                    const orderId = order?.id || 'N/A';
                    const customerName = order?.customer_name || 'N/A';
                    const totalAmount = parseFloat(order?.total_amount || order?.total || 0) || 0;
                    const status = order?.status || 'Pending';
                    const createdAt = order?.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A';
                    
                    return (
                      <tr key={orderId} className="border-b border-[#f3e7e8] hover:bg-[#fcf8f8]">
                        <td className="py-3 px-4 text-[#1b0e0e] font-medium">#{orderId}</td>
                        <td className="py-3 px-4 text-[#1b0e0e]">{customerName}</td>
                        <td className="py-3 px-4 text-[#1b0e0e]">${totalAmount.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(status)}`}>
                            {status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#994d51]">
                          {createdAt}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-[#994d51]">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
