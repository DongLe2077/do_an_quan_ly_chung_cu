const express = require('express');
const router = express.Router();
const HoaDonController = require('../controllers/invoiceController');

// POST /api/payos/webhook — PayOS webhook
router.post('/webhook', HoaDonController.payosWebhook);

module.exports = router;
