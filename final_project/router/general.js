const express = require('express');
const axios = require('axios');
const public_users = express.Router();

const books = require("./booksdb.js");             // Books database (in-memory object)
const isValid = require("./auth_users.js").isValid; // Function to check valid username (not already taken)
const users = require("./auth_users.js").users;     // Users database (array)

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }
    if (!isValid(username)) {
        return res.status(400).json({ message: "Username already exists. Choose a different username." });
    }
    // If we reach here, the username is available
    users.push({ username: username, password: password });
    return res.status(201).json({ message: "User successfully registered. You can now login." });
});

// Task 1: Get the list of all books
public_users.get("/", (req, res) => {
    // Return all books as JSON (with pretty-print formatting)
    return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get("/isbn/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.status(200).send(JSON.stringify(book, null, 4));
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
});

// Task 3: Get book details based on author name
public_users.get("/author/:author", (req, res) => {
    const authorName = req.params.author;
    // Filter books where author matches (case-sensitive match)
    const booksByAuthor = Object.values(books).filter((book) => book.author === authorName);
    if (booksByAuthor.length > 0) {
        return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
    } else {
        return res.status(404).json({ message: `No books found by author ${authorName}.` });
    }
});

// Task 4: Get all books based on title
public_users.get("/title/:title", (req, res) => {
    const title = req.params.title;
    // Filter books where title matches (exact match)
    const booksByTitle = Object.values(books).filter((book) => book.title === title);
    if (booksByTitle.length > 0) {
        return res.status(200).send(JSON.stringify(booksByTitle, null, 4));
    } else {
        return res.status(404).json({ message: `No books found with title "${title}".` });
    }
});

// Task 5: Get book review for a given ISBN
public_users.get("/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.status(200).send(JSON.stringify(book.reviews, null, 4));
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
});
public_users.get("/async/books", async (req, res) => {
    try {
       
        const response = await axios.get(`http://localhost:5000/`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
public_users.get("/async/isbn/:isbn", async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.`, error: error.message });
    }
});


public_users.get("/async/author/:author", async (req, res) => {
    const authorName = req.params.author;
    try {
       
        const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(authorName)}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(404).json({ message: `No books found by author ${authorName}.` });
    }
});

// Task 13: Get books by title (asynchronous example)
public_users.get("/async/title/:title", async (req, res) => {
    const title = req.params.title;
    try {
        const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(404).json({ message: `No books found with title "${title}".` });
    }
});

module.exports.general = public_users;
