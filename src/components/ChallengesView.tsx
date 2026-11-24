import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Medal,
  Crown,
  ShieldCheck,
  Calendar,
  Clock,
  Lock,
  Sparkles,
  Eye,
  RotateCcw,
  Compass,
} from 'lucide-react';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { AnnualWeeklyScheduleItem, RankingStudent, WeeklyChallengeData } from '../types';
import { t } from '../i18n';
import { AvatarRenderer } from './avatar/AvatarRenderer';
import { HighlightClues } from '../utils/textHighlight';

interface ChallengesViewProps {
  onOpenSimulators?: () => void;
}

const WORLD_BADGE_STYLES: Record<number, { bg: string; text: string; border: string; short: string }> = {
  1: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', short: 'Mundo 1' },
  2: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', short: 'Mundo 2' },
  3: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', short: 'Mundo 3' },
  4: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', short: 'Mundo 4' },
  5: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', short: 'Mundo 5' },
};

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const ChallengesView: React.FC<ChallengesViewProps> = () => {
  const { user, locale, refreshUser } = useAuth();
  const [ranking, setRanking] = useState<RankingStudent[]>([]);
  const [weeklyChallenge, setWeeklyChallenge] = useState<WeeklyChallengeData | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingWeek, setLoadingWeek] = useState(false);
  const [previewWeek, setPreviewWeek] = useState<number | null>(null);
  const [worldFilter, setWorldFilter] = useState<number | 'all'>('all');
  const [showAllWeeks, setShowAllWeeks] = useState(false);
  const missionTopRef = useRef<HTMLDivElement | null>(null);

  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    loadData(previewWeek);
  }, [user?.id, previewWeek]);

  const loadData = async (weekOverride: number | null = null) => {
    if (!user) return;
    setLoadingWeek(true);
    try {
      const challengeEndpoint =
        weekOverride !== null
          ? `/api/pedagogical/weekly-challenge?week=${weekOverride}`
          : '/api/pedagogical/weekly-challenge';
      const [rankRes, chalRes] = await Promise.all([
        apiRequest('/api/pedagogical/class-ranking'),
        apiRequest(challengeEndpoint),
      ]);
      setRanking(rankRes.ranking || []);
      setWeeklyChallenge(chalRes);
    } catch (err) {
      console.error('Failed to load challenges data:', err);
    } finally {
      setLoadingWeek(false);
    }
  };

  const challenge = weeklyChallenge?.challenge;
  const annualProgress = weeklyChallenge?.annualProgress;
  const isPreview = Boolean(weeklyChallenge?.isPreview || challenge?.isPreview);
  const isChallengeCompleted =
    !isPreview && !!(weeklyChallenge?.alreadyCompleted || challenge?.completed);

  const handleWeeklySubmit = async (optionIndex: number) => {
    if (!challenge || isChallengeCompleted || submitting) return;
    setSelectedOptionIndex(optionIndex);
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await apiRequest('/api/pedagogical/weekly-challenge', {
        method: 'POST',
        body: JSON.stringify({
          optionIndex,
          solution: optionIndex,
          weekNumber: challenge.weekNumber,
        }),
      });
      if (res) {
        setFeedback({
          text: res.feedback || res.message || 'Resposta registada!',
          isCorrect: Boolean(res.isCorrect),
        });
        if (res.isCorrect && !isPreview) {
          await loadData(previewWeek);
          await refreshUser();
        }
      }
    } catch (err: any) {
      setFeedback({
        text: err.message || 'Ocorreu um erro ao submeter a resposta.',
        isCorrect: false,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectWeekPreview = (item: AnnualWeeklyScheduleItem) => {
    if (!isTeacher) return;
    setFeedback(null);
    setSelectedOptionIndex(null);
    if (item.isCurrent) {
      setPreviewWeek(null);
    } else {
      setPreviewWeek(item.weekNumber);
    }
    missionTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 text-center shadow-sm">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Entra na tua conta para jogar!
        </h2>
        <p className="text-sm text-slate-600 font-medium max-w-md mx-auto mb-6 leading-relaxed">
          Para participares nos 52 desafios semanais do ano e apareceres na tabela da tua turma, entra com a conta dada pela tua professora.
        </p>
      </div>
    );
  }

  const worldStyle = WORLD_BADGE_STYLES[challenge?.worldId || 1] || WORLD_BADGE_STYLES[1];
  const fullSchedule = annualProgress?.schedule || [];
  const filteredSchedule =
    worldFilter === 'all'
      ? fullSchedule
      : fullSchedule.filter((item) => item.worldId === worldFilter);

  const displayedSchedule = showAllWeeks
    ? filteredSchedule
    : (() => {
        if (worldFilter !== 'all') return filteredSchedule;
        const currentIdx = filteredSchedule.findIndex((i) => i.isCurrent);
        if (currentIdx === -1) return filteredSchedule.slice(0, 12);
        const start = Math.max(0, currentIdx - 3);
        const end = Math.min(filteredSchedule.length, start + 12);
        const adjustedStart = Math.max(0, end - 12);
        return filteredSchedule.slice(adjustedStart, end);
      })();

  const annualCompletedCount = annualProgress?.completedCount || 0;
  const totalWeeks = annualProgress?.totalWeeks || 52;
  const annualPct = Math.round((annualCompletedCount / totalWeeks) * 100);

  return (
    <div className="space-y-8 max-w-7xl mx-auto" ref={missionTopRef}>
      {/* Weekly Challenge Hero Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 rounded-3xl p-6 sm:p-8 shadow-md text-amber-950 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-950 text-amber-100 text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wide">
              {challenge ? `Semana ${challenge.weekNumber} de 52` : 'Semana em Curso'}
            </span>
            {challenge?.dateRangeLabel && (
              <span className="bg-white/75 text-amber-950 text-xs font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {challenge.dateRangeLabel}
              </span>
            )}
            {challenge && (
              <span className="bg-white/75 text-amber-950 text-xs font-extrabold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" />
                Mundo {challenge.worldId} • {challenge.worldName}
              </span>
            )}
            <span className="text-xs font-extrabold flex items-center gap-1 bg-amber-950/10 px-2.5 py-1 rounded-lg">
              <Flame className="w-3.5 h-3.5 text-amber-950" />
              {challenge?.difficulty || 'Médio'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            {challenge?.title || t('weekly_challenge_title', locale)}
          </h2>
          <p className="text-xs sm:text-sm font-semibold opacity-95 leading-relaxed">
            {challenge?.context || t('weekly_challenge_desc', locale)}
          </p>

          {isPreview && (
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 bg-indigo-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
                <Eye className="w-3.5 h-3.5" />
                Modo Pré-visualização de Professor (sem atribuir XP)
              </span>
              <button
                onClick={() => {
                  setPreviewWeek(null);
                  setFeedback(null);
                  setSelectedOptionIndex(null);
                }}
                className="inline-flex items-center gap-1.5 bg-white text-amber-950 hover:bg-amber-50 text-xs font-black px-3 py-1.5 rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Voltar à Semana Atual
              </button>
            </div>
          )}
        </div>

        <div className="bg-white/95 rounded-3xl p-5 shadow-xs border border-amber-300/80 text-center min-w-[200px] shrink-0">
          <span className="text-[10px] font-black uppercase text-amber-800 block tracking-wider">
            Recompensa Semanal
          </span>
          <span className="text-3xl font-black text-amber-600">
            +{challenge?.xpReward || 30} XP
          </span>
          <div className="text-[11px] font-bold text-slate-600 mt-1">
            {isPreview
              ? 'Pré-visualização'
              : isChallengeCompleted
              ? 'Concluído esta semana ✓'
              : 'Disponível (1x por semana)'}
          </div>
          {challenge && !isPreview && (
            <div className="mt-2 pt-2 border-t border-amber-100 text-[11px] font-semibold text-amber-900 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>
                Próximo desafio em {challenge.daysUntilNextMonday}{' '}
                {challenge.daysUntilNextMonday === 1 ? 'dia' : 'dias'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Challenge Interactive Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              {challenge ? `Missão da Semana ${challenge.weekNumber}` : 'Missão da Semana'}
            </h3>
            {challenge?.category && (
              <span
                className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border ${worldStyle.bg} ${worldStyle.text} ${worldStyle.border}`}
              >
                {challenge.category}
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-900 bg-amber-100/90 px-3 py-1 rounded-full border border-amber-300/80 w-fit">
            Pistas destacadas a negrito para leitura rápida
          </span>
        </div>

        {loadingWeek || !challenge ? (
          <div className="py-10 text-center text-sm font-semibold text-slate-500">
            A carregar o desafio da semana...
          </div>
        ) : (
          <>
            {/* Dynamic Scenario Sample Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 font-sans max-w-3xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5 text-xs text-slate-600">
                <span className="font-extrabold text-slate-800 uppercase tracking-wide text-[11px]">
                  {challenge.scenarioLabel || 'Situação da Semana'}
                </span>
                {challenge.senderOrSource && (
                  <span className="font-mono text-[11px] font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {challenge.senderOrSource}
                  </span>
                )}
              </div>

              <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                <HighlightClues text={challenge.messageSample} variant="amber" />
              </p>

              {challenge.problem && (
                <div className="pt-2 border-t border-slate-200/70 flex items-start gap-2 text-xs text-slate-600">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-800">Pista de detetive:</strong> {challenge.problem}
                  </span>
                </div>
              )}
            </div>

            {/* Action Decision */}
            {isChallengeCompleted ? (
              <div className="space-y-3">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    Já resolveste com sucesso o desafio da Semana {challenge.weekNumber} (+{challenge.xpReward} XP adicionados ao teu perfil)! Na próxima segunda-feira chega um novo desafio.
                  </span>
                </div>
                {feedback?.text && (
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl text-xs sm:text-sm font-semibold text-emerald-900">
                    {feedback.text}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <span className="text-sm font-extrabold text-slate-800 block">
                  {challenge.task}
                </span>
                <div className="grid grid-cols-1 gap-3 max-w-3xl">
                  {challenge.options.map((opt, idx) => {
                    const isSelected = selectedOptionIndex === idx;
                    const letter = OPTION_LETTERS[idx] || String(idx + 1);
                    return (
                      <button
                        key={opt.id ?? idx}
                        onClick={() => handleWeeklySubmit(idx)}
                        disabled={submitting}
                        className={`text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 cursor-pointer disabled:opacity-60 ${
                          isSelected && feedback?.isCorrect
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                            : isSelected && feedback && !feedback.isCorrect
                            ? 'bg-rose-50 border-rose-400 text-rose-950'
                            : 'bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-slate-800'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected && feedback?.isCorrect
                              ? 'bg-emerald-600 text-white'
                              : isSelected && feedback && !feedback.isCorrect
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="text-xs sm:text-sm font-bold leading-relaxed">
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {feedback && (
                  <div
                    className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-start gap-2.5 max-w-3xl ${
                      feedback.isCorrect
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50 border-amber-300 text-amber-950'
                    }`}
                  >
                    {feedback.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p>{feedback.text}</p>
                      {!feedback.isCorrect && (
                        <p className="text-xs font-semibold text-amber-800 mt-1">
                          Tenta outra resposta — tu consegues!
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Annual 52-Week Calendar Section */}
      {annualProgress && fullSchedule.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Calendário Anual — 52 Desafios ({annualProgress.isoYear})
                </h3>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Há 1 desafio novo em cada uma das 52 semanas do ano, a rodar pelos 5 Mundos da Missão TIC!
                {isTeacher && (
                  <span className="font-bold text-indigo-700">
                    {' '}Como professor, carrega em qualquer semana para a pré-visualizar.
                  </span>
                )}
              </p>
            </div>

            {/* Annual Progress Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 min-w-[240px]">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-700 mb-1.5">
                <span>Progresso Anual</span>
                <span className="text-amber-700">
                  {annualCompletedCount} / {totalWeeks} semanas ({annualPct}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(annualPct, annualCompletedCount > 0 ? 4 : 0)}%` }}
                />
              </div>
            </div>
          </div>

          {/* World Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setWorldFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                  worldFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Todas as 52 semanas
              </button>
              {[1, 2, 3, 4, 5].map((wId) => {
                const style = WORLD_BADGE_STYLES[wId];
                const isActive = worldFilter === wId;
                return (
                  <button
                    key={wId}
                    onClick={() => setWorldFilter(wId)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-amber-950 border-amber-600'
                        : `${style.bg} ${style.text} ${style.border} hover:opacity-85`
                    }`}
                  >
                    Mundo {wId}
                  </button>
                );
              })}
            </div>

            {worldFilter === 'all' && (
              <button
                onClick={() => setShowAllWeeks((prev) => !prev)}
                className="text-xs font-extrabold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-xl border border-blue-200 transition-colors cursor-pointer"
              >
                {showAllWeeks
                  ? 'Mostrar apenas semanas próximas'
                  : `Ver todas as ${fullSchedule.length} semanas do ano`}
              </button>
            )}
          </div>

          {/* 52-Week Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {displayedSchedule.map((item) => {
              const wStyle = WORLD_BADGE_STYLES[item.worldId] || WORLD_BADGE_STYLES[1];
              const isSelectedPreview =
                isTeacher &&
                ((previewWeek !== null && previewWeek === item.weekNumber) ||
                  (previewWeek === null && item.isCurrent));

              return (
                <div
                  key={item.id}
                  onClick={() => isTeacher && handleSelectWeekPreview(item)}
                  className={`rounded-2xl p-4 border transition-all flex flex-col justify-between gap-2.5 ${
                    isTeacher ? 'cursor-pointer hover:shadow-sm' : ''
                  } ${
                    item.isCurrent
                      ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-300/70'
                      : item.completed
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : item.isFuture
                      ? 'bg-slate-50/70 border-slate-200/80'
                      : 'bg-white border-slate-200'
                  } ${isSelectedPreview && isTeacher ? 'ring-2 ring-indigo-500' : ''}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                          item.isCurrent
                            ? 'bg-amber-500 text-amber-950'
                            : item.completed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        S{String(item.weekNumber).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {item.dateRangeLabel}
                      </span>
                    </div>

                    <h4 className="text-xs font-extrabold text-slate-900 leading-snug line-clamp-2">
                      {item.title}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/70">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${wStyle.bg} ${wStyle.text} ${wStyle.border}`}
                    >
                      {wStyle.short}
                    </span>

                    {item.completed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Concluído
                      </span>
                    ) : item.isCurrent ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800">
                        <Flame className="w-3.5 h-3.5 text-amber-600" />
                        Esta semana
                      </span>
                    ) : item.isFuture ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <Lock className="w-3 h-3" />
                        Em breve
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">
                        Semana passada
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Class Ranking / Leaderboard Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {t('ranking_title', locale)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tabela da tua turma — só aparecem os nomes de jogo e os pontos XP!
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>A tua privacidade está protegida</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Posição</th>
                <th className="px-5 py-3">Aluno</th>
                <th className="px-5 py-3">Nível</th>
                <th className="px-5 py-3 text-right">XP Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ranking.map((s) => {
                let badge = null;
                if (s.position === 1) badge = <Crown className="w-4 h-4 text-amber-500 inline mr-1" />;
                if (s.position === 2) badge = <Medal className="w-4 h-4 text-slate-400 inline mr-1" />;
                if (s.position === 3) badge = <Medal className="w-4 h-4 text-amber-700 inline mr-1" />;

                return (
                  <tr
                    key={s.id}
                    className={`transition-colors ${
                      s.isCurrentUser
                        ? 'bg-blue-50/80 font-bold text-blue-950 border-l-4 border-blue-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-5 py-3.5 font-mono font-black text-sm">
                      {badge}#{s.position}
                    </td>
                    <td className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
                        <AvatarRenderer avatar={s.avatar} size={32} />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900">{s.nickname}</span>
                        {s.isCurrentUser && (
                          <span className="ml-2 text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">
                            Tu
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-600">
                      Nível {s.level} – {s.levelName}
                    </td>
                    <td className="px-5 py-3.5 text-right font-black text-blue-700 text-sm">
                      {s.xp} XP
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
