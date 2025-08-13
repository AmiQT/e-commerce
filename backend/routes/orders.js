const express = require('express');
const router = express.Router();
const pool = require('../db');
const { auth } = require('../middleware/auth');

// Create a new order
router.post('/', auth, async (req, res, next) => {
  try {
    const { total_amount, shipping_address, items } = req.body;
    const user_id = req.user.id;
    
    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create order
      const orderResult = await client.query(
        'INSERT INTO orders (user_id, total_amount, shipping_address) VALUES ($1, $2, $3) RETURNING id', // Only return id
        [user_id, total_amount, shipping_address]
      );
      
      const orderId = orderResult.rows[0].id;
      
      // Create order items and update product stock
      for (const item of items) { // Iterate over items
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4)',
          [orderId, item.product_id, item.quantity, item.price_at_time] // Use price_at_time
        );
        
        // Update product stock
        await client.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }
      
      // Note: Cart is managed by React Context, not database table
      // await client.query('DELETE FROM shopping_cart WHERE user_id = $1', [user_id]);
      
      await client.query('COMMIT');
      res.status(201).json({ orderId }); // Return orderId
      
    } catch (err) {
      await client.query('ROLLBACK');
      next(err); // Re-throw to be caught by outer catch
    } finally {
      client.release();
    }
    
  } catch (err) {
    next(err);
  }
});

// Get single order by ID (for order tracking) - MUST come BEFORE /:userId route
router.get('/order/:orderId', auth, async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { user } = req; // From auth middleware
    
    // Get order details
    const orderResult = await pool.query(`
      SELECT o.*, oi.product_id, oi.quantity, oi.price_at_time, p.name as product_name
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1 AND o.user_id = $2
    `, [orderId, user.id]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    // Group order items
    const order = {
      id: orderResult.rows[0].id,
      user_id: orderResult.rows[0].user_id,
      total_amount: orderResult.rows[0].total_amount,
      status: orderResult.rows[0].status || 'pending',
      shipping_address: orderResult.rows[0].shipping_address,
      shipping_city: orderResult.rows[0].shipping_city,
      shipping_postal_code: orderResult.rows[0].shipping_postal_code,
      shipping_country: orderResult.rows[0].shipping_country,
      created_at: orderResult.rows[0].created_at,
      items: []
    };
    
    orderResult.rows.forEach(row => {
      if (row.product_id) {
        order.items.push({
          product_id: row.product_id,
          product_name: row.product_name,
          quantity: row.quantity,
          price_at_time: row.price_at_time
        });
      }
    });
    
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// Get user's orders - MUST come AFTER more specific routes
router.get('/:userId', auth, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(`
      SELECT o.*, oi.product_id, oi.quantity, oi.price_at_time, p.name as product_name
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
    `, [userId]);
    
    // Group order items by order
    const orders = {};
    result.rows.forEach(row => {
      if (!orders[row.id]) {
        orders[row.id] = {
          id: row.id,
          user_id: row.user_id,
          total_amount: row.total_amount,
          status: row.status,
          shipping_address: row.shipping_address,
          created_at: row.created_at,
          items: []
        };
      }
      if (row.product_id) {
        orders[row.id].items.push({
          product_id: row.product_id,
          product_name: row.product_name,
          quantity: row.quantity,
          price_at_time: row.price_at_time
        });
      }
    });
    
    res.json(Object.values(orders));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
