const supabase = require('../Supabase/client')
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.createGroup = async (req, res) => {
    const { name, members } = req.body;
    const created_by = req.user.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { data, error } = await supabase
            .from('groups')
            .insert([{ name, created_by }])
            .select();  
        const group = data?.[0];
        if (error) return res.status(400).json({ error: error.message });
        if (!group) {
            return res.status(500).json({ error: 'Failed to create group' });
        }
        const groupMembers = members.map(member => ({
            group_id: group.id,
            user_id: member 
        }));
        const { error: membersError } = await supabase.from('group_members').insert(groupMembers);
        if (membersError) return res.status(400).json({ error: membersError.message });
        res.json({ message: 'Group created successfully', group });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getGroup = async (req, res) => {
    const groupId = req.params.id;
    const userId = req.user.id;
    try {
        const { data: groupData, error: groupError } = await supabase
            .from('groups')
            .select('*')
            .eq('id', groupId)
            .single();
        if (groupError) return res.status(400).json({ error: groupError.message }); 
        const { data: membersData, error: membersError } = await supabase
            .from('group_members')
            .select('user_id')
            .eq('group_id', groupId);
        if (membersError) return res.status(400).json({ error: membersError.message });
        const memberIds = membersData.map(member => member.user_id);
        res.json({ message: 'Group members retrieved successfully', group: groupData, members: memberIds });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.inviteMember = async (req, res) => {
    const groupId = req.params.id;
    const { user_id , role   } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { data: groupData, error: groupError } = await supabase
            .from('groups') 
            .select('*')
            .eq('id', groupId)
            .single();
        if (groupError) return res.status(400).json({ error: groupError.message });
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user_id)  
            .single();
        if (userError) return res.status(400).json({ error: userError.message });
        const { error: inviteError } = await supabase
            .from('group_members')
            .insert([{ group_id: groupId, user_id, role }]);
        if (inviteError) return res.status(400).json({ error: inviteError.message });
        res.json({ message: 'Member invited successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.removeMember = async (req, res) => {
    const groupId = req.params.id;
    const { user_id } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }   
    try {
        const { data: groupData, error: groupError } = await supabase
            .from('groups') 
            .select('*')
            .eq('id', groupId)
            .single();
        if (groupError) return res.status(400).json({ error: groupError.message });
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user_id)
            .single();
        if (userError) return res.status(400).json({ error: userError.message });
        const { error: removeError } = await supabase
            .from('group_members')
            .delete()
            .eq('group_id', groupId)
            .eq('user_id', user_id);
        if (removeError) return res.status(400).json({ error: removeError.message });
        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};