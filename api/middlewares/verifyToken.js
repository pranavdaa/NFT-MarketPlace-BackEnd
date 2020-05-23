const jwt = require('jsonwebtoken');
const UserService = require('../services/userService')
let userServiceInstance = new UserService();

async function verifyToken(req, res, next) {
    var token = req.headers['x-access-token'] || req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized access' });
    }

    jwt.verify(token, process.env.jwt_secret, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized access' });
        }
        let user = await userServiceInstance.getUser(decoded);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized access' });
        }
        req.userId = decoded.userId;
        next();
    });
}


module.exports = verifyToken;