import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, handleLogout, wishlist } = useUser();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    handleLogout();
    navigate('/');
  };

  return (
    <nav className="bg-transparent h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 pt-2">
          {/* Left Section - Logo and Main Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-gray-900">
              StyleHub
            </Link>
            
            {/* Main Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">
                New Arrivals
              </Link>
              <Link to="/products" className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">
                Men
              </Link>
              <Link to="/products" className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">
                Women
              </Link>
              <Link to="/products" className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">
                Accessories
              </Link>
              <Link to="/products" className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">
                Sale
              </Link>
            </div>
          </div>

          {/* Right Section - Search and Utility Icons */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search"
                className="w-48 pl-10 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
              />
            </div>

            {/* Utility Icons */}
            <div className="flex items-center space-x-4">
              {/* Wishlist */}
              <Link to="/wishlist" className="relative p-1.5 text-gray-600 hover:text-gray-900 transition-colors">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlist && wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ea2a33] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 rounded-lg">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ea2a33] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* Messages/Notifications */}
              <Link to="/messages" className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </Link>

              {/* User Profile */}
              {user ? (
                <div className="flex items-center space-x-3">
                  {/* Admin Dashboard Link - Only visible to admin users */}
                  {user.is_admin && (
                    <Link 
                      to="/admin" 
                      className="bg-[#ea2a33] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#d4242a] transition-colors flex items-center space-x-2 shadow-lg"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="font-bold">ADMIN DASHBOARD</span>
                    </Link>
                  )}
                  
                  {/* Debug info - remove this after testing */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-gray-500">
                      Admin: {user.is_admin ? 'Yes' : 'No'}
                    </div>
                  )}
                  
                  <Link to="/profile" className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
                    <span className="text-gray-700 text-sm font-medium">
                      {user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </Link>
                  <div className="hidden sm:flex items-center space-x-2">
                    <span className="text-sm text-gray-700">{user.first_name || 'User'}</span>
                    <button
                      onClick={handleLogoutClick}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="bg-[#ea2a33] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#d4242a] transition-colors">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;