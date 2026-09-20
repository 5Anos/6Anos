import React, { useState, useEffect } from 'react';
import {
  FileText,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageSquare,
  AlertCircle,
  Award,
} from 'lucide-react';
import { WorldSummary } from '../types';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { PROGRESSION_CONFIG } from '../progressionConfig';

interface WorldMissionCardProps {
  world: WorldSummary;
  onRefreshWorld: () => Promise<void>;
}

export const WorldMissionCard: React.FC<WorldMissionCardProps> = ({
  world,
  onRefreshWorld,
}) => {
  const { user } = useAuth();
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mission = world.mission;
  const progress = world.missionProgress;

  useEffect(() => {
    // If there is existing submission text from backend progress, populate it
    if ((progress as any)?.submissionText) {
      setSubmissionText((progress as any).submissionText);
    }
  }, [progress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionText.trim() || !user) return;

    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await apiRequest(`/api/pedagogical/missions/${world.id}`, {
        method: 'POST',
        body: JSON.stringify({
          submission: submissionText.trim(),
          submissionText: submissionText.trim(),
        }),
      });

      setSuccessMessage(res.message || 'Missão submetida com sucesso! O teu professor irá avaliar.');
      await onRefreshWorld();
    } catch (err: any) {
      console.error('Error submitting mission:', err);
      setErrorMessage(err.message || 'Erro ao submeter a missão. Tenta novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mission) return null;

  const isGraded = progress?.status === 'graded';
  const isPending = progress?.status === 'pending';
  const isPassed = isGraded && (progress?.score || 0) >= PROGRESSION_CONFIG.PASSING_THRESHOLD;

  return (
    <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-blue-600 uppercase tracking-wider">
              Missão Prática do Mundo {world.id}
            </span>
            {isGraded ? (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isPassed
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Avaliada: {progress.score}/100
              </span>
            ) : isPending ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                <Clock className="w-3.5 h-3.5" />
                Em Avaliação pelo Professor
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                <FileText className="w-3.5 h-3.5" />
                Por Submeter
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {mission.title}
          </h3>
          <p className="text-sm text-slate-600 mt-1">{mission.description}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0 bg-blue-50 border border-blue-100 px-4 py-2 rounded-2xl">
          <Award className="w-5 h-5 text-blue-600" />
          <div>
            <div className="text-[10px] text-blue-600 font-bold uppercase">Recompensa</div>
            <div className="text-sm font-black text-blue-900 font-mono">
              +{mission.xpReward || 100} XP
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
        <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Instruções de Trabalho
        </h4>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {mission.instructions.map((inst, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
              <span>{inst}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Teacher Feedback (if graded) */}
      {isGraded && progress?.feedback && (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            Feedback do Professor
          </div>
          <p className="text-sm text-emerald-950 font-medium italic leading-relaxed">
            "{progress.feedback}"
          </p>
        </div>
      )}

      {/* Submission Form */}
      {user?.role === 'student' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              O Teu Trabalho / Resposta:
            </label>
            <textarea
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Escreve aqui o teu trabalho conforme as instruções da missão..."
              rows={6}
              disabled={isSubmitting}
              className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {submissionText.trim().length} carateres escritos
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !submissionText.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-sm px-6 py-3 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>A enviar...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {isPending || isGraded ? 'Atualizar Submissão' : 'Submeter ao Professor'}
                  </span>
                </>
              )}
            </button>
          </div>

          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </form>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-center">
          Modo Professor: As submissões dos alunos desta missão podem ser consultadas e avaliadas no separador "Missões Reais" da Área do Professor.
        </div>
      )}
    </div>
  );
};
