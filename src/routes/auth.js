const express = require('express');
const userDB = require('../sqlite/sqliteUser');
const jwtAuth = require('../auth/jwt');
const rateLimit = require('express-rate-limit');
const path = require('path');

const router = express.Router();

// Rate limiter for login to prevent brute-force
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: { success: false, message: 'Too many login attempts, please try again later' }
});

// Rate limiter for registration to prevent brute-force (optional but recommended)
const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: { success: false, message: 'Too many registration attempts, please try again later' }
});

// Serve login page (HTML)
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, './../../public/login/', 'login.html'));  // Serve login page from /public folder
});

router.get('/delete/user', (req, res) => {
    res.sendFile(path.join(__dirname, './../../public/components/deleteUser/', 'deleteUser.html'));  // Serve login page from /public folder
});

// Serve register page (HTML)
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, './../../public/register/', 'register.html'));  // Serve register page from /public folder
});

router.get('/users', jwtAuth.authMiddleware, (req, res) => {
    try {
        const users = userDB.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.post('/delete/user', jwtAuth.authMiddleware, (req, res) => {
    try {
        const user = req.query.userName
        if (!user) res.status(400);

        const deleted = userDB.deleteUser(user);
        if (deleted.success) res.status(200).json({ status: "USER DELETED!" });
        else res.status(400)
    } catch (error) {
        console.error('Error deleting users:', error);
        res.status(500).json({ error: 'Failed to delete users' });
    }
});

// Login route
router.post('/login', loginLimiter, async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const result = await userDB.validateUserAndGenerateToken(name, password);

    if (!result.success) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' }); // Generic error message
    }

    return res.status(200).json(result);
});

// Register route (protected)
router.post('/register', registerLimiter, jwtAuth.authMiddleware, async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const result = await userDB.createUser(name, password);

    if (!result.success) {
        return res.status(409).json({ success: false, message: 'Registration failed' });
    }

    return res.status(201).json(result);
});

module.exports = router;

