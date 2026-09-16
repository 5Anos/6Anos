import React from 'react';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BADGES_CATALOG } from '../../server/catalog';
import { t } from '../i18n';

export const BadgesView: React.FC = () => {
  const { user, badges, locale } = useAuth();

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
      case 'Crown':
        return Crown;
      default:
        return Award;
    }
  };

  const unlockedIds = new Set(badges.map((b) => b.id));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('nav_badges', locale)} & Galeria de Honra
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Conquista insígnias oficiais ao completares mundos, desafios e missões reais.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-2.5 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Desbloqueadas
            </span>
            <span className="text-xl font-black text-blue-700">
              {unlockedIds.size} / {BADGES_CATALOG.length}
            </span>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {BADGES_CATALOG.map((badgeDef) => {
          const isUnlocked = unlockedIds.has(badgeDef.id);
          const Icon = getBadgeIcon(badgeDef.icon);
          const userBadge = badges.find((b) => b.id === badgeDef.id);

          return (
            <div
              key={badgeDef.id}
              className={`rounded-3xl p-6 border flex flex-col justify-between transition-all ${
                isUnlocked
                  ? 'bg-gradient-to-b from-blue-50/70 via-white to-white border-blue-200 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xs ${
                      isUnlocked
                        ? 'bg-gradient-to-tr from-blue-500 to-cyan-400 text-white shadow-blue-500/20'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  {isUnlocked ? (
                    <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Conquistada
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Bloqueada
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-slate-900 leading-tight">
                  {badgeDef.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {badgeDef.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-extrabold text-blue-600">Insígnia Oficial</span>
                {isUnlocked && userBadge && (
                  <span className="text-[11px] text-slate-400">
                    {new Date(userBadge.unlockedAt).toLocaleDateString('pt-PT')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

