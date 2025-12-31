const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Onementor API',
      version: '1.0.0',
      description: 'A simple API for managing users and OTP authentication',
    },
    servers: [
      {
        url: 'http://localhost:8001',
        description: 'Development server',
      },
      {
        url: 'https://api.onementor.in',
        description: 'Production server',
      }
    ],
    components: {
      securitySchemes: {
        sessionCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
          description: 'Session cookie authentication',
        },
      },
    },
  },
  // Include all JS files recursively in routes and controller directories
  apis: [
    './routes/**/*.js',
    './controller/**/*.js',
    './routes/*.js',
    './controller/*.js',
    './index.js',
  ],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
