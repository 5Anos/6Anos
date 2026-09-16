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
  Compass,
  Layers,
  Zap,
  Shield,
  Clock,
  ArrowRightLeft,
  Settings,
  Flame,
} from 'lucide-react';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  clientGetTeacherDashboardData,
  clientTeacherToggleBlock,
  clientTeacherResetPassword,
} from '../services/clientFirestore';
import { TeacherStudentsTab } from './teacher/TeacherStudentsTab';
import { StudentDossierModal } from './teacher/StudentDossierModal';
import { TeacherPautasTab } from './teacher/TeacherPautasTab';
import { TeacherClassesTab } from './teacher/TeacherClassesTab';
import { TeacherMissionsTab } from './teacher/TeacherMissionsTab';
import {
  TeacherAssessmentsTab,
  TeacherActivitiesTab,
  TeacherChallengesTab,
  TeacherXPTab,
  TeacherGrandeMissaoTab,
  TeacherBadgesTab,
  TeacherAuditTab,
  TeacherCleanupTab,
} from './teacher/TeacherDetailedViews';

export const TeacherArea: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'students'
    | 'pautas'
    | 'classes'
    | 'missions'
    | 'assessments'
    | 'activities'
    | 'challenges'
    | 'xp'
    | 'grande-missao'
    | 'badges'
    | 'audit'
    | 'cleanup'
  >('overview');

  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [pautaData, setPautaData] = useState<any>(null);
  const [assessmentsData, setAssessmentsData] = useState<any>(null);
  const [activitiesData, setActivitiesData] = useState<any>(null);
  const [challengesData, setChallengesData] = useState<any>(null);
  const [xpData, setXpData] = useState<any>(null);
  const [gmData, setGmData] = useState<any>(null);
  const [badgesData, setBadgesData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  // Modals
  const [selectedStudentForDossier, setSelectedStudentForDossier] = useState<any | null>(null);
  const [resetPwdStudent, setResetPwdStudent] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [requireChangeOnNextLogin, setRequireChangeOnNextLogin] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, [selectedClass]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        statsRes,
        studentsRes,
        classesRes,
        missionsRes,
        pautaRes,
        assessRes,
        actRes,
        chalRes,
        xpRes,
        gmRes,
        badgeRes,
        auditRes,
      ] = await Promise.all([
        apiRequest('/api/teacher/dashboard-stats'),
        apiRequest(`/api/teacher/students?classId=${selectedClass}`),
        apiRequest('/api/teacher/classes'),
        apiRequest('/api/teacher/missions'),
        apiRequest(`/api/teacher/pauta?classId=${selectedClass}`),
        apiRequest(`/api/teacher/assessments-summary?classId=${selectedClass}`),
        apiRequest('/api/teacher/activities-summary'),
        apiRequest('/api/teacher/challenges-summary'),
        apiRequest('/api/teacher/xp-breakdown'),
        apiRequest('/api/teacher/grande-missao-summary'),
        apiRequest('/api/teacher/badges-summary'),
        apiRequest('/api/teacher/audit-logs'),
      ]);

      setDashboardStats(statsRes);
      setStudents(studentsRes.students || []);
      setClasses(classesRes.classes || []);
      setMissions(missionsRes.missions || []);
      setPautaData(pautaRes);
      setAssessmentsData(assessRes.worldsAssessments || []);
      setActivitiesData(actRes.worldsActivities || []);
      setChallengesData(chalRes);
      setXpData(xpRes);
      setGmData(gmRes);
      setBadgesData(badgeRes);
      setAuditLogs(auditRes.auditLogs || []);
    } catch (err: any) {
      console.warn('Backend API request returned error, falling back to direct Firestore:', err?.message);
      try {
        const directData = await clientGetTeacherDashboardData(selectedClass);
        setDashboardStats(directData.dashboardStats);
        setStudents(directData.students || []);
        setClasses(directData.classes || []);
        setMissions(directData.missions || []);
        setAssessmentsData(directData.assessments || []);
        setActivitiesData(directData.activities || []);
        setAuditLogs(directData.auditLogs || []);
      } catch (clientErr) {
        console.error('Failed to load teacher dashboard data from client Firestore:', clientErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleBlock = async (studentId: string) => {
    try {
      const res = await apiRequest(`/api/teacher/students/${studentId}/toggle-block`, {
        method: 'POST',
      });
      showToast(res.blocked ? 'Aluno bloqueado.' : 'Aluno desbloqueado.');
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar bloqueio');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPwdStudent) return;
    if (!newPassword || newPassword.length < 6) {
      alert('A palavra-passe deve ter no mínimo 6 caracteres.');
      return;
    }
    try {
      await apiRequest(`/api/teacher/students/${resetPwdStudent.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({
          newPassword,
          requireChangeOnNextLogin,
        }),
      });
      showToast(`Palavra-passe de ${resetPwdStudent.name} redefinida com sucesso.`);
      setResetPwdStudent(null);
      setNewPassword('');
    } catch (err: any) {
      alert(err.message || 'Erro ao redefinir palavra-passe');
    }
  };

  const handleBulkMoveClass = async (studentIds: string[], targetClassId: string) => {
    try {
      await apiRequest('/api/teacher/bulk/move-class', {
        method: 'POST',
        body: JSON.stringify({ studentIds, targetClassId }),
      });
      showToast('Alunos transferidos com sucesso.');
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao transferir alunos');
    }
  };

  const handleBulkBlock = async (studentIds: string[]) => {
    try {
      await apiRequest('/api/teacher/bulk/block', {
        method: 'POST',
        body: JSON.stringify({ studentIds }),
      });
      showToast(`${studentIds.length} alunos bloqueados.`);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao bloquear alunos');
    }
  };

  const handleBulkUnblock = async (studentIds: string[]) => {
    try {
      await apiRequest('/api/teacher/bulk/unblock', {
        method: 'POST',
        body: JSON.stringify({ studentIds }),
      });
      showToast(`${studentIds.length} alunos desbloqueados.`);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao desbloquear alunos');
    }
  };

  const handleBulkDelete = async (studentIds: string[]) => {
    if (
      !confirm(
        `Tens a certeza que desejas eliminar permanentemente ${studentIds.length} alunos? Esta ação é irreversível.`
      )
    ) {
      return;
    }
    try {
      await apiRequest('/api/teacher/bulk/delete', {
        method: 'POST',
        body: JSON.stringify({ studentIds }),
      });
      showToast(`${studentIds.length} alunos eliminados.`);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao eliminar alunos');
    }
  };

  const handleExportCSV = () => {
    window.location.href = `/api/teacher/export/pauta-csv?classId=${selectedClass}`;
  };

  const handleExportXLSX = () => {
    window.location.href = '/api/teacher/export/xlsx';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Top Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold text-xs border border-amber-500/20 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Painel da Docência
              </span>
              <span className="text-xs text-slate-400 font-medium">Missão TIC 6.º Ano</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Central de Gestão e Acompanhamento
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Gere os alunos, turmas, avaliações, relatórios e correções de Missões Reais em tempo real com persistência no Cloud Firestore.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleExportXLSX}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg"
              title="Descarregar relatório completo com pauta, avaliações e missões"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Global Stats Overview Strip */}
        {dashboardStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Alunos Registados</span>
                <Users className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono mt-2">
                {dashboardStats.totalStudents}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Distribuídos por {dashboardStats.totalClasses} turmas
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Turmas Ativas</span>
                <GraduationCap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono mt-2">
                {dashboardStats.totalClasses}
              </div>
              <div className="text-[11px] text-amber-400/80 font-medium mt-1">
                6.º Ano de Escolaridade
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Missões por Corrigir</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono mt-2">
                {dashboardStats.pendingMissionsCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Submissões práticas a aguardar nota
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Média Global da Escola</span>
                <Flame className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
                {dashboardStats.globalAverageScore}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Critério de desbloqueio: &gt;80%
              </div>
            </div>
          </div>
        )}

        {/* Horizontal Navigation Tabs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1.5 flex overflow-x-auto gap-1 shadow-lg">
          {[
            { id: 'overview', label: 'Visão Geral', icon: Sparkles },
            { id: 'students', label: `Alunos (${students?.length || 0})`, icon: Users },
            { id: 'pautas', label: 'Pautas & Notas', icon: FileSpreadsheet },
            { id: 'classes', label: `Turmas (${classes?.length || 0})`, icon: GraduationCap },
            { id: 'missions', label: `Missões Reais (${missions?.length || 0})`, icon: FileText },
            { id: 'assessments', label: 'Avaliações Finais', icon: CheckCircle2 },
            { id: 'activities', label: 'Simuladores', icon: Layers },
            { id: 'challenges', label: 'Desafios & Semanal', icon: Zap },
            { id: 'xp', label: 'Extrato de XP', icon: Sparkles },
            { id: 'grande-missao', label: 'Grande Missão', icon: Compass },
            { id: 'badges', label: 'Conquistas', icon: Award },
            { id: 'audit', label: 'Auditoria', icon: History },
            { id: 'cleanup', label: 'Transição / Reset', icon: RotateCcw },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Rendering */}
        <div className="space-y-6">
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && dashboardStats && (
            <div className="space-y-6">
              {/* World Performance Grid */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-amber-400" />
                    Desempenho Médio por Mundo (Critério &gt; 80%)
                  </h3>
                  <span className="text-xs text-slate-400">5 Mundos Temáticos</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {dashboardStats.worldPerformance?.map((w: any) => {
                    const isPassed = w.averageScore > 80;
                    return (
                      <div
                        key={w.worldId}
                        className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <span className="text-[10px] font-black uppercase text-amber-400">
                            Mundo {w.worldId}
                          </span>
                          <h4 className="text-xs font-bold text-white mt-0.5 line-clamp-1">
                            {w.title}
                          </h4>
                        </div>

                        <div className="space-y-1">
                          <div className="text-2xl font-black font-mono text-slate-100">
                            {w.averageScore}%
                          </div>
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              isPassed
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {isPassed ? 'Aprovado (>80%)' : 'Abaixo da Média'}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-900">
                          {w.studentsAttempted} alunos realizaram
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Shortcuts */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Ações Rápidas de Gestão
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveTab('students')}
                      className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left flex items-center justify-between text-xs font-bold text-slate-200 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-400" />
                        Ver Todos os Alunos & Boletins
                      </span>
                      <span className="text-slate-500">→</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('missions')}
                      className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left flex items-center justify-between text-xs font-bold text-slate-200 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        Corrigir Missões Pendentes ({dashboardStats.pendingMissionsCount})
                      </span>
                      <span className="text-slate-500">→</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('pautas')}
                      className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left flex items-center justify-between text-xs font-bold text-slate-200 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                        Consultar e Exportar Pautas Gerais
                      </span>
                      <span className="text-slate-500">→</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('classes')}
                      className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left flex items-center justify-between text-xs font-bold text-slate-200 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-amber-400" />
                        Gerir Turmas e Transferências
                      </span>
                      <span className="text-slate-500">→</span>
                    </button>
                  </div>
                </div>

                {/* Audit summary */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <History className="w-4 h-4 text-amber-400" />
                      Últimos Registos de Auditoria
                    </h3>
                    <button
                      onClick={() => setActiveTab('audit')}
                      className="text-xs text-amber-400 font-bold hover:underline"
                    >
                      Ver todos ({auditLogs?.length || 0})
                    </button>
                  </div>

                  <div className="space-y-2">
                    {auditLogs.slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-200">{log.action}</div>
                          <div className="text-[11px] text-slate-500">
                            {new Date(log.timestamp).toLocaleString('pt-PT')}
                          </div>
                        </div>
                        {log.targetUserName && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                            {log.targetUserName}
                          </span>
                        )}
                      </div>
                    ))}

                    {auditLogs.length === 0 && (
                      <div className="text-center py-6 text-slate-500 text-xs">
                        Nenhum registo de auditoria recente.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: STUDENTS */}
          {activeTab === 'students' && (
            <TeacherStudentsTab
              students={students}
              classes={classes}
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onOpenStudent={(s) => setSelectedStudentForDossier(s)}
              onToggleBlock={handleToggleBlock}
              onOpenResetPassword={(s) => {
                setResetPwdStudent(s);
                setNewPassword('');
              }}
              onBulkMoveClass={handleBulkMoveClass}
              onBulkBlock={handleBulkBlock}
              onBulkUnblock={handleBulkUnblock}
              onBulkDelete={handleBulkDelete}
            />
          )}

          {/* TAB: PAUTAS */}
          {activeTab === 'pautas' && (
            <TeacherPautasTab
              pautaData={pautaData}
              classes={classes}
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
              onOpenStudent={(s) => setSelectedStudentForDossier(s)}
              onExportCSV={handleExportCSV}
              onExportXLSX={handleExportXLSX}
            />
          )}

          {/* TAB: CLASSES */}
          {activeTab === 'classes' && (
            <TeacherClassesTab
              classes={classes}
              students={students}
              onRefresh={loadAllData}
              onOpenStudent={(s) => setSelectedStudentForDossier(s)}
            />
          )}

          {/* TAB: MISSIONS */}
          {activeTab === 'missions' && (
            <TeacherMissionsTab
              missions={missions}
              classes={classes}
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
              onRefresh={loadAllData}
            />
          )}

          {/* TAB: ASSESSMENTS */}
          {activeTab === 'assessments' && (
            <TeacherAssessmentsTab
              assessmentsData={assessmentsData}
              classes={classes}
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
            />
          )}

          {/* TAB: ACTIVITIES */}
          {activeTab === 'activities' && (
            <TeacherActivitiesTab activitiesData={activitiesData} />
          )}

          {/* TAB: CHALLENGES */}
          {activeTab === 'challenges' && (
            <TeacherChallengesTab challengesData={challengesData} />
          )}

          {/* TAB: XP */}
          {activeTab === 'xp' && <TeacherXPTab xpData={xpData} />}

          {/* TAB: GRANDE MISSAO */}
          {activeTab === 'grande-missao' && (
            <TeacherGrandeMissaoTab gmData={gmData} />
          )}

          {/* TAB: BADGES */}
          {activeTab === 'badges' && <TeacherBadgesTab badgesData={badgesData} />}

          {/* TAB: AUDIT */}
          {activeTab === 'audit' && <TeacherAuditTab logs={auditLogs} />}

          {/* TAB: CLEANUP */}
          {activeTab === 'cleanup' && (
            <TeacherCleanupTab classes={classes} onRefresh={loadAllData} />
          )}
        </div>
      </div>

      {/* Student Dossier Modal */}
      {selectedStudentForDossier && (
        <StudentDossierModal
          studentId={selectedStudentForDossier.id}
          classes={classes}
          onClose={() => setSelectedStudentForDossier(null)}
          onRefresh={loadAllData}
        />
      )}

      {/* Reset Password Modal (Single Student) */}
      {resetPwdStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              Redefinir Palavra-passe
            </h3>
            <p className="text-xs text-slate-400">
              Aluno: <strong>{resetPwdStudent.name}</strong> (@{resetPwdStudent.nickname})
            </p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Nova Palavra-passe:</label>
                <input
                  type="text"
                  placeholder="Mínimo 6 caracteres..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requireChangeNext"
                  checked={requireChangeOnNextLogin}
                  onChange={(e) => setRequireChangeOnNextLogin(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="requireChangeNext" className="text-xs text-slate-300">
                  Obrigar o aluno a alterar a palavra-passe no próximo início de sessão
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPwdStudent(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl"
                >
                  Confirmar Palavra-passe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
