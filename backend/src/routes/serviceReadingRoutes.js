const express = require('express');
const router = express.Router();
const ChiSoDichVuController = require('../controllers/serviceReadingController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// GET /api/service-readings
router.get('/', authMiddleware, ChiSoDichVuController.getAll);

// GET /api/service-readings/invoice/:invoice_id
router.get('/invoice/:invoice_id', authMiddleware, ChiSoDichVuController.getByInvoice);

// GET /api/service-readings/date/:reading_date
router.get('/date/:reading_date', authMiddleware, ChiSoDichVuController.getByNgayGhi);

// GET /api/service-readings/:id
router.get('/:id', authMiddleware, ChiSoDichVuController.getById);

// POST /api/service-readings
router.post('/', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), ChiSoDichVuController.create);

// PUT /api/service-readings/:id
router.put('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), ChiSoDichVuController.update);

// DELETE /api/service-readings/:id
router.delete('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), ChiSoDichVuController.delete);

module.exports = router;
