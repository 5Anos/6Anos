import React from 'react';

interface HighlightCluesProps {
  text: string;
  variant?: 'amber' | 'rose' | 'emerald' | 'blue';
  className?: string;
}

/**
 * Parses markdown bold (**clue**) and renders the text with strong visual emphasis,
 * high-contrast font weight, and an eye-catching background highlight.
 * This solves the issue of dense text on mobile/tablets for 11-year-old students,
 * allowing them to spot the 2 or 3 critical clues immediately without skimming or clicking at random.
 */
export const HighlightClues: React.FC<HighlightCluesProps> = ({
  text,
  variant = 'amber',
  className = '',
}) => {
  if (!text || !text.includes('**')) {
    return <span className={className}>{text}</span>;
  }

  const highlightStyles = {
    amber: 'font-black text-slate-950 bg-amber-200/80 px-1 py-0.5 rounded shadow-2xs border-b-2 border-amber-400',
    rose: 'font-black text-rose-950 bg-rose-200/80 px-1 py-0.5 rounded shadow-2xs border-b-2 border-rose-400',
    emerald: 'font-black text-emerald-950 bg-emerald-200/80 px-1 py-0.5 rounded shadow-2xs border-b-2 border-emerald-400',
    blue: 'font-black text-blue-950 bg-blue-200/80 px-1 py-0.5 rounded shadow-2xs border-b-2 border-blue-400',
  };

  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const content = part.slice(2, -2);
          return (
            <strong
              key={index}
              className={`inline-block mx-0.5 ${highlightStyles[variant]}`}
            >
              {content}
            </strong>
          );
        }
        return part;
      })}
    </span>
  );
};
