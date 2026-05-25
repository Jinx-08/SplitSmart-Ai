const express = require('express');
const router = express.Router();
const groupController = require('../Controllers/groupcontroller');
const { body } = require('express-validator');


router.post('/groups',
    body('name').trim().notEmpty().withMessage('Group name is required'),
    body('members').isArray({ min: 2 }).withMessage('At least two members are required'),
    groupController.createGroup
);

router.get('/group/:id', groupController.getGroup);

router.post('/groups/:id/invite',[
    body('user_id').trim().notEmpty().withMessage('User ID is required'),       
    body('role').isIn(['member', 'admin']).withMessage('Role must be either member or admin')
] , groupController.inviteMember);

router.post('/groups/:id/remove',[
    body('user_id').trim().notEmpty().withMessage('User ID is required')
] , groupController.removeMember);

module.exports = router;