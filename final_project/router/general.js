// Public book access and user registration module
const express = require("express");

// Load book database and authentication utilities
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

// Create router for public endpoints
const public_users = express.Router();

// Handle new user account creation
public_users.post("/register", (req, res) => {
  // Extract registration data from request
  const { username, email, password } = req.body;

  // Validate required registration fields
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "Username, email, and password are required" });
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  // Prevent duplicate username registration
  if (users.some((user) => user.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Process password security (placeholder - use bcrypt in production)
  const hashedPassword = hashPassword(password);

  // Store new user account
  const newUser = { username, email, password: hashedPassword };
  users.push(newUser);

  return res.status(200).json({ message: "User registered successfully" });
});

// Validate email address format
function isValidEmail(email) {
  // Email validation pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Secure password storage (placeholder implementation)
function hashPassword(password) {
  // Production implementation should use bcrypt or similar
  return password;
}

// Provide list of all available books
public_users.get("/", function (req, res) {
  // Filter for books marked as available
  const availableBooks = books.filter((book) => book.available);

  // Handle case where no books are available
  if (availableBooks.length === 0) {
    return res.status(404).json({ message: "No books available" });
  }

  // Return available book collection
  return res.status(200).json(availableBooks);
});

// Retrieve book information by ISBN identifier
public_users.get("/isbn/:isbn", function (req, res) {
  // Get ISBN parameter from request
  const isbn = req.params.isbn;

  // Fetch book details using ISBN lookup
  const book = books.getBookByISBN(isbn);

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Find books by specific author name
public_users.get("/author/:author", function (req, res) {
  // Extract author parameter from request
  const author = req.params.author;

  // Search for books by requested author
  const booksByAuthor = books.getBooksByAuthor(author);

  if (booksByAuthor.length > 0) {
    return res.status(200).json(booksByAuthor);
  } else {
    return res.status(404).json({ message: "Books by this author not found" });
  }
});

// Search for books by title keyword
public_users.get("/title/:title", function (req, res) {
  // Get title parameter from request
  const title = req.params.title;

  // Find books matching the title search
  const booksWithTitle = books.getBooksByTitle(title);

  if (booksWithTitle.length > 0) {
    return res.status(200).json(booksWithTitle);
  } else {
    return res.status(404).json({ message: "Books with this title not found" });
  }
});

// Access book reviews by ISBN
public_users.get("/review/:isbn", function (req, res) {
  // Extract ISBN from request parameters
  const isbn = req.params.isbn;

  // Retrieve reviews for specified book
  const bookReview = books.getBookReviewByISBN(isbn);

  if (bookReview) {
    return res.status(200).json({ review: bookReview });
  } else {
    return res.status(404).json({ message: "Review for this book not found" });
  }
});

// Export public routes router
module.exports.general = public_users;
