const express = require('express');
const router = express.Router();
const pool = require('../db');
const { auth, adminAuth } = require('../middleware/auth');
const { validateCategory } = require('../middleware/validation');

// Get all categories
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Get a single category
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Create a category (admin only)
router.post('/', adminAuth, validateCategory, async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ msg: 'Category name is required' });
    }
    
    const newCategory = await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.status(201).json(newCategory.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Unique constraint violation
      return res.status(400).json({ msg: 'Category with this name already exists' });
    }
    next(err);
  }
});

// Update a category (admin only)
router.put('/:id', adminAuth, validateCategory, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ msg: 'Category name is required' });
    }
    
    const updatedCategory = await pool.query(
      'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    
    if (updatedCategory.rows.length === 0) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    res.json(updatedCategory.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Unique constraint violation
      return res.status(400).json({ msg: 'Category with this name already exists' });
    }
    next(err);
  }
});

// Delete a category (admin only)
router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if category has products
    const productsResult = await pool.query('SELECT COUNT(*) FROM products WHERE category_id = $1', [id]);
    if (parseInt(productsResult.rows[0].count) > 0) {
      return res.status(400).json({ msg: 'Cannot delete category with existing products' });
    }
    
    const deletedCategory = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    if (deletedCategory.rows.length === 0) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    res.json({ msg: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
