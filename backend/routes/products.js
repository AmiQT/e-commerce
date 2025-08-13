const express = require('express');
const router = express.Router();
const pool = require('../db');
const { auth, adminAuth } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validation');

// Get all products
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Get a single product
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Get related products (same category, excluding current product)
router.get('/:id/related', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // First get the current product's category
    const productResult = await pool.query(
      'SELECT category_id FROM products WHERE id = $1',
      [id]
    );
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    const categoryId = productResult.rows[0].category_id;
    
    // Get related products from same category, excluding current product
    const relatedResult = await pool.query(`
      SELECT p.*, c.name as category_name
      FROM products p 
      JOIN categories c ON p.category_id = c.id 
      WHERE p.category_id = $1 AND p.id != $2
      ORDER BY RANDOM()
      LIMIT 4
    `, [categoryId, id]);
    
    res.json(relatedResult.rows);
  } catch (err) {
    next(err);
  }
});

// Create a product (admin only)
router.post('/', adminAuth, validateProduct, async (req, res, next) => {
  try {
    const { name, description, price, stock, category_id } = req.body;
    const newProduct = await pool.query(
      'INSERT INTO products (name, description, price, stock, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, stock, category_id]
    );
    res.json(newProduct.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Update a product (admin only)
router.put('/:id', adminAuth, validateProduct, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category_id } = req.body;
    const updatedProduct = await pool.query(
      'UPDATE products SET name = $1, description = $2, price = $3, stock = $4, category_id = $5 WHERE id = $6 RETURNING *',
      [name, description, price, stock, category_id, id]
    );
    if (updatedProduct.rows.length === 0) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.json(updatedProduct.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Delete a product (admin only)
router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedProduct = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (deletedProduct.rows.length === 0) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.json({ msg: 'Product deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
