import React from 'react';
import {
  Shield,
  Search,
  Palette,
  Terminal,
  Brain,
  Crown,
  CheckCircle2,
  Lock,
  ArrowRight,
  KeyRound,
  Sparkles,
  Zap,
  Info,
} from 'lucide-react';
import { ESCAPE_ZONES, ZoneInfo } from './types';

interface GrandeMissaoMapProps {
  completedZones: number[];
  unlockedCodes: Record<number, string>;
  onSelectZone: (zoneId: number) => void;
  onBackToApp: () => void;
  isFullyCompleted: boolean;
}

export const GrandeMissaoMap: React.FC<GrandeMissaoMapProps> = ({
  completedZones,
  unlockedCodes,
  onSelectZone,
  onBackToApp,
  isFullyCompleted,
}) => {
  const getZoneIcon = (iconName: string, className: string = 'w-6 h-6') => {
    switch (iconName) {
      case 'Shield':
        return <Shield className={className} />;
      case 'Search':
        return <Search className={className} />;
      case 'Palette':
        return <Palette className={className} />;
      case 'Terminal':
        return <Terminal className={className} />;
      case 'Brain':
        return <Brain className={className} />;
      case 'Crown':
        return <Crown className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  const zones1to5 = ESCAPE_ZONES.filter((z) => z.id <= 5);
  const coreZone = ESCAPE_ZONES.find((z) => z.id === 6)!;
  const count1to5Completed = completedZones.filter((id) => id <= 5).length;
  const isCoreUnlocked = count1to5Completed >= 5;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Narrative & Mission Control Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/30 relative overflow-hidden">
        {/* Background decorative cyber-grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-400 text-amber-950 font-black text-xs px-3 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Crown className="w-3.5 h-3.5" /> Grande Missão Final
              </span>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-black px-2.5 py-0.5 rounded-md">
                Ano 2040 • Escape Room Digital
              </span>
              <span className="text-xs font-black text-amber-300">+150 XP</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              A ESCOLA DO FUTURO
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              O ecossistema digital da escola entrou em bloqueio de segurança. Explora os 5 setores, resolve as mini-missões práticas para recolher os <strong>5 Códigos de Segurança</strong> e desbloqueia o <strong>Núcleo Central</strong> para restabelecer a escola!
            </p>
          </div>

          {/* Quick Stats Panel */}
          <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-4 shrink-0 flex flex-col justify-center min-w-[200px] backdrop-blur-xs">
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Progresso dos Códigos
            </div>
            <div className="text-2xl font-black text-amber-400 mt-0.5">
              {count1to5Completed} / 5 <span className="text-xs font-normal text-slate-300">Setores</span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(count1to5Completed / 5) * 100}%` }}
              />
            </div>

            <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              {isCoreUnlocked ? (
                <span className="text-emerald-400 font-bold">Núcleo Desbloqueado!</span>
              ) : (
                <span>Recupera todos os 5 códigos</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5 Outer Sectors Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            Setores da Escola do Futuro (Mundos 1 a 5)
          </h2>
          <span className="text-xs font-medium text-slate-500">
            Podes resolver em qualquer ordem
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {zones1to5.map((zone) => {
            const isDone = completedZones.includes(zone.id);
            const code = unlockedCodes[zone.id] || (isDone ? zone.codeFragment : null);

            return (
              <div
                key={zone.id}
                className={`bg-white rounded-3xl border p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                  isDone
                    ? 'border-emerald-300 bg-emerald-50/10'
                    : 'border-slate-200/90 hover:border-indigo-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      Mundo {zone.worldNumber} • {zone.worldName}
                    </span>

                    {isDone ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Resolvido
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                        Pendente
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-indigo-50 text-indigo-600'
                      }`}
                    >
                      {getZoneIcon(zone.iconName, 'w-6 h-6')}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 leading-snug">
                        {zone.name}
                      </h3>
                      <span className="text-[11px] font-bold text-slate-500 block mt-0.5">
                        {zone.tag}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                    {zone.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isDone ? (
                    <div className="flex items-center gap-1.5 font-mono text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                      <span>{code}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400">
                      Código protegido 🔒
                    </span>
                  )}

                  <button
                    onClick={() => onSelectZone(zone.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isDone
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    <span>{isDone ? 'Revisitar' : 'Entrar no Setor'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Central Summit Card: Zone 6 (Núcleo da Escola do Futuro) */}
          <div
            className={`rounded-3xl border p-5 shadow-md flex flex-col justify-between transition-all md:col-span-2 lg:col-span-1 ${
              isCoreUnlocked
                ? 'bg-gradient-to-b from-slate-900 to-indigo-950 text-white border-amber-500/50'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 opacity-90'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-400 text-amber-950 shadow-xs">
                  👑 Desafio Integrador Final
                </span>

                {isFullyCompleted ? (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Escola Salva!
                  </span>
                ) : isCoreUnlocked ? (
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> Desbloqueado!
                  </span>
                ) : (
                  <span className="bg-slate-800 text-slate-400 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" /> Bloqueado
                  </span>
                )}
              </div>

              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                    isCoreUnlocked
                      ? 'bg-amber-400 text-amber-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white leading-snug">
                    {coreZone.name}
                  </h3>
                  <span className="text-[11px] font-bold text-amber-300 block mt-0.5">
                    Sala do Diretor Virtual 2040
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-medium leading-relaxed mb-4">
                {isCoreUnlocked
                  ? 'Todos os 5 códigos foram recuperados! Entra no Núcleo, insere os fragmentos e toma a decisão ética final!'
                  : 'Requer os 5 Códigos de Segurança dos setores 1 a 5 para abrir a consola central da escola.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-amber-400 font-bold">
                {isCoreUnlocked ? 'Pronto para reinicialização' : `${count1to5Completed}/5 Códigos`}
              </span>

              <button
                onClick={() => {
                  if (isCoreUnlocked) onSelectZone(6);
                }}
                disabled={!isCoreUnlocked}
                className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                  isCoreUnlocked
                    ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 shadow-md cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                {!isCoreUnlocked && <Lock className="w-3.5 h-3.5" />}
                <span>{isFullyCompleted ? 'Ver Certificado' : isCoreUnlocked ? 'Aceder ao Núcleo' : 'Bloqueado'}</span>
                {isCoreUnlocked && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
