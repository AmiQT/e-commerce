import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import AdvancedSearch from './AdvancedSearch';
import { buildApiUrl, getEndpoint } from '../config/api';
import { getProductPlaceholder, getFallbackImage } from '../utils/placeholderImage';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [priceRange, setPriceRange] = useState(''); // Add missing priceRange state
  const [showFilters, setShowFilters] = useState(false); // Mobile filters toggle
  const { user, addToWishlist, removeFromWishlist, wishlist } = useUser();
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(buildApiUrl(getEndpoint('PRODUCTS')));
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(buildApiUrl(getEndpoint('CATEGORIES')));
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleSort = (sortType) => {
    setSortBy(sortType);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.product_id === productId);
  };

  const handleWishlistToggle = async (productId) => {
    if (!user) {
      alert('Please log in to manage your wishlist');
      return;
    }

    try {
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesCategory = !selectedCategory || product.category_id == selectedCategory;
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = !priceRange || product.price <= parseFloat(priceRange);
      return matchesCategory && matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1
    });
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf8f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ea2a33] mx-auto mb-4"></div>
          <p className="text-xl text-[#1b0e0e]">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8f8] py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1b0e0e] mb-2 sm:mb-4">
            All Products
          </h1>
          <p className="text-base sm:text-lg text-[#994d51]">
            Discover our complete collection of fashion items
          </p>
        </div>

        {/* Mobile Search and Filters Toggle */}
        <div className="lg:hidden mb-6 space-y-4">
          {/* Mobile Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-3 text-base bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
            />
          </div>

          {/* Mobile Filters Toggle */}
          <button
            onClick={toggleFilters}
            className="w-full flex items-center justify-center py-3 px-4 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L6.293 13.293A1 1 0 016 12.586V10H5a1 1 0 01-1-1V4z" />
            </svg>
            Filters & Sort
          </button>
        </div>

        {/* Mobile Filters Panel */}
        {showFilters && (
          <div className="lg:hidden mb-6 bg-white rounded-lg shadow-md p-4 space-y-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
              >
                <option value="name">Name A-Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
              <input
                type="number"
                placeholder="Enter max price"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Desktop Filters and Controls */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
              >
                <option value="name">Name A-Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Max Price:</label>
              <input
                type="number"
                placeholder="Enter max price"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-24 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-[#ea2a33] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-[#ea2a33] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-[#1b0e0e] mb-2">No products found</h3>
            <p className="text-[#994d51]">Try adjusting your search criteria or browse all categories.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
            : 'space-y-4'
          }>
            {filteredProducts.map((product) => (
              <div key={product.id} className={viewMode === 'grid' 
                ? 'bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow'
                : 'bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-4'
              }>
                {viewMode === 'grid' ? (
                  // Grid View
                  <>
                    <div className="aspect-w-1 aspect-h-1 w-full">
                      <img
                        src={product.image_url || getProductPlaceholder(product.name)}
                        alt={product.name}
                        className="w-full h-48 sm:h-56 object-cover"
                        onError={(e) => {
                          e.target.src = getFallbackImage();
                        }}
                      />
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="text-base sm:text-lg font-semibold text-[#1b0e0e] mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-[#ea2a33] font-bold text-lg sm:text-xl mb-2">
                        ${product.price}
                      </p>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description || 'Discover this amazing product from our collection.'}
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 bg-[#ea2a33] text-white py-2 px-4 rounded-lg hover:bg-[#d4252e] transition-colors font-medium text-sm"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => handleWishlistToggle(product.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isInWishlist(product.id) 
                              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <svg className="h-5 w-5" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                      <Link
                        to={`/products/${product.id}`}
                        className="block w-full text-center mt-2 text-[#ea2a33] hover:text-[#d4252e] text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </>
                ) : (
                  // List View
                  <div className="flex space-x-4">
                    <img
                      src={product.image_url || getProductPlaceholder(product.name)}
                      alt={product.name}
                      className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => {
                        e.target.src = getFallbackImage();
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-[#1b0e0e] mb-2">
                        {product.name}
                      </h3>
                      <p className="text-[#ea2a33] font-bold text-xl mb-2">
                        ${product.price}
                      </p>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description || 'Discover this amazing product from our collection.'}
                      </p>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="bg-[#ea2a33] text-white py-2 px-4 rounded-lg hover:bg-[#d4252e] transition-colors font-medium text-sm"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => handleWishlistToggle(product.id)}
                          className={`py-2 px-4 rounded-lg transition-colors text-sm font-medium ${
                            isInWishlist(product.id) 
                              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        </button>
                        <Link
                          to={`/products/${product.id}`}
                          className="py-2 px-4 text-[#ea2a33] hover:text-[#d4252e] text-sm font-medium text-center"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Results Count */}
        <div className="mt-8 text-center text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>
    </div>
  );
};

export default Products;
