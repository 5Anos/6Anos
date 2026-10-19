import React, { useState } from 'react';
import {
  MessageSquare,
  Smile,
  Users,
  Copyright,
  FileText,
  Share2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Award,
  BookOpen,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Palette,
  Star,
  Zap,
  ChevronRight,
  Clock,
  Check,
  Lightbulb,
} from 'lucide-react';
import { CreativeKidHero } from './WorldMascots';
import { StudyStackIllustration } from './DetectiveMascot';
import { AudioReaderButton } from './AudioReaderButton';
import { GlossaryTerm } from './PedagogicalGlossary';
import { MetacognitionWidget } from './MetacognitionWidget';
import { ScaffoldingClueCard } from './ScaffoldingClueCard';
import { MissionPhaseSwitcher, MissionPhase } from './MissionPhaseSwitcher';
import { WorldSummary } from '../types';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { TopicIllustrationCard } from './TopicIllustrationCard';
import { HighlightClues } from '../utils/textHighlight';
import { PROGRESSION_CONFIG } from '../progressionConfig';

interface World3ThematicViewProps {
  world: WorldSummary;
  activeTopicId: string;
  onNavigateTopic: (topicId: string) => void;
  onOpenAssessment: () => void;
  onRefreshWorld: () => Promise<void>;
}

export const World3ThematicView: React.FC<World3ThematicViewProps> = ({
  world,
  activeTopicId,
  onNavigateTopic,
  onOpenAssessment,
  onRefreshWorld,
}) => {
  const { user, refreshUser } = useAuth();

  const [missionPhase, setMissionPhase] = useState<MissionPhase>('theory');

  React.useEffect(() => {
    setMissionPhase('theory');
  }, [activeTopicId]);

  // Completed feedback banner
  const [completedFeedback, setCompletedFeedback] = useState<{
    score: number;
    xpGain: number;
    newBest: number;
    activityTitle: string;
  } | null>(null);

  // -------------------------------------------------------------
  // 1. COMUNICAÇÃO DIGITAL SIMULATOR STATE
  // -------------------------------------------------------------
  const [selectedMessageTone, setSelectedMessageTone] = useState<string | null>(null);
  const [messageScore, setMessageScore] = useState<number | null>(null);
  const messageOptions = [
    {
      id: 'opt-impaciente',
      text: 'Diogo, precisamos mesmo da tua parte. Consegues enviá-la hoje? Já estamos atrasados.',
      tone: 'Direta, mas pouco cuidadosa',
      feedback: 'A mensagem explica o problema, mas pode criar pressão. Pode ser melhor indicar o prazo e perguntar se o colega precisa de ajuda.',
      score: 55,
    },
    {
      id: 'opt-vaga',
      text: 'Olá, Diogo. Quando puderes, manda a tua parte para vermos o trabalho.',
      tone: 'Educada, mas pouco concreta',
      feedback: 'A mensagem é respeitosa, mas não indica claramente quando é necessária a parte do trabalho.',
      score: 70,
    },
    {
      id: 'opt-clara-respeitosa',
      text: 'Olá, Diogo! Precisamos da tua parte do resumo até às 17h para juntarmos o trabalho. Se estiveres com alguma dificuldade, diz-nos e tentamos ajudar.',
      tone: 'Clara, respeitosa e com pedido concreto',
      feedback: 'Muito bem! A mensagem é clara, indica o prazo, explica o motivo e oferece ajuda.',
      score: 100,
    },
  ];

  // -------------------------------------------------------------
  // 2. NETIQUETA SIMULATOR STATE
  // -------------------------------------------------------------
  const [netiquetteChoices, setNetiquetteChoices] = useState<Record<string, 'correto' | 'incorreto'>>({});
  const [netiquetteScore, setNetiquetteScore] = useState<number | null>(null);
  const netiquetteScenarios = [
    {
      id: 'net-1',
      action: 'Num grupo de trabalho, um colega tem uma ideia diferente e tu **explicas com calma a tua proposta**, **ouvindo também a opinião dele**.',
      correct: 'correto',
      explanation: 'Podemos ter opiniões diferentes e debater ideias mantendo sempre a educação e o respeito mútuo.',
    },
    {
      id: 'net-2',
      action: 'Criar um grupo ou partilhar mensagens para **gozar, excluir ou humilhar** um colega da turma.',
      correct: 'incorreto',
      explanation: 'Excluir, gozar ou humilhar colegas viola as regras de respeito e convivência na Internet.',
    },
    {
      id: 'net-3',
      action: 'Escrever frases inteiras em **MAIÚSCULAS** para **exigir resposta imediata** dos colegas.',
      correct: 'incorreto',
      explanation: 'Na Internet, escrever em maiúsculas parece que estamos a gritar e pode criar conflitos desnecessários.',
    },
    {
      id: 'net-4',
      action: 'Fazer captura de ecrã de uma **mensagem privada** e publicá-la num grupo público **sem a sua autorização**.',
      correct: 'incorreto',
      explanation: 'Partilhar conversas privadas de outras pessoas sem autorização viola a privacidade e a confiança.',
    },
  ];

  // -------------------------------------------------------------
  // 3. COLABORAÇÃO & EQUIPA SIMULATOR STATE
  // -------------------------------------------------------------
  const [collabChoices, setCollabChoices] = useState<Record<string, string>>({});
  const [collabScore, setCollabScore] = useState<number | null>(null);
  const collabScenarios = [
    {
      id: 'col-1',
      situation: 'Faltam 2 dias para a entrega do trabalho e um colega ainda não enviou a sua parte.',
      options: [
        { id: 'opt-a1', label: 'Perguntar se precisa de ajuda e combinar uma hora para receber a parte que falta.', correct: true },
        { id: 'opt-a2', label: 'Esperar até ao último momento para não pressionar o colega, mesmo que o grupo fique sem tempo.', correct: false },
      ],
    },
    {
      id: 'col-2',
      situation: 'Duas pessoas do grupo querem organizar a apresentação de maneiras diferentes.',
      options: [
        { id: 'opt-b1', label: 'Explicar as duas ideias, ouvir os argumentos e escolher em conjunto a estrutura mais adequada.', correct: true },
        { id: 'opt-b2', label: 'Escolher rapidamente a ideia de quem fala primeiro para não perder tempo.', correct: false },
      ],
    },
    {
      id: 'col-3',
      situation: 'Um elemento da equipa tem dificuldade em utilizar a ferramenta de edição partilhada.',
      options: [
        { id: 'opt-c1', label: 'Mostrar os passos necessários e deixar o colega experimentar para também participar.', correct: true },
        { id: 'opt-c2', label: 'Fazer essa parte sozinho para terminar mais depressa e deixar o colega com outra tarefa.', correct: false },
      ],
    },
    {
      id: 'col-4',
      situation: 'Um colega quer fazer o trabalho quase todo sozinho para acabar mais depressa.',
      options: [
        { id: 'opt-d1', label: 'Dividir as tarefas de forma justa e combinar que todos revêm o trabalho no final.', correct: true },
        { id: 'opt-d2', label: 'Deixá-lo fazer quase tudo, desde que o trabalho fique pronto a tempo.', correct: false },
      ],
    },
  ];

  // -------------------------------------------------------------
  // 4. DIREITOS DE AUTOR SIMULATOR STATE
  // -------------------------------------------------------------
  const [copyrightChoices, setCopyrightChoices] = useState<Record<string, 'permitido' | 'proibido'>>({});
  const [copyrightScore, setCopyrightScore] = useState<number | null>(null);
  const copyrightScenarios = [
    {
      id: 'cpr-1',
      case: 'A Inês encontrou uma música na Internet e quer usá-la num vídeo escolar **só porque a encontrou online** (**sem pedir permissão nem verificar licença**).',
      correct: 'proibido',
      explanation: 'Estar na Internet não significa que seja livre para copiar. É preciso verificar se podemos utilizar o conteúdo e quais são as regras.',
    },
    {
      id: 'cpr-2',
      case: 'O Afonso utilizou uma foto de um banco de imagens gratuito que **autoriza o uso escolar** e **indicou o autor na legenda**.',
      correct: 'permitido',
      explanation: 'Utilizou uma imagem com permissão e cumpriu a regra de indicar quem criou a foto.',
    },
    {
      id: 'cpr-3',
      case: 'O Diogo copiou uma ilustração de um artista, **apagou a assinatura** e colocou na capa **como se fosse um desenho feito por ele**.',
      correct: 'proibido',
      explanation: 'Copiar o trabalho de outra pessoa e dizer que foste tu que fizeste não vale: chama-se plágio e desrespeita quem o criou.',
    },
    {
      id: 'cpr-4',
      case: 'A Leonor quer utilizar uma foto: antes de a colocar no trabalho, **verifica se tem licença livre** e **indica claramente quem a criou**.',
      correct: 'permitido',
      explanation: 'Muito bem! Antes de utilizares um conteúdo encontrado na Internet, deves verificar as regras de utilização e indicar a autoria.',
    },
  ];

  // -------------------------------------------------------------
  // 5. PLÁGIO E AUTORIA SIMULATOR STATE
  // -------------------------------------------------------------
  const [plagiarismOption, setPlagiarismOption] = useState<string | null>(null);
  const [plagiarismScore, setPlagiarismScore] = useState<number | null>(null);
  const plagiarismCases = [
    {
      id: 'copia_sem_credito',
      title: 'Opção A: Copiar o texto diretamente sem indicar a fonte',
      text: '"Os golfinhos conseguem comunicar através de diferentes sons." (**Texto copiado na íntegra e assinado apenas com o nome do aluno, sem fonte**)',
      isCorrect: false,
      feedback: 'Incorreto. Copiar o texto de outra pessoa e colocar o nosso nome não transforma o trabalho em nosso.',
    },
    {
      id: 'palavras_proprias',
      title: 'Opção B: Explicar por palavras próprias e indicar a fonte',
      text: '**Explicar por palavras próprias**: "Segundo a informação consultada, os golfinhos utilizam diferentes sons para comunicar." **[Fonte: manual de Ciências]**',
      isCorrect: true,
      feedback: 'Correto! Explicaste a ideia pelas tuas próprias palavras e indicaste de onde veio a informação.',
    },
    {
      id: 'citacao_com_aspas',
      title: 'Opção C: Usar as palavras exatas e indicar a fonte',
      text: '**Usar aspas e citar a fonte**: No manual de Ciências pode ler-se: **"Os golfinhos conseguem comunicar através de diferentes sons."** **[Fonte: manual de Ciências]**',
      isCorrect: true,
      feedback: 'Correto! Quando utilizamos as palavras exatas de outra fonte, devemos usar aspas e indicar a fonte.',
    },
  ];

  // -------------------------------------------------------------
  // 6. CREATIVE COMMONS SIMULATOR STATE (SITUAÇÕES PRÁTICAS)
  // -------------------------------------------------------------
  const [ccChoices, setCcChoices] = useState<Record<string, string>>({});
  const [ccScore, setCcScore] = useState<number | null>(null);
  const ccPracticalScenarios = [
    {
      id: 'cc-by',
      rule: 'CC BY (Indicar quem criou)',
      question: 'Queres usar uma ilustração num trabalho escolar e a licença indica CC BY. O que deves fazer?',
      options: [
        { id: 'by-1', label: 'Indicar com clareza quem criou a ilustração.', correct: true },
        { id: 'by-2', label: 'Pagar 10 euros ao autor antes de abrir a imagem.', correct: false },
        { id: 'by-3', label: 'Apagar a assinatura do autor para ninguém reparar.', correct: false },
      ],
      explanation: 'A regra BY (Atribuição) obriga a identificar e dar crédito a quem criou a obra.',
    },
    {
      id: 'cc-nc',
      rule: 'CC NC (Não comercial)',
      question: 'Encontraste uma música com a indicação NC. Podes usá-la num trabalho escolar apresentado na aula?',
      options: [
        { id: 'nc-1', label: 'Sim, porque é para fins escolares e não para ganhar dinheiro.', correct: true },
        { id: 'nc-2', label: 'Não, porque a regra NC proíbe qualquer tipo de apresentação.', correct: false },
        { id: 'nc-3', label: 'Apenas se cobrares uma entrada aos colegas para ver o trabalho.', correct: false },
      ],
      explanation: 'A regra NC (Não Comercial) permite o uso educativo e pessoal, proibindo apenas obter lucro financeiro.',
    },
    {
      id: 'cc-nd',
      rule: 'CC ND (Não alterar)',
      question: 'Uma fotografia tem a regra ND. O grupo pode recortar a imagem e mudar as cores de fundo?',
      options: [
        { id: 'nd-1', label: 'Não, a regra ND não permite alterar nem transformar o conteúdo original.', correct: true },
        { id: 'nd-2', label: 'Sim, desde que a fotografia seja colocada na capa.', correct: false },
        { id: 'nd-3', label: 'Sim, se ninguém disser nada ao professor.', correct: false },
      ],
      explanation: 'A regra ND (Sem Derivações) determina que a criação deve ser partilhada tal como o autor a fez, sem modificações.',
    },
    {
      id: 'cc-sa',
      rule: 'CC SA (Partilhar com a mesma licença)',
      question: 'Um desenho tem a indicação SA. Se adaptares o desenho e o partilhares, que licença deves manter?',
      options: [
        { id: 'sa-1', label: 'Deves partilhar a nova versão mantendo a mesma licença Creative Commons.', correct: true },
        { id: 'sa-2', label: 'Podes proibir todas as outras pessoas de verem o desenho.', correct: false },
        { id: 'sa-3', label: 'Podes fingir que o desenho original foi inventado por ti.', correct: false },
      ],
      explanation: 'A regra SA (ShareAlike) garante que as versões adaptadas continuam com as mesmas condições de partilha livre.',
    },
  ];

  // -------------------------------------------------------------
  // 7. AVATAR CHALLENGE STATE
  // -------------------------------------------------------------
  const [avatarHandle, setAvatarHandle] = useState('');
  const [avatarStyle, setAvatarStyle] = useState<'robo' | 'pixel' | 'ilustrado'>('robo');
  const [avatarColor, setAvatarColor] = useState('bg-purple-500');
  const [avatarPrivacyChecked, setAvatarPrivacyChecked] = useState(false);
  const [avatarScore, setAvatarScore] = useState<number | null>(null);
  const [avatarFeedback, setAvatarFeedback] = useState<string | null>(null);

  const handleAvatarSubmit = () => {
    if (!avatarHandle.trim()) {
      setAvatarFeedback('Por favor insere um nome criativo para o teu avatar!');
      return;
    }
    const containsPhoneOrEmail = /\d{9}/.test(avatarHandle) || /@/.test(avatarHandle);
    if (containsPhoneOrEmail) {
      setAvatarFeedback('⚠️ Cuidado! Não coloques o teu número de telemóvel nem o teu e-mail no nome do avatar. Protege a tua privacidade!');
      return;
    }
    if (!avatarPrivacyChecked) {
      setAvatarFeedback('⚠️ Por favor marca a opção de confirmação para confirmar que não incluíste dados pessoais desnecessários e que estás a proteger a tua privacidade.');
      return;
    }
    const score = 100;
    setAvatarScore(score);
    setAvatarFeedback('🎉 Excelente! Criaste a tua identidade visual de Criador Digital sem partilhar dados pessoais desnecessários.');
    reportCompletion('sim-avatar-challenge', 'Avatar Challenge', { avatarHandle, avatarPrivacyChecked, avatarStyle, avatarColor }, score);
  };

  // -------------------------------------------------------------
  // REPORT COMPLETION HELPER
  // -------------------------------------------------------------
  const reportCompletion = async (simId: string, activityTitle: string, payloadData?: any, score?: number) => {
    try {
      const res = await apiRequest('/api/pedagogical/activities/complete', {
        method: 'POST',
        body: JSON.stringify({
          activityId: simId,
          worldId: 3,
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
  const handleToneSelect = (id: string) => {
    setSelectedMessageTone(id);
    const item = messageOptions.find((m) => m.id === id);
    const score = item ? item.score : 50;
    setMessageScore(score);
    reportCompletion('sim-comunicacao-digital', 'Comunicação Digital', { toneId: id }, score);
  };

  const handleNetiquetteSubmit = () => {
    let correct = 0;
    netiquetteScenarios.forEach((scen) => {
      if (netiquetteChoices[scen.id] === scen.correct) correct++;
    });
    const score = Math.round((correct / netiquetteScenarios.length) * 100);
    setNetiquetteScore(score);
    reportCompletion('sim-netiqueta', 'Simulador de Netiqueta', { answers: netiquetteChoices }, score);
  };

  const handleCollabSubmit = () => {
    let correct = 0;
    collabScenarios.forEach((scen) => {
      const selected = scen.options.find((o) => o.id === collabChoices[scen.id]);
      if (selected && selected.correct) correct++;
    });
    const score = Math.round((correct / collabScenarios.length) * 100);
    setCollabScore(score);
    reportCompletion('sim-colaboracao', 'Simulador de Colaboração & Equipa', { answers: collabChoices }, score);
  };

  const handleCopyrightSubmit = () => {
    let correct = 0;
    copyrightScenarios.forEach((scen) => {
      if (copyrightChoices[scen.id] === scen.correct) correct++;
    });
    const score = Math.round((correct / copyrightScenarios.length) * 100);
    setCopyrightScore(score);
    reportCompletion('sim-direitos-autor', 'Direitos de Autor & Permissões', { answers: copyrightChoices }, score);
  };

  const handlePlagiarismSelect = (optId: string) => {
    setPlagiarismOption(optId);
    const item = plagiarismCases.find((c) => c.id === optId);
    const score = item && item.isCorrect ? 100 : 35;
    setPlagiarismScore(score);
    reportCompletion('sim-plagio-citacao', 'Simulador de Citação & Reconhecimento', { optionId: optId }, score);
  };

  const handleCcSubmit = () => {
    let correct = 0;
    ccPracticalScenarios.forEach((scen) => {
      const selected = scen.options.find((o) => o.id === ccChoices[scen.id]);
      if (selected && selected.correct) correct++;
    });
    const score = Math.round((correct / ccPracticalScenarios.length) * 100);
    setCcScore(score);
    reportCompletion('sim-creative-commons', 'Simulador de Licenças Creative Commons', { answers: ccChoices }, score);
  };

  // Helper
  const getSimProg = (simId: string) => {
    return world.simulatorsProgress?.find((p) => p.id === simId);
  };

  const topic1 = world.topics.find((t) => t.id === 'w3-t1');
  const topic2 = world.topics.find((t) => t.id === 'w3-t2');
  const topic3 = world.topics.find((t) => t.id === 'w3-t3');
  const topic4 = world.topics.find((t) => t.id === 'w3-t4');
  const topic5 = world.topics.find((t) => t.id === 'w3-t5');
  const topic6 = world.topics.find((t) => t.id === 'w3-t6');

  const isAssessmentDone = Boolean(
    world.hasAssessmentPassed ||
    (typeof world.bestAssessmentPercentage === 'number' && world.bestAssessmentPercentage > 0)
  );

  const completedSimsCount = world.simulatorsProgress?.filter((p) => p.completed).length || 0;
  const completedMissionsCount = completedSimsCount + (isAssessmentDone ? 1 : 0);
  const totalMissionsCount = 7;
  const routePercent = Math.min(100, Math.round((completedMissionsCount / totalMissionsCount) * 100));

  return (
    <div className="space-y-6">
      {/* 🚀 BANNER DE SUCESSO DE ATIVIDADE CONCLUÍDA */}
      {completedFeedback && (
        <div className="p-4 bg-purple-100 border border-purple-300 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black">
              ✓
            </div>
            <div>
              <p className="text-xs font-black text-purple-900 uppercase">
                Atividade Concluída: {completedFeedback.activityTitle}
              </p>
              <p className="text-xs text-purple-800">
                Pontuação: <strong>{completedFeedback.score}%</strong> | Ganhaste{' '}
                <strong>+{completedFeedback.xpGain} XP</strong>!
              </p>
            </div>
          </div>
          <span className="text-xs font-black bg-purple-200 text-purple-900 px-3 py-1.5 rounded-xl">
            Melhor Recorde: {completedFeedback.newBest}/100
          </span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🎨 HERO BANNER CRIADOR COLABORATIVO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#d8b4fe] via-[#e9d5ff] to-[#faf5ff] border border-[#c084fc] p-3.5 sm:p-4 lg:p-4.5 shadow-sm">
        {/* Soft background clouds and radial highlights */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-70 h-70 bg-purple-200/40 rounded-full blur-2xl pointer-events-none" />

        {/* Top Breadcrumb & Route Progress */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2 text-xs font-black text-[#581c87] tracking-wide uppercase">
            <span className="w-5 h-5 rounded-full bg-white text-purple-600 flex items-center justify-center text-xs shadow-2xs">
              🌐
            </span>
            <span>MUNDO 3</span>
            <span className="text-purple-600 font-bold">&gt;</span>
            <span>CRIADOR COLABORATIVO</span>
            <span className="text-base">🎨</span>
          </div>

          <div className="bg-white/95 backdrop-blur-md border border-white/90 rounded-xl px-2.5 py-1 shadow-2xs flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-800 tracking-wider">
              <span className="text-amber-500 text-xs">👑</span>
              <span>ROTA NO MUNDO</span>
            </div>
            <div className="w-16 sm:w-20 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/80">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${routePercent}%`,
                }}
              />
            </div>
            <span className="text-xs font-black text-slate-900 tabular-nums">
              {routePercent}% ({completedMissionsCount}/{totalMissionsCount})
            </span>
          </div>
        </div>

        {/* Middle Hero: Headline, Subtitle, Creative Mascot */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-2 relative z-10">
          <div className="max-w-xl space-y-0.5">
            <h1 className="text-base sm:text-lg lg:text-xl font-black text-slate-950 tracking-tight leading-tight">
              A Força da Criação: Comunicação Fixe, Direitos de Autor e Super-Equipas Online!
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-700 font-medium leading-normal max-w-lg">
              A tua missão de criador: partilhar ideias geniais com respeito, caçar plágio e usar licenças livres com orgulho! ✨
            </p>
          </div>
          <div className="shrink-0 flex justify-center sm:justify-end">
            <CreativeKidHero className="w-20 sm:w-24 lg:w-28 h-auto max-h-20 sm:max-h-22 drop-shadow-2xs" />
          </div>
        </div>

        {/* 7 Mission Navigation Cards */}
        <div className="space-y-2 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Missão 1: Conversas & Emojis */}
            <button
              onClick={() => onNavigateTopic('w3-t1')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'w3-t1'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${activeTopicId === 'w3-t1' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-600'}`}>
                  <MessageSquare className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className={`text-[10px] font-bold block ${activeTopicId === 'w3-t1' ? 'text-purple-100' : 'text-slate-400'}`}>Missão 1/7</span>
                  <span className="text-xs sm:text-sm font-black truncate">Conversas & Emojis</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {Boolean(getSimProg('sim-avatar-challenge')?.completed) ? (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-md ${activeTopicId === 'w3-t1' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Feito</span>
                  </span>
                ) : (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${activeTopicId === 'w3-t1' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    Por fazer
                  </span>
                )}
                <ChevronRight className={`w-4 h-4 shrink-0 ${activeTopicId === 'w3-t1' ? 'text-white' : 'text-purple-500'}`} />
              </div>
            </button>

            {/* Missão 2: Netiqueta */}
            <button
              onClick={() => onNavigateTopic('w3-t2')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'w3-t2'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${activeTopicId === 'w3-t2' ? 'bg-white/20 text-white' : 'bg-pink-50 text-pink-600'}`}>
                  <Smile className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className={`text-[10px] font-bold block ${activeTopicId === 'w3-t2' ? 'text-purple-100' : 'text-slate-400'}`}>Missão 2/7</span>
                  <span className="text-xs sm:text-sm font-black truncate">Netiqueta Fixe</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {Boolean(getSimProg('sim-netiqueta')?.completed) ? (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-md ${activeTopicId === 'w3-t2' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Feito</span>
                  </span>
                ) : (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${activeTopicId === 'w3-t2' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    Por fazer
                  </span>
                )}
                <ChevronRight className={`w-4 h-4 shrink-0 ${activeTopicId === 'w3-t2' ? 'text-white' : 'text-purple-500'}`} />
              </div>
            </button>

            {/* Missão 3: Trabalho em Equipa */}
            <button
              onClick={() => onNavigateTopic('w3-t3')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'w3-t3'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${activeTopicId === 'w3-t3' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
                  <Users className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className={`text-[10px] font-bold block ${activeTopicId === 'w3-t3' ? 'text-purple-100' : 'text-slate-400'}`}>Missão 3/7</span>
                  <span className="text-xs sm:text-sm font-black truncate">Super-Equipas</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {Boolean(getSimProg('sim-colaboracao')?.completed) ? (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-md ${activeTopicId === 'w3-t3' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Feito</span>
                  </span>
                ) : (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${activeTopicId === 'w3-t3' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    Por fazer
                  </span>
                )}
                <ChevronRight className={`w-4 h-4 shrink-0 ${activeTopicId === 'w3-t3' ? 'text-white' : 'text-purple-500'}`} />
              </div>
            </button>

            {/* Missão 4: Direitos de Autor */}
            <button
              onClick={() => onNavigateTopic('w3-t4')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'w3-t4'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${activeTopicId === 'w3-t4' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-600'}`}>
                  <Copyright className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className={`text-[10px] font-bold block ${activeTopicId === 'w3-t4' ? 'text-purple-100' : 'text-slate-400'}`}>Missão 4/7</span>
                  <span className="text-xs sm:text-sm font-black truncate">Direitos de Autor</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {Boolean(getSimProg('sim-direitos-autor')?.completed) ? (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-md ${activeTopicId === 'w3-t4' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Feito</span>
                  </span>
                ) : (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${activeTopicId === 'w3-t4' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    Por fazer
                  </span>
                )}
                <ChevronRight className={`w-4 h-4 shrink-0 ${activeTopicId === 'w3-t4' ? 'text-white' : 'text-purple-500'}`} />
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Missão 5: Caça ao Plágio */}
            <button
              onClick={() => onNavigateTopic('w3-t5')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'w3-t5'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${activeTopicId === 'w3-t5' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600'}`}>
                  <FileText className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className={`text-[10px] font-bold block ${activeTopicId === 'w3-t5' ? 'text-purple-100' : 'text-slate-400'}`}>Missão 5/7</span>
                  <span className="text-xs sm:text-sm font-black truncate">Caça ao Plágio</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {Boolean(getSimProg('sim-plagio-citacao')?.completed) ? (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-md ${activeTopicId === 'w3-t5' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Feito</span>
                  </span>
                ) : (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${activeTopicId === 'w3-t5' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    Por fazer
                  </span>
                )}
                <ChevronRight className={`w-4 h-4 shrink-0 ${activeTopicId === 'w3-t5' ? 'text-white' : 'text-purple-500'}`} />
              </div>
            </button>

            {/* Missão 6: Licenças Livres */}
            <button
              onClick={() => onNavigateTopic('w3-t6')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'w3-t6'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${activeTopicId === 'w3-t6' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                  <Share2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className={`text-[10px] font-bold block ${activeTopicId === 'w3-t6' ? 'text-purple-100' : 'text-slate-400'}`}>Missão 6/7</span>
                  <span className="text-xs sm:text-sm font-black truncate">Licenças Livres</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {Boolean(getSimProg('sim-creative-commons')?.completed) ? (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-md ${activeTopicId === 'w3-t6' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Feito</span>
                  </span>
                ) : (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${activeTopicId === 'w3-t6' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    Por fazer
                  </span>
                )}
                <ChevronRight className={`w-4 h-4 shrink-0 ${activeTopicId === 'w3-t6' ? 'text-white' : 'text-purple-500'}`} />
              </div>
            </button>

            {/* Missão 7: Quiz do Criador */}
            <button
              onClick={() => onNavigateTopic('avaliacao')}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTopicId === 'avaliacao'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-400'
                  : 'bg-white/95 text-slate-800 border border-white/80 shadow-xs hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${activeTopicId === 'avaliacao' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'}`}>
                  <Award className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className={`text-[10px] font-bold block ${activeTopicId === 'avaliacao' ? 'text-purple-100' : 'text-slate-400'}`}>Missão 7/7</span>
                  <span className="text-xs sm:text-sm font-black truncate">Quiz do Criador</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {isAssessmentDone ? (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-md ${activeTopicId === 'avaliacao' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Feito</span>
                  </span>
                ) : (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${activeTopicId === 'avaliacao' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    Por fazer
                  </span>
                )}
                <ChevronRight className={`w-4 h-4 shrink-0 ${activeTopicId === 'avaliacao' ? 'text-white' : 'text-purple-500'}`} />
              </div>
            </button>
          </div>
        </div>
      </div>
      {activeTopicId === 'w3-t1' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-xs">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-purple-600 uppercase tracking-wider">
                    🎯 MISSÃO 1/7
                  </span>
                  <AudioReaderButton
                    textToRead="Missão 1: Conversas e Emojis. Hoje vais descobrir como comunicar online com clareza, empatia e sem mal-entendidos. Reler as tuas mensagens e indicar prazos claros ajuda toda a gente a trabalhar em equipa!"
                    label="Ouvir Missão"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  Conversas & Emojis 💬
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Hoje vais descobrir como comunicar online com clareza, simpatia e boa <GlossaryTerm term="netiqueta">netiqueta</GlossaryTerm>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-comunicacao-digital')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-comunicacao-digital')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-amber-50/90 text-amber-900 border border-amber-200 text-xs font-bold px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>A conquistar: até 100 XP</span>
                </span>
              )}
            </div>
          </div>

          {/* 2-Phase Switcher */}
          <MissionPhaseSwitcher
            currentPhase={missionPhase}
            onPhaseChange={setMissionPhase}
            accentColor="purple"
            simulatorCompleted={Boolean(getSimProg('sim-comunicacao-digital')?.completed)}
            score={getSimProg('sim-comunicacao-digital')?.score}
          />

          {missionPhase === 'theory' ? (
            /* 💡 FASE 1: DESCOBRIR & APRENDER */
            <div className="space-y-6">
              {/* 💡 1. APRENDE */}
              <div className="bg-white border-2 border-purple-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-purple-700">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h4 className="text-sm font-black uppercase tracking-wide">
                    💡 1. Aprende: Comunicar com Clareza e Empatia
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3.5 space-y-1">
                    <div className="text-xl">💬</div>
                    <h5 className="text-xs font-black text-purple-900">Pessoas Reais</h5>
                    <p className="text-xs text-slate-600 leading-snug">
                      Do outro lado do ecrã está uma pessoa real com sentimentos. Reler a tua mensagem antes de enviar evita muitas discussões!
                    </p>
                  </div>

                  <div className="bg-fuchsia-50/70 border border-fuchsia-200 rounded-2xl p-3.5 space-y-1">
                    <div className="text-xl">😊</div>
                    <h5 className="text-xs font-black text-fuchsia-900">Emojis e Tom de Voz</h5>
                    <p className="text-xs text-slate-600 leading-snug">
                      Como ninguém ouve a tua voz, usa emojis simpáticos para mostrar o teu tom. Se estiveres chateado, espera 5 minutos antes de responder.
                    </p>
                  </div>
                </div>

                <TopicIllustrationCard topicId="w3-t1" />
              </div>

              {/* Call to action to practice */}
              <div className="pt-2 flex justify-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => setMissionPhase('simulator')}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
                >
                  <span>Já li a teoria! Ir para o Desafio Prático 🎮</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          ) : (
            /* 🎮 FASE 2: PRATICAR & DESAFIAR */
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-1">
                <button
                  type="button"
                  onClick={() => setMissionPhase('theory')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-700 bg-slate-100 hover:bg-purple-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Rever Guia de Teoria 💡</span>
                </button>
              </div>

              {/* 🎮 2. EXPERIMENTA */}
              <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5 text-purple-700">
                    <Sparkles className="w-5 h-5" />
                    <h4 className="text-base font-black uppercase tracking-wide">
                      🎮 2. Experimenta: Simulador de Mensagens
                    </h4>
                  </div>
              <span className="text-xs font-bold text-slate-500">
                Clareza e respeito na escrita
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              O teu grupo está a preparar um trabalho de TIC e precisas de pedir ao Diogo a parte dele do resumo.
              Qual destas mensagens é clara, respeitosa, adequada à situação e contém um pedido concreto?
            </p>

            <div className="space-y-3">
              {messageOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => handleToneSelect(opt.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedMessageTone === opt.id
                      ? opt.score === 100
                        ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-300/30'
                        : 'bg-amber-50 border-amber-300 ring-2 ring-amber-300/30'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-black text-slate-900">{opt.tone}</span>
                    <span className="text-[11px] font-bold text-slate-500">
                      Pontuação: {opt.score}/100
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 italic bg-white p-3 rounded-xl border border-slate-200">
                    "{opt.text}"
                  </p>
                  {selectedMessageTone === opt.id && (
                    <p className="mt-2 text-xs font-bold text-slate-700">
                      💡 {opt.feedback}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {messageScore !== null && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-950 font-medium">
                Regra de Ouro: Como a outra pessoa não ouve a tua voz nem vê a tua expressão, reler a mensagem e garantir que é clara e respeitosa evita mal-entendidos e resolve problemas com rapidez!
              </div>
            )}
          </div>

          {/* 🧠 3.1 AUTOAVALIAÇÃO METACOGNITIVA */}
          <MetacognitionWidget
            missionId="w3-t1"
            worldThemeColor="purple"
            questionPrompt="Como avalias a tua forma de escrever mensagens quando trabalhas em equipa?"
            options={[
              'Já sei reler sempre e colocar o prazo bem claro!',
              'Vou ter mais cuidado para não parecer seco ou impaciente.',
              'Aprendi que oferecer ajuda torna o trabalho muito mais rápido!',
            ]}
          />

          {/* 👉 4. PRÓXIMA MISSÃO ACTION BAR */}
          <div className="bg-gradient-to-r from-slate-50 via-white to-purple-50/40 border-2 border-slate-200/90 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 text-xl shadow-2xs">
                ⭐
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 leading-snug">
                Excelente comunicação! Agora vamos descobrir o código secreto da Netiqueta!
              </span>
            </div>
            <button
              onClick={() => onNavigateTopic('w3-t2')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Próxima Missão: 2. Netiqueta Fixe ➔</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )}

      {/* ========================================================= */}
      {/* MISSÃO 2: NETIQUETA */}
      {/* ========================================================= */}
      {activeTopicId === 'w3-t2' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-xs">
                <Smile className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-black text-purple-600 uppercase tracking-wider block">
                  🎯 MISSÃO 2/7
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Netiqueta Fixe ✨
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Hoje vais aprender as boas maneiras secretas da Internet!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-netiqueta')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-netiqueta')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-amber-50/90 text-amber-900 border border-amber-200 text-xs font-bold px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>🎯 Por Concluir • Ganha até 100 XP</span>
                </span>
              )}
            </div>
          </div>

          {/* 2-Phase Switcher */}
          <MissionPhaseSwitcher
            currentPhase={missionPhase}
            onPhaseChange={setMissionPhase}
            accentColor="purple"
            simulatorCompleted={Boolean(getSimProg('sim-netiqueta')?.completed)}
            score={getSimProg('sim-netiqueta')?.score}
          />

          {missionPhase === 'theory' ? (
            /* 💡 FASE 1: DESCOBRIR & APRENDER */
            <div className="space-y-6">
              {/* 💡 1. APRENDE */}
              <div className="bg-white border-2 border-purple-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-purple-700">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h4 className="text-sm font-black uppercase tracking-wide">
                    💡 1. Aprende: As Boas Maneiras da Rede
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3.5 space-y-1">
                    <div className="text-xl">🌟</div>
                    <h5 className="text-xs font-black text-purple-900">Netiqueta = Respeito</h5>
                    <p className="text-xs text-slate-600 leading-snug">
                      É a etiqueta da rede: ouvir os outros, não espalhar boatos e conviver com calma nos grupos de conversas.
                    </p>
                  </div>

                  <div className="bg-pink-50/70 border border-pink-200 rounded-2xl p-3.5 space-y-1">
                    <div className="text-xl">📢</div>
                    <h5 className="text-xs font-black text-pink-900">Não Grites com Letras!</h5>
                    <p className="text-xs text-slate-600 leading-snug">
                      Escrever com TODAS AS MAIÚSCULAS parece que estás a gritar aos ouvidos dos colegas. Usa letras normais!
                    </p>
                  </div>
                </div>

                <TopicIllustrationCard topicId="w3-t2" />
              </div>

              {/* Call to action to practice */}
              <div className="pt-2 flex justify-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => setMissionPhase('simulator')}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
                >
                  <span>Já li a teoria! Ir para o Desafio Prático 🎮</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          ) : (
            /* 🎮 FASE 2: PRATICAR & DESAFIAR */
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-1">
                <button
                  type="button"
                  onClick={() => setMissionPhase('theory')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-700 bg-slate-100 hover:bg-purple-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Rever Guia de Teoria 💡</span>
                </button>
              </div>

              {/* 🎮 2. EXPERIMENTA */}
              <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5 text-purple-700">
                    <Sparkles className="w-5 h-5" />
                    <h4 className="text-base font-black uppercase tracking-wide">
                      🎮 2. Experimenta: Simulador de Netiqueta
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    Avalia comportamentos online
                  </span>
                </div>

            <div className="space-y-4">
              {netiquetteScenarios.map((scen) => (
                <div
                  key={scen.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3"
                >
                  <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                    "<HighlightClues text={scen.action} variant="blue" />"
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setNetiquetteChoices((prev) => ({ ...prev, [scen.id]: 'correto' }))
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        netiquetteChoices[scen.id] === 'correto'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Respeita a Netiqueta
                    </button>
                    <button
                      onClick={() =>
                        setNetiquetteChoices((prev) => ({ ...prev, [scen.id]: 'incorreto' }))
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        netiquetteChoices[scen.id] === 'incorreto'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Viola a Netiqueta
                    </button>
                  </div>
                  {netiquetteChoices[scen.id] && (
                    <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                      💡 {scen.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleNetiquetteSubmit}
                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Validar Avaliação de Netiqueta
              </button>
            </div>

            {netiquetteScore !== null && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-950 font-medium">
                Pontuação da Netiqueta: {netiquetteScore}/100. Um bom Criador Digital constrói um ambiente digital acolhedor e respeitoso para todos!
              </div>
            )}
          </div>

          {/* 🎨 3. DESAFIO ESPECIAL: AVATAR CHALLENGE (IDENTIDADE DIGITAL) */}
          <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-purple-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  Desafio de Identidade: Avatar Challenge
                </h4>
              </div>
              {getSimProg('sim-avatar-challenge')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-avatar-challenge')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-amber-50/90 text-amber-900 border border-amber-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>🎯 Por Concluir • Ganha até 100 XP</span>
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Como <strong>Criador Digital</strong>, deves criar uma identidade visual para as plataformas escolares, sem expor dados pessoais ou fotografias reais do teu rosto.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl ${avatarColor} flex items-center justify-center text-white shadow-md transition-all shrink-0`}>
                {avatarStyle === 'robo' && <span className="text-4xl sm:text-5xl">🤖</span>}
                {avatarStyle === 'pixel' && <span className="text-4xl sm:text-5xl">👾</span>}
                {avatarStyle === 'ilustrado' && <span className="text-4xl sm:text-5xl">🎨</span>}
              </div>

              <div className="flex-1 space-y-3 w-full">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                    Estilo de Avatar
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setAvatarStyle('robo')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${avatarStyle === 'robo' ? 'bg-purple-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
                    >
                      🤖 Robô Criador
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarStyle('pixel')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${avatarStyle === 'pixel' ? 'bg-purple-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
                    >
                      👾 Pixel Art
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarStyle('ilustrado')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${avatarStyle === 'ilustrado' ? 'bg-purple-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
                    >
                      🎨 Ilustrado
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                    Cor de Fundo
                  </label>
                  <div className="flex gap-2">
                    {['bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500'].map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setAvatarColor(col)}
                        className={`w-7 h-7 rounded-full ${col} ring-2 ${avatarColor === col ? 'ring-purple-700 scale-110' : 'ring-transparent'}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                    Nome / Handle do Avatar (Sem nome completo nem contactos)
                  </label>
                  <input
                    type="text"
                    value={avatarHandle}
                    onChange={(e) => setAvatarHandle(e.target.value)}
                    placeholder="Ex: CriadorEco_6A"
                    className="w-full text-xs font-bold p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="avatarPrivacy"
                    checked={avatarPrivacyChecked}
                    onChange={(e) => setAvatarPrivacyChecked(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded-md focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="avatarPrivacy" className="text-xs text-slate-700 font-semibold cursor-pointer">
                    Confirmo que não incluí dados pessoais desnecessários nem fotografias reais de pessoas.
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleAvatarSubmit}
                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Concluir Desafio do Avatar
              </button>
            </div>

            {avatarFeedback && (
              <div className={`p-4 rounded-2xl text-xs font-medium ${avatarScore === 100 ? 'bg-emerald-50 border border-emerald-200 text-emerald-950' : 'bg-amber-50 border border-amber-200 text-amber-950'}`}>
                {avatarFeedback}
              </div>
            )}
          </div>

          {/* 👉 4. PRÓXIMA MISSÃO */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span>Parabéns pelas boas maneiras! Vamos formar uma super-equipa online!</span>
            </div>
            <button
              onClick={() => onNavigateTopic('w3-t3')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>👉 Próxima Missão: 3. Super-Equipa Online 🤝</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )}

      {/* ========================================================= */}
      {/* MISSÃO 3: TRABALHAR EM EQUIPA */}
      {/* ========================================================= */}
      {activeTopicId === 'w3-t3' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-xs">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-black text-purple-600 uppercase tracking-wider block">
                  🎯 MISSÃO 3/7
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Super-Equipa Online 🤝
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Hoje vais descobrir como trabalhar em equipa e vencer desafios juntos!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-colaboracao')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-colaboracao')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-amber-50/90 text-amber-900 border border-amber-200 text-xs font-bold px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>🎯 Por Concluir • Ganha até 100 XP</span>
                </span>
              )}
            </div>
          </div>

          {/* 2-Phase Switcher */}
          <MissionPhaseSwitcher
            currentPhase={missionPhase}
            onPhaseChange={setMissionPhase}
            accentColor="purple"
            simulatorCompleted={Boolean(getSimProg('sim-colaboracao')?.completed)}
            score={getSimProg('sim-colaboracao')?.score}
          />

          {missionPhase === 'theory' ? (
            /* 💡 FASE 1: DESCOBRIR & APRENDER */
            <div className="space-y-6">
              {/* 💡 1. APRENDE */}
              <div className="bg-white border-2 border-purple-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-purple-700">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h4 className="text-sm font-black uppercase tracking-wide">
                💡 1. Aprende: O Poder da Colaboração
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3.5 space-y-1">
                <div className="text-xl">🧩</div>
                <h5 className="text-xs font-black text-purple-900">Tarefas Divididas</h5>
                <p className="text-xs text-slate-600 leading-snug">
                  Numa super-equipa ninguém faz tudo sozinho e ninguém fica sem fazer nada. Dividem-se tarefas justas e cumprem-se prazos!
                </p>
              </div>

              <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3.5 space-y-1">
                <div className="text-xl">🤝</div>
                <h5 className="text-xs font-black text-indigo-900">Diálogo em Primeiro Lugar</h5>
                <p className="text-xs text-slate-600 leading-snug">
                  Nunca apagues o texto de um colega sem falar com ele com calma. Conversem para juntar o melhor das duas ideias!
                </p>
              </div>
            </div>

            <TopicIllustrationCard topicId="w3-t3" />
          </div>

          {/* Call to action to practice */}
          <div className="pt-2 flex justify-center sm:justify-end">
            <button
              type="button"
              onClick={() => setMissionPhase('simulator')}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
            >
              <span>Já li a teoria! Ir para o Desafio Prático 🎮</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      ) : (
        /* 🎮 FASE 2: PRATICAR & DESAFIAR */
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={() => setMissionPhase('theory')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-700 bg-slate-100 hover:bg-purple-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Rever Guia de Teoria 💡</span>
            </button>
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-purple-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  🎮 2. Experimenta: Simulador de Colaboração & Equipa
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Resolução de situações de grupo
              </span>
            </div>

            <div className="space-y-4">
              {collabScenarios.map((scen) => (
                <div
                  key={scen.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3"
                >
                  <p className="text-xs sm:text-sm font-bold text-slate-900">
                    📋 Situação: {scen.situation}
                  </p>
                  <div className="space-y-2">
                    {scen.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() =>
                          setCollabChoices((prev) => ({ ...prev, [scen.id]: opt.id }))
                        }
                        className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition-all border ${
                          collabChoices[scen.id] === opt.id
                            ? 'bg-purple-50 border-purple-300 text-purple-950 font-bold ring-2 ring-purple-200'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleCollabSubmit}
                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Submeter Decisões de Equipa
              </button>
            </div>

            {collabScore !== null && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-950 font-medium">
                Desempenho em Equipa: {collabScore}/100. Uma boa equipa ouve todas as opiniões, divide o esforço com equilíbrio e ajuda quem precisa!
              </div>
            )}
          </div>

          {/* 👉 4. PRÓXIMA MISSÃO */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span>Grande espírito de equipa! Agora vamos descobrir os Direitos de Autor!</span>
            </div>
            <button
              onClick={() => onNavigateTopic('w3-t4')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>👉 Próxima Missão: 4. Direitos de Autor 🎨</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )}

      {/* ========================================================= */}
      {/* MISSÃO 4: DIREITOS DE AUTOR */}
      {/* ========================================================= */}
      {activeTopicId === 'w3-t4' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-xs">
                <Copyright className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-black text-purple-600 uppercase tracking-wider block">
                  🎯 MISSÃO 4/7
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Direitos de Autor 🎨
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Hoje vais aprender a respeitar o trabalho dos artistas e criadores da Internet!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-direitos-autor')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-direitos-autor')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-amber-50/90 text-amber-900 border border-amber-200 text-xs font-bold px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>🎯 Por Concluir • Ganha até 100 XP</span>
                </span>
              )}
            </div>
          </div>

          {/* 2-Phase Switcher */}
          <MissionPhaseSwitcher
            currentPhase={missionPhase}
            onPhaseChange={setMissionPhase}
            accentColor="purple"
            simulatorCompleted={Boolean(getSimProg('sim-direitos-autor')?.completed)}
            score={getSimProg('sim-direitos-autor')?.score}
          />

          {missionPhase === 'theory' ? (
            /* 💡 FASE 1: DESCOBRIR & APRENDER */
            <div className="space-y-6">
              {/* 💡 1. APRENDE */}
              <div className="bg-white border-2 border-purple-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-purple-700">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h4 className="text-sm font-black uppercase tracking-wide">
                💡 1. Aprende: Respeitar a Criação Alheia
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3.5 space-y-1">
                <div className="text-xl">🎨</div>
                <h5 className="text-xs font-black text-purple-900">Criar Dá Trabalho</h5>
                <p className="text-xs text-slate-600 leading-snug">
                  Toda a imagem, som ou texto foi feito por alguém. Esse esforço é protegido por lei como Direito de Autor.
                </p>
              </div>

              <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3.5 space-y-1">
                <div className="text-xl">⚖️</div>
                <h5 className="text-xs font-black text-rose-900">Encontrar Não é Ser Dono</h5>
                <p className="text-xs text-slate-600 leading-snug">
                  Aparecer numa pesquisa do Google não quer dizer que seja livre para copiar. Pede autorização ou procura recursos livres!
                </p>
              </div>
            </div>

            <TopicIllustrationCard topicId="w3-t4" />
          </div>

          {/* Call to action to practice */}
          <div className="pt-2 flex justify-center sm:justify-end">
            <button
              type="button"
              onClick={() => setMissionPhase('simulator')}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
            >
              <span>Já li a teoria! Ir para o Desafio Prático 🎮</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      ) : (
        /* 🎮 FASE 2: PRATICAR & DESAFIAR */
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={() => setMissionPhase('theory')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-700 bg-slate-100 hover:bg-purple-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Rever Guia de Teoria 💡</span>
            </button>
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-purple-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  🎮 2. Experimenta: Simulador de Direitos de Autor & Permissões
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                O que podemos ou não utilizar
              </span>
            </div>

            <div className="space-y-4">
              {copyrightScenarios.map((scen) => (
                <div
                  key={scen.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3"
                >
                  <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                    "<HighlightClues text={scen.case} variant="amber" />"
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCopyrightChoices((prev) => ({ ...prev, [scen.id]: 'permitido' }))
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        copyrightChoices[scen.id] === 'permitido'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Permitido (Correto)
                    </button>
                    <button
                      onClick={() =>
                        setCopyrightChoices((prev) => ({ ...prev, [scen.id]: 'proibido' }))
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        copyrightChoices[scen.id] === 'proibido'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Não Permitido (Viola Regras)
                    </button>
                  </div>
                  {copyrightChoices[scen.id] && (
                    <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                      💡 {scen.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleCopyrightSubmit}
                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Avaliar Direitos de Autor
              </button>
            </div>

            {copyrightScore !== null && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-950 font-medium">
                Avaliação de Permissões: {copyrightScore}/100. Lembra-te: estar na Internet não significa que seja livre para copiar!
              </div>
            )}
          </div>

          {/* 👉 4. PRÓXIMA MISSÃO */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span>Muito bem! Sabes respeitar os autores. Agora vamos à caça do plágio!</span>
            </div>
            <button
              onClick={() => onNavigateTopic('w3-t5')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>👉 Próxima Missão: 5. Caça ao Plágio 📜</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )}

      {/* ========================================================= */}
      {/* MISSÃO 5: PLÁGIO E AUTORIA */}
      {/* ========================================================= */}
      {activeTopicId === 'w3-t5' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-xs">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-black text-purple-600 uppercase tracking-wider block">
                  🎯 MISSÃO 5/7
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Caça ao Plágio 📜
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Hoje vais descobrir como citar autores e dar valor ao teu trabalho!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-plagio-citacao')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-plagio-citacao')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-amber-50/90 text-amber-900 border border-amber-200 text-xs font-bold px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>🎯 Por Concluir • Ganha até 100 XP</span>
                </span>
              )}
            </div>
          </div>

          {/* 2-Phase Switcher */}
          <MissionPhaseSwitcher
            currentPhase={missionPhase}
            onPhaseChange={setMissionPhase}
            accentColor="purple"
            simulatorCompleted={Boolean(getSimProg('sim-plagio-citacao')?.completed)}
            score={getSimProg('sim-plagio-citacao')?.score}
          />

          {missionPhase === 'theory' ? (
            /* 💡 FASE 1: DESCOBRIR & APRENDER */
            <div className="space-y-6">
              {/* 💡 1. APRENDE */}
              <div className="bg-white border-2 border-purple-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-purple-700">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h4 className="text-sm font-black uppercase tracking-wide">
                💡 1. Aprende: Honestidade e Citação
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3.5 space-y-1">
                <div className="text-xl">🚫</div>
                <h5 className="text-xs font-black text-rose-900">O que é Plágio?</h5>
                <p className="text-xs text-slate-600 leading-snug">
                  Copiar o trabalho de outra pessoa e dizer que foste tu que fizeste não vale: chama-se plágio e desrespeita quem o criou.
                </p>
              </div>

              <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3.5 space-y-1">
                <div className="text-xl">🏷️</div>
                <h5 className="text-xs font-black text-purple-900">Citar Dá Brilho</h5>
                <p className="text-xs text-slate-600 leading-snug">
                  Dizer "Segundo o autor X..." e colocar as fontes no fim do trabalho mostra que és um estudante atento, maduro e honesto.
                </p>
              </div>
            </div>

            <TopicIllustrationCard topicId="w3-t5" />
          </div>

          {/* Call to action to practice */}
          <div className="pt-2 flex justify-center sm:justify-end">
            <button
              type="button"
              onClick={() => setMissionPhase('simulator')}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
            >
              <span>Já li a teoria! Ir para o Desafio Prático 🎮</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      ) : (
        /* 🎮 FASE 2: PRATICAR & DESAFIAR */
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={() => setMissionPhase('theory')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-700 bg-slate-100 hover:bg-purple-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Rever Guia de Teoria 💡</span>
            </button>
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-purple-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  🎮 2. Experimenta: Simulador de Citação & Reconhecimento
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Aprende a indicar autores e fontes
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-[10px] font-black uppercase text-purple-600 block">
                Texto Original no Manual de Ciências:
              </span>
              <p className="text-xs text-slate-800 italic font-medium">
                "Os golfinhos conseguem comunicar através de diferentes sons."
              </p>
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-800">
              Qual das opções abaixo podes colocar no teu trabalho de grupo para respeitar o autor sem cometer plágio?
            </p>

            <div className="space-y-3">
              {plagiarismCases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handlePlagiarismSelect(c.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    plagiarismOption === c.id
                      ? c.isCorrect
                        ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200'
                        : 'bg-rose-50 border-rose-300 ring-2 ring-rose-200'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-black ${c.isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                      {c.title}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {c.isCorrect ? 'Válido' : 'Plágio'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    <HighlightClues text={c.text} variant="emerald" />
                  </p>
                  {plagiarismOption === c.id && (
                    <p className="mt-2 text-xs font-bold text-slate-800">
                      💡 {c.feedback}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {plagiarismScore !== null && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-950 font-medium">
                Indicar as fontes e os autores não diminui o teu trabalho: pelo contrário, mostra que pesquisaste bem e respeitas quem criou o conteúdo!
              </div>
            )}
          </div>

          {/* 👉 4. PRÓXIMA MISSÃO */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span>Excelente honestidade científica! Agora vamos aprender sobre licenças livres!</span>
            </div>
            <button
              onClick={() => onNavigateTopic('w3-t6')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>👉 Próxima Missão: 6. Licenças Livres 🔓</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )}

      {/* ========================================================= */}
      {/* MISSÃO 6: CREATIVE COMMONS */}
      {/* ========================================================= */}
      {activeTopicId === 'w3-t6' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-xs">
                <Share2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-black text-purple-600 uppercase tracking-wider block">
                  🎯 MISSÃO 6/7
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Licenças Livres 🔓
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Hoje vais desvendar os símbolos das licenças Creative Commons!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-creative-commons')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-creative-commons')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-amber-50/90 text-amber-900 border border-amber-200 text-xs font-bold px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>🎯 Por Concluir • Ganha até 100 XP</span>
                </span>
              )}
            </div>
          </div>

          {/* 2-Phase Switcher */}
          <MissionPhaseSwitcher
            currentPhase={missionPhase}
            onPhaseChange={setMissionPhase}
            accentColor="purple"
            simulatorCompleted={Boolean(getSimProg('sim-creative-commons')?.completed)}
            score={getSimProg('sim-creative-commons')?.score}
          />

          {missionPhase === 'theory' ? (
            /* 💡 FASE 1: DESCOBRIR & APRENDER */
            <div className="space-y-6">
              {/* 💡 1. APRENDE */}
              <div className="bg-white border-2 border-purple-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-purple-700">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h4 className="text-sm font-black uppercase tracking-wide">
                💡 1. Aprende: Partilhar com Creative Commons
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3.5 space-y-1">
                <div className="text-xl">🔓</div>
                <h5 className="text-xs font-black text-purple-900">Partilha Aberta</h5>
                <p className="text-xs text-slate-600 leading-snug">
                  Com o Creative Commons, os criadores autorizam toda a gente a usar a sua obra sob regras simples e transparentes.
                </p>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 space-y-1">
                <div className="text-xl">🏷️</div>
                <h5 className="text-xs font-black text-emerald-900">Símbolos Fáceis</h5>
                <p className="text-xs text-slate-600 leading-snug">
                  BY exige dar os créditos ao autor; NC proíbe vender para ganhar dinheiro; ND proíbe alterações à obra original.
                </p>
              </div>
            </div>

            <TopicIllustrationCard topicId="w3-t6" />
          </div>

          {/* Call to action to practice */}
          <div className="pt-2 flex justify-center sm:justify-end">
            <button
              type="button"
              onClick={() => setMissionPhase('simulator')}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
            >
              <span>Já li a teoria! Ir para o Desafio Prático 🎮</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      ) : (
        /* 🎮 FASE 2: PRATICAR & DESAFIAR */
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={() => setMissionPhase('theory')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-700 bg-slate-100 hover:bg-purple-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Rever Guia de Teoria 💡</span>
            </button>
          </div>

          {/* 🎮 2. EXPERIMENTA (SITUAÇÕES PRÁTICAS) */}
          <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-purple-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  🎮 2. Experimenta: Simulador de Licenças Creative Commons
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Lê a licença e descobre o que podes fazer com este conteúdo.
              </span>
            </div>

            <div className="space-y-4">
              {ccPracticalScenarios.map((scen) => (
                <div key={scen.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-800 font-mono font-black text-xs rounded-lg">
                      {scen.rule}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">{scen.question}</p>
                  <div className="space-y-2">
                    {scen.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() =>
                          setCcChoices((prev) => ({ ...prev, [scen.id]: opt.id }))
                        }
                        className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition-all border ${
                          ccChoices[scen.id] === opt.id
                            ? 'bg-purple-50 border-purple-300 text-purple-950 font-bold ring-2 ring-purple-200'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {ccChoices[scen.id] && (
                    <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                      💡 {scen.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleCcSubmit}
                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Validar Licenças Creative Commons
              </button>
            </div>

            {ccScore !== null && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-950 font-medium">
                {ccScore === 100
                  ? 'Correto! A licença indica o que podes fazer com este conteúdo.'
                  : `Resultado do Simulador: ${ccScore}/100. A licença indica o que podes fazer com este conteúdo.`}
              </div>
            )}
          </div>

          {/* 👉 4. PRÓXIMA MISSÃO */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span>Completaste todas as missões do Criador! O desafio final está pronto!</span>
            </div>
            <button
              onClick={() => onNavigateTopic('avaliacao')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🏆 Ir para a Avaliação Final: Quiz do Criador</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )}

      {/* ========================================================= */}
      {/* SEPARADOR 7: AVALIAÇÃO FINAL */}
      {/* ========================================================= */}
      {activeTopicId === 'avaliacao' && (
        <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 sm:p-10 shadow-sm max-w-3xl mx-auto space-y-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto shadow-xs">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-black text-purple-600 uppercase tracking-wider block">
              🏆 MISSÃO 7/7 · O DESAFIO FINAL
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Quiz do Criador Digital 🎨
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
              Mostra que dominas a comunicação online, a netiqueta, o trabalho em equipa e o respeito pelos direitos de autor!
            </p>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl max-w-md mx-auto text-xs text-purple-950 font-semibold space-y-1">
            <p>🏆 Requisito para desbloquear o Mundo 4: Média &gt;= {PROGRESSION_CONFIG.PASSING_THRESHOLD}%</p>
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
              className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm px-8 py-3.5 rounded-2xl shadow-md transition-all hover:scale-105 inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Começar Desafio Final (10 Perguntas)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
