import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  theme: 'light' | 'dark';
  sidebarExpanded: boolean;
  apiKey: string;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setSidebarExpanded: (expanded: boolean) => void;
  toggleSidebar: () => void;
  setApiKey: (key: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      sidebarExpanded: false,
      apiKey: process.env.MINIMAX_API_KEY || '',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
      setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
      toggleSidebar: () => set({ sidebarExpanded: !get().sidebarExpanded }),
      setApiKey: (key) => set({ apiKey: key }),
    }),
    { name: 'minimax-settings' }
  )
);