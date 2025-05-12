const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');

const db = new Database('taskNestUserdb.sqlite');
const SALT_ROUNDS = 10;

const name = 'admin';
const password = 'SuperSecurePassword123';

(async () => {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    try {
        // Check if the user already exists
        const existingUser = db.prepare('SELECT * FROM user WHERE name = ?').get(name);

        if (existingUser) {
            console.log(`User "${name}" already exists. Updating roles...`);

            // Parse existing roles, add 'admin' role if missing
            let roles = JSON.parse(existingUser.roles);
            if (!roles.includes('admin')) {
                roles.push('admin');
                const rolesJson = JSON.stringify(roles);

                // Update the user's roles
                db.prepare('UPDATE user SET roles = ? WHERE name = ?').run(rolesJson, name);
                console.log(`✅ User "${name}" roles updated with 'admin'`);
            } else {
                console.log(`✅ User "${name}" already has 'admin' role`);
            }
        } else {
            // User doesn't exist, create a new user
            const roles = ['admin']; // Assign 'admin' role to the new user
            const rolesJson = JSON.stringify(roles);

            // Insert the new user with the 'admin' role
            db.prepare(`
                INSERT INTO user (name, passwordHash, roles)
                VALUES (?, ?, ?)
            `).run(name, passwordHash, rolesJson);

            console.log(`✅ User "${name}" created successfully with 'admin' role`);
        }
    } catch (err) {
        console.error('❌ Failed to create or update user:', err.message);
    }
})();
