const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authmiddleware');

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

router.get('/me', authMiddleware, authController.getCurrentUser);

router.post('/logout', authMiddleware, authController.logoutcontroller);

router.put('/profile', authMiddleware, [
    body('first_name').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    body('last_name').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
    body('email').optional().trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], authController.updateProfile);

module.exports = router; 