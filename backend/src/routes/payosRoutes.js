const express = require('express');
const router = express.Router();
const HoaDonController = require('../controllers/invoiceController');

// POST /api/payos/webhook — PayOS webhook
router.post('/webhook', HoaDonController.payosWebhook);
// GET /api/payos/webhook — PayOS webhook GET confirmation check
router.get('/webhook', HoaDonController.payosWebhook);
// GET /api/payos/inspect-keys — Securely inspect environment keys loaded on server
router.get('/inspect-keys', HoaDonController.inspectKeys);

module.exports = router;
