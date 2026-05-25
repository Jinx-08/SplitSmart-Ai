const express = require('express');
const router = express.Router();
const expenseController = require('../Controllers/expenseController');
const { body } = require('express-validator');


router.post('/add',
    body('group_id').trim().notEmpty().withMessage('Group ID is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
    body('split_type').isIn(['equal', 'unequal']).withMessage('Split type must be either equal or unequal'),
    body('date').isISO8601().toDate().withMessage('Valid date is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    expenseController.addExpense
);

router.get('/group/:id/expenses', expenseController.getExpenses);  


router.delete('/delete/:id', expenseController.deleteExpense);

router.put('/update/:id',
    body('group_id').trim().notEmpty().withMessage('Group ID is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
    body('split_type').isIn(['equal', 'unequal']).withMessage('Split type must be either equal or unequal'),
    body('date').isISO8601().toDate().withMessage('Valid date is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    expenseController.updateExpense
);

router.post('/expense/:id/recipients', expenseController.splitExpense); 



module.exports = router;
