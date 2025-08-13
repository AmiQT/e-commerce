const express = require('express');
const router = express.Router();
const pool = require('../db');
const { auth } = require('../middleware/auth');

// Get user preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(`
      SELECT 
        email_notifications,
        sms_notifications,
        marketing_emails,
        order_updates,
        product_recommendations,
        newsletter_subscription,
        language,
        currency,
        timezone,
        theme
      FROM user_preferences 
      WHERE user_id = $1
    `, [userId]);
    
    if (result.rows.length === 0) {
      // Create default preferences if none exist
      const defaultPreferences = {
        email_notifications: true,
        sms_notifications: false,
        marketing_emails: false,
        order_updates: true,
        product_recommendations: true,
        newsletter_subscription: false,
        language: 'en',
        currency: 'USD',
        timezone: 'UTC',
        theme: 'light'
      };
      
      await pool.query(`
        INSERT INTO user_preferences (user_id, email_notifications, sms_notifications, marketing_emails, order_updates, product_recommendations, newsletter_subscription, language, currency, timezone, theme)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        userId,
        defaultPreferences.email_notifications,
        defaultPreferences.sms_notifications,
        defaultPreferences.marketing_emails,
        defaultPreferences.order_updates,
        defaultPreferences.product_recommendations,
        defaultPreferences.newsletter_subscription,
        defaultPreferences.language,
        defaultPreferences.currency,
        defaultPreferences.timezone,
        defaultPreferences.theme
      ]);
      
      return res.json(defaultPreferences);
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ error: 'Failed to fetch user preferences' });
  }
});

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      email_notifications,
      sms_notifications,
      marketing_emails,
      order_updates,
      product_recommendations,
      newsletter_subscription,
      language,
      currency,
      timezone,
      theme
    } = req.body;
    
    // Validate input
    const validLanguages = ['en', 'es', 'fr', 'de'];
    const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD'];
    const validThemes = ['light', 'dark', 'auto'];
    
    if (language && !validLanguages.includes(language)) {
      return res.status(400).json({ error: 'Invalid language' });
    }
    
    if (currency && !validCurrencies.includes(currency)) {
      return res.status(400).json({ error: 'Invalid currency' });
    }
    
    if (theme && !validThemes.includes(theme)) {
      return res.status(400).json({ error: 'Invalid theme' });
    }
    
    // Check if preferences exist
    const checkResult = await pool.query(`
      SELECT id FROM user_preferences WHERE user_id = $1
    `, [userId]);
    
    if (checkResult.rows.length === 0) {
      // Create new preferences
      await pool.query(`
        INSERT INTO user_preferences (
          user_id, email_notifications, sms_notifications, marketing_emails, 
          order_updates, product_recommendations, newsletter_subscription, language, 
          currency, timezone, theme
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        userId,
        email_notifications ?? true,
        sms_notifications ?? false,
        marketing_emails ?? false,
        order_updates ?? true,
        product_recommendations ?? true,
        newsletter_subscription ?? false,
        language ?? 'en',
        currency ?? 'USD',
        timezone ?? 'UTC',
        theme ?? 'light'
      ]);
    } else {
      // Update existing preferences
      await pool.query(`
        UPDATE user_preferences SET
          email_notifications = COALESCE($2, email_notifications),
          sms_notifications = COALESCE($3, sms_notifications),
          marketing_emails = COALESCE($4, marketing_emails),
          order_updates = COALESCE($5, order_updates),
          product_recommendations = COALESCE($6, product_recommendations),
          newsletter_subscription = COALESCE($7, newsletter_subscription),
          language = COALESCE($8, language),
          currency = COALESCE($9, currency),
          timezone = COALESCE($10, timezone),
          theme = COALESCE($11, theme),
          updated_at = NOW()
        WHERE user_id = $1
      `, [
        userId,
        email_notifications,
        sms_notifications,
        marketing_emails,
        order_updates,
        product_recommendations,
        newsletter_subscription,
        language,
        currency,
        timezone,
        theme
      ]);
    }
    
    res.json({ message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ error: 'Failed to update user preferences' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(`
      SELECT 
        id, email, first_name, last_name, is_admin, created_at,
        phone, address, city, state, zip_code, country
      FROM users 
      WHERE id = $1
    `, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      first_name,
      last_name,
      phone,
      address,
      city,
      state,
      zip_code,
      country
    } = req.body;
    
    // Validate required fields
    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }
    
    const result = await pool.query(`
      UPDATE users SET
        first_name = $2,
        last_name = $3,
        phone = $4,
        address = $5,
        city = $6,
        state = $7,
        zip_code = $8,
        country = $9,
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, first_name, last_name, phone, address, city, state, zip_code, country
    `, [
      userId,
      first_name,
      last_name,
      phone || null,
      address || null,
      city || null,
      state || null,
      zip_code || null,
      country || null
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

module.exports = router;
