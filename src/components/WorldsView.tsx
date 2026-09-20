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

  useEffect(() => {
    if (user?.id) {
      loadWorlds();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const loadWorlds = async () => {
    try {
      const res = await apiRequest('/api/pedagogical/worlds');
      if (res && res.worlds) {
        setWorlds(res.worlds);
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

  const currentWorld = worlds.find((w) => w.id === selectedWorldId) || worlds[0];

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
        currentWorld.bestAssessmentPercentage >= 75
      );
    }
    return currentWorld.simulatorsProgress?.some((s) => s.id === simId && s.completed);
  };

  const world1Tabs = [
    { id: 'w1-t1', label: '1. Palavras-passe', icon: Key, simId: 'sim-password' },
    { id: 'w1-t2', label: '2. Phishing', icon: Mail, simId: 'sim-phishing' },
    {
      id: 'w1-t3',
      label: '3. Privacidade / Dados pessoais',
      icon: ShieldCheck,
      simId: 'sim-privacy',
    },
    {
      id: 'w1-t4',
      label: '4. Pegada digital',
      icon: Footprints,
      simId: 'sim-digital-footprint',
    },
    {
      id: 'w1-t5',
      label: '5. Bem-estar digital',
      icon: Heart,
      simId: 'sim-digital-wellbeing',
    },
    {
      id: 'avaliacao',
      label: '6. Avaliação Final (10 Perguntas)',
      icon: CheckCircle2,
      simId: 'assessment',
    },
  ];

  const world2Tabs = [
    { id: 'w2-t1', label: '1. Palavras-chave', icon: Search, simId: 'sim-keywords' },
    { id: 'w2-t2', label: '2. Autoria', icon: UserCheck, simId: 'sim-author' },
    { id: 'w2-t3', label: '3. Data e Atualidade', icon: Calendar, simId: 'sim-date' },
    { id: 'w2-t4', label: '4. Comparar fontes', icon: Layers, simId: 'sim-compare' },
    { id: 'w2-t5', label: '5. Notícias falsas', icon: AlertOctagon, simId: 'sim-news-detective' },
    {
      id: 'avaliacao',
      label: '6. Avaliação Final (10 Perguntas)',
      icon: CheckCircle2,
      simId: 'assessment',
    },
  ];

  const world3Tabs = [
    { id: 'w3-t1', label: '1. Comunicação digital', icon: MessageSquare, simId: 'sim-digital-comm' },
    { id: 'w3-t2', label: '2. Netiqueta', icon: Smile, simId: 'sim-netiquette' },
    { id: 'w3-t3', label: '3. Colaboração online', icon: Users, simId: 'sim-collab' },
    { id: 'w3-t4', label: '4. Direitos de autor', icon: ShieldCheck, simId: 'sim-copyright' },
    { id: 'w3-t5', label: '5. Plágio e citação', icon: FileText, simId: 'sim-plagiarism' },
    { id: 'w3-t6', label: '6. Creative Commons', icon: Share2, simId: 'sim-cc' },
    {
      id: 'avaliacao',
      label: '7. Avaliação Final (10 Perguntas)',
      icon: CheckCircle2,
      simId: 'assessment',
    },
  ];

  const world4Tabs = [
    { id: 'w4-t1', label: '1. Dividir um problema', icon: Layers, simId: 'sim-decomposicao' },
    { id: 'w4-t2', label: '2. Algoritmos', icon: Code, simId: 'sim-block-coding' },
    { id: 'w4-t3', label: '3. Condições', icon: GitBranch, simId: 'sim-algoritmos' },
    { id: 'w4-t4', label: '4. Repetições', icon: Repeat, simId: 'sim-ciclos' },
    { id: 'w4-t5', label: '5. Dados', icon: BarChart2, simId: 'sim-dados' },
    { id: 'w4-t6', label: '6. Debugging', icon: AlertOctagon, simId: 'sim-debugging' },
    {
      id: 'avaliacao',
      label: '7. Avaliação Final (10 Perguntas)',
      icon: CheckCircle2,
      simId: 'assessment',
    },
  ];

  const world5Tabs = [
    { id: 'w5-t1', label: '1. O que é IA?', icon: Cpu, simId: 'sim-ia-concepts' },
    { id: 'w5-t2', label: '2. IA generativa', icon: Wand2, simId: 'sim-ai-generation' },
    { id: 'w5-t3', label: '3. Prompts', icon: Sparkles, simId: 'sim-prompt' },
    { id: 'w5-t4', label: '4. A IA pode enganar-se', icon: AlertCircle, simId: 'sim-hallucination' },
    { id: 'w5-t5', label: '5. Privacidade e IA', icon: Lock, simId: 'sim-ai-responsibility' },
    { id: 'w5-t6', label: '6. Pensar com a IA', icon: Brain, simId: 'sim-recommendation' },
    {
      id: 'avaliacao',
      label: '7. Avaliação Final (10 Perguntas)',
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

  const currentTabs = getCurrentWorldTabs();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Worlds Header Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-3 min-w-max">
          {worlds.map((world) => {
            const isSelected = world.id === selectedWorldId;
            const isUnlocked = user?.role === 'teacher' || Boolean(world.isUnlocked);

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
                  {isUnlocked ? getWorldIcon(world.id) : <Lock className="w-4 h-4 text-amber-600" />}
                </div>
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider opacity-80 flex items-center gap-1">
                    <span>Mundo {world.id}</span>
                    {!isUnlocked && <span className="text-amber-600 font-black">🔒</span>}
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
                {!isUnlocked && (
                  <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                    &gt; 75% M{world.id - 1}
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
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Lock className="w-8 h-8" />
          </div>
          <span className="text-xs font-black text-amber-700 uppercase tracking-wider block mb-1">
            Desbloqueio Progressivo Obrigatório
          </span>
          <h3 className="text-2xl font-black text-slate-900 mb-2">
            {currentWorld.title} Bloqueado
          </h3>
          <p className="text-sm text-slate-600 font-medium max-w-md mx-auto mb-6 leading-relaxed">
            Para acederes e realizares as atividades do <strong>Mundo {currentWorld.id}</strong>, precisas de alcançar uma pontuação média superior a <strong>75%</strong> no <strong>Mundo {currentWorld.id - 1}</strong>.
          </p>
          <button
            onClick={() => {
              setSelectedWorldId(currentWorld.id - 1);
              setActiveTab(`w${currentWorld.id - 1}-t1`);
            }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-6 py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span>Voltar ao Mundo {currentWorld.id - 1} e Praticar</span>
          </button>
        </div>
      ) : (
        <>
          {/* World Hero & Intro */}
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

            {/* Intro text from prompt */}
            <div className="bg-white/80 border border-blue-100 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 space-y-1.5 leading-relaxed">
              <p className="font-bold text-blue-900">{currentWorld.intro.greeting}</p>
              {currentWorld.intro.description.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
              <p className="font-extrabold text-blue-600 pt-1">
                {currentWorld.intro.mission}
              </p>
            </div>

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

          {/* ========================================================= */}
          {/* THEMATIC VIEWS (THEORY + SIMULATOR TOGETHER PER TOPIC) */}
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
