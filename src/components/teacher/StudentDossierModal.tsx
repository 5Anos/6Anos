import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  BookOpen,
  CheckCircle2,
  Lock,
  Unlock,
  Key,
  RotateCcw,
  Trash2,
  AlertTriangle,
  History,
  Sparkles,
  ShieldCheck,
  FileText,
  Calendar,
  Layers,
  Save,
  Clock,
  Compass,
} from 'lucide-react';
import { apiRequest } from '../../api';

interface StudentDossierModalProps {
  studentId: string;
  classes: any[];
  onClose: () => void;
  onRefresh: () => void;
}

export const StudentDossierModal: React.FC<StudentDossierModalProps> = ({
  studentId,
  classes,
  onClose,
  onRefresh,
}) => {
  const [dossier, setDossier] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'worlds' | 'xp' | 'badges' | 'actions'>('overview');

  // Edit fields
  const [editNickname, setEditNickname] = useState('');
  const [editClassId, setEditClassId] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Password reset
  const [newPassword, setNewPassword] = useState('');
  const [requireChange, setRequireChange] = useState(true);
  const [resettingPwd, setResettingPwd] = useState(false);

  // Modals / confirmations
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadDossier();
  }, [studentId]);

  const loadDossier = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/api/teacher/students/${studentId}`);
      setDossier(res);
      setEditNickname(res.student.nickname);
      setEditClassId(res.student.classId || '');
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Erro ao carregar dossiê.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStudentData = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingEdit(true);
      await apiRequest(`/api/teacher/students/${studentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          nickname: editNickname,
          classId: editClassId,
        }),
      });
      setActionMessage({ type: 'success', text: 'Dados do aluno atualizados com sucesso.' });
      await loadDossier();
      onRefresh();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Erro ao atualizar dados.' });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }
    try {
      setResettingPwd(true);
      await apiRequest(`/api/teacher/students/${studentId}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({
          newPassword,
          requireChangeOnNextLogin: requireChange,
        }),
      });
      setActionMessage({ type: 'success', text: 'Palavra-passe redefinida com sucesso!' });
      setNewPassword('');
      await loadDossier();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Erro ao redefinir password.' });
    } finally {
      setResettingPwd(false);
    }
  };

  const handleToggleBlock = async () => {
    try {
      const res = await apiRequest(`/api/teacher/students/${studentId}/toggle-block`, {
        method: 'POST',
      });
      setActionMessage({
        type: 'success',
        text: res.blocked ? 'Aluno bloqueado.' : 'Aluno desbloqueado.',
      });
      await loadDossier();
      onRefresh();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Erro ao alterar bloqueio.' });
    }
  };

  const handleResetProgress = async () => {
    try {
      await apiRequest(`/api/teacher/students/${studentId}/reset-progress`, {
        method: 'POST',
      });
      setActionMessage({
        type: 'success',
        text: 'Progresso pedagógico do aluno reiniciado para o estado base (100 XP).',
      });
      setShowResetConfirm(false);
      await loadDossier();
      onRefresh();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Erro ao reiniciar progresso.' });
    }
  };

  const handleDeleteStudent = async () => {
    if (deleteConfirmText !== 'ELIMINAR') {
      alert('Por favor digita ELIMINAR para confirmar.');
      return;
    }
    try {
      await apiRequest(`/api/teacher/students/${studentId}`, {
        method: 'DELETE',
      });
      onRefresh();
      onClose();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Erro ao eliminar aluno.' });
    }
  };

  if (loading || !dossier) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">A carregar dossiê pedagógico do aluno...</p>
        </div>
      </div>
    );
  }

  const {
    student = {} as any,
    worldDetails = [],
    xpBreakdown = {} as any,
    badges = [],
    xpHistory = [],
    grandeMissao = {} as any,
  } = dossier || {};

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-950/90 border-b border-slate-800 p-6 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shrink-0">
              {student.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">{student.name}</h2>
                {student.blocked ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    <Lock className="w-3.5 h-3.5" />
                    Conta Bloqueada
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <Unlock className="w-3.5 h-3.5" />
                    Conta Ativa
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                @{student.nickname} • {student.email} • Turma {student.className}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Message Alert */}
        {actionMessage && (
          <div
            className={`px-6 py-3 border-b text-xs font-semibold flex items-center justify-between ${
              actionMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <span>{actionMessage.text}</span>
            <button
              onClick={() => setActionMessage(null)}
              className="text-slate-400 hover:text-white ml-4 text-xs font-bold"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-slate-900/50 border-b border-slate-800 px-6 flex overflow-x-auto gap-2 shrink-0">
          {[
            { id: 'overview', label: 'Boletim Pedagógico', icon: BookOpen },
            { id: 'worlds', label: 'Detalhe dos 5 Mundos', icon: Compass },
            { id: 'xp', label: 'Extrato de XP', icon: Sparkles },
            { id: 'badges', label: `Conquistas (${badges.length})`, icon: Award },
            { id: 'actions', label: 'Gestão da Conta', icon: Key },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: OVERVIEW / BOLETIM PEDAGÓGICO */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <div className="text-xs text-slate-400 font-semibold">XP Acumulado</div>
                  <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                    {student.xp} <span className="text-xs text-slate-500 font-normal">XP</span>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <div className="text-xs text-slate-400 font-semibold">Nível Atual</div>
                  <div className="text-xl font-black text-slate-100 mt-1">
                    Nível {student.level}
                  </div>
                  <div className="text-[11px] text-amber-400/80 font-medium">
                    {student.levelName}
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <div className="text-xs text-slate-400 font-semibold">Registo na Plataforma</div>
                  <div className="text-sm font-bold text-slate-200 mt-1">
                    {new Date(student.createdAt).toLocaleDateString('pt-PT')}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {student.lastLoginAt ? `Último login: ${new Date(student.lastLoginAt).toLocaleDateString('pt-PT')}` : 'Sem login recente'}
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <div className="text-xs text-slate-400 font-semibold">Grande Missão</div>
                  <div className="text-sm font-bold text-slate-200 mt-1">
                    {grandeMissao.status === 'completed'
                      ? 'Concluída'
                      : grandeMissao.status === 'in_progress'
                      ? `Etapa ${grandeMissao.currentStage} / 5`
                      : 'Não Iniciada'}
                  </div>
                  <div className="text-[11px] text-amber-400 font-semibold">
                    {grandeMissao.completedStages?.length || 0} de 5 etapas
                  </div>
                </div>
              </div>

              {/* Worlds Summary Cards */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Progresso e Médias por Mundo
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {worldDetails.map((w: any) => {
                    const isPassed = w.average > 80;
                    const isUnlocked = w.isUnlocked;

                    return (
                      <div
                        key={w.worldId}
                        className={`rounded-2xl border p-4 transition-all ${
                          isUnlocked
                            ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                            : 'bg-slate-950/40 border-slate-900 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-black text-amber-400">
                            MUNDO {w.worldId}
                          </span>
                          {isUnlocked ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              Aberto
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700">
                              Bloqueado
                            </span>
                          )}
                        </div>

                        <div className="text-xs font-bold text-slate-200 line-clamp-1 mb-2">
                          {w.title}
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-900 text-[11px]">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Média:</span>
                            <span
                              className={`font-mono font-bold ${
                                isPassed
                                  ? 'text-emerald-400'
                                  : w.average > 0
                                  ? 'text-rose-400'
                                  : 'text-slate-500'
                              }`}
                            >
                              {w.average > 0 ? `${w.average}%` : '—'}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Atividades:</span>
                            <span className="font-semibold text-slate-300">
                              {w.completedCount} / {w.totalComponents}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Missão Real:</span>
                            <span
                              className={`font-semibold ${
                                w.mission
                                  ? w.mission.status === 'graded'
                                    ? 'text-emerald-400'
                                    : 'text-amber-400'
                                  : 'text-slate-500'
                              }`}
                            >
                              {w.mission
                                ? w.mission.status === 'graded'
                                  ? `${w.mission.score}/100`
                                  : 'Pendente'
                                : 'Por entregar'}
                            </span>
                          </div>

                          <div className="pt-2">
                            <span
                              className={`block text-center text-[10px] font-bold px-2 py-1 rounded-lg border ${
                                isPassed
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                              }`}
                            >
                              {w.average > 80
                                ? 'MÉDIA > 80% (APROVADO)'
                                : 'MÉDIA ≤ 80% (BLOQUEADO)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETALHE DOS 5 MUNDOS */}
          {activeTab === 'worlds' && (
            <div className="space-y-6">
              {worldDetails.map((w: any) => (
                <div
                  key={w.worldId}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-400 font-black text-xs">
                          Mundo {w.worldId}
                        </span>
                        <h4 className="text-base font-bold text-white">{w.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{w.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Média do Mundo</div>
                        <div
                          className={`text-lg font-black font-mono ${
                            w.average > 80 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {w.average > 0 ? `${w.average}%` : '0%'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Components List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Simulators */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Simuladores & Atividades
                      </div>
                      <div className="space-y-1.5">
                        {w.simulators.map((sim: any) => (
                          <div
                            key={sim.id}
                            className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-semibold text-slate-200">{sim.title}</div>
                              <div className="text-[11px] text-slate-400">
                                {sim.attempts} {sim.attempts === 1 ? 'tentativa' : 'tentativas'}
                              </div>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                                sim.completed
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-500'
                              }`}
                            >
                              {sim.completed ? `${sim.bestScore}%` : 'Não concluído'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Assessments & Missions */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Avaliação & Missão Real
                      </div>

                      {/* Challenge */}
                      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-slate-200">
                            Desafio: {w.challenge.title}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {w.challenge.attempts} tentativas
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                            w.challenge.completed
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {w.challenge.completed ? `${w.challenge.bestScore} XP` : 'Pendente'}
                        </span>
                      </div>

                      {/* Real Mission */}
                      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-slate-200">
                            Missão Real: {w.mission ? w.mission.title : 'Missão Prática'}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                              w.mission && w.mission.status === 'graded'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : w.mission
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {w.mission
                              ? w.mission.status === 'graded'
                                ? `${w.mission.score}/100`
                                : 'Por Corrigir'
                              : 'Não Submetida'}
                          </span>
                        </div>
                        {w.mission?.feedback && (
                          <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-300 italic">
                            Feedback: "{w.mission.feedback}"
                          </div>
                        )}
                      </div>

                      {/* Final Assessment */}
                      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-slate-200">
                            Avaliação Final do Mundo {w.worldId} (8 Questões)
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                              w.assessments.length > 0 && w.assessments[0].percentage > 80
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : w.assessments.length > 0
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {w.assessments.length > 0
                              ? `${w.assessments[0].percentage}%`
                              : 'Não Realizada'}
                          </span>
                        </div>
                        {w.assessments.length > 0 && (
                          <div className="text-[11px] text-slate-400">
                            {w.assessments.length} tentativas efetuadas • Última em{' '}
                            {new Date(w.assessments[0].createdAt).toLocaleString('pt-PT')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: XP BREAKDOWN & HISTORY */}
          {activeTab === 'xp' && (
            <div className="space-y-6">
              {/* Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <div className="text-[11px] text-slate-400">XP Inicial</div>
                  <div className="text-lg font-bold text-slate-200 font-mono">
                    {xpBreakdown.initial} XP
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <div className="text-[11px] text-slate-400">Atividades & Simuladores</div>
                  <div className="text-lg font-bold text-amber-400 font-mono">
                    {xpBreakdown.activities} XP
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <div className="text-[11px] text-slate-400">Desafios</div>
                  <div className="text-lg font-bold text-amber-400 font-mono">
                    {xpBreakdown.challenges} XP
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <div className="text-[11px] text-slate-400">Avaliações Finais</div>
                  <div className="text-lg font-bold text-amber-400 font-mono">
                    {xpBreakdown.assessments} XP
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <div className="text-[11px] text-slate-400">Missões Reais</div>
                  <div className="text-lg font-bold text-amber-400 font-mono">
                    {xpBreakdown.missions} XP
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <div className="text-[11px] text-slate-400">Dica Rápida Diária</div>
                  <div className="text-lg font-bold text-amber-400 font-mono">
                    {xpBreakdown.dailyTips} XP
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <div className="text-[11px] text-slate-400">Grande Missão</div>
                  <div className="text-lg font-bold text-amber-400 font-mono">
                    {xpBreakdown.grandeMissao} XP
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                  <div className="text-[11px] text-amber-300 font-semibold">Total Geral</div>
                  <div className="text-lg font-black text-amber-400 font-mono">
                    {student.xp} XP
                  </div>
                </div>
              </div>

              {/* Transaction Logs */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-400" />
                  Histórico de Transações de XP
                </h4>

                {xpHistory.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    Ainda não existem transações registadas para este aluno.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {xpHistory.map((tx: any) => (
                      <div
                        key={tx.id}
                        className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-200">
                            Origem: <span className="text-amber-400 capitalize">{tx.sourceType.replace('_', ' ')}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {new Date(tx.createdAt).toLocaleString('pt-PT')}
                          </div>
                        </div>
                        <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                          +{tx.xpGain} XP
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: BADGES */}
          {activeTab === 'badges' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Emblemas Conquistados ({badges.length})
              </h4>

              {badges.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
                  <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Este aluno ainda não desbloqueou nenhum emblema.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {badges.map((b: any) => (
                    <div
                      key={b.id}
                      className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 shadow-md"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-100">{b.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{b.description}</div>
                        <div className="text-[10px] text-amber-400/80 font-mono mt-2">
                          {new Date(b.awardedAt).toLocaleDateString('pt-PT')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ACTIONS & SETTINGS */}
          {activeTab === 'actions' && (
            <div className="space-y-6 max-w-2xl">
              {/* Edit Details */}
              <form
                onSubmit={handleSaveStudentData}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4"
              >
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Alterar Dados do Aluno
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold">Nickname:</label>
                    <input
                      type="text"
                      value={editNickname}
                      onChange={(e) => setEditNickname(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold">Turma:</label>
                    <select
                      value={editClassId}
                      onChange={(e) => setEditClassId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Sem Turma</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          Turma {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingEdit ? 'A guardar...' : 'Guardar Alterações'}
                  </button>
                </div>
              </form>

              {/* Reset Password */}
              <form
                onSubmit={handleResetPassword}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4"
              >
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  Redefinir Palavra-passe
                </h4>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Nova Palavra-passe:</label>
                  <input
                    type="text"
                    placeholder="Mínimo 6 caracteres..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="requireChangeCheckbox"
                    checked={requireChange}
                    onChange={(e) => setRequireChange(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="requireChangeCheckbox" className="text-xs text-slate-300 font-medium">
                    Obrigar o aluno a alterar a palavra-passe no próximo início de sessão
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={resettingPwd}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-slate-700"
                  >
                    {resettingPwd ? 'A atualizar...' : 'Atualizar Palavra-passe'}
                  </button>
                </div>
              </form>

              {/* Dangerous / Administrative Actions */}
              <div className="bg-slate-950 border border-rose-500/20 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Ações Administrativas Especiais
                </h4>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleToggleBlock}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-colors ${
                      student.blocked
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                    }`}
                  >
                    {student.blocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    {student.blocked ? 'Desbloquear Acesso' : 'Bloquear Acesso'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(true)}
                    className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reiniciar Progresso Pedagógico
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar Aluno
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal: Confirm Reset Progress */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-white">Reiniciar Progresso do Aluno?</h3>
                <p className="text-xs text-slate-400">
                  Esta ação irá apagar todas as tentativas, notas de simuladores, avaliações finais e missões do aluno <strong>{student.name}</strong>, restaurando o XP base inicial para 100 XP.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleResetProgress}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl"
                >
                  Confirmar Reinicialização
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Confirm Delete Student */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-rose-600 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-white">Eliminar Conta Definitivamente?</h3>
                <p className="text-xs text-slate-400">
                  A conta do aluno <strong>{student.name}</strong> e todos os registos na nuvem serão eliminados permanentemente. Esta ação é irreversível.
                </p>
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-[11px] font-bold text-rose-300 uppercase">
                  Digita <span className="underline">ELIMINAR</span> para confirmar:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="ELIMINAR"
                  className="w-full bg-slate-950 border border-rose-500/50 rounded-xl px-3 py-2 text-sm text-rose-200 focus:outline-none font-mono text-center"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteStudent}
                  disabled={deleteConfirmText !== 'ELIMINAR'}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl"
                >
                  Eliminar Definitivamente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
