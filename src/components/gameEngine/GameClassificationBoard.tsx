import React, { useState } from 'react';
import { Check, X, Sparkles, HelpCircle } from 'lucide-react';

export interface ClassificationItem {
  id: string;
  label: string;
  description?: string;
  emoji?: string;
  category: string; // The correct category ID
  explanation: string;
}

export interface ClassificationCategory {
  id: string;
  name: string;
  colorClass: string;
  borderClass: string;
  bgClass: string;
  icon?: string;
}

interface GameClassificationBoardProps {
  title: string;
  instruction: string;
  items: ClassificationItem[];
  categories: ClassificationCategory[];
  onComplete: (score: number) => void;
}

export const GameClassificationBoard: React.FC<GameClassificationBoardProps> = ({
  title,
  instruction,
  items,
  categories,
  onComplete,
}) => {
  const [userChoices, setUserChoices] = useState<Record<string, string>>({});
  const [evaluated, setEvaluated] = useState(false);
  const [showExplanationId, setShowExplanationId] = useState<string | null>(null);

  const handleSelect = (itemId: string, catId: string) => {
    if (evaluated) return;
    setUserChoices((prev) => ({
      ...prev,
      [itemId]: catId,
    }));
  };

  const handleVerify = () => {
    if (Object.keys(userChoices).length < items.length) {
      alert('Por favor classifica todos os itens antes de verificar!');
      return;
    }

    let correctCount = 0;
    items.forEach((item) => {
      if (userChoices[item.id] === item.category) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / items.length) * 100);
    setEvaluated(true);
    onComplete(finalScore);
  };

  const handleReset = () => {
    setUserChoices({});
    setEvaluated(false);
    setShowExplanationId(null);
  };

  const allAssigned = Object.keys(userChoices).length === items.length;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>🎯 {title}</span>
        </h3>
        <p className="text-xs sm:text-sm font-semibold text-slate-600">
          {instruction}
        </p>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {items.map((item, idx) => {
          const selectedCat = userChoices[item.id];
          const isCorrect = evaluated && selectedCat === item.category;
          const isWrong = evaluated && selectedCat !== item.category;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border-2 transition-all ${
                evaluated
                  ? isCorrect
                    ? 'bg-emerald-50/70 border-emerald-400'
                    : 'bg-rose-50/70 border-rose-400'
                  : selectedCat
                  ? 'bg-blue-50/50 border-blue-300 shadow-2xs'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0 p-1 bg-white rounded-xl border border-slate-100 shadow-2xs">
                    {item.emoji || '📌'}
                  </span>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                      {item.label}
                    </h4>
                    {item.description && (
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Categories buttons */}
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                  {categories.map((cat) => {
                    const isPicked = selectedCat === cat.id;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelect(item.id, cat.id)}
                        disabled={evaluated}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                          isPicked
                            ? `${cat.bgClass} ${cat.borderClass} border-2 shadow-xs scale-105`
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {cat.icon && <span>{cat.icon}</span>}
                        <span>{cat.name}</span>
                        {evaluated && isPicked && (
                          isCorrect ? (
                            <Check className="w-3.5 h-3.5 text-emerald-700 ml-1" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-rose-700 ml-1" />
                          )
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Evaluated Explanation Dropdown */}
              {evaluated && (
                <div className="mt-3 pt-3 border-t border-slate-200/80 text-xs font-semibold flex items-start gap-2">
                  <span className={isCorrect ? 'text-emerald-700 font-black' : 'text-rose-700 font-black'}>
                    {isCorrect ? '✓ Excelente!' : '⚠️ Atenção:'}
                  </span>
                  <span className="text-slate-700">{item.explanation}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-500">
          {Object.keys(userChoices).length} de {items.length} itens classificados
        </span>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {evaluated ? (
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs rounded-xl transition-all cursor-pointer"
            >
              Tentar Novamente 🔄
            </button>
          ) : (
            <button
              onClick={handleVerify}
              disabled={!allAssigned}
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                allAssigned
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Verificar Classificação</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
