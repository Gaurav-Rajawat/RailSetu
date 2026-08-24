import { create } from 'zustand';

interface SyncState {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  setOnline: (status: boolean) => void;
  setPendingCount: (count: number) => void;
  setIsSyncing: (status: boolean) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isOnline: true,
  pendingCount: 0,
  isSyncing: false,
  setOnline: (isOnline) => set({ isOnline }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setIsSyncing: (isSyncing) => set({ isSyncing }),
}));
