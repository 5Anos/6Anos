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
import { clientSaveActivityProgress } from '../services/clientFirestore';
import { TopicIllustrationCard } from './TopicIllustrationCard';

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
  // 1. COMUNICACAO DIGITAL SIMULATOR STATE
  // -------------------------------------------------------------
  const [selectedMessageTone, setSelectedMessageTone] = useState<string | null>(null);
  const [messageScore, setMessageScore] = useState<number | null>(null);
  const messageOptions = [
    {
      id: 'aggressive',
      text: 'FAZ ISSO AGORA JA ESTOU FARTO DE ESPERAR PELO TEU TRABALHO',
      tone: 'Agressivo / Gritos (CAPS LOCK)',
      feedback: 'Usar maiúsculas e ameaças cria conflitos imediatos no grupo e desmotiva os colegas.',
      score: 30,
    },
    {
      id: 'cold',
      text: 'tanto faz...',
      tone: 'Frio e Ambíguo',
      feedback: 'Uma resposta fria e reticente pode parecer desprezo ou falta de interesse pelo projeto comum.',
      score: 50,
    },
    {
      id: 'polite',
      text: 'Olá! Consegues enviar a tua parte do resumo até às 17h para podermos juntar tudo com calma? Se precisares de ajuda, avisa. Obrigado!',
      tone: 'Claro, Empático e Educado (Recomendado)',
      feedback: 'Perfeito! Estabelece um prazo claro, oferece entreajuda e utiliza palavras de cortesia.',
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
      action: 'Enviar dezenas de stickers e mensagens em maiúsculas às 23h num grupo escolar.',
      correct: 'incorreto',
      explanation: 'Mensagens em horas tardias e spam violam o descanso e a tranquilidade dos colegas.',
    },
    {
      id: 'net-2',
      action: 'Discordar educadamente de uma ideia e explicar o próprio ponto de vista sem ofender ninguém.',
      correct: 'correto',
      explanation: 'A diversidade de opiniões com respeito mútuo é o pilar da convivência online.',
    },
    {
      id: 'net-3',
      action: 'Tirar uma captura de ecrã (screenshot) de uma mensagem privada de um colega e publicá-la num grupo público.',
      correct: 'incorreto',
      explanation: 'Partilhar conversas privadas sem consentimento viola a confiança e a privacidade da pessoa.',
    },
  ];

  // -------------------------------------------------------------
  // 3. COLABORACAO SIMULATOR STATE
  // -------------------------------------------------------------
  const [collabChoices, setCollabChoices] = useState<Record<string, string>>({});
  const [collabScore, setCollabScore] = useState<number | null>(null);
  const collabScenarios = [
    {
      id: 'col-1',
      situation: 'Um colega do teu grupo não sabe como formatar a tabela no documento partilhado.',
      options: [
        { id: 'opt-a', label: 'Fazer uma chamada curta ou explicar passo a passo como se faz para ele aprender.', correct: true },
        { id: 'opt-b', label: 'Dizer que ele não serve para o grupo e tirá-lo do trabalho.', correct: false },
      ],
    },
    {
      id: 'col-2',
      situation: 'Faltam 2 dias para a entrega e ainda falta concluir a introdução.',
      options: [
        { id: 'opt-c', label: 'Dividir o parágrafo em duas partes e combinar uma hora para rever juntos.', correct: true },
        { id: 'opt-d', label: 'Esperar que o professor adie a data de entrega sem dizer nada.', correct: false },
      ],
    },
  ];

  // -------------------------------------------------------------
  // 4. DIREITOS DE AUTOR STATE
  // -------------------------------------------------------------
  const [copyrightChoices, setCopyrightChoices] = useState<Record<string, 'permitido' | 'proibido'>>({});
  const [copyrightScore, setCopyrightScore] = useState<number | null>(null);
  const copyrightScenarios = [
    {
      id: 'cpr-1',
      case: 'Descarregar uma música recente do Spotify e usá-la num anúncio comercial da empresa dos teus pais sem pagar licença.',
      correct: 'proibido',
      explanation: 'Músicas comerciais com copyright exigem pagamento e autorização dos artistas.',
    },
    {
      id: 'cpr-2',
      case: 'Utilizar uma fotografia com licença de Domínio Público no trabalho de TIC e citar a fonte da imagem.',
      correct: 'permitido',
      explanation: 'O Domínio Público permite utilização gratuita, sendo sempre boa prática citar o autor.',
    },
    {
      id: 'cpr-3',
      case: 'Copiar o desenho de um ilustrador do Instagram, apagar a assinatura dele e colocar o teu nome.',
      correct: 'proibido',
      explanation: 'Apagar a assinatura do autor é violação grave de direitos morais e plágio.',
    },
  ];

  // -------------------------------------------------------------
  // 5. PLAGIO E AUTORIA STATE
  // -------------------------------------------------------------
  const [plagiarismOption, setPlagiarismOption] = useState<string | null>(null);
  const [plagiarismScore, setPlagiarismScore] = useState<number | null>(null);

  // -------------------------------------------------------------
  // 6. CREATIVE COMMONS STATE
  // -------------------------------------------------------------
  const [ccMatched, setCcMatched] = useState<Record<string, string>>({});
  const [ccScore, setCcScore] = useState<number | null>(null);
  const ccLicenses = [
    { code: 'BY', name: 'Atribuição', meaning: 'Obrigatório dar crédito ao autor original' },
    { code: 'NC', name: 'Não Comercial', meaning: 'Não pode ser usado para obter lucro financeiro' },
    { code: 'ND', name: 'Sem Derivações', meaning: 'O trabalho não pode ser alterado ou remisturado' },
    { code: 'SA', name: 'Partilha nos Mesmos Termos', meaning: 'O novo trabalho deve ter a mesma licença' },
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
            worldId: 3,
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

  // Handlers
  const handleToneSelect = (id: string) => {
    setSelectedMessageTone(id);
    const item = messageOptions.find((m) => m.id === id);
    const score = item ? item.score : 50;
    setMessageScore(score);
    reportCompletion('sim-comunicacao-digital', 'Comunicação Digital', score);
  };

  const handleNetiquetteSubmit = () => {
    let correct = 0;
    netiquetteScenarios.forEach((scen) => {
      if (netiquetteChoices[scen.id] === scen.correct) correct++;
    });
    const score = Math.round((correct / netiquetteScenarios.length) * 100);
    setNetiquetteScore(score);
    reportCompletion('sim-netiqueta', 'Simulador de Netiqueta', score);
  };

  const handleCollabSubmit = () => {
    let correct = 0;
    collabScenarios.forEach((scen) => {
      const selected = scen.options.find((o) => o.id === collabChoices[scen.id]);
      if (selected && selected.correct) correct++;
    });
    const score = Math.round((correct / collabScenarios.length) * 100);
    setCollabScore(score);
    reportCompletion('sim-colaboracao', 'Simulador de Colaboração & Equipa', score);
  };

  const handleCopyrightSubmit = () => {
    let correct = 0;
    copyrightScenarios.forEach((scen) => {
      if (copyrightChoices[scen.id] === scen.correct) correct++;
    });
    const score = Math.round((correct / copyrightScenarios.length) * 100);
    setCopyrightScore(score);
    reportCompletion('sim-direitos-autor', 'Direitos de Autor & Permissões', score);
  };

  const handlePlagiarismSelect = (optId: string) => {
    setPlagiarismOption(optId);
    const score = optId === 'correct' ? 100 : 30;
    setPlagiarismScore(score);
    reportCompletion('sim-plagio-citacao', 'Simulador de Citação & Reconhecimento', score);
  };

  const handleCcSubmit = () => {
    let count = 0;
    if (ccMatched['BY'] === 'crédito') count++;
    if (ccMatched['NC'] === 'lucro') count++;
    if (ccMatched['ND'] === 'alterado') count++;
    if (ccMatched['SA'] === 'mesma') count++;
    const score = Math.round((count / 4) * 100);
    setCcScore(score);
    reportCompletion('sim-creative-commons', 'Simulador de Licenças Creative Commons', score);
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
    <div className="space-y-6">
      {/* Global Completed Feedback Banner */}
      {completedFeedback && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-3xl flex items-center justify-between text-purple-950 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <Award className="w-7 h-7 text-purple-600 shrink-0" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block">
                Atividade Registada com Sucesso: {completedFeedback.activityTitle}
              </span>
              <p className="text-sm font-black">
                Pontuação Obtida: {completedFeedback.score}/100{' '}
                {completedFeedback.xpGain > 0 && (
                  <span className="text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md ml-1">
                    +{completedFeedback.xpGain} XP Ganho!
                  </span>
                )}
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

          {/* 📖 1. APRENDE (Conteúdo Teórico Exato + Ilustração Educativa) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-purple-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: TOM, EMPATIA E CLAREZA NA ESCRITA DIGITAL
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
                Ajuste de tom e pontuação
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Precisas de pedir a um colega de grupo que envie o resumo para o trabalho de TIC.
              Qual destas mensagens representa uma comunicação digital eficaz e empática?
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
                Regra de Ouro: Como a pessoa do outro lado não vê os teus olhos nem ouve a tua voz, a clareza e as palavras gentis evitam 99% dos conflitos online!
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

          {/* 📖 1. APRENDE (Conteúdo Teórico Exato + Ilustração Educativa) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-purple-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: AS REGRAS DE CONVIVÊNCIA DIGITAL
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
                Avalia a conduta nos grupos digitais
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
                Pontuação da Netiqueta: {netiquetteScore}/100. Um bom Criador Digital cultiva espaços digitais saudáveis e respeitosos!
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

          {/* 📖 1. APRENDE (Conteúdo Teórico Exato + Ilustração Educativa) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-purple-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: COOPERAÇÃO, DIVISÃO DE TAREFAS E PRAZOS
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
                Tomada de decisão em projetos de grupo
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
                Desempenho de Liderança e Cooperação: {collabScore}/100. Trabalhar em equipa significa valorizar o esforço de todos e chegar juntos à meta!
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

          {/* 📖 1. APRENDE (Conteúdo Teórico Exato + Ilustração Educativa) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-purple-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: PROPRIEDADE INTELECTUAL E PROTEÇÃO DAS CRIAÇÕES
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
                O que posso ou não posso usar?
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
                      Permitido Legalmente
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
                      Viola Direitos de Autor
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
                Auditoria de Copyright: {copyrightScore}/100. Estar disponível na web não significa que seja de utilização livre!
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

          {/* 📖 1. APRENDE (Conteúdo Teórico Exato + Ilustração Educativa) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-purple-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                1. APRENDE: O QUE É PLÁGIO E COMO CITAR CORRETAMENTE
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
                Aprende a transformar cópia em citação rigorosa
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-[10px] font-black uppercase text-purple-600 block">
                Texto Original Encontrado no Artigo do Biólogo Dr. Tiago Ramos:
              </span>
              <p className="text-xs text-slate-800 italic font-medium">
                "Os fundos marinhos da costa portuguesa contêm recifes de coral de água fria com mais de mil anos de idade."
              </p>
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-800">
              Qual das opções abaixo deves colocar no teu trabalho de grupo para valorizar o autor sem cometer plágio?
            </p>

            <div className="space-y-3">
              <div
                onClick={() => handlePlagiarismSelect('wrong')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  plagiarismOption === 'wrong'
                    ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-rose-700">Opção A: Copiar e Colar Direto</span>
                  <span className="text-[11px] font-bold text-slate-500">Incorreto (Plágio)</span>
                </div>
                <p className="text-xs text-slate-700">
                  "Os fundos marinhos da costa portuguesa contêm recifes de coral de água fria com mais de mil anos de idade." (Sem aspas, sem citar quem descobriu).
                </p>
              </div>

              <div
                onClick={() => handlePlagiarismSelect('correct')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  plagiarismOption === 'correct'
                    ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-emerald-700">Opção B: Citação Atribuída e Resumo</span>
                  <span className="text-[11px] font-bold text-slate-500">Correto (Académico)</span>
                </div>
                <p className="text-xs text-slate-700">
                  De acordo com a investigação do biólogo Dr. Tiago Ramos (2025), os recifes de coral profundo na costa de Portugal podem ultrapassar um milénio de existência. [Fonte: Revista Oceano Vivo].
                </p>
              </div>
            </div>

            {plagiarismScore !== null && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-950 font-medium">
                Excelente! Citar fontes não diminui o teu trabalho — pelo contrário: mostra que pesquisaste fontes de qualidade e que és honesto intelectualmente!
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

          {/* 📖 1. APRENDE (Conteúdo Teórico Exato + Ilustração Educativa) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-purple-700">
                <BookOpen className="w-5 h-5" />
                <h4 className="text-base sm:text-lg font-black uppercase tracking-wide">
                  1. APRENDE: LICENÇAS ABERTAS E REGRAS DE PARTILHA
                </h4>
              </div>
              <span className="text-xs font-bold text-white bg-slate-900 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Conceito Curricular Explicado</span>
              </span>
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

          {/* 🎮 2. EXPERIMENTA */}
          <div className="bg-white border border-purple-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-purple-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-base font-black uppercase tracking-wide">
                  2. Experimenta: Simulador de Licenças Creative Commons
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Decifra os símbolos oficiais
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ccLicenses.map((lic) => (
                <div key={lic.code} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-800 font-mono font-black text-xs rounded-lg">
                      CC {lic.code}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{lic.name}</span>
                  </div>
                  <p className="text-xs text-slate-600">{lic.meaning}</p>
                  <div className="pt-2">
                    <select
                      value={ccMatched[lic.code] || ''}
                      onChange={(e) =>
                        setCcMatched((prev) => ({ ...prev, [lic.code]: e.target.value }))
                      }
                      className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-xl"
                    >
                      <option value="">Seleciona o significado prático...</option>
                      {lic.code === 'BY' && <option value="crédito">Reconhecer e nomear sempre o autor original</option>}
                      {lic.code === 'NC' && <option value="lucro">Nunca vender nem lucrar com o conteúdo</option>}
                      {lic.code === 'ND' && <option value="alterado">Não modificar nem criar versões derivadas</option>}
                      {lic.code === 'SA' && <option value="mesma">Partilhar a tua versão com a mesma licença</option>}
                      <option value="errado">Usar sem regras livremente</option>
                    </select>
                  </div>
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
                Resultado do Simulador: {ccScore}/100. As licenças Creative Commons são essenciais para criar e partilhar conteúdos respeitando a comunidade de autores!
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
              Avaliação Final de 8 Perguntas
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
              Mostra que dominas a netiqueta, colaboração e respeito pelos direitos de autor para desbloquear o Mundo 4!
            </p>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl max-w-md mx-auto text-xs text-purple-950 font-semibold space-y-1">
            <p>🏆 Requisito para desbloquear o Mundo 4: Média &gt; 80%</p>
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
              <span>Começar Avaliação Final (8 Perguntas)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
