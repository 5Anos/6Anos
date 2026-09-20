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
  Award,
  BookOpen,
  Sparkles,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { WorldSummary } from '../types';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { TopicIllustrationCard } from './TopicIllustrationCard';
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
      action: 'Num grupo de trabalho, um colega tem uma ideia diferente da tua e tu explicas com calma a tua proposta, ouvindo também a opinião dele.',
      correct: 'correto',
      explanation: 'Podemos ter opiniões diferentes e debater ideias mantendo sempre a educação e o respeito mútuo.',
    },
    {
      id: 'net-2',
      action: 'Criar um grupo ou partilhar mensagens para gozar, excluir ou humilhar um colega da turma.',
      correct: 'incorreto',
      explanation: 'Excluir, gozar ou humilhar colegas viola as regras de respeito e convivência na Internet.',
    },
    {
      id: 'net-3',
      action: 'Escrever frases inteiras em MAIÚSCULAS para exigir que os colegas respondam imediatamente.',
      correct: 'incorreto',
      explanation: 'Na Internet, escrever em maiúsculas parece que estamos a gritar e pode criar conflitos desnecessários.',
    },
    {
      id: 'net-4',
      action: 'Fazer uma captura de ecrã (screenshot) de uma mensagem privada de um colega e publicá-la num grupo público sem a sua autorização.',
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
      case: 'A Inês encontrou uma música na Internet e quer usá-la como fundo num vídeo escolar só porque a encontrou online.',
      correct: 'proibido',
      explanation: 'Estar na Internet não significa que seja livre para copiar. É preciso verificar se podemos utilizar o conteúdo e quais são as regras.',
    },
    {
      id: 'cpr-2',
      case: 'O Afonso utilizou uma foto de um banco de imagens gratuito que autoriza o uso em trabalhos escolares e indicou o autor na legenda.',
      correct: 'permitido',
      explanation: 'Utilizou uma imagem com permissão e cumpriu a regra de indicar quem criou a foto.',
    },
    {
      id: 'cpr-3',
      case: 'O Diogo copiou uma ilustração de um artista da Internet, apagou a assinatura e colocou na capa como se fosse um desenho dele.',
      correct: 'proibido',
      explanation: 'Apresentar a criação de outra pessoa como nossa viola os direitos de autor e é plágio.',
    },
    {
      id: 'cpr-4',
      case: 'A Leonor encontrou uma imagem num site e quer utilizá-la no seu trabalho de TIC. Antes de a colocar no trabalho, verifica se a imagem pode ser utilizada e indica quem a criou.',
      correct: 'permitido',
      explanation: 'Muito bem! Antes de utilizares um conteúdo encontrado na Internet, deves verificar as regras de utilização e, quando necessário, indicar quem o criou.',
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
      text: '"Os golfinhos conseguem comunicar através de diferentes sons." (Texto copiado e assinado apenas com o nome do aluno.)',
      isCorrect: false,
      feedback: 'Incorreto. Copiar o texto de outra pessoa e colocar o nosso nome não transforma o trabalho em nosso.',
    },
    {
      id: 'palavras_proprias',
      title: 'Opção B: Explicar por palavras próprias e indicar a fonte',
      text: 'Segundo a informação consultada, os golfinhos utilizam diferentes sons para comunicar. [Fonte: manual de Ciências]',
      isCorrect: true,
      feedback: 'Correto! Explicaste a ideia pelas tuas próprias palavras e indicaste de onde veio a informação.',
    },
    {
      id: 'citacao_com_aspas',
      title: 'Opção C: Usar as palavras exatas e indicar a fonte',
      text: 'No manual de Ciências pode ler-se: "Os golfinhos conseguem comunicar através de diferentes sons." [Fonte: manual de Ciências]',
      isCorrect: true,
      feedback: 'Correto! Quando utilizamos as palavras exatas de outra fonte, devemos deixar claro que essas palavras não são nossas e indicar a fonte.',
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

  return (
    <div className="space-y-8">
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
      {/* TEMA 1: COMUNICAR ONLINE */}
      {/* ========================================================= */}
      {activeTopicId === 'w3-t1' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-purple-600 tracking-wider block">
                  Tema 1 do Mundo 3
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic1?.title || 'Comunicar online'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-comunicacao-digital')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-comunicacao-digital')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                  Recompensa: +100 XP
                </span>
              )}
            </div>
          </div>

          {/* 📖 1. APRENDE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-purple-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: CLAREZA E RESPEITO NA COMUNICAÇÃO ONLINE
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic1?.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {topic1?.takeaway && (
              <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl">
                <p className="text-xs sm:text-sm font-black text-purple-800 italic">
                  ✨ {topic1.takeaway}
                </p>
              </div>
            )}

            <TopicIllustrationCard topicId="w3-t1" />
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-purple-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-purple-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Simulador de Comunicação Digital
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

          {/* 🎯 Progresso */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w3-t2')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Avançar para Tema 2: Netiqueta</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 2: NETIQUETA */}
      {/* ========================================================= */}
      {activeTopicId === 'w3-t2' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Smile className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-purple-600 tracking-wider block">
                  Tema 2 do Mundo 3
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic2?.title || 'Netiqueta'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-netiqueta')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-netiqueta')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                  Recompensa: +100 XP
                </span>
              )}
            </div>
          </div>

          {/* 📖 1. APRENDE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-purple-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: BOAS MANEIRAS NA INTERNET
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic2?.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
              {topic2?.bulletPoints && topic2.bulletPoints.length > 0 && (
                <ul className="list-disc pl-5 space-y-2 text-slate-800 font-medium">
                  {topic2.bulletPoints.map((bp, bidx) => (
                    <li key={bidx}>{bp}</li>
                  ))}
                </ul>
              )}
            </div>

            {topic2?.takeaway && (
              <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl">
                <p className="text-xs sm:text-sm font-black text-purple-800 italic">
                  ✨ {topic2.takeaway}
                </p>
              </div>
            )}

            <TopicIllustrationCard topicId="w3-t2" />
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-purple-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-purple-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Simulador de Netiqueta
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
                  <p className="text-xs sm:text-sm font-bold text-slate-900">"{scen.action}"</p>
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
          <div className="bg-white border border-purple-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
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
                <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                  Recompensa: +100 XP
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

          {/* 🎯 Progresso */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w3-t3')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Avançar para Tema 3: Trabalhar em equipa</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 3: TRABALHAR EM EQUIPA */}
      {/* ========================================================= */}
      {activeTopicId === 'w3-t3' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-purple-600 tracking-wider block">
                  Tema 3 do Mundo 3
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic3?.title || 'Trabalhar em equipa'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-colaboracao')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-colaboracao')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                  Recompensa: +100 XP
                </span>
              )}
            </div>
          </div>

          {/* 📖 1. APRENDE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-purple-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: ORGANIZAÇÃO, ENTREAJUDA E RESPEITO EM EQUIPA
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic3?.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
              {topic3?.bulletPoints && topic3.bulletPoints.length > 0 && (
                <ul className="list-disc pl-5 space-y-2 text-slate-800 font-medium">
                  {topic3.bulletPoints.map((bp, bidx) => (
                    <li key={bidx}>{bp}</li>
                  ))}
                </ul>
              )}
            </div>

            {topic3?.takeaway && (
              <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl">
                <p className="text-xs sm:text-sm font-black text-purple-800 italic">
                  ✨ {topic3.takeaway}
                </p>
              </div>
            )}

            <TopicIllustrationCard topicId="w3-t3" />
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-purple-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-purple-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Simulador de Colaboração & Equipa
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

          {/* 🎯 Progresso */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w3-t4')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Avançar para Tema 4: Direitos de autor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 4: DIREITOS DE AUTOR */}
      {/* ========================================================= */}
      {activeTopicId === 'w3-t4' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Copyright className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-purple-600 tracking-wider block">
                  Tema 4 do Mundo 3
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic4?.title || 'Direitos de autor'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-direitos-autor')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-direitos-autor')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                  Recompensa: +100 XP
                </span>
              )}
            </div>
          </div>

          {/* 📖 1. APRENDE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-purple-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: REGRAS E PERMISSÕES PARA USAR CONTEÚDOS
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic4?.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {topic4?.takeaway && (
              <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl">
                <p className="text-xs sm:text-sm font-black text-purple-800 italic">
                  ✨ {topic4.takeaway}
                </p>
              </div>
            )}

            <TopicIllustrationCard topicId="w3-t4" />
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-purple-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-purple-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Simulador de Direitos de Autor & Permissões
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
                  <p className="text-xs sm:text-sm font-bold text-slate-900">"{scen.case}"</p>
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

          {/* 🎯 Progresso */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w3-t5')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Avançar para Tema 5: Plágio e autoria</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 5: PLÁGIO E AUTORIA */}
      {/* ========================================================= */}
      {activeTopicId === 'w3-t5' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-purple-600 tracking-wider block">
                  Tema 5 do Mundo 3
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic5?.title || 'Plágio e autoria'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-plagio-citacao')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-plagio-citacao')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                  Recompensa: +100 XP
                </span>
              )}
            </div>
          </div>

          {/* 📖 1. APRENDE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-purple-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: O QUE É PLÁGIO E COMO INDICAR AUTORES
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic5?.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
              {topic5?.bulletPoints && topic5.bulletPoints.length > 0 && (
                <ul className="list-disc pl-5 space-y-2 text-slate-800 font-medium">
                  {topic5.bulletPoints.map((bp, bidx) => (
                    <li key={bidx}>{bp}</li>
                  ))}
                </ul>
              )}
            </div>

            {topic5?.takeaway && (
              <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl">
                <p className="text-xs sm:text-sm font-black text-purple-800 italic">
                  ✨ {topic5.takeaway}
                </p>
              </div>
            )}

            <TopicIllustrationCard topicId="w3-t5" />
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-purple-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-purple-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Simulador de Citação & Reconhecimento
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
                  <p className="text-xs text-slate-700">
                    {c.text}
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

          {/* 🎯 Progresso */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w3-t6')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Avançar para Tema 6: Creative Commons</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 6: CREATIVE COMMONS */}
      {/* ========================================================= */}
      {activeTopicId === 'w3-t6' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-purple-600 tracking-wider block">
                  Tema 6 do Mundo 3
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic6?.title || 'Creative Commons'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-creative-commons')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-creative-commons')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                  Recompensa: +100 XP
                </span>
              )}
            </div>
          </div>

          {/* 📖 1. APRENDE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-purple-700">
                <BookOpen className="w-5 h-5" />
                <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                  1. APRENDE: REGRAS DAS LICENÇAS CREATIVE COMMONS
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
              <div className="space-y-4">
                <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
                  {topic6?.paragraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {topic6?.takeaway && (
                  <div className="mt-4 p-4 bg-purple-50/80 border border-purple-200 rounded-2xl">
                    <p className="text-xs sm:text-sm font-black text-purple-800 italic">
                      ✨ {topic6.takeaway}
                    </p>
                  </div>
                )}
              </div>

              <div className="w-full">
                <TopicIllustrationCard topicId="w3-t6" />
              </div>
            </div>
          </div>

          {/* 🎮 2. EXPERIMENTA (SITUAÇÕES PRÁTICAS) */}
          <div className="bg-white border border-purple-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-purple-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Simulador de Licenças Creative Commons
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
                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
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

          {/* 🎯 Progresso */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('avaliacao')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Avançar para a Avaliação Final do Mundo 3</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SEPARADOR 7: AVALIAÇÃO FINAL */}
      {/* ========================================================= */}
      {activeTopicId === 'avaliacao' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs max-w-3xl mx-auto space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto shadow-xs">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-black text-purple-600 uppercase tracking-wider block">
              {world.title}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Avaliação Final de 10 Perguntas
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
              className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm px-8 py-3.5 rounded-2xl shadow-md transition-all hover:scale-105 inline-flex items-center gap-2"
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
