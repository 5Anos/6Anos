import React, { useState } from 'react';
import {
  Search,
  Filter,
  Users,
  Lock,
  Unlock,
  Key,
  RotateCcw,
  Trash2,
  AlertTriangle,
  FileText,
  CheckSquare,
  Square,
  ChevronRight,
  ShieldAlert,
  ArrowRightLeft,
  Sparkles,
  Award,
} from 'lucide-react';

interface TeacherStudentsTabProps {
  students: any[];
  classes: any[];
  selectedClass: string;
  setSelectedClass: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onOpenStudent: (student: any) => void;
  onToggleBlock: (studentId: string) => void;
  onOpenResetPassword: (student: any) => void;
  onBulkMoveClass: (studentIds: string[], targetClassId: string) => void;
  onBulkBlock: (studentIds: string[]) => void;
  onBulkUnblock: (studentIds: string[]) => void;
  onBulkDelete: (studentIds: string[]) => void;
}

export const TeacherStudentsTab: React.FC<TeacherStudentsTabProps> = ({
  students = [],
  classes = [],
  selectedClass,
  setSelectedClass,
  searchQuery,
  setSearchQuery,
  onOpenStudent,
  onToggleBlock,
  onOpenResetPassword,
  onBulkMoveClass,
  onBulkBlock,
  onBulkUnblock,
  onBulkDelete,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetClassId, setTargetClassId] = useState('');
  const [showMoveModal, setShowMoveModal] = useState(false);

  const studentList = Array.isArray(students) ? students : [];
  const classList = Array.isArray(classes) ? classes : [];

  const filteredStudents = studentList.filter((s) => {
    const matchesClass = selectedClass === 'all' || s.classId === selectedClass;
    const matchesSearch =
      searchQuery === '' ||
      (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nickname || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const allSelected =
    filteredStudents.length > 0 && selectedIds.length === filteredStudents.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s) => s.id));
    }
  };

  const toggleSelectStudent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkMoveSubmit = () => {
    if (!targetClassId) {
      alert('Seleciona a turma de destino.');
      return;
    }
    onBulkMoveClass(selectedIds, targetClassId);
    setShowMoveModal(false);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por nome, nickname ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              aria-label="Filtrar por turma"
              className="bg-transparent text-slate-200 text-sm focus:outline-none cursor-pointer pr-2"
            >
              <option value="all" className="bg-slate-900">Todas as Turmas ({students.length})</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900">
                  Turma {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-semibold text-slate-400 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700/60">
            {filteredStudents.length} {filteredStudents.length === 1 ? 'aluno encontrado' : 'alunos encontrados'}
          </div>
        </div>
      </div>

      {/* Bulk Actions Banner (appears when students are selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-sm font-semibold text-amber-200">
              {selectedIds.length === 1 ? '1 aluno selecionado' : `${selectedIds.length} alunos selecionados`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowMoveModal(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
              Mudar Turma
            </button>

            <button
              onClick={() => onBulkBlock(selectedIds)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              Bloquear
            </button>

            <button
              onClick={() => onBulkUnblock(selectedIds)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Unlock className="w-3.5 h-3.5" />
              Desbloquear
            </button>

            <button
              onClick={() => onBulkDelete(selectedIds)}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold rounded-lg border border-rose-500/40 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              Eliminar
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 text-slate-400 hover:text-white text-xs font-medium ml-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Main Students Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 w-12 text-center">
                  <button
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-white focus:outline-none"
                    title="Selecionar todos"
                  >
                    {allSelected ? (
                      <CheckSquare className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4">Aluno</th>
                <th className="py-3.5 px-4">Turma</th>
                <th className="py-3.5 px-4 text-center">Nível & XP</th>
                <th className="py-3.5 px-4 text-center">Mundos Desbloqueados</th>
                <th className="py-3.5 px-4 text-center">Média Global</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-400">Nenhum aluno encontrado.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchQuery || selectedClass !== 'all'
                        ? 'Tenta ajustar a pesquisa ou os filtros de turma.'
                        : 'Ainda não existem alunos registados na plataforma.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const isSelected = selectedIds.includes(s.id);
                  const isPassGlobal = s.globalAverage > 65;

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-800/50 transition-colors ${
                        isSelected ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleSelectStudent(s.id)}
                          className="text-slate-400 hover:text-white focus:outline-none"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <div
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => onOpenStudent(s)}
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-sm shrink-0 overflow-hidden shadow-inner group-hover:border-amber-500/50 transition-colors">
                            {s.avatar ? (
                              <span className="text-lg">🤖</span>
                            ) : (
                              s.name.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100 group-hover:text-amber-400 transition-colors flex items-center gap-2">
                              {s.name}
                              {s.needsHelp && (
                                <span
                                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                  title={s.helpReason || 'Necessita de apoio pedagógico'}
                                >
                                  <ShieldAlert className="w-3 h-3" />
                                  Apoio
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                              @{s.nickname} • <span className="text-slate-500">{s.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
                          {s.className}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-xs font-bold text-amber-400">
                            Nível {s.level}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {s.xp} XP
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((wId) => {
                            const isUnlocked = s.unlockedWorldsCount >= wId;
                            return (
                              <span
                                key={wId}
                                className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center border transition-all ${
                                  isUnlocked
                                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                                    : 'bg-slate-800/40 border-slate-800 text-slate-600'
                                }`}
                                title={`Mundo ${wId}: ${isUnlocked ? 'Desbloqueado' : 'Bloqueado'}`}
                              >
                                M{wId}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${
                            isPassGlobal
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : s.globalAverage > 0
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {s.globalAverage > 0 ? `${s.globalAverage}%` : '—'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {s.blocked ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <Lock className="w-3 h-3" />
                            Bloqueado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <Unlock className="w-3 h-3" />
                            Ativo
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenResetPassword(s)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 transition-colors"
                            title="Redefinir palavra-passe"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onToggleBlock(s.id)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              s.blocked
                                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 border-slate-700'
                            }`}
                            title={s.blocked ? 'Desbloquear aluno' : 'Bloquear aluno'}
                          >
                            {s.blocked ? (
                              <Unlock className="w-3.5 h-3.5" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => onOpenStudent(s)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all shadow-sm"
                          >
                            <span>Ficha</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Move Class Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-amber-400" />
              Mudar Turma em Massa
            </h3>
            <p className="text-xs text-slate-400">
              Estás prestes a mover <strong>{selectedIds.length}</strong> alunos para uma nova turma.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Seleciona a Turma de Destino:</label>
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                aria-label="Selecionar turma de destino"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Selecionar Turma --</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Turma {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowMoveModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleBulkMoveSubmit}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl"
              >
                Confirmar Transferência
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
