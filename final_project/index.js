const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;  // Authenticated routes
const genl_routes = require('./router/general.js').general;               // Public routes

const app = express();
app.use(express.json());

// Session setup for customers
app.use("/customer", session({
    secret: "fingerprint_customer", // Secret for encrypting session ID
    resave: true,
    saveUninitialized: true
}));

// JWT authentication middleware for protected routes under '/customer/auth/*'
app.use("/customer/auth/*", (req, res, next) => {
    if (req.session.authorization) {
        // Retrieve the token stored in session
        const token = req.session.authorization['accessToken'];
        try {
            // Verify token using the same secret used to sign it
            const decoded = jwt.verify(token, "access");
            req.user = decoded;  // Attach decoded token payload (e.g., username) to request
            next();
        } catch (err) {
            return res.status(403).json({ message: "User not authenticated" });
        }
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

// Use routers for defined routes
app.use("/customer", customer_routes);  // Routes for registered/authenticated users
app.use("/", genl_routes);             // Routes for general (public) users

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
