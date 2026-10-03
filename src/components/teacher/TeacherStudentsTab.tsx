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
  UserPlus,
  Scissors,
  FileSpreadsheet,
  Sliders,
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit2,
  Save,
  X,
  Zap,
} from 'lucide-react';
import { AvatarRenderer } from '../avatar/AvatarRenderer';
import { PROGRESSION_CONFIG } from '../../progressionConfig';
import { apiRequest } from '../../api';

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
  onDeleteStudent?: (studentId: string) => void;
  onOpenImport?: () => void;
  onOpenLoginCards?: () => void;
  onExportCredentialsXLSX?: () => void;
  onOpenVisibility?: () => void;
  onRefresh?: () => void;
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
  onDeleteStudent,
  onOpenImport,
  onOpenLoginCards,
  onExportCredentialsXLSX,
  onOpenVisibility,
  onRefresh,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetClassId, setTargetClassId] = useState('');
  const [showMoveModal, setShowMoveModal] = useState(false);

  // Visibility of passwords per student id
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 1-Click Quick Reset feedback dialog
  const [quickResetResult, setQuickResetResult] = useState<{
    studentName: string;
    newPassword: string;
    username: string;
  } | null>(null);

  // Edit Student Modal
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editStudentNumber, setEditStudentNumber] = useState<number>(1);
  const [editTurma, setEditTurma] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const studentList = Array.isArray(students) ? students : [];

  const filteredStudents = studentList.filter((s) => {
    const matchesClass =
      selectedClass === 'all' || s.classId === selectedClass || s.turma === selectedClass;
    const matchesSearch =
      searchQuery === '' ||
      (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyCredentials = (student: any) => {
    const text = `Aluno: ${student.fullName || student.name}\nTurma: ${student.turma || student.className}\nUsername: ${student.username || student.nickname}\nPassword: ${student.initialPassword || '—'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // 1-Click Quick Password Reset
  const handleQuickResetPassword = async (student: any) => {
    try {
      const res = await apiRequest(`/api/teacher/students/${student.id}/quick-reset-password`, {
        method: 'POST',
      });
      if (res && res.newPassword) {
        setQuickResetResult({
          studentName: student.fullName || student.name,
          username: student.username || student.nickname,
          newPassword: res.newPassword,
        });
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao redefinir palavra-passe');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (student: any) => {
    setEditingStudent(student);
    setEditFullName(student.fullName || student.name || '');
    setEditStudentNumber(student.studentNumber || 1);
    setEditTurma(student.turma || student.className || '6.º A');
    setEditUsername(student.username || student.nickname || '');
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      setIsSavingEdit(true);
      await apiRequest(`/api/teacher/students/${editingStudent.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          fullName: editFullName.trim(),
          studentNumber: editStudentNumber,
          turma: editTurma,
          username: editUsername.trim(),
        }),
      });
      setEditingStudent(null);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar aluno');
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar with 4 Key Teacher Features */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 rounded-3xl p-5 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-300" />
            <span>Gestão Geral de Alunos & Credenciais Kid-Friendly</span>
          </h2>
          <p className="text-xs text-blue-100 font-medium mt-0.5">
            Palavras-passe amigáveis guardadas e cartões de acesso recortáveis prontos para a sala de aula
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Registar / Importar Alunos</span>
            </button>
          )}

          {onOpenLoginCards && (
            <button
              onClick={onOpenLoginCards}
              className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer backdrop-blur-xs"
            >
              <Scissors className="w-4 h-4 text-amber-300" />
              <span>Cartões de Acesso (A4)</span>
            </button>
          )}

          {onExportCredentialsXLSX && (
            <button
              onClick={onExportCredentialsXLSX}
              className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer backdrop-blur-xs"
              title="Exportar pauta privada com todos os nomes, utilizadores e palavras-passe"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Exportar Credenciais (.xlsx)</span>
            </button>
          )}

          {onOpenVisibility && (
            <button
              onClick={onOpenVisibility}
              className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer backdrop-blur-xs"
              title="Gerir visibilidade de módulos e quizzes por turma"
            >
              <Sliders className="w-4 h-4 text-blue-200" />
              <span>Visibilidade Módulos</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center shadow-xs">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por nome completo, número, utilizador ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              aria-label="Filtrar por turma"
              className="bg-transparent text-slate-800 text-sm font-bold focus:outline-none cursor-pointer pr-2"
            >
              <option value="all" className="bg-white text-slate-800">
                Todas as Turmas ({students.length})
              </option>
              {classes.map((c) => {
                const count = students.filter((s) => s.classId === c.id || s.turma === c.name).length;
                return (
                  <option key={c.id} value={c.id} className="bg-white text-slate-800">
                    Turma {c.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
            {filteredStudents.length} {filteredStudents.length === 1 ? 'aluno ordenado' : 'alunos ordenados'} por Turma e N.º
          </div>
        </div>
      </div>

      {/* Bulk Actions Banner */}
      {selectedIds.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-amber-500 text-white font-bold text-sm flex items-center justify-center shadow-xs">
              {selectedIds.length}
            </span>
            <span className="text-sm font-semibold text-amber-900">
              {selectedIds.length === 1 ? '1 aluno selecionado' : `${selectedIds.length} alunos selecionados`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowMoveModal(true)}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
              Mudar Turma
            </button>

            <button
              onClick={() => onBulkBlock(selectedIds)}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-amber-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              Bloquear
            </button>

            <button
              onClick={() => onBulkUnblock(selectedIds)}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-emerald-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Unlock className="w-3.5 h-3.5 text-emerald-600" />
              Desbloquear
            </button>

            <button
              onClick={() => onBulkDelete(selectedIds)}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              Eliminar
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-medium ml-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Main Students Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 w-12 text-center">
                  <button
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-slate-700 focus:outline-none"
                    title="Selecionar todos"
                  >
                    {allSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-3 w-16 text-center">N.º</th>
                <th className="py-3.5 px-4">Aluno (Nome Oficial)</th>
                <th className="py-3.5 px-3">Turma</th>
                <th className="py-3.5 px-4">Utilizador (Username)</th>
                <th className="py-3.5 px-4">Palavra-passe (Amigável)</th>
                <th className="py-3.5 px-3 text-center">Nível & XP</th>
                <th className="py-3.5 px-3 text-center">Média Global</th>
                <th className="py-3.5 px-3 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-bold text-slate-700 text-base">Nenhum aluno encontrado.</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      {searchQuery || selectedClass !== 'all'
                        ? 'Tenta ajustar a pesquisa ou o filtro de turma.'
                        : 'Utiliza o botão "Registar / Importar Alunos" acima para adicionar a tua turma a partir de Excel, CSV ou lista de texto.'}
                    </p>
                    {onOpenImport && (
                      <button
                        onClick={onOpenImport}
                        className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Registar ou Importar Alunos Agora</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const isSelected = selectedIds.includes(s.id);
                  const isPassGlobal = s.globalAverage >= PROGRESSION_CONFIG.PASSING_THRESHOLD;
                  const isPwdVisible = !!visiblePasswords[s.id];
                  const password = s.initialPassword || '••••••';
                  const username = s.username || s.nickname;

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleSelectStudent(s.id)}
                          className="text-slate-400 hover:text-slate-700 focus:outline-none"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Call number */}
                      <td className="py-3 px-3 text-center">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-mono font-bold text-xs inline-flex items-center justify-center">
                          {s.studentNumber || '—'}
                        </span>
                      </td>

                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => onOpenStudent(s)}
                        >
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-blue-600 text-xs shrink-0 overflow-hidden shadow-2xs group-hover:border-blue-400 transition-colors">
                            <AvatarRenderer avatar={s.avatar} size={36} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                              {s.fullName || s.name}
                              {s.needsHelp && (
                                <span
                                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200"
                                  title={s.helpReason || 'Necessita de apoio pedagógico'}
                                >
                                  <ShieldAlert className="w-3 h-3" />
                                  Apoio
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {s.name && s.fullName && s.name !== s.fullName && (
                                <span className="text-slate-500 mr-2">{s.name}</span>
                              )}
                              <span>{s.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Turma */}
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs font-black text-blue-800">
                          {s.turma || s.className}
                        </span>
                      </td>

                      {/* Username */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-blue-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                          <span>@{username}</span>
                        </div>
                      </td>

                      {/* Kid Friendly Password with show/hide and copy */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono text-xs font-bold px-2 py-1 rounded-lg border flex items-center gap-1 ${
                              isPwdVisible
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            <Key className="w-3 h-3 text-emerald-600" />
                            <span>{isPwdVisible ? password : '••••••'}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(s.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title={isPwdVisible ? 'Ocultar palavra-passe' : 'Revelar palavra-passe'}
                          >
                            {isPwdVisible ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyCredentials(s)}
                            className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Copiar credenciais do aluno"
                          >
                            {copiedId === s.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Nível & XP */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-xs font-bold text-amber-700">Nível {s.level}</span>
                          <span className="text-[11px] font-mono text-slate-500">{s.xp} XP</span>
                        </div>
                      </td>

                      {/* Média Global */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold font-mono border ${
                            isPassGlobal
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : s.globalAverage > 0
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {s.globalAverage > 0 ? `${s.globalAverage}%` : '—'}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-3 text-center">
                        {s.blocked ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            <Lock className="w-3 h-3" />
                            Bloqueado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Unlock className="w-3 h-3" />
                            Ativo
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Click Fast Reset Password */}
                          <button
                            type="button"
                            onClick={() => handleQuickResetPassword(s)}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors"
                            title="⚡ 1-Clique: Gerar nova palavra-passe amigável"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-600" />
                          </button>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-blue-600 border border-slate-200 transition-colors"
                            title="Editar dados do aluno"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Dossier */}
                          <button
                            type="button"
                            onClick={() => onOpenStudent(s)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-2xs"
                            title="Ver ficha pedagógica completa"
                          >
                            <span>Ficha</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>

                          {/* Delete */}
                          {onDeleteStudent && (
                            <button
                              type="button"
                              onClick={() => onDeleteStudent(s.id)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                              title="Eliminar aluno"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* 1-Click Password Reset Result Dialog */}
      {quickResetResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Zap className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                Nova Palavra-passe Gerada!
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Para o aluno: <strong>{quickResetResult.studentName}</strong> (@{quickResetResult.username})
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Nova Palavra-passe Amigável:
              </div>
              <div className="text-2xl font-black font-mono text-emerald-700 tracking-wider">
                {quickResetResult.newPassword}
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Esta palavra-passe já está ativa no sistema e guardada na ficha do aluno. Podes comunicá-la ao aluno agora.
            </p>

            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(quickResetResult.newPassword);
                  alert('Palavra-passe copiada para a área de transferência!');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-200"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </button>

              <button
                type="button"
                onClick={() => setQuickResetResult(null)}
                className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                Compreendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <span>Editar Dados do Aluno</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nome Completo Oficial:</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">N.º Chamada:</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editStudentNumber}
                    onChange={(e) => setEditStudentNumber(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Turma:</label>
                  <select
                    value={editTurma}
                    onChange={(e) => setEditTurma(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    <option value="6.º A">6.º A</option>
                    <option value="6.º B">6.º B</option>
                    <option value="6.º C">6.º C</option>
                    <option value="6.º D">6.º D</option>
                    <option value="6.º E">6.º E</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nome de Utilizador (Username):</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingEdit ? 'A Gravar...' : 'Gravar Alterações'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Move Class Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-amber-600" />
              Mudar Turma em Massa
            </h3>
            <p className="text-xs text-slate-600">
              Estás prestes a mover <strong className="text-slate-900">{selectedIds.length}</strong> alunos para uma nova turma.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Seleciona a Turma de Destino:</label>
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                aria-label="Selecionar turma de destino"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Selecionar Turma --</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Turma {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowMoveModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleBulkMoveSubmit}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
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
