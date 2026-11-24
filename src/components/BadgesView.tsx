import React, { useEffect, useMemo, useState } from 'react';
import {
  Shield,
  Search,
  Palette,
  Terminal,
  Brain,
  Crown,
  Award,
  Zap,
  Footprints,
  Lock,
  CheckCircle2,
  Rocket,
  Trophy,
  Flame,
  Target,
  CalendarCheck,
  Lightbulb,
  Star,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BADGES_CATALOG, BadgeCatalogDefinition } from '../data/catalog';
import { apiRequest } from '../api';
import { t } from '../i18n';
import type { BadgeCategory, BadgeTier } from '../../shared/badgesCatalog';
import { XpMilestonesTracker } from './XpMilestonesTracker';

interface EnrichedBadge extends BadgeCatalogDefinition {
  unlocked: boolean;
  awardedAt: string | null;
  progress: {
    current: number;
    target: number;
    unit: string;
    percent: number;
  } | null;
}

const CATEGORY_TABS: { id: 'all' | BadgeCategory; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'mundos', label: '5 Mundos' },
  { id: 'pontos', label: 'Marcos de XP' },
  { id: 'desafios', label: 'Desafios & Dicas' },
  { id: 'excelencia', label: 'Excelência' },
];

const TIER_STYLES: Record<
  BadgeTier,
  {
    label: string;
    pillBg: string;
    pillText: string;
    iconBgUnlocked: string;
    cardUnlocked: string;
  }
> = {
  bronze: {
    label: 'Bronze',
    pillBg: 'bg-orange-100 border-orange-200',
    pillText: 'text-orange-800',
    iconBgUnlocked: 'from-orange-500 to-amber-400',
    cardUnlocked: 'from-orange-50/70 via-white to-white border-orange-200',
  },
  prata: {
    label: 'Prata',
    pillBg: 'bg-sky-100 border-sky-200',
    pillText: 'text-sky-800',
    iconBgUnlocked: 'from-blue-500 to-cyan-400',
    cardUnlocked: 'from-blue-50/70 via-white to-white border-blue-200',
  },
  ouro: {
    label: 'Ouro',
    pillBg: 'bg-amber-100 border-amber-300',
    pillText: 'text-amber-900',
    iconBgUnlocked: 'from-amber-500 to-yellow-400',
    cardUnlocked: 'from-amber-50/80 via-white to-white border-amber-300',
  },
  lendaria: {
    label: 'Lendária',
    pillBg: 'bg-purple-100 border-purple-300',
    pillText: 'text-purple-900',
    iconBgUnlocked: 'from-indigo-600 via-purple-600 to-fuchsia-500',
    cardUnlocked: 'from-purple-50/80 via-white to-white border-purple-300',
  },
};

export const BadgesView: React.FC = () => {
  const { user, badges: authBadges, locale } = useAuth();
  const [liveBadges, setLiveBadges] = useState<EnrichedBadge[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | BadgeCategory>('all');

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    apiRequest('/api/pedagogical/badges')
      .then((res) => {
        if (!active) return;
        if (Array.isArray(res?.badges)) {
          setLiveBadges(
            res.badges.map((b: any) => ({
              ...b,
              unlocked: Boolean(b.unlocked),
              awardedAt: b.awardedAt || b.unlockedAt || null,
              progress: b.progress || null,
            }))
          );
        }
      })
      .catch((err) => {
        console.error('Failed to load badges with progress:', err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?.id, user?.xp]);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Footprints':
        return Footprints;
      case 'ShieldCheck':
        return Shield;
      case 'Search':
        return Search;
      case 'Palette':
        return Palette;
      case 'Code2':
        return Terminal;
      case 'Sparkles':
        return Brain;
      case 'Zap':
        return Zap;
      case 'Rocket':
        return Rocket;
      case 'Trophy':
        return Trophy;
      case 'Flame':
        return Flame;
      case 'Target':
        return Target;
      case 'CalendarCheck':
        return CalendarCheck;
      case 'Lightbulb':
        return Lightbulb;
      case 'Star':
        return Star;
      case 'Crown':
        return Crown;
      default:
        return Award;
    }
  };

  // Fallback to AuthContext badges (correctly matching badgeId || id) if live fetch hasn't resolved yet
  const resolvedBadges: EnrichedBadge[] = useMemo(() => {
    if (liveBadges && liveBadges.length > 0) return liveBadges;
    const authById = new Map<string, any>();
    (authBadges || []).forEach((b: any) => {
      const key = b?.badgeId || b?.id;
      if (key) authById.set(String(key), b);
    });
    return BADGES_CATALOG.map((def) => {
      const rec = authById.get(def.id);
      return {
        ...def,
        unlocked: Boolean(rec),
        awardedAt: rec?.awardedAt || rec?.unlockedAt || null,
        progress: null,
      };
    });
  }, [liveBadges, authBadges]);

  const unlockedCount = useMemo(
    () => resolvedBadges.filter((b) => b.unlocked).length,
    [resolvedBadges]
  );

  const displayedBadges = useMemo(() => {
    if (categoryFilter === 'all') return resolvedBadges;
    if (categoryFilter === 'mundos') {
      return resolvedBadges.filter((b) => b.category === 'mundos' || b.category === 'jornada');
    }
    return resolvedBadges.filter((b) => b.category === categoryFilter);
  }, [resolvedBadges, categoryFilter]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 text-center shadow-sm">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
          <Award className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Entra na tua conta para veres as medalhas!
        </h2>
        <p className="text-sm text-slate-600 font-medium max-w-md mx-auto mb-6 leading-relaxed">
          Para colecionares medalhas e pontos XP, entra com o cartão de acesso dado pela tua professora.
        </p>
      </div>
    );
  }

  const completionPct = Math.round((unlockedCount / Math.max(1, resolvedBadges.length)) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Unified XP Rank Track + Collection Summary */}
      <XpMilestonesTracker
        xp={user.xp || 0}
        isLoggedIn={true}
        mode="full"
        badges={resolvedBadges}
      />

      {/* Medals Gallery Header & Category Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Galeria das {resolvedBadges.length} Medalhas Oficiais
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Filtra por categoria para veres o que já conquistaste ({unlockedCount}/{resolvedBadges.length} · {completionPct}%) e o que falta desbloquear.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORY_TABS.map((tab) => {
              const isActive = categoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategoryFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      {loading && !liveBadges ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-xs font-semibold text-slate-500">
          A carregar as tuas medalhas...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedBadges.map((badgeDef) => {
            const isUnlocked = badgeDef.unlocked;
            const Icon = getBadgeIcon(badgeDef.icon);
            const tierStyle = TIER_STYLES[badgeDef.tier || 'prata'];
            const formattedDate =
              badgeDef.awardedAt && !Number.isNaN(new Date(badgeDef.awardedAt).getTime())
                ? new Date(badgeDef.awardedAt).toLocaleDateString('pt-PT')
                : null;

            return (
              <div
                key={badgeDef.id}
                className={`rounded-3xl p-5 sm:p-6 border flex flex-col justify-between transition-all ${
                  isUnlocked
                    ? `bg-gradient-to-b ${tierStyle.cardUnlocked} shadow-xs`
                    : 'bg-slate-50/80 border-slate-200/90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs shrink-0 ${
                        isUnlocked
                          ? `bg-gradient-to-tr ${tierStyle.iconBgUnlocked} text-white`
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {isUnlocked ? (
                        <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Conquistada
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-200/80 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Por desbloquear
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${tierStyle.pillBg} ${tierStyle.pillText}`}
                      >
                        {tierStyle.label}
                      </span>
                    </div>
                  </div>

                  <h3
                    className={`text-base font-black leading-tight ${
                      isUnlocked ? 'text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    {badgeDef.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {badgeDef.description}
                  </p>

                  {/* Live Progress Bar for Progressive Medals */}
                  {badgeDef.progress && !isUnlocked && (
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-600">
                        <span>Progresso</span>
                        <span className="text-blue-700">
                          {badgeDef.progress.current.toLocaleString('pt-PT')} /{' '}
                          {badgeDef.progress.target.toLocaleString('pt-PT')} {badgeDef.progress.unit}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(
                              badgeDef.progress.percent,
                              badgeDef.progress.current > 0 ? 5 : 0
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className={`font-extrabold ${isUnlocked ? 'text-blue-600' : 'text-slate-400'}`}>
                    Medalha Oficial
                  </span>
                  {isUnlocked && formattedDate && (
                    <span className="text-[11px] font-semibold text-slate-400">{formattedDate}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
