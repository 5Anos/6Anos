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
  TrendingUp,
  Minus,
  TrendingDown,
  RotateCcw,
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
  const [meta, setMeta] = useState<{
    attemptsCount: number;
    isFirstAttempt: boolean;
    attemptNumber: number;
    officialPercentage: number | null;
    officialMention: string | null;
    bestPercentage: number | null;
    bestMention: string | null;
  } | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [worldId]);

  const fetchQuestions = async () => {
    try {
      const res = await apiRequest(`/api/pedagogical/assessments/${worldId}`);
      if (res && res.questions) {
        setQuestions(res.questions);
        setMeta({
          attemptsCount: res.attemptsCount || 0,
          isFirstAttempt: res.isFirstAttempt ?? (res.attemptsCount === 0),
          attemptNumber: res.attemptNumber || (res.attemptsCount ? res.attemptsCount + 1 : 1),
          officialPercentage: res.officialPercentage ?? null,
          officialMention: res.officialMention ?? null,
          bestPercentage: res.bestPercentage ?? null,
          bestMention: res.bestMention ?? null,
        });
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
      setError(`Responde a todas as ${questions.length} perguntas antes de entregar.`);
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

  const getMentionBadgeColor = (mention: string) => {
    switch (mention) {
      case 'Muito Bom':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Bom':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Satisfaz':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Não Satisfaz':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Muito Fraco':
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  const getAttemptLabel = (attemptNumber: number) => {
    if (attemptNumber === 1) return 'Avaliação - Primeira tentativa';
    const ordinals: Record<number, string> = {
      2: 'Segunda tentativa',
      3: 'Terceira tentativa',
      4: 'Quarta tentativa',
      5: 'Quinta tentativa',
      6: 'Sexta tentativa',
      7: 'Sétima tentativa',
      8: 'Oitava tentativa',
      9: 'Nona tentativa',
      10: 'Décima tentativa',
    };
    return ordinals[attemptNumber] || `${attemptNumber}.ª tentativa`;
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">
                {worldTitle}
              </span>
              {meta && !result && (
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                  {meta.isFirstAttempt
                    ? 'Avaliação - Primeira tentativa'
                    : `${getAttemptLabel(meta.attemptNumber)} (Treino)`}
                </span>
              )}
            </div>
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
              A preparar o teu quiz...
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
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50/70 border-amber-200 text-amber-950'
                }`}
              >
                <div className="inline-flex p-3 rounded-2xl bg-white shadow-xs mb-3">
                  {result.passed ? (
                    <Award className="w-10 h-10 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-10 h-10 text-amber-600" />
                  )}
                </div>

                {/* Attempt Mode Badge */}
                <div className="mb-3">
                  {result.isFirstAttempt ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-600 text-white shadow-xs">
                      <Award className="w-3.5 h-3.5" />
                      Avaliação - Primeira tentativa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-slate-800 text-white shadow-xs">
                      <RotateCcw className="w-3.5 h-3.5" />
                      {getAttemptLabel(result.attemptNumber)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2 mb-4">
                  <div
                    className={`inline-block px-5 py-2 rounded-2xl border text-xl font-black shadow-xs ${getMentionBadgeColor(
                      result.mention
                    )}`}
                  >
                    Menção: {result.mention}
                  </div>
                  <div className="text-xs font-semibold text-slate-600">
                    {result.passed
                      ? 'Parabéns! Passaste no quiz do mundo!'
                      : 'Ainda não passaste desta vez. Podes voltar a treinar para melhorar!'}
                  </div>
                </div>

                {/* Top Summary Cards (No percentages — only qualitative grade, right answers & XP) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Respostas Certas</span>
                    <span className="text-xl font-black text-slate-900 mt-0.5 block">
                      {result.correctCount} / {result.totalQuestions}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Nota Final</span>
                    <span className="text-base font-black text-blue-700 mt-1 block truncate">
                      {result.mention}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">XP</span>
                    <span className="text-xl font-black mt-0.5 block text-amber-700">
                      {result.totalXp ?? user?.xp ?? 0} XP
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 block -mt-0.5">
                      Já acumulado
                    </span>
                  </div>
                </div>

                {/* Sequential Attempts List (Qualitative mentions only — NO percentages) */}
                {!result.isFirstAttempt && (() => {
                  const historyList =
                    result.attemptsHistory && result.attemptsHistory.length > 0
                      ? result.attemptsHistory
                      : [
                          {
                            attemptNumber: 1,
                            mention: result.officialMention || '—',
                          },
                          {
                            attemptNumber: result.attemptNumber,
                            mention: result.mention,
                          },
                        ];

                  return (
                    <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200 text-left space-y-3">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Histórico de tentativas:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {historyList.map((att) => {
                          const isOfficial = att.attemptNumber === 1;
                          const isCurrent = att.attemptNumber === result.attemptNumber;
                          return (
                            <div
                              key={att.attemptNumber}
                              className={`p-3.5 rounded-xl border ${
                                isOfficial
                                  ? 'bg-blue-50/70 border-blue-200'
                                  : isCurrent
                                  ? 'bg-emerald-50/70 border-emerald-200'
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <span
                                className={`text-[10px] font-black uppercase block tracking-wide ${
                                  isOfficial
                                    ? 'text-blue-800'
                                    : isCurrent
                                    ? 'text-emerald-800'
                                    : 'text-slate-600'
                                }`}
                              >
                                {getAttemptLabel(att.attemptNumber)}
                              </span>
                              <span
                                className={`text-base font-black block mt-1.5 ${
                                  isOfficial
                                    ? 'text-blue-900'
                                    : isCurrent
                                    ? 'text-emerald-900'
                                    : 'text-slate-800'
                                }`}
                              >
                                {att.mention}
                              </span>
                              <span
                                className={`text-[10px] block mt-1 font-medium ${
                                  isOfficial
                                    ? 'text-blue-600'
                                    : isCurrent
                                    ? 'text-emerald-700'
                                    : 'text-slate-500'
                                }`}
                              >
                                {isOfficial ? 'Registada na pauta' : 'Sessão de treino'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Evolution note for training attempts */}
                {!result.isFirstAttempt && result.evolution && (
                  <div className="mt-3 p-3 rounded-xl bg-white/80 border border-slate-200 text-xs text-slate-700 flex items-center justify-center gap-2 font-medium">
                    {result.evolution === 'improved' && (
                      <>
                        <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          <strong>Evolução:</strong> Melhoraste em relação à tentativa anterior! Muito bem!
                        </span>
                      </>
                    )}
                    {result.evolution === 'maintained' && (
                      <>
                        <Minus className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>
                          <strong>Evolução:</strong> Tiveste o mesmo resultado da última vez. Continua a praticar!
                        </span>
                      </>
                    )}
                    {result.evolution === 'regressed' && (
                      <>
                        <TrendingDown className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          <strong>Evolução:</strong> Relê as missões com calma para voltares a subir a tua nota!
                        </span>
                      </>
                    )}
                  </div>
                )}

                <p className="text-xs font-medium text-slate-600 mt-3 max-w-lg mx-auto">
                  {result.isFirstAttempt
                    ? 'A tua Avaliação - Primeira tentativa fica guardada na pauta da Professora.'
                    : `A tua Avaliação - Primeira tentativa continua guardada (${result.officialMention || 'registada'}). Esta tentativa serviu para treinares e aprenderes ainda mais!`}
                </p>
              </div>

              {/* Feedback per question */}
              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Confere as tuas respostas:
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

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setResult(null);
                    setSelectedAnswers({});
                    setCurrentIdx(0);
                    fetchQuestions();
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Treinar Novamente</span>
                </button>

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
                    <span>{submitting ? 'A entregar...' : 'Entregar Respostas'}</span>
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
