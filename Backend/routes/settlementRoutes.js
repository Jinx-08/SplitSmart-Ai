const express = require('express');
const router = express.Router();
const settlementController = require('../Controllers/settlementController');
const { authMiddleware } = require('../middleware/authmiddleware');


router.get('/settlements', authMiddleware, settlementController.getUserSettlements);

router.get('/group/:id/settlements', authMiddleware, settlementController.getSettlements);

router.post('/settlements/mark-paid', authMiddleware, settlementController.createSettlements);

module.exports = router;