// Vercel serverless function for your backend
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ API Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Mock data for testing without database
const mockCategories = [
  { id: 1, name: 'New Arrivals', description: 'Latest fashion trends and new releases' },
  { id: 2, name: 'Men', description: 'Men\'s clothing and accessories' },
  { id: 3, name: 'Women', description: 'Women\'s fashion and style' },
  { id: 4, name: 'Accessories', description: 'Fashion accessories and jewelry' },
  { id: 5, name: 'Sale', description: 'Discounted fashion items' }
];

const mockProducts = [
  { id: 1, name: 'Classic White Sneakers', description: 'Versatile white sneakers perfect for any outfit', price: 89.99, category_id: 1, stock: 75, image_url: '/api/placeholder/300/300/Classic+White+Sneakers' },
  { id: 2, name: 'Denim Jacket', description: 'Timeless denim jacket with modern fit', price: 129.99, category_id: 2, stock: 45, image_url: '/api/placeholder/300/300/Denim+Jacket' },
  { id: 3, name: 'Floral Summer Dress', description: 'Beautiful floral print dress perfect for summer', price: 79.99, category_id: 3, stock: 60, image_url: '/api/placeholder/300/300/Floral+Summer+Dress' },
  { id: 4, name: 'Leather Crossbody Bag', description: 'Stylish leather bag with adjustable strap', price: 149.99, category_id: 4, stock: 35, image_url: '/api/placeholder/300/300/Leather+Crossbody+Bag' },
  { id: 5, name: 'Premium Cotton T-Shirt', description: 'Soft cotton t-shirt in multiple colors', price: 29.99, category_id: 2, stock: 120, image_url: '/api/placeholder/300/300/Premium+Cotton+T-Shirt' }
];

// Health check
app.get('/api/health', async (req, res) => {
  res.json({ status: 'healthy', mode: 'mock-data', message: 'API is working with mock data!' });
});

// Root endpoint for testing
app.get('/api', (req, res) => {
  res.json({ 
    message: 'E-commerce API is running!',
    endpoints: {
      health: '/api/health',
      orders: '/api/orders',
      products: '/api/products',
      categories: '/api/categories'
    },
    timestamp: new Date().toISOString()
  });
});

// Test orders endpoint
app.get('/api/orders', (req, res) => {
  console.log('🧪 GET /api/orders (no param) called');
  console.log('🧪 This should return all orders or a message');
  
  res.json({ 
    message: 'Orders endpoint working! Use /api/orders/:userId to get user orders',
    availableEndpoints: [
      'GET /api/orders/:userId - Get orders for a specific user',
      'GET /api/orders/:orderId - Get a specific order by ID',
      'POST /api/orders - Create a new order'
    ]
  });
});

// Placeholder image endpoint
app.get('/api/placeholder/:width/:height/:text', (req, res) => {
  const { width, height, text } = req.params;
  const decodedText = decodeURIComponent(text);
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" 
            text-anchor="middle" dominant-baseline="middle" fill="#6b7280">
        ${decodedText}
      </text>
    </svg>
  `;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  res.send(svg);
});

// Categories endpoint
app.get('/api/categories', async (req, res) => {
  try {
    // Try database first, fallback to mock data
    if (process.env.DATABASE_URL) {
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      
      const result = await pool.query('SELECT * FROM categories ORDER BY name');
      await pool.end();
      return res.json(result.rows);
    } else {
      // Fallback to mock data
      return res.json(mockCategories);
    }
  } catch (err) {
    console.log('Database error, using mock data:', err.message);
    // Fallback to mock data on error
    return res.json(mockCategories);
  }
});

// Products endpoint
app.get('/api/products', async (req, res) => {
  try {
    // Try database first, fallback to mock data
    if (process.env.DATABASE_URL) {
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      
      const result = await pool.query('SELECT * FROM products ORDER BY name');
      await pool.end();
      return res.json(result.rows);
    } else {
      // Fallback to mock data
      return res.json(mockProducts);
    }
  } catch (err) {
    console.log('Database error, using mock data:', err.message);
    // Fallback to mock data on error
    return res.json(mockProducts);
  }
});

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
  res.json({ 
    user: { id: 1, email: 'test@example.com', first_name: 'Test', last_name: 'User' }, 
    token: 'mock-jwt-token-123' 
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ 
    user: { id: 1, email: 'test@example.com', first_name: 'Test', last_name: 'User' }, 
    token: 'mock-jwt-token-123' 
  });
});

// Individual product detail
app.get('/api/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = mockProducts.find(p => p.id === productId);
  
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Wishlist endpoints
app.get('/api/wishlist', (req, res) => {
  // Return empty wishlist for now
  res.json([]);
});

app.post('/api/wishlist', (req, res) => {
  res.json({ 
    ok: true, 
    item: { id: 1, product_id: req.body.product_id, user_id: 1 }
  });
});

app.delete('/api/wishlist/:id', (req, res) => {
  res.json({ ok: true });
});

// User profile
app.get('/api/auth/profile', (req, res) => {
  res.json({ 
    user: { id: 1, email: 'test@example.com', first_name: 'Test', last_name: 'User' }
  });
});

// Cart endpoints
app.get('/api/cart', (req, res) => {
  res.json([]);
});

app.post('/api/cart/add', (req, res) => {
  res.json({ ok: true, message: 'Item added to cart' });
});

// Orders endpoint for checkout - REMOVE THIS DUPLICATE
// app.post('/api/orders', (req, res) => {
// 	// Create a mock order
// 	const mockOrder = {
// 		id: Math.floor(Math.random() * 10000),
// 		user_id: 1,
// 		status: 'pending',
// 		total: req.body.total || 0,
// 		items: req.body.items || [],
// 		created_at: new Date().toISOString(),
// 		order_number: `ORD-${Date.now()}`
// 	};
// 	
// 	res.json({ 
// 		ok: true, 
// 		order: mockOrder,
// 		message: 'Order created successfully!' 
// 	});
// });

// Handle both user-specific orders and individual order details - MUST come BEFORE /api/orders
app.get('/api/orders/:param', (req, res) => {
	console.log('🔍 GET /api/orders/:param called with param:', req.params.param);
	console.log('🔍 Request headers:', req.headers);
	console.log('🔍 Request query:', req.query);
	
	const param = req.params.param;
	
	// If param is a number, treat as order ID (individual order)
	if (!isNaN(param)) {
		console.log('🔍 Treating param as order ID:', param);
		const orderId = parseInt(param);
		
		// Create a mock order for the requested ID
		const mockOrder = {
			id: orderId,
			user_id: 1,
			status: 'pending',
			total_amount: 79.99,
			items: [
				{
					id: 1,
					product_id: 3,
					product_name: 'Floral Summer Dress',
					product_image: '/api/placeholder/300/300/Floral+Summer+Dress',
					price_at_time: 79.99,
					quantity: 1
				}
			],
			created_at: new Date().toISOString(),
			order_number: `ORD-${orderId}`,
			shipping_address: '123 Main St, Sample City, CA 12345'
		};
		
		console.log('🔍 Returning individual order:', mockOrder);
		return res.json(mockOrder);
	}
	
	// Otherwise, treat as user ID (user's orders)
	console.log('🔍 Treating param as user ID:', param);
	const userId = parseInt(param);
	const mockOrders = [
		{
			id: 1,
			user_id: userId,
			status: 'pending',
			total_amount: 79.99,
			created_at: new Date().toISOString(),
			order_number: 'ORD-1',
			items: [
				{
					product_id: 3,
					product_name: 'Floral Summer Dress',
					product_image: '/api/placeholder/300/300/Floral+Summer+Dress',
					quantity: 1,
					price_at_time: 79.99
				}
			],
			shipping_address: '123 Main St, Sample City, CA 12345'
		},
		{
			id: 2,
			user_id: userId,
			status: 'shipped',
			total_amount: 149.99,
			created_at: new Date(Date.now() - 86400000).toISOString(),
			order_number: 'ORD-2',
			items: [
				{
					product_id: 4,
					product_name: 'Leather Crossbody Bag',
					product_image: '/api/placeholder/300/300/Leather+Crossbody+Bag',
					quantity: 1,
					price_at_time: 149.99
				}
			],
			shipping_address: '123 Main St, Sample City, CA 12345'
		}
	];
	
	console.log('🔍 Returning user orders for user', userId, ':', mockOrders);
	console.log('🔍 Number of orders:', mockOrders.length);
	res.json(mockOrders);
});

// List orders (mock array) - MUST come AFTER more specific routes
app.get('/api/orders', (req, res) => {
	console.log('🧪 GET /api/orders (no param) called');
	console.log('🧪 This should return all orders or a message');
	
	res.json({ 
		message: 'Orders endpoint working! Use /api/orders/:userId to get user orders',
		availableEndpoints: [
			'GET /api/orders/:userId - Get orders for a specific user',
			'GET /api/orders/:orderId - Get a specific order by ID',
			'POST /api/orders - Create a new order'
		]
	});
});

// Create new order endpoint
app.post('/api/orders', (req, res) => {
	console.log('🚀 POST /api/orders called');
	console.log('🚀 Request body:', req.body);
	console.log('🚀 Request headers:', req.headers);
	
	try {
		const { total_amount, shipping_address, items } = req.body;
		
		console.log('🚀 Extracted data:', { total_amount, shipping_address, items });
		
		// Validate required fields
		if (!total_amount || !shipping_address || !items || !Array.isArray(items)) {
			console.log('❌ Validation failed:', { 
				hasTotal: !!total_amount, 
				hasAddress: !!shipping_address, 
				hasItems: !!items, 
				isArray: Array.isArray(items) 
			});
			return res.status(400).json({ 
				error: 'Missing required fields: total_amount, shipping_address, and items array' 
			});
		}
		
		// Create a new mock order
		const newOrder = {
			id: Date.now(), // Simple ID generation
			user_id: 1, // Mock user ID
			status: 'pending',
			total_amount: parseFloat(total_amount),
			created_at: new Date().toISOString(),
			order_number: `ORD-${Date.now()}`,
			items: items.map(item => ({
				product_id: item.product_id,
				product_name: `Product ${item.product_id}`, // Mock product name
				product_image: `/api/placeholder/300/300/Product+${item.product_id}`,
				quantity: item.quantity,
				price_at_time: parseFloat(item.price_at_time)
			})),
			shipping_address: shipping_address
		};
		
		console.log('✅ Created new order:', newOrder);
		
		// Return success response
		res.status(201).json({
			ok: true,
			order: newOrder,
			message: 'Order created successfully!'
		});
		
	} catch (error) {
		console.error('❌ Error creating order:', error);
		res.status(500).json({ 
			error: 'Failed to create order',
			message: error.message 
		});
	}
});

// Export for Vercel
module.exports = app;
