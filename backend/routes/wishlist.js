const express = require('express');
const router = express.Router();
const pool = require('../db');
const { auth } = require('../middleware/auth');

// Test route to verify wishlist routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'Wishlist routes are working!', timestamp: new Date().toISOString() });
});

// Test route without auth to debug
router.get('/debug', (req, res) => {
  res.json({ 
    message: 'Wishlist debug route working!', 
    timestamp: new Date().toISOString(),
    headers: req.headers,
    method: req.method,
    url: req.url
  });
});

// Get user's wishlist
router.get('/', auth, async (req, res, next) => {
  try {
    console.log('Wishlist route accessed, user:', req.user.id);
    const userId = req.user.id;
    
    // Check if wishlists table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'wishlists'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Wishlists table does not exist');
      return res.status(500).json({ error: 'Wishlists table not found' });
    }
    
    const result = await pool.query(`
      SELECT 
        w.id,
        w.user_id,
        w.product_id,
        w.added_at,
        p.name as product_name, 
        p.price as product_price, 
        p.image_url as product_image, 
        p.description as product_description
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = $1
      ORDER BY w.added_at DESC
    `, [userId]);
    
    console.log('Wishlist query result:', result.rows.length, 'items');
    res.json(result.rows);
  } catch (err) {
    console.error('Wishlist error:', err);
    next(err);
  }
});

// Add item to wishlist
router.post('/', auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;
    const newItem = await pool.query(
      'INSERT INTO wishlists (user_id, product_id) VALUES ($1, $2) RETURNING *',
      [userId, product_id]
    );
    res.json(newItem.rows[0]);
  } catch (err) {
    // Handle unique constraint violation
    if (err.code === '23505') {
      return res.status(400).json({ msg: 'Item already in wishlist' });
    }
    next(err);
  }
});

// Remove item from wishlist
router.delete('/:productId', auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const deletedItem = await pool.query(
      'DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [userId, productId]
    );
    if (deletedItem.rows.length === 0) {
      return res.status(404).json({ msg: 'Item not found in wishlist' });
    }
    res.json({ msg: 'Item removed from wishlist' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
