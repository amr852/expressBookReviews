const express = require('express');
const jwt = require('jsonwebtoken');
const regd_users = express.Router();

const books = require("./booksdb.js");   // Books database
let users = [];  // Array to store user records { username, password }

// Checks if a username is valid (i.e., not already used by another user)
const isValid = (username) => {
    // Username is valid if it is not already present in the users array
    const existingUser = users.find((user) => user.username === username);
    return !existingUser;
}

// Checks if username and password match an existing user (for login)
const authenticatedUser = (username, password) => {
    const validUser = users.find((user) => user.username === username && user.password === password);
    return !!validUser;
}

// Task 7: Login as a registered user
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password." });
    }
    // Generate an access token (JWT) for the valid user
    let accessToken = jwt.sign({ username: username }, "access", { expiresIn: '1h' });
    // Store the token in session
    req.session.authorization = { accessToken };
    return res.status(200).json({ message: "User successfully logged in." });
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.query.review;
    const username = req.user.username;  // The username from JWT (set in middleware)

    if (!reviewText) {
        return res.status(400).json({ message: "No review text provided." });
    }
    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
    // Add or update the review for this ISBN under the current user's username
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }
    books[isbn].reviews[username] = reviewText;
    return res.status(200).json({ 
        message: "Review successfully added/updated.", 
        reviews: books[isbn].reviews 
    });
});

// Task 9: Delete a book review (logged-in user's review only)
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;  // Logged-in user's username from JWT

    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
    let bookReviews = books[isbn].reviews;
    if (bookReviews && bookReviews[username]) {
        // Delete this user's review
        delete bookReviews[username];
        return res.status(200).json({ 
            message: "Your review was deleted successfully.", 
            reviews: books[isbn].reviews 
        });
    } else {
        return res.status(404).json({ message: "No review by this user for the given book." });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
