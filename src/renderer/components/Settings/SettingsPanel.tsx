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
