import React from 'react';
import { Heart, Zap, RotateCcw, Trophy, CheckCircle2 } from 'lucide-react';

interface GameHeaderProps {
  title: string;
  subtitle: string;
  lives?: number;
  maxLives?: number;
  xpReward: number;
  currentStage: number;
  totalStages: number;
  stagesLabels?: string[];
  onSelectStage?: (stage: number) => void;
  onResetGame?: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  title,
  subtitle,
  lives = 3,
  maxLives = 3,
  xpReward,
  currentStage,
  totalStages,
  stagesLabels = ['Fase 1: Desafio', 'Fase 2: Laboratório', 'Fase 3: Mestria'],
  onSelectStage,
  onResetGame,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top line: Title & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
              🎮 Estação Interativa
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              Fase {currentStage} de {totalStages}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Lives & XP */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          {/* Hearts */}
          <div
            className="flex items-center gap-1 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-2xl"
            title={`${lives} de ${maxLives} vidas restantes`}
            aria-label={`${lives} vidas`}
          >
            {Array.from({ length: maxLives }).map((_, idx) => (
              <Heart
                key={idx}
                className={`w-4 h-4 transition-transform ${
                  idx < lives
                    ? 'text-rose-500 fill-rose-500 scale-100'
                    : 'text-slate-300 fill-slate-200 scale-90'
                }`}
              />
            ))}
          </div>

          {/* XP Reward */}
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 font-black text-xs px-3 py-1.5 rounded-2xl">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>+{xpReward} XP</span>
          </div>

          {/* Reset button if provided */}
          {onResetGame && (
            <button
              onClick={onResetGame}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Reiniciar jogo"
              aria-label="Reiniciar jogo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Stage Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100">
        {Array.from({ length: totalStages }).map((_, idx) => {
          const stageNum = idx + 1;
          const isActive = currentStage === stageNum;
          const label = stagesLabels[idx] || `Fase ${stageNum}`;

          return (
            <button
              key={idx}
              onClick={() => onSelectStage?.(stageNum)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
