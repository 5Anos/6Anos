import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  FileCheck,
  Award,
  Sparkles,
  Layers,
  History,
  Download,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Shield,
  FileSpreadsheet,
  Clock,
  Zap,
  Target,
  Users,
} from 'lucide-react';
import { apiRequest } from '../../api';

// =================================================================
// 1. ASSESSMENTS TAB (Avaliações Finais dos 5 Mundos)
// =================================================================
export const TeacherAssessmentsTab: React.FC<{ assessmentsData: any; classes: any[]; selectedClass: string; setSelectedClass: (v: string) => void }> = ({
  assessmentsData,
  classes = [],
  selectedClass,
  setSelectedClass,
}) => {
  const [selectedWorld, setSelectedWorld] = useState(1);

  if (!assessmentsData) return <div className="p-8 text-center text-slate-500">A carregar dados de avaliações...</div>;

  const currentWorld = Array.isArray(assessmentsData) ? assessmentsData.find((w: any) => w.worldId === selectedWorld) : null;
  const filteredStudents = currentWorld && Array.isArray(currentWorld.students)
    ? currentWorld.students.filter((s: any) => selectedClass === 'all' || s.classId === selectedClass)
    : [];

  return (
    <div className="space-y-6">
      {/* Top selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((wId) => (
            <button
              key={wId}
              onClick={() => setSelectedWorld(wId)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedWorld === wId
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Avaliação Mundo {wId}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            aria-label="Filtrar por turma nas avaliações"
            className="bg-transparent text-slate-800 text-xs focus:outline-none cursor-pointer pr-2"
          >
            <option value="all" className="bg-white text-slate-800">Todas as Turmas</option>
            {(classes || []).map((c) => (
              <option key={c.id} value={c.id} className="bg-white text-slate-800">Turma {c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {currentWorld && (
        <div className="space-y-4">
          {/* Stats metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold">Total Realizadas</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{currentWorld.totalAttempted || 0}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold">Aprovados (&gt;80%)</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">{currentWorld.totalPassed || 0}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold">Pendentes</div>
              <div className="text-2xl font-bold text-amber-700 mt-1">{currentWorld.totalPending || 0}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold">Média Global do Teste</div>
              <div className="text-2xl font-bold text-amber-800 font-mono mt-1">{currentWorld.averageScore || 0}%</div>
            </div>
          </div>

          {/* Student list */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                  <th className="py-3 px-4">Aluno</th>
                  <th className="py-3 px-4">Turma</th>
                  <th className="py-3 px-4 text-center">Tentativas</th>
                  <th className="py-3 px-4 text-center">Melhor Nota</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Última Realização</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s: any) => (
                  <tr key={s.studentId} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {s.studentName} <span className="text-xs text-slate-400 font-mono">@{s.studentNickname}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">{s.className}</td>
                    <td className="py-3 px-4 text-center font-mono text-xs text-slate-700">{s.attempts}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-xs text-slate-900">
                      {s.bestPercentage > 0 ? `${s.bestPercentage}%` : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {s.passed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Aprovado (&gt;80%)
                        </span>
                      ) : s.attempts > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3" /> Insuficiente (≤80%)
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Não Realizou</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-slate-400">
                      {s.lastAttemptAt ? new Date(s.lastAttemptAt).toLocaleDateString('pt-PT') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// =================================================================
// 2. ACTIVITIES & SIMULATORS TAB
// =================================================================
export const TeacherActivitiesTab: React.FC<{ activitiesData: any }> = ({ activitiesData }) => {
  const [selectedWorld, setSelectedWorld] = useState(1);

  if (!activitiesData) return <div className="p-8 text-center text-slate-500">A carregar simuladores...</div>;

  const currentWorld = Array.isArray(activitiesData) ? activitiesData.find((w: any) => w.worldId === selectedWorld) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        {[1, 2, 3, 4, 5].map((wId) => (
          <button
            key={wId}
            onClick={() => setSelectedWorld(wId)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedWorld === wId
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            Simuladores Mundo {wId}
          </button>
        ))}
      </div>

      {currentWorld && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(currentWorld.activities || []).map((act: any) => (
            <div key={act.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{act.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{act.description}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-xs font-bold">
                  +{act.xpReward} XP
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center">
                  <div className="text-slate-500 text-[10px]">Concluídos</div>
                  <div className="font-bold text-emerald-700 text-sm mt-0.5">{act.completedCount || 0}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center">
                  <div className="text-slate-500 text-[10px]">Pendentes</div>
                  <div className="font-bold text-amber-700 text-sm mt-0.5">{act.pendingCount || 0}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center">
                  <div className="text-slate-500 text-[10px]">Média de Acerto</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{act.averageScore || 0}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =================================================================
// 3. CHALLENGES TAB (Desafios do Mundo & Desafio da Semana)
// =================================================================
export const TeacherChallengesTab: React.FC<{ challengesData: any }> = ({ challengesData }) => {
  if (!challengesData) return <div className="p-8 text-center text-slate-500">A carregar desafios...</div>;

  const worldChallenges = challengesData?.worldChallenges || [];
  const weeklyChallenge = challengesData?.weeklyChallenge || null;

  return (
    <div className="space-y-6">
      {/* Weekly challenge banner */}
      {weeklyChallenge && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-6 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600" /> Desafio da Semana Atual
            </span>
            <span className="px-3 py-1 rounded-lg bg-amber-500 text-white font-black text-xs">
              +{weeklyChallenge.xpReward} XP
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900">{weeklyChallenge.title}</h3>
          <p className="text-xs text-slate-700">{weeklyChallenge.task}</p>

          <div className="pt-2 flex items-center gap-4 text-xs text-slate-500">
            <div>
              Alunos que já resolveram: <strong className="text-amber-800 font-bold">{weeklyChallenge.totalCompleted || 0}</strong>
            </div>
          </div>
        </div>
      )}

      {/* World challenges */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Desafios dos 5 Mundos</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {worldChallenges.map((ch: any) => (
            <div key={ch.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800">Mundo {ch.worldId}</span>
                <span className="text-xs font-mono font-bold text-emerald-700">+{ch.xpReward} XP</span>
              </div>
              <h5 className="font-bold text-slate-900 text-sm">{ch.title}</h5>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                <span>Concluído por: <strong className="text-slate-900">{ch.completedCount || 0} alunos</strong></span>
                <span>Pendentes: <strong className="text-slate-400">{ch.pendingCount || 0}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =================================================================
// 4. XP AUDIT TAB
// =================================================================
export const TeacherXPTab: React.FC<{ xpData: any }> = ({ xpData }) => {
  if (!xpData) return <div className="p-8 text-center text-slate-500">A carregar extrato de XP...</div>;

  const studentsBreakdown = xpData?.studentsBreakdown || [];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h4 className="text-sm font-bold text-slate-900">Discriminação de XP por Aluno</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Aluno</th>
                <th className="py-3 px-4">Turma</th>
                <th className="py-3 px-4 text-center">Base</th>
                <th className="py-3 px-4 text-center">Atividades</th>
                <th className="py-3 px-4 text-center">Desafios</th>
                <th className="py-3 px-4 text-center">Testes</th>
                <th className="py-3 px-4 text-center">Missões</th>
                <th className="py-3 px-4 text-center">Dicas</th>
                <th className="py-3 px-4 text-center">G. Missão</th>
                <th className="py-3 px-4 text-center font-bold text-amber-800">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentsBreakdown.map((s: any) => (
                <tr key={s.studentId} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-semibold text-slate-900">{s.studentName}</td>
                  <td className="py-2.5 px-4 text-slate-500">{s.className}</td>
                  <td className="py-2.5 px-4 text-center font-mono text-slate-400">100</td>
                  <td className="py-2.5 px-4 text-center font-mono text-slate-700">{s.sources?.activities || 0}</td>
                  <td className="py-2.5 px-4 text-center font-mono text-slate-700">{s.sources?.challenges || 0}</td>
                  <td className="py-2.5 px-4 text-center font-mono text-slate-700">{s.sources?.assessments || 0}</td>
                  <td className="py-2.5 px-4 text-center font-mono text-slate-700">{s.sources?.missions || 0}</td>
                  <td className="py-2.5 px-4 text-center font-mono text-slate-700">{s.sources?.dailyTips || 0}</td>
                  <td className="py-2.5 px-4 text-center font-mono text-slate-700">{s.sources?.grandeMissao || 0}</td>
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-amber-800">{s.totalXP || 0} XP</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// 5. GRANDE MISSÃO PROGRESS TAB
// =================================================================
export const TeacherGrandeMissaoTab: React.FC<{ gmData: any }> = ({ gmData }) => {
  if (!gmData) return <div className="p-8 text-center text-slate-500">A carregar Grande Missão...</div>;

  const config = gmData?.config || { title: 'A Escola do Futuro', description: '', totalXp: 500, stages: [] };
  const totalCompleted = gmData?.totalCompleted || 0;
  const totalInProgress = gmData?.totalInProgress || 0;
  const totalNotStarted = gmData?.totalNotStarted || 0;
  const stages = config?.stages || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase">Projeto Integrador Final</span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{config.title}</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">{config.description}</p>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-black text-xs shadow-xs">
            +{config.totalXp} XP Total
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-center">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500">Total Concluídos</div>
            <div className="text-xl font-bold text-emerald-700 mt-1">{totalCompleted}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500">Em Progresso</div>
            <div className="text-xl font-bold text-amber-700 mt-1">{totalInProgress}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500">Não Iniciados</div>
            <div className="text-xl font-bold text-slate-400 mt-1">{totalNotStarted}</div>
          </div>
        </div>
      </div>

      {/* Stages list */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">As 6 Zonas da Grande Missão</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stages.map((st: any) => (
            <div key={st.stage} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                Zona {st.stage}
              </span>
              <h5 className="font-bold text-slate-900 text-xs">{st.title}</h5>
              <p className="text-[11px] text-slate-500 line-clamp-3">{st.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =================================================================
// 6. BADGES TAB
// =================================================================
export const TeacherBadgesTab: React.FC<{ badgesData: any }> = ({ badgesData }) => {
  if (!badgesData) return <div className="p-8 text-center text-slate-500">A carregar conquistas...</div>;

  const badgesCatalog = badgesData?.badgesCatalog || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {badgesCatalog.map((b: any) => (
          <div key={b.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{b.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{b.description}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
              <span>{b.unlockedCount || 0} alunos</span>
              <span className="font-bold text-amber-800 font-mono">{b.percentage || 0}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =================================================================
// 7. AUDIT LOGS TAB
// =================================================================
export const TeacherAuditTab: React.FC<{ logs: any[] }> = ({ logs = [] }) => {
  const logList = Array.isArray(logs) ? logs : [];
  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600" />
            Registo de Auditoria em Tempo Real (Cloud Firestore)
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Histórico imutável de todas as ações administrativas, redefinições e avaliações.
          </p>
        </div>

        <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
          {logList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Nenhum registo de auditoria recente.
            </div>
          ) : (
            logList.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>{log.action}</span>
                    {log.targetUserName && (
                      <span className="text-slate-500 font-normal">
                        em <strong>{log.targetUserName}</strong>
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Realizado por: {log.teacherName || 'Professora'} • {new Date(log.timestamp).toLocaleString('pt-PT')}
                  </div>
                </div>

                {log.details && (
                  <div className="text-[11px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 max-w-xs truncate">
                    {JSON.stringify(log.details)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// =================================================================
// 8. CLEANUP & ACADEMIC YEAR MANAGEMENT TAB
// =================================================================
export const TeacherCleanupTab: React.FC<{ classes: any[]; onRefresh: () => void }> = ({
  classes = [],
  onRefresh,
}) => {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [showClassDeleteModal, setShowClassDeleteModal] = useState(false);
  const [showClassResetModal, setShowClassResetModal] = useState(false);
  const [showGlobalResetModal, setShowGlobalResetModal] = useState(false);
  const [confirmWord, setConfirmWord] = useState('');

  const classList = Array.isArray(classes) ? classes : [];
  const selectedClassObj = classList.find((c) => c.id === selectedClassId);

  const handleDeleteClassStudents = async () => {
    if (!selectedClassId) return;
    try {
      await apiRequest(`/api/teacher/classes/${selectedClassId}/students`, {
        method: 'DELETE',
      });
      alert('Alunos da turma eliminados com sucesso.');
      setShowClassDeleteModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao eliminar alunos.');
    }
  };

  const handleResetClassProgress = async () => {
    if (!selectedClassId) return;
    try {
      await apiRequest(`/api/teacher/classes/${selectedClassId}/reset-progress`, {
        method: 'POST',
      });
      alert('Progresso pedagógico da turma reiniciado com sucesso.');
      setShowClassResetModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao reiniciar progresso.');
    }
  };

  const handleGlobalReset = async () => {
    if (confirmWord !== 'NOVO ANO') {
      alert('Digita NOVO ANO para confirmar.');
      return;
    }
    try {
      await apiRequest('/api/teacher/platform/reset-all-students-progress', {
        method: 'POST',
      });
      alert('Plataforma preparada com sucesso para o Novo Ano Letivo!');
      setShowGlobalResetModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao efetuar reset global.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Alert banner */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-rose-800">Área de Manutenção e Transição de Ano Letivo</h4>
          <p className="text-xs text-rose-700/90 leading-relaxed">
            As ações disponíveis nesta secção afetam turmas inteiras ou todos os alunos da plataforma. Utiliza estas ferramentas para fechar um ano letivo ou reiniciar turmas mantendo as contas de utilizador ativas.
          </p>
        </div>
      </div>

      {/* Class Level Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Ações por Turma</h4>

        <div className="space-y-2">
          <label className="text-xs text-slate-700 font-semibold">Selecionar Turma:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            aria-label="Selecionar turma para manutenção"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-amber-500"
          >
            <option value="">-- Selecionar Turma --</option>
            {classList.map((c) => (
              <option key={c.id} value={c.id}>
                Turma {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => {
              if (!selectedClassId) return alert('Seleciona uma turma.');
              setShowClassResetModal(true);
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-2 transition-all shadow-xs"
          >
            <RotateCcw className="w-4 h-4 text-amber-600" />
            Reiniciar Progresso da Turma (Manter Contas)
          </button>

          <button
            onClick={() => {
              if (!selectedClassId) return alert('Seleciona uma turma.');
              setShowClassDeleteModal(true);
            }}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 flex items-center gap-2 transition-all shadow-xs"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            Eliminar Todos os Alunos Desta Turma
          </button>
        </div>
      </div>

      {/* Global Academic Year Reset */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <h4 className="text-sm font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          Preparar Plataforma para Novo Ano Letivo (Reset Global)
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          Esta operação restaura o progresso pedagógico de <strong>todos os alunos</strong> de todas as turmas para 100 XP base e limpa tentativas, permitindo que os mesmos alunos comecem um novo ciclo escolar do 6.º ano.
        </p>

        <button
          onClick={() => {
            setConfirmWord('');
            setShowGlobalResetModal(true);
          }}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Iniciar Reset Global de Ano Letivo
        </button>
      </div>

      {/* Modal: Confirm Class Reset */}
      {showClassResetModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Reiniciar Progresso da Turma?</h3>
              <p className="text-xs text-slate-600">
                Todas as tentativas e notas dos alunos da <strong>Turma {selectedClassObj?.name}</strong> serão repostas a 100 XP inicial. As contas de login serão mantidas.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClassResetModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetClassProgress}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Confirmar Reinicialização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Class Delete */}
      {showClassDeleteModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Eliminar Alunos da Turma?</h3>
              <p className="text-xs text-slate-600">
                Todos os alunos inscritos na <strong>Turma {selectedClassObj?.name}</strong> serão eliminados permanentemente do sistema. Esta ação é irreversível.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClassDeleteModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteClassStudents}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Reset Modal */}
      {showGlobalResetModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Confirmar Reset de Ano Letivo?</h3>
              <p className="text-xs text-slate-600">
                Todas as notas, avaliações, simuladores e missões de todos os alunos serão repostos a zero.
              </p>
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-[11px] font-bold text-rose-700 uppercase">
                Digita <span className="underline">NOVO ANO</span> para confirmar:
              </label>
              <input
                type="text"
                value={confirmWord}
                onChange={(e) => setConfirmWord(e.target.value)}
                placeholder="NOVO ANO"
                className="w-full bg-slate-50 border border-rose-300 rounded-xl px-3 py-2 text-sm text-rose-900 text-center font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowGlobalResetModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleGlobalReset}
                disabled={confirmWord !== 'NOVO ANO'}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Executar Reset Global
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
