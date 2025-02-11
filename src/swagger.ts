import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from "express";

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Event Management API',
      version: '1.0.0',
      description: 'API for managing event attendees, activities, and scans',
    },
    tags: [
      {
        name: 'Users',
        description: 'User management and information retrieval'
      },
      {
        name: 'Scans',
        description: 'The Scans API allows you to track user activity at events by logging scans of their unique badges.'
      },
      {
        name: 'Friends',
        description: 'Manage friend connections by scanning badges at events.'
      },
      {
        name: 'Activities',
        description: 'API for managing event activities.'
      }
    ]
  },
  apis: ['./src/routes/*.ts'],
};

export const setupSwagger = (app: Express) => {
  const specs = swaggerJsdoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};