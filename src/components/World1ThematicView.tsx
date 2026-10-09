import React, { useState } from 'react';
import {
  Key,
  Mail,
  ShieldCheck,
  Footprints,
  Heart,
  CheckCircle2,
  Lock,
  Zap,
  Sparkles,
  Trophy,
  ArrowRight,
  ChevronRight,
  Award,
  AlertTriangle,
  Check,
  Eye,
  Shield,
  ShieldAlert,
} from 'lucide-react';
import { WorldSummary } from '../types';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { GuardianKidHero } from './WorldMascots';
import { AudioReaderButton } from './AudioReaderButton';
import { GlossaryTerm } from './PedagogicalGlossary';
import { TopicIllustrationCard } from './TopicIllustrationCard';
import { MetacognitionWidget } from './MetacognitionWidget';
import { ScaffoldingClueCard } from './ScaffoldingClueCard';
import { PROGRESSION_CONFIG } from '../progressionConfig';

interface World1ThematicViewProps {
  world: WorldSummary;
  activeTopicId: string;
  onNavigateTopic: (topicId: string) => void;
  onOpenAssessment: () => void;
  onRefreshWorld: () => void;
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
  // 1. PALAVRAS-PASSE SIMULATOR STATE
  // -------------------------------------------------------------
  const [pwdInput, setPwdInput] = useState('');
  const [hasTestedPwd, setHasTestedPwd] = useState(false);
  const [pwdFeedback, setPwdFeedback] = useState<{
    score: number;
    title: string;
    description: string;
  } | null>(null);

  const evaluatePassword = () => {
    let score = 0;

    // Length
    if (pwdInput.length >= 10) {
      score += 35;
    } else if (pwdInput.length >= 8) {
      score += 25;
    } else if (pwdInput.length >= 6) {
      score += 15;
    } else {
      score += 5;
    }

    // Unpredictability & Common sequences
    const common = ['123', 'password', 'palavrapasse', 'escola', 'teste', 'qwerty', '123456', 'portugal', 'futebol', 'abc', '111', '000', 'admin'];
    const hasSequences = common.some((c) => pwdInput.toLowerCase().includes(c));
    if (!hasSequences && pwdInput.length >= 8) {
      score += 25;
    }

    // No obvious names or birth years
    const obviousNames = ['alex', 'tiago', 'leonor', 'marta', 'diogo', 'joao', 'maria', 'ana', 'pedro', 'lucas', 'matilde', 'tomas', 'beatriz', 'francisco', 'afonso', 'goncalo', 'rodrigo', 'martim', 'santiago'];
    const hasObviousNames = obviousNames.some((n) => pwdInput.toLowerCase().includes(n));
    const hasDates = /(19\d\d|20\d\d)/.test(pwdInput);
    if (!hasObviousNames && !hasDates && pwdInput.length >= 8) {
      score += 20;
    }

    // Character variety
    let typeCount = 0;
    if (/[a-z]/.test(pwdInput)) typeCount++;
    if (/[A-Z]/.test(pwdInput)) typeCount++;
    if (/[0-9]/.test(pwdInput)) typeCount++;
    if (/[^a-zA-Z0-9]/.test(pwdInput)) typeCount++;
    if (typeCount >= 3) {
      score += 20;
    } else if (typeCount >= 2) {
      score += 10;
    }

    score = Math.min(100, Math.max(10, score));

    let title = '';
    let description = '';

    if (score >= 90) {
      title = '🛡️ Palavra-passe Muito Segura e Invencível!';
      description =
        'Excelente! A tua palavra-passe é comprida, difícil de adivinhar e não contém dados previsíveis. Usa palavras-passe diferentes para cada conta e nunca as partilhes com ninguém!';
    } else if (score >= 70) {
      title = '✓ Palavra-passe Segura (Boa Proteção)';
      description =
        'Muito bom! A tua palavra-passe tem boa proteção. Para alcançar os 100 pontos, adiciona mais caracteres e combina um símbolo especial (#, $, !).';
    } else if (score >= 50) {
      title = '⚡ Palavra-passe Razoável (Pode Melhorar)';
      description =
        'A tua palavra-passe tem alguns pontos positivos, mas um robô pode conseguir adivinhá-la. Aumenta o comprimento (8+ caracteres), evita sequências óbvias e junta maiúsculas e símbolos.';
    } else {
      title = '⚠️ Palavra-passe Curta ou Vulnerável';
      description =
        'Esta palavra-passe é fácil de adivinhar porque é curta ou utiliza informação previsível. Experimenta o método da frase maluca: "Gato_Ninja_Comeu_9_Pizzas!".';
    }

    setHasTestedPwd(true);
    setPwdFeedback({ score, title, description });
    reportCompletion('sim-password', 'Laboratório de Palavras-Passe', { password: pwdInput }, score);
  };

  // -------------------------------------------------------------
  // 2. PHISHING SIMULATOR STATE
  // -------------------------------------------------------------
  const [phishingStep, setPhishingStep] = useState(0);
  const [phishingUserChoices, setPhishingUserChoices] = useState<Record<number, boolean>>({});
  const [phishingCompleted, setPhishingCompleted] = useState(false);

  const phishingScenarios = [
    {
      sender: 'seguranca@conta-escola-verificacao.com',
      subject: 'A tua conta da escola será bloqueada hoje!',
      body: 'Olá. Detetámos um problema grave na tua conta escolar. Para evitar que seja eliminada permanentemente, confirma os teus dados e palavra-passe através do seguinte link nos próximos 15 minutos: http://conta-escola-verificacao.com/login',
      isPhishing: true,
      explanation:
        'Existem vários sinais clássicos de phishing: a mensagem cria urgência forçada ("nos próximos 15 minutos"), usa um endereço de email falso (.com em vez de .edu.pt ou .gov.pt) e pede que introduzas a tua palavra-passe através de um link desconhecido.',
      signals: [
        'Urgência com prazo curto para assustar ("15 minutos")',
        'Pedido de dados e palavra-passe através de um link',
        'Ameaça de bloqueio ou encerramento imediato da conta',
        'Remetente não oficial (@conta-escola-verificacao.com)',
      ],
    },
    {
      sender: 'professor.tic@escola.edu.pt',
      subject: 'Trabalho de Grupo de TIC — Prazo de Entrega',
      body: 'Olá alunos! Relembramos que o resumo do projeto de TIC deve ser entregue até sexta-feira através da plataforma oficial da nossa escola. Se tiverem alguma dúvida sobre as instruções, podem perguntar na próxima aula.',
      isPhishing: false,
      explanation:
        'Esta é uma mensagem legítima e segura: vem de um remetente oficial da escola (.edu.pt), aborda um contexto real de aula, não pede nenhuma palavra-passe nem dados privados e remete para a plataforma oficial habitual.',
      signals: [
        'Contexto conhecido e transparente de sala de aula',
        'Canal e domínio oficial da escola (.edu.pt)',
        'Ausência de pedidos de palavra-passe ou links suspeitos',
        'Possibilidade de confirmação presencial com o professor',
      ],
    },
    {
      sender: 'premios@jogos-super-moedas.net',
      subject: '🎁 Parabéns! Ganhaste 10.000 moedas e skins grátis!',
      body: 'Parabéns jogador! Foste sorteado num passatempo especial. Para receberes as tuas 10.000 moedas e skins lendárias no teu jogo favorito, basta responderes a este email com o teu nome de utilizador e a tua palavra-passe secreta.',
      isPhishing: true,
      explanation:
        'Cuidado com ofertas milagrosas! O pedido da tua palavra-passe é um sinal inequívoco de roubo de conta. Nenhuma plataforma ou jogo oficial alguma vez pede a tua palavra-passe para te atribuir prémios ou recompensas.',
      signals: [
        'Promessa de prémios e vantagens gratuitas fantásticas',
        'Pedido explícito da tua palavra-passe secreta',
        'Endereço de email não oficial e desconhecido',
        'Isco típico de engenharia social para roubar contas',
      ],
    },
  ];

  const handlePhishingDecision = (chosenPhishing: boolean) => {
    const updatedChoices = { ...phishingUserChoices, [phishingStep]: chosenPhishing };
    setPhishingUserChoices(updatedChoices);

    if (Object.keys(updatedChoices).length === phishingScenarios.length) {
      let correctCount = 0;
      phishingScenarios.forEach((scen, idx) => {
        if (updatedChoices[idx] === scen.isPhishing) correctCount++;
      });
      const finalScore = Math.round((correctCount / phishingScenarios.length) * 100);
      setPhishingCompleted(true);
      reportCompletion('sim-phishing', 'Laboratório Anti-Phishing', { answers: updatedChoices }, finalScore);
    }
  };

  // -------------------------------------------------------------
  // 3. PRIVACIDADE SIMULATOR STATE
  // -------------------------------------------------------------
  const [privacyChoices, setPrivacyChoices] = useState<Record<string, 'public' | 'private'>>({});
  const [privacyScore, setPrivacyScore] = useState<number | null>(null);

  const privacyItems = [
    {
      id: 'item-phone',
      label: 'O teu número de telemóvel pessoal',
      correct: 'private',
      feedback: 'O número de telemóvel é um dado pessoal íntimo. Deve ficar sempre guardado no teu cofre secreto!',
    },
    {
      id: 'item-hobby',
      label: 'O teu passatempo favorito (ex.: desenhar ou ler banda desenhada)',
      correct: 'public',
      feedback: 'Partilhar os teus gostos criativos e hobbies é seguro e ajuda a fazer amizades saudáveis online!',
    },
    {
      id: 'item-address',
      label: 'A morada da tua casa e o número da porta',
      correct: 'private',
      feedback: 'Super privado! Revelar onde moras pode expor a tua segurança e a da tua família no mundo real.',
    },
    {
      id: 'item-school',
      label: 'O horário em que sais sozinho da escola a pé',
      correct: 'private',
      feedback: 'Revelar as tuas rotinas físicas diárias é muito arriscado. Guarda esta informação estritamente para ti!',
    },
    {
      id: 'item-book',
      label: 'Um livro ou jogo educativo que recomendas aos colegas',
      correct: 'public',
      feedback: 'Recomendações culturais e partilha de projetos escolares são seguras e enriquecem a comunidade escolar!',
    },
  ];

  const handlePrivacySubmit = () => {
    let correctCount = 0;
    privacyItems.forEach((item) => {
      if (privacyChoices[item.id] === item.correct) correctCount++;
    });
    const score = Math.round((correctCount / privacyItems.length) * 100);
    setPrivacyScore(score);
    reportCompletion('sim-privacy', 'Laboratório de Privacidade', { answers: privacyChoices }, score);
  };

  // -------------------------------------------------------------
  // 4. RASTO DIGITAL SIMULATOR STATE
  // -------------------------------------------------------------
  const [footprintChoices, setFootprintChoices] = useState<Record<string, 'risco' | 'positivo'>>({});
  const [footprintScore, setFootprintScore] = useState<number | null>(null);

  const footprintScenarios = [
    {
      id: 'fp-1',
      title: 'Fotografia com farda da escola e localização GPS ativada',
      description: 'Publicar nas redes sociais uma fotografia em frente à escola com o logótipo da farda bem visível e localização em tempo real.',
      correct: 'risco',
      explanation: 'Publicar fardas e localização em direto expõe a tua rotina e a tua escola a qualquer pessoa desconhecida na rede.',
    },
    {
      id: 'fp-2',
      title: 'Comentário impulsivo num chat de jogo',
      description: 'Escrever insultos ou palavras agressivas no chat público de um videojogo depois de perder uma partida importante.',
      correct: 'risco',
      explanation: 'Na Internet as palavras ficam gravadas em servidores e capturas de ecrã. Um rasto negativo pode manchar a tua reputação.',
    },
    {
      id: 'fp-3',
      title: 'Artigo educativo sobre reciclagem no blogue da turma',
      description: 'Partilhar um trabalho de grupo sobre a proteção dos oceanos e reciclagem, assinado apenas pelo primeiro nome.',
      correct: 'positivo',
      explanation: 'Demonstra talento, cidadania digital e cooperação, protegendo simultaneamente a tua identidade completa!',
    },
  ];

  const handleFootprintSubmit = () => {
    let correctCount = 0;
    footprintScenarios.forEach((item) => {
      if (footprintChoices[item.id] === item.correct) correctCount++;
    });
    const score = Math.round((correctCount / footprintScenarios.length) * 100);
    setFootprintScore(score);
    reportCompletion('sim-digital-footprint', 'Simulador de Pegada Digital', { answers: footprintChoices }, score);
  };

  // -------------------------------------------------------------
  // 5. BEM-ESTAR DIGITAL SIMULATOR STATE
  // -------------------------------------------------------------
  const [wellbeingChoices, setWellbeingChoices] = useState<Record<string, 'saudavel' | 'risco'>>({});
  const [wellbeingScore, setWellbeingScore] = useState<number | null>(null);

  const wellbeingHabits = [
    {
      id: 'wb-1',
      label: 'Regra dos 20-20-20: A cada 20 minutos de ecrã, olhar 20 segundos para um objeto a 6 metros.',
      correct: 'saudavel',
      explanation: 'Relaxa os músculos oculares e evita a fadiga visual, miopia e dores de cabeça!',
    },
    {
      id: 'wb-2',
      label: 'Modo Noturno Extremo: Usar o telemóvel na cama às escuras até à 1h da manhã.',
      correct: 'risco',
      explanation: 'A luz azul perturba a melatonina, destrói a qualidade do sono e deixa o teu cérebro sem energia.',
    },
    {
      id: 'wb-3',
      label: 'Postura de Astronauta: Costas direitas na cadeira, pés bem assentes no chão e ecrã à altura dos olhos.',
      correct: 'saudavel',
      explanation: 'Protege a coluna, evita dores no pescoço e melhora a concentração e a respiração.',
    },
    {
      id: 'wb-4',
      label: 'Foco no Estudo: Desligar as notificações do telemóvel durante o tempo de fazer os trabalhos de casa.',
      correct: 'saudavel',
      explanation: 'Elimina distrações constantes, permitindo acabar as tarefas mais depressa e com muito menos erros!',
    },
  ];

  const handleWellbeingSubmit = () => {
    let correctCount = 0;
    wellbeingHabits.forEach((item) => {
      if (wellbeingChoices[item.id] === item.correct) correctCount++;
    });
    const score = Math.round((correctCount / wellbeingHabits.length) * 100);
    setWellbeingScore(score);
    reportCompletion('sim-digital-wellbeing', 'Simulador de Bem-Estar Digital', { answers: wellbeingChoices }, score);
  };

  // -------------------------------------------------------------
  // REPORT COMPLETION HELPER
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
          worldId: 1,
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
    ['w1-t1', 'w1-t2', 'w1-t3', 'w1-t4', 'w1-t5', 'avaliacao'].includes(activeTopicId)
      ? activeTopicId
      : 'w1-t1';

  const getSimProg = (simId: string) => {
    return world.simulatorsProgress?.find((p) => p.id === simId);
  };

  const routePercent = world.average > 0 ? Math.round(world.average) : 100;

  const missionNavList = [
    { id: 'w1-t1', stepLabel: 'Missão 1/6', title: 'Palavras-passe Secretas', icon: Key, iconBgClass: 'bg-emerald-50 text-emerald-600', simId: 'sim-password' },
    { id: 'w1-t2', stepLabel: 'Missão 2/6', title: 'Caça ao Phishing', icon: Mail, iconBgClass: 'bg-blue-50 text-blue-600', simId: 'sim-phishing' },
    { id: 'w1-t3', stepLabel: 'Missão 3/6', title: 'Escudo de Privacidade', icon: ShieldCheck, iconBgClass: 'bg-emerald-50 text-emerald-600', simId: 'sim-privacy' },
    { id: 'w1-t4', stepLabel: 'Missão 4/6', title: 'O Rasto Digital', icon: Footprints, iconBgClass: 'bg-purple-50 text-purple-600', simId: 'sim-digital-footprint' },
    { id: 'w1-t5', stepLabel: 'Missão 5/6', title: 'Super-Corpo & Ecrãs', icon: Heart, iconBgClass: 'bg-rose-50 text-rose-600', simId: 'sim-digital-wellbeing' },
    { id: 'avaliacao', stepLabel: 'Missão 6/6', title: 'Quiz do Guardião', icon: Award, iconBgClass: 'bg-amber-50 text-amber-600', simId: 'assessment' },
  ];

  return (
    <div className="space-y-6">
      {/* 🚀 BANNER DE FEEDBACK DE SUCESSO */}
      {completedFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-950 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
              ✓
            </div>
            <div>
              <p className="text-xs font-black text-emerald-900 uppercase">
                Atividade Concluída: {completedFeedback.activityTitle}
              </p>
              <p className="text-xs text-emerald-800">
                Pontuação: <strong>{completedFeedback.score}%</strong> | Ganhaste{' '}
                <strong>+{completedFeedback.xpGain} XP</strong>!
              </p>
            </div>
          </div>
          <span className="text-xs font-black bg-emerald-200 text-emerald-900 px-3 py-1.5 rounded-xl border border-emerald-300">
            Recorde: {completedFeedback.newBest}/100
          </span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🛡️ HERO BANNER GUARDIÃO DIGITAL                            */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-b from-[#a8f3d1]/50 via-[#d1fae5]/40 to-white border border-[#6ee7b7] p-6 sm:p-8 lg:p-9 shadow-sm">
        {/* Ambient Highlights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-emerald-200/40 rounded-full blur-2xl pointer-events-none" />

        {/* Top Breadcrumb & Route Progress */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2 text-xs font-black text-emerald-900 tracking-wide uppercase">
            <span className="w-5 h-5 rounded-full bg-white text-emerald-600 flex items-center justify-center text-xs shadow-2xs">
              🌐
            </span>
            <span>MUNDO 1</span>
            <span className="text-emerald-700 font-bold">&gt;</span>
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
                style={{ width: `${routePercent}%` }}
              />
            </div>
            <span className="text-xs font-black text-slate-900 tabular-nums">
              {routePercent}%
            </span>
          </div>
        </div>

        {/* Middle Hero: Headline, Subtitle, Guardian Mascot */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 my-6 relative z-10">
          <div className="max-w-xl space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-slate-950 tracking-tight leading-[1.12]">
              O Teu Escudo Digital:<br />
              Palavras-Passe Fortes, Zero Phishing<br />
              e Privacidade Total!
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed max-w-lg">
              A tua missão de guardião: proteger o teu castelo digital, desmascarar armadilhas e guardar segredos a 7 chaves! 🗝️
            </p>
          </div>
          <div className="shrink-0 flex justify-center lg:justify-end">
            <GuardianKidHero className="w-64 sm:w-72 lg:w-[340px] h-auto drop-shadow-md" />
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
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400'
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
                        isActive ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      {m.stepLabel}
                    </span>
                    <span className="text-xs sm:text-sm font-black truncate">{m.title}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {simProg?.completed && (
                    <CheckCircle2 className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                  )}
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-emerald-500'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. SEPARADOR: PALAVRAS-PASSE                              */}
      {/* ========================================================= */}
      {effectiveTopicId === 'w1-t1' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Mission Header Card */}
          <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                <Key className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">
                    🎯 MISSÃO 1/6
                  </span>
                  <AudioReaderButton
                    textToRead="Missão 1: O Cofre das Palavras-Passe. A tua palavra-passe é a chave que protege as tuas contas de jogos e da escola. Usa palavras divertidas com números e símbolos para ficar forte, como Gato Ninja Comeu 9 Pizzas! A tua senha é pessoal e nunca deve ser partilhada."
                    label="Ouvir Missão ✨"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  Palavras-passe Secretas 🗝️
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Hoje vais descobrir como criar uma palavra-passe invencível e proteger os teus{' '}
                  <GlossaryTerm term="dados pessoais">dados pessoais</GlossaryTerm>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-password')?.completed ? (
                <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 border border-emerald-200 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-password')?.score} pts)</span>
                </span>
              ) : (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1">
                  <Zap className="w-4 h-4 text-emerald-600 fill-current" />
                  <span>Recompensa: +100 XP</span>
                </span>
              )}
            </div>
          </div>

          {/* 💡 1. APRENDE */}
          <div className="bg-white border-2 border-emerald-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h4 className="text-sm font-black uppercase tracking-wide">
                💡 1. Aprende: O Segredo da Palavra-Passe Robusta
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <div className="text-2xl">🔑</div>
                <h5 className="font-black text-emerald-950 text-sm">A Chave do Teu Castelo</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Protege as tuas contas de jogos, da escola e de redes sociais contra acessos indevidos de estranhos.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <div className="text-2xl">🧠</div>
                <h5 className="font-black text-amber-950 text-sm">A Técnica da Frase Maluca</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Junta palavras engraçadas, números e símbolos: <em>"Gato_Ninja_Comeu_9_Pizzas!"</em>. Fácil para ti, impossível para um robô!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5">
                <div className="text-2xl">🤫</div>
                <h5 className="font-black text-blue-950 text-sm">Segredo Estritamente Pessoal</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  A tua palavra-passe é como a escova de dentes: pessoal e intransmissível. Nunca a partilhes com amigos!
                </p>
              </div>
            </div>

            <TopicIllustrationCard topicId="w1-t1" />
          </div>

          {/* 🎮 2. EXPERIMENTA: SIMULADOR DE PALAVRAS-PASSE */}
          <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-emerald-700">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  🎮 2. Experimenta: Laboratório de Palavras-Passe
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Simulador Interativo em Tempo Real
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Digita uma palavra-passe de <strong>teste</strong> (nunca uses uma real!) e carrega em <strong>Testar Força</strong> para ver a pontuação e os critérios do escudo digital.
            </p>

            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={pwdInput}
                  onChange={(e) => {
                    setPwdInput(e.target.value);
                    setHasTestedPwd(false);
                  }}
                  placeholder="Ex.: Gato_Ninja_Comeu_9_Pizzas!"
                  className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={evaluatePassword}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Testar Força</span>
                </button>
              </div>

              {/* Quick sample chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">Exemplos para experimentar:</span>
                {['Cavalo#Verde77', 'escola123', 'Pizza!Galactica_99', '123456'].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      setPwdInput(sample);
                      setHasTestedPwd(false);
                    }}
                    className="px-3 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-mono font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    🎲 {sample}
                  </button>
                ))}
              </div>

              {/* Live Criteria Checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    pwdInput.length >= 8
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>8+ Caracteres</span>
                </div>
                <div
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    /[A-Z]/.test(pwdInput) && /[a-z]/.test(pwdInput)
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Maiúsculas + Minúsculas</span>
                </div>
                <div
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    /[0-9]/.test(pwdInput)
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Números</span>
                </div>
                <div
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    /[^A-Za-z0-9]/.test(pwdInput)
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Símbolos (#, $, !)</span>
                </div>
              </div>

              {/* Result Meter and Feedback */}
              {hasTestedPwd && pwdFeedback && (
                <div
                  className={`p-5 rounded-2xl border-2 space-y-3 animate-in fade-in duration-200 ${
                    pwdFeedback.score >= 80
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                      : pwdFeedback.score >= 50
                      ? 'bg-amber-50 border-amber-400 text-amber-950'
                      : 'bg-rose-50 border-rose-400 text-rose-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm">{pwdFeedback.title}</span>
                    <span className="font-mono font-black text-xs px-3 py-1 bg-white/90 rounded-xl border border-current shadow-2xs">
                      Pontuação: {pwdFeedback.score}/100
                    </span>
                  </div>

                  <div className="w-full bg-white/90 rounded-full h-3 overflow-hidden border border-current/20">
                    <div
                      className={`h-full transition-all duration-500 ${
                        pwdFeedback.score >= 80 ? 'bg-emerald-500' : pwdFeedback.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pwdFeedback.score}%` }}
                    />
                  </div>

                  <p className="text-xs font-semibold leading-relaxed">
                    {pwdFeedback.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Scaffolding Clues & Metacognition */}
          <ScaffoldingClueCard
            clues={[
              'Usa pelo menos 10 caracteres para que os robôs hackers demorem séculos a adivinhar!',
              'Nunca uses sequências simples tipo "123456" nem nomes de familiares ou datas de nascimento.',
              'A tua palavra-passe é secreta: se alguém te pedir a senha da escola para oferecer presentes, recusa sempre!',
            ]}
          />

          <MetacognitionWidget worldId={1} topicId="w1-t1" />

          {/* Next Mission Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => onNavigateTopic('w1-t2')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Próxima Missão: 2. Caça ao Phishing 🎣</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SEPARADOR: PHISHING                                    */}
      {/* ========================================================= */}
      {effectiveTopicId === 'w1-t2' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Mission Header Card */}
          <div className="bg-white border-2 border-blue-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                <Mail className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-blue-600 uppercase tracking-wider">
                    🎯 MISSÃO 2/6
                  </span>
                  <AudioReaderButton
                    textToRead="Missão 2: Caça ao Phishing. Phishing são mensagens falsas que tentam roubar a tua palavra-passe ou conta. Desconfia de promessas de moedas grátis ou avisos com muita pressa a dizer para clicares em 5 minutos. Regra do detetive: Se parece bom demais para ser verdade, é uma armadilha!"
                    label="Ouvir Missão ✨"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  Caça ao Phishing 🎣
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Aprende a detetar armadilhas cibernéticas e engenharia social antes de clicares!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-phishing')?.completed ? (
                <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 border border-emerald-200 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-phishing')?.score} pts)</span>
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
                💡 1. Aprende: O Radar Anti-Phishing
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <div className="text-2xl">🚨</div>
                <h5 className="font-black text-amber-950 text-sm">Sentido de Urgência Falso</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Mensagens que dizem "A tua conta será eliminada em 15 minutos!" querem fazer-te agir por impulso sem pensar.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                <div className="text-2xl">🎣</div>
                <h5 className="font-black text-rose-950 text-sm">O Isco das Moedas Grátis</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Promessas milagrosas de Robux, V-Bucks ou prémios fáceis servem apenas para pedir o teu email e a tua senha.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <div className="text-2xl">🔎</div>
                <h5 className="font-black text-emerald-950 text-sm">Regra de Ouro do Detetive</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Verifica sempre o remetente oficial (.edu.pt ou .gov.pt). Se tiveres dúvidas, pergunta ao professor antes de clicar!
                </p>
              </div>
            </div>

            <TopicIllustrationCard topicId="w1-t2" />
          </div>

          {/* 🎮 2. EXPERIMENTA: SIMULADOR ANTI-PHISHING */}
          <div className="bg-white border-2 border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-blue-700">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  🎮 2. Experimenta: Laboratório Anti-Phishing
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Cenário {phishingStep + 1} de {phishingScenarios.length}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Analisa cuidadosamente a mensagem de correio eletrónico abaixo. Observa o remetente, o assunto e o texto e decide se é uma tentativa de fraude (Phishing) ou uma mensagem legítima.
            </p>

            {/* Email Card Preview */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 space-y-3 font-sans">
              <div className="border-b border-slate-200 pb-3 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center gap-2">
                  <strong className="text-slate-900 w-16">De:</strong>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border text-slate-800">
                    {phishingScenarios[phishingStep].sender}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <strong className="text-slate-900 w-16">Assunto:</strong>
                  <span className="font-bold text-slate-900">
                    {phishingScenarios[phishingStep].subject}
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed pt-1">
                {phishingScenarios[phishingStep].body}
              </p>
            </div>

            {/* Decision Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => handlePhishingDecision(true)}
                className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                  phishingUserChoices[phishingStep] === true
                    ? 'bg-rose-700 text-white ring-2 ring-rose-400'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>🚨 É Phishing / Fraude!</span>
              </button>
              <button
                type="button"
                onClick={() => handlePhishingDecision(false)}
                className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                  phishingUserChoices[phishingStep] === false
                    ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>✓ É Legítimo / Seguro</span>
              </button>
            </div>

            {/* Decision Feedback */}
            {phishingUserChoices[phishingStep] !== undefined && (
              <div
                className={`p-5 rounded-2xl border-2 text-xs space-y-3 animate-in fade-in ${
                  phishingUserChoices[phishingStep] === phishingScenarios[phishingStep].isPhishing
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div>
                  <strong className="text-sm block mb-1">
                    {phishingUserChoices[phishingStep] === phishingScenarios[phishingStep].isPhishing
                      ? '✓ Resposta Correta de Detetive!'
                      : '⚠️ Atenção aos Pormenores Suspeitos!'}
                  </strong>
                  <p className="leading-relaxed font-medium">
                    {phishingScenarios[phishingStep].explanation}
                  </p>
                </div>

                <div className="pt-2 border-t border-current/20">
                  <span className="font-bold block mb-1.5">Sinais a observar neste caso:</span>
                  <ul className="list-disc list-inside space-y-1">
                    {phishingScenarios[phishingStep].signals.map((sig, sIdx) => (
                      <li key={sIdx}>{sig}</li>
                    ))}
                  </ul>
                </div>

                {phishingStep < phishingScenarios.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setPhishingStep((p) => p + 1)}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 mt-2 cursor-pointer shadow-xs"
                  >
                    <span>Próximo Cenário ({phishingStep + 2}/{phishingScenarios.length})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          <ScaffoldingClueCard
            clues={[
              'Nenhuma escola nem empresa legítima te vai pedir a palavra-passe por email para te dar prémios.',
              'Antes de clicares num link, analisa as letras do endereço: "sorteios-rapid0s.xyz" não é oficial!',
              'Em caso de dúvida na escola, pergunta sempre ao teu professor de TIC antes de colocar dados.',
            ]}
          />

          <MetacognitionWidget worldId={1} topicId="w1-t2" />

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => onNavigateTopic('w1-t3')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Próxima Missão: 3. Escudo de Privacidade 🛡️</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SEPARADOR: PRIVACIDADE                                 */}
      {/* ========================================================= */}
      {effectiveTopicId === 'w1-t3' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Mission Header Card */}
          <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">
                    🎯 MISSÃO 3/6
                  </span>
                  <AudioReaderButton
                    textToRead="Missão 3: Escudo de Privacidade. Os teus dados pessoais dizem quem és e onde estás. Guarda a tua morada e telemóvel no teu cofre secreto. Pede sempre autorização antes de publicar fotos com amigos!"
                    label="Ouvir Missão ✨"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  Escudo de Privacidade 🛡️
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Descobre o que deve ficar no teu cofre secreto e o que podes partilhar livremente.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-privacy')?.completed ? (
                <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 border border-emerald-200 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-privacy')?.score} pts)</span>
                </span>
              ) : (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1">
                  <Zap className="w-4 h-4 text-emerald-600 fill-current" />
                  <span>Recompensa: +100 XP</span>
                </span>
              )}
            </div>
          </div>

          {/* 💡 1. APRENDE */}
          <div className="bg-white border-2 border-emerald-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h4 className="text-sm font-black uppercase tracking-wide">
                💡 1. Aprende: Cofre Secreto vs. Mural Público
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                <div className="text-2xl">🔒</div>
                <h5 className="font-black text-rose-950 text-sm">Cofre Secreto (Nunca Partilhar)</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Morada de casa, número de telemóvel pessoal, rotinas e horários a pé sem adultos, e fotografias que mostrem o símbolo da escola.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <div className="text-2xl">🌍</div>
                <h5 className="font-black text-emerald-950 text-sm">Livre para Partilhar com Orgulho</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Trabalhos criativos de TIC, projetos sobre a natureza e reciclagem, desenhos e recomendações de livros ou jogos educativos!
                </p>
              </div>
            </div>

            <TopicIllustrationCard topicId="w1-t3" />
          </div>

          {/* 🎮 2. EXPERIMENTA: SIMULADOR DE PRIVACIDADE */}
          <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-emerald-700">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  🎮 2. Experimenta: Laboratório de Privacidade
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Classifica os 5 tipos de dados
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Para cada elemento abaixo, decide se deve ficar no <strong>Cofre Secreto (Privado)</strong> ou se pode ser partilhado no <strong>Mural Público</strong>.
            </p>

            <div className="space-y-3">
              {privacyItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    {item.label}
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPrivacyChoices((prev) => ({ ...prev, [item.id]: 'private' }))}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        privacyChoices[item.id] === 'private'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Cofre Secreto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrivacyChoices((prev) => ({ ...prev, [item.id]: 'public' }))}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        privacyChoices[item.id] === 'public'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Público</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handlePrivacySubmit}
              disabled={Object.keys(privacyChoices).length < privacyItems.length}
              className={`px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                Object.keys(privacyChoices).length === privacyItems.length
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Validar Classificação de Privacidade</span>
            </button>

            {privacyScore !== null && (
              <div
                className={`p-5 rounded-2xl border-2 text-xs space-y-2 animate-in fade-in ${
                  privacyScore >= 80
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm">
                    {privacyScore >= 80 ? '🛡️ Excelente Proteção da Privacidade!' : '⚡ Bom Treino, revê os dados privados!'}
                  </span>
                  <span className="font-mono font-black text-xs px-3 py-1 bg-white/90 rounded-xl border border-current">
                    Pontuação: {privacyScore}/100
                  </span>
                </div>
                <p className="font-medium leading-relaxed">
                  Os dados confidenciais (telemóvel, morada e rotinas) nunca devem ser expostos na Internet sem o consentimento dos teus pais.
                </p>
              </div>
            )}
          </div>

          <ScaffoldingClueCard
            clues={[
              'Antes de publicares fotos com colegas, pergunta a cada um: "Autorizas a partilha?".',
              'O consentimento e o respeito pela imagem alheia são as regras de ouro da cidadania digital.',
              'Mantém as tuas contas de jogos e redes em modo privado para pessoas desconhecidas.',
            ]}
          />

          <MetacognitionWidget worldId={1} topicId="w1-t3" />

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => onNavigateTopic('w1-t4')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Próxima Missão: 4. O Rasto Digital 👣</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. SEPARADOR: RASTO DIGITAL                               */}
      {/* ========================================================= */}
      {effectiveTopicId === 'w1-t4' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Mission Header Card */}
          <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-xs">
                <Footprints className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-purple-600 uppercase tracking-wider">
                    🎯 MISSÃO 4/6
                  </span>
                  <AudioReaderButton
                    textToRead="Missão 4: O Rasto Digital. Tudo o que publicas ou comentas na Internet constrói o teu rasto digital. Mesmo quando apagas algo, alguém pode já ter guardado uma cópia. Por isso, pensa antes de publicar e espalha apenas energia positiva!"
                    label="Ouvir Missão ✨"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  O Rasto Digital 👣
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  A tua pegada indelével na rede: constrói um registo exemplar de futuro herói!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-digital-footprint')?.completed ? (
                <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 border border-emerald-200 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-digital-footprint')?.score} pts)</span>
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
                💡 1. Aprende: A Memória Permanente da Internet
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1.5">
                <div className="text-2xl">⏳</div>
                <h5 className="font-black text-purple-950 text-sm">O Teste dos 10 Anos</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Antes de publicar um vídeo ou comentário, pergunta: "Se o meu professor ou os meus pais vissem isto daqui a 10 anos, eu ficaria orgulhoso?".
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <div className="text-2xl">🌟</div>
                <h5 className="font-black text-emerald-950 text-sm">Pegada Brilhante de Herói</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Elogiar colegas, partilhar tutoriais de Scratch e apoiar projetos escolares constrói uma reputação respeitada e admirada!
                </p>
              </div>
            </div>

            <TopicIllustrationCard topicId="w1-t4" />
          </div>

          {/* 🎮 2. EXPERIMENTA: SIMULADOR DE PEGADA DIGITAL */}
          <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-purple-700">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  🎮 2. Experimenta: Simulador de Pegada Digital
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Classifica o impacto de cada ação
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Analisa as 3 situações e classifica cada uma como <strong>Pegada Perigosa / Risco</strong> ou <strong>Pegada de Herói / Positiva</strong>.
            </p>

            <div className="space-y-3">
              {footprintScenarios.map((scen) => (
                <div
                  key={scen.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {scen.title}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setFootprintChoices((prev) => ({ ...prev, [scen.id]: 'risco' }))}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          footprintChoices[scen.id] === 'risco'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Risco / Negativo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFootprintChoices((prev) => ({ ...prev, [scen.id]: 'positivo' }))}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          footprintChoices[scen.id] === 'positivo'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Pegada de Herói</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {scen.description}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleFootprintSubmit}
              disabled={Object.keys(footprintChoices).length < footprintScenarios.length}
              className={`px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                Object.keys(footprintChoices).length === footprintScenarios.length
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Analisar Impacto do Rasto Digital</span>
            </button>

            {footprintScore !== null && (
              <div
                className={`p-5 rounded-2xl border-2 text-xs space-y-2 animate-in fade-in ${
                  footprintScore >= 80
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm">
                    {footprintScore >= 80 ? '🌟 Consciência Digital Brilhante!' : '⚡ Revê as pegadas de risco!'}
                  </span>
                  <span className="font-mono font-black text-xs px-3 py-1 bg-white/90 rounded-xl border border-current">
                    Pontuação: {footprintScore}/100
                  </span>
                </div>
                <p className="font-medium leading-relaxed">
                  Lembra-te: na Internet nada desaparece completamente. Constrói sempre um rasto do qual te orgulhes!
                </p>
              </div>
            )}
          </div>

          <ScaffoldingClueCard
            clues={[
              'Antes de enviar uma mensagem com raiva, respira fundo e espera 5 minutos.',
              'Elogios sinceros e partilhas úteis são as melhores marcas de um verdadeiro cidadão digital.',
              'Mensagens em privado também podem ser partilhadas ou gravadas por outros.',
            ]}
          />

          <MetacognitionWidget worldId={1} topicId="w1-t4" />

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => onNavigateTopic('w1-t5')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Próxima Missão: 5. Super-Corpo & Bem-Estar 🕹️</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. SEPARADOR: BEM-ESTAR DIGITAL                           */}
      {/* ========================================================= */}
      {effectiveTopicId === 'w1-t5' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Mission Header Card */}
          <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                <Heart className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-rose-600 uppercase tracking-wider">
                    🎯 MISSÃO 5/6
                  </span>
                  <AudioReaderButton
                    textToRead="Missão 5: Super-Corpo e Bem-Estar. Um bom jogador cuida da postura, dos olhos e do sono para ter energia máxima! Postura de astronauta: costas direitas e ecrã à distância de um braço. Regra dos 20-20-20: a cada 20 minutos, descansa os olhos 20 segundos olhando ao longe."
                    label="Ouvir Missão ✨"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  Super-Corpo & Bem-Estar 🕹️
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Ergonomia de campeão: reflexos rápidos, costas direitas e energia ao máximo!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-digital-wellbeing')?.completed ? (
                <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 border border-emerald-200 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-digital-wellbeing')?.score} pts)</span>
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
                💡 1. Aprende: Os Hábitos do Campeão Digital
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <div className="text-2xl">👀</div>
                <h5 className="font-black text-emerald-950 text-sm">Regra dos 20-20-20</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  A cada 20 minutos de ecrã, olha 20 segundos para algo a 6 metros de distância para relaxar a visão.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5">
                <div className="text-2xl">💺</div>
                <h5 className="font-black text-blue-950 text-sm">Postura de Astronauta</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Costas direitas, pés no chão e topo do monitor ao nível dos teus olhos evitam dores e cansaço.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <div className="text-2xl">🌙</div>
                <h5 className="font-black text-amber-950 text-sm">Sono Sagrado</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Desliga os ecrãs 30 a 60 minutos antes de dormir para o cérebro produzir melatonina e descansar profundamente.
                </p>
              </div>
            </div>

            <TopicIllustrationCard topicId="w1-t5" />
          </div>

          {/* 🎮 2. EXPERIMENTA: SIMULADOR DE BEM-ESTAR DIGITAL */}
          <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-rose-700">
                <Sparkles className="w-5 h-5 text-rose-600" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  🎮 2. Experimenta: Laboratório do Gamer Saudável
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Classifica os 4 hábitos
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Avalia cada hábito tecnológico e classifica como <strong>Hábito Saudável 🌟</strong> ou <strong>Hábito de Risco ⚠️</strong>.
            </p>

            <div className="space-y-3">
              {wellbeingHabits.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {item.label}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setWellbeingChoices((prev) => ({ ...prev, [item.id]: 'saudavel' }))}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          wellbeingChoices[item.id] === 'saudavel'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Saudável 🌟</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setWellbeingChoices((prev) => ({ ...prev, [item.id]: 'risco' }))}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          wellbeingChoices[item.id] === 'risco'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Risco ⚠️</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleWellbeingSubmit}
              disabled={Object.keys(wellbeingChoices).length < wellbeingHabits.length}
              className={`px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                Object.keys(wellbeingChoices).length === wellbeingHabits.length
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Avaliar Hábitos de Bem-Estar</span>
            </button>

            {wellbeingScore !== null && (
              <div
                className={`p-5 rounded-2xl border-2 text-xs space-y-2 animate-in fade-in ${
                  wellbeingScore >= 80
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm">
                    {wellbeingScore >= 80 ? '🌟 Campeão com Energia Máxima!' : '⚡ Ajusta os teus hábitos de ecrã!'}
                  </span>
                  <span className="font-mono font-black text-xs px-3 py-1 bg-white/90 rounded-xl border border-current">
                    Pontuação: {wellbeingScore}/100
                  </span>
                </div>
                <p className="font-medium leading-relaxed">
                  Cuidar do corpo e do sono é o segredo para reflexos mais rápidos e notas brilhantes!
                </p>
              </div>
            )}
          </div>

          <ScaffoldingClueCard
            clues={[
              'Faz pelo menos 1 hora de brincadeiras ao ar livre ou desporto por dia.',
              'Lembra-te: o telemóvel não deve dormir debaixo da almofada nem na tua cama.',
              'Levantar e esticar os braços a cada hora de estudo rejuvenesce a concentração.',
            ]}
          />

          <MetacognitionWidget worldId={1} topicId="w1-t5" />

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => onNavigateTopic('avaliacao')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Próxima Missão: 6. Quiz do Guardião 🏆</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. SEPARADOR: AVALIAÇÃO FINAL (QUIZ)                      */}
      {/* ========================================================= */}
      {effectiveTopicId === 'avaliacao' && (
        <div className="bg-white border-2 border-emerald-200 rounded-3xl p-8 sm:p-10 text-center shadow-lg space-y-6 animate-in fade-in duration-200">
          <div className="w-20 h-20 bg-gradient-to-tr from-emerald-600 to-teal-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-md">
            <Trophy className="w-10 h-10" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600">
              Desafio Final de Validação do Mundo 1
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              🏆 O Grande Teste do Guardião Digital
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
              Mostra que dominas as palavras-passe, detetas armadilhas de phishing, proteges os teus dados privados e cuidas do teu corpo!
              Precisas de <strong>mais de {PROGRESSION_CONFIG.PASSING_THRESHOLD}%</strong> para concluir o Mundo 1 com distinção e desbloquear o Mundo 2!
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAssessment}
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer inline-flex items-center gap-2 transform active:scale-95"
          >
            <Sparkles className="w-5 h-5" />
            <span>Iniciar o Quiz de Avaliação Oficial</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};
