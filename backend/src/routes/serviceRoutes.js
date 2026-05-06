const express = require('express');
const router = express.Router();
const DanhSachDichVuController = require('../controllers/serviceController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// GET /api/services
router.get('/', authMiddleware, DanhSachDichVuController.getAll);

// GET /api/services/:id
router.get('/:id', authMiddleware, DanhSachDichVuController.getById);

// POST /api/services
router.post('/', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), DanhSachDichVuController.create);

// PUT /api/services/:id
router.put('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), DanhSachDichVuController.update);

// DELETE /api/services/:id
router.delete('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), DanhSachDichVuController.delete);

module.exports = router;
