import React, { useState } from 'react';
import {
  Layers,
  Code,
  GitBranch,
  Repeat,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Sparkles,
  RefreshCw,
  Play,
  RotateCcw,
  Bot,
  Bug,
} from 'lucide-react';
import { WorldSummary } from '../types';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { clientSaveActivityProgress } from '../services/clientFirestore';
import { TopicIllustrationCard } from './TopicIllustrationCard';

interface World4ThematicViewProps {
  world: WorldSummary;
  activeTopicId: string;
  onNavigateTopic: (topicId: string) => void;
  onOpenAssessment: () => void;
  onRefreshWorld: () => Promise<void>;
}

export const World4ThematicView: React.FC<World4ThematicViewProps> = ({
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
  // 1. DECOMPOSICAO SIMULATOR STATE
  // -------------------------------------------------------------
  const [decomposedOrder, setDecomposedOrder] = useState<string[]>([]);
  const [decompScore, setDecompScore] = useState<number | null>(null);
  const decompSteps = [
    { id: 'step-1', label: '1. Planear as perguntas e temas do questionário' },
    { id: 'step-2', label: '2. Desenhar os botões e ecrãs do jogo no papel' },
    { id: 'step-3', label: '3. Programar os blocos de comando e pontuação' },
    { id: 'step-4', label: '4. Testar o jogo com colegas e corrigir erros' },
  ];

  // -------------------------------------------------------------
  // 2. BLOCK CODING (ROBO) SIMULATOR STATE
  // -------------------------------------------------------------
  const [robotProgram, setRobotProgram] = useState<string[]>([]);
  const [robotPosition, setRobotPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [robotRunning, setRobotRunning] = useState(false);
  const [robotSuccess, setRobotSuccess] = useState(false);
  const [robotScore, setRobotScore] = useState<number | null>(null);
  // Grid 4x4. Start at (0,0), Target at (3,3).

  // -------------------------------------------------------------
  // 3. CONDIÇÕES (SE / SENÃO) STATE
  // -------------------------------------------------------------
  const [condition1Action, setCondition1Action] = useState<string>('');
  const [condition2Action, setCondition2Action] = useState<string>('');
  const [conditionScore, setConditionScore] = useState<number | null>(null);

  // -------------------------------------------------------------
  // 4. CICLOS & REPETIÇÕES STATE
  // -------------------------------------------------------------
  const [loopCount, setLoopCount] = useState<number>(1);
  const [loopScore, setLoopScore] = useState<number | null>(null);

  // -------------------------------------------------------------
  // 5. DADOS & GRÁFICOS STATE
  // -------------------------------------------------------------
  const [mostReadDay, setMostReadDay] = useState<string>('');
  const [avgScoreChoice, setAvgScoreChoice] = useState<string>('');
  const [dataScore, setDataScore] = useState<number | null>(null);

  // -------------------------------------------------------------
  // 6. DEBUGGING & DEPURAÇÃO STATE
  // -------------------------------------------------------------
  const [debugIdentifiedBug, setDebugIdentifiedBug] = useState<string | null>(null);
  const [debugSelectedFix, setDebugSelectedFix] = useState<string | null>(null);
  const [debugScore, setDebugScore] = useState<number | null>(null);

  const debugAlgorithmSteps = [
    { id: 'st-1', text: 'Passo 1: Ligar o sensor de obstáculos e verificar o percurso.' },
    { id: 'st-2', text: 'Passo 2: Avançar 3 metros em linha reta até à estante de livros.' },
    { id: 'st-3', text: 'Passo 3 [ERRO]: Virar 180 graus e desligar o motor sem recolher o livro.' },
    { id: 'st-4', text: 'Passo 4: Transportar o livro e colocá-lo na secretária do professor.' },
  ];

  const debugFixOptions = [
    { id: 'fx-1', text: 'Substituir o Passo 3 por: "Acionar o braço robótico para segurar o livro com cuidado".', isCorrect: true },
    { id: 'fx-2', text: 'Apagar todo o algoritmo e reiniciar sem testar onde falhou.', isCorrect: false },
    { id: 'fx-3', text: 'Aumentar a velocidade do robô para ele ignorar o Passo 3.', isCorrect: false },
  ];

  // -------------------------------------------------------------
  // REPORT COMPLETION HELPER
  // -------------------------------------------------------------
  const reportCompletion = async (simId: string, activityTitle: string, score: number) => {
    try {
      try {
        const res = await apiRequest('/api/pedagogical/activities/complete', {
          method: 'POST',
          body: JSON.stringify({
            activityId: simId,
            worldId: 4,
            score,
          }),
        });
        setCompletedFeedback({
          score: res.score,
          xpGain: res.xpGain,
          newBest: res.newBest,
          activityTitle,
        });
      } catch {
        if (user) {
          const clientRes = await clientSaveActivityProgress(user.id, simId, score);
          setCompletedFeedback({
            score,
            xpGain: clientRes.xpGain,
            newBest: clientRes.newBest,
            activityTitle,
          });
        }
      }
      await refreshUser();
      await onRefreshWorld();
    } catch (err: any) {
      console.error('Failed to report activity completion', err);
    }
  };

  // 1. Decomposicao Handlers
  const handleToggleDecompStep = (id: string) => {
    if (decomposedOrder.includes(id)) {
      setDecomposedOrder(decomposedOrder.filter((s) => s !== id));
    } else {
      setDecomposedOrder([...decomposedOrder, id]);
    }
  };

  const handleValidateDecomp = () => {
    const isCorrect =
      decomposedOrder.length === 4 &&
      decomposedOrder[0] === 'step-1' &&
      decomposedOrder[1] === 'step-2' &&
      decomposedOrder[2] === 'step-3' &&
      decomposedOrder[3] === 'step-4';
    const score = isCorrect ? 100 : Math.min(75, decomposedOrder.length * 15);
    setDecompScore(score);
    reportCompletion('sim-decomposicao', 'Simulador de Decomposição', score);
  };

  // 2. Block Coding Handlers
  const handleAddCommand = (cmd: string) => {
    if (robotProgram.length < 8) {
      setRobotProgram([...robotProgram, cmd]);
    }
  };

  const handleClearProgram = () => {
    setRobotProgram([]);
    setRobotPosition({ x: 0, y: 0 });
    setRobotSuccess(false);
  };

  const handleRunProgram = async () => {
    setRobotRunning(true);
    let curX = 0;
    let curY = 0;
    setRobotPosition({ x: 0, y: 0 });

    for (let i = 0; i < robotProgram.length; i++) {
      await new Promise((r) => setTimeout(r, 450));
      const cmd = robotProgram[i];
      if (cmd === 'DIR' && curX < 3) curX++;
      if (cmd === 'BAIXO' && curY < 3) curY++;
      setRobotPosition({ x: curX, y: curY });
    }

    setRobotRunning(false);
    const reached = curX === 3 && curY === 3;
    setRobotSuccess(reached);
    const score = reached ? 100 : Math.round(((curX + curY) / 6) * 80);
    setRobotScore(score);
    reportCompletion('sim-block-coding', 'Block Coding: O Caminho do Robô', score);
  };

  // 3. Conditions Handlers
  const handleValidateConditions = () => {
    const c1Correct = condition1Action === 'carregar';
    const c2Correct = condition2Action === 'desviar';
    let correct = 0;
    if (c1Correct) correct++;
    if (c2Correct) correct++;
    const score = Math.round((correct / 2) * 100);
    setConditionScore(score);
    reportCompletion('sim-algoritmos', 'Algoritmos & Condições (SE / SENÃO)', score);
  };

  // 4. Loops Handlers
  const handleValidateLoop = () => {
    const isCorrect = loopCount === 4;
    const score = isCorrect ? 100 : 40;
    setLoopScore(score);
    reportCompletion('sim-ciclos', 'Simulador de Ciclos', score);
  };

  // 5. Dados Handlers
  const handleValidateData = () => {
    const dayCorrect = mostReadDay === 'quinta';
    const avgCorrect = avgScoreChoice === '24';
    let correct = 0;
    if (dayCorrect) correct++;
    if (avgCorrect) correct++;
    const score = Math.round((correct / 2) * 100);
    setDataScore(score);
    reportCompletion('sim-dados', 'Simulador de Dados & Gráficos', score);
  };

  // 6. Debugging Handlers
  const handleValidateDebug = () => {
    const identifiedCorrect = debugIdentifiedBug === 'st-3';
    const fixCorrect = debugSelectedFix === 'fx-1';
    let correct = 0;
    if (identifiedCorrect) correct++;
    if (fixCorrect) correct++;
    const score = Math.round((correct / 2) * 100);
    setDebugScore(score);
    reportCompletion('sim-debugging', 'Simulador de Debugging & Depuração', score);
  };

  // Helper
  const getSimProg = (simId: string) => {
    return world.simulatorsProgress?.find((p) => p.id === simId);
  };

  const topic1 = world.topics.find((t) => t.id === 'w4-t1');
  const topic2 = world.topics.find((t) => t.id === 'w4-t2');
  const topic3 = world.topics.find((t) => t.id === 'w4-t3');
  const topic4 = world.topics.find((t) => t.id === 'w4-t4');
  const topic5 = world.topics.find((t) => t.id === 'w4-t5');
  const topic6 = world.topics.find((t) => t.id === 'w4-t6');

  return (
    <div className="space-y-6">
      {/* Global Completed Feedback Banner */}
      {completedFeedback && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-3xl flex items-center justify-between text-amber-950 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <Award className="w-7 h-7 text-amber-600 shrink-0" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">
                Atividade Registada com Sucesso: {completedFeedback.activityTitle}
              </span>
              <p className="text-sm font-black">
                Pontuação Obtida: {completedFeedback.score}/100{' '}
                {completedFeedback.xpGain > 0 && (
                  <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md ml-1">
                    +{completedFeedback.xpGain} XP Ganho!
                  </span>
                )}
              </p>
            </div>
          </div>
          <span className="text-xs font-black bg-amber-200 text-amber-900 px-3 py-1.5 rounded-xl">
            Melhor Recorde: {completedFeedback.newBest}/100
          </span>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 1: DIVIDIR UM PROBLEMA */}
      {/* ========================================================= */}
      {activeTopicId === 'w4-t1' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-amber-600 tracking-wider block">
                  Tema 1 do Mundo 4
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic1?.title || 'Dividir um problema'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-decomposicao')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-decomposicao')?.score}%)</span>
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
                1. APRENDE: A TÉCNICA DA DECOMPOSIÇÃO
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic1?.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
              {topic1?.bulletPoints && topic1.bulletPoints.length > 0 && (
                <ul className="list-disc pl-5 space-y-2 text-slate-800 font-medium">
                  {topic1.bulletPoints.map((bp, bidx) => (
                    <li key={bidx}>{bp}</li>
                  ))}
                </ul>
              )}
            </div>

            {topic1?.takeaway && (
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl">
                <p className="text-xs sm:text-sm font-black text-amber-800 italic">
                  ✨ {topic1.takeaway}
                </p>
              </div>
            )}

            <TopicIllustrationCard topicId="w4-t1" />
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-amber-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Simulador de Decomposição
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Ordena as 4 sub-tarefas lógicas
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Desafio: Precisas de criar um jogo de perguntas em Scratch para a feira de Ciências.
              Clica nas etapas pela ordem sequencial correta para resolver o projeto:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {decompSteps.map((step) => {
                const idx = decomposedOrder.indexOf(step.id);
                const isSelected = idx !== -1;
                return (
                  <div
                    key={step.id}
                    onClick={() => handleToggleDecompStep(step.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-800">{step.label}</span>
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-black flex items-center justify-center">
                        {idx + 1}º
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setDecomposedOrder([])}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Limpar Ordem
              </button>
              <button
                onClick={handleValidateDecomp}
                className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Validar Decomposição
              </button>
            </div>

            {decompScore !== null && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 font-medium">
                Pontuação de Decomposição: {decompScore}/100. Dividir grandes problemas em partes menores é o segredo de qualquer programador!
              </div>
            )}
          </div>

          {/* 🎯 Progresso */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w4-t2')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Avançar para Tema 2: Algoritmos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 2: ALGORITMOS (BLOCK CODING) */}
      {/* ========================================================= */}
      {activeTopicId === 'w4-t2' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-amber-600 tracking-wider block">
                  Tema 2 do Mundo 4
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic2?.title || 'Algoritmos'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-block-coding')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-block-coding')?.score}%)</span>
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
                1. APRENDE: O QUE É UM ALGORITMO E A SEQUÊNCIA LÓGICA
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic2?.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
              {topic2?.bulletPoints && topic2.bulletPoints.length > 0 && (
                <ol className="list-decimal pl-5 space-y-2 text-slate-800 font-medium">
                  {topic2.bulletPoints.map((bp, bidx) => (
                    <li key={bidx}>{bp}</li>
                  ))}
                </ol>
              )}
            </div>

            {topic2?.takeaway && (
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl">
                <p className="text-xs sm:text-sm font-black text-amber-800 italic">
                  ✨ {topic2.takeaway}
                </p>
              </div>
            )}

            <TopicIllustrationCard topicId="w4-t2" />
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-amber-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Block Coding (O Caminho do Robô)
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Guia o robô até à meta (3, 3)
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Grid 4x4 */}
              <div className="grid grid-cols-4 gap-2 bg-slate-100 p-4 rounded-3xl border border-slate-200">
                {[0, 1, 2, 3].map((y) =>
                  [0, 1, 2, 3].map((x) => {
                    const isRobot = robotPosition.x === x && robotPosition.y === y;
                    const isGoal = x === 3 && y === 3;
                    return (
                      <div
                        key={`${x}-${y}`}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xs transition-all border ${
                          isRobot
                            ? 'bg-amber-500 text-white shadow-md scale-105 border-amber-600 ring-4 ring-amber-300'
                            : isGoal
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}
                      >
                        {isRobot ? <Bot className="w-7 h-7" /> : isGoal ? '🎯 META' : ''}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Controls */}
              <div className="flex-1 w-full space-y-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleAddCommand('DIR')}
                    disabled={robotRunning}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-extrabold transition-all"
                  >
                    + Avançar Direita (➡️)
                  </button>
                  <button
                    onClick={() => handleAddCommand('BAIXO')}
                    disabled={robotRunning}
                    className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-extrabold transition-all"
                  >
                    + Descer (⬇️)
                  </button>
                  <button
                    onClick={handleClearProgram}
                    disabled={robotRunning}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Limpar
                  </button>
                </div>

                {/* Programa Atual */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl min-h-[50px] flex items-center flex-wrap gap-1.5">
                  <span className="text-[10px] uppercase font-black text-slate-400 block w-full mb-1">
                    Sequência do Algoritmo ({robotProgram.length} passos):
                  </span>
                  {robotProgram.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">
                      Adiciona comandos de Direita e Baixo para chegar à meta...
                    </span>
                  ) : (
                    robotProgram.map((cmd, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 shadow-2xs"
                      >
                        {idx + 1}. {cmd === 'DIR' ? '➡️ Direita' : '⬇️ Baixo'}
                      </span>
                    ))
                  )}
                </div>

                <button
                  onClick={handleRunProgram}
                  disabled={robotRunning || robotProgram.length === 0}
                  className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-black text-xs py-3 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  <span>{robotRunning ? 'A Executar Algoritmo...' : 'Executar Algoritmo'}</span>
                </button>
              </div>
            </div>

            {robotScore !== null && (
              <div
                className={`p-4 rounded-2xl border text-xs font-medium ${
                  robotSuccess
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                {robotSuccess
                  ? '🎉 Parabéns! O teu algoritmo conduziu o robô até à meta sem erros!'
                  : 'Quase lá! Continua a ajustar os passos para alcançares a meta (3, 3).'}
              </div>
            )}
          </div>

          {/* 🎯 Progresso */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w4-t3')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Avançar para Tema 3: Condições</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 3: CONDIÇÕES */}
      {/* ========================================================= */}
      {activeTopicId === 'w4-t3' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <GitBranch className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-amber-600 tracking-wider block">
                  Tema 3 do Mundo 4
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic3?.title || 'Condições'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-algoritmos')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-algoritmos')?.score}%)</span>
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
                1. APRENDE: TOMADA DE DECISÃO LÓGICA COM SE E SENÃO
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
              <div className="mt-4 p-4 bg-amber-50/80 border border-amber-200 rounded-2xl">
                <p className="text-xs sm:text-sm font-black text-amber-800 italic">
                  ✨ {topic3.takeaway}
                </p>
              </div>
            )}

            <TopicIllustrationCard topicId="w4-t3" />
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-amber-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Simulador de Regras Condicionais
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Constrói as regras automáticas
              </span>
            </div>

            <div className="space-y-4">
              {/* Regra 1 */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-xs font-black text-slate-900 block">
                  Regra 1: Gestão de Bateria do Robô
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs font-mono">
                  <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg font-bold">
                    SE bateria &lt; 15% ENTÃO:
                  </span>
                  <select
                    value={condition1Action}
                    onChange={(e) => setCondition1Action(e.target.value)}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="">Escolhe a ação...</option>
                    <option value="carregar">Navegar de volta para a base de carregamento</option>
                    <option value="jogar">Continuar a dançar e gastar energia</option>
                  </select>
                </div>
              </div>

              {/* Regra 2 */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-xs font-black text-slate-900 block">
                  Regra 2: Deteção de Obstáculos
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs font-mono">
                  <span className="bg-blue-100 text-blue-900 px-2.5 py-1 rounded-lg font-bold">
                    SE sensor_distância &lt; 20cm ENTÃO:
                  </span>
                  <select
                    value={condition2Action}
                    onChange={(e) => setCondition2Action(e.target.value)}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="">Escolhe a ação...</option>
                    <option value="desviar">Parar o motor e rodar 90 graus para desviar</option>
                    <option value="acelerar">Acelerar em direção à parede</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleValidateConditions}
                className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Validar Regras Condicionais
              </button>
            </div>

            {conditionScore !== null && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 font-medium">
                Pontuação das Condições: {conditionScore}/100. As condições SE/SENÃO são o cérebro que permite aos computadores reagir ao ambiente de forma autónoma!
              </div>
            )}
          </div>

          {/* 🎯 Progresso */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w4-t4')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Avançar para Tema 4: Repetições</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 4: REPETIÇÕES (CICLOS / LOOPS) */}
      {/* ========================================================= */}
      {activeTopicId === 'w4-t4' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Repeat className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-amber-600 tracking-wider block">
                  Tema 4 do Mundo 4
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic4?.title || 'Repetições'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-ciclos')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-ciclos')?.score}%)</span>
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
                1. APRENDE: A EFICIÊNCIA DOS CICLOS (LOOPS)
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic4?.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
              {topic4?.bulletPoints && topic4.bulletPoints.length > 0 && (
                <ul className="list-disc pl-5 space-y-2 text-slate-800 font-medium">
                  {topic4.bulletPoints.map((bp, bidx) => (
                    <li key={bidx}>{bp}</li>
                  ))}
                </ul>
              )}
            </div>

            {topic4?.takeaway && (
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl">
                <p className="text-xs sm:text-sm font-black text-amber-800 italic">
                  ✨ {topic4.takeaway}
                </p>
              </div>
            )}

            <TopicIllustrationCard topicId="w4-t4" />
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-amber-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Simulador de Ciclos & Loops
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Simplifica comandos repetidos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Código Ineficiente */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-[11px] font-black uppercase text-rose-600 block">
                  Código Repetitivo (4 Linhas Idênticas):
                </span>
                <div className="font-mono text-xs text-slate-700 space-y-1">
                  <p>1. Avançar 1 passo</p>
                  <p>2. Avançar 1 passo</p>
                  <p>3. Avançar 1 passo</p>
                  <p>4. Avançar 1 passo</p>
                </div>
              </div>

              {/* Versão com Ciclo */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                <span className="text-[11px] font-black uppercase text-emerald-700 block">
                  Código Eficiente com Ciclo:
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800">Repetir</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={loopCount}
                    onChange={(e) => setLoopCount(Number(e.target.value))}
                    className="w-16 p-2 bg-white border border-slate-300 rounded-xl text-center text-xs font-bold"
                  />
                  <span className="font-mono text-xs font-bold text-slate-800">vezes:</span>
                </div>
                <p className="font-mono text-xs text-emerald-800 font-bold pl-4">
                  &gt; Avançar 1 passo
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleValidateLoop}
                className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Testar Ciclo
              </button>
            </div>

            {loopScore !== null && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 font-medium">
                {loopCount === 4
                  ? 'Exato! Com o ciclo Repetir 4 vezes, o programa ficou muito mais curto, fácil de ler e sem desperdício de código!'
                  : 'Atenção: A sequência original tinha 4 passos. Ajusta o número de repetições para 4!'}
              </div>
            )}
          </div>

          {/* 🎯 Progresso */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w4-t5')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Avançar para Tema 5: Dados</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 5: DADOS */}
      {/* ========================================================= */}
      {activeTopicId === 'w4-t5' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-amber-600 tracking-wider block">
                  Tema 5 do Mundo 4
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic5?.title || 'Dados'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-dados')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-dados')?.score}%)</span>
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
                1. APRENDE: ORGANIZAÇÃO DE DADOS, TABELAS E GRÁFICOS
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic5?.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {topic5?.takeaway && (
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl">
                <p className="text-xs sm:text-sm font-black text-amber-800 italic">
                  ✨ {topic5.takeaway}
                </p>
              </div>
            )}

            <TopicIllustrationCard topicId="w4-t5" />
          </div>

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-amber-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Simulador de Análise de Dados
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Interpreta a tabela escolar
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Dia da Semana</th>
                    <th className="p-3">Segunda</th>
                    <th className="p-3">Terça</th>
                    <th className="p-3">Quarta</th>
                    <th className="p-3">Quinta</th>
                    <th className="p-3">Sexta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white font-medium text-slate-800">
                  <tr>
                    <td className="p-3 font-bold bg-slate-50">Páginas Lidas</td>
                    <td className="p-3">15 páginas</td>
                    <td className="p-3">20 páginas</td>
                    <td className="p-3">25 páginas</td>
                    <td className="p-3 font-black text-amber-600 bg-amber-50">35 páginas</td>
                    <td className="p-3">25 páginas</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  1. Em que dia da semana houve mais páginas lidas?
                </label>
                <select
                  value={mostReadDay}
                  onChange={(e) => setMostReadDay(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="">Seleciona o dia...</option>
                  <option value="segunda">Segunda-feira (15)</option>
                  <option value="quarta">Quarta-feira (25)</option>
                  <option value="quinta">Quinta-feira (35)</option>
                  <option value="sexta">Sexta-feira (25)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  2. Qual é a média diária de páginas lidas nesta semana? (Total: 120 / 5)
                </label>
                <select
                  value={avgScoreChoice}
                  onChange={(e) => setAvgScoreChoice(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="">Calcula a média...</option>
                  <option value="20">20 páginas por dia</option>
                  <option value="24">24 páginas por dia</option>
                  <option value="30">30 páginas por dia</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleValidateData}
                className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Validar Análise de Dados
              </button>
            </div>

            {dataScore !== null && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 font-medium">
                Resultado da Análise: {dataScore}/100. Ler tabelas e calcular médias ajuda a transformar dados brutos em conhecimento útil!
              </div>
            )}
          </div>

          {/* 🎯 Conclusão / Avançar para Tema 6 */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w4-t6')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Avançar para o Tema 6: Debugging</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMA 6: DEBUGGING (DEPURAÇÃO) */}
      {/* ========================================================= */}
      {activeTopicId === 'w4-t6' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Bug className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-amber-600 tracking-wider block">
                  Tema 6 do Mundo 4
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {topic6?.title || 'Debugging (Depuração)'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSimProg('sim-debugging')?.completed ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluído ({getSimProg('sim-debugging')?.score}%)</span>
                </span>
              ) : (
                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                  Recompensa: +100 XP
                </span>
              )}
            </div>
          </div>

          {/* 📖 1. APRENDE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-amber-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: ENCONTRAR E CORRIGIR ERROS (DEBUGGING)
              </h4>
            </div>

            <div className="text-sm sm:text-[15px] text-slate-700 space-y-4 leading-relaxed font-normal">
              {topic6?.paragraphs?.map((p, idx) => (
                <p key={idx} className="border-l-2 border-amber-300 pl-3">
                  {p}
                </p>
              )) || (
                <>
                  <p className="border-l-2 border-amber-300 pl-3">
                    Quando um algoritmo ou programa não funciona como esperado, existe um erro ou anomalia lógica (designado habitualmente por "bug").
                  </p>
                  <p className="border-l-2 border-amber-300 pl-3">
                    Debugging é o processo metódico de testar passo a passo, identificar onde ocorreu a falha e corrigir as instruções.
                  </p>
                  <p className="border-l-2 border-amber-300 pl-3">
                    Errar faz parte natural da programação; analisar e corrigir erros torna-nos melhores engenheiros digitais.
                  </p>
                </>
              )}
            </div>

            <TopicIllustrationCard
              topicId="w4-t6"
              title="A Arte do Debugging: Detetar, Analisar e Corrigir"
              caption="Em engenharia de software, ler o código com espírito crítico e testar cada hipótese é o segredo para construir programas fiáveis."
              theme="amber"
            />
          </div>

          {/* 🎮 2. PRATICA (Simulador de Debugging) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-amber-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                  2. PRATICA: SIMULADOR DE DEBUGGING E CORREÇÃO
                </h4>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                Missão de Laboratório (+100 XP)
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              O robô de entrega da biblioteca escolar falha a meio da sua rota. Analisa os passos do algoritmo abaixo, deteta o passo com o erro lógico e seleciona a instrução de correção adequada!
            </p>

            {/* Step 1: Detect the Buggy Step */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                Passo 1: Qual dos passos programados contém o erro lógico?
              </label>
              <div className="space-y-2">
                {debugAlgorithmSteps.map((step) => {
                  const isSelected = debugIdentifiedBug === step.id;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setDebugIdentifiedBug(step.id)}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-50 border-amber-500 text-amber-950 ring-1 ring-amber-400'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{step.text}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Choose the Fix */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                Passo 2: Qual é a melhor correção para reparar o algoritmo?
              </label>
              <div className="space-y-2">
                {debugFixOptions.map((fix) => {
                  const isSelected = debugSelectedFix === fix.id;
                  return (
                    <button
                      key={fix.id}
                      onClick={() => setDebugSelectedFix(fix.id)}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-50 border-amber-500 text-amber-950 ring-1 ring-amber-400'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{fix.text}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleValidateDebug}
                disabled={!debugIdentifiedBug || !debugSelectedFix}
                className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Validar Depuração e Corrigir Robô
              </button>
            </div>

            {debugScore !== null && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 font-medium">
                {debugScore === 100 ? (
                  <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Excelente! Identificaste o passo erróneo e aplicaste a instrução correta. O robô completou a entrega do livro com sucesso! Pontuação: 100/100 (+100 XP)
                  </span>
                ) : (
                  <span className="text-amber-900 font-medium">
                    Pontuação: {debugScore}/100. Analisa com atenção: o Passo 3 mandava o robô virar e desligar o motor antes de recolher o livro. Substitui esse passo pela ação de segurar o livro!
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 🎯 Conclusão / Avaliação */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('avaliacao')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Avançar para a Avaliação Final do Mundo 4</span>
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
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-black text-amber-600 uppercase tracking-wider block">
              {world.title}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Avaliação Final de 10 Perguntas
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
              Comprova a tua destreza em algoritmos, condições, ciclos, dados e depuração para desbloquear o Mundo 5!
            </p>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl max-w-md mx-auto text-xs text-amber-950 font-semibold space-y-1">
            <p>🏆 Requisito para desbloquear o Mundo 5: Média &gt; 80%</p>
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
              className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm px-8 py-3.5 rounded-2xl shadow-md transition-all hover:scale-105 inline-flex items-center gap-2"
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
