import { apiCall } from './client';
import { AuthResponse, User } from '../types';

export const authAPI = {
  register: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async (): Promise<void> => {
    await apiCall('/auth/logout', {
      method: 'POST',
    });
  },

  getMe: async (): Promise<{ user: User }> => {
    return apiCall('/auth/me');
  },
};
