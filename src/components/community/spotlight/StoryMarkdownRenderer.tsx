import React from 'react';

interface StoryMarkdownRendererProps {
  content: string;
  className?: string;
}

export const StoryMarkdownRenderer: React.FC<StoryMarkdownRendererProps> = ({
  content,
  className = '',
}) => {
  if (!content) return null;

  // Helper to format inline bold, italic, and links
  const formatInline = (text: string): React.ReactNode[] => {
    // Split by markdown inline tokens: **bold**, *italic*, `code`
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(text.substring(lastIdx, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={`b-${match.index}`} className="font-bold text-[#1D0C06]">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(
          <em key={`i-${match.index}`} className="italic text-stone-800">
            {token.slice(1, -1)}
          </em>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code
            key={`c-${match.index}`}
            className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-800 text-xs font-mono"
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      lastIdx = regex.lastIndex;
    }

    if (lastIdx < text.length) {
      parts.push(text.substring(lastIdx));
    }

    return parts.length > 0 ? parts : [text];
  };

  // Group raw lines into logical blocks (paragraphs, headers, quotes, lists)
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Horizontal Rule: --- or ***
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      blocks.push(<hr key={`hr-${i}`} className="my-6 border-t border-stone-200" />);
      i++;
      continue;
    }

    // Heading 1: # Header
    if (trimmed.startsWith('# ')) {
      blocks.push(
        <h1
          key={`h1-${i}`}
          className="font-display text-2xl sm:text-3xl font-extrabold text-[#1D0C06] tracking-tight mt-6 mb-3 pb-2 border-b border-stone-200/80 leading-tight"
        >
          {formatInline(trimmed.replace(/^#\s+/, ''))}
        </h1>
      );
      i++;
      continue;
    }

    // Heading 2: ## Header
    if (trimmed.startsWith('## ')) {
      blocks.push(
        <h2
          key={`h2-${i}`}
          className="font-display text-xl sm:text-2xl font-bold text-[#1D0C06] tracking-tight mt-5 mb-2.5 leading-snug flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
          <span>{formatInline(trimmed.replace(/^##\s+/, ''))}</span>
        </h2>
      );
      i++;
      continue;
    }

    // Heading 3: ### Header
    if (trimmed.startsWith('### ')) {
      blocks.push(
        <h3
          key={`h3-${i}`}
          className="font-display text-lg sm:text-xl font-bold text-[#2C140A] mt-4 mb-2 leading-snug"
        >
          {formatInline(trimmed.replace(/^###\s+/, ''))}
        </h3>
      );
      i++;
      continue;
    }

    // Heading 4: #### Header
    if (trimmed.startsWith('#### ')) {
      blocks.push(
        <h4
          key={`h4-${i}`}
          className="font-display text-base font-bold text-stone-800 uppercase tracking-wide mt-3 mb-1.5"
        >
          {formatInline(trimmed.replace(/^####\s+/, ''))}
        </h4>
      );
      i++;
      continue;
    }

    // Blockquote: > quote
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }
      blocks.push(
        <blockquote
          key={`quote-${i}`}
          className="border-l-4 border-emerald-600 bg-emerald-50/70 p-4 my-4 rounded-r-2xl italic text-stone-800 text-sm sm:text-base font-medium shadow-xs"
        >
          <p className="leading-relaxed">"{formatInline(quoteLines.join(' '))}"</p>
        </blockquote>
      );
      continue;
    }

    // Unordered List: - item or * item
    if (/^[-*]\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="space-y-2 my-3 pl-1">
          {listItems.map((item, itemIdx) => (
            <li key={itemIdx} className="flex items-start gap-2.5 text-stone-800 text-sm sm:text-base leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2.5 flex-shrink-0" />
              <div className="flex-1">{formatInline(item)}</div>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered List: 1. item
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems: { num: string; text: string }[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const itemLine = lines[i].trim();
        const match = itemLine.match(/^(\d+)\.\s+(.*)$/);
        if (match) {
          listItems.push({ num: match[1], text: match[2] });
        } else {
          listItems.push({ num: `${listItems.length + 1}`, text: itemLine });
        }
        i++;
      }
      blocks.push(
        <ol key={`ol-${i}`} className="space-y-2.5 my-3 pl-1">
          {listItems.map((item, itemIdx) => (
            <li
              key={itemIdx}
              className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-stone-200/80 shadow-2xs text-stone-800 text-sm sm:text-base leading-relaxed"
            >
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {item.num}
              </span>
              <div className="flex-1">{formatInline(item.text)}</div>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Regular Paragraph
    const paraLines: string[] = [trimmed];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('>') &&
      !lines[i].trim().startsWith('---') &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }

    blocks.push(
      <p
        key={`p-${i}`}
        className="text-stone-800 text-sm sm:text-base leading-relaxed my-3 font-normal"
      >
        {formatInline(paraLines.join(' '))}
      </p>
    );
  }

  return <div className={`story-markdown-body space-y-1 ${className}`}>{blocks}</div>;
};
