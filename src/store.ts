import { create } from 'zustand';
import type { User, GoalSheet, GoalCycle, Notification, Goal, AchievementStatus, Quarter, Role } from './types';
import { DEMO_USERS, DEMO_SHEETS, DEMO_CYCLE, DEMO_NOTIFICATIONS, DEMO_AUDIT_LOGS } from './data';
import type { AuditLog } from './types';
import { api } from './services/api';

interface AppState {
  // Auth
  currentUser: User | null;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  initializeAuth: () => Promise<void>;

  // Data
  users: User[];
  sheets: GoalSheet[];
  cycle: GoalCycle;
  notifications: Notification[];
  auditLogs: AuditLog[];
  loading: boolean;

  // Data fetching
  fetchData: () => Promise<void>;

  // Navigation
  activePage: string;
  setActivePage: (page: string) => void;

  // Toast
  toasts: { id: string; type: 'success' | 'error' | 'info'; message: string }[];
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;

  // Goal actions
  addGoalToSheet: (sheetId: string, goal: Omit<Goal, 'id' | 'achievements'>) => Promise<void>;
  updateGoal: (sheetId: string, goalId: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (sheetId: string, goalId: string) => Promise<void>;
  submitSheet: (sheetId: string) => Promise<void>;
  approveSheet: (sheetId: string, approverId: string) => Promise<void>;
  rejectSheet: (sheetId: string, comment: string) => Promise<void>;
  unlockSheet: (sheetId: string) => Promise<void>;
  addComment: (sheetId: string, authorId: string, authorName: string, content: string) => Promise<void>;
  updateAchievement: (goalId: string, quarter: Quarter, actualValue: number | undefined, status: AchievementStatus, notes: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

let toastCounter = 0;

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: DEMO_USERS,
  sheets: DEMO_SHEETS,
  cycle: DEMO_CYCLE,
  notifications: DEMO_NOTIFICATIONS,
  auditLogs: DEMO_AUDIT_LOGS,
  activePage: 'dashboard',
  toasts: [],
  loading: false,

  initializeAuth: async () => {
    const token = api.getToken();
    if (token) {
      try {
        const user = await api.getMe();
        set({ currentUser: user });
      } catch (error) {
        api.clearToken();
      }
    }
  },

  login: async (email: string, password = 'demo123') => {
    try {
      const response = await api.login(email, password);
      api.setToken(response.token);
      // Convert role from uppercase to lowercase to match frontend types
      const user = {
        ...response.user,
        role: response.user.role.toLowerCase() as Role
      };
      set({ currentUser: user, activePage: 'dashboard' });
      await get().fetchData();
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  logout: () => {
    api.clearToken();
    set({ currentUser: null, activePage: 'dashboard', users: DEMO_USERS, sheets: DEMO_SHEETS, notifications: DEMO_NOTIFICATIONS, auditLogs: DEMO_AUDIT_LOGS });
  },

  fetchData: async () => {
    if (!get().currentUser) return;
    
    set({ loading: true });
    try {
      const [sheets, notifications, cycle] = await Promise.all([
        api.getGoalSheets(),
        api.getNotifications(),
        api.getActiveCycle().catch(() => DEMO_CYCLE),
      ]);

      // Fetch users if admin or manager
      let users = DEMO_USERS;
      if (get().currentUser?.role === 'admin' || get().currentUser?.role === 'manager') {
        try {
          const apiUsers = await api.getAllUsers();
          // Convert roles to lowercase
          users = apiUsers.map(u => ({
            ...u,
            role: u.role.toLowerCase() as Role
          }));
        } catch (error) {
          console.error('Failed to fetch users:', error);
        }
      }

      // Fetch audit logs if admin
      let auditLogs = DEMO_AUDIT_LOGS;
      if (get().currentUser?.role === 'admin') {
        try {
          auditLogs = await api.getAuditLogs();
        } catch (error) {
          console.error('Failed to fetch audit logs:', error);
        }
      }

      set({ sheets, notifications, cycle, users, auditLogs, loading: false });
    } catch (error) {
      console.error('Failed to fetch data:', error);
      set({ loading: false });
    }
  },

  setActivePage: (page) => set({ activePage: page }),

  showToast: (type, message) => {
    const id = String(++toastCounter);
    set(s => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => get().removeToast(id), 4000);
  },

  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  addGoalToSheet: async (sheetId, goal) => {
    try {
      const newGoal = await api.addGoal({ ...goal, sheetId });
      set(s => ({
        sheets: s.sheets.map(sh => sh.id === sheetId ? { ...sh, goals: [...sh.goals, newGoal] } : sh),
      }));
      get().showToast('success', 'Goal added!');
    } catch (error) {
      console.error('Add goal error:', error);
      get().showToast('error', 'Failed to add goal');
    }
  },

  updateGoal: async (sheetId, goalId, updates) => {
    try {
      const updated = await api.updateGoal(goalId, updates);
      set(s => ({
        sheets: s.sheets.map(sh => sh.id === sheetId
          ? { ...sh, goals: sh.goals.map(g => g.id === goalId ? updated : g) }
          : sh),
      }));
      get().showToast('success', 'Goal updated!');
    } catch (error) {
      console.error('Update goal error:', error);
      get().showToast('error', 'Failed to update goal');
    }
  },

  deleteGoal: async (sheetId, goalId) => {
    try {
      await api.deleteGoal(goalId);
      set(s => ({ sheets: s.sheets.map(sh => sh.id === sheetId ? { ...sh, goals: sh.goals.filter(g => g.id !== goalId) } : sh) }));
      get().showToast('success', 'Goal deleted!');
    } catch (error) {
      console.error('Delete goal error:', error);
      get().showToast('error', 'Failed to delete goal');
    }
  },

  submitSheet: async (sheetId) => {
    try {
      const updated = await api.submitGoalSheet(sheetId);
      set(s => ({ sheets: s.sheets.map(sh => sh.id === sheetId ? updated : sh) }));
      get().showToast('success', 'Goal sheet submitted successfully!');
    } catch (error) {
      console.error('Submit sheet error:', error);
      get().showToast('error', 'Failed to submit goal sheet');
    }
  },

  approveSheet: async (sheetId) => {
    try {
      const updated = await api.approveGoalSheet(sheetId);
      set(s => ({ sheets: s.sheets.map(sh => sh.id === sheetId ? updated : sh) }));
      get().showToast('success', 'Goal sheet approved and locked!');
    } catch (error) {
      console.error('Approve sheet error:', error);
      get().showToast('error', 'Failed to approve goal sheet');
    }
  },

  rejectSheet: async (sheetId, comment) => {
    try {
      const updated = await api.rejectGoalSheet(sheetId, comment);
      set(s => ({ sheets: s.sheets.map(sh => sh.id === sheetId ? updated : sh) }));
      get().showToast('info', 'Goal sheet returned for rework.');
    } catch (error) {
      console.error('Reject sheet error:', error);
      get().showToast('error', 'Failed to reject goal sheet');
    }
  },

  unlockSheet: async (sheetId) => {
    try {
      const updated = await api.unlockGoalSheet(sheetId);
      set(s => ({ sheets: s.sheets.map(sh => sh.id === sheetId ? updated : sh) }));
      get().showToast('success', 'Goal sheet unlocked for editing.');
    } catch (error) {
      console.error('Unlock sheet error:', error);
      get().showToast('error', 'Failed to unlock goal sheet');
    }
  },

  addComment: async (sheetId, authorId, authorName, content) => {
    try {
      const comment = await api.addComment({ goalSheetId: sheetId, authorId, authorName, content });
      set(s => ({
        sheets: s.sheets.map(sh => sh.id === sheetId ? {
          ...sh, comments: [...sh.comments, comment],
        } : sh),
      }));
    } catch (error) {
      console.error('Add comment error:', error);
      get().showToast('error', 'Failed to add comment');
    }
  },

  updateAchievement: async (goalId, quarter, actualValue, status, notes) => {
    try {
      await api.updateAchievement({ goalId, quarter, actualValue, status, notes });
      set(s => ({
        sheets: s.sheets.map(sh => ({
          ...sh,
          goals: sh.goals.map(g => g.id === goalId ? {
            ...g,
            achievements: g.achievements.map(a => a.quarter === quarter ? { ...a, actualValue, status, notes, submittedAt: new Date().toISOString() } : a),
          } : g),
        })),
      }));
      get().showToast('success', 'Achievement updated successfully!');
    } catch (error) {
      console.error('Update achievement error:', error);
      get().showToast('error', 'Failed to update achievement');
    }
  },

  markNotificationRead: async (id) => {
    try {
      await api.markNotificationRead(id);
      set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, isRead: true } : n) }));
    } catch (error) {
      console.error('Mark notification read error:', error);
    }
  },

  markAllRead: async () => {
    try {
      await api.markAllNotificationsRead();
      set(s => ({ notifications: s.notifications.map(n => ({ ...n, isRead: true })) }));
    } catch (error) {
      console.error('Mark all read error:', error);
    }
  },
}));
