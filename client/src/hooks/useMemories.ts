import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { memoriesAPI } from '../api/memories';
import { Memory } from '../types';

export const useMemories = () => {
  return useInfiniteQuery({
    queryKey: ['memories'],
    queryFn: async ({ pageParam = 1 }) => {
      return memoriesAPI.getAll(pageParam, 20);
    },
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const useCreateMemory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await memoriesAPI.create(formData);
      return response.memory;
    },
    // Optimistic update: immediately add the placeholder to the top of the list
    onMutate: async (formData) => {
      await queryClient.cancelQueries({ queryKey: ['memories'] });
      const previous = queryClient.getQueryData(['memories']);

      // Build a temporary memory object for optimistic UI
      const tempMemory: Memory = {
        id: `temp-${Date.now()}`,
        userId: '',
        title: formData.get('title') as string || '',
        content: formData.get('content') as string || '',
        images: [],
        category: (formData.get('category') as Memory['category']) || 'memory',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Build preview URLs for images attached
      const files = formData.getAll('images') as File[];
      tempMemory.images = files.map((f) => URL.createObjectURL(f));

      queryClient.setQueryData(['memories'], (old: any) => {
        if (!old) return { pages: [{ memories: [tempMemory], pagination: { page: 1, limit: 20, total: 1, pages: 1 } }], pageParams: [1] };
        const newPages = [...old.pages];
        newPages[0] = {
          ...newPages[0],
          memories: [tempMemory, ...newPages[0].memories],
        };
        return { ...old, pages: newPages };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['memories'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
  });
};

export const useDeleteMemory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memoryId: string) => {
      await memoriesAPI.delete(memoryId);
    },
    onMutate: async (memoryId) => {
      await queryClient.cancelQueries({ queryKey: ['memories'] });
      const previous = queryClient.getQueryData(['memories']);

      queryClient.setQueryData(['memories'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            memories: page.memories.filter((m: Memory) => m.id !== memoryId),
          })),
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['memories'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
  });
};
