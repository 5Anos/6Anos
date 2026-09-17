import React, { useState } from 'react';
import {
  Search,
  UserCheck,
  Calendar,
  GitCompare,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { WorldSummary } from '../types';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { clientSaveActivityProgress } from '../services/clientFirestore';
import { TopicIllustrationCard } from './TopicIllustrationCard';

interface World2ThematicViewProps {
  world: WorldSummary;
  activeTopicId: string;
  onNavigateTopic: (topicId: string) => void;
  onOpenAssessment: () => void;
  onRefreshWorld: () => Promise<void>;
}

export const World2ThematicView: React.FC<World2ThematicViewProps> = ({
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
  // 1. KEYWORDS SIMULATOR STATE
  // -------------------------------------------------------------
  const [selectedSearchQuery, setSelectedSearchQuery] = useState<string | null>(null);
  const [keywordScore, setKeywordScore] = useState<number | null>(null);
  const searchQueries = [
    {
      id: 'vague',
      query: 'animais',
      type: 'Vaga e Genérica',
      results: '380.000.000 resultados: fotos de gatos, lojas de ração, vídeos de comédia...',
      isEffective: false,
      feedback: 'Demasiado abrangente! É difícil encontrar informação escolar útil sem filtrar por tema e localização.',
    },
    {
      id: 'better',
      query: 'animais em perigo',
      type: 'Média',
      results: '14.000.000 resultados: relatórios globais de pandas, tigres e florestas tropicais...',
      isEffective: false,
      feedback: 'Melhor, mas ainda muito dispersa pelo mundo inteiro.',
    },
    {
      id: 'best',
      query: 'animais em perigo de extinção em Portugal',
      type: 'Específica e Eficaz (Recomendada)',
      results: '45.000 resultados: Lince-ibérico, Lobo-ibérico, relatórios do ICNF e projetos de conservação.',
      isEffective: true,
      feedback: 'Excelente! Palavras-chave precisas trazem exatamente o conteúdo educativo que procuras.',
    },
  ];

  // -------------------------------------------------------------
  // 2. AUTHOR CHECK SIMULATOR STATE
  // -------------------------------------------------------------
  const [authorChoices, setAuthorChoices] = useState<Record<string, 'confiavel' | 'suspeito'>>({});
  const [authorScore, setAuthorScore] = useState<number | null>(null);
  const authorScenarios = [
    {
      id: 'auth-1',
      source: 'Portal ICNF / Ciência Viva',
      author: 'Dra. Maria Antunes (Bióloga Marinha e Investigadora)',
      snippet: 'Estudo anual sobre as espécies marinhas na costa atlântica com dados oficiais e metodologia.',
      correct: 'confiavel',
      explanation: 'Autor identificado com especialização na área e entidade institucional reconhecida.',
    },
    {
      id: 'auth-2',
      source: 'Blogue "Verdades Ocultas 2026"',
      author: 'Utilizador anónimo "SuperDetective99"',
      snippet: 'Afirmação sensacionalista de que os golfinhos desapareceram devido a experiências secretas.',
      correct: 'suspeito',
      explanation: 'Autor sem identidade real, página sem contactos institucionais e sem referências científicas.',
    },
    {
      id: 'auth-3',
      source: 'Site de Vendas de Suplementos',
      author: 'Equipa Comercial (Sem menção de peritos)',
      snippet: 'Artigo sobre saúde que termina a incentivar a compra imediata de um produto milagroso.',
      correct: 'suspeito',
      explanation: 'O objetivo da página é comercial (venda de produtos), havendo conflito de interesses na informação.',
    },
  ];

  // -------------------------------------------------------------
  // 3. DATE VERIFIER SIMULATOR STATE
  // -------------------------------------------------------------
  const [dateChoices, setDateChoices] = useState<Record<string, 'atual' | 'desatualizado'>>({});
  const [dateScore, setDateScore] = useState<number | null>(null);
  const dateScenarios = [
    {
      id: 'date-1',
      title: 'Alerta Vermelho: Encerramento de Escolas por Temporal Violento',
      dateShown: 'Publicado em 14 de Novembro de 2018 (repartilhado hoje nas redes)',
      correct: 'desatualizado',
      explanation: 'Uma notícia de há vários anos está a ser partilhada hoje fora do seu contexto temporal para criar alarme falso.',
    },
    {
      id: 'date-2',
      title: 'Lançamento do Novo Telescópio Espacial Europeu',
      dateShown: 'Publicado ontem pela Agência Espacial Europeia (ESA)',
      correct: 'atual',
      explanation: 'Acontecimentos recentes com data clara e contemporânea ao ano letivo em curso.',
    },
    {
      id: 'date-3',
      title: 'Calendário de Provas Finais do 2.º Ciclo',
      dateShown: 'Ano Letivo 2021/2022',
      correct: 'desatualizado',
      explanation: 'O calendário escolar muda todos os anos; utilizar datas passadas pode levar a faltas ou erros graves.',
    },
  ];

  // -------------------------------------------------------------
  // 4. SOURCE COMPARE SIMULATOR STATE
  // -------------------------------------------------------------
  const [comparedConfirmed, setComparedConfirmed] = useState<boolean | null>(null);
  const [compareScore, setCompareScore] = useState<number | null>(null);

  // -------------------------------------------------------------
  // 5. NEWS DETECTIVE STATE
  // -------------------------------------------------------------
  const [newsDetectiveAudit, setNewsDetectiveAudit] = useState({
    checkedAuthor: false,
    checkedDate: false,
    checkedEvidence: false,
    checkedOtherSources: false,
  });
  const [newsDecision, setNewsDecision] = useState<'partilhar' | 'desconfiar' | null>(null);
  const [newsScore, setNewsScore] = useState<number | null>(null);

  // -------------------------------------------------------------
  // PROGRESS & SCORE REPORTING
  // -------------------------------------------------------------
  const reportCompletion = async (simId: string, activityTitle: string, score: number) => {
    try {
      try {
        const res = await apiRequest('/api/pedagogical/activities/complete', {
          method: 'POST',
          body: JSON.stringify({
            activityId: simId,
            worldId: 2,
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

  // 1. Submit Keywords
  const handleKeywordSelect = (qId: string) => {
    setSelectedSearchQuery(qId);
    const item = searchQueries.find((q) => q.id === qId);
    const score = item?.isEffective ? 100 : item?.id === 'better' ? 65 : 40;
    setKeywordScore(score);
    reportCompletion('sim-keywords', 'Simulador de Pesquisa Inteligente', score);
  };

  // 2. Submit Authors
  const handleAuthorSubmit = () => {
    let correctCount = 0;
    authorScenarios.forEach((scen) => {
      if (authorChoices[scen.id] === scen.correct) correctCount++;
    });
    const score = Math.round((correctCount / authorScenarios.length) * 100);
    setAuthorScore(score);
    reportCompletion('sim-author-check', 'Simulador de Autoria & Origem', score);
  };

  // 3. Submit Dates
  const handleDateSubmit = () => {
    let correctCount = 0;
    dateScenarios.forEach((scen) => {
      if (dateChoices[scen.id] === scen.correct) correctCount++;
    });
    const score = Math.round((correctCount / dateScenarios.length) * 100);
    setDateScore(score);
    reportCompletion('sim-date-verifier', 'Simulador de Linha Temporal & Data', score);
  };

  // 4. Submit Compare
  const handleCompareDecision = (agreed: boolean) => {
    setComparedConfirmed(agreed);
    const score = agreed ? 100 : 40;
    setCompareScore(score);
    reportCompletion('sim-source-compare', 'Simulador de Comparação de Fontes', score);
  };

  // 5. Submit News Detective
  const handleNewsDecision = (decision: 'partilhar' | 'desconfiar') => {
    setNewsDecision(decision);
    const checksDone = Object.values(newsDetectiveAudit).filter(Boolean).length;
    const isGoodDecision = decision === 'desconfiar';
    const finalScore = isGoodDecision ? Math.min(100, 50 + checksDone * 12.5) : 30;
    setNewsScore(Math.round(finalScore));
    reportCompletion('sim-news-detective', 'NEWS DETECTIVE', Math.round(finalScore));
  };

  // Helpers
  const getSimProg = (simId: string) => {
    return world.simulatorsProgress?.find((p) => p.id === simId);
  };

  const topic1 = world.topics.find((t) => t.id === 'w2-t1');
  const topic2 = world.topics.find((t) => t.id === 'w2-t2');
  const topic3 = world.topics.find((t) => t.id === 'w2-t3');
  const topic4 = world.topics.find((t) => t.id === 'w2-t4');
  const topic5 = world.topics.find((t) => t.id === 'w2-t5');

  return (
    <div className="space-y-6">
      {/* Global Completed Feedback Banner */}
      {completedFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-center justify-between text-emerald-950 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <Award className="w-7 h-7 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                Atividade Registada com Sucesso: {completedFeedback.activityTitle}
              </span>
              <p className="text-sm font-black">
                Pontuação Obtida: {completedFeedback.score}/100{' '}
                {completedFeedback.xpGain > 0 && (
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md ml-1">
                    +{completedFeedback.xpGain} XP Ganho!
                  </span>
                )}
              </p>
            </div>
          </div>
          <span className="text-xs font-black bg-emerald-200 text-emerald-900 px-3 py-1.5 rounded-xl">
            Melhor Recorde: {completedFeedback.newBest}/100
          </span>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 1: PESQUISAR MELHOR */}
      {/* ========================================================= */}
      {activeTopicId === 'w2-t1' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider block">
                  Tema 1 do Mundo 2
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic1?.title || 'Pesquisar melhor'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-keywords')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-keywords')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                  Recompensa: +100 XP
                </span>
              )}
            </div>
          </div>

          {/* 📖 1. APRENDE (Conteúdo Teórico Exato + Ilustração Educativa) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-blue-700">
                <BookOpen className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  1. Aprende: Como formular palavras-chave e perguntas claras
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500 hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Conceito Curricular Explicado
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-4">
                <div className="text-sm text-slate-700 space-y-3 leading-relaxed font-medium">
                  {topic1?.paragraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {topic1?.takeaway && (
                  <div className="mt-4 p-4 bg-blue-50/80 border border-blue-200 rounded-2xl">
                    <p className="text-xs sm:text-sm font-black text-blue-800 italic">
                      ✨ {topic1.takeaway}
                    </p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-5">
                <TopicIllustrationCard topicId="w2-t1" />
              </div>
            </div>
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-blue-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Simulador de Pesquisa Inteligente
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Compara termos vagos vs específicos
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Imagina que o teu professor de Ciências pediu um trabalho sobre a fauna protegida em Portugal.
              Clica nas opções abaixo para testar diferentes pesquisas num motor de busca:
            </p>

            <div className="space-y-3">
              {searchQueries.map((sq) => (
                <div
                  key={sq.id}
                  onClick={() => handleKeywordSelect(sq.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedSearchQuery === sq.id
                      ? sq.isEffective
                        ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-300/30'
                        : 'bg-amber-50 border-amber-300 ring-2 ring-amber-300/30'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-blue-600" />
                      <span className="font-mono text-xs sm:text-sm font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        {sq.query}
                      </span>
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                      Nível: {sq.type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium italic mb-1">
                    🔍 Resultado obtido: {sq.results}
                  </p>

                  {selectedSearchQuery === sq.id && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 text-xs font-bold text-slate-800">
                      💡 {sq.feedback}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {keywordScore !== null && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-950 font-medium">
                Regra de Ouro do Detetive: Quanto mais precisa for a pergunta, menos tempo perdes a filtrar páginas inúteis!
              </div>
            )}
          </div>

          {/* 🎯 Progresso */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w2-t2')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Avançar para Tema 2: Quem criou a informação?</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 2: QUEM CRIOU A INFORMAÇÃO? */}
      {/* ========================================================= */}
      {activeTopicId === 'w2-t2' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider block">
                  Tema 2 do Mundo 2
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic2?.title || 'Quem criou a informação?'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-author-check')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-author-check')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                  Recompensa: +100 XP
                </span>
              )}
            </div>
          </div>

          {/* 📖 1. APRENDE (Conteúdo Teórico Exato + Ilustração Educativa) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-blue-700">
                <BookOpen className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  1. Aprende: A importância da autoria e da reputação
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500 hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Conceito Curricular Explicado
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-4">
                <div className="text-sm text-slate-700 space-y-3 leading-relaxed font-medium">
                  {topic2?.paragraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {topic2?.takeaway && (
                  <div className="mt-4 p-4 bg-blue-50/80 border border-blue-200 rounded-2xl">
                    <p className="text-xs sm:text-sm font-black text-blue-800 italic">
                      ✨ {topic2.takeaway}
                    </p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-5">
                <TopicIllustrationCard topicId="w2-t2" />
              </div>
            </div>
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-blue-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Simulador de Autoria & Origem
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Avalia quem escreveu o conteúdo
              </span>
            </div>

            <div className="space-y-4">
              {authorScenarios.map((scen) => (
                <div
                  key={scen.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider block">
                        Origem: {scen.source}
                      </span>
                      <h5 className="text-xs sm:text-sm font-black text-slate-900">
                        {scen.author}
                      </h5>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setAuthorChoices((prev) => ({ ...prev, [scen.id]: 'confiavel' }))
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          authorChoices[scen.id] === 'confiavel'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Fonte Confiável
                      </button>
                      <button
                        onClick={() =>
                          setAuthorChoices((prev) => ({ ...prev, [scen.id]: 'suspeito' }))
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          authorChoices[scen.id] === 'suspeito'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Autor Suspeito / Comercial
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 font-medium">"{scen.snippet}"</p>

                  {authorChoices[scen.id] && (
                    <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                      💡 {scen.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleAuthorSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Validar Avaliação de Autores
              </button>
            </div>

            {authorScore !== null && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-950 font-medium">
                Pontuação da Auditoria: {authorScore}/100. Lembra-te: na Internet, qualquer pessoa pode criar uma página bonita, mas a reputação e o rigor do autor é que contam!
              </div>
            )}
          </div>

          {/* 🎯 Progresso */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w2-t3')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Avançar para Tema 3: Verificar a data</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 3: VERIFICAR A DATA */}
      {/* ========================================================= */}
      {activeTopicId === 'w2-t3' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider block">
                  Tema 3 do Mundo 2
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic3?.title || 'Verificar a data'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-date-verifier')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-date-verifier')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                  Recompensa: +100 XP
                </span>
              )}
            </div>
          </div>

          {/* 📖 1. APRENDE (Conteúdo Teórico Exato + Ilustração Educativa) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-blue-700">
                <BookOpen className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  1. Aprende: O contexto temporal da informação
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500 hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Conceito Curricular Explicado
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-4">
                <div className="text-sm text-slate-700 space-y-3 leading-relaxed font-medium">
                  {topic3?.paragraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {topic3?.takeaway && (
                  <div className="mt-4 p-4 bg-blue-50/80 border border-blue-200 rounded-2xl">
                    <p className="text-xs sm:text-sm font-black text-blue-800 italic">
                      ✨ {topic3.takeaway}
                    </p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-5">
                <TopicIllustrationCard topicId="w2-t3" />
              </div>
            </div>
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-blue-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Simulador de Linha Temporal & Data
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Evita notícias antigas fora de contexto
              </span>
            </div>

            <div className="space-y-4">
              {dateScenarios.map((scen) => (
                <div
                  key={scen.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h5 className="text-xs sm:text-sm font-black text-slate-900">{scen.title}</h5>
                      <span className="text-[11px] font-bold text-slate-500 block mt-0.5">
                        🕒 {scen.dateShown}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setDateChoices((prev) => ({ ...prev, [scen.id]: 'atual' }))
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          dateChoices[scen.id] === 'atual'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Informação Atual
                      </button>
                      <button
                        onClick={() =>
                          setDateChoices((prev) => ({ ...prev, [scen.id]: 'desatualizado' }))
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          dateChoices[scen.id] === 'desatualizado'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Desatualizada / Antiga
                      </button>
                    </div>
                  </div>

                  {dateChoices[scen.id] && (
                    <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                      💡 {scen.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleDateSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Verificar Linha Temporal
              </button>
            </div>

            {dateScore !== null && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-950 font-medium">
                Avaliação Concluída: {dateScore}/100. Notícias antigas recicladas são uma das principais causas de pânico falso nas redes sociais. Verificar o ano e o mês evita mal-entendidos!
              </div>
            )}
          </div>

          {/* 🎯 Progresso */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w2-t4')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Avançar para Tema 4: Comparar fontes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 4: COMPARAR FONTES */}
      {/* ========================================================= */}
      {activeTopicId === 'w2-t4' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <GitCompare className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider block">
                  Tema 4 do Mundo 2
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic4?.title || 'Comparar fontes'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-source-compare')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-source-compare')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                  Recompensa: +100 XP
                </span>
              )}
            </div>
          </div>

          {/* 📖 1. APRENDE (Conteúdo Teórico Exato + Ilustração Educativa) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-blue-700">
                <BookOpen className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  1. Aprende: O método da confirmação cruzada
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500 hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Conceito Curricular Explicado
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-4">
                <div className="text-sm text-slate-700 space-y-3 leading-relaxed font-medium">
                  {topic4?.paragraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {topic4?.takeaway && (
                  <div className="mt-4 p-4 bg-blue-50/80 border border-blue-200 rounded-2xl">
                    <p className="text-xs sm:text-sm font-black text-blue-800 italic">
                      ✨ {topic4.takeaway}
                    </p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-5">
                <TopicIllustrationCard topicId="w2-t4" />
              </div>
            </div>
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-blue-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Simulador de Comparação de Fontes
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Cruza 3 fontes sobre o mesmo boato
              </span>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs sm:text-sm text-amber-950 font-bold">
              Rumor em Investigação: "O Governo vai proibir os trabalhos de casa e fechar as escolas aos sábados em definitivo."
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-[10px] font-black uppercase text-blue-600 block">Fonte A (Portal DGE / Educação)</span>
                <p className="text-xs text-slate-700 font-medium">
                  "O Ministério da Educação mantém o regime normal de funcionamento e não emitiu qualquer despacho a extinguir tarefas escolares."
                </p>
              </div>
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-[10px] font-black uppercase text-blue-600 block">Fonte B (Jornal Diário de Notícias)</span>
                <p className="text-xs text-slate-700 font-medium">
                  "Especialistas em educação debatem a carga de trabalhos escolares, mas confirmam que não há qualquer alteração legal prevista."
                </p>
              </div>
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-[10px] font-black uppercase text-rose-600 block">Fonte C (Post viral no TikTok)</span>
                <p className="text-xs text-slate-700 font-medium">
                  "Urgente! Acabaram os TPC para sempre a partir de amanhã! Partilha antes que apaguem este vídeo!"
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                Conclusão da Comparação: O rumor é falso e contrariado pelas fontes oficiais e independentes?
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCompareDecision(true)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    comparedConfirmed === true
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Sim, Boato Desmentido
                </button>
                <button
                  onClick={() => handleCompareDecision(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    comparedConfirmed === false
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Não, Acreditar no Vídeo
                </button>
              </div>
            </div>

            {compareScore !== null && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-950 font-medium">
                Excelente raciocínio! Duas fontes independentes e credíveis concordam entre si, desmontando a publicação sensacionalista do TikTok.
              </div>
            )}
          </div>

          {/* 🎯 Progresso */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w2-t5')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Avançar para Tema 5: Pensar antes de partilhar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 5: PENSAR ANTES DE PARTILHAR (NEWS DETECTIVE) */}
      {/* ========================================================= */}
      {activeTopicId === 'w2-t5' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider block">
                  Tema 5 do Mundo 2
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic5?.title || 'Pensar antes de partilhar'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-news-detective')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-news-detective')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                  Recompensa: +100 XP
                </span>
              )}
            </div>
          </div>

          {/* 📖 1. APRENDE (Conteúdo Teórico Exato + Ilustração Educativa) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-blue-700">
                <BookOpen className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  1. Aprende: Como quebrar a cadeia de desinformação
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500 hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Conceito Curricular Explicado
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-4">
                <div className="text-sm text-slate-700 space-y-3 leading-relaxed font-medium">
                  {topic5?.paragraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {topic5?.takeaway && (
                  <div className="mt-4 p-4 bg-blue-50/80 border border-blue-200 rounded-2xl">
                    <p className="text-xs sm:text-sm font-black text-blue-800 italic">
                      ✨ {topic5.takeaway}
                    </p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-5">
                <TopicIllustrationCard topicId="w2-t5" />
              </div>
            </div>
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-blue-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: NEWS DETECTIVE (Auditoria de Notícia Viral)
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Investiga a publicação antes de partilhar
              </span>
            </div>

            {/* Publicação Viral */}
            <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/50 space-y-3">
              <div className="flex items-center gap-2 text-rose-700 text-xs font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>Publicação muito partilhada nas redes sociais</span>
              </div>
              <h4 className="text-base font-black text-slate-900">
                "Cientistas descobrem criatura extraterrestre na Serra da Estrela! As autoridades querem calar a verdade!"
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                Acompanhado de uma foto desfocada com cores artificiais, sem links para instituições e sem nome de investigador.
              </p>
            </div>

            {/* Checklist de Auditoria */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Passos de Investigação do Detetive: (Marca os que verificaste)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={newsDetectiveAudit.checkedAuthor}
                    onChange={(e) =>
                      setNewsDetectiveAudit((prev) => ({
                        ...prev,
                        checkedAuthor: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 rounded-md"
                  />
                  <span>1. Procurar autor ou cientista responsável</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={newsDetectiveAudit.checkedDate}
                    onChange={(e) =>
                      setNewsDetectiveAudit((prev) => ({
                        ...prev,
                        checkedDate: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 rounded-md"
                  />
                  <span>2. Verificar a data e origem original da imagem</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={newsDetectiveAudit.checkedEvidence}
                    onChange={(e) =>
                      setNewsDetectiveAudit((prev) => ({
                        ...prev,
                        checkedEvidence: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 rounded-md"
                  />
                  <span>3. Analisar se existem provas reais ou fotos manipuladas</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={newsDetectiveAudit.checkedOtherSources}
                    onChange={(e) =>
                      setNewsDetectiveAudit((prev) => ({
                        ...prev,
                        checkedOtherSources: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 rounded-md"
                  />
                  <span>4. Procurar confirmação noutros jornais de referência</span>
                </label>
              </div>
            </div>

            {/* Decisão Final */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => handleNewsDecision('desconfiar')}
                className="w-full sm:w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Desconfiar e Não Partilhar (É Boato)</span>
              </button>
              <button
                onClick={() => handleNewsDecision('partilhar')}
                className="w-full sm:w-1/2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-3 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Partilhar Imediatamente com os Amigos</span>
              </button>
            </div>

            {newsScore !== null && (
              <div
                className={`p-4 rounded-2xl border text-xs font-medium ${
                  newsDecision === 'desconfiar'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <p className="font-bold mb-1">
                  Resultado do News Detective: {newsScore}/100
                </p>
                <p>
                  {newsDecision === 'desconfiar'
                    ? 'Parabéns, Detetive Digital! Agiste de forma responsável. Ao não partilhar boatos sensacionalistas sem fontes fidedignas, ajudas a manter a Internet um lugar mais seguro e confiável para todos.'
                    : 'Cuidado! Partilhar conteúdo sem verificar apenas espalha boatos e desinformação. O lema do Detetive é: Para, Verifica, Compara. Só depois partilha!'}
                </p>
              </div>
            )}
          </div>

          {/* 🎯 Conclusão / Avaliação */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('avaliacao')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Avançar para a Avaliação Final do Mundo 2</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SEPARADOR 6: AVALIAÇÃO FINAL */}
      {/* ========================================================= */}
      {activeTopicId === 'avaliacao' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs max-w-3xl mx-auto space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-black text-blue-600 uppercase tracking-wider block">
              {world.title}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Avaliação Final de 8 Perguntas
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
              Demonstra que sabes pesquisar com rigor, identificar autores credíveis e detetar notícias falsas para desbloquear o Mundo 3!
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl max-w-md mx-auto text-xs text-blue-950 font-semibold space-y-1">
            <p>🏆 Requisito para desbloquear o Mundo 3: Média &gt; 80%</p>
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm px-8 py-3.5 rounded-2xl shadow-md transition-all hover:scale-105 inline-flex items-center gap-2"
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
