const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const cookieParser = require('cookie-parser');


app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const expenseRoutes = require('./routes/expenseRoutes');
app.use('/api/expenses', expenseRoutes);

const groupRoutes = require('./routes/groupRoutes');
app.use('/api/groups', groupRoutes);

const billRoutes = require('./routes/billRoutes');
app.use('/api/bills', billRoutes);

const settlementRoutes = require('./routes/settlementRoutes');
app.use('/api/settlements', settlementRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

module.exports = app;


