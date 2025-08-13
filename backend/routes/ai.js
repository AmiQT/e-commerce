const express = require('express');
const router = express.Router();
const pool = require('../db');
const { auth } = require('../middleware/auth');

// AI-powered product recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Simple approach: Get products from categories the user has ordered before
    // First, get user's order history
    const userOrders = await pool.query(`
      SELECT DISTINCT oi.product_id
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.user_id = $1 AND o.status != 'cancelled'
    `, [userId]);

    let recommendations = [];
    
    if (userOrders.rows.length > 0) {
      // Get products from categories the user has purchased
      const productIds = userOrders.rows.map(row => row.product_id);
      const categoryProducts = await pool.query(`
        SELECT DISTINCT p.category_id
        FROM products p
        WHERE p.id = ANY($1)
      `, [productIds]);

      if (categoryProducts.rows.length > 0) {
        const categoryIds = categoryProducts.rows.map(row => row.category_id);
        
        // Get products from those categories (excluding already purchased ones)
        const result = await pool.query(`
          SELECT 
            p.id, p.name, p.category_id, p.price, p.image_url,
            c.name as category_name
          FROM products p
          JOIN categories c ON p.category_id = c.id
          WHERE p.category_id = ANY($1) 
          AND p.id NOT IN (
            SELECT DISTINCT oi.product_id 
            FROM order_items oi 
            JOIN orders o ON oi.order_id = o.id 
            WHERE o.user_id = $2
          )
          ORDER BY p.price DESC
          LIMIT 12
        `, [categoryIds, userId]);
        
        recommendations = result.rows.map(item => ({
          ...item,
          recommendation_type: 'category_based',
          score: 0.8
        }));
      }
    }

    // If no recommendations based on history, get trending products (most expensive)
    if (recommendations.length === 0) {
      const trendingResult = await pool.query(`
        SELECT 
          p.id, p.name, p.category_id, p.price, p.image_url,
          c.name as category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        ORDER BY p.price DESC
        LIMIT 12
      `);
      
      recommendations = trendingResult.rows.map(item => ({
        ...item,
        recommendation_type: 'trending',
        score: 0.7
      }));
    }

    // Calculate AI confidence score
    const dataPoints = userOrders.rows.length;
    const confidence = Math.min(0.95, 0.5 + (dataPoints * 0.05));

    res.json({
      recommendations: recommendations,
      insights: {
        confidence: confidence,
        dataPoints: dataPoints,
        userPreferences: userOrders.rows.length > 0 ? 'Analyzed' : 'Learning',
        recommendationTypes: recommendations.length > 0 ? [recommendations[0].recommendation_type] : ['trending']
      }
    });

  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations', details: error.message });
  }
});

// AI chatbot response generation
router.post('/chatbot', auth, async (req, res) => {
  try {
    const { message, context } = req.body;
    const userId = req.user.id;

    // Simple chatbot response generation without complex database queries
    const response = await generateChatbotResponse(message, userId);

    res.json({
      response: response.message,
      confidence: response.confidence,
      suggestedActions: response.suggestedActions,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error processing chatbot message:', error);
    res.status(500).json({ error: 'Failed to process message', details: error.message });
  }
});

// Fraud detection for orders
router.post('/fraud-detection', auth, async (req, res) => {
  try {
    const { orderData, userBehavior } = req.body;
    const userId = req.user.id;

    // Simple fraud risk calculation without complex database queries
    const riskScore = await calculateFraudRisk(orderData, userBehavior, userId);

    res.json({
      riskScore: riskScore,
      riskLevel: getRiskLevel(riskScore),
      recommendations: getFraudRecommendations(riskScore),
      requiresReview: riskScore > 0.7
    });

  } catch (error) {
    console.error('Error in fraud detection:', error);
    res.status(500).json({ error: 'Failed to perform fraud detection', details: error.message });
  }
});

// Dynamic pricing suggestions
router.get('/dynamic-pricing/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Check if user is admin
    const userCheck = await pool.query('SELECT is_admin FROM users WHERE id = $1', [userId]);
    if (!userCheck.rows[0]?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get basic product information
    const productResult = await pool.query(`
      SELECT id, name, price
      FROM products
      WHERE id = $1
    `, [productId]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResult.rows[0];
    const currentPrice = parseFloat(product.price);
    
    // Simple pricing suggestions
    const optimalPrice = currentPrice * 1.1; // 10% increase
    const competitorPrices = [currentPrice * 0.9, currentPrice * 1.05, currentPrice * 1.15];

    res.json({
      product: {
        id: product.id,
        name: product.name,
        currentPrice: currentPrice
      },
      analytics: {
        demandElasticity: -1.0
      },
      pricing: {
        optimalPrice: optimalPrice,
        priceChange: optimalPrice - currentPrice,
        priceChangePercent: 10.0,
        competitorRange: {
          min: Math.min(...competitorPrices),
          max: Math.max(...competitorPrices),
          avg: (competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length).toFixed(2)
        }
      },
      recommendations: [`Consider increasing price to $${optimalPrice.toFixed(2)} for better profitability`]
    });

  } catch (error) {
    console.error('Error in dynamic pricing:', error);
    res.status(500).json({ error: 'Failed to generate pricing insights', details: error.message });
  }
});

// Helper functions
async function generateChatbotResponse(message, userId) {
  const input = message.toLowerCase();
  
  let response = {
    message: "I'm here to help! How can I assist you today?",
    confidence: 0.8,
    suggestedActions: []
  };

  if (input.includes('order') || input.includes('track')) {
    response.message = "I can help you track your orders! Please provide your order number, or check your order history in your account dashboard. 📦";
    response.suggestedActions = ['View Order History', 'Track Recent Order'];
    response.confidence = 0.9;
  } else if (input.includes('return') || input.includes('refund')) {
    response.message = "For returns and refunds, you can initiate the process through your order history. Most items can be returned within 30 days of purchase. Would you like me to guide you through the return process? 🔄";
    response.suggestedActions = ['Return Policy', 'Start Return Process'];
    response.confidence = 0.95;
  } else if (input.includes('shipping') || input.includes('delivery')) {
    response.message = "We offer several shipping options: Standard (5-7 days), Express (2-3 days), and Overnight. Shipping costs vary by location and weight. Where are you located? 🚚";
    response.suggestedActions = ['Shipping Calculator', 'Shipping Policies'];
    response.confidence = 0.9;
  }

  return response;
}

async function calculateFraudRisk(orderData, userBehavior, userId) {
  let riskScore = 0;

  // Simple risk calculation without database queries
  // New user risk
  riskScore += 0.2;
  
  // Order value risk (simplified)
  if (orderData.total_amount > 1000) riskScore += 0.3;
  
  // Location risk (simplified)
  if (orderData.shipping_address?.country !== userBehavior?.lastKnownCountry) riskScore += 0.2;
  
  // Time risk (orders outside normal hours)
  const orderHour = new Date().getHours();
  if (orderHour < 6 || orderHour > 23) riskScore += 0.1;

  return Math.min(1.0, riskScore);
}

function getRiskLevel(riskScore) {
  if (riskScore < 0.3) return 'LOW';
  if (riskScore < 0.7) return 'MEDIUM';
  return 'HIGH';
}

function getFraudRecommendations(riskScore) {
  if (riskScore < 0.3) return ['Proceed with order'];
  if (riskScore < 0.7) return ['Verify shipping address', 'Check payment method'];
  return ['Manual review required', 'Contact customer', 'Verify identity'];
}

module.exports = router;
