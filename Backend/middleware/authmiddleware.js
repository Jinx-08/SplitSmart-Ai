const supabase = require('../Supabase/client');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cookieParser = require('cookie-parser');

exports.authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.cookies.token; ;   
    if (!authHeader) {
        return res.status(401).json({   
            error: 'Authorization header missing'
        });
    }   
    const token = authHeader.split(' ')[1];
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