const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Chỉ Admin mới được xem thống kê tổng hợp
router.get('/stats', verifyToken, checkRole(['admin']), dashboardController.getStats);

module.exports = router;
