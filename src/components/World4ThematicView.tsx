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
import { TopicIllustrationCard } from './TopicIllustrationCard';
import { PROGRESSION_CONFIG } from '../progressionConfig';

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
    { id: 'step-1', label: '1. Escolher o tema do trabalho de grupo' },
    { id: 'step-2', label: '2. Pesquisar informação e imagens fiáveis' },
    { id: 'step-3', label: '3. Organizar as ideias e escrever o texto' },
    { id: 'step-4', label: '4. Rever o trabalho antes de entregar ao professor' },
  ];

  // -------------------------------------------------------------
  // 2. BLOCK CODING (ROBO) SIMULATOR STATE - 4 DIRECTIONS & LEVELS
  // -------------------------------------------------------------
  const [robotLevel, setRobotLevel] = useState<number>(1);
  const [robotProgram, setRobotProgram] = useState<string[]>([]);
  const [robotPosition, setRobotPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [robotRunning, setRobotRunning] = useState(false);
  const [robotSuccess, setRobotSuccess] = useState(false);
  const [robotScore, setRobotScore] = useState<number | null>(null);
  const [robotErrorMsg, setRobotErrorMsg] = useState<string | null>(null);

  // Level definitions with grid obstacles and target
  const robotLevels = [
    {
      level: 1,
      title: 'Nível 1: Percurso Inicial',
      start: { x: 0, y: 0 },
      target: { x: 3, y: 1 },
      obstacles: [{ x: 1, y: 0 }],
      hint: 'Evita o obstáculo na casa (1,0) descendo primeiro ou contornando.',
    },
    {
      level: 2,
      title: 'Nível 2: Contornar Paredes',
      start: { x: 0, y: 0 },
      target: { x: 3, y: 3 },
      obstacles: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }],
      hint: 'Planeia o caminho à volta das paredes centrais para chegar a (3,3).',
    },
    {
      level: 3,
      title: 'Nível 3: Labirinto de Engenharia',
      start: { x: 0, y: 3 },
      target: { x: 3, y: 0 },
      obstacles: [{ x: 0, y: 2 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
      hint: 'Usa Cima, Baixo, Esquerda e Direita para navegar do canto inferior ao superior.',
    },
  ];

  const currentLevelConfig = robotLevels.find((l) => l.level === robotLevel) || robotLevels[0];

  // -------------------------------------------------------------
  // 3. CONDIÇÕES (SE / ENTÃO / SENÃO) STATE
  // -------------------------------------------------------------
  const [cond1Then, setCond1Then] = useState<string>('');
  const [cond1Else, setCond1Else] = useState<string>('');
  const [cond2Then, setCond2Then] = useState<string>('');
  const [cond2Else, setCond2Else] = useState<string>('');
  const [cond3Then, setCond3Then] = useState<string>('');
  const [cond3Else, setCond3Else] = useState<string>('');
  const [conditionScore, setConditionScore] = useState<number | null>(null);

  // -------------------------------------------------------------
  // 4. CICLOS & REPETIÇÕES STATE
  // -------------------------------------------------------------
  const [loop1Count, setLoop1Count] = useState<number>(1);
  const [loop2Count, setLoop2Count] = useState<number>(1);
  const [loop3Count, setLoop3Count] = useState<number>(1);
  const [loopScore, setLoopScore] = useState<number | null>(null);

  // -------------------------------------------------------------
  // 5. DADOS & TABELAS STATE
  // -------------------------------------------------------------
  const [mostVotedSport, setMostVotedSport] = useState<string>('');
  const [leastVotedSport, setLeastVotedSport] = useState<string>('');
  const [sumSports, setSumSports] = useState<string>('');
  const [totalStudents, setTotalStudents] = useState<string>('');
  const [dataScore, setDataScore] = useState<number | null>(null);

  // -------------------------------------------------------------
  // 6. DEBUGGING & DEPURAÇÃO STATE
  // -------------------------------------------------------------
  const [debugIdentifiedBug, setDebugIdentifiedBug] = useState<string | null>(null);
  const [debugSelectedFix, setDebugSelectedFix] = useState<string | null>(null);
  const [debugScore, setDebugScore] = useState<number | null>(null);

  const debugAlgorithmSteps = [
    { id: 'st-1', text: 'Passo 1: Ligar os sensores de movimento e verificar se o caminho está livre.' },
    { id: 'st-2', text: 'Passo 2: Avançar 3 metros até à estante dos livros.' },
    { id: 'st-3', text: 'Passo 3: Quando chegar à estante, aproximar o braço robótico do livro.' },
    { id: 'st-4', text: 'Passo 4: Transportar o livro e colocá-lo na mesa de leitura.' },
  ];

  const debugFixOptions = [
    { id: 'fx-1', text: 'Adicionar ao Passo 3: agarrar o livro com o braço robótico antes de avançar.', isCorrect: true },
    { id: 'fx-2', text: 'Retirar o Passo 3 e mandar o robô avançar sem apanhar o livro.', isCorrect: false },
    { id: 'fx-3', text: 'Fazer o robô voltar ao ponto de partida sem transportar o livro.', isCorrect: false },
  ];

  // -------------------------------------------------------------
  // REPORT COMPLETION HELPER
  // -------------------------------------------------------------
  const reportCompletion = async (simId: string, activityTitle: string, payloadData?: any, score?: number) => {
    try {
      const res = await apiRequest('/api/pedagogical/activities/complete', {
        method: 'POST',
        body: JSON.stringify({
          activityId: simId,
          worldId: 4,
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
    reportCompletion('sim-decomposicao', 'Simulador de Dividir Problemas', { steps: decomposedOrder }, score);
  };

  // 2. Block Coding Handlers (4 directions + obstacles + levels)
  const handleChangeLevel = (lvl: number) => {
    setRobotLevel(lvl);
    const cfg = robotLevels.find((l) => l.level === lvl) || robotLevels[0];
    setRobotPosition(cfg.start);
    setRobotProgram([]);
    setRobotSuccess(false);
    setRobotScore(null);
    setRobotErrorMsg(null);
  };

  const handleAddCommand = (cmd: string) => {
    if (robotProgram.length < 12 && !robotRunning) {
      setRobotProgram([...robotProgram, cmd]);
      setRobotErrorMsg(null);
    }
  };

  const handleClearProgram = () => {
    setRobotProgram([]);
    setRobotPosition(currentLevelConfig.start);
    setRobotSuccess(false);
    setRobotErrorMsg(null);
  };

  const handleRunProgram = async () => {
    setRobotRunning(true);
    setRobotErrorMsg(null);
    let curX = currentLevelConfig.start.x;
    let curY = currentLevelConfig.start.y;
    setRobotPosition({ x: curX, y: curY });

    let hitObstacle = false;

    for (let i = 0; i < robotProgram.length; i++) {
      await new Promise((r) => setTimeout(r, 400));
      const cmd = robotProgram[i];
      let nextX = curX;
      let nextY = curY;

      if (cmd === 'DIR') nextX++;
      if (cmd === 'ESQ') nextX--;
      if (cmd === 'BAIXO') nextY++;
      if (cmd === 'CIMA') nextY--;

      // Boundary check
      if (nextX < 0 || nextX > 3 || nextY < 0 || nextY > 3) {
        setRobotErrorMsg(`⚠️ O robô tentou sair dos limites da grelha no passo ${i + 1}!`);
        hitObstacle = true;
        break;
      }

      // Obstacle check
      const isObstacle = currentLevelConfig.obstacles.some((o) => o.x === nextX && o.y === nextY);
      if (isObstacle) {
        setRobotErrorMsg(`⚠️ O robô bateu num obstáculo na casa (${nextX}, ${nextY}) no passo ${i + 1}! Ajusta o percurso.`);
        hitObstacle = true;
        break;
      }

      curX = nextX;
      curY = nextY;
      setRobotPosition({ x: curX, y: curY });
    }

    setRobotRunning(false);
    const reached = !hitObstacle && curX === currentLevelConfig.target.x && curY === currentLevelConfig.target.y;
    setRobotSuccess(reached);

    let score = 0;
    if (reached) {
      score = 100;
    } else if (!hitObstacle) {
      score = 50;
    } else {
      score = 30;
    }

    setRobotScore(score);
    reportCompletion('sim-block-coding', `O Caminho do Robô (Nível ${robotLevel})`, { commands: robotProgram, reached, level: robotLevel }, score);
  };

  // 3. Conditions Handlers (SE / ENTÃO / SENÃO)
  const handleValidateConditions = () => {
    let correct = 0;
    if (cond1Then === 'casaco') correct++;
    if (cond1Else === 'camisola') correct++;
    if (cond2Then === 'avancar_nivel') correct++;
    if (cond2Else === 'manter_nivel') correct++;
    if (cond3Then === 'desviar') correct++;
    if (cond3Else === 'seguir_em_frente') correct++;

    const score = Math.round((correct / 6) * 100);
    setConditionScore(score);
    reportCompletion('sim-algoritmos', 'Simulador de Condições (SE / SENÃO)', { score, correct }, score);
  };

  // 4. Loops Handlers (3 Scenarios)
  const handleValidateLoop = () => {
    let correct = 0;
    if (loop1Count === 5) correct++;
    if (loop2Count === 4) correct++;
    if (loop3Count === 4) correct++;

    const score = Math.round((correct / 3) * 100);
    setLoopScore(score);
    reportCompletion('sim-ciclos', 'Simulador de Repetições', { loop1Count, loop2Count, loop3Count }, score);
  };

  // 5. Dados Handlers (School Sports Survey)
  const handleValidateData = () => {
    let correct = 0;
    if (mostVotedSport === 'futebol') correct++;
    if (leastVotedSport === 'voleibol') correct++;
    if (sumSports === 'futebol_mais_escolhido') correct++;
    if (totalStudents === '30') correct++;

    const score = Math.round((correct / 4) * 100);
    setDataScore(score);
    reportCompletion('sim-dados', 'Simulador de Dados e Tabelas', { mostVotedSport, leastVotedSport, sumSports, totalStudents }, score);
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
    reportCompletion('sim-debugging', 'Simulador de Debugging', { bugId: debugIdentifiedBug, fixId: debugSelectedFix }, score);
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
                  2. Experimenta: Simulador de Dividir Problemas
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Ordena as 4 etapas lógicas
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Desafio: A tua turma vai realizar um trabalho de grupo sobre Segurança na Internet.
              Clica nas etapas pela ordem sequencial correta para realizar o trabalho sem esquecer nenhuma parte essencial:
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
                className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Limpar Ordem
              </button>
              <button
                onClick={handleValidateDecomp}
                className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Validar Etapas
              </button>
            </div>

            {decompScore !== null && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 font-medium">
                {decompScore === 100
                  ? '🎉 Excelente! Dividir o trabalho em etapas organizadas (escolher tema, pesquisar, escrever e rever) torna qualquer projeto simples de realizar!'
                  : `Pontuação: ${decompScore}/100. Lembra-te: primeiro escolhemos o tema, depois pesquisamos, de seguida escrevemos e por fim revimos o trabalho!`}
              </div>
            )}
          </div>

          {/* 🎯 Progresso */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w4-t2')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
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

          {/* 🎮 2. EXPERIMENTA: ROBOT SIMULATOR WITH 4 DIRECTIONS AND OBSTACLES */}
          <div className="bg-white border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div className="flex items-center gap-2.5 text-amber-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: O Caminho do Robô (4 Direções)
                </h4>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => handleChangeLevel(lvl)}
                    className={`px-3 py-1 rounded-lg text-xs font-black cursor-pointer transition-colors ${
                      robotLevel === lvl
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Nível {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-950 font-medium flex items-center justify-between">
              <span><strong>{currentLevelConfig.title}:</strong> {currentLevelConfig.hint}</span>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                Início: ({currentLevelConfig.start.x},{currentLevelConfig.start.y}) ➔ Meta: ({currentLevelConfig.target.x},{currentLevelConfig.target.y})
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Grid 4x4 */}
              <div className="grid grid-cols-4 gap-2 bg-slate-100 p-4 rounded-3xl border border-slate-200">
                {[0, 1, 2, 3].map((y) =>
                  [0, 1, 2, 3].map((x) => {
                    const isRobot = robotPosition.x === x && robotPosition.y === y;
                    const isGoal = x === currentLevelConfig.target.x && y === currentLevelConfig.target.y;
                    const isObstacle = currentLevelConfig.obstacles.some((o) => o.x === x && o.y === y);
                    return (
                      <div
                        key={`${x}-${y}`}
                        className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold text-xs transition-all border ${
                          isRobot
                            ? 'bg-amber-500 text-white shadow-md scale-105 border-amber-600 ring-4 ring-amber-300'
                            : isObstacle
                            ? 'bg-rose-100 border-rose-300 text-rose-800'
                            : isGoal
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}
                      >
                        {isRobot ? (
                          <Bot className="w-7 h-7" />
                        ) : isObstacle ? (
                          <span className="text-[10px] text-center leading-tight">🧱<br/>Obstáculo</span>
                        ) : isGoal ? (
                          <span className="text-[11px] text-center font-black">🎯<br/>META</span>
                        ) : (
                          <span className="text-[10px] text-slate-300 font-mono">({x},{y})</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Controls */}
              <div className="flex-1 w-full space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleAddCommand('CIMA')}
                    disabled={robotRunning}
                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50"
                  >
                    ⬆️ Subir
                  </button>
                  <button
                    onClick={() => handleAddCommand('BAIXO')}
                    disabled={robotRunning}
                    className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50"
                  >
                    ⬇️ Descer
                  </button>
                  <button
                    onClick={() => handleAddCommand('ESQ')}
                    disabled={robotRunning}
                    className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50"
                  >
                    ⬅️ Esquerda
                  </button>
                  <button
                    onClick={() => handleAddCommand('DIR')}
                    disabled={robotRunning}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50"
                  >
                    ➡️ Direita
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Máximo 12 passos por programa
                  </span>
                  <button
                    onClick={handleClearProgram}
                    disabled={robotRunning}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Limpar Passos
                  </button>
                </div>

                {/* Programa Atual */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl min-h-[50px] flex items-center flex-wrap gap-1.5">
                  <span className="text-[10px] uppercase font-black text-slate-400 block w-full mb-1">
                    Sequência do Teu Algoritmo ({robotProgram.length} passos):
                  </span>
                  {robotProgram.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">
                      Clica nos botões de direção para adicionar instruções ao algoritmo...
                    </span>
                  ) : (
                    robotProgram.map((cmd, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 shadow-2xs"
                      >
                        {idx + 1}. {cmd === 'CIMA' ? '⬆️ Cima' : cmd === 'BAIXO' ? '⬇️ Baixo' : cmd === 'ESQ' ? '⬅️ Esq' : '➡️ Dir'}
                      </span>
                    ))
                  )}
                </div>

                {robotErrorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800">
                    {robotErrorMsg}
                  </div>
                )}

                <button
                  onClick={handleRunProgram}
                  disabled={robotRunning || robotProgram.length === 0}
                  className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-black text-xs py-3 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>{robotRunning ? 'A Executar Algoritmo...' : 'Executar Algoritmo Passo a Passo'}</span>
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
                  ? `🎉 Excelente trabalho de engenharia! O robô completou o percurso do Nível ${robotLevel} e chegou à meta com precisão!`
                  : 'O algoritmo não chegou à meta pretendida ou encontrou um obstáculo. Ajusta a ordem dos passos e testa de novo!'}
              </div>
            )}
          </div>

          {/* 🎯 Progresso */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w4-t3')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
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

          {/* 🎮 2. EXPERIMENTA: SIMULADOR DE CONDIÇÕES (SE / ENTÃO / SENÃO) */}
          <div className="bg-white border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-amber-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Simulador de Condições (SE / ENTÃO / SENÃO)
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Constrói as decisões automáticas
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Constrói a lógica de decisão para cada uma das três situações escolares e tecnológicas abaixo:
            </p>

            <div className="space-y-4">
              {/* Situação 1: Roupa para o Clima */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <span className="text-xs font-black text-slate-900 block">
                  Situação 1: Escolha da Roupa Escolar
                </span>
                <p className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 p-2 rounded-lg inline-block">
                  SE temperatura_exterior &lt; 12°C:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">ENTÃO (se for verdadeiro):</label>
                    <select
                      value={cond1Then}
                      onChange={(e) => setCond1Then(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    >
                      <option value="">Escolhe a consequência...</option>
                      <option value="casaco">Vestir um casaco quente</option>
                      <option value="tshirt">Ir de t-shirt e calções curtos</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">SENÃO (se for falso):</label>
                    <select
                      value={cond1Else}
                      onChange={(e) => setCond1Else(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    >
                      <option value="">Escolhe a consequência...</option>
                      <option value="camisola">Vestir uma camisola ligeira</option>
                      <option value="luvas">Levar luvas e gorro de neve</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Situação 2: Nível do Jogo */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <span className="text-xs font-black text-slate-900 block">
                  Situação 2: Sistema de Pontuação de um Jogo Digital
                </span>
                <p className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg inline-block">
                  SE pontuacao &gt;= 100 pontos:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">ENTÃO (se for verdadeiro):</label>
                    <select
                      value={cond2Then}
                      onChange={(e) => setCond2Then(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    >
                      <option value="">Escolhe a consequência...</option>
                      <option value="avancar_nivel">Desbloquear e avançar para o nível seguinte</option>
                      <option value="desligar">Desligar o computador imediatamente</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">SENÃO (se for falso):</label>
                    <select
                      value={cond2Else}
                      onChange={(e) => setCond2Else(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    >
                      <option value="">Escolhe a consequência...</option>
                      <option value="manter_nivel">Continuar no nível atual para tentar nova pontuação</option>
                      <option value="apagar_jogo">Apagar o jogo para sempre</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Situação 3: Sensor de Obstáculo do Robô */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <span className="text-xs font-black text-slate-900 block">
                  Situação 3: Sensor de Proximidade do Robô
                </span>
                <p className="text-xs font-mono font-bold text-amber-700 bg-amber-50 p-2 rounded-lg inline-block">
                  SE sensor_obstaculo &lt; 15 cm:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">ENTÃO (se houver obstáculo próximo):</label>
                    <select
                      value={cond3Then}
                      onChange={(e) => setCond3Then(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    >
                      <option value="">Escolhe a consequência...</option>
                      <option value="desviar">Parar o motor e virar para desviar</option>
                      <option value="acelerar">Acelerar contra o obstáculo</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">SENÃO (se o caminho estiver livre):</label>
                    <select
                      value={cond3Else}
                      onChange={(e) => setCond3Else(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    >
                      <option value="">Escolhe a consequência...</option>
                      <option value="seguir_em_frente">Continuar a avançar em linha reta</option>
                      <option value="ficar_parado">Ficar parado sem fazer nada</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleValidateConditions}
                className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Validar Regras Condicionais
              </button>
            </div>

            {conditionScore !== null && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 font-medium">
                {conditionScore === 100
                  ? '🎉 Fantástico! Construíste corretamente as condições SE/ENTÃO/SENÃO. Os programas usam esta estrutura para tomar decisões lógicas em frações de segundo!'
                  : `Pontuação: ${conditionScore}/100. Lembra-te: o bloco ENTÃO executa quando a condição é verdadeira, e o SENÃO quando a condição é falsa.`}
              </div>
            )}
          </div>

          {/* 🎯 Progresso */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w4-t4')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
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
                1. APRENDE: A EFICIÊNCIA DAS REPETIÇÕES (CICLOS)
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

          {/* 🎮 2. EXPERIMENTA: 3 SCENARIOS OF LOOPS */}
          <div className="bg-white border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-amber-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Desafio de Repetições
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Define o número de repetições
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Indica quantas vezes o bloco de repetição deve executar em cada um dos 3 desafios seguintes:
            </p>

            <div className="space-y-4">
              {/* Desafio 1 */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-xs font-black text-slate-900 block">
                  Desafio 1: O robô precisa de andar 5 casas em linha reta até à porta da sala.
                </span>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="font-bold text-slate-800">REPETIR</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={loop1Count}
                    onChange={(e) => setLoop1Count(Number(e.target.value))}
                    className="w-16 p-2 bg-white border border-slate-300 rounded-xl text-center text-xs font-bold"
                  />
                  <span className="font-bold text-slate-800">vezes: [ Avançar 1 casa ]</span>
                </div>
              </div>

              {/* Desafio 2 */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-xs font-black text-slate-900 block">
                  Desafio 2: Desenhar os 4 lados de uma moldura quadrada com a caneta digital.
                </span>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="font-bold text-slate-800">REPETIR</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={loop2Count}
                    onChange={(e) => setLoop2Count(Number(e.target.value))}
                    className="w-16 p-2 bg-white border border-slate-300 rounded-xl text-center text-xs font-bold"
                  />
                  <span className="font-bold text-slate-800">vezes: [ Desenhar 1 lado + Virar 90 graus ]</span>
                </div>
              </div>

              {/* Desafio 3 */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-xs font-black text-slate-900 block">
                  Desafio 3: O robô precisa de apanhar 4 objetos, levando cada objeto até à caixa antes de voltar a procurar o seguinte.
                </span>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="font-bold text-slate-800">REPETIR</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={loop3Count}
                    onChange={(e) => setLoop3Count(Number(e.target.value))}
                    className="w-16 p-2 bg-white border border-slate-300 rounded-xl text-center text-xs font-bold"
                  />
                  <span className="font-bold text-slate-800">vezes: [ Apanhar 1 objeto e levá-lo até à caixa ]</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleValidateLoop}
                className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Testar Repetições
              </button>
            </div>

            {loopScore !== null && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 font-medium">
                {loopScore === 100
                  ? '🎉 Perfeito! Acertaste em todas as repetições (5 passos para a porta, 4 lados para o quadrado e 4 objetos levados até à caixa). Os ciclos tornam o código muito mais conciso!'
                  : `Pontuação: ${loopScore}/100. Lembra-te: para 5 casas precisamos de repetir 5 vezes; para 4 lados do quadrado, 4 vezes; e para 4 objetos, 4 vezes.`}
              </div>
            )}
          </div>

          {/* 🎯 Progresso */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w4-t5')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
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

          {/* 🎮 2. EXPERIMENTA: SIMULADOR DE DADOS E TABELAS */}
          <div className="bg-white border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-amber-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Simulador de Dados e Tabelas
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Interpreta o inquérito da turma
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Analisa a tabela com os resultados do inquérito "Desporto Preferido da Turma do 6.º Ano" e responde às 4 perguntas:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Modalidade Desportiva</th>
                    <th className="p-3">⚽ Futebol</th>
                    <th className="p-3">🏀 Basquetebol</th>
                    <th className="p-3">🏊 Natação</th>
                    <th className="p-3">🏐 Voleibol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white font-medium text-slate-800">
                  <tr>
                    <td className="p-3 font-bold bg-slate-50">Número de Alunos</td>
                    <td className="p-3 font-black text-amber-600 bg-amber-50/50">12 alunos</td>
                    <td className="p-3">8 alunos</td>
                    <td className="p-3">6 alunos</td>
                    <td className="p-3">4 alunos</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  1. Qual é a modalidade com mais votos?
                </label>
                <select
                  value={mostVotedSport}
                  onChange={(e) => setMostVotedSport(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="">Seleciona a modalidade...</option>
                  <option value="futebol">Futebol (12 alunos)</option>
                  <option value="basquetebol">Basquetebol (8 alunos)</option>
                  <option value="natacao">Natação (6 alunos)</option>
                  <option value="voleibol">Voleibol (4 alunos)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  2. Qual é a modalidade com menos votos?
                </label>
                <select
                  value={leastVotedSport}
                  onChange={(e) => setLeastVotedSport(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="">Seleciona a modalidade...</option>
                  <option value="futebol">Futebol (12 alunos)</option>
                  <option value="basquetebol">Basquetebol (8 alunos)</option>
                  <option value="natacao">Natação (6 alunos)</option>
                  <option value="voleibol">Voleibol (4 alunos)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  3. Qual destas conclusões sobre o inquérito é correta?
                </label>
                <select
                  value={sumSports}
                  onChange={(e) => setSumSports(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="">Seleciona a conclusão...</option>
                  <option value="futebol_mais_escolhido">O Futebol foi o desporto mais escolhido.</option>
                  <option value="voleibol_mais_escolhido">O Voleibol foi o desporto mais escolhido.</option>
                  <option value="todos_iguais">Todos os desportos tiveram o mesmo número de votos.</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  4. Quantos alunos participaram no total no inquérito?
                </label>
                <select
                  value={totalStudents}
                  onChange={(e) => setTotalStudents(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="">Calcula o total da turma...</option>
                  <option value="26">26 alunos</option>
                  <option value="30">30 alunos (12 + 8 + 6 + 4)</option>
                  <option value="32">32 alunos</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleValidateData}
                className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Validar Análise de Dados
              </button>
            </div>

            {dataScore !== null && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 font-medium">
                {dataScore === 100
                  ? '🎉 Fantástico! Leste e interpretaste com rigor todos os dados da tabela (Futebol mais votado com 12 votos, Voleibol menos votado com 4 votos e 30 alunos no total)!'
                  : `Pontuação: ${dataScore}/100. Revê a contagem dos dados: Futebol teve 12 votos, Voleibol 4 votos, o Futebol foi o mais escolhido e o total é 30 alunos.`}
              </div>
            )}
          </div>

          {/* 🎯 Conclusão / Avançar para Tema 6 */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigateTopic('w4-t6')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
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
              O robô de entrega da biblioteca escolar aproxima o braço robótico do livro, mas não o agarra antes de avançar. Analisa os passos do algoritmo abaixo, deteta o passo com o erro lógico e seleciona a instrução de correção adequada!
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
                    Excelente! O problema está no Passo 3: aproximar o braço do livro não é suficiente. O robô precisa de o agarrar antes de o transportar. Pontuação: 100/100 (+100 XP)
                  </span>
                ) : (
                  <span className="text-amber-900 font-medium">
                    Pontuação: {debugScore}/100. Analisa com atenção: aproximar o braço do livro não chega para o transportar. É necessário agarrar o livro com o braço robótico no Passo 3!
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
            <p>🏆 Requisito para desbloquear o Mundo 5: Média &gt;= {PROGRESSION_CONFIG.PASSING_THRESHOLD}%</p>
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
