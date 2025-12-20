import { create } from 'zustand';

interface UIStore {
  createHabitOpen: boolean;
  createGroupOpen: boolean;
  joinHabitOpen: boolean;
  joinGroupOpen: boolean;
  setCreateHabitOpen: (open: boolean) => void;
  setCreateGroupOpen: (open: boolean) => void;
  setJoinHabitOpen: (open: boolean) => void;
  setJoinGroupOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  createHabitOpen: false,
  createGroupOpen: false,
  joinHabitOpen: false,
  joinGroupOpen: false,
  setCreateHabitOpen: (open) => set({ createHabitOpen: open }),
  setCreateGroupOpen: (open) => set({ createGroupOpen: open }),
  setJoinHabitOpen: (open) => set({ joinHabitOpen: open }),
  setJoinGroupOpen: (open) => set({ joinGroupOpen: open }),
}));
