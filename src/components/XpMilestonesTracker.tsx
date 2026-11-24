import React, { useMemo, useState, useEffect } from 'react';
import {
  ArrowRight,
  Award,
  Check,
  Compass,
  Crown,
  Flame,
  Lightbulb,
  Lock,
  Rocket,
  Shield,
  Search,
  Palette,
  Cpu,
  Bot,
  Trophy,
} from 'lucide-react';
import { LEVELS, LevelInfo, calculateLevel, getNextLevelInfo } from '../data/catalog';
import { PROGRESSION_CONFIG } from '../progressionConfig';

interface XpMilestonesTrackerProps {
  xp: number;
  isLoggedIn: boolean;
  dailyTipClaimed?: boolean;
  weeklyChallengeCompleted?: boolean;
  onClaimDailyTip: () => void;
  onOpenWeeklyChallenge: () => void;
  onOpenWorlds: () => void;
  onOpenGrandeMissao: () => void;
  onOpenLoginModal?: () => void;
}

const MILESTONE_META: Record<
  number,
  {
    icon: React.ComponentType<{ className?: string }>;
    encouragement: string;
    rewardHint: string;
  }
> = {
  1: {
    icon: Compass,
    encouragement: 'O início da tua aventura digital! Cada desafio dá-te pontos.',
    rewardHint: 'Ponto de partida de todos os exploradores.',
  },
  2: {
    icon: Rocket,
    encouragement: 'Já dominaste os primeiros passos. Continua a testar os teus conhecimentos!',
    rewardHint: 'Consegues lá chegar com 2 atividades ou desafios rápidos!',
  },
  3: {
    icon: Shield,
    encouragement: 'Proteges a tua conta e a tua privacidade como um verdadeiro guardião.',
    rewardHint: 'Conclui as missões do Mundo 1 para chegar aqui rapidamente.',
  },
  4: {
    icon: Search,
    encouragement: 'Sabes investigar informação e detetar notícias falsas na Internet.',
    rewardHint: 'Explora o Mundo 2 e faz o Desafio da Semana.',
  },
  5: {
    icon: Palette,
    encouragement: 'Crias conteúdos digitais com criatividade, respeito e boas regras.',
    rewardHint: 'Soma pontos nos simuladores do Mundo 3 e nas Dicas Diárias.',
  },
  6: {
    icon: Cpu,
    encouragement: 'Pensas como um programador e resolves problemas passo a passo.',
    rewardHint: 'Avança pelos desafios de lógica e programação do Mundo 4.',
  },
  7: {
    icon: Bot,
    encouragement: 'Compreendes como funciona a Inteligência Artificial e sabes usá-la com responsabilidade.',
    rewardHint: 'Completa as missões do Mundo 5 para aprenderes os segredos da IA.',
  },
  8: {
    icon: Crown,
    encouragement: 'O topo da Missão TIC! Um verdadeiro exemplo de respeito e segurança online.',
    rewardHint: 'Completa os 5 Mundos e a Grande Missão Final (+150 XP).',
  },
};

export const XpMilestonesTracker: React.FC<XpMilestonesTrackerProps> = ({
  xp,
  isLoggedIn,
  dailyTipClaimed = false,
  weeklyChallengeCompleted = false,
  onClaimDailyTip,
  onOpenWeeklyChallenge,
  onOpenWorlds,
  onOpenGrandeMissao,
  onOpenLoginModal,
}) => {
  const safeXp = Math.max(0, Math.round(isLoggedIn ? xp : 0));
  const currentLevel = useMemo(() => calculateLevel(safeXp), [safeXp]);
  const nextInfo = useMemo(() => getNextLevelInfo(safeXp), [safeXp]);

  // Default selected milestone is the student's next target (or final level if mastered)
  const defaultSelectedLevel = nextInfo.next ? nextInfo.next.level : LEVELS[LEVELS.length - 1].level;
  const [selectedLevelNum, setSelectedLevelNum] = useState<number>(defaultSelectedLevel);

  useEffect(() => {
    setSelectedLevelNum(nextInfo.next ? nextInfo.next.level : LEVELS[LEVELS.length - 1].level);
  }, [nextInfo.next?.level]);

  const selectedMilestone: LevelInfo =
    LEVELS.find((l) => l.level === selectedLevelNum) || LEVELS[LEVELS.length - 1];
  const selectedMeta = MILESTONE_META[selectedMilestone.level] || MILESTONE_META[1];

  // Piecewise progress percentage along the visual 8-stop track (evenly spaced nodes)
  const trackProgressPercent = useMemo(() => {
    const totalSegments = LEVELS.length - 1;
    if (safeXp >= LEVELS[LEVELS.length - 1].minXp) return 100;

    let currentIdx = 0;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (safeXp >= LEVELS[i].minXp) {
        currentIdx = i;
        break;
      }
    }

    const startXp = LEVELS[currentIdx].minXp;
    const endXp = LEVELS[currentIdx + 1].minXp;
    const segmentFraction = endXp > startXp ? (safeXp - startXp) / (endXp - startXp) : 0;
    return Math.min(100, Math.max(0, ((currentIdx + segmentFraction) / totalSegments) * 100));
  }, [safeXp]);

  const reachedCount = useMemo(
    () => LEVELS.filter((l) => safeXp >= l.minXp).length,
    [safeXp]
  );

  const selectedRemainingXp = Math.max(0, selectedMilestone.minXp - safeXp);
  const selectedProgressPct =
    selectedMilestone.minXp === 0
      ? 100
      : Math.min(100, Math.round((safeXp / selectedMilestone.minXp) * 100));
  const isSelectedReached = safeXp >= selectedMilestone.minXp;
  const isSelectedNext = nextInfo.next?.level === selectedMilestone.level;

  const xpSources = [
    {
      id: 'daily-tip',
      label: 'Dica Rápida',
      xpLabel: `+${PROGRESSION_CONFIG.XP_REWARDS.DAILY_TIP} XP`,
      done: isLoggedIn && dailyTipClaimed,
      doneLabel: 'Lida hoje',
      actionLabel: 'Ler agora',
      icon: Lightbulb,
      onClick: () => {
        if (!isLoggedIn) {
          onOpenLoginModal?.();
          return;
        }
        onClaimDailyTip();
      },
    },
    {
      id: 'weekly-challenge',
      label: 'Desafio da Semana',
      xpLabel: `+${PROGRESSION_CONFIG.XP_REWARDS.WEEKLY_CHALLENGE} XP`,
      done: isLoggedIn && weeklyChallengeCompleted,
      doneLabel: 'Concluído',
      actionLabel: 'Participar',
      icon: Trophy,
      onClick: () => onOpenWeeklyChallenge(),
    },
    {
      id: 'worlds-missions',
      label: 'Missões dos Mundos',
      xpLabel: `até +${PROGRESSION_CONFIG.XP_REWARDS.SIMULATOR_MAX} XP`,
      done: false,
      doneLabel: '',
      actionLabel: 'Explorar',
      icon: Flame,
      onClick: () => {
        if (!isLoggedIn) {
          onOpenLoginModal?.();
          return;
        }
        onOpenWorlds();
      },
    },
    {
      id: 'grande-missao',
      label: 'Grande Missão Final',
      xpLabel: `+${PROGRESSION_CONFIG.XP_REWARDS.GRANDE_MISSAO} XP`,
      done: false,
      doneLabel: '',
      actionLabel: 'Abrir',
      icon: Crown,
      onClick: () => {
        if (!isLoggedIn) {
          onOpenLoginModal?.();
          return;
        }
        onOpenGrandeMissao();
      },
    },
  ];

  return (
    <section
      id="xp-milestones-tracker"
      aria-label="Metas de XP"
      className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs"
    >
      {/* Top Header & Current XP Summary */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight text-balance">
            Metas de XP
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            {isLoggedIn
              ? 'Junta pontos nos desafios e nas atividades dos mundos para desbloquear todos os níveis.'
              : 'Entra na tua conta para acompanhar os teus pontos e desbloquear cada meta de XP.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600 tabular-nums">
          <span className="text-2xl font-black text-blue-700 tracking-tight">
            {safeXp.toLocaleString('pt-PT')} XP
          </span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span className="font-bold text-slate-800">
            Nível {currentLevel.level}: {currentLevel.name}
          </span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span className="font-semibold text-slate-500">
            {reachedCount}/{LEVELS.length} metas alcançadas
          </span>
        </div>
      </div>

      {/* Horizontal Visual Milestone Track */}
      <div className="py-7 overflow-x-auto">
        <div className="min-w-[680px] px-2">
          <div className="relative">
            {/* Background & Active Progress Rail aligned to center of 44px icon circles */}
            <div
              className="absolute left-7 right-7 top-[21px] h-1.5 bg-slate-100 rounded-full overflow-hidden"
              aria-hidden="true"
            >
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-blue-600 to-indigo-600 rounded-full transition-[width] duration-500 ease-out"
                style={{ width: `${trackProgressPercent}%` }}
              />
            </div>

            {/* 8 Interactive Milestone Nodes */}
            <div className="grid grid-cols-8 gap-2 relative z-10">
              {LEVELS.map((lvl) => {
                const isReached = safeXp >= lvl.minXp;
                const isNext = nextInfo.next?.level === lvl.level;
                const isSelected = selectedMilestone.level === lvl.level;
                const meta = MILESTONE_META[lvl.level] || MILESTONE_META[1];
                const IconComp = meta.icon;

                return (
                  <button
                    key={lvl.level}
                    type="button"
                    onClick={() => setSelectedLevelNum(lvl.level)}
                    aria-pressed={isSelected}
                    aria-label={`Meta Nível ${lvl.level}: ${lvl.name}, ${lvl.minXp} XP — ${
                      isReached ? 'Conquistado' : isNext ? 'Próxima meta' : 'Por desbloquear'
                    }`}
                    className={`group flex flex-col items-center text-center rounded-2xl p-2 transition-transform duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                      isSelected ? 'bg-slate-50 -translate-y-0.5' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Node Marker */}
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-colors duration-150 ${
                        isReached
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : isNext
                          ? 'bg-white border-blue-600 text-blue-700 ring-4 ring-blue-100 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-400 group-hover:border-slate-300'
                      }`}
                    >
                      {isReached ? (
                        <Check className="w-5 h-5 stroke-[2.75]" />
                      ) : isNext ? (
                        <IconComp className="w-5 h-5" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>

                    {/* XP Threshold */}
                    <span
                      className={`mt-2.5 text-xs font-black tabular-nums ${
                        isReached
                          ? 'text-emerald-700'
                          : isNext
                          ? 'text-blue-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {lvl.minXp} XP
                    </span>

                    {/* Level Title */}
                    <span
                      className={`mt-0.5 text-[11px] font-bold leading-snug line-clamp-2 ${
                        isReached || isNext ? 'text-slate-800' : 'text-slate-500'
                      }`}
                    >
                      {lvl.name}
                    </span>

                    {/* Explicit accessible state text (no hue-only signaling) */}
                    <span
                      className={`mt-1 text-[10px] font-semibold ${
                        isReached
                          ? 'text-emerald-700'
                          : isNext
                          ? 'text-blue-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {isReached ? 'Conquistado' : isNext ? 'Próxima meta' : `Nível ${lvl.level}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Milestone Detail & Quick Challenge Shortcuts */}
      <div className="pt-6 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Focused Milestone Progress */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Award className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Nível {selectedMilestone.level}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{selectedMilestone.minXp.toLocaleString('pt-PT')} XP</span>
            <span aria-hidden="true">·</span>
            <span
              className={
                isSelectedReached
                  ? 'text-emerald-700 font-bold'
                  : isSelectedNext
                  ? 'text-blue-700 font-bold'
                  : 'text-slate-500'
              }
            >
              {isSelectedReached
                ? 'Meta alcançada'
                : isSelectedNext
                ? 'Próxima meta'
                : 'Por desbloquear'}
            </span>
          </div>

          <h3 className="text-lg font-black text-slate-900 leading-snug">
            {selectedMilestone.name}
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            {selectedMeta.encouragement}{' '}
            <span className="text-slate-500">{selectedMeta.rewardHint}</span>
          </p>

          {/* Progress Bar toward Selected Milestone */}
          <div className="pt-1 space-y-1.5">
            <div className="flex items-center justify-between text-xs tabular-nums">
              <span className="font-bold text-slate-700">
                {isSelectedReached
                  ? 'Conquistaste esta meta!'
                  : `Faltam ${selectedRemainingXp.toLocaleString('pt-PT')} XP para esta meta`}
              </span>
              <span className="font-black text-blue-700">{selectedProgressPct}%</span>
            </div>
            <div
              className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={selectedProgressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progresso para ${selectedMilestone.name}`}
            >
              <div
                className={`h-full rounded-full transition-[width] duration-500 ${
                  isSelectedReached ? 'bg-emerald-600' : 'bg-blue-600'
                }`}
                style={{ width: `${selectedProgressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Actionable Ways to Earn XP */}
        <div className="lg:col-span-7 lg:border-l lg:border-slate-100 lg:pl-6 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-black text-slate-900">
              Onde ganhar pontos agora
            </h4>
            {!isLoggedIn && onOpenLoginModal && (
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Entrar na conta →
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {xpSources.map((src) => {
              const SrcIcon = src.icon;
              return (
                <div
                  key={src.id}
                  className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        src.done
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {src.done ? <Check className="w-4 h-4" /> : <SrcIcon className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {src.label}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500 tabular-nums">
                        {src.xpLabel}
                        {src.done && (
                          <>
                            <span aria-hidden="true"> · </span>
                            <span className="text-emerald-700">{src.doneLabel}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={src.onClick}
                    disabled={src.done}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      src.done
                        ? 'bg-emerald-50 text-emerald-700 cursor-default'
                        : 'bg-slate-100 hover:bg-blue-600 text-slate-800 hover:text-white cursor-pointer'
                    }`}
                  >
                    <span>{src.done ? src.doneLabel : src.actionLabel}</span>
                    {!src.done && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
