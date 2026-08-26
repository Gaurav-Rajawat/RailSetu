import { create } from 'zustand';
import { ProblemReport, WorkOrder } from '@/types/railway';

// Helper to get initial theme
const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('railops_theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

const applyThemeToDOM = (theme: 'light' | 'dark') => {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  root.classList.add('theme-transition');
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  localStorage.setItem('railops_theme', theme);
  setTimeout(() => {
    root.classList.remove('theme-transition');
  }, 300);
};

interface UIState {
  // Theme state
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Sidebar State
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Global Corridor Filter & Zone Filter
  activeCorridorFilter: string; // 'ALL' | 'C12' | 'C04' ...
  setActiveCorridorFilter: (corridorId: string) => void;
  activeZone: string;           // 'ALL' | 'NR' | 'WR' | 'CR' | 'ER' | 'SR'
  setActiveZone: (zone: string) => void;

  // Global Search Modal
  isGlobalSearchOpen: boolean;
  setGlobalSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Emergency SOS Modal
  isEmergencyModalOpen: boolean;
  setEmergencyModalOpen: (open: boolean) => void;

  // Crew Dispatch Modal
  isDispatchModalOpen: boolean;
  setDispatchModalOpen: (open: boolean) => void;
  selectedAlertForDispatch: ProblemReport | null;
  setSelectedAlertForDispatch: (alert: ProblemReport | null) => void;

  // Work Order Details
  selectedWorkOrder: WorkOrder | null;
  setSelectedWorkOrder: (wo: WorkOrder | null) => void;

  // Live Reports Detail View Modal
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;
  isReportModalOpen: boolean;
  setReportModalOpen: (open: boolean) => void;

  // Coordination Center Block Proposal Modal
  proposeModalCorridorId: string | null;
  setProposeModalCorridorId: (corridorId: string | null) => void;

  // Block Planning Modify Time Modal
  modifyBlockId: string | null;
  setModifyBlockId: (id: string | null) => void;
}

const initialTheme = getInitialTheme();
applyThemeToDOM(initialTheme);

export const useUIStore = create<UIState>((set) => ({
  theme: initialTheme,
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      applyThemeToDOM(nextTheme);
      return { theme: nextTheme };
    }),
  setTheme: (theme) => {
    applyThemeToDOM(theme);
    set({ theme });
  },

  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  activeCorridorFilter: 'ALL',
  setActiveCorridorFilter: (corridorId) => set({ activeCorridorFilter: corridorId }),

  activeZone: 'NR',
  setActiveZone: (zone) => set({ activeZone: zone }),

  isGlobalSearchOpen: false,
  setGlobalSearchOpen: (open) => set({ isGlobalSearchOpen: open }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  isEmergencyModalOpen: false,
  setEmergencyModalOpen: (open) => set({ isEmergencyModalOpen: open }),

  isDispatchModalOpen: false,
  setDispatchModalOpen: (open) => set({ isDispatchModalOpen: open }),
  selectedAlertForDispatch: null,
  setSelectedAlertForDispatch: (alert) =>
    set({ selectedAlertForDispatch: alert, isDispatchModalOpen: !!alert }),

  selectedWorkOrder: null,
  setSelectedWorkOrder: (wo) => set({ selectedWorkOrder: wo }),

  selectedReportId: null,
  setSelectedReportId: (id) => set({ selectedReportId: id, isReportModalOpen: !!id }),
  isReportModalOpen: false,
  setReportModalOpen: (open) =>
    set((state) => ({ isReportModalOpen: open, selectedReportId: open ? state.selectedReportId : null })),

  proposeModalCorridorId: null,
  setProposeModalCorridorId: (corridorId) => set({ proposeModalCorridorId: corridorId }),

  modifyBlockId: null,
  setModifyBlockId: (id) => set({ modifyBlockId: id }),
}));
