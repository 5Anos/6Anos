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
  HelpCircle,
  Search,
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  FileCheck,
  Compass,
  Flame,
  Star,
  Zap,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { AIPioneerHero } from './WorldMascots';
import { StudyStackIllustration } from './DetectiveMascot';
import { AudioReaderButton } from './AudioReaderButton';
import { GlossaryTerm } from './PedagogicalGlossary';
import { MetacognitionWidget } from './MetacognitionWidget';
import { ScaffoldingClueCard } from './ScaffoldingClueCard';
import { WorldSummary } from '../types';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
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
  // 1. CONCEITOS IA STATE (6 situações com 3 opções)
  // -------------------------------------------------------------
  const [conceptChoices, setConceptChoices] = useState<Record<string, string>>({});
  const [conceptScore, setConceptScore] = useState<number | null>(null);
  const [conceptValidated, setConceptValidated] = useState(false);

  const conceptItems = [
    {
      id: 'c1',
      situation: 'Um semáforo muda de cor a cada 60 segundos porque foi programado com um temporizador fixo.',
      correct: 'regra',
      explanation: 'Sistema baseado em regras e programação fixa: segue sempre as mesmas instruções temporizadas sem precisar de IA.',
    },
    {
      id: 'c2',
      situation: 'Uma aplicação de fotografia reconhece a cara dos animais e distingue cães de gatos a partir de milhares de fotos de exemplo.',
      correct: 'ia',
      explanation: 'Sistema que utiliza IA: reconhece padrões visuais complexos que aprendeu com milhares de exemplos.',
    },
    {
      id: 'c3',
      situation: 'Um colega percebe que o amigo está triste e decide conversar com ele para o apoiar.',
      correct: 'humano',
      explanation: 'Atividade humana: envolve sentimentos reais, empatia e consciência que os computadores não têm.',
    },
    {
      id: 'c4',
      situation: 'Uma aplicação de vídeos sugere novos conteúdos com base nos vídeos que costumas ver e pesquisar.',
      correct: 'ia',
      explanation: 'Sistema que utiliza IA: analisa padrões de utilização e preferências para fazer recomendações.',
    },
    {
      id: 'c5',
      situation: 'Uma calculadora faz a conta 125 + 340 através de uma operação matemática predefinida.',
      correct: 'regra',
      explanation: 'Sistema baseado em regras e operações matemáticas diretas, sem inteligência artificial.',
    },
    {
      id: 'c6',
      situation: 'Uma ferramenta gera um poema original sobre o mar a partir de um pedido que escreveste.',
      correct: 'ia',
      explanation: 'Sistema que utiliza IA generativa: cria novos textos combinando padrões de linguagem aprendidos.',
    },
  ];

  // -------------------------------------------------------------
  // 2. IA GENERATIVA VERIFICATION STATE (5 situações)
  // -------------------------------------------------------------
  const [genChoices, setGenChoices] = useState<Record<string, string>>({});
  const [genScore, setGenScore] = useState<number | null>(null);
  const [genValidated, setGenValidated] = useState(false);

  const genSituations = [
    {
      id: 'g1',
      title: 'Situação 1: Data histórica num resumo',
      description: 'A IA gera um resumo sobre a História de Portugal com uma data específica que não conheces, sem indicar fontes.',
      options: [
        { id: 'opt-a', label: 'Aceitar a data de imediato porque a resposta parece muito profissional e segura.', isCorrect: false },
        { id: 'opt-b', label: 'Confirmar a data num manual escolar ou enciclopédia credível antes de a usar.', isCorrect: true },
        { id: 'opt-c', label: 'Copiar a data e inventar o nome de um livro antigo nas referências.', isCorrect: false },
      ],
      feedback: 'A IA pode gerar datas erradas com total segurança. Devemos sempre confirmar os factos importantes em fontes fiáveis.',
    },
    {
      id: 'g2',
      title: 'Situação 2: Texto gerado para uma pergunta de Ciências',
      description: 'A IA gera uma resposta completa para uma pergunta da aula de Ciências Naturais.',
      options: [
        { id: 'opt-a', label: 'Copiar e colar o texto diretamente para o caderno sem o ler.', isCorrect: false },
        { id: 'opt-b', label: 'Ler com atenção, compreender a matéria, verificar os factos e escrever a resposta pelas tuas palavras.', isCorrect: true },
        { id: 'opt-c', label: 'Mudar apenas a cor do texto e entregar logo ao professor.', isCorrect: false },
      ],
      feedback: 'O trabalho e a aprendizagem são teus! A IA serve para apoiar, mas tu deves compreender e escrever o trabalho.',
    },
    {
      id: 'g3',
      title: 'Situação 3: Imagem realista de um animal lendário',
      description: 'A IA gera uma imagem hiper-realista que parece a fotografia de um dragão a sobrevoar uma praia portuguesa.',
      options: [
        { id: 'opt-a', label: 'Acreditar que a foto é 100% real porque parece perfeita aos olhos.', isCorrect: false },
        { id: 'opt-b', label: 'Reconhecer que a IA generativa cria imagens muito realistas que não correspondem a factos reais.', isCorrect: true },
        { id: 'opt-c', label: 'Partilhar a imagem como se fosse uma notícia urgente verdadeira.', isCorrect: false },
      ],
      feedback: 'A IA generativa consegue criar imagens impressionantes, mas isso não significa que o acontecimento seja real.',
    },
    {
      id: 'g4',
      title: 'Situação 4: Lista de livros recomendados',
      description: 'A IA sugere uma lista de 3 livros para ler, com títulos e autores que nunca ouviste falar.',
      options: [
        { id: 'opt-a', label: 'Verificar no catálogo da biblioteca escolar ou na Internet se os livros e autores existem mesmo.', isCorrect: true },
        { id: 'opt-b', label: 'Achar que todos os livros existem e que a IA nunca inventa títulos.', isCorrect: false },
        { id: 'opt-c', label: 'Copiar a lista de livros sem verificar se eles existem na realidade.', isCorrect: false },
      ],
      feedback: 'A IA pode inventar títulos de livros e nomes de autores com total naturalidade. Confirma sempre a sua existência.',
    },
    {
      id: 'g5',
      title: 'Situação 5: Resposta confusa ou fora do pedido',
      description: 'Fizeste um pedido à IA, mas a resposta recebida foi confusa e não explicou o que precisavas.',
      options: [
        { id: 'opt-a', label: 'Aceitar a resposta confusa e copiar para o trabalho de qualquer maneira.', isCorrect: false },
        { id: 'opt-b', label: 'Reformular o pedido (prompt) com instruções mais claras, indicando o tema e o que pretendes.', isCorrect: true },
        { id: 'opt-c', label: 'Desistir imediatamente de estudar a matéria.', isCorrect: false },
      ],
      feedback: 'Se a resposta não foi clara, melhora o teu pedido dando mais contexto e instruções precisas à IA.',
    },
  ];

  // -------------------------------------------------------------
  // 3. PROMPT SIMULATOR PROGRESSIVO (4 níveis graduais)
  // -------------------------------------------------------------
  const [promptLevel, setPromptLevel] = useState<number>(1);
  const [promptChoices, setPromptChoices] = useState<Record<number, string>>({});
  const [promptScore, setPromptScore] = useState<number | null>(null);
  const [promptValidated, setPromptValidated] = useState(false);

  const promptLevels = [
    {
      level: 1,
      title: 'Nível 1: Comparar um pedido vago com um pedido claro',
      goal: 'Objetivo: Obter uma explicação sobre energia solar para um trabalho do 6.º ano.',
      options: [
        { id: 'p1-a', text: '"Fala sobre sol e energia."', isCorrect: false, explanation: 'Demasiado vago. A IA não sabe para que nível de escolaridade é o texto nem o formato pretendido.' },
        { id: 'p1-b', text: '"Explica a um aluno do 6.º ano como funciona a energia solar, indicando 2 vantagens em poucas linhas e com linguagem simples."', isCorrect: true, explanation: 'Excelente! Indica o tema, o público-alvo (6.º ano), as vantagens pretendidas e o tipo de linguagem simples.' },
      ],
    },
    {
      level: 2,
      title: 'Nível 2: Diagnosticar o que falta num pedido vago',
      goal: 'Analisa este pedido vago: "Escreve um texto sobre a água."',
      question: 'O que falta principalmente neste pedido para ajudar a IA a dar uma resposta adequada?',
      options: [
        { id: 'p2-a', text: 'Falta indicar o tema específico sobre a água, para quem é o texto e qual o tamanho da resposta.', isCorrect: true, explanation: 'Correto! Sem objetivo claro e público-alvo, a resposta pode ser demasiado longa, difícil ou fora do assunto.' },
        { id: 'p2-b', text: 'Falta escrever o pedido todo em letras MAIÚSCULAS.', isCorrect: false, explanation: 'Escrever em maiúsculas não melhora a clareza nem a compreensão do pedido pela IA.' },
        { id: 'p2-c', text: 'Falta apenas colocar muitos pontos de exclamação no final.', isCorrect: false, explanation: 'Sinais de pontuação repetidos não fornecem contexto útil à ferramenta.' },
      ],
    },
    {
      level: 3,
      title: 'Nível 3: Melhorar um pedido inicial vago',
      goal: 'Um aluno escreveu: "Animais da floresta."',
      question: 'Qual das seguintes opções transforma este pedido num prompt claro e estruturado?',
      options: [
        { id: 'p3-a', text: '"Diz tudo o que existe sobre todos os animais do planeta sem esquecer nada."', isCorrect: false, explanation: 'Pedir "tudo" gera uma resposta enorme, desorganizada e sem foco útil para o trabalho.' },
        { id: 'p3-b', text: '"Indica 3 animais que vivem nas florestas em Portugal e explica o que comem, em tópicos simples para um aluno do 6.º ano."', isCorrect: true, explanation: 'Muito bem! Delimita a região (Portugal), a quantidade (3 animais), o foco (alimentação) e o público (6.º ano).' },
        { id: 'p3-c', text: '"Animais da floresta urgente por favor."', isCorrect: false, explanation: 'Pedir urgência não explica à IA aquilo de que realmente precisas.' },
      ],
    },
    {
      level: 4,
      title: 'Nível 4: Escolher o prompt mais eficaz',
      goal: 'Objetivo: Estudar as partes de um vulcão para a aula de Ciências Naturais.',
      question: 'Qual destas 4 opções orienta a IA da melhor forma para apoiar o teu estudo?',
      options: [
        { id: 'p4-a', text: '"Vulcões."', isCorrect: false, explanation: 'Apenas uma palavra solta sem qualquer instrução.' },
        { id: 'p4-b', text: '"Fala sobre vulcões."', isCorrect: false, explanation: 'Pedido demasiado geral que não especifica as partes do vulcão nem a matéria escolar.' },
        { id: 'p4-c', text: '"Explica a um aluno do 6.º ano as partes principais de um vulcão e como acontece uma erupção, com linguagem simples e organizada por tópicos."', isCorrect: true, explanation: 'Excelente! Um bom prompt não precisa de ser longo: deve ser claro, indicar o tema, o objetivo e os detalhes importantes para obteres uma resposta útil.' },
        { id: 'p4-d', text: '"Faz um trabalho enorme sobre vulcões com milhares de palavras difíceis."', isCorrect: false, explanation: 'Um texto demasiado longo e complexo dificulta a compreensão da matéria.' },
      ],
    },
  ];

  // -------------------------------------------------------------
  // 4. HALLUCINATION & EVIDENCE SIMULATOR (6 afirmações subtis)
  // -------------------------------------------------------------
  const [hallucinationChoices, setHallucinationChoices] = useState<Record<string, string>>({});
  const [hallucinationScore, setHallucinationScore] = useState<number | null>(null);
  const [hallucinationValidated, setHallucinationValidated] = useState(false);

  const hallucinationStatements = [
    {
      id: 'h1',
      text: 'D. Afonso Henriques foi o primeiro rei de Portugal e a Batalha de S. Mamede ocorreu em 1128.',
      correct: 'veridico',
      explanation: 'Facto histórico verídico: documentado e confirmado nos manuais de História de Portugal.',
    },
    {
      id: 'h2',
      text: 'A fotossíntese é o processo pelo qual as plantas produzem o seu alimento utilizando luz solar, água e dióxido de carbono.',
      correct: 'veridico',
      explanation: 'Facto científico verídico: princípio fundamental estudado em Ciências Naturais.',
    },
    {
      id: 'h3',
      text: 'A IA afirma que o navegador Vasco da Gama chegou à Índia num navio a vapor em 1498.',
      correct: 'alucinacao',
      explanation: 'Erro e alucinação da IA: em 1498 as viagens eram feitas em caravelas e naus a velas, pois os motores a vapor só surgiram séculos mais tarde.',
    },
    {
      id: 'h4',
      text: 'A IA diz que existe uma lei escolar que obriga todos os alunos a comer chocolate ao pequeno-almoço, citando o "Regulamento n.º 99999 da Escola".',
      correct: 'fonte_inexistente',
      explanation: 'Fonte inexistente e inventada: a IA inventou um regulamento com aparência oficial para tentar justificar uma afirmação falsa.',
    },
    {
      id: 'h5',
      text: 'A IA afirma com total certeza que existem exatamente 8.421.399 formigas em Lisboa, sem citar nenhum estudo científico.',
      correct: 'sem_fonte',
      explanation: 'Afirmação duvidosa sem fonte: a IA gerou um número hiper-específico sem qualquer base ou estudo real que o comprove.',
    },
    {
      id: 'h6',
      text: 'A Terra demora aproximadamente 365 dias e 6 horas a completar uma translação ao redor do Sol.',
      correct: 'veridico',
      explanation: 'Facto astronómico verídico: base do nosso calendário com anos comuns e bissextos.',
    },
  ];

  // -------------------------------------------------------------
  // 5. PRIVACIDADE E IA (Classificação de 10 tipos de dados)
  // -------------------------------------------------------------
  const [privacyChoices, setPrivacyChoices] = useState<Record<string, 'seguro' | 'depende' | 'nao_partilhar'>>({});
  const [privacyScore, setPrivacyScore] = useState<number | null>(null);
  const [privacyValidated, setPrivacyValidated] = useState(false);

  const privacyItems = [
    { id: 'p1', label: '1. A tua palavra-passe da conta da escola ou de um jogo', correct: 'nao_partilhar', hint: 'Credencial privada de acesso' },
    { id: 'p2', label: '2. Uma dúvida de Português sobre o que é um adjetivo', correct: 'seguro', hint: 'Pergunta escolar geral e segura' },
    { id: 'p3', label: '3. O teu nome completo, a tua morada e o número da porta', correct: 'nao_partilhar', hint: 'Dados de identificação e localização pessoal' },
    { id: 'p4', label: '4. O teu número de telemóvel ou o número dos teus pais', correct: 'nao_partilhar', hint: 'Contacto pessoal privado' },
    { id: 'p5', label: '5. O nome de uma personagem fictícia para uma história ("O Dragão Azul")', correct: 'seguro', hint: 'Conteúdo criativo e imaginário' },
    { id: 'p6', label: '6. Uma fotografia privada tua ou da tua família', correct: 'nao_partilhar', hint: 'Imagem pessoal privada' },
    { id: 'p7', label: '7. O nome da tua disciplina favorita na escola (ex.: "Gosto de Educação Visual")', correct: 'seguro', hint: 'Gosto pessoal sem risco' },
    { id: 'p8', label: '8. Segredos e informações pessoais de um colega da turma', correct: 'nao_partilhar', hint: 'Informação privada de terceiros' },
    { id: 'p9', label: '9. Um texto que escreveste sobre a importância de proteger os oceanos', correct: 'seguro', hint: 'Texto escolar sem dados pessoais' },
    { id: 'p10', label: '10. O código de acesso ou cartão bancário dos teus pais', correct: 'nao_partilhar', hint: 'Informação financeira e confidencial' },
  ];

  // -------------------------------------------------------------
  // 6. PENSAR COM A IA / RECOMENDAÇÃO (5 situações)
  // -------------------------------------------------------------
  const [recChoices, setRecChoices] = useState<Record<string, string>>({});
  const [recommendationScore, setRecommendationScore] = useState<number | null>(null);
  const [recValidated, setRecValidated] = useState(false);

  const recSituations = [
    {
      id: 'r1',
      title: 'Situação 1: O mesmo jogo recomendado repetidamente',
      description: 'A aplicação só te recomenda vídeos do mesmo jogo porque viste vários vídeos desse tema recentemente.',
      options: [
        { id: 'r1-a', label: 'Ver sempre todos os vídeos recomendados porque a IA sabe o que deves ver.', isCorrect: false },
        { id: 'r1-b', label: 'Pesquisar temas diferentes (ciência, música, desporto) para explorar novos assuntos com autonomia.', isCorrect: true },
      ],
      feedback: 'Pesquisar novos temas ajuda a sair da repetição dos algoritmos e alarga os teus interesses.',
    },
    {
      id: 'r2',
      title: 'Situação 2: Estudo de História vs Vídeos de brincadeiras sugeridos',
      description: 'Precisas de estudar os Castelos de Portugal, mas a página inicial sugere vídeos de brincadeiras e desafios.',
      options: [
        { id: 'r2-a', label: 'Usar a barra de pesquisa para procurar fontes e canais educativos credíveis sobre a matéria.', isCorrect: true },
        { id: 'r2-b', label: 'Ficar a ver os vídeos sugeridos e esquecer o trabalho da escola.', isCorrect: false },
      ],
      feedback: 'Manter o foco na tua pesquisa intencional é essencial para aprenderes com eficácia.',
    },
    {
      id: 'r3',
      title: 'Situação 3: Vídeo sensacionalista com muitas visualizações',
      description: 'Um vídeo tem um título chocante e muitas visualizações a garantir uma notícia inacreditável.',
      options: [
        { id: 'r3-a', label: 'Não confiar apenas no número de visualizações e verificar a notícia em fontes credíveis.', isCorrect: true },
        { id: 'r3-b', label: 'Partilhar imediatamente o vídeo com toda a gente porque teve muitas visualizações.', isCorrect: false },
      ],
      feedback: 'Muitas visualizações não significam verdade. Deves sempre confirmar factos antes de acreditar ou partilhar.',
    },
    {
      id: 'r4',
      title: 'Situação 4: Controlos de recomendação da plataforma',
      description: 'A plataforma tem opções como "Não tenho interesse neste vídeo" ou "Limpar histórico".',
      options: [
        { id: 'r4-a', label: 'Usar essas opções para personalizar as tuas preferências e evitar conteúdos repetitivos.', isCorrect: true },
        { id: 'r4-b', label: 'Nunca usar essas opções porque não servem para nada.', isCorrect: false },
      ],
      feedback: 'Podes usar as ferramentas da plataforma para ajudar a gerir as recomendações que recebes.',
    },
    {
      id: 'r5',
      title: 'Situação 5: Decidir com autonomia',
      description: 'Um colega diz que temos de ver e gostar de tudo o que a aplicação nos recomenda no ecrã.',
      options: [
        { id: 'r5-a', label: 'Lembrar que as recomendações são apenas sugestões automáticas e que nós decidimos o que queremos ver.', isCorrect: true },
        { id: 'r5-b', label: 'Concordar com o colega e deixar que a tecnologia escolha tudo por nós.', isCorrect: false },
      ],
      feedback: 'A tecnologia sugere, mas a decisão, o pensamento e a escolha final continuam a ser teus!',
    },
  ];

  // -------------------------------------------------------------
  // REPORT COMPLETION HELPER
  // -------------------------------------------------------------
  const reportCompletion = async (simId: string, activityTitle: string, payloadData?: any, score?: number) => {
    try {
      const res = await apiRequest('/api/pedagogical/activities/complete', {
        method: 'POST',
        body: JSON.stringify({
          activityId: simId,
          worldId: 5,
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

  // Handlers
  const handleValidateConcepts = () => {
    if (Object.keys(conceptChoices).length < conceptItems.length) {
      alert('Por favor classifica todas as 6 situações antes de validar.');
      return;
    }
    let count = 0;
    conceptItems.forEach((c) => {
      if (conceptChoices[c.id] === c.correct) count++;
    });
    const score = Math.round((count / conceptItems.length) * 100);
    setConceptScore(score);
    setConceptValidated(true);
    reportCompletion('sim-ia-concepts', 'Simulador de Conceitos de IA', { answers: conceptChoices }, score);
  };

  const handleValidateGen = () => {
    if (Object.keys(genChoices).length < genSituations.length) {
      alert('Por favor responde às 5 situações antes de validar.');
      return;
    }
    let count = 0;
    genSituations.forEach((s) => {
      const chosenOpt = s.options.find((o) => o.id === genChoices[s.id]);
      if (chosenOpt?.isCorrect) count++;
    });
    const score = Math.round((count / genSituations.length) * 100);
    setGenScore(score);
    setGenValidated(true);
    reportCompletion('sim-ai-generation', 'Simulador de IA Generativa & Verificação', { answers: genChoices }, score);
  };

  const handleValidatePromptLevel = () => {
    if (Object.keys(promptChoices).length < promptLevels.length) {
      alert('Por favor completa todos os 4 níveis do Prompt Simulator antes de finalizar.');
      return;
    }
    let count = 0;
    promptLevels.forEach((l) => {
      const chosen = l.options.find((o) => o.id === promptChoices[l.level]);
      if (chosen?.isCorrect) count++;
    });
    const score = Math.round((count / promptLevels.length) * 100);
    setPromptScore(score);
    setPromptValidated(true);
    reportCompletion('sim-prompt', 'Prompt Simulator Progressivo', { answers: promptChoices }, score);
  };

  const handleValidateHallucination = () => {
    if (Object.keys(hallucinationChoices).length < hallucinationStatements.length) {
      alert('Por favor classifica todas as 6 afirmações antes de validar.');
      return;
    }
    let count = 0;
    hallucinationStatements.forEach((st) => {
      if (hallucinationChoices[st.id] === st.correct) count++;
    });
    const score = Math.round((count / hallucinationStatements.length) * 100);
    setHallucinationScore(score);
    setHallucinationValidated(true);
    reportCompletion('sim-hallucination', 'Hallucination & Evidence Simulator', { answers: hallucinationChoices }, score);
  };

  const handleValidatePrivacy = () => {
    if (Object.keys(privacyChoices).length < privacyItems.length) {
      alert('Por favor classifica todos os 10 tipos de dados antes de validar.');
      return;
    }
    let count = 0;
    privacyItems.forEach((item) => {
      if (privacyChoices[item.id] === item.correct) count++;
    });
    const score = Math.round((count / privacyItems.length) * 100);
    setPrivacyScore(score);
    setPrivacyValidated(true);
    reportCompletion('sim-ai-responsibility', 'Simulador de Privacidade e Classificação de Dados', { answers: privacyChoices }, score);
  };

  const handleValidateRec = () => {
    if (Object.keys(recChoices).length < recSituations.length) {
      alert('Por favor responde às 5 situações sobre algoritmos antes de validar.');
      return;
    }
    let count = 0;
    recSituations.forEach((s) => {
      const chosen = s.options.find((o) => o.id === recChoices[s.id]);
      if (chosen?.isCorrect) count++;
    });
    const score = Math.round((count / recSituations.length) * 100);
    setRecommendationScore(score);
    setRecValidated(true);
    reportCompletion('sim-recommendation', 'Simulador de Recomendações', { answers: recChoices }, score);
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
                Atividade concluída: {completedFeedback.activityTitle}
              </span>
              <p className="text-sm font-black">
                Pontuação: {completedFeedback.score}/100{' '}
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
      {/* 🚀 HERO BANNER PIONEIRO DA IA (Pixar 3D Theme)             */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-b from-[#a5b4fc] via-[#c7d2fe] to-[#eef2ff] border border-[#818cf8] p-6 sm:p-8 lg:p-9 shadow-sm">
        {/* Soft background clouds and radial highlights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-indigo-200/40 rounded-full blur-2xl pointer-events-none" />

        {/* Top Breadcrumb & Route Progress */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2 text-xs font-black text-[#312e81] tracking-wide uppercase">
            <span className="w-5 h-5 rounded-full bg-white text-indigo-600 flex items-center justify-center text-xs shadow-2xs">
              🌐
            </span>
            <span>MUNDO 5</span>
            <span className="text-indigo-600 font-bold">&gt;</span>
            <span>PIONEIRO DA IA</span>
            <span className="text-base">🚀</span>
          </div>

          <div className="bg-white/95 backdrop-blur-md border border-white/90 rounded-2xl px-4 py-2 shadow-xs flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-slate-800 tracking-wider">
              <span className="text-amber-500 text-sm">👑</span>
              <span>A TUA ROTA NO MUNDO</span>
            </div>
            <div className="w-24 sm:w-28 bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/80">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: '100%',
                }}
              />
            </div>
            <span className="text-xs font-black text-slate-900 tabular-nums">
              100%
            </span>
          </div>
        </div>

        {/* Middle Hero: Headline, Subtitle, AI Mascot */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 my-6 relative z-10">
          <div className="max-w-xl space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-slate-950 tracking-tight leading-[1.12]">
              O Futuro da Inteligência:<br />
              Prompts Perfeitos, Caça a Alucinações<br />
              e Ética Digital!
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed max-w-lg">
              A tua missão de pioneiro: dominar a IA Generativa, verificar factos sem pestanejar e proteger a tua privacidade no ciberespaço! 🤖✨
            </p>
          </div>
          <div className="shrink-0 flex justify-center lg:justify-end">
            <AIPioneerHero className="w-64 sm:w-72 lg:w-[350px] h-auto drop-shadow-md" />
          </div>
        </div>

        {/* 7 Mission Navigation Cards */}
        <div className="space-y-3 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Missão 1 */}
            <button
              onClick={() => onNavigateTopic('w5-t1')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'w5-t1'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${activeTopicId === 'w5-t1' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                  <Cpu className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className={`text-[10px] font-bold block ${activeTopicId === 'w5-t1' ? 'text-indigo-100' : 'text-slate-400'}`}>Missão 1/6</span>
                  <span className="text-xs sm:text-sm font-black truncate">O Que É e Não É IA</span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 ${activeTopicId === 'w5-t1' ? 'text-white' : 'text-indigo-500'}`} />
            </button>

            {/* Missão 2 */}
            <button
              onClick={() => onNavigateTopic('w5-t2')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'w5-t2'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${activeTopicId === 'w5-t2' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-600'}`}>
                  <Wand2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className={`text-[10px] font-bold block ${activeTopicId === 'w5-t2' ? 'text-indigo-100' : 'text-slate-400'}`}>Missão 2/6</span>
                  <span className="text-xs sm:text-sm font-black truncate">IA Generativa & Fatos</span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 ${activeTopicId === 'w5-t2' ? 'text-white' : 'text-indigo-500'}`} />
            </button>

            {/* Missão 3 */}
            <button
              onClick={() => onNavigateTopic('w5-t3')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'w5-t3'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${activeTopicId === 'w5-t3' ? 'bg-white/20 text-white' : 'bg-sky-50 text-sky-600'}`}>
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className={`text-[10px] font-bold block ${activeTopicId === 'w5-t3' ? 'text-indigo-100' : 'text-slate-400'}`}>Missão 3/6</span>
                  <span className="text-xs sm:text-sm font-black truncate">A Arte do Prompt</span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 ${activeTopicId === 'w5-t3' ? 'text-white' : 'text-indigo-500'}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Missão 4 */}
            <button
              onClick={() => onNavigateTopic('w5-t4')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'w5-t4'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${activeTopicId === 'w5-t4' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'}`}>
                  <AlertCircle className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className={`text-[10px] font-bold block ${activeTopicId === 'w5-t4' ? 'text-indigo-100' : 'text-slate-400'}`}>Missão 4/6</span>
                  <span className="text-xs sm:text-sm font-black truncate">Alucinações & Falsos</span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 ${activeTopicId === 'w5-t4' ? 'text-white' : 'text-indigo-500'}`} />
            </button>

            {/* Missão 5 */}
            <button
              onClick={() => onNavigateTopic('w5-t5')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'w5-t5'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${activeTopicId === 'w5-t5' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                  <Lock className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className={`text-[10px] font-bold block ${activeTopicId === 'w5-t5' ? 'text-indigo-100' : 'text-slate-400'}`}>Missão 5/6</span>
                  <span className="text-xs sm:text-sm font-black truncate">Privacidade & Dados</span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 ${activeTopicId === 'w5-t5' ? 'text-white' : 'text-indigo-500'}`} />
            </button>

            {/* Missão 6 */}
            <button
              onClick={() => onNavigateTopic('w5-t6')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'w5-t6'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${activeTopicId === 'w5-t6' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
                  <Brain className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className={`text-[10px] font-bold block ${activeTopicId === 'w5-t6' ? 'text-indigo-100' : 'text-slate-400'}`}>Missão 6/6</span>
                  <span className="text-xs sm:text-sm font-black truncate">Bolhas & Algoritmos</span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 ${activeTopicId === 'w5-t6' ? 'text-white' : 'text-indigo-500'}`} />
            </button>

            {/* Missão 7: Quiz Final */}
            <button
              onClick={() => onNavigateTopic('avaliacao')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'avaliacao'
                  ? 'bg-indigo-800 text-white shadow-md shadow-indigo-700/30 ring-2 ring-indigo-400'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xs hover:brightness-105'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-black text-indigo-100 block">DESAFIO FINAL</span>
                  <span className="text-xs sm:text-sm font-black truncate">Quiz do Pioneiro 🏆</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MISSÃO 1: O QUE É IA? */}
      {/* ========================================================= */}
      {activeTopicId === 'w5-t1' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black text-indigo-600 tracking-wider">
                    🎯 MISSÃO 1/6
                  </span>
                  <AudioReaderButton
                    textToRead="Missão 1: O que é a Inteligência Artificial? Descobre como os computadores aprendem com dados estatísticos e onde a IA é realmente usada. Lembra-te de que a IA é uma ferramenta sem consciência própria!"
                    label="Ouvir Missão"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  O que é a Inteligência Artificial? 🧠
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Descobre como os computadores aprendem com dados, evitam <GlossaryTerm term="alucinação de IA">alucinações</GlossaryTerm> e onde a IA é realmente usada.
                </p>
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

          {/* 💡 1. APRENDE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 text-indigo-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                💡 1. Aprende: Programas Inteligentes vs Regras Fixas
              </h4>
            </div>

            <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed font-normal">
              A <strong>Inteligência Artificial (IA)</strong> é um conjunto de programas avançados capazes de encontrar padrões em milhares de dados para realizar tarefas que antes só os humanos faziam.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase tracking-wide">
                  <span>🤖</span>
                  <span>O que a IA faz</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Aprende a reconhecer vozes, traduzir idiomas e identificar fotos através de milhões de exemplos.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-700 font-black text-xs uppercase tracking-wide">
                  <span>⚙️</span>
                  <span>O que NÃO é IA</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Uma calculadora a somar 5 + 5 segue apenas uma regra direta. E a IA não é viva nem tem sentimentos!
                </p>
              </div>
            </div>

            <TopicIllustrationCard topicId="w5-t1" />
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  🎮 2. Experimenta: Radar de IA (6 Situações)
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Classifica cada caso
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Lê as 6 situações e identifica se se trata de um <strong>Sistema baseado em regras/programação</strong>, um <strong>Sistema que utiliza IA</strong> ou uma <strong>Atividade humana</strong>:
            </p>

            <div className="space-y-4">
              {conceptItems.map((item, idx) => {
                const choice = conceptChoices[item.id];
                const isCorrect = choice === item.correct;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      conceptValidated
                        ? isCorrect
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-rose-50/70 border-rose-300'
                        : 'bg-slate-50 border-slate-200'
                    } space-y-3`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        <span className="text-indigo-600 mr-1.5">#{idx + 1}</span> {item.situation}
                      </p>
                      {conceptValidated && (
                        <span className="shrink-0">
                          {isCorrect ? (
                            <Check className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <X className="w-5 h-5 text-rose-600" />
                          )}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        onClick={() => setConceptChoices((prev) => ({ ...prev, [item.id]: 'regra' }))}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-left flex items-center gap-2 ${
                          choice === 'regra'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>⚙️</span>
                        <span>Sistema baseado em regras/programação</span>
                      </button>

                      <button
                        onClick={() => setConceptChoices((prev) => ({ ...prev, [item.id]: 'ia' }))}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-left flex items-center gap-2 ${
                          choice === 'ia'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>🤖</span>
                        <span>Sistema que utiliza IA</span>
                      </button>

                      <button
                        onClick={() => setConceptChoices((prev) => ({ ...prev, [item.id]: 'humano' }))}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-left flex items-center gap-2 ${
                          choice === 'humano'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>❤️</span>
                        <span>Atividade humana</span>
                      </button>
                    </div>

                    {conceptValidated && (
                      <p className="text-[11px] text-slate-600 italic pt-1 border-t border-slate-200">
                        💡 {item.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500 font-bold">
                {Object.keys(conceptChoices).length} de {conceptItems.length} selecionadas
              </span>
              <button
                onClick={handleValidateConcepts}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Validar Classificações (6 Casos)
              </button>
            </div>

            {conceptScore !== null && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 font-medium">
                Pontuação do Simulador: <strong>{conceptScore}/100</strong>. A IA é uma ferramenta informática baseada em dados e modelos de treino, enquanto sistemas deterministas seguem regras fixas e a consciência pertence apenas aos seres humanos!
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
              <div className="flex items-center gap-2 text-indigo-900 font-black text-xs sm:text-sm uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-500 fill-current" />
                <span>O QUE APRENDES NESTA MISSÃO?</span>
              </div>
              <div className="space-y-1.5 text-xs sm:text-sm text-slate-700 font-medium">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>A IA aprende procurando padrões estatísticos em milhões de dados e exemplos prévios.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>A IA é uma ferramenta criada por humanos — não tem consciência, sentimentos nem vontade própria.</span>
                </div>
              </div>
            </div>

            {/* White Pinned Notepad Checklist with Pencil */}
            <div className="relative bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2 min-w-[190px] shrink-0">
              <div className="space-y-1.5 text-[11px] font-black text-slate-800">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>EXPLORAR IA</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>VERIFICAR DADOS</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>PENSAR CRÍTICO</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>ÉTICA & ÉTICA</span>
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

          {/* 🧠 3.1 AUTOAVALIAÇÃO METACOGNITIVA */}
          <MetacognitionWidget
            missionId="w5-t1"
            worldThemeColor="indigo"
            questionPrompt="Como avalias a tua compreensão sobre o que a IA consegue e não consegue fazer?"
            options={[
              'Já sei que a IA não tem sentimentos nem consciência própria!',
              'Vou verificar sempre as respostas geradas por IA em fontes fiáveis.',
              'Aprendi que os modelos de IA precisam de milhões de dados de treino!',
            ]}
          />

          {/* 👉 4. PRÓXIMA MISSÃO ACTION BAR */}
          <div className="bg-gradient-to-r from-slate-50 via-white to-indigo-50/40 border-2 border-slate-200/90 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 text-xl shadow-2xs">
                ⭐
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 leading-snug">
                Excelente reflexão! Agora vamos descobrir os segredos da IA Generativa!
              </span>
            </div>
            <button
              onClick={() => onNavigateTopic('w5-t2')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Próxima Missão: 2. IA Generativa ➔</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MISSÃO 2: IA GENERATIVA */}
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
                  🎯 MISSÃO 2/6
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Máquinas que Criam: IA Generativa 🎨
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Compreende como a IA produz novos textos e imagens e por que deves sempre verificar os factos.
                </p>
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

          {/* 💡 1. APRENDE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 text-indigo-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                💡 1. Aprende: Como a IA Generativa Produz Conteúdos
              </h4>
            </div>

            <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed font-normal">
              A <strong>IA Generativa</strong> cria novos conteúdos combinando padrões que aprendeu a partir de milhões de exemplos de texto, som ou imagem.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase tracking-wide">
                  <span>🎨</span>
                  <span>Criação rápida</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Consegue criar resumos, ideias, histórias e ilustrações surpreendentes a partir de pedidos escritos.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-700 font-black text-xs uppercase tracking-wide">
                  <span>🔍</span>
                  <span>Verificar sempre</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Um texto bem escrito e articulado pode conter erros graves. Confirma sempre factos em fontes credíveis.
                </p>
              </div>
            </div>

            <TopicIllustrationCard topicId="w5-t2" />
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  🎮 2. Experimenta: Simulador de IA Generativa & Verificação (5 Situações)
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Seleciona a ação crítica adequada
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Analisa as 5 situações reais ao usar ferramentas de IA generativa e escolhe a atitude mais responsável antes de usar o conteúdo:
            </p>

            <div className="space-y-4">
              {genSituations.map((sit, idx) => {
                const chosen = genChoices[sit.id];
                const selectedOption = sit.options.find((o) => o.id === chosen);

                return (
                  <div
                    key={sit.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      genValidated
                        ? selectedOption?.isCorrect
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-rose-50/70 border-rose-300'
                        : 'bg-slate-50 border-slate-200'
                    } space-y-3`}
                  >
                    <div>
                      <span className="text-xs font-black text-indigo-700 block mb-0.5">
                        {sit.title}
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-800">
                        {sit.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {sit.options.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setGenChoices((prev) => ({ ...prev, [sit.id]: opt.id }))}
                          className={`w-full p-3 rounded-xl text-xs font-bold transition-all border text-left flex items-center justify-between gap-2 ${
                            chosen === opt.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {chosen === opt.id && (
                            <span className="shrink-0 font-black">✓</span>
                          )}
                        </button>
                      ))}
                    </div>

                    {genValidated && (
                      <p className="text-[11px] text-slate-600 italic pt-1 border-t border-slate-200">
                        💡 {sit.feedback}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500 font-bold">
                {Object.keys(genChoices).length} de {genSituations.length} respondidas
              </span>
              <button
                onClick={handleValidateGen}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Validar Auditoria (5 Situações)
              </button>
            </div>

            {genScore !== null && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 font-medium">
                Pontuação da Auditoria: <strong>{genScore}/100</strong>. A IA generativa cria texto e imagens combinando padrões, mas a garantia de verdade e a integridade do trabalho continuam a ser tua responsabilidade!
              </div>
            )}
          </div>

          {/* ⭐ 3. O QUE APRENDESTE? */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-black text-sm uppercase tracking-wide">
              <Star className="w-5 h-5 text-emerald-600" />
              <span>⭐ O que aprendeste nesta missão?</span>
            </div>
            <ul className="text-xs sm:text-sm text-emerald-950 font-medium space-y-1.5 list-disc pl-5">
              <li>A IA generativa constrói novos conteúdos combinando dados aprendidos.</li>
              <li>A beleza do texto não garante verdade científica: confirma sempre em enciclopédias e livros.</li>
            </ul>
          </div>

          {/* 👉 Próxima Missão */}
          <div className="bg-slate-100 border border-slate-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black text-indigo-600 uppercase tracking-wider block">
                Missão cumprida?
              </span>
              <p className="text-sm font-bold text-slate-800">
                Avança para a Missão 3 e domina a arte de escrever bons prompts!
              </p>
            </div>
            <button
              onClick={() => onNavigateTopic('w5-t3')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
            >
              <span>👉 Próxima Missão: Prompts Mágicos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MISSÃO 3: PROMPTS */}
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
                  🎯 MISSÃO 3/6
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  A Arte dos Prompts Mágicos ✨
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Aprende a formular instruções claras e detalhadas para obter as melhores respostas.
                </p>
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

          {/* 💡 1. APRENDE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 text-indigo-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                💡 1. Aprende: Como Formular Bons Prompts
              </h4>
            </div>

            <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed font-normal">
              Um <strong>Prompt</strong> é o pedido escrito que dás à IA. Quanto mais claro e específico for o teu pedido, mais útil será a ajuda recebida!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-700 font-black text-xs uppercase tracking-wide">
                  <span>❌</span>
                  <span>Prompt vago</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  "Fala sobre o espaço." Gera uma resposta genérica, longa e aborrecida.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-700 font-black text-xs uppercase tracking-wide">
                  <span>✅</span>
                  <span>Prompt detalhado</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  "Explica a um aluno do 6.º ano como funciona a gravidade na Lua em 3 tópicos simples."
                </p>
              </div>
            </div>

            <TopicIllustrationCard topicId="w5-t3" />
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  🎮 2. Experimenta: Prompt Simulator Progressivo (4 Níveis)
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Aprende a formular instruções precisas
              </span>
            </div>

            <div className="space-y-5">
              {promptLevels.map((lvl) => {
                const chosen = promptChoices[lvl.level];
                const selectedOpt = lvl.options.find((o) => o.id === chosen);

                return (
                  <div
                    key={lvl.level}
                    className={`p-5 rounded-2xl border transition-all ${
                      promptValidated
                        ? selectedOpt?.isCorrect
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-rose-50/70 border-rose-300'
                        : 'bg-slate-50 border-slate-200'
                    } space-y-3`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-700 uppercase tracking-wider">
                        {lvl.title}
                      </span>
                      {promptValidated && (
                        <span>
                          {selectedOpt?.isCorrect ? (
                            <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Correto (+25 pts)</span>
                          ) : (
                            <span className="text-xs font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">Incorreto</span>
                          )}
                        </span>
                      )}
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800">
                      {lvl.goal}
                      {lvl.question && (
                        <p className="mt-1 text-slate-600 font-bold">{lvl.question}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      {lvl.options.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setPromptChoices((prev) => ({ ...prev, [lvl.level]: opt.id }))}
                          className={`w-full p-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all border text-left flex items-center justify-between gap-3 ${
                            chosen === opt.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{opt.text}</span>
                          {chosen === opt.id && <span className="shrink-0 font-black">✓</span>}
                        </button>
                      ))}
                    </div>

                    {promptValidated && selectedOpt && (
                      <p className="text-xs text-slate-700 italic pt-1 border-t border-slate-200">
                        💡 {selectedOpt.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500 font-bold">
                {Object.keys(promptChoices).length} de {promptLevels.length} níveis completados
              </span>
              <button
                onClick={handleValidatePromptLevel}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Validar Níveis do Prompt Simulator
              </button>
            </div>

            {promptScore !== null && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 font-medium">
                Pontuação do Prompt Simulator: <strong>{promptScore}/100</strong>. Excelente! Um bom prompt não precisa de ser longo: deve ser claro, indicar o tema, o objetivo e os detalhes importantes para obteres uma resposta útil.
              </div>
            )}
          </div>

          {/* ⭐ 3. O QUE APRENDESTE? */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-black text-sm uppercase tracking-wide">
              <Star className="w-5 h-5 text-emerald-600" />
              <span>⭐ O que aprendeste nesta missão?</span>
            </div>
            <ul className="text-xs sm:text-sm text-emerald-950 font-medium space-y-1.5 list-disc pl-5">
              <li>Um bom prompt inclui quem és, o objetivo concreto e o formato de resposta desejado.</li>
              <li>Instruções detalhadas poupam tempo e geram respostas muito mais úteis.</li>
            </ul>
          </div>

          {/* 👉 Próxima Missão */}
          <div className="bg-slate-100 border border-slate-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black text-indigo-600 uppercase tracking-wider block">
                Missão cumprida?
              </span>
              <p className="text-sm font-bold text-slate-800">
                Avança para a Missão 4 e descobre como detetar alucinações e erros da IA!
              </p>
            </div>
            <button
              onClick={() => onNavigateTopic('w5-t4')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
            >
              <span>👉 Próxima Missão: A IA pode enganar-se</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MISSÃO 4: A IA PODE ENGANAR-SE */}
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
                  🎯 MISSÃO 4/6
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Cuidado! A IA Alucina e Inventa Coisas 🔎
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Aprende o que são alucinações e por que nunca deves confiar cegamente em respostas bonitas.
                </p>
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

          {/* 💡 1. APRENDE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 text-indigo-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                💡 1. Aprende: O Que São Alucinações da IA?
              </h4>
            </div>

            <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed font-normal">
              Chamamos <strong>"alucinação"</strong> quando a IA inventa factos falsos ou fontes inexistentes com um tom tão confiante que parece a maior verdade do mundo!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-1.5">
                <div className="flex items-center gap-2 text-rose-700 font-black text-xs uppercase tracking-wide">
                  <span>⚠️</span>
                  <span>O perigo do tom seguro</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  A IA pode inventar datas de batalhas, livros falsos e cientistas inexistentes sem hesitar.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase tracking-wide">
                  <span>🕵️</span>
                  <span>O teu papel de detetive</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Nunca copies respostas de IA para trabalhos de casa sem confirmar factos em livros ou fontes oficiais.
                </p>
              </div>
            </div>

            <TopicIllustrationCard topicId="w5-t4" />
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  🎮 2. Experimenta: Hallucination & Evidence Simulator (6 Afirmações)
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Classifica a veracidade e fontes de cada resposta
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Analisa estas 6 respostas produzidas por IA e classifica se são factos verídicos, afirmações sem fonte, fontes inventadas ou alucinações anacrónicas:
            </p>

            <div className="space-y-4">
              {hallucinationStatements.map((st, idx) => {
                const choice = hallucinationChoices[st.id];
                const isCorrect = choice === st.correct;

                return (
                  <div
                    key={st.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      hallucinationValidated
                        ? isCorrect
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-rose-50/70 border-rose-300'
                        : 'bg-slate-50 border-slate-200'
                    } space-y-3`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        <span className="text-indigo-600 mr-1.5">#{idx + 1}</span> "{st.text}"
                      </p>
                      {hallucinationValidated && (
                        <span className="shrink-0">
                          {isCorrect ? (
                            <Check className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <X className="w-5 h-5 text-rose-600" />
                          )}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      <button
                        onClick={() => setHallucinationChoices((prev) => ({ ...prev, [st.id]: 'veridico' }))}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-left ${
                          choice === 'veridico'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        ✓ Facto verídico
                      </button>

                      <button
                        onClick={() => setHallucinationChoices((prev) => ({ ...prev, [st.id]: 'alucinacao' }))}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-left ${
                          choice === 'alucinacao'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        ⚠️ Alucinação / Erro
                      </button>

                      <button
                        onClick={() => setHallucinationChoices((prev) => ({ ...prev, [st.id]: 'fonte_inexistente' }))}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-left ${
                          choice === 'fonte_inexistente'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        📚 Fonte inexistente
                      </button>

                      <button
                        onClick={() => setHallucinationChoices((prev) => ({ ...prev, [st.id]: 'sem_fonte' }))}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-left ${
                          choice === 'sem_fonte'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        🔍 Sem fonte / Duvidoso
                      </button>
                    </div>

                    {hallucinationValidated && (
                      <p className="text-[11px] text-slate-600 italic pt-1 border-t border-slate-200">
                        💡 {st.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500 font-bold">
                {Object.keys(hallucinationChoices).length} de {hallucinationStatements.length} avaliadas
              </span>
              <button
                onClick={handleValidateHallucination}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Validar Avaliação de Alucinações
              </button>
            </div>

            {hallucinationScore !== null && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 font-medium">
                Pontuação do Simulador: <strong>{hallucinationScore}/100</strong>. Uma resposta persuasiva e bem articulada não é sinónimo de verdade!
              </div>
            )}
          </div>

          {/* ⭐ 3. O QUE APRENDESTE? */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-black text-sm uppercase tracking-wide">
              <Star className="w-5 h-5 text-emerald-600" />
              <span>⭐ O que aprendeste nesta missão?</span>
            </div>
            <ul className="text-xs sm:text-sm text-emerald-950 font-medium space-y-1.5 list-disc pl-5">
              <li>A IA pode inventar datas, citações e fontes com ar convincente (alucinações).</li>
              <li>Confiança no tom de resposta não é garantia de certeza: desconfia e confirma sempre.</li>
            </ul>
          </div>

          {/* 👉 Próxima Missão */}
          <div className="bg-slate-100 border border-slate-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black text-indigo-600 uppercase tracking-wider block">
                Missão cumprida?
              </span>
              <p className="text-sm font-bold text-slate-800">
                Avança para a Missão 5 e aprende a proteger os teus dados privados ao usar a IA!
              </p>
            </div>
            <button
              onClick={() => onNavigateTopic('w5-t5')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
            >
              <span>👉 Próxima Missão: Privacidade e IA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MISSÃO 5: PRIVACIDADE E IA */}
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
                  🎯 MISSÃO 5/6
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  O Cofre Secreto: Privacidade e IA 🔐
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Aprende a proteger as tuas informações pessoais ao utilizar ferramentas públicas de IA.
                </p>
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

          {/* 💡 1. APRENDE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 text-indigo-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                💡 1. Aprende: Proteção de Dados e IA Pública
              </h4>
            </div>

            <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed font-normal">
              Tudo o que escreves numa ferramenta pública de IA pode ser gravado e usado para treinar futuros modelos informáticos pelo mundo fora.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-1.5">
                <div className="flex items-center gap-2 text-rose-700 font-black text-xs uppercase tracking-wide">
                  <span>⛔</span>
                  <span>Nunca partilhes</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Palavras-passe, morada, telemóvel, dados familiares ou nomes completos de colegas.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-700 font-black text-xs uppercase tracking-wide">
                  <span>🛡️</span>
                  <span>Uso seguro</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Faz perguntas gerais sobre matérias escolares sem revelar detalhes da tua vida privada.
                </p>
              </div>
            </div>

            <TopicIllustrationCard topicId="w5-t5" />
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  🎮 2. Experimenta: Simulador de Privacidade e Dados (10 Itens)
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Classifica cada dado antes de enviar
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Classifica cada um dos 10 elementos entre <strong>"Sim, sem preocupação"</strong>, <strong>"Depende do contexto / devo verificar primeiro"</strong> ou <strong>"É melhor não partilhar"</strong>:
            </p>

            <div className="space-y-3">
              {privacyItems.map((item) => {
                const choice = privacyChoices[item.id];
                const isCorrect = choice === item.correct;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      privacyValidated
                        ? isCorrect
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-rose-50/70 border-rose-300'
                        : 'bg-slate-50 border-slate-200'
                    } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                  >
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">{item.hint}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => setPrivacyChoices((prev) => ({ ...prev, [item.id]: 'seguro' }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          choice === 'seguro'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        🟢 Sim, sem preocupação
                      </button>

                      <button
                        onClick={() => setPrivacyChoices((prev) => ({ ...prev, [item.id]: 'depende' }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          choice === 'depende'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        🟡 Depende / Verificar
                      </button>

                      <button
                        onClick={() => setPrivacyChoices((prev) => ({ ...prev, [item.id]: 'nao_partilhar' }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          choice === 'nao_partilhar'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        🔴 Não partilhar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500 font-bold">
                {Object.keys(privacyChoices).length} de {privacyItems.length} classificados
              </span>
              <button
                onClick={handleValidatePrivacy}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Validar Classificação de Privacidade (10 Itens)
              </button>
            </div>

            {privacyScore !== null && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 font-medium">
                Pontuação do Simulador de Privacidade: <strong>{privacyScore}/100</strong>. Proteger palavras-passe, moradas, contactos e dados de colegas é regra de ouro antes de interagir com qualquer assistente de IA!
              </div>
            )}
          </div>

          {/* ⭐ 3. O QUE APRENDESTE? */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-black text-sm uppercase tracking-wide">
              <Star className="w-5 h-5 text-emerald-600" />
              <span>⭐ O que aprendeste nesta missão?</span>
            </div>
            <ul className="text-xs sm:text-sm text-emerald-950 font-medium space-y-1.5 list-disc pl-5">
              <li>Ferramentas públicas podem guardar o que escreves para treinar modelos futuros.</li>
              <li>Mantém palavras-passe, contactos e segredos pessoais longe de qualquer assistente de IA.</li>
            </ul>
          </div>

          {/* 👉 Próxima Missão */}
          <div className="bg-slate-100 border border-slate-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black text-indigo-600 uppercase tracking-wider block">
                Missão cumprida?
              </span>
              <p className="text-sm font-bold text-slate-800">
                Avança para a Missão 6 e aprende a manter o teu cérebro no comando da tecnologia!
              </p>
            </div>
            <button
              onClick={() => onNavigateTopic('w5-t6')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
            >
              <span>👉 Próxima Missão: Pensar com a IA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MISSÃO 6: PENSAR COM A IA */}
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
                  🎯 MISSÃO 6/6
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  O Humano é Quem Manda! O Teu Cérebro é Único 🚀
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Usa a IA como aliada nos estudos sem perderes a tua própria capacidade crítica e autonomia.
                </p>
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

          {/* 💡 1. APRENDE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 text-indigo-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                💡 1. Aprende: A Tecnologia Ajuda, Tu Comandas
              </h4>
            </div>

            <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed font-normal">
              A IA é como uma bicicleta rápida: ajuda-te a avançar velozmente, mas és <strong>tu</strong> quem escolhe o rumo e trava quando necessário!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase tracking-wide">
                  <span>💡</span>
                  <span>A IA como assistente</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Serve para ter ideias, debater perspetivas e tirar dúvidas sobre tópicos difíceis.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-700 font-black text-xs uppercase tracking-wide">
                  <span>🧠</span>
                  <span>O teu cérebro no comando</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Revê, dá o teu toque pessoal e garante que compreendes tudo antes de partilhar ou entregar.
                </p>
              </div>
            </div>

            <TopicIllustrationCard topicId="w5-t6" />
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  🎮 2. Experimenta: Simulador de Recomendações e Autonomia (5 Situações)
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Diversifica fontes e mantém a tua autonomia
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Analisa as 5 situações sobre algoritmos de recomendação e decide como agir com autonomia e sentido crítico:
            </p>

            <div className="space-y-4">
              {recSituations.map((sit) => {
                const chosen = recChoices[sit.id];
                const selectedOpt = sit.options.find((o) => o.id === chosen);

                return (
                  <div
                    key={sit.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      recValidated
                        ? selectedOpt?.isCorrect
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-rose-50/70 border-rose-300'
                        : 'bg-slate-50 border-slate-200'
                    } space-y-3`}
                  >
                    <div>
                      <span className="text-xs font-black text-indigo-700 block mb-0.5">
                        {sit.title}
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-800">
                        {sit.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {sit.options.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setRecChoices((prev) => ({ ...prev, [sit.id]: opt.id }))}
                          className={`w-full p-3 rounded-xl text-xs font-bold transition-all border text-left flex items-center justify-between gap-2 ${
                            chosen === opt.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {chosen === opt.id && <span className="shrink-0 font-black">✓</span>}
                        </button>
                      ))}
                    </div>

                    {recValidated && (
                      <p className="text-[11px] text-slate-600 italic pt-1 border-t border-slate-200">
                        💡 {sit.feedback}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500 font-bold">
                {Object.keys(recChoices).length} de {recSituations.length} respondidas
              </span>
              <button
                onClick={handleValidateRec}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Validar Decisões de Autonomia (5 Casos)
              </button>
            </div>

            {recommendationScore !== null && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 font-medium">
                Pontuação: <strong>{recommendationScore}/100</strong>. Muito bem! As recomendações da IA podem ser úteis, mas devemos continuar a escolher com curiosidade e autonomia aquilo que queremos explorar.
              </div>
            )}
          </div>

          {/* ⭐ 3. O QUE APRENDESTE? */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-black text-sm uppercase tracking-wide">
              <Star className="w-5 h-5 text-emerald-600" />
              <span>⭐ O que aprendeste nesta missão?</span>
            </div>
            <ul className="text-xs sm:text-sm text-emerald-950 font-medium space-y-1.5 list-disc pl-5">
              <li>A tecnologia é uma ferramenta fantástica de apoio, mas a decisão final é sempre humana.</li>
              <li>Pensar pela própria cabeça e compreender o que apresentas é o maior super-poder de todos!</li>
            </ul>
          </div>

          {/* 👉 Conclusão / Avaliação */}
          <div className="bg-slate-100 border border-slate-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black text-indigo-600 uppercase tracking-wider block">
                Todas as missões concluídas! 🎉
              </span>
              <p className="text-sm font-bold text-slate-800">
                Estás pronto para demonstrar os teus conhecimentos na Avaliação Final do Mundo 5!
              </p>
            </div>
            <button
              onClick={() => onNavigateTopic('avaliacao')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
            >
              <span>👉 Ir para a Avaliação Final</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SEPARADOR 7: AVALIAÇÃO FINAL (10 PERGUNTAS) */}
      {/* ========================================================= */}
      {activeTopicId === 'avaliacao' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs max-w-3xl mx-auto space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-black text-indigo-600 uppercase tracking-wider block">
              🎯 DESAFIO FINAL • MUNDO 5
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Avaliação Final de 10 Perguntas 🏆
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
              Mostra que compreendes a Inteligência Artificial, formulas prompts eficazes e usas a tecnologia com ética e responsabilidade!
            </p>
          </div>

          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl max-w-md mx-auto text-xs text-indigo-950 font-semibold space-y-1">
            <p>🏆 Requisito de Conclusão da Missão TIC: Média global &gt; 70%</p>
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
              <span>Começar Avaliação Final (10 Perguntas)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
