const express = require('express');
const router = express.Router();
const ToaNhaController = require('../controllers/buildingController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// GET /api/buildings
router.get('/', authMiddleware, ToaNhaController.getAll);

// GET /api/buildings/:id
router.get('/:id', authMiddleware, ToaNhaController.getById);

// POST /api/buildings
router.post('/', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), ToaNhaController.create);

// PUT /api/buildings/:id
router.put('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), ToaNhaController.update);

// DELETE /api/buildings/:id
router.delete('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), ToaNhaController.delete);

module.exports = router;
