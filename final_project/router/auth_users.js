// User authentication and book review management module
const express = require("express");
const jwt = require("jsonwebtoken");

// Load book database
let books = require("./booksdb.js");

// Create router for authenticated user endpoints
const regd_users = express.Router();

// Store registered user accounts
let users = [];

// Validate username format and restrictions
const isValid = (username) => {
  // Basic validation: username must exist and be alphanumeric
  if (!username || !/^[a-zA-Z0-9]+$/.test(username)) {
    return false;
  }

  // Length validation: username between 3-20 characters
  if (username.length < 3 || username.length > 20) {
    return false;
  }

  // Character validation: only letters and numbers allowed
  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    return false;
  }

  // Reserved username check: prevent common administrative names
  const reservedUsernames = ["admin", "root", "superuser"];
  if (reservedUsernames.includes(username.toLowerCase())) {
    return false;
  }

  // Username passes all validation checks
  return true;
};

// Verify user credentials against stored records
const authenticatedUser = (username, password) => {
  // Ensure both credentials are provided
  if (!username || !password) {
    return false;
  }

  // Locate user in database by username
  const user = users.find((user) => user.username === username);

  // Reject if user doesn't exist
  if (!user) {
    return false;
  }

  // Compare provided password with stored password
  // Note: In production, use bcrypt or similar for secure password hashing
  if (user.password === password) {
    return true;
  }

  // Authentication failed
  return false;
};

// Handle user authentication and JWT token generation
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate required credentials
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Authenticate user credentials
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Create secure JWT token for session management
  const token = jwt.sign({ username: username }, "your_secret_key");

  // Send authentication token to client
  return res.status(200).json({ token: token });
});

// Allow authenticated users to submit book reviews
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;

  // Ensure review content is provided
  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  // Verify book exists in database
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add new review to book's review collection
  books[isbn].reviews.push(review);

  // Confirm successful review submission
  return res.status(200).json({ message: "Review added successfully" });
});

// Export authenticated user router
module.exports.authenticated = regd_users;

// Export username validation function
module.exports.isValid = isValid;

// Export user database
module.exports.users = users;
