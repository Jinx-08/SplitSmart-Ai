const express = require('express');
const router = express.Router();
const expenseController = require('../Controllers/expenseController');
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/authmiddleware');




router.post('/expenses',
    body('group_id').trim().notEmpty().withMessage('Group ID is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
    body('split_type').isIn(['equal', 'unequal']).withMessage('Split type must be either equal or unequal'),
    body('date').isISO8601().toDate().withMessage('Valid date is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    authMiddleware,
    expenseController.addExpense
);

router.get('/group/:id/expenses', authMiddleware, expenseController.getExpenses);  


router.get('/expenses/:id', authMiddleware, expenseController.getExpensesplitdetails);


router.delete('/expenses/:id', authMiddleware, expenseController.deleteExpense);

router.put('/expenses/:id',
    body('group_id').trim().notEmpty().withMessage('Group ID is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
    body('split_type').isIn(['equal', 'unequal']).withMessage('Split type must be either equal or unequal'),
    body('date').isISO8601().toDate().withMessage('Valid date is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    authMiddleware, 
    expenseController.updateExpense
);

router.post('/expenses/:id/recipients', authMiddleware, expenseController.splitExpense); 



module.exports = router;
