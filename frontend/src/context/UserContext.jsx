import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { buildApiUrl } from '../config/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [token, setToken] = useState(null);



  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setToken(savedToken);
      // Validate token and fetch wishlist
      validateTokenAndFetchWishlist(savedToken, parsedUser.id);
    }
  }, []);

  const validateTokenAndFetchWishlist = async (tokenToValidate, userId) => {
    try {
      // Test token validity by making a request
      await axios.get(buildApiUrl('/wishlist'), {
        headers: {
          'Authorization': `Bearer ${tokenToValidate}`
        }
      });
      // Token is valid, fetch wishlist
      fetchWishlist(userId);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Token is invalid, clear everything
        setUser(null);
        setToken(null);
        setWishlist([]);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  };

  // Separate useEffect for wishlist fetching after token is set
  useEffect(() => {
    if (user && token) {
      fetchWishlist(user.id);
    }
  }, [user, token]);

  // Refresh user profile on mount to ensure we have latest data including admin status
  useEffect(() => {
    if (token) {
      refreshUserProfile();
    }
  }, [token]);

  const fetchWishlist = async (userId) => {
    try {
      if (!token) {
        setWishlist([]);
        return;
      }
      
      const response = await axios.get(buildApiUrl('/wishlist'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setWishlist(response.data);
    } catch (error) {
      // Handle authentication errors
      if (error.response && error.response.status === 401) {
        // Token expired or invalid, clear user data
        setUser(null);
        setToken(null);
        setWishlist([]);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        toast.error('Session expired. Please log in again.');
      } else {
        // Other errors - just set empty array
        console.error('Wishlist fetch error:', error);
        setWishlist([]);
      }
    }
  };

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    fetchWishlist(userData.id);
    toast.success(`Welcome, ${userData.first_name}!`);
    
    // Refresh user profile to ensure we have latest data including admin status
    setTimeout(() => {
      refreshUserProfile();
    }, 100);
  };

  const refreshUserProfile = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(buildApiUrl('/auth/profile'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.user) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      // If profile refresh fails, don't show error to user
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setWishlist([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.info('Logged out successfully.');
  };

  const addToWishlist = async (productId) => {
    if (!user) {
      toast.warn('Please log in to add items to your wishlist.');
      return;
    }
    try {
      await axios.post(buildApiUrl('/wishlist'), { user_id: user.id, product_id: productId }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchWishlist(user.id); // Refresh wishlist
      toast.success('Item added to wishlist!');
    } catch (error) {
      if (error.response && error.response.data.msg === 'Item already in wishlist') {
        toast.info('This item is already in your wishlist.');
      } else {
        toast.error('Failed to add item to wishlist.');
      }
    }
  };

  const removeFromWishlist = async (wishlistItemId) => {
    if (!user) return;
    try {
      const response = await axios.delete(buildApiUrl(`/wishlist/${wishlistItemId}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Only show success if we actually got a successful response
      if (response.status === 200) {
        await fetchWishlist(user.id); // Refresh wishlist
        return true; // Return success indicator
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      throw error; // Re-throw to let component handle it
    }
  };

  return (
    <UserContext.Provider value={{ user, token, wishlist, handleLogin, handleLogout, addToWishlist, removeFromWishlist, fetchWishlist, refreshUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
