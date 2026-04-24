const express = require('express');
const router = express.Router();
const ToaNhaController = require('../controllers/toaNhaController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// GET /api/toanha - Láº¥y táº¥t cáº£ tÃ²a nhÃ 
router.get('/', ToaNhaController.getAll);

// GET /api/toanha/:id - Láº¥y tÃ²a nhÃ  theo ID
router.get('/:id', ToaNhaController.getById);

// POST /api/toanha - Táº¡o tÃ²a nhÃ  má»›i (chá»‰ Ban quáº£n lÃ½)
router.post('/', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), ToaNhaController.create);

// PUT /api/toanha/:id - Cáº­p nháº­t tÃ²a nhÃ  (chá»‰ Ban quáº£n lÃ½)
router.put('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), ToaNhaController.update);

// DELETE /api/toanha/:id - XÃ³a tÃ²a nhÃ  (chá»‰ Ban quáº£n lÃ½)
router.delete('/:id', authMiddleware, roleMiddleware(roleMiddleware.ROLES.ADMIN), ToaNhaController.delete);

module.exports = router;
