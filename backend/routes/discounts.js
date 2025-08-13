const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth } = require('../middleware/auth');

// Validate discount code
router.post('/validate', async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    
    if (!code || !cartTotal) {
      return res.status(400).json({ error: 'Code and cart total are required' });
    }
    
    // Get discount details
    const discountQuery = `
      SELECT * FROM discounts 
      WHERE code = $1 
        AND is_active = true 
        AND (expiry_date IS NULL OR expiry_date > NOW())
    `;
    
    const discountResult = await db.query(discountQuery, [code.toUpperCase()]);
    
    if (discountResult.rows.length === 0) {
      return res.json({ valid: false, message: 'Invalid or expired discount code' });
    }
    
    const discount = discountResult.rows[0];
    
    // Check minimum order amount
    if (discount.min_order_amount && cartTotal < discount.min_order_amount) {
      return res.json({ 
        valid: false, 
        message: `Minimum order amount of $${discount.min_order_amount} required` 
      });
    }
    
    // Check usage limits
    if (discount.max_uses && discount.used_count >= discount.max_uses) {
      return res.json({ valid: false, message: 'Discount code usage limit reached' });
    }
    
    // Check if user has already used this code (for single-use codes)
    if (discount.single_use_per_user) {
      const usageQuery = `
        SELECT COUNT(*) as usage_count 
        FROM orders 
        WHERE user_id = $1 AND discount_code = $2
      `;
      const usageResult = await db.query(usageQuery, [req.user?.id, code]);
      
      if (usageResult.rows[0].usage_count > 0) {
        return res.json({ valid: false, message: 'You have already used this discount code' });
      }
    }
    
    res.json({
      valid: true,
      discount: {
        id: discount.id,
        code: discount.code,
        type: discount.type,
        percentage: discount.percentage,
        fixed_amount: discount.fixed_amount,
        description: discount.description
      }
    });
    
  } catch (error) {
    console.error('Discount validation error:', error);
    res.status(500).json({ error: 'Failed to validate discount code' });
  }
});

// Apply discount to order
router.post('/apply', auth, async (req, res) => {
  try {
    const { code, orderId } = req.body;
    
    if (!code || !orderId) {
      return res.status(400).json({ error: 'Code and order ID are required' });
    }
    
    // Get discount details
    const discountQuery = `
      SELECT * FROM discounts 
      WHERE code = $1 AND is_active = true
    `;
    
    const discountResult = await db.query(discountQuery, [code.toUpperCase()]);
    
    if (discountResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid discount code' });
    }
    
    const discount = discountResult.rows[0];
    
    // Get order details
    const orderQuery = `
      SELECT total_amount FROM orders WHERE id = $1 AND user_id = $2
    `;
    
    const orderResult = await db.query(orderQuery, [orderId, req.user.id]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderResult.rows[0];
    
    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = order.total_amount * (discount.percentage / 100);
    } else if (discount.type === 'fixed') {
      discountAmount = discount.fixed_amount;
    }
    
    // Update order with discount
    const updateQuery = `
      UPDATE orders 
      SET discount_code = $1, discount_amount = $2, total_amount = total_amount - $2
      WHERE id = $3
    `;
    
    await db.query(updateQuery, [code, discountAmount, orderId]);
    
    // Update discount usage count
    const usageQuery = `
      UPDATE discounts 
      SET used_count = used_count + 1
      WHERE id = $1
    `;
    
    await db.query(usageQuery, [discount.id]);
    
    res.json({
      success: true,
      discountAmount,
      newTotal: order.total_amount - discountAmount
    });
    
  } catch (error) {
    console.error('Discount application error:', error);
    res.status(500).json({ error: 'Failed to apply discount' });
  }
});

// Get all active discounts (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const query = `
      SELECT 
        d.*,
        COUNT(o.id) as total_orders,
        SUM(o.discount_amount) as total_savings
      FROM discounts d
      LEFT JOIN orders o ON d.code = o.discount_code
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `;
    
    const result = await db.query(query);
    res.json(result.rows);
    
  } catch (error) {
    console.error('Get discounts error:', error);
    res.status(500).json({ error: 'Failed to fetch discounts' });
  }
});

// Create new discount (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const {
      code,
      type,
      percentage,
      fixed_amount,
      min_order_amount,
      max_uses,
      single_use_per_user,
      expiry_date,
      description
    } = req.body;
    
    if (!code || !type) {
      return res.status(400).json({ error: 'Code and type are required' });
    }
    
    if (type === 'percentage' && (!percentage || percentage <= 0 || percentage > 100)) {
      return res.status(400).json({ error: 'Invalid percentage value' });
    }
    
    if (type === 'fixed' && (!fixed_amount || fixed_amount <= 0)) {
      return res.status(400).json({ error: 'Invalid fixed amount' });
    }
    
    const insertQuery = `
      INSERT INTO discounts (
        code, type, percentage, fixed_amount, min_order_amount, 
        max_uses, single_use_per_user, expiry_date, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      code.toUpperCase(),
      type,
      percentage || null,
      fixed_amount || null,
      min_order_amount || null,
      max_uses || null,
      single_use_per_user || false,
      expiry_date || null,
      description || null
    ];
    
    const result = await db.query(insertQuery, values);
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('Create discount error:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Discount code already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create discount' });
    }
  }
});

// Update discount (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { id } = req.params;
    const {
      code,
      type,
      percentage,
      fixed_amount,
      min_order_amount,
      max_uses,
      single_use_per_user,
      expiry_date,
      description,
      is_active
    } = req.body;
    
    const updateQuery = `
      UPDATE discounts 
      SET 
        code = COALESCE($2, code),
        type = COALESCE($3, type),
        percentage = $4,
        fixed_amount = $5,
        min_order_amount = $6,
        max_uses = $7,
        single_use_per_user = COALESCE($8, single_use_per_user),
        expiry_date = $9,
        description = $10,
        is_active = COALESCE($11, is_active),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const values = [
      id,
      code,
      type,
      percentage,
      fixed_amount,
      min_order_amount,
      max_uses,
      single_use_per_user,
      expiry_date,
      description,
      is_active
    ];
    
    const result = await db.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Discount not found' });
    }
    
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('Update discount error:', error);
    res.status(500).json({ error: 'Failed to update discount' });
  }
});

// Delete discount (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { id } = req.params;
    
    // Check if discount is being used
    const usageQuery = `
      SELECT COUNT(*) as usage_count 
      FROM orders 
      WHERE discount_code = (SELECT code FROM discounts WHERE id = $1)
    `;
    
    const usageResult = await db.query(usageQuery, [id]);
    
    if (usageResult.rows[0].usage_count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete discount code that has been used' 
      });
    }
    
    const deleteQuery = 'DELETE FROM discounts WHERE id = $1 RETURNING *';
    const result = await db.query(deleteQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Discount not found' });
    }
    
    res.json({ message: 'Discount deleted successfully' });
    
  } catch (error) {
    console.error('Delete discount error:', error);
    res.status(500).json({ error: 'Failed to delete discount' });
  }
});

module.exports = router;
