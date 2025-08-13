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
    'https://your-frontend-domain.com', // Update this with your actual frontend domain
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
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    timestamp: new Date().toISOString(),
    proxy: 'Working via Vite proxy'
  });
});

// Test route to verify database connection
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({ message: 'Database connected successfully!', time: result.rows[0].now });
  } catch (err) {
    console.error('Error connecting to the database', err.stack);
    res.status(500).json({ message: 'Database connection failed', error: err.message });
  }
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
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/products/recommendations', recommendationsRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics/advanced', advancedAnalyticsRoutes);
app.use('/api/b2b', b2bRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentRoutes);

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message || 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  // Server started successfully
});

// Graceful shutdown
process.on('SIGINT', () => {
  pool.end(() => {
    process.exit(0);
  });
});
