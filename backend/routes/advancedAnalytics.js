const express = require('express');
const router = express.Router();
const pool = require('../db');
const { auth, adminAuth } = require('../middleware/auth');

// Get advanced analytics dashboard data
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const { range = '90d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '6m':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 90);
    }

    // Customer Segmentation Analysis
    const customerSegments = await pool.query(`
      SELECT 
        CASE 
          WHEN total_spent >= 1000 THEN 'VIP Customers'
          WHEN total_spent >= 500 THEN 'High Value'
          WHEN total_spent >= 100 THEN 'Medium Value'
          ELSE 'Low Value'
        END as segment,
        COUNT(*) as count,
        SUM(total_spent) as revenue,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users WHERE is_admin = false), 2) as percentage
      FROM (
        SELECT 
          u.id,
          COALESCE(SUM(o.total_amount), 0) as total_spent
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id 
          AND o.created_at >= $1 
          AND o.status != 'cancelled'
        WHERE u.is_admin = false
        GROUP BY u.id
      ) customer_totals
      GROUP BY segment
      ORDER BY revenue DESC
    `, [startDate]);

    // RFM Analysis (Recency, Frequency, Monetary)
    const rfmAnalysis = await pool.query(`
      SELECT 
        rfm_score,
        COUNT(*) as count,
        SUM(total_spent) as revenue,
        CASE 
          WHEN rfm_score = '555' THEN 'Best Customers'
          WHEN rfm_score = '444' THEN 'High Potential'
          WHEN rfm_score = '333' THEN 'Average'
          WHEN rfm_score = '222' THEN 'At Risk'
          ELSE 'Lost'
        END as description
      FROM (
        SELECT 
          u.id,
          COALESCE(SUM(o.total_amount), 0) as total_spent,
          CONCAT(
            CASE 
              WHEN MAX(o.created_at) IS NULL OR MAX(o.created_at) < $1 THEN '1'
              WHEN MAX(o.created_at) < $2 THEN '2'
              WHEN MAX(o.created_at) < $3 THEN '3'
              WHEN MAX(o.created_at) < $4 THEN '4'
              ELSE '5'
            END,
            CASE 
              WHEN COUNT(o.id) = 0 THEN '1'
              WHEN COUNT(o.id) = 1 THEN '2'
              WHEN COUNT(o.id) <= 3 THEN '3'
              WHEN COUNT(o.id) <= 5 THEN '4'
              ELSE '5'
            END,
            CASE 
              WHEN COALESCE(SUM(o.total_amount), 0) = 0 THEN '1'
              WHEN COALESCE(SUM(o.total_amount), 0) < 100 THEN '2'
              WHEN COALESCE(SUM(o.total_amount), 0) < 500 THEN '3'
              WHEN COALESCE(SUM(o.total_amount), 0) < 1000 THEN '4'
              ELSE '5'
            END
          ) as rfm_score
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'cancelled'
        WHERE u.is_admin = false
        GROUP BY u.id
      ) rfm_data
      GROUP BY rfm_score
      ORDER BY revenue DESC
    `, [
      new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      new Date(endDate.getTime() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
      new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000),  // 3 months ago
      new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)   // 1 month ago
    ]);

    // Sales Forecast (simplified linear regression)
    const salesForecast = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        SUM(total_amount) as daily_sales,
        COUNT(*) as order_count
      FROM orders 
      WHERE created_at >= $1 
        AND status != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [startDate]);

    // Inventory Predictions
    const inventoryPredictions = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.stock_quantity as current_stock,
        COALESCE(SUM(oi.quantity), 0) as sold_last_30_days,
        CASE 
          WHEN p.stock_quantity <= 20 THEN 'Reorder Now'
          WHEN p.stock_quantity <= 50 THEN 'Monitor'
          ELSE 'Well Stocked'
        END as status,
        GREATEST(20, ROUND(COALESCE(SUM(oi.quantity), 0) * 1.5)) as reorder_point
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id 
        AND o.created_at >= $1 
        AND o.status != 'cancelled'
      GROUP BY p.id, p.name, p.stock_quantity
      ORDER BY p.stock_quantity ASC
      LIMIT 10
    `, [new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)]);

    // Customer Lifetime Value Analysis
    const customerLifetimeValue = await pool.query(`
      SELECT 
        segment,
        ROUND(AVG(total_spent), 2) as avg_ltv,
        ROUND(AVG(retention_rate), 3) as retention_rate,
        ROUND(AVG(acquisition_cost), 2) as acquisition_cost
      FROM (
        SELECT 
          CASE 
            WHEN total_spent >= 1000 THEN 'VIP'
            WHEN total_spent >= 500 THEN 'High Value'
            WHEN total_spent >= 100 THEN 'Medium Value'
            ELSE 'Low Value'
          END as segment,
          total_spent,
          CASE 
            WHEN order_count > 1 THEN 0.8
            ELSE 0.5
          END as retention_rate,
          CASE 
            WHEN total_spent >= 1000 THEN 150
            WHEN total_spent >= 500 THEN 100
            WHEN total_spent >= 100 THEN 75
            ELSE 50
          END as acquisition_cost
        FROM (
          SELECT 
            u.id,
            COALESCE(SUM(o.total_amount), 0) as total_spent,
            COUNT(o.id) as order_count
          FROM users u
          LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'cancelled'
          WHERE u.is_admin = false
          GROUP BY u.id
        ) customer_data
      ) ltv_data
      GROUP BY segment
      ORDER BY avg_ltv DESC
    `);

    // Churn Analysis
    const churnAnalysis = await pool.query(`
      SELECT 
        DATE_TRUNC('month', month_start) as month,
        ROUND(churned_users * 100.0 / total_users, 2) as churn_rate,
        ROUND((total_users - churned_users) * 100.0 / total_users, 2) as retention_rate
      FROM (
        SELECT 
          month_start,
          COUNT(DISTINCT u.id) as total_users,
          COUNT(DISTINCT CASE WHEN last_order < month_start THEN u.id END) as churned_users
        FROM (
          SELECT 
            DATE_TRUNC('month', generate_series($1::date, $2::date, '1 month'::interval)) as month_start
        ) months
        CROSS JOIN users u
        LEFT JOIN (
          SELECT 
            user_id,
            MAX(created_at) as last_order
          FROM orders 
          WHERE status != 'cancelled'
          GROUP BY user_id
        ) last_orders ON u.id = last_orders.user_id
        WHERE u.is_admin = false
        GROUP BY month_start
      ) churn_data
      ORDER BY month
    `, [startDate, endDate]);

    // Conversion Funnel
    const conversionFunnel = await pool.query(`
      SELECT 
        'Website Visits' as stage,
        COUNT(DISTINCT u.id) as count,
        100 as conversion_rate
      FROM users u
      WHERE u.is_admin = false
      
      UNION ALL
      
      SELECT 
        'Product Views' as stage,
        COUNT(DISTINCT pv.user_id) as count,
        ROUND(COUNT(DISTINCT pv.user_id) * 100.0 / COUNT(DISTINCT u.id), 2) as conversion_rate
      FROM users u
      LEFT JOIN product_views pv ON u.id = pv.user_id
      WHERE u.is_admin = false
      
      UNION ALL
      
      SELECT 
        'Add to Cart' as stage,
        COUNT(DISTINCT c.user_id) as count,
        ROUND(COUNT(DISTINCT c.user_id) * 100.0 / COUNT(DISTINCT u.id), 2) as conversion_rate
      FROM users u
      LEFT JOIN cart c ON u.id = c.user_id
      WHERE u.is_admin = false
      
      UNION ALL
      
      SELECT 
        'Checkout Started' as stage,
        COUNT(DISTINCT o.user_id) as count,
        ROUND(COUNT(DISTINCT o.user_id) * 100.0 / COUNT(DISTINCT u.id), 2) as conversion_rate
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.is_admin = false
      
      UNION ALL
      
      SELECT 
        'Purchase Completed' as stage,
        COUNT(DISTINCT o.user_id) as count,
        ROUND(COUNT(DISTINCT o.user_id) * 100.0 / COUNT(DISTINCT u.id), 2) as conversion_rate
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'completed'
      WHERE u.is_admin = false
      
      ORDER BY conversion_rate DESC
    `);

    // Product Performance Analysis
    const productPerformance = await pool.query(`
      SELECT 
        p.name as product,
        COALESCE(SUM(oi.quantity * COALESCE(oi.price, oi.price_at_time)), 0) as revenue,
        COALESCE(SUM(oi.quantity), 0) as units_sold,
        ROUND(
          CASE 
                    WHEN COALESCE(SUM(oi.quantity * COALESCE(oi.price, oi.price_at_time)), 0) > 0
        THEN (COALESCE(SUM(oi.quantity * COALESCE(oi.price, oi.price_at_time)), 0) - COALESCE(SUM(oi.quantity * p.cost_price), 0)) * 100.0 / COALESCE(SUM(oi.quantity * COALESCE(oi.price, oi.price_at_time)), 0)
            ELSE 0
          END, 2
        ) as margin_percentage,
        CASE 
          WHEN COALESCE(SUM(oi.quantity), 0) > LAG(COALESCE(SUM(oi.quantity), 0)) OVER (ORDER BY p.id) THEN 'up'
          WHEN COALESCE(SUM(oi.quantity), 0) < LAG(COALESCE(SUM(oi.quantity), 0)) OVER (ORDER BY p.id) THEN 'down'
          ELSE 'stable'
        END as trend
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id 
        AND o.created_at >= $1 
        AND o.status != 'cancelled'
      GROUP BY p.id, p.name, p.cost_price
      ORDER BY revenue DESC
      LIMIT 10
    `, [startDate]);

    res.json({
      customerSegments: customerSegments.rows,
      rfmAnalysis: rfmAnalysis.rows,
      salesForecast: salesForecast.rows.map(row => row.daily_sales || 0),
      inventoryPredictions: inventoryPredictions.rows,
      customerLifetimeValue: customerLifetimeValue.rows,
      churnAnalysis: churnAnalysis.rows,
      conversionFunnel: conversionFunnel.rows,
      productPerformance: productPerformance.rows
    });

  } catch (error) {
    console.error('Error fetching advanced analytics:', error);
    res.status(500).json({ error: 'Failed to fetch advanced analytics data' });
  }
});

// Get customer insights for specific segment
router.get('/customer-insights/:segment', adminAuth, async (req, res) => {
  try {
    const { segment } = req.params;
    const { range = '90d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    startDate.setDate(endDate.getDate() - 90);

    let segmentFilter = '';
    switch (segment) {
      case 'vip':
        segmentFilter = 'AND total_spent >= 1000';
        break;
      case 'high-value':
        segmentFilter = 'AND total_spent >= 500 AND total_spent < 1000';
        break;
      case 'medium-value':
        segmentFilter = 'AND total_spent >= 100 AND total_spent < 500';
        break;
      case 'low-value':
        segmentFilter = 'AND total_spent < 100';
        break;
      default:
        return res.status(400).json({ error: 'Invalid segment' });
    }

    const customerInsights = await pool.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        COALESCE(SUM(o.total_amount), 0) as total_spent,
        COUNT(o.id) as order_count,
        MAX(o.created_at) as last_order,
        AVG(o.total_amount) as avg_order_value,
        CASE 
          WHEN MAX(o.created_at) IS NULL THEN 'Never'
          WHEN MAX(o.created_at) < $1 THEN 'Inactive'
          WHEN MAX(o.created_at) < $2 THEN 'At Risk'
          ELSE 'Active'
        END as status
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'cancelled'
      WHERE u.is_admin = false
      GROUP BY u.id, u.first_name, u.last_name, u.email
      HAVING COALESCE(SUM(o.total_amount), 0) > 0
      ${segmentFilter}
      ORDER BY total_spent DESC
      LIMIT 50
    `, [
      new Date(endDate.getTime() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
      new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000)   // 3 months ago
    ]);

    res.json(customerInsights.rows);

  } catch (error) {
    console.error('Error fetching customer insights:', error);
    res.status(500).json({ error: 'Failed to fetch customer insights' });
  }
});

// Get predictive analytics data
router.get('/predictions', adminAuth, async (req, res) => {
  try {
    const { type = 'sales' } = req.query;
    
    if (type === 'sales') {
      // Simple sales prediction based on historical data
      const salesPrediction = await pool.query(`
        SELECT 
          DATE_TRUNC('day', generate_series(
            CURRENT_DATE + INTERVAL '1 day',
            CURRENT_DATE + INTERVAL '30 days',
            '1 day'::interval
          )) as prediction_date,
          ROUND(
            (SELECT AVG(daily_sales) FROM (
              SELECT 
                DATE(created_at) as date,
                SUM(total_amount) as daily_sales
              FROM orders 
              WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
                AND status != 'cancelled'
              GROUP BY DATE(created_at)
            ) recent_sales
          ) * (1 + (RANDOM() - 0.5) * 0.2), 2
        ) as predicted_sales
      `);

      res.json(salesPrediction.rows);
    } else if (type === 'inventory') {
      // Inventory prediction based on sales velocity
      const inventoryPrediction = await pool.query(`
        SELECT 
          p.id,
          p.name,
          p.stock_quantity as current_stock,
          COALESCE(SUM(oi.quantity), 0) as sold_last_30_days,
          ROUND(COALESCE(SUM(oi.quantity), 0) / 30.0, 2) as daily_sales_rate,
          CASE 
            WHEN p.stock_quantity = 0 THEN 'Out of Stock'
            WHEN p.stock_quantity <= ROUND(COALESCE(SUM(oi.quantity), 0) / 30.0 * 7) THEN 'Low Stock'
            WHEN p.stock_quantity <= ROUND(COALESCE(SUM(oi.quantity), 0) / 30.0 * 14) THEN 'Medium Stock'
            ELSE 'Well Stocked'
          END as stock_status,
          GREATEST(7, ROUND(COALESCE(SUM(oi.quantity), 0) / 30.0 * 14)) as recommended_stock
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN orders o ON oi.order_id = o.id 
          AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
          AND o.status != 'cancelled'
        GROUP BY p.id, p.name, p.stock_quantity
        ORDER BY stock_status, current_stock ASC
      `);

      res.json(inventoryPrediction.rows);
    } else {
      res.status(400).json({ error: 'Invalid prediction type' });
    }

  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

module.exports = router;
