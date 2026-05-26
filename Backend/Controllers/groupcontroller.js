const { supabase } = require('../Supabase/client');
const { validationResult } = require('express-validator');
require('dotenv').config();

const ensureGroupAdmin = async (groupId, userId) => {
    const { data, error } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .eq('role', 'admin')
        .limit(1);
    if (error) return { ok: false, error };
    return { ok: data && data.length > 0 };
};

const ensureGroupMember = async (groupId, userId) => {
    const { data, error } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .limit(1);
    if (error) return { ok: false, error };
    return { ok: data && data.length > 0 };
};

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
        const uniqueMembers = Array.from(new Set([...members, created_by]));
        const groupMembers = uniqueMembers.map(member => ({
            group_id: group.id,
            user_id: member,
            role: member === created_by ? 'admin' : 'member'
        }));
        const { error: membersError } = await supabase.from('group_members').insert(groupMembers);
        if (membersError) return res.status(400).json({ error: membersError.message });
        res.json({ message: 'Group created successfully', group });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.getUserGroups = async (req, res) => {
    const userId = req.user.id;
    try {
        const { data, error } = await supabase
            .from('group_members')
            .select('group_id, groups(name)')
            .eq('user_id', userId);
        if (error) return res.status(400).json({ error: error.message });
        const groups = data.map(item => ({ id: item.group_id, name: item.groups.name }));
        res.json({ message: 'Groups retrieved successfully', groups });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




exports.getGroupandmembers = async (req, res) => {
    const groupId = req.params.id;
    const userId = req.user.id;
    try {
        const memberCheck = await ensureGroupMember(groupId, userId);
        if (memberCheck.error) return res.status(400).json({ error: memberCheck.error.message });
        if (!memberCheck.ok) return res.status(403).json({ error: 'Forbidden' });

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


exports.updateGroup = async (req, res) => {
    const groupId = req.params.id;
    const { name } = req.body;
    try {
        const adminCheck = await ensureGroupAdmin(groupId, req.user.id);
        if (adminCheck.error) return res.status(400).json({ error: adminCheck.error.message });
        if (!adminCheck.ok) return res.status(403).json({ error: 'Forbidden' });

        const { data: groupData, error: groupError } = await supabase
            .from('groups')
            .select('*')
            .eq('id', groupId)
            .single();
        if (groupError) return res.status(400).json({ error: groupError.message });
        const { error: updateError } = await supabase
            .from('groups')
            .update({ name })
            .eq('id', groupId);
        if (updateError) return res.status(400).json({ error: updateError.message });
        res.json({ message: 'Group updated successfully', group: { id: groupId, name } });
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
        const adminCheck = await ensureGroupAdmin(groupId, req.user.id);
        if (adminCheck.error) return res.status(400).json({ error: adminCheck.error.message });
        if (!adminCheck.ok) return res.status(403).json({ error: 'Forbidden' });

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
    const user_id = req.params.userId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }   
    try {
        const adminCheck = await ensureGroupAdmin(groupId, req.user.id);
        if (adminCheck.error) return res.status(400).json({ error: adminCheck.error.message });
        if (!adminCheck.ok) return res.status(403).json({ error: 'Forbidden' });

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