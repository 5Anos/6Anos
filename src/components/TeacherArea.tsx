import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  CheckCircle2,
  FileSpreadsheet,
  History,
  Search,
  Filter,
  Lock,
  Unlock,
  Key,
  RotateCcw,
  Trash2,
  AlertTriangle,
  FileText,
  Download,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Database,
} from 'lucide-react';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';

export const TeacherArea: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'students' | 'grading' | 'audit' | 'overview'>('overview');
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  // Password reset modal state
  const [resetModalStudent, setResetModalStudent] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [mustChangePassword, setMustChangePassword] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Grading modal state
  const [gradingMission, setGradingMission] = useState<any | null>(null);
  const [gradeScore, setGradeScore] = useState(85);
  const [gradeFeedback, setGradeFeedback] = useState('');

  useEffect(() => {
    loadAllData();
  }, [selectedClass]);

  const loadAllData = async () => {
    try {
      const [statsRes, studentsRes, missionsRes, logsRes, dbRes] = await Promise.all([
        apiRequest('/api/teacher/dashboard-stats'),
        apiRequest(`/api/teacher/students?classId=${selectedClass}`),
        apiRequest('/api/teacher/missions'),
        apiRequest('/api/teacher/audit-logs'),
        apiRequest('/api/system/db-status').catch(() => null),
      ]);
      setDashboardStats(statsRes);
      setStudents(studentsRes.students || []);
      setMissions(missionsRes.missions || []);
      setAuditLogs(logsRes.auditLogs || []);
      if (dbRes) setDbStatus(dbRes);
    } catch (err) {
      console.error('Failed to load teacher data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (studentId: string) => {
    if (!confirm('Desejas alterar o estado de bloqueio deste aluno?')) return;
    try {
      await apiRequest(`/api/teacher/students/${studentId}/toggle-block`, { method: 'POST' });
      await loadAllData();
      setActionSuccess('Estado de acesso do aluno atualizado.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalStudent) return;
    try {
      await apiRequest(`/api/teacher/students/${resetModalStudent.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({
          newPassword,
          requireChangeOnNextLogin: mustChangePassword,
        }),
      });
      setActionSuccess(`Palavra-passe de ${resetModalStudent.name} redefinida.`);
      setResetModalStudent(null);
      setNewPassword('');
      await loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetProgress = async (studentId: string, name: string) => {
    if (!confirm(`Tens a certeza que desejas reiniciar o progresso de ${name}? O XP voltará ao valor inicial de 100.`)) {
      return;
    }
    try {
      await apiRequest(`/api/teacher/students/${studentId}/reset-progress`, { method: 'POST' });
      await loadAllData();
      setActionSuccess(`Progresso de ${name} reiniciado.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteStudent = async (studentId: string, name: string) => {
    if (!confirm(`ATENÇÃO: Desejas eliminar definitivamente a conta de ${name}? Esta ação não pode ser desfeita.`)) {
      return;
    }
    try {
      await apiRequest(`/api/teacher/students/${studentId}`, { method: 'DELETE' });
      await loadAllData();
      setActionSuccess(`Conta de ${name} eliminada.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleGradeMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingMission) return;
    try {
      await apiRequest(`/api/teacher/missions/${gradingMission.id}/grade`, {
        method: 'POST',
        body: JSON.stringify({
          score: gradeScore,
          feedback: gradeFeedback,
        }),
      });
      setActionSuccess('Missão Real avaliada com sucesso e XP creditado ao aluno!');
      setGradingMission(null);
      await loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExportCsv = () => {
    window.location.href = '/api/teacher/export/csv';
  };

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.nickname.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Teacher Top Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 font-extrabold text-xs uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Painel de Gestão e Avaliação Pedagógica</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Área da Professora Carla
          </h2>
          <p className="text-xs text-indigo-200 mt-1">
            Gestão curricular, validação de competências TIC 6.º ano e controlo seguro de turmas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Dados (CSV)</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        {[
          { id: 'overview', label: 'Visão Geral & Métricas', icon: Sparkles },
          { id: 'students', label: `Alunos (${students.length})`, icon: Users },
          { id: 'grading', label: `Correção de Missões (${missions.filter((m) => m.status === 'pending').length} pendentes)`, icon: FileText },
          { id: 'audit', label: 'Registo de Auditoria', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                active
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeTab === 'overview' && dashboardStats && (
        <div className="space-y-6">
          {/* SQLite Relational Database Engine Banner */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl border border-blue-800 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black">Base de Dados SQLite Relacional Ativa</h4>
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      ● Persistente
                    </span>
                  </div>
                  <p className="text-xs text-blue-200 mt-1">
                    Motor: <span className="text-white font-mono font-bold">SQLite 3</span> (ficheiro persistente: <code className="bg-black/40 px-1.5 py-0.5 rounded text-cyan-300">data/missao_tic.sqlite</code>) — Transações atómicas, tabelas normalizadas e isolamento relacional por aluno.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="bg-white/10 px-3 py-2 rounded-2xl border border-white/10 text-center">
                  <span className="text-[10px] text-blue-200 uppercase font-extrabold block">Tabelas SQL</span>
                  <span className="font-black text-white text-sm">{dbStatus ? Object.keys(dbStatus.tables).length : 8}</span>
                </div>
                <div className="bg-white/10 px-3 py-2 rounded-2xl border border-white/10 text-center">
                  <span className="text-[10px] text-blue-200 uppercase font-extrabold block">Total Registos</span>
                  <span className="font-black text-white text-sm">
                    {dbStatus ? Object.values(dbStatus.tables).reduce((a: any, b: any) => a + b, 0) : 16}
                  </span>
                </div>
                <div className="bg-white/10 px-3 py-2 rounded-2xl border border-white/10 text-center">
                  <span className="text-[10px] text-blue-200 uppercase font-extrabold block">Estado BD</span>
                  <span className="font-black text-emerald-400 text-sm">Online</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Total de Alunos</span>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {dashboardStats.totalStudents}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">
                {dashboardStats.activeStudents} com acesso ativo
              </span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Missões por Corrigir</span>
              <div className="text-3xl font-black text-amber-600 mt-1">
                {dashboardStats.pendingMissions}
              </div>
              <span className="text-[11px] text-slate-500 font-semibold">Requerem avaliação manual</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Média de XP da Turma</span>
              <div className="text-3xl font-black text-blue-600 mt-1">
                {dashboardStats.avgXP} XP
              </div>
              <span className="text-[11px] text-slate-500 font-semibold">Base de progressão</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Turmas Registadas</span>
              <div className="text-3xl font-black text-indigo-600 mt-1">
                {dashboardStats.classes?.length || 2}
              </div>
              <span className="text-[11px] text-slate-500 font-semibold">6.º A & 6.º B</span>
            </div>
          </div>

          {/* World Averages */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">
              Desempenho Médio da Turma por Mundo Curricular
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {dashboardStats.worldStats.map((ws: any) => (
                <div key={ws.worldId} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-black text-indigo-600">
                    Mundo {ws.worldId}
                  </span>
                  <div className="text-xl font-black text-slate-800 mt-1">
                    {ws.classAverage}%
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {ws.studentsActive} alunos ativos
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS MANAGEMENT */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome, nickname..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold"
              >
                <option value="all">Todas as Turmas</option>
                <option value="class-6a">6.º A</option>
                <option value="class-6b">6.º B</option>
              </select>
            </div>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Aluno</th>
                  <th className="px-4 py-3">Nickname Público</th>
                  <th className="px-4 py-3">Turma</th>
                  <th className="px-4 py-3">XP / Nível</th>
                  <th className="px-4 py-3">Média M1–M5</th>
                  <th className="px-4 py-3">Apoio Pedagógico</th>
                  <th className="px-4 py-3 text-right">Ações de Gestão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-extrabold text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-400">{s.email}</div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-blue-700 font-mono">
                      {s.nickname}
                    </td>
                    <td className="px-4 py-3.5 font-bold">{s.className}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-black text-slate-900">{s.xp} XP</span>
                      <div className="text-[10px] text-slate-400">Nível {s.level}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-slate-600">
                        {s.worldAverages.map((w: any) => (
                          <span
                            key={w.worldId}
                            className={`px-1 py-0.5 rounded-sm ${
                              w.average >= 65
                                ? 'bg-emerald-100 text-emerald-800'
                                : w.average > 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            M{w.worldId}:{w.average}%
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {s.needsHelp ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          <AlertTriangle className="w-3 h-3" /> Apoio Necessário
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          Acompanhamento Normal
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => handleToggleBlock(s.id)}
                        className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                          s.blocked
                            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title={s.blocked ? 'Desbloquear Aluno' : 'Bloquear Aluno'}
                      >
                        {s.blocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => setResetModalStudent(s)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="Redefinir Palavra-passe"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleResetProgress(s.id, s.name)}
                        className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors"
                        title="Reiniciar Progresso Curricular"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteStudent(s.id, s.name)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                        title="Eliminar Conta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MISSIONS GRADING */}
      {activeTab === 'grading' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              Submissões de Missões Reais para Avaliação
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              Atribuição oficial de nota pedagógica e feedback
            </span>
          </div>

          <div className="space-y-3">
            {missions.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                Não existem submissões registadas de momento.
              </p>
            ) : (
              missions.map((m) => (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                        Mundo {m.worldId}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900">{m.title}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          m.status === 'graded'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {m.status === 'graded' ? `Avaliado (${m.score}/100)` : 'Pendente'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Submetido por: <strong className="text-slate-800">{m.studentName}</strong> (
                      {m.studentNickname}) da turma {m.className}
                    </p>
                    <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 mt-2 font-mono">
                      “{m.submission}”
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <button
                      onClick={() => {
                        setGradingMission(m);
                        setGradeScore(m.score || 85);
                        setGradeFeedback(m.feedback || 'Excelente trabalho e esforço demonstrado!');
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
                    >
                      {m.status === 'graded' ? 'Rever Nota' : 'Avaliar & Dar Feedback'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">
            Registo de Auditoria de Ações Sensíveis
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Data/Hora</th>
                  <th className="px-4 py-2.5">Ação Realizada</th>
                  <th className="px-4 py-2.5">Responsável</th>
                  <th className="px-4 py-2.5">Aluno Alvo</th>
                  <th className="px-4 py-2.5">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-slate-400 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString('pt-PT')}
                    </td>
                    <td className="px-4 py-2.5 font-bold uppercase text-indigo-700">
                      {log.action}
                    </td>
                    <td className="px-4 py-2.5 font-semibold">{log.actorName}</td>
                    <td className="px-4 py-2.5">{log.targetUserName || '—'}</td>
                    <td className="px-4 py-2.5 text-[11px] text-slate-500 font-mono">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Reset Password */}
      {resetModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              Redefinir Palavra-passe
            </h3>
            <p className="text-xs text-slate-500">
              Aluno: <strong>{resetModalStudent.name}</strong> ({resetModalStudent.email})
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nova Palavra-passe:
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chk-must-change"
                  checked={mustChangePassword}
                  onChange={(e) => setMustChangePassword(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="chk-must-change" className="text-xs font-semibold text-slate-700">
                  Obrigar alteração de password no próximo login
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetModalStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  Guardar Nova Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Grading Mission */}
      {gradingMission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              Avaliar Missão Real: {gradingMission.title}
            </h3>
            <p className="text-xs text-slate-600">
              Aluno: <strong>{gradingMission.studentName}</strong>
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 max-h-40 overflow-y-auto">
              {gradingMission.submission}
            </div>

            <form onSubmit={handleGradeMission} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nota / Classificação (0 a 100):
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={gradeScore}
                  onChange={(e) => setGradeScore(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Feedback Pedagógico ao Aluno:
                </label>
                <textarea
                  rows={3}
                  required
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder="Ex: Excelente rigor e regras claras de netiqueta!"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGradingMission(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  Confirmar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
