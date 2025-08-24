// Import necessary modules
const express = require("express");
const axios = require("axios");

// Import database of books and authentication functions
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

// Create a router instance for public user routes
const public_users = express.Router();

// Function to validate email format
function isValidEmail(email) {
  // Regular expression to validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to hash the password
function hashPassword(password) {
  // Implement password hashing logic (using bcrypt or any other suitable library)
  return password; // For demonstration purposes, returning the password as is
}

// Task 1: Route: Get the list of available books
public_users.get("/", function (req, res) {
  // Convert books object to array and display neatly
  const booksArray = Object.values(books);
  return res.status(200).json(booksArray);
});

// Task 2: Route: Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  // Retrieve the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Check if book exists
  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Task 3: Route: Get book details based on author
public_users.get("/author/:author", function (req, res) {
  // Obtain all the keys for the 'books' object
  const bookKeys = Object.keys(books);

  // Iterate through the 'books' object & check the author matches
  const booksByAuthor = [];
  bookKeys.forEach((key) => {
    if (books[key].author === req.params.author) {
      booksByAuthor.push(books[key]);
    }
  });

  // Check if books were found
  if (booksByAuthor.length > 0) {
    return res.status(200).json(booksByAuthor);
  } else {
    return res.status(404).json({ message: "Books by this author not found" });
  }
});

// Task 4: Route: Get book details based on title
public_users.get("/title/:title", function (req, res) {
  // Obtain all the keys for the 'books' object
  const bookKeys = Object.keys(books);

  // Iterate through the 'books' object & check the title matches
  const booksByTitle = [];
  bookKeys.forEach((key) => {
    if (books[key].title === req.params.title) {
      booksByTitle.push(books[key]);
    }
  });

  // Check if books were found
  if (booksByTitle.length > 0) {
    return res.status(200).json(booksByTitle);
  } else {
    return res.status(404).json({ message: "Books with this title not found" });
  }
});

// Task 5: Route: Get book reviews
public_users.get("/review/:isbn", function (req, res) {
  // Get the book reviews based on ISBN provided in the request parameters
  const isbn = req.params.isbn;

  // Check if book exists
  if (books[isbn]) {
    return res.status(200).json({ reviews: books[isbn].reviews });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Task 6: Route: Register a new user
public_users.post("/register", (req, res) => {
  // Extract user data from request body
  const { username, password } = req.body;

  // Check if required fields are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Check if the username is already taken
  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Create new user (in real app, hash password)
  const newUser = { username, password }; // Note: In production, hash the password
  users.push(newUser);

  return res.status(200).json({ message: "User registered successfully" });
});

// Task 10: Get all books using Promise callbacks with Axios
public_users.get("/async/books", function (req, res) {
  // This is a simulation since we're not making external API calls
  // In a real scenario, you would use axios.get() to call an external API

  // Using Promise
  const getAllBooksPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const booksArray = Object.values(books);
        resolve(booksArray);
      } catch (error) {
        reject(error);
      }
    }, 100);
  });

  getAllBooksPromise
    .then((booksResult) => {
      return res.status(200).json(booksResult);
    })
    .catch((error) => {
      return res
        .status(500)
        .json({ message: "Error retrieving books", error: error.message });
    });
});

// Task 11: Get book details by ISBN using async/await
public_users.get("/async/isbn/:isbn", async function (req, res) {
  try {
    const isbn = req.params.isbn;

    // Create a Promise to simulate async operation
    const getBookByISBNPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (books[isbn]) {
          resolve(books[isbn]);
        } else {
          reject(new Error("Book not found"));
        }
      }, 100);
    });

    // Use async/await with the Promise
    const book = await getBookByISBNPromise;
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Task 12: Get books by author using Promise callbacks
public_users.get("/async/author/:author", function (req, res) {
  const author = req.params.author;

  // Create a Promise to simulate async operation
  const getBooksByAuthorPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const bookKeys = Object.keys(books);
        const booksByAuthor = [];
        bookKeys.forEach((key) => {
          if (books[key].author === author) {
            booksByAuthor.push(books[key]);
          }
        });
        resolve(booksByAuthor);
      } catch (error) {
        reject(error);
      }
    }, 100);
  });

  // Use Promise callbacks
  getBooksByAuthorPromise
    .then((booksResult) => {
      if (booksResult.length > 0) {
        return res.status(200).json(booksResult);
      } else {
        return res
          .status(404)
          .json({ message: "Books by this author not found" });
      }
    })
    .catch((error) => {
      return res
        .status(500)
        .json({ message: "Error retrieving books", error: error.message });
    });
});

// Task 13: Get books by title using async/await
public_users.get("/async/title/:title", async function (req, res) {
  try {
    const title = req.params.title;

    // Create a Promise to simulate async operation
    const getBooksByTitlePromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const bookKeys = Object.keys(books);
          const booksByTitle = [];
          bookKeys.forEach((key) => {
            if (books[key].title === title) {
              booksByTitle.push(books[key]);
            }
          });
          resolve(booksByTitle);
        } catch (error) {
          reject(error);
        }
      }, 100);
    });

    // Use async/await
    const booksResult = await getBooksByTitlePromise;

    if (booksResult.length > 0) {
      return res.status(200).json(booksResult);
    } else {
      return res
        .status(404)
        .json({ message: "Books with this title not found" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error retrieving books", error: error.message });
  }
});

// Export the router containing public user routes
module.exports.general = public_users;
