import React, { useState } from 'react';
import {
  Brain,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Bot,
  Sliders,
  Send,
} from 'lucide-react';

interface Zone5Props {
  onComplete: (code: string) => void;
  onBackToMap: () => void;
  alreadyCompleted: boolean;
}

export const Zone5AILab: React.FC<Zone5Props> = ({
  onComplete,
  onBackToMap,
  alreadyCompleted,
}) => {
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [selectedSafetyChecks, setSelectedSafetyChecks] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(alreadyCompleted);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const promptOptions = [
    {
      id: 'pr-1',
      title: 'Prompt A: "Escreve o meu trabalho todo de História sobre D. Afonso Henriques para eu entregar diretamente ao professor sem ler."',
      isCorrect: false,
      tag: 'Dependência Cega / Desonestidade',
      explanation: 'A IA deve ser usada como tutora ou assistente de estudo, nunca para substituir o teu próprio trabalho e aprendizagem.',
    },
    {
      id: 'pr-2',
      title: 'Prompt B: "Atua como um tutor de História do 6.º ano. Explica em 3 pontos simples o Tratado de Zamora e sugere 2 perguntas para testar a minha compreensão. Cita factos verificáveis e não uses dados pessoais."',
      isCorrect: true,
      tag: 'Prompt Ético & Eficaz',
      explanation: 'Excelente! Define o papel da IA, dá instruções claras e estruturadas, pede verificação e protege a privacidade.',
    },
    {
      id: 'pr-3',
      title: 'Prompt C: "Diz-me as notas dos meus colegas e faz um poema sobre a vida privada dos professores da escola."',
      isCorrect: false,
      tag: 'Violação de Privacidade',
      explanation: 'Viola completamente a privacidade de terceiros e regras éticas de proteção de dados.',
    },
  ];

  const safetyGuards = [
    {
      id: 'guard-privacy',
      label: 'Privacidade de Dados: Nunca introduzir passwords, moradas, números de telemóvel ou dados confidenciais nos prompts.',
      isEssential: true,
    },
    {
      id: 'guard-verify',
      label: 'Espírito Crítico & Verificação: Rever sempre as respostas com os manuais escolares e professores para detetar alucinações.',
      isEssential: true,
    },
    {
      id: 'guard-blind',
      label: 'Confiança Cega: Aceitar que tudo o que a IA gera é 100% verdadeiro e infalível.',
      isEssential: false,
    },
  ];

  const toggleGuard = (id: string) => {
    if (submitted) return;
    setFeedbackError(null);
    setSelectedSafetyChecks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleValidateZone = () => {
    setFeedbackError(null);

    const prompt = promptOptions.find((p) => p.id === selectedPrompt);
    if (!prompt) {
      setFeedbackError('Tens de selecionar um prompt para calibrar o assistente de IA.');
      return;
    }

    if (!prompt.isCorrect) {
      setFeedbackError(prompt.explanation);
      return;
    }

    const hasPrivacy = selectedSafetyChecks.includes('guard-privacy');
    const hasVerify = selectedSafetyChecks.includes('guard-verify');
    const hasBlind = selectedSafetyChecks.includes('guard-blind');

    if (!hasPrivacy || !hasVerify || hasBlind) {
      setFeedbackError(
        'Atenção às diretrizes éticas: Ativa as regras de proteção de dados e verificação crítica (sem marcar a confiança cega).'
      );
      return;
    }

    // Success!
    setSubmitted(true);
    onComplete('#AI-ETHICS-PASS');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Sector Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-black px-2.5 py-0.5 rounded-md uppercase">
                Setor 5 • Mundo 5
              </span>
              <span className="text-xs font-bold text-slate-300">Explorador da IA</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <Brain className="w-8 h-8 text-indigo-400 shrink-0" />
              <span>O Laboratório de IA</span>
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100/80 mt-1 max-w-xl leading-relaxed">
              O assistente de IA da Escola do Futuro foi descalibrado. Como Explorador da IA, seleciona um prompt exemplar e ativa as proteções éticas para impedir vazamentos de dados e alucinações!
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-4 py-2.5 bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 border border-indigo-500/30 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              aria-label="Pedir dica ao Robo-Guia"
            >
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>{showHint ? 'Ocultar Dica' : 'Dica do Robo-Guia'}</span>
            </button>
          </div>
        </div>

        {showHint && (
          <div className="mt-4 p-4 bg-indigo-950/90 border border-indigo-400/40 rounded-2xl text-xs text-indigo-200 animate-slideDown flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              💡
            </div>
            <div>
              <strong className="text-indigo-300 block mb-0.5">Dica de IA Ética:</strong>
              Um bom prompt especifica o papel (papel de tutor), o formato desejado e delimita o tema sem pedir nem fornecer informações pessoais de ninguém.
            </div>
          </div>
        )}
      </div>

      {/* Main Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prompt Selection */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-900">
                1. Seleção do Prompt de Estudo Seguro
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
              Calibração EDU-AI
            </span>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            Escolhe o comando que melhor reflete as boas práticas de estudo com Inteligência Artificial:
          </p>

          <div className="space-y-3">
            {promptOptions.map((opt) => {
              const isSelected = selectedPrompt === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    if (submitted) return;
                    setFeedbackError(null);
                    setSelectedPrompt(opt.id);
                  }}
                  disabled={submitted}
                  className={`w-full text-left p-4 rounded-2xl border text-xs font-semibold transition-all flex flex-col gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-400/20 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                      {opt.tag}
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <span className="leading-relaxed">{opt.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Safety Firewall & Ethics Checklist */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-900">
                2. Firewall Ético & Proteção de Dados
              </h3>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Ativa as diretrizes obrigatórias de segurança no ecossistema de IA:
            </p>

            <div className="space-y-2">
              {safetyGuards.map((guard) => {
                const isChecked = selectedSafetyChecks.includes(guard.id);
                return (
                  <button
                    key={guard.id}
                    onClick={() => toggleGuard(guard.id)}
                    disabled={submitted}
                    className={`w-full text-left p-3 rounded-2xl border text-xs font-semibold transition-all flex items-start gap-3 cursor-pointer ${
                      isChecked
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-400/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center shrink-0 ${
                        isChecked
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className="leading-snug">{guard.label}</span>
                  </button>
                );
              })}
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
              <div className="p-4 bg-indigo-50 border border-indigo-300 rounded-2xl space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2 text-indigo-900 font-black text-xs">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                  <span>Laboratório de IA Calibrado!</span>
                </div>
                <div className="p-2.5 bg-indigo-950 text-indigo-300 rounded-xl font-mono text-xs font-black text-center tracking-widest border border-indigo-700 shadow-xs">
                  CÓDIGO 5: #AI-ETHICS-PASS
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
                onClick={handleValidateZone}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span>Calibrar Assistente IA</span>
                <KeyRound className="w-4 h-4" />
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
