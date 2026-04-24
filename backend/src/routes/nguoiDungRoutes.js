const express = require('express');
const router = express.Router();
const NguoiDungController = require('../controllers/nguoiDungController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// POST /api/nguoidung/login - ÄÄƒng nháº­p
router.post('/login', NguoiDungController.login);

// POST /api/nguoidung/register - ÄÄƒng kÃ½
router.post('/register', NguoiDungController.register);

// GET /api/nguoidung - Láº¥y táº¥t cáº£ ngÆ°á»i dÃ¹ng (chá»‰ Ban quáº£n lÃ½)
router.get('/', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), NguoiDungController.getAll);

// GET /api/nguoidung/me/profile - Láº¥y thÃ´ng tin profile user Ä‘ang Ä‘Äƒng nháº­p (pháº£i Ä‘áº·t TRÆ¯á»šC /:id)
router.get('/me/profile', authMiddleware, NguoiDungController.getProfile);

// GET /api/nguoidung/:id - Láº¥y ngÆ°á»i dÃ¹ng theo ID
router.get('/:id', authMiddleware, NguoiDungController.getById);

// PUT /api/nguoidung/:id - Cáº­p nháº­t ngÆ°á»i dÃ¹ng
router.put('/:id', authMiddleware, NguoiDungController.update);

// DELETE /api/nguoidung/:id - XÃ³a ngÆ°á»i dÃ¹ng (chá»‰ Ban quáº£n lÃ½)
router.delete('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), NguoiDungController.delete);

// PUT /api/nguoidung/:id/password - Äá»•i máº­t kháº©u
router.put('/:id/password', authMiddleware, NguoiDungController.changePassword);

// PATCH /api/nguoidung/:id/role - Set role (chá»‰ Ban quáº£n lÃ½)
router.patch('/:id/role', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), NguoiDungController.setRole);

module.exports = router;
