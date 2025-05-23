const express = require('express');
const userDB = require('../sqlite/sqliteUser');
const jwtAuth = require('../auth/jwt');
const path = require('path');
const { TASK_STATES, PRIORITY_LEVELS, CATEGORIES, TYPES } = require('./../sqlite/constants.js');

const router = express.Router();

router.get('/', (req, res) => {
    // Assuming the user has a name property in the JWT payload
    
    // Render the dashboard page and pass the username to the page
    res.sendFile(path.join(__dirname, './../../public/dashboard/', 'dashboard.html'));  // Serve dashboard page from /public folder
});

router.get('/loggedIn', (req, res, next) => jwtAuth.authMiddleware(req, res, next), (req, res) => {
    res.status(200).json({ success: true });
});

router.get('/tasks/view', (req, res) => {
    res.sendFile(path.join(__dirname, './../../public/tasks/viewTask/', 'view.html')); 
});

router.get('/tasks/user', (req, res) => {
    res.sendFile(path.join(__dirname, './../../public/tasks/tasksUser/', 'tasksUser.html')); 
});

router.get('/tasks/edit', (req, res) => {
    res.sendFile(path.join(__dirname, './../../public/tasks/editTask/', 'edit.html')); 
});

router.get('/tasks/filter', (req, res) => {
    res.sendFile(path.join(__dirname, './../../public/tasks/tasksFilter/', 'filterTask.html')); 
});

router.get('/lists', jwtAuth.authMiddleware.bind(jwtAuth), (req, res) => {
  const listKey = req.query.list;

  if (!listKey) {
    return res.status(400).json({ error: "Missing 'list' query parameter." });
  }

  const lists = {
        STATE: TASK_STATES,
        PRIORITY: PRIORITY_LEVELS,
        CATEGORIES,
        TYPES
  };

  const result = lists[listKey];
  if (!result) {
    return res.status(404).json({ error: `List '${listKey}' not found.` });
  }

  return res.json({ [listKey]: result });
});

// Logout route to clear JWT and redirect to login page
router.get('/logout', (req, res) => {
    // Here we might simply clear the token from the client side
    res.clearCookie('jwt');  // If you're using cookies for storing the JWT token
    res.redirect('/auth/login');  // Redirect to login page
});

module.exports = router;
