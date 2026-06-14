const DEFAULT_GROUPS = [
  {
    id: "group-default-1",
    name: "Mumbai Flat 4B Roomies",
    category: "Home",
    members: ["Priya", "Aarav", "Rohan", "Sneha"],
    expenses: [
      {
        id: "exp-1",
        title: "Gigabit Internet & Wifi",
        amount: 1500,
        payer: "Priya",
        date: "2026-05-25",
        category: "Utilities"
      },
      {
        id: "exp-2",
        title: "Local Kirana Groceries",
        amount: 2800,
        payer: "Aarav",
        date: "2026-05-26",
        category: "Food"
      },
      {
        id: "exp-3",
        title: "Dishwear & Trash Bags",
        amount: 450,
        payer: "Rohan",
        date: "2026-05-27",
        category: "Supplies"
      }
    ]
  },
  {
    id: "group-default-2",
    name: "Goa Summer Roadtrip",
    category: "Trip",
    members: ["Dev", "Ananya", "Kabir"],
    expenses: [
      {
        id: "exp-4",
        title: "SUV Rental Car Gas",
        amount: 4500,
        payer: "Dev",
        date: "2026-05-20",
        category: "Travel"
      },
      {
        id: "exp-5",
        title: "Water Sports Packages",
        amount: 6e3,
        payer: "Ananya",
        date: "2026-05-21",
        category: "Entertainment"
      }
    ]
  }
];
function calculateGroupBalances(g) {
  const standardExpenses = g.expenses.filter((e) => e.category !== "Settlement");
  const totalExpenses = standardExpenses.reduce((sum, e) => sum + e.amount, 0);
  const sharePerPerson = g.members.length > 0 ? totalExpenses / g.members.length : 0;
  const netBalances = {};
  g.members.forEach((member) => {
    const paid = standardExpenses.filter((e) => e.payer === member).reduce((sum, e) => sum + e.amount, 0);
    netBalances[member] = paid - sharePerPerson;
  });
  g.expenses.filter((e) => e.category === "Settlement").forEach((settle) => {
    const from = settle.payer;
    const to = settle.recipient;
    const amount = settle.amount;
    if (from && netBalances[from] !== void 0) {
      netBalances[from] += amount;
    }
    if (to && netBalances[to] !== void 0) {
      netBalances[to] -= amount;
    }
  });
  const debtors = g.members.map((m) => ({ name: m, balance: netBalances[m] || 0 })).filter((x) => x.balance < -0.01).sort((a, b) => a.balance - b.balance);
  const creditors = g.members.map((m) => ({ name: m, balance: netBalances[m] || 0 })).filter((x) => x.balance > 0.01).sort((a, b) => b.balance - a.balance);
  const settlements = [];
  let dIdx = 0;
  let cIdx = 0;
  const dBalances = debtors.map((d) => ({ ...d }));
  const cBalances = creditors.map((c) => ({ ...c }));
  while (dIdx < dBalances.length && cIdx < cBalances.length) {
    const debtor = dBalances[dIdx];
    const creditor = cBalances[cIdx];
    const oweAmt = Math.abs(debtor.balance);
    const creditAmt = creditor.balance;
    const amountToTransfer = Math.min(oweAmt, creditAmt);
    if (amountToTransfer > 0.01) {
      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: amountToTransfer
      });
    }
    debtor.balance += amountToTransfer;
    creditor.balance -= amountToTransfer;
    if (Math.abs(debtor.balance) < 0.01) dIdx++;
    if (creditor.balance < 0.01) cIdx++;
  }
  return {
    totalExpenses,
    sharePerPerson,
    netBalances,
    settlements
  };
}
const initialRates = {
  "₹": 83.3,
  // INR
  "$": 1,
  // USD
  "€": 0.92,
  // EUR
  "£": 0.79,
  // GBP
  "¥": 156.4,
  // JPY
  "C$": 1.37
  // CAD
};
const convertAmount = (amount, from, to, rates) => {
  if (from === to) return amount;
  const rateFrom = rates[from] || rates["$"] || 1;
  const rateTo = rates[to] || rates["$"] || 1;
  const amountInUSD = amount / rateFrom;
  return amountInUSD * rateTo;
};
export {
  DEFAULT_GROUPS,
  calculateGroupBalances,
  convertAmount,
  initialRates
};
