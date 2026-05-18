const express = require('express');
const router = express.Router();
const HoaDonController = require('../controllers/invoiceController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// GET /api/invoices
router.get('/', authMiddleware, HoaDonController.getAll);

// GET /api/invoices/apartment/:apartment_id
router.get('/apartment/:apartment_id', authMiddleware, HoaDonController.getByApartment);

// GET /api/invoices/status/:status
router.get('/status/:status', authMiddleware, HoaDonController.getByTrangThai);

// GET /api/invoices/:id
router.get('/:id', authMiddleware, HoaDonController.getById);

// POST /api/invoices
router.post('/', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), HoaDonController.create);

// PUT /api/invoices/:id
router.put('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), HoaDonController.update);

// PATCH /api/invoices/:id/pay — Cư dân yêu cầu thanh toán
router.patch('/:id/pay', authMiddleware, roleMiddleware(roleMiddleware.ROLES.CU_DAN), HoaDonController.thanhToan);

// PATCH /api/invoices/:id/confirm — Admin xác nhận thanh toán
router.patch('/:id/confirm', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), HoaDonController.xacNhanThanhToan);

// PATCH /api/invoices/:id/reject — Admin từ chối thanh toán
router.patch('/:id/reject', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), HoaDonController.tuChoiThanhToan);

// PUT /api/invoices/:id/calculate
router.put('/:id/calculate', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), HoaDonController.tinhTienTuDong);

// DELETE /api/invoices/:id
router.delete('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), HoaDonController.delete);

module.exports = router;
