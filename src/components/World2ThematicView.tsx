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
  ShieldAlert,
  HelpCircle,
  Clock,
  Layers,
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
  const [keywordFeedback, setKeywordFeedback] = useState<{
    score: number;
    title: string;
    description: string;
  } | null>(null);

  const searchQueries = [
    {
      id: 'query-a',
      query: 'animais',
      label: 'Pesquisa A',
      score: 40,
      title: 'Demasiado vaga.',
      description: 'A pesquisa pode devolver muitos resultados que não estão relacionados com o que procuras.',
    },
    {
      id: 'query-b',
      query: 'animais em perigo',
      label: 'Pesquisa B',
      score: 65,
      title: 'Já é mais específica.',
      description: 'Ainda assim, pode apresentar resultados de vários países e muitos tipos de animais.',
    },
    {
      id: 'query-c',
      query: 'animais em perigo de extinção em Portugal',
      label: 'Pesquisa C',
      score: 100,
      title: 'Mais adequada.',
      description: 'As palavras-chave indicam o tema e o contexto geográfico, ajudando a encontrar resultados mais relevantes.',
    },
  ];

  // -------------------------------------------------------------
  // 2. AUTHOR CHECK SIMULATOR STATE
  // -------------------------------------------------------------
  const [authorChoices, setAuthorChoices] = useState<Record<string, 'credibilidade' | 'verificacao'>>({});
  const [authorSubmitted, setAuthorSubmitted] = useState(false);
  const [authorScore, setAuthorScore] = useState<number | null>(null);

  const authorScenarios = [
    {
      id: 'auth-1',
      origin: 'Instituto público / página institucional',
      author: 'Equipa técnica identificada',
      snippet: 'Este documento apresenta dados sobre espécies protegidas e indica as fontes utilizadas para recolher a informação.',
      correct: 'credibilidade' as const,
      feedback: 'O autor ou entidade estão identificados e são apresentadas fontes que permitem verificar a informação.',
    },
    {
      id: 'auth-2',
      origin: 'Blogue pessoal',
      author: 'João Silva',
      snippet: 'Na minha opinião, esta espécie está a desaparecer porque as pessoas já não gostam dela.',
      correct: 'verificacao' as const,
      feedback: 'O autor está identificado, mas a afirmação apresenta uma explicação pessoal sem indicar evidências. Identificar o autor não é suficiente para provar que a informação é verdadeira.',
    },
    {
      id: 'auth-3',
      origin: 'Site de uma organização comercial',
      author: 'Equipa da empresa',
      snippet: 'O nosso produto é cientificamente comprovado como o melhor para resolver este problema.',
      correct: 'verificacao' as const,
      feedback: 'A página tem um objetivo comercial. Isso não significa automaticamente que a informação seja falsa, mas é importante procurar evidências independentes antes de aceitar a afirmação.',
    },
  ];

  // -------------------------------------------------------------
  // 3. DATE VERIFIER SIMULATOR STATE
  // -------------------------------------------------------------
  const [dateChoices, setDateChoices] = useState<Record<string, 'sim' | 'nao'>>({});
  const [dateSubmitted, setDateSubmitted] = useState(false);
  const [dateScore, setDateScore] = useState<number | null>(null);

  const dateScenarios = [
    {
      id: 'date-1',
      title: 'Calendário escolar',
      info: 'Publicado em 2021/2022',
      question: 'Queres saber as datas do calendário escolar deste ano. Esta informação é suficiente?',
      optSim: 'Sim, é suficiente',
      optNao: 'Não, é necessário procurar informação atual',
      correct: 'nao' as const,
      feedback: 'O calendário escolar pode mudar de ano para ano. Para uma pergunta atual, precisas de informação correspondente ao ano letivo atual.',
    },
    {
      id: 'date-2',
      title: 'História da Internet',
      info: 'Artigo publicado em 2018 sobre acontecimentos da década de 1990.',
      question: 'O facto de o artigo ser antigo significa que não pode ser útil?',
      optSim: 'Sim, é inútil',
      optNao: 'Não, continua útil para acontecimentos históricos',
      correct: 'nao' as const,
      feedback: 'Uma fonte antiga pode ser útil quando estudamos acontecimentos históricos. A importância da data depende da pergunta que estamos a tentar responder.',
    },
    {
      id: 'date-3',
      title: 'Notícia sobre um acontecimento recente',
      info: 'Artigo publicado há vários anos, mas partilhado hoje como se fosse uma notícia atual.',
      question: 'Deves tratá-lo como uma notícia atual?',
      optSim: 'Sim, é atual',
      optNao: 'Não, é antiga fora de contexto',
      correct: 'nao' as const,
      feedback: 'A data ajuda a perceber o contexto. Uma notícia antiga não deve ser apresentada como se tivesse acontecido agora.',
    },
  ];

  // -------------------------------------------------------------
  // 4. SOURCE COMPARE SIMULATOR STATE (Comparação real entre Fonte A e Fonte B)
  // -------------------------------------------------------------
  const [sourceCompareAnswers, setSourceCompareAnswers] = useState<Record<string, string>>({});
  const [compareSubmitted, setCompareSubmitted] = useState(false);
  const [compareScore, setCompareScore] = useState<number | null>(null);

  const sourceA = {
    title: 'Estudo-Piloto com Robôs Educativos em Salas de Aula',
    origin: 'Portal de Divulgação Científica "Ciência Hoje Digital"',
    author: 'Dr. Alexandre Pires (Investigador em Tecnologia Educativa)',
    date: '12 de Outubro de 2024',
    content: 'Uma experiência de 3 meses com robôs de apoio ao estudo em duas escolas-piloto de Coimbra revelou um aumento de 20% no foco dos alunos. O equipamento custou 1.500 € por sala, financiado por uma bolsa universitária, e o relatório preliminar foi publicado no repositório institucional.',
    evidence: 'Relatório metodológico disponível em repositório aberto, amostra identificada de 120 alunos, parecer do conselho pedagógico.',
  };

  const sourceB = {
    title: 'BOMBA: Robôs Vão Substituir Todos os Professores no Próximo Mês!',
    origin: 'Página de Rede Social / Blogue "SuperNovidadesTIC"',
    author: 'Anónimo ("Redação GeekMaster2000")',
    date: '19 de Outubro de 2024 (uma semana após a Fonte A)',
    content: 'Revolução total! Todas as escolas de Portugal vão receber robôs autónomos já no próximo mês. O equipamento custa apenas 20 euros e garante 100% de notas máximas a todos os alunos sem necessidade de estudar!',
    evidence: 'Sem ligação para estudos, sem nomes de escolas, sem dados orçamentais, apenas uma imagem ilustrativa gerada por IA com título em maiúsculas.',
  };

  const compareQuestions = [
    {
      id: 'cmp-1',
      facet: '1. Quem publicou e origem da publicação',
      question: 'Ao comparar a origem das duas fontes, o que verificas?',
      options: [
        { id: 'a', text: 'A Fonte A tem origem institucional transparente com conselho editorial; a Fonte B é uma página pessoal anónima sem revisão.', isCorrect: true },
        { id: 'b', text: 'Ambas são exatamente iguais porque estão disponíveis na Internet.', isCorrect: false },
        { id: 'c', text: 'A Fonte B é melhor porque tem um nome mais divertido e moderno.', isCorrect: false },
      ],
      explanation: 'A origem institucional com conselho editorial (Fonte A) oferece muito maior transparência do que um blogue anónimo.',
    },
    {
      id: 'cmp-2',
      facet: '2. Identificação e credenciais do autor',
      question: 'Ao analisar a autoria das duas publicações, que diferença notas?',
      options: [
        { id: 'a', text: 'Nenhuma fonte tem autor identificado.', isCorrect: false },
        { id: 'b', text: 'A Fonte A identifica um investigador com nome e especialidade; a Fonte B usa um pseudónimo anónimo sem responsabilidade.', isCorrect: true },
        { id: 'c', text: 'O pseudónimo da Fonte B garante que é um especialista secreto de inteligência artificial.', isCorrect: false },
      ],
      explanation: 'Saber quem assina o texto permite verificar se a pessoa tem experiência no tema e assume responsabilidade pelo que publica.',
    },
    {
      id: 'cmp-3',
      facet: '3. Data de publicação e cronologia',
      question: 'Observando as datas (12 de Outubro vs 19 de Outubro), o que aconteceu?',
      options: [
        { id: 'a', text: 'A Fonte A é a publicação original; a Fonte B surgiu uma semana depois distorcendo e exagerando os factos.', isCorrect: true },
        { id: 'b', text: 'A Fonte B foi escrita primeiro e a Fonte A copiou-a.', isCorrect: false },
        { id: 'c', text: 'A data não tem qualquer relevância na credibilidade da informação.', isCorrect: false },
      ],
      explanation: 'Verificar a cronologia ajuda a perceber quem produziu a informação original e quem a republicou com alterações sensacionalistas.',
    },
    {
      id: 'cmp-4',
      facet: '4. Evidências apresentadas',
      question: 'Que evidências são fornecidas para apoiar as afirmações?',
      options: [
        { id: 'a', text: 'A Fonte B apresenta provas mais fortes porque garante 100% de sucesso.', isCorrect: false },
        { id: 'b', text: 'A Fonte A apresenta dados de um estudo de 3 meses com 120 alunos e relatório aberto; a Fonte B não apresenta provas.', isCorrect: true },
        { id: 'c', text: 'Nenhuma das duas precisa de apresentar evidências para acreditarmos nelas.', isCorrect: false },
      ],
      explanation: 'Afirmações sem provas, relatórios ou dados metodológicos verificáveis não têm validade científica ou jornalística.',
    },
    {
      id: 'cmp-5',
      facet: '5. Confronto de informação: coincidências e contradições',
      question: 'Ao comparar o conteúdo das duas fontes sobre o mesmo acontecimento:',
      options: [
        { id: 'a', text: 'Dizem exatamente a mesma coisa sem qualquer diferença.', isCorrect: false },
        { id: 'b', text: 'Abordam o mesmo tema geral (robôs na escola), mas a Fonte B inventa prazos imediatos, custos falsos (20€ vs 1.500€) e promessas irrealistas.', isCorrect: true },
        { id: 'c', text: 'A Fonte A mente sobre o custo porque 20 euros é muito mais barato.', isCorrect: false },
      ],
      explanation: 'A desinformação muitas vezes parte de um facto real e deforma os números, os custos e o alcance para gerar cliques fáceis.',
    },
    {
      id: 'cmp-6',
      facet: '6. Informação a confirmar com urgência antes de partilhar',
      question: 'Qual destas afirmações precisas de confirmar com urgência antes de partilhar com os teus colegas?',
      options: [
        { id: 'a', text: 'Que existem escolas em Coimbra.', isCorrect: false },
        { id: 'b', text: 'A afirmação sensacionalista da Fonte B de que os robôs vão substituir todos os professores já no próximo mês por 20 €.', isCorrect: true },
        { id: 'c', text: 'Que um projeto de investigação durou 3 meses.', isCorrect: false },
      ],
      explanation: 'Afirmações alarmistas, promessas milagrosas e prazos imediatos devem ser sempre travadas e confirmadas em fontes oficiais.',
    },
  ];

  // -------------------------------------------------------------
  // 5. NEWS DETECTIVE STATE
  // -------------------------------------------------------------
  const [newsDetectiveAudit, setNewsDetectiveAudit] = useState({
    checkedAuthor: false,
    checkedDate: false,
    checkedEvidence: false,
    checkedOtherSources: false,
  });
  const [newsDecision, setNewsDecision] = useState<'verificar' | 'partilhar' | null>(null);
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
    if (!item) return;
    setKeywordFeedback({
      score: item.score,
      title: item.title,
      description: item.description,
    });
    reportCompletion('sim-keywords', 'Simulador de Pesquisa Inteligente', item.score);
  };

  // 2. Submit Authors
  const handleAuthorSubmit = () => {
    let correctCount = 0;
    authorScenarios.forEach((scen) => {
      if (authorChoices[scen.id] === scen.correct) correctCount++;
    });
    const score = Math.round((correctCount / authorScenarios.length) * 100);
    setAuthorSubmitted(true);
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
    setDateSubmitted(true);
    setDateScore(score);
    reportCompletion('sim-date-verifier', 'Simulador de Linha Temporal & Data', score);
  };

  // 4. Submit Compare
  const handleCompareSubmit = () => {
    let correctCount = 0;
    compareQuestions.forEach((q) => {
      const selected = sourceCompareAnswers[q.id];
      const opt = q.options.find((o) => o.id === selected);
      if (opt?.isCorrect) correctCount++;
    });
    const score = Math.round((correctCount / compareQuestions.length) * 100);
    setCompareSubmitted(true);
    setCompareScore(score);
    reportCompletion('sim-source-compare', 'Simulador de Comparação de Fontes', score);
  };

  // 5. Submit News Detective
  const handleNewsDecision = (decision: 'verificar' | 'partilhar') => {
    setNewsDecision(decision);
    const checksCount = Object.values(newsDetectiveAudit).filter(Boolean).length;
    let finalScore = 0;
    if (decision === 'verificar') {
      finalScore = Math.min(100, checksCount * 15 + 40);
    } else {
      finalScore = 30;
    }
    setNewsScore(finalScore);
    reportCompletion('sim-news-detective', 'DETETIVE DE NOTÍCIAS', finalScore);
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

          {/* 📖 1. APRENDE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-blue-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: PESQUISAR MELHOR
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic1?.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {topic1?.takeaway && (
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl">
                <p className="text-xs sm:text-sm font-black text-blue-800 italic">
                  ✨ {topic1.takeaway}
                </p>
              </div>
            )}

            <TopicIllustrationCard topicId="w2-t1" />
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
                Escolhe a melhor pesquisa
              </span>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs sm:text-sm text-blue-950 font-medium">
              O teu professor pediu-te para descobrir quais são alguns dos animais em perigo de extinção em Portugal. Qual destas pesquisas te ajuda melhor a encontrar informação sobre esse assunto?
            </div>

            <div className="space-y-3">
              {searchQueries.map((sq) => {
                const isSelected = selectedSearchQuery === sq.id;
                return (
                  <div
                    key={sq.id}
                    onClick={() => handleKeywordSelect(sq.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? sq.score === 100
                          ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-300/30'
                          : 'bg-amber-50 border-amber-300 ring-2 ring-amber-300/30'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-black text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">
                          {sq.label}
                        </span>
                        <span className="font-mono text-xs sm:text-sm font-bold text-slate-900">
                          "{sq.query}"
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {isSelected ? 'Opção selecionada' : 'Clica para testar esta pesquisa'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {keywordFeedback && (
              <div
                className={`p-4 rounded-2xl border text-xs font-medium space-y-1 ${
                  keywordFeedback.score === 100
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-2 font-black">
                  {keywordFeedback.score === 100 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                  <span>
                    {keywordFeedback.title} (Pontuação: {keywordFeedback.score}/100)
                  </span>
                </div>
                <p>{keywordFeedback.description}</p>
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

          {/* 📖 1. APRENDE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-blue-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: QUEM CRIOU A INFORMAÇÃO?
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic2?.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {topic2?.takeaway && (
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl">
                <p className="text-xs sm:text-sm font-black text-blue-800 italic">
                  ✨ {topic2.takeaway}
                </p>
              </div>
            )}

            <TopicIllustrationCard topicId="w2-t2" />
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
                Analisa as 3 situações
              </span>
            </div>

            <div className="space-y-4">
              {authorScenarios.map((scen) => (
                <div
                  key={scen.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider block">
                        Origem: {scen.origin}
                      </span>
                      <h5 className="text-xs sm:text-sm font-black text-slate-900">
                        Autor: {scen.author}
                      </h5>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setAuthorChoices((prev) => ({ ...prev, [scen.id]: 'credibilidade' }))
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          authorChoices[scen.id] === 'credibilidade'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Há bons sinais de credibilidade
                      </button>
                      <button
                        onClick={() =>
                          setAuthorChoices((prev) => ({ ...prev, [scen.id]: 'verificacao' }))
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          authorChoices[scen.id] === 'verificacao'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Precisa de mais verificação
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 font-medium">"{scen.snippet}"</p>

                  {authorSubmitted && (
                    <div
                      className={`p-3 rounded-xl border text-xs font-medium ${
                        authorChoices[scen.id] === scen.correct
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : 'bg-amber-50 border-amber-200 text-amber-950'
                      }`}
                    >
                      <p className="font-bold">
                        {authorChoices[scen.id] === scen.correct
                          ? '✓ Avaliação correta!'
                          : 'ℹ️ Observação do Detetive:'}
                      </p>
                      <p>{scen.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleAuthorSubmit}
                disabled={Object.keys(authorChoices).length < authorScenarios.length}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Validar Avaliação de Autores
              </button>
            </div>

            {authorScore !== null && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-950 font-medium">
                Pontuação da Auditoria: {authorScore}/100. Saber quem criou a informação é uma pista importante, mas não é a única coisa que devemos verificar. Procura sempre saber quem criou e verifica se existem outras evidências que a apoiem.
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

          {/* 📖 1. APRENDE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-blue-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: VERIFICAR A DATA
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic3?.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {topic3?.takeaway && (
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl">
                <p className="text-xs sm:text-sm font-black text-blue-800 italic">
                  ✨ {topic3.takeaway}
                </p>
              </div>
            )}

            <TopicIllustrationCard topicId="w2-t3" />
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
                Avalia a adequação da data
              </span>
            </div>

            <div className="space-y-4">
              {dateScenarios.map((scen) => (
                <div
                  key={scen.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider block">
                        Título: {scen.title}
                      </span>
                      <p className="text-xs font-bold text-slate-600">
                        Informação: {scen.info}
                      </p>
                      <p className="text-xs sm:text-sm font-black text-slate-900 mt-1">
                        {scen.question}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                      <button
                        onClick={() =>
                          setDateChoices((prev) => ({ ...prev, [scen.id]: 'sim' }))
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          dateChoices[scen.id] === 'sim'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {scen.optSim}
                      </button>
                      <button
                        onClick={() =>
                          setDateChoices((prev) => ({ ...prev, [scen.id]: 'nao' }))
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          dateChoices[scen.id] === 'nao'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {scen.optNao}
                      </button>
                    </div>
                  </div>

                  {dateSubmitted && (
                    <div
                      className={`p-3 rounded-xl border text-xs font-medium ${
                        dateChoices[scen.id] === scen.correct
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : 'bg-amber-50 border-amber-200 text-amber-950'
                      }`}
                    >
                      <p className="font-bold">
                        {dateChoices[scen.id] === scen.correct
                          ? '✓ Resposta correta!'
                          : 'ℹ️ Explicação:'}
                      </p>
                      <p>{scen.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleDateSubmit}
                disabled={Object.keys(dateChoices).length < dateScenarios.length}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Verificar Linha Temporal
              </button>
            </div>

            {dateScore !== null && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-950 font-medium">
                Avaliação Concluída: {dateScore}/100. Lembra-te: uma informação pode ser verdadeira e, mesmo assim, estar desatualizada para a pergunta que estás a fazer.
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

          {/* 📖 1. APRENDE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-blue-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: COMPARAR FONTES
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic4?.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {topic4?.takeaway && (
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl">
                <p className="text-xs sm:text-sm font-black text-blue-800 italic">
                  ✨ {topic4.takeaway}
                </p>
              </div>
            )}

            <TopicIllustrationCard topicId="w2-t4" />
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-blue-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Comparação Real de Duas Fontes Independentes
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Auditoria de Origem, Autoria, Data, Evidências e Contrariedades
              </span>
            </div>

            {/* Apresentação das Duas Fontes Independentes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fonte A */}
              <div className="p-5 rounded-3xl border-2 border-blue-300 bg-blue-50/50 space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-2 border-b border-blue-200/80 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-blue-600 text-white px-2.5 py-1 rounded-lg">
                    Fonte A
                  </span>
                  <span className="text-[11px] font-bold text-blue-800">
                    Portal de Divulgação Científica
                  </span>
                </div>
                <div>
                  <h5 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                    {sourceA.title}
                  </h5>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 bg-white/80 p-3 rounded-2xl border border-blue-100">
                  <p>
                    <strong className="text-blue-900 font-black">Origem:</strong> {sourceA.origin}
                  </p>
                  <p>
                    <strong className="text-blue-900 font-black">Autor:</strong> {sourceA.author}
                  </p>
                  <p>
                    <strong className="text-blue-900 font-black">Data:</strong> {sourceA.date}
                  </p>
                  <p className="pt-1 text-slate-800 leading-relaxed">
                    <strong className="text-blue-900 font-black">Informação Apresentada:</strong> "{sourceA.content}"
                  </p>
                  <p className="pt-1 text-emerald-800 font-medium">
                    <strong className="text-emerald-950 font-black">Evidências:</strong> {sourceA.evidence}
                  </p>
                </div>
              </div>

              {/* Fonte B */}
              <div className="p-5 rounded-3xl border-2 border-amber-300 bg-amber-50/50 space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-2 border-b border-amber-200/80 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-amber-600 text-white px-2.5 py-1 rounded-lg">
                    Fonte B
                  </span>
                  <span className="text-[11px] font-bold text-amber-900">
                    Rede Social / Blogue Pessoal
                  </span>
                </div>
                <div>
                  <h5 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                    {sourceB.title}
                  </h5>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 bg-white/80 p-3 rounded-2xl border border-amber-100">
                  <p>
                    <strong className="text-amber-900 font-black">Origem:</strong> {sourceB.origin}
                  </p>
                  <p>
                    <strong className="text-amber-900 font-black">Autor:</strong> {sourceB.author}
                  </p>
                  <p>
                    <strong className="text-amber-900 font-black">Data:</strong> {sourceB.date}
                  </p>
                  <p className="pt-1 text-slate-800 leading-relaxed">
                    <strong className="text-amber-900 font-black">Informação Apresentada:</strong> "{sourceB.content}"
                  </p>
                  <p className="pt-1 text-rose-800 font-medium">
                    <strong className="text-rose-950 font-black">Evidências:</strong> {sourceB.evidence}
                  </p>
                </div>
              </div>
            </div>

            {/* Perguntas de Comparação Cruzada */}
            <div className="space-y-5 pt-2">
              <div className="border-b border-slate-200 pb-2">
                <h5 className="text-sm sm:text-base font-black text-slate-900">
                  Responde às 6 Dimensões de Comparação Entre as Fontes:
                </h5>
                <p className="text-xs text-slate-600">
                  Analisa as duas publicações em simultâneo para identificar credibilidade, contradições e riscos antes de partilhar.
                </p>
              </div>

              {compareQuestions.map((q, qIndex) => {
                const selected = sourceCompareAnswers[q.id];
                return (
                  <div
                    key={q.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {qIndex + 1}
                      </span>
                      <span className="text-xs font-black uppercase text-blue-700 tracking-wider">
                        {q.facet}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-black text-slate-900">
                      {q.question}
                    </p>

                    <div className="space-y-2">
                      {q.options.map((opt) => {
                        const isChosen = selected === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              setSourceCompareAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                            }
                            className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                              isChosen
                                ? 'bg-blue-600 text-white border-blue-700 shadow-xs font-bold'
                                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800'
                            }`}
                          >
                            <span className="font-bold mr-2 uppercase">{opt.id})</span>
                            <span>{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>

                    {compareSubmitted && (
                      <div
                        className={`p-3 rounded-xl border text-xs font-medium ${
                          q.options.find((o) => o.id === selected)?.isCorrect
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                            : 'bg-amber-50 border-amber-200 text-amber-950'
                        }`}
                      >
                        <p className="font-black mb-0.5">
                          {q.options.find((o) => o.id === selected)?.isCorrect
                            ? '✓ Resposta Correta!'
                            : '⚠️ Observação Pedagógica:'}
                        </p>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <span className="text-xs font-bold text-slate-500">
                  Respondidas: {Object.keys(sourceCompareAnswers).length} de {compareQuestions.length}
                </span>

                <button
                  type="button"
                  onClick={handleCompareSubmit}
                  disabled={Object.keys(sourceCompareAnswers).length < compareQuestions.length}
                  className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-black transition-all ${
                    Object.keys(sourceCompareAnswers).length >= compareQuestions.length
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Validar Comparação de Fontes
                </button>
              </div>

              {compareSubmitted && compareScore !== null && (
                <div className="space-y-4 pt-2">
                  <div
                    className={`p-4 rounded-2xl border text-xs font-medium ${
                      compareScore >= 70
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-black text-sm mb-1">
                      {compareScore >= 70 ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      )}
                      <span>Pontuação Final da Comparação: {compareScore}%</span>
                    </div>
                    <p>
                      {compareScore >= 70
                        ? 'Parabéns! Demonstraste espírito crítico rigoroso ao cruzar autoria, cronologia, evidências e distinguir factos reais de exageros sensacionalistas.'
                        : 'Revê as explicações acima para aprofundares como comparar origens, dados metodológicos e identificar afirmações suspeitas.'}
                    </p>
                  </div>

                  {/* Feedback Pedagógico Requerido */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs sm:text-sm space-y-2">
                    <h6 className="font-black text-indigo-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      Conclusão Pedagógica Essencial:
                    </h6>
                    <p className="leading-relaxed">
                      Mesmo que uma notícia ou artigo pareça credível, utilize vocabulário técnico ou fale de um assunto verdadeiro (como robôs educativos), pode conter distorções graves, promessas irreais ou custos falsos. Uma fonte nunca deve ser aceite cegamente: cruzar com outras <strong>fontes independentes</strong> e verificar <strong>quem assina, quando publicou e que provas apresenta</strong> é indispensável antes de acreditar ou partilhar.
                    </p>
                  </div>
                </div>
              )}
            </div>
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

          {/* 📖 1. APRENDE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-blue-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: PENSAR ANTES DE PARTILHAR
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic5?.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {topic5?.takeaway && (
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl">
                <p className="text-xs sm:text-sm font-black text-blue-800 italic">
                  ✨ {topic5.takeaway}
                </p>
              </div>
            )}

            <TopicIllustrationCard topicId="w2-t5" />
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-blue-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: DETETIVE DE NOTÍCIAS
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Auditoria de Publicação Viral
              </span>
            </div>

            <div className="text-xs sm:text-sm text-slate-600 font-medium">
              Analisa uma informação antes de a partilhar. Procura o autor, verifica a data, procura evidências e compara outras fontes.
            </div>

            {/* Publicação Viral */}
            <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/50 space-y-2.5">
              <div className="flex items-center gap-2 text-rose-700 text-xs font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>Publicação viral muito partilhada nas redes sociais</span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-900">
                "Descoberta extraordinária na serra revoluciona a ciência mundial! As autoridades tentaram esconder este segredo!"
              </h4>
              <p className="text-xs text-slate-600">
                Publicação com milhares de partilhas nas redes sociais, imagem desfocada com cores artificiais, sem indicação de autor cientista, sem data original e sem links para relatórios ou instituições.
              </p>
            </div>

            {/* Checklist de Auditoria */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Passos de Investigação do Detetive: (Marca o que verificaste)
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
                  <span>1. Verifiquei quem publicou</span>
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
                  <span>2. Verifiquei a data</span>
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
                  <span>3. Procurei evidências</span>
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
                  <span>4. Comparei com outras fontes</span>
                </label>
              </div>
            </div>

            {/* Decisão Final */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-700 block">
                Agora decide: partilhar ou continuar a verificar?
              </span>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => handleNewsDecision('verificar')}
                  className="w-full sm:w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Continuar a verificar</span>
                </button>
                <button
                  onClick={() => handleNewsDecision('partilhar')}
                  className="w-full sm:w-1/2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-3 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Partilhar</span>
                </button>
              </div>
            </div>

            {newsScore !== null && (
              <div
                className={`p-4 rounded-2xl border text-xs font-medium ${
                  newsDecision === 'verificar'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <p className="font-bold mb-1">
                  Resultado do Detetive de Notícias: {newsScore}/100
                </p>
                <p>
                  {newsDecision === 'verificar'
                    ? 'Excelente atitude de Detetive Digital! Não partilhaste um boato sem antes confirmar as provas e comparar fontes. O teu lema é: Para, Verifica, Compara. Só depois decide!'
                    : 'Atenção! Ainda não tens informação suficiente nem fontes confirmadas para partilhar com segurança. Partilhar sem verificar apenas espalha boatos e desinformação.'}
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
              Avaliação Final de 10 Perguntas
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
              Demonstra que sabes pesquisar com rigor, identificar autores credíveis, verificar a data e comparar fontes para desbloquear o Mundo 3!
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl max-w-md mx-auto text-xs text-blue-950 font-semibold space-y-1">
            <p>🏆 Requisito para desbloquear o Mundo 3: Média &gt; 75%</p>
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
              <span>Começar Avaliação Final (10 Perguntas)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
