import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Mail,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  KeyRound,
  Lock,
  RefreshCw,
  Sparkles,
  Terminal,
} from 'lucide-react';

interface Zone1Props {
  onComplete: (code: string) => void;
  onBackToMap: () => void;
  alreadyCompleted: boolean;
}

export const Zone1ServerCentral: React.FC<Zone1Props> = ({
  onComplete,
  onBackToMap,
  alreadyCompleted,
}) => {
  const [selectedClues, setSelectedClues] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(alreadyCompleted);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const clues = [
    {
      id: 'sender',
      label: 'Remetente Falso: "direcao-alerta@suporte-login-rapido.net" (não é o domínio oficial da escola)',
      isSuspicious: true,
      tip: 'Endereços desconhecidos com nomes estranhos são um sinal claro de phishing.',
    },
    {
      id: 'urgency',
      label: 'Pressão e Pânico: "A tua conta será eliminada em 10 minutos se não clicares!"',
      isSuspicious: true,
      tip: 'Mensagens que criam pressa ou medo tentam impedir que penses com calma antes de agir.',
    },
    {
      id: 'link',
      label: 'Ligação Estranha & Pedido de Dados: Pede para introduzir a palavra-passe e dados pessoais num site desconhecido',
      isSuspicious: true,
      tip: 'Nunca introduzas palavras-passe ou dados pessoais em sites que não conheces nem confias.',
    },
    {
      id: 'logo',
      label: 'Imagem do Logótipo: Imagem do brasão da escola copiada da internet',
      isSuspicious: false,
      tip: 'Qualquer pessoa pode copiar uma imagem para tentar parecer legítima, mas o perigo real está nos pedidos de dados e nos links.',
    },
  ];

  const actionProtocols = [
    {
      id: 'protocol-a',
      title: 'Plano A: Clicar na ligação imediatamente e introduzir a palavra-passe para testar se funciona.',
      isCorrect: false,
      explanation: 'Nunca introduzas as tuas palavras-passe ou dados pessoais em ligações suspeitas! Isso entregaria o acesso direto a terceiros.',
    },
    {
      id: 'protocol-b',
      title: 'Plano Seguro: Denunciar a mensagem como Phishing, avisar os responsáveis, proteger os dados pessoais e usar palavras-passe fortes com autenticação em dois passos.',
      isCorrect: true,
      explanation: 'Excelente! Ao denunciar o perigo, proteger os dados privados e reforçar as palavras-passe, defendes a tua pegada digital e a segurança de toda a escola.',
    },
    {
      id: 'protocol-c',
      title: 'Plano C: Reencaminhar a mensagem para todos os colegas da turma através das redes sociais.',
      isCorrect: false,
      explanation: 'Reencaminhar a mensagem pode espalhar o perigo e fazer com que outros colegas cliquem por engano!',
    },
  ];

  const toggleClue = (id: string) => {
    if (submitted) return;
    setFeedbackError(null);
    setSelectedClues((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleValidateZone = () => {
    setFeedbackError(null);
    const correctClueIds = clues.filter((c) => c.isSuspicious).map((c) => c.id);
    const selectedCorrectClues = selectedClues.filter((id) =>
      correctClueIds.includes(id)
    );
    const selectedWrongClues = selectedClues.filter(
      (id) => !correctClueIds.includes(id)
    );

    if (selectedCorrectClues.length < 2 || selectedWrongClues.length > 0) {
      setFeedbackError(
        'Atenção: Precisas de selecionar pelo menos 2 indícios verdadeiros de perigo/phishing no e-mail (sem assinalar elementos inócuos).'
      );
      return;
    }

    if (!selectedAction) {
      setFeedbackError('Tens de escolher o protocolo de ciberdefesa para neutralizar a ameaça!');
      return;
    }

    const action = actionProtocols.find((a) => a.id === selectedAction);
    if (!action || !action.isCorrect) {
      setFeedbackError(action?.explanation || 'Protocolo incorreto. Revê as boas práticas de cibersegurança.');
      return;
    }

    // Success!
    setSubmitted(true);
    onComplete('#SEC-SAFE-2040');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Sector Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black px-2.5 py-0.5 rounded-md uppercase">
                Setor 1 • Mundo 1
              </span>
              <span className="text-xs font-bold text-slate-300">Guardião Digital</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <Shield className="w-8 h-8 text-emerald-400 shrink-0" />
              <span>Centro de Segurança</span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-xl leading-relaxed">
              O sistema de segurança da escola detetou uma mensagem maliciosa com o objetivo de roubar palavras-passe e dados pessoais. Analisa a mensagem, identifica os perigos e recupera o acesso ao sistema!
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-4 py-2.5 bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 border border-emerald-500/30 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              aria-label="Pedir dica ao Robo-Guia"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>{showHint ? 'Ocultar Dica' : 'Dica do Robo-Guia'}</span>
            </button>
          </div>
        </div>

        {showHint && (
          <div className="mt-4 p-4 bg-emerald-950/90 border border-emerald-400/40 rounded-2xl text-xs text-emerald-200 animate-slideDown flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              🤖
            </div>
            <div>
              <strong className="text-emerald-300 block mb-0.5">Dica de Ciberdefesa:</strong>
              Lembra-te de inspecionar o remetente oficial, a ausência de HTTPS no link e o tom de ameaça rápida. A melhor reação nunca envolve clicar nem partilhar palavras-passe.
            </div>
          </div>
        )}
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Suspicious Email Terminal */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono font-bold text-slate-600 ml-2">
                  terminal://ciberdefesa/inbox-scanner
                </span>
              </div>
              <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Alerta de Intrusão
              </span>
            </div>

            {/* Email Message Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-5 space-y-3 font-sans text-xs">
              <div className="flex items-center gap-2 text-slate-500 text-[11px] pb-2 border-b border-slate-200/80">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>De:</span>
                <span className="font-mono font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                  direcao-alerta@suporte-login-rapido.net
                </span>
              </div>
              <div className="text-slate-500 text-[11px]">
                <span>Assunto:</span>{' '}
                <strong className="text-slate-800">URGENTE: Confirmação de Palavra-passe da Escola</strong>
              </div>

              <div className="text-slate-700 space-y-2 pt-2 leading-relaxed">
                <p>
                  Caro(a) Aluno(a) e Professor(a),
                </p>
                <p>
                  Detetámos uma falha grave nos computadores escolares. Para manter a tua conta ativa,{' '}
                  <strong className="text-red-700 bg-red-50 px-1 rounded">
                    tens 10 minutos para clicar no botão abaixo
                  </strong>{' '}
                  e introduzir a tua password e código 2FA. Caso contrário, a tua conta será eliminada permanentemente.
                </p>

                <div className="pt-2 text-center">
                  <div className="inline-block bg-blue-600 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs opacity-90 cursor-not-allowed">
                    🔗 http://login-atualizar-pass.xyz/recuperar
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    Destino: http://login-atualizar-pass.xyz
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1: Identify Red Flags */}
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600" />
                Passo 1: Assinala os sinais de perigo presentes nesta mensagem:
              </h4>
              <div className="space-y-2">
                {clues.map((clue) => {
                  const isSelected = selectedClues.includes(clue.id);
                  return (
                    <button
                      key={clue.id}
                      onClick={() => toggleClue(clue.id)}
                      disabled={submitted}
                      className={`w-full text-left p-3 rounded-2xl border text-xs font-semibold transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className="leading-snug">{clue.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Cyberdefense Action & Verification */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Terminal className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-black text-slate-900">
                Passo 2: Protocolo de Resposta Imediata
              </h3>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Qual é a decisão correta para restaurar a segurança dos servidores escolares?
            </p>

            <div className="space-y-2.5">
              {actionProtocols.map((protocol) => {
                const isSelected = selectedAction === protocol.id;
                return (
                  <button
                    key={protocol.id}
                    onClick={() => {
                      if (submitted) return;
                      setFeedbackError(null);
                      setSelectedAction(protocol.id);
                    }}
                    disabled={submitted}
                    className={`w-full text-left p-3.5 rounded-2xl border text-xs font-semibold transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="leading-snug">{protocol.title}</span>
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

            {/* Success Box */}
            {submitted && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2 text-emerald-800 font-black text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Setor 1 Restaurado com Sucesso!</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  Excelente trabalho de ciberdefesa! Neutralizaste o phishing e protegeste as contas de toda a escola.
                </p>
                <div className="mt-2 p-2.5 bg-emerald-900 text-emerald-300 rounded-xl font-mono text-xs font-black text-center tracking-widest border border-emerald-700 shadow-xs">
                  CÓDIGO 1: #SEC-SAFE-2040
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
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span>Validar Ciberdefesa</span>
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
