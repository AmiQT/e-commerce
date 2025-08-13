const express = require('express');
const router = express.Router();
const pool = require('../db');
const { auth, adminAuth } = require('../middleware/auth');

// Get reviews for a product
router.get('/product/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    const result = await pool.query(`
      SELECT 
        r.id,
        r.rating,
        r.review_text,
        r.created_at,
        r.is_approved,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) as reviewer_name
      FROM product_reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1 AND r.is_approved = true
      ORDER BY r.created_at DESC
    `, [productId]);

    // Calculate average rating
    const avgResult = await pool.query(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating
      FROM product_reviews 
      WHERE product_id = $1 AND is_approved = true
    `, [productId]);

    res.json({
      reviews: result.rows,
      stats: {
        totalReviews: parseInt(avgResult.rows[0].total_reviews || 0),
        averageRating: parseFloat(avgResult.rows[0].average_rating || 0)
      }
    });
  } catch (err) {
    next(err);
  }
});

// Add a review (authenticated users only)
router.post('/', auth, async (req, res, next) => {
  try {
    const { product_id, rating, review_text } = req.body;
    const user_id = req.user.id;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ msg: 'Rating must be between 1 and 5' });
    }

    // Check if user already reviewed this product
    const existingReview = await pool.query(
      'SELECT id FROM product_reviews WHERE product_id = $1 AND user_id = $2',
      [product_id, user_id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ msg: 'You have already reviewed this product' });
    }

    // Add the review
    const result = await pool.query(`
      INSERT INTO product_reviews (product_id, user_id, rating, review_text)
      VALUES ($1, $2, $3, $4)
      RETURNING id, rating, review_text, created_at
    `, [product_id, user_id, rating, review_text]);

    res.status(201).json({
      success: true,
      review: result.rows[0],
      msg: 'Review added successfully'
    });
  } catch (err) {
    next(err);
  }
});

// Update user's own review
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, review_text } = req.body;
    const user_id = req.user.id;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ msg: 'Rating must be between 1 and 5' });
    }

    // Check if review exists and belongs to user
    const existingReview = await pool.query(
      'SELECT id FROM product_reviews WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (existingReview.rows.length === 0) {
      return res.status(404).json({ msg: 'Review not found or you do not have permission to edit it' });
    }

    // Update the review
    const result = await pool.query(`
      UPDATE product_reviews 
      SET rating = $1, review_text = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND user_id = $4
      RETURNING id, rating, review_text, updated_at
    `, [rating, review_text, id, user_id]);

    res.json({
      success: true,
      review: result.rows[0],
      msg: 'Review updated successfully'
    });
  } catch (err) {
    next(err);
  }
});

// Delete user's own review
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if review exists and belongs to user
    const existingReview = await pool.query(
      'SELECT id FROM product_reviews WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (existingReview.rows.length === 0) {
      return res.status(404).json({ msg: 'Review not found or you do not have permission to delete it' });
    }

    // Delete the review
    await pool.query('DELETE FROM product_reviews WHERE id = $1', [id]);

    res.json({ success: true, msg: 'Review deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Admin: Get all reviews (for moderation)
router.get('/admin/all', adminAuth, async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id,
        r.rating,
        r.review_text,
        r.is_approved,
        r.created_at,
        p.name as product_name,
        u.first_name,
        u.last_name,
        u.email
      FROM product_reviews r
      JOIN products p ON r.product_id = p.id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);

    res.json({ reviews: result.rows });
  } catch (err) {
    next(err);
  }
});

// Admin: Approve/Reject review
router.put('/admin/:id/approval', adminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_approved } = req.body;

    const result = await pool.query(`
      UPDATE product_reviews 
      SET is_approved = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, is_approved
    `, [is_approved, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Review not found' });
    }

    res.json({
      success: true,
      review: result.rows[0],
      msg: `Review ${is_approved ? 'approved' : 'rejected'} successfully`
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
