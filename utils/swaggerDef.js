const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Project Management System API",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [
    path.resolve(__dirname, "../routes/auth.js"),
    path.resolve(__dirname, "../routes/technicians.js"),
    path.resolve(__dirname, "../routes/projects.js"),
    path.resolve(__dirname, "../routes/clients.js"),
    path.resolve(__dirname, "../routes/emails.js"),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
