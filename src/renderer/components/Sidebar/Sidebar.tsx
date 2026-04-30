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
