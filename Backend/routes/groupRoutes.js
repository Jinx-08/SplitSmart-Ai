const express = require('express');
const router = express.Router();
const groupController = require('../Controllers/groupController');
const { body, param } = require('express-validator');
const authMiddleware = require('../middleware/authmiddleware');


router.post('/groups', authMiddleware,
    body('name').trim().notEmpty().withMessage('Group name is required'),
    body('members').isArray({ min: 2 }).withMessage('At least two members are required'),
    groupController.createGroup
);


router.get('/groups', authMiddleware, groupController.getUserGroups);

router.get('/group/:id', authMiddleware, groupController.getGroupandmembers);

router.put('/group/:id', authMiddleware, groupController.updateGroup);

router.post('/groups/:id/invite', authMiddleware,[
    body('user_id').trim().notEmpty().withMessage('User ID is required'),       
    body('role').isIn(['member', 'admin']).withMessage('Role must be either member or admin')
] , groupController.inviteMember);

router.delete('/groups/:id/members/:userId', authMiddleware, [
    param('userId').trim().notEmpty().withMessage('User ID is required')
], groupController.removeMember);

module.exports = router;