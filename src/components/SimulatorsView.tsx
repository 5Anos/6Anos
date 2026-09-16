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
} from 'lucide-react';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { clientSaveActivityProgress } from '../services/clientFirestore';

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
  const [completedFeedback, setCompletedFeedback] = useState<{
    score: number;
    xpGain: number;
    newBest: number;
  } | null>(null);

  // --- PASSWORD SIMULATOR STATE ---
  const [pwdInput, setPwdInput] = useState('');
  const [hasTestedPwd, setHasTestedPwd] = useState(false);

  // --- PHISHING SIMULATOR STATE ---
  const [phishingStep, setPhishingStep] = useState(0);
  const [phishingScore, setPhishingScore] = useState<number | null>(null);

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
  const reportCompletion = async (simId: string, wId: number, score: number) => {
    try {
      try {
        const res = await apiRequest('/api/pedagogical/activities/complete', {
          method: 'POST',
          body: JSON.stringify({
            activityId: simId,
            worldId: wId,
            score,
          }),
        });
        setCompletedFeedback({
          score: res.score,
          xpGain: res.xpGain,
          newBest: res.newBest,
        });
      } catch {
        if (user) {
          const clientRes = await clientSaveActivityProgress(user.id, simId, score);
          setCompletedFeedback({
            score,
            xpGain: clientRes.xpGain,
            newBest: clientRes.newBest,
          });
        }
      }
      await refreshUser();
    } catch (err: any) {
      console.error('Failed to report simulator completion', err);
    }
  };

  // 1. Password Simulator Evaluation
  const evaluatePassword = () => {
    let score = 0;
    if (pwdInput.length >= 8) score += 25;
    if (pwdInput.length >= 12) score += 15;
    if (/[A-Z]/.test(pwdInput)) score += 15;
    if (/[a-z]/.test(pwdInput)) score += 15;
    if (/[0-9]/.test(pwdInput)) score += 15;
    if (/[^A-Za-z0-9]/.test(pwdInput)) score += 15;
    const common = ['123', 'password', 'escola', 'alex', 'teste', 'qwerty'];
    if (common.some((c) => pwdInput.toLowerCase().includes(c))) {
      score = Math.max(10, score - 30);
    }
    setHasTestedPwd(true);
    reportCompletion('sim-password', 1, score);
  };

  // 2. Phishing Simulator Scenarios
  const phishingScenarios = [
    {
      sender: 'servicos-urgentes@banc0-alerta.net',
      subject: 'A tua conta foi suspensa! Clica já para reativar em 10 minutos',
      body: 'Caro cliente, detetámos acessos suspeitos. Se não entrares em http://bit.ly/login-recupera agora, todos os teus acessos serão eliminados.',
      isPhishing: true,
      explanation: 'O endereço do remetente é falso (@banc0 com zero), usa uma ameaça de 10 minutos e um link encurtado.',
    },
    {
      sender: 'professor.tic@escola.edu.pt',
      subject: 'Trabalho de Grupo de TIC - Prazo de Entrega',
      body: 'Olá a todos. Lembramos que a entrega da atividade é na próxima sexta-feira através da plataforma oficial da escola. Bom trabalho!',
      isPhishing: false,
      explanation: 'Remetente do domínio oficial da escola (.edu.pt), tom cordial e sem pedidos urgentes de palavras-passe ou links suspeitos.',
    },
    {
      sender: 'premios@jogos-online-gratis-100.com',
      subject: 'GANHASTE 5000 MOEDAS NO TEU JOGO FAVORITO!',
      body: 'Parabéns! Foste o vencedor sortudo. Introduz o teu email e a tua palavra-passe para receberes as moedas na tua conta de jogador.',
      isPhishing: true,
      explanation: 'Promessas milagrosas de prémios inexistentes com pedido da tua palavra-passe são sempre tentativas de roubo de conta.',
    },
  ];

  const handlePhishingDecision = (chosenPhishing: boolean) => {
    const current = phishingScenarios[phishingStep];
    const isCorrect = chosenPhishing === current.isPhishing;
    const finalScore = isCorrect ? 100 : 40;
    setPhishingScore(finalScore);
    reportCompletion('sim-phishing', 1, finalScore);
  };

  // 3. Privacy Simulator Items
  const privacyItems = [
    { id: 'item-phone', label: 'O teu número de telemóvel pessoal', correct: 'private', hint: 'Pode ser usado para burlas e spam.' },
    { id: 'item-hobby', label: 'O teu desporto ou passatempo preferido', correct: 'public', hint: 'Gostos gerais são seguros de partilhar.' },
    { id: 'item-address', label: 'A morada completa da tua casa', correct: 'private', hint: 'Protege a tua segurança e localização física.' },
    { id: 'item-school', label: 'Horário em que sais sozinho da escola', correct: 'private', hint: 'Informações de rotina física devem ser guardadas.' },
    { id: 'item-book', label: 'Um livro ou jogo que recomendas aos amigos', correct: 'public', hint: 'Partilha cultural segura e positiva.' },
  ];

  const handlePrivacySubmit = () => {
    let correctCount = 0;
    privacyItems.forEach((item) => {
      if (privacyChoices[item.id] === item.correct) correctCount++;
    });
    const score = Math.round((correctCount / privacyItems.length) * 100);
    setPrivacyScore(score);
    reportCompletion('sim-privacy', 1, score);
  };

  // 4. Block Coding / Algorithm Execution
  const runCode = () => {
    // Goal: reach (2, 0)
    // Commands: 'avancar', 'avancar'
    const forwardCount = codeCommands.filter((c) => c === 'avancar').length;
    if (forwardCount >= 2) {
      setRobotPos({ x: 2, y: 0, dir: 'E' });
      setCodeSuccess(true);
      reportCompletion('sim-block-coding', 4, 100);
    } else {
      setRobotPos({ x: forwardCount, y: 0, dir: 'E' });
      setCodeSuccess(false);
      reportCompletion('sim-block-coding', 4, 50);
    }
  };

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
            { id: 'sim-password', name: 'Password Simulator', icon: Key },
            { id: 'sim-phishing', name: 'Phishing Simulator', icon: Mail },
            { id: 'sim-privacy', name: 'Privacy Simulator', icon: ShieldCheck },
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
            <Award className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wide">
                Simulação Avaliada com Sucesso!
              </span>
              <p className="text-sm font-bold">
                Pontuação: {completedFeedback.score}/100{' '}
                {completedFeedback.xpGain > 0 && `(+${completedFeedback.xpGain} XP Ganho!)`}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-emerald-200 text-emerald-800 px-3 py-1 rounded-lg">
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
              <h3 className="text-lg font-black text-slate-900">Password Simulator</h3>
              <p className="text-xs text-slate-500">
                Experimenta criar uma palavra-passe e observa a robustez contra ataques informáticos.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Escreve uma palavra-passe de teste:
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={pwdInput}
                  onChange={(e) => {
                    setPwdInput(e.target.value);
                    setHasTestedPwd(false);
                  }}
                  placeholder="Ex: G@to_Azul#782!"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
                />
                <button
                  onClick={evaluatePassword}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-xs transition-colors"
                >
                  Testar Força
                </button>
              </div>
            </div>

            {/* Live Criteria Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  pwdInput.length >= 10
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" /> 10+ Caracteres
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

            {hasTestedPwd && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-950 font-medium">
                Dica do Guardião: Nunca uses datas de nascimento, o teu nome ou sequências como 12345.
                Uma boa senha combina várias palavras inesperadas e símbolos!
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
                <h3 className="text-lg font-black text-slate-900">Phishing Simulator</h3>
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
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>É Phishing / Fraude!</span>
            </button>
            <button
              onClick={() => handlePhishingDecision(false)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>É Legítimo / Seguro</span>
            </button>
          </div>

          {phishingScore !== null && (
            <div
              className={`p-4 rounded-2xl border text-xs font-semibold ${
                phishingScore === 100
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <p className="mb-2">
                <strong>Análise do Perito: </strong>
                {phishingScenarios[phishingStep].explanation}
              </p>
              {phishingStep < phishingScenarios.length - 1 && (
                <button
                  onClick={() => {
                    setPhishingStep((p) => p + 1);
                    setPhishingScore(null);
                  }}
                  className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 mt-2"
                >
                  <span>Próximo Cenário</span>
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
              <h3 className="text-lg font-black text-slate-900">Privacy Simulator</h3>
              <p className="text-xs text-slate-500">
                Decide o que deves manter PRIVADO ou o que podes PARTILHAR publicamente na rede.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {privacyItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/70"
              >
                <div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    {item.label}
                  </span>
                  <p className="text-[11px] text-slate-500">{item.hint}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setPrivacyChoices((prev) => ({ ...prev, [item.id]: 'public' }))
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      privacyChoices[item.id] === 'private'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Manter Privado
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handlePrivacySubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              Avaliar Privacidade do Meu Perfil
            </button>
          </div>
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
                reportCompletion('sim-prompt', 5, 100);
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
