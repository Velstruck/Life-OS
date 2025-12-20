import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsAPI } from '../api/groups';
import { Group, ExpenseSplit } from '../types';

export const useGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const response = await groupsAPI.getAll();
      return response.groups;
    },
  });
};

export const useGroup = (groupId: string) => {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      const response = await groupsAPI.getById(groupId);
      return response.group;
    },
    enabled: !!groupId, // Only run query if groupId exists
  });
};

export const useSettlements = (groupId: string) => {
  return useQuery({
    queryKey: ['settlements', groupId],
    queryFn: async () => {
      const response = await groupsAPI.getSettlements(groupId);
      return response.settlements;
    },
    enabled: !!groupId, // Only run query if groupId exists
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const response = await groupsAPI.create(name);
      return response.group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

export const useAddExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      groupId,
      description,
      amount,
      splits,
    }: {
      groupId: string;
      description: string;
      amount: number;
      splits: ExpenseSplit[];
    }) => {
      const response = await groupsAPI.addExpense(groupId, description, amount, splits);
      return response.expense;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['settlements', variables.groupId] });
    },
  });
};

export const useJoinGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ inviteCode }: { inviteCode: string }) => {
      const response = await groupsAPI.join(inviteCode);
      return response.group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupId, expenseId }: { groupId: string; expenseId: string }) => {
      await groupsAPI.deleteExpense(groupId, expenseId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['settlements', variables.groupId] });
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      await groupsAPI.delete(groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};
