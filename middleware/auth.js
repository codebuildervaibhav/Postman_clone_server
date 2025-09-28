const jwt = require('jsonwebtoken');
const db = require('../db');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Please provide a Bearer token in Authorization header'
      });
    }

    // Verify token signature
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Token verification failed'
      });
    }

    // Check session in database
    const session = await db('UserSessions')
      .where('token', token)
      .where('expires_at', '>', new Date())
      .first();

    if (!session) {
      return res.status(401).json({ 
        error: 'Invalid or expired session',
        message: 'Please login again'
      });
    }

    // Get user data
    const user = await db('Users')
      .where('id', session.user_id)
      .select('id', 'email', 'name', 'created_at')
      .first();

    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        message: 'User account no longer exists'
      });
    }

    // Attach user and session to request
    req.user = user;
    req.session = session;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      message: 'Internal server error during authentication'
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const session = await db('UserSessions')
        .where('token', token)
        .where('expires_at', '>', new Date())
        .first();

      if (session) {
        const user = await db('Users')
          .where('id', session.user_id)
          .select('id', 'email', 'name', 'created_at')
          .first();

        if (user) {
          req.user = user;
          req.session = session;
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = { 
  authenticateToken, 
  optionalAuth 
};