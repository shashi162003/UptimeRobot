const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1] || req.body.token;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No token provided, authorization denied"
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(`Token verified for user ID: ${decoded.id}`.blue);
        console.log(`${decoded}`.blue);
        const userId = decoded.id;
        const user = await User.findById(userId).select('-password');
        console.log(`User found: ${user.username}`.blue);
        console.log(`${user}`.blue);
        if (!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error(`Error verifying token: ${error.message}`.red);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

module.exports = authMiddleware;