const express = require('express');
const router = express.Router();
const ThongTinCuDanController = require('../controllers/cuDanController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// GET /api/cudan
router.get('/', authMiddleware, ThongTinCuDanController.getAll);

// GET /api/cudan/phong/:MaPhong
router.get('/phong/:MaPhong', authMiddleware, ThongTinCuDanController.getByPhong);

// GET /api/cudan/nguoidung/:MaNguoiDung
router.get('/nguoidung/:MaNguoiDung', authMiddleware, ThongTinCuDanController.getByNguoiDung);

// GET /api/cudan/:id (MaCuDan)
router.get('/:id', authMiddleware, ThongTinCuDanController.getById);

// POST /api/cudan
router.post('/', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), ThongTinCuDanController.create);

// PUT /api/cudan/:id (MaCuDan)
router.put('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), ThongTinCuDanController.update);

// DELETE /api/cudan/:id (MaCuDan)
router.delete('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), ThongTinCuDanController.delete);

module.exports = router;
