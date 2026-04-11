'use client';

import { useMemo } from 'react';

interface ChatMessageProps {
  content: string;
  isUser?: boolean;
}

// Basit inline markdown rendering: **bold**, [link](url), • listeler, \n satır sonu
export default function ChatMessage({ content }: ChatMessageProps) {
  const rendered = useMemo(() => parseContent(content), [content]);

  return (
    <div className="text-sm leading-relaxed whitespace-pre-wrap">
      {rendered}
    </div>
  );
}

function parseContent(content: string): React.ReactNode[] {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      nodes.push(<br key={`br-${lineIndex}`} />);
    }

    // Bullet point satırı
    const bulletMatch = line.match(/^[•\-]\s+(.+)$/);
    if (bulletMatch) {
      nodes.push(
        <span key={`bullet-${lineIndex}`} className="flex items-start gap-1.5 py-0.5">
          <span className="text-[10px] mt-1 opacity-60">●</span>
          <span>{parseInline(bulletMatch[1], `inline-${lineIndex}`)}</span>
        </span>
      );
      return;
    }

    // Normal satır — inline parsing
    nodes.push(
      <span key={`line-${lineIndex}`}>
        {parseInline(line, `inline-${lineIndex}`)}
      </span>
    );
  });

  return nodes;
}

function parseInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Regex: **bold**, [text](url), veya normal metin
  const regex = /(\*\*(.+?)\*\*)|(\[([^\]]+)\]\(([^)]+)\))|(https?:\/\/[^\s,)]+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Önceki düz metin
    if (match.index > lastIndex) {
      nodes.push(
        <span key={`${keyPrefix}-text-${lastIndex}`}>
          {text.slice(lastIndex, match.index)}
        </span>
      );
    }

    if (match[1]) {
      // **bold**
      nodes.push(
        <strong key={`${keyPrefix}-bold-${match.index}`} className="font-semibold">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // [text](url)
      nodes.push(
        <a
          key={`${keyPrefix}-link-${match.index}`}
          href={match[5]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 decoration-1 hover:opacity-80 transition-opacity"
          style={{ color: 'var(--accent)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {match[4]}
        </a>
      );
    } else if (match[6]) {
      // Düz URL
      const url = match[6];
      // Kısa görünen metin oluştur
      const displayText = url
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '');

      nodes.push(
        <a
          key={`${keyPrefix}-url-${match.index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 decoration-1 hover:opacity-80 transition-opacity"
          style={{ color: 'var(--accent)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {displayText}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Kalan metin
  if (lastIndex < text.length) {
    nodes.push(
      <span key={`${keyPrefix}-text-end`}>
        {text.slice(lastIndex)}
      </span>
    );
  }

  return nodes.length > 0 ? nodes : [<span key={`${keyPrefix}-empty`}>{text}</span>];
}
