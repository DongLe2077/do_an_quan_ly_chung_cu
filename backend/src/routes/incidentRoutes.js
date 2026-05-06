const express = require('express');
const router = express.Router();
const SuCoController = require('../controllers/incidentController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// GET /api/incidents
router.get('/', authMiddleware, SuCoController.getAll);

// GET /api/incidents/status/:status
router.get('/status/:status', authMiddleware, SuCoController.getByTrangThai);

// GET /api/incidents/reporter/:reporter_id
router.get('/reporter/:reporter_id', authMiddleware, SuCoController.getByNguoiBao);

// GET /api/incidents/apartment/:apartment_id
router.get('/apartment/:apartment_id', authMiddleware, SuCoController.getByApartment);

// GET /api/incidents/:id
router.get('/:id', authMiddleware, SuCoController.getById);

// POST /api/incidents
router.post('/', authMiddleware, SuCoController.create);

// PUT /api/incidents/:id
router.put('/:id', authMiddleware, SuCoController.update);

// PATCH /api/incidents/:id/handle
router.patch('/:id/handle', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), SuCoController.xuLy);

// DELETE /api/incidents/:id
router.delete('/:id', authMiddleware, SuCoController.delete);

module.exports = router;
