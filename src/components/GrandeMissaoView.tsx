import React, { useState } from 'react';
import {
  Crown,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Shield,
  Search,
  Palette,
  Terminal,
  Brain,
  Award,
} from 'lucide-react';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { clientCompleteGrandeMissao, clientGetWorlds } from '../services/clientFirestore';

interface GrandeMissaoViewProps {
  onBack: () => void;
}

export const GrandeMissaoView: React.FC<GrandeMissaoViewProps> = ({ onBack }) => {
  const { user, refreshUser } = useAuth();
  const [currentStage, setCurrentStage] = useState(0);
  const [stageAnswers, setStageAnswers] = useState<Record<number, string>>({});
  const [completed, setCompleted] = useState(false);
  const [xpWon, setXpWon] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [checkingProgress, setCheckingProgress] = useState(true);

  React.useEffect(() => {
    if (user) {
      if (user.role === 'teacher') {
        setIsLocked(false);
        setCheckingProgress(false);
        return;
      }
      clientGetWorlds(user.id, user.role)
        .then((res) => {
          const worlds = res.worlds || [];
          const allCompletedWith75 =
            worlds.length >= 5 && worlds.every((w) => (w.average || 0) > 75);
          if (!allCompletedWith75) {
            setIsLocked(true);
          }
          setCheckingProgress(false);
        })
        .catch(() => {
          setCheckingProgress(false);
        });
    } else {
      setCheckingProgress(false);
    }
  }, [user?.id, user?.role]);

  const stages = [
    {
      number: 1,
      title: 'Etapa 1: Acesso Seguro e Ciberdefesa',
      icon: Shield,
      question: 'Qual a melhor estratégia para proteger os computadores da biblioteca escolar contra intrusões?',
      options: [
        'Instalar autenticação em dois passos e nunca guardar passwords no navegador.',
        'Usar a mesma palavra-passe curta em todos os computadores para ser mais fácil.',
        'Desativar o antivírus para o computador ficar mais rápido.',
      ],
      correctIndex: 0,
      explanation: 'A autenticação em dois passos e a gestão responsável de credenciais é o padrão ouro de cibersegurança!',
    },
    {
      number: 2,
      title: 'Etapa 2: Investigação Crítica de Informação',
      icon: Search,
      question: 'Como podemos garantir que uma notícia sobre robótica escolar é verdadeira antes de a publicar no jornal da escola?',
      options: [
        'Acreditar imediatamente se tiver muitos gostos no TikTok.',
        'Verificar o autor, cruzar com duas fontes oficiais e checar a data original da notícia.',
        'Copiar e colar sem verificar para sermos os primeiros a partilhar.',
      ],
      correctIndex: 1,
      explanation: 'O método do Detetive Digital exige confirmação de autoria, data e cruzamento de fontes idóneas.',
    },
    {
      number: 3,
      title: 'Etapa 3: Criação Multimédia com Netiqueta',
      icon: Palette,
      question: 'Ao produzir um podcast educativo sobre o oceano, como respeitamos a propriedade intelectual?',
      options: [
        'Usar músicas protegidas por direitos de autor dizendo apenas que não são nossas.',
        'Utilizar bandas sonoras Creative Commons de uso livre e creditar formalmente os autores.',
        'Fazer download de qualquer ficheiro da internet porque a internet é pública.',
      ],
      correctIndex: 1,
      explanation: 'Respeitar as licenças Creative Commons e creditar autores demonstra cidadania digital exemplar!',
    },
    {
      number: 4,
      title: 'Etapa 4: Automação e Sustentabilidade Escolar',
      icon: Terminal,
      question: 'Que algoritmo pode poupar mais energia nas salas de aula da Escola do Futuro?',
      options: [
        'Deixar os projetores sempre ligados para não perder tempo a ligar.',
        'SE não houver movimento na sala há 10 minutos, ENTÃO desligar luzes e computadores.',
        'Programar os computadores para nunca entrarem em suspensão.',
      ],
      correctIndex: 1,
      explanation: 'Algoritmos condicionais (SE/ENTÃO) baseados em sensores reduzem o consumo desnecessário de eletricidade!',
    },
    {
      number: 5,
      title: 'Etapa 5: Inteligência Artificial Ética',
      icon: Brain,
      question: 'Como deve um aluno do 6.º ano usar um assistente de IA para estudar História?',
      options: [
        'Pedir à IA para escrever o trabalho todo e entregar sem ler.',
        'Usar a IA como tutora para explicar conceitos difíceis, verificando sempre os factos nos manuais.',
        'Perguntar dados pessoais de outros colegas à IA.',
      ],
      correctIndex: 1,
      explanation: 'A IA é um co-piloto de aprendizagem. O discernimento e a verificação final pertencem sempre ao ser humano!',
    },
  ];

  const handleSelectAnswer = (option: string) => {
    setStageAnswers((prev) => ({ ...prev, [currentStage]: option }));
  };

  const handleNextStage = async () => {
    if (currentStage < stages.length - 1) {
      setCurrentStage((p) => p + 1);
    } else {
      // Completed all 5 stages!
      try {
        try {
          const res = await apiRequest('/api/pedagogical/grande-missao/complete', {
            method: 'POST',
            body: JSON.stringify({ answers: stageAnswers }),
          });
          setXpWon(res.xpGain || 150);
        } catch {
          if (user) {
            await clientCompleteGrandeMissao(user.id);
            setXpWon(150);
          }
        }
        setCompleted(true);
        await refreshUser();
      } catch (err: any) {
        console.error('Failed to complete grande missao', err);
      }
    }
  };

  const stage = stages[currentStage];
  const Icon = stage.icon;

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 text-center shadow-sm">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
          <Crown className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Grande Missão Bloqueada — Registo Obrigatório
        </h2>
        <p className="text-sm text-slate-600 font-medium max-w-md mx-auto mb-6 leading-relaxed">
          A Grande Missão Final é reservada a alunos registados que concluam as etapas dos 5 Mundos curriculares.
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

  if (isLocked) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-amber-200/90 p-8 sm:p-10 text-center shadow-sm">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
          <Crown className="w-8 h-8" />
        </div>
        <span className="text-xs font-black text-indigo-700 uppercase tracking-wider block mb-1">
          Desafio Supremo Bloqueado
        </span>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Grande Missão Final Bloqueada
        </h2>
        <p className="text-sm text-slate-600 font-medium max-w-md mx-auto mb-6 leading-relaxed">
          A Grande Missão Final (A ESCOLA DO FUTURO) só fica disponível quando alcançares uma pontuação média superior a <strong>75%</strong> em todos os 5 Mundos curriculares. Continua a praticar!
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm px-6 py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <span>Voltar ao Dashboard</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={onBack}
              className="text-xs font-bold text-amber-300 hover:underline mb-2 inline-block"
            >
              ← Voltar ao Início
            </button>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-amber-950 font-black text-xs px-2.5 py-0.5 rounded-md uppercase">
                Grande Desafio Transversal
              </span>
              <span className="text-xs font-bold text-indigo-300">+150 XP</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">
              A ESCOLA DO FUTURO
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-xl">
              Integra os teus conhecimentos dos 5 Mundos para planear uma escola digital, segura, criativa, automatizada e ética!
            </p>
          </div>

          <div className="w-20 h-20 rounded-3xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 shadow-lg">
            <Crown className="w-10 h-10" />
          </div>
        </div>
      </div>

      {completed ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center shadow-xs space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-md">
            <Award className="w-12 h-12" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900">
              Missão Cumprida com Distinção!
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto mt-2">
              Completaste todas as 5 etapas da Escola do Futuro. Demonstraste ser um verdadeiro Guardião, Detetive, Criador, Engenheiro e Explorador Digital!
            </p>
          </div>
          <div className="inline-block bg-amber-400 text-amber-950 font-black text-sm px-6 py-2 rounded-full shadow-xs">
            +{xpWon} XP Creditados & Insígnia Desbloqueada!
          </div>
          <div>
            <button
              onClick={onBack}
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-8 py-3 rounded-2xl shadow-xs transition-colors"
            >
              Voltar ao Painel Principal
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>
              Etapa {currentStage + 1} de {stages.length}
            </span>
            <div className="flex gap-1.5">
              {stages.map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-1.5 rounded-full transition-all ${
                    i === currentStage
                      ? 'bg-amber-400 w-10'
                      : i < currentStage
                      ? 'bg-emerald-500'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Stage Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">{stage.title}</h3>
            </div>

            <p className="text-sm font-bold text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {stage.question}
            </p>

            <div className="space-y-3 pt-2">
              {stage.options.map((opt, oIdx) => {
                const isSelected = stageAnswers[currentStage] === opt;
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectAnswer(opt)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-400/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleNextStage}
              disabled={!stageAnswers[currentStage]}
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span>{currentStage < stages.length - 1 ? 'Próxima Etapa' : 'Concluir Grande Missão'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
