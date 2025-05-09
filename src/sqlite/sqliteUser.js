
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
                passwordHash TEXT NOT NULL
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

        try {
            const insert = this.db.prepare("INSERT INTO user (name, passwordHash) VALUES (?, ?)");
            insert.run(normalized, passwordHash);
            console.log("New user created:", normalized);

            const token = jwtAuth.generateToken(normalized);
            return { success: true, token, user: normalized };

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
        const stmt = this.db.prepare('SELECT name FROM user WHERE name = ?');
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

}

const userDB = new SqliteUser();
module.exports = userDB;

