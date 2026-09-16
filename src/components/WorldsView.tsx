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
  BookOpen,
  ArrowRight,
  Send,
  HelpCircle,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { WorldSummary } from '../types';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';
import { AssessmentModal } from './AssessmentModal';

interface WorldsViewProps {
  initialWorldId?: number;
  onOpenSimulator: (worldId: number, simId: string) => void;
}

export const WorldsView: React.FC<WorldsViewProps> = ({
  initialWorldId = 1,
  onOpenSimulator,
}) => {
  const { locale, refreshUser } = useAuth();
  const [worlds, setWorlds] = useState<WorldSummary[]>([]);
  const [selectedWorldId, setSelectedWorldId] = useState<number>(initialWorldId);
  const [activeTab, setActiveTab] = useState<'descobre' | 'experimenta' | 'desafio' | 'missao' | 'avaliacao'>('descobre');
  const [loading, setLoading] = useState(true);

  // Mission submission form state
  const [missionText, setMissionText] = useState('');
  const [submittingMission, setSubmittingMission] = useState(false);
  const [missionMessage, setMissionMessage] = useState<string | null>(null);

  // Assessment modal trigger
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  useEffect(() => {
    loadWorlds();
  }, []);

  const loadWorlds = async () => {
    try {
      const res = await apiRequest('/api/pedagogical/worlds');
      setWorlds(res.worlds || []);
    } catch (err) {
      console.error('Failed to load worlds', err);
    } finally {
      setLoading(false);
    }
  };

  const currentWorld = worlds.find((w) => w.id === selectedWorldId) || worlds[0];

  const handleMissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorld || !missionText.trim()) return;

    setSubmittingMission(true);
    setMissionMessage(null);
    try {
      const res = await apiRequest(`/api/pedagogical/missions/${currentWorld.id}`, {
        method: 'POST',
        body: JSON.stringify({ submission: missionText }),
      });
      setMissionMessage(res.message || 'Missão Real submetida com sucesso!');
      setMissionText('');
      await loadWorlds();
      await refreshUser();
    } catch (err: any) {
      setMissionMessage(`Erro: ${err.message}`);
    } finally {
      setSubmittingMission(false);
    }
  };

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Worlds Header Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-3 min-w-max">
          {worlds.map((world) => {
            const isSelected = world.id === selectedWorldId;
            const isUnlocked = world.isUnlocked;
            return (
              <button
                key={world.id}
                onClick={() => {
                  if (isUnlocked) {
                    setSelectedWorldId(world.id);
                    setActiveTab('descobre');
                  }
                }}
                disabled={!isUnlocked}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md'
                    : isUnlocked
                    ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 opacity-60'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-white'
                  }`}
                >
                  {isUnlocked ? getWorldIcon(world.id) : <Lock className="w-4 h-4" />}
                </div>
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider opacity-80">
                    Mundo {world.id}
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

        {/* Sub-Navigation Tabs matching pedagogical pipeline */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-blue-100">
          {[
            { id: 'descobre', label: '1. Descobre (Conteúdos)', icon: BookOpen },
            { id: 'experimenta', label: '2. Experimenta (Simuladores)', icon: Sparkles },
            { id: 'desafio', label: '3. Desafio do Mundo', icon: Award },
            { id: 'missao', label: '4. Missão Real', icon: FileText },
            { id: 'avaliacao', label: '5. Avaliação Final (8 Perguntas)', icon: CheckCircle2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-blue-50/80 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: DESCOBRE (The exact, non-summarized curricular contents) */}
      {activeTab === 'descobre' && (
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">
            Blocos de Aprendizagem Curricular:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentWorld.topics.map((topic) => (
              <div
                key={topic.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                      {topic.number}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {topic.title}
                    </h4>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-700 space-y-2 leading-relaxed">
                    {topic.paragraphs.map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))}

                    {topic.bulletPoints && (
                      <ul className="list-disc list-inside space-y-1 pl-2 text-slate-800 font-semibold bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {topic.bulletPoints.map((bp, bpIdx) => (
                          <li key={bpIdx}>{bp}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {topic.takeaway && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-xs font-bold text-blue-700 italic">
                      ✨ {topic.takeaway}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: EXPERIMENTA (Simulators) */}
      {activeTab === 'experimenta' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              Simuladores deste Mundo:
            </h3>
            <span className="text-xs font-bold text-slate-500">
              Aprender fazendo com feedback imediato
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentWorld.simulators.map((sim) => {
              const prog = currentWorld.simulatorsProgress?.find((p) => p.id === sim.id);
              return (
                <div
                  key={sim.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-blue-100 text-blue-800 font-extrabold text-xs px-2.5 py-0.5 rounded-md">
                        +{sim.xpReward} XP
                      </span>
                      {prog?.completed && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Concluído ({prog.score}%)
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 mb-1">
                      {sim.name}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {sim.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => onOpenSimulator(currentWorld.id, sim.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Abrir Simulador</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DESAFIO */}
      {activeTab === 'desafio' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
                Desafio Avaliável do Mundo {currentWorld.id}
              </span>
              <h3 className="text-xl font-black text-slate-900">
                {currentWorld.challenge.title}
              </h3>
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {currentWorld.challenge.description}
          </p>

          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-950 font-semibold space-y-1">
            <p>🎯 Recompensa Máxima: +{currentWorld.challenge.xpReward} XP</p>
            <p>
              Estado atual:{' '}
              {currentWorld.challengeProgress?.completed
                ? `Concluído com pontuação: ${currentWorld.challengeProgress.score}/100`
                : 'Pendente de resolução'}
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => onOpenSimulator(currentWorld.id, currentWorld.simulators[0]?.id || 'sim-password')}
              className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-extrabold text-xs px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Resolver Desafio Agora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: MISSÃO REAL */}
      {activeTab === 'missao' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                Missão Real — Aplicação Prática
              </span>
              <h3 className="text-xl font-black text-slate-900">
                {currentWorld.mission.title}
              </h3>
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed font-semibold">
            {currentWorld.mission.description}
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
              Instruções de Execução:
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {currentWorld.mission.instructions.map((inst, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>{inst}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Submission Status or Form */}
          {currentWorld.missionProgress ? (
            <div
              className={`p-5 rounded-2xl border text-xs leading-relaxed ${
                currentWorld.missionProgress.status === 'graded'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-blue-50 border-blue-200 text-blue-950'
              }`}
            >
              <div className="flex items-center justify-between font-bold mb-2">
                <span className="uppercase tracking-wider">
                  Estado: {currentWorld.missionProgress.status === 'graded' ? 'Avaliado pelo Professor' : 'Aguardar Correção do Professor'}
                </span>
                {currentWorld.missionProgress.status === 'graded' && (
                  <span className="text-sm font-black bg-emerald-200 text-emerald-900 px-3 py-1 rounded-lg">
                    Nota: {currentWorld.missionProgress.score}/100
                  </span>
                )}
              </div>
              {currentWorld.missionProgress.feedback && (
                <div className="mt-2 pt-2 border-t border-emerald-200/60">
                  <p className="font-bold text-slate-900">Feedback do Professor:</p>
                  <p className="italic text-slate-700 mt-0.5">
                    “{currentWorld.missionProgress.feedback}”
                  </p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleMissionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  A tua Resposta / Regras Criadas:
                </label>
                <textarea
                  rows={6}
                  value={missionText}
                  onChange={(e) => setMissionText(e.target.value)}
                  placeholder="Escreve aqui o teu trabalho detalhado de acordo com as instruções acima..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {missionMessage && (
                <div className="p-3 bg-blue-100 text-blue-900 rounded-xl text-xs font-bold">
                  {missionMessage}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingMission || missionText.trim().length < 20}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                  <span>{submittingMission ? 'A submeter...' : 'Submeter ao Professor'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 5: AVALIAÇÃO FINAL (8 Questions) */}
      {activeTab === 'avaliacao' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs max-w-3xl mx-auto space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              {currentWorld.title}
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              Avaliação Final de 8 Perguntas
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
              Responde às 8 questões de escolha múltipla para testar os teus conhecimentos e desbloquear o próximo Mundo!
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl max-w-md mx-auto text-xs text-blue-950 font-semibold space-y-1">
            <p>🏆 Requisito para desbloqueio do próximo Mundo: Média &gt; 65%</p>
            <p>
              Melhor resultado registado:{' '}
              {currentWorld.bestAssessmentPercentage !== null
                ? `${currentWorld.bestAssessmentPercentage}%`
                : 'Ainda não realizado'}
            </p>
          </div>

          <div>
            <button
              onClick={() => setShowAssessmentModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm px-8 py-3.5 rounded-2xl shadow-md transition-all hover:scale-105 inline-flex items-center gap-2"
            >
              <span>Começar Avaliação Final</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
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
