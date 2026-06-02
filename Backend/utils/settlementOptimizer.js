async function calculatenetbalances(groupid, supabase) {
    const { data: splits, error } = await supabase
        .from('splits')
        .select('user_id, amount, expenses!inner(paid_by, group_id, is_settled)')
        .eq('expenses.group_id', groupid)
        .eq('expenses.is_settled', false);
    if (error) {
        console.error('Error fetching expenses:', error);
        return null;
    }
    const netBalances = {};
    splits.forEach(split => {
        const userId = split.user_id;
        const amount = Number(split.amount) || 0;
        const paidBy = split.expenses?.paid_by;
        if (!paidBy) {
            return;
        }
        if (netBalances[userId] === undefined) {
            netBalances[userId] = 0;
        }
        if (netBalances[paidBy] === undefined) {
            netBalances[paidBy] = 0;
        }
        netBalances[userId] -= amount;
        netBalances[paidBy] += amount;
    });
    return netBalances;
}

function optimizeSettlements(netBalances) {
    const creditors = [];
    const debtors = [];
    for (const userId in netBalances) {
        const balance = netBalances[userId];
        if (balance > 0) {
            creditors.push({ userId, balance });
        } else if (balance < 0) {
            debtors.push({ userId, balance: -balance });
        }
    }
    const transactions = [];
    while (creditors.length > 0 && debtors.length > 0) {
        const creditor = creditors[0];
        const debtor = debtors[0];
        const amount = Math.min(creditor.balance, debtor.balance);
        transactions.push({ from: debtor.userId, to: creditor.userId, amount });
        creditor.balance -= amount;
        debtor.balance -= amount;
        if (creditor.balance === 0) {
            creditors.shift();
        }
        if (debtor.balance === 0) {
            debtors.shift();
        }
    }
    return transactions;
}

module.exports = {
    calculatenetbalances,
    optimizeSettlements
};