import React, { useState } from 'react';
import {
  Search,
  UserCheck,
  Calendar,
  Layers,
  AlertOctagon,
  CheckCircle2,
  Trophy,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Award,
  Zap,
  Check,
  Lightbulb,
  Filter,
  Globe,
  FileText,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  RefreshCw,
  Clock,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { WorldSummary } from '../types';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { DetectiveKidHero } from './WorldMascots';
import { StudyStackIllustration } from './DetectiveMascot';
import { AudioReaderButton } from './AudioReaderButton';
import { GlossaryTerm } from './PedagogicalGlossary';
import { TopicIllustrationCard } from './TopicIllustrationCard';
import { MetacognitionWidget } from './MetacognitionWidget';
import { ScaffoldingClueCard } from './ScaffoldingClueCard';
import { PROGRESSION_CONFIG } from '../progressionConfig';

interface World2ThematicViewProps {
  world: WorldSummary;
  activeTopicId: string;
  onNavigateTopic: (topicId: string) => void;
  onOpenAssessment: () => void;
  onRefreshWorld: () => Promise<void> | void;
}

export const World2ThematicView: React.FC<World2ThematicViewProps> = ({
  world,
  activeTopicId,
  onNavigateTopic,
  onOpenAssessment,
  onRefreshWorld,
}) => {
  const { refreshUser } = useAuth();

  // Completed feedback banner at top
  const [completedFeedback, setCompletedFeedback] = useState<{
    score: number;
    xpGain: number;
    newBest: number;
    activityTitle: string;
  } | null>(null);

  // -------------------------------------------------------------
  // 1. RADAR DE PALAVRAS-CHAVE SIMULATOR STATE
  // -------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOutput, setSearchOutput] = useState<{
    title: string;
    count: string;
    hint: string;
    score: number;
  } | null>(null);
  const [keywordChoices, setKeywordChoices] = useState<Record<string, string>>({});
  const [keywordScore, setKeywordScore] = useState<number | null>(null);

  const evaluateSearchQuery = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchOutput({
        title: 'Escreve uma pesquisa para testar!',
        count: '0 resultados',
        hint: 'Experimenta escrever termos específicos como "lince ibérico" Portugal ou apenas lince.',
        score: 0,
      });
      return;
    }

    if (q.includes('"lince ibérico"') && (q.includes('portugal') || q.includes('extinção'))) {
      setSearchOutput({
        title: '🎯 Pesquisa Perfeita de Detetive!',
        count: '1.240 resultados de alta precisão',
        hint: 'Excelente! Usaste aspas para fixar a espécie exata ("lince ibérico") e especificaste o país. Os primeiros resultados são relatórios do ICNF e universidades!',
        score: 100,
      });
    } else if (q.includes('lince') && q.includes('portugal')) {
      setSearchOutput({
        title: '✓ Boa Pesquisa!',
        count: '48.500 resultados',
        hint: 'Muito bom! Juntaste a espécie e o país. Para ficar ainda mais rigorosa, coloca "lince ibérico" entre aspas para não dispersar.',
        score: 85,
      });
    } else if (q.includes('lince')) {
      setSearchOutput({
        title: '⚠️ Pesquisa Parcial',
        count: '320.000 resultados',
        hint: 'Aparecem linces do Canadá, da Sibéria e de desenhos animados. Adiciona "Portugal" e "extinção" para filtrar o ruído.',
        score: 60,
      });
    } else if (q.length > 25 && (q.includes('como') || q.includes('porque') || q.includes('onde'))) {
      setSearchOutput({
        title: '🌫️ Frase de Conversa Demasiado Longa',
        count: '1.850.000 resultados dispersos',
        hint: 'Em vez de frases de conversa, retira os pronomes e verbos soltos. Usa apenas as palavras-chave essenciais!',
        score: 45,
      });
    } else {
      setSearchOutput({
        title: '😴 Pesquisa Genérica',
        count: '4.900.000 resultados',
        hint: 'Termos soltos e genéricos trazem milhões de páginas que não respondem à tua pergunta concreta.',
        score: 35,
      });
    }
  };

  const keywordScenarios = [
    {
      id: 'kw-1',
      situation: 'Trabalho de História sobre as consequências do terramoto de Lisboa de 1755.',
      options: [
        { id: 'kw-1a', label: 'escrever: "terramoto de lisboa" 1755 consequências reconstrução', correct: true },
        { id: 'kw-1b', label: 'escrever: "o que aconteceu às pessoas quando a terra tremeu em lisboa há muito tempo"', correct: false },
        { id: 'kw-1c', label: 'escrever apenas: "lisboa"', correct: false },
      ],
      explanation: 'Usar aspas na expressão exata, o ano e os temas concretos (consequências, reconstrução) dá acesso direto a fontes históricas sérias!',
    },
    {
      id: 'kw-2',
      situation: 'Ficha de Ciências sobre painéis solares e energias renováveis em Portugal.',
      options: [
        { id: 'kw-2a', label: 'escrever: "energia solar" Portugal estatísticas renováveis', correct: true },
        { id: 'kw-2b', label: 'escrever: "o sol brilha muito em portugal e dá luz às casas"', correct: false },
        { id: 'kw-2c', label: 'escrever apenas: "sol"', correct: false },
      ],
      explanation: 'Termos técnicos e específicos trazem relatórios oficiais de energia em vez de previsões meteorológicas ou desenhos infantis.',
    },
    {
      id: 'kw-3',
      situation: 'Guia prático para saber como reciclar pilhas e baterias usadas na tua escola.',
      options: [
        { id: 'kw-3a', label: 'escrever: reciclagem pilhas baterias pilhão escola Portugal', correct: true },
        { id: 'kw-3b', label: 'escrever: "onde é que ponho as pilhas velhas do comando"', correct: false },
        { id: 'kw-3c', label: 'escrever apenas: "lixo"', correct: false },
      ],
      explanation: 'Palavras como "pilhão" e "baterias" direcionam para a entidade gestora de resíduos oficial (Electrão).',
    },
  ];

  const handleKeywordSubmit = () => {
    let correct = 0;
    keywordScenarios.forEach((scen) => {
      const selected = scen.options.find((o) => o.id === keywordChoices[scen.id]);
      if (selected && selected.correct) correct++;
    });
    const score = Math.round((correct / keywordScenarios.length) * 100);
    setKeywordScore(score);
    reportCompletion('sim-keywords', 'Radar de Palavras-Chave', { answers: keywordChoices }, score);
  };

  // -------------------------------------------------------------
  // 2. QUEM É O AUTOR SIMULATOR STATE
  // -------------------------------------------------------------
  const [authorChoices, setAuthorChoices] = useState<Record<string, 'confiavel' | 'suspeito'>>({});
  const [authorScore, setAuthorScore] = useState<number | null>(null);

  const authorCases = [
    {
      id: 'aut-1',
      title: 'Artigo sobre Vulcões e Sismos',
      meta: 'Portal IPMA (Instituto Português do Mar e da Atmosfera) • Dra. Helena Matos, Geóloga Investigadora',
      body: 'Artigo técnico com mapas de atividade sísmica recente, referências científicas e contacto institucional da equipa de geologia.',
      correct: 'confiavel',
      explanation: 'Excelente! Entidade pública reconhecida e autora especialista com credenciais verificadas.',
    },
    {
      id: 'aut-2',
      title: 'Descoberta do Planeta Oculto',
      meta: 'Blogue gratuito "MisteriosOnline.net" • Autor: "AlienHunter99" (Sem foto nem biografia)',
      body: 'Texto a garantir que a NASA está a esconder um planeta gigante atrás da Lua, sem apresentar qualquer foto ou estudo oficial.',
      correct: 'suspeito',
      explanation: 'Cuidado! Autor anónimo com nickname, blogue não oficial e afirmações bombásticas sem provas científicas.',
    },
    {
      id: 'aut-3',
      title: 'História dos Castelos Medievais',
      meta: 'Universidade de Coimbra - Departamento de História • Prof. Doutor Manuel Silva',
      body: 'Resumo pedagógico revisto por docentes de História Medieval com bibliografia recomendada para alunos.',
      correct: 'confiavel',
      explanation: 'Muito bem! Domínio universitário (.uc.pt), autoria docente identificada e bibliografia séria.',
    },
    {
      id: 'aut-4',
      title: 'Cura Milagrosa com Sumo de Limão',
      meta: 'Página de Instagram com link para loja • "Coach de Saúde Natural"',
      body: 'Alegações de que beber 2 litros de limão cura qualquer constipação, com botão "Compre o nosso ebook por 19€".',
      correct: 'suspeito',
      explanation: 'Alerta! Conteúdo comercial que usa conselhos de saúde falsos para vender produtos e sem validação médica.',
    },
  ];

  const handleAuthorSubmit = () => {
    let correct = 0;
    authorCases.forEach((c) => {
      if (authorChoices[c.id] === c.correct) correct++;
    });
    const score = Math.round((correct / authorCases.length) * 100);
    setAuthorScore(score);
    reportCompletion('sim-author-check', 'Investigação da Autoria e Credibilidade', { answers: authorChoices }, score);
  };

  // -------------------------------------------------------------
  // 3. LINHA DO TEMPO SIMULATOR STATE
  // -------------------------------------------------------------
  const [dateChoices, setDateChoices] = useState<Record<string, 'recente' | 'antigo_reciclado'>>({});
  const [dateScore, setDateScore] = useState<number | null>(null);

  const dateCases = [
    {
      id: 'dt-1',
      title: 'Tornado Destruidor em Portugal',
      claim: 'Vídeo partilhado hoje nas redes sociais com a legenda "ESTÁ A ACONTECER AGORA NO ALGARVE!".',
      fact: 'Ao pesquisar a imagem no motor de busca, descobre-se que a gravação original é de um tornado de 2017 no Kansas (EUA).',
      correct: 'antigo_reciclado',
      explanation: 'Boato reciclado! Vídeos de tempestades antigas de outros países são frequentemente reaproveitados para gerar pânico e cliques.',
    },
    {
      id: 'dt-2',
      title: 'Novo Telescópio Espacial James Webb',
      claim: 'Comunicado de imprensa da Agência Espacial Europeia (ESA) com data de ontem e galeria de imagens em alta resolução.',
      fact: 'Informação acompanhada de data completa (dia, mês e ano) e confirmada no site principal da NASA.',
      correct: 'recente',
      explanation: 'Informação fresca e autêntica! Fontes científicas oficiais atualizam relatórios com datas precisas.',
    },
    {
      id: 'dt-3',
      title: 'Instalar o Windows 7 para Estudar',
      claim: 'Guia informático num fórum a explicar como configurar computadores para as aulas virtuais.',
      fact: 'O artigo foi escrito em 2010. O sistema Windows 7 já não recebe atualizações de segurança e está obsoleto.',
      correct: 'antigo_reciclado',
      explanation: 'Informação desatualizada! Em tecnologia, tutoriais com mais de 5 a 10 anos podem conter falhas de segurança graves.',
    },
    {
      id: 'dt-4',
      title: 'Censo do Lince Ibérico em Portugal',
      claim: 'Relatório do ICNF publicado este ano com a contagem oficial de mais de 1.000 linces na Península Ibérica.',
      fact: 'Dados estatísticos revistos recentemente pelas equipas de biólogos no terreno.',
      correct: 'recente',
      explanation: 'Excelente! Estatísticas de conservação da natureza devem ser sempre as mais recentes para refletir o estado atual.',
    },
  ];

  const handleDateSubmit = () => {
    let correct = 0;
    dateCases.forEach((c) => {
      if (dateChoices[c.id] === c.correct) correct++;
    });
    const score = Math.round((correct / dateCases.length) * 100);
    setDateScore(score);
    reportCompletion('sim-date-verifier', 'Verificação da Linha Temporal', { answers: dateChoices }, score);
  };

  // -------------------------------------------------------------
  // 4. COMPARAR PISTAS (TRIANGULAÇÃO) SIMULATOR STATE
  // -------------------------------------------------------------
  const [sourceChoices, setSourceChoices] = useState<Record<string, string>>({});
  const [sourceScore, setSourceScore] = useState<number | null>(null);

  const sourceScenarios = [
    {
      id: 'src-1',
      question: 'Encontraste um site a afirmar que "Cientistas criaram uma árvore que dá batatas fritas prontas a comer". Como verificas se é verdade?',
      options: [
        { id: 'src-1a', label: 'Procurar a notícia em 2 a 3 jornais sérios e sites de universidades de Agronomia. Se ninguém mais fala disso, é falso.', correct: true },
        { id: 'src-1b', label: 'Acreditar porque o site tem uma fotografia muito convincente gerada por computador.', correct: false },
        { id: 'src-1c', label: 'Partilhar logo no grupo da turma para perguntar a toda a gente.', correct: false },
      ],
      explanation: 'A regra da triangulação exige que afirmações extraordinárias sejam confirmadas por múltiplas fontes independentes e reputadas.',
    },
    {
      id: 'src-2',
      question: 'Três jornais nacionais independentes noticiam que amanhã haverá eclipse lunar visível em Portugal às 21h. O que concluis?',
      options: [
        { id: 'src-2a', label: 'É altamente fiável, pois múltiplos órgãos de comunicação confirmam o mesmo facto de forma independente.', correct: true },
        { id: 'src-2b', label: 'É mentira porque ainda não viste o eclipse com os teus próprios olhos.', correct: false },
        { id: 'src-2c', label: 'Apenas um dos jornais tem razão e os outros dois estão a inventar.', correct: false },
      ],
      explanation: 'Quando várias fontes sérias confirmam os mesmos dados de forma coerente, a probabilidade de verdade é elevadíssima.',
    },
  ];

  const handleSourceSubmit = () => {
    let correct = 0;
    sourceScenarios.forEach((scen) => {
      const selected = scen.options.find((o) => o.id === sourceChoices[scen.id]);
      if (selected && selected.correct) correct++;
    });
    const score = Math.round((correct / sourceScenarios.length) * 100);
    setSourceScore(score);
    reportCompletion('sim-source-compare', 'Triangulação e Comparação de Fontes', { answers: sourceChoices }, score);
  };

  // -------------------------------------------------------------
  // 5. CAÇA A BOATOS & DESINFORMAÇÃO SIMULATOR STATE
  // -------------------------------------------------------------
  const [newsChoices, setNewsChoices] = useState<Record<string, 'noticia_real' | 'boato_clickbait'>>({});
  const [newsScore, setNewsScore] = useState<number | null>(null);

  const newsCases = [
    {
      id: 'nw-1',
      headline: 'URGENTE: NÃO VAIS ACREDITAR NO QUE DESCOBRIRAM SOBRE A ÁGUA DA TORNEIRA! PARTILHA JÁ ANTES QUE APAGUEM!!',
      correct: 'boato_clickbait',
      explanation: 'Típico clickbait: maiúsculas, urgência dramática, emojis de pânico e pedido para partilhar sem ler nem pensar.',
    },
    {
      id: 'nw-2',
      headline: 'Ministério da Educação divulga calendário das provas de aferição para o 5.º e 6.º anos de escolaridade.',
      correct: 'noticia_real',
      explanation: 'Tom informativo sóbrio, fonte oficial identificada e sem apelo a emoções extremas.',
    },
    {
      id: 'nw-3',
      headline: 'Cientistas afirmam que comer chocolate às refeições aumenta a inteligência em 300% de um dia para o outro.',
      correct: 'boato_clickbait',
      explanation: 'Promessa milagrosa e impossível. Cuidado com manchetes que parecem boas demais para ser verdade!',
    },
    {
      id: 'nw-4',
      headline: 'Parque Natural da Arrábida implementa novas regras de proteção ambiental para preservar espécies de plantas raras.',
      correct: 'noticia_real',
      explanation: 'Comunicação factual sobre conservação da natureza com detalhes e contexto rigoroso.',
    },
  ];

  const handleNewsSubmit = () => {
    let correct = 0;
    newsCases.forEach((c) => {
      if (newsChoices[c.id] === c.correct) correct++;
    });
    const score = Math.round((correct / newsCases.length) * 100);
    setNewsScore(score);
    reportCompletion('sim-news-detective', 'Caça a Boatos & Desinformação', { answers: newsChoices }, score);
  };

  // -------------------------------------------------------------
  // COMPLETION DISPATCHER
  // -------------------------------------------------------------
  const reportCompletion = async (
    simId: string,
    activityTitle: string,
    payloadData?: any,
    score: number = 100
  ) => {
    try {
      const res = await apiRequest('/api/pedagogical/activities/complete', {
        method: 'POST',
        body: JSON.stringify({
          activityId: simId,
          worldId: 2,
          answers: payloadData?.answers || payloadData,
          payload: payloadData,
          completedAction: payloadData?.completedAction || 'completed',
          score,
        }),
      });

      setCompletedFeedback({
        score: res.score || score,
        xpGain: res.xpGain || 30,
        newBest: res.newBest || score,
        activityTitle,
      });

      await refreshUser();
      await onRefreshWorld();
    } catch (err: any) {
      console.error('Failed to report completion:', err);
    }
  };

  const effectiveTopicId =
    ['w2-t1', 'w2-t2', 'w2-t3', 'w2-t4', 'w2-t5', 'avaliacao'].includes(activeTopicId)
      ? activeTopicId
      : 'w2-t1';

  const getSimProg = (simId: string) => {
    return world.simulatorsProgress?.find((p) => p.id === simId);
  };

  const routePercent = world.average > 0 ? Math.round(world.average) : 0;

  const missionNavList = [
    {
      id: 'w2-t1',
      stepLabel: 'Missão 1/6',
      title: 'Radar de Pesquisa',
      icon: Search,
      iconBgClass: 'bg-blue-50 text-blue-600',
      simId: 'sim-keywords',
    },
    {
      id: 'w2-t2',
      stepLabel: 'Missão 2/6',
      title: 'Quem é o Autor?',
      icon: UserCheck,
      iconBgClass: 'bg-indigo-50 text-indigo-600',
      simId: 'sim-author-check',
    },
    {
      id: 'w2-t3',
      stepLabel: 'Missão 3/6',
      title: 'Linha do Tempo',
      icon: Calendar,
      iconBgClass: 'bg-amber-50 text-amber-600',
      simId: 'sim-date-verifier',
    },
    {
      id: 'w2-t4',
      stepLabel: 'Missão 4/6',
      title: 'Comparar Pistas',
      icon: Layers,
      iconBgClass: 'bg-purple-50 text-purple-600',
      simId: 'sim-source-compare',
    },
    {
      id: 'w2-t5',
      stepLabel: 'Missão 5/6',
      title: 'Caça a Boatos',
      icon: AlertOctagon,
      iconBgClass: 'bg-rose-50 text-rose-600',
      simId: 'sim-news-detective',
    },
    {
      id: 'avaliacao',
      stepLabel: 'Missão 6/6',
      title: 'Quiz do Detetive',
      icon: Trophy,
      iconBgClass: 'bg-emerald-50 text-emerald-600',
      simId: 'assessment',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 🚀 BANNER DE SUCESSO DE ATIVIDADE CONCLUÍDA */}
      {completedFeedback && (
        <div className="p-4 bg-blue-100 border border-blue-300 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
              ✓
            </div>
            <div>
              <p className="text-xs font-black text-blue-900 uppercase">
                Atividade Concluída: {completedFeedback.activityTitle}
              </p>
              <p className="text-xs text-blue-800">
                Pontuação: <strong>{completedFeedback.score}%</strong> | Ganhaste{' '}
                <strong>+{completedFeedback.xpGain} XP</strong>!
              </p>
            </div>
          </div>
          <span className="text-xs font-black bg-blue-200 text-blue-900 px-3 py-1.5 rounded-xl border border-blue-300">
            Melhor Recorde: {completedFeedback.newBest}/100
          </span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🔍 HERO BANNER DETETIVE DIGITAL (Pixar 3D Theme)          */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-b from-[#bae6fd] via-[#e0f2fe] to-[#f0f9ff] border border-[#38bdf8] p-6 sm:p-8 lg:p-9 shadow-sm">
        {/* Soft background clouds and radial highlights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-blue-200/40 rounded-full blur-2xl pointer-events-none" />

        {/* Top Breadcrumb & Route Progress */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2 text-xs font-black text-blue-900 tracking-wide uppercase">
            <span className="w-5 h-5 rounded-full bg-white text-blue-600 flex items-center justify-center text-xs shadow-2xs">
              🌐
            </span>
            <span>MUNDO 2</span>
            <span className="text-blue-600 font-bold">&gt;</span>
            <span>DETETIVE DIGITAL</span>
            <span className="text-base">🔍</span>
          </div>

          <div className="bg-white/95 backdrop-blur-md border border-white/90 rounded-2xl px-4 py-2 shadow-xs flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-slate-800 tracking-wider">
              <span className="text-amber-500 text-sm">👑</span>
              <span>A TUA ROTA NO MUNDO</span>
            </div>
            <div className="w-24 sm:w-28 bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/80">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${routePercent}%` }}
              />
            </div>
            <span className="text-xs font-black text-slate-900 tabular-nums">
              {routePercent}%
            </span>
          </div>
        </div>

        {/* Middle Hero: Headline, Subtitle, Detective Mascot */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 my-6 relative z-10">
          <div className="max-w-xl space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-slate-950 tracking-tight leading-[1.12]">
              A Lupa da Verdade:<br />
              Pesquisa Inteligente, Fontes Fiáveis<br />
              e Caça a Boatos na Rede!
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed max-w-lg">
              A tua missão de detetive: desmascarar notícias falsas, verificar autores e datas, e navegar com pensamento crítico afiado! 🔎🕵️‍♂️
            </p>
          </div>
          <div className="shrink-0 flex justify-center lg:justify-end">
            <DetectiveKidHero className="w-64 sm:w-72 lg:w-[350px] h-auto drop-shadow-md" />
          </div>
        </div>

        {/* 6 Mission Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10">
          {missionNavList.map((m) => {
            const Icon = m.icon;
            const isActive = effectiveTopicId === m.id;
            const simProg = getSimProg(m.simId);

            return (
              <button
                key={m.id}
                onClick={() => onNavigateTopic(m.id)}
                className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400'
                    : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : m.iconBgClass
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="text-left">
                    <span
                      className={`text-[10px] font-bold block ${
                        isActive ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {m.stepLabel}
                    </span>
                    <span className="text-xs sm:text-sm font-black truncate">{m.title}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {simProg?.completed && (
                    <CheckCircle2
                      className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-600'}`}
                    />
                  )}
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-blue-500'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. SEPARADOR: RADAR DE PALAVRAS-CHAVE                     */}
      {/* ========================================================= */}
      {effectiveTopicId === 'w2-t1' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Mission Header Card */}
          <div className="bg-white border-2 border-blue-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                <Search className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-blue-600 uppercase tracking-wider">
                    🎯 MISSÃO 1/6
                  </span>
                  <AudioReaderButton
                    textToRead="Missão 1: O Radar das Palavras-Chave. Pesquisar na Internet é como ser um detetive à procura de pistas secretas. Se escreveres apenas animais, vais encontrar milhões de páginas genéricas. Mas se usares termos precisos como lince ibérico em perigo Portugal, chegas direto ao tesouro!"
                    label="Ouvir Missão ✨"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  O Radar das Palavras-Chave 🔍
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Aprende a formular pesquisas precisas com{' '}
                  <GlossaryTerm term="palavras-chave">palavras-chave</GlossaryTerm> e filtros inteligentes.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-keywords')?.completed ? (
                <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 border border-emerald-200 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-keywords')?.score} pts)</span>
                </span>
              ) : (
                <span className="bg-blue-50 text-blue-800 border border-blue-200 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1">
                  <Zap className="w-4 h-4 text-blue-600 fill-current" />
                  <span>Recompensa: +100 XP</span>
                </span>
              )}
            </div>
          </div>

          {/* 💡 1. APRENDE */}
          <div className="bg-white border-2 border-blue-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-blue-700">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h4 className="text-sm font-black uppercase tracking-wide">
                💡 1. Aprende: A Arte da Pesquisa Científica Eficaz
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5">
                <div className="text-2xl">🎯</div>
                <h5 className="font-black text-blue-950 text-sm">Termos Específicos Vencem</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Em vez de frases compridas de conversa, junta os termos essenciais: tema + espécie + país.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <div className="text-2xl">✨</div>
                <h5 className="font-black text-amber-950 text-sm">O Super-Poder das Aspas (" ")</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Coloca expressões entre aspas (ex.: <em>"lince ibérico"</em>) para procurar o termo exato sem dispersão.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <div className="text-2xl">🔎</div>
                <h5 className="font-black text-emerald-950 text-sm">Não Cliques Sem Ler</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Lê o resumo antes de abrir. O primeiro resultado nem sempre é o mais rigoroso ou científico.
                </p>
              </div>
            </div>

            <TopicIllustrationCard topicId="w2-t1" />
          </div>

          {/* 🎮 2. EXPERIMENTA: SIMULADOR DE PALAVRAS-CHAVE */}
          <div className="bg-white border-2 border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-blue-700">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  🎮 2. Experimenta: Simulador de Motor de Busca & Desafios
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Laboratório Prático
              </span>
            </div>

            {/* Test search query field */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                🧪 Teste de Eficácia de Pesquisa: Lince Ibérico em Portugal
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder='ex: "lince ibérico" Portugal extinção ou apenas lince...'
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 font-semibold text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <button
                  onClick={evaluateSearchQuery}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all cursor-pointer shrink-0"
                >
                  Analisar Eficácia
                </button>
              </div>

              {/* Quick suggestions chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600 font-semibold">
                <span className="text-slate-400">Sugestões rápidas:</span>
                <button
                  onClick={() => {
                    setSearchQuery('"lince ibérico" Portugal extinção');
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                >
                  "lince ibérico" Portugal extinção
                </button>
                <button
                  onClick={() => {
                    setSearchQuery('lince');
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                >
                  lince
                </button>
                <button
                  onClick={() => {
                    setSearchQuery('porque é que os animais desaparecem na floresta');
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                >
                  frase longa de conversa
                </button>
              </div>

              {searchOutput && (
                <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h5 className="font-black text-sm sm:text-base text-blue-950">{searchOutput.title}</h5>
                    <span className="text-xs font-mono font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200">
                      {searchOutput.count}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                    {searchOutput.hint}
                  </p>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        searchOutput.score >= 80 ? 'bg-emerald-500' : searchOutput.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${searchOutput.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Practical Scenarios */}
            <div className="space-y-4 pt-3 border-t border-slate-100">
              <h5 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Desafio de Detetive: Escolhe a Melhor Estratégia de Pesquisa
              </h5>

              <div className="space-y-4">
                {keywordScenarios.map((scen, idx) => {
                  return (
                    <div
                      key={scen.id}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                          {scen.situation}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-2 pt-1 pl-9">
                        {scen.options.map((opt) => {
                          const isSelected = keywordChoices[scen.id] === opt.id;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => setKeywordChoices((prev) => ({ ...prev, [scen.id]: opt.id }))}
                              className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                              }`}
                            >
                              <span>{opt.label}</span>
                              {isSelected && <Check className="w-4 h-4 shrink-0 text-white" />}
                            </button>
                          );
                        })}
                      </div>

                      {keywordScore !== null && (
                        <div className="pl-9 text-xs text-slate-600 font-medium">
                          {scen.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <button
                  onClick={handleKeywordSubmit}
                  disabled={Object.keys(keywordChoices).length < keywordScenarios.length}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Validar Estratégias de Pesquisa</span>
                </button>

                {keywordScore !== null && (
                  <div className="text-xs font-black text-emerald-800 bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-200">
                    Pontuação: {keywordScore}% • {keywordScore >= 70 ? '🎯 Excelente Detetive!' : '⚠️ Pratica mais!'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ⭐ 3. O QUE APRENDES NESTA MISSÃO? */}
          <div className="bg-gradient-to-r from-blue-50/90 via-sky-50/60 to-blue-50/90 border border-blue-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <StudyStackIllustration className="w-24 h-24 sm:w-28 sm:h-28" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 text-blue-900 font-black text-xs sm:text-sm uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-500 fill-current" />
                <span>O QUE APRENDES NESTA MISSÃO?</span>
              </div>
              <div className="space-y-1.5 text-xs sm:text-sm text-slate-700 font-medium">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Substituir perguntas compridas de conversa por termos técnicos e objetivos.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Usar aspas (" ") para prender expressões exatas sem dispersão.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Ler os resumos antes de clicar para poupar tempo e evitar desinformação.</span>
                </div>
              </div>
            </div>
          </div>

          <ScaffoldingClueCard
            clues={[
              'Usa aspas para manter palavras unidas na pesquisa: "D. Afonso Henriques".',
              'Substitui verbos e perguntas por substantivos e nomes concretos.',
              'Adiciona o ano ou o formato do ficheiro (ex.: filetype:pdf) para chegar a documentos sérios.',
            ]}
          />

          <MetacognitionWidget worldId={2} topicId="w2-t1" />

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => onNavigateTopic('w2-t2')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Próxima Missão: 2. Quem é o Autor? 🕵️</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SEPARADOR: QUEM É O AUTOR?                             */}
      {/* ========================================================= */}
      {effectiveTopicId === 'w2-t2' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Mission Header Card */}
          <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
                <UserCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">
                    🎯 MISSÃO 2/6
                  </span>
                  <AudioReaderButton
                    textToRead="Missão 2: Quem Escreveu Isto? O Selo do Autor. Qualquer pessoa pode publicar na web. Antes de acreditares no que lês, procura sempre o nome do autor ou a instituição que publicou o artigo."
                    label="Ouvir Missão ✨"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  Quem Escreveu Isto? O Selo do Autor 🕵️
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Investiga a <GlossaryTerm term="autoria">autoria</GlossaryTerm> e a reputação das fontes para evitar armadilhas de desinformação.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-author-check')?.completed ? (
                <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 border border-emerald-200 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-author-check')?.score} pts)</span>
                </span>
              ) : (
                <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1">
                  <Zap className="w-4 h-4 text-indigo-600 fill-current" />
                  <span>Recompensa: +100 XP</span>
                </span>
              )}
            </div>
          </div>

          {/* 💡 1. APRENDE */}
          <div className="bg-white border-2 border-indigo-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-indigo-700">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h4 className="text-sm font-black uppercase tracking-wide">
                💡 1. Aprende: O Selo de Confiança e Credibilidade
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1.5">
                <div className="text-2xl">👤</div>
                <h5 className="font-black text-indigo-950 text-sm">Autores Reais com Rosto</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Artigos credíveis mostram quem escreveu, a profissão ou formação académica e meios de contacto.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5">
                <div className="text-2xl">🏛️</div>
                <h5 className="font-black text-blue-950 text-sm">Entidades Reconhecidas</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Universidades, museus, escolas e organismos oficiais (.edu, .gov, .org) possuem equipas técnicas rigorosas.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                <div className="text-2xl">🛑</div>
                <h5 className="font-black text-rose-950 text-sm">Alerta de Anonimato</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Páginas sem autor ou assinadas com nicknames fictícios sem fontes devem ser vistas com enorme desconfiança.
                </p>
              </div>
            </div>

            <TopicIllustrationCard topicId="w2-t2" />
          </div>

          {/* 🎮 2. EXPERIMENTA: SIMULADOR DE DETETIVE DE AUTORIA */}
          <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  🎮 2. Experimenta: Avaliação de Autoria e Credibilidade
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Classifica 4 Casos Web
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Classifica cada uma das 4 páginas encontradas online como <strong>Fiável / Oficial 🛡️</strong> ou <strong>Suspeito / Sem Credibilidade ⚠️</strong>:
            </p>

            <div className="space-y-4">
              {authorCases.map((c) => {
                const choice = authorChoices[c.id];
                return (
                  <div
                    key={c.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3"
                  >
                    <div className="space-y-1">
                      <h5 className="font-black text-sm text-slate-900">{c.title}</h5>
                      <span className="text-xs font-bold text-indigo-700 block">{c.meta}</span>
                      <p className="text-xs text-slate-600 leading-relaxed">{c.body}</p>
                    </div>

                    <div className="flex flex-wrap gap-2.5 pt-1">
                      <button
                        onClick={() => setAuthorChoices((prev) => ({ ...prev, [c.id]: 'confiavel' }))}
                        className={`px-4 py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                          choice === 'confiavel'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Fiável / Oficial 🛡️</span>
                      </button>

                      <button
                        onClick={() => setAuthorChoices((prev) => ({ ...prev, [c.id]: 'suspeito' }))}
                        className={`px-4 py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                          choice === 'suspeito'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Suspeito / Sem Credibilidade ⚠️</span>
                      </button>
                    </div>

                    {authorScore !== null && (
                      <div className="text-xs text-slate-600 font-medium pt-1">
                        {c.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                onClick={handleAuthorSubmit}
                disabled={Object.keys(authorChoices).length < authorCases.length}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Validar Análise de Autores</span>
              </button>

              {authorScore !== null && (
                <div className="text-xs font-black text-indigo-900 bg-indigo-100 px-4 py-2 rounded-xl border border-indigo-200">
                  Pontuação: {authorScore}% • {authorScore >= 70 ? '🏆 Excelente Auditoria!' : '⚠️ Atenção aos Detalhes!'}
                </div>
              )}
            </div>
          </div>

          {/* ⭐ 3. O QUE APRENDES NESTA MISSÃO? */}
          <div className="bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-indigo-50/90 border border-indigo-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <StudyStackIllustration className="w-24 h-24 sm:w-28 sm:h-28" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 text-indigo-900 font-black text-xs sm:text-sm uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-500 fill-current" />
                <span>O QUE APRENDES NESTA MISSÃO?</span>
              </div>
              <div className="space-y-1.5 text-xs sm:text-sm text-slate-700 font-medium">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Procurar a assinatura, profissão e biografia de quem escreve os artigos.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Reconhecer domínios de confiança (.edu, .gov, .org, universidades e museus).</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Desconfiar de autores anónimos e páginas que misturam notícias falsas com vendas.</span>
                </div>
              </div>
            </div>
          </div>

          <ScaffoldingClueCard
            clues={[
              'Vai à secção "Sobre Nós" ou "Quem Somos" do site para ver quem é a equipa.',
              'Pesquisa o nome do autor noutro motor de busca para confirmar se é especialista.',
              'Se ninguém assina o artigo nem assume responsabilidade, procura noutro site!',
            ]}
          />

          <MetacognitionWidget worldId={2} topicId="w2-t2" />

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => onNavigateTopic('w2-t3')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Próxima Missão: 3. Linha do Tempo ⏳</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SEPARADOR: LINHA DO TEMPO                              */}
      {/* ========================================================= */}
      {effectiveTopicId === 'w2-t3' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Mission Header Card */}
          <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-600 uppercase tracking-wider">
                    🎯 MISSÃO 3/6
                  </span>
                  <AudioReaderButton
                    textToRead="Missão 3: Linha do Tempo e Atualidade dos Factos. A ciência e a sociedade evoluem todos os dias. Uma notícia de 2014 pode já não corresponder à realidade ou às descobertas de hoje!"
                    label="Ouvir Missão ✨"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  Linha do Tempo & Atualidade dos Factos ⏳
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Aprende a verificar a data original de publicação e a detetar boatos e notícias recicladas.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-date-verifier')?.completed ? (
                <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 border border-emerald-200 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-date-verifier')?.score} pts)</span>
                </span>
              ) : (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1">
                  <Zap className="w-4 h-4 text-amber-600 fill-current" />
                  <span>Recompensa: +100 XP</span>
                </span>
              )}
            </div>
          </div>

          {/* 💡 1. APRENDE */}
          <div className="bg-white border-2 border-amber-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-amber-700">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h4 className="text-sm font-black uppercase tracking-wide">
                💡 1. Aprende: A Importância da Data e da Frescura dos Factos
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <div className="text-2xl">📅</div>
                <h5 className="font-black text-amber-950 text-sm">Data de Criação</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Procura sempre o dia, mês e ano no topo ou rodapé da notícia para saber quando aconteceu.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-1.5">
                <div className="text-2xl">🔄</div>
                <h5 className="font-black text-orange-950 text-sm">Vídeos Reciclados</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Muitos boatos pegam em vídeos de terramotos ou acidentes de há 6 anos e fingem que são de hoje.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5">
                <div className="text-2xl">⚡</div>
                <h5 className="font-black text-blue-950 text-sm">Ciência em Evolução</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Em saúde, biologia e tecnologia, prefere relatórios recentes para não aprender regras ultrapassadas.
                </p>
              </div>
            </div>

            <TopicIllustrationCard topicId="w2-t3" />
          </div>

          {/* 🎮 2. EXPERIMENTA: SIMULADOR DE VERIFICAÇÃO TEMPORAL */}
          <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-amber-700">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  🎮 2. Experimenta: Detetor de Atualidade e Reciclagem
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Verifica 4 Situações
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Avalia cada caso e decide se a informação é <strong>Atual & Recente ✨</strong> ou se é <strong>Antiga / Reciclada ⚠️</strong>:
            </p>

            <div className="space-y-4">
              {dateCases.map((c) => {
                const choice = dateChoices[c.id];
                return (
                  <div
                    key={c.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3"
                  >
                    <div className="space-y-1">
                      <h5 className="font-black text-sm text-slate-900">{c.title}</h5>
                      <p className="text-xs text-slate-700 font-bold">{c.claim}</p>
                      <p className="text-xs text-slate-500 italic">Pista do Detetive: {c.fact}</p>
                    </div>

                    <div className="flex flex-wrap gap-2.5 pt-1">
                      <button
                        onClick={() => setDateChoices((prev) => ({ ...prev, [c.id]: 'recente' }))}
                        className={`px-4 py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                          choice === 'recente'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        <span>Atual & Recente ✨</span>
                      </button>

                      <button
                        onClick={() => setDateChoices((prev) => ({ ...prev, [c.id]: 'antigo_reciclado' }))}
                        className={`px-4 py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                          choice === 'antigo_reciclado'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Antiga / Reciclada ⚠️</span>
                      </button>
                    </div>

                    {dateScore !== null && (
                      <div className="text-xs text-slate-600 font-medium pt-1">
                        {c.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                onClick={handleDateSubmit}
                disabled={Object.keys(dateChoices).length < dateCases.length}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Validar Verificação Temporal</span>
              </button>

              {dateScore !== null && (
                <div className="text-xs font-black text-amber-900 bg-amber-100 px-4 py-2 rounded-xl border border-amber-200">
                  Pontuação: {dateScore}% • {dateScore >= 70 ? '⏳ Olho de Lince Temporal!' : '⚠️ Cuidado com datas antigas!'}
                </div>
              )}
            </div>
          </div>

          {/* ⭐ 3. O QUE APRENDES NESTA MISSÃO? */}
          <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-50/90 border border-amber-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <StudyStackIllustration className="w-24 h-24 sm:w-28 sm:h-28" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 text-amber-900 font-black text-xs sm:text-sm uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-500 fill-current" />
                <span>O QUE APRENDES NESTA MISSÃO?</span>
              </div>
              <div className="space-y-1.5 text-xs sm:text-sm text-slate-700 font-medium">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Procurar a data e hora de publicação antes de partilhar notícias urgentes.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Reconhecer que vídeos de tempestades antigas são frequentemente reciclados.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Usar o filtro temporal do motor de busca para aceder a dados recentes.</span>
                </div>
              </div>
            </div>
          </div>

          <ScaffoldingClueCard
            clues={[
              'Se o artigo não tiver data visível, desconfia e procura o mesmo facto noutra fonte.',
              'No Google podes clicar em "Ferramentas" e escolher "Último ano" para ver só atualizações recentes.',
              'Pesquisa a imagem no motor de busca com "pesquisa reversa" para descobrir quando foi tirada pela 1.ª vez.',
            ]}
          />

          <MetacognitionWidget worldId={2} topicId="w2-t3" />

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => onNavigateTopic('w2-t4')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Próxima Missão: 4. Comparar Pistas 📑</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. SEPARADOR: COMPARAR PISTAS (TRIANGULAÇÃO)              */}
      {/* ========================================================= */}
      {effectiveTopicId === 'w2-t4' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Mission Header Card */}
          <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-xs">
                <Layers className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-purple-600 uppercase tracking-wider">
                    🎯 MISSÃO 4/6
                  </span>
                  <AudioReaderButton
                    textToRead="Missão 4: Triangulação e Comparação de Fontes. Nunca fiques apenas com o primeiro link encontrado. Comparar pelo menos duas a três fontes independentes é o segredo para confirmar a verdade!"
                    label="Ouvir Missão ✨"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  Comparar Pistas: A Regra da Triangulação 📑
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Aprende a cruzar dados de pelo menos 2 a 3 fontes independentes antes de tirar conclusões.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-source-compare')?.completed ? (
                <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 border border-emerald-200 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-source-compare')?.score} pts)</span>
                </span>
              ) : (
                <span className="bg-purple-50 text-purple-800 border border-purple-200 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1">
                  <Zap className="w-4 h-4 text-purple-600 fill-current" />
                  <span>Recompensa: +100 XP</span>
                </span>
              )}
            </div>
          </div>

          {/* 💡 1. APRENDE */}
          <div className="bg-white border-2 border-purple-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-purple-700">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h4 className="text-sm font-black uppercase tracking-wide">
                💡 1. Aprende: A Técnica da Triangulação de Informação
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1.5">
                <div className="text-2xl">📐</div>
                <h5 className="font-black text-purple-950 text-sm">A Regra dos 3 Pontos</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Tal como um mapa precisa de vários pontos para localizar um tesouro, os factos precisam de 3 confirmações.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1.5">
                <div className="text-2xl">🔍</div>
                <h5 className="font-black text-indigo-950 text-sm">Fontes Independentes</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Não contam três sites que copiaram o mesmo texto sem verificar. Devem ser equipas diferentes.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <div className="text-2xl">🎯</div>
                <h5 className="font-black text-emerald-950 text-sm">Confirmar Números</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Se um artigo diz que morreram 100 pessoas e todos os outros dizem 2 feridos ligeiros, desconfia do primeiro.
                </p>
              </div>
            </div>

            <TopicIllustrationCard topicId="w2-t4" />
          </div>

          {/* 🎮 2. EXPERIMENTA: SIMULADOR DE TRIANGULAÇÃO */}
          <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-purple-700">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  🎮 2. Experimenta: Desafio de Triangulação de Fontes
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Cruza Dados Reais
              </span>
            </div>

            <div className="space-y-4">
              {sourceScenarios.map((scen, idx) => {
                return (
                  <div
                    key={scen.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                        {scen.question}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pt-1 pl-9">
                      {scen.options.map((opt) => {
                        const isSelected = sourceChoices[scen.id] === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setSourceChoices((prev) => ({ ...prev, [scen.id]: opt.id }))}
                            className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {isSelected && <Check className="w-4 h-4 shrink-0 text-white" />}
                          </button>
                        );
                      })}
                    </div>

                    {sourceScore !== null && (
                      <div className="pl-9 text-xs text-slate-600 font-medium">
                        {scen.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                onClick={handleSourceSubmit}
                disabled={Object.keys(sourceChoices).length < sourceScenarios.length}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Validar Triangulação</span>
              </button>

              {sourceScore !== null && (
                <div className="text-xs font-black text-purple-900 bg-purple-100 px-4 py-2 rounded-xl border border-purple-200">
                  Pontuação: {sourceScore}% • {sourceScore >= 70 ? '🎯 Excelente Cruzamento de Pistas!' : '⚠️ Compara sempre mais fontes!'}
                </div>
              )}
            </div>
          </div>

          {/* ⭐ 3. O QUE APRENDES NESTA MISSÃO? */}
          <div className="bg-gradient-to-r from-purple-50/90 via-fuchsia-50/60 to-purple-50/90 border border-purple-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <StudyStackIllustration className="w-24 h-24 sm:w-28 sm:h-28" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 text-purple-900 font-black text-xs sm:text-sm uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-500 fill-current" />
                <span>O QUE APRENDES NESTA MISSÃO?</span>
              </div>
              <div className="space-y-1.5 text-xs sm:text-sm text-slate-700 font-medium">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Nunca aceitar um rumor extraordinário vindo de apenas uma página desconhecida.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Cruzar a notícia com jornais de referência e sites científicos reconhecidos.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Comparar números e datas para ver se as histórias são consistentes entre si.</span>
                </div>
              </div>
            </div>
          </div>

          <ScaffoldingClueCard
            clues={[
              'Dois factos que concordam dão uma pista; três fontes independentes dão uma confirmação.',
              'Se nenhum jornal sério fala do assunto, a probabilidade de ser falso é de 99%.',
              'Cuidado com páginas que só copiam textos umas das outras sem fazer investigação própria.',
            ]}
          />

          <MetacognitionWidget worldId={2} topicId="w2-t4" />

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => onNavigateTopic('w2-t5')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Próxima Missão: 5. Caça a Boatos 🚨</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. SEPARADOR: CAÇA A BOATOS & DESINFORMAÇÃO               */}
      {/* ========================================================= */}
      {effectiveTopicId === 'w2-t5' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Mission Header Card */}
          <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                <AlertOctagon className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-rose-600 uppercase tracking-wider">
                    🎯 MISSÃO 5/6
                  </span>
                  <AudioReaderButton
                    textToRead="Missão 5: Caça a Boatos e Desinformação. Títulos sensacionalistas foram desenhados para despertar medo ou surpresa e obrigar a partilhas rápidas. O detetive digital trava o clique, analisa as provas e desmascara fake news!"
                    label="Ouvir Missão ✨"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  Caça a Boatos & Desinformação 🚨
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Identifica táticas de <GlossaryTerm term="desinformação">desinformação</GlossaryTerm>, clickbait e aplica técnicas de fact-checking.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-news-detective')?.completed ? (
                <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 border border-emerald-200 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-news-detective')?.score} pts)</span>
                </span>
              ) : (
                <span className="bg-rose-50 text-rose-800 border border-rose-200 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1">
                  <Zap className="w-4 h-4 text-rose-600 fill-current" />
                  <span>Recompensa: +100 XP</span>
                </span>
              )}
            </div>
          </div>

          {/* 💡 1. APRENDE */}
          <div className="bg-white border-2 border-rose-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-rose-700">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h4 className="text-sm font-black uppercase tracking-wide">
                💡 1. Aprende: Como Reconhecer Notícias Falsas e Clickbait
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                <div className="text-2xl">🎣</div>
                <h5 className="font-black text-rose-950 text-sm">O Isco do Clickbait</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Títulos em MAIÚSCULAS com "NÃO VAIS ACREDITAR!" servem apenas para roubar cliques e ganhar dinheiro com anúncios.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <div className="text-2xl">🛑</div>
                <h5 className="font-black text-amber-950 text-sm">Travão de Partilha</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Não sejas o transmissor de boatos. Se sentires medo ou raiva imediata ao ler, para e pensa antes de partilhar.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <div className="text-2xl">🔎</div>
                <h5 className="font-black text-emerald-950 text-sm">Fact-Checking Oficial</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Plataformas como o Polígrafo analisam boatos virais e mostram aos leitores se a história é verdadeira ou falsa.
                </p>
              </div>
            </div>

            <TopicIllustrationCard topicId="w2-t5" />
          </div>

          {/* 🎮 2. EXPERIMENTA: SIMULADOR DE CAÇA A BOATOS */}
          <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-rose-700">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  🎮 2. Experimenta: Radar Caçador de Fake News
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Inspeciona 4 Manchetes
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Classifica cada uma das manchetes como <strong>Notícia Séria & Verificada 📰</strong> ou <strong>Boato / Clickbait Perigoso 🚨</strong>:
            </p>

            <div className="space-y-4">
              {newsCases.map((c) => {
                const choice = newsChoices[c.id];
                return (
                  <div
                    key={c.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3"
                  >
                    <p className="text-xs sm:text-sm font-black text-slate-900 leading-relaxed">
                      "{c.headline}"
                    </p>

                    <div className="flex flex-wrap gap-2.5 pt-1">
                      <button
                        onClick={() => setNewsChoices((prev) => ({ ...prev, [c.id]: 'noticia_real' }))}
                        className={`px-4 py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                          choice === 'noticia_real'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Notícia Séria & Verificada 📰</span>
                      </button>

                      <button
                        onClick={() => setNewsChoices((prev) => ({ ...prev, [c.id]: 'boato_clickbait' }))}
                        className={`px-4 py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                          choice === 'boato_clickbait'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <AlertOctagon className="w-4 h-4" />
                        <span>Boato / Clickbait Perigoso 🚨</span>
                      </button>
                    </div>

                    {newsScore !== null && (
                      <div className="text-xs text-slate-600 font-medium pt-1">
                        {c.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                onClick={handleNewsSubmit}
                disabled={Object.keys(newsChoices).length < newsCases.length}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Validar Caça a Boatos</span>
              </button>

              {newsScore !== null && (
                <div className="text-xs font-black text-rose-900 bg-rose-100 px-4 py-2 rounded-xl border border-rose-200">
                  Pontuação: {newsScore}% • {newsScore >= 70 ? '🛡️ Super-Escudo Anti-Fake News!' : '⚠️ Analisa com mais calma!'}
                </div>
              )}
            </div>
          </div>

          {/* ⭐ 3. O QUE APRENDES NESTA MISSÃO? */}
          <div className="bg-gradient-to-r from-rose-50/90 via-red-50/60 to-rose-50/90 border border-rose-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <StudyStackIllustration className="w-24 h-24 sm:w-28 sm:h-28" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 text-rose-900 font-black text-xs sm:text-sm uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-500 fill-current" />
                <span>O QUE APRENDES NESTA MISSÃO?</span>
              </div>
              <div className="space-y-1.5 text-xs sm:text-sm text-slate-700 font-medium">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Travar impulsos de partilha quando um título tenta provocar pânico ou raiva.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Consultar plataformas jornalísticas de verificação de factos (fact-checking).</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Contribuir para uma Internet limpa e saudável sem espalhar mentiras na turma.</span>
                </div>
              </div>
            </div>
          </div>

          <ScaffoldingClueCard
            clues={[
              'Palavras como "NÃO VAIS ACREDITAR" ou "CHOCANTE" são bandeiras vermelhas de clickbait.',
              'Antes de partilhares qualquer mensagem num grupo, pergunta-te: "Tenho a certeza de que é verdade?".',
              'Se descobrires que um colega partilhou um boato, explica com educação onde está o erro.',
            ]}
          />

          <MetacognitionWidget worldId={2} topicId="w2-t5" />

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => onNavigateTopic('avaliacao')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Ir para a Avaliação Final: Quiz do Detetive 🏆</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. AVALIAÇÃO OFICIAL DO MUNDO 2                           */}
      {/* ========================================================= */}
      {effectiveTopicId === 'avaliacao' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-xs text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <span className="text-xs font-black text-emerald-600 uppercase tracking-wider block">
                🎯 MISSÃO FINAL 6/6
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                Desafio Final de Validação do Mundo 2
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Chegaste ao fim da investigação! Responde ao Quiz Oficial de 10 perguntas para testar os teus conhecimentos sobre pesquisa, autoria, datas, triangulação e combate a boatos.
              </p>
              <p className="text-xs text-slate-500 font-bold">
                Precisas de <strong>mais de {PROGRESSION_CONFIG.PASSING_THRESHOLD}%</strong> para concluir o Mundo 2 e desbloquear o Mundo 3!
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenAssessment}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer hover:scale-102"
              >
                <Trophy className="w-5 h-5 text-amber-300" />
                <span>Começar Quiz de Validação do Detetive 🚀</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
