const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const { body } = require('express-validator');
const authMiddleware = require('../Middleware/authMiddleware');

router.post('/register', [
    body('first_name').trim().notEmpty().withMessage('First name is required'),
    body('last_name').trim().notEmpty().withMessage('Last name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], authController.registercontroller);

router.post('/login', [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').not().isEmpty().withMessage('Password is required')
], authController.logincontroller);

module.exports = router; 