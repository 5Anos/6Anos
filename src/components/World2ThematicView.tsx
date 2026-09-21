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

          {/* 🎮 2. EXPERIMENTA: SIMULADOR DE PESQUISA INTELIGENTE */}
          <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-blue-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Simulador de Pesquisa Inteligente
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                3 Situações Reais de Estudo
              </span>
            </div>

            {/* Scenario Selector Pills */}
            <div className="flex flex-wrap gap-2">
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
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isAnswered
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
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
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
                    <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider block">
                      {currentScenario.theme}
                    </span>
                    <p className="text-xs sm:text-sm text-blue-950 font-medium">
                      {currentScenario.prompt}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {currentScenario.queries.map((sq) => {
                      const isSelected = selectedQId === sq.id;
                      return (
                        <div
                          key={sq.id}
                          onClick={() => handleKeywordSelect(activeSearchScenarioIndex, sq.id)}
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

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-bold text-slate-500">
                      Situações concluídas: {Object.keys(selectedSearchQueries).length} de {searchScenarios.length}
                    </span>
                    {activeSearchScenarioIndex < searchScenarios.length - 1 && (
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
                        className="text-xs font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Próxima Situação</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
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
                Analisa as 4 situações observando as pistas
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

                  <div className="p-2.5 bg-blue-50/60 border border-blue-100 rounded-xl text-[11px] text-blue-900 font-medium">
                    {scen.clues}
                  </div>

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
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Validar Avaliação de Autores
              </button>
            </div>

            {authorScore !== null && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-950 font-medium space-y-1">
                <p className="font-black text-blue-900">
                  Pontuação da Auditoria: {authorScore}/100
                </p>
                <p>
                  Saber quem criou a informação é uma pista importante, mas não é a única coisa que devemos verificar. Procura sempre saber quem criou e verifica se existem dados e evidências que a apoiem.
                </p>
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
                  2. Experimenta: DETETIVE DE NOTÍCIAS & CLASSIFICAÇÃO DE INFORMAÇÃO
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Treino Prático do Detetive
              </span>
            </div>

            {/* Atividade A: Classificar Afirmações */}
            <div className="space-y-4 p-5 rounded-2xl border border-blue-100 bg-blue-50/40">
              <div className="border-b border-blue-200/60 pb-2">
                <h5 className="text-xs sm:text-sm font-black text-blue-950 uppercase tracking-wide">
                  Parte A: Classifica cada afirmação no tipo correto
                </h5>
                <p className="text-xs text-blue-900">
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
                      className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-xs"
                    >
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        {item.text}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
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
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                          className={`p-2.5 rounded-lg text-xs font-medium ${
                            isCorrect
                              ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                              : 'bg-amber-50 text-amber-950 border border-amber-200'
                          }`}
                        >
                          <span className="font-bold">
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
              <div className="border-b border-slate-200 pb-2">
                <h5 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                  Parte B: Auditoria de Publicação Viral
                </h5>
                <p className="text-xs text-slate-600">
                  Analisa uma informação antes de a partilhar. Procura o autor, verifica a data, procura evidências e compara outras fontes.
                </p>
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
                    className="w-full sm:w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Continuar a verificar</span>
                  </button>
                  <button
                    onClick={() => handleNewsDecision('partilhar')}
                    className="w-full sm:w-1/2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-3 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
            <p>🏆 Requisito para desbloquear o Mundo 3: Média global &gt; 70%</p>
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
