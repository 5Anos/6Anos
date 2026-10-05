import React from 'react';
import { Lightbulb, RotateCcw, Sparkles, HelpCircle } from 'lucide-react';

interface ScaffoldingClueCardProps {
  clueText: string;
  onRetry?: () => void;
  mascotName?: string;
  themeColor?: 'emerald' | 'blue' | 'purple' | 'amber' | 'indigo';
}

export const ScaffoldingClueCard: React.FC<ScaffoldingClueCardProps> = ({
  clueText,
  onRetry,
  mascotName = 'Mascote Guia',
  themeColor = 'blue',
}) => {
  const colorMap = {
    emerald: 'bg-emerald-50 border-emerald-300 text-emerald-950',
    blue: 'bg-blue-50 border-blue-300 text-blue-950',
    purple: 'bg-purple-50 border-purple-300 text-purple-950',
    amber: 'bg-amber-50 border-amber-300 text-amber-950',
    indigo: 'bg-indigo-50 border-indigo-300 text-indigo-950',
  }[themeColor];

  const btnColor = {
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    blue: 'bg-blue-600 hover:bg-blue-700 text-white',
    purple: 'bg-purple-600 hover:bg-purple-700 text-white',
    amber: 'bg-amber-600 hover:bg-amber-700 text-white',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  }[themeColor];

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border-2 ${colorMap} shadow-xs space-y-3 animate-in fade-in`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shadow-2xs">
            <Lightbulb className="w-4 h-4 fill-current" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider opacity-75 block">
              Feedback Formativo &amp; Pista de Reflexão
            </span>
            <h5 className="text-xs font-black">Dica do {mascotName} 💬</h5>
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

      <div className="bg-white/90 border border-white p-3 rounded-xl text-xs sm:text-sm font-medium leading-relaxed shadow-2xs">
        {clueText}
      </div>
    </div>
  );
};
