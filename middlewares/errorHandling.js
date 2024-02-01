function notFound(req, res, next) {
  if (req.originalUrl === "/") {
    // If the request is for the root route, provide a welcome message with links
    const welcomeMessage = `
      Welcome to the Project Management System API! 👷<br><br>
      Explore the API Documentation: <a href="/api-docs" target="_blank">API Documentation</a><br>
      Test the API using Postman: <a href="/postman-collection" target="_blank">Postman Collection</a>
    `;
    res.send(welcomeMessage);
  } else {
    // If the request is for any other route, return a 404 error
    res.status(404);
    const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
    next(error);
  }
}

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  /* eslint-enable no-unused-vars */
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
}

module.exports = {
  notFound,
  errorHandler,
};
