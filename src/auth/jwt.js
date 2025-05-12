const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'; // ideally from env vars
const JWT_EXPIRES_IN = '1d';

class JwtAuth {
    generateToken(userName) {
        return jwt.sign(
            { user: userName },
            JWT_SECRET,
            {
                expiresIn: JWT_EXPIRES_IN,
                issuer: 'task-nest-app',        // unique name for your app
                audience: userName              // intended user
            }
        );
    }

    verifyToken(token, expectedUser) {
        try {
            return jwt.verify(token, JWT_SECRET, {
                issuer: 'task-nest-app',
                audience: expectedUser
            });
        } catch (err) {
            console.warn("verifyToken: Invalid token", err.message);
            return null;
        }
    }

    decodeToken(token) {
        return jwt.decode(token); // returns payload or null, doesn't throw
    }
    
    authMiddleware = (req, res, next) => {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Authorization header missing or malformed' });
            }

            const token = authHeader.split(' ')[1]?.trim();
            if (!token) {
                return res.status(401).json({ error: 'Token missing' });
            }

            const decoded = jwt.decode(token);
            if (!decoded?.user) {
                return res.status(401).json({ error: 'Invalid token payload' });
            }
            const payload = this.verifyToken(token, decoded.user);

            if (!payload) {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }

            req.user = payload.user; // attach user to request
            
            next();
    }
}


const singleton = new JwtAuth();
module.exports = singleton;
