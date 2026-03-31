const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const token = req.headers.token;
    try {
        if (!token) throw 'No token provided';
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // { id, role }
        next();
    } catch (error) {
        res.status(401).json({ message: error });
    }
}

module.exports = verifyToken;