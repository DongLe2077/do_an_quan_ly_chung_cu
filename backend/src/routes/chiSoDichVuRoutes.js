const express = require('express');
const router = express.Router();
const ChiSoDichVuController = require('../controllers/chiSoDichVuController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// GET /api/chisodichvu
router.get('/', authMiddleware, ChiSoDichVuController.getAll);

// GET /api/chisodichvu/hoadon/:MaHoaDon
router.get('/hoadon/:MaHoaDon', authMiddleware, ChiSoDichVuController.getByHoaDon);

// GET /api/chisodichvu/ngayghi/:NgayGhi
router.get('/ngayghi/:NgayGhi', authMiddleware, ChiSoDichVuController.getByNgayGhi);

// GET /api/chisodichvu/:id (MaGhi)
router.get('/:id', authMiddleware, ChiSoDichVuController.getById);

// POST /api/chisodichvu
router.post('/', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), ChiSoDichVuController.create);

// PUT /api/chisodichvu/:id (MaGhi)
router.put('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), ChiSoDichVuController.update);

// DELETE /api/chisodichvu/:id (MaGhi)
router.delete('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), ChiSoDichVuController.delete);

module.exports = router;
