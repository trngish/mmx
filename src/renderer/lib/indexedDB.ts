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