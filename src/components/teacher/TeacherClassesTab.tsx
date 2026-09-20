import React, { useState } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  ArrowRightLeft,
  Award,
  Sparkles,
  BookOpen,
  X,
  Save,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { apiRequest } from '../../api';
import { PROGRESSION_CONFIG } from '../../progressionConfig';

interface TeacherClassesTabProps {
  classes: any[];
  students: any[];
  onRefresh: () => void;
  onOpenStudent: (student: any) => void;
}

export const TeacherClassesTab: React.FC<TeacherClassesTabProps> = ({
  classes = [],
  students = [],
  onRefresh,
  onOpenStudent,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassCode, setNewClassCode] = useState('');
  const [creating, setCreating] = useState(false);

  const classList = Array.isArray(classes) ? classes : [];
  const studentList = Array.isArray(students) ? students : [];

  const [selectedClassForDetails, setSelectedClassForDetails] = useState<any | null>(null);
  const [editClassName, setEditClassName] = useState('');
  const [editClassCode, setEditClassCode] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Student transfer within class modal
  const [transferringStudent, setTransferringStudent] = useState<any | null>(null);
  const [targetClassId, setTargetClassId] = useState('');

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      alert('Preenche o nome da turma (ex: 6.º A).');
      return;
    }
    try {
      setCreating(true);
      await apiRequest('/api/teacher/classes', {
        method: 'POST',
        body: JSON.stringify({
          name: newClassName.trim(),
          code: '',
        }),
      });
      setNewClassName('');
      setNewClassCode('');
      setShowCreateModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar turma.');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenClassDetails = (c: any) => {
    setSelectedClassForDetails(c);
    setEditClassName(c.name);
    setEditClassCode(c.code || '');
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassForDetails || !editClassName.trim()) return;
    try {
      setSavingEdit(true);
      await apiRequest(`/api/teacher/classes/${selectedClassForDetails.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editClassName.trim(),
          code: '',
        }),
      });
      setSelectedClassForDetails(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar turma.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    if (!confirm(`Tens a certeza que desejas eliminar a turma ${className}? Os alunos associados ficarão "Sem Turma".`)) {
      return;
    }
    try {
      await apiRequest(`/api/teacher/classes/${classId}`, {
        method: 'DELETE',
      });
      setSelectedClassForDetails(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao eliminar turma.');
    }
  };

  const handleTransferStudent = async () => {
    if (!transferringStudent || !targetClassId) return;
    try {
      await apiRequest(`/api/teacher/students/${transferringStudent.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          classId: targetClassId === 'none' ? '' : targetClassId,
        }),
      });
      setTransferringStudent(null);
      setTargetClassId('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao transferir aluno.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            Gestão de Turmas ({classList.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Organiza os teus alunos em turmas para facilitar o acompanhamento pedagógico e geração de pautas.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Turma</span>
        </button>
      </div>

      {/* Classes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classList.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 shadow-xs">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="font-semibold text-slate-700">Nenhuma turma criada ainda.</p>
            <p className="text-xs text-slate-500 mt-1">Cria a tua primeira turma (ex: 6.º A) para agrupar os alunos.</p>
          </div>
        ) : (
          classList.map((c) => {
            const classStudents = studentList.filter((s) => s.classId === c.id);
            const totalXP = classStudents.reduce((acc, s) => acc + (s.xp || 0), 0);
            const avgXP = classStudents.length > 0 ? Math.round(totalXP / classStudents.length) : 0;
            const avgPass =
              classStudents.length > 0
                ? Math.round(
                    classStudents.reduce((acc, s) => acc + (s.globalAverage || 0), 0) /
                      classStudents.length
                  )
                : 0;

            return (
              <div
                key={c.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mt-0.5">Turma {c.name}</h4>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                      {classStudents.length} {classStudents.length === 1 ? 'aluno' : 'alunos'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <div className="text-slate-500 text-[11px]">XP Médio</div>
                      <div className="font-bold font-mono text-amber-700 text-sm mt-0.5">
                        {avgXP} XP
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <div className="text-slate-500 text-[11px]">Média da Turma</div>
                      <div
                        className={`font-bold font-mono text-sm mt-0.5 ${
                          avgPass >= PROGRESSION_CONFIG.PASSING_THRESHOLD ? 'text-emerald-700' : 'text-slate-700'
                        }`}
                      >
                        {avgPass > 0 ? `${avgPass}%` : '—'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => handleDeleteClass(c.id, c.name)}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                    title="Eliminar Turma"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenClassDetails(c)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-amber-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    <span>Gerir Turma</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-600" />
                Criar Nova Turma
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Nome da Turma (ex: 6.º A, 6.º B, 6.º C, 6.º D, 6.º E):
                </label>
                <input
                  type="text"
                  placeholder="ex: 6.º A"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {creating ? 'A criar...' : 'Criar Turma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Details & Student Roster Drawer/Modal */}
      {selectedClassForDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-600" />
                  Turma {selectedClassForDetails.name}
                </h3>
              </div>

              <button
                onClick={() => setSelectedClassForDetails(null)}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Edit form */}
              <form onSubmit={handleUpdateClass} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase">Editar Informação da Turma</div>
                <div>
                  <label className="text-xs text-slate-500">Nome da Turma:</label>
                  <input
                    type="text"
                    value={editClassName}
                    onChange={(e) => setEditClassName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingEdit ? 'A guardar...' : 'Guardar Alterações'}
                  </button>
                </div>
              </form>

              {/* Students in Class */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Alunos nesta Turma (
                    {students.filter((s) => s.classId === selectedClassForDetails.id).length}
                    )
                  </h4>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {students
                      .filter((s) => s.classId === selectedClassForDetails.id)
                      .map((st) => (
                        <div
                          key={st.id}
                          className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                          <div
                            onClick={() => {
                              setSelectedClassForDetails(null);
                              onOpenStudent(st);
                            }}
                            className="cursor-pointer group flex items-center gap-3"
                          >
                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center">
                              {st.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                                {st.name}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                @{st.nickname} • {st.xp} XP • Nível {st.level}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setTransferringStudent(st);
                                setTargetClassId('');
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-amber-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center gap-1 transition-colors"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              Transferir
                            </button>
                          </div>
                        </div>
                      ))}

                    {students.filter((s) => s.classId === selectedClassForDetails.id).length === 0 && (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        Não existem alunos associados a esta turma.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Single Student Modal */}
      {transferringStudent && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-amber-600" />
              Transferir Aluno
            </h3>
            <p className="text-xs text-slate-600">
              Seleciona a nova turma para <strong>{transferringStudent.name}</strong>:
            </p>

            <select
              value={targetClassId}
              onChange={(e) => setTargetClassId(e.target.value)}
              aria-label="Selecionar nova turma para o aluno"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
            >
              <option value="">-- Selecionar Turma --</option>
              <option value="none">Sem Turma (Remover da turma atual)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  Turma {c.name} ({c.code})
                </option>
              ))}
            </select>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setTransferringStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleTransferStudent}
                disabled={!targetClassId}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl disabled:opacity-40 shadow-xs"
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
