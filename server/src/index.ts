import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './db.js';
import authRoutes from './routes/auth.js';
import habitRoutes from './routes/habits.js';
import groupRoutes from './routes/groups.js';
import memoryRoutes from './routes/memories.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

// CORS configuration for public access
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL || 'https://life-os-henna-seven.vercel.app'
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/memories', memoryRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
