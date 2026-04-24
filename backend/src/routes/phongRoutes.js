const express = require('express');
const router = express.Router();
const PhongController = require('../controllers/phongController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// GET /api/phong
router.get('/', PhongController.getAll);

// GET /api/phong/toanha/:MaToaNha
router.get('/toanha/:MaToaNha', PhongController.getByToaNha);

// GET /api/phong/:id (MaPhong)
router.get('/:id', PhongController.getById);

// POST /api/phong
router.post('/', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), PhongController.create);

// PUT /api/phong/:id (MaPhong)
router.put('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), PhongController.update);

// DELETE /api/phong/:id (MaPhong)
router.delete('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), PhongController.delete);

module.exports = router;
