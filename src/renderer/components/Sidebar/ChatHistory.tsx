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
