import express, { Response } from 'express';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    const user = new User({ email, password, name });
    await user.save();

    const token = generateToken(user._id.toString(), user.email);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user._id.toString(), user.email);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (req: AuthenticatedRequest, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
