require('dotenv').config();
const express = require('express');
const pool = require('./db'); // Import the database pool
const bcrypt = require('bcrypt');
const app = express();
const port = process.env.PORT || 3001;

// Import route modules
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const orderRoutes = require('./routes/orders');
const categoryRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews');
const analyticsRoutes = require('./routes/analytics');
const recommendationsRoutes = require('./routes/recommendations');
const discountRoutes = require('./routes/discounts');
const userRoutes = require('./routes/users');
const advancedAnalyticsRoutes = require('./routes/advancedAnalytics');
const b2bRoutes = require('./routes/b2b');
const performanceRoutes = require('./routes/performance');
const aiRoutes = require('./routes/ai');
const paymentRoutes = require('./routes/payments');

app.use(express.json({ limit: '10mb' })); // Limit request body size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Enable CORS for frontend
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://e-commerce-coral-five-81.vercel.app',
    'https://e-commerce-noor-azamis-projects.vercel.app',
    'https://e-commerce-git-main-noor-azamis-projects.vercel.app',
    'https://amiqt.github.io' // GitHub Pages domain
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Test route to verify proxy is working
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    timestamp: new Date().toISOString(),
    proxy: 'Working via Vite proxy'
  });
});

// Test route to verify database connection
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({ message: 'Database connected successfully!', time: result.rows[0].now });
  } catch (err) {
    console.error('Error connecting to the database', err.stack);
    res.status(500).json({ message: 'Database connection failed', error: err.message });
  }
});

// Placeholder image generator endpoint
app.get('/api/placeholder/:width/:height/:text', (req, res) => {
  const { width, height, text } = req.params;
  const decodedText = decodeURIComponent(text);
  
  // Create a simple SVG placeholder
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

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    
    // Test if wishlists table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'wishlists'
      );
    `);
    
    res.json({
      status: 'healthy',
      database: 'connected',
      wishlists_table: tableCheck.rows[0].exists,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Database initialization check
app.get('/api/init-db', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    
    // Check if basic tables exist
    const tablesCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'products', 'categories', 'wishlists', 'shopping_cart', 'orders')
    `);
    
    const existingTables = tablesCheck.rows.map(row => row.table_name);
    
    res.json({
      status: 'database_ready',
      existing_tables: existingTables,
      missing_tables: ['users', 'products', 'categories', 'wishlists', 'shopping_cart', 'orders'].filter(table => !existingTables.includes(table)),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'database_error',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Database setup endpoint
app.post('/api/setup-db', async (req, res) => {
  try {
    // Create wishlists table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        added_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      );
    `);
    
    // Create other tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL CHECK (price > 0),
        stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shopping_cart (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
        shipping_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    res.json({
      status: 'database_setup_complete',
      message: 'All required tables created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'setup_failed',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test route to verify all routes are mounted
app.get('/api/routes-test', (req, res) => {
  res.json({
    message: 'All routes are mounted',
    routes: [
      '/api/auth',
      '/api/products', 
      '/api/cart',
      '/api/wishlist',
      '/api/orders',
      '/api/categories',
      '/api/admin',
      '/api/reviews',
      '/api/analytics',
      '/api/products/recommendations',
      '/api/discounts',
      '/api/users',
                        '/api/analytics/advanced',
                  '/api/b2b',
                  '/api/performance',
                  '/api/ai',
                  '/api/payments'
    ],
    timestamp: new Date().toISOString()
  });
});

// Use route modules
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/orders', orderRoutes);
app.use('/categories', categoryRoutes);
app.use('/admin', adminRoutes);
app.use('/reviews', reviewRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/products/recommendations', recommendationsRoutes);
app.use('/discounts', discountRoutes);
app.use('/users', userRoutes);
app.use('/analytics/advanced', advancedAnalyticsRoutes);
app.use('/b2b', b2bRoutes);
app.use('/performance', performanceRoutes);
app.use('/ai', aiRoutes);
app.use('/payments', paymentRoutes);

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message || 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, async () => {
  // Server started successfully
  console.log(`🚀 Server running on port ${port}`);
  
  // Initialize database tables automatically
  try {
    console.log('🔧 Initializing database tables...');
    
    // Create categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Add unique constraint with a different approach
    try {
      await pool.query(`
        ALTER TABLE categories ADD CONSTRAINT categories_name_unique UNIQUE (name);
      `);
    } catch (err) {
      // Constraint might already exist, which is fine
      console.log('ℹ️  Categories unique constraint already exists or could not be added');
    }
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL CHECK (price > 0),
        stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create other tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shopping_cart (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
        shipping_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        quantity INTEGER NOT NULL,
        price_at_time DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      );
    `);
    
    // Insert sample data - use try-catch for each insertion
    const categoriesToInsert = [
      { name: 'New Arrivals', description: 'Latest fashion trends and new releases' },
      { name: 'Men', description: 'Men\'s clothing and accessories' },
      { name: 'Women', description: 'Women\'s fashion and style' },
      { name: 'Accessories', description: 'Fashion accessories and jewelry' },
      { name: 'Sale', description: 'Discounted fashion items' }
    ];
    
    for (const category of categoriesToInsert) {
      try {
        await pool.query(
          'INSERT INTO categories (name, description) VALUES ($1, $2)',
          [category.name, category.description]
        );
      } catch (err) {
        // Category might already exist, which is fine
        console.log(`ℹ️  Category "${category.name}" already exists or could not be inserted`);
      }
    }
    
    // Insert sample products
    const productsToInsert = [
      { name: 'Classic White Sneakers', description: 'Versatile white sneakers perfect for any outfit', price: 89.99, stock: 75, category_id: 1, image_url: 'https://via.placeholder.com/300x300?text=White+Sneakers' },
      { name: 'Denim Jacket', description: 'Timeless denim jacket with modern fit', price: 129.99, stock: 45, category_id: 2, image_url: 'https://via.placeholder.com/300x300?text=Denim+Jacket' },
      { name: 'Floral Summer Dress', description: 'Beautiful floral print dress perfect for summer', price: 79.99, stock: 60, category_id: 3, image_url: 'https://via.placeholder.com/300x300?text=Summer+Dress' },
      { name: 'Leather Crossbody Bag', description: 'Stylish leather bag with adjustable strap', price: 149.99, stock: 35, category_id: 4, image_url: 'https://via.placeholder.com/300x300?text=Leather+Bag' },
      { name: 'Premium Cotton T-Shirt', description: 'Soft cotton t-shirt in multiple colors', price: 29.99, stock: 120, category_id: 2, image_url: 'https://via.placeholder.com/300x300?text=Cotton+T-Shirt' },
      { name: 'Designer Sunglasses', description: 'Trendy sunglasses with UV protection', price: 199.99, stock: 25, category_id: 4, image_url: 'https://via.placeholder.com/300x300?text=Sunglasses' },
      { name: 'High-Waist Jeans', description: 'Fashionable high-waist jeans for women', price: 99.99, stock: 55, category_id: 3, image_url: 'https://via.placeholder.com/300x300?text=High+Waist+Jeans' },
      { name: 'Casual Blazer', description: 'Professional yet casual blazer for men', price: 179.99, stock: 40, category_id: 2, image_url: 'https://via.placeholder.com/300x300?text=Casual+Blazer' }
    ];
    
    for (const product of productsToInsert) {
      try {
        await pool.query(
          'INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES ($1, $2, $3, $4, $5, $6)',
          [product.name, product.description, product.price, product.stock, product.category_id, product.image_url]
        );
      } catch (err) {
        // Product might already exist, which is fine
        console.log(`ℹ️  Product "${product.name}" already exists or could not be inserted`);
      }
    }
    
    console.log('✅ Database tables initialized successfully!');
    console.log('🎉 Sample products and categories added!');
    
  } catch (err) {
    console.error('❌ Error initializing database:', err.message);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  pool.end(() => {
    process.exit(0);
  });
});
