// Import necessary modules
const express = require("express");
const jwt = require("jsonwebtoken");

// Import database of books
let books = require("./booksdb.js");

// Create a router instance for registered user routes
const regd_users = express.Router();

// Initialize an empty array to store registered users
let users = [];

// Function to check if a username is valid
const isValid = (username) => {
  // Check if the username is not empty and is alphanumeric
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

// Function to check if a username and password match the records
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

// Task 7: Route to handle user login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Check if the user is registered and the provided credentials are correct
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate JWT token
  const token = jwt.sign({ username: username }, "your_secret_key");

  // Return the token as a response
  return res.status(200).json({ token: token });
});

// Task 8: Route to add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const username = req.user.username; // Get username from JWT token

  // Check if review is provided
  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Initialize reviews object if it doesn't exist
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or modify the review (username as key)
  books[isbn].reviews[username] = review;

  // Return success message
  return res
    .status(200)
    .json({ message: "Review added/modified successfully" });
});

// Task 9: Route to delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.user.username; // Get username from JWT token

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the book has reviews
  if (!books[isbn].reviews) {
    return res.status(404).json({ message: "No reviews found for this book" });
  }

  // Check if the user has a review for this book
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user" });
  }

  // Delete the user's review
  delete books[isbn].reviews[username];

  // Return success message
  return res.status(200).json({ message: "Review deleted successfully" });
});

// Export the router containing registered user routes
module.exports.authenticated = regd_users;

// Export the isValid function to validate usernames
module.exports.isValid = isValid;

// Export the users array to store registered users
module.exports.users = users;
