import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  Palette,
  Terminal,
  Brain,
  Sparkles,
  Lock,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { WorldSummary } from '../types';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';
import { PROGRESSION_CONFIG } from '../progressionConfig';
import { WORLDS_DATA } from '../data/catalog';
import { AssessmentModal } from './AssessmentModal';
import { World1ThematicView } from './World1ThematicView';
import { World2ThematicView } from './World2ThematicView';
import { World3ThematicView } from './World3ThematicView';
import { World4ThematicView } from './World4ThematicView';
import { World5ThematicView } from './World5ThematicView';

interface WorldsViewProps {
  initialWorldId?: number;
  onOpenSimulator: (worldId: number, simId: string) => void;
  onOpenLoginModal?: () => void;
}

export const WorldsView: React.FC<WorldsViewProps> = ({
  initialWorldId = 1,
  onOpenSimulator,
  onOpenLoginModal,
}) => {
  const { user, locale, refreshUser } = useAuth();
  const [worlds, setWorlds] = useState<WorldSummary[]>([]);
  const [selectedWorldId, setSelectedWorldId] = useState<number>(initialWorldId || 1);
  const [activeTab, setActiveTab] = useState<string>(`w${initialWorldId || 1}-t1`);
  const [loading, setLoading] = useState(true);

  // Sync when initialWorldId prop changes (e.g. from Dashboard or Sidebar)
  useEffect(() => {
    if (initialWorldId) {
      setSelectedWorldId(initialWorldId);
      setActiveTab(`w${initialWorldId}-t1`);
    }
  }, [initialWorldId]);

  // Keep activeTab in sync with selected world
  useEffect(() => {
    if (!activeTab.startsWith(`w${selectedWorldId}-`) && activeTab !== 'avaliacao') {
      setActiveTab(`w${selectedWorldId}-t1`);
    }
  }, [selectedWorldId]);

  // Assessment modal trigger
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    loadWorlds();
  }, [user?.id]);

  // Allow student to select and inspect worlds or see unlock criteria
  const loadWorlds = async () => {
    try {
      if (user?.id) {
        const res = await apiRequest('/api/pedagogical/worlds');
        if (res && res.worlds) {
          if (isTeacher) {
            const teacherWorlds = res.worlds.map((w: any) => ({
              ...w,
              isUnlocked: true,
            }));
            setWorlds(teacherWorlds);
          } else {
            setWorlds(res.worlds);
          }
        }
      } else {
        // Fallback for guest mode: only World 1 unlocked initially
        setWorlds(
          WORLDS_DATA.map((w) => ({
            ...w,
            isUnlocked: w.id === 1,
            average: 0,
            simulatorsProgress: w.simulators.map((s) => ({ id: s.id, completed: false, score: 0 })),
          } as any))
        );
      }
    } catch (err) {
      console.error('Failed to load worlds:', err);
      setWorlds(
        WORLDS_DATA.map((w) => ({
          ...w,
          isUnlocked: w.id === 1,
          average: 0,
        } as any))
      );
    } finally {
      setLoading(false);
    }
  };

  const currentWorld =
    worlds.find((w) => w.id === selectedWorldId) ||
    worlds[0] ||
    (WORLDS_DATA.find((w) => w.id === selectedWorldId) as any) ||
    (WORLDS_DATA[0] as any);

  const getWorldIcon = (wId: number) => {
    switch (wId) {
      case 1:
        return <Shield className="w-5 h-5 text-emerald-600" />;
      case 2:
        return <Search className="w-5 h-5 text-blue-600" />;
      case 3:
        return <Palette className="w-5 h-5 text-purple-600" />;
      case 4:
        return <Terminal className="w-5 h-5 text-amber-600" />;
      case 5:
        return <Sparkles className="w-5 h-5 text-indigo-600" />;
      default:
        return <Award className="w-5 h-5 text-slate-600" />;
    }
  };

  if (loading || !currentWorld) {
    return (
      <div className="py-20 text-center text-slate-500 font-semibold">
        A carregar os Mundos da Missão TIC...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white border-2 border-indigo-200 rounded-3xl p-8 sm:p-12 text-center shadow-lg space-y-6 animate-in fade-in">
        <div className="w-20 h-20 rounded-3xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-10 h-10 stroke-[2.5]" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Área de Alunos
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Entra na tua conta para começar!
          </h2>
          <p className="text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
            Entra com o teu nome de utilizador para explorares os 5 Mundos, testares os teus conhecimentos e guardares os teus pontos!
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onOpenLoginModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm px-8 py-3.5 rounded-2xl shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <span>Entrar na Conta 🔐</span>
          </button>
        </div>
      </div>
    );
  }

  // Progression gating:
  const visibleWorlds = worlds.length > 0 ? worlds : WORLDS_DATA.map((w, idx) => ({ ...w, isUnlocked: idx === 0, average: 0 } as any));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Teacher Test Mode Banner */}
      {isTeacher && (
        <div id="teacher-test-banner" className="bg-indigo-50/80 border border-indigo-200/90 rounded-2xl px-5 py-3 flex items-center justify-between gap-3 text-xs text-indigo-900 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="bg-indigo-600 text-white font-black px-2.5 py-0.5 rounded-lg text-[10px] uppercase tracking-wider shrink-0">
              Modo Docente / Teste
            </span>
            <span className="font-semibold">
              Todos os 5 Mundos, simuladores e avaliações estão desbloqueados para experimentação e validação pedagógica. Não existe acumulação de pontos nem XP no perfil de professor.
            </span>
          </div>
        </div>
      )}

      {/* Worlds Header Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-3 min-w-max">
          {visibleWorlds.map((world) => {
            const isSelected = world.id === selectedWorldId;
            const isUnlocked = isTeacher || Boolean(world.isUnlocked);

            const isAssessmentDone = Boolean(
              world.hasAssessment ||
              world.hasAssessmentPassed ||
              typeof world.bestAssessmentPercentage === 'number'
            );
            const completedSims = world.simulatorsProgress?.filter((p) => p.completed).length || 0;
            const totalMissions = (world.simulators?.length || (world.id >= 3 ? 6 : 5)) + 1;
            const routePercent = Math.min(
              100,
              Math.round(((completedSims + (isAssessmentDone ? 1 : 0)) / totalMissions) * 100)
            );

            return (
              <button
                key={world.id}
                onClick={() => {
                  setSelectedWorldId(world.id);
                  if (isUnlocked) {
                    setActiveTab(`w${world.id}-t1`);
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md'
                    : isUnlocked
                    ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    : 'bg-slate-100 text-slate-500 border border-slate-200 opacity-75'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-white'
                  }`}
                >
                  {isUnlocked ? (
                    getWorldIcon(world.id)
                  ) : world.isTeacherLocked ? (
                    <Lock className="w-4 h-4 text-rose-600" />
                  ) : (
                    <Lock className="w-4 h-4 text-amber-600" />
                  )}
                </div>
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider opacity-80 flex items-center gap-1">
                    <span>Mundo {world.id}</span>
                    {world.isTeacherLocked && (
                      <span className="text-[9px] text-rose-600 font-extrabold">(Prof.)</span>
                    )}
                  </div>
                  <div className="text-xs font-black truncate max-w-[130px]">
                    {world.title.replace(`MUNDO ${world.id} — `, '')}
                  </div>
                </div>
                {isUnlocked && routePercent > 0 && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md tabular-nums ${
                      isSelected ? 'bg-white/30 text-white' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {routePercent}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* If current world is locked for student */}
      {!currentWorld.isUnlocked && user?.role !== 'teacher' ? (
        <div className="bg-white rounded-3xl border border-amber-200/90 p-8 sm:p-12 text-center shadow-xs">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs ${
            currentWorld.isTeacherLocked ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
          }`}>
            <Lock className="w-8 h-8" />
          </div>
          <span className={`text-xs font-black uppercase tracking-wider block mb-1 ${
            currentWorld.isTeacherLocked ? 'text-rose-700' : 'text-amber-700'
          }`}>
            {currentWorld.isTeacherLocked ? 'Mundo guardado pela professora' : 'Mundo Bloqueado'}
          </span>
          <h3 className="text-2xl font-black text-slate-900 mb-2">
            {currentWorld.title} {currentWorld.isTeacherLocked ? '— Aguarda pela aula' : 'Bloqueado'}
          </h3>
          <p className="text-sm text-slate-600 font-medium max-w-md mx-auto mb-6 leading-relaxed">
            {currentWorld.isTeacherLocked
              ? 'A tua professora guardou este Mundo para a próxima aula. Fica atento às indicações na sala de aula!'
              : `Para desbloqueares o Mundo ${currentWorld.id}, completa todas as missões e a Avaliação Final do Mundo ${currentWorld.id - 1} com média acima de ${PROGRESSION_CONFIG.PASSING_THRESHOLD}%!`}
          </p>
          {currentWorld.id > 1 && (
            <button
              onClick={() => {
                setSelectedWorldId(currentWorld.id - 1);
                setActiveTab(`w${currentWorld.id - 1}-t1`);
              }}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-6 py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>Voltar ao Mundo {currentWorld.id - 1} e Treinar</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Progression Banner: Requirement to unlock the next world */}
          {!isTeacher && currentWorld.id < 5 && (() => {
            const nextWorld = worlds.find((w) => w.id === currentWorld.id + 1);
            const isNextUnlocked = Boolean(nextWorld?.isUnlocked);
            const totalSims = currentWorld.simulators?.length || 5;
            const completedSimsCount = currentWorld.simulatorsProgress?.filter((p: any) => p.completed).length || 0;
            const allSimsDone = completedSimsCount >= totalSims;
            const hasPassedQuiz = Boolean(
              currentWorld.hasAssessmentPassed ||
              (typeof currentWorld.bestAssessmentPercentage === 'number' && currentWorld.bestAssessmentPercentage >= PROGRESSION_CONFIG.QUIZ_PASSING_THRESHOLD)
            );
            const currentAvg = typeof currentWorld.average === 'number' ? currentWorld.average : 0;
            const meetsAverage = currentAvg > PROGRESSION_CONFIG.PASSING_THRESHOLD;
            const isNextWorldUnlocked = isNextUnlocked && allSimsDone && hasPassedQuiz && meetsAverage;

            return (
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs ${
                  isNextWorldUnlocked
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50/90 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isNextWorldUnlocked
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {isNextWorldUnlocked ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-black text-sm">
                      {isNextWorldUnlocked
                        ? `✓ Mundo ${currentWorld.id + 1} Desbloqueado!`
                        : `🔒 Como desbloquear o Mundo ${currentWorld.id + 1}`}
                    </div>
                    <div className="text-xs opacity-90 mt-0.5">
                      {isNextWorldUnlocked
                        ? `Parabéns! Completaste as ${totalSims} missões e a Avaliação Final do Mundo ${currentWorld.id} com média de ${currentAvg}%. Já podes entrar no Mundo ${currentWorld.id + 1}!`
                        : !allSimsDone
                        ? `Completa todas as missões (${completedSimsCount}/${totalSims} feitas) e faz a Avaliação Final com média acima de ${PROGRESSION_CONFIG.PASSING_THRESHOLD}% para abrir o Mundo ${currentWorld.id + 1}!`
                        : !hasPassedQuiz
                        ? `Boa! Já fizeste as ${totalSims} missões! Agora faz a Avaliação Final para conseguires média acima de ${PROGRESSION_CONFIG.PASSING_THRESHOLD}% e abrir o Mundo ${currentWorld.id + 1}.`
                        : `A tua média está em ${currentAvg}%. Precisas de mais de ${PROGRESSION_CONFIG.PASSING_THRESHOLD}% para abrir o Mundo ${currentWorld.id + 1}!`}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span
                    className={`px-3 py-1.5 rounded-xl font-black text-xs ${
                      isNextWorldUnlocked
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-200/80 text-amber-950'
                    }`}
                  >
                    {isNextWorldUnlocked
                      ? `Média: ${currentAvg}%`
                      : `Missões: ${completedSimsCount}/${totalSims} • Avaliação: ${hasPassedQuiz ? 'Feita' : 'Pendente'}`}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* World Hero & Navigation is rendered inside each World's bespoke ThematicView */}
          {/* ========================================================= */}
          {/* THEMATIC VIEWS (THEORY + SIMULATOR TOGETHER PER TOPIC)   */}
          {/* ========================================================= */}
          {currentWorld.id === 1 && (
            <World1ThematicView
              world={currentWorld}
              activeTopicId={activeTab}
              onNavigateTopic={(topicId) => setActiveTab(topicId)}
              onOpenAssessment={() => setShowAssessmentModal(true)}
              onRefreshWorld={loadWorlds}
            />
          )}

          {currentWorld.id === 2 && (
            <World2ThematicView
              world={currentWorld}
              activeTopicId={activeTab}
              onNavigateTopic={(topicId) => setActiveTab(topicId)}
              onOpenAssessment={() => setShowAssessmentModal(true)}
              onRefreshWorld={loadWorlds}
            />
          )}

          {currentWorld.id === 3 && (
            <World3ThematicView
              world={currentWorld}
              activeTopicId={activeTab}
              onNavigateTopic={(topicId) => setActiveTab(topicId)}
              onOpenAssessment={() => setShowAssessmentModal(true)}
              onRefreshWorld={loadWorlds}
            />
          )}

          {currentWorld.id === 4 && (
            <World4ThematicView
              world={currentWorld}
              activeTopicId={activeTab}
              onNavigateTopic={(topicId) => setActiveTab(topicId)}
              onOpenAssessment={() => setShowAssessmentModal(true)}
              onRefreshWorld={loadWorlds}
            />
          )}

          {currentWorld.id === 5 && (
            <World5ThematicView
              world={currentWorld}
              activeTopicId={activeTab}
              onNavigateTopic={(topicId) => setActiveTab(topicId)}
              onOpenAssessment={() => setShowAssessmentModal(true)}
              onRefreshWorld={loadWorlds}
            />
          )}
        </>
      )}

      {/* Assessment Modal */}
      {showAssessmentModal && (
        <AssessmentModal
          worldId={currentWorld.id}
          worldTitle={currentWorld.title}
          onClose={() => {
            setShowAssessmentModal(false);
            loadWorlds();
          }}
          onCompleted={() => loadWorlds()}
        />
      )}
    </div>
  );
};
