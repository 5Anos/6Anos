import React, { useState } from 'react';
import {
  Key,
  Mail,
  ShieldCheck,
  Footprints,
  Heart,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Award,
  Sparkles,
  Zap,
  ShieldAlert,
  HelpCircle,
  Dice5,
  ThumbsUp,
  Eye,
  Lock,
  Smartphone,
  Check,
  Star,
  Flame,
  Gamepad2,
  Smile,
  Shield,
  PartyPopper,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { GuardianKidHero } from './WorldMascots';
import { StudyStackIllustration } from './DetectiveMascot';
import { WorldSummary } from '../types';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { PROGRESSION_CONFIG } from '../progressionConfig';
import { TopicIllustrationCard } from './TopicIllustrationCard';

interface World1ThematicViewProps {
  world: WorldSummary;
  activeTopicId: string;
  onNavigateTopic: (topicId: string) => void;
  onOpenAssessment: () => void;
  onRefreshWorld: () => Promise<void>;
}

export const World1ThematicView: React.FC<World1ThematicViewProps> = ({
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
  // 1. PASSWORD SIMULATOR STATE & GENERATOR
  // -------------------------------------------------------------
  const [pwdInput, setPwdInput] = useState('');
  const [hasTestedPwd, setHasTestedPwd] = useState(false);
  const [pwdScore, setPwdScore] = useState<number | null>(null);
  const [pwdFeedback, setPwdFeedback] = useState<{
    score: number;
    title: string;
    description: string;
    level: 'weak' | 'medium' | 'good' | 'legendary';
  } | null>(null);

  const crazyIdeas = [
    'Pizza_Ninja_Espacial_99!',
    'Gato+Com+Skate#2026',
    'Dinossauro_Azul_Comeu_7_Biscoitos!',
    'Astronauta_Com_Patins$88',
    'Super_Pinguim_Voador@42',
    'Gelado_De_Chocolate_Lendario#10',
  ];

  const handlePickCrazyIdea = () => {
    const random = crazyIdeas[Math.floor(Math.random() * crazyIdeas.length)];
    setPwdInput(random);
    setHasTestedPwd(false);
    setPwdFeedback(null);
  };

  // -------------------------------------------------------------
  // 2. PHISHING SIMULATOR STATE
  // -------------------------------------------------------------
  const [phishingStep, setPhishingStep] = useState(0);
  const [phishingScore, setPhishingScore] = useState<number | null>(null);
  const [phishingFeedback, setPhishingFeedback] = useState<{
    score: number;
    title: string;
    description: string;
  } | null>(null);
  const [phishingUserChoices, setPhishingUserChoices] = useState<Record<number, boolean>>({});

  const phishingScenarios = [
    {
      app: 'Roblox & Jogos Online',
      sender: 'suporte@notificacoes-plataforma-jog0s.com',
      avatar: '🎮',
      subject: '🎁 PARABÉNS! 10.000 Moedas / Robux Grátis para a tua conta!',
      body: 'Olá Campeão! A tua conta foi sorteada no evento anual! Para receberes imediatamente 10.000 moedas grátis no jogo, clica no link http://verificacao-conta-jog0s.com/login e introduz o teu nome de utilizador e a tua palavra-passe secreta em menos de 5 minutos!',
      isPhishing: true,
      signals: [
        'Promessa de moedas ou prémios grátis (bom demais para ser verdade!)',
        'Endereço suspeito com "0" (zero) em vez de "o" (@...jog0s.com)',
        'Pede a tua palavra-passe secreta num site desconhecido',
        'Cria pressa falsa ("em menos de 5 minutos") para não pensares com calma',
      ],
      explanation:
        '🚨 Cilada total de Phishing! Lembra-te: NUNCA nenhum jogo ou site oficial oferece moedas grátis em troca da tua palavra-passe. Os vigaristas usam nomes com letras trocadas (como "jog0s") para te enganar!',
    },
    {
      app: 'Escola & Biblioteca Digital',
      sender: 'direcao.turma@agrupamento-escolas.edu.pt',
      avatar: '🏫',
      subject: '📚 O teu livro da Biblioteca Escolar está pronto',
      body: 'Olá! O livro que requisitaste na biblioteca da escola já está disponível. Podes passar na sala de leitura durante o intervalo da manhã para o levantar. Não precisas de responder a este email nem fornecer dados.',
      isPhishing: false,
      signals: [
        'Vem do email oficial da escola (.edu.pt)',
        'Não pede senhas, códigos, cartões nem dados pessoais',
        'Apenas dá uma informação real da vida na escola',
      ],
      explanation:
        '✅ Mensagem Segura e Real! Esta mensagem não pede dados confidenciais, não tem links manhosos nem te mete medo. Mesmo assim, se um dia tiveres dúvidas sobre um email da escola, pergunta diretamente à tua professora!',
    },
    {
      app: 'Alerta de Cibersegurança',
      sender: 'alerta-seguranca@cloud-documentos-storage.net',
      avatar: '⚠️',
      subject: '🚨 URGENTE: A tua conta foi suspensa por suspeita de intrusão!',
      body: 'A tua conta de trabalhos escolares vai ser eliminada para sempre dentro de 10 minutos! Clica imediatamente em http://cloud-documentos-storage.net/recuperar-passe e introduz a tua palavra-passe escolar e o teu número de telemóvel para a desbloquear.',
      isPhishing: true,
      signals: [
        'Mete medo e inventa um prazo de 10 minutos para te assustar',
        'Domínio estranho que não tem nada a ver com a tua escola',
        'Pede a tua palavra-passe escolar e telemóvel num formulário externo',
      ],
      explanation:
        '🚨 É uma Cilada das grandes! Os atacantes adoram assustar os alunos com avisos vermelhos a dizer que a conta vai ser apagada. Mantém a calma: a escola nunca te pede para meter a tua senha num link desconhecido!',
    },
  ];

  // -------------------------------------------------------------
  // 3. PRIVACY SIMULATOR STATE
  // -------------------------------------------------------------
  const [privacyChoices, setPrivacyChoices] = useState<Record<string, 'public' | 'private' | 'context'>>({});
  const [privacyScore, setPrivacyScore] = useState<number | null>(null);
  const [privacyFeedback, setPrivacyFeedback] = useState<{
    score: number;
    title: string;
    description: string;
  } | null>(null);

  const privacyItems: {
    id: string;
    label: string;
    emoji: string;
    hint: string;
    correct: 'public' | 'private' | 'context';
    explanation: string;
  }[] = [
    {
      id: 'item-phone',
      label: 'O teu número de telemóvel pessoal',
      emoji: '📱',
      hint: 'Permite que qualquer pessoa te ligue ou envie mensagens',
      correct: 'private',
      explanation:
        '🔒 Super Secreto! O teu número de telemóvel é um dado pessoal confidencial. Se estiver público na net, podes receber chamadas de estranhos, burlas e mensagens chatas.',
    },
    {
      id: 'item-hobby',
      label: 'O teu desporto, livro ou jogo de tabuleiro preferido',
      emoji: '⚽',
      hint: 'Gostos e interesses divertidos',
      correct: 'public',
      explanation:
        '🌍 Livre para Partilhar! Dizer que adoras futebol, ler banda desenhada ou jogar xadrez é seguro e ajuda-te a fazer amigos com gostos parecidos!',
    },
    {
      id: 'item-address',
      label: 'A morada completa da tua casa (rua e número da porta)',
      emoji: '🏠',
      hint: 'O local onde moras com a tua família',
      correct: 'private',
      explanation:
        '🔒 Super Secreto! Nunca digas a tua morada na net. Ela indica onde vives e deve ser guardada a sete chaves para proteger a tua segurança no mundo real.',
    },
    {
      id: 'item-photo-friends',
      label: 'Fotografia com colegas da turma a brincar no recreio',
      emoji: '📸',
      hint: 'Aparecem caras de outros colegas da escola',
      correct: 'context',
      explanation:
        '🤔 Pára e Pensa! As fotos com amigos precisam de autorização de todos os que aparecem nela. Pergunta sempre: "Posso partilhar esta foto?". Se alguém disser que não, respeita!',
    },
    {
      id: 'item-school-routine',
      label: 'O percurso exato e as horas em que voltas sozinho da escola para casa',
      emoji: '🚶‍♂️',
      hint: 'Horários e caminhos que fazes a pé',
      correct: 'private',
      explanation:
        '🔒 Super Secreto! Dizer a que horas sais e que ruas percorres sozinho expõe os teus passos no mundo real a qualquer pessoa estranha.',
    },
    {
      id: 'item-school-project',
      label: 'Um desenho, banda desenhada ou projeto criado por ti na aula de TIC',
      emoji: '🎨',
      hint: 'Trabalho de criatividade escolar feito por ti',
      correct: 'public',
      explanation:
        '🌍 Livre para Partilhar! Trabalhos criativos da escola sem dados pessoais são excelentes para mostrar o teu talento à comunidade escolar!',
    },
  ];

  // -------------------------------------------------------------
  // 4. DIGITAL FOOTPRINT SIMULATOR STATE
  // -------------------------------------------------------------
  const [footprintChoices, setFootprintChoices] = useState<Record<string, 'positivo' | 'moderado' | 'alto'>>({});
  const [footprintScore, setFootprintScore] = useState<number | null>(null);
  const [footprintFeedback, setFootprintFeedback] = useState<{
    score: number;
    title: string;
    description: string;
  } | null>(null);

  const footprintScenarios: {
    id: string;
    emoji: string;
    title: string;
    description: string;
    correct: 'positivo' | 'moderado' | 'alto';
    riskLevelText: string;
    explanation: string;
  }[] = [
    {
      id: 'fp-1',
      emoji: '📍',
      title: 'Vídeo em direto no recreio com o símbolo da escola e GPS ativado',
      description:
        'Fazer uma transmissão em direto no TikTok/Instagram no pátio da escola, mostrando as caras dos colegas e com a localização exata do GPS ligada.',
      correct: 'alto',
      riskLevelText: 'Alto Perigo / Risco Grave',
      explanation:
        '🚨 Alto Risco! Revela onde estás em tempo real a qualquer pessoa na Internet e expõe os teus colegas sem autorização. Deixa uma pegada perigosa!',
    },
    {
      id: 'fp-2',
      emoji: '🚗',
      title: 'Foto bonita de família onde se vê a matrícula do carro ao fundo',
      description:
        'Partilhar uma fotografia das férias à porta de casa onde, no fundo da imagem, dá para ler a matrícula do carro dos teus pais e a placa com o nome da rua.',
      correct: 'moderado',
      riskLevelText: 'Atenção ao Detalhe (Risco Moderado)',
      explanation:
        '⚠️ Risco Moderado! A foto é querida, mas os detalhes ao fundo revelam a matrícula e a morada. Dica de Guardião: Corta a foto ou tapa a matrícula antes de publicar!',
    },
    {
      id: 'fp-3',
      emoji: '🌟',
      title: 'Artigo no jornal da escola com dicas de segurança para os colegas',
      description:
        'Escrever um texto super fixe no blogue da turma a ensinar truques para criar senhas fortes e combater o cyberbullying, assinado com o teu primeiro nome.',
      correct: 'positivo',
      riskLevelText: 'Pegada de Herói / Super Positivo',
      explanation:
        '✨ Pegada Brilhante! Demonstra bondade, inteligência digital e ajuda os teus colegas. Quando fores mais velho, esta pegada vai mostrar que és um cidadão de ouro!',
    },
    {
      id: 'fp-4',
      emoji: '💬',
      title: 'Comentário simpático a elogiar a apresentação de um colega',
      description:
        'Deixar um comentário encorajador num vídeo de um trabalho escolar, dizendo: "Muitos parabéns pelo projeto, ficou espetacular e muito criativo!".',
      correct: 'positivo',
      riskLevelText: 'Pegada de Herói / Super Positivo',
      explanation:
        '✨ Pegada Brilhante! Espalhar energia positiva e respeito na Internet faz com que a rede seja um lugar mais seguro e feliz para todos nós!',
    },
  ];

  // -------------------------------------------------------------
  // 5. DIGITAL WELLBEING SIMULATOR STATE
  // -------------------------------------------------------------
  const [wellbeingChoices, setWellbeingChoices] = useState<Record<string, 'saudavel' | 'risco'>>({});
  const [wellbeingScore, setWellbeingScore] = useState<number | null>(null);
  const [wellbeingFeedback, setWellbeingFeedback] = useState<{
    score: number;
    title: string;
    description: string;
  } | null>(null);

  const wellbeingHabits = [
    {
      id: 'wb-posture',
      emoji: '🚀',
      label: 'Postura de Astronauta: Costas direitas na cadeira, pés bem assentes no chão e ecrã ao nível dos olhos',
      category: 'Coluna & Postura',
      correct: 'saudavel',
      explanation:
        '🌟 Hábito de Campeão! As tuas costas e o teu pescoço agradecem. Evita dores e ficas com muito mais energia para jogar e estudar!',
    },
    {
      id: 'wb-lighting',
      emoji: '🦇',
      label: 'Modo Caverna: Usar o telemóvel ou tablet num quarto às escuras com o brilho no máximo',
      category: 'Luz & Visão',
      correct: 'risco',
      explanation:
        '⚠️ Hábito Prejudicial! Um ecrã a brilhar muito num quarto escuro cansa imenso os teus olhos e dá dores de cabeça. Acende uma luz suave!',
    },
    {
      id: 'wb-distance',
      emoji: '📏',
      label: 'Regra do Braço: Manter a distância de cerca de um braço esticado em relação ao ecrã',
      category: 'Distância dos Olhos',
      correct: 'saudavel',
      explanation:
        '🌟 Hábito de Campeão! Não encostes o nariz ao ecrã. A distância de um braço protege a tua visão!',
    },
    {
      id: 'wb-wrists',
      emoji: '🎮',
      label: 'Conforto Gamer: Apoiar os pulsos e braços relaxados na mesa ao escrever no teclado ou usar o rato',
      category: 'Mãos & Pulsos',
      correct: 'saudavel',
      explanation:
        '🌟 Hábito de Campeão! Evita que as mãos fiquem cansadas ou doridas depois de jogares ou fazeres trabalhos de TIC.',
    },
    {
      id: 'wb-202020',
      emoji: '👀',
      label: 'Regra dos 20-20-20: A cada 20 minutos, olhar 20 segundos pela janela para longe para relaxar a vista',
      category: 'Descanso dos Olhos',
      correct: 'saudavel',
      explanation:
        '🌟 Hábito de Campeão! Olhar para longe faz com que os músculos dos olhos descansem do brilho do ecrã!',
    },
    {
      id: 'wb-bed',
      emoji: '😴',
      label: 'Maratona na Cama: Ficar a ver vídeos no telemóvel debaixo dos lençóis até às 2 da manhã',
      category: 'Sono & Energia',
      correct: 'risco',
      explanation:
        '⚠️ Hábito Prejudicial! A luz azul do ecrã engana o cérebro e impede que durmas bem. No dia seguinte ficas sem energia e com sono na aula!',
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
          worldId: 1,
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

  // Evaluate Password
  const evaluatePassword = () => {
    let score = 0;
    const len = pwdInput.length;

    if (len === 0) {
      setHasTestedPwd(true);
      setPwdScore(0);
      setPwdFeedback({
        score: 0,
        title: 'Escreve uma palavra-passe de treino!',
        description: 'Digita uma ideia de palavra-passe na caixa acima ou clica no botão do dado 🎲 para veres ideias fixes.',
        level: 'weak',
      });
      return;
    }

    // 1. Comprimento
    if (len >= 12) score += 40;
    else if (len >= 10) score += 35;
    else if (len >= 8) score += 25;
    else if (len >= 6) score += 15;
    else score += 5;

    // 2. Imprevisibilidade
    const lower = pwdInput.toLowerCase();
    const predictableWalks = ['123', '234', '345', '456', '789', 'abc', 'bcd', 'cde', 'qwerty', 'asdf', 'zxcv', 'aaaa', '1111', '0000'];
    const hasPredictableWalk = predictableWalks.some((walk) => lower.includes(walk));
    if (!hasPredictableWalk && len >= 8) {
      score += 30;
    }

    // 3. Sem dados pessoais óbvios
    const personalKeywords = ['escola', 'aluno', 'alex', 'turma', 'portugal', 'porto', 'lisboa', 'benfica', 'sporting', '2024', '2025', '2026', '2014', '2013', '2012', '2011', 'password', 'passe', 'admin'];
    const hasPersonalData = personalKeywords.some((kw) => lower.includes(kw));
    if (!hasPersonalData && len >= 8) {
      score += 20;
    }

    // 4. Mistura de caracteres
    let varietyCount = 0;
    if (/[a-z]/.test(pwdInput)) varietyCount++;
    if (/[A-Z]/.test(pwdInput)) varietyCount++;
    if (/[0-9]/.test(pwdInput)) varietyCount++;
    if (/[^A-Za-z0-9]/.test(pwdInput)) varietyCount++;

    if (varietyCount >= 3) score += 10;
    else if (varietyCount >= 2) score += 5;

    score = Math.min(100, Math.max(0, score));

    let title = 'Palavra-passe Vulnerável / Curta 😴';
    let description = 'Esta senha é muito curta ou tem padrões fáceis demais. Um robot hacker consegue adivinhá-la num segundo!';
    let level: 'weak' | 'medium' | 'good' | 'legendary' = 'weak';

    if (score >= 90) {
      title = 'Palavra-passe Lendária & Invencível! 🌟';
      description = 'Fantástico! Esta senha é comprida, criativa, mistura caracteres e não tem dados óbvios. Nenhum vilão cibernético a vai conseguir adivinhar!';
      level = 'legendary';
    } else if (score >= 75) {
      title = 'Escudo Forte! Muito Boa Proteção 🛡️';
      description = 'Muito bom trabalho! Para chegares aos 100 pontos de mestre, tenta que tenha 10 ou mais letras e inclui um símbolo especial como ! ou #.';
      level = 'good';
    } else if (score >= 50) {
      title = 'Em Treino: Está a ficar melhor! ⚡';
      description = 'Bom começo! Torna-a um bocadinho mais longa e inventa uma "frase maluca" para ficar mesmo difícil de quebrar.';
      level = 'medium';
    }

    setHasTestedPwd(true);
    setPwdScore(score);
    setPwdFeedback({ score, title, description, level });
    reportCompletion('sim-password', 'Laboratório de Palavras-Passe', { password: pwdInput }, score);
  };

  // Evaluate Phishing Decision
  const handlePhishingDecision = (chosenPhishing: boolean) => {
    const nextChoices = { ...phishingUserChoices, [phishingStep]: chosenPhishing };
    setPhishingUserChoices(nextChoices);

    const isCurrentCorrect = chosenPhishing === phishingScenarios[phishingStep].isPhishing;
    const currentScore = isCurrentCorrect ? 100 : 0;
    setPhishingScore(currentScore);
    setPhishingFeedback({
      score: currentScore,
      title: isCurrentCorrect ? '🎯 Boa Detetive! Acertaste em cheio!' : '⚠️ Cuidado com a Armadilha!',
      description: phishingScenarios[phishingStep].explanation,
    });

    let correctCount = 0;
    Object.entries(nextChoices).forEach(([stepStr, choice]) => {
      const stepIdx = parseInt(stepStr, 10);
      if (choice === phishingScenarios[stepIdx].isPhishing) {
        correctCount++;
      }
    });

    const totalScore = Math.round((correctCount / phishingScenarios.length) * 100);
    reportCompletion('sim-phishing', 'Laboratório de Phishing', { answers: nextChoices }, totalScore);
  };

  // Evaluate Privacy Choices
  const handlePrivacySubmit = () => {
    let correctCount = 0;
    privacyItems.forEach((item) => {
      if (privacyChoices[item.id] === item.correct) correctCount++;
    });
    const score = Math.round((correctCount / privacyItems.length) * 100);
    setPrivacyScore(score);

    let title = 'Classificação em Análise 🔍';
    let description =
      'Revê as tuas escolhas! Lembra-te: morada e telemóvel são super secretos, fotos com amigos exigem autorização e os teus desenhos podes partilhar à vontade!';
    if (score === 100) {
      title = '🏆 Guardião de Privacidade Nível Máximo!';
      description =
        'Parabéns! Sabes exatamente como proteger a tua identidade no mundo real e digital sem deixar de partilhar o que é fixe e seguro!';
    } else if (score >= 60) {
      title = '👍 Bom Sentido de Proteção!';
      description =
        'Conseguiste acertar na maioria! Tem atenção aos dados de localização e às fotos de colegas para seres um guardião completo!';
    }

    setPrivacyFeedback({ score, title, description });
    reportCompletion('sim-privacy', 'Laboratório de Privacidade', { answers: privacyChoices }, score);
  };

  // Evaluate Footprint Choices
  const handleFootprintSubmit = () => {
    let correctCount = 0;
    footprintScenarios.forEach((item) => {
      if (footprintChoices[item.id] === item.correct) correctCount++;
    });
    const score = Math.round((correctCount / footprintScenarios.length) * 100);
    setFootprintScore(score);

    let title = 'Análise do Rasto Digital 👣';
    let description = 'Lembra-te que tudo o que publicas constrói a tua reputação de herói na Internet.';
    if (score === 100) {
      title = '✨ Detetive de Pegadas Perfeito!';
      description =
        'Espetacular! Soubeste identificar os grandes perigos do GPS em direto, o cuidado com as matrículas e a beleza de espalhar palavras boas!';
    } else if (score >= 66) {
      title = '👍 Bom Discernimento Digital!';
      description = 'Muito bem! Fica atento aos pequenos detalhes no fundo das fotos para deixares sempre um rasto brilhante.';
    }

    setFootprintFeedback({ score, title, description });
    reportCompletion('sim-digital-footprint', 'Simulador de Pegada Digital', { answers: footprintChoices }, score);
  };

  // Evaluate Wellbeing Choices
  const handleWellbeingSubmit = () => {
    let correctCount = 0;
    wellbeingHabits.forEach((item) => {
      if (wellbeingChoices[item.id] === item.correct) correctCount++;
    });
    const score = Math.round((correctCount / wellbeingHabits.length) * 100);
    setWellbeingScore(score);

    let title = 'Índice de Saúde Gamer 🎮';
    let description = 'Um verdadeiro campeão digital precisa de cuidar do corpo, dos olhos e de um sono reparador!';
    if (score === 100) {
      title = '🚀 Mestre Gamer & Super-Corpo!';
      description =
        'Excelente! Postura de astronauta, pausas dos olhos e zero modo morcego na cama! Vais ter energia máxima para vencer todos os desafios!';
    } else if (score >= 60) {
      title = '👍 Bons Hábitos de Saúde!';
      description = 'Estás no bom caminho! Pratica a regra dos 20-20-20 e dorme cedo para manteres a tua energia no máximo!';
    }

    setWellbeingFeedback({ score, title, description });
    reportCompletion('sim-digital-wellbeing', 'Simulador de Bem-estar Digital', { answers: wellbeingChoices }, score);
  };

  // Helper to find simulator progress
  const getSimProg = (simId: string) => {
    return world.simulatorsProgress?.find((p) => p.id === simId);
  };

  return (
    <div className="space-y-6">
      {/* Global Completed Feedback Banner */}
      {completedFeedback && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950 shadow-md animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <PartyPopper className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 block">
                🎉 Missão Concluída: {completedFeedback.activityTitle}
              </span>
              <p className="text-sm font-extrabold text-slate-900">
                Pontuação: <span className="text-emerald-700">{completedFeedback.score}/100</span>
                {completedFeedback.xpGain > 0 && (
                  <span className="inline-flex items-center gap-1 bg-yellow-400 text-yellow-950 font-black px-2.5 py-0.5 rounded-full text-xs ml-2 shadow-xs">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    +{completedFeedback.xpGain} XP Ganho!
                  </span>
                )}
              </p>
            </div>
          </div>
          <span className="text-xs font-black bg-emerald-200/80 text-emerald-900 px-3.5 py-2 rounded-xl border border-emerald-300 self-start sm:self-auto">
            ⭐ Melhor Recorde: {completedFeedback.newBest}/100
          </span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🛡️ HERO BANNER GUARDIÃO DIGITAL (Pixar 3D Theme)          */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-b from-[#86efac] via-[#bbf7d0] to-[#ecfdf5] border border-[#6ee7b7] p-6 sm:p-8 lg:p-9 shadow-sm">
        {/* Soft background clouds and radial highlights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-emerald-200/40 rounded-full blur-2xl pointer-events-none" />

        {/* Top Breadcrumb & Route Progress */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2 text-xs font-black text-[#064e3b] tracking-wide uppercase">
            <span className="w-5 h-5 rounded-full bg-white text-emerald-600 flex items-center justify-center text-xs shadow-2xs">
              🌐
            </span>
            <span>MUNDO 1</span>
            <span className="text-emerald-600 font-bold">&gt;</span>
            <span>GUARDIÃO DIGITAL</span>
            <span className="text-base">🛡️</span>
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

        {/* Middle Hero: Headline, Subtitle, Guardian Mascot */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 my-6 relative z-10">
          <div className="max-w-xl space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-slate-950 tracking-tight leading-[1.12]">
              O Teu Escudo Digital:<br />
              Palavras-Passe Fortes, Zero Phishing<br />
              e Privacidade Total!
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed max-w-lg">
              A tua missão de guardião: proteger o teu castelo digital, desmascarar armadilhas e guardar segredos a 7 chaves! 🗝️
            </p>
          </div>
          <div className="shrink-0 flex justify-center lg:justify-end">
            <GuardianKidHero className="w-64 sm:w-72 lg:w-[350px] h-auto drop-shadow-md" />
          </div>
        </div>

        {/* 6 Mission Navigation Cards */}
        <div className="space-y-3 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Missão 1: Cofre das Senhas */}
            <button
              onClick={() => onNavigateTopic('w1-t1')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'w1-t1'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    activeTopicId === 'w1-t1' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  <Key className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className={`text-[10px] font-bold block ${activeTopicId === 'w1-t1' ? 'text-emerald-100' : 'text-slate-400'}`}>
                    Missão 1/6
                  </span>
                  <span className="text-xs sm:text-sm font-black truncate">Cofre das Senhas</span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 ${activeTopicId === 'w1-t1' ? 'text-white' : 'text-emerald-500'}`} />
            </button>

            {/* Missão 2: Caça ao Phishing */}
            <button
              onClick={() => onNavigateTopic('w1-t2')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'w1-t2'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    activeTopicId === 'w1-t2' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  <Mail className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className={`text-[10px] font-bold block ${activeTopicId === 'w1-t2' ? 'text-emerald-100' : 'text-slate-400'}`}>
                    Missão 2/6
                  </span>
                  <span className="text-xs sm:text-sm font-black truncate">Caça ao Phishing</span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 ${activeTopicId === 'w1-t2' ? 'text-white' : 'text-emerald-500'}`} />
            </button>

            {/* Missão 3: Escudo de Privacidade */}
            <button
              onClick={() => onNavigateTopic('w1-t3')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'w1-t3'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    activeTopicId === 'w1-t3' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className={`text-[10px] font-bold block ${activeTopicId === 'w1-t3' ? 'text-emerald-100' : 'text-slate-400'}`}>
                    Missão 3/6
                  </span>
                  <span className="text-xs sm:text-sm font-black truncate">Escudo de Privacidade</span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 ${activeTopicId === 'w1-t3' ? 'text-white' : 'text-emerald-500'}`} />
            </button>

            {/* Missão 4: Rasto Digital */}
            <button
              onClick={() => onNavigateTopic('w1-t4')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'w1-t4'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    activeTopicId === 'w1-t4' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                  }`}
                >
                  <Footprints className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className={`text-[10px] font-bold block ${activeTopicId === 'w1-t4' ? 'text-emerald-100' : 'text-slate-400'}`}>
                    Missão 4/6
                  </span>
                  <span className="text-xs sm:text-sm font-black truncate">Rasto Digital</span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 ${activeTopicId === 'w1-t4' ? 'text-white' : 'text-emerald-500'}`} />
            </button>

            {/* Missão 5: Super-Corpo */}
            <button
              onClick={() => onNavigateTopic('w1-t5')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'w1-t5'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    activeTopicId === 'w1-t5' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  <Heart className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className={`text-[10px] font-bold block ${activeTopicId === 'w1-t5' ? 'text-emerald-100' : 'text-slate-400'}`}>
                    Missão 5/6
                  </span>
                  <span className="text-xs sm:text-sm font-black truncate">Super-Corpo & Ecrãs</span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 ${activeTopicId === 'w1-t5' ? 'text-white' : 'text-emerald-500'}`} />
            </button>

            {/* Missão 6: Quiz do Guardião */}
            <button
              onClick={() => onNavigateTopic('avaliacao')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'avaliacao'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    activeTopicId === 'avaliacao' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  <Award className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className={`text-[10px] font-bold block ${activeTopicId === 'avaliacao' ? 'text-emerald-100' : 'text-slate-400'}`}>
                    Missão 6/6
                  </span>
                  <span className="text-xs sm:text-sm font-black truncate">Quiz do Guardião</span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 ${activeTopicId === 'avaliacao' ? 'text-white' : 'text-emerald-500'}`} />
            </button>
          </div>
        </div>
      </div>
      {activeTopicId === 'w1-t1' && (
        <div className="space-y-6">
          {/* Header da Missão */}
          <div className="bg-white border-2 border-blue-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Key className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-black text-blue-600 uppercase tracking-wider block">
                  🎯 MISSÃO 1/6
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  O Cofre das Palavras-Passe 🔐
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Hoje vais descobrir como criar uma palavra-passe mais segura.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-password')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-password')?.score} pts)</span>
                </span>
              ) : (
                <span className="bg-blue-100 text-blue-800 border border-blue-300 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1">
                  <Zap className="w-4 h-4 text-amber-500 fill-current" />
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
                💡 1. Aprende: O Segredo da Senha
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 space-y-1">
                <div className="text-xl">🗝️</div>
                <h5 className="text-xs font-black text-blue-900">A Chave do Castelo</h5>
                <p className="text-xs text-slate-600 leading-snug">
                  Protege as tuas contas de jogos e da escola contra pessoas não autorizadas.
                </p>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 space-y-1">
                <div className="text-xl">🧠</div>
                <h5 className="text-xs font-black text-amber-900">A Frase Maluca</h5>
                <p className="text-xs text-slate-600 leading-snug">
                  Junta palavras engraçadas e números: <em>"Gato_Ninja_Comeu_9_Pizzas!"</em>.
                </p>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 space-y-1">
                <div className="text-xl">🤫</div>
                <h5 className="text-xs font-black text-emerald-900">Segredo Pessoal</h5>
                <p className="text-xs text-slate-600 leading-snug">
                  A tua palavra-passe é pessoal. Não a partilhes com amigos nem colegas.
                </p>
              </div>
            </div>
          </div>

          {/* 🎮 SIMULADOR: O LABORATÓRIO DE PALAVRAS-PASSE */}
          <div className="bg-white border-2 border-blue-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2.5 text-blue-700">
                <Gamepad2 className="w-6 h-6 text-blue-600" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  Laboratório de Testes: Mede a Força da Tua Senha!
                </h4>
              </div>
              <button
                onClick={handlePickCrazyIdea}
                className="inline-flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-black px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Dice5 className="w-4 h-4 text-amber-600" />
                <span>🎲 Gerar Ideia Maluca</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  Escreve uma palavra-passe de TESTE (não uses a tua verdadeira!):
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={pwdInput}
                    onChange={(e) => {
                      setPwdInput(e.target.value);
                      setHasTestedPwd(false);
                      setPwdFeedback(null);
                    }}
                    placeholder="Experimenta ex.: Dinossauro_Azul#77"
                    className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm font-mono text-slate-900 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
                  />
                  <button
                    onClick={evaluatePassword}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-3.5 rounded-2xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-current text-yellow-300" />
                    <span>Testar Escudo</span>
                  </button>
                </div>
              </div>

              {/* BARRA DE ENERGIA GAMIFICADA */}
              {pwdScore !== null && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between items-center text-xs font-black">
                    <span className="text-slate-600">Nível de Proteção do Teu Escudo:</span>
                    <span className="text-blue-700 font-mono text-sm">{pwdScore}%</span>
                  </div>
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pwdScore >= 90
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-sm'
                          : pwdScore >= 70
                          ? 'bg-gradient-to-r from-blue-400 to-indigo-500'
                          : pwdScore >= 40
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.max(8, pwdScore)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* 4 ESCUDOS DE VALIDAÇÃO */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div
                  className={`p-3.5 rounded-2xl border-2 text-xs font-extrabold flex items-center gap-2.5 transition-all ${
                    pwdInput.length >= 10
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${pwdInput.length >= 10 ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>📏 10+ Letras (Comprida)</span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border-2 text-xs font-extrabold flex items-center gap-2.5 transition-all ${
                    pwdInput.length >= 8 &&
                    !['123', '234', '345', '456', '789', 'abc', 'bcd', 'qwerty', 'asdf', 'aaaa', '1111'].some((w) =>
                      pwdInput.toLowerCase().includes(w)
                    )
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      pwdInput.length >= 8 &&
                      !['123', '234', '345', '456', '789', 'abc', 'bcd', 'qwerty', 'asdf', 'aaaa', '1111'].some((w) =>
                        pwdInput.toLowerCase().includes(w)
                      )
                        ? 'text-emerald-600'
                        : 'text-slate-300'
                    }`}
                  />
                  <span>🎲 Sem 1234 / abc</span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border-2 text-xs font-extrabold flex items-center gap-2.5 transition-all ${
                    pwdInput.length >= 8 &&
                    !['escola', 'aluno', 'alex', 'turma', 'portugal', 'porto', 'lisboa', '2024', '2025', '2026', 'password', 'admin'].some(
                      (kw) => pwdInput.toLowerCase().includes(kw)
                    )
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      pwdInput.length >= 8 &&
                      !['escola', 'aluno', 'alex', 'turma', 'portugal', 'porto', 'lisboa', '2024', '2025', '2026', 'password', 'admin'].some(
                        (kw) => pwdInput.toLowerCase().includes(kw)
                      )
                        ? 'text-emerald-600'
                        : 'text-slate-300'
                    }`}
                  />
                  <span>🚫 Sem o Teu Nome</span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border-2 text-xs font-extrabold flex items-center gap-2.5 transition-all ${
                    (/[a-z]/.test(pwdInput) ? 1 : 0) +
                      (/[A-Z]/.test(pwdInput) ? 1 : 0) +
                      (/[0-9]/.test(pwdInput) ? 1 : 0) +
                      (/[^A-Za-z0-9]/.test(pwdInput) ? 1 : 0) >=
                    2
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      (/[a-z]/.test(pwdInput) ? 1 : 0) +
                        (/[A-Z]/.test(pwdInput) ? 1 : 0) +
                        (/[0-9]/.test(pwdInput) ? 1 : 0) +
                        (/[^A-Za-z0-9]/.test(pwdInput) ? 1 : 0) >=
                      2
                        ? 'text-emerald-600'
                        : 'text-slate-300'
                    }`}
                  />
                  <span>🔀 Mistura de Símbolos</span>
                </div>
              </div>

              {/* FEEDBACK AMIGÁVEL DO ROBO-MESTRE */}
              {pwdFeedback && (
                <div
                  className={`p-5 rounded-2xl border-2 text-xs space-y-2 ${
                    pwdFeedback.level === 'legendary' || pwdFeedback.level === 'good'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : pwdFeedback.level === 'medium'
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : 'bg-rose-50 border-rose-300 text-rose-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-black text-sm">{pwdFeedback.title}</h5>
                    <span className="font-mono font-black text-xs px-2.5 py-1 bg-white rounded-lg border border-current">
                      {pwdFeedback.score} / 100 Pts
                    </span>
                  </div>
                  <p className="leading-relaxed font-medium">
                    {pwdFeedback.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ⭐ 3. O QUE APRENDES NESTA MISSÃO? */}
          <div className="bg-gradient-to-r from-[#ecfdf5] via-[#f0fdf4] to-[#ecfdf5] border border-[#a7f3d0] rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm font-bold text-xl">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <StudyStackIllustration className="w-24 h-24 sm:w-28 sm:h-28" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 text-emerald-950 font-black text-xs sm:text-sm uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-emerald-600 fill-current" />
                <span>O QUE APRENDES NESTA MISSÃO?</span>
              </div>
              <div className="space-y-1.5 text-xs sm:text-sm text-slate-700 font-medium">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Uma senha forte é comprida (10+ caracteres) e usa a técnica da Frase Maluca.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>A tua palavra-passe é pessoal e secreta — protege as tuas contas e jogos.</span>
                </div>
              </div>
            </div>

            {/* White Pinned Notepad Checklist with Pencil */}
            <div className="relative bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2 min-w-[200px] shrink-0">
              <div className="space-y-1.5 text-[11px] font-black text-slate-800">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>SENHA COMPRIDA</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>FRASE MALUCA</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>ZERO PARTILHA</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>SUPER-ESCUDO</span>
                </div>
              </div>

              {/* Yellow Wooden Pencil */}
              <div className="absolute -bottom-2 -right-3 transform rotate-12">
                <div className="w-16 h-3 bg-yellow-400 border border-yellow-600 rounded-xs flex items-center shadow-xs">
                  <div className="w-3.5 h-full bg-red-500 rounded-l-xs" />
                  <div className="flex-1" />
                  <div className="w-3 h-full bg-stone-700 rounded-r-2xs" />
                </div>
              </div>
            </div>
          </div>

          {/* 👉 4. PRÓXIMA MISSÃO ACTION BAR */}
          <div className="bg-gradient-to-r from-[#f0fdf4] via-[#f5fbf7] to-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <Star className="w-7 h-7 text-amber-400 fill-amber-400 shrink-0 filter drop-shadow-xs" />
              <span className="text-xs sm:text-sm font-black text-emerald-950">
                Excelente! Agora vamos aprender a desmascarar armadilhas e phishing!
              </span>
            </div>
            <button
              onClick={() => onNavigateTopic('w1-t2')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 active:scale-95"
            >
              <span>Próxima Missão: 2. Caça ao Phishing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MISSÃO 2: PHISHING (CAÇA AOS TRUQUES E ISCOS) */}
      {/* ========================================================= */}
      {activeTopicId === 'w1-t2' && (
        <div className="space-y-6">
          {/* Header da Missão */}
          <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Mail className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-black text-amber-600 uppercase tracking-wider block">
                  🎯 MISSÃO 2/6
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Radar Anti-Phishing: Caça aos Iscos 🎣
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Hoje vais aprender a reconhecer mensagens falsas e armadilhas online.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-phishing')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-phishing')?.score} pts)</span>
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1">
                  <Zap className="w-4 h-4 text-amber-600 fill-current" />
                  <span>Recompensa: +100 XP</span>
                </span>
              )}
            </div>
          </div>

          {/* 💡 1. APRENDE */}
          <div className="bg-white border-2 border-amber-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-amber-800">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h4 className="text-sm font-black uppercase tracking-wide">
                💡 1. Aprende: Não Mordas o Isco!
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-1">
                <div className="text-xl">🎣</div>
                <h5 className="text-xs font-black text-amber-900">O Que É Phishing?</h5>
                <p className="text-xs text-slate-600 leading-snug">
                  Mensagens que prometem prémios grátis (ex: Robux) ou metem medo para te roubar a senha!
                </p>
              </div>

              <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3.5 space-y-1">
                <div className="text-xl">🛑</div>
                <h5 className="text-xs font-black text-rose-900">Regra do Detetive</h5>
                <p className="text-xs text-slate-600 leading-snug">
                  Se parece bom demais para ser verdade, é cilada! Pára e pergunta a um professor ou aos teus pais.
                </p>
              </div>
            </div>
          </div>

          {/* 🎮 SIMULADOR: RADAR DE PHISHING EM FORMATO SMARTPHONE / NOTIFICAÇÃO */}
          <div className="bg-white border-2 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-amber-800">
                <Smartphone className="w-6 h-6 text-amber-600" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  Laboratório Detetive: É Seguro ou É Cilada?
                </h4>
              </div>
              <span className="text-xs font-black px-3 py-1 bg-amber-100 text-amber-800 rounded-xl">
                Cenário {phishingStep + 1} de {phishingScenarios.length}
              </span>
            </div>

            {/* MOCK DE MENSAGEM RECEBIDA */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-xl shadow-xs border border-slate-200">
                    {phishingScenarios[phishingStep].avatar}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      {phishingScenarios[phishingStep].app}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {phishingScenarios[phishingStep].sender}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-black text-slate-900 mb-1.5">
                  {phishingScenarios[phishingStep].subject}
                </h5>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal bg-white p-4 rounded-2xl border border-slate-200/80">
                  {phishingScenarios[phishingStep].body}
                </p>
              </div>
            </div>

            {/* BOTÕES DE DECISÃO GRANDES E DIVERTIDOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handlePhishingDecision(true)}
                className="bg-rose-500 hover:bg-rose-600 text-white font-black text-xs sm:text-sm py-4 px-6 rounded-2xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <AlertTriangle className="w-5 h-5 text-yellow-200" />
                <span>🚨 É UMA CILADA! (Phishing)</span>
              </button>

              <button
                onClick={() => handlePhishingDecision(false)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm py-4 px-6 rounded-2xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                <span>✅ É MENSAGEM SEGURA!</span>
              </button>
            </div>

            {/* FEEDBACK DO DETETIVE */}
            {phishingFeedback && (
              <div
                className={`p-5 rounded-3xl border-2 text-xs space-y-3 ${
                  phishingFeedback.score === 100
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-black text-sm">{phishingFeedback.title}</h5>
                  <span className="font-mono font-black text-xs px-3 py-1 bg-white rounded-xl border border-current">
                    {phishingFeedback.score === 100 ? '+100 Pontos!' : 'Tenta novamente!'}
                  </span>
                </div>
                <p className="leading-relaxed font-medium">
                  {phishingFeedback.description}
                </p>

                {phishingStep < phishingScenarios.length - 1 && (
                  <button
                    onClick={() => {
                      setPhishingStep((p) => p + 1);
                      setPhishingScore(null);
                      setPhishingFeedback(null);
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 mt-2 shadow-xs cursor-pointer"
                  >
                    <span>Próximo Cenário ({phishingStep + 2}/{phishingScenarios.length})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ⭐ 3. O QUE APRENDESTE? */}
          <div className="bg-amber-50/80 border-2 border-amber-200 rounded-3xl p-5 space-y-2">
            <h5 className="text-xs font-black uppercase text-amber-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>⭐ O que aprendeste nesta missão?</span>
            </h5>
            <ul className="text-xs text-slate-700 space-y-1 font-medium list-disc list-inside">
              <li>Mensagens com ofertas milagrosas ou urgência são tentativas de phishing.</li>
              <li>Nunca cliques em links estranhos nem introduzas a tua palavra-passe em sites desconhecidos.</li>
            </ul>
          </div>

          {/* 👉 4. PRÓXIMA MISSÃO */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span>Agora sabes detetar armadilhas! Vamos proteger os teus dados pessoais?</span>
            </div>
            <button
              onClick={() => onNavigateTopic('w1-t3')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>👉 Próxima Missão: 3. O Escudo de Privacidade</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MISSÃO 3: DADOS PESSOAIS & PRIVACIDADE */}
      {/* ========================================================= */}
      {activeTopicId === 'w1-t3' && (
        <div className="space-y-6">
          {/* Header da Missão */}
          <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-black text-emerald-600 uppercase tracking-wider block">
                  🎯 MISSÃO 3/6
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  O Escudo de Privacidade 🛡️
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Hoje vais descobrir o que guardar a sete chaves no teu cofre pessoal.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-privacy')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-privacy')?.score} pts)</span>
                </span>
              ) : (
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1">
                  <Zap className="w-4 h-4 text-amber-500 fill-current" />
                  <span>Recompensa: +100 XP</span>
                </span>
              )}
            </div>
          </div>

          {/* 💡 1. APRENDE */}
          <div className="bg-white border-2 border-emerald-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-emerald-800">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <h4 className="text-sm font-black uppercase tracking-wide">
                💡 1. Aprende: O Teu Cofre Pessoal
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 space-y-1">
                <div className="text-xl">🔒</div>
                <h5 className="text-xs font-black text-emerald-900">Super Secreto</h5>
                <p className="text-xs text-slate-600 leading-snug">
                  Morada, telemóvel e escola devem ficar sempre guardados a sete chaves!
                </p>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-1">
                <div className="text-xl">🤔</div>
                <h5 className="text-xs font-black text-amber-900">Pede Autorização</h5>
                <p className="text-xs text-slate-600 leading-snug">
                  Fotos com colegas exigem sempre que lhes perguntes primeiro se podes partilhar.
                </p>
              </div>
            </div>
          </div>

          {/* 🎮 SIMULADOR: CLASSIFICADOR DE PRIVACIDADE */}
          <div className="bg-white border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-emerald-800">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  Classifica as Informações: Onde Pertence Cada Dado?
                </h4>
              </div>
            </div>

            <div className="space-y-3.5">
              {privacyItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 p-4 sm:p-5 rounded-2xl border-2 border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.emoji}</span>
                      <span className="text-xs sm:text-sm font-black text-slate-900">
                        {item.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium pl-7">{item.hint}</p>
                    {privacyChoices[item.id] && (
                      <p className="text-[11px] text-emerald-900 font-semibold italic mt-1.5 pl-7 bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                        {item.explanation}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0 pl-7 md:pl-0">
                    <button
                      onClick={() =>
                        setPrivacyChoices((prev) => ({ ...prev, [item.id]: 'public' }))
                      }
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        privacyChoices[item.id] === 'public'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      🌍 Livre / Público
                    </button>
                    <button
                      onClick={() =>
                        setPrivacyChoices((prev) => ({ ...prev, [item.id]: 'context' }))
                      }
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        privacyChoices[item.id] === 'context'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      🤔 Pedir Autorização
                    </button>
                    <button
                      onClick={() =>
                        setPrivacyChoices((prev) => ({ ...prev, [item.id]: 'private' }))
                      }
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        privacyChoices[item.id] === 'private'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      🔒 Super Secreto
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handlePrivacySubmit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-7 py-3.5 rounded-2xl shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current text-yellow-300" />
                <span>Avaliar as Minhas Escolhas de Privacidade</span>
              </button>
            </div>

            {privacyFeedback && (
              <div
                className={`p-5 rounded-3xl border-2 text-xs space-y-2 ${
                  privacyFeedback.score > PROGRESSION_CONFIG.PASSING_THRESHOLD
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-black text-sm">{privacyFeedback.title}</h5>
                  <span className="font-mono font-black text-xs px-3 py-1 bg-white rounded-xl border border-current">
                    {privacyFeedback.score} / 100 Pts
                  </span>
                </div>
                <p className="leading-relaxed font-medium">
                  {privacyFeedback.description}
                </p>
              </div>
            )}
          </div>

          {/* ⭐ 3. O QUE APRENDESTE? */}
          <div className="bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl p-5 space-y-2">
            <h5 className="text-xs font-black uppercase text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>⭐ O que aprendeste nesta missão?</span>
            </h5>
            <ul className="text-xs text-slate-700 space-y-1 font-medium list-disc list-inside">
              <li>Dados como morada e telemóvel são privados e nunca se partilham com desconhecidos.</li>
              <li>Pede sempre licença antes de partilhar fotos ou informações de outras pessoas.</li>
            </ul>
          </div>

          {/* 👉 4. PRÓXIMA MISSÃO */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span>Excelente! Agora vamos descobrir o rasto que deixamos no ciberespaço.</span>
            </div>
            <button
              onClick={() => onNavigateTopic('w1-t4')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>👉 Próxima Missão: 4. O Rasto Digital</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MISSÃO 4: PEGADA DIGITAL & CIDADANIA */}
      {/* ========================================================= */}
      {activeTopicId === 'w1-t4' && (
        <div className="space-y-6">
          {/* Header da Missão */}
          <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Footprints className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-black text-indigo-600 uppercase tracking-wider block">
                  🎯 MISSÃO 4/6
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  O Rasto Digital 👣
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Hoje vais descobrir que marcas deixas quando navegas na Internet.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-digital-footprint')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-digital-footprint')?.score} pts)</span>
                </span>
              ) : (
                <span className="bg-indigo-100 text-indigo-800 border border-indigo-300 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1">
                  <Zap className="w-4 h-4 text-amber-500 fill-current" />
                  <span>Recompensa: +100 XP</span>
                </span>
              )}
            </div>
          </div>

          {/* 💡 1. APRENDE */}
          <div className="bg-white border-2 border-indigo-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-indigo-800">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <h4 className="text-sm font-black uppercase tracking-wide">
                💡 1. Aprende: Pensa Antes de Publicar!
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3.5 space-y-1">
                <div className="text-xl">👣</div>
                <h5 className="text-xs font-black text-indigo-900">O Teu Rasto</h5>
                <p className="text-xs text-slate-600 leading-snug">
                  Mesmo quando apagas algo, alguém pode já ter guardado uma cópia ou feito uma captura de ecrã. Por isso, pensa antes de publicar!
                </p>
              </div>

              <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3.5 space-y-1">
                <div className="text-xl">🤝</div>
                <h5 className="text-xs font-black text-purple-900">Respeito Online</h5>
                <p className="text-xs text-slate-600 leading-snug">
                  Sê simpático, ajuda os teus colegas e nunca participes em brincadeiras de mau gosto ou cyberbullying.
                </p>
              </div>
            </div>
          </div>

          {/* 🎮 SIMULADOR: AVALIADOR DE PEGADA DIGITAL */}
          <div className="bg-white border-2 border-indigo-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-indigo-800">
                <Footprints className="w-6 h-6 text-indigo-600" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  Simulador de Pegada: Qual é o Impacto Desta Publicação?
                </h4>
              </div>
            </div>

            <div className="space-y-4">
              {footprintScenarios.map((scen) => (
                <div
                  key={scen.id}
                  className="p-4 sm:p-5 rounded-2xl border-2 border-slate-100 bg-slate-50/70 space-y-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{scen.emoji}</span>
                      <h5 className="text-xs sm:text-sm font-black text-slate-900">{scen.title}</h5>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() =>
                          setFootprintChoices((prev) => ({ ...prev, [scen.id]: 'positivo' }))
                        }
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          footprintChoices[scen.id] === 'positivo'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        ✨ Pegada de Herói (Fixe)
                      </button>
                      <button
                        onClick={() =>
                          setFootprintChoices((prev) => ({ ...prev, [scen.id]: 'moderado' }))
                        }
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          footprintChoices[scen.id] === 'moderado'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        ⚠️ Atenção / Cuidado
                      </button>
                      <button
                        onClick={() =>
                          setFootprintChoices((prev) => ({ ...prev, [scen.id]: 'alto' }))
                        }
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          footprintChoices[scen.id] === 'alto'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        🚨 Alto Perigo
                      </button>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal pl-8">
                    {scen.description}
                  </p>
                  {footprintChoices[scen.id] && (
                    <p className="text-[11px] text-indigo-950 font-semibold italic pl-8 pt-1">
                      💡 {scen.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleFootprintSubmit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-7 py-3.5 rounded-2xl shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current text-yellow-300" />
                <span>Avaliar a Minha Pegada Digital</span>
              </button>
            </div>

            {footprintFeedback && (
              <div
                className={`p-5 rounded-3xl border-2 text-xs space-y-2 ${
                  footprintFeedback.score > PROGRESSION_CONFIG.PASSING_THRESHOLD
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-black text-sm">{footprintFeedback.title}</h5>
                  <span className="font-mono font-black text-xs px-3 py-1 bg-white rounded-xl border border-current">
                    {footprintFeedback.score} / 100 Pts
                  </span>
                </div>
                <p className="leading-relaxed font-medium">
                  {footprintFeedback.description}
                </p>
              </div>
            )}
          </div>

          {/* ⭐ 3. O QUE APRENDESTE? */}
          <div className="bg-indigo-50/80 border-2 border-indigo-200 rounded-3xl p-5 space-y-2">
            <h5 className="text-xs font-black uppercase text-indigo-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>⭐ O que aprendeste nesta missão?</span>
            </h5>
            <ul className="text-xs text-slate-700 space-y-1 font-medium list-disc list-inside">
              <li>Mesmo ao apagar, alguém pode tirar screenshot. Pensa antes de publicar!</li>
              <li>Usa a internet para apoiar e respeitar os teus colegas de turma.</li>
            </ul>
          </div>

          {/* 👉 4. PRÓXIMA MISSÃO */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span>Fantástico! Falta apenas o treino de Super-Corpo e Bem-Estar!</span>
            </div>
            <button
              onClick={() => onNavigateTopic('w1-t5')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>👉 Próxima Missão: 5. Super-Corpo & Bem-Estar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MISSÃO 5: SUPER-CORPO & BEM-ESTAR GAMER */}
      {/* ========================================================= */}
      {activeTopicId === 'w1-t5' && (
        <div className="space-y-6">
          {/* Header da Missão */}
          <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Heart className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-black text-rose-600 uppercase tracking-wider block">
                  🎯 MISSÃO 5/6
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Super-Corpo & Bem-Estar 🕹️
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Hoje vais aprender os hábitos de um verdadeiro campeão dos jogos.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-digital-wellbeing')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-digital-wellbeing')?.score} pts)</span>
                </span>
              ) : (
                <span className="bg-rose-100 text-rose-800 border border-rose-300 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1">
                  <Zap className="w-4 h-4 text-amber-500 fill-current" />
                  <span>Recompensa: +100 XP</span>
                </span>
              )}
            </div>
          </div>

          {/* 💡 1. APRENDE */}
          <div className="bg-white border-2 border-rose-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-rose-800">
              <Sparkles className="w-5 h-5 text-rose-500" />
              <h4 className="text-sm font-black uppercase tracking-wide">
                💡 1. Aprende: Energia e Saúde Gamer
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3.5 space-y-1">
                <div className="text-xl">🚀</div>
                <h5 className="text-xs font-black text-rose-900">Postura de Astronauta</h5>
                <p className="text-xs text-slate-600 leading-snug">
                  Costas direitas apoiadas na cadeira, pés no chão e ecrã à distância de um braço.
                </p>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-1">
                <div className="text-xl">👀</div>
                <h5 className="text-xs font-black text-amber-900">Regra dos 20-20-20</h5>
                <p className="text-xs text-slate-600 leading-snug">
                  A cada 20 minutos de ecrã, descansa os teus olhos 20 segundos olhando ao longe!
                </p>
              </div>
            </div>
          </div>

          {/* 🎮 SIMULADOR: TESTE DE HÁBITOS SAUDÁVEIS */}
          <div className="bg-white border-2 border-rose-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-rose-800">
                <Gamepad2 className="w-6 h-6 text-rose-600" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  Laboratório Gamer: Escolhe os Hábitos de Campeão!
                </h4>
              </div>
            </div>

            <div className="space-y-3.5">
              {wellbeingHabits.map((h) => (
                <div
                  key={h.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl border-2 border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{h.emoji}</span>
                      <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        {h.category}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-black text-slate-900 block pl-7">
                      {h.label}
                    </span>
                    {wellbeingChoices[h.id] && (
                      <p className="text-[11px] text-rose-950 font-semibold italic pl-7 mt-1 bg-rose-50/80 p-2 rounded-xl border border-rose-200">
                        💡 {h.explanation}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pl-7 sm:pl-0">
                    <button
                      onClick={() =>
                        setWellbeingChoices((prev) => ({ ...prev, [h.id]: 'saudavel' }))
                      }
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        wellbeingChoices[h.id] === 'saudavel'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      🌟 Hábito de Campeão
                    </button>
                    <button
                      onClick={() =>
                        setWellbeingChoices((prev) => ({ ...prev, [h.id]: 'risco' }))
                      }
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        wellbeingChoices[h.id] === 'risco'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      🦇 Modo Prejudicial
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleWellbeingSubmit}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-7 py-3.5 rounded-2xl shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current text-yellow-300" />
                <span>Avaliar a Minha Energia e Postura</span>
              </button>
            </div>

            {wellbeingFeedback && (
              <div
                className={`p-5 rounded-3xl border-2 text-xs space-y-2 ${
                  wellbeingFeedback.score > PROGRESSION_CONFIG.PASSING_THRESHOLD
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-black text-sm">{wellbeingFeedback.title}</h5>
                  <span className="font-mono font-black text-xs px-3 py-1 bg-white rounded-xl border border-current">
                    {wellbeingFeedback.score} / 100 Pts
                  </span>
                </div>
                <p className="leading-relaxed font-medium">
                  {wellbeingFeedback.description}
                </p>
              </div>
            )}
          </div>

          {/* ⭐ 3. O QUE APRENDESTE? */}
          <div className="bg-rose-50/80 border-2 border-rose-200 rounded-3xl p-5 space-y-2">
            <h5 className="text-xs font-black uppercase text-rose-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>⭐ O que aprendeste nesta missão?</span>
            </h5>
            <ul className="text-xs text-slate-700 space-y-1 font-medium list-disc list-inside">
              <li>A postura de astronauta (costas direitas, pés no chão) evita dores no corpo e cansaço.</li>
              <li>A regra dos 20-20-20 descansa os olhos e mantém a tua energia no máximo.</li>
            </ul>
          </div>

          {/* AVANÇAR PARA AVALIAÇÃO FINAL */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <span className="text-xs font-black text-emerald-700 uppercase tracking-wider block">
                🎉 Todas as 5 Micro-Missões Concluídas!
              </span>
              <h4 className="text-lg sm:text-xl font-black text-emerald-950 mt-0.5">
                Pronto para a Missão 6/6: Quiz do Guardião (10 Perguntas)? 🏆
              </h4>
            </div>
            <button
              onClick={() => onNavigateTopic('avaliacao')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm px-8 py-4 rounded-2xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer shrink-0"
            >
              <span>👉 Fazer a Missão 6/6: Quiz do Guardião</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SEPARADOR 6: AVALIAÇÃO FINAL DO GUARDIÃO DIGITAL */}
      {/* ========================================================= */}
      {activeTopicId === 'avaliacao' && (
        <div className="bg-white border-2 border-blue-200 rounded-3xl p-6 sm:p-10 shadow-md max-w-3xl mx-auto space-y-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-400 to-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-black text-blue-600 tracking-wider">
              🏆 MISSÃO 6/6 · O DESAFIO FINAL
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Quiz do Guardião Digital 🛡️
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Responde a 10 perguntas rápidas sobre o que aprendeste. Acerta mais de {PROGRESSION_CONFIG.PASSING_THRESHOLD}% para ganhares o teu Crachá e desbloqueares o Mundo 2!
            </p>
          </div>

          {world.bestAssessmentPercentage !== null && (
            <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl max-w-md mx-auto flex items-center justify-between">
              <span className="text-xs font-black text-slate-700">O Teu Melhor Recorde:</span>
              <span
                className={`text-sm font-black px-3.5 py-1.5 rounded-xl ${
                  world.bestAssessmentPercentage > PROGRESSION_CONFIG.PASSING_THRESHOLD
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {world.bestAssessmentPercentage}%
                {world.bestAssessmentPercentage > PROGRESSION_CONFIG.PASSING_THRESHOLD ? ' (🌟 Aprovado!)' : ` (🎯 Falta > ${PROGRESSION_CONFIG.PASSING_THRESHOLD}%)`}
              </span>
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={onOpenAssessment}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-base px-10 py-4 rounded-2xl shadow-xl shadow-blue-600/30 transition-transform active:scale-95 flex items-center gap-3 mx-auto cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-current text-yellow-300" />
              <span>
                {world.bestAssessmentPercentage !== null
                  ? 'Repetir Desafio das 10 Perguntas'
                  : 'Iniciar o Desafio das 10 Perguntas!'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
