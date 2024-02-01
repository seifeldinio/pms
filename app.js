const express = require("express");
const { passport } = require("./middlewares/authentication");
const session = require("express-session");
const { sequelize } = require("./models");
const apiRouter = require("./routes/apiRouter");
const middlewares = require("./middlewares/errorHandling");
const scheduler = require("./services/scheduler");
const cors = require("cors");
const compression = require("compression");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./utils/swaggerDef");

require("dotenv").config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000", // Adjust as needed
    credentials: true,
  })
);
app.options("*", cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "rRsVATpDIXruYB1VJWcv8SMBp1hesNno",
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize passport and use the middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/v1", apiRouter);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start the scheduler
scheduler.start();

// Error handling middleware
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

// Database synchronization (create tables)
sequelize
  .sync({ force: process.env.NODE_ENV === "development", charset: "utf8mb4" })
  .then(() => {
    console.log("Database synced");
  });

// sequelize.sync({ force: process.env.NODE_ENV === "development" }).then(() => {
//   console.log("Database synced");
// });

// sequelize.sync({ force: false }).then(() => {
//   console.log("Database synced");
// });

// Start the server
const APP_PORT = process.env.APP_PORT || 3000;
const server = app.listen(APP_PORT, () => {
  console.log(`Server is running on port ${APP_PORT}`);
});

// Export server and sequelize for testing
module.exports = { app, sequelize, server };
