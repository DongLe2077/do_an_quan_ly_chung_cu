const express = require('express');
const router = express.Router();
const NguoiDungController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// POST /api/users/login
router.post('/login', NguoiDungController.login);

// POST /api/users/register
router.post('/register', NguoiDungController.register);

// GET /api/users - Lấy tất cả người dùng (chỉ Admin)
router.get('/', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), NguoiDungController.getAll);

// GET /api/users/me/profile
router.get('/me/profile', authMiddleware, NguoiDungController.getProfile);

// GET /api/users/:id
router.get('/:id', authMiddleware, NguoiDungController.getById);

// PUT /api/users/:id
router.put('/:id', authMiddleware, NguoiDungController.update);

// DELETE /api/users/:id (chỉ Admin)
router.delete('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), NguoiDungController.delete);

// PUT /api/users/:id/password
router.put('/:id/password', authMiddleware, NguoiDungController.changePassword);

// PATCH /api/users/:id/role (chỉ Admin)
router.patch('/:id/role', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), NguoiDungController.setRole);

module.exports = router;
