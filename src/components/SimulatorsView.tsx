import React, { useState } from 'react';
import {
  Key,
  Mail,
  ShieldCheck,
  Search,
  Code,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Award,
  Footprints,
  Heart,
  Lock,
} from 'lucide-react';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';

interface SimulatorsViewProps {
  worldId?: number;
  simulatorId?: string;
  onBack: () => void;
}

export const SimulatorsView: React.FC<SimulatorsViewProps> = ({
  worldId = 1,
  simulatorId = 'sim-password',
  onBack,
}) => {
  const { user, refreshUser } = useAuth();
  const [currentSim, setCurrentSim] = useState(simulatorId);
  const [worldLocked, setWorldLocked] = useState<boolean>(false);
  const [completedFeedback, setCompletedFeedback] = useState<{
    score: number;
    xpGain: number;
    newBest: number;
  } | null>(null);

  React.useEffect(() => {
    if (user && worldId > 1 && user.role !== 'teacher') {
      apiRequest('/api/pedagogical/worlds')
        .then((res: any) => {
          const w = res.worlds?.find((world: any) => world.id === worldId);
          if (w && !w.isUnlocked) {
            setWorldLocked(true);
          }
        })
        .catch(() => {});
    }
  }, [user?.id, worldId]);

  // --- PASSWORD SIMULATOR STATE ---
  const [pwdInput, setPwdInput] = useState('');
  const [hasTestedPwd, setHasTestedPwd] = useState(false);
  const [pwdFeedback, setPwdFeedback] = useState<{
    score: number;
    title: string;
    description: string;
  } | null>(null);

  // --- PHISHING SIMULATOR STATE ---
  const [phishingStep, setPhishingStep] = useState(0);
  const [phishingUserChoices, setPhishingUserChoices] = useState<Record<number, boolean>>({});
  const [phishingCompleted, setPhishingCompleted] = useState(false);

  // --- PRIVACY SIMULATOR STATE ---
  const [privacyChoices, setPrivacyChoices] = useState<Record<string, 'public' | 'private'>>({});
  const [privacyScore, setPrivacyScore] = useState<number | null>(null);

  // --- BLOCK CODING / ALGORITHMS STATE ---
  const [codeCommands, setCodeCommands] = useState<string[]>([]);
  const [robotPos, setRobotPos] = useState({ x: 0, y: 0, dir: 'E' });
  const [codeSuccess, setCodeSuccess] = useState(false);

  // --- PROMPT SIMULATOR STATE ---
  const [selectedPromptType, setSelectedPromptType] = useState<'vague' | 'detailed' | null>(null);

  // Complete simulator API caller
  const reportCompletion = async (simId: string, wId: number, payloadData?: any, score?: number) => {
    try {
      const res = await apiRequest('/api/pedagogical/activities/complete', {
        method: 'POST',
        body: JSON.stringify({
          activityId: simId,
          worldId: wId,
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
      });
      await refreshUser();
    } catch (err: any) {
      console.error('Failed to report simulator completion', err);
    }
  };

  // 1. Password Simulator Evaluation
  const evaluatePassword = () => {
    let score = 0;

    // COMPRIMENTO
    if (pwdInput.length >= 8) {
      score += 40;
    } else if (pwdInput.length >= 6) {
      score += 30;
    } else if (pwdInput.length >= 4) {
      score += 20;
    } else {
      score += 10;
    }

    // IMPREVISIBILIDADE
    const common = ['123', 'password', 'palavrapasse', 'escola', 'teste', 'qwerty', '123456', 'portugal', 'futebol', 'abc', '111', '000', 'admin'];
    const hasSequences = common.some((c) => pwdInput.toLowerCase().includes(c));
    if (!hasSequences && pwdInput.length >= 8) {
      score += 30;
    }

    // DADOS PESSOAIS
    const obviousNames = ['alex', 'tiago', 'leonor', 'marta', 'diogo', 'joao', 'maria', 'ana', 'pedro', 'lucas', 'matilde', 'tomas', 'beatriz', 'francisco', 'afonso', 'goncalo', 'rodrigo', 'martim', 'santiago'];
    const hasObviousNames = obviousNames.some((n) => pwdInput.toLowerCase().includes(n));
    const hasDates = /(19\d\d|20\d\d)/.test(pwdInput);
    if (!hasObviousNames && !hasDates && pwdInput.length >= 8) {
      score += 20;
    }

    // VARIEDADE DE CARACTERES
    let typeCount = 0;
    if (/[a-zA-Z]/.test(pwdInput)) typeCount++;
    if (/[0-9]/.test(pwdInput)) typeCount++;
    if (/[^a-zA-Z0-9]/.test(pwdInput)) typeCount++;
    if (typeCount >= 2) {
      score += 10;
    }

    // Total clamped between 0 and 100
    score = Math.min(100, Math.max(0, score));

    let title = '';
    let description = '';

    if (score === 100) {
      title = 'Palavra-passe muito segura!';
      description =
        'Excelente! A tua palavra-passe é suficientemente longa, difícil de adivinhar e não apresenta dados pessoais óbvios. Usa palavras-passe diferentes nas tuas contas e nunca as partilhes.';
    } else if (score >= 80) {
      title = 'Palavra-passe Segura (Boa Proteção)';
      description =
        'Muito bom! A tua palavra-passe tem boa proteção. Para alcançar a pontuação máxima (100 pontos), certifica-te de que tem pelo menos 8 caracteres, sem sequências nem dados pessoais óbvios e com variedade de caracteres.';
    } else if (score >= 50) {
      title = 'Palavra-passe Razoável (Pode Melhorar)';
      description =
        'A tua palavra-passe tem alguns pontos positivos, mas ainda pode ser melhorada. Aumenta o comprimento (8+ caracteres), evita nomes/datas e combina diferentes tipos de caracteres.';
    } else {
      title = 'Ainda pode ser melhorada.';
      description =
        'Esta palavra-passe é fácil de adivinhar porque é curta ou utiliza informação previsível. Experimenta torná-la mais longa (8+ caracteres) e evita nomes, datas ou palavras muito comuns.';
    }

    setHasTestedPwd(true);
    setPwdFeedback({ score, title, description });
    reportCompletion('sim-password', 1, { password: pwdInput }, score);
  };

  // 2. Phishing Simulator Scenarios
  const phishingScenarios = [
    {
      sender: 'seguranca@conta-escola-verificacao.com',
      subject: 'A tua conta será bloqueada hoje',
      body: 'Olá. Detetámos um problema na tua conta. Para evitar que seja bloqueada, confirma os teus dados através do seguinte link nas próximas 30 minutos.',
      isPhishing: true,
      explanation:
        'Existem vários sinais de alerta: a mensagem cria urgência, pede uma ação através de um link e solicita a confirmação de dados. Antes de agir, devemos verificar a informação através de um canal oficial.',
      signals: [
        'Urgência com prazo curto ("nas próximas 30 minutos")',
        'Pedido de dados através de link',
        'Ameaça de bloqueio imediato da conta',
        'Remetente não oficial (@conta-escola-verificacao.com)',
      ],
    },
    {
      sender: 'professor.tic@escola.edu.pt',
      subject: 'Trabalho de TIC — prazo de entrega',
      body: 'Olá. Relembramos que o trabalho de TIC deve ser entregue até sexta-feira através da plataforma oficial indicada na aula. Se tiveres dúvidas, fala com o professor.',
      isPhishing: false,
      explanation:
        'Neste exemplo não existe um pedido de palavra-passe nem um link suspeito. A mensagem indica um procedimento já conhecido e permite confirmar a informação através do professor ou da plataforma oficial.',
      signals: [
        'Contexto conhecido de aula',
        'Canal e domínio oficial da escola (.edu.pt)',
        'Ausência de pedido de palavra-passe ou link estranho',
        'Possibilidade de confirmação com o professor',
      ],
    },
    {
      sender: 'premios@jogos-oficiais.net',
      subject: 'Foste selecionado para receber moedas!',
      body: 'Parabéns! A tua conta foi selecionada para receber 5 000 moedas. Para confirmar a oferta, precisamos do teu nome de utilizador e da tua palavra-passe.',
      isPhishing: true,
      explanation:
        'O pedido da palavra-passe é um sinal muito importante de alerta. Uma entidade legítima não deve pedir a tua palavra-passe desta forma.',
      signals: [
        'Promessa de prémios e vantagens gratuitas',
        'Pedido explícito da tua palavra-passe',
        'Remetente não oficial',
        'Tentativa de engano',
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
      reportCompletion('sim-phishing', 1, { answers: updatedChoices }, finalScore);
    }
  };

  // 3. Privacy Simulator Items
  const privacyItems = [
    {
      id: 'item-phone',
      label: 'Número de telemóvel',
      correct: 'private',
      feedback: 'O número de telemóvel é um dado pessoal. Não o publiques sem uma razão adequada e sem autorização.',
    },
    {
      id: 'item-hobby',
      label: 'Passatempo',
      correct: 'public',
      feedback: 'Um passatempo, por si só, pode não ser um dado especialmente privado, mas deves pensar no contexto e em quem terá acesso à informação.',
    },
    {
      id: 'item-address',
      label: 'Morada',
      correct: 'private',
      feedback: 'A morada permite identificar onde uma pessoa vive e deve ser protegida.',
    },
    {
      id: 'item-school',
      label: 'Horário em que sais sozinho da escola',
      correct: 'private',
      feedback: 'Esta informação pode revelar rotinas e localização. Deve ser protegida.',
    },
    {
      id: 'item-book',
      label: 'Livro ou jogo recomendado',
      correct: 'public',
      feedback: 'Partilhar uma recomendação cultural pode ser uma forma positiva de comunicar, desde que não revele informação pessoal desnecessária.',
    },
  ];

  const handlePrivacySubmit = () => {
    let correctCount = 0;
    privacyItems.forEach((item) => {
      if (privacyChoices[item.id] === item.correct) correctCount++;
    });
    const score = Math.round((correctCount / privacyItems.length) * 100);
    setPrivacyScore(score);
    reportCompletion('sim-privacy', 1, { answers: privacyChoices }, score);
  };

  // 3b. Digital Footprint Simulator
  const [footprintChoices, setFootprintChoices] = useState<Record<string, 'risco' | 'positivo'>>({});
  const [footprintScore, setFootprintScore] = useState<number | null>(null);
  const footprintScenarios = [
    {
      id: 'fp-1',
      title: 'Fotografia com farda e localização',
      description:
        'Publicar nas redes sociais uma fotografia de grupo em frente à escola com a farda visível e localização GPS ativada.',
      correct: 'risco',
      explanation:
        'Publicar fardas escolares e localização em tempo real revela rotinas físicas a qualquer pessoa na rede. Pensa no impacto futuro da exposição da tua privacidade.',
    },
    {
      id: 'fp-2',
      title: 'Comentário impulsivo num jogo',
      description:
        'Escrever um comentário rude e insultuoso num fórum público de videojogos depois de perder uma partida.',
      correct: 'risco',
      explanation:
        'Palavras impulsivas escritas na internet ficam gravadas em servidores e podem prejudicar a tua reputação perante colegas, professores e futuros projetos.',
    },
    {
      id: 'fp-3',
      title: 'Artigo educativo sobre reciclagem',
      description:
        'Partilhar no blogue da turma um projeto escolar sobre reciclagem e ambiente, assinado apenas com o primeiro nome.',
      correct: 'positivo',
      explanation:
        'Demonstra competências de criação, cooperação escolar e responsabilidade ambiental, protegendo simultaneamente a tua identidade completa.',
    },
  ];

  const handleFootprintSubmit = () => {
    let correctCount = 0;
    footprintScenarios.forEach((item) => {
      if (footprintChoices[item.id] === item.correct) correctCount++;
    });
    const score = Math.round((correctCount / footprintScenarios.length) * 100);
    setFootprintScore(score);
    reportCompletion('sim-digital-footprint', 1, { answers: footprintChoices }, score);
  };

  // 3c. Digital Wellbeing Simulator
  const [wellbeingChoices, setWellbeingChoices] = useState<Record<string, 'saudavel' | 'risco'>>({});
  const [wellbeingScore, setWellbeingScore] = useState<number | null>(null);
  const wellbeingHabits = [
    {
      id: 'wb-1',
      label: 'Fazer uma pausa regularmente durante uma sessão prolongada de ecrã.',
      correct: 'saudavel',
      explanation: 'Fazer pausas ajuda a descansar e contribui para uma utilização mais equilibrada da tecnologia.',
    },
    {
      id: 'wb-2',
      label: 'Ficar na cama até de madrugada a ver vídeos no telemóvel.',
      correct: 'risco',
      explanation: 'Utilizar ecrãs até muito tarde pode prejudicar o descanso. Ter tempo sem ecrãs antes de dormir pode ajudar a manter uma rotina mais equilibrada.',
    },
    {
      id: 'wb-3',
      label: 'Levantar, mexer o corpo e fazer uma pausa depois de algum tempo ao computador.',
      correct: 'saudavel',
      explanation: 'Fazer pausas e mexer o corpo são bons hábitos durante períodos prolongados de utilização de tecnologia.',
    },
    {
      id: 'wb-4',
      label: 'Desligar as notificações durante o estudo para reduzir distrações.',
      correct: 'saudavel',
      explanation: 'Reduzir notificações pode ajudar a manter a atenção durante o estudo e evitar interrupções constantes.',
    },
  ];

  const handleWellbeingSubmit = () => {
    let correctCount = 0;
    wellbeingHabits.forEach((item) => {
      if (wellbeingChoices[item.id] === item.correct) correctCount++;
    });
    const score = Math.round((correctCount / wellbeingHabits.length) * 100);
    setWellbeingScore(score);
    reportCompletion('sim-digital-wellbeing', 1, { answers: wellbeingChoices }, score);
  };

  // 4. Block Coding / Algorithm Execution
  const runCode = () => {
    // Goal: reach (2, 0)
    // Commands: 'avancar', 'avancar'
    const forwardCount = codeCommands.filter((c) => c === 'avancar').length;
    if (forwardCount >= 2) {
      setRobotPos({ x: 2, y: 0, dir: 'E' });
      setCodeSuccess(true);
      reportCompletion('sim-block-coding', 4, { commands: codeCommands, forwardCount }, 100);
    } else {
      setRobotPos({ x: forwardCount, y: 0, dir: 'E' });
      setCodeSuccess(false);
      reportCompletion('sim-block-coding', 4, { commands: codeCommands, forwardCount }, 50);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 text-center shadow-sm">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
          <Key className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Simuladores Bloqueados — Registo Obrigatório
        </h2>
        <p className="text-sm text-slate-600 font-medium max-w-md mx-auto mb-6 leading-relaxed">
          Os simuladores práticos da Missão TIC requerem registo e início de sessão na plataforma para gravar o progresso e conquistas.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-6 py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <span>Voltar ao Início</span>
        </button>
      </div>
    );
  }

  if (worldLocked) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-amber-200/90 p-8 sm:p-10 text-center shadow-sm">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <span className="text-xs font-black text-amber-700 uppercase tracking-wider block mb-1">
          Mundo Bloqueado
        </span>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Simulador Bloqueado
        </h2>
        <p className="text-sm text-slate-600 font-medium max-w-md mx-auto mb-6 leading-relaxed">
          Este simulador pertence ao <strong>Mundo {worldId}</strong>, que está bloqueado. Para o desbloquear, precisas de alcançar uma pontuação média superior a <strong>75%</strong> no <strong>Mundo {worldId - 1}</strong>.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-6 py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <span>Voltar aos Mundos</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-bold text-blue-600 hover:underline mb-1 inline-block"
          >
            ← Voltar ao Mundo
          </button>
          <h2 className="text-xl font-black text-slate-900">
            Laboratório de Simuladores Interativos
          </h2>
        </div>

        {/* Quick Simulator Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'sim-password', name: 'Laboratório de Palavras-Passe', icon: Key },
            { id: 'sim-phishing', name: 'Laboratório de Phishing', icon: Mail },
            { id: 'sim-privacy', name: 'Laboratório de Privacidade', icon: ShieldCheck },
            { id: 'sim-digital-footprint', name: 'Simulador de Pegada Digital', icon: Footprints },
            { id: 'sim-digital-wellbeing', name: 'Simulador de Bem-estar Digital', icon: Heart },
            { id: 'sim-block-coding', name: 'Block Coding', icon: Code },
            { id: 'sim-prompt', name: 'Prompt Simulator', icon: Sparkles },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentSim(s.id);
                  setCompletedFeedback(null);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  currentSim === s.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{s.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Completion Banner */}
      {completedFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Award className="w-6 h-6 shrink-0" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                Atividade concluída!
              </span>
              <p className="text-sm font-bold text-emerald-950">
                Pontuação: {completedFeedback.score}/100{' '}
                {completedFeedback.xpGain > 0 && (
                  <span className="text-emerald-700 font-extrabold">(+{completedFeedback.xpGain} XP)</span>
                )}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-emerald-200/80 text-emerald-900 px-3 py-1.5 rounded-lg border border-emerald-300">
            Recorde: {completedFeedback.newBest}/100
          </span>
        </div>
      )}

      {/* SIMULATOR 1: PASSWORD SIMULATOR */}
      {currentSim === 'sim-password' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Laboratório de Palavras-Passe</h3>
              <p className="text-xs text-slate-500">
                Experimenta criar uma palavra-passe de teste e descobre quais características ajudam a torná-la mais difícil de adivinhar.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Cria uma palavra-passe de TESTE:
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                Não uses uma palavra-passe verdadeira. Cria apenas um exemplo para experimentar.
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={pwdInput}
                  onChange={(e) => {
                    setPwdInput(e.target.value);
                    setHasTestedPwd(false);
                    setPwdFeedback(null);
                  }}
                  placeholder="Ex.: Gato_Azul_782!"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
                />
                <button
                  onClick={evaluatePassword}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-xs transition-colors cursor-pointer"
                >
                  Testar Força
                </button>
              </div>
            </div>

            {/* Live Criteria Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  pwdInput.length >= 8
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : pwdInput.length >= 6
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" /> 8+ Caracteres
              </div>
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  /[A-Z]/.test(pwdInput) && /[a-z]/.test(pwdInput)
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" /> Maiúsculas + Minúsculas
              </div>
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  /[0-9]/.test(pwdInput)
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" /> Números
              </div>
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  /[^A-Za-z0-9]/.test(pwdInput)
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" /> Símbolos (#, $, !)
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
                  <h4 className="font-extrabold text-sm">{pwdFeedback.title}</h4>
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
      )}

      {/* SIMULATOR 2: PHISHING SIMULATOR */}
      {currentSim === 'sim-phishing' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Laboratório de Phishing</h3>
                <p className="text-xs text-slate-500">
                  Cenário {phishingStep + 1} de {phishingScenarios.length}: Analisa a mensagem e toma uma decisão.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
              Engenharia Social
            </span>
          </div>

          {/* Email Card Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 font-sans space-y-3">
            <div className="border-b border-slate-200 pb-2 text-xs text-slate-600 space-y-1">
              <div>
                <strong className="text-slate-900">De: </strong>
                <span className="font-mono">{phishingScenarios[phishingStep].sender}</span>
              </div>
              <div>
                <strong className="text-slate-900">Assunto: </strong>
                <span>{phishingScenarios[phishingStep].subject}</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed pt-2">
              {phishingScenarios[phishingStep].body}
            </p>
          </div>

          {/* Decision Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => handlePhishingDecision(true)}
              className={`flex-1 py-3 rounded-2xl font-extrabold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                phishingUserChoices[phishingStep] === true
                  ? 'bg-rose-700 text-white ring-2 ring-rose-400'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>É Phishing / Fraude!</span>
            </button>
            <button
              onClick={() => handlePhishingDecision(false)}
              className={`flex-1 py-3 rounded-2xl font-extrabold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                phishingUserChoices[phishingStep] === false
                  ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>É Legítimo / Seguro</span>
            </button>
          </div>

          {phishingUserChoices[phishingStep] !== undefined && (
            <div
              className={`p-5 rounded-2xl border text-xs space-y-3 ${
                phishingUserChoices[phishingStep] === phishingScenarios[phishingStep].isPhishing
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div>
                <strong className="text-sm block mb-1">
                  {phishingUserChoices[phishingStep] === phishingScenarios[phishingStep].isPhishing
                    ? 'Resposta Correta!'
                    : 'Atenção aos Sinais!'}
                </strong>
                <p className="leading-relaxed font-medium">
                  {phishingScenarios[phishingStep].explanation}
                </p>
              </div>

              <div className="pt-2 border-t border-current/20">
                <span className="font-bold block mb-1.5">O que deves ter observado?</span>
                <ul className="list-disc list-inside space-y-1">
                  {phishingScenarios[phishingStep].signals.map((sig, sIdx) => (
                    <li key={sIdx}>{sig}</li>
                  ))}
                </ul>
              </div>

              {phishingStep < phishingScenarios.length - 1 && (
                <button
                  onClick={() => setPhishingStep((p) => p + 1)}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 mt-2 cursor-pointer"
                >
                  <span>Próximo Cenário ({phishingStep + 2}/{phishingScenarios.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* SIMULATOR 3: PRIVACY SIMULATOR */}
      {currentSim === 'sim-privacy' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Laboratório de Privacidade</h3>
              <p className="text-xs text-slate-500">
                Analisa diferentes informações e decide se faz sentido partilhá-las publicamente ou se deves protegê-las.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900 font-medium leading-relaxed">
            💡 <strong>Orientação Pedagógica:</strong> Não existe uma regra igual para todas as informações. Pensa sempre no que estás a partilhar, com quem estás a partilhar e se é realmente necessário.
          </div>

          <div className="space-y-3">
            {privacyItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    {item.label}
                  </span>

                  <div className="flex items-center gap-2">
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
                      Partilhar
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
                      Manter Privado
                    </button>
                  </div>
                </div>

                {privacyScore !== null && (
                  <p className="text-[11px] text-slate-600 pt-1.5 border-t border-slate-200">
                    {privacyChoices[item.id] === item.correct ? '✅ ' : '⚠️ '}
                    {item.feedback}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {privacyScore !== null && (
              <span className="text-xs font-bold text-slate-700">
                Resultado: {privacyScore}/100
              </span>
            )}
            <button
              onClick={handlePrivacySubmit}
              className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Avaliar Decisões de Privacidade
            </button>
          </div>
        </div>
      )}

      {/* SIMULATOR 3b: DIGITAL FOOTPRINT */}
      {currentSim === 'sim-digital-footprint' && (
        <div className="bg-white border border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Footprints className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Simulador de Pegada Digital</h3>
              <p className="text-xs text-slate-500">
                Analisa situações do dia a dia e pensa no que cada ação pode deixar registado na tua pegada digital.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl text-xs text-indigo-950 font-medium leading-relaxed">
            💡 <strong>Reflexão:</strong> Antes de escolher, pergunta a ti próprio: “Gostaria que esta publicação continuasse associada a mim no futuro?”
          </div>

          <div className="space-y-4">
            {footprintScenarios.map((scen) => (
              <div
                key={scen.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h5 className="text-xs font-black text-slate-900">{scen.title}</h5>
                  <div className="flex items-center gap-2">
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
                      Pegada Positiva
                    </button>
                    <button
                      onClick={() =>
                        setFootprintChoices((prev) => ({ ...prev, [scen.id]: 'risco' }))
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        footprintChoices[scen.id] === 'risco'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Risco para a Pegada
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {scen.description}
                </p>
                {footprintScore !== null && (
                  <p className="text-[11px] text-slate-600 italic pt-1 border-t border-slate-200/60">
                    {footprintChoices[scen.id] === scen.correct ? '✅ ' : '⚠️ '}
                    {scen.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            {footprintScore !== null && (
              <span className="text-xs font-bold text-indigo-900">
                Pontuação da Pegada: {footprintScore}/100
              </span>
            )}
            <button
              onClick={handleFootprintSubmit}
              className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Avaliar o Impacto na Minha Pegada
            </button>
          </div>

          {footprintScore !== null && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 font-medium">
              <p className="font-bold text-sm text-indigo-900 mb-1">
                Reflexão Concluída!
              </p>
              <p>
                Lembra-te: tudo o que publicas constrói a tua reputação digital para o futuro. Pensa sempre duas vezes antes de partilhar!
              </p>
            </div>
          )}
        </div>
      )}

      {/* SIMULATOR 3c: DIGITAL WELLBEING */}
      {currentSim === 'sim-digital-wellbeing' && (
        <div className="bg-white border border-rose-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Simulador de Bem-estar Digital</h3>
              <p className="text-xs text-slate-500">
                Avalia os teus hábitos diários de tempo de ecrã e constrói um equilíbrio digital saudável.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {wellbeingHabits.map((h) => (
              <div
                key={h.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/70"
              >
                <div className="space-y-1">
                  <span className="text-xs sm:text-sm font-bold text-slate-800">{h.label}</span>
                  {wellbeingScore !== null && (
                    <p className="text-[11px] text-slate-600 italic">
                      {wellbeingChoices[h.id] === h.correct ? '✅ ' : '⚠️ '}
                      {h.explanation}
                    </p>
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

          <div className="flex items-center justify-between pt-2">
            {wellbeingScore !== null && (
              <span className="text-xs font-bold text-rose-900">
                Índice de Bem-estar Digital: {wellbeingScore}/100
              </span>
            )}
            <button
              onClick={handleWellbeingSubmit}
              className="ml-auto bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Avaliar Meu Bem-estar Digital
            </button>
          </div>

          {wellbeingScore !== null && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-950 font-medium">
              <p className="font-bold text-sm text-rose-900 mb-1">
                Reflexão Concluída!
              </p>
              <p>
                O equilíbrio é a chave do sucesso: aproveita as tecnologias para aprender e comunicar, mas lembra-te sempre de cuidar do teu sono, da tua postura e do teu tempo com amigos e família!
              </p>
            </div>
          )}
        </div>
      )}

      {/* SIMULATOR 4: BLOCK CODING */}
      {currentSim === 'sim-block-coding' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Block Coding: O Caminho do Robô</h3>
              <p className="text-xs text-slate-500">
                Objetivo: Leva o Robô da casa inicial até à bandeira de chegada!
              </p>
            </div>
          </div>

          {/* Grid Display */}
          <div className="flex items-center justify-center p-6 bg-slate-100 rounded-2xl border border-slate-200">
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((col) => {
                const hasRobot = robotPos.x === col;
                const isGoal = col === 2;
                return (
                  <div
                    key={col}
                    className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center text-2xl font-black shadow-xs ${
                      hasRobot
                        ? 'bg-blue-100 border-blue-500 text-blue-800'
                        : isGoal
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}
                  >
                    {hasRobot ? '🤖' : isGoal ? '🏁' : '•'}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Command Builder */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 block">
              Blocos de Instruções Adicionados: ({codeCommands.length})
            </span>
            <div className="flex flex-wrap gap-2 min-h-[44px] p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              {codeCommands.map((cmd, idx) => (
                <span
                  key={idx}
                  className="bg-indigo-600 text-white font-mono text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1"
                >
                  {cmd === 'avancar' ? 'Avançar 1 casa' : cmd}
                </span>
              ))}
              {codeCommands.length === 0 && (
                <span className="text-xs text-slate-400 italic">Clica nos blocos abaixo para adicionar ordens...</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => setCodeCommands((prev) => [...prev, 'avancar'])}
                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors"
              >
                + Bloco: Avançar
              </button>
              <button
                onClick={() => setCodeCommands([])}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors"
              >
                Limpar
              </button>
              <button
                onClick={runCode}
                className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>Executar Algoritmo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIMULATOR 5: PROMPT SIMULATOR */}
      {currentSim === 'sim-prompt' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Prompt Simulator</h3>
              <p className="text-xs text-slate-500">
                Aprende a diferença entre um prompt vago e um prompt estruturado para Inteligência Artificial.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Prompt Vago */}
            <div
              onClick={() => setSelectedPromptType('vague')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedPromptType === 'vague'
                  ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/20'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block mb-1">
                Opção A: Prompt Vago
              </span>
              <p className="font-mono text-xs text-slate-800 bg-slate-100 p-3 rounded-xl mb-3">
                “Fala sobre reciclagem.”
              </p>
              <div className="text-xs text-slate-600 space-y-1">
                <p>⚠️ Sem objetivo claro.</p>
                <p>⚠️ Resposta longa, genérica e difícil de usar num trabalho.</p>
              </div>
            </div>

            {/* Prompt Estruturado */}
            <div
              onClick={() => {
                setSelectedPromptType('detailed');
                reportCompletion('sim-prompt', 5, { selectedOption: 'detailed' }, 100);
              }}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedPromptType === 'detailed'
                  ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block mb-1">
                Opção B: Prompt Estruturado (Recomendado)
              </span>
              <p className="font-mono text-xs text-slate-800 bg-purple-100/60 p-3 rounded-xl mb-3">
                “Explica a uma criança de 11 anos como separar o lixo eletrónico na escola, usando 3 passos simples e um exemplo.”
              </p>
              <div className="text-xs text-slate-600 space-y-1">
                <p>✓ Público-alvo definido (11 anos).</p>
                <p>✓ Estrutura precisa (3 passos simples + exemplo).</p>
              </div>
            </div>
          </div>

          {selectedPromptType && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-950 font-medium">
              Conclusão Pedagógica: Quanto mais claro for o contexto e o formato que pedes à IA, melhor e mais útil será a resposta obtida!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
