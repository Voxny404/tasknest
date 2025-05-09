const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');

const db = new Database('taskNestUserdb.sqlite');
const SALT_ROUNDS = 10;

const name = 'admin';
const password = 'SuperSecurePassword123';

(async () => {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    try {
        db.prepare(`
            INSERT INTO user (name, passwordHash)
            VALUES (?, ?)
        `).run(name, passwordHash);
        console.log(`✅ User "${name}" created successfully`);
    } catch (err) {
        console.error('❌ Failed to create user:', err.message);
    }
})();
