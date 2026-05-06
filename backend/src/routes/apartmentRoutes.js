const express = require('express');
const router = express.Router();
const PhongController = require('../controllers/apartmentController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// GET /api/apartments
router.get('/', authMiddleware, PhongController.getAll);

// GET /api/apartments/building/:building_id
router.get('/building/:building_id', authMiddleware, PhongController.getByBuilding);

// GET /api/apartments/:id
router.get('/:id', authMiddleware, PhongController.getById);

// POST /api/apartments
router.post('/', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), PhongController.create);

// PUT /api/apartments/:id
router.put('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), PhongController.update);

// DELETE /api/apartments/:id
router.delete('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), PhongController.delete);

module.exports = router;
