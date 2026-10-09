import React, { useState } from 'react';
import {
  Search,
  UserCheck,
  Calendar,
  Layers,
  AlertOctagon,
  CheckCircle2,
  Trophy,
  Sparkles,
  ArrowRight,
  Flame,
  Clock,
  Filter,
} from 'lucide-react';
import { WorldSummary } from '../types';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { GameHeader } from './gameEngine/GameHeader';
import { GameFeedbackBanner } from './gameEngine/GameFeedbackBanner';
import { GameClassificationBoard } from './gameEngine/GameClassificationBoard';
import { GameDetectiveInspector } from './gameEngine/GameDetectiveInspector';
import { GameDecisionScenario } from './gameEngine/GameDecisionScenario';
import { GameMatchingPairs } from './gameEngine/GameMatchingPairs';

interface World2ThematicViewProps {
  world: WorldSummary;
  activeTopicId: string;
  onNavigateTopic: (topicId: string) => void;
  onOpenAssessment: () => void;
  onRefreshWorld: () => Promise<void>;
}

export const World2ThematicView: React.FC<World2ThematicViewProps> = ({
  world,
  activeTopicId,
  onNavigateTopic,
  onOpenAssessment,
  onRefreshWorld,
}) => {
  const { refreshUser } = useAuth();

  const [stage, setStage] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  const [feedback, setFeedback] = useState<{
    status: 'correct' | 'wrong' | 'victory' | 'gameover';
    title: string;
    message: string;
    xpGain?: number;
  } | null>(null);

  // Simulator Search State for Topic 1
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOutput, setSearchOutput] = useState<{ title: string; count: string; hint: string; score: number } | null>(null);

  const resetGame = () => {
    setLives(3);
    setFeedback(null);
  };

  const handleLoseLife = (pedagogicalReason: string) => {
    const nextLives = Math.max(0, lives - 1);
    setLives(nextLives);
    if (nextLives === 0) {
      setFeedback({
        status: 'gameover',
        title: '💔 Sem Vidas de Detetive!',
        message: `${pedagogicalReason} Clica em Jogar de Novo para recarregar as energias e tentar outra vez!`,
      });
    } else {
      setFeedback({
        status: 'wrong',
        title: '⚠️ Pista Incorreta!',
        message: `${pedagogicalReason} Restam-te ${nextLives} vidas.`,
      });
    }
  };

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
          worldId: 2,
          answers: payloadData?.answers || payloadData,
          payload: payloadData,
          completedAction: payloadData?.completedAction || 'completed',
          score,
        }),
      });

      setFeedback({
        status: score >= 70 ? 'victory' : 'correct',
        title: score >= 70 ? '🏆 Caso Resolvido com Distinção!' : '✓ Pista Registada!',
        message: `Excelente raciocínio de Detetive da Informação! Pontuação: ${score}/100.`,
        xpGain: res.xpGain || 30,
      });

      await refreshUser();
      await onRefreshWorld();
    } catch (err: any) {
      console.error('Failed to report completion:', err);
    }
  };

  const evaluateSearchQuery = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    let score = 30;
    let title = 'Pesquisa Vaga 🌫️';
    let count = '14.200.000 resultados';
    let hint = 'Usaste palavras demasiado gerais. O motor de busca traz páginas de todo o mundo sem resolver a dúvida!';

    if (q.includes('"') || (q.includes('portugal') && q.includes('lince'))) {
      score = 100;
      title = 'Pesquisa Científica Lendária 🎯';
      count = '3.420 resultados ultra-precisos';
      hint = 'Perfeito! Usaste termos específicos e delimitaste o país e a espécie em perigo.';
    } else if (q.includes('lince') || q.includes('extinção') || q.includes('perigo')) {
      score = 75;
      title = 'Boa Pesquisa, mas pode ser melhor! 🔍';
      count = '450.000 resultados';
      hint = 'Bom caminho! Se adicionares "Portugal" ou colocares a expressão entre aspas " ", chegas logo aos artigos científicos.';
    }

    setSearchOutput({ title, count, hint, score });
    reportCompletion('sim-keywords', 'Simulador de Pesquisa Inteligente', { query: q }, score);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. SEPARADOR: RADAR DE PALAVRAS-CHAVE                     */}
      {/* ========================================================= */}
      {activeTopicId === 'w2-t1' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <GameHeader
            title="🔍 Missão 1: O Radar de Palavras-Chave"
            subtitle="Aprende a pesquisar como um cientista: termos específicos vencem perguntas compridas e vagas!"
            lives={lives}
            xpReward={30}
            currentStage={stage}
            totalStages={3}
            stagesLabels={['Fase 1: Classificador de Pesquisas', 'Fase 2: Motor de Busca Interativo', 'Fase 3: Decisão de Detetive']}
            onSelectStage={(s) => {
              setStage(s);
              setFeedback(null);
            }}
            onResetGame={resetGame}
          />

          {feedback && (
            <GameFeedbackBanner
              status={feedback.status}
              title={feedback.title}
              message={feedback.message}
              xpGain={feedback.xpGain}
              onRetry={resetGame}
              onNext={stage < 3 ? () => setStage(stage + 1) : undefined}
            />
          )}

          {stage === 1 && (
            <GameClassificationBoard
              title="Classificador de Termos de Busca"
              instruction="Classifica cada pesquisa como 'Pesquisa Vaga / Fraca 😴' ou 'Pesquisa Precisa / Eficaz 🎯'."
              items={[
                {
                  id: 'item-q1',
                  text: 'Animais',
                  emoji: '🐾',
                  category: 'vaga',
                  explanation: 'Demasiado genérica: traz milhões de páginas sem responder à tua pergunta específica.',
                },
                {
                  id: 'item-q2',
                  text: '"lince ibérico" extinção Portugal',
                  emoji: '🐱',
                  category: 'precisa',
                  explanation: 'Excelente! Usa aspas para a espécie exata e especifica o país e a temática.',
                },
                {
                  id: 'item-q3',
                  text: 'Como é que eu faço para saber as coisas da história',
                  emoji: '📜',
                  category: 'vaga',
                  explanation: 'Escrever frases de conversa com pronomes e verbos enche os motores de busca de ruído.',
                },
                {
                  id: 'item-q4',
                  text: 'Batalha de Aljubarrota 1385 resumo',
                  emoji: '⚔️',
                  category: 'precisa',
                  explanation: 'Perfeito! Junta acontecimento histórico, ano e o formato pretendido.',
                },
              ]}
              categories={[
                { id: 'vaga', name: 'Pesquisa Vaga 🌫️', colorClass: 'text-amber-700', borderClass: 'border-amber-300', bgClass: 'bg-amber-100', icon: '😴' },
                { id: 'precisa', name: 'Pesquisa Precisa 🎯', colorClass: 'text-emerald-700', borderClass: 'border-emerald-300', bgClass: 'bg-emerald-100', icon: '🎯' },
              ]}
              onComplete={(score) => {
                reportCompletion('sim-keywords', 'Classificador de Pesquisas', { score }, score);
              }}
            />
          )}

          {stage === 2 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-blue-600">
                  Laboratório Prático
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  🧪 Simulador de Motor de Busca Inteligente
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  <strong>Desafio:</strong> Queres descobrir informação sobre o <em>Lince Ibérico em Portugal</em>.
                  Experimenta escrever palavras-chave na barra abaixo e clica em <strong>Analisar Eficácia</strong>!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder='ex: "lince ibérico" Portugal ou apenas lince...'
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 font-semibold text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <button
                  onClick={evaluateSearchQuery}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all cursor-pointer shrink-0"
                >
                  Analisar Eficácia
                </button>
              </div>

              {searchOutput && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-base text-slate-900">{searchOutput.title}</h4>
                    <span className="text-xs font-mono font-bold text-slate-500">{searchOutput.count}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                    {searchOutput.hint}
                  </p>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${searchOutput.score >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${searchOutput.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {stage === 3 && (
            <GameDecisionScenario
              scenario={{
                id: 'dec-keywords',
                title: 'O Trabalho de Ciências com Prazo Apertado',
                situation: 'Tens 30 minutos para encontrar as 3 principais causas da poluição dos oceanos por plásticos. O que deves escrever no motor de busca?',
                choices: [
                  {
                    id: 'c1',
                    text: 'Escrever: "porque é que o mar fica tão sujo com lixo e plástico e faz mal aos peixes"',
                    isBest: false,
                    explanation: 'Frases compridas contêm palavras desnecessárias que confundem o algoritmo do motor de busca.',
                  },
                  {
                    id: 'c2',
                    text: 'Escrever: "poluição oceanos" plástico causas estatísticas',
                    isBest: true,
                    explanation: 'Excelente! Usaste termos-chave objetivos, aspas na expressão principal e delimitaste os factos pretendidos.',
                  },
                  {
                    id: 'c3',
                    text: 'Escrever apenas: "plástico"',
                    isBest: false,
                    explanation: 'Apenas uma palavra dá resultados sobre fábricas de plástico, reciclagem genérica ou brinquedos, sem foco.',
                  },
                ],
              }}
              onChoice={(isCorrect, choice) => {
                if (isCorrect) {
                  reportCompletion('sim-keywords', 'Decisão de Palavras-Chave', { choice: choice.id }, 100);
                } else {
                  handleLoseLife(choice.explanation);
                }
              }}
            />
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SEPARADOR: QUEM É O AUTOR?                             */}
      {/* ========================================================= */}
      {activeTopicId === 'w2-t2' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <GameHeader
            title="🕵️ Missão 2: Quem Escreveu Isto? O Selo do Autor"
            subtitle="Qualquer pessoa pode publicar na web! Aprende a verificar a identidade e credibilidade de quem escreve."
            lives={lives}
            xpReward={30}
            currentStage={stage}
            totalStages={3}
            stagesLabels={['Fase 1: Detetive de Autoria', 'Fase 2: Classificador de Fontes', 'Fase 3: Dilema do Post']}
            onSelectStage={(s) => {
              setStage(s);
              setFeedback(null);
            }}
            onResetGame={resetGame}
          />

          {feedback && (
            <GameFeedbackBanner
              status={feedback.status}
              title={feedback.title}
              message={feedback.message}
              xpGain={feedback.xpGain}
              onRetry={resetGame}
              onNext={stage < 3 ? () => setStage(stage + 1) : undefined}
            />
          )}

          {stage === 1 && (
            <GameDetectiveInspector
              title="O Artigo Científico Sem Rosto"
              missionBrief="Clica nas 3 pistas sospeitas que provam que esta página tem autoria duvidosa e pouco fiável!"
              contentCard={{
                header: 'Blog: Segredos-Ocultos-Espaco.blogspot.com | Publicado: Hoje',
                bodyText:
                  'Novo planeta descoberto com aliens gigantes! Artigo escrito por "Utilizador_Gamer_99". Não temos contacto institucional nem biografia, mas garantimos que a NASA nos confirmou tudo em segredo. Clica no nosso anúncio para comprar o telescópio mágico!',
              }}
              clues={[
                {
                  id: 'c-autor',
                  targetText: 'Utilizador_Gamer_99',
                  hint: 'Pseudónimo anónimo',
                  isSuspicious: true,
                  explanation: 'O autor usa um nickname anónimo e não apresenta qualificações científicas reais.',
                },
                {
                  id: 'c-sobre',
                  targetText: 'Não temos contacto institucional nem biografia',
                  hint: 'Falta de transparência',
                  isSuspicious: true,
                  explanation: 'Sites credíveis possuem secção "Sobre nós", ficha técnica e meios de contacto oficiais.',
                },
                {
                  id: 'c-venda',
                  targetText: 'Clica no nosso anúncio para comprar o telescópio',
                  hint: 'Conflito de interesses',
                  isSuspicious: true,
                  explanation: 'O texto serve apenas para vender um produto, manipulando a curiosidade do leitor.',
                },
                {
                  id: 'c-planeta',
                  targetText: 'Novo planeta descoberto',
                  hint: 'O tema abordado',
                  isSuspicious: false,
                  explanation: 'A descoberta de planetas é um tema astronómico comum, mas precisa de fontes de observatórios oficiais.',
                },
              ]}
              onComplete={(score) => {
                reportCompletion('sim-author-check', 'Detetive de Autoria', { score }, score);
              }}
            />
          )}

          {stage === 2 && (
            <GameClassificationBoard
              title="Avaliador de Credibilidade de Fontes"
              instruction="Classifica cada entidade como 'Fonte Credenciada / Confiável 🏛️' ou 'Fonte Duvidosa / Sem Validação ❓'."
              items={[
                {
                  id: 'auth-1',
                  text: 'Universidade de Coimbra - Departamento de Biologia',
                  emoji: '🎓',
                  category: 'confiavel',
                  explanation: 'Instituição de ensino superior de referência com revisores e cientistas reconhecidos.',
                },
                {
                  id: 'auth-2',
                  text: 'Comentário anónimo num fórum do Reddit',
                  emoji: '💬',
                  category: 'duvidosa',
                  explanation: 'Qualquer pessoa pode publicar opiniões ou desinformação sem moderação nem validação.',
                },
                {
                  id: 'auth-3',
                  text: 'Instituto Português do Mar e da Atmosfera (IPMA)',
                  emoji: '🌦️',
                  category: 'confiavel',
                  explanation: 'Organismo público oficial com técnicos especialistas em meteorologia e sismologia.',
                },
                {
                  id: 'auth-4',
                  text: 'Canal de TikTok chamado "Verdades_Secretas_2026"',
                  emoji: '📱',
                  category: 'duvidosa',
                  explanation: 'Sem ficha técnica, sem fontes citadas e com foco em sensacionalismo para cliques.',
                },
              ]}
              categories={[
                { id: 'confiavel', name: 'Fonte Credenciada 🏛️', colorClass: 'text-emerald-700', borderClass: 'border-emerald-300', bgClass: 'bg-emerald-100', icon: '🏛️' },
                { id: 'duvidosa', name: 'Fonte Duvidosa ❓', colorClass: 'text-rose-700', borderClass: 'border-rose-300', bgClass: 'bg-rose-100', icon: '❓' },
              ]}
              onComplete={(score) => {
                reportCompletion('sim-author-check', 'Classificador de Fontes', { score }, score);
              }}
            />
          )}

          {stage === 3 && (
            <GameDecisionScenario
              scenario={{
                id: 'dec-author',
                title: 'O Conselho Médico nas Redes Sociais',
                situation: 'Encontras um vídeo viral a afirmar que beber sumo de cebola cura qualquer gripe em 2 horas. O autor é um influenciador de videojogos. Como deves agir?',
                choices: [
                  {
                    id: 'c1',
                    text: 'Acreditar logo e partilhar no grupo da família porque o vídeo tem 1 milhão de gostos.',
                    isBest: false,
                    explanation: 'Milhões de visualizações não tornam uma dica médica verdadeira. A saúde exige validação médica oficial.',
                  },
                  {
                    id: 'c2',
                    text: 'Verificar no portal do Serviço Nacional de Saúde (SNS) ou consultar um médico/farmacêutico.',
                    isBest: true,
                    explanation: 'Excelente! A informação de saúde deve vir sempre de profissionais médicos e fontes de saúde oficiais.',
                  },
                  {
                    id: 'c3',
                    text: 'Comentar no vídeo a pedir para o influenciador receitar outros sumos.',
                    isBest: false,
                    explanation: 'Um criador de conteúdos de jogos não tem formação para orientar tratamentos de saúde.',
                  },
                ],
              }}
              onChoice={(isCorrect, choice) => {
                if (isCorrect) {
                  reportCompletion('sim-author-check', 'Decisão de Autoria', { choice: choice.id }, 100);
                } else {
                  handleLoseLife(choice.explanation);
                }
              }}
            />
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SEPARADOR: A MÁQUINA DO TEMPO (DATAS)                  */}
      {/* ========================================================= */}
      {activeTopicId === 'w2-t3' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <GameHeader
            title="⏳ Missão 3: A Máquina do Tempo: A Data Conta Muito!"
            subtitle="Uma notícia verdadeira de há 10 anos pode ser totalmente enganadora se for partilhada como sendo de hoje!"
            lives={lives}
            xpReward={30}
            currentStage={stage}
            totalStages={3}
            stagesLabels={['Fase 1: Inspetor da Data', 'Fase 2: Classificador Temporal', 'Fase 3: Alerta da Tempestade']}
            onSelectStage={(s) => {
              setStage(s);
              setFeedback(null);
            }}
            onResetGame={resetGame}
          />

          {feedback && (
            <GameFeedbackBanner
              status={feedback.status}
              title={feedback.title}
              message={feedback.message}
              xpGain={feedback.xpGain}
              onRetry={resetGame}
              onNext={stage < 3 ? () => setStage(stage + 1) : undefined}
            />
          )}

          {stage === 1 && (
            <GameDetectiveInspector
              title="A Notícia Reencaminhada com Pistas Ocultas"
              missionBrief="Clica nas 3 pistas que mostram que este artigo é antigo e já não reflete a realidade!"
              contentCard={{
                header: 'Jornal Online | Secção Educação',
                bodyText:
                  'Atenção alunos: "Todas as escolas vão fechar amanhã devido a greve geral de transportes". Ao fundo da página, em letra pequena, surge: Publicado a 14 de março de 2012. Além disso, a notícia menciona o Ministério da Educação que já mudou de nome e preços em escudos!',
              }}
              clues={[
                {
                  id: 'c-date',
                  targetText: 'Publicado a 14 de março de 2012',
                  hint: 'Ano de publicação antigo',
                  isSuspicious: true,
                  explanation: 'O artigo tem mais de uma década! Partilhá-lo hoje cria alarme falso sobre as aulas.',
                },
                {
                  id: 'c-ministerio',
                  targetText: 'Ministério da Educação que já mudou de nome',
                  hint: 'Entidade desatualizada',
                  isSuspicious: true,
                  explanation: 'Nomes de organismos e ministérios antigos provam que a notícia não é atual.',
                },
                {
                  id: 'c-moeda',
                  targetText: 'preços em escudos',
                  hint: 'Referência temporal caducada',
                  isSuspicious: true,
                  explanation: 'Referências económicas ou regras antigas denunciam de imediato o ano do documento.',
                },
                {
                  id: 'c-escolas',
                  targetText: 'Todas as escolas vão fechar amanhã',
                  hint: 'O título alarmante',
                  isSuspicious: false,
                  explanation: 'Títulos dramáticos são usados de propósito para que as pessoas não leiam a data com calma.',
                },
              ]}
              onComplete={(score) => {
                reportCompletion('sim-date-verifier', 'Inspetor da Data', { score }, score);
              }}
            />
          )}

          {stage === 2 && (
            <GameClassificationBoard
              title="Classificador de Atualidade e Validade"
              instruction="Classifica se a informação está 'Válida / Atualizada 📅' ou 'Caducada / Requer Confirmação ⚠️'."
              items={[
                {
                  id: 'tmp-1',
                  text: 'Previsão do estado do tempo emitida esta manhã às 08h00 pelo IPMA',
                  emoji: '☀️',
                  category: 'valida',
                  explanation: 'Informação meteorológica recente e emitida poucas horas antes.',
                },
                {
                  id: 'tmp-2',
                  text: 'Guia de segurança informática para telemóveis publicado em 2008',
                  emoji: '📟',
                  category: 'caducada',
                  explanation: 'Em tecnologia, 18 anos tornam os conselhos obsoletos e sem proteção para as ameaças atuais.',
                },
                {
                  id: 'tmp-3',
                  text: 'Calendário de exames e avaliações do ano letivo em curso',
                  emoji: '📅',
                  category: 'valida',
                  explanation: 'Documento oficial respeitante ao ano escolar atual.',
                },
                {
                  id: 'tmp-4',
                  text: 'Vídeo partilhado no WhatsApp a dizer que há um tsunami a caminho gravado em 2011',
                  emoji: '🌊',
                  category: 'caducada',
                  explanation: 'Imagens reais de catástrofes antigas são frequentemente recicladas para espalhar pânico.',
                },
              ]}
              categories={[
                { id: 'valida', name: 'Válida e Atual 📅', colorClass: 'text-emerald-700', borderClass: 'border-emerald-300', bgClass: 'bg-emerald-100', icon: '📅' },
                { id: 'caducada', name: 'Caducada / Antiga ⚠️', colorClass: 'text-rose-700', borderClass: 'border-rose-300', bgClass: 'bg-rose-100', icon: '⚠️' },
              ]}
              onComplete={(score) => {
                reportCompletion('sim-date-verifier', 'Classificador Temporal', { score }, score);
              }}
            />
          )}

          {stage === 3 && (
            <GameDecisionScenario
              scenario={{
                id: 'dec-date',
                title: 'O Alerta de Furacão no Grupo de Turma',
                situation: 'Um colega envia um link com a manchete "ALERTA VERMELHO: Tempestade destrói telhados e cancela aulas". Todos começam a festejar. O que deves fazer?',
                choices: [
                  {
                    id: 'c1',
                    text: 'Começar a arrumar os livros e não estudar para o teste de amanhã.',
                    isBest: false,
                    explanation: 'Agir por impulso sem confirmar a data da notícia pode levar a faltas e notas negativas.',
                  },
                  {
                    id: 'c2',
                    text: 'Abrir o link, verificar a data da publicação e consultar a página oficial da escola ou da Proteção Civil.',
                    isBest: true,
                    explanation: 'Excelente atitude de detetive! Verificar a data evita espalhar falsos alarmes.',
                  },
                  {
                    id: 'c3',
                    text: 'Encaminhar o aviso para os teus primos noutra cidade.',
                    isBest: false,
                    explanation: 'Reencaminhar sem validar a data alimenta o ciclo de desinformação.',
                  },
                ],
              }}
              onChoice={(isCorrect, choice) => {
                if (isCorrect) {
                  reportCompletion('sim-date-verifier', 'Decisão de Linha Temporal', { choice: choice.id }, 100);
                } else {
                  handleLoseLife(choice.explanation);
                }
              }}
            />
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. SEPARADOR: O SUPER-PODER DE COMPARAR FONTES            */}
      {/* ========================================================= */}
      {activeTopicId === 'w2-t4' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <GameHeader
            title="📑 Missão 4: O Super-Poder de Comparar Fontes"
            subtitle="Regra de Ouro do Detetive: Nunca confies num único site! Compara 2 ou 3 fontes antes de apresentar."
            lives={lives}
            xpReward={30}
            currentStage={stage}
            totalStages={3}
            stagesLabels={['Fase 1: O Jogo dos 3 Artigos', 'Fase 2: Caça ao Intruso', 'Fase 3: O Trabalho Escolar']}
            onSelectStage={(s) => {
              setStage(s);
              setFeedback(null);
            }}
            onResetGame={resetGame}
          />

          {feedback && (
            <GameFeedbackBanner
              status={feedback.status}
              title={feedback.title}
              message={feedback.message}
              xpGain={feedback.xpGain}
              onRetry={resetGame}
              onNext={stage < 3 ? () => setStage(stage + 1) : undefined}
            />
          )}

          {stage === 1 && (
            <GameMatchingPairs
              title="Triangulação de Fontes da Missão"
              instruction="Associa cada tipo de fonte ao seu papel na investigação pedagógica."
              pairs={[
                {
                  id: 'p1',
                  leftText: 'Fonte Primária',
                  rightText: 'Documento original ou cientista que fez a descoberta',
                  leftEmoji: '📜',
                  rightEmoji: '🔬',
                  explanation: 'É a fonte mais direta e pura, sem interpretações de terceiros.',
                },
                {
                  id: 'p2',
                  leftText: 'Fonte Secundária',
                  rightText: 'Jornal ou enciclopédia que resume e explica a descoberta',
                  leftEmoji: '📰',
                  rightEmoji: '📚',
                  explanation: 'Ajuda a compreender o assunto com linguagem acessível ao público.',
                },
                {
                  id: 'p3',
                  leftText: 'Triangulação',
                  rightText: 'Cruzar 3 fontes independentes para confirmar os factos',
                  leftEmoji: '📐',
                  rightEmoji: '✅',
                  explanation: 'Se 3 fontes sérias e diferentes confirmam o facto, a probabilidade de erro é mínima.',
                },
                {
                  id: 'p4',
                  leftText: 'Cópia em Espelho',
                  rightText: 'Sites diferentes que apenas copiaram o mesmo texto sem verificar',
                  leftEmoji: '🪞',
                  rightEmoji: '⚠️',
                  explanation: 'Repetir o mesmo erro em 10 blogs não transforma uma mentira em verdade.',
                },
              ]}
              onComplete={(score) => {
                reportCompletion('sim-source-compare', 'Triangulação de Fontes', { score }, score);
              }}
            />
          )}

          {stage === 2 && (
            <GameDetectiveInspector
              title="A Caça à Informação Falsa Entre as Fontes"
              missionBrief="Três jornais sérios dizem a verdade, mas um site inventou um detalhe impossível. Clica no detalhe falso!"
              contentCard={{
                header: 'Quadro Comparativo de 3 Fontes Oficiais sobre o Robô em Marte',
                bodyText:
                  'Fonte A (NASA): O rover recolheu amostras de rocha mineral em Marte. Fonte B (Agência Espacial Europeia): As rochas foram analisadas por lasers científicos. Fonte C (Blog Misterioso): "O robô foi atacado por polvos gigantes marcianos que destruíram as câmaras".',
              }}
              clues={[
                {
                  id: 'c-nasa',
                  targetText: 'amostras de rocha mineral em Marte',
                  hint: 'Facto confirmado por cientistas',
                  isSuspicious: false,
                  explanation: 'Corresponde à missão real dos rovers de exploração geológica.',
                },
                {
                  id: 'c-polvos',
                  targetText: 'atacado por polvos gigantes marcianos',
                  hint: 'Invenção sem suporte científico',
                  isSuspicious: true,
                  explanation: 'Nenhuma outra fonte refere este absurdo. É uma invenção flagrante de ficção para atrair cliques!',
                },
                {
                  id: 'c-lasers',
                  targetText: 'analisadas por lasers científicos',
                  hint: 'Tecnologia real comprovada',
                  isSuspicious: false,
                  explanation: 'Os instrumentos dos rovers usam espetrómetros e lasers para vaporizar pequenas pedras.',
                },
              ]}
              onComplete={(score) => {
                reportCompletion('sim-source-compare', 'Caça ao Intruso de Fontes', { score }, score);
              }}
            />
          )}

          {stage === 3 && (
            <GameDecisionScenario
              scenario={{
                id: 'dec-compare',
                title: 'A Preparação da Apresentação de TIC',
                situation: 'Estás a fazer uma pesquisa e o primeiro link do motor de busca tem exatamente a frase que querias. Deves fechar o computador e dar o trabalho por terminado?',
                choices: [
                  {
                    id: 'c1',
                    text: 'Sim, se apareceu em primeiro lugar no Google é garantido que está 100% certo.',
                    isBest: false,
                    explanation: 'A primeira posição pode ser um anúncio pago ou ter bom SEO, mas conter imprecisões.',
                  },
                  {
                    id: 'c2',
                    text: 'Não! Devo abrir mais 1 ou 2 fontes de instituições diferentes para confirmar os dados principais.',
                    isBest: true,
                    explanation: 'Perfeito! Comparar fontes é a marca de um estudante rigoroso e detetive da verdade.',
                  },
                  {
                    id: 'c3',
                    text: 'Mudar apenas 2 palavras para o professor não notar que só li um site.',
                    isBest: false,
                    explanation: 'O problema não é o professor notar, é aprenderes dados incorretos sem validação.',
                  },
                ],
              }}
              onChoice={(isCorrect, choice) => {
                if (isCorrect) {
                  reportCompletion('sim-source-compare', 'Decisão de Comparar Fontes', { choice: choice.id }, 100);
                } else {
                  handleLoseLife(choice.explanation);
                }
              }}
            />
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. SEPARADOR: NOTÍCIAS FALSAS: FACTO VS OPINIÃO           */}
      {/* ========================================================= */}
      {activeTopicId === 'w2-t5' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <GameHeader
            title="🚨 Missão 5: Caça às Notícias Falsas: Facto vs Opinião"
            subtitle="Desvenda os truques dos boatos: títulos sensacionalistas, afirmações sem provas e confusão entre facto e opinião."
            lives={lives}
            xpReward={30}
            currentStage={stage}
            totalStages={3}
            stagesLabels={['Fase 1: Facto vs Opinião', 'Fase 2: Detetive de Fake News', 'Fase 3: O Dilema Viral']}
            onSelectStage={(s) => {
              setStage(s);
              setFeedback(null);
            }}
            onResetGame={resetGame}
          />

          {feedback && (
            <GameFeedbackBanner
              status={feedback.status}
              title={feedback.title}
              message={feedback.message}
              xpGain={feedback.xpGain}
              onRetry={resetGame}
              onNext={stage < 3 ? () => setStage(stage + 1) : undefined}
            />
          )}

          {stage === 1 && (
            <GameClassificationBoard
              title="O Separador Científico: Facto vs Opinião"
              instruction="Classifica cada frase: 'Facto Comprovável 🔬' ou 'Opinião Pessoal / Ponto de Vista 💭'."
              items={[
                {
                  id: 'f-1',
                  text: 'A água ferve a 100 °C ao nível do mar.',
                  emoji: '🌡️',
                  category: 'facto',
                  explanation: 'É uma verdade científica verificável através de experiências repetíveis.',
                },
                {
                  id: 'f-2',
                  text: 'O outono é a estação mais bonita e relaxante do ano.',
                  emoji: '🍂',
                  category: 'opiniao',
                  explanation: 'Depende do gosto e sentimento de cada pessoa. Não é universal nem mensurável.',
                },
                {
                  id: 'f-3',
                  text: 'A Terra demora aproximadamente 365 dias e 6 horas a dar uma volta ao Sol.',
                  emoji: '🌍',
                  category: 'facto',
                  explanation: 'Dado astronómico comprovado por observações e cálculos matemáticos.',
                },
                {
                  id: 'f-4',
                  text: 'Os jogos de computador de estratégia são muito mais divertidos que os de futebol.',
                  emoji: '🎮',
                  category: 'opiniao',
                  explanation: 'É uma preferência de jogador, não uma lei da ciência.',
                },
              ]}
              categories={[
                { id: 'facto', name: 'Facto Comprovável 🔬', colorClass: 'text-blue-700', borderClass: 'border-blue-300', bgClass: 'bg-blue-100', icon: '🔬' },
                { id: 'opiniao', name: 'Opinião Pessoal 💭', colorClass: 'text-purple-700', borderClass: 'border-purple-300', bgClass: 'bg-purple-100', icon: '💭' },
              ]}
              onComplete={(score) => {
                reportCompletion('sim-news-detective', 'Classificador de Facto vs Opinião', { score }, score);
              }}
            />
          )}

          {stage === 2 && (
            <GameDetectiveInspector
              title="A Manchete Sensacionalista (Clickbait)"
              missionBrief="Clica nas 3 pistas típicas de Fake News e sensacionalismo nesta notícia viral!"
              contentCard={{
                header: 'Site: NotíciasBombásticas-SuperFixe.net',
                bodyText:
                  'URGENTE!!! DESCOBERTA CHOCANTE QUE NENHUM PROFESSOR QUER QUE SAIAS: Comer 3 chocolates antes do teste dá nota 100 garantida sem estudar nada! Cientistas anónimos provaram tudo num laboratório secreto!',
              }}
              clues={[
                {
                  id: 'c-caps',
                  targetText: 'URGENTE!!! DESCOBERTA CHOCANTE',
                  hint: 'Título alarmista e maiúsculas',
                  isSuspicious: true,
                  explanation: 'Uso de pontos de exclamação múltiplos e maiúsculas para apelar à emoção sem dados sérios.',
                },
                {
                  id: 'c-promessa',
                  targetText: 'nota 100 garantida sem estudar nada',
                  hint: 'Promessa milagrosa irrealista',
                  isSuspicious: true,
                  explanation: 'Promessas mágicas sem esforço são a armadilha mais antiga da internet.',
                },
                {
                  id: 'c-anonimo',
                  targetText: 'Cientistas anónimos num laboratório secreto',
                  hint: 'Fontes fantasmas',
                  isSuspicious: true,
                  explanation: 'A ciência verdadeira publica estudos assinados com nomes de investigadores e universidades.',
                },
                {
                  id: 'c-teste',
                  targetText: 'antes do teste',
                  hint: 'A situação escolar',
                  isSuspicious: false,
                  explanation: 'A menção aos testes é usada como isco para o público-alvo jovem.',
                },
              ]}
              onComplete={(score) => {
                reportCompletion('sim-news-detective', 'Detetive de Fake News', { score }, score);
              }}
            />
          )}

          {stage === 3 && (
            <GameDecisionScenario
              scenario={{
                id: 'dec-fakenews',
                title: 'O Boato no Grupo de WhatsApp da Turma',
                situation: 'Recebes uma mensagem alarmista a dizer que amanhã a cantina da escola vai ser encerrada para sempre por falta de comida. Todos estão indignados. Qual é o procedimento do Detetive?',
                choices: [
                  {
                    id: 'c1',
                    text: 'Partilhar com todos os contactos e protestar nas redes sociais imediatamente.',
                    isBest: false,
                    explanation: 'Espalhar sem verificar alimenta pânico injustificado.',
                  },
                  {
                    id: 'c2',
                    text: 'Pedir calma ao grupo, procurar um aviso na caderneta/página oficial do agrupamento e perguntar ao Delegado de Turma ou Professor.',
                    isBest: true,
                    explanation: 'Excelente! Travar a corrente e consultar as entidades responsáveis é a marca de um cidadão digital consciente.',
                  },
                  {
                    id: 'c3',
                    text: 'Inventar outro rumor ainda maior para acalmar os colegas.',
                    isBest: false,
                    explanation: 'Criar mais desinformação agrava a confusão geral.',
                  },
                ],
              }}
              onChoice={(isCorrect, choice) => {
                if (isCorrect) {
                  reportCompletion('sim-news-detective', 'Decisão Anti-Boato', { choice: choice.id }, 100);
                } else {
                  handleLoseLife(choice.explanation);
                }
              }}
            />
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. AVALIAÇÃO OFICIAL DO MUNDO 2                           */}
      {/* ========================================================= */}
      {activeTopicId === 'avaliacao' && (
        <div className="bg-white border-2 border-blue-200 rounded-3xl p-8 sm:p-10 text-center shadow-lg space-y-6">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-sky-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-md">
            <Trophy className="w-10 h-10" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600">
              Desafio Final de Validação do Mundo 2
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              🏆 O Grande Teste do Detetive Digital
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
              Mostra que dominas as palavras-chave, verificação de autoria, análise de datas, comparação de fontes e deteção de Fake News!
              Precisas de <strong>mais de 70%</strong> para concluir o Mundo 2 e desbloquear o Mundo 3!
            </p>
          </div>

          <button
            onClick={onOpenAssessment}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-black text-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer inline-flex items-center gap-2 transform active:scale-95"
          >
            <Sparkles className="w-5 h-5" />
            <span>Iniciar o Quiz Oficial do Detetive Digital</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};
