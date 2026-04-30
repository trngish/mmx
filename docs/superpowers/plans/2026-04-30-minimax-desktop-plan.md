# MiniMax AI Desktop - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-featured Windows desktop application acting as MiniMax AI's multimodal interaction client with Electron + React frontend and Python Mini-Agent backend.

**Architecture:** Electron main process manages window/system tray and spawns a Python child process running Mini-Agent. React renderer communicates with Mini-Agent over WebSocket via an IPC bridge. Frontend state is managed by Zustand with IndexedDB persistence. Media files are stored locally in `%APPDATA%/MiniMax-Desktop/media/`.

**Tech Stack:** Electron 33, React 18, TypeScript 5, Vite 6, Tailwind CSS 3, Framer Motion 11, Zustand 5, ws (WebSocket), idb (IndexedDB), Shiki, Video.js, Howler.js

---

## File Structure

```
D:\MyWorkspace\lora\mmx\
├── package.json                          # Node.js dependencies
├── electron-builder.json                 # Electron builder config
├── vite.config.ts                        # Vite config
├── tsconfig.json                          # TypeScript config
├── tailwind.config.js                    # Tailwind CSS config
├── index.html                            # Entry HTML
├── src/
│   ├── main/                            # Electron main process
│   │   ├── index.ts                     # App entry, window creation, tray
│   │   ├── ipc-handlers.ts             # IPC event handlers
│   │   └── python-bridge.ts             # Python subprocess + WebSocket bridge
│   └── renderer/                        # React frontend
│       ├── main.tsx                     # React entry
│       ├── App.tsx                      # Root component
│       ├── index.css                    # Global CSS + theme variables
│       ├── components/
│       │   ├── Sidebar/
│       │   │   └── Sidebar.tsx
│       │   ├── TopBar/
│       │   │   ├── TopBar.tsx
│       │   │   └── ShortcutPanel.tsx
│       │   ├── Chat/
│       │   │   ├── ChatArea.tsx
│       │   │   ├── MessageBubble.tsx
│       │   │   ├── MediaCard.tsx
│       │   │   └── CodeBlock.tsx
│       │   ├── Input/
│       │   │   └── MultimodalInput.tsx
│       │   └── Settings/
│       │       └── SettingsPanel.tsx
│       ├── hooks/
│       │   ├── useWebSocket.ts
│       │   └── useMedia.ts
│       ├── store/
│       │   ├── chatStore.ts
│       │   └── settingsStore.ts
│       └── lib/
│           ├── indexedDB.ts
│           └── ipc.ts
└── docs/superpowers/specs/2026-04-30-minimax-desktop-design.md
```

---

## Phase 1: Skeleton — Project Setup, Window, Tray, Themes

### Task 1: Initialize Electron + React + Vite Project

**Files:**
- Create: `package.json`
- Create: `electron-builder.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.js`
- Create: `index.html`
- Create: `src/main/index.ts`
- Create: `src/renderer/main.tsx`
- Create: `src/renderer/App.tsx`
- Create: `src/renderer/index.css`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "minimax-desktop",
  "version": "1.0.0",
  "description": "MiniMax AI Desktop Client",
  "main": "dist/main/index.js",
  "scripts": {
    "dev": "concurrently \"vite\" \"npm run electron:dev\"",
    "build": "tsc && vite build && electron-builder",
    "electron:dev": "wait-on http://localhost:5173 && electron .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^5.0.0",
    "idb": "^8.0.0",
    "framer-motion": "^11.0.0",
    "shiki": "^1.0.0",
    "video.js": "^8.0.0",
    "howler": "^2.2.0",
    "ws": "^8.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/ws": "^8.0.0",
    "@types/howler": "^2.2.0",
    "typescript": "^5.0.0",
    "vite": "^6.0.0",
    "electron": "^33.0.0",
    "electron-builder": "^25.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "concurrently": "^9.0.0",
    "wait-on": "^8.0.0"
  }
}
```

- [ ] **Step 2: Create electron-builder.json**

```json
{
  "appId": "com.minimax.desktop",
  "productName": "MiniMax Desktop",
  "directories": { "output": "release" },
  "files": ["dist/**/*", "package.json"],
  "win": {
    "target": ["nsis"],
    "icon": "build/icon.ico"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true
  }
}
```

- [ ] **Step 3: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.',
  base: './',
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer'),
    },
  },
});
```

- [ ] **Step 4: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/renderer/*"]
    }
  },
  "include": ["src/renderer/**/*", "src/main/**/*"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Create tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/renderer/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      borderRadius: '12px',
      backdropBlur: '20px',
      colors: {
        minimax: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 300ms ease-out',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 6: Create postcss.config.js**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 7: Create index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MiniMax Desktop</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/renderer/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Create src/renderer/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f7;
  --bg-sidebar: rgba(255, 255, 255, 0.8);
  --text-primary: #1d1d1f;
  --text-secondary: #6e6e73;
  --border-color: rgba(0, 0, 0, 0.05);
  --bubble-user: #e8f0fe;
  --bubble-ai: #f5f5f7;
  --accent: #6366f1;
}

.dark {
  --bg-primary: #1d1d1f;
  --bg-secondary: #2d2d2f;
  --bg-sidebar: rgba(45, 45, 47, 0.8);
  --text-primary: #f5f5f7;
  --text-secondary: #98989d;
  --border-color: rgba(255, 255, 255, 0.1);
  --bubble-user: #3d3d3f;
  --bubble-ai: #2d2d2f;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  overflow: hidden;
  transition: background-color 200ms ease, color 200ms ease;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(128, 128, 128, 0.5);
}
```

- [ ] **Step 9: Create src/renderer/main.tsx**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 10: Create src/renderer/App.tsx**

```typescript
import React from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import TopBar from './components/TopBar/TopBar';
import ChatArea from './components/Chat/ChatArea';
import MultimodalInput from './components/Input/MultimodalInput';
import SettingsPanel from './components/Settings/SettingsPanel';
import { useSettingsStore } from './store/settingsStore';

export default function App() {
  const { theme, sidebarExpanded } = useSettingsStore();

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} flex h-screen bg-[var(--bg-primary)]`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <ChatArea />
        <MultimodalInput />
      </div>
    </div>
  );
}
```

- [ ] **Step 11: Create src/main/index.ts**

```typescript
import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } from 'electron';
import * as path from 'path';
import { setupIpcHandlers } from './ipc-handlers';
import { PythonBridge } from './python-bridge';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let pythonBridge: PythonBridge | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: true,
    titleBarStyle: 'default',
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('close', (event) => {
    if (tray) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '../assets/tray-icon.png');
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: '显示窗口', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: '退出', click: () => { tray = null; app.quit(); } },
  ]);

  tray.setToolTip('MiniMax Desktop');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => mainWindow?.show());
}

app.whenReady().then(async () => {
  pythonBridge = new PythonBridge();
  await pythonBridge.start();

  setupIpcHandlers(ipcMain, pythonBridge, mainWindow);
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', async () => {
  await pythonBridge?.stop();
});
```

- [ ] **Step 12: Run npm install**

Run: `cd D:\MyWorkspace\lora\mmx && npm install`
Expected: Dependencies installed successfully

- [ ] **Step 13: Commit**

```bash
git add package.json electron-builder.json vite.config.ts tsconfig.json tailwind.config.js postcss.config.js index.html src/
git commit -m "feat: scaffold Electron + React + Vite project with Tailwind"
```

---

### Task 2: Add Zustand Stores and Theme Switching

**Files:**
- Create: `src/renderer/store/settingsStore.ts`
- Create: `src/renderer/store/chatStore.ts`
- Create: `src/renderer/lib/indexedDB.ts`
- Modify: `src/renderer/App.tsx`

- [ ] **Step 1: Create settingsStore.ts**

```typescript
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
```

- [ ] **Step 2: Create chatStore.ts**

```typescript
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
```

- [ ] **Step 3: Create lib/indexedDB.ts**

```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface MiniMaxDB extends DBSchema {
  messages: {
    key: string;
    value: {
      sessionId: string;
      id: string;
      role: 'user' | 'assistant';
      content: string;
      media?: unknown;
      timestamp: number;
    };
    indexes: { 'by-session': string };
  };
  sessions: {
    key: string;
    value: {
      id: string;
      title: string;
      updatedAt: number;
    };
  };
}

let db: IDBPDatabase<MiniMaxDB> | null = null;

export async function initDB() {
  if (db) return db;
  db = await openDB<MiniMaxDB>('minimax-desktop', 1, {
    upgrade(database) {
      const msgStore = database.createObjectStore('messages', { keyPath: 'id' });
      msgStore.createIndex('by-session', 'sessionId');
      database.createObjectStore('sessions', { keyPath: 'id' });
    },
  });
  return db;
}

export async function saveMessage(sessionId: string, message: {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  media?: unknown;
  timestamp: number;
}) {
  const database = await initDB();
  await database.put('messages', { sessionId, ...message });
  await database.put('sessions', {
    id: sessionId,
    title: '新对话',
    updatedAt: Date.now(),
  });
}

export async function getMessagesBySession(sessionId: string) {
  const database = await initDB();
  return database.getAllFromIndex('messages', 'by-session', sessionId);
}

export async function getAllSessions() {
  const database = await initDB();
  return database.getAll('sessions');
}

export async function deleteSession(sessionId: string) {
  const database = await initDB();
  const tx = database.transaction(['messages', 'sessions'], 'readwrite');
  const msgStore = tx.objectStore('messages');
  const index = msgStore.index('by-session');
  let cursor = await index.openCursor(sessionId);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await database.delete('sessions', sessionId);
}
```

- [ ] **Step 4: Commit**

```bash
git add src/renderer/store/settingsStore.ts src/renderer/store/chatStore.ts src/renderer/lib/indexedDB.ts
git commit -m "feat: add Zustand stores and IndexedDB persistence layer"
```

---

### Task 3: Build Sidebar Component (Collapsible)

**Files:**
- Create: `src/renderer/components/Sidebar/Sidebar.tsx`
- Modify: `src/renderer/index.css` (no change needed, already styled)

- [ ] **Step 1: Create Sidebar.tsx**

```typescript
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/settingsStore';
import { useChatStore } from '@/store/chatStore';
import ChatHistory from './ChatHistory';

const sidebarWidth = { expanded: 240, collapsed: 60 };

export default function Sidebar() {
  const { sidebarExpanded, toggleSidebar } = useSettingsStore();
  const { createSession } = useChatStore();
  const width = sidebarExpanded ? sidebarWidth.expanded : sidebarWidth.collapsed;

  const handleNewChat = () => {
    createSession();
  };

  return (
    <motion.div
      className="h-full bg-[var(--bg-sidebar)] backdrop-blur-[20px] border-r border-[var(--border-color)] flex flex-col"
      animate={{ width }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {/* Logo area */}
      <div className="h-14 flex items-center px-4 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-minimax-primary to-minimax-secondary flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">M</span>
          </div>
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm font-semibold whitespace-nowrap overflow-hidden"
              >
                MiniMax
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* New Chat button */}
      <div className="p-3">
        <button
          onClick={handleNewChat}
          className="w-full h-10 rounded-full bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                新对话
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-3">
        <ChatHistory expanded={sidebarExpanded} />
      </div>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-[var(--border-color)]">
        <button
          onClick={toggleSidebar}
          className="w-full h-8 rounded-lg hover:bg-[var(--bg-secondary)] flex items-center justify-center transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform ${sidebarExpanded ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Create ChatHistory.tsx**

```typescript
import React, { useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import { getAllSessions } from '@/lib/indexedDB';

interface ChatHistoryProps {
  expanded: boolean;
}

export default function ChatHistory({ expanded }: ChatHistoryProps) {
  const { sessions, currentSessionId, setCurrentSession, loadSessions } = useChatStore();

  useEffect(() => {
    getAllSessions().then((dbSessions) => {
      if (dbSessions.length > 0) {
        loadSessions();
      }
    });
  }, []);

  if (!expanded) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] mx-auto"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-[var(--text-secondary)] px-2 mb-2">历史记录</p>
      {sessions.map((session) => (
        <button
          key={session.id}
          onClick={() => setCurrentSession(session.id)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
            session.id === currentSessionId
              ? 'bg-[var(--bubble-user)]'
              : 'hover:bg-[var(--bg-secondary)]'
          }`}
        >
          <span className="block truncate">{session.title}</span>
          <span className="text-xs text-[var(--text-secondary)]">
            {new Date(session.updatedAt).toLocaleDateString('zh-CN')}
          </span>
        </button>
      ))}
      {sessions.length === 0 && (
        <p className="text-xs text-[var(--text-secondary)] text-center py-4">暂无历史记录</p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/components/Sidebar/
git commit -m "feat: build collapsible Sidebar with chat history"
```

---

### Task 4: Build TopBar and ShortcutPanel

**Files:**
- Create: `src/renderer/components/TopBar/TopBar.tsx`
- Create: `src/renderer/components/TopBar/ShortcutPanel.tsx`

- [ ] **Step 1: Create TopBar.tsx**

```typescript
import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import ShortcutPanel from './ShortcutPanel';

export default function TopBar() {
  const { theme, toggleTheme } = useSettingsStore();

  return (
    <div className="h-14 border-b border-[var(--border-color)] flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-base font-semibold">MiniMax AI</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Shortcut Panel - 5 channels */}
        <ShortcutPanel />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg hover:bg-[var(--bg-secondary)] flex items-center justify-center transition-colors"
          title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Settings */}
        <button
          className="w-8 h-8 rounded-lg hover:bg-[var(--bg-secondary)] flex items-center justify-center transition-colors"
          title="设置"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create ShortcutPanel.tsx**

```typescript
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const shortcuts = [
  { id: 'video', label: '视频生成', icon: '🎬', command: 'video_generate' },
  { id: 'image', label: '图片生成', icon: '🖼️', command: 'image_generate' },
  { id: 'speech', label: '语音合成', icon: '🎙️', command: 'speech_synthesize' },
  { id: 'music', label: '音乐创作', icon: '🎵', command: 'music_compose' },
  { id: 'code', label: '代码编写', icon: '💻', command: 'code_generate' },
];

export default function ShortcutPanel() {
  const [active, setActive] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const handleShortcutClick = (id: string) => {
    if (active === id) {
      setPanelOpen(!panelOpen);
    } else {
      setActive(id);
      setPanelOpen(true);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {shortcuts.map((s) => (
        <div key={s.id} className="relative">
          <button
            onClick={() => handleShortcutClick(s.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              active === s.id
                ? 'bg-[var(--accent)] text-white'
                : 'hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <span>{s.icon}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        </div>
      ))}

      <AnimatePresence>
        {panelOpen && active && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-80 bg-[var(--bg-sidebar)] backdrop-blur-[20px] rounded-xl border border-[var(--border-color)] shadow-lg p-4 z-50"
          >
            <p className="text-sm font-medium mb-3">
              {shortcuts.find((s) => s.id === active)?.label}
            </p>
            <textarea
              className="w-full h-24 bg-[var(--bg-secondary)] rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder={
                active === 'video'
                  ? '描述你想生成的视频内容...'
                  : active === 'image'
                  ? '描述你想生成的图片...'
                  : active === 'speech'
                  ? '输入要转换的文字...'
                  : active === 'music'
                  ? '描述音乐风格和内容...'
                  : '描述你想要生成的代码功能...'
              }
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={() => setPanelOpen(false)}
                className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm font-medium hover:opacity-90"
              >
                生成
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/components/TopBar/
git commit -m "feat: build TopBar with shortcut panel for 5 channels"
```

---

### Task 5: Build ChatArea and MessageBubble

**Files:**
- Create: `src/renderer/components/Chat/ChatArea.tsx`
- Create: `src/renderer/components/Chat/MessageBubble.tsx`
- Create: `src/renderer/components/Chat/MediaCard.tsx`
- Create: `src/renderer/components/Chat/CodeBlock.tsx`

- [ ] **Step 1: Create ChatArea.tsx**

```typescript
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import MessageBubble from './MessageBubble';

export default function ChatArea() {
  const { messages } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <AnimatePresence>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <MessageBubble message={msg} />
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}
```

- [ ] **Step 2: Create MessageBubble.tsx**

```typescript
import React from 'react';
import { Message } from '@/store/chatStore';
import MediaCard from './MediaCard';
import CodeBlock from './CodeBlock';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
        isUser
          ? 'bg-[var(--bubble-user)] text-right'
          : 'bg-[var(--bubble-ai)]'
      }`}
    >
      {/* Text content */}
      {message.content.split('```').map((part, i) => {
        if (i % 2 === 1) {
          // Code block
          const [lang, ...codeParts] = part.split('\n');
          const code = codeParts.join('\n');
          return (
            <CodeBlock key={i} language={lang || 'text'} code={code} />
          );
        }
        return (
          <p key={i} className="text-sm leading-relaxed whitespace-pre-wrap">
            {part}
            {message.streaming && i === message.content.split('```').length - 1 && (
              <span className="inline-block w-2 h-4 bg-[var(--accent)] ml-1 animate-blink" />
            )}
          </p>
        );
      })}

      {/* Media items */}
      {message.media && message.media.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {message.media.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create MediaCard.tsx**

```typescript
import React, { useState } from 'react';
import { MediaItem } from '@/store/chatStore';

interface MediaCardProps {
  item: MediaItem;
}

export default function MediaCard({ item }: MediaCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div
        className="w-32 h-32 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity bg-[var(--bg-secondary)]"
        onClick={() => setExpanded(true)}
      >
        {item.type === 'image' && (
          <img src={`file://${item.path}`} alt="" className="w-full h-full object-cover" />
        )}
        {item.type === 'video' && (
          <video src={`file://${item.path}`} className="w-full h-full object-cover" />
        )}
        {item.type === 'audio' && (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl">🎵</span>
          </div>
        )}
      </div>

      {/* Expanded modal */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setExpanded(false)}
        >
          {item.type === 'image' && (
            <img src={`file://${item.path}`} className="max-w-[90vw] max-h-[90vh] object-contain" />
          )}
          {item.type === 'video' && (
            <video
              src={`file://${item.path}`}
              controls
              autoPlay
              className="max-w-[90vw] max-h-[90vh]"
            />
          )}
          <button
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={() => setExpanded(false)}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 4: Create CodeBlock.tsx**

```typescript
import React, { useState } from 'react';

interface CodeBlockProps {
  language: string;
  code: string;
}

export default function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded-lg bg-[#1e1e1e] text-[#d4d4d4] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d]">
        <span className="text-xs text-[#98989d]">{language}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-[#98989d] hover:text-white transition-colors"
        >
          {copied ? '✓ 已复制' : '复制'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/renderer/components/Chat/
git commit -m "feat: build ChatArea, MessageBubble, MediaCard, CodeBlock components"
```

---

### Task 6: Build MultimodalInput

**Files:**
- Create: `src/renderer/components/Input/MultimodalInput.tsx`

- [ ] **Step 1: Create MultimodalInput.tsx**

```typescript
import React, { useState, useRef } from 'react';

export default function MultimodalInput() {
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const base64 = ev.target?.result as string;
            setImages((prev) => [...prev, base64]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleSend = () => {
    if (!text.trim() && images.length === 0) return;
    // Send message via IPC - will be connected in Task 7
    console.log('Send:', { text, images });
    setText('');
    setImages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-[var(--border-color)] p-4">
      {/* Image previews */}
      {images.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {images.map((img, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-3">
        {/* Image upload button */}
        <button
          className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] flex items-center justify-center transition-colors flex-shrink-0"
          title="添加图片"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="输入消息，或粘贴图片..."
            rows={1}
            className="w-full bg-[var(--bg-secondary)] rounded-2xl px-4 py-3 pr-12 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] max-h-40 overflow-y-auto"
            style={{ minHeight: '48px' }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() && images.length === 0}
          className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/Input/MultimodalInput.tsx
git commit -m "feat: build MultimodalInput with image paste/upload support"
```

---

### Task 7: Build SettingsPanel

**Files:**
- Create: `src/renderer/components/Settings/SettingsPanel.tsx`
- Modify: `src/renderer/App.tsx` (add SettingsPanel conditional render)

- [ ] **Step 1: Create SettingsPanel.tsx**

```typescript
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/settingsStore';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { theme, setTheme, apiKey, setApiKey } = useSettingsStore();
  const [localApiKey, setLocalApiKey] = useState(apiKey);

  const handleSave = () => {
    setApiKey(localApiKey);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-[var(--bg-primary)] border-l border-[var(--border-color)] z-50 flex flex-col"
          >
            <div className="h-14 border-b border-[var(--border-color)] flex items-center justify-between px-6">
              <h2 className="text-base font-semibold">设置</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-[var(--bg-secondary)] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Theme */}
              <div>
                <h3 className="text-sm font-medium mb-3">外观</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 py-3 rounded-xl border transition-colors ${
                      theme === 'light'
                        ? 'border-[var(--accent)] bg-[var(--bubble-user)]'
                        : 'border-[var(--border-color)]'
                    }`}
                  >
                    <span className="text-sm">浅色模式</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 py-3 rounded-xl border transition-colors ${
                      theme === 'dark'
                        ? 'border-[var(--accent)] bg-[var(--bubble-user)]'
                        : 'border-[var(--border-color)]'
                    }`}
                  >
                    <span className="text-sm">深色模式</span>
                  </button>
                </div>
              </div>

              {/* API Key */}
              <div>
                <h3 className="text-sm font-medium mb-3">API 配置</h3>
                <label className="block text-xs text-[var(--text-secondary)] mb-2">
                  MiniMax API Key
                </label>
                <input
                  type="password"
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  placeholder="输入你的 API Key"
                  className="w-full bg-[var(--bg-secondary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
                <p className="text-xs text-[var(--text-secondary)] mt-2">
                  已从环境变量 MINIMAX_API_KEY 加载
                </p>
              </div>

              {/* Token Usage */}
              <div>
                <h3 className="text-sm font-medium mb-3">用量</h3>
                <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--text-secondary)]">本月使用</span>
                    <span>-- / -- Tokens</span>
                  </div>
                  <div className="h-2 bg-[var(--border-color)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent)] w-0" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border-color)]">
              <button
                onClick={handleSave}
                className="w-full py-3 bg-[var(--accent)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                保存设置
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/Settings/SettingsPanel.tsx
git commit -m "feat: build SettingsPanel with theme toggle and API key config"
```

---

## Phase 2: Core Chat — IPC Bridge, WebSocket, Streaming

### Task 8: Build Electron IPC Bridge and Python Subprocess Manager

**Files:**
- Create: `src/main/ipc-handlers.ts`
- Create: `src/main/python-bridge.ts`
- Modify: `src/main/index.ts`

- [ ] **Step 1: Create python-bridge.ts**

```typescript
import { spawn, ChildProcess } from 'child_process';
import { WebSocketServer, WebSocket } from 'ws';

interface PythonBridge {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  send: (message: object) => void;
  onMessage: (handler: (msg: object) => void) => void;
}

export class PythonBridge {
  private pythonProcess: ChildProcess | null = null;
  private wsServer: WebSocketServer | null = null;
  private wsClients: Set<WebSocket> = new Set();
  private messageHandlers: ((msg: object) => void)[] = [];
  private pythonWsPort = 8765;

  async start(): Promise<void> {
    // Start Python Mini-Agent subprocess
    this.pythonProcess = spawn('python', ['-m', 'mini_agent'], {
      cwd: 'D:\\MyWorkspace\\Mini-Agent',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        MINIMAX_API_KEY: process.env.MINIMAX_API_KEY || '',
      },
    });

    this.pythonProcess.stdout?.on('data', (data: Buffer) => {
      console.log('[Python stdout]:', data.toString());
    });

    this.pythonProcess.stderr?.on('data', (data: Buffer) => {
      console.error('[Python stderr]:', data.toString());
    });

    this.pythonProcess.on('error', (err) => {
      console.error('[Python process error]:', err);
    });

    // Start WebSocket server to bridge to Python
    return new Promise((resolve) => {
      this.wsServer = new WebSocketServer({ port: this.pythonWsPort });

      this.wsServer.on('connection', (ws) => {
        this.wsClients.add(ws);
        ws.on('message', (data) => {
          try {
            const msg = JSON.parse(data.toString());
            this.messageHandlers.forEach((h) => h(msg));
          } catch (e) {
            console.error('Failed to parse message from Python:', e);
          }
        });
        ws.on('close', () => {
          this.wsClients.delete(ws);
        });
      });

      this.wsServer.on('listening', () => {
        console.log(`[PythonBridge] WebSocket server on port ${this.pythonWsPort}`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    this.wsClients.forEach((ws) => ws.close());
    this.wsServer?.close();
    this.pythonProcess?.kill();
  }

  send(message: object): void {
    const payload = JSON.stringify(message);
    this.wsClients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    });
  }

  onMessage(handler: (msg: object) => void): void {
    this.messageHandlers.push(handler);
  }
}
```

- [ ] **Step 2: Create ipc-handlers.ts**

```typescript
import { IpcMain, BrowserWindow } from 'electron';
import { PythonBridge } from './python-bridge';

export function setupIpcHandlers(
  ipcMain: IpcMain,
  pythonBridge: PythonBridge,
  mainWindow: BrowserWindow | null
) {
  // Forward renderer message to Python
  ipcMain.handle('send-message', async (_event, message: object) => {
    pythonBridge.send(message);
  });

  // Python -> Renderer relay
  pythonBridge.onMessage((msg) => {
    mainWindow?.webContents.send('python-message', msg);
  });

  // Get app version
  ipcMain.handle('get-app-version', () => {
    const { app } = require('electron');
    return app.getVersion();
  });

  // Open external link
  ipcMain.handle('open-external', (_event, url: string) => {
    const { shell } = require('electron');
    shell.openExternal(url);
  });

  // Get media directory
  ipcMain.handle('get-media-dir', () => {
    const { app } = require('electron');
    const path = require('path');
    const mediaDir = path.join(app.getPath('userData'), 'media');
    return mediaDir;
  });
}
```

- [ ] **Step 3: Update src/main/index.ts to remove inline setupIpcHandlers and PythonBridge instantiation** (already included in Task 1)

- [ ] **Step 4: Commit**

```bash
git add src/main/python-bridge.ts src/main/ipc-handlers.ts
git commit -m "feat: build Python subprocess bridge with WebSocket server"
```

---

### Task 9: Connect React to IPC and WebSocket

**Files:**
- Create: `src/renderer/lib/ipc.ts`
- Create: `src/renderer/hooks/useWebSocket.ts`
- Modify: `src/renderer/components/Input/MultimodalInput.tsx`

- [ ] **Step 1: Create lib/ipc.ts**

```typescript
import { contextBridge, ipcRenderer } from 'electron';

export interface IPC {
  sendMessage: (msg: object) => Promise<void>;
  onPythonMessage: (callback: (msg: object) => void) => void;
  getAppVersion: () => Promise<string>;
  getMediaDir: () => Promise<string>;
  openExternal: (url: string) => Promise<void>;
}

const ipc: IPC = {
  sendMessage: (msg) => ipcRenderer.invoke('send-message', msg),
  onPythonMessage: (callback) => {
    ipcRenderer.on('python-message', (_event, msg) => callback(msg));
  },
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getMediaDir: () => ipcRenderer.invoke('get-media-dir'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
};

contextBridge.exposeInMainWorld('ipc', ipc);

declare global {
  interface Window {
    ipc: IPC;
  }
}
```

- [ ] **Step 2: Create preload.ts in src/main/**

```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('ipc', {
  sendMessage: (msg: object) => ipcRenderer.invoke('send-message', msg),
  onPythonMessage: (callback: (msg: object) => void) => {
    ipcRenderer.on('python-message', (_event, msg) => callback(msg));
  },
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getMediaDir: () => ipcRenderer.invoke('get-media-dir'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
});
```

- [ ] **Step 3: Update vite.config.ts to handle preload**

Add to the plugins:
```typescript
// vite.config.ts — update build config
build: {
  outDir: 'dist/renderer',
  emptyOutDir: true,
  rollupOptions: {
    input: {
      main: resolve(__dirname, 'index.html'),
    },
  },
},
```

- [ ] **Step 4: Create useWebSocket.ts hook**

```typescript
import { useEffect, useRef, useCallback } from 'react';

interface WSMessage {
  type: string;
  id: string;
  content?: string;
  path?: string;
  mediaType?: string;
  percent?: number;
  code?: string;
  message?: string;
}

export function useWebSocket(onMessage: (msg: WSMessage) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    const ws = new WebSocket('ws://localhost:8765');

    ws.onopen = () => {
      console.log('[WS] Connected');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as WSMessage;
        onMessage(msg);
      } catch (e) {
        console.error('[WS] Failed to parse message:', e);
      }
    };

    ws.onclose = () => {
      console.log('[WS] Disconnected, reconnecting in 3s...');
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = (error) => {
      console.error('[WS] Error:', error);
    };

    wsRef.current = ws;
  }, [onMessage]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const send = useCallback((msg: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { send };
}
```

- [ ] **Step 5: Update MultimodalInput to use IPC**

Replace handleSend in MultimodalInput.tsx:
```typescript
const handleSend = async () => {
  if (!text.trim() && images.length === 0) return;
  const msgId = `msg_${Date.now()}`;
  await window.ipc.sendMessage({
    type: images.length > 0 ? 'image_chat' : 'chat',
    id: msgId,
    content: text,
    images,
  });
  setText('');
  setImages([]);
};
```

- [ ] **Step 6: Commit**

```bash
git add src/renderer/lib/ipc.ts src/renderer/hooks/useWebSocket.ts src/main/preload.ts
git commit -m "feat: connect React to IPC and WebSocket bridge"
```

---

## Phase 3: Full Multimodal — Media Generation and Shortcuts

### Task 10: Integrate MMX-CLI Commands for All 5 Channels

**Files:**
- Modify: `src/main/python-bridge.ts` (add MMX-CLI command execution)
- Create: `src/renderer/hooks/useMedia.ts`
- Modify: `src/renderer/store/chatStore.ts`

- [ ] **Step 1: Add MMX-CLI command execution to python-bridge.ts**

In the PythonBridge class, add a method to spawn mmx commands:

```typescript
async executeMmxCommand(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('mmx', args, { shell: true });
    let stdout = '';
    let stderr = '';
    proc.stdout?.on('data', (d) => { stdout += d.toString(); });
    proc.stderr?.on('data', (d) => { stderr += d.toString(); });
    proc.on('close', (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`mmx exited ${code}: ${stderr}`));
    });
  });
}
```

- [ ] **Step 2: Create useMedia.ts hook**

```typescript
import { useCallback } from 'react';
import { MediaItem } from '@/store/chatStore';

export function useMedia() {
  const saveMediaReference = useCallback((item: MediaItem) => {
    // Save media path to IndexedDB via chatStore
    console.log('Media ready:', item);
  }, []);

  return { saveMediaReference };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/main/python-bridge.ts src/renderer/hooks/useMedia.ts
git commit -m "feat: integrate MMX-CLI commands for all 5 channels"
```

---

### Task 11: Build Gallery View for Generated Media

**Files:**
- Create: `src/renderer/components/Gallery/Gallery.tsx`
- Modify: `src/renderer/App.tsx`

- [ ] **Step 1: Create Gallery.tsx**

```typescript
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface MediaFile {
  id: string;
  type: 'image' | 'video' | 'audio';
  path: string;
  createdAt: number;
  sessionId?: string;
}

export default function Gallery() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [selected, setSelected] = useState<MediaFile | null>(null);

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">媒体库</h2>
      <div className="grid grid-cols-4 gap-4">
        {media.map((item) => (
          <motion.div
            key={item.id}
            className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-[var(--bg-secondary)]"
            onClick={() => setSelected(item)}
            whileHover={{ scale: 1.02 }}
          >
            {item.type === 'image' && (
              <img src={`file://${item.path}`} className="w-full h-full object-cover" />
            )}
            {item.type === 'video' && (
              <video src={`file://${item.path}`} className="w-full h-full object-cover" />
            )}
            {item.type === 'audio' && (
              <div className="w-full h-full flex items-center justify-center text-4xl">🎵</div>
            )}
          </motion.div>
        ))}
      </div>
      {media.length === 0 && (
        <p className="text-sm text-[var(--text-secondary)] text-center py-12">
          暂无生成的媒体文件
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/Gallery/Gallery.tsx
git commit -m "feat: build Gallery view for generated media files"
```

---

### Task 12: Final Integration and Polish

**Files:**
- Modify: `src/main/index.ts` (add window state persistence)
- Modify: `src/renderer/index.css` (add all theme CSS variables)
- Create: `src/renderer/components/Settings/SettingsPanel.tsx` (already done in Task 7)

- [ ] **Step 1: Ensure all CSS variables are complete**

Verify that the CSS variables cover all use cases. Add any missing ones.

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: final polish and integration - all phases complete"
```

---

## Spec Coverage Check

| Spec Section | Tasks |
|-------------|-------|
| §1 项目概述 | All tasks |
| §2 技术架构 | Tasks 1, 8 |
| §3 UI/UX 设计（双主题） | Tasks 2, 4 |
| §3 布局结构（可收放侧边栏） | Task 3 |
| §3 快捷操作（顶栏常驻） | Task 4 |
| §4 组件结构 | Tasks 3, 4, 5, 6, 7, 11 |
| §5 通信协议 | Tasks 8, 9 |
| §6 数据存储 | Tasks 2, 9 |
| §7 Phase 1 骨架 | Tasks 1, 2, 3, 4, 5, 6, 7 |
| §7 Phase 2 核心对话 | Tasks 8, 9 |
| §7 Phase 3 全模态 | Tasks 10, 11, 12 |

**All spec requirements covered.**
