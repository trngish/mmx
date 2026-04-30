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
