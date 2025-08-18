import React from 'react';
// Trigger fresh deployment - GitHub Actions is now working
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { UserProvider, useUser } from './context/UserContext';
import { CartProvider } from './context/CartContext';

// Components
import Navbar from './components/Navbar';
import Home from './components/Home';
import Products from './components/Products';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Wishlist from './components/Wishlist';
import Orders from './components/Orders';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './components/UserProfile';
import AdminDashboard from './components/AdminDashboard';
import EnhancedCheckout from './components/EnhancedCheckout';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import UserPreferences from './components/UserPreferences';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import B2BPortal from './components/B2BPortal';
import PerformanceMonitor from './components/PerformanceMonitor';
import AIRecommendations from './components/AIRecommendations';
import AIChatbot from './components/AIChatbot';
import Internationalization from './components/Internationalization';
import AdminOrders from './components/AdminOrders';
import CategoryPage from './components/CategoryPage';

// Main App Component
const AppContent = () => {
  // Protected Route Component (moved inside to access context)
  const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, loading } = useUser();
    
    if (loading) {
      return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    if (requireAdmin && !user.is_admin) {
      return <Navigate to="/" />;
    }
    
    return children;
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/category/:categorySlug" element={<CategoryPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><EnhancedCheckout /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute requireAdmin><AnalyticsDashboard /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><AdminOrders /></ProtectedRoute>} />
            <Route path="/preferences" element={<ProtectedRoute><UserPreferences /></ProtectedRoute>} />
            <Route path="/admin/advanced-analytics" element={<ProtectedRoute requireAdmin><AdvancedAnalytics /></ProtectedRoute>} />
            <Route path="/admin/b2b-portal" element={<ProtectedRoute requireAdmin><B2BPortal /></ProtectedRoute>} />
            <Route path="/admin/performance" element={<ProtectedRoute requireAdmin><PerformanceMonitor /></ProtectedRoute>} />
            <Route path="/ai-recommendations" element={<ProtectedRoute><AIRecommendations /></ProtectedRoute>} />
            <Route path="/internationalization" element={<Internationalization />} />
          </Routes>
        </main>
        <AIChatbot />
        <ToastContainer position="bottom-right" />
      </div>
    </Router>
  );
};

// App Component with Context
const App = () => {
  return (
    <UserProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </UserProvider>
  );
};

export default App;
