const express = require('express');
const router = express.Router();
const pool = require('../db');
const { auth } = require('../middleware/auth');

// Get user's shopping cart
router.get('/:userId', auth, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(`
      SELECT sc.*, p.name, p.price, p.image_url, p.stock 
      FROM shopping_cart sc 
      JOIN products p ON sc.product_id = p.id 
      WHERE sc.user_id = $1
    `, [userId]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Add item to cart
router.post('/', auth, async (req, res, next) => {
  try {
    const { user_id, product_id, quantity } = req.body;
    
    // Check if item already exists in cart
    const existingItem = await pool.query(
      'SELECT * FROM shopping_cart WHERE user_id = $1 AND product_id = $2',
      [user_id, product_id]
    );
    
    if (existingItem.rows.length > 0) {
      // Update quantity
      const updatedItem = await pool.query(
        'UPDATE shopping_cart SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3 RETURNING *',
        [quantity, user_id, product_id]
      );
      res.json(updatedItem.rows[0]);
    } else {
      // Add new item
      const newItem = await pool.query(
        'INSERT INTO shopping_cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
        [user_id, product_id, quantity]
      );
      res.json(newItem.rows[0]);
    }
  } catch (err) {
    next(err);
  }
});

// Update cart item quantity
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    const updatedItem = await pool.query(
      'UPDATE shopping_cart SET quantity = $1 WHERE id = $2 RETURNING *',
      [quantity, id]
    );
    
    if (updatedItem.rows.length === 0) {
      return res.status(404).json({ msg: 'Cart item not found' });
    }
    
    res.json(updatedItem.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Remove item from cart
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedItem = await pool.query('DELETE FROM shopping_cart WHERE id = $1 RETURNING *', [id]);
    
    if (deletedItem.rows.length === 0) {
      return res.status(404).json({ msg: 'Cart item not found' });
    }
    
    res.json({ msg: 'Item removed from cart' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
