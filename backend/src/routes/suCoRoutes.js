const express = require('express');
const router = express.Router();
const SuCoController = require('../controllers/suCoController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// GET /api/suco
router.get('/', authMiddleware, SuCoController.getAll);

// GET /api/suco/trangthai/:TrangThai
router.get('/trangthai/:TrangThai', authMiddleware, SuCoController.getByTrangThai);

// GET /api/suco/nguoibao/:MaNguoiBao
router.get('/nguoibao/:MaNguoiBao', authMiddleware, SuCoController.getByNguoiBao);

// GET /api/suco/phong/:MaPhong
router.get('/phong/:MaPhong', authMiddleware, SuCoController.getByPhong);

// GET /api/suco/:id (MaSuCo)
router.get('/:id', authMiddleware, SuCoController.getById);

// POST /api/suco
router.post('/', authMiddleware, SuCoController.create);

// PUT /api/suco/:id (MaSuCo)
router.put('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), SuCoController.update);

// PATCH /api/suco/:id/xuly
router.patch('/:id/xuly', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), SuCoController.xuLy);

// DELETE /api/suco/:id (MaSuCo)
router.delete('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), SuCoController.delete);

module.exports = router;
