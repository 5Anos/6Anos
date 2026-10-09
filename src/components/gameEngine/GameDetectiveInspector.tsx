import React, { useState } from 'react';
import { Search, CheckCircle2, AlertTriangle, Sparkles, HelpCircle } from 'lucide-react';

export interface ClueItem {
  id: string;
  targetText: string;
  hint: string;
  explanation: string;
  isSuspicious: boolean;
}

interface GameDetectiveInspectorProps {
  title: string;
  missionBrief: string;
  contentCard: {
    header: string;
    bodyText: string;
  };
  clues: ClueItem[];
  onComplete: (score: number) => void;
}

export const GameDetectiveInspector: React.FC<GameDetectiveInspectorProps> = ({
  title,
  missionBrief,
  contentCard,
  clues,
  onComplete,
}) => {
  const [foundClueIds, setFoundClueIds] = useState<string[]>([]);
  const [activeClue, setActiveClue] = useState<ClueItem | null>(null);
  const [evaluated, setEvaluated] = useState(false);

  const totalSuspicious = clues.filter((c) => c.isSuspicious).length;

  const toggleClue = (clue: ClueItem) => {
    if (evaluated) return;
    setActiveClue(clue);

    if (!foundClueIds.includes(clue.id)) {
      const next = [...foundClueIds, clue.id];
      setFoundClueIds(next);

      // Check if found all
      const foundSuspiciousCount = clues.filter(
        (c) => c.isSuspicious && next.includes(c.id)
      ).length;

      if (foundSuspiciousCount === totalSuspicious) {
        setEvaluated(true);
        onComplete(100);
      }
    }
  };

  const foundCount = clues.filter((c) => c.isSuspicious && foundClueIds.includes(c.id)).length;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>🕵️ {title}</span>
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-slate-600">
            {missionBrief}
          </p>
        </div>

        <div className="px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-black shrink-0 self-start sm:self-auto">
          Pistas encontradas: {foundCount}/{totalSuspicious} 🔎
        </div>
      </div>

      {/* Interactive Content Card */}
      <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="text-xs font-mono font-bold text-slate-500 border-b border-slate-200 pb-2 flex items-center justify-between">
          <span>{contentCard.header}</span>
          <span className="text-[10px] text-amber-600 font-black">Clica nas palavras suspeitas! 👆</span>
        </div>

        {/* Highlightable Clues Grid */}
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
            {contentCard.bodyText}
          </p>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/80">
            {clues.map((clue) => {
              const isFound = foundClueIds.includes(clue.id);

              return (
                <button
                  key={clue.id}
                  type="button"
                  onClick={() => toggleClue(clue)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isFound
                      ? clue.isSuspicious
                        ? 'bg-rose-100 border-2 border-rose-400 text-rose-900 shadow-xs'
                        : 'bg-emerald-100 border-2 border-emerald-400 text-emerald-900 shadow-xs'
                      : 'bg-white hover:bg-amber-100 text-slate-700 border border-slate-300 hover:border-amber-400'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 opacity-60" />
                  <span>{clue.targetText}</span>
                  {isFound && clue.isSuspicious && (
                    <span className="text-[10px] font-black bg-rose-500 text-white px-1.5 py-0.2 rounded-md">
                      Pista!
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Clue Inspector Drawer */}
      {activeClue && (
        <div
          className={`p-4 rounded-2xl border transition-all animate-in fade-in ${
            activeClue.isSuspicious
              ? 'bg-rose-50/80 border-rose-300 text-rose-950'
              : 'bg-blue-50/80 border-blue-300 text-blue-950'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {activeClue.isSuspicious ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <h5 className="text-xs font-black uppercase tracking-wider">
                {activeClue.isSuspicious ? '⚠️ Pista Crítica Detetada!' : 'ℹ️ Análise do Elemento'}
              </h5>
              <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                {activeClue.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Victory State */}
      {evaluated && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-xs sm:text-sm font-extrabold text-emerald-950 flex items-center justify-between gap-3 animate-in zoom-in-95">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Excelente trabalho de detetive! Encontraste todas as pistas suspeitas com precisão!</span>
          </div>
          <span className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-black shrink-0">
            100% Concluído ✓
          </span>
        </div>
      )}
    </div>
  );
};
