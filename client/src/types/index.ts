export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface HabitLog {
  date: string;
  completedBy: string[];
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  inviteCode: string;
  createdBy: User | string;
  participants: User[] | string[];
  logs: HabitLog[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseSplit {
  userId: string;
  amount: number;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: User | string;
  splits: ExpenseSplit[];
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: User | string;
  members: User[] | string[];
  expenses: Expense[] | string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export interface Memory {
  id: string;
  userId: string;
  title?: string;
  content: string;
  images: string[];
  category: 'memory' | 'thought' | 'quote';
  createdAt: string;
  updatedAt: string;
}

export interface MemoryPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}
