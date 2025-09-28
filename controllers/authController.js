const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { sanitizeUser } = require('../utils/helpers');

const authController = {
  async register(req, res) {
    try {
      const { email, name, password } = req.body;
      
      // Validation
      if (!email || !name || !password) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          fields: { email: !email, name: !name, password: !password }
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          error: 'Password too short',
          message: 'Password must be at least 6 characters long'
        });
      }

      // Check if user exists
      const existingUser = await db('Users').where('email', email).first();
      if (existingUser) {
        return res.status(409).json({ 
          error: 'User already exists',
          message: 'A user with this email already exists'
        });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 12);

      // Create user
      const [userId] = await db('Users').insert({
        email: email.toLowerCase().trim(),
        name: name.trim(),
        password_hash
      });

      // Get created user
      const user = await db('Users')
        .where('id', userId)
        .select('id', 'email', 'name', 'created_at')
        .first();

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: sanitizeUser(user)
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        error: 'Registration failed',
        message: 'Could not create user account'
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Missing credentials',
          fields: { email: !email, password: !password }
        });
      }

      // Find user
      const user = await db('Users')
        .where('email', email.toLowerCase().trim())
        .first();

      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ 
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      // Create session token
      const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email 
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' } // 7 days expiration
      );

      // Store session
      const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await db('UserSessions').insert({
        user_id: user.id,
        token,
        expires_at,
        ip_address: req.ip || req.connection.remoteAddress
      });

      // Clean up expired sessions
      await db('UserSessions')
        .where('expires_at', '<', new Date())
        .del();

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: sanitizeUser(user),
        expires_at: expires_at.toISOString()
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        error: 'Login failed',
        message: 'Could not authenticate user'
      });
    }
  },

  async logout(req, res) {
    try {
      const token = req.headers['authorization']?.split(' ')[1];
      
      if (token) {
        await db('UserSessions').where('token', token).del();
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        error: 'Logout failed',
        message: 'Could not logout user'
      });
    }
  },

  async getProfile(req, res) {
    try {
      const user = await db('Users')
        .where('id', req.user.id)
        .select('id', 'email', 'name', 'created_at')
        .first();

      if (!user) {
        return res.status(404).json({ 
          error: 'User not found',
          message: 'User account no longer exists'
        });
      }

      res.json({
        success: true,
        user: sanitizeUser(user)
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        error: 'Could not fetch profile',
        message: 'Failed to retrieve user information'
      });
    }
  },

  async updateProfile(req, res) {
    try {
      const { name, email } = req.body;
      const updates = {};

      if (name) updates.name = name.trim();
      if (email) {
        // Check if email is already taken by another user
        const existingUser = await db('Users')
          .where('email', email.toLowerCase().trim())
          .whereNot('id', req.user.id)
          .first();

        if (existingUser) {
          return res.status(409).json({ 
            error: 'Email already taken',
            message: 'Another user is already using this email'
          });
        }
        updates.email = email.toLowerCase().trim();
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ 
          error: 'No updates provided',
          message: 'Provide name or email to update'
        });
      }

      await db('Users')
        .where('id', req.user.id)
        .update(updates);

      const updatedUser = await db('Users')
        .where('id', req.user.id)
        .select('id', 'email', 'name', 'created_at')
        .first();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: sanitizeUser(updatedUser)
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ 
        error: 'Profile update failed',
        message: 'Could not update user profile'
      });
    }
  }
};

module.exports = authController;