const express = require('express');
const router = express.Router();
const pool = require('../db');
const { adminAuth } = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', adminAuth, async (req, res, next) => {
  try {
    // Get total products
    const productsResult = await pool.query('SELECT COUNT(*) FROM products');
    const totalProducts = parseInt(productsResult.rows[0].count);

    // Get total orders
    const ordersResult = await pool.query('SELECT COUNT(*) FROM orders');
    const totalOrders = parseInt(ordersResult.rows[0].count);

    // Get total users (excluding admins)
    const usersResult = await pool.query('SELECT COUNT(*) FROM users WHERE is_admin = false');
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Get total categories
    const categoriesResult = await pool.query('SELECT COUNT(*) FROM categories');
    const totalCategories = parseInt(categoriesResult.rows[0].count);

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalCategories
    });
  } catch (err) {
    next(err);
  }
});

// Get recent orders
router.get('/recent-orders', adminAuth, async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id,
        o.total_amount as total,
        o.status,
        o.created_at,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) as customer_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    res.json({ orders: result.rows });
  } catch (err) {
    next(err);
  }
});

// Get all users (admin only)
router.get('/users', adminAuth, async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        email, 
        first_name, 
        last_name, 
        is_admin, 
        created_at
      FROM users 
      ORDER BY created_at DESC
    `);

    res.json({ users: result.rows });
  } catch (err) {
    next(err);
  }
});

// Update user admin status
router.put('/users/:id/admin-status', adminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_admin } = req.body;

    // Prevent admin from removing their own admin status
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ msg: 'Cannot modify your own admin status' });
    }

    const result = await pool.query(
      'UPDATE users SET is_admin = $1 WHERE id = $2 RETURNING id, email, first_name, last_name, is_admin',
      [is_admin, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ 
      success: true, 
      user: result.rows[0],
      msg: `User ${is_admin ? 'promoted to' : 'removed from'} admin successfully` 
    });
  } catch (err) {
    next(err);
  }
});

// Get all orders (admin only)
router.get('/orders', adminAuth, async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id,
        o.total_amount as total,
        o.status,
        o.created_at,
        u.first_name,
        u.last_name,
        u.email as customer_email,
        CONCAT(u.first_name, ' ', u.last_name) as customer_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

    res.json({ orders: result.rows });
  } catch (err) {
    next(err);
  }
});

// Update order status
router.put('/orders/:id/status', adminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, status',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    res.json({ 
      success: true, 
      order: result.rows[0],
      msg: `Order status updated to ${status}` 
    });
  } catch (err) {
    next(err);
  }
});

// Get order statistics
router.get('/order-stats', adminAuth, async (req, res, next) => {
  try {
    // Get orders by status
    const statusResult = await pool.query(`
      SELECT 
        status, 
        COUNT(*) as count
      FROM orders 
      GROUP BY status
    `);

    // Get total revenue
    const revenueResult = await pool.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(*) as total_orders
      FROM orders 
      WHERE status != 'cancelled'
    `);

    // Get monthly revenue (last 6 months)
    const monthlyResult = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(total_amount) as revenue,
        COUNT(*) as orders
      FROM orders 
      WHERE status != 'cancelled' 
        AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);

    res.json({
      statusBreakdown: statusResult.rows,
      totalRevenue: parseFloat(revenueResult.rows[0].total_revenue || 0),
      totalOrders: parseInt(revenueResult.rows[0].total_orders || 0),
      monthlyData: monthlyResult.rows
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
