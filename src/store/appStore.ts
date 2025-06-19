import { create } from 'zustand';
import { TabType, AppSettings } from '../types';
import { dbService } from '../services/database';

interface AppState {
  // UI State
  activeTab: TabType;
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  
  // Settings
  settings: AppSettings;
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  setActiveTab: (tab: TabType) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  loadSettings: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  activeTab: 'rss',
  theme: 'system',
  sidebarCollapsed: false,
  isLoading: false,
  settings: {
    theme: 'system',
    updateInterval: 30,
    defaultCategory: 'uncategorized',
    exportFormat: 'markdown',
    keyboardShortcuts: true,
  },

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setTheme: (theme) => {
    set({ theme });
    // Apply theme to document
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
  },
  
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  updateSettings: async (updates) => {
    const currentSettings = get().settings;
    const newSettings = { ...currentSettings, ...updates };
    
    try {
      await dbService.updateSettings(newSettings);
      set({ settings: newSettings });
      
      // Apply theme if it was updated
      if (updates.theme) {
        get().setTheme(updates.theme);
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  },
  
  loadSettings: async () => {
    try {
      const settings = await dbService.getSettings();
      set({ settings });
      get().setTheme(settings.theme);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
}));

// Initialize app on load
useAppStore.getState().loadSettings();

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  const { theme, setTheme } = useAppStore.getState();
  if (theme === 'system') {
    setTheme('system');
  }
});