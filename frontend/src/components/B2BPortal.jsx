import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const B2BPortal = () => {
  const { user, token } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [b2bData, setB2bData] = useState({
    corporateAccounts: [],
    wholesaleProducts: [],
    bulkOrders: [],
    supplierInfo: [],
    bulkOperations: {
      importHistory: [],
      exportHistory: []
    }
  });

  useEffect(() => {
    if (user && user.is_admin) {
      fetchB2BData();
    }
  }, [user, token]);

  const fetchB2BData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/b2b/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setB2bData(response.data);
    } catch (error) {
      console.error('Error fetching B2B data:', error);
      // Use mock data for demonstration
      setB2bData(getMockB2BData());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockB2BData = () => ({
    corporateAccounts: [
      {
        id: 1,
        companyName: 'TechCorp Solutions',
        contactPerson: 'John Smith',
        email: 'john@techcorp.com',
        phone: '+1-555-0123',
        accountType: 'Enterprise',
        creditLimit: 50000,
        paymentTerms: 'Net 30',
        totalOrders: 45,
        totalSpent: 125000,
        status: 'active'
      },
      {
        id: 2,
        companyName: 'Global Retail Inc',
        contactPerson: 'Sarah Johnson',
        email: 'sarah@globalretail.com',
        phone: '+1-555-0456',
        accountType: 'Wholesale',
        creditLimit: 25000,
        paymentTerms: 'Net 15',
        totalOrders: 23,
        totalSpent: 67000,
        status: 'active'
      },
      {
        id: 3,
        companyName: 'Startup Innovations',
        contactPerson: 'Mike Chen',
        email: 'mike@startupinnov.com',
        phone: '+1-555-0789',
        accountType: 'Startup',
        creditLimit: 10000,
        paymentTerms: 'Net 30',
        totalOrders: 12,
        totalSpent: 18000,
        status: 'pending'
      }
    ],
    wholesaleProducts: [
      {
        id: 1,
        name: 'Laptop Pro - Enterprise Edition',
        sku: 'LP-ENT-001',
        regularPrice: 1299,
        wholesalePrice: 999,
        bulkDiscounts: [
          { minQty: 10, discount: 0.15 },
          { minQty: 25, discount: 0.20 },
          { minQty: 50, discount: 0.25 }
        ],
        stock: 150,
        category: 'Computers'
      },
      {
        id: 2,
        name: 'Wireless Headphones - Pro',
        sku: 'WH-PRO-002',
        regularPrice: 299,
        wholesalePrice: 199,
        bulkDiscounts: [
          { minQty: 20, discount: 0.20 },
          { minQty: 50, discount: 0.25 },
          { minQty: 100, discount: 0.30 }
        ],
        stock: 300,
        category: 'Audio'
      },
      {
        id: 3,
        name: 'Smart Watch - Business',
        sku: 'SW-BIZ-003',
        regularPrice: 399,
        wholesalePrice: 299,
        bulkDiscounts: [
          { minQty: 15, discount: 0.18 },
          { minQty: 30, discount: 0.22 },
          { minQty: 60, discount: 0.28 }
        ],
        stock: 200,
        category: 'Wearables'
      }
    ],
    bulkOrders: [
      {
        id: 1,
        companyName: 'TechCorp Solutions',
        orderDate: '2024-01-15',
        totalAmount: 25000,
        items: 45,
        status: 'processing',
        expectedDelivery: '2024-01-25'
      },
      {
        id: 2,
        companyName: 'Global Retail Inc',
        orderDate: '2024-01-12',
        totalAmount: 15000,
        items: 28,
        status: 'shipped',
        expectedDelivery: '2024-01-20'
      },
      {
        id: 3,
        companyName: 'Startup Innovations',
        orderDate: '2024-01-10',
        totalAmount: 8000,
        items: 15,
        status: 'delivered',
        expectedDelivery: '2024-01-18'
      }
    ],
    supplierInfo: [
      {
        id: 1,
        name: 'TechParts Manufacturing',
        contact: 'David Wilson',
        email: 'david@techparts.com',
        phone: '+1-555-1111',
        products: ['Laptops', 'Components'],
        leadTime: '14 days',
        paymentTerms: 'Net 45',
        rating: 4.8
      },
      {
        id: 2,
        name: 'AudioTech Solutions',
        contact: 'Lisa Brown',
        email: 'lisa@audiotech.com',
        phone: '+1-555-2222',
        products: ['Headphones', 'Speakers'],
        leadTime: '7 days',
        paymentTerms: 'Net 30',
        rating: 4.6
      }
    ],
    bulkOperations: {
      importHistory: [
        {
          id: 1,
          filename: 'products_bulk_import_2024_01.csv',
          date: '2024-01-15',
          records: 150,
          status: 'completed',
          errors: 0
        },
        {
          id: 2,
          filename: 'inventory_update_2024_01.csv',
          date: '2024-01-10',
          records: 89,
          status: 'completed',
          errors: 2
        }
      ],
      exportHistory: [
        {
          id: 1,
          filename: 'sales_report_2024_01.csv',
          date: '2024-01-16',
          records: 234,
          type: 'Sales Data'
        },
        {
          id: 2,
          filename: 'customer_list_2024_01.csv',
          date: '2024-01-14',
          records: 567,
          type: 'Customer Data'
        }
      ]
    }
  });

  const handleBulkImport = async (file) => {
    if (!file) return;
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await axios.post('http://localhost:3001/api/b2b/bulk-import', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Bulk import started successfully!');
      fetchB2BData();
    } catch (error) {
      console.error('Bulk import error:', error);
      toast.error('Failed to start bulk import');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkExport = async (type) => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/b2b/bulk-export', 
        { type },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success(`${type} export completed!`);
    } catch (error) {
      console.error('Bulk export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || !user.is_admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need administrator privileges to view this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-xl text-gray-900">Loading B2B portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">B2B Enterprise Portal</h1>
          <p className="text-xl text-gray-600">Manage corporate accounts, wholesale operations, and bulk business processes</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'dashboard', name: 'Dashboard', icon: '📊' },
                { id: 'accounts', name: 'Corporate Accounts', icon: '🏢' },
                { id: 'wholesale', name: 'Wholesale Products', icon: '📦' },
                { id: 'orders', name: 'Bulk Orders', icon: '🛒' },
                { id: 'suppliers', name: 'Supplier Management', icon: '🏭' },
                { id: 'bulk-ops', name: 'Bulk Operations', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">B2B Dashboard Overview</h2>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Corporate Accounts</h3>
                  <p className="text-3xl font-bold text-blue-600">{b2bData.corporateAccounts.length}</p>
                  <p className="text-sm text-blue-700">Active accounts</p>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Wholesale Products</h3>
                  <p className="text-3xl font-bold text-green-600">{b2bData.wholesaleProducts.length}</p>
                  <p className="text-sm text-green-700">Available for B2B</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">Total B2B Revenue</h3>
                  <p className="text-3xl font-bold text-purple-600">
                    ${b2bData.corporateAccounts.reduce((sum, acc) => sum + acc.totalSpent, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-purple-700">Lifetime value</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">Pending Orders</h3>
                  <p className="text-3xl font-bold text-orange-600">
                    {b2bData.bulkOrders.filter(order => order.status === 'processing').length}
                  </p>
                  <p className="text-sm text-orange-700">In processing</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bulk Orders</h3>
                  <div className="space-y-3">
                    {b2bData.bulkOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{order.companyName}</p>
                          <p className="text-sm text-gray-600">${order.totalAmount.toLocaleString()}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Corporate Accounts</h3>
                  <div className="space-y-3">
                    {b2bData.corporateAccounts
                      .sort((a, b) => b.totalSpent - a.totalSpent)
                      .slice(0, 5)
                      .map((account) => (
                        <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{account.companyName}</p>
                            <p className="text-sm text-gray-600">{account.accountType}</p>
                          </div>
                          <p className="font-semibold text-gray-900">${account.totalSpent.toLocaleString()}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Corporate Accounts Tab */}
          {activeTab === 'accounts' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Corporate Accounts</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  + Add Account
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Company</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Account Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Credit Limit</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Total Spent</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {b2bData.corporateAccounts.map((account) => (
                      <tr key={account.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{account.companyName}</p>
                            <p className="text-sm text-gray-600">{account.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-gray-900">{account.contactPerson}</p>
                            <p className="text-sm text-gray-600">{account.phone}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {account.accountType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900">${account.creditLimit.toLocaleString()}</td>
                        <td className="py-3 px-4 text-gray-900">${account.totalSpent.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                            {account.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Wholesale Products Tab */}
          {activeTab === 'wholesale' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Wholesale Products</h2>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  + Add Product
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {b2bData.wholesaleProducts.map((product) => (
                  <div key={product.id} className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">SKU: {product.sku}</p>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Regular Price:</span>
                        <span className="text-gray-900">${product.regularPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Wholesale Price:</span>
                        <span className="text-green-600 font-semibold">${product.wholesalePrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stock:</span>
                        <span className="text-gray-900">{product.stock}</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Bulk Discounts:</h4>
                      <div className="space-y-1">
                        {product.bulkDiscounts.map((discount, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">{discount.minQty}+ units:</span>
                            <span className="text-green-600">{Math.round(discount.discount * 100)}% off</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors">
                        Edit
                      </button>
                      <button className="flex-1 bg-gray-600 text-white py-2 px-3 rounded text-sm hover:bg-gray-700 transition-colors">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bulk Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Bulk Orders</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Order ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Company</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Order Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Items</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Expected Delivery</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {b2bData.bulkOrders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-gray-900">#{order.id}</td>
                        <td className="py-3 px-4 text-gray-900">{order.companyName}</td>
                        <td className="py-3 px-4 text-gray-900">{order.orderDate}</td>
                        <td className="py-3 px-4 text-gray-900">${order.totalAmount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-gray-900">{order.items}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900">{order.expectedDelivery}</td>
                        <td className="py-3 px-4">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">
                            View
                          </button>
                          <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Supplier Management Tab */}
          {activeTab === 'suppliers' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Supplier Management</h2>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  + Add Supplier
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {b2bData.supplierInfo.map((supplier) => (
                  <div key={supplier.id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span className="text-gray-900 font-medium">{supplier.rating}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contact:</span>
                        <span className="text-gray-900">{supplier.contact}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="text-gray-900">{supplier.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="text-gray-900">{supplier.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lead Time:</span>
                        <span className="text-gray-900">{supplier.leadTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Terms:</span>
                        <span className="text-gray-900">{supplier.paymentTerms}</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Products:</h4>
                      <div className="flex flex-wrap gap-2">
                        {supplier.products.map((product, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {product}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors">
                        Edit
                      </button>
                      <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors">
                        Orders
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bulk Operations Tab */}
          {activeTab === 'bulk-ops' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Bulk Operations</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Import Operations */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Import</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Import Products/Inventory</h4>
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept=".csv,.xlsx"
                        onChange={(e) => handleBulkImport(e.target.files[0])}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                      <p className="text-sm text-gray-600">
                        Supported formats: CSV, Excel. Download template for reference.
                      </p>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Download Template
                      </button>
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-3">Import History</h4>
                  <div className="space-y-2">
                    {b2bData.bulkOperations.importHistory.map((importOp) => (
                      <div key={importOp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{importOp.filename}</p>
                          <p className="text-sm text-gray-600">
                            {importOp.records} records • {importOp.errors} errors
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          importOp.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {importOp.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Export Operations */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Export</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Export Data</h4>
                    <div className="space-y-3">
                      <select className="w-full p-2 border border-gray-300 rounded">
                        <option value="">Select export type</option>
                        <option value="products">Products & Inventory</option>
                        <option value="customers">Customer Data</option>
                        <option value="orders">Order History</option>
                        <option value="analytics">Analytics Data</option>
                      </select>
                      <button 
                        onClick={() => handleBulkExport('products')}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
                      >
                        Export Data
                      </button>
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-3">Export History</h4>
                  <div className="space-y-2">
                    {b2bData.bulkOperations.exportHistory.map((exportOp) => (
                      <div key={exportOp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{exportOp.filename}</p>
                          <p className="text-sm text-gray-600">
                            {exportOp.records} records • {exportOp.type}
                          </p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default B2BPortal;
