import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitsAPI } from '../api/habits';
import { Habit } from '../types';
import { useAuthStore } from '../stores/authStore';

export const useHabits = () => {
  return useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const response = await habitsAPI.getAll();
      return response.habits;
    },
  });
};

export const useHabit = (habitId: string) => {
  return useQuery({
    queryKey: ['habit', habitId],
    queryFn: async () => {
      const response = await habitsAPI.getById(habitId);
      return response.habit;
    },
    enabled: !!habitId, // Only run query if habitId exists
  });
};

export const useCreateHabit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, description }: { title: string; description?: string }) => {
      const response = await habitsAPI.create(title, description);
      return response.habit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};

export const useAddHabitLog = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async ({ habitId, date }: { habitId: string; date: string }) => {
      const response = await habitsAPI.addLog(habitId, date);
      return response.habit;
    },
    onMutate: async ({ habitId, date }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['habit', habitId] });
      
      // Snapshot the previous value for rollback
      const previousHabit = queryClient.getQueryData<Habit>(['habit', habitId]);
      
      // Optimistically update the cache
      if (previousHabit && user) {
        queryClient.setQueryData<Habit>(['habit', habitId], (old) => {
          if (!old) return old;
          
          const logs = old.logs || [];
          const logIndex = logs.findIndex((l) => l.date === date);
          
          if (logIndex === -1) {
            // No log for this date - create one with current user
            return {
              ...old,
              logs: [...logs, { date, completedBy: [user.id] }],
            };
          }
          
          // Log exists - toggle user
          const log = logs[logIndex];
          const userIndex = log.completedBy.indexOf(user.id);
          
          if (userIndex === -1) {
            // User not in completedBy - add them
            const newCompletedBy = [...log.completedBy, user.id];
            const newLogs = [...logs];
            newLogs[logIndex] = { ...log, completedBy: newCompletedBy };
            return { ...old, logs: newLogs };
          } else {
            // User already in completedBy - remove them
            const newCompletedBy = log.completedBy.filter((id) => id !== user.id);
            
            if (newCompletedBy.length === 0) {
              // Remove empty log
              return { ...old, logs: logs.filter((l) => l.date !== date) };
            } else {
              // Update log with user removed
              const newLogs = [...logs];
              newLogs[logIndex] = { ...log, completedBy: newCompletedBy };
              return { ...old, logs: newLogs };
            }
          }
        });
      }
      
      return { previousHabit };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousHabit) {
        queryClient.setQueryData(['habit', variables.habitId], context.previousHabit);
      }
      // Show error toast
      const error = err as any;
      console.error('Failed to update streak:', error);
    },
    onSuccess: (habit: Habit) => {
      // Update with server data
      queryClient.setQueryData(['habit', habit.id], habit);
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};

export const useJoinHabit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ inviteCode }: { inviteCode: string }) => {
      const response = await habitsAPI.join(inviteCode);
      return response.habit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};

export const useDeleteHabit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (habitId: string) => {
      await habitsAPI.delete(habitId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};
