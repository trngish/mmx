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