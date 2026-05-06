const express = require('express');
const router = express.Router();
const ThongTinCuDanController = require('../controllers/residentController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// GET /api/residents
router.get('/', authMiddleware, ThongTinCuDanController.getAll);

// GET /api/residents/apartment/:apartment_id
router.get('/apartment/:apartment_id', authMiddleware, ThongTinCuDanController.getByApartment);

// GET /api/residents/user/:user_id
router.get('/user/:user_id', authMiddleware, ThongTinCuDanController.getByUser);

// GET /api/residents/:id
router.get('/:id', authMiddleware, ThongTinCuDanController.getById);

// POST /api/residents
router.post('/', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), ThongTinCuDanController.create);

// PUT /api/residents/:id
router.put('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), ThongTinCuDanController.update);

// DELETE /api/residents/:id
router.delete('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), ThongTinCuDanController.delete);

module.exports = router;
