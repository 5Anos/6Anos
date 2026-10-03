import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  CheckCircle2,
  Lock,
  Unlock,
  BookOpen,
  HelpCircle,
  Sparkles,
  Save,
  GraduationCap,
  Layers,
  Flame,
} from 'lucide-react';
import { apiRequest } from '../../api';

interface ModuleVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: any[];
  onSuccess?: () => void;
}

const WORLDS_INFO = [
  { id: 1, title: 'Mundo 1: Segurança, Privacidade e Pegada Digital' },
  { id: 2, title: 'Mundo 2: Investigação, Pesquisa e Informação' },
  { id: 3, title: 'Mundo 3: Colaboração, Comunicação e Cidadania' },
  { id: 4, title: 'Mundo 4: Criação de Conteúdos Digitais' },
  { id: 5, title: 'Mundo 5: Algoritmos e Introdução à Programação' },
];

export const ModuleVisibilityModal: React.FC<ModuleVisibilityModalProps> = ({
  isOpen,
  onClose,
  classes = [],
  onSuccess,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(
    classes.length > 0 ? classes[0].id : ''
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Visibility state
  const [worldsVisibility, setWorldsVisibility] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
  });
  const [quizzesVisibility, setQuizzesVisibility] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
  });
  const [grandeMissaoVisible, setGrandeMissaoVisible] = useState(true);
  const [weeklyChallengeVisible, setWeeklyChallengeVisible] = useState(true);

  useEffect(() => {
    if (selectedClassId) {
      loadClassVisibility(selectedClassId);
    }
  }, [selectedClassId]);

  const loadClassVisibility = async (classId: string) => {
    try {
      setLoading(true);
      const res = await apiRequest(`/api/teacher/classes/${classId}/visibility`);
      if (res && res.visibility) {
        setWorldsVisibility(res.visibility.worlds || { 1: true, 2: true, 3: true, 4: true, 5: true });
        setQuizzesVisibility(res.visibility.quizzes || { 1: true, 2: true, 3: true, 4: true, 5: true });
        setGrandeMissaoVisible(res.visibility.grandeMissao ?? true);
        setWeeklyChallengeVisible(res.visibility.weeklyChallenge ?? true);
      }
    } catch (err) {
      console.error('Error loading class visibility:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWorld = (wId: number) => {
    setWorldsVisibility((prev) => ({
      ...prev,
      [wId]: !prev[wId],
    }));
  };

  const handleToggleQuiz = (wId: number) => {
    setQuizzesVisibility((prev) => ({
      ...prev,
      [wId]: !prev[wId],
    }));
  };

  const handleToggleAllWorlds = (enable: boolean) => {
    const updated: Record<number, boolean> = {};
    [1, 2, 3, 4, 5].forEach((id) => (updated[id] = enable));
    setWorldsVisibility(updated);
  };

  const handleToggleAllQuizzes = (enable: boolean) => {
    const updated: Record<number, boolean> = {};
    [1, 2, 3, 4, 5].forEach((id) => (updated[id] = enable));
    setQuizzesVisibility(updated);
  };

  const handleSave = async () => {
    if (!selectedClassId) return;
    try {
      setSaving(true);
      await apiRequest(`/api/teacher/classes/${selectedClassId}/visibility`, {
        method: 'PUT',
        body: JSON.stringify({
          visibility: {
            worlds: worldsVisibility,
            quizzes: quizzesVisibility,
            grandeMissao: grandeMissaoVisible,
            weeklyChallenge: weeklyChallengeVisible,
          },
        }),
      });

      setSuccessMessage('Configurações de visibilidade guardadas com sucesso na nuvem!');
      setTimeout(() => setSuccessMessage(null), 3000);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(err.message || 'Erro ao guardar configurações de visibilidade.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const currentClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden relative my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-300" />
              <span>Gestão de Visibilidade de Módulos e Quizzes</span>
            </h2>
            <p className="text-xs text-blue-100 font-medium mt-0.5">
              Controla que temas e testes de avaliação estão desbloqueados ou bloqueados para os alunos
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Class Selector Bar */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <div>
                <label className="text-xs font-bold text-slate-800 block">Turma a Configurar:</label>
                <span className="text-[11px] text-slate-500">As regras aplicam-se a todos os alunos desta turma</span>
              </div>
            </div>

            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-4 py-2 text-xs font-black text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  Turma {c.name}
                </option>
              ))}
            </select>
          </div>

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-slate-500">
              <span className="text-xs font-bold animate-pulse">A carregar definições da turma...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Section 1: Curricular Worlds (Mundos 1 a 5) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-black text-slate-800">
                      Temas Curriculares (Mundos 1 a 5)
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleAllWorlds(true)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      Desbloquear Todos
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => handleToggleAllWorlds(false)}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                    >
                      Bloquear Todos
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {WORLDS_INFO.map((w) => {
                    const isVisible = worldsVisibility[w.id] !== false;
                    return (
                      <div
                        key={w.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isVisible
                            ? 'bg-white border-slate-200 shadow-2xs'
                            : 'bg-slate-50/80 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                              isVisible ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            M{w.id}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{w.title}</div>
                            <div className="text-[10px] text-slate-500">
                              {isVisible ? 'Acessível aos alunos da turma' : 'Temporariamente oculto / bloqueado'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleWorld(w.id)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isVisible ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              isVisible ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Quizzes / Avaliações Finais */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-black text-slate-800">
                      Testes de Avaliação (Quizzes 1 a 5)
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleAllQuizzes(true)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      Desbloquear Todos
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => handleToggleAllQuizzes(false)}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                    >
                      Bloquear Todos
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {WORLDS_INFO.map((w) => {
                    const isVisible = quizzesVisibility[w.id] !== false;
                    return (
                      <div
                        key={w.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isVisible
                            ? 'bg-white border-slate-200 shadow-2xs'
                            : 'bg-slate-50/80 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center ${
                              isVisible ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            Q{w.id}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">Avaliação Mundo {w.id}</div>
                            <div className="text-[10px] text-slate-500">
                              {isVisible ? 'Teste Ativo' : 'Teste Bloqueado'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleQuiz(w.id)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isVisible ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              isVisible ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Extra Activities (Grande Missão & Desafio Semanal) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <h3 className="text-sm font-black text-slate-800">
                    Atividades Globais e Desafios
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      grandeMissaoVisible
                        ? 'bg-white border-slate-200 shadow-2xs'
                        : 'bg-slate-50/80 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 font-black text-xs flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Grande Missão Final</div>
                        <div className="text-[10px] text-slate-500">
                          {grandeMissaoVisible ? 'Acessível para a turma' : 'Bloqueado para a turma'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setGrandeMissaoVisible(!grandeMissaoVisible)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        grandeMissaoVisible ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          grandeMissaoVisible ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      weeklyChallengeVisible
                        ? 'bg-white border-slate-200 shadow-2xs'
                        : 'bg-slate-50/80 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 font-black text-xs flex items-center justify-center">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Desafio da Semana</div>
                        <div className="text-[10px] text-slate-500">
                          {weeklyChallengeVisible ? 'Acessível para a turma' : 'Bloqueado para a turma'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setWeeklyChallengeVisible(!weeklyChallengeVisible)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        weeklyChallengeVisible ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          weeklyChallengeVisible ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            A configurar turma: <strong>{currentClass?.name || '6.º Ano'}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-bold cursor-pointer"
            >
              Fechar
            </button>
            <button
              disabled={saving || !selectedClassId}
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'A Guardar...' : 'Guardar Alterações na Nuvem'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
