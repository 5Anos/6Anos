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
  Scissors,
  UserPlus,
  Sliders,
} from 'lucide-react';
import { apiRequest, downloadFile } from '../api';
import { useAuth } from '../context/AuthContext';
import { PROGRESSION_CONFIG } from '../progressionConfig';
import { TeacherStudentsTab } from './teacher/TeacherStudentsTab';
import { StudentDossierModal } from './teacher/StudentDossierModal';
import { TeacherPautasTab } from './teacher/TeacherPautasTab';
import { TeacherClassesTab } from './teacher/TeacherClassesTab';
import {
  TeacherActivitiesTab,
  TeacherAuditTab,
  TeacherCleanupTab,
} from './teacher/TeacherDetailedViews';
import { StudentImportModal } from './teacher/StudentImportModal';
import { LoginCardsModal } from './teacher/LoginCardsModal';
import { ModuleVisibilityModal } from './teacher/ModuleVisibilityModal';

export const TeacherArea: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'students'
    | 'pautas'
    | 'activities'
    | 'classes'
    | 'cleanup'
  >('overview');

  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [pautaData, setPautaData] = useState<any>(null);
  const [activitiesData, setActivitiesData] = useState<any>(null);
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

  // New Modals for requested features
  const [showImportModal, setShowImportModal] = useState(false);
  const [showLoginCardsModal, setShowLoginCardsModal] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);

  useEffect(() => {
    loadAllData();
  }, [selectedClass]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        apiRequest('/api/teacher/dashboard-stats'),
        apiRequest(`/api/teacher/students?classId=${selectedClass}`),
        apiRequest('/api/teacher/classes'),
        apiRequest(`/api/teacher/pauta?classId=${selectedClass}`),
        apiRequest('/api/teacher/activities-summary'),
        apiRequest('/api/teacher/audit-logs'),
      ]);

      const [
        statsRes,
        studentsRes,
        classesRes,
        pautaRes,
        actRes,
        auditRes,
      ] = results;

      if (statsRes.status === 'fulfilled') setDashboardStats(statsRes.value);
      if (studentsRes.status === 'fulfilled') setStudents(studentsRes.value.students || []);
      if (classesRes.status === 'fulfilled') setClasses(classesRes.value.classes || []);
      if (pautaRes.status === 'fulfilled') setPautaData(pautaRes.value);
      if (actRes.status === 'fulfilled') setActivitiesData(actRes.value.worldsActivities || []);
      if (auditRes.status === 'fulfilled') setAuditLogs(auditRes.value.auditLogs || []);

    } catch (err: any) {
      console.error('Backend API request returned error:', err?.message);
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

  const handleDeleteStudent = async (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    const name = student?.name || 'o aluno';
    if (
      !confirm(
        `Tens a certeza que desejas eliminar permanentemente a conta de "${name}"? Todos os seus dados de progresso e avaliações serão removidos da nuvem.`
      )
    ) {
      return;
    }
    try {
      await apiRequest(`/api/teacher/students/${studentId}`, {
        method: 'DELETE',
      });
      showToast(`Conta de "${name}" eliminada com sucesso.`);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao eliminar aluno');
    }
  };

  const handleBulkDelete = async (studentIds: string[]) => {
    if (
      !confirm(
        `Tens a certeza que desejas eliminar permanentemente ${studentIds.length} aluno(s)? Esta ação é irreversível e remove todos os seus dados da base de dados.`
      )
    ) {
      return;
    }
    try {
      await apiRequest('/api/teacher/bulk/delete', {
        method: 'POST',
        body: JSON.stringify({ studentIds }),
      });
      showToast(`${studentIds.length} aluno(s) eliminado(s) com sucesso.`);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao eliminar alunos');
    }
  };

  const handleExportCSV = async () => {
    try {
      await downloadFile(`/api/teacher/export/pauta-csv?classId=${selectedClass}`, `missao_tic_pauta_${selectedClass}.csv`);
      showToast('Pauta CSV descarregada com sucesso.');
    } catch (err: any) {
      alert(err.message || 'Erro ao exportar CSV');
    }
  };

  const handleExportXLSX = async () => {
    try {
      await downloadFile(`/api/teacher/export/xlsx?classId=${selectedClass}`, 'missao_tic_relatorio_completo.xlsx');
      showToast('Relatório Excel (.xlsx) descarregado com sucesso.');
    } catch (err: any) {
      alert(err.message || 'Erro ao exportar Excel');
    }
  };

  const handleExportCredentialsXLSX = async () => {
    try {
      await downloadFile(
        `/api/teacher/export/credentials-xlsx?classId=${selectedClass}`,
        `missao_tic_credenciais_${selectedClass}.xlsx`
      );
      showToast('Pauta de credenciais descarregada com sucesso em Excel (.xlsx).');
    } catch (err: any) {
      alert(err.message || 'Erro ao exportar credenciais');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Top Header Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 font-bold text-xs border border-amber-200 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                Painel da Docência
              </span>
              <span className="text-xs text-slate-500 font-medium">Missão TIC 6.º Ano</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Central de Gestão e Acompanhamento
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Gere os alunos, turmas, credenciais de acesso, visibilidade de módulos e relatórios em tempo real com persistência no Cloud Firestore.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Importar lista de turma (Excel, CSV, colar texto ou manual)"
            >
              <UserPlus className="w-4 h-4" />
              <span>Importar Alunos</span>
            </button>

            <button
              onClick={() => setShowLoginCardsModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Gerar cartões de acesso A4 com linhas de corte"
            >
              <Scissors className="w-4 h-4 text-amber-300" />
              <span>Cartões A4</span>
            </button>

            <button
              onClick={handleExportCredentialsXLSX}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Descarregar pauta privada com todos os nomes, utilizadores e palavras-passe"
            >
              <Key className="w-4 h-4 text-amber-600" />
              <span>Credenciais (.xlsx)</span>
            </button>

            <button
              onClick={handleExportXLSX}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Descarregar relatório pedagógico completo com pauta, avaliações e missões"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Relatório (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Global Stats Overview Strip */}
        {dashboardStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Alunos Registados</span>
                <Users className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">
                {dashboardStats.totalStudents}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Distribuídos por {dashboardStats.totalClasses} turmas
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Turmas Ativas</span>
                <GraduationCap className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">
                {dashboardStats.totalClasses}
              </div>
              <div className="text-[11px] text-amber-700 font-medium mt-1">
                6.º Ano de Escolaridade
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Simuladores Concluídos</span>
                <Layers className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-600 font-mono mt-2">
                {dashboardStats.totalSimulatorsCompleted ?? 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {dashboardStats.totalQuizzesAttempted ? `${dashboardStats.totalQuizzesAttempted} testes de avaliação realizados` : 'Atividades e desafios práticos'}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Média Global da Escola</span>
                <Flame className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600 font-mono mt-2">
                {dashboardStats.globalAverageScore}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Critério de aprovação: &gt;={PROGRESSION_CONFIG.PASSING_THRESHOLD}%
              </div>
            </div>
          </div>
        )}

        {/* Horizontal Navigation Tabs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-1.5 flex overflow-x-auto gap-1 shadow-xs">
          {[
            { id: 'overview', label: 'Visão Geral', icon: Sparkles },
            { id: 'students', label: `Alunos & Acessos (${students?.length || 0})`, icon: Users },
            { id: 'pautas', label: 'Pautas & Avaliações', icon: FileSpreadsheet },
            { id: 'activities', label: 'Simuladores Curriculares', icon: Layers },
            { id: 'classes', label: `Turmas (${classes?.length || 0})`, icon: GraduationCap },
            { id: 'cleanup', label: 'Transição & Auditoria', icon: RotateCcw },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-amber-600" />
                    Desempenho Médio por Mundo (Critério &gt;= {PROGRESSION_CONFIG.PASSING_THRESHOLD}%)
                  </h3>
                  <span className="text-xs text-slate-500">5 Mundos Temáticos TIC</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {dashboardStats.worldPerformance?.map((w: any) => {
                    const isPassed = w.averageScore >= PROGRESSION_CONFIG.PASSING_THRESHOLD;
                    return (
                      <div
                        key={w.worldId}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <span className="text-[10px] font-black uppercase text-amber-700">
                            Mundo {w.worldId}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 mt-0.5 line-clamp-1">
                            {w.title}
                          </h4>
                        </div>

                        <div className="space-y-1">
                          <div className="text-2xl font-black font-mono text-slate-900">
                            {w.averageScore}%
                          </div>
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              isPassed
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {isPassed ? `Aprovado (>=${PROGRESSION_CONFIG.PASSING_THRESHOLD}%)` : 'Abaixo da Média'}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
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
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Ações Rápidas de Gestão
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveTab('students')}
                      className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-600" />
                        Ver Todos os Alunos & Boletins
                      </span>
                      <span className="text-slate-400">→</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('activities')}
                      className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-amber-600" />
                        Progresso dos Simuladores Curriculares
                      </span>
                      <span className="text-slate-400">→</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('pautas')}
                      className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                        Consultar e Exportar Pautas Oficiais
                      </span>
                      <span className="text-slate-400">→</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('classes')}
                      className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-amber-600" />
                        Gerir Turmas e Transferências
                      </span>
                      <span className="text-slate-400">→</span>
                    </button>
                  </div>
                </div>

                {/* Audit summary */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <History className="w-4 h-4 text-amber-600" />
                      Últimos Registos de Auditoria
                    </h3>
                    <button
                      onClick={() => setActiveTab('cleanup')}
                      className="text-xs text-amber-600 font-bold hover:underline"
                    >
                      Ver todos ({auditLogs?.length || 0})
                    </button>
                  </div>

                  <div className="space-y-2">
                    {auditLogs.slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-800">{log.action}</div>
                          <div className="text-[11px] text-slate-500">
                            {new Date(log.timestamp || log.createdAt).toLocaleString('pt-PT')}
                          </div>
                        </div>
                        {log.targetUserName && (
                          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[11px]">
                            {log.targetUserName}
                          </span>
                        )}
                      </div>
                    ))}

                    {auditLogs.length === 0 && (
                      <div className="text-center py-6 text-slate-400 text-xs">
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
              onDeleteStudent={handleDeleteStudent}
              onOpenImport={() => setShowImportModal(true)}
              onOpenLoginCards={() => setShowLoginCardsModal(true)}
              onExportCredentialsXLSX={handleExportCredentialsXLSX}
              onOpenVisibility={() => setShowVisibilityModal(true)}
              onRefresh={loadAllData}
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

          {/* TAB: ACTIVITIES */}
          {activeTab === 'activities' && (
            <TeacherActivitiesTab activitiesData={activitiesData} />
          )}

          {/* TAB: CLASSES */}
          {activeTab === 'classes' && (
            <TeacherClassesTab
              classes={classes}
              students={students}
              onRefresh={loadAllData}
              onOpenStudent={(s) => setSelectedStudentForDossier(s)}
              onOpenVisibility={(classId) => {
                if (classId) setSelectedClass(classId);
                setShowVisibilityModal(true);
              }}
            />
          )}

          {/* TAB: CLEANUP & AUDIT */}
          {activeTab === 'cleanup' && (
            <div className="space-y-6">
              <TeacherCleanupTab classes={classes} onRefresh={loadAllData} />
              <TeacherAuditTab logs={auditLogs} />
            </div>
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

      {/* Student Import Modal (4 Methods) */}
      <StudentImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        classes={classes}
        onSuccess={() => {
          loadAllData();
          showToast('Alunos registados com sucesso com credenciais geradas!');
        }}
      />

      {/* Login Cards Modal (Printable A4 Sheet) */}
      <LoginCardsModal
        isOpen={showLoginCardsModal}
        onClose={() => setShowLoginCardsModal(false)}
        students={students}
        classes={classes}
      />

      {/* Module and Quiz Visibility Modal */}
      <ModuleVisibilityModal
        isOpen={showVisibilityModal}
        onClose={() => setShowVisibilityModal(false)}
        classes={classes}
        onSuccess={() => {
          loadAllData();
          showToast('Visibilidade de módulos e testes atualizada.');
        }}
      />

      {/* Reset Password Modal (Single Student) */}
      {resetPwdStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-600" />
              Redefinir Palavra-passe
            </h3>
            <p className="text-xs text-slate-600">
              Aluno: <strong className="text-slate-900">{resetPwdStudent.name}</strong> (@{resetPwdStudent.nickname})
            </p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nova Palavra-passe:</label>
                <input
                  type="text"
                  placeholder="Mínimo 6 caracteres..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
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
                <label htmlFor="requireChangeNext" className="text-xs text-slate-700">
                  Obrigar o aluno a alterar a palavra-passe no próximo início de sessão
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPwdStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold rounded-xl shadow-xs"
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
