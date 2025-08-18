require('dotenv').config();
const { Pool } = require('pg');

// Database configuration with fallbacks
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'ecommerce',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  retryDelay: 1000, // Wait 1 second between retries
};

const pool = new Pool(dbConfig);

// Test database connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    console.error('Please check your database configuration in .env file');
    console.error('Required environment variables:');
    console.error('  DB_USER, DB_HOST, DB_DATABASE, DB_PASSWORD, DB_PORT');
    return;
  }
  
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      console.error('❌ Error testing database connection:', err.message);
    } else {
      console.log('✅ Database connection test successful:', result.rows[0].now);
    }
  });
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
