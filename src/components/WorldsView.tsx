import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  Palette,
  Terminal,
  Sparkles,
  Lock,
  CheckCircle2,
  Award,
  Key,
  Mail,
  ShieldCheck,
  Footprints,
  Heart,
  UserCheck,
  Calendar,
  Layers,
  AlertOctagon,
  MessageSquare,
  Smile,
  Users,
  FileText,
  Share2,
  Code,
  GitBranch,
  Repeat,
  BarChart2,
  Cpu,
  Wand2,
  AlertCircle,
  Brain,
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
  const [selectedWorldId, setSelectedWorldId] = useState<number>(initialWorldId);
  const [activeTab, setActiveTab] = useState<string>(`w${initialWorldId}-t1`);
  const [loading, setLoading] = useState(true);

  // Assessment modal trigger
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    if (user?.id) {
      loadWorlds();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  // Allow student to select and inspect worlds or see unlock criteria
  const loadWorlds = async () => {
    try {
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
    } catch (err) {
      console.error('Failed to load worlds:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 text-center shadow-sm">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <span className="text-xs font-black text-amber-700 uppercase tracking-wider block mb-1">
          Acesso Restrito
        </span>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Mundos Bloqueados — Registo Obrigatório
        </h2>
        <p className="text-sm text-slate-600 font-medium max-w-md mx-auto mb-6 leading-relaxed">
          Não é permitido aceder nem ver a informação dos 5 Mundos para pessoas que não estejam registadas na plataforma. Inicia sessão ou cria a tua conta para desbloquear o acesso!
        </p>
        <button
          onClick={() => onOpenLoginModal?.()}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-6 py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Lock className="w-4 h-4" />
          <span>Iniciar Sessão / Criar Conta</span>
        </button>
      </div>
    );
  }

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
        A carregar os Mundos Curriculares da Missão TIC...
      </div>
    );
  }

  const isSimCompleted = (simId: string) => {
    if (simId === 'assessment') {
      return (
        currentWorld.bestAssessmentPercentage !== null &&
        currentWorld.bestAssessmentPercentage > PROGRESSION_CONFIG.PASSING_THRESHOLD
      );
    }
    if (simId === 'mission') {
      return (
        currentWorld.missionProgress !== null &&
        (currentWorld.missionProgress.status === 'graded' || currentWorld.missionProgress.status === 'pending')
      );
    }
    return currentWorld.simulatorsProgress?.some((s) => s.id === simId && s.completed);
  };

  const world1Tabs = [
    { id: 'w1-t1', label: '🎯 Missão 1/6: Palavras-passe 🗝️', icon: Key, simId: 'sim-password' },
    { id: 'w1-t2', label: '🎯 Missão 2/6: Caça ao Phishing 🎣', icon: Mail, simId: 'sim-phishing' },
    {
      id: 'w1-t3',
      label: '🎯 Missão 3/6: Privacidade 🛡️',
      icon: ShieldCheck,
      simId: 'sim-privacy',
    },
    {
      id: 'w1-t4',
      label: '🎯 Missão 4/6: Rasto Digital 👣',
      icon: Footprints,
      simId: 'sim-digital-footprint',
    },
    {
      id: 'w1-t5',
      label: '🎯 Missão 5/6: Super-Corpo 🕹️',
      icon: Heart,
      simId: 'sim-digital-wellbeing',
    },
    {
      id: 'avaliacao',
      label: '🏆 Missão 6/6: Quiz do Guardião',
      icon: CheckCircle2,
      simId: 'assessment',
    },
  ];

  const world2Tabs = [
    { id: 'w2-t1', label: '🎯 Missão 1/6: Radar de Pesquisa 🔍', icon: Search, simId: 'sim-keywords' },
    { id: 'w2-t2', label: '🎯 Missão 2/6: Quem é o Autor? 🕵️', icon: UserCheck, simId: 'sim-author' },
    { id: 'w2-t3', label: '🎯 Missão 3/6: Linha do Tempo ⏳', icon: Calendar, simId: 'sim-date' },
    { id: 'w2-t4', label: '🎯 Missão 4/6: Comparar Pistas 📑', icon: Layers, simId: 'sim-compare' },
    { id: 'w2-t5', label: '🎯 Missão 5/6: Caça a Boatos 🚨', icon: AlertOctagon, simId: 'sim-news-detective' },
    {
      id: 'avaliacao',
      label: '🏆 Missão 6/6: Quiz do Detetive',
      icon: CheckCircle2,
      simId: 'assessment',
    },
  ];

  const world3Tabs = [
    { id: 'w3-t1', label: '🎯 Missão 1/7: Conversas & Emojis 💬', icon: MessageSquare, simId: 'sim-digital-comm' },
    { id: 'w3-t2', label: '🎯 Missão 2/7: Netiqueta Fixe ✨', icon: Smile, simId: 'sim-netiquette' },
    { id: 'w3-t3', label: '🎯 Missão 3/7: Super-Equipa Online 🤝', icon: Users, simId: 'sim-collab' },
    { id: 'w3-t4', label: '🎯 Missão 4/7: Direitos de Autor 🎨', icon: ShieldCheck, simId: 'sim-copyright' },
    { id: 'w3-t5', label: '🎯 Missão 5/7: Caça ao Plágio 📜', icon: FileText, simId: 'sim-plagiarism' },
    { id: 'w3-t6', label: '🎯 Missão 6/7: Licenças Livres 🔓', icon: Share2, simId: 'sim-cc' },
    {
      id: 'avaliacao',
      label: '🏆 Missão 7/7: Quiz do Criador',
      icon: CheckCircle2,
      simId: 'assessment',
    },
  ];

  const world4Tabs = [
    { id: 'w4-t1', label: '🎯 Missão 1/7: Fatiar Problemas 🧩', icon: Layers, simId: 'sim-decomposicao' },
    { id: 'w4-t2', label: '🎯 Missão 2/7: O Robô dos Algoritmos 🤖', icon: Code, simId: 'sim-block-coding' },
    { id: 'w4-t3', label: '🎯 Missão 3/7: Decisões: SE e SENÃO 🔀', icon: GitBranch, simId: 'sim-algoritmos' },
    { id: 'w4-t4', label: '🎯 Missão 4/7: Super-Ciclos 🔁', icon: Repeat, simId: 'sim-ciclos' },
    { id: 'w4-t5', label: '🎯 Missão 5/7: Caçadores de Dados 📊', icon: BarChart2, simId: 'sim-dados' },
    { id: 'w4-t6', label: '🎯 Missão 6/7: Caça aos Bugs 🐞', icon: AlertOctagon, simId: 'sim-debugging' },
    {
      id: 'avaliacao',
      label: '🏆 Missão 7/7: Quiz do Engenheiro',
      icon: CheckCircle2,
      simId: 'assessment',
    },
  ];

  const world5Tabs = [
    { id: 'w5-t1', label: '🎯 Missão 1/7: O que é a IA? 🧠', icon: Cpu, simId: 'sim-ia-concepts' },
    { id: 'w5-t2', label: '🎯 Missão 2/7: Máquinas que Criam 🎨', icon: Wand2, simId: 'sim-ai-generation' },
    { id: 'w5-t3', label: '🎯 Missão 3/7: Prompts Mágicos ✨', icon: Sparkles, simId: 'sim-prompt' },
    { id: 'w5-t4', label: '🎯 Missão 4/7: Quando a IA Falha 🔎', icon: AlertCircle, simId: 'sim-hallucination' },
    { id: 'w5-t5', label: '🎯 Missão 5/7: Cofre & Privacidade 🔐', icon: Lock, simId: 'sim-ai-responsibility' },
    { id: 'w5-t6', label: '🎯 Missão 6/7: O Humano é Quem Manda! 🚀', icon: Brain, simId: 'sim-recommendation' },
    {
      id: 'avaliacao',
      label: '🏆 Missão 7/7: Quiz da IA',
      icon: CheckCircle2,
      simId: 'assessment',
    },
  ];

  const getCurrentWorldTabs = () => {
    switch (currentWorld.id) {
      case 1:
        return world1Tabs;
      case 2:
        return world2Tabs;
      case 3:
        return world3Tabs;
      case 4:
        return world4Tabs;
      case 5:
        return world5Tabs;
      default:
        return world1Tabs;
    }
  };

  // Progression gating:
  // Visible worlds: All 5 worlds are in the selector. Teachers have all unlocked; students have Mundo 1 unlocked and progress sequentially (> 70%).
  const visibleWorlds = isTeacher
    ? (worlds.length > 0 ? worlds.map((w) => ({ ...w, isUnlocked: true })) : WORLDS_DATA.map((w) => ({ ...w, isUnlocked: true, average: 0 } as any)))
    : (worlds.length > 0 ? worlds : WORLDS_DATA.map((w) => ({ ...w, isUnlocked: w.id === 1, average: 0 } as any)));

  const currentTabs = getCurrentWorldTabs();

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
              Todos os 5 Mundos, simuladores e quizzes estão desbloqueados para experimentação e validação pedagógica. Não existe acumulação de pontos nem XP no perfil de professor.
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
                {isUnlocked && world.average > 0 && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                      isSelected ? 'bg-white/30 text-white' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {world.average}%
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
            {currentWorld.isTeacherLocked ? 'Módulo Reservado pela Professora' : 'Desbloqueio Progressivo Obrigatório'}
          </span>
          <h3 className="text-2xl font-black text-slate-900 mb-2">
            {currentWorld.title} {currentWorld.isTeacherLocked ? 'Reservado' : 'Bloqueado'}
          </h3>
          <p className="text-sm text-slate-600 font-medium max-w-md mx-auto mb-6 leading-relaxed">
            {currentWorld.isTeacherLocked
              ? 'A tua Professora reservou temporariamente este Mundo para a próxima aula presencial. Fica atento às instruções na sala de aula!'
              : `Para acederes e realizares as atividades do Mundo ${currentWorld.id}, precisas de alcançar uma média global superior a ${PROGRESSION_CONFIG.PASSING_THRESHOLD}% (dos simuladores e do quiz de avaliação) no Mundo ${currentWorld.id - 1}.`}
          </p>
          {!currentWorld.isTeacherLocked && currentWorld.id > 1 && (
            <button
              onClick={() => {
                setSelectedWorldId(currentWorld.id - 1);
                setActiveTab(`w${currentWorld.id - 1}-t1`);
              }}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-6 py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>Voltar ao Mundo {currentWorld.id - 1} e Praticar</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Progression Banner: Requirement to unlock the next world */}
          {!isTeacher && currentWorld.id < 5 && (
            <div
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs ${
                currentWorld.average > PROGRESSION_CONFIG.PASSING_THRESHOLD
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/90 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    currentWorld.average > PROGRESSION_CONFIG.PASSING_THRESHOLD
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {currentWorld.average > PROGRESSION_CONFIG.PASSING_THRESHOLD ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="font-black text-sm">
                    {currentWorld.average > PROGRESSION_CONFIG.PASSING_THRESHOLD
                      ? `✓ Mundo ${currentWorld.id + 1} Desbloqueado!`
                      : `Acesso ao Mundo ${currentWorld.id + 1} — Requer Média Global > 70%`}
                  </div>
                  <div className="text-xs opacity-90 mt-0.5">
                    {currentWorld.average > PROGRESSION_CONFIG.PASSING_THRESHOLD
                      ? `Excelente! A tua média global no Mundo ${currentWorld.id} é de ${currentWorld.average}% (> 70%). O Mundo ${currentWorld.id + 1} já se encontra acessível!`
                      : `Para desbloquear e ver o Mundo ${currentWorld.id + 1}, a tua média global (dos simuladores e do quiz de avaliação) tem de ser superior a 70%. Média atual: ${currentWorld.average}%.`}
                  </div>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <span
                  className={`px-3 py-1.5 rounded-xl font-black text-xs ${
                    currentWorld.average > PROGRESSION_CONFIG.PASSING_THRESHOLD
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-200/80 text-amber-950'
                  }`}
                >
                  Média: {currentWorld.average}% / &gt; 70%
                </span>
              </div>
            </div>
          )}

          {/* World Hero & Intro (For World 2, the dedicated Detective Hero renders inside World2ThematicView) */}
          {currentWorld.id !== 2 && (
            <div className="bg-gradient-to-br from-blue-50/80 via-white to-sky-50/50 border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-xs font-black text-blue-600 uppercase tracking-wider">
                    {currentWorld.title}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                    {currentWorld.subtitle}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white border border-blue-200 rounded-2xl px-4 py-2 text-center shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Média do Mundo
                    </span>
                    <span className="text-base font-black text-blue-700">
                      {currentWorld.average > 0 ? `${currentWorld.average}%` : '0%'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Micro-Mission Goal Banner */}
              {(() => {
                const catalogIntro = WORLDS_DATA.find((w) => w.id === currentWorld.id)?.intro;
                const intro = currentWorld.intro || catalogIntro;
                if (!intro?.mission) return null;
                return (
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 border border-blue-200/80 rounded-2xl px-4 py-2 text-xs font-bold">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{intro.mission}</span>
                  </div>
                );
              })()}

              {/* Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-blue-100">
                {currentTabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  const completed = isSimCompleted(tab.simId);

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3.5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
                        active
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-blue-50/80 border border-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="whitespace-nowrap">{tab.label}</span>
                      {completed && (
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            active ? 'bg-emerald-300' : 'bg-emerald-500'
                          }`}
                          title="Atividade Concluída"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
