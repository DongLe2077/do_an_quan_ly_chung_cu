const express = require('express');
const router = express.Router();
const HoaDonController = require('../controllers/hoaDonController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// GET /api/hoadon
router.get('/', authMiddleware, HoaDonController.getAll);

// GET /api/hoadon/phong/:MaPhong
router.get('/phong/:MaPhong', authMiddleware, HoaDonController.getByPhong);

// GET /api/hoadon/trangthai/:TrangThai
router.get('/trangthai/:TrangThai', authMiddleware, HoaDonController.getByTrangThai);

// GET /api/hoadon/:id (MaHoaDon)
router.get('/:id', authMiddleware, HoaDonController.getById);

// POST /api/hoadon
router.post('/', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), HoaDonController.create);

// PUT /api/hoadon/:id (MaHoaDon)
router.put('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), HoaDonController.update);

// PATCH /api/hoadon/:id/thanhtoan — Cư dân yêu cầu thanh toán
router.patch('/:id/thanhtoan', authMiddleware, HoaDonController.thanhToan);

// PATCH /api/hoadon/:id/xacnhan — Admin xác nhận thanh toán
router.patch('/:id/xacnhan', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), HoaDonController.xacNhanThanhToan);

// PATCH /api/hoadon/:id/tuchoi — Admin từ chối thanh toán
router.patch('/:id/tuchoi', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), HoaDonController.tuChoiThanhToan);

// PUT /api/hoadon/:id/tinh-tien
router.put('/:id/tinh-tien', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), HoaDonController.tinhTienTuDong);

// DELETE /api/hoadon/:id (MaHoaDon)
router.delete('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), HoaDonController.delete);

module.exports = router;
