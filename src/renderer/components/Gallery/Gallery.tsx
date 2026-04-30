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