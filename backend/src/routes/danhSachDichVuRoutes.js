const express = require('express');
const router = express.Router();
const DanhSachDichVuController = require('../controllers/danhSachDichVuController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// GET /api/danhsachdichvu - Láº¥y táº¥t cáº£ dá»‹ch vá»¥
router.get('/', authMiddleware, DanhSachDichVuController.getAll);

// GET /api/danhsachdichvu/:id - Láº¥y dá»‹ch vá»¥ theo ID
router.get('/:id', authMiddleware, DanhSachDichVuController.getById);

// POST /api/danhsachdichvu - Táº¡o dá»‹ch vá»¥ má»›i (chá»‰ Ban quáº£n lÃ½)
router.post('/', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), DanhSachDichVuController.create);

// PUT /api/danhsachdichvu/:id - Cáº­p nháº­t dá»‹ch vá»¥ (chá»‰ Ban quáº£n lÃ½)
router.put('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), DanhSachDichVuController.update);

// DELETE /api/danhsachdichvu/:id - XÃ³a dá»‹ch vá»¥ (chá»‰ Ban quáº£n lÃ½)
router.delete('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), DanhSachDichVuController.delete);

module.exports = router;
