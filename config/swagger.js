const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const { updateCollection } = require('../controllers/collectionController');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Postman Swagger API',
      version: '1.0.0',
      description: 'A complete Postman clone API with workspace, collection, and request management',
      contact: {
        name: 'API Support',
        email: 'support@postmanclone.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
              created_at: { type: 'string', format: 'date-time' },
              //updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Workspace: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'My Workspace' },
            creator_id: { type: 'integer', example: 1 },
              created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Collection: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            workspace_id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'API Collection' },
              created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Request: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            collection_id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Get Users' },
            method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'], example: 'GET' },
            url: { type: 'string', example: 'https://api.example.com/users' },
            body: { type: 'string', example: '{"key": "value"}' },
            headers: { type: 'object', example: {'Content-Type': 'application/json'} },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Error message' },
            message: { type: 'string', example: 'Detailed error description' }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object', description: 'Response data' }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { success: false, error: 'Unauthorized', message: 'Access token required' }
            }
          }
        },
        NotFoundError: {
          description: 'The requested resource was not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { success: false, error: 'Not Found', message: 'Resource not found' }
            }
          }
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { success: false, error: 'Validation Failed', message: 'Invalid input data' }
            }
          }
        }
      }
    },
    security: [ { bearerAuth: [] } ]
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi
};