// API Configuration
const API_CONFIG = {
  // Base URL - change this based on environment
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? (process.env.VITE_API_URL || '/api')
    : '/api',
  
  // API Endpoints
  ENDPOINTS: {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    
    // Products
    PRODUCTS: '/products',
    PRODUCT_DETAIL: (id) => `/products/${id}`,
    PRODUCT_RELATED: (id) => `/products/${id}/related`,
    
    // Categories
    CATEGORIES: '/categories',
    
    // Cart
    CART: '/cart',
    CART_ADD: '/cart/add',
    
    // Wishlist
    WISHLIST: '/wishlist',
    WISHLIST_ITEM: (id) => `/wishlist/${id}`,
    
    // Orders
    ORDERS: '/orders',
    ORDER_DETAIL: (id) => `/orders/${id}`,
    ORDER_TRACKING: (id) => `/orders/order/${id}`,
    
    // Reviews
    REVIEWS: '/reviews',
    PRODUCT_REVIEWS: (id) => `/reviews/product/${id}`,
    
    // Admin
    ADMIN_STATS: '/admin/stats',
    ADMIN_ORDERS: '/admin/orders',
    ADMIN_ORDER_STATUS: (id) => `/admin/orders/${id}/status`,
    
    // Analytics
    ANALYTICS: '/analytics',
    ADVANCED_ANALYTICS: '/analytics/advanced',
    
    // B2B
    B2B_DASHBOARD: '/b2b/dashboard',
    B2B_BULK_IMPORT: '/b2b/bulk-import',
    B2B_BULK_EXPORT: '/b2b/bulk-export',
    
    // Performance
    PERFORMANCE_METRICS: '/performance/metrics',
    
    // Users
    USER_PREFERENCES: '/users/preferences',
    
    // Discounts
    DISCOUNT_VALIDATE: '/discounts/validate',
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  if (typeof endpoint === 'function') {
    return `${API_CONFIG.BASE_URL}${endpoint()}`;
  }
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get endpoint
export const getEndpoint = (key, ...params) => {
  const endpoint = API_CONFIG.ENDPOINTS[key];
  if (typeof endpoint === 'function') {
    return endpoint(...params);
  }
  return endpoint;
};

export default API_CONFIG;
