import mongoose from 'mongoose';

export interface Settlement {
  from: mongoose.Types.ObjectId;
  to: mongoose.Types.ObjectId;
  amount: number;
}

export interface UserBalance {
  userId: mongoose.Types.ObjectId;
  balance: number;
}

export const calculateSettlements = (
  groupMembers: mongoose.Types.ObjectId[],
  expenses: Array<{
    paidBy: mongoose.Types.ObjectId;
    amount: number;
    splits: Array<{
      userId: mongoose.Types.ObjectId;
      amount: number;
    }>;
  }>
): Settlement[] => {
  const balances = new Map<string, number>();

  // Initialize balances for all members
  groupMembers.forEach((memberId) => {
    balances.set(memberId.toString(), 0);
  });

  // Calculate net balance for each member
  expenses.forEach((expense) => {
    // Add amount paid by user
    const paidByStr = expense.paidBy.toString();
    balances.set(paidByStr, (balances.get(paidByStr) || 0) + expense.amount);

    // Subtract amount owed by each split
    expense.splits.forEach((split) => {
      const userStr = split.userId.toString();
      balances.set(userStr, (balances.get(userStr) || 0) - split.amount);
    });
  });

  // Separate creditors (positive balance) and debtors (negative balance)
  const creditors: UserBalance[] = [];
  const debtors: UserBalance[] = [];

  balances.forEach((balance, userId) => {
    if (balance > 0.01) {
      creditors.push({ userId: new mongoose.Types.ObjectId(userId), balance });
    } else if (balance < -0.01) {
      debtors.push({ userId: new mongoose.Types.ObjectId(userId), balance: -balance });
    }
  });

  // Match debtors with creditors
  const settlements: Settlement[] = [];

  debtors.forEach((debtor) => {
    let remainingDebt = debtor.balance;

    while (remainingDebt > 0.01) {
      const creditor = creditors.find((c) => c.balance > 0.01);
      if (!creditor) break;

      const settlementAmount = Math.min(remainingDebt, creditor.balance);
      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Math.round(settlementAmount * 100) / 100,
      });

      creditor.balance -= settlementAmount;
      remainingDebt -= settlementAmount;
    }
  });

  return settlements;
};
