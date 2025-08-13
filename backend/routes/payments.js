const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Create payment intent for Stripe
router.post('/create-intent', auth, async (req, res, next) => {
  try {
    const { amount, currency, payment_method_types } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // For now, return a mock client secret
    // In production, this would integrate with Stripe
    const clientSecret = 'pi_mock_' + Date.now() + '_secret_' + Math.random().toString(36).substr(2, 9);
    
    res.json({
      clientSecret,
      amount,
      currency: currency || 'usd'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
