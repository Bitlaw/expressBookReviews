// Main application server configuration and route management
const express = require("express"); // Express web framework
const jwt = require("jsonwebtoken"); // JWT authentication library
const session = require("express-session"); // Session management middleware

// Load application route handlers
const customer_routes = require("./router/auth_users.js").authenticated; // Protected customer endpoints
const genl_routes = require("./router/general.js").general; // Public general endpoints

// Initialize Express application
const app = express();

// Parse JSON request bodies automatically
app.use(express.json());

// Configure session middleware for customer routes
app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

// Authentication middleware for protected customer endpoints
app.use("/customer/auth/*", function auth(req, res, next) {
  // Extract JWT token from authorization header
  const token = req.headers.authorization;

  // Reject requests without authentication token
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Token is missing" });
  }

  try {
    // Validate JWT token integrity
    const decoded = jwt.verify(token, "your_secret_key");

    // Token verified, continue request processing
    next();
  } catch (error) {
    // Handle invalid or expired tokens
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
});

// Server configuration port
const PORT = 5000;

// Register customer route handlers
app.use("/customer", customer_routes);

// Register public route handlers
app.use("/", genl_routes);

// Launch server and begin listening for requests
app.listen(PORT, () => console.log("Server is running on port", PORT));
