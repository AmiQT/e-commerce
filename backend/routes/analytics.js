const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth } = require('../middleware/auth');

// Get analytics data
router.get('/', auth, async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const userId = req.user.id;
    
    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get sales data by day
    const salesQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as sales_count,
        SUM(total_amount) as daily_revenue
      FROM orders 
      WHERE created_at BETWEEN $1 AND $2 
        AND status = 'completed'
      GROUP BY DATE(created_at)
      ORDER BY date
    `;
    
    const salesResult = await db.query(salesQuery, [startDate, endDate]);
    
    // Get top products
    const topProductsQuery = `
      SELECT 
        p.name,
        p.id,
        COUNT(oi.id) as sales_count,
        SUM(COALESCE(oi.price, oi.price_at_time) * oi.quantity) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at BETWEEN $1 AND $2 
        AND o.status = 'completed'
      GROUP BY p.id, p.name
      ORDER BY sales_count DESC
      LIMIT 5
    `;
    
    const topProductsResult = await db.query(topProductsQuery, [startDate, endDate]);
    
    // Get category distribution
    const categoryQuery = `
      SELECT 
        c.name as category,
        COUNT(oi.id) as sales_count,
        ROUND(
          (COUNT(oi.id) * 100.0 / (
            SELECT COUNT(*) 
            FROM order_items oi2 
            JOIN orders o2 ON oi2.order_id = o2.id 
            WHERE o2.created_at BETWEEN $1 AND $2 AND o2.status = 'completed'
          )), 1
        ) as percentage
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at BETWEEN $1 AND $2 
        AND o.status = 'completed'
      GROUP BY c.id, c.name
      ORDER BY sales_count DESC
    `;
    
    const categoryResult = await db.query(categoryQuery, [startDate, endDate]);
    
    // Get customer data
    const customersQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(DISTINCT user_id) as new_customers
      FROM orders 
      WHERE created_at BETWEEN $1 AND $2 
        AND status = 'completed'
      GROUP BY DATE(created_at)
      ORDER BY date
    `;
    
    const customersResult = await db.query(customersQuery, [startDate, endDate]);
    
    // Fill in missing dates with zeros
    const dates = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const sales = dates.map(date => {
      const dayData = salesResult.rows.find(row => row.date === date);
      return dayData ? dayData.sales_count : 0;
    });
    
    const revenue = dates.map(date => {
      const dayData = salesResult.rows.find(row => row.date === date);
      return dayData ? parseFloat(dayData.daily_revenue) : 0;
    });
    
    const customers = dates.map(date => {
      const dayData = customersResult.rows.find(row => row.date === date);
      return dayData ? dayData.new_customers : 0;
    });
    
    res.json({
      sales,
      revenue,
      customers,
      products: topProductsResult.rows,
      categoryDistribution: categoryResult.rows
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Get user-specific analytics
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { range = '30d' } = req.query;
    
    // Verify user has permission to view this data
    if (req.user.id !== parseInt(userId) && !req.user.is_admin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    startDate.setDate(endDate.getDate() - (range === '7d' ? 7 : range === '90d' ? 90 : 30));
    
    // Get user's order history
    const ordersQuery = `
      SELECT 
        o.id,
        o.total_amount,
        o.status,
        o.created_at,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1 AND o.created_at BETWEEN $2 AND $3
      GROUP BY o.id, o.total_amount, o.status, o.created_at
      ORDER BY o.created_at DESC
    `;
    
    const ordersResult = await db.query(ordersQuery, [userId, startDate, endDate]);
    
    // Get user's favorite categories
    const categoriesQuery = `
      SELECT 
        c.name as category,
        COUNT(oi.id) as purchase_count
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.user_id = $1 AND o.created_at BETWEEN $2 AND $3
      GROUP BY c.id, c.name
      ORDER BY purchase_count DESC
      LIMIT 5
    `;
    
    const categoriesResult = await db.query(categoriesQuery, [userId, startDate, endDate]);
    
    res.json({
      orders: ordersResult.rows,
      favoriteCategories: categoriesResult.rows,
      totalSpent: ordersResult.rows.reduce((sum, order) => sum + parseFloat(order.total_amount), 0),
      orderCount: ordersResult.rows.length
    });
    
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

module.exports = router;
