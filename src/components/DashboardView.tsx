import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Lock,
  Signal,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { WorldSummary, RankingStudent, DailyTipData, WeeklyChallengeData } from '../types';
import { apiRequest } from '../api';
import {
  clientGetWorlds,
  clientGetClassRanking,
  clientGetDailyTip,
  clientClaimDailyTip,
  clientGetWeeklyChallenge,
} from '../services/clientFirestore';
import { t } from '../i18n';
import {
  Island1Artwork,
  Island2Artwork,
  Island3Artwork,
  Island4Artwork,
  Island5Artwork,
  SummitMountainArtwork,
  GoldTrophyIllustration,
  PhishingMailAlertIllustration,
  GreenBulbIllustration,
  QuoteBubbleIllustration,
  LeonorAvatar,
  TiagoAvatar,
  AlexAvatar,
} from './Illustrations';

interface DashboardViewProps {
  onSelectWorld: (worldId: number) => void;
  onSelectTab: (tab: string) => void;
  onOpenSimulator: (worldId: number, simId: string) => void;
  onOpenWeeklyChallenge: () => void;
  onOpenGrandeMissao: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectWorld,
  onSelectTab,
  onOpenSimulator,
  onOpenWeeklyChallenge,
  onOpenGrandeMissao,
}) => {
  const { user, locale, refreshUser, badges = [] } = useAuth();
  const [worlds, setWorlds] = useState<WorldSummary[]>([]);
  const [ranking, setRanking] = useState<RankingStudent[]>([]);
  const [dailyTip, setDailyTip] = useState<DailyTipData | null>(null);
  const [weeklyChallenge, setWeeklyChallenge] = useState<WeeklyChallengeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingTip, setClaimingTip] = useState(false);
  const [tipSuccessMsg, setTipSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      const [worldsRes, rankingRes, tipRes, challengeRes] = await Promise.all([
        apiRequest('/api/pedagogical/worlds'),
        apiRequest('/api/pedagogical/class-ranking'),
        apiRequest('/api/pedagogical/daily-tip'),
        apiRequest('/api/pedagogical/weekly-challenge'),
      ]);
      setWorlds(worldsRes.worlds || []);
      setRanking(rankingRes.ranking || []);
      setDailyTip(tipRes);
      setWeeklyChallenge(challengeRes);
      setLoading(false);
      return;
    } catch {
      // Fallback to client Firestore
    }

    try {
      const [clientWorlds, clientRanking, clientTip, clientChal] = await Promise.all([
        clientGetWorlds(user?.id),
        clientGetClassRanking(user?.classId || 'class-6a', user?.id),
        clientGetDailyTip(user?.id),
        clientGetWeeklyChallenge(user?.id),
      ]);
      setWorlds(clientWorlds.worlds || []);
      setRanking(clientRanking.ranking || []);
      setDailyTip(clientTip as any);
      setWeeklyChallenge(clientChal as any);
    } catch (err) {
      console.error('Error loading dashboard data via client Firestore:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimDailyTip = async () => {
    if (!dailyTip || dailyTip.alreadyClaimed || claimingTip) return;
    setClaimingTip(true);
    try {
      try {
        const res = await apiRequest('/api/pedagogical/daily-tip/claim', { method: 'POST' });
        setTipSuccessMsg(res.message);
      } catch {
        if (user) {
          const clientRes = await clientClaimDailyTip(user.id);
          setTipSuccessMsg(clientRes.message);
        }
      }
      setDailyTip({ ...dailyTip, alreadyClaimed: true });
      await refreshUser();
      setTimeout(() => setTipSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setClaimingTip(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. TOP 3 FEATURED CARDS (Matching Reference Mockup) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Desafio da Semana */}
        <div
          id="card-weekly-challenge"
          className="bg-[#FFFDF2] border border-[#FDE68A] rounded-3xl p-6 shadow-xs relative flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="shrink-0">
                  <GoldTrophyIllustration size={44} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1E3A8A] leading-tight">
                    Desafio da Semana
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-[#FEF08A] text-[#78350F] font-black text-xs px-2.5 py-0.5 rounded-md">
                      +50 XP
                    </span>
                    <span className="text-xs font-bold text-[#854D0E] flex items-center gap-1 bg-[#FEF9C3] px-2 py-0.5 rounded-md border border-[#FDE047]">
                      <Signal className="w-3.5 h-3.5 text-[#CA8A04]" /> Médio
                    </span>
                  </div>
                </div>
              </div>

              {/* Envelope illustration with alert badge */}
              <div className="shrink-0">
                <PhishingMailAlertIllustration size={48} />
              </div>
            </div>

            <p className="text-xs text-slate-700 font-medium my-4 leading-relaxed">
              Consegues descobrir se esta mensagem é phishing?
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              id="btn-accept-weekly-challenge"
              onClick={onOpenWeeklyChallenge}
              className="bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Aceitar desafio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectTab('challenges')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Dica Rápida */}
        <div
          id="card-daily-tip"
          className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-3xl p-6 shadow-xs relative flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3.5">
              <div className="shrink-0">
                <GreenBulbIllustration size={44} />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#16A34A] leading-tight">
                  Dica Rápida
                </h3>
                <span className="text-xs font-semibold text-emerald-700">
                  Hábito digital seguro
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 font-medium my-4 leading-relaxed min-h-[38px]">
              {dailyTip
                ? locale === 'en'
                  ? dailyTip.tip.en
                  : dailyTip.tip.pt
                : 'Antes de clicares num link recebido por mensagem, verifica para onde te leva.'}
            </p>

            {tipSuccessMsg && (
              <div className="mb-2 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl">
                {tipSuccessMsg}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              id="btn-claim-daily-tip"
              onClick={handleClaimDailyTip}
              disabled={dailyTip?.alreadyClaimed || claimingTip}
              className={`font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ${
                dailyTip?.alreadyClaimed
                  ? 'bg-emerald-200 text-emerald-800 cursor-default'
                  : 'bg-[#22C55E] hover:bg-[#16A34A] text-white'
              }`}
            >
              <span>
                {dailyTip?.alreadyClaimed ? 'Reclamado Hoje ✓' : 'Saber mais'}
              </span>
              {!dailyTip?.alreadyClaimed && <ArrowRight className="w-4 h-4" />}
            </button>
            <span className="text-xs font-black text-emerald-700">+10 XP</span>
          </div>
        </div>

        {/* Card 3: Frase do Dia */}
        <div
          id="card-quote-day"
          className="bg-[#FAF5FF] border border-[#E9D5FF] rounded-3xl p-6 shadow-xs relative flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3.5">
              <div className="shrink-0">
                <QuoteBubbleIllustration size={44} />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#6B21A8] leading-tight">
                  Frase do Dia
                </h3>
                <span className="text-xs font-semibold text-purple-700">
                  Pensamento crítico
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-800 italic font-semibold my-4 leading-relaxed min-h-[38px]">
              “Nem tudo o que aparece online é verdade.”
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => onSelectTab('worlds')}
              className="bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8] font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Ver mais</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-purple-600 font-bold">Missão TIC</span>
          </div>
        </div>
      </div>

      {/* 2. OS 5 MUNDOS DA MISSÃO TIC — THE PANORAMA ARCHIPELAGO (Matching Reference Mockup) */}
      <div
        id="worlds-panorama-section"
        className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden"
      >
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Os 5 Mundos da Missão TIC
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Explora, completa missões e torna-te um Mestre da Missão TIC!
            </p>
          </div>
          <button
            onClick={() => onSelectTab('worlds')}
            className="self-start sm:self-center text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl flex items-center gap-1.5 hover:bg-blue-100 transition-colors shadow-xs"
          >
            <span>Ver o meu progresso</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Panorama Illustrated Archipelago Canvas */}
        <div className="relative bg-gradient-to-b from-sky-100/40 via-blue-50/20 to-white rounded-3xl p-6 border border-blue-100/80">
          {/* Subtle Background Sky Clouds & Seagulls */}
          <div className="absolute top-4 left-10 text-slate-300 text-xs select-none">v v</div>
          <div className="absolute top-8 right-28 text-slate-300 text-xs select-none">v</div>
          <div className="absolute top-2 right-80 w-24 h-6 bg-white/60 rounded-full blur-xs pointer-events-none" />
          <div className="absolute top-12 left-40 w-20 h-5 bg-white/60 rounded-full blur-xs pointer-events-none" />

          {/* Dotted Arch Trail connecting all 5 islands and the mountain peak */}
          <svg
            className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-0"
            preserveAspectRatio="none"
            viewBox="0 0 1000 340"
          >
            <path
              d="M 90 120 Q 180 80, 260 120 T 430 120 T 600 120 T 770 120 T 920 110"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="3"
              strokeDasharray="6 6"
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>

          {/* Floating Islands Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5 relative z-10">
            {/* Island 1: Guardião Digital */}
            {(() => {
              const w1 = worlds.find((w) => w.id === 1);
              const isUnlocked = true;
              const avg = Math.round(w1?.average || 0);
              const completedCount = w1?.completedCount || 0;
              return (
                <div
                  id="world-island-1"
                  onClick={() => onSelectWorld(1)}
                  className="group cursor-pointer flex flex-col items-center text-center transition-transform hover:-translate-y-1.5"
                >
                  <div className="w-full h-36 flex items-center justify-center relative">
                    <Island1Artwork className="w-full h-full drop-shadow-sm" />
                  </div>

                  <div className="w-full bg-white rounded-2xl p-3.5 border border-blue-200/90 shadow-sm mt-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">
                        Mundo 1
                      </span>
                      <h4 className="text-sm font-black text-slate-900 leading-snug">
                        Guardião Digital
                      </h4>
                    </div>

                    <div className="my-2">
                      <div className="flex justify-end text-[10px] font-extrabold text-blue-600 mb-1">
                        {avg}%
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${avg}%` }}
                        />
                      </div>
                    </div>

                    <div
                      className={`w-full py-1.5 rounded-xl text-xs font-black flex items-center justify-center gap-1 ${
                        avg > 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : avg > 0
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span>
                        {avg > 80
                          ? 'Concluído'
                          : avg > 0
                          ? 'Em progresso'
                          : 'Por iniciar'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Island 2: Detetive Digital */}
            {(() => {
              const w2 = worlds.find((w) => w.id === 2);
              const isUnlocked = Boolean(w2?.isUnlocked);
              const avg = Math.round(w2?.average || 0);
              return (
                <div
                  id="world-island-2"
                  onClick={() => onSelectWorld(2)}
                  className={`group cursor-pointer flex flex-col items-center text-center transition-transform ${
                    isUnlocked ? 'hover:-translate-y-1.5' : 'opacity-85'
                  }`}
                >
                  <div className="w-full h-36 flex items-center justify-center relative">
                    <Island2Artwork className={`w-full h-full drop-shadow-sm ${isUnlocked ? '' : 'grayscale-30'}`} />
                  </div>

                  <div className="w-full bg-white rounded-2xl p-3.5 border border-sky-200/90 shadow-sm mt-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black text-sky-600 uppercase tracking-wider block">
                        Mundo 2
                      </span>
                      <h4 className="text-sm font-black text-slate-900 leading-snug">
                        Detetive Digital
                      </h4>
                    </div>

                    <div className="my-2">
                      <div className="flex justify-end text-[10px] font-extrabold text-sky-600 mb-1">
                        {avg}%
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-sky-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${avg}%` }}
                        />
                      </div>
                    </div>

                    <div
                      className={`w-full py-1.5 rounded-xl text-xs font-black flex items-center justify-center gap-1 ${
                        !isUnlocked
                          ? 'bg-slate-100 text-slate-500'
                          : avg > 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : avg > 0
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-sky-50 text-sky-700'
                      }`}
                    >
                      {!isUnlocked && <Lock className="w-3.5 h-3.5" />}
                      <span>
                        {!isUnlocked
                          ? 'Bloqueado'
                          : avg > 80
                          ? 'Concluído'
                          : avg > 0
                          ? 'Em progresso'
                          : 'Desbloqueado'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Island 3: Criador Digital */}
            {(() => {
              const w3 = worlds.find((w) => w.id === 3);
              const isUnlocked = Boolean(w3?.isUnlocked);
              const avg = Math.round(w3?.average || 0);
              return (
                <div
                  id="world-island-3"
                  onClick={() => onSelectWorld(3)}
                  className={`group cursor-pointer flex flex-col items-center text-center transition-transform ${
                    isUnlocked ? 'hover:-translate-y-1.5' : 'opacity-85'
                  }`}
                >
                  <div className="w-full h-36 flex items-center justify-center relative">
                    <Island3Artwork className={`w-full h-full drop-shadow-sm ${isUnlocked ? '' : 'opacity-80 grayscale-30'}`} />
                  </div>

                  <div className="w-full bg-white/95 rounded-2xl p-3.5 border border-purple-200/80 shadow-sm mt-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider block">
                        Mundo 3
                      </span>
                      <h4 className="text-sm font-black text-slate-900 leading-snug">
                        Criador Digital
                      </h4>
                    </div>

                    <div className="my-2">
                      <div className="flex justify-end text-[10px] font-bold text-purple-600 mb-1">
                        {avg}%
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-purple-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${avg}%` }}
                        />
                      </div>
                    </div>

                    <div
                      className={`w-full py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 ${
                        !isUnlocked
                          ? 'bg-slate-100 text-slate-500'
                          : avg > 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : avg > 0
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-purple-50 text-purple-700'
                      }`}
                    >
                      {!isUnlocked && <Lock className="w-3.5 h-3.5" />}
                      <span>
                        {!isUnlocked
                          ? 'Bloqueado'
                          : avg > 80
                          ? 'Concluído'
                          : avg > 0
                          ? 'Em progresso'
                          : 'Desbloqueado'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Island 4: Engenheiro Digital */}
            {(() => {
              const w4 = worlds.find((w) => w.id === 4);
              const isUnlocked = Boolean(w4?.isUnlocked);
              const avg = Math.round(w4?.average || 0);
              return (
                <div
                  id="world-island-4"
                  onClick={() => onSelectWorld(4)}
                  className={`group cursor-pointer flex flex-col items-center text-center transition-transform ${
                    isUnlocked ? 'hover:-translate-y-1.5' : 'opacity-85'
                  }`}
                >
                  <div className="w-full h-36 flex items-center justify-center relative">
                    <Island4Artwork className={`w-full h-full drop-shadow-sm ${isUnlocked ? '' : 'opacity-80 grayscale-30'}`} />
                  </div>

                  <div className="w-full bg-white/95 rounded-2xl p-3.5 border border-amber-200/80 shadow-sm mt-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider block">
                        Mundo 4
                      </span>
                      <h4 className="text-sm font-black text-slate-900 leading-snug">
                        Engenheiro Digital
                      </h4>
                    </div>

                    <div className="my-2">
                      <div className="flex justify-end text-[10px] font-bold text-amber-600 mb-1">
                        {avg}%
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${avg}%` }}
                        />
                      </div>
                    </div>

                    <div
                      className={`w-full py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 ${
                        !isUnlocked
                          ? 'bg-slate-100 text-slate-500'
                          : avg > 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : avg > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {!isUnlocked && <Lock className="w-3.5 h-3.5" />}
                      <span>
                        {!isUnlocked
                          ? 'Bloqueado'
                          : avg > 80
                          ? 'Concluído'
                          : avg > 0
                          ? 'Em progresso'
                          : 'Desbloqueado'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Island 5: Explorador da IA */}
            {(() => {
              const w5 = worlds.find((w) => w.id === 5);
              const isUnlocked = Boolean(w5?.isUnlocked);
              const avg = Math.round(w5?.average || 0);
              return (
                <div
                  id="world-island-5"
                  onClick={() => onSelectWorld(5)}
                  className={`group cursor-pointer flex flex-col items-center text-center transition-transform ${
                    isUnlocked ? 'hover:-translate-y-1.5' : 'opacity-85'
                  }`}
                >
                  <div className="w-full h-36 flex items-center justify-center relative">
                    <Island5Artwork className={`w-full h-full drop-shadow-sm ${isUnlocked ? '' : 'opacity-80 grayscale-30'}`} />
                  </div>

                  <div className="w-full bg-white/95 rounded-2xl p-3.5 border border-indigo-200/80 shadow-sm mt-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">
                        Mundo 5
                      </span>
                      <h4 className="text-sm font-black text-slate-900 leading-snug">
                        Explorador da IA
                      </h4>
                    </div>

                    <div className="my-2">
                      <div className="flex justify-end text-[10px] font-bold text-indigo-600 mb-1">
                        {avg}%
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${avg}%` }}
                        />
                      </div>
                    </div>

                    <div
                      className={`w-full py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 ${
                        !isUnlocked
                          ? 'bg-slate-100 text-slate-500'
                          : avg > 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : avg > 0
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {!isUnlocked && <Lock className="w-3.5 h-3.5" />}
                      <span>
                        {!isUnlocked
                          ? 'Bloqueado'
                          : avg > 80
                          ? 'Concluído'
                          : avg > 0
                          ? 'Em progresso'
                          : 'Desbloqueado'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Summit: Grande Missão Final - A ESCOLA DO FUTURO */}
            <div
              id="summit-mountain"
              onClick={onOpenGrandeMissao}
              className="group cursor-pointer flex flex-col items-center text-center transition-transform hover:-translate-y-1.5"
            >
              <div className="w-full h-36 flex items-center justify-center relative">
                <SummitMountainArtwork className="w-full h-full drop-shadow-md" />
              </div>

              {/* Floating dark badge matching mockup */}
              <div className="w-full bg-gradient-to-b from-[#1E293B] to-[#0F172A] text-white rounded-2xl p-3.5 border border-slate-700 shadow-md mt-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                    Grande Missão Final
                  </span>
                  <h4 className="text-xs font-black text-white leading-tight mt-0.5">
                    🔒 A ESCOLA DO FUTURO
                  </h4>
                </div>

                <div className="mt-3">
                  <div className="w-full py-1.5 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-amber-950 flex items-center justify-center gap-1 shadow-xs">
                    <span>Participar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM 3 COLUMNS (Matching Reference Mockup) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: As minhas conquistas */}
        <div
          id="achievements-section"
          className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900">
                As minhas conquistas
              </h3>
              <button
                onClick={() => onSelectTab('badges')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Ver todas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 5 Shields in horizontal sequence dynamic from user badges */}
            <div className="grid grid-cols-5 gap-2 py-3">
              {(() => {
                const userBadgesList = badges.map((b: any) => b.badgeId || b.id || b);
                const shieldConfigs = [
                  {
                    id: 'guardiao-digital',
                    name: 'Guardião Digital',
                    color: '#2563EB',
                    fill: '#3B82F6',
                    icon: 'star',
                  },
                  {
                    id: 'detetive-digital',
                    name: 'Detetive Digital',
                    color: '#0284C7',
                    fill: '#38BDF8',
                    icon: 'search',
                  },
                  {
                    id: 'criador-digital',
                    name: 'Criador Digital',
                    color: '#7C3AED',
                    fill: '#A855F7',
                    icon: 'palette',
                  },
                  {
                    id: 'engenheiro-digital',
                    name: 'Engenheiro Digital',
                    color: '#D97706',
                    fill: '#F59E0B',
                    icon: 'terminal',
                  },
                  {
                    id: 'explorador-da-ia',
                    name: 'Explorador da IA',
                    color: '#4F46E5',
                    fill: '#6366F1',
                    icon: 'sparkles',
                  },
                ];

                return shieldConfigs.map((shield) => {
                  const hasIt = userBadgesList.includes(shield.id);
                  return (
                    <div key={shield.id} className="flex flex-col items-center text-center">
                      <div className="w-12 h-14 flex items-center justify-center">
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
                          <svg viewBox="0 0 48 56" fill="none" className="w-11 h-13 opacity-50">
                            <path
                              d="M24 2 L44 8 C44 32, 38 46, 24 54 C10 46, 4 32, 4 8 Z"
                              fill="#E2E8F0"
                              stroke="#CBD5E1"
                              strokeWidth="2"
                            />
                            <circle cx="24" cy="28" r="4" fill="#94A3B8" />
                            <path d="M22 28 V24 A2 2 0 0 1 26 24 V28" stroke="#94A3B8" strokeWidth="2" fill="none" />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold leading-tight mt-1 ${
                          hasIt ? 'text-slate-800' : 'text-slate-400'
                        }`}
                      >
                        {shield.name}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
            Completa os 5 Mundos para desbloquear a insígnia Mestre da Missão TIC!
          </div>
        </div>

        {/* Column 2: Próxima missão */}
        <div
          id="next-mission-section"
          className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <h3 className="text-lg font-black text-slate-900 mb-4">
              Próxima missão
            </h3>

            {/* Mission Box */}
            <div className="flex items-center gap-4 bg-[#F0F9FF] border border-[#BAE6FD] p-4 rounded-2xl">
              <div className="w-13 h-13 rounded-2xl bg-[#0284C7] text-white flex items-center justify-center shrink-0 shadow-xs">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">
                  Completa o simulador
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-0.5">
                  Constrói uma Password Forte
                </h4>
                <span className="inline-block mt-1 bg-[#FEF08A] text-[#854D0E] text-xs font-black px-2.5 py-0.5 rounded-md">
                  +30 XP
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => onOpenSimulator(1, 'sim-password')}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Column 3: Ranking da Turma */}
        <div
          id="class-ranking-section"
          className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900">
                Ranking da Turma
              </h3>
              <button
                onClick={() => onSelectTab('challenges')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Ver todos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dynamic ranking from server/database */}
            <div className="space-y-2.5">
              {ranking.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 font-medium">
                  {user ? (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-base">⭐</span>
                        <div className="text-left">
                          <span className="text-xs font-black text-blue-800 block">
                            {user.nickname} (Tu)
                          </span>
                          <span className="text-[10px] text-blue-600 font-semibold">
                            {user.classId?.replace('class-', 'Turma ').toUpperCase() || '6.º A'}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-blue-700 bg-white px-2.5 py-1 rounded-lg shadow-2xs">
                        {user.xp || 0} XP
                      </span>
                    </div>
                  ) : (
                    'Sem alunos na turma ainda.'
                  )}
                </div>
              ) : (
                ranking.slice(0, 3).map((item, idx) => {
                  const medal = idx === 0 ? '👑' : idx === 1 ? '🥈' : '🥉';
                  const isCurrent = item.isCurrentUser || item.id === user?.id;
                  return (
                    <div
                      key={item.id || idx}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border ${
                        isCurrent
                          ? 'bg-blue-50/90 border-blue-200'
                          : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base select-none">{medal}</span>
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          {item.nickname.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span
                            className={`text-xs font-black block ${
                              isCurrent ? 'text-blue-700' : 'text-slate-800'
                            }`}
                          >
                            {item.nickname} {isCurrent && '(Tu)'}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            Nível {item.level} • {item.levelName}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                          isCurrent
                            ? 'text-blue-700 bg-white border border-blue-200'
                            : 'text-blue-700 bg-blue-50'
                        }`}
                      >
                        {item.xp} XP
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
            Pratica missões e desafios para subir no ranking da turma!
          </div>
        </div>
      </div>
    </div>
  );
};
