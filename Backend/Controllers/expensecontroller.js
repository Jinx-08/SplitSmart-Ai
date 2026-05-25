const supabase = require('../Supabase/client')
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
require('dotenv').config();


exports.addExpense = async (req, res) => {
    const { group_id, amount, split_type, date, category, participants = [] } = req.body;
    const paid_by = req.user.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {             
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { data, error } = await supabase
            .from('expenses')
            .insert([{ group_id, amount, split_type, date, category, paid_by, user_id: paid_by }])
            .select();
            
        const expense = data?.[0];

        if (error) return res.status(400).json({ error: error.message });

        if (!expense) {
            return res.status(500).json({ error: 'Failed to create expense' });
        }

        let splits = [];
        if (split_type === 'equal') {
            const share = participants.length > 0 ? amount / participants.length : 0;
            splits = participants.map(participant => ({
                expense_id: expense.id,
                user_id: participant,
                amount: share
            }));
        } else {
            splits = participants.map(participant => ({
                expense_id: expense.id,
                user_id: participant.user_id,
                amount: participant.amount
            }));
        }

        if (splits.length > 0) {
            const { error: splitsError } = await supabase.from('splits').insert(splits);
            if (splitsError) return res.status(400).json({ error: splitsError.message });
        }

        res.json({ message: 'Expense added successfully', expense });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.getExpenses = async (req, res) => {
    const { id: userId } = req.user;
    const groupId = req.params.id;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }   
    try {
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('group_id', groupId)
            .eq('user_id', userId);
        if (error) return res.status(400).json({ error: error.message });
        res.json({message: 'Expenses retrieved successfully', expenses: data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteExpense = async (req, res) => {
    const { id: userId } = req.user;
    const expenseId = req.params.id;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const { data, error } = await supabase
            .from('expenses')   
            .delete()
            .eq('id', expenseId)
            .eq('user_id', userId);
        if (error) return res.status(400).json({ error: error.message });
        if (data.length === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateExpense = async (req, res) => {
    const { group_id, amount, split_type, date, category } = req.body;
    const { id: userId } = req.user;
    const expenseId = req.params.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }   
    try {
        const { data, error } = await supabase
            .from('expenses')
            .update({ group_id, amount, split_type, date, category })
            .eq('id', expenseId)
            .eq('user_id', userId)
            .select();
        if (error) return res.status(400).json({ error: error.message });   
        if (data.length === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json({ message: 'Expense updated successfully', expense: data[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.splitExpense = async (req, res) => {
    const { id: userId } = req.user;
    const expenseId = req.params.id;
    const { recipients } = req.body;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const { data: expenseData, error: expenseError } = await supabase
            .from('expenses')
            .select('*')
            .eq('id', expenseId)
            .eq('user_id', userId)
            .single();
        if (expenseError) return res.status(400).json({ error: expenseError.message });
        if (!expenseData) {
            return res.status(404).json({ error: 'Expense not found' });
        }   
        const splits = recipients.map(recipient => ({
            expense_id: expenseId,
            user_id: recipient.user_id,
            amount: recipient.amount
        }));
        const { error: splitsError } = await supabase.from('splits').insert(splits);
        if (splitsError) return res.status(400).json({ error: splitsError.message });
        res.json({ message: 'Expense split successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};