import React, { useState } from 'react';
import { Sparkles, Check, RotateCcw, HelpCircle } from 'lucide-react';

export interface MatchingPair {
  id: string;
  leftText: string;
  rightText: string;
  leftEmoji?: string;
  rightEmoji?: string;
  explanation: string;
}

interface GameMatchingPairsProps {
  title: string;
  instruction: string;
  pairs: MatchingPair[];
  onComplete: (score: number) => void;
}

export const GameMatchingPairs: React.FC<GameMatchingPairsProps> = ({
  title,
  instruction,
  pairs,
  onComplete,
}) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<{ leftId: string; rightId: string } | null>(null);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  // Scramble left and right lists
  const [leftItems] = useState(() => [...pairs].sort(() => Math.random() - 0.5));
  const [rightItems] = useState(() => [...pairs].sort(() => Math.random() - 0.5));

  const handleSelectLeft = (id: string) => {
    if (matchedIds.includes(id)) return;
    setWrongPair(null);
    setSelectedLeft(id);
    if (selectedRight) {
      checkMatch(id, selectedRight);
    }
  };

  const handleSelectRight = (id: string) => {
    if (matchedIds.includes(id)) return;
    setWrongPair(null);
    setSelectedRight(id);
    if (selectedLeft) {
      checkMatch(selectedLeft, id);
    }
  };

  const checkMatch = (leftId: string, rightId: string) => {
    if (leftId === rightId) {
      // Correct Match!
      const pair = pairs.find((p) => p.id === leftId);
      const nextMatched = [...matchedIds, leftId];
      setMatchedIds(nextMatched);
      setSelectedLeft(null);
      setSelectedRight(null);
      setLastFeedback(`✅ Excelente! ${pair?.explanation || ''}`);

      if (nextMatched.length === pairs.length) {
        onComplete(100);
      }
    } else {
      // Wrong Match
      const pairLeft = pairs.find((p) => p.id === leftId);
      setWrongPair({ leftId, rightId });
      setLastFeedback(`⚠️ Não combinam! Dica: ${pairLeft?.leftText} precisa de outra correspondência.`);
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setWrongPair(null);
      }, 1000);
    }
  };

  const handleReset = () => {
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedIds([]);
    setWrongPair(null);
    setLastFeedback(null);
  };

  const isCompleted = matchedIds.length === pairs.length;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>🔗 {title}</span>
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-slate-600">
            {instruction}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-800 text-xs font-black border border-blue-200">
            {matchedIds.length} / {pairs.length} Pares
          </span>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition-colors cursor-pointer"
            title="Reiniciar Jogo de Pares"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {lastFeedback && (
        <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
          lastFeedback.startsWith('✅') ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-200'
        }`}>
          <span>{lastFeedback}</span>
        </div>
      )}

      {/* Columns: Left vs Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
            Conceito / Termo
          </div>
          {leftItems.map((item) => {
            const isMatched = matchedIds.includes(item.id);
            const isSelected = selectedLeft === item.id;
            const isWrong = wrongPair?.leftId === item.id;

            return (
              <button
                key={`left-${item.id}`}
                disabled={isMatched}
                onClick={() => handleSelectLeft(item.id)}
                className={`w-full p-3.5 sm:p-4 rounded-2xl text-left font-bold text-xs sm:text-sm transition-all border flex items-center justify-between cursor-pointer ${
                  isMatched
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-70 cursor-default'
                    : isWrong
                    ? 'bg-rose-50 border-rose-300 text-rose-800 ring-2 ring-rose-400 animate-shake'
                    : isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md ring-2 ring-blue-300 scale-[1.02]'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 hover:border-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  {item.leftEmoji && <span className="text-lg">{item.leftEmoji}</span>}
                  <span>{item.leftText}</span>
                </span>
                {isMatched && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
            Significado / Regra
          </div>
          {rightItems.map((item) => {
            const isMatched = matchedIds.includes(item.id);
            const isSelected = selectedRight === item.id;
            const isWrong = wrongPair?.rightId === item.id;

            return (
              <button
                key={`right-${item.id}`}
                disabled={isMatched}
                onClick={() => handleSelectRight(item.id)}
                className={`w-full p-3.5 sm:p-4 rounded-2xl text-left font-bold text-xs sm:text-sm transition-all border flex items-center justify-between cursor-pointer ${
                  isMatched
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-70 cursor-default'
                    : isWrong
                    ? 'bg-rose-50 border-rose-300 text-rose-800 ring-2 ring-rose-400 animate-shake'
                    : isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md ring-2 ring-blue-300 scale-[1.02]'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 hover:border-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  {item.rightEmoji && <span className="text-lg">{item.rightEmoji}</span>}
                  <span>{item.rightText}</span>
                </span>
                {isMatched && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {isCompleted && (
        <div className="p-4 bg-emerald-100 text-emerald-900 rounded-2xl text-center font-black text-sm flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <span>Fantástico! Todos os pares foram associados corretamente com 100%!</span>
        </div>
      )}
    </div>
  );
};
