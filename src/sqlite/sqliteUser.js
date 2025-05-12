const { AVAILABLE_ROLES } = require('./constants.js');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const jwtAuth = require('../auth/jwt');
const SALT_ROUNDS = 10;
class SqliteUser {
    constructor() {
        this.db = new Database('taskNestUserdb.sqlite');

        // Ensure the user table exists
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS user (
                name TEXT NOT NULL UNIQUE,
                passwordHash TEXT NOT NULL,
                roles TEXT NOT NULL DEFAULT '[]'
            )
        `).run();
    }

    // Validate user credentials and generate JWT token if valid
    async validateUserAndGenerateToken(name, password) {
        const normalized = name.trim().toLowerCase();

        const stmt = this.db.prepare("SELECT * FROM user WHERE name = ?");
        const user = stmt.get(normalized);

        if (!user) {
            console.log("validateUserAndGenerateToken: No such user");
            return { success: false, message: 'User not found' };
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            console.log("validateUserAndGenerateToken: Password mismatch");
            return { success: false, message: 'Invalid password' };
        }

        const token = jwtAuth.generateToken(user.name);
        const roles = JSON.parse(user.roles || '[]');
        return { success: true, token, user: user.name };
    }

    async createUser(name, password) {
        if (!name || !password) {
            return { success: false, message: 'Username and password are required' };
        }

        const normalized = name.trim().toLowerCase();

        if (password.length > 100) {
            return { success: false, message: 'Password too long (max 100 characters)' };
        }

        if (password.length < 10) {
            return { success: false, message: 'Password too small (min 10 characters)' };
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const rolesJson = JSON.stringify([]); // Empty roles by default
        try {
            const insert = this.db.prepare("INSERT INTO user (name, passwordHash, roles) VALUES (?, ?, ?)");
            insert.run(normalized, passwordHash, rolesJson);
            console.log("New user created:", normalized);

            const token = jwtAuth.generateToken(normalized);
            return { success: true, token, user: normalized, roles: [] };

        } catch (err) {
            if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                console.log("createUser: User already exists:", normalized);
                return { success: false, message: 'User already exists' };
            } else {
                console.error("createUser: Unexpected error", err);
                return { success: false, message: 'Error creating user' };
            }
        }
    }

    userExists(name) {
        const normalized = name.trim().toLowerCase();
        const stmt = this.db.prepare("SELECT 1 FROM user WHERE name = ?");
        return !!stmt.get(normalized);
    }

    deleteUser(name) {
        const normalized = name.trim().toLowerCase();
        const stmt = this.db.prepare("DELETE FROM user WHERE name = ?");
        const result = stmt.run(normalized);

        if (result.changes === 0) {
            console.log("deleteUser: User not found:", normalized);
            return { success: false, message: 'User not found' };
        }

        console.log("User deleted:", name);
        return { success: true, message: 'User deleted successfully' };
    }
    
    getUserByName(userName) {
        const normalized = userName.trim().toLowerCase();
        const stmt = this.db.prepare('SELECT name, roles FROM user WHERE name = ?');
        const user = stmt.get(normalized);
        
        if (!user) {
            console.log("getUserByName: User not found!");
            return null;
        }

        return user;
    }

    getAllUsers() {
        return this.db.prepare("SELECT * FROM user").all();
    }
    
    getUserRoles(userName) {
        const normalized = userName.trim().toLowerCase();
        const stmt = this.db.prepare("SELECT roles FROM user WHERE name = ?");
        const user = stmt.get(normalized);

        if (!user) return null;
        return JSON.parse(user.roles || '[]');
    }
    

    updateUserRoles(userName, roles = []) {
        // userDB.updateUserRoles('john_doe', ['admin', 'mayCreateTasks'])
        
        const normalized = userName.trim().toLowerCase();
        const rolesJson = JSON.stringify(roles);
        const stmt = this.db.prepare("UPDATE user SET roles = ? WHERE name = ?");
        const result = stmt.run(rolesJson, normalized);
        
        // Check if all roles in the array are valid
        for (let role of roles) {
            if (!AVAILABLE_ROLES.includes(role)) {
                // Return an error message if an invalid role is found
                return { success: false, message: `Role '${role}' does not exist` };
            }
        }

        if (result.changes === 0) {
            console.log("updateUserRoles: User not found:", normalized);
            return { success: false, message: 'User not found' };
        }

        return { success: true, message: 'Roles updated successfully' };
    }
}

const userDB = new SqliteUser();
module.exports = userDB;

