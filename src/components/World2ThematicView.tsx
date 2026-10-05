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
  Star,
  Zap,
  AlertOctagon,
  Users,
  Megaphone,
  Trophy,
  Target,
  Check,
  X,
  XCircle,
  Lightbulb,
  FlaskConical,
  PawPrint,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { DetectiveBoyHero, StudyStackIllustration } from './DetectiveMascot';
import { PROGRESSION_CONFIG } from '../progressionConfig';
import { WorldSummary } from '../types';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
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
  const [activeSearchScenarioIndex, setActiveSearchScenarioIndex] = useState(0);
  const [selectedSearchQueries, setSelectedSearchQueries] = useState<Record<number, string>>({});
  const [keywordFeedback, setKeywordFeedback] = useState<{
    score: number;
    title: string;
    description: string;
  } | null>(null);

  const searchScenarios = [
    {
      id: 'scen-animais',
      theme: 'Trabalho de Ciências: Animais em risco',
      prompt: 'O professor pediu para identificares animais em perigo de extinção em Portugal para um trabalho de grupo. Qual destas pesquisas te dá os resultados mais diretos?',
      queries: [
        {
          id: 'q1-a',
          query: 'animais',
          label: 'Pesquisa A',
          score: 30,
          title: 'Demasiado vaga.',
          description: 'Apresenta milhões de páginas gerais sobre animais de todo o mundo, sem responder à pergunta.',
        },
        {
          id: 'q1-b',
          query: 'animais em perigo',
          label: 'Pesquisa B',
          score: 65,
          title: 'Já é mais específica, mas ainda muito ampla.',
          description: 'Devolve espécies de outros continentes sem focar a fauna protegida em território português.',
        },
        {
          id: 'q1-c',
          query: 'animais em perigo de extinção em Portugal',
          label: 'Pesquisa C',
          score: 100,
          title: 'Excelente escolha de palavras-chave!',
          description: 'Indica claramente o tema e o contexto geográfico, ajudando a encontrar informação relevante sem perder tempo.',
        },
      ],
    },
    {
      id: 'scen-jogos',
      theme: 'Dicas de TIC: Segurança em videojogos online',
      prompt: 'Queres encontrar orientações para proteger a tua conta de videojogos online contra roubos. Qual destas pesquisas é a mais adequada?',
      queries: [
        {
          id: 'q2-a',
          query: 'jogos',
          label: 'Pesquisa A',
          score: 25,
          title: 'Demasiado vaga.',
          description: 'Vai mostrar lojas de jogos e vídeos de jogabilidade em vez de regras de segurança.',
        },
        {
          id: 'q2-b',
          query: 'como proteger conta de videojogos autenticação dois fatores',
          label: 'Pesquisa B',
          score: 100,
          title: 'Excelente pesquisa com termos precisos!',
          description: 'Utiliza termos técnicos corretos (proteger conta, autenticação) que levam a guias de segurança oficiais.',
        },
        {
          id: 'q2-c',
          query: 'coisas para não ser roubado na internet',
          label: 'Pesquisa C',
          score: 55,
          title: 'Compreensível, mas pouco técnica.',
          description: 'Pode trazer fóruns informais com sugestões pouco seguras em vez de manuais oficiais.',
        },
      ],
    },
    {
      id: 'scen-espaco',
      theme: 'Trabalho de Estudo do Meio: Sistema Solar',
      prompt: 'Precisas de saber a distância média entre a Terra e a Lua para um projeto escolar. Que pesquisa deves fazer?',
      queries: [
        {
          id: 'q3-a',
          query: 'distancia media da Terra a Lua em quilometros',
          label: 'Pesquisa A',
          score: 100,
          title: 'Pesquisa perfeita!',
          description: 'Especifica o objeto (Terra e Lua), a grandeza (distância média) e a unidade de medida desejada.',
        },
        {
          id: 'q3-b',
          query: 'lua',
          label: 'Pesquisa B',
          score: 30,
          title: 'Demasiado vaga.',
          description: 'Pesquisar apenas "lua" traz fases da lua, imagens e poesias sem o dado numérico que procuras.',
        },
        {
          id: 'q3-c',
          query: 'o espaco e as estrelas',
          label: 'Pesquisa C',
          score: 30,
          title: 'Fora do assunto.',
          description: 'Abrange todo o universo em vez de focar o sistema Terra-Lua.',
        },
      ],
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
      origin: 'Instituto de Conservação da Natureza e das Florestas (ICNF)',
      author: 'Equipa de Biólogos e Investigadores Oficiais',
      snippet: 'Relatório técnico oficial com inventário das populações de Lince-Ibérico em Portugal, com metodologia de amostragem e dados verificáveis no terreno.',
      clues: 'Pistas: Entidade pública oficial, equipa técnica especializada, dados recolhidos com metodologia científica clara.',
      correct: 'credibilidade' as const,
      feedback: 'Muito bem! A autoria é transparente, pertence a uma instituição especializada e apresenta relatórios com dados e explicações que apoiam a informação.',
    },
    {
      id: 'auth-2',
      origin: 'Blogue Pessoal "O Meu Cantinho dos Animais"',
      author: 'Tiago (aluno de 12 anos)',
      snippet: 'Na minha opinião pessoal, o lince-ibérico já não está em perigo nenhum porque vi uma foto bonita na internet ontem.',
      clues: 'Pistas: O autor está identificado com nome, mas apresenta apenas uma opinião pessoal baseada numa foto solta, sem dados nem fontes.',
      correct: 'verificacao' as const,
      feedback: 'Excelente observação! Ter um autor com nome identificado não é suficiente. Uma opinião pessoal sem dados ou evidências precisa de ser verificada.',
    },
    {
      id: 'auth-3',
      origin: 'Loja Online de Rações & Acessórios',
      author: 'Departamento Comercial da Marca',
      snippet: 'O nosso suplemento alimentar é cientificamente o melhor do mundo e cura todas as doenças dos animais domésticos.',
      clues: 'Pistas: O texto foi criado com objetivo comercial para vender um produto, recorrendo a adjetivos exagerados ("o melhor do mundo") sem estudos clínicos independentes.',
      correct: 'verificacao' as const,
      feedback: 'Correto! Páginas comerciais têm interesse em vender. Isso exige procurar confirmação independente junto de médicos veterinários ou instituições científicas.',
    },
    {
      id: 'auth-4',
      origin: 'Canal Anónimo de Vídeos Curtos',
      author: 'Perfil sem nome ("@segredos_revelados_99")',
      snippet: 'Cientistas descobriram uma criatura gigante no fundo do rio Tejo mas o governo não quer que saibas! Vê o vídeo antes que apaguem!',
      clues: 'Pistas: Autor anónimo, título em tom de conspiração/urgência ("não quer que saibas"), sem qualquer referência a instituições científicas.',
      correct: 'verificacao' as const,
      feedback: 'Exato! Perfis anónimos que usam urgência e conspiração tentam obter cliques. Deves sempre verificar quem publicou e procurar fontes credíveis.',
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
      title: 'Calendário das Férias Escolares',
      info: 'Notícia publicada em outubro de 2021 com o horário do 2.º período.',
      question: 'Queres confirmar quando começam as férias da Páscoa deste ano letivo. Esta informação antiga serve?',
      optSim: 'Sim, as datas são sempre iguais',
      optNao: 'Não, preciso do calendário do ano letivo atual',
      correct: 'nao' as const,
      feedback: 'Correto! Os calendários escolares e horários mudam todos os anos. Para uma pergunta atual, precisas de dados do ano letivo em curso.',
    },
    {
      id: 'date-2',
      title: 'História: A Chegada à Lua em 1969',
      info: 'Enciclopédia digital com artigo revisto em 2015 sobre a missão Apollo 11.',
      question: 'O facto de o artigo ter sido escrito em 2015 torna a informação sobre 1969 inválida?',
      optSim: 'Sim, tudo o que tem mais de 2 anos é inútil',
      optNao: 'Não, acontecimentos históricos consolidados continuam válidos',
      correct: 'nao' as const,
      feedback: 'Muito bem! Acontecimentos históricos não mudam de data. Uma informação não é inútil só por ter alguns anos; a adequação da data depende da tua pergunta.',
    },
    {
      id: 'date-3',
      title: 'Notícia de Chuva Intensa com Inundações',
      info: 'Fotografia de cheias de 2016 partilhada hoje numa rede social com a frase: “Aconteceu há 10 minutos na nossa cidade!”.',
      question: 'Deves aceitar esta publicação como um alerta do que está a acontecer neste momento?',
      optSim: 'Sim, a foto é real logo está a acontecer agora',
      optNao: 'Não, é uma foto antiga partilhada fora do contexto temporal',
      correct: 'nao' as const,
      feedback: 'Exato! A fotografia pode ser real, mas está a ser usada fora do contexto original. Notícias antigas recicladas criam falsos alarmes.',
    },
    {
      id: 'date-4',
      title: 'Boato Recente Publicado Há 5 Minutos',
      info: 'Mensagem publicada há 5 minutos num grupo: "Amanhã os testes foram cancelados em todo o país!".',
      question: 'Por ser uma publicação publicada há apenas 5 minutos (muito recente), é automaticamente verdadeira?',
      optSim: 'Sim, tudo o que é muito recente é verdade',
      optNao: 'Não, ser recente não garante veracidade; é preciso confirmar',
      correct: 'nao' as const,
      feedback: 'Excelente espírito crítico! A data recente NÃO prova a verdade da notícia. Uma informação pode ser acabada de publicar e ser completamente falsa. É sempre preciso verificar!',
    },
  ];

  // -------------------------------------------------------------
  // 4. SOURCE COMPARE SIMULATOR STATE (Comparação real entre Fonte A e Fonte B)
  // -------------------------------------------------------------
  const [sourceCompareAnswers, setSourceCompareAnswers] = useState<Record<string, string>>({});
  const [compareSubmitted, setCompareSubmitted] = useState(false);
  const [compareScore, setCompareScore] = useState<number | null>(null);

  const sourceA = {
    title: 'Como os robôs podem ajudar a aprender?',
    origin: 'Portal de Ciência e Educação',
    author: 'Equipa de investigadores em educação',
    date: '12 de Outubro de 2024',
    content: 'Um pequeno estudo realizado em duas escolas analisou a utilização de robôs educativos durante algumas aulas. Os investigadores observaram como os alunos utilizaram os robôs e explicaram os resultados do estudo.',
    evidence: 'O artigo identifica os investigadores, as escolas participantes e explica como a experiência foi realizada.',
  };

  const sourceB = {
    title: 'BOMBA: Os robôs vão substituir os professores!',
    origin: 'Página de vídeos "SuperNovidadesTIC"',
    author: 'Perfil sem nome',
    date: '19 de Outubro de 2024',
    content: 'Todos os alunos vão deixar de ter professores porque os robôs conseguem ensinar tudo melhor! Acontecerá já no próximo mês!',
    evidence: 'Não apresenta estudos, escolas, investigadores ou outras fontes que confirmem a afirmação.',
  };

  const compareQuestions = [
    {
      id: 'cmp-1',
      facet: '1. Origem e Transparência',
      question: 'Ao comparar a origem das duas fontes, o que concluis?',
      options: [
        { id: 'a', text: 'A Fonte A tem origem num portal de ciência e educação; a Fonte B é uma página de vídeos sem identificação.', isCorrect: true },
        { id: 'b', text: 'As duas fontes são iguais porque estão ambas na Internet.', isCorrect: false },
        { id: 'c', text: 'A Fonte B é melhor porque tem um título com exclamações e emojis.', isCorrect: false },
      ],
      explanation: 'Quando sabemos quem publicou a informação, é mais fácil perceber de onde veio e confirmar se é de confiança.',
    },
    {
      id: 'cmp-2',
      facet: '2. Autoria e Responsabilidade',
      question: 'Ao analisar quem escreveu os textos, que pista encontras?',
      options: [
        { id: 'a', text: 'Nenhuma tem autor.', isCorrect: false },
        { id: 'b', text: 'A Fonte A identifica uma equipa de investigadores; a Fonte B tem um perfil sem nome.', isCorrect: true },
        { id: 'c', text: 'Um perfil anónimo garante que o autor é um especialista secreto.', isCorrect: false },
      ],
      explanation: 'Saber quem escreveu ou publicou a informação ajuda-nos a perceber quem está por trás dela e a confirmar a informação.',
    },
    {
      id: 'cmp-3',
      facet: '3. Cronologia e Relação entre Fontes',
      question: 'Observando as datas (12 de Outubro vs 19 de Outubro), qual é a relação entre as duas?',
      options: [
        { id: 'a', text: 'A Fonte A fez o estudo original; a Fonte B apareceu dias depois distorcendo o estudo original com exageros.', isCorrect: true },
        { id: 'b', text: 'A Fonte B inventou o estudo e a Fonte A apenas copiou.', isCorrect: false },
        { id: 'c', text: 'As duas fontes foram escritas por pessoas que trabalharam juntas.', isCorrect: false },
      ],
      explanation: 'Muitas publicações sensacionalistas pegam em notícias reais e distorcem os factos dias depois para conseguir visualizações e partilhas.',
    },
    {
      id: 'cmp-4',
      facet: '4. Independência e Provas Apresentadas',
      question: 'Se dois sites dizem a mesma coisa, mas um apenas copiou o outro, isso prova a verdade?',
      options: [
        { id: 'a', text: 'Sim, se dois sites dizem o mesmo é garantido que é verdade absoluta.', isCorrect: false },
        { id: 'b', text: 'Não. Se um site apenas copiou o outro, continuas a ter apenas uma fonte original; é preciso procurar fontes independentes e provas reais.', isCorrect: true },
        { id: 'c', text: 'Quantos mais sites copiarem o mesmo texto, menos provas são necessárias.', isCorrect: false },
      ],
      explanation: 'Copiar ou republicar o mesmo texto não cria uma nova prova. Duas páginas que repetem a mesma cópia não são fontes independentes.',
    },
    {
      id: 'cmp-5',
      facet: '5. Distinção de Factos vs Exageros',
      question: 'Ao comparar o conteúdo concreto das duas publicações sobre os robôs:',
      options: [
        { id: 'a', text: 'A Fonte A descreve uma experiência educativa em duas escolas; a Fonte B exagera dizendo que vão substituir os professores.', isCorrect: true },
        { id: 'b', text: 'Ambas dizem exatamente o mesmo com as mesmas palavras.', isCorrect: false },
        { id: 'c', text: 'A Fonte B tem razão porque é mais fácil substituir professores.', isCorrect: false },
      ],
      explanation: 'A publicação sensacionalista pegou numa experiência real de apoio às aulas e transformou-a num disparate exagerado.',
    },
    {
      id: 'cmp-6',
      facet: '6. Regra Operacional do Detetive',
      question: 'Antes de partilhares a notícia da Fonte B num grupo de colegas, qual é a atitude correta?',
      options: [
        { id: 'a', text: 'Partilhar com aviso de URGENTE.', isCorrect: false },
        { id: 'b', text: 'Não partilhar; verificar a informação numa fonte oficial e avisar os colegas que se trata de uma afirmação sem provas.', isCorrect: true },
        { id: 'c', text: 'Acreditar porque os robôs são giros.', isCorrect: false },
      ],
      explanation: 'Regra de ouro: Para, Verifica e Compara. Não espalhes boatos ou informações não confirmadas.',
    },
  ];

  // -------------------------------------------------------------
  // 5. NEWS DETECTIVE (DISTINÇÃO: FACTO, OPINIÃO, NOTÍCIA, ENGANADORA)
  // -------------------------------------------------------------
  const [newsDetectiveAudit, setNewsDetectiveAudit] = useState({
    checkedAuthor: false,
    checkedDate: false,
    checkedEvidence: false,
    checkedOtherSources: false,
  });
  const [classifiedStatements, setClassifiedStatements] = useState<Record<string, 'facto' | 'opiniao' | 'noticia' | 'enganadora'>>({});
  const [newsDecision, setNewsDecision] = useState<'verificar' | 'partilhar' | null>(null);
  const [newsScore, setNewsScore] = useState<number | null>(null);

  const statementItems = [
    {
      id: 'st-1',
      text: '“O lince-ibérico é um mamífero carnívoro que habita a Península Ibérica.”',
      correct: 'facto' as const,
      explanation: 'FACTO: É uma afirmação científica objetiva que pode ser comprovada.',
    },
    {
      id: 'st-2',
      text: '“Acho que as aulas de Ciências Naturais são as mais divertidas de todo o 6.º ano.”',
      correct: 'opiniao' as const,
      explanation: 'OPINIÃO: Exprime o gosto ou ponto de vista pessoal de quem fala.',
    },
    {
      id: 'st-3',
      text: '“Ontem à tarde, os alunos do 6.º B participaram na plantação de 50 árvores no parque da cidade.”',
      correct: 'noticia' as const,
      explanation: 'NOTÍCIA: Relato informativo sobre um acontecimento real recente.',
    },
    {
      id: 'st-4',
      text: '“Foto de cheias de há 10 anos partilhada hoje com o texto: Inundação misteriosa destrói todas as escolas hoje!”',
      correct: 'enganadora' as const,
      explanation: 'INFORMAÇÃO ENGANADORA: Utiliza imagens reais fora do contexto temporal para alarmar as pessoas.',
    },
  ];

  // -------------------------------------------------------------
  // PROGRESS & SCORE REPORTING
  // -------------------------------------------------------------
  const reportCompletion = async (simId: string, activityTitle: string, payloadData?: any, score?: number) => {
    try {
      const res = await apiRequest('/api/pedagogical/activities/complete', {
        method: 'POST',
        body: JSON.stringify({
          activityId: simId,
          worldId: 2,
          answers: payloadData?.answers || payloadData,
          payload: payloadData,
          completedAction: payloadData?.completedAction || (typeof payloadData === 'string' ? payloadData : undefined),
          score,
        }),
      });
      setCompletedFeedback({
        score: res.score,
        xpGain: res.xpGain,
        newBest: res.newBest,
        activityTitle,
      });
      await refreshUser();
      await onRefreshWorld();
    } catch (err: any) {
      console.error('Failed to report activity completion', err);
    }
  };

  // 1. Submit Keywords
  const handleKeywordSelect = (scenarioIndex: number, qId: string) => {
    const updated = { ...selectedSearchQueries, [scenarioIndex]: qId };
    setSelectedSearchQueries(updated);

    const currentScenario = searchScenarios[scenarioIndex];
    const item = currentScenario.queries.find((q) => q.id === qId);
    if (!item) return;

    setKeywordFeedback({
      score: item.score,
      title: item.title,
      description: item.description,
    });

    // Calculate total score across answered scenarios
    const scores = Object.entries(updated).map(([sIdx, queryId]) => {
      const scen = searchScenarios[Number(sIdx)];
      const matched = scen?.queries.find((q) => q.id === queryId);
      return matched ? matched.score : 0;
    });
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / searchScenarios.length);

    if (Object.keys(updated).length === searchScenarios.length) {
      reportCompletion('sim-keywords', 'Simulador de Pesquisa Inteligente', { answers: updated }, avgScore);
    }
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
    reportCompletion('sim-author-check', 'Simulador de Autoria & Origem', { answers: authorChoices }, score);
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
    reportCompletion('sim-date-verifier', 'Simulador de Linha Temporal & Data', { answers: dateChoices }, score);
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
    reportCompletion('sim-source-compare', 'Simulador de Comparação de Fontes', { answers: sourceCompareAnswers }, score);
  };

  // 5. Submit News Detective & Classification
  const handleNewsDecision = (decision: 'verificar' | 'partilhar') => {
    setNewsDecision(decision);
    const checksCount = Object.values(newsDetectiveAudit).filter(Boolean).length;
    let statementsCorrect = 0;
    statementItems.forEach((st) => {
      if (classifiedStatements[st.id] === st.correct) statementsCorrect++;
    });

    let finalScore = 0;
    if (decision === 'verificar') {
      finalScore = Math.min(100, Math.round((checksCount / 4) * 40 + (statementsCorrect / statementItems.length) * 60));
    } else {
      finalScore = 25;
    }
    setNewsScore(finalScore);
    reportCompletion(
      'sim-news-detective',
      'DETETIVE DE NOTÍCIAS',
      { decision, audit: newsDetectiveAudit, classifiedStatements },
      finalScore
    );
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
      {/* 🕵️ HERO BANNER DETETIVE DIGITAL (Matching Mockup image.png) */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-b from-[#bfe7ff] via-[#d7efff] to-[#eaf6ff] border border-sky-200/80 p-6 sm:p-8 lg:p-10 shadow-sm">
        {/* Soft background clouds and radial highlights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-sky-200/30 rounded-full blur-2xl pointer-events-none" />

        {/* Top Breadcrumb & Route Progress */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2 text-xs font-black text-blue-900 tracking-wide">
            <span className="text-base">🌐</span>
            <span>MUNDO 2</span>
            <span className="text-blue-400 font-bold">&gt;</span>
            <span>DETETIVE DIGITAL</span>
            <span className="text-base">🕵️</span>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-white/80 rounded-2xl px-4 py-2 shadow-xs flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-slate-700 tracking-wider">
              <span className="text-amber-500">👑</span>
              <span>A Tua Rota no Mundo</span>
            </div>
            <div className="w-24 sm:w-28 bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/80">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${world.average > 0 ? world.average : 0}%`,
                }}
              />
            </div>
            <span className="text-xs font-black text-slate-800 tabular-nums">
              {world.average > 0 ? `${world.average}%` : '0%'}
            </span>
          </div>
        </div>

        {/* Middle Hero: Headline, Subtitle, Detective Mascot */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 my-6 relative z-10">
          <div className="max-w-xl space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-slate-950 tracking-tight leading-[1.12]">
              A Lupa da Verdade:<br />
              Caça a Pistas, Fontes Seguras<br />
              e Notícias Falsas!
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed max-w-lg">
              A tua missão de detetive: investigar pistas, confirmar factos e nunca morder o isco de notícias falsas! 🔎
            </p>
          </div>
          <div className="shrink-0 flex justify-center lg:justify-end">
            <DetectiveBoyHero className="w-64 sm:w-72 lg:w-[320px] h-auto drop-shadow-md" />
          </div>
        </div>

        {/* 6 Mission Cards Grid (Row 1: 4 cards, Row 2: 2 cards) */}
        <div className="space-y-3 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Missão 1: Radar de Palavras */}
            <button
              onClick={() => onNavigateTopic('w2-t1')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'w2-t1'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    activeTopicId === 'w2-t1' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span
                    className={`text-[10px] font-bold block ${
                      activeTopicId === 'w2-t1' ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    Missão 1/6
                  </span>
                  <span className="text-xs sm:text-sm font-black truncate">
                    Radar de Palavras
                  </span>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 shrink-0 ${
                  activeTopicId === 'w2-t1' ? 'text-white' : 'text-blue-500'
                }`}
              />
            </button>

            {/* Missão 2: Quem é o Autor? */}
            <button
              onClick={() => onNavigateTopic('w2-t2')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'w2-t2'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    activeTopicId === 'w2-t2' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  <Users className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span
                    className={`text-[10px] font-bold block ${
                      activeTopicId === 'w2-t2' ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    Missão 2/6
                  </span>
                  <span className="text-xs sm:text-sm font-black truncate">
                    Quem é o Autor?
                  </span>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 shrink-0 ${
                  activeTopicId === 'w2-t2' ? 'text-white' : 'text-blue-500'
                }`}
              />
            </button>

            {/* Missão 3: Linha do Tempo */}
            <button
              onClick={() => onNavigateTopic('w2-t3')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'w2-t3'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    activeTopicId === 'w2-t3' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-500'
                  }`}
                >
                  <Calendar className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span
                    className={`text-[10px] font-bold block ${
                      activeTopicId === 'w2-t3' ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    Missão 3/6
                  </span>
                  <span className="text-xs sm:text-sm font-black truncate">
                    Linha do Tempo
                  </span>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 shrink-0 ${
                  activeTopicId === 'w2-t3' ? 'text-white' : 'text-blue-500'
                }`}
              />
            </button>

            {/* Missão 4: Comparar Pistas */}
            <button
              onClick={() => onNavigateTopic('w2-t4')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'w2-t4'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    activeTopicId === 'w2-t4' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  <Layers className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span
                    className={`text-[10px] font-bold block ${
                      activeTopicId === 'w2-t4' ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    Missão 4/6
                  </span>
                  <span className="text-xs sm:text-sm font-black truncate">
                    Comparar Pistas
                  </span>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 shrink-0 ${
                  activeTopicId === 'w2-t4' ? 'text-white' : 'text-blue-500'
                }`}
              />
            </button>
          </div>

          {/* Row 2: Missões 5 e 6 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Missão 5: Caça a Boatos */}
            <button
              onClick={() => onNavigateTopic('w2-t5')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'w2-t5'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    activeTopicId === 'w2-t5' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-500'
                  }`}
                >
                  <Megaphone className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span
                    className={`text-[10px] font-bold block ${
                      activeTopicId === 'w2-t5' ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    Missão 5/6
                  </span>
                  <span className="text-xs sm:text-sm font-black truncate">
                    Caça a Boatos
                  </span>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 shrink-0 ${
                  activeTopicId === 'w2-t5' ? 'text-white' : 'text-blue-500'
                }`}
              />
            </button>

            {/* Missão 6: Guia do Detetive (Quiz) */}
            <button
              onClick={() => onNavigateTopic('avaliacao')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'avaliacao'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    activeTopicId === 'avaliacao' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  <Trophy className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span
                    className={`text-[10px] font-bold block ${
                      activeTopicId === 'avaliacao' ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    Missão 6/6
                  </span>
                  <span className="text-xs sm:text-sm font-black truncate">
                    Guia do Detetive
                  </span>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 shrink-0 ${
                  activeTopicId === 'avaliacao' ? 'text-white' : 'text-blue-500'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MISSÃO 1: RADAR DE PALAVRAS-CHAVE                        */}
      {/* ========================================================= */}
      {activeTopicId === 'w2-t1' && (
        <div className="space-y-6">
          {/* Active Mission Header Card */}
          <div className="bg-white border border-blue-100/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
                <Search className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> MISSÃO 1/6
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Radar de Palavras-Chave 🎯
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Hoje vais descobrir como fazer pesquisas certeiras como um cientista.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-keywords')?.completed ? (
                <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-800 font-black text-xs px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluída (100%)</span>
                </div>
              ) : (
                <div className="bg-blue-50 border-2 border-blue-400 text-blue-800 font-black text-xs px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xs">
                  <Zap className="w-4 h-4 text-amber-500 fill-current" />
                  <span>Recompensa: +100 XP</span>
                </div>
              )}
            </div>
          </div>

          {/* 💡 1. APRENDE: PESQUISAR COM PRECISÃO */}
          <div className="bg-white border border-blue-100/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-900 font-black text-sm sm:text-base tracking-wide">
                <span className="text-lg">💡</span>
                <span>1. APRENDE: PESQUISAR COM PRECISÃO</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-blue-600">
                <Lightbulb className="w-4 h-4 text-amber-500 fill-current" />
                <span>Dicas do detetive</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Card: Palavras Precisas */}
              <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-5 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-blue-600 flex items-center justify-center">
                    <Search className="w-5 h-5 text-blue-600 stroke-[2.5]" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900">Palavras Precisas</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Se pesquisares apenas "jogar", o motor de busca perde-se. Se pesquisares termos específicos, encontras logo a resposta certa!
                  </p>
                </div>

                {/* Mock Browser Search Bar */}
                <div className="bg-white rounded-xl border border-sky-200/90 p-3 shadow-xs space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 sm:p-2.5 flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-mono text-slate-700 font-semibold truncate">
                      animais em perigo de extinção em Portugal
                    </span>
                    <button
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg flex items-center justify-center shrink-0 shadow-xs cursor-pointer"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Card: Regra do Detetive */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Target className="w-5 h-5 text-amber-600 stroke-[2.5]" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900">Regra do Detetive</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Usa termos técnicos e claros (ex.: "declínio da fénix à Lua em km") e evita perguntas vagas de conversa.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div className="space-y-2 text-xs font-bold text-slate-800">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Usa palavras específicas</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Inclui o contexto (onde? quando? como?)</span>
                    </div>
                    <div className="flex items-center gap-2 text-rose-800">
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Evita termos vagos como "coisas" ou "jogos"</span>
                    </div>
                  </div>

                  {/* Yellow Sticky Note with Pushpin */}
                  <div className="relative self-center sm:self-auto bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300 rounded-xl p-3 shadow-md transform rotate-2 max-w-[140px] text-center shrink-0">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-xs" />
                    <p className="text-[11px] font-black text-amber-950 uppercase leading-snug tracking-tight">
                      SER PRECISO É O PODER DO DETETIVE!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 🧪 2. EXPERIMENTA: SIMULADOR DE PESQUISA INTELIGENTE */}
          <div className="bg-white border border-blue-100/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-blue-900 font-black text-sm sm:text-base tracking-wide">
                <FlaskConical className="w-5 h-5 text-blue-600" />
                <span>2. EXPERIMENTA: SIMULADOR DE PESQUISA INTELIGENTE</span>
              </div>
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-400" />
                <span>3 Situações Reais de Estudo</span>
              </span>
            </div>

            {/* Situations Selector Buttons */}
            <div className="flex flex-wrap gap-2.5">
              {searchScenarios.map((scen, sIdx) => {
                const isCurrent = activeSearchScenarioIndex === sIdx;
                const isAnswered = selectedSearchQueries[sIdx] !== undefined;
                return (
                  <button
                    key={scen.id}
                    onClick={() => {
                      setActiveSearchScenarioIndex(sIdx);
                      const chosen = selectedSearchQueries[sIdx];
                      if (chosen) {
                        const qObj = scen.queries.find((q) => q.id === chosen);
                        if (qObj) {
                          setKeywordFeedback({
                            score: qObj.score,
                            title: qObj.title,
                            description: qObj.description,
                          });
                        }
                      } else {
                        setKeywordFeedback(null);
                      }
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isAnswered
                        ? 'bg-sky-50 text-blue-800 border border-blue-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>Situação {sIdx + 1}</span>
                    {isAnswered && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />}
                  </button>
                );
              })}
            </div>

            {/* Active Scenario Card */}
            {(() => {
              const currentScenario = searchScenarios[activeSearchScenarioIndex];
              const selectedQId = selectedSearchQueries[activeSearchScenarioIndex];

              return (
                <div className="space-y-4">
                  {/* Scenario Prompt Card */}
                  <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs text-2xl">
                      {activeSearchScenarioIndex === 0 ? '🐾' : activeSearchScenarioIndex === 1 ? '🎮' : '🚀'}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-black text-blue-900 uppercase tracking-wide">
                        {currentScenario.theme}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                        {currentScenario.prompt}
                      </p>
                    </div>
                  </div>

                  {/* 3 Queries Rows */}
                  <div className="space-y-2.5">
                    {currentScenario.queries.map((sq) => {
                      const isSelected = selectedQId === sq.id;
                      return (
                        <div
                          key={sq.id}
                          onClick={() => handleKeywordSelect(activeSearchScenarioIndex, sq.id)}
                          className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isSelected
                              ? sq.score === 100
                                ? 'bg-emerald-50/80 border-emerald-400 shadow-xs'
                                : 'bg-amber-50/80 border-amber-400 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-sky-50/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-blue-800 bg-sky-100 px-3 py-1.5 rounded-xl shrink-0">
                              {sq.label}
                            </span>
                            <span className="font-mono text-xs sm:text-sm font-bold text-slate-900">
                              "{sq.query}"
                            </span>
                          </div>

                          <button
                            type="button"
                            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 transition-all ${
                              isSelected
                                ? sq.score === 100
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-amber-600 text-white'
                                : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-50 shadow-2xs'
                            }`}
                          >
                            <Search className="w-3.5 h-3.5" />
                            <span>{isSelected ? '✓ Testada' : 'Clica para testar esta pesquisa'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Feedback Drawer */}
                  {keywordFeedback && (
                    <div
                      className={`p-4 rounded-2xl border text-xs font-medium space-y-1 animate-in fade-in duration-200 ${
                        keywordFeedback.score === 100
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-amber-50 border-amber-300 text-amber-950'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-black text-sm">
                        {keywordFeedback.score === 100 ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        )}
                        <span>
                          {keywordFeedback.title} (Pontuação: {keywordFeedback.score}/100)
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed opacity-90">{keywordFeedback.description}</p>
                    </div>
                  )}

                  {/* Bottom Line */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-500">
                      Situações concluídas: {Object.keys(selectedSearchQueries).length} de {searchScenarios.length}
                    </span>
                    {activeSearchScenarioIndex < searchScenarios.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          const nextIdx = activeSearchScenarioIndex + 1;
                          setActiveSearchScenarioIndex(nextIdx);
                          const chosen = selectedSearchQueries[nextIdx];
                          if (chosen) {
                            const qObj = searchScenarios[nextIdx].queries.find((q) => q.id === chosen);
                            if (qObj) {
                              setKeywordFeedback({
                                score: qObj.score,
                                title: qObj.title,
                                description: qObj.description,
                              });
                            }
                          } else {
                            setKeywordFeedback(null);
                          }
                        }}
                        className="bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-black text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <span>Próxima Situação</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Todas as situações testadas!
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* ⭐ 3. O QUE APRENDES NESTA MISSÃO? */}
          <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-emerald-50/90 border border-emerald-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
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
                  <span>Pesquisas precisas com palavras-chave certas encontram respostas muito mais depressa.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Evita termos vagos como "coisas" ou "jogos" para não te perderes em anúncios e vídeos soltos.</span>
                </div>
              </div>
            </div>

            {/* White Pinned Notepad Checklist with Pencil */}
            <div className="relative bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2 min-w-[190px] shrink-0">
              <div className="space-y-1.5 text-[11px] font-black text-slate-800">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>PESQUISAR</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>ANALISAR</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>DESCOBRIR</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>PENSAR CRITICAMENTE</span>
                </div>
              </div>

              {/* Pencil Vector across notepad */}
              <div className="absolute -bottom-2 -right-3 transform rotate-12">
                <div className="w-16 h-2.5 bg-yellow-400 border border-yellow-600 rounded-sm flex items-center shadow-xs">
                  <div className="w-3 h-full bg-red-500 rounded-l-sm" />
                  <div className="flex-1" />
                  <div className="w-2.5 h-full bg-stone-700 rounded-r-xs" />
                </div>
              </div>
            </div>
          </div>

          {/* 👉 4. PRÓXIMA MISSÃO ACTION BAR */}
          <div className="bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-pink-50/70 border border-indigo-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-amber-400 fill-current shrink-0 filter drop-shadow-xs" />
              <span className="text-xs sm:text-sm font-black text-indigo-950">
                Excelente pesquisa! Agora vamos descobrir quem escreveu os artigos!
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTopic('w2-t2')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 active:scale-95"
            >
              <span>Próxima Missão: 2. Quem é o Autor?</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MISSÃO 2: QUEM CRIOU A INFORMAÇÃO?                       */}
      {/* ========================================================= */}
      {activeTopicId === 'w2-t2' && (
        <div className="space-y-6">
          {/* Active Mission Header Card */}
          <div className="bg-white border border-blue-100/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
                <Users className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> MISSÃO 2/6
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Quem é o Autor? 🕵️
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Hoje vais aprender a verificar quem escreveu a informação antes de confiar.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-author-check')?.completed ? (
                <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-800 font-black text-xs px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluída ({getSimProg('sim-author-check')?.score}%)</span>
                </div>
              ) : (
                <div className="bg-blue-50 border-2 border-blue-400 text-blue-800 font-black text-xs px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xs">
                  <Zap className="w-4 h-4 text-amber-500 fill-current" />
                  <span>Recompensa: +100 XP</span>
                </div>
              )}
            </div>
          </div>

          {/* 💡 1. APRENDE: A PISTA DA AUTORIA */}
          <div className="bg-white border border-blue-100/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-900 font-black text-sm sm:text-base tracking-wide">
                <span className="text-lg">💡</span>
                <span>1. APRENDE: A PISTA DA AUTORIA</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-blue-600">
                <Lightbulb className="w-4 h-4 text-amber-500 fill-current" />
                <span>Dicas do detetive</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-5 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-blue-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-blue-600 stroke-[2.5]" />
                </div>
                <h4 className="text-sm font-black text-slate-900">Quem Escreveu?</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Qualquer pessoa pode criar um blog ou vídeo. Procura sempre o nome do autor e a sua profissão ou especialidade no assunto!
                </p>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Award className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
                </div>
                <h4 className="text-sm font-black text-slate-900">Fontes Oficiais & Credíveis</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Sites de universidades, museus, escolas e enciclopédias têm especialistas e equipas editoriais que confirmam os factos.
                </p>
              </div>
            </div>
          </div>

          {/* 🎮 2. EXPERIMENTA: SIMULADOR DE AUTORIA */}
          <div className="bg-white border border-blue-100/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-blue-900 font-black text-sm sm:text-base tracking-wide">
                <FlaskConical className="w-5 h-5 text-blue-600" />
                <span>2. EXPERIMENTA: SIMULADOR DE AUTORIA & ORIGEM</span>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Analisa as 4 situações observando as pistas
              </span>
            </div>

            <div className="space-y-4">
              {authorScenarios.map((scen) => (
                <div
                  key={scen.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
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
                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          authorChoices[scen.id] === 'verificacao'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Precisa de mais verificação
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 font-medium italic bg-white p-3 rounded-xl border border-slate-200/80">
                    "{scen.snippet}"
                  </p>

                  <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-xs text-blue-950 font-medium flex items-center gap-2">
                    <span className="text-base">🔎</span>
                    <span>{scen.clues}</span>
                  </div>

                  {authorSubmitted && (
                    <div
                      className={`p-3.5 rounded-xl border text-xs font-medium ${
                        authorChoices[scen.id] === scen.correct
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-amber-50 border-amber-300 text-amber-950'
                      }`}
                    >
                      <p className="font-black text-sm">
                        {authorChoices[scen.id] === scen.correct
                          ? '✓ Avaliação correta!'
                          : 'ℹ️ Observação do Detetive:'}
                      </p>
                      <p className="mt-0.5 leading-relaxed">{scen.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleAuthorSubmit}
                disabled={Object.keys(authorChoices).length < authorScenarios.length}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs px-6 py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Validar Avaliação de Autores
              </button>
            </div>

            {authorScore !== null && (
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-blue-950 font-medium space-y-1">
                <p className="font-black text-blue-900 text-sm">
                  Pontuação da Auditoria: {authorScore}/100
                </p>
                <p className="leading-relaxed">
                  Saber quem criou a informação é uma pista importante, mas não é a única coisa que devemos verificar. Procura sempre saber quem criou e verifica se existem dados e evidências que a apoiem.
                </p>
              </div>
            )}
          </div>

          {/* ⭐ 3. O QUE APRENDES NESTA MISSÃO? */}
          <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-emerald-50/90 border border-emerald-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
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
                  <span>Verifica sempre quem é o autor e se representa uma entidade credível.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Saber quem escreveu é essencial, mas confirma se a informação tem provas e referências.</span>
                </div>
              </div>
            </div>

            {/* White Pinned Notepad Checklist with Pencil */}
            <div className="relative bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2 min-w-[190px] shrink-0">
              <div className="space-y-1.5 text-[11px] font-black text-slate-800">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>IDENTIFICAR O AUTOR</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>VERIFICAR CREDENCIAIS</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>CONFIRMAR FONTES</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>PENSAR CRITICAMENTE</span>
                </div>
              </div>

              {/* Pencil Vector across notepad */}
              <div className="absolute -bottom-2 -right-3 transform rotate-12">
                <div className="w-16 h-2.5 bg-yellow-400 border border-yellow-600 rounded-sm flex items-center shadow-xs">
                  <div className="w-3 h-full bg-red-500 rounded-l-sm" />
                  <div className="flex-1" />
                  <div className="w-2.5 h-full bg-stone-700 rounded-r-xs" />
                </div>
              </div>
            </div>
          </div>

          {/* 👉 4. PRÓXIMA MISSÃO ACTION BAR */}
          <div className="bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-pink-50/70 border border-indigo-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-amber-400 fill-current shrink-0 filter drop-shadow-xs" />
              <span className="text-xs sm:text-sm font-black text-indigo-950">
                Ótimo olho para os autores! Vamos verificar as datas das notícias?
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTopic('w2-t3')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 active:scale-95"
            >
              <span>Próxima Missão: 3. Linha do Tempo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MISSÃO 3: VERIFICAR A DATA                               */}
      {/* ========================================================= */}
      {activeTopicId === 'w2-t3' && (
        <div className="space-y-6">
          {/* Active Mission Header Card */}
          <div className="bg-white border border-blue-100/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-400 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/25">
                <Calendar className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> MISSÃO 3/6
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Linha do Tempo ⏳
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Hoje vais descobrir por que razão a data da notícia faz toda a diferença.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-date-verifier')?.completed ? (
                <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-800 font-black text-xs px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluída ({getSimProg('sim-date-verifier')?.score}%)</span>
                </div>
              ) : (
                <div className="bg-blue-50 border-2 border-blue-400 text-blue-800 font-black text-xs px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xs">
                  <Zap className="w-4 h-4 text-amber-500 fill-current" />
                  <span>Recompensa: +100 XP</span>
                </div>
              )}
            </div>
          </div>

          {/* 💡 1. APRENDE: A PISTA DO TEMPO */}
          <div className="bg-white border border-blue-100/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-900 font-black text-sm sm:text-base tracking-wide">
                <span className="text-lg">💡</span>
                <span>1. APRENDE: A PISTA DO TEMPO</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-blue-600">
                <Lightbulb className="w-4 h-4 text-amber-500 fill-current" />
                <span>Dicas do detetive</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-5 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-blue-600 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600 stroke-[2.5]" />
                </div>
                <h4 className="text-sm font-black text-slate-900">O Mundo Muda</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Uma notícia sobre ciência ou regras escolares de há 10 anos pode já não ser válida hoje. A tecnologia e a ciência avançam depressa!
                </p>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-600 stroke-[2.5]" />
                </div>
                <h4 className="text-sm font-black text-slate-900">Olho na Data</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Antes de partilhar ou citar num trabalho escolar, procura sempre o dia, mês e ano em que o artigo foi originalmente publicado.
                </p>
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

          {/* ⭐ 3. O QUE APRENDES NESTA MISSÃO? */}
          <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-emerald-50/90 border border-emerald-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
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
                  <span>A ciência e a tecnologia evoluem: uma notícia antiga pode já não ser verdadeira hoje.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Antes de usar dados num trabalho escolar, confirma sempre o ano em que foram publicados.</span>
                </div>
              </div>
            </div>

            {/* White Pinned Notepad Checklist with Pencil */}
            <div className="relative bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2 min-w-[190px] shrink-0">
              <div className="space-y-1.5 text-[11px] font-black text-slate-800">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>VER DATA DO ARTIGO</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>AVALIAR ATUALIDADE</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>DESCOBRIR REVISÕES</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>PENSAR CRITICAMENTE</span>
                </div>
              </div>

              {/* Pencil Vector across notepad */}
              <div className="absolute -bottom-2 -right-3 transform rotate-12">
                <div className="w-16 h-2.5 bg-yellow-400 border border-yellow-600 rounded-sm flex items-center shadow-xs">
                  <div className="w-3 h-full bg-red-500 rounded-l-sm" />
                  <div className="flex-1" />
                  <div className="w-2.5 h-full bg-stone-700 rounded-r-xs" />
                </div>
              </div>
            </div>
          </div>

          {/* 👉 4. PRÓXIMA MISSÃO ACTION BAR */}
          <div className="bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-pink-50/70 border border-indigo-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-amber-400 fill-current shrink-0 filter drop-shadow-xs" />
              <span className="text-xs sm:text-sm font-black text-indigo-950">
                Excelente! Agora vamos aprender a cruzar fontes e comparar pistas!
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTopic('w2-t4')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 active:scale-95"
            >
              <span>Próxima Missão: 4. Comparar Pistas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MISSÃO 4: COMPARAR FONTES                                */}
      {/* ========================================================= */}
      {activeTopicId === 'w2-t4' && (
        <div className="space-y-6">
          {/* Active Mission Header Card */}
          <div className="bg-white border border-blue-100/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
                <Layers className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> MISSÃO 4/6
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Comparar Pistas 📑
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Hoje vais aprender a não confiar no primeiro resultado e a cruzar fontes.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-source-compare')?.completed ? (
                <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-800 font-black text-xs px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluída ({getSimProg('sim-source-compare')?.score}%)</span>
                </div>
              ) : (
                <div className="bg-blue-50 border-2 border-blue-400 text-blue-800 font-black text-xs px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xs">
                  <Zap className="w-4 h-4 text-amber-500 fill-current" />
                  <span>Recompensa: +100 XP</span>
                </div>
              )}
            </div>
          </div>

          {/* 💡 1. APRENDE: CRUZAR INFORMAÇÃO */}
          <div className="bg-white border border-blue-100/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-900 font-black text-sm sm:text-base tracking-wide">
                <span className="text-lg">💡</span>
                <span>1. APRENDE: CRUZAR INFORMAÇÃO</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-blue-600">
                <Lightbulb className="w-4 h-4 text-amber-500 fill-current" />
                <span>Dicas do detetive</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-5 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-blue-600 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-blue-600 stroke-[2.5]" />
                </div>
                <h4 className="text-sm font-black text-slate-900">Nunca Fiques Pela Primeira</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Compara sempre duas ou três fontes diferentes para ver se todos dizem o mesmo facto. Se só um site estranho diz, desconfia!
                </p>
              </div>

              <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-5 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Award className="w-5 h-5 text-purple-600 stroke-[2.5]" />
                </div>
                <h4 className="text-sm font-black text-slate-900">Facto vs Opinião</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Um facto é uma verdade comprovada ("A Terra gira à volta do Sol"). Uma opinião é o que alguém acha ("Este jogo é o melhor!").
                </p>
              </div>
            </div>
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

          {/* ⭐ 3. O QUE APRENDES NESTA MISSÃO? */}
          <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-emerald-50/90 border border-emerald-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
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
                  <span>Nunca confies apenas numa fonte: cruza com outros sites para ver se os factos coincidem.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Distingue factos reais e científicos de opiniões ou boatos sensacionalistas.</span>
                </div>
              </div>
            </div>

            {/* White Pinned Notepad Checklist with Pencil */}
            <div className="relative bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2 min-w-[190px] shrink-0">
              <div className="space-y-1.5 text-[11px] font-black text-slate-800">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>CRUZAR FONTES</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>FACTO VS OPINIÃO</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>COMPARAR EVIDÊNCIAS</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>PENSAR CRITICAMENTE</span>
                </div>
              </div>

              {/* Pencil Vector across notepad */}
              <div className="absolute -bottom-2 -right-3 transform rotate-12">
                <div className="w-16 h-2.5 bg-yellow-400 border border-yellow-600 rounded-sm flex items-center shadow-xs">
                  <div className="w-3 h-full bg-red-500 rounded-l-sm" />
                  <div className="flex-1" />
                  <div className="w-2.5 h-full bg-stone-700 rounded-r-xs" />
                </div>
              </div>
            </div>
          </div>

          {/* 👉 4. PRÓXIMA MISSÃO ACTION BAR */}
          <div className="bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-pink-50/70 border border-indigo-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-amber-400 fill-current shrink-0 filter drop-shadow-xs" />
              <span className="text-xs sm:text-sm font-black text-indigo-950">
                Espetacular! Falta apenas o treino de caça a boatos e notícias falsas!
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTopic('w2-t5')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 active:scale-95"
            >
              <span>Próxima Missão: 5. Caça a Boatos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MISSÃO 5: CAÇA A BOATOS & FAKE NEWS                       */}
      {/* ========================================================= */}
      {activeTopicId === 'w2-t5' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
                <AlertOctagon className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-black tracking-wider uppercase text-rose-600 bg-rose-50 border border-rose-200/60 px-2.5 py-0.5 rounded-full inline-block">
                  MISSÃO 5/6
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Caça a Boatos & Fake News 🚨
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Aprende a desmascarar notícias falsas, boatos de redes sociais e títulos armadilha sensacionalistas.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              {getSimProg('sim-news-detective')?.completed ? (
                <div className="bg-emerald-500 text-white text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Missão Concluída ({getSimProg('sim-news-detective')?.score}%)</span>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-black text-xs px-4 py-2 rounded-2xl flex items-center gap-1.5 shadow-xs">
                  <Zap className="w-4 h-4 fill-current text-slate-950" />
                  <span>Recompensa: +100 XP</span>
                </div>
              )}
            </div>
          </div>

          {/* 💡 1. APRENDE */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-blue-900">
              <Sparkles className="w-5 h-5 text-amber-500 fill-current" />
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider">
                1. APRENDE: PÁRA, ANALISA E PENSA ANTES DE PARTILHAR!
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-rose-50/70 to-pink-50/40 border border-rose-200/80 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎣</span>
                  <h5 className="text-xs sm:text-sm font-black text-rose-950">Títulos Armadilha (Clickbait)</h5>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Títulos exagerados e dramáticos ("Não vais acreditar no que aconteceu!") querem apenas cliques para ganhar dinheiro de publicidade. Desconfia sempre!
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-200/80 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🛑</span>
                  <h5 className="text-xs sm:text-sm font-black text-emerald-950">Não Espalhes Dúvidas</h5>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Se tens a mínima dúvida se uma notícia é real, nunca a reencaminhes para o grupo da turma ou família. Pergunta primeiro a um professor ou adulto!
                </p>
              </div>
            </div>
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
              <div className="flex items-center gap-2.5 text-blue-900">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm sm:text-base font-black uppercase tracking-wide">
                  2. EXPERIMENTA: AUDITORIA DE NOTÍCIAS & CLASSIFICAÇÃO
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/70">
                Treino de Detetive
              </span>
            </div>

            {/* Atividade A: Classificar Afirmações */}
            <div className="space-y-4 p-5 sm:p-6 rounded-2xl border border-blue-200/70 bg-gradient-to-b from-blue-50/40 to-slate-50/40">
              <div className="border-b border-blue-200/60 pb-3">
                <h5 className="text-xs sm:text-sm font-black text-blue-950 uppercase tracking-wide">
                  Parte A: Classifica cada afirmação no tipo correto
                </h5>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Identifica se é um Facto com dados, uma Opinião pessoal, uma Notícia com base ou uma Informação enganadora:
                </p>
              </div>

              <div className="space-y-3">
                {statementItems.map((item) => {
                  const currentChoice = classifiedStatements[item.id];
                  const isCorrect = currentChoice === item.correct;
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-xs"
                    >
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        {item.text}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'facto' as const, label: 'Facto com dados' },
                          { id: 'opiniao' as const, label: 'Opinião' },
                          { id: 'noticia' as const, label: 'Notícia com base' },
                          { id: 'enganadora' as const, label: 'Informação enganadora' },
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() =>
                              setClassifiedStatements((prev) => ({
                                ...prev,
                                [item.id]: cat.id,
                              }))
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                              currentChoice === cat.id
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>

                      {currentChoice && (
                        <div
                          className={`p-3 rounded-xl text-xs font-medium ${
                            isCorrect
                              ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                              : 'bg-amber-50 text-amber-950 border border-amber-200'
                          }`}
                        >
                          <span className="font-black">
                            {isCorrect ? '✓ Correto!' : 'ℹ️ Análise do Detetive:'}{' '}
                          </span>
                          {item.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Atividade B: Auditoria de Publicação Viral */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h5 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                  Parte B: Auditoria de Publicação Viral
                </h5>
                <p className="text-xs text-slate-600 font-medium">
                  Analisa uma informação antes de a partilhar. Procura o autor, verifica a data, procura evidências e compara outras fontes.
                </p>
              </div>

              {/* Publicação Viral */}
              <div className="p-5 rounded-2xl border border-rose-200/90 bg-rose-50/50 space-y-2.5">
                <div className="flex items-center gap-2 text-rose-700 text-xs font-black">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Publicação viral muito partilhada nas redes sociais</span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-slate-900">
                  "Descoberta extraordinária na serra revoluciona a ciência mundial! As autoridades tentaram esconder este segredo!"
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Publicação com milhares de partilhas nas redes sociais, imagem desfocada com cores artificiais, sem indicação de autor cientista, sem data original e sem links para relatórios ou instituições.
                </p>
              </div>

              {/* Checklist de Auditoria */}
              <div className="space-y-2.5">
                <span className="text-xs font-black text-slate-700 block uppercase tracking-wide">
                  Passos de Investigação do Detetive (Marca o que verificaste):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors">
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
                  <label className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors">
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
                  <label className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors">
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
                    <span>3. Procurei evidências reais</span>
                  </label>
                  <label className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors">
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
                <span className="text-xs font-black text-slate-700 block uppercase tracking-wide">
                  Agora decide: partilhar ou continuar a verificar?
                </span>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => handleNewsDecision('verificar')}
                    className="w-full sm:w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm py-3.5 rounded-2xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Continuar a verificar (Não partilhar)</span>
                  </button>
                  <button
                    onClick={() => handleNewsDecision('partilhar')}
                    className="w-full sm:w-1/2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm py-3.5 rounded-2xl shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Partilhar imediatamente</span>
                  </button>
                </div>
              </div>

              {newsScore !== null && (
                <div
                  className={`p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm font-medium ${
                    newsDecision === 'verificar'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}
                >
                  <p className="font-black mb-1 flex items-center gap-2">
                    {newsDecision === 'verificar' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                    )}
                    <span>Resultado da Auditoria: {newsScore}/100</span>
                  </p>
                  <p className="leading-relaxed">
                    {newsDecision === 'verificar'
                      ? 'Excelente atitude de Detetive Digital! Não partilhaste um boato sem antes confirmar as provas e comparar fontes. O teu lema de ouro é: Pára, Verifica, Compara. Só depois decide!'
                      : 'Atenção! Ainda não tens informação suficiente nem fontes confirmadas para partilhar com segurança. Partilhar sem verificar apenas espalha boatos e desinformação.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ⭐ 3. O QUE APRENDES NESTA MISSÃO? */}
          <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-emerald-50/90 border border-emerald-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
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
                  <span>Pára, verifica e compara antes de clicar em partilhar com amigos ou familiares.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Títulos alarmantes ou milagrosos querem apenas cliques para publicidade, não a verdade.</span>
                </div>
              </div>
            </div>

            {/* White Pinned Notepad Checklist with Pencil */}
            <div className="relative bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2 min-w-[190px] shrink-0">
              <div className="space-y-1.5 text-[11px] font-black text-slate-800">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>PÁRA E PENSA</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>VERIFICA ANTES</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>ZERO CLICKBAIT</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>DETETIVE ATENTO</span>
                </div>
              </div>

              {/* Pencil Vector across notepad */}
              <div className="absolute -bottom-2 -right-3 transform rotate-12">
                <div className="w-16 h-2.5 bg-yellow-400 border border-yellow-600 rounded-sm flex items-center shadow-xs">
                  <div className="w-3 h-full bg-red-500 rounded-l-sm" />
                  <div className="flex-1" />
                  <div className="w-2.5 h-full bg-stone-700 rounded-r-xs" />
                </div>
              </div>
            </div>
          </div>

          {/* 👉 4. PRÓXIMA MISSÃO */}
          <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-amber-50/80 border border-amber-200/90 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xs">
            <div className="space-y-1">
              <span className="text-xs font-black text-amber-700 uppercase tracking-wider block">
                🎉 Todas as 5 Micro-Missões de Investigação Concluídas!
              </span>
              <h4 className="text-lg sm:text-xl font-black text-slate-900">
                Pronto para o Desafio Final: Quiz do Detetive (10 Perguntas)? 🏆
              </h4>
            </div>
            <button
              onClick={() => onNavigateTopic('avaliacao')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-8 py-3.5 rounded-2xl shadow-md shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer shrink-0"
            >
              <span>👉 Fazer Missão 6: Quiz do Detetive</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SEPARADOR 6: AVALIAÇÃO FINAL                              */}
      {/* ========================================================= */}
      {activeTopicId === 'avaliacao' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-sm max-w-3xl mx-auto space-y-6 text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/25">
            <Award className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] uppercase font-black text-amber-600 tracking-wider bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full inline-block">
              🏆 MISSÃO 6/6 · O GRANDE TESTE
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Quiz do Detetive Digital 🔍
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed font-medium">
              Demonstra que sabes pesquisar com palavras-chave exatas, identificar autores credíveis, verificar a data e comparar fontes. Acerta mais de {PROGRESSION_CONFIG.PASSING_THRESHOLD}% para desbloquear o Mundo 3!
            </p>
          </div>

          <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-blue-50/70 border border-blue-200/80 rounded-2xl max-w-md mx-auto text-xs sm:text-sm text-blue-950 font-bold space-y-1.5 shadow-xs">
            <p className="flex items-center justify-center gap-1.5 text-blue-800">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Requisito para desbloquear Mundo 3: Média &ge; {PROGRESSION_CONFIG.PASSING_THRESHOLD}%</span>
            </p>
            <p className="text-slate-600 font-medium">
              Melhor resultado registado:{' '}
              <span className="font-black text-slate-900">
                {world.bestAssessmentPercentage !== null
                  ? `${world.bestAssessmentPercentage}%`
                  : 'Ainda não realizado'}
              </span>
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenAssessment}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-base px-10 py-4 rounded-2xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-3 cursor-pointer"
            >
              <span>Começar Avaliação Final (10 Perguntas)</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
