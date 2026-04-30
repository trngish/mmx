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
