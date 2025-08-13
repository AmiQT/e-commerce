import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [token, setToken] = useState(null);

  const API_URL = '/api';

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setToken(savedToken);
    }
  }, []);

  // Separate useEffect for wishlist fetching after token is set
  useEffect(() => {
    if (user && token) {
      fetchWishlist(user.id);
    }
  }, [user, token]);

  const fetchWishlist = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setWishlist(response.data);
    } catch (error) {
      toast.error('Error fetching wishlist.');
    }
  };

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    fetchWishlist(userData.id);
    toast.success(`Welcome, ${userData.first_name}!`);
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
      await axios.post(`${API_URL}/wishlist`, { user_id: user.id, product_id: productId }, {
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

  const removeFromWishlist = async (productId) => {
    if (!user) return;
    try {
      await axios.delete(`${API_URL}/wishlist/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchWishlist(user.id); // Refresh wishlist
      toast.success('Item removed from wishlist.');
    } catch (error) {
      toast.error('Failed to remove item from wishlist.');
    }
  };

  return (
    <UserContext.Provider value={{ user, token, wishlist, handleLogin, handleLogout, addToWishlist, removeFromWishlist, fetchWishlist }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
