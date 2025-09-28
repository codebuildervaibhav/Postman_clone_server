
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Swagger documentation
const { specs, swaggerUi } = require('./config/swagger');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Postman Clone API Documentation'
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import routes
const authRoutes = require('./routes/auth');
const workspaceRoutes = require('./routes/workspaces');
const collectionRoutes = require('./routes/collections');
const requestRoutes = require('./routes/requests');
const environmentRoutes = require('./routes/environments');
const variableRoutes = require('./routes/variables');
const responseRoutes = require('./routes/responses');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/environments', environmentRoutes);
app.use('/api/variables', variableRoutes);
app.use('/api/responses', responseRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running!',
    database: 'Connected to postman_clone_db',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    documentation: '/api-docs'
  });
});

// Root endpoint - redirect to documentation
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  
  // Database errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ 
      error: 'Duplicate entry',
      message: 'This record already exists'
    });
  }
  
  if (err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({ 
      error: 'Invalid reference',
      message: 'The referenced record does not exist'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Default error
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl,
    documentation: '/api-docs'
  });
});

// 404 handler for non-API routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: 'Use /api endpoints for API access',
    documentation: '/api-docs'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database: ${process.env.DB_NAME || 'postman_clone_db'}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});

module.exports = app;