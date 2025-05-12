const express = require('express');
const userDB = require('../sqlite/sqliteUser');
const jwtAuth = require('../auth/jwt');
const rateLimit = require('express-rate-limit');
const path = require('path');
const validate = require('../auth/validate');

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

router.get('/user/roles', (req, res) => {
    res.sendFile(path.join(__dirname, './../../public/components/editUser/', 'editUser.html'));  // Serve login page from /public folder
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



router.get('/user', jwtAuth.authMiddleware, (req, res) => {
    try {
        const userName = req.query.userName;
        if (!userName) {
            return res.status(400).json({ error: "Missing userName query parameter" });
        }

        const user = userDB.getUserByName(userName);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});


router.post('/delete/user', jwtAuth.authMiddleware, validate.checkRole(['admin', 'mayDeleteUsers']), (req, res) => {
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

router.post('/user/roles', jwtAuth.authMiddleware, validate.checkRole(['admin', 'mayEditUserRole']), async (req, res) => {
    try {
        const { userName, roles } = req.body;  // Assuming body contains userName and roles (array)
        
        // Validate if userName and roles are provided
        if (!userName || !Array.isArray(roles)) {
            return res.status(400).json({ error: 'Invalid input. Please provide a valid username and roles array.' });
        }

        // Call the updateUserRoles method to update the roles
        const result = await userDB.updateUserRoles(userName, roles);

        // Send the result back to the client
        if (result.success) {
            return res.json(result);
        } else {
            return res.status(400).json(result);  // Send error if user update failed
        }
    } catch (error) {
        console.error('Error updating roles for user:', error);
        return res.status(500).json({ error: 'Failed to update user roles' });
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
router.post('/register', registerLimiter, jwtAuth.authMiddleware,  validate.checkRole(['admin', 'mayCreateUsers']), async (req, res) => {
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

