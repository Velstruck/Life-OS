import { apiCall } from './client';
import { Habit } from '../types';

export const habitsAPI = {
  create: async (title: string, description?: string): Promise<{ habit: Habit }> => {
    return apiCall('/habits', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    });
  },

  getAll: async (): Promise<{ habits: Habit[] }> => {
    return apiCall('/habits');
  },

  getById: async (habitId: string): Promise<{ habit: Habit }> => {
    return apiCall(`/habits/${habitId}`);
  },

  addLog: async (habitId: string, date: string): Promise<{ habit: Habit }> => {
    return apiCall(`/habits/${habitId}/log`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  },

  join: async (inviteCode: string): Promise<{ habit: Habit }> => {
    return apiCall(`/habits/join/${inviteCode}`, {
      method: 'POST',
    });
  },

  delete: async (habitId: string): Promise<void> => {
    await apiCall(`/habits/${habitId}`, {
      method: 'DELETE',
    });
  },
};
