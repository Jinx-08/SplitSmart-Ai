const express = require('express');
const router = express.Router();
const billController = require('../Controllers/billController');
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/authmiddleware');

router.post('/', authMiddleware, [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('data').isObject().withMessage('Bill data is required'),
    body('grand_total').isFloat({ gt: 0 }).withMessage('Grand total must be a positive number')
], billController.saveBill);

router.get('/', authMiddleware, billController.getBills);

router.delete('/:id', authMiddleware, billController.deleteBill);

module.exports = router;
