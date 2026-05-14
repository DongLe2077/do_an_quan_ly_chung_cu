const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Chỉ Admin mới được xem thống kê tổng hợp
router.get('/stats', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), dashboardController.getStats);

module.exports = router;
