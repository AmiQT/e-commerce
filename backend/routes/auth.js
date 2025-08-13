const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authLimiter } = require('../middleware/rateLimit');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

// Register a new user
router.post('/register', validateRegistration, async (req, res, next) => {
  try {
    const { email, password, first_name, last_name } = req.body;
    
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name',
      [email, password_hash, first_name, last_name]
    );
    
    // Generate JWT token
    const payload = {
      user: {
        id: newUser.rows[0].id,
        email: newUser.rows[0].email
      }
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      user: newUser.rows[0],
      token 
    });
  } catch (err) {
    next(err);
  }
});

// Login user
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        email: user.email
      }
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_admin: user.is_admin
      },
      token
    });
  } catch (err) {
    next(err);
  }
});

// Get user profile (protected route)
router.get('/profile', async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userResult = await pool.query('SELECT id, email, first_name, last_name, is_admin FROM users WHERE id = $1', [decoded.user.id]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ msg: 'Token is not valid' });
    }

    res.json({ user: userResult.rows[0] });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ msg: 'Token is not valid' });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token has expired' });
    }
    next(err);
  }
});

// Update user profile (protected route)
router.put('/profile', auth, async (req, res, next) => {
  try {
    const { first_name, last_name, email } = req.body;
    const userId = req.user.id;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ msg: 'Email is already taken' });
      }
    }

    // Update user profile
    const updateResult = await pool.query(
      'UPDATE users SET first_name = $1, last_name = $2, email = $3 WHERE id = $4 RETURNING id, email, first_name, last_name, is_admin',
      [first_name, last_name, email, userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ 
      success: true, 
      user: updateResult.rows[0],
      msg: 'Profile updated successfully' 
    });
  } catch (err) {
    next(err);
  }
});

// Change password (protected route)
router.put('/change-password', auth, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.id;

    // Get current user to verify current password
    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

    // Update password
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, userId]);

    res.json({ 
      success: true, 
      msg: 'Password changed successfully' 
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
