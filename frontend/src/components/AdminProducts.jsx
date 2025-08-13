import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminProducts = () => {
  const { user, token } = useUser();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock_quantity: '',
    image_url: ''
  });

  useEffect(() => {
    if (user && user.is_admin) {
      fetchProducts();
      fetchCategories();
    }
  }, [user, token]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (err) {
      toast.error('Failed to fetch products');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (err) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      stock_quantity: '',
      image_url: ''
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        // Update existing product
        await axios.put(
          `/api/products/${editingProduct.id}`,
          formData,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        toast.success('Product updated successfully!');
      } else {
        // Add new product
        await axios.post(
          '/api/products',
          formData,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        toast.success('Product added successfully!');
      }
      
      resetForm();
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category_id: product.category_id.toString(),
      stock_quantity: product.stock_quantity.toString(),
      image_url: product.image_url || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${productId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Product deleted successfully!');
        fetchProducts();
      } catch (err) {
        toast.error(err.response?.data?.msg || 'Failed to delete product');
      }
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
          <p className="text-xl text-[#1b0e0e]">Loading products...</p>
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
            <h1 className="text-4xl font-bold text-[#1b0e0e] mb-2">Product Management</h1>
            <p className="text-xl text-[#994d51]">Manage your product catalog</p>
          </div>
          <div className="flex space-x-4">
            <Link 
              to="/admin" 
              className="bg-[#f3e7e8] text-[#1b0e0e] px-4 py-2 rounded-lg hover:bg-[#e8d8d9] transition-colors font-medium"
            >
              ← Back to Dashboard
            </Link>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#ea2a33] text-white px-6 py-2 rounded-lg hover:bg-[#d4252e] transition-colors font-medium"
            >
              {showAddForm ? 'Cancel' : '+ Add Product'}
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-[#f3e7e8]">
            <h2 className="text-2xl font-bold text-[#1b0e0e] mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#1b0e0e] mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-[#f3e7e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1b0e0e] mb-2">
                  Category *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-[#f3e7e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1b0e0e] mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-[#f3e7e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1b0e0e] mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 border border-[#f3e7e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#1b0e0e] mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-[#f3e7e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#1b0e0e] mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-[#f3e7e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2 flex space-x-4">
                <button
                  type="submit"
                  className="bg-[#ea2a33] text-white px-8 py-3 rounded-lg hover:bg-[#d4252e] transition-colors font-medium"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-[#f3e7e8] text-[#1b0e0e] px-8 py-3 rounded-lg hover:bg-[#e8d8d9] transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#f3e7e8]">
          <div className="p-6 border-b border-[#f3e7e8]">
            <h2 className="text-xl font-bold text-[#1b0e0e]">All Products ({products.length})</h2>
          </div>
          
          {products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f3e7e8] bg-[#fcf8f8]">
                    <th className="text-left py-4 px-6 font-medium text-[#1b0e0e]">Product</th>
                    <th className="text-left py-4 px-6 font-medium text-[#1b0e0e]">Category</th>
                    <th className="text-left py-4 px-6 font-medium text-[#1b0e0e]">Price</th>
                    <th className="text-left py-4 px-6 font-medium text-[#1b0e0e]">Stock</th>
                    <th className="text-left py-4 px-6 font-medium text-[#1b0e0e]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-[#f3e7e8] hover:bg-[#fcf8f8]">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-[#f3e7e8] rounded-lg flex items-center justify-center text-2xl">
                            👕
                          </div>
                          <div>
                            <p className="font-medium text-[#1b0e0e]">{product.name}</p>
                            <p className="text-sm text-[#994d51] line-clamp-2">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[#1b0e0e]">
                        {categories.find(c => c.id === product.category_id)?.name || 'Unknown'}
                      </td>
                      <td className="py-4 px-6 text-[#1b0e0e] font-medium">
                        ${product.price}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock_quantity > 10 ? 'bg-green-100 text-green-800' :
                          product.stock_quantity > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.stock_quantity} in stock
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-[#ea2a33] hover:text-[#d4252e] font-medium text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📦</div>
              <p className="text-[#994d51] mb-4">No products found</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-[#ea2a33] text-white px-6 py-2 rounded-lg hover:bg-[#d4252e] transition-colors font-medium"
              >
                Add Your First Product
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
