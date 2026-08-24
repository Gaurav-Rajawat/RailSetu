import { create } from 'zustand';

export interface AppNotification {
  id: string;
  reportId: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

interface NotificationsState {
  notifications: AppNotification[];
  addNotification: (notification: AppNotification) => void;
  markAsRead: (id: string) => void;
  getUnreadCount: () => number;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications]
  })),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  getUnreadCount: () => get().notifications.filter(n => !n.read).length
}));
