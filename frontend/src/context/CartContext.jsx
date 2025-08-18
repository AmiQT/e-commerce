import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      console.log('Loading cart from localStorage:', savedCart);
      
      if (!savedCart) {
        console.log('No saved cart found, starting with empty array');
        return [];
      }
      
      const parsedCart = JSON.parse(savedCart);
      console.log('Parsed cart data:', parsedCart);
      
      // Ensure we always return an array
      if (Array.isArray(parsedCart)) {
        console.log('Cart data is valid array, length:', parsedCart.length);
        return parsedCart;
      } else {
        console.warn('Cart data was not an array, clearing corrupted data. Type:', typeof parsedCart, 'Value:', parsedCart);
        localStorage.removeItem('cart');
        return [];
      }
    } catch (error) {
      console.error('Error parsing cart from localStorage:', error);
      localStorage.removeItem('cart');
      return [];
    }
  });

  // Clear corrupted cart data on mount if needed
  useEffect(() => {
    if (!Array.isArray(cart)) {
      console.warn('Cart state is not an array, resetting to empty array. Type:', typeof cart, 'Value:', cart);
      setCart([]);
      localStorage.removeItem('cart');
    }
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    console.log('Adding to cart:', product, quantity);
    
    // Validate product data
    if (!product || !product.id) {
      console.error('Invalid product data:', product);
      return;
    }
    
    setCart(prevCart => {
      // Ensure prevCart is always an array
      const currentCart = Array.isArray(prevCart) ? prevCart : [];
      console.log('Current cart before adding:', currentCart);
      
      const existingItem = currentCart.find(item => item.id === product.id);
      if (existingItem) {
        const newCart = currentCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        console.log('Updated existing item, new cart:', newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
      }
      const newCart = [...currentCart, { ...product, quantity }];
      console.log('Added new item, new cart:', newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    console.log('Removing from cart:', productId);
    setCart(prevCart => {
      const currentCart = Array.isArray(prevCart) ? prevCart : [];
      const newCart = currentCart.filter(item => item.id !== productId);
      console.log('Cart after removal:', newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    console.log('Updating cart quantity:', productId, quantity);
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart => {
        const currentCart = Array.isArray(prevCart) ? prevCart : [];
        const newCart = currentCart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        );
        console.log('Cart after quantity update:', newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  const clearCart = () => {
    console.log('Clearing cart');
    setCart([]);
    localStorage.removeItem('cart');
  };

  // Function to manually clear corrupted cart data
  const clearCorruptedCart = () => {
    console.log('Manually clearing corrupted cart data');
    setCart([]);
    localStorage.removeItem('cart');
    // Also clear any other potential corrupted data
    try {
      localStorage.removeItem('cart_backup');
      localStorage.removeItem('cart_temp');
    } catch (error) {
      console.error('Error clearing backup cart data:', error);
    }
  };

  // Ensure cart is always an array before calculating
  const safeCart = Array.isArray(cart) ? cart : [];
  const cartItemCount = safeCart.reduce((total, item) => {
    // Additional safety check for item structure
    if (item && typeof item.quantity === 'number' && item.quantity > 0) {
      return total + item.quantity;
    }
    return total;
  }, 0);

  console.log('CartContext render - cart:', cart, 'safeCart:', safeCart, 'cartItemCount:', cartItemCount);

  return (
    <CartContext.Provider value={{ 
      cart: safeCart, 
      addToCart, 
      removeFromCart, 
      updateCartQuantity, 
      clearCart, 
      clearCorruptedCart,
      cartItemCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
