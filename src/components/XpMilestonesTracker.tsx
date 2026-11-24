import React, { useMemo, useState, useEffect } from 'react';
import {
  ArrowRight,
  Award,
  Check,
  Compass,
  Crown,
  Footprints,
  Lock,
  Navigation,
  Rocket,
  Star,
  Target,
  Trophy,
} from 'lucide-react';
import {
  BADGES_CATALOG,
  LEVELS,
  LevelInfo,
  calculateLevel,
  getNextLevelInfo,
} from '../data/catalog';

export interface UnifiedBadgeSummary {
  id?: string;
  badgeId?: string;
  title?: string;
  description?: string;
  unlocked?: boolean;
  tier?: string;
  category?: string;
  progress?: {
    current: number;
    target: number;
    unit: string;
    percent: number;
  } | null;
}

interface XpMilestonesTrackerProps {
  xp: number;
  isLoggedIn: boolean;
  mode?: 'dashboard' | 'full';
  badges?: UnifiedBadgeSummary[];
  onOpenBadges?: () => void;
  onSelectWorld?: (worldId: number) => void;
  onOpenLoginModal?: () => void;
}

const RANK_META: Record<
  number,
  {
    icon: React.ComponentType<{ className?: string }>;
    encouragement: string;
    hint: string;
  }
> = {
  1: {
    icon: Compass,
    encouragement: 'O início da tua aventura na Missão TIC! Cada missão e desafio soma pontos.',
    hint: 'Ponto de partida de todos os alunos.',
  },
  2: {
    icon: Footprints,
    encouragement: 'Já deste os primeiros passos e estás a ganhar ritmo nas missões.',
    hint: 'Chegas aqui com as primeiras atividades, dicas rápidas e desafios semanais.',
  },
  3: {
    icon: Rocket,
    encouragement: 'Exploras o mundo digital com cada vez mais confiança e curiosidade.',
    hint: 'Continua a completar simuladores e o Desafio da Semana.',
  },
  4: {
    icon: Navigation,
    encouragement: 'Sabes orientar-te na Internet com segurança e pensamento crítico.',
    hint: 'Mantém a regularidade nos Mundos e nas Dicas do Dia.',
  },
  5: {
    icon: Star,
    encouragement: 'Já dominas várias áreas de TIC e és uma referência na turma.',
    hint: 'Avança pelos novos Mundos para acelerar o teu progresso.',
  },
  6: {
    icon: Target,
    encouragement: 'Planeias, testas e resolves desafios digitais com precisão.',
    hint: 'Os simuladores de lógica e programação dão ótimos pontos XP.',
  },
  7: {
    icon: Trophy,
    encouragement: 'Quase no topo! A tua dedicação ao longo do ano é exemplar.',
    hint: 'Completa os últimos Mundos e desafios semanais para o grande patamar final.',
  },
  8: {
    icon: Crown,
    encouragement: 'A patente máxima de XP da Missão TIC! Um verdadeiro exemplo no mundo digital.',
    hint: 'Alcançada por quem brilha nos Mundos, desafios e Grande Missão Final.',
  },
};

const WORLD_SHIELDS = [
  { id: 'guardiao-digital', worldId: 1, name: 'Guardião Digital', color: '#2563EB', fill: '#3B82F6' },
  { id: 'detetive-digital', worldId: 2, name: 'Detetive Digital', color: '#0284C7', fill: '#38BDF8' },
  { id: 'criador-digital', worldId: 3, name: 'Criador Digital', color: '#7C3AED', fill: '#A855F7' },
  { id: 'engenheiro-digital', worldId: 4, name: 'Engenheiro Digital', color: '#D97706', fill: '#F59E0B' },
  { id: 'explorador-da-ia', worldId: 5, name: 'Explorador da IA', color: '#4F46E5', fill: '#6366F1' },
];

export const XpMilestonesTracker: React.FC<XpMilestonesTrackerProps> = ({
  xp,
  isLoggedIn,
  mode = 'dashboard',
  badges = [],
  onOpenBadges,
  onSelectWorld,
  onOpenLoginModal,
}) => {
  const safeXp = Math.max(0, Math.round(isLoggedIn ? xp : 0));
  const currentLevel = useMemo(() => calculateLevel(safeXp), [safeXp]);
  const nextInfo = useMemo(() => getNextLevelInfo(safeXp), [safeXp]);

  const defaultSelectedLevel = nextInfo.next ? nextInfo.next.level : LEVELS[LEVELS.length - 1].level;
  const [selectedLevelNum, setSelectedLevelNum] = useState<number>(defaultSelectedLevel);

  useEffect(() => {
    setSelectedLevelNum(nextInfo.next ? nextInfo.next.level : LEVELS[LEVELS.length - 1].level);
  }, [nextInfo.next?.level]);

  const selectedMilestone: LevelInfo =
    LEVELS.find((l) => l.level === selectedLevelNum) || LEVELS[LEVELS.length - 1];
  const selectedMeta = RANK_META[selectedMilestone.level] || RANK_META[1];

  // Piecewise progress percentage along the 8-node track
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

  // Normalize badge unlock status & progress across both authBadges and live /api/pedagogical/badges
  const normalizedBadges = useMemo(() => {
    const byId = new Map<string, UnifiedBadgeSummary>();
    for (const b of badges || []) {
      const key = String(b?.badgeId || b?.id || '');
      if (key) byId.set(key, b);
    }

    return BADGES_CATALOG.map((def) => {
      const rec = byId.get(def.id);
      const unlocked = Boolean(rec && rec.unlocked !== false);
      const fallbackProgress =
        def.category === 'pontos' && def.target
          ? {
              current: Math.min(safeXp, def.target),
              target: def.target,
              unit: def.targetUnit || 'XP',
              percent: Math.min(100, Math.round((safeXp / def.target) * 100)),
            }
          : null;

      return {
        ...def,
        unlocked,
        progress: rec?.progress || fallbackProgress,
      };
    });
  }, [badges, safeXp]);

  const unlockedBadgesCount = useMemo(
    () => (isLoggedIn ? normalizedBadges.filter((b) => b.unlocked).length : 0),
    [normalizedBadges, isLoggedIn]
  );

  const totalBadgesCount = normalizedBadges.length;
  const collectionPct = Math.round((unlockedBadgesCount / Math.max(1, totalBadgesCount)) * 100);

  const unlockedWorldIds = useMemo(() => {
    const set = new Set<string>();
    if (!isLoggedIn) return set;
    for (const b of normalizedBadges) {
      if (b.unlocked) set.add(b.id);
    }
    return set;
  }, [normalizedBadges, isLoggedIn]);

  const unlockedWorldsCount = WORLD_SHIELDS.filter((s) => unlockedWorldIds.has(s.id)).length;

  // Closest locked badges with measurable progress for dashboard spotlight
  const nextBadgesToUnlock = useMemo(() => {
    return normalizedBadges
      .filter((b) => !b.unlocked && b.progress && b.progress.target > 0)
      .sort((a, b) => (b.progress?.percent || 0) - (a.progress?.percent || 0))
      .slice(0, 2);
  }, [normalizedBadges]);

  const selectedRemainingXp = Math.max(0, selectedMilestone.minXp - safeXp);
  const selectedProgressPct =
    selectedMilestone.minXp === 0
      ? 100
      : Math.min(100, Math.round((safeXp / selectedMilestone.minXp) * 100));
  const isSelectedReached = safeXp >= selectedMilestone.minXp;
  const isSelectedNext = nextInfo.next?.level === selectedMilestone.level;

  return (
    <section
      id="unified-progress-achievements"
      aria-label="As Minhas Conquistas e Nível XP"
      className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-xs space-y-6"
    >
      {/* Top Header & Unified Summary */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight text-balance">
            {mode === 'full' ? 'Conquistas & Nível XP' : 'As Minhas Conquistas & Nível XP'}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            {isLoggedIn
              ? 'Sobe de patente ao ganhar XP e coleciona as 16 medalhas oficiais ao longo do ano.'
              : 'Entra na tua conta para subir de patente com pontos XP e colecionar as 16 medalhas oficiais.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm text-slate-600 tabular-nums">
          <span className="text-xl sm:text-2xl font-black text-blue-700 tracking-tight">
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
          <span className="font-bold text-amber-700">
            {unlockedBadgesCount}/{totalBadgesCount} medalhas ({collectionPct}%)
          </span>

          {mode === 'dashboard' && onOpenBadges && (
            <button
              type="button"
              onClick={onOpenBadges}
              className="ml-auto lg:ml-2 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Ver todas as conquistas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive 8-Level XP Rank Track */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span className="font-bold text-slate-700">
            Patentes de XP ({reachedCount}/{LEVELS.length} alcançadas)
          </span>
          <span className="md:hidden text-[11px] font-semibold text-slate-400">
            Desliza para veres todos os níveis →
          </span>
        </div>

        <div className="overflow-x-auto scroll-touch pb-2">
          <div className="min-w-[680px] px-2">
            <div className="relative">
              {/* Progress Rail aligned with 44px circular markers */}
              <div
                className="absolute left-7 right-7 top-[21px] h-1.5 bg-slate-100 rounded-full overflow-hidden"
                aria-hidden="true"
              >
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-blue-600 to-indigo-600 rounded-full transition-[width] duration-500 ease-out"
                  style={{ width: `${trackProgressPercent}%` }}
                />
              </div>

              <div className="grid grid-cols-8 gap-2 relative z-10">
                {LEVELS.map((lvl) => {
                  const isReached = safeXp >= lvl.minXp;
                  const isNext = nextInfo.next?.level === lvl.level;
                  const isSelected = selectedMilestone.level === lvl.level;
                  const meta = RANK_META[lvl.level] || RANK_META[1];
                  const IconComp = meta.icon;

                  return (
                    <button
                      key={lvl.level}
                      type="button"
                      onClick={() => setSelectedLevelNum(lvl.level)}
                      aria-pressed={isSelected}
                      aria-label={`Nível ${lvl.level}: ${lvl.name}, ${lvl.minXp} XP — ${
                        isReached ? 'Alcançado' : isNext ? 'Próxima patente' : 'Por desbloquear'
                      }`}
                      className={`group flex flex-col items-center text-center rounded-2xl p-2 transition-transform duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                        isSelected ? 'bg-slate-50 -translate-y-0.5' : 'hover:bg-slate-50/70'
                      }`}
                    >
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

                      <span
                        className={`mt-2 text-xs font-black tabular-nums ${
                          isReached
                            ? 'text-emerald-700'
                            : isNext
                            ? 'text-blue-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {lvl.minXp.toLocaleString('pt-PT')} XP
                      </span>

                      <span
                        className={`mt-0.5 text-[11px] font-bold leading-snug line-clamp-2 ${
                          isReached || isNext ? 'text-slate-800' : 'text-slate-500'
                        }`}
                      >
                        {lvl.name}
                      </span>

                      <span
                        className={`mt-1 text-[10px] font-semibold ${
                          isReached
                            ? 'text-emerald-700'
                            : isNext
                            ? 'text-blue-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {isReached ? 'Alcançado' : isNext ? 'Próximo' : `Nível ${lvl.level}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Focused Selected Rank Progress Bar */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
              <Award className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-bold text-slate-900">
                Nível {selectedMilestone.level} — {selectedMilestone.name}
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums font-mono">
                {selectedMilestone.minXp.toLocaleString('pt-PT')} XP
              </span>
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
                  ? 'Patente alcançada'
                  : isSelectedNext
                  ? 'Próxima meta'
                  : 'Por desbloquear'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedMeta.encouragement}{' '}
              <span className="text-slate-500">{selectedMeta.hint}</span>
            </p>
          </div>

          <div className="w-full md:w-72 shrink-0 space-y-1.5">
            <div className="flex items-center justify-between text-xs tabular-nums">
              <span className="font-bold text-slate-700">
                {isSelectedReached
                  ? 'Meta concluída!'
                  : `Faltam ${selectedRemainingXp.toLocaleString('pt-PT')} XP`}
              </span>
              <span className="font-black text-blue-700">{selectedProgressPct}%</span>
            </div>
            <div
              className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden"
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
      </div>

      {/* Dashboard-only Lower Split: 5 World Shields + Closest Medals to Unlock */}
      {mode === 'dashboard' && (
        <div className="pt-5 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: 5 World Shields */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Medalhas dos 5 Mundos ({unlockedWorldsCount}/5)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Conclui cada Mundo acima de 70% para desbloquear o respetivo escudo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 pt-1">
              {WORLD_SHIELDS.map((shield) => {
                const hasIt = unlockedWorldIds.has(shield.id);
                return (
                  <button
                    key={shield.id}
                    type="button"
                    onClick={() => {
                      if (!isLoggedIn) {
                        onOpenLoginModal?.();
                        return;
                      }
                      onSelectWorld?.(shield.worldId);
                    }}
                    className="group flex flex-col items-center text-center p-2 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    title={
                      hasIt
                        ? `${shield.name} — Conquistada! Clica para rever o Mundo ${shield.worldId}.`
                        : `${shield.name} — Conclui o Mundo ${shield.worldId} acima de 70%.`
                    }
                  >
                    <div className="w-12 h-14 flex items-center justify-center group-hover:-translate-y-0.5 transition-transform">
                      {hasIt ? (
                        <svg viewBox="0 0 48 56" fill="none" className="w-11 h-13 drop-shadow-xs">
                          <path
                            d="M24 2 L44 8 C44 32, 38 46, 24 54 C10 46, 4 32, 4 8 Z"
                            fill={shield.color}
                            stroke="#FFFFFF"
                            strokeWidth="2.5"
                          />
                          <path
                            d="M24 8 L38 12 C38 30, 34 40, 24 46 C14 40, 10 30, 10 12 Z"
                            fill={shield.fill}
                          />
                          <polygon
                            points="24,18 26,24 32,24 27,28 29,34 24,30 19,34 21,28 16,24 22,24"
                            fill="#FFFFFF"
                          />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 48 56" fill="none" className="w-11 h-13 opacity-55">
                          <path
                            d="M24 2 L44 8 C44 32, 38 46, 24 54 C10 46, 4 32, 4 8 Z"
                            fill="#E2E8F0"
                            stroke="#CBD5E1"
                            strokeWidth="2"
                          />
                          <circle cx="24" cy="28" r="4" fill="#94A3B8" />
                          <path
                            d="M22 28 V24 A2 2 0 0 1 26 24 V28"
                            stroke="#94A3B8"
                            strokeWidth="2"
                            fill="none"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-bold leading-tight mt-1 ${
                        hasIt ? 'text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      {shield.name}
                    </span>
                    <span
                      className={`text-[10px] font-semibold mt-0.5 ${
                        hasIt ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {hasIt ? 'Conquistada' : `Mundo ${shield.worldId}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Next Medals Closest to Unlock */}
          <div className="lg:col-span-5 lg:border-l lg:border-slate-100 lg:pl-6 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-black text-slate-900">
                Próximas Medalhas em Progresso
              </h3>
              {!isLoggedIn && onOpenLoginModal && (
                <button
                  type="button"
                  onClick={onOpenLoginModal}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 whitespace-nowrap cursor-pointer"
                >
                  Entrar →
                </button>
              )}
            </div>

            {nextBadgesToUnlock.length === 0 ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 font-semibold">
                Incrível! Já desbloqueaste todas as medalhas de progresso disponíveis. Explora a galeria completa!
              </div>
            ) : (
              <div className="space-y-3">
                {nextBadgesToUnlock.map((badge) => (
                  <div
                    key={badge.id}
                    className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-900 truncate">
                          {badge.title}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {badge.description}
                        </p>
                      </div>
                      {badge.progress && (
                        <span className="text-[11px] font-mono font-bold text-blue-700 tabular-nums shrink-0">
                          {badge.progress.current.toLocaleString('pt-PT')}/
                          {badge.progress.target.toLocaleString('pt-PT')} {badge.progress.unit}
                        </span>
                      )}
                    </div>
                    {badge.progress && (
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-[width] duration-500"
                          style={{
                            width: `${Math.max(
                              badge.progress.percent,
                              badge.progress.current > 0 ? 5 : 0
                            )}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="text-[11px] text-slate-500">
              Conclui os 5 Mundos e a Grande Missão Final para conquistar a medalha lendária{' '}
              <strong className="text-slate-700">Mestre da Missão TIC</strong>.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
