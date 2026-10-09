import React, { useState } from 'react';
import {
  FileText,
  Award,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  MessageSquare,
  Sparkles,
  Layers,
  X,
  Send,
} from 'lucide-react';
import { apiRequest } from '../../api';

interface TeacherMissionsTabProps {
  missions: any[];
  classes: any[];
  onRefresh: () => void;
}

export const TeacherMissionsTab: React.FC<TeacherMissionsTabProps> = ({
  missions = [],
  classes = [],
  onRefresh,
}) => {
  const [selectedWorld, setSelectedWorld] = useState<number | 'all'>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'graded'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [gradingMission, setGradingMission] = useState<any | null>(null);
  const [score, setScore] = useState<number>(85);
  const [feedback, setFeedback] = useState<string>('');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  const missionList = Array.isArray(missions) ? missions : [];

  const filteredMissions = missionList.filter((m) => {
    if (selectedWorld !== 'all' && m.worldId !== selectedWorld) return false;
    if (selectedClass !== 'all' && m.classId !== selectedClass) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.studentName?.toLowerCase().includes(q);
      const matchTitle = m.title?.toLowerCase().includes(q);
      if (!matchName && !matchTitle) return false;
    }
    return true;
  });

  const pendingCount = missionList.filter((m) => m.status === 'pending').length;

  const handleOpenGradeModal = (m: any) => {
    setGradingMission(m);
    setScore(m.score || 85);
    setFeedback(m.feedback || 'Bom trabalho na aplicação prática dos conhecimentos de TIC!');
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingMission) return;
    try {
      setSubmittingGrade(true);
      await apiRequest(`/api/teacher/missions/${gradingMission.id}/grade`, {
        method: 'POST',
        body: JSON.stringify({ score, feedback }),
      });
      setGradingMission(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao guardar avaliação da missão.');
    } finally {
      setSubmittingGrade(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              Submissões de Missões Reais
            </h3>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                {pendingCount} pendentes
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Todas ({missionList.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Pendentes ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('graded')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'graded'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Avaliadas ({missionList.length - pendingCount})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <input
            type="text"
            placeholder="Pesquisar por aluno ou título..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-amber-500"
          />

          <select
            value={selectedWorld}
            onChange={(e) => setSelectedWorld(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todos os Mundos</option>
            <option value="1">Mundo 1: Guardião Digital</option>
            <option value="2">Mundo 2: Detetive da Informação</option>
            <option value="3">Mundo 3: Criador Digital</option>
            <option value="4">Mundo 4: Engenheiro de Algoritmos</option>
            <option value="5">Mundo 5: Cidadão da IA</option>
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todas as Turmas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>Turma {c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Missions Grid/List */}
      {filteredMissions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-2">
          <FileText className="w-8 h-8 mx-auto text-slate-300" />
          <p className="font-semibold text-slate-700">Nenhuma submissão de Missão Real encontrada.</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Quando os alunos realizarem e enviarem as suas missões práticas nos mundos, as propostas aparecerão aqui para validação docente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMissions.map((m) => {
            const isGraded = m.status === 'graded';
            return (
              <div
                key={m.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                      Mundo {m.worldId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isGraded
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {isGraded ? `Avaliado: ${m.score}/100` : 'Pendente de Avaliação'}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{m.title}</h4>
                  <div className="text-xs text-slate-600 mt-1">
                    Aluno: <strong>{m.studentName}</strong> • Turma {m.className}
                  </div>

                  {/* Submission text preview */}
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono line-clamp-3">
                    {m.submissionText || m.submission || m.content || '(Sem texto na submissão)'}
                  </div>

                  {isGraded && m.feedback && (
                    <div className="mt-2 text-xs text-slate-500 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                      Feedback: "{m.feedback}"
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {new Date(m.submittedAt || m.createdAt).toLocaleDateString('pt-PT')}
                  </span>
                  <button
                    onClick={() => handleOpenGradeModal(m)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>{isGraded ? 'Editar Nota / Feedback' : 'Avaliar Missão'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grading Modal */}
      {gradingMission && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-amber-800">
                  Avaliação Docente — Mundo {gradingMission.worldId}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {gradingMission.title}
                </h3>
                <div className="text-xs text-slate-500">
                  Aluno: <strong>{gradingMission.studentName}</strong> • Turma {gradingMission.className}
                </div>
              </div>
              <button
                onClick={() => setGradingMission(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submission Content */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Trabalho do Aluno:</label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 max-h-36 overflow-y-auto font-mono whitespace-pre-wrap">
                {gradingMission.submissionText || gradingMission.submission || gradingMission.content || 'Sem conteúdo.'}
              </div>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Classificação (0 a 100):</span>
                  <span className="font-mono text-amber-800 font-bold">{score} / 100</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Feedback Formativo:</label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Escreve uma apreciação pedagógica para o aluno..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingMission(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingGrade}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingGrade ? 'A guardar...' : 'Confirmar e Atribuir Nota'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
