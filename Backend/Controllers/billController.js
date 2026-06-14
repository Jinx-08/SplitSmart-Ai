const { supabase } = require('../Supabase/client');
const { validationResult } = require('express-validator');

exports.saveBill = async (req, res) => {
    const { title, data, grand_total } = req.body;
    const user_id = req.user.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { data: bill, error } = await supabase
            .from('saved_bills')
            .insert([{ user_id, title, data, grand_total }])
            .select()
            .single();
        if (error) return res.status(400).json({ error: error.message });
        res.json({ message: 'Bill saved successfully', bill });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getBills = async (req, res) => {
    const user_id = req.user.id;
    try {
        const { data, error } = await supabase
            .from('saved_bills')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false });
        if (error) return res.status(400).json({ error: error.message });
        res.json({ message: 'Bills retrieved successfully', bills: data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteBill = async (req, res) => {
    const user_id = req.user.id;
    const billId = req.params.id;
    try {
        const { data, error } = await supabase
            .from('saved_bills')
            .delete()
            .eq('id', billId)
            .eq('user_id', user_id)
            .select();
        if (error) return res.status(400).json({ error: error.message });
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Bill not found' });
        }
        res.json({ message: 'Bill deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
