import { apiCall } from './client';
import { Group, Expense, Settlement, ExpenseSplit } from '../types';

export const groupsAPI = {
  create: async (name: string): Promise<{ group: Group }> => {
    return apiCall('/groups', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  getAll: async (): Promise<{ groups: Group[] }> => {
    return apiCall('/groups');
  },

  getById: async (groupId: string): Promise<{ group: Group }> => {
    return apiCall(`/groups/${groupId}`);
  },

  addExpense: async (
    groupId: string,
    description: string,
    amount: number,
    splits: ExpenseSplit[]
  ): Promise<{ expense: Expense }> => {
    return apiCall(`/groups/${groupId}/expenses`, {
      method: 'POST',
      body: JSON.stringify({ description, amount, splits }),
    });
  },

  getSettlements: async (groupId: string): Promise<{ settlements: Settlement[] }> => {
    return apiCall(`/groups/${groupId}/settlements`);
  },

  join: async (inviteCode: string): Promise<{ group: Group }> => {
    return apiCall(`/groups/join/${inviteCode}`, {
      method: 'POST',
    });
  },

  deleteExpense: async (groupId: string, expenseId: string): Promise<void> => {
    await apiCall(`/groups/${groupId}/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  },

  delete: async (groupId: string): Promise<void> => {
    await apiCall(`/groups/${groupId}`, {
      method: 'DELETE',
    });
  },
};
