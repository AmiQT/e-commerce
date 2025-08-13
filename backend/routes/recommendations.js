const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth } = require('../middleware/auth');

// Get product recommendations
router.get('/', auth, async (req, res) => {
  try {
    const { userId, productId, categoryId, type = 'similar' } = req.query;
    
    let recommendations = [];
    
    switch (type) {
      case 'similar':
        recommendations = await getSimilarProducts(productId, categoryId);
        break;
      case 'trending':
        recommendations = await getTrendingProducts();
        break;
      case 'personalized':
        if (userId) {
          recommendations = await getPersonalizedRecommendations(userId);
        } else {
          recommendations = await getPopularProducts();
        }
        break;
      case 'bestsellers':
        recommendations = await getBestSellers();
        break;
      default:
        recommendations = await getSimilarProducts(productId, categoryId);
    }
    
    res.json(recommendations);
    
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get similar products based on category and price range
async function getSimilarProducts(productId, categoryId) {
  try {
    let query = `
      SELECT 
        p.*,
        c.name as category_name,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
    `;
    
    const params = [];
    let whereClause = 'WHERE p.id != $1';
    params.push(productId);
    
    if (categoryId) {
      whereClause += ' AND p.category_id = $2';
      params.push(categoryId);
    }
    
    query += ` ${whereClause} GROUP BY p.id, c.name ORDER BY p.created_at DESC LIMIT 12`;
    
    const result = await db.query(query, params);
    return result.rows;
    
  } catch (error) {
    console.error('Error getting similar products:', error);
    return [];
  }
}

// Get trending products based on recent sales and views
async function getTrendingProducts() {
  try {
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count,
        COUNT(oi.id) as recent_sales
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= NOW() - INTERVAL '7 days' OR o.created_at IS NULL
      GROUP BY p.id, c.name
      ORDER BY recent_sales DESC, p.created_at DESC
      LIMIT 12
    `;
    
    const result = await db.query(query);
    return result.rows;
    
  } catch (error) {
    console.error('Error getting trending products:', error);
    return [];
  }
}

// Get personalized recommendations based on user behavior
async function getPersonalizedRecommendations(userId) {
  try {
    // Get user's purchase history and preferences
    const userQuery = `
      SELECT 
        p.category_id,
        COUNT(oi.id) as purchase_count,
        AVG(COALESCE(oi.price, oi.price_at_time)) as avg_price
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.user_id = $1 AND o.status = 'completed'
      GROUP BY p.category_id
      ORDER BY purchase_count DESC
      LIMIT 3
    `;
    
    const userResult = await db.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      return await getPopularProducts();
    }
    
    // Get products from user's preferred categories
    const categoryIds = userResult.rows.map(row => row.category_id);
    const avgPrice = userResult.rows.reduce((sum, row) => sum + parseFloat(row.avg_price), 0) / userResult.rows.length;
    
    const recommendationsQuery = `
      SELECT 
        p.*,
        c.name as category_name,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.category_id = ANY($1)
        AND p.price BETWEEN $2 * 0.7 AND $2 * 1.3
        AND p.id NOT IN (
          SELECT DISTINCT oi.product_id 
          FROM order_items oi 
          JOIN orders o ON oi.order_id = o.id 
          WHERE o.user_id = $3
        )
      GROUP BY p.id, c.name
      ORDER BY p.created_at DESC
      LIMIT 12
    `;
    
    const result = await db.query(recommendationsQuery, [categoryIds, avgPrice, userId]);
    return result.rows;
    
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return await getPopularProducts();
  }
}

// Get best selling products
async function getBestSellers() {
  try {
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count,
        COUNT(oi.id) as total_sales
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed' OR o.status IS NULL
      GROUP BY p.id, c.name
      ORDER BY total_sales DESC, average_rating DESC
      LIMIT 12
    `;
    
    const result = await db.query(query);
    return result.rows;
    
  } catch (error) {
    console.error('Error getting best sellers:', error);
    return [];
  }
}

// Get popular products (fallback)
async function getPopularProducts() {
  try {
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      GROUP BY p.id, c.name
      ORDER BY average_rating DESC, review_count DESC, p.created_at DESC
      LIMIT 12
    `;
    
    const result = await db.query(query);
    return result.rows;
    
  } catch (error) {
    console.error('Error getting popular products:', error);
    return [];
  }
}

// Get recommendations for a specific user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user has permission
    if (req.user.id !== parseInt(userId) && !req.user.is_admin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const recommendations = await getPersonalizedRecommendations(userId);
    res.json(recommendations);
    
  } catch (error) {
    console.error('User recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch user recommendations' });
  }
});

module.exports = router;
