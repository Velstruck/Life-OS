import { Memory, MemoryPagination } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const memoriesAPI = {
  create: async (formData: FormData): Promise<{ memory: Memory }> => {
    const url = `${API_BASE_URL}/api/memories`;
    const res = await fetch(url, {
      method: 'POST',
      headers: authHeaders(),       // no Content-Type – browser sets multipart boundary
      credentials: 'include',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create memory');
    }
    return res.json();
  },

  getAll: async (
    page = 1,
    limit = 20
  ): Promise<{ memories: Memory[]; pagination: MemoryPagination }> => {
    const url = `${API_BASE_URL}/api/memories?page=${page}&limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to fetch memories');
    }
    return res.json();
  },

  delete: async (memoryId: string): Promise<void> => {
    const url = `${API_BASE_URL}/api/memories/${memoryId}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete memory');
    }
  },
};
