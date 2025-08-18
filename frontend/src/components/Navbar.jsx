import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { buildApiUrl, getEndpoint } from '../config/api';

const Navbar = () => {
  const { user, handleLogout, wishlist } = useUser();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(buildApiUrl(getEndpoint('CATEGORIES')));
      
      // Deduplicate categories by name to prevent duplicates in navbar
      const uniqueCategories = response.data.reduce((acc, category) => {
        const existingCategory = acc.find(cat => cat.name === category.name);
        if (!existingCategory) {
          acc.push(category);
        }
        return acc;
      }, []);
      
      console.log('Fetched categories:', response.data);
      console.log('Deduplicated categories:', uniqueCategories);
      
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to default categories if API fails
      setCategories([
        { id: 1, name: 'New Arrivals', slug: 'new-arrivals' },
        { id: 2, name: 'Men', slug: 'men' },
        { id: 3, name: 'Women', slug: 'women' },
        { id: 4, name: 'Accessories', slug: 'accessories' },
        { id: 5, name: 'Sale', slug: 'sale' }
      ]);
    }
  };

  const handleLogoutClick = () => {
    handleLogout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isMobileMenuOpen) {
      setIsSearchExpanded(false);
    }
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsSearchExpanded(false);
  };

  return (
    <nav className="bg-gray-100 border-b border-gray-200 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo and Main Navigation */}
          <div className="flex items-center space-x-4 lg:space-x-8">
            {/* Logo */}
            <Link to="/" className="text-xl lg:text-2xl font-bold text-gray-900 leading-none flex items-center h-8">
              StyleHub
            </Link>
            
            {/* Main Navigation Links - Hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-6">
              {Array.isArray(categories) && categories.map((category) => {
                // Generate slug from category name
                const slug = category.name.toLowerCase()
                  .replace(/\s+/g, '-')
                  .replace(/[^a-z0-9-]/g, '');
                
                return (
                  <Link 
                    key={category.id}
                    to={`/category/${slug}`}
                    className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors py-2 px-1 leading-none flex items-center h-8"
                  >
                    {category.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Center Section - Search Bar (Hidden on mobile) */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative flex items-center w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent leading-none"
              />
            </div>
          </div>

          {/* Right Section - Utility Icons and Mobile Menu Button */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Mobile Search Button */}
            <button
              onClick={toggleSearch}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Utility Icons - Hidden on mobile when menu is open */}
            <div className={`flex items-center space-x-2 lg:space-x-4 ${isMobileMenuOpen ? 'hidden' : 'flex'}`}>
              {/* Wishlist */}
              <Link to="/wishlist" className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlist && wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ea2a33] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center leading-none">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center w-10 h-10">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ea2a33] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold leading-none">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* User Profile - Always visible but different layout on mobile */}
              {user ? (
                <div className="flex items-center space-x-2 lg:space-x-3">
                  {/* Admin Dashboard Link - Only visible to admin users */}
                  {user.is_admin && (
                    <Link 
                      to="/admin" 
                      className="hidden sm:flex bg-[#ea2a33] text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-[#d4242a] transition-colors items-center space-x-2 shadow-lg leading-none h-10"
                    >
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="font-bold leading-none hidden sm:inline">ADMIN</span>
                    </Link>
                  )}
                  
                  {/* Orders Link - Always visible */}
                  <Link to="/orders" className="p-2 text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </Link>
                  
                  {/* Profile Avatar */}
                  <Link to="/profile" className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
                    <span className="text-gray-700 text-sm font-medium leading-none">
                      {user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </Link>
                  
                  {/* Logout Button - Always visible */}
                  <button
                    onClick={handleLogoutClick}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100"
                    title="Logout"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 lg:space-x-3 h-10">
                  <Link to="/login" className="text-xs sm:text-sm text-gray-700 hover:text-gray-900 transition-colors leading-none flex items-center h-10 px-2 sm:px-3 rounded hover:bg-gray-100">
                    Login
                  </Link>
                  <Link to="/register" className="bg-[#ea2a33] text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-[#d4242a] transition-colors leading-none flex items-center h-10">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchExpanded && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="relative flex items-center w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-3 py-3 text-base bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="px-4 py-6 space-y-6">
            {/* Mobile Navigation Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Categories</h3>
              <div className="space-y-2">
                {Array.isArray(categories) && categories.map((category) => {
                  const slug = category.name.toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '');
                  
                  return (
                    <Link 
                      key={category.id}
                      to={`/category/${slug}`}
                      className="block py-3 px-4 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={closeMobileMenu}
                    >
                      {category.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Mobile User Actions */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Account</h3>
              <div className="space-y-2">
                {user ? (
                  <>
                    <Link 
                      to="/profile" 
                      className="block py-3 px-4 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={closeMobileMenu}
                    >
                      Profile
                    </Link>
                    <Link 
                      to="/orders" 
                      className="block py-3 px-4 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={closeMobileMenu}
                    >
                      Orders
                    </Link>
                    {user.is_admin && (
                      <Link 
                        to="/admin" 
                        className="block py-3 px-4 text-base font-medium bg-[#ea2a33] text-white rounded-lg transition-colors"
                        onClick={closeMobileMenu}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogoutClick}
                      className="block w-full text-left py-3 px-4 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="block py-3 px-4 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={closeMobileMenu}
                    >
                    Login
                  </Link>
                    <Link 
                      to="/register" 
                      className="block py-3 px-4 text-base font-medium bg-[#ea2a33] text-white rounded-lg py-3 px-4 text-center"
                      onClick={closeMobileMenu}
                    >
                    Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Quick Actions */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  to="/wishlist" 
                  className="flex items-center justify-center py-3 px-4 text-base font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={closeMobileMenu}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Wishlist
                </Link>
                <Link 
                  to="/cart" 
                  className="flex items-center justify-center py-3 px-4 text-base font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={closeMobileMenu}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Cart ({cartItemCount})
                  </Link>
                </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;