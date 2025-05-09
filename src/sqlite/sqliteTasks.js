const Database = require('better-sqlite3');
const crypto = require('crypto');
const { TASK_STATES, PRIORITY_LEVELS } = require('./constants.js');

class SqliteTasks {

    constructor() {
        this.db = new Database('taskNestTasksdb.sqlite');

        // Ensure the 'task' table exists
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS task (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                report TEXT NOT NULL,
                category TEXT NOT NULL,
                state TEXT NOT NULL,
                priority TEXT NOT NULL,
                type TEXT NOT NULL,
                topic TEXT NOT NULL,
                userName TEXT
            )
        `).run();
        
        this.updateTaskStmt = this.db.prepare(`
            UPDATE task SET
            title = ?,
            description = ?,
            report = ?,
            category = ?,
            state = ?,
            priority = ?,
            type = ?,
            topic = ?,
            userName = ?
            WHERE id = ?
        `);

        // Create indexes for better filtering performance
        this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_state ON task(state)`).run();
        this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_category ON task(category)`).run();
        this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_priority ON task(priority)`).run();
        this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_userName ON task(userName)`).run();

        // Class-level prepared statements
        this.insertTaskStmt = this.db.prepare(`
            INSERT INTO task (id, title, description, report, category, state, priority, type, topic, userName)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        this.deleteTaskStmt = this.db.prepare(`DELETE FROM task WHERE id = ?`);
        this.getTaskByIdStmt = this.db.prepare(`SELECT * FROM task WHERE id = ?`);
        this.getAllTasksStmt = this.db.prepare(`SELECT * FROM task`);
    }

    uuidWithTimestamp() {
        const timestamp = new Date().toISOString().replace(/[^\d]/g, "").slice(0, 14);
        const uuid = crypto.randomBytes(20).toString('hex');
        return `${timestamp}-${uuid}`;
    }

    validateTask(task) {
        const requiredFields = ['title', 'description', 'report', 'category', 'state', 'priority', 'type', 'topic'];
        for (const field of requiredFields) {
            if (!task[field]) {
                console.log(`validateTask: Missing field ${field}`, task);
                return false;
            }
        }

        if (!TASK_STATES.includes(task.state)) {
            console.log(`validateTask: Invalid state ${task.state}`);
            return false;
        }

        if (!PRIORITY_LEVELS.includes(task.priority)) {
            console.log(`validateTask: Invalid priority ${task.priority}`);
            return false;
        }

        return true;
    }

    createTask(task, userName = null) {
        if (!task) {
            console.log("createTask: No task provided!");
            return false;
        }

        task.id = this.uuidWithTimestamp();
        if (!this.validateTask(task)) return false;
        
        try {
            this.insertTaskStmt.run(
                task.id,
                task.title,
                task.description,
                task.report,
                task.category,
                task.state,
                task.priority,
                task.type,
                task.topic,
                userName
            );
            
        } catch (error) {
            console.error("createTask: Failed to insert task", error.message);
            return false;
        }

        return task.id;
    }

    insertMany(tasks, userName) {
        const insertTransaction = this.db.transaction((taskList) => {
            for (const task of taskList) {
                this.createTask(task, userName);
            }
        });

        insertTransaction(tasks);
    }

    getAllTasks() {
        return this.getAllTasksStmt.all();
    }

    deleteTask(taskId) {
        let result = null;
        
        try {
            result = this.deleteTaskStmt.run(taskId);
        } catch (error) {
            console.error("deleteTask: Failed to delete task", error.message)
            return false;
        }

        if (result.changes === 0) {
            console.log('deleteTask: Task not found');
            return false;
        }
        return true;
    }

    getTaskById(taskId) {
        try {
            
            const task = this.getTaskByIdStmt.get(taskId);
            if (!task) {
                console.log('getTaskById: Task not found');
                return null;
            }
            return task;

        } catch (error) {
            console.error("getTaskById: DB error", error.message);    
            return null;
        }
    }

    updateTaskById(taskId, updatedTask) {
        if (!this.validateTask(updatedTask)) {
            console.log("updateTaskById: Invalid task data");
            return false;
        }

        let result = null;

        try {
            result = this.updateTaskStmt.run(
                updatedTask.title,
                updatedTask.description,
                updatedTask.report,
                updatedTask.category,
                updatedTask.state,
                updatedTask.priority,
                updatedTask.type,
                updatedTask.topic,
                updatedTask.userName || null,
                taskId
            );
            
        } catch (error) {
            console.error("updateTaskById: Failed to update task", error.message);  
            return false;
        }

        if (result.changes === 0) {
            console.log("updateTaskById: Task not found or nothing changed");
            return false;
        }

        return true;
    }

    patchTaskById(taskId, updates) {
        if (!taskId || typeof updates !== 'object' || Object.keys(updates).length === 0) {
            console.log("patchTaskById: Invalid input");
            return false;
        }

        const allowedKeys = this.getAllowedFilterKeys().concat([
            'title', 'description', 'report', 'category', 'type', 'topic', 'userName'
        ]);
        const fields = [];
        const values = [];
        for (const [key, value] of Object.entries(updates)) {
            if (!allowedKeys.includes(key)) {
                console.warn(`patchTaskById: Skipped invalid key "${key}"`);
                continue;
            }

            // Inline validation for state/priority
            if (key === 'state' && !TASK_STATES.includes(value)) {
                console.warn(`patchTaskById: Invalid state value "${value}"`);
                continue;
            }
            if (key === 'priority' && !PRIORITY_LEVELS.includes(value)) {
                console.warn(`patchTaskById: Invalid priority value "${value}"`);
                continue;
            }

            fields.push(`${key} = ?`);
            values.push(value);
        }

        if (fields.length === 0) {
            console.log("patchTaskById: No valid fields to update");
            return false;
        }

        const stmt = this.db.prepare(`
            UPDATE task
            SET ${fields.join(', ')}
            WHERE id = ?
        `);

        try {
            const result = stmt.run(...values, taskId);
            return result.changes > 0;
        } catch (error) {
            console.error("patchTaskById: DB update failed", error.message);
            return false;
        }
    }

    getAllowedFilterKeys() {
        return ['state', 'category', 'priority', 'type', 'userName', 'topic'];
    }

    getTasksByFilters(filters = {}, options = {}) {
        // example 
        //db.getTasksByFilters({ state: 'open' }, { limit: 10, offset: 0 });

        const conditions = [];
        const values = [];

        const allowedFilters = this.getAllowedFilterKeys()
        for (const key of Object.keys(filters)) {
            if (!allowedFilters.includes(key)) {
                console.warn(`getTasksByFilters: Ignored invalid filter key "${key}"`);
                continue;
            }

            conditions.push(`${key} = ?`);
            values.push(filters[key]);
        }

        const whereClause = conditions.length > 0
            ? 'WHERE ' + conditions.join(' AND ')
            : '';
        

        const limit = Number.isInteger(options.limit) ? options.limit : 50; // default limit
        const offset = Number.isInteger(options.offset) ? options.offset : 0; // default offset
        
        const stmt = this.db.prepare(`
            SELECT * FROM task
            ${whereClause}
            ORDER BY id DESC
            LIMIT ? OFFSET ?
        `);

        try {
            return stmt.all(...values, limit, offset);
        } catch (err) {
            console.error("getTasksByFilters: Query failed", err.message);
            return [];
        }
    }

    getTaskCountByFilters(filters = {}) {
        // example 
        // const totalTasksCount = db.getTaskCountByFilters(filters);
        // console.log('Total tasks matching filters:', totalTasksCount);
        
        const conditions = [];
        const values = [];

        const allowedFilters = this.getAllowedFilterKeys();
        for (const key of Object.keys(filters)) {
            if (!allowedFilters.includes(key)) {
                console.warn(`getTaskCountByFilters: Ignored invalid filter key "${key}"`);
                continue;
            }

            conditions.push(`${key} = ?`);
            values.push(filters[key]);
        }

        const whereClause = conditions.length > 0
            ? 'WHERE ' + conditions.join(' AND ')
            : '';

        const stmt = this.db.prepare(`
            SELECT COUNT(*) as count FROM task
            ${whereClause}
        `);

        try {
            const result = stmt.get(...values);
            return result.count;
        } catch (err) {
            console.error("getTaskCountByFilters: Query failed", err.message);
            return 0;
        }
    }
}

const singleton = new SqliteTasks();
module.exports = singleton;

