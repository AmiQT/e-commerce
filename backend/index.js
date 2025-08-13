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
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
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
                  '/api/ai'
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

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  pool.end(() => {
    console.log('Database pool has been closed.');
    process.exit(0);
  });
});
