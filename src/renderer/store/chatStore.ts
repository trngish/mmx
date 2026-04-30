import { create } from 'zustand';

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'code';
  path: string;
  thumbnail?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  media?: MediaItem[];
  timestamp: number;
  streaming?: boolean;
}

interface ChatState {
  messages: Message[];
  currentSessionId: string | null;
  sessions: { id: string; title: string; updatedAt: number }[];
  addMessage: (msg: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  appendContent: (id: string, chunk: string) => void;
  setCurrentSession: (id: string | null) => void;
  createSession: () => string;
  loadSessions: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  currentSessionId: null,
  sessions: [],

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),

  appendContent: (id, chunk) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + chunk } : m
      ),
    })),

  setCurrentSession: (id) => set({ currentSessionId: id }),

  createSession: () => {
    const id = `session_${Date.now()}`;
    const newSession = { id, title: '新对话', updatedAt: Date.now() };
    set((state) => ({
      sessions: [newSession, ...state.sessions],
      currentSessionId: id,
      messages: [],
    }));
    return id;
  },

  loadSessions: () => {
    // Loaded from IndexedDB on app start
  },
}));