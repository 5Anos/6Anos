import React, { useState } from 'react';
import {
  Cpu,
  Wand2,
  Sparkles,
  AlertCircle,
  Lock,
  Brain,
  CheckCircle2,
  ArrowRight,
  Award,
  BookOpen,
  RefreshCw,
  Sliders,
  Send,
} from 'lucide-react';
import { WorldSummary } from '../types';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { clientSaveActivityProgress } from '../services/clientFirestore';
import { TopicIllustrationCard } from './TopicIllustrationCard';

interface World5ThematicViewProps {
  world: WorldSummary;
  activeTopicId: string;
  onNavigateTopic: (topicId: string) => void;
  onOpenAssessment: () => void;
  onRefreshWorld: () => Promise<void>;
}

export const World5ThematicView: React.FC<World5ThematicViewProps> = ({
  world,
  activeTopicId,
  onNavigateTopic,
  onOpenAssessment,
  onRefreshWorld,
}) => {
  const { user, refreshUser } = useAuth();

  // Completed feedback banner
  const [completedFeedback, setCompletedFeedback] = useState<{
    score: number;
    xpGain: number;
    newBest: number;
    activityTitle: string;
  } | null>(null);

  // -------------------------------------------------------------
  // 1. CONCEITOS IA STATE
  // -------------------------------------------------------------
  const [conceptChoices, setConceptChoices] = useState<Record<string, string>>({});
  const [conceptScore, setConceptScore] = useState<number | null>(null);
  const conceptItems = [
    {
      id: 'c1',
      task: 'Identificar se uma fotografia médica contém um sinal de perigo na pele com base em 100.000 fotos de treino.',
      correct: 'ia',
      explanation: 'Reconhecimento de padrões complexos a partir de grandes volumes de dados (Machine Learning / IA).',
    },
    {
      id: 'c2',
      task: 'Calcular a raiz quadrada de 144 através de uma fórmula fixa programada no processador.',
      correct: 'tradicional',
      explanation: 'Algoritmo determinista tradicional com regras lógicas estritas sem necessidade de IA.',
    },
    {
      id: 'c3',
      task: 'Consolar com compaixão um colega que perdeu o seu animal de estimação.',
      correct: 'humano',
      explanation: 'Empatia, sentimentos reais e consciência são características puramente humanas.',
    },
  ];

  // -------------------------------------------------------------
  // 2. IA GENERATIVA VERIFICATION STATE
  // -------------------------------------------------------------
  const [genChecks, setGenChecks] = useState<Record<string, boolean>>({});
  const [genScore, setGenScore] = useState<number | null>(null);

  // -------------------------------------------------------------
  // 3. PROMPT SIMULATOR STATE
  // -------------------------------------------------------------
  const [selectedPromptType, setSelectedPromptType] = useState<'vago' | 'estruturado' | null>(null);
  const [promptScore, setPromptScore] = useState<number | null>(null);

  // -------------------------------------------------------------
  // 4. HALLUCINATION SIMULATOR STATE
  // -------------------------------------------------------------
  const [selectedHallucination, setSelectedHallucination] = useState<string | null>(null);
  const [hallucinationScore, setHallucinationScore] = useState<number | null>(null);
  const statements = [
    {
      id: 'stmt-1',
      text: 'D. Afonso Henriques foi o primeiro rei de Portugal, aclamado após a Batalha de Ourique em 1139.',
      isHallucination: false,
    },
    {
      id: 'stmt-2',
      text: 'O Tratado de Zamora, celebrado em 1143, marcou o reconhecimento da independência do Reino de Portugal.',
      isHallucination: false,
    },
    {
      id: 'stmt-3',
      text: 'D. Afonso Henriques conquistou Lisboa em 1147 com a ajuda de cruzados que viajavam em helicópteros e tanques de combate.',
      isHallucination: true,
      explanation: 'Alucinação anacrónica evidente! Helicópteros e tanques só foram inventados no século XX.',
    },
  ];

  // -------------------------------------------------------------
  // 5. PRIVACIDADE & IA STATE
  // -------------------------------------------------------------
  const [cleanedInput, setCleanedInput] = useState(false);
  const [privacyScore, setPrivacyScore] = useState<number | null>(null);

  // -------------------------------------------------------------
  // 6. PENSAR COM A IA / RECOMENDAÇÃO STATE
  // -------------------------------------------------------------
  const [bubbleAction, setBubbleAction] = useState<string | null>(null);
  const [recommendationScore, setRecommendationScore] = useState<number | null>(null);

  // -------------------------------------------------------------
  // REPORT COMPLETION HELPER
  // -------------------------------------------------------------
  const reportCompletion = async (simId: string, activityTitle: string, score: number) => {
    try {
      try {
        const res = await apiRequest('/api/pedagogical/activities/complete', {
          method: 'POST',
          body: JSON.stringify({
            activityId: simId,
            worldId: 5,
            score,
          }),
        });
        setCompletedFeedback({
          score: res.score,
          xpGain: res.xpGain,
          newBest: res.newBest,
          activityTitle,
        });
      } catch {
        if (user) {
          const clientRes = await clientSaveActivityProgress(user.id, simId, score);
          setCompletedFeedback({
            score,
            xpGain: clientRes.xpGain,
            newBest: clientRes.newBest,
            activityTitle,
          });
        }
      }
      await refreshUser();
      await onRefreshWorld();
    } catch (err: any) {
      console.error('Failed to report activity completion', err);
    }
  };

  // Handlers
  const handleValidateConcepts = () => {
    let count = 0;
    conceptItems.forEach((c) => {
      if (conceptChoices[c.id] === c.correct) count++;
    });
    const score = Math.round((count / conceptItems.length) * 100);
    setConceptScore(score);
    reportCompletion('sim-ia-concepts', 'Simulador de Conceitos de IA', score);
  };

  const handleValidateGen = () => {
    const checksCount = Object.values(genChecks).filter(Boolean).length;
    const score = Math.round((checksCount / 3) * 100);
    setGenScore(score);
    reportCompletion('sim-ai-generation', 'Simulador de IA Generativa & Verificação', score);
  };

  const handlePromptSelect = (type: 'vago' | 'estruturado') => {
    setSelectedPromptType(type);
    const score = type === 'estruturado' ? 100 : 40;
    setPromptScore(score);
    reportCompletion('sim-prompt', 'Prompt Simulator', score);
  };

  const handleHallucinationSelect = (id: string) => {
    setSelectedHallucination(id);
    const stmt = statements.find((s) => s.id === id);
    const score = stmt?.isHallucination ? 100 : 30;
    setHallucinationScore(score);
    reportCompletion('sim-hallucination', 'Hallucination Simulator', score);
  };

  const handleCleanPrivacy = () => {
    setCleanedInput(true);
    setPrivacyScore(100);
    reportCompletion('sim-ai-responsibility', 'AI Responsibility & Privacidade', 100);
  };

  const handleBubbleSelect = (action: string) => {
    setBubbleAction(action);
    const score = action === 'diversificar' ? 100 : 40;
    setRecommendationScore(score);
    reportCompletion('sim-recommendation', 'Recommendation Simulator', score);
  };

  // Helper
  const getSimProg = (simId: string) => {
    return world.simulatorsProgress?.find((p) => p.id === simId);
  };

  const topic1 = world.topics.find((t) => t.id === 'w5-t1');
  const topic2 = world.topics.find((t) => t.id === 'w5-t2');
  const topic3 = world.topics.find((t) => t.id === 'w5-t3');
  const topic4 = world.topics.find((t) => t.id === 'w5-t4');
  const topic5 = world.topics.find((t) => t.id === 'w5-t5');
  const topic6 = world.topics.find((t) => t.id === 'w5-t6');

  return (
    <div className="space-y-6">
      {/* Global Completed Feedback Banner */}
      {completedFeedback && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-3xl flex items-center justify-between text-indigo-950 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <Award className="w-7 h-7 text-indigo-600 shrink-0" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block">
                Atividade Registada com Sucesso: {completedFeedback.activityTitle}
              </span>
              <p className="text-sm font-black">
                Pontuação Obtida: {completedFeedback.score}/100{' '}
                {completedFeedback.xpGain > 0 && (
                  <span className="text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md ml-1">
                    +{completedFeedback.xpGain} XP Ganho!
                  </span>
                )}
              </p>
            </div>
          </div>
          <span className="text-xs font-black bg-indigo-200 text-indigo-900 px-3 py-1.5 rounded-xl">
            Melhor Recorde: {completedFeedback.newBest}/100
          </span>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 1: O QUE É IA? */}
      {/* ========================================================= */}
      {activeTopicId === 'w5-t1' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-indigo-600 tracking-wider block">
                  Tema 1 do Mundo 5
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic1?.title || 'O que é Inteligência Artificial?'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-ia-concepts')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-ia-concepts')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                  Recompensa: +100 XP
                </span>
              )}
            </div>
          </div>

          {/* 📖 1. APRENDE (Conteúdo Teórico Exato + Ilustração Educativa) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-indigo-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: CONCEITO DE IA, RECONHECIMENTO DE PADRÕES E ALGORITMOS
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic1?.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {topic1?.takeaway && (
              <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl">
                <p className="text-xs sm:text-sm font-black text-indigo-800 italic">
                  ✨ {topic1.takeaway}
                </p>
              </div>
            )}

            <TopicIllustrationCard topicId="w5-t1" />
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Simulador de Conceitos de IA
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Classifica entre IA, Regras e Humano
              </span>
            </div>

            <div className="space-y-4">
              {conceptItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3"
                >
                  <p className="text-xs sm:text-sm font-bold text-slate-900">
                    💡 Tarefa: {item.task}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() =>
                        setConceptChoices((prev) => ({ ...prev, [item.id]: 'ia' }))
                      }
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                        conceptChoices[item.id] === 'ia'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      🤖 Inteligência Artificial
                    </button>
                    <button
                      onClick={() =>
                        setConceptChoices((prev) => ({ ...prev, [item.id]: 'tradicional' }))
                      }
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                        conceptChoices[item.id] === 'tradicional'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ⚙️ Regra Fixa / Tradicional
                    </button>
                    <button
                      onClick={() =>
                        setConceptChoices((prev) => ({ ...prev, [item.id]: 'humano' }))
                      }
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                        conceptChoices[item.id] === 'humano'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ❤️ Capacidade Humana
                    </button>
                  </div>
                  {conceptChoices[item.id] && (
                    <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                      💡 {item.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleValidateConcepts}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Validar Classificações
              </button>
            </div>

            {conceptScore !== null && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 font-medium">
                Pontuação do Simulador: {conceptScore}/100. A IA é uma ferramenta extraordinária criada por humanos para aprender com dados, mas não substitui a consciência nem os sentimentos!
              </div>
            )}
          </div>

          {/* 🎯 Progresso */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w5-t2')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Avançar para Tema 2: IA generativa</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 2: IA GENERATIVA */}
      {/* ========================================================= */}
      {activeTopicId === 'w5-t2' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Wand2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-indigo-600 tracking-wider block">
                  Tema 2 do Mundo 5
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic2?.title || 'IA generativa'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-ai-generation')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-ai-generation')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                  Recompensa: +100 XP
                </span>
              )}
            </div>
          </div>

          {/* 📖 1. APRENDE (Conteúdo Teórico Exato + Ilustração Educativa) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-indigo-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: GERAÇÃO DE TEXTO, IMAGEM E A NECESSIDADE DE VERIFICAÇÃO
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic2?.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {topic2?.takeaway && (
              <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl">
                <p className="text-xs sm:text-sm font-black text-indigo-800 italic">
                  ✨ {topic2.takeaway}
                </p>
              </div>
            )}

            <TopicIllustrationCard topicId="w5-t2" />
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Simulador de IA Generativa & Verificação
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Auditoria de texto gerado por IA
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-[10px] font-black uppercase text-indigo-600 block">
                Texto Produzido pelo Modelo de IA Generativa:
              </span>
              <p className="text-xs text-slate-800 font-medium italic">
                "A fotossíntese é o processo pelo qual as plantas transformam a luz solar em glicose e oxigénio, usando água e dióxido de carbono absorvidos pelas folhas e raízes."
              </p>
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-800">
              Como Explorador da IA responsável, aplica o teu crivo crítico marcando os passos de verificação:
            </p>

            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={genChecks['c1'] || false}
                  onChange={(e) => setGenChecks({ ...genChecks, c1: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded-md"
                />
                <span>1. Comparar a explicação com o manual de Ciências Naturais</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={genChecks['c2'] || false}
                  onChange={(e) => setGenChecks({ ...genChecks, c2: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded-md"
                />
                <span>2. Confirmar se os elementos químicos citados estão corretos</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={genChecks['c3'] || false}
                  onChange={(e) => setGenChecks({ ...genChecks, c3: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded-md"
                />
                <span>3. Refrasear com as tuas palavras para demonstrar aprendizagem real</span>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleValidateGen}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Concluir Verificação Crítica
              </button>
            </div>

            {genScore !== null && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 font-medium">
                Pontuação da Auditoria: {genScore}/100. Nunca confies cegamente na IA generativa: ela gera texto provável, mas a responsabilidade do conteúdo é tua!
              </div>
            )}
          </div>

          {/* 🎯 Progresso */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w5-t3')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Avançar para Tema 3: Prompts</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 3: PROMPTS */}
      {/* ========================================================= */}
      {activeTopicId === 'w5-t3' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-indigo-600 tracking-wider block">
                  Tema 3 do Mundo 5
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic3?.title || 'Prompts'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-prompt')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-prompt')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                  Recompensa: +100 XP
                </span>
              )}
            </div>
          </div>

          {/* 📖 1. APRENDE (Conteúdo Teórico Exato + Ilustração Educativa) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-indigo-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: A ARTE DE FORMULAR PROMPTS CLAROS E CONTEXTUALIZADOS
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic3?.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
              {topic3?.bulletPoints && topic3.bulletPoints.length > 0 && (
                <ul className="list-disc pl-5 space-y-2 text-slate-800 font-medium">
                  {topic3.bulletPoints.map((bp, bidx) => (
                    <li key={bidx}>{bp}</li>
                  ))}
                </ul>
              )}
            </div>

            {topic3?.takeaway && (
              <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl">
                <p className="text-xs sm:text-sm font-black text-indigo-800 italic">
                  ✨ {topic3.takeaway}
                </p>
              </div>
            )}

            <TopicIllustrationCard topicId="w5-t3" />
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Prompt Simulator
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Compara prompt vago vs estruturado
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Clica nos dois tipos de pedido para ver a diferença entre uma instrução vaga e um prompt profissional:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prompt Vago */}
              <div
                onClick={() => handlePromptSelect('vago')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                  selectedPromptType === 'vago'
                    ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-800">1. Prompt Vago</span>
                  <span className="text-[11px] font-bold text-slate-500">Básico (40 XP)</span>
                </div>
                <p className="font-mono text-xs bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700">
                  "Fala sobre reciclagem."
                </p>
                <p className="text-xs text-slate-600 italic">
                  Resultado: Um texto longo, genérico e aborrecido sobre tudo e nada ao mesmo tempo.
                </p>
              </div>

              {/* Prompt Estruturado */}
              <div
                onClick={() => handlePromptSelect('estruturado')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                  selectedPromptType === 'estruturado'
                    ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-800">2. Prompt Estruturado</span>
                  <span className="text-[11px] font-bold text-emerald-600">Perfeito (100 XP)</span>
                </div>
                <p className="font-mono text-xs bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700">
                  "Atua como professor de Ciências. Explica a um aluno de 11 anos em 3 tópicos práticos como separar resíduos eletrónicos em Portugal."
                </p>
                <p className="text-xs text-slate-600 italic">
                  Resultado: Resposta focada, clara, adequada à tua idade e com informação útil!
                </p>
              </div>
            </div>

            {promptScore !== null && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 font-medium">
                Regra de Ouro do Prompting: Papel + Objetivo + Público-alvo + Formato = Resposta de Excelência!
              </div>
            )}
          </div>

          {/* 🎯 Progresso */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w5-t4')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Avançar para Tema 4: A IA pode enganar-se</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 4: A IA PODE ENGANAR-SE */}
      {/* ========================================================= */}
      {activeTopicId === 'w5-t4' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-indigo-600 tracking-wider block">
                  Tema 4 do Mundo 5
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic4?.title || 'A IA pode enganar-se'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-hallucination')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-hallucination')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                  Recompensa: +100 XP
                </span>
              )}
            </div>
          </div>

          {/* 📖 1. APRENDE (Conteúdo Teórico Exato + Ilustração Educativa) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-indigo-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: O FENÓMENO DAS "ALUCINAÇÕES" E DADOS INVENTADOS
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic4?.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {topic4?.takeaway && (
              <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl">
                <p className="text-xs sm:text-sm font-black text-indigo-800 italic">
                  ✨ {topic4.takeaway}
                </p>
              </div>
            )}

            <TopicIllustrationCard topicId="w5-t4" />
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Hallucination Simulator
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Deteta o facto inventado na resposta da IA
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Um assistente de IA gerou 3 afirmações sobre a História de Portugal.
              Duas são factos verídicos e uma é uma alucinação fabricada. Clica na afirmação falsa:
            </p>

            <div className="space-y-3">
              {statements.map((st) => (
                <div
                  key={st.id}
                  onClick={() => handleHallucinationSelect(st.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedHallucination === st.id
                      ? st.isHallucination
                        ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200'
                        : 'bg-rose-50 border-rose-300 ring-2 ring-rose-200'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-xs sm:text-sm font-bold text-slate-800">{st.text}</p>
                  {selectedHallucination === st.id && (
                    <p className="mt-2 text-xs font-bold text-slate-700">
                      {st.isHallucination
                        ? `🎯 Acertaste! Esta é a alucinação inventada: ${st.explanation}`
                        : '❌ Esta afirmação é historicamente verdadeira. Procura a afirmação que é impossível!'}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {hallucinationScore !== null && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 font-medium">
                Dica de Ouro: A IA escreve com tanta elegância e convicção que é fácil acreditar nela. Confirmar sempre datas e nomes é dever de todo o estudante!
              </div>
            )}
          </div>

          {/* 🎯 Progresso */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w5-t5')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Avançar para Tema 5: Privacidade e IA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 5: PRIVACIDADE E IA */}
      {/* ========================================================= */}
      {activeTopicId === 'w5-t5' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-indigo-600 tracking-wider block">
                  Tema 5 do Mundo 5
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic5?.title || 'Privacidade e IA'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-ai-responsibility')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-ai-responsibility')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                  Recompensa: +100 XP
                </span>
              )}
            </div>
          </div>

          {/* 📖 1. APRENDE (Conteúdo Teórico Exato + Ilustração Educativa) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-indigo-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: PROTEÇÃO DE DADOS CONFIDENCIAIS EM CHATS DE IA
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic5?.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
              {topic5?.bulletPoints && topic5.bulletPoints.length > 0 && (
                <ul className="list-disc pl-5 space-y-2 text-slate-800 font-medium">
                  {topic5.bulletPoints.map((bp, bidx) => (
                    <li key={bidx}>{bp}</li>
                  ))}
                </ul>
              )}
            </div>

            {topic5?.takeaway && (
              <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl">
                <p className="text-xs sm:text-sm font-black text-indigo-800 italic">
                  ✨ {topic5.takeaway}
                </p>
              </div>
            )}

            <TopicIllustrationCard topicId="w5-t5" />
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Simulador de Filtragem de Dados Privados
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Higieniza os dados antes de enviar à IA
              </span>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
              <span className="text-[10px] font-black uppercase text-rose-700 block">
                ⚠️ Pedido Inseguro com Dados Pessoais Sensíveis:
              </span>
              <p className="text-xs text-rose-950 font-mono">
                "Olá, o meu nome é Martim Ferreira, vivo na Rua das Flores n.º 12 em Coimbra e a minha password do email é Martim2012!. Podes corrigir este texto de Português?"
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-slate-800 block">
                Ação de Segurança: Remove os dados confidenciais e mantém apenas a pergunta necessária:
              </span>
              {cleanedInput ? (
                <p className="text-xs text-emerald-800 font-mono font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  "Olá! Podes ajudar-me a corrigir este texto de Português e apontar sugestões de melhoria?"
                </p>
              ) : (
                <button
                  onClick={handleCleanPrivacy}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Filtrar e Anonimizar Mensagem</span>
                </button>
              )}
            </div>

            {privacyScore !== null && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 font-medium">
                Perfeito! A ferramenta de IA precisa apenas do texto para corrigir; nunca precisa da tua morada, nome completo ou palavra-passe!
              </div>
            )}
          </div>

          {/* 🎯 Progresso */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w5-t6')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Avançar para Tema 6: Pensar com a IA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 6: PENSAR COM A IA */}
      {/* ========================================================= */}
      {activeTopicId === 'w5-t6' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-indigo-600 tracking-wider block">
                  Tema 6 do Mundo 5
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic6?.title || 'Pensar com a IA'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-recommendation')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-recommendation')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                  Recompensa: +100 XP
                </span>
              )}
            </div>
          </div>

          {/* 📖 1. APRENDE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <BookOpen className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  1. Aprende: A IA como copiloto crítico e a autoria humana
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-100/90 border border-slate-200/90 px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Conceito Curricular Explicado</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
              <div className="md:col-span-7 space-y-4">
                <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
                  {topic6?.paragraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {topic6?.takeaway && (
                  <div className="mt-4 p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl">
                    <p className="text-xs sm:text-sm font-black text-indigo-800 italic">
                      ✨ {topic6.takeaway}
                    </p>
                  </div>
                )}
              </div>

              <div className="md:col-span-5 w-full">
                <TopicIllustrationCard topicId="w5-t6" />
              </div>
            </div>
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Recommendation Simulator (A Bolha dos Algoritmos)
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Escapar à bolha de conteúdos
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Reparas que o teu feed de vídeos só te mostra vídeos do mesmo jogo e do mesmo influenciador há duas semanas.
              O que deves fazer para expandir os teus horizontes e pensar de forma autónoma?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleBubbleSelect('bolha')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  bubbleAction === 'bolha'
                    ? 'bg-rose-50 border-rose-300'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs font-black text-slate-900 block mb-1">
                  Opção A: Ficar na Bolha
                </span>
                <p className="text-xs text-slate-600">
                  Continuar a clicar sem pensar e deixar que o algoritmo decida sempre tudo o que vês.
                </p>
              </button>

              <button
                onClick={() => handleBubbleSelect('diversificar')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  bubbleAction === 'diversificar'
                    ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs font-black text-slate-900 block mb-1">
                  Opção B: Diversificar Ativamente (Recomendada)
                </span>
                <p className="text-xs text-slate-600">
                  Pesquisar novos tópicos (ciência, arte, desporto), limpar o histórico e procurar pontos de vista diferentes.
                </p>
              </button>
            </div>

            {recommendationScore !== null && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 font-medium">
                {bubbleAction === 'diversificar'
                  ? 'Excelente decisão! Os algoritmos de recomendação tentam manter-te preso a conteúdos semelhantes. Pensar com a IA exige autonomia para explorar o mundo além do algoritmo!'
                  : 'Atenção: Deixar que o algoritmo decida tudo reduz a tua curiosidade e limita o teu pensamento crítico!'}
              </div>
            )}
          </div>

          {/* 🎯 Conclusão / Avaliação */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('avaliacao')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Avançar para a Avaliação Final do Mundo 5</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SEPARADOR 7: AVALIAÇÃO FINAL */}
      {/* ========================================================= */}
      {activeTopicId === 'avaliacao' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs max-w-3xl mx-auto space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-black text-indigo-600 uppercase tracking-wider block">
              {world.title}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Avaliação Final de 8 Perguntas
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
              Mostra que compreendes a Inteligência Artificial, formulas prompts eficazes e usas a tecnologia com ética e responsabilidade!
            </p>
          </div>

          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl max-w-md mx-auto text-xs text-indigo-950 font-semibold space-y-1">
            <p>🏆 Requisito de Conclusão da Missão TIC: Média &gt; 80%</p>
            <p>
              Melhor resultado registado:{' '}
              {world.bestAssessmentPercentage !== null
                ? `${world.bestAssessmentPercentage}%`
                : 'Ainda não realizado'}
            </p>
          </div>

          <div>
            <button
              onClick={onOpenAssessment}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm px-8 py-3.5 rounded-2xl shadow-md transition-all hover:scale-105 inline-flex items-center gap-2"
            >
              <span>Começar Avaliação Final (8 Perguntas)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
