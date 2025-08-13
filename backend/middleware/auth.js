const jwt = require('jsonwebtoken');
const pool = require('../db');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist
    const userResult = await pool.query('SELECT id, email, first_name, last_name, is_admin FROM users WHERE id = $1', [decoded.user.id]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ msg: 'Token is not valid' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ msg: 'Token is not valid' });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token has expired' });
    }
    console.error('Auth middleware error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    
    if (!req.user.is_admin) {
      return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
    }
    
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { auth, adminAuth };
