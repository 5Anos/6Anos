import React from 'react';
import { CheckCircle2, AlertTriangle, RotateCcw, ArrowRight, Zap, Trophy } from 'lucide-react';

interface GameFeedbackBannerProps {
  status: 'correct' | 'wrong' | 'gameover' | 'victory';
  title: string;
  message: string;
  xpGain?: number;
  onRetry?: () => void;
  onNext?: () => void;
}

export const GameFeedbackBanner: React.FC<GameFeedbackBannerProps> = ({
  status,
  title,
  message,
  xpGain,
  onRetry,
  onNext,
}) => {
  const isPositive = status === 'correct' || status === 'victory';

  return (
    <div
      className={`p-4 sm:p-5 rounded-3xl border-2 transition-all animate-in zoom-in-95 duration-200 ${
        isPositive
          ? 'bg-emerald-50/90 border-emerald-400 text-emerald-950 shadow-md'
          : status === 'gameover'
          ? 'bg-rose-50/90 border-rose-400 text-rose-950 shadow-md'
          : 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-sm'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              isPositive
                ? 'bg-emerald-500 text-white'
                : status === 'gameover'
                ? 'bg-rose-500 text-white'
                : 'bg-amber-500 text-white'
            }`}
          >
            {isPositive ? (
              status === 'victory' ? <Trophy className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-black tracking-tight">{title}</h4>
              {xpGain && xpGain > 0 ? (
                <span className="inline-flex items-center gap-1 bg-amber-200 text-amber-900 font-black px-2 py-0.5 rounded-full text-xs">
                  <Zap className="w-3 h-3 fill-amber-700" />
                  +{xpGain} XP
                </span>
              ) : null}
            </div>
            <p className="text-xs sm:text-sm font-semibold opacity-90 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                isPositive
                  ? 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>{status === 'gameover' ? 'Jogar de Novo' : 'Tentar Novamente'}</span>
            </button>
          )}

          {onNext && isPositive && (
            <button
              onClick={onNext}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <span>Avançar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
