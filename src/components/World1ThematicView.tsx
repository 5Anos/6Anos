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
  BookOpen,
  Sparkles,
  RefreshCw,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { WorldSummary } from '../types';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
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
  // 1. PASSWORD SIMULATOR STATE
  // -------------------------------------------------------------
  const [pwdInput, setPwdInput] = useState('');
  const [hasTestedPwd, setHasTestedPwd] = useState(false);
  const [pwdScore, setPwdScore] = useState<number | null>(null);
  const [pwdFeedback, setPwdFeedback] = useState<{
    score: number;
    title: string;
    description: string;
  } | null>(null);

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
      sender: 'suporte@notificacoes-plataforma-jog0s.com',
      subject: 'Aviso de Segurança: Início de sessão detetado num novo dispositivo',
      body: 'Olá! Detetámos um novo início de sessão na tua conta a partir de um dispositivo desconhecido. Se não foste tu, clica imediatamente em http://verificacao-conta-jog0s.com/login e introduz a tua palavra-passe para bloquear o acesso.',
      isPhishing: true,
      signals: [
        'Endereço falsificado com "0" em vez de "o" (@notificacoes-plataforma-jog0s.com)',
        'Criação de urgência artificial e medo de perda da conta',
        'Link externo não oficial a solicitar a introdução da palavra-passe',
      ],
      explanation:
        'Esta mensagem é phishing. Os atacantes alteram subtilmente o endereço com um zero ("jog0s") e criam falsos alertas de segurança para que introduzas a tua palavra-passe num site falso.',
    },
    {
      sender: 'direcao.turma@agrupamento-escolas.edu.pt',
      subject: 'Aviso: Calendário de Atividades e Avaliações do 2.º Período',
      body: 'Caros alunos e encarregados de educação, o calendário das atividades curriculares do 2.º período está disponível para consulta no placard da escola e na plataforma oficial Moodle/Inovar habitual. Não é solicitada qualquer partilha de dados pessoais. Bom trabalho a todos!',
      isPhishing: false,
      signals: [
        'Domínio institucional oficial do Ministério da Educação (.edu.pt)',
        'Comunicação informativa que não pede palavras-passe nem dados privados',
        'Encaminha para a plataforma interna oficial habitual da escola',
      ],
      explanation:
        'Mensagem legítima e segura. Provém do domínio institucional oficial (.edu.pt), tem um propósito puramente escolar e não pede palavras-passe nem links suspeitos.',
    },
    {
      sender: 'partilha-trabalhos@cloud-documentos-storage.net',
      subject: 'Um colega partilhou o documento "Trabalho_TIC_6Ano.docx" contigo',
      body: 'Para acederes ao documento partilhado e editares o trabalho de grupo, inicia sessão com o teu email institucional e palavra-passe escolar em http://cloud-documentos-storage.net/auth-escola.',
      isPhishing: true,
      signals: [
        'Domínio externo desconhecido (.storage.net) que não pertence à escola',
        'Pedido de introdução de credenciais escolares num site externo',
        'Não utiliza a plataforma oficial autorizada pela escola (ex.: Google Classroom / Teams)',
      ],
      explanation:
        'Esta mensagem é phishing. Nunca deves introduzir a tua palavra-passe escolar num site externo desconhecido. As partilhas de trabalhos escolares devem ocorrer apenas nas plataformas oficiais autorizadas pela escola.',
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
    hint: string;
    correct: 'public' | 'private' | 'context';
    explanation: string;
  }[] = [
    {
      id: 'item-phone',
      label: 'O teu número de telemóvel pessoal',
      hint: 'Contacto direto via chamadas ou SMS',
      correct: 'private',
      explanation:
        'Proteger (Privado): O número de telemóvel é um dado confidencial crítico que permite contactos não solicitados, mensagens indesejadas e tentativas de burla.',
    },
    {
      id: 'item-hobby',
      label: 'O teu desporto, livro ou passatempo preferido',
      hint: 'Interesses culturais e desportivos',
      correct: 'public',
      explanation:
        'Partilhar publicamente: Interesses e gostos gerais são partilhas positivas e saudáveis que não revelam a tua identidade confidencial nem a tua localização.',
    },
    {
      id: 'item-address',
      label: 'A morada completa da tua casa',
      hint: 'Rua, número de porta e código postal',
      correct: 'private',
      explanation:
        'Proteger (Privado): A morada de residência nunca deve ser divulgada publicamente para garantir a segurança física e a privacidade da tua família.',
    },
    {
      id: 'item-photo-friends',
      label: 'Fotografia com colegas de turma no recreio da escola',
      hint: 'Imagem que envolve a cara e presença de outras pessoas',
      correct: 'context',
      explanation:
        'Pensar antes de partilhar: Depende do contexto e exige sempre a autorização prévia de todos os colegas que aparecem na foto, além de ser publicada apenas em contas com definições restritas a amigos conhecidos.',
    },
    {
      id: 'item-school-routine',
      label: 'O horário e percurso exato em que vais e voltas sozinho da escola',
      hint: 'Rotinas e deslocações diárias a pé',
      correct: 'private',
      explanation:
        'Proteger (Privado): Rotinas e horários em que estás sozinho expõem a tua localização física e colocam em risco a tua segurança no mundo real.',
    },
    {
      id: 'item-school-project',
      label: 'Um desenho, história ou projeto criado por ti para a aula de TIC',
      hint: 'Trabalho de autor escolar',
      correct: 'public',
      explanation:
        'Partilhar publicamente: Trabalhos criativos e projetos escolares podem ser partilhados de forma construtiva na comunidade escolar e no portefólio digital.',
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
    title: string;
    description: string;
    correct: 'positivo' | 'moderado' | 'alto';
    riskLevelText: string;
    explanation: string;
  }[] = [
    {
      id: 'fp-1',
      title: 'Vídeo no recreio com farda e localização GPS em direto',
      description:
        'Publicar nas redes sociais um vídeo no recreio escolar, com o logótipo da escola visível, identificando os colegas e ativando a transmissão de localização GPS em tempo real.',
      correct: 'alto',
      riskLevelText: 'Alto Risco / Prejudicial',
      explanation:
        'Alto Risco: Revela a localização física de menores em direto, rotinas escolares e expõe colegas sem consentimento, criando um registo digital prejudicial permanente.',
    },
    {
      id: 'fp-2',
      title: 'Fotografia das férias com matrícula do carro em segundo plano',
      description:
        'Partilhar uma fotografia casual com a família onde, ao fundo da imagem, é perfeitamente legível a matrícula do carro e a placa com o nome da rua.',
      correct: 'moderado',
      riskLevelText: 'Risco Moderado (Atenção ao Detalhe)',
      explanation:
        'Risco Moderado: Embora a intenção seja positiva, detalhes de fundo involuntários expõem bens e moradas. Exige atenção e reflexão prévia para cortar ou desfocar a informação antes de publicar.',
    },
    {
      id: 'fp-3',
      title: 'Artigo educativo no blogue escolar sobre segurança online',
      description:
        'Escrever e publicar no blogue da turma um artigo construtivo com conselhos de cidadania digital e prevenção de cyberbullying, assinado apenas com o primeiro nome.',
      correct: 'positivo',
      riskLevelText: 'Impacto Positivo e Construtivo',
      explanation:
        'Impacto Positivo: Demonstra competências digitais, cooperação, sentido cívico e respeito pela privacidade, construindo uma excelente reputação digital.',
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
      label: 'Costas direitas apoiadas na cadeira, pés no chão e ecrã ao nível dos olhos',
      category: 'Ergonomia & Postura',
      correct: 'saudavel',
      explanation: 'Hábito Saudável: Uma postura correta previne dores lombares, tensão no pescoço e fadiga muscular.',
    },
    {
      id: 'wb-lighting',
      label: 'Utilizar o computador num quarto às escuras com o brilho do ecrã no máximo',
      category: 'Iluminação & Visão',
      correct: 'risco',
      explanation: 'Hábito Prejudicial: O contraste extremo no escuro força excessivamente a visão, causando dores de cabeça e cansaço ocular.',
    },
    {
      id: 'wb-distance',
      label: 'Manter o ecrã à distância de 50 a 70 cm (comprimento de um braço esticado)',
      category: 'Distância do Ecrã',
      correct: 'saudavel',
      explanation: 'Hábito Saudável: Mantém a distância de visualização ideal para proteger a saúde dos olhos.',
    },
    {
      id: 'wb-wrists',
      label: 'Apoiar os pulsos confortavelmente na mesa e braços a 90° ao utilizar o teclado',
      category: 'Ergonomia dos Membros',
      correct: 'saudavel',
      explanation: 'Hábito Saudável: Alinha as articulações e previne lesões por esforço repetitivo nos pulsos e mãos.',
    },
    {
      id: 'wb-202020',
      label: 'Regra dos 20-20-20: A cada 20 minutos, olhar 20 segundos para 6 metros de distância',
      category: 'Descanso dos Olhos',
      correct: 'saudavel',
      explanation: 'Hábito Saudável: Relaxa a musculatura de focagem dos olhos e previne a fadiga visual digital.',
    },
    {
      id: 'wb-bed',
      label: 'Levar o telemóvel para a cama e ficar a ver vídeos no escuro até de madrugada',
      category: 'Sono & Descanso',
      correct: 'risco',
      explanation: 'Hábito Prejudicial: A luz azul dos ecrãs bloqueia a melatonina, prejudicando o sono, a memória e a energia escolar.',
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

    // 1. Length evaluation (primary factor)
    if (len >= 14) score += 40;
    else if (len >= 12) score += 35;
    else if (len >= 8) score += 20;
    else if (len > 0) score += 5;

    // 2. Predictability checks (repetitive patterns, keyboard walks)
    const lower = pwdInput.toLowerCase();
    const predictableWalks = ['123', '234', '345', '456', '789', 'abc', 'bcd', 'cde', 'qwerty', 'asdf', 'zxcv', 'aaaa', '1111', '0000'];
    const hasPredictableWalk = predictableWalks.some((walk) => lower.includes(walk));
    if (!hasPredictableWalk && len >= 8) {
      score += 20;
    }

    // 3. Personal data checks (names, years, school words)
    const personalKeywords = ['escola', 'aluno', 'alex', 'turma', 'portugal', 'porto', 'lisboa', 'benfica', 'sporting', 'porto', '2024', '2025', '2026', '2014', '2013', '2012', '2011', 'password', 'passe', 'admin'];
    const hasPersonalData = personalKeywords.some((kw) => lower.includes(kw));
    if (!hasPersonalData && len >= 8) {
      score += 20;
    }

    // 4. Character variety (secondary factor)
    let varietyCount = 0;
    if (/[a-z]/.test(pwdInput)) varietyCount++;
    if (/[A-Z]/.test(pwdInput)) varietyCount++;
    if (/[0-9]/.test(pwdInput)) varietyCount++;
    if (/[^A-Za-z0-9]/.test(pwdInput)) varietyCount++;

    if (varietyCount >= 3) score += 20;
    else if (varietyCount >= 2) score += 10;

    // Penalties for obvious weaknesses
    if (hasPredictableWalk || hasPersonalData) {
      score = Math.max(15, score - 25);
    }
    if (len < 8) {
      score = Math.min(30, score);
    }

    score = Math.min(100, Math.max(0, score));

    let title = 'Palavra-passe Vulnerável / Curta';
    let description =
      'Esta palavra-passe é curta ou utiliza padrões fáceis de adivinhar. Uma palavra-passe longa, única e difícil de adivinhar é mais importante do que simplesmente juntar símbolos.';

    if (score >= 80) {
      title = 'Palavra-passe Segura e Robusta!';
      description =
        'Excelente! Comprimento adequado, imprevisível e sem dados pessoais óbvios.\n\n“Uma palavra-passe longa, única e difícil de adivinhar é mais importante do que simplesmente juntar símbolos.” Lembra-te de não a reutilizar noutras contas nem a partilhar com ninguém.';
    } else if (score >= 50) {
      title = 'Palavra-passe Razoável (Pode Melhorar)';
      description =
        'Bom progresso! Para ficar verdadeiramente segura, aumenta o comprimento para 12+ caracteres e certifica-te de que não usas nomes, datas ou sequências previsíveis.\n\n“Uma palavra-passe longa, única e difícil de adivinhar é mais importante do que simplesmente juntar símbolos.”';
    }

    setHasTestedPwd(true);
    setPwdScore(score);
    setPwdFeedback({ score, title, description });
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
      title: isCurrentCorrect ? '✓ Decisão Pericial Correta!' : '⚠️ Atenção aos Sinais de Alerta!',
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

    let title = 'Classificação em Análise';
    let description =
      'Revê a tua classificação. Lembra-te: dados que põem em risco a tua segurança física devem ser sempre protegidos (privados), enquanto fotografias com outras pessoas exigem pensar antes de partilhar e autorização.';
    if (score === 100) {
      title = 'Classificação de Privacidade Exemplar!';
      description =
        'Discernimento perfeito! Sabes exatamente quando proteger dados confidenciais, quando ponderar o contexto de partilha de imagens e que projetos podes divulgar em segurança.';
    } else if (score >= 60) {
      title = 'Bom Sentido de Privacidade';
      description =
        'Conseguiste identificar os principais dados! Tem atenção redobrada a dados de rotinas físicas e imagens com colegas que exigem reflexão contextual.';
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

    let title = 'Análise da Pegada Digital';
    let description =
      'Lembra-te que a pegada digital inclui tanto os registos que criamos voluntariamente como os detalhes involuntários em fotos ou vídeos.';
    if (score === 100) {
      title = 'Avaliação Crítica Exemplar!';
      description =
        'Excelente discernimento dos diferentes graus de impacto: soubeste distinguir o alto risco da exposição física em direto, o risco moderado dos detalhes em segundo plano e o impacto construtivo de artigos escolares.';
    } else if (score >= 66) {
      title = 'Bom Sentido Crítico';
      description =
        'Compreendeste bem os impactos. Lembra-te de analisar os pequenos detalhes que podem estar visíveis no fundo de fotografias casuais.';
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

    let title = 'Índice de Bem-estar e Ergonomia';
    let description =
      'A postura corporal, a distância do ecrã e a iluminação correta são tão importantes quanto o tempo de ecrã para evitar dores e cansaço visual.';
    if (score === 100) {
      title = 'Equilíbrio e Ergonomia Exemplares!';
      description =
        'Fantástico! Dominas as regras essenciais de ergonomia (costas direitas, ecrã a 50-70 cm, braços a 90°), descanso ocular (regra 20-20-20) e proteção do sono!';
    } else if (score >= 60) {
      title = 'Bom Sentido Ergonómico';
      description =
        'Identificaste a maioria dos hábitos saudáveis! Revê a iluminação do quarto e a distância correta do ecrã para garantir nota máxima.';
    }

    setWellbeingFeedback({ score, title, description });
    reportCompletion('sim-digital-wellbeing', 'Simulador de Bem-estar Digital', { answers: wellbeingChoices }, score);
  };

  // Helper to find simulator progress
  const getSimProg = (simId: string) => {
    return world.simulatorsProgress?.find((p) => p.id === simId);
  };

  // Find theoretical topic from catalog
  const topic1 = world.topics.find((t) => t.id === 'w1-t1');
  const topic2 = world.topics.find((t) => t.id === 'w1-t2');
  const topic3 = world.topics.find((t) => t.id === 'w1-t3');
  const topic4 = world.topics.find((t) => t.id === 'w1-t4');
  const topic5 = world.topics.find((t) => t.id === 'w1-t5');

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
      {/* TEMA 1: PALAVRAS-PASSE */}
      {/* ========================================================= */}
      {activeTopicId === 'w1-t1' && (
        <div className="space-y-6">
          {/* Header do Tema */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider block">
                  Tema 1 do Mundo 1
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic1?.title || 'Palavras-passe'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-password')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-password')?.score}%)</span>
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
            <div className="flex items-center gap-2.5 text-blue-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: COMO CRIAR E PROTEGER A TUA PALAVRA-PASSE
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

            <TopicIllustrationCard topicId="w1-t1" />
          </div>

          {/* 🎮 2. EXPERIMENTA (Simulador de Palavras-passe) */}
          <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-blue-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Laboratório de Palavras-Passe
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Testa a robustez da palavra-passe em tempo real
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Cria uma palavra-passe de TESTE:
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Não uses uma palavra-passe verdadeira. Cria apenas um exemplo para experimentar.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={pwdInput}
                    onChange={(e) => {
                      setPwdInput(e.target.value);
                      setHasTestedPwd(false);
                      setPwdFeedback(null);
                    }}
                    placeholder="Ex.: Gato_Azul_782!"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
                  />
                  <button
                    onClick={evaluatePassword}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Key className="w-4 h-4" />
                    <span>Testar Força</span>
                  </button>
                </div>
              </div>

              {/* Checklist de Robustez e Imprevisibilidade */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    pwdInput.length >= 12
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : pwdInput.length >= 8
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Comprimento (12+ car.)</span>
                </div>
                <div
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    pwdInput.length >= 8 &&
                    !['123', '234', '345', '456', '789', 'abc', 'bcd', 'qwerty', 'asdf', 'aaaa', '1111'].some((w) =>
                      pwdInput.toLowerCase().includes(w)
                    )
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Sem Sequências Óbvias</span>
                </div>
                <div
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    pwdInput.length >= 8 &&
                    !['escola', 'aluno', 'alex', 'turma', 'portugal', 'porto', 'lisboa', '2024', '2025', '2026', 'password', 'admin'].some(
                      (kw) => pwdInput.toLowerCase().includes(kw)
                    )
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Sem Dados Pessoais</span>
                </div>
                <div
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    (/[a-z]/.test(pwdInput) ? 1 : 0) +
                      (/[A-Z]/.test(pwdInput) ? 1 : 0) +
                      (/[0-9]/.test(pwdInput) ? 1 : 0) +
                      (/[^A-Za-z0-9]/.test(pwdInput) ? 1 : 0) >=
                    3
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Variedade de Tipos</span>
                </div>
              </div>

              {pwdFeedback && (
                <div
                  className={`p-5 rounded-2xl border text-xs space-y-2 ${
                    pwdFeedback.score > 75
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : pwdFeedback.score >= 50
                      ? 'bg-amber-50 border-amber-200 text-amber-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-extrabold text-sm">{pwdFeedback.title}</h5>
                    <span className="font-mono font-black text-xs px-2.5 py-1 bg-white/80 rounded-lg border border-current">
                      Pontuação: {pwdFeedback.score}/100
                    </span>
                  </div>
                  <p className="leading-relaxed font-medium whitespace-pre-line">
                    {pwdFeedback.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 🎯 3. CONCLUSÃO & AVANÇAR */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-600 font-medium">
              Concluíste a aprendizagem e experimentação do Tema 1.
            </div>
            <button
              onClick={() => onNavigateTopic('w1-t2')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Avançar para: 2. Phishing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 2: PHISHING */}
      {/* ========================================================= */}
      {activeTopicId === 'w1-t2' && (
        <div className="space-y-6">
          {/* Header do Tema */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-amber-600 tracking-wider block">
                  Tema 2 do Mundo 1
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic2?.title || 'Phishing'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-phishing')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-phishing')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                  Recompensa: +100 XP
                </span>
              )}
            </div>
          </div>

          {/* 📖 1. APRENDE (Conteúdo Teórico Exato + Ilustração Educativa) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-amber-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: O QUE É PHISHING E SINAIS DE ALERTA
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic2?.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {topic2?.bulletPoints && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
                <h5 className="text-xs font-black text-amber-900 uppercase tracking-wider mb-2">
                  Desconfia imediatamente de mensagens que:
                </h5>
                <ul className="space-y-1.5 text-xs text-amber-950 font-bold">
                  {topic2.bulletPoints.map((bp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-600 font-black">•</span>
                      <span>{bp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <TopicIllustrationCard topicId="w1-t2" />
          </div>

          {/* 🎮 2. EXPERIMENTA (Simulador de Phishing) */}
          <div className="bg-white border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-amber-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Laboratório de Phishing
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Cenário {phishingStep + 1} de {phishingScenarios.length}
              </span>
            </div>

            {/* Email Preview Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="border-b border-slate-200 pb-2 text-xs text-slate-600 space-y-1">
                <div>
                  <strong className="text-slate-900">De: </strong>
                  <span className="font-mono text-slate-800">{phishingScenarios[phishingStep].sender}</span>
                </div>
                <div>
                  <strong className="text-slate-900">Assunto: </strong>
                  <span className="text-slate-900 font-bold">{phishingScenarios[phishingStep].subject}</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed pt-1">
                {phishingScenarios[phishingStep].body}
              </p>
            </div>

            {/* Decision Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => handlePhishingDecision(true)}
                className="w-full sm:w-1/2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>É Phishing / Tentativa de Fraude</span>
              </button>
              <button
                onClick={() => handlePhishingDecision(false)}
                className="w-full sm:w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>É Mensagem Legítima / Segura</span>
              </button>
            </div>

            {phishingFeedback && (
              <div
                className={`p-5 rounded-2xl border text-xs space-y-2 ${
                  phishingFeedback.score === 100
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-sm">{phishingFeedback.title}</h5>
                  <span className="font-mono font-black text-xs px-2.5 py-1 bg-white/80 rounded-lg border border-current">
                    {phishingFeedback.score === 100 ? '100 XP' : '0 XP'}
                  </span>
                </div>
                <p className="leading-relaxed font-medium">
                  <strong>Análise do Perito: </strong>
                  {phishingFeedback.description}
                </p>

                {phishingStep < phishingScenarios.length - 1 && (
                  <button
                    onClick={() => {
                      setPhishingStep((p) => p + 1);
                      setPhishingScore(null);
                      setPhishingFeedback(null);
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 mt-3 shadow-xs cursor-pointer"
                  >
                    <span>Próximo Cenário ({phishingStep + 2}/{phishingScenarios.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 🎯 3. CONCLUSÃO & AVANÇAR */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-600 font-medium">
              Concluíste a aprendizagem e experimentação do Tema 2.
            </div>
            <button
              onClick={() => onNavigateTopic('w1-t3')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Avançar para: 3. Privacidade / Dados pessoais</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 3: DADOS PESSOAIS / PRIVACIDADE */}
      {/* ========================================================= */}
      {activeTopicId === 'w1-t3' && (
        <div className="space-y-6">
          {/* Header do Tema */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-emerald-600 tracking-wider block">
                  Tema 3 do Mundo 1
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic3?.title ? `Privacidade / ${topic3.title}` : 'Privacidade / Dados pessoais'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-privacy')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-privacy')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                  Recompensa: +100 XP
                </span>
              )}
            </div>
          </div>

          {/* 📖 1. APRENDE (Conteúdo Teórico Exato + Ilustração Educativa) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-emerald-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: DADOS PESSOAIS E PROTEÇÃO DA PRIVACIDADE
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic3?.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {topic3?.bulletPoints && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
                <h5 className="text-xs font-black text-emerald-900 uppercase tracking-wider mb-2">
                  Exemplos de dados pessoais a proteger:
                </h5>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-emerald-950 font-bold">
                  {topic3.bulletPoints.map((bp, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>{bp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <TopicIllustrationCard topicId="w1-t3" />
          </div>

          {/* 🎮 2. EXPERIMENTA (Privacy Simulator) */}
          <div className="bg-white border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-emerald-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Laboratório de Privacidade
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Classifica: Partilhar Publicamente / Pensar Antes / Proteger (Privado)
              </span>
            </div>

            <div className="space-y-3">
              {privacyItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/70"
                >
                  <div className="space-y-0.5 max-w-lg">
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      {item.label}
                    </span>
                    <p className="text-[11px] text-slate-500">{item.hint}</p>
                    {privacyChoices[item.id] && (
                      <p className="text-[11px] text-slate-600 italic mt-1">
                        💡 {item.explanation}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <button
                      onClick={() =>
                        setPrivacyChoices((prev) => ({ ...prev, [item.id]: 'public' }))
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        privacyChoices[item.id] === 'public'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Público
                    </button>
                    <button
                      onClick={() =>
                        setPrivacyChoices((prev) => ({ ...prev, [item.id]: 'context' }))
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        privacyChoices[item.id] === 'context'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Pensar Antes
                    </button>
                    <button
                      onClick={() =>
                        setPrivacyChoices((prev) => ({ ...prev, [item.id]: 'private' }))
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        privacyChoices[item.id] === 'private'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Proteger (Privado)
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handlePrivacySubmit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-xs transition-colors cursor-pointer"
              >
                Avaliar Classificação de Privacidade
              </button>
            </div>

            {privacyFeedback && (
              <div
                className={`p-5 rounded-2xl border text-xs space-y-2 ${
                  privacyFeedback.score > 75
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-sm">{privacyFeedback.title}</h5>
                  <span className="font-mono font-black text-xs px-2.5 py-1 bg-white/80 rounded-lg border border-current">
                    Pontuação: {privacyFeedback.score}/100
                  </span>
                </div>
                <p className="leading-relaxed font-medium whitespace-pre-line">
                  {privacyFeedback.description}
                </p>
              </div>
            )}
          </div>

          {/* 🎯 3. CONCLUSÃO & AVANÇAR */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-600 font-medium">
              Concluíste a aprendizagem e experimentação do Tema 3.
            </div>
            <button
              onClick={() => onNavigateTopic('w1-t4')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Avançar para: 4. Pegada digital</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 4: PEGADA DIGITAL */}
      {/* ========================================================= */}
      {activeTopicId === 'w1-t4' && (
        <div className="space-y-6">
          {/* Header do Tema */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Footprints className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-indigo-600 tracking-wider block">
                  Tema 4 do Mundo 1
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic4?.title || 'Pegada digital'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-digital-footprint')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-digital-footprint')?.score}%)</span>
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
                1. APRENDE: O QUE É A PEGADA DIGITAL E A SUA PERMANÊNCIA
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic4?.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            <TopicIllustrationCard topicId="w1-t4" />
          </div>

          {/* 🎮 2. EXPERIMENTA (Simulador de Pegada Digital) */}
          <div className="bg-white border border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Simulador de Pegada Digital
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Avalia o grau de impacto: Positivo / Risco Moderado / Alto Risco
              </span>
            </div>

            <div className="space-y-4">
              {footprintScenarios.map((scen) => (
                <div
                  key={scen.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <h5 className="text-xs sm:text-sm font-black text-slate-900">{scen.title}</h5>
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <button
                        onClick={() =>
                          setFootprintChoices((prev) => ({ ...prev, [scen.id]: 'positivo' }))
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          footprintChoices[scen.id] === 'positivo'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Impacto Positivo
                      </button>
                      <button
                        onClick={() =>
                          setFootprintChoices((prev) => ({ ...prev, [scen.id]: 'moderado' }))
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          footprintChoices[scen.id] === 'moderado'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Risco Moderado
                      </button>
                      <button
                        onClick={() =>
                          setFootprintChoices((prev) => ({ ...prev, [scen.id]: 'alto' }))
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          footprintChoices[scen.id] === 'alto'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Alto Risco
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {scen.description}
                  </p>
                  {footprintChoices[scen.id] && (
                    <p className="text-[11px] text-slate-600 italic pt-1 border-t border-slate-200/60">
                      💡 {scen.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleFootprintSubmit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-xs transition-colors cursor-pointer"
              >
                Avaliar o Impacto na Minha Pegada
              </button>
            </div>

            {footprintFeedback && (
              <div
                className={`p-5 rounded-2xl border text-xs space-y-2 ${
                  footprintFeedback.score > 75
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-sm">{footprintFeedback.title}</h5>
                  <span className="font-mono font-black text-xs px-2.5 py-1 bg-white/80 rounded-lg border border-current">
                    Pontuação: {footprintFeedback.score}/100
                  </span>
                </div>
                <p className="leading-relaxed font-medium whitespace-pre-line">
                  {footprintFeedback.description}
                </p>
              </div>
            )}
          </div>

          {/* 🎯 3. CONCLUSÃO & AVANÇAR */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-600 font-medium">
              Concluíste a aprendizagem e experimentação do Tema 4.
            </div>
            <button
              onClick={() => onNavigateTopic('w1-t5')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Avançar para: 5. Bem-estar digital</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 5: BEM-ESTAR DIGITAL */}
      {/* ========================================================= */}
      {activeTopicId === 'w1-t5' && (
        <div className="space-y-6">
          {/* Header do Tema */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-rose-600 tracking-wider block">
                  Tema 5 do Mundo 1
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic5?.title || 'Bem-estar digital'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-digital-wellbeing')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-digital-wellbeing')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                  Recompensa: +100 XP
                </span>
              )}
            </div>
          </div>

          {/* 📖 1. APRENDE (Conteúdo Teórico Exato + Ilustração Educativa) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-rose-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: USO EQUILIBRADO E SEGURO DA TECNOLOGIA
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic5?.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {topic5?.bulletPoints && (
              <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4">
                <h5 className="text-xs font-black text-rose-900 uppercase tracking-wider mb-2">
                  Dicas para um equilíbrio saudável:
                </h5>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-rose-950 font-bold">
                  {topic5.bulletPoints.map((bp, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span>{bp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <TopicIllustrationCard topicId="w1-t5" />
          </div>

          {/* 🎮 2. EXPERIMENTA (Simulador de Bem-estar Digital) */}
          <div className="bg-white border border-rose-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-rose-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Simulador de Ergonomia e Hábitos Saudáveis
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Avalia a ergonomia (postura, distância, luz) e os hábitos de ecrã
              </span>
            </div>

            <div className="space-y-3">
              {wellbeingHabits.map((h) => (
                <div
                  key={h.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/70"
                >
                  <div className="space-y-1 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-rose-100/80 text-rose-800">
                        {h.category}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                      {h.label}
                    </span>
                    {wellbeingChoices[h.id] && (
                      <p className="text-[11px] text-slate-600 italic">💡 {h.explanation}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() =>
                        setWellbeingChoices((prev) => ({ ...prev, [h.id]: 'saudavel' }))
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        wellbeingChoices[h.id] === 'saudavel'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Hábito Saudável
                    </button>
                    <button
                      onClick={() =>
                        setWellbeingChoices((prev) => ({ ...prev, [h.id]: 'risco' }))
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        wellbeingChoices[h.id] === 'risco'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Hábito Prejudicial
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleWellbeingSubmit}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-xs transition-colors cursor-pointer"
              >
                Avaliar Meu Bem-estar Digital
              </button>
            </div>

            {wellbeingFeedback && (
              <div
                className={`p-5 rounded-2xl border text-xs space-y-2 ${
                  wellbeingFeedback.score > 75
                    ? 'bg-rose-50 border-rose-200 text-rose-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-sm">{wellbeingFeedback.title}</h5>
                  <span className="font-mono font-black text-xs px-2.5 py-1 bg-white/80 rounded-lg border border-current">
                    Índice: {wellbeingFeedback.score}/100
                  </span>
                </div>
                <p className="leading-relaxed font-medium whitespace-pre-line">
                  {wellbeingFeedback.description}
                </p>
              </div>
            )}
          </div>

          {/* 🎯 3. CONCLUSÃO & AVANÇAR PARA AVALIAÇÃO FINAL */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-black text-emerald-700 tracking-wider block">
                Completaste todos os temas teóricos e práticos do Mundo 1!
              </span>
              <h4 className="text-base font-black text-emerald-950 mt-0.5">
                Pronto para a Avaliação Final (10 Perguntas)?
              </h4>
            </div>
            <button
              onClick={() => onNavigateTopic('avaliacao')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ir para a Avaliação Final</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SEPARADOR 6: AVALIAÇÃO FINAL (10 PERGUNTAS) */}
      {/* ========================================================= */}
      {activeTopicId === 'avaliacao' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs max-w-3xl mx-auto space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold text-blue-600 tracking-wider">
              Prova Curricular de Conclusão do Mundo 1
            </span>
            <h3 className="text-2xl font-black text-slate-900">
              Avaliação Final (10 Perguntas)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Responde às 10 questões de escolha múltipla sobre Palavras-passe, Phishing, Privacidade,
              Pegada Digital e Bem-estar. Para aprovação de excelência e desbloquear os mundos seguintes, precisas de pelo menos 75%.
            </p>
          </div>

          {world.bestAssessmentPercentage !== null && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">A tua Melhor Pontuação:</span>
              <span
                className={`text-sm font-black px-3 py-1 rounded-lg ${
                  world.bestAssessmentPercentage >= 75
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {world.bestAssessmentPercentage}%
                {world.bestAssessmentPercentage >= 75 ? ' (Aprovado)' : ' (Pendente > 75%)'}
              </span>
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={onOpenAssessment}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-8 py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 mx-auto cursor-pointer"
            >
              <span>
                {world.bestAssessmentPercentage !== null
                  ? 'Repetir Avaliação Final (10 Perguntas)'
                  : 'Iniciar Avaliação Final (10 Perguntas)'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
