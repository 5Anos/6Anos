import React from 'react';
import { BookOpen, Gamepad2, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

export type MissionPhase = 'theory' | 'simulator';

interface MissionPhaseSwitcherProps {
  currentPhase: MissionPhase;
  onPhaseChange: (phase: MissionPhase) => void;
  accentColor?: 'emerald' | 'blue' | 'purple' | 'amber' | 'indigo';
  simulatorCompleted?: boolean;
  score?: number | null;
}

export const MissionPhaseSwitcher: React.FC<MissionPhaseSwitcherProps> = ({
  currentPhase,
  onPhaseChange,
  accentColor = 'blue',
  simulatorCompleted = false,
  score = null,
}) => {
  const colorStyles = {
    emerald: {
      activeTheory: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400',
      activeSim: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400',
      badge: 'bg-emerald-100 text-emerald-800',
      banner: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
    },
    blue: {
      activeTheory: 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400',
      activeSim: 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400',
      badge: 'bg-blue-100 text-blue-800',
      banner: 'bg-blue-50/80 border-blue-200 text-blue-900',
    },
    purple: {
      activeTheory: 'bg-purple-600 text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-400',
      activeSim: 'bg-purple-600 text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-400',
      badge: 'bg-purple-100 text-purple-800',
      banner: 'bg-purple-50/80 border-purple-200 text-purple-900',
    },
    amber: {
      activeTheory: 'bg-amber-600 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400',
      activeSim: 'bg-amber-600 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400',
      badge: 'bg-amber-100 text-amber-800',
      banner: 'bg-amber-50/80 border-amber-200 text-amber-900',
    },
    indigo: {
      activeTheory: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400',
      activeSim: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400',
      badge: 'bg-indigo-100 text-indigo-800',
      banner: 'bg-indigo-50/80 border-indigo-200 text-indigo-900',
    },
  }[accentColor];

  return (
    <div className="space-y-2">
      {/* 2-Phase Switcher Tabs (Designed for Portuguese 5th-grade 10-year-old students) */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl flex items-center gap-2 border border-slate-200 shadow-2xs">
        <button
          type="button"
          onClick={() => {
            onPhaseChange('theory');
          }}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            currentPhase === 'theory'
              ? colorStyles.activeTheory
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span>💡 1. Guia Rápido (Teoria & Imagem)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onPhaseChange('simulator');
          }}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            currentPhase === 'simulator'
              ? colorStyles.activeSim
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <Gamepad2 className="w-4 h-4 shrink-0" />
          <span>🎮 2. Simulador Interativo</span>
          {simulatorCompleted && (
            <span className="ml-1 bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-black">
              ✓ {score ? `${score}%` : 'Feito'}
            </span>
          )}
        </button>
      </div>

      {/* Helpful cognitive scaffolding hint for 10-year-olds */}
      <div className={`px-4 py-2 rounded-xl border text-[11px] sm:text-xs font-semibold flex items-center justify-between gap-2 ${colorStyles.banner}`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-500 fill-current" />
          <span>
            {currentPhase === 'theory'
              ? 'Lê o guia com atenção antes de avançar para o desafio prático.'
              : 'Aplica o que aprendeste no simulador. Se tiveres dúvidas, podes voltar ao Guia Rápido a qualquer momento!'}
          </span>
        </div>
        {currentPhase === 'theory' ? (
          <button
            type="button"
            onClick={() => onPhaseChange('simulator')}
            className="hidden sm:inline-flex items-center gap-1 font-black text-xs underline cursor-pointer hover:opacity-80"
          >
            <span>Ir para o Desafio</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onPhaseChange('theory')}
            className="hidden sm:inline-flex items-center gap-1 font-black text-xs underline cursor-pointer hover:opacity-80"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Rever Teoria</span>
          </button>
        )}
      </div>
    </div>
  );
};
