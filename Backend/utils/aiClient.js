const axios = require('axios');
const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';


async function categorizeExpense(description) {
    try {
        const { data } = await axios.post(`${AI_URL}/categorize/`, { description });
        return { category: data.category, confidence: data.confidence };
    } catch (err) {
        console.warn('AI categorizer unavailable, using default:', err.message);
        return { category: 'Other', confidence: 0 }; // Graceful fallback
    }
}


async function checkAnomaly(expense) {
    if (!expense || typeof expense.amount !== 'number') {
        console.warn('AI anomaly service skipped: invalid expense payload');
        return { is_anomaly: false, score: 0 };
    }

    const createdAt = new Date(expense.created_at);
    const hasValidDate = !Number.isNaN(createdAt.getTime());

    const features = {
        amount_log: Math.log1p(expense.amount),
        day_of_week: hasValidDate ? createdAt.getDay() : 0,
        hour: hasValidDate ? createdAt.getHours() : 0,
        month: hasValidDate ? createdAt.getMonth() + 1 : 1,
        amount_zscore: expense.amount_zscore || 0,
        is_duplicate: expense.is_duplicate || 0,
    };

    try {
        const { data } = await axios.post(`${AI_URL}/anomaly/`, {
            expense_features: features,
        });
        return { is_anomaly: data.is_anomaly, score: data.score };
    } catch (err) {

        console.warn('AI anomaly service unavailable:', err.message);
        return { is_anomaly: false, score: 0 };
    }
}
module.exports = { categorizeExpense, checkAnomaly }