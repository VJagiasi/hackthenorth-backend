import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Hack the North API",
    version: "1.0.0",
    description: "API documentation for Hack the North 2025 backend challenge",
  },
  servers: [
    {
      url: "http://localhost:3000", // Local Development
      description: "Local server",
    },
    {
      url: "https://hackthenorth-backend-production.up.railway.app",
      description: "Production server",
    },
  ],
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          name: { type: "string", example: "John Doe" },
          email: { type: "string", format: "email", example: "john.doe@example.com" },
          phone: { type: "string", example: "+1 234 567 8901" },
          badge_code: { type: "string", nullable: true, example: "give-seven-food-trade" },
          updated_at: { type: "string", format: "date-time", example: "2025-02-11T14:23:34.000Z" },
          checked_in: { type: "boolean", example: true },
          scans: {
            type: "array",
            items: {
              type: "object",
              properties: {
                activity_name: { type: "string", example: "Opening Ceremony" },
                activity_category: { type: "string", example: "Ceremony" },
                scanned_at: { type: "string", format: "date-time", example: "2025-02-11T10:30:00.000Z" },
              },
            },
          },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition, // 🔥 Fix: Ensures swaggerDefinition is correctly referenced
  apis: ["./src/routes/*.ts"], // Ensure this path is correct based on your file structure
};

const swaggerSpec = swaggerJsDoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("✅ Swagger API Docs available at /api-docs");
};