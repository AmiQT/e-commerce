// Simple Vercel serverless function - no complex dependencies
module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Parse URL properly for Vercel
    const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    console.log('Request:', req.method, pathname);

    // Health check
    if (pathname === '/health' && req.method === 'GET') {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
      return;
    }

    // Categories endpoint
    if (pathname === '/categories' && req.method === 'GET') {
      const categories = [
        { id: 1, name: "Electronics", description: "Electronic devices and gadgets" },
        { id: 2, name: "Clothing", description: "Fashion and apparel" },
        { id: 3, name: "Books", description: "Books and literature" },
        { id: 4, name: "Home & Garden", description: "Home improvement and gardening" }
      ];
      res.json(categories);
      return;
    }

    // Products endpoint
    if (pathname === '/products' && req.method === 'GET') {
      const products = [
        {
          id: 1,
          name: "Sample Product 1",
          description: "This is a sample product description",
          price: 29.99,
          category: "Electronics",
          image_url: "https://via.placeholder.com/300x200",
          stock: 100
        },
        {
          id: 2,
          name: "Sample Product 2",
          description: "Another sample product description",
          price: 49.99,
          category: "Clothing",
          image_url: "https://via.placeholder.com/300x200",
          stock: 50
        }
      ];
      res.json({
        products: products,
        total: products.length,
        page: 1,
        totalPages: 1
      });
      return;
    }

    // Auth endpoints - simplified for now
    if (pathname === '/auth/register' && req.method === 'POST') {
      // Simple mock response
      res.json({ 
        message: 'Registration endpoint working!',
        user: {
          id: 1,
          email: req.body?.email || 'test@example.com',
          first_name: req.body?.first_name || 'Test',
          last_name: req.body?.last_name || 'User'
        },
        token: 'mock-jwt-token-123'
      });
      return;
    }

    if (pathname === '/auth/login' && req.method === 'POST') {
      // Simple mock response
      res.json({
        message: 'Login endpoint working!',
        user: {
          id: 1,
          email: req.body?.email || 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          is_admin: false
        },
        token: 'mock-jwt-token-123'
      });
      return;
    }

    // Cart endpoint
    if (pathname === '/cart' && req.method === 'GET') {
      res.json({
        items: [],
        total: 0
      });
      return;
    }

    // 404 for unmatched routes
    res.status(404).json({ error: 'Endpoint not found' });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
