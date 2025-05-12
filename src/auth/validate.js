const userDB = require('../sqlite/sqliteUser');

class Validate {
    checkRole(requiredRoles) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            // Fetch user roles (you may want to retrieve these from the DB)
            const userRoles = userDB.getUserRoles(req.user) || [];

            // Check if the user has at least one of the required roles
            const hasRole = requiredRoles.some(role => userRoles.includes(role));

            if (!hasRole) {
                return res.status(403).json({ error: `Permission denied. One of the following roles is required: ${requiredRoles.join(', ')}` });
            }

            next(); // Allow the request to proceed
        };
    }
}

const singleton = new Validate();
module.exports = singleton;
