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
