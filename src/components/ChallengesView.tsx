import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Flame,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Medal,
  Award,
  Crown,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { RankingStudent, WeeklyChallengeData } from '../types';
import { t } from '../i18n';
import { AvatarRenderer } from './avatar/AvatarRenderer';

interface ChallengesViewProps {
  onOpenSimulators?: () => void;
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({ onOpenSimulators }) => {
  const { user, locale, refreshUser } = useAuth();
  const [ranking, setRanking] = useState<RankingStudent[]>([]);
  const [weeklyChallenge, setWeeklyChallenge] = useState<WeeklyChallengeData | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [rankRes, chalRes] = await Promise.all([
        apiRequest('/api/pedagogical/class-ranking'),
        apiRequest('/api/pedagogical/weekly-challenge'),
      ]);
      setRanking(rankRes.ranking || []);
      setWeeklyChallenge(chalRes);
    } catch (err) {
      console.error('Failed to load challenges data:', err);
    }
  };

  const handleWeeklySubmit = async (option: string) => {
    if (!weeklyChallenge || weeklyChallenge.alreadyCompleted || submitting) return;
    setSelectedAnswer(option);
    setSubmitting(true);
    try {
      const isPhishing = option === 'phishing';
      const res = await apiRequest('/api/pedagogical/weekly-challenge', {
        method: 'POST',
        body: JSON.stringify({ isPhishing }),
      });
      setFeedback(res.feedback || res.message);
      await loadData();
      await refreshUser();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 text-center shadow-sm">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Desafios Bloqueados — Registo Obrigatório
        </h2>
        <p className="text-sm text-slate-600 font-medium max-w-md mx-auto mb-6 leading-relaxed">
          Para participar nos desafios semanais e figurar no ranking da turma, é necessário ter conta e iniciar sessão na plataforma.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Weekly Challenge Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 rounded-3xl p-6 sm:p-8 shadow-md text-amber-950 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="bg-amber-950 text-amber-100 text-xs font-black px-2.5 py-0.5 rounded-md uppercase">
              Semana em Curso
            </span>
            <span className="text-xs font-extrabold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-950" /> Dificuldade Média
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t('weekly_challenge_title', locale)}
          </h2>
          <p className="text-xs sm:text-sm font-semibold opacity-90 leading-relaxed">
            {t('weekly_challenge_desc', locale)}
          </p>
        </div>

        <div className="bg-white/90 rounded-3xl p-5 shadow-xs border border-amber-300/80 text-center min-w-[180px] shrink-0">
          <span className="text-[10px] font-black uppercase text-amber-800 block">Recompensa</span>
          <span className="text-3xl font-black text-amber-600">+50 XP</span>
          <div className="text-[11px] font-bold text-slate-500 mt-1">
            {weeklyChallenge?.alreadyCompleted ? 'Completado ✓' : 'Disponível'}
          </div>
        </div>
      </div>

      {/* Challenge Interactive Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-base font-extrabold text-slate-900">
          Cenário de Investigação da Semana
        </h3>

        {/* Mock Message Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 font-sans max-w-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs text-slate-600">
            <span className="font-bold text-slate-800">
              Remetente: <span className="font-mono text-slate-600">premio-instantaneo@sorteios-rapid0s.xyz</span>
            </span>
            <span className="text-rose-600 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Urgente
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
            “Parabéns! Foste selecionado para receber uma consola de videojogos de última geração! Para receberes o prémio na tua morada em 24 horas, clica no link abaixo e introduz o teu email e a tua palavra-passe da escola.”
          </p>
          <div className="font-mono text-xs text-blue-600 bg-blue-50/80 p-2 rounded-lg break-all">
            http://sorteios-rapid0s.xyz/reclamar-consola?aluno=6ano
          </div>
        </div>

        {/* Action Decision */}
        {weeklyChallenge?.alreadyCompleted ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-950 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Já resolveste com sucesso o desafio desta semana (+50 XP adicionados ao teu perfil)!</span>
          </div>
        ) : (
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-700 block">
              Qual é a tua avaliação pericial desta mensagem?
            </span>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleWeeklySubmit('phishing')}
                disabled={submitting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>É Phishing e Tentativa de Roubo de Dados!</span>
              </button>
              <button
                onClick={() => handleWeeklySubmit('safe')}
                disabled={submitting}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-6 py-3 rounded-2xl transition-colors"
              >
                É Uma Mensagem Segura e Real
              </button>
            </div>
            {feedback && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-900">
                {feedback}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Class Ranking / Leaderboard Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {t('ranking_title', locale)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tabela de honra privada da turma 6.º A. Apenas nicknames e XP são visíveis!
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Privacidade e RGPD Respeitados</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Posição</th>
                <th className="px-5 py-3">Aluno</th>
                <th className="px-5 py-3">Nível Curricular</th>
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
