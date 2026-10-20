import React from 'react';
import { Lightbulb, RotateCcw } from 'lucide-react';

interface ScaffoldingClueCardProps {
  clues?: string[] | string;
  clueText?: string;
  onRetry?: () => void;
  mascotName?: string;
  themeColor?: 'emerald' | 'blue' | 'purple' | 'amber' | 'indigo';
}

export const ScaffoldingClueCard: React.FC<ScaffoldingClueCardProps> = ({
  clues,
  clueText,
  onRetry,
  mascotName,
  themeColor = 'blue',
}) => {
  // Normalize clues to an array of non-empty strings
  const clueList: string[] = [];
  if (Array.isArray(clues)) {
    clueList.push(...clues.filter((c) => typeof c === 'string' && c.trim().length > 0));
  } else if (typeof clues === 'string' && clues.trim().length > 0) {
    clueList.push(clues.trim());
  }

  if (typeof clueText === 'string' && clueText.trim().length > 0 && !clueList.includes(clueText.trim())) {
    clueList.push(clueText.trim());
  }

  // If there are no clues to display, never render an empty card
  if (clueList.length === 0) {
    return null;
  }

  const defaultMascots: Record<string, string> = {
    emerald: 'Guardião Digital 🛡️',
    blue: 'Detetive Digital 🕵️‍♂️',
    purple: 'Criador Digital 🎨',
    amber: 'Mestre dos Algoritmos 🤖',
    indigo: 'Explorador da IA 🚀',
  };

  const effectiveMascot = mascotName || defaultMascots[themeColor] || 'Guardião Digital 🛡️';

  const colorMap = {
    emerald: 'bg-emerald-50/90 border-emerald-300 text-emerald-950',
    blue: 'bg-blue-50/90 border-blue-300 text-blue-950',
    purple: 'bg-purple-50/90 border-purple-300 text-purple-950',
    amber: 'bg-amber-50/90 border-amber-300 text-amber-950',
    indigo: 'bg-indigo-50/90 border-indigo-300 text-indigo-950',
  }[themeColor] || 'bg-blue-50/90 border-blue-300 text-blue-950';

  const btnColor = {
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    blue: 'bg-blue-600 hover:bg-blue-700 text-white',
    purple: 'bg-purple-600 hover:bg-purple-700 text-white',
    amber: 'bg-amber-600 hover:bg-amber-700 text-white',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  }[themeColor] || 'bg-blue-600 hover:bg-blue-700 text-white';

  const bulletBg = {
    emerald: 'bg-emerald-200 text-emerald-900',
    blue: 'bg-blue-200 text-blue-900',
    purple: 'bg-purple-200 text-purple-900',
    amber: 'bg-amber-200 text-amber-900',
    indigo: 'bg-indigo-200 text-indigo-900',
  }[themeColor] || 'bg-blue-200 text-blue-900';

  const cardInnerBg = {
    emerald: 'bg-white border-emerald-200/80',
    blue: 'bg-white border-blue-200/80',
    purple: 'bg-white border-purple-200/80',
    amber: 'bg-white border-amber-200/80',
    indigo: 'bg-white border-indigo-200/80',
  }[themeColor] || 'bg-white border-blue-200/80';

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border-2 ${colorMap} shadow-xs space-y-3 animate-in fade-in`}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shadow-2xs shrink-0">
            <Lightbulb className="w-4 h-4 fill-current" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider opacity-80 block text-amber-900">
              💡 Pista Amiga de Apoio
            </span>
            <h5 className="text-xs sm:text-sm font-black">Dica do {effectiveMascot}</h5>
          </div>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs shadow-xs transition-transform active:scale-95 cursor-pointer ${btnColor}`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tentar de Novo (2.ª Chance)</span>
          </button>
        )}
      </div>

      <div className={`${cardInnerBg} border p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm leading-relaxed shadow-2xs space-y-2`}>
        {clueList.length === 1 ? (
          <p className="font-semibold text-slate-800">{clueList[0]}</p>
        ) : (
          <ul className="space-y-2">
            {clueList.map((clue, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className={`w-5 h-5 rounded-lg ${bulletBg} flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5`}>
                  {idx + 1}
                </span>
                <span className="font-medium text-slate-800 leading-snug">{clue}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
