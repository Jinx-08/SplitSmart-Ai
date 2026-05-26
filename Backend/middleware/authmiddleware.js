const { supabase } = require('../Supabase/client');
require('dotenv').config();

exports.authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token;
    const token = authHeader
        ? (authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader)
        : cookieToken;
    if (!token) {
        return res.status(401).json({
            error: 'Token missing'
        });
    }
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({
                error: 'Invalid token'
            });
        }       
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }   
}