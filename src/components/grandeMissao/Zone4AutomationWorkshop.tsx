import React, { useState } from 'react';
import {
  Terminal,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  KeyRound,
  Play,
  RotateCcw,
  Zap,
  Lightbulb,
  Lock,
  Cpu,
  Bot,
} from 'lucide-react';

interface Zone4Props {
  onComplete: (code: string) => void;
  onBackToMap: () => void;
  alreadyCompleted: boolean;
}

export const Zone4AutomationWorkshop: React.FC<Zone4Props> = ({
  onComplete,
  onBackToMap,
  alreadyCompleted,
}) => {
  const [selectedCondition, setSelectedCondition] = useState<string>('c2');
  const [selectedAction1, setSelectedAction1] = useState<string>('a2');
  const [selectedAction2, setSelectedAction2] = useState<string>('b2');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(alreadyCompleted);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const conditions = [
    {
      id: 'c1',
      code: 'SE [Sensor_Movimento == "Verdadeiro"]',
      desc: 'Se houver pessoas em movimento na sala',
    },
    {
      id: 'c2',
      code: 'SE [Sensor_Movimento == "Falso"] E [Hora >= "18:30"]',
      desc: 'Se a sala estiver vazia e já for depois das 18h30 (Correto)',
    },
    {
      id: 'c3',
      code: 'SE [Sempre_Verdadeiro == "Sim"]',
      desc: 'Executar sempre sem verificar condições',
    },
  ];

  const actionsPrimary = [
    {
      id: 'a1',
      code: 'ENTÃO: Ligar o aquecimento e todos os projetores na potência máxima',
      isCorrect: false,
    },
    {
      id: 'a2',
      code: 'ENTÃO: Desligar Luzes das Salas, Ecrãs e Projetores para poupar eletricidade',
      isCorrect: true,
    },
    {
      id: 'a3',
      code: 'ENTÃO: Reiniciar todos os computadores a cada 5 segundos',
      isCorrect: false,
    },
  ];

  const actionsSecondary = [
    {
      id: 'b1',
      code: 'E: Deixar janelas abertas para refrescar sem segurança',
      isCorrect: false,
    },
    {
      id: 'b2',
      code: 'E: Ativar Alarme de Presença e Trancar Acessos Periféricos',
      isCorrect: true,
    },
  ];

  const handleRunSimulation = () => {
    setFeedbackError(null);
    setIsSimulating(true);
    setSimulationState('running');

    setTimeout(() => {
      const isCondCorrect = selectedCondition === 'c2';
      const isAct1Correct = selectedAction1 === 'a2';
      const isAct2Correct = selectedAction2 === 'b2';

      setIsSimulating(false);

      if (isCondCorrect && isAct1Correct && isAct2Correct) {
        setSimulationState('success');
        setSubmitted(true);
        onComplete('#ALGO-ROBOT-RUN');
      } else {
        setSimulationState('failed');
        if (!isCondCorrect) {
          setFeedbackError('A condição do algoritmo precisa de verificar a ausência de movimento E o horário pós-escolar.');
        } else if (!isAct1Correct) {
          setFeedbackError('A ação primária deve priorizar a poupança energética desligando luzes e ecrãs.');
        } else {
          setFeedbackError('A ação complementar deve assegurar o fecho dos acessos em segurança.');
        }
      }
    }, 1400);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Sector Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-500/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black px-2.5 py-0.5 rounded-md uppercase">
                Setor 4 • Mundo 4
              </span>
              <span className="text-xs font-bold text-slate-300">Engenheiro Digital</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <Terminal className="w-8 h-8 text-amber-400 shrink-0" />
              <span>A Oficina de Automação</span>
            </h2>
            <p className="text-xs sm:text-sm text-amber-100/80 mt-1 max-w-xl leading-relaxed">
              O Robô Zelador da escola inteligente precisa do seu algoritmo de patrulha noturna para reduzir o desperdício elétrico e garantir o fecho seguro de todas as salas.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-4 py-2.5 bg-amber-900/60 hover:bg-amber-800/80 text-amber-200 border border-amber-500/30 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              aria-label="Pedir dica ao Robo-Guia"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>{showHint ? 'Ocultar Dica' : 'Dica do Robo-Guia'}</span>
            </button>
          </div>
        </div>

        {showHint && (
          <div className="mt-4 p-4 bg-amber-950/90 border border-amber-400/40 rounded-2xl text-xs text-amber-200 animate-slideDown flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              ⚙️
            </div>
            <div>
              <strong className="text-amber-300 block mb-0.5">Dica de Algoritmia:</strong>
              Um algoritmo eficiente usa condições lógicas precisas (SE... ENTÃO... E...). A escola sustentável poupa energia desligando o que não está em uso quando a sala está desocupada!
            </div>
          </div>
        )}
      </div>

      {/* Main Algorithm Workspace & Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Logic Block Builder */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-black text-slate-900">
                Blocos de Programação do Robô BOT-40
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
              Lógica Condicional
            </span>
          </div>

          {/* Block 1: Condition */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">1</span>
              Condição do Sensor (SE):
            </label>
            <div className="space-y-1.5">
              {conditions.map((cond) => (
                <button
                  key={cond.id}
                  onClick={() => setSelectedCondition(cond.id)}
                  disabled={submitted}
                  className={`w-full text-left p-3 rounded-2xl border text-xs font-mono transition-all flex items-start gap-2.5 cursor-pointer ${
                    selectedCondition === cond.id
                      ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-400/20 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border mt-0.5 shrink-0 ${selectedCondition === cond.id ? 'bg-amber-600 border-amber-600' : 'border-slate-300'}`} />
                  <div>
                    <div className="text-slate-900">{cond.code}</div>
                    <div className="text-[11px] font-sans text-slate-500 mt-0.5">{cond.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Block 2: Primary Action */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">2</span>
              Ação Principal (ENTÃO):
            </label>
            <div className="space-y-1.5">
              {actionsPrimary.map((act) => (
                <button
                  key={act.id}
                  onClick={() => setSelectedAction1(act.id)}
                  disabled={submitted}
                  className={`w-full text-left p-3 rounded-2xl border text-xs font-mono transition-all flex items-start gap-2.5 cursor-pointer ${
                    selectedAction1 === act.id
                      ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-400/20 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border mt-0.5 shrink-0 ${selectedAction1 === act.id ? 'bg-amber-600 border-amber-600' : 'border-slate-300'}`} />
                  <span className="leading-snug">{act.code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Block 3: Secondary Action */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">3</span>
              Ação Complementar de Segurança (E):
            </label>
            <div className="space-y-1.5">
              {actionsSecondary.map((act) => (
                <button
                  key={act.id}
                  onClick={() => setSelectedAction2(act.id)}
                  disabled={submitted}
                  className={`w-full text-left p-3 rounded-2xl border text-xs font-mono transition-all flex items-start gap-2.5 cursor-pointer ${
                    selectedAction2 === act.id
                      ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-400/20 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border mt-0.5 shrink-0 ${selectedAction2 === act.id ? 'bg-amber-600 border-amber-600' : 'border-slate-300'}`} />
                  <span className="leading-snug">{act.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Robot Visual Simulator */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-black text-slate-900">
                  Simulador da Sala Inteligente
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-400 font-mono">Sala 6.º B</span>
            </div>

            {/* Visual Classroom Canvas */}
            <div className={`rounded-3xl p-5 border transition-all relative overflow-hidden flex flex-col items-center justify-center min-h-[220px] text-center ${
              simulationState === 'success' || submitted
                ? 'bg-slate-900 border-slate-800 text-white'
                : isSimulating
                ? 'bg-amber-500/10 border-amber-400/40 text-slate-800'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              {/* Status Icons */}
              <div className="mb-3">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto transition-transform ${
                  isSimulating ? 'animate-bounce bg-amber-400 text-amber-950' : 'bg-white/80 shadow-xs'
                }`}>
                  <Bot className="w-8 h-8 text-amber-600" />
                </div>
              </div>

              <div className="space-y-1 z-10">
                <div className="text-xs font-black">
                  {isSimulating
                    ? 'A testar rotina nos sensores da sala...'
                    : simulationState === 'success' || submitted
                    ? '🌟 Modo Noturno Ativo: 85% de Energia Poupada!'
                    : 'Pronto para simulação de patrulha'}
                </div>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  {simulationState === 'success' || submitted
                    ? 'Luzes desligadas, portas trancadas e alarme ativado com sucesso.'
                    : 'Clica abaixo para testar o código nos sensores e robô da escola.'}
                </p>
              </div>

              {(simulationState === 'success' || submitted) && (
                <div className="mt-3 flex items-center gap-3 text-[11px] font-bold text-emerald-400 bg-slate-800 px-3 py-1.5 rounded-xl">
                  <Lightbulb className="w-3.5 h-3.5" /> Luzes Off
                  <Lock className="w-3.5 h-3.5" /> Trancado
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> +Eco
                </div>
              )}
            </div>

            {feedbackError && (
              <div
                role="alert"
                className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-800 animate-shake flex items-start gap-2"
              >
                <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{feedbackError}</span>
              </div>
            )}

            {submitted && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Setor 4 Automatizado com Sucesso!</span>
                </div>
                <div className="p-2.5 bg-amber-950 text-amber-300 rounded-xl font-mono text-xs font-black text-center tracking-widest border border-amber-700 shadow-xs">
                  CÓDIGO 4: #ALGO-ROBOT-RUN
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={onBackToMap}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
            >
              ← Ver Mapa do Escape Room
            </button>

            {!submitted ? (
              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isSimulating ? 'A Executar...' : 'Testar Algoritmo'}</span>
              </button>
            ) : (
              <button
                onClick={onBackToMap}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span>Continuar para o Mapa</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
