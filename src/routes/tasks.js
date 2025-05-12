const express = require('express');
const router = express.Router();
const dbTasks = require('../sqlite/sqliteTasks');
const jwtAuth = require('../auth/jwt');
const validate = require('../auth/validate');

router.get('/filter', jwtAuth.authMiddleware.bind(jwtAuth), (req, res) => {
    // GET /tasks/filter
    // Example: GET http://localhost:3000/api/tasks/filter?state=open&priority=High&limit=5&offset=10
    // This endpoint fetches tasks based on filters and pagination

    try {
        // Extract filters from query string
        const allowedFilters = dbTasks.getAllowedFilterKeys();
        const filters = {};

        for (const key of allowedFilters) {
            if (req.query[key]) {
                filters[key] = req.query[key];
            }
        }

        // Pagination params
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;

        // Validate bounds
        const safeLimit = Math.max(1, Math.min(limit, 100));
        const safeOffset = Math.max(0, offset);

        // Fetch data
        const tasks = dbTasks.getTasksByFilters(filters, { limit: safeLimit, offset: safeOffset });
        const total = dbTasks.getTaskCountByFilters(filters);

        res.json({
            tasks,
            pagination: {
                total,
                limit: safeLimit,
                offset: safeOffset,
                totalPages: Math.ceil(total / safeLimit)
            }
        });

    } catch (error) {
        console.error("GET /tasks failed:", error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/getAll', jwtAuth.authMiddleware.bind(jwtAuth), (req, res) => {
    // Example:
    // Request: GET http://localhost:3000/api/tasks/getAll
    // Response: Returns all tasks in the database, authorized users only.
    try {
        const tasks = dbTasks.getAllTasks();
        res.json(tasks);
    } catch (err) {
        console.error("GET /tasks failed:", err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/get', jwtAuth.authMiddleware.bind(jwtAuth), (req, res) => {

    // Example:
    // Request: GET http://localhost:3000/api/tasks/get?id=20240507-abc123
    // Response: Returns the task with the given ID.

    const taskId = req.query.id;

    if (!taskId) {
        return res.status(400).json({ error: 'Missing task id in query' });
    }

    try {
        const task = dbTasks.getTaskById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(task);
    } catch (err) {
        console.error("GET /tasks/get failed:", err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST create task
router.post('/create', jwtAuth.authMiddleware.bind(jwtAuth), validate.checkRole(['admin', 'mayCreateTasks']), (req, res) => {
    // Example:
    // curl -X POST http://localhost:3000/api/tasks/create \
    //   -H "Content-Type: application/json" \
    //   -d '{
    //     "title": "Fix login bug",
    //     "description": "Users can’t log in under certain conditions",
    //     "report": "Steps to reproduce...",
    //     "category": "frontend",
    //     "state": "open",
    //     "priority": "High",
    //     "type": "bug",
    //     "topic": "authentication",
    //     "userName": "alice"
    // }'
    // Response: Returns the created task object along with its ID.

    if (!req.is('application/json')) {
        return res.status(415).json({ error: 'Content-Type must be application/json' });
    }

    if (!req.body.title || !req.body.description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }

    try {
        const newTaskId = dbTasks.createTask(req.body, req.body.userName || null);
        if (!newTaskId) return res.status(400).json({ error: 'Invalid task data' });

        const createdTask = dbTasks.getTaskById(newTaskId);

        res.status(201).json({
            id: newTaskId,
            task: createdTask
        });
    } catch (err) {
        console.error("POST /tasks/create failed:", err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PATCH update task
router.patch('/update', jwtAuth.authMiddleware.bind(jwtAuth), validate.checkRole(['admin', 'mayEditTasks']), (req, res) => {
    // Example:
    // curl -X PATCH "http://localhost:3000/api/tasks/update?id=20240507-abc123" \
    //   -H "Content-Type: application/json" \
    //   -d '{"priority": "Low", "state": "close"}'
    // Response: Returns the updated task object if successful, or an error if the task ID is invalid or not found.

    const taskId = req.query.id;

    if (!req.is('application/json')) {
        return res.status(415).json({ error: 'Content-Type must be application/json' });
    }

    if (!taskId) {
        return res.status(400).json({ error: 'Missing task id in query' });
    }

    try {
        const success = dbTasks.patchTaskById(taskId, req.body);
        if (!success) {
            return res.status(400).json({ error: 'Failed to update task (nothing changed or invalid data)' });
        }

        res.json({
            message: 'Task updated successfully',
            task: dbTasks.getTaskById(taskId)
        });
    } catch (err) {
        console.error("PATCH /tasks/update failed:", err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE task
router.delete('/delete', jwtAuth.authMiddleware.bind(jwtAuth), validate.checkRole(['admin', 'mayDeleteTasks']), (req, res) => {

    // Example:
    // curl -X DELETE "http://localhost:3000/api/tasks/delete?id=20240506-abcd1234"
    // Response: Returns a success message if the task is deleted, or an error message if the task is not found.

    const taskId = req.query.id;

    if (!taskId) {
        return res.status(400).json({ error: 'Missing task id in query' });
    }

    try {
        const success = dbTasks.deleteTask(taskId);
        if (!success) {
            return res.status(404).json({ error: 'Task not found or could not be deleted' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error("DELETE /tasks/delete failed:", err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
