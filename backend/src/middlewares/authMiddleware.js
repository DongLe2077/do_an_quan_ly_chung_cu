// Middleware xác thực đăng nhập (JWT Token)
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Không có token xác thực'
            });
        }

        const token = authHeader.split(' ')[1]; // Bearer <token>
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ'
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token hết hạn hoặc không hợp lệ'
        });
    }
};

module.exports = authMiddleware;
