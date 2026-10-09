import React, { useState } from 'react';
import { Shield, Sparkles, Check, X, ArrowRight, RotateCcw } from 'lucide-react';

export interface DecisionChoice {
  id: string;
  text: string;
  isBest: boolean;
  explanation: string;
}

export interface DecisionScenario {
  id: string;
  title: string;
  situation: string;
  emoji?: string;
  choices: DecisionChoice[];
}

interface GameDecisionScenarioProps {
  scenario: DecisionScenario;
  onChoice: (isCorrect: boolean, choice: DecisionChoice) => void;
}

export const GameDecisionScenario: React.FC<GameDecisionScenarioProps> = ({
  scenario,
  onChoice,
}) => {
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  const handleSelect = (choice: DecisionChoice) => {
    if (selectedChoiceId) return;
    setSelectedChoiceId(choice.id);
    onChoice(choice.isBest, choice);
  };

  const selectedChoice = scenario.choices.find((c) => c.id === selectedChoiceId);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex items-start gap-3">
        <span className="text-3xl p-2 bg-slate-50 rounded-2xl border border-slate-100 shrink-0">
          {scenario.emoji || '⚡'}
        </span>
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">
            Cenário de Decisão Interativo
          </span>
          <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
            {scenario.title}
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
            {scenario.situation}
          </p>
        </div>
      </div>

      {/* Choices Grid */}
      <div className="space-y-2.5">
        {scenario.choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id;
          const isRevealed = selectedChoiceId !== null;

          return (
            <button
              key={choice.id}
              type="button"
              disabled={isRevealed}
              onClick={() => handleSelect(choice)}
              className={`w-full text-left p-4 rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isRevealed
                  ? choice.isBest
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs'
                    : isSelected
                    ? 'bg-rose-50 border-rose-400 text-rose-950 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  : 'bg-slate-50 hover:bg-blue-50/70 border-slate-200 hover:border-blue-300 text-slate-800'
              }`}
            >
              <span>{choice.text}</span>
              {isRevealed && (
                choice.isBest ? (
                  <span className="p-1 rounded-lg bg-emerald-200 text-emerald-800 shrink-0">
                    <Check className="w-4 h-4" />
                  </span>
                ) : isSelected ? (
                  <span className="p-1 rounded-lg bg-rose-200 text-rose-800 shrink-0">
                    <X className="w-4 h-4" />
                  </span>
                ) : null
              )}
            </button>
          );
        })}
      </div>

      {/* Pedagogical Feedback */}
      {selectedChoice && (
        <div
          className={`p-4 rounded-2xl border animate-in zoom-in-95 duration-200 ${
            selectedChoice.isBest
              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
              : 'bg-rose-50/90 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <span className="text-lg">
              {selectedChoice.isBest ? '🌟' : '⚠️'}
            </span>
            <div className="space-y-0.5">
              <h5 className="text-xs font-black uppercase tracking-wider">
                {selectedChoice.isBest ? 'Decisão Exemplar de Campeão!' : 'Atenção ao Risco!'}
              </h5>
              <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                {selectedChoice.explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
