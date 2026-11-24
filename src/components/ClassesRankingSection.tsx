import React, { useMemo, useState } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  ShieldCheck,
  Flame,
  Sparkles,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';
import { ClassLeaderboardEntry } from '../types';
import { AvatarRenderer } from './avatar/AvatarRenderer';

type ClassSortMode = 'averageXp' | 'weeklyChallenges' | 'totalXp';

interface ClassesRankingSectionProps {
  classesRanking: ClassLeaderboardEntry[];
  loading?: boolean;
  currentWeekNumber?: number;
}

export const ClassesRankingSection: React.FC<ClassesRankingSectionProps> = ({
  classesRanking,
  loading = false,
  currentWeekNumber,
}) => {
  const [sortMode, setSortMode] = useState<ClassSortMode>('averageXp');
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);

  const sortedClasses = useMemo(() => {
    const copy = [...classesRanking];
    copy.sort((a, b) => {
      if (sortMode === 'weeklyChallenges') {
        if (b.weeklyChallengesCompleted !== a.weeklyChallengesCompleted) {
          return b.weeklyChallengesCompleted - a.weeklyChallengesCompleted;
        }
        if (b.currentWeekParticipationPct !== a.currentWeekParticipationPct) {
          return b.currentWeekParticipationPct - a.currentWeekParticipationPct;
        }
        if (b.averageXp !== a.averageXp) return b.averageXp - a.averageXp;
      } else if (sortMode === 'totalXp') {
        if (b.totalXp !== a.totalXp) return b.totalXp - a.totalXp;
        if (b.averageXp !== a.averageXp) return b.averageXp - a.averageXp;
      } else {
        if (b.averageXp !== a.averageXp) return b.averageXp - a.averageXp;
        if (b.weeklyChallengesCompleted !== a.weeklyChallengesCompleted) {
          return b.weeklyChallengesCompleted - a.weeklyChallengesCompleted;
        }
        if (b.averageScorePct !== a.averageScorePct) return b.averageScorePct - a.averageScorePct;
        if (b.totalXp !== a.totalXp) return b.totalXp - a.totalXp;
      }
      return a.className.localeCompare(b.className, 'pt');
    });
    return copy.map((cls, idx) => ({ ...cls, displayPosition: idx + 1 }));
  }, [classesRanking, sortMode]);

  const topThree = sortedClasses.slice(0, 3);

  const getPrimaryMetricDisplay = (cls: ClassLeaderboardEntry) => {
    if (sortMode === 'weeklyChallenges') {
      return {
        value: `${cls.weeklyChallengesCompleted}`,
        label: cls.weeklyChallengesCompleted === 1 ? 'desafio semanal' : 'desafios semanais',
      };
    }
    if (sortMode === 'totalXp') {
      return {
        value: `${cls.totalXp.toLocaleString('pt-PT')} XP`,
        label: 'XP total da turma',
      };
    }
    return {
      value: `${cls.averageXp} XP`,
      label: 'média por aluno',
    };
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-xs font-semibold text-slate-500">
        A calcular o Ranking das Turmas...
      </div>
    );
  }

  if (sortedClasses.length === 0) {
    return (
      <div className="py-12 text-center space-y-2">
        <Trophy className="w-10 h-10 text-amber-400 mx-auto" />
        <p className="text-sm font-bold text-slate-700">
          Ainda não existem turmas ativas no ranking.
        </p>
        <p className="text-xs text-slate-500">
          Assim que as turmas e alunos começarem a completar desafios e atividades, a classificação aparece aqui!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Sort Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-lg">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              Campeonato entre Turmas
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Só nicknames anónimos
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Soma todas as pontuações de cada turma: desafios semanais, simuladores, quizzes, missões e Grande Missão!
          </p>
        </div>

        {/* Sort Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit">
          <button
            type="button"
            onClick={() => setSortMode('averageXp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              sortMode === 'averageXp'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Média XP / Aluno
          </button>
          <button
            type="button"
            onClick={() => setSortMode('weeklyChallenges')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
              sortMode === 'weeklyChallenges'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Desafios Semanais
          </button>
          <button
            type="button"
            onClick={() => setSortMode('totalXp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              sortMode === 'totalXp'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            XP Total
          </button>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topThree.map((cls) => {
          const metric = getPrimaryMetricDisplay(cls);
          const isFirst = cls.displayPosition === 1;
          const isSecond = cls.displayPosition === 2;

          const cardTheme = isFirst
            ? 'bg-gradient-to-br from-amber-50 via-yellow-50/80 to-white border-amber-300 ring-1 ring-amber-200/80'
            : isSecond
            ? 'bg-gradient-to-br from-slate-50 via-slate-50/70 to-white border-slate-300'
            : 'bg-gradient-to-br from-orange-50/70 via-amber-50/30 to-white border-orange-200';

          const badgeTheme = isFirst
            ? 'bg-amber-500 text-amber-950'
            : isSecond
            ? 'bg-slate-600 text-white'
            : 'bg-orange-700 text-white';

          const topMember = cls.topContributors[0];

          return (
            <div
              key={cls.classId}
              onClick={() =>
                setExpandedClassId((prev) => (prev === cls.classId ? null : cls.classId))
              }
              className={`rounded-3xl border p-5 shadow-xs transition-all hover:shadow-md cursor-pointer flex flex-col justify-between gap-4 ${cardTheme}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-xl ${badgeTheme}`}
                  >
                    {isFirst ? (
                      <Crown className="w-3.5 h-3.5" />
                    ) : (
                      <Medal className="w-3.5 h-3.5" />
                    )}
                    {cls.displayPosition}.º Lugar
                  </span>
                  {cls.isUserClass && (
                    <span className="text-[10px] font-black bg-blue-600 text-white px-2.5 py-0.5 rounded-full">
                      A tua turma
                    </span>
                  )}
                </div>

                <div className="flex items-end justify-between gap-2">
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                      Turma {cls.className}
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {cls.activeStudentsCount}/{cls.studentCount} alunos ativos
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-blue-700 block leading-none">
                      {metric.value}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">{metric.label}</span>
                  </div>
                </div>

                {/* Key Breakdown Pills */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/70">
                  <div className="bg-white/90 rounded-xl p-2 border border-slate-200/70 text-center">
                    <span className="text-xs font-black text-amber-700 block">
                      {cls.weeklyChallengesCompleted}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Desafios</span>
                  </div>
                  <div className="bg-white/90 rounded-xl p-2 border border-slate-200/70 text-center">
                    <span className="text-xs font-black text-emerald-700 block">
                      {cls.averageScorePct}%
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Média</span>
                  </div>
                  <div className="bg-white/90 rounded-xl p-2 border border-slate-200/70 text-center">
                    <span className="text-xs font-black text-slate-800 block">
                      {cls.totalXp}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">XP Total</span>
                  </div>
                </div>
              </div>

              {/* Top Nickname Highlight (STRICTLY NICKNAME ONLY) */}
              {topMember ? (
                <div className="flex items-center justify-between gap-2 bg-white/90 rounded-2xl px-3 py-2 border border-slate-200/80">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-slate-200">
                      <AvatarRenderer avatar={topMember.avatar} size={28} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase text-slate-400 block leading-none">
                        Destaque da Turma
                      </span>
                      <span className="text-xs font-extrabold text-slate-800 truncate block">
                        {topMember.nickname}
                        {topMember.isCurrentUser ? ' (Tu)' : ''}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-black text-blue-700 shrink-0">
                    {topMember.xp} XP
                  </span>
                </div>
              ) : (
                <div className="text-[11px] font-semibold text-slate-400 text-center py-2 bg-white/60 rounded-2xl border border-dashed border-slate-200">
                  Sem pontuação registada ainda
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Full Inter-Class Table */}
      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Posição</th>
              <th className="px-4 py-3">Turma</th>
              <th className="px-4 py-3">Desafios Semanais</th>
              <th className="px-4 py-3">Missões &amp; Quizzes</th>
              <th className="px-4 py-3">Média Turma</th>
              <th className="px-4 py-3 text-right">XP Total</th>
              <th className="px-4 py-3 text-right">Média XP / Aluno</th>
              <th className="px-4 py-3 text-right">Destaques</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedClasses.map((cls) => {
              const isExpanded = expandedClassId === cls.classId;
              const pos = cls.displayPosition;
              let badge = null;
              if (pos === 1) badge = <Crown className="w-4 h-4 text-amber-500 inline mr-1" />;
              if (pos === 2) badge = <Medal className="w-4 h-4 text-slate-400 inline mr-1" />;
              if (pos === 3) badge = <Medal className="w-4 h-4 text-amber-700 inline mr-1" />;

              return (
                <React.Fragment key={cls.classId}>
                  <tr
                    onClick={() => setExpandedClassId(isExpanded ? null : cls.classId)}
                    className={`transition-colors cursor-pointer ${
                      cls.isUserClass
                        ? 'bg-blue-50/70 hover:bg-blue-50 border-l-4 border-blue-600'
                        : isExpanded
                        ? 'bg-slate-50/90'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-4 py-3.5 font-mono font-black text-sm whitespace-nowrap">
                      {badge}#{pos}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">
                          Turma {cls.className}
                        </span>
                        {cls.isUserClass && (
                          <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">
                            A tua turma
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        <Users className="w-3 h-3 inline mr-1 -mt-0.5" />
                        {cls.activeStudentsCount}/{cls.studentCount} alunos ativos
                      </span>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-extrabold text-amber-800 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        {cls.weeklyChallengesCompleted} concluídos
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 block">
                        {currentWeekNumber ? `Sem. ${currentWeekNumber}: ` : 'Esta semana: '}
                        {cls.currentWeekCompletedCount}/{cls.studentCount} ({cls.currentWeekParticipationPct}%)
                      </span>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-bold text-slate-800">
                        {cls.activitiesCompleted + cls.quizzesCompleted + cls.missionsCompleted} concluídas
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 block">
                        {cls.activitiesCompleted} simul. • {cls.quizzesCompleted} quizzes
                        {cls.missionsCompleted > 0 ? ` • ${cls.missionsCompleted} missões` : ''}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-lg ${
                          cls.averageScorePct >= 70
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : cls.averageScorePct >= 50
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        {cls.averageScorePct}%
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right font-extrabold text-slate-700 whitespace-nowrap">
                      {cls.totalXp.toLocaleString('pt-PT')} XP
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <span className="inline-block font-black text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-xl text-sm">
                        {cls.averageXp} XP
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {cls.topContributors.slice(0, 3).map((m) => (
                            <div
                              key={m.id}
                              title={`${m.nickname} (${m.xp} XP)`}
                              className="w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-2xs bg-white"
                            >
                              <AvatarRenderer avatar={m.avatar} size={28} />
                            </div>
                          ))}
                        </div>
                        <span className="text-slate-400">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Nickname-Only Class Squad Panel */}
                  {isExpanded && (
                    <tr className="bg-slate-50/70">
                      <td colSpan={8} className="px-4 sm:px-6 py-4">
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-blue-600" />
                              <h5 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                                Equipa da Turma {cls.className} — Apenas Nicknames Anónimos
                              </h5>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500">
                              Por privacidade (RGPD), apenas os nicknames de jogo são apresentados.
                            </span>
                          </div>

                          {cls.members.length === 0 ? (
                            <p className="text-xs font-semibold text-slate-500 py-2">
                              Ainda não existem alunos nesta turma.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                              {cls.members.map((member, mIdx) => (
                                <div
                                  key={member.id}
                                  className={`flex items-center justify-between gap-2.5 p-2.5 rounded-2xl border ${
                                    member.isCurrentUser
                                      ? 'bg-blue-50 border-blue-300'
                                      : 'bg-white border-slate-200/80'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="font-mono text-[11px] font-black text-slate-400 w-5 text-center shrink-0">
                                      #{mIdx + 1}
                                    </span>
                                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200">
                                      <AvatarRenderer avatar={member.avatar} size={32} />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-extrabold text-slate-900 truncate">
                                          {member.nickname}
                                        </span>
                                        {member.isCurrentUser && (
                                          <span className="text-[9px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded-full shrink-0">
                                            Tu
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-2">
                                        <span>Nível {member.level}</span>
                                        {member.weeklyChallengesCount > 0 && (
                                          <span className="inline-flex items-center gap-0.5 text-amber-700 font-bold">
                                            <CheckCircle2 className="w-3 h-3" />
                                            {member.weeklyChallengesCount} des.
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-1 rounded-lg shrink-0">
                                    {member.xp} XP
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-slate-500 font-medium bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <span>
          <strong>Como funciona:</strong> A classificação geral usa a <strong>Média de XP por Aluno</strong> para ser justa entre turmas de tamanhos diferentes, contemplando todos os desafios semanais, simuladores, quizzes, missões e dicas diárias.
        </span>
        <span className="font-bold text-blue-700">
          Clica numa turma para ver os nicknames da equipa!
        </span>
      </div>
    </div>
  );
};
