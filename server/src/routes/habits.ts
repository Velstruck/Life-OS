import express, { Response } from 'express';
import Habit from '../models/Habit.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const transformUser = (user: any) => user ? {
  id: user._id,
  email: user.email,
  name: user.name,
  avatar: user.avatar,
} : null;

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description } = req.body;
    const userId = req.user?.userId;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    let inviteCode = generateInviteCode();
    let codeExists = await Habit.findOne({ inviteCode });
    while (codeExists) {
      inviteCode = generateInviteCode();
      codeExists = await Habit.findOne({ inviteCode });
    }

    const habit = new Habit({
      title,
      description: description || '',
      inviteCode,
      createdBy: userId,
      participants: [userId],
      logs: [],
    });

    await habit.save();
    await habit.populate('createdBy participants');

    res.status(201).json({
      habit: {
        id: habit._id,
        title: habit.title,
        description: habit.description,
        inviteCode: habit.inviteCode,
        createdBy: transformUser(habit.createdBy),
        participants: Array.isArray(habit.participants) ? habit.participants.map(transformUser) : [],
        logs: habit.logs,
      },
    });
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const habits = await Habit.find({
      participants: userId,
    }).populate('createdBy participants');

    res.json({
      habits: habits.map((habit) => ({
        id: habit._id,
        title: habit.title,
        description: habit.description,
        inviteCode: habit.inviteCode,
        createdBy: transformUser(habit.createdBy),
        participants: Array.isArray(habit.participants) ? habit.participants.map(transformUser) : [],
        logs: habit.logs,
      })),
    });
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ error: 'Failed to get habits' });
  }
});

router.get('/:habitId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { habitId } = req.params;
    const habit = await Habit.findById(habitId).populate('createdBy participants');

    if (!habit) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    res.json({
      habit: {
        id: habit._id,
        title: habit.title,
        description: habit.description,
        inviteCode: habit.inviteCode,
        createdBy: transformUser(habit.createdBy),
        participants: Array.isArray(habit.participants) ? habit.participants.map(transformUser) : [],
        logs: habit.logs,
      },
    });
  } catch (error) {
    console.error('Get habit error:', error);
    res.status(500).json({ error: 'Failed to get habit' });
  }
});

router.post('/:habitId/log', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { habitId } = req.params;
    const { date } = req.body;
    const userId = req.user?.userId;

    if (!date) {
      res.status(400).json({ error: 'Date is required' });
      return;
    }

    const habit = await Habit.findById(habitId);
    if (!habit) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    let log = habit.logs.find((l) => l.date === date);
    if (!log) {
      // Create new log entry and add user
      log = { date, completedBy: [] };
      habit.logs.push(log);
      log.completedBy.push(userId as any);
    } else {
      // Toggle: if user exists, remove them; otherwise add them
      const userIndex = log.completedBy.findIndex((id) => id.toString() === userId);
      if (userIndex !== -1) {
        // User already completed - remove them (toggle off)
        log.completedBy.splice(userIndex, 1);
        
        // If no one has completed this date, remove the entire log entry
        if (log.completedBy.length === 0) {
          const logIndex = habit.logs.findIndex((l) => l.date === date);
          if (logIndex !== -1) {
            habit.logs.splice(logIndex, 1);
          }
        }
      } else {
        // User hasn't completed - add them (toggle on)
        log.completedBy.push(userId as any);
      }
    }

    await habit.save();
    await habit.populate('createdBy participants');

    res.json({
      habit: {
        id: habit._id,
        title: habit.title,
        description: habit.description,
        inviteCode: habit.inviteCode,
        createdBy: transformUser(habit.createdBy),
        participants: Array.isArray(habit.participants) ? habit.participants.map(transformUser) : [],
        logs: habit.logs,
      },
    });
  } catch (error) {
    console.error('Add log error:', error);
    res.status(500).json({ error: 'Failed to add log' });
  }
});

router.post('/join/:inviteCode', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { inviteCode } = req.params;
    const userId = req.user?.userId;

    const habit = await Habit.findOne({ inviteCode });
    if (!habit) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    if (!habit.participants.some((id) => id.toString() === userId)) {
      habit.participants.push(userId as any);
      await habit.save();
    }

    await habit.populate('createdBy participants');

    res.json({
      habit: {
        id: habit._id,
        title: habit.title,
        description: habit.description,
        inviteCode: habit.inviteCode,
        createdBy: transformUser(habit.createdBy),
        participants: Array.isArray(habit.participants) ? habit.participants.map(transformUser) : [],
        logs: habit.logs,
      },
    });
  } catch (error) {
    console.error('Join habit error:', error);
    res.status(500).json({ error: 'Failed to join habit' });
  }
});

router.delete('/:habitId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { habitId } = req.params;
    const userId = req.user?.userId;

    const habit = await Habit.findById(habitId);
    if (!habit) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    // Only the creator can delete the habit
    if (habit.createdBy.toString() !== userId) {
      res.status(403).json({ error: 'Only the creator can delete this habit' });
      return;
    }

    await Habit.findByIdAndDelete(habitId);
    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ error: 'Failed to delete habit' });
  }
});

export default router;
