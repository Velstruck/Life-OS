import express, { Response } from 'express';
import Group from '../models/Group.js';
import Expense from '../models/Expense.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { calculateSettlements } from '../utils/calculateSettlements.js';

const router = express.Router();

const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;
    const userId = req.user?.userId;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    let inviteCode = generateInviteCode();
    let codeExists = await Group.findOne({ inviteCode });
    while (codeExists) {
      inviteCode = generateInviteCode();
      codeExists = await Group.findOne({ inviteCode });
    }

    const group = new Group({
      name,
      inviteCode,
      createdBy: userId,
      members: [userId],
      expenses: [],
    });

    await group.save();
    await group.populate('createdBy members');

    const transformUser = (user: any) => user ? {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    } : null;

    res.status(201).json({
      group: {
        id: group._id,
        name: group.name,
        inviteCode: group.inviteCode,
        createdBy: transformUser(group.createdBy),
        members: Array.isArray(group.members) ? group.members.map(transformUser) : [],
        expenses: [],
      },
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const groups = await Group.find({
      members: userId,
    }).populate('createdBy members expenses');

    const transformUser = (user: any) => user ? {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    } : null;

    res.json({
      groups: groups.map((group) => ({
        id: group._id,
        name: group.name,
        inviteCode: group.inviteCode,
        createdBy: transformUser(group.createdBy),
        members: Array.isArray(group.members) ? group.members.map(transformUser) : [],
        expenses: Array.isArray(group.expenses) ? group.expenses.map((exp: any) => exp._id) : [],
      })),
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Failed to get groups' });
  }
});

router.get('/:groupId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId)
      .populate('createdBy members')
      .populate({
        path: 'expenses',
        populate: { path: 'paidBy splits.userId' },
      });

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    const transformUser = (user: any) => user ? {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    } : null;

    const transformExpense = (expense: any) => ({
      id: expense._id,
      groupId: expense.groupId,
      description: expense.description,
      amount: expense.amount,
      paidBy: transformUser(expense.paidBy),
      splits: expense.splits.map((split: any) => ({
        userId: split.userId?._id || split.userId,
        amount: split.amount,
      })),
      date: expense.date,
    });

    res.json({
      group: {
        id: group._id,
        name: group.name,
        inviteCode: group.inviteCode,
        createdBy: transformUser(group.createdBy),
        members: Array.isArray(group.members) ? group.members.map(transformUser) : [],
        expenses: Array.isArray(group.expenses) ? group.expenses.map(transformExpense) : [],
      },
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Failed to get group' });
  }
});

router.post('/:groupId/expenses', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const { description, amount, splits } = req.body;
    const userId = req.user?.userId;

    if (!description || !amount || !splits) {
      res.status(400).json({ error: 'Description, amount, and splits are required' });
      return;
    }

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Ensure splits have valid userId fields
    const validatedSplits = splits.map((split: any) => ({
      userId: split.userId,
      amount: split.amount,
    }));

    const expense = new Expense({
      groupId,
      description,
      amount,
      paidBy: userId,
      splits: validatedSplits,
      date: new Date(),
    });

    await expense.save();
    group.expenses.push(expense._id);
    await group.save();

    await expense.populate('paidBy splits.userId');

    const transformUser = (user: any) => user ? {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    } : null;

    res.status(201).json({
      expense: {
        id: expense._id,
        groupId: expense.groupId,
        description: expense.description,
        amount: expense.amount,
        paidBy: transformUser(expense.paidBy),
        splits: expense.splits.map((split: any) => ({
          userId: split.userId?._id || split.userId,
          amount: split.amount,
        })),
        date: expense.date,
      },
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

router.get('/:groupId/settlements', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId).populate({
      path: 'expenses',
      populate: { path: 'paidBy splits.userId' },
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Extract ObjectIds from members (could be populated or not)
    const memberIds = group.members.map((member: any) => 
      typeof member === 'string' ? member : member._id
    );

    // Extract ObjectIds from expenses
    const expensesData = group.expenses.map((exp: any) => ({
      paidBy: exp.paidBy._id || exp.paidBy,
      amount: exp.amount,
      splits: exp.splits.map((split: any) => ({
        userId: split.userId._id || split.userId,
        amount: split.amount,
      })),
    }));

    const settlements = calculateSettlements(memberIds, expensesData);

    res.json({
      settlements: settlements.map((s) => ({
        from: s.from,
        to: s.to,
        amount: s.amount,
      })),
    });
  } catch (error) {
    console.error('Get settlements error:', error);
    res.status(500).json({ error: 'Failed to calculate settlements' });
  }
});

router.post('/join/:inviteCode', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { inviteCode } = req.params;
    const userId = req.user?.userId;

    const group = await Group.findOne({ inviteCode });
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    if (!group.members.some((id) => id.toString() === userId)) {
      group.members.push(userId as any);
      await group.save();
    }

    await group.populate('createdBy members expenses');

    const transformUser = (user: any) => user ? {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    } : null;

    res.json({
      group: {
        id: group._id,
        name: group.name,
        inviteCode: group.inviteCode,
        createdBy: transformUser(group.createdBy),
        members: Array.isArray(group.members) ? group.members.map(transformUser) : [],
        expenses: Array.isArray(group.expenses) ? group.expenses.map((exp: any) => exp._id) : [],
      },
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

router.delete('/:groupId/expenses/:expenseId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { groupId, expenseId } = req.params;

    const expense = await Expense.findById(expenseId);
    if (!expense || expense.groupId.toString() !== groupId) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    await Group.findByIdAndUpdate(groupId, {
      $pull: { expenses: expenseId },
    });

    await Expense.findByIdAndDelete(expenseId);

    res.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

router.delete('/:groupId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.userId;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Only the creator can delete the group
    if (group.createdBy.toString() !== userId) {
      res.status(403).json({ error: 'Only the creator can delete this group' });
      return;
    }

    // Delete all expenses associated with this group
    await Expense.deleteMany({ groupId });

    // Delete the group
    await Group.findByIdAndDelete(groupId);

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

export default router;
