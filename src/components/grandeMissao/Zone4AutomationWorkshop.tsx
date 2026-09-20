import React, { useState, useEffect, useRef } from 'react';
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
  Bot,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight as ArrowRightIcon,
  Trash2,
  ShieldAlert,
  BatteryCharging,
  Flag,
} from 'lucide-react';

interface Zone4Props {
  onComplete: (code: string) => void;
  onBackToMap: () => void;
  alreadyCompleted: boolean;
}

type Direction = 'cima' | 'baixo' | 'esquerda' | 'direita';

interface GridCell {
  x: number;
  y: number;
  type: 'empty' | 'start' | 'target' | 'obstacle' | 'battery';
  label?: string;
  icon?: string;
}

const GRID_SIZE = 5; // 5x5 Grid

const OBSTACLES = [
  { x: 1, y: 1, label: 'Porta Bloqueada' },
  { x: 1, y: 3, label: 'Caixas de Cabos' },
  { x: 3, y: 1, label: 'Painel Danificado' },
  { x: 2, y: 3, label: 'Curto-Circuito' },
];

const BATTERY = { x: 2, y: 1, label: 'Célula de Energia' };
const START_POS = { x: 0, y: 0 };
const TARGET_POS = { x: 4, y: 4 };

export const Zone4AutomationWorkshop: React.FC<Zone4Props> = ({
  onComplete,
  onBackToMap,
  alreadyCompleted,
}) => {
  const [commands, setCommands] = useState<Direction[]>([]);
  const [robotPos, setRobotPos] = useState<{ x: number; y: number }>(START_POS);
  const [collectedBattery, setCollectedBattery] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [simulationResult, setSimulationResult] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('Adiciona comandos de direção para programar o robô até ao Terminal de Energia.');
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(alreadyCompleted);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const timerRef = useRef<any>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const addCommand = (dir: Direction) => {
    if (isRunning || submitted) return;
    if (commands.length >= 16) {
      setFeedbackError('Limite máximo de 16 instruções atingido. Tenta otimizar o percurso!');
      return;
    }
    setFeedbackError(null);
    setCommands((prev) => [...prev, dir]);
  };

  const removeLastCommand = () => {
    if (isRunning || submitted) return;
    setCommands((prev) => prev.slice(0, -1));
    setFeedbackError(null);
  };

  const clearCommands = () => {
    if (isRunning || submitted) return;
    setCommands([]);
    setRobotPos(START_POS);
    setCollectedBattery(false);
    setCurrentStepIndex(null);
    setSimulationResult('idle');
    setStatusMessage('Comandos reiniciados. Planeia a tua sequência de movimentos.');
    setFeedbackError(null);
  };

  const isObstacle = (x: number, y: number) => {
    return OBSTACLES.some((obs) => obs.x === x && obs.y === y);
  };

  const handleRunSimulation = () => {
    if (commands.length === 0) {
      setFeedbackError('Tens de adicionar pelo menos uma instrução de movimento (Cima, Baixo, Esquerda ou Direita) ao teu algoritmo!');
      return;
    }

    setFeedbackError(null);
    setIsRunning(true);
    setSimulationResult('running');
    setRobotPos(START_POS);
    setCollectedBattery(false);
    setCurrentStepIndex(0);
    setStatusMessage('O robô está a executar a sequência de instruções...');

    let currentX = START_POS.x;
    let currentY = START_POS.y;
    let step = 0;
    let hasBattery = false;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (step >= commands.length) {
        clearInterval(timerRef.current);
        setIsRunning(false);
        setCurrentStepIndex(null);

        // Check final position
        if (currentX === TARGET_POS.x && currentY === TARGET_POS.y) {
          setSimulationResult('success');
          setSubmitted(true);
          setStatusMessage('🎉 Excelente! O robô seguiu o algoritmo com sucesso e reativou o Laboratório de Engenharia!');
          onComplete('#ALGO-ROBOT-RUN');
        } else {
          setSimulationResult('failed');
          setFeedbackError(`O robô parou na posição (${currentX}, ${currentY}), mas o destino é o Terminal de Energia em (${TARGET_POS.x}, ${TARGET_POS.y}). Ajusta a sequência de passos!`);
          setStatusMessage('Percurso incompleto. Adiciona mais comandos para chegar ao destino.');
        }
        return;
      }

      const dir = commands[step];
      setCurrentStepIndex(step);

      let nextX = currentX;
      let nextY = currentY;

      if (dir === 'cima') nextY -= 1;
      else if (dir === 'baixo') nextY += 1;
      else if (dir === 'esquerda') nextX -= 1;
      else if (dir === 'direita') nextX += 1;

      // Check bounds
      if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
        clearInterval(timerRef.current);
        setIsRunning(false);
        setSimulationResult('failed');
        setFeedbackError(`Erro de execução no Passo ${step + 1}: O robô tentou sair dos limites da grelha! Revê os movimentos.`);
        setStatusMessage('Colisão com os limites da sala. Corrige o algoritmo.');
        return;
      }

      // Check obstacle
      if (isObstacle(nextX, nextY)) {
        clearInterval(timerRef.current);
        setIsRunning(false);
        setSimulationResult('failed');
        const obstacleHit = OBSTACLES.find((o) => o.x === nextX && o.y === nextY);
        setFeedbackError(`Erro de execução no Passo ${step + 1}: O robô colidiu com um obstáculo (${obstacleHit?.label || 'bloqueio'})! Tens de o contornar.`);
        setStatusMessage('Colisão detetada. Planeia um percurso alternativo.');
        return;
      }

      // Valid move
      currentX = nextX;
      currentY = nextY;
      setRobotPos({ x: currentX, y: currentY });

      // Check battery pickup
      if (currentX === BATTERY.x && currentY === BATTERY.y) {
        hasBattery = true;
        setCollectedBattery(true);
      }

      step += 1;
    }, 450);
  };

  const getDirectionLabel = (dir: Direction) => {
    switch (dir) {
      case 'cima':
        return { text: 'Cima', icon: <ArrowUp className="w-3.5 h-3.5" /> };
      case 'baixo':
        return { text: 'Baixo', icon: <ArrowDown className="w-3.5 h-3.5" /> };
      case 'esquerda':
        return { text: 'Esquerda', icon: <ArrowLeft className="w-3.5 h-3.5" /> };
      case 'direita':
        return { text: 'Direita', icon: <ArrowRightIcon className="w-3.5 h-3.5" /> };
    }
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
              <span>Laboratório de Engenharia</span>
            </h2>
            <p className="text-xs sm:text-sm text-amber-100/80 mt-1 max-w-xl leading-relaxed">
              O sistema de energia do laboratório está bloqueado. Programa o Robô BOT-40 com uma sequência de movimentos (Cima, Baixo, Esquerda, Direita) para contornar os obstáculos e chegar ao Terminal de Energia!
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
              🤖
            </div>
            <div>
              <strong className="text-amber-300 block mb-0.5">Dica de Programação:</strong>
              Planeia os movimentos passo a passo. Por exemplo: podes descer e avançar para a direita, contornando a porta bloqueada e os cabos danificados até alcançares a bandeira no canto inferior direito!
            </div>
          </div>
        )}
      </div>

      {/* Main Grid & Command Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Grid Map */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-black text-slate-900">
                  Grelha do Laboratório (5x5)
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                Destino: (4, 4)
              </span>
            </div>

            {/* 5x5 Grid Board */}
            <div className="bg-slate-900 p-3 sm:p-4 rounded-3xl border border-slate-800 shadow-inner">
              <div className="grid grid-cols-5 gap-2 aspect-square max-w-[360px] mx-auto">
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
                  const x = idx % GRID_SIZE;
                  const y = Math.floor(idx / GRID_SIZE);
                  const isRobotHere = robotPos.x === x && robotPos.y === y;
                  const isStart = START_POS.x === x && START_POS.y === y;
                  const isTarget = TARGET_POS.x === x && TARGET_POS.y === y;
                  const isObs = isObstacle(x, y);
                  const obsData = OBSTACLES.find((o) => o.x === x && o.y === y);
                  const isBat = BATTERY.x === x && BATTERY.y === y;

                  return (
                    <div
                      key={idx}
                      className={`relative rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-300 ${
                        isRobotHere
                          ? 'bg-amber-400 text-slate-950 border-amber-300 ring-4 ring-amber-400/40 z-20 scale-105 shadow-md font-black'
                          : isTarget
                          ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                          : isObs
                          ? 'bg-red-950/60 border-red-500/40 text-red-300'
                          : isBat
                          ? 'bg-blue-950/60 border-blue-500/40 text-blue-300'
                          : isStart
                          ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                          : 'bg-slate-800/40 border-slate-800 text-slate-500'
                      }`}
                    >
                      {/* Grid Position Coordinates */}
                      <span className="absolute top-1 left-1 text-[8px] font-mono opacity-50">
                        {x},{y}
                      </span>

                      {/* Cell Content */}
                      {isRobotHere ? (
                        <div className="flex flex-col items-center animate-bounce">
                          <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
                          <span className="text-[9px] font-black uppercase">BOT-40</span>
                        </div>
                      ) : isTarget ? (
                        <div className="flex flex-col items-center text-emerald-400">
                          <Flag className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                          <span className="text-[8px] font-bold">Terminal</span>
                        </div>
                      ) : isObs ? (
                        <div className="flex flex-col items-center text-red-400" title={obsData?.label}>
                          <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-[8px] font-bold">Obstáculo</span>
                        </div>
                      ) : isBat ? (
                        <div className="flex flex-col items-center text-blue-400">
                          <BatteryCharging className={`w-4 h-4 sm:w-5 sm:h-5 ${collectedBattery ? 'opacity-30' : ''}`} />
                          <span className="text-[8px] font-bold">Bateria</span>
                        </div>
                      ) : isStart ? (
                        <span className="text-[9px] font-bold text-slate-400">Início</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grid Legend */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[11px] font-medium text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Robô
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Terminal (Destino)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Obstáculos
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Bateria Opcional
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Direction Controller & Sequence Builder */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">
                Construtor de Algoritmo do Robô
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {commands.length} / 16 passos
              </span>
            </div>

            {/* Direction Pad Buttons */}
            <div>
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                1. Escolhe os Movimentos:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => addCommand('cima')}
                  disabled={isRunning || submitted}
                  className="p-3 bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-950 font-black text-xs rounded-2xl border border-slate-200 hover:border-amber-400 transition-all flex flex-col items-center gap-1 cursor-pointer disabled:opacity-40 shadow-xs"
                >
                  <ArrowUp className="w-5 h-5 text-amber-600" />
                  <span>CIMA ⬆️</span>
                </button>

                <button
                  type="button"
                  onClick={() => addCommand('baixo')}
                  disabled={isRunning || submitted}
                  className="p-3 bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-950 font-black text-xs rounded-2xl border border-slate-200 hover:border-amber-400 transition-all flex flex-col items-center gap-1 cursor-pointer disabled:opacity-40 shadow-xs"
                >
                  <ArrowDown className="w-5 h-5 text-amber-600" />
                  <span>BAIXO ⬇️</span>
                </button>

                <button
                  type="button"
                  onClick={() => addCommand('esquerda')}
                  disabled={isRunning || submitted}
                  className="p-3 bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-950 font-black text-xs rounded-2xl border border-slate-200 hover:border-amber-400 transition-all flex flex-col items-center gap-1 cursor-pointer disabled:opacity-40 shadow-xs"
                >
                  <ArrowLeft className="w-5 h-5 text-amber-600" />
                  <span>ESQUERDA ⬅️</span>
                </button>

                <button
                  type="button"
                  onClick={() => addCommand('direita')}
                  disabled={isRunning || submitted}
                  className="p-3 bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-950 font-black text-xs rounded-2xl border border-slate-200 hover:border-amber-400 transition-all flex flex-col items-center gap-1 cursor-pointer disabled:opacity-40 shadow-xs"
                >
                  <ArrowRightIcon className="w-5 h-5 text-amber-600" />
                  <span>DIREITA ➡️</span>
                </button>
              </div>
            </div>

            {/* Sequence List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  2. Sequência de Instruções:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={removeLastCommand}
                    disabled={commands.length === 0 || isRunning || submitted}
                    className="text-[11px] font-bold text-slate-600 hover:text-red-600 disabled:opacity-30 cursor-pointer flex items-center gap-1"
                  >
                    <span>Apagar Último</span>
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={clearCommands}
                    disabled={commands.length === 0 || isRunning || submitted}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 disabled:opacity-30 cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Limpar Tudo</span>
                  </button>
                </div>
              </div>

              {commands.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400 font-medium">
                  Clica nos botões acima para adicionar passos ao teu algoritmo.
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-2xl min-h-[60px] max-h-[140px] overflow-y-auto">
                  {commands.map((cmd, idx) => {
                    const info = getDirectionLabel(cmd);
                    const isStepActive = currentStepIndex === idx;

                    return (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                          isStepActive
                            ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-500 shadow-xs scale-105'
                            : 'bg-white border border-slate-200 text-slate-800'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400">{idx + 1}.</span>
                        {info.icon}
                        <span>{info.text}</span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Status & Feedback Area */}
            {feedbackError && (
              <div
                role="alert"
                className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-800 animate-shake flex items-start gap-2"
              >
                <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{feedbackError}</span>
              </div>
            )}

            {/* Success Box */}
            {submitted && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Laboratório de Engenharia Reativado com Sucesso!</span>
                </div>
                <p className="text-xs text-amber-950 font-medium">
                  Excelente raciocínio algorítmico! Planeaste a rota do robô, contornaste os obstáculos e religaste a energia da escola.
                </p>
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
                type="button"
                onClick={handleRunSimulation}
                disabled={isRunning}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isRunning ? 'A Executar Robô...' : 'Executar Algoritmo'}</span>
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
