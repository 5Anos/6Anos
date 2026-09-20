import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Award,
  X,
  Sparkles,
} from 'lucide-react';
import { AssessmentQuestion, AssessmentSubmissionResult } from '../types';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';

interface AssessmentModalProps {
  worldId: number;
  worldTitle: string;
  onClose: () => void;
  onCompleted?: () => void;
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
  worldId,
  worldTitle,
  onClose,
  onCompleted,
}) => {
  const { user, locale, refreshUser } = useAuth();
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentSubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [worldId]);

  const fetchQuestions = async () => {
    try {
      const res = await apiRequest(`/api/pedagogical/assessments/${worldId}`);
      if (res && res.questions) {
        setQuestions(res.questions);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar avaliação.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (result) return; // already submitted
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length < questions.length) {
      setError(`Por favor responde a todas as ${questions.length} perguntas antes de submeter.`);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res: AssessmentSubmissionResult = await apiRequest(
        `/api/pedagogical/assessments/${worldId}`,
        {
          method: 'POST',
          body: JSON.stringify({ answers: selectedAnswers }),
        }
      );
      setResult(res);
      await refreshUser();
      if (onCompleted) onCompleted();
    } catch (err: any) {
      setError(err.message || 'Falha ao submeter avaliação.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">
              {worldTitle}
            </span>
            <h2 className="text-xl font-black">{t('final_assessment', locale)}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {loading ? (
            <div className="py-16 text-center text-slate-500 font-semibold">
              A carregar avaliação oficial...
            </div>
          ) : error && !result ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-semibold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : result ? (
            /* Results & Pedagogical Explanations */
            <div className="space-y-6">
              <div
                className={`p-6 rounded-3xl border text-center ${
                  result.passed
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <div className="inline-flex p-3 rounded-2xl bg-white shadow-xs mb-3">
                  {result.passed ? (
                    <Award className="w-10 h-10 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-10 h-10 text-amber-600" />
                  )}
                </div>
                <h3 className="text-2xl font-black">
                  {result.percentage}% de Acertos
                </h3>
                <p className="text-sm font-medium mt-1">
                  {result.passed
                    ? 'Parabéns! Cumpriste o requisito curricular (> 80%)!'
                    : 'Ainda não atingiste os 80%. Revê os conteúdos e tenta novamente para melhorar a tua pontuação!'}
                </p>
                {result.xpGain > 0 && (
                  <div className="mt-3 inline-block bg-blue-600 text-white font-extrabold text-xs px-4 py-1.5 rounded-full shadow-xs">
                    +{result.xpGain} XP Ganho! (Novo recorde: {result.newBest}%)
                  </div>
                )}
              </div>

              {/* Feedback per question */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Revisão Pedagógica de Respostas:
                </h4>
                {(result.resultsFeedback || (result as any).results || []).map((item: any, idx: number) => (
                  <div
                    key={item.id || idx}
                    className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                      item.isCorrect
                        ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                        : 'bg-rose-50/60 border-rose-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 font-bold mb-1.5">
                      {item.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <span>
                        {idx + 1}. {item.text}
                      </span>
                    </div>
                    <p className="text-slate-600 pl-6">
                      <strong className="text-slate-800 font-bold">Explicação: </strong>
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={onClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm px-6 py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  Concluir e Voltar
                </button>
              </div>
            </div>
          ) : (
            /* Active Question Form */
            <div className="space-y-6">
              {/* Progress Indicator */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>
                  Pergunta {currentIdx + 1} de {questions.length}
                </span>
                <span>
                  {Object.keys(selectedAnswers).length} de {questions.length} respondidas
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentIdx + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>

              {/* Question Text */}
              {currentQ && (
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mb-5">
                    {currentQ.text}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3">
                    {currentQ.options.map((option, oIdx) => {
                      const isSelected = selectedAnswers[currentQ.id] === oIdx;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleSelectOption(currentQ.id, oIdx)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs ring-2 ring-blue-500/20'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{option}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => prev - 1)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                {currentIdx < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIdx((prev) => prev + 1)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Seguinte</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{submitting ? 'A submeter...' : 'Submeter Avaliação'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
