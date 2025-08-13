import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Navbar = () => {
  const { user, handleLogout, wishlist, cartItemCount } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-[#ea2a33]">
              StyleHub
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4">
            <Link to="/" className="text-[#1b0e0e] hover:text-[#ea2a33] transition-colors">New Arrivals</Link>
            <Link to="/products?category=9" className="text-[#1b0e0e] hover:text-[#ea2a33] transition-colors">Men</Link>
            <Link to="/products?category=10" className="text-[#1b0e0e] hover:text-[#ea2a33] transition-colors">Women</Link>
            <Link to="/products?category=12" className="text-[#1b0e0e] hover:text-[#ea2a33] transition-colors">Accessories</Link>
            <Link to="/products" className="text-[#1b0e0e] hover:text-[#ea2a33] transition-colors">Sale</Link>
            <Link to="/ai-recommendations" className="text-[#1b0e0e] hover:text-[#ea2a33] transition-colors">🤖 AI</Link>
            <Link to="/internationalization" className="text-[#1b0e0e] hover:text-[#ea2a33] transition-colors">🌍 Global</Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* Search Bar - Hidden on mobile */}
            <div className="hidden sm:flex items-center bg-[#f3e7e8] rounded-lg px-3 py-2">
              <svg className="w-5 h-5 text-[#994d51] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-[#1b0e0e] placeholder-[#994d51] w-32 lg:w-48"
              />
            </div>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 text-[#1b0e0e] hover:text-[#ea2a33] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="#ea2a33" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ea2a33] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-[#1b0e0e] hover:text-[#ea2a33] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ea2a33] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Section - Hidden on mobile */}
            {user ? (
              <div className="hidden md:flex items-center space-x-3">
                <Link to="/orders" className="text-[#1b0e0e] hover:text-[#ea2a33] transition-colors">
                  Orders
                </Link>
                <Link to="/profile" className="text-[#1b0e0e] hover:text-[#ea2a33] transition-colors">
                  Profile
                </Link>
                {user.is_admin && (
                  <Link to="/admin" className="text-[#ea2a33] hover:text-[#d4252e] font-medium">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-[#1b0e0e]">👤</span>
                  <span className="text-[#1b0e0e] font-medium">{user.first_name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-[#ea2a33] text-white px-4 py-2 rounded-lg hover:bg-[#d4252e] transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex space-x-3">
                <Link
                  to="/login"
                  className="bg-[#f3e7e8] text-[#1b0e0e] px-4 py-2 rounded-lg hover:bg-[#e8d8d9] transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-[#ea2a33] text-white px-4 py-2 rounded-lg hover:bg-[#d4252e] transition-colors font-medium"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-[#1b0e0e] hover:text-[#ea2a33] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 py-4">
            {/* Mobile Navigation Links */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Link to="/" className="text-[#1b0e0e] hover:text-[#ea2a33] transition-colors text-center py-2">New Arrivals</Link>
              <Link to="/products?category=9" className="text-[#1b0e0e] hover:text-[#ea2a33] transition-colors text-center py-2">Men</Link>
              <Link to="/products?category=10" className="text-[#1b0e0e] hover:text-[#ea2a33] transition-colors text-center py-2">Women</Link>
              <Link to="/products?category=12" className="text-[#1b0e0e] hover:text-[#ea2a33] transition-colors text-center py-2">Accessories</Link>
              <Link to="/products" className="text-[#1b0e0e] hover:text-[#ea2a33] transition-colors text-center py-2">Sale</Link>
              <Link to="/ai-recommendations" className="text-[#1b0e0e] hover:text-[#ea2a33] transition-colors text-center py-2">🤖 AI</Link>
              <Link to="/internationalization" className="text-[#1b0e0e] hover:text-[#ea2a33] transition-colors text-center py-2">🌍 Global</Link>
            </div>

            {/* Mobile Search Bar */}
            <div className="mb-4">
              <div className="flex items-center bg-[#f3e7e8] rounded-lg px-3 py-2">
                <svg className="w-5 h-5 text-[#994d51] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent outline-none text-[#1b0e0e] placeholder-[#994d51] w-full"
                />
              </div>
            </div>

            {/* Mobile User Section */}
            {user ? (
              <div className="space-y-3">
                <Link to="/orders" className="block text-[#1b0e0e] hover:text-[#ea2a33] transition-colors text-center py-2">
                  Orders
                </Link>
                <Link to="/profile" className="block text-[#1b0e0e] hover:text-[#ea2a33] transition-colors text-center py-2">
                  Profile
                </Link>
                {user.is_admin && (
                  <Link to="/admin" className="block text-[#ea2a33] hover:text-[#d4252e] font-medium text-center py-2">
                    Admin Dashboard
                  </Link>
                )}
                <div className="text-center py-2">
                  <span className="text-[#1b0e0e]">👤 {user.first_name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-[#ea2a33] text-white py-2 px-4 rounded-lg hover:bg-[#d4252e] transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full bg-[#f3e7e8] text-[#1b0e0e] py-2 px-4 rounded-lg hover:bg-[#e8d8d9] transition-colors font-medium text-center"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full bg-[#ea2a33] text-white py-2 px-4 rounded-lg hover:bg-[#d4252e] transition-colors font-medium text-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;