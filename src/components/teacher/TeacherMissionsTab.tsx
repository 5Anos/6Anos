import React, { useState } from 'react';
import {
  FileText,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Award,
  X,
  Save,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { apiRequest } from '../../api';

interface TeacherMissionsTabProps {
  missions: any[];
  classes: any[];
  selectedClass: string;
  setSelectedClass: (val: string) => void;
  onRefresh: () => void;
}

export const TeacherMissionsTab: React.FC<TeacherMissionsTabProps> = ({
  missions = [],
  classes = [],
  selectedClass,
  setSelectedClass,
  onRefresh,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'graded'>('pending');
  const [worldFilter, setWorldFilter] = useState<number | 'all'>('all');
  const [gradingMission, setGradingMission] = useState<any | null>(null);
  const [score, setScore] = useState<number>(85);
  const [feedback, setFeedback] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const missionList = Array.isArray(missions) ? missions : [];
  const classList = Array.isArray(classes) ? classes : [];

  const filteredMissions = missionList.filter((m) => {
    const matchesClass = selectedClass === 'all' || m.classId === selectedClass;
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchesWorld = worldFilter === 'all' || m.worldId === worldFilter;
    return matchesClass && matchesStatus && matchesWorld;
  });

  const pendingCount = missionList.filter((m) => m.status === 'pending').length;

  const handleOpenGrade = (m: any) => {
    setGradingMission(m);
    setScore(m.score || 85);
    setFeedback(m.feedback || '');
    setErrorMsg(null);
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingMission) return;
    if (score < 0 || score > 100) {
      alert('A pontuação deve estar entre 0 e 100.');
      return;
    }

    try {
      setSubmitting(true);
      await apiRequest(`/api/teacher/missions/${gradingMission.id}/grade`, {
        method: 'POST',
        body: JSON.stringify({
          score: Number(score),
          feedback: feedback.trim(),
        }),
      });
      setGradingMission(null);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao gravar classificação.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        {/* Status switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pendentes ({pendingCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('graded')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'graded'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Já Corrigidas</span>
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({missions.length})
          </button>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={worldFilter}
              onChange={(e) =>
                setWorldFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              aria-label="Filtrar por mundo nas missões"
              className="bg-transparent text-slate-800 text-xs focus:outline-none cursor-pointer pr-2"
            >
              <option value="all" className="bg-white text-slate-800">Todos os Mundos</option>
              <option value="1" className="bg-white text-slate-800">Mundo 1: Segurança</option>
              <option value="2" className="bg-white text-slate-800">Mundo 2: Computadores</option>
              <option value="3" className="bg-white text-slate-800">Mundo 3: Algoritmos</option>
              <option value="4" className="bg-white text-slate-800">Mundo 4: IA</option>
              <option value="5" className="bg-white text-slate-800">Mundo 5: Cidadania</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              aria-label="Filtrar por turma nas missões"
              className="bg-transparent text-slate-800 text-xs focus:outline-none cursor-pointer pr-2"
            >
              <option value="all" className="bg-white text-slate-800">Todas as Turmas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-slate-800">
                  Turma {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Missions Grid/List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMissions.length === 0 ? (
          <div className="col-span-2 bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 shadow-xs">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="font-semibold text-slate-700">Nenhuma submissão de Missão Real encontrada.</p>
            <p className="text-xs text-slate-500 mt-1">
              Quando os alunos realizarem e enviarem as suas missões práticas nos mundos, as propostas aparecerão aqui para validação docente.
            </p>
          </div>
        ) : (
          filteredMissions.map((m) => {
            const isGraded = m.status === 'graded';

            return (
              <div
                key={m.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-black text-[11px]">
                          Mundo {m.worldId}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          Turma {m.className || 'Sem Turma'}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">{m.title}</h4>
                    </div>

                    {isGraded ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {m.score}/100
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3.5 h-3.5" />
                        Por Corrigir
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-700 font-medium">
                    Aluno: <strong className="text-slate-900">{m.studentName}</strong> <span className="text-slate-400">(@{m.studentNickname})</span>
                  </div>

                  {/* Submission text preview */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 max-h-32 overflow-y-auto whitespace-pre-wrap font-sans leading-relaxed">
                    {m.submissionText || m.content || '(Sem texto na submissão)'}
                  </div>

                  {isGraded && m.feedback && (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>Feedback: "{m.feedback}"</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <span>Enviado a {new Date(m.submittedAt).toLocaleDateString('pt-PT')}</span>

                  <button
                    onClick={() => handleOpenGrade(m)}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <span>{isGraded ? 'Editar Nota / Feedback' : 'Avaliar Missão'}</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Grading Modal */}
      {gradingMission && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase">
                  Avaliação Docente — Mundo {gradingMission.worldId}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {gradingMission.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aluno: <strong>{gradingMission.studentName}</strong> • Turma {gradingMission.className}
                </p>
              </div>

              <button
                onClick={() => setGradingMission(null)}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {errorMsg}
              </div>
            )}

            {/* Submission Content */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Resposta / Trabalho do Aluno:
              </label>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {gradingMission.submissionText || gradingMission.content || 'Sem conteúdo.'}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Nota (0 a 100):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono font-bold text-amber-700 focus:outline-none focus:border-amber-500"
                  />
                  <div className="text-[10px] text-slate-500">
                    {score > 80 ? '✓ Aprovado (>80%)' : '✗ Insuficiente (≤80%)'}
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Feedback Pedagógico para o Aluno:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Escreve uma mensagem de orientação, pontos fortes ou sugestões de melhoria..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingMission(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  {submitting ? 'A gravar...' : 'Gravar Classificação & Atribuir XP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
