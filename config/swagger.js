const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Postman Clone Swagger API',
      version: '1.0.0',
      description: 'A complete Postman clone API with workspace, collection, and request management',
      contact: {
        name: 'API Support',
        email: 'support@postmanclone.com'
      },
      // termsOfService: 'http://swagger.io/terms/',
      // license: {
      //   name: 'MIT',
      //   url: 'https://opensource.org/licenses/MIT'
      // }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000/api',
        description: 'Development server'
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and registration'
      },
      {
        name: 'Workspaces',
        description: 'Operations related to workspaces'
      },
      {
        name: 'Collections',
        description: 'Operations related to collections'
      },
      {
        name: 'Requests',
        description: 'Operations related to requests'
      },
      {
        name: 'Environments',
        description: 'Operations related to environments'
      },
      {
        name: 'Variables',
        description: 'Operations related to variables'
      },
      {
        name: 'Responses',
        description: 'Operations related to responses'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};