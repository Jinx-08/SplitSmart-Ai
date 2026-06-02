const { supabase } = require('../Supabase/client');
const { calculatenetbalances, optimizeSettlements } = require('../utils/settlementoptimizer');

async function isGroupMember(groupId, userId) {
    const { data, error } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .limit(1);
    if (error) {
        return { ok: false, error };
    }
    return { ok: Array.isArray(data) && data.length > 0 };
}


exports.getSettlements = async (req, res) => {
    const groupid = req.params.id;
    const userId = req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const membership = await isGroupMember(groupid, userId);
        if (membership.error) {
            return res.status(400).json({ error: membership.error.message });
        }
        if (!membership.ok) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const netBalances = await calculatenetbalances(groupid, supabase);
        if (netBalances === null) {
            return res.status(500).json({ error: 'Failed to calculate net balances' });
        }
        const settlements = optimizeSettlements(netBalances);
        res.json({ settlements });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getUserSettlements = async (req, res) => {
    const userId = req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const { data, error } = await supabase
            .from('splits')
            .select('id, amount, expenses!inner(id, group_id, paid_by, is_settled)')
            .eq('user_id', userId)
            .eq('expenses.is_settled', false);
        if (error) return res.status(400).json({ error: error.message });
        res.json({ settlements: data ?? [] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.settleExpense = async (req, res) => {
    const { expenseId } = req.body;
    const userId = req.user.id;
    if (!expenseId) {
        return res.status(400).json({ error: 'Expense ID is required' });
    }
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const { data: expense, error: expenseError } = await supabase
            .from('expenses')
            .select('id, group_id, user_id, is_settled')
            .eq('id', expenseId)
            .single();
        if (expenseError) return res.status(400).json({ error: expenseError.message });
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        if (expense.is_settled) {
            return res.status(409).json({ error: 'Expense already settled' });
        }
        if (expense.user_id !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const membership = await isGroupMember(expense.group_id, userId);
        if (membership.error) {
            return res.status(400).json({ error: membership.error.message });
        }
        if (!membership.ok) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const { data, error } = await supabase
            .from('expenses')
            .update({ is_settled: true })
            .eq('id', expenseId)
            .select();
        if (error) return res.status(400).json({ error: error.message });
        if (data.length === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json({ message: 'Expense settled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.createSettlements = async (req, res) => {
    return exports.settleExpense(req, res);
};

exports.settleGroup = async (req, res) => {
    const groupid = req.params.id;
    const userId = req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }   
    try {
        const membership = await isGroupMember(groupid, userId);
        if (membership.error) {
            return res.status(400).json({ error: membership.error.message });
        }
        if (!membership.ok) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const { data, error } = await supabase
            .from('expenses')
            .update({ is_settled: true })
            .eq('group_id', groupid)
            .eq('user_id', userId)  
            .select();
        if (error) return res.status(400).json({ error: error.message });           
        res.json({ message: 'Group settled successfully' });
    }   catch (error) { 
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.settleAll = async (req, res) => {
    const userId = req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const { data, error } = await supabase
            .from('expenses')   
            .update({ is_settled: true })
            .eq('user_id', userId)
            .select();
        if (error) return res.status(400).json({ error: error.message });   
        res.json({ message: 'All expenses settled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }       
};

