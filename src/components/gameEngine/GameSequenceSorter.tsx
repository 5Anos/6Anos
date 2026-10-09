import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Check, X, Sparkles, RotateCcw } from 'lucide-react';

export interface SequenceStep {
  id: string;
  order: number; // Correct 1-based order
  text: string;
  hint?: string;
  emoji?: string;
}

interface GameSequenceSorterProps {
  title: string;
  instruction: string;
  steps: SequenceStep[];
  onComplete: (score: number) => void;
}

export const GameSequenceSorter: React.FC<GameSequenceSorterProps> = ({
  title,
  instruction,
  steps: initialSteps,
  onComplete,
}) => {
  // Scramble initial steps if they were ordered
  const [currentOrder, setCurrentOrder] = useState<SequenceStep[]>(() => {
    const copy = [...initialSteps];
    return copy.sort(() => Math.random() - 0.5);
  });
  const [evaluated, setEvaluated] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const moveUp = (index: number) => {
    if (evaluated || index === 0) return;
    const next = [...currentOrder];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setCurrentOrder(next);
  };

  const moveDown = (index: number) => {
    if (evaluated || index === currentOrder.length - 1) return;
    const next = [...currentOrder];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setCurrentOrder(next);
  };

  const handleVerify = () => {
    let correctCount = 0;
    currentOrder.forEach((step, idx) => {
      if (step.order === idx + 1) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / currentOrder.length) * 100);
    setEvaluated(true);
    setIsSuccess(score === 100);
    onComplete(score);
  };

  const handleReset = () => {
    setEvaluated(false);
    setIsSuccess(false);
    setCurrentOrder([...initialSteps].sort(() => Math.random() - 0.5));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>🧩 {title}</span>
        </h3>
        <p className="text-xs sm:text-sm font-semibold text-slate-600">
          {instruction}
        </p>
      </div>

      {/* Steps Ordering List */}
      <div className="space-y-2.5">
        {currentOrder.map((step, idx) => {
          const isCorrectPos = evaluated && step.order === idx + 1;
          const isWrongPos = evaluated && step.order !== idx + 1;

          return (
            <div
              key={step.id}
              className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                evaluated
                  ? isCorrectPos
                    ? 'bg-emerald-50/80 border-emerald-400'
                    : 'bg-rose-50/80 border-rose-400'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                  {idx + 1}
                </span>
                {step.emoji && <span className="text-xl">{step.emoji}</span>}
                <div className="space-y-0.5">
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                    {step.text}
                  </p>
                  {evaluated && step.hint && (
                    <p className="text-[11px] text-slate-500 font-medium">
                      Posição correta: Passo {step.order}
                    </p>
                  )}
                </div>
              </div>

              {/* Up/Down buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {!evaluated ? (
                  <>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveUp(idx)}
                      className="p-2 rounded-xl bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-20 border border-slate-200 transition-all cursor-pointer"
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === currentOrder.length - 1}
                      onClick={() => moveDown(idx)}
                      className="p-2 rounded-xl bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-20 border border-slate-200 transition-all cursor-pointer"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </>
                ) : isCorrectPos ? (
                  <span className="p-1.5 rounded-lg bg-emerald-200 text-emerald-800">
                    <Check className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="p-1.5 rounded-lg bg-rose-200 text-rose-800">
                    <X className="w-4 h-4" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-500">
          Usa as setas ⬆️ e ⬇️ para colocar os passos na ordem lógica correta.
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
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs rounded-2xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Verificar Sequência</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
