const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock data
const users = [];
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

const categories = [
  { id: 1, name: "Electronics", description: "Electronic devices and gadgets" },
  { id: 2, name: "Clothing", description: "Fashion and apparel" },
  { id: 3, name: "Books", description: "Books and literature" },
  { id: 4, name: "Home & Garden", description: "Home improvement and gardening" }
];

const carts = new Map();

// Vercel serverless function handler
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
    const query = Object.fromEntries(url.searchParams);

    console.log('Request:', req.method, pathname, query);

    // Health check
    if (pathname === '/health' && req.method === 'GET') {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
      return;
    }

    // Categories endpoint
    if (pathname === '/categories' && req.method === 'GET') {
      res.json(categories);
      return;
    }

    // Auth Routes
    if (pathname === '/auth/register' && req.method === 'POST') {
      const { email, password, first_name, last_name } = req.body;
      
      const existingUser = users.find(user => user.email === email);
      if (existingUser) {
        res.status(400).json({ msg: 'User already exists' });
        return;
      }
      
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);
      
      const newUser = {
        id: users.length + 1,
        email,
        password_hash,
        first_name,
        last_name,
        is_admin: false
      };
      
      users.push(newUser);
      
      const payload = {
        user: {
          id: newUser.id,
          email: newUser.email
        }
      };
      
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
      
      res.json({ 
        user: {
          id: newUser.id,
          email: newUser.email,
          first_name: newUser.first_name,
          last_name: newUser.last_name
        },
        token 
      });
      return;
    }

    if (pathname === '/auth/login' && req.method === 'POST') {
      const { email, password } = req.body;
      
      const user = users.find(u => u.email === email);
      if (!user) {
        res.status(400).json({ msg: 'Invalid credentials' });
        return;
      }
      
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        res.status(400).json({ msg: 'Invalid credentials' });
        return;
      }
      
      const payload = {
        user: {
          id: user.id,
          email: user.email
        }
      };
      
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          is_admin: user.is_admin
        },
        token
      });
      return;
    }

    // Product Routes
    if (pathname === '/products' && req.method === 'GET') {
      const { category, search, page = 1, limit = 10 } = query;
      
      let filteredProducts = [...products];
      
      if (category) {
        filteredProducts = filteredProducts.filter(p => 
          p.category.toLowerCase() === category.toLowerCase()
        );
      }
      
      if (search) {
        filteredProducts = filteredProducts.filter(p =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      res.json({
        products: paginatedProducts,
        total: filteredProducts.length,
        page: parseInt(page),
        totalPages: Math.ceil(filteredProducts.length / limit)
      });
      return;
    }

    // Cart Routes
    if (pathname === '/cart' && req.method === 'GET') {
      const userId = req.headers['user-id'] || 'anonymous';
      const userCart = carts.get(userId) || [];
      
      res.json({
        items: userCart,
        total: userCart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      });
      return;
    }

    // 404 for unmatched routes
    res.status(404).json({ error: 'Endpoint not found' });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
