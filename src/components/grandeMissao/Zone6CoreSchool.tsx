import React, { useState } from 'react';
import {
  Crown,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  KeyRound,
  Shield,
  Search,
  Palette,
  Terminal,
  Brain,
  Zap,
  Lock,
  Unlock,
  Award,
  ArrowRight,
} from 'lucide-react';
import { ESCAPE_ZONES } from './types';

interface Zone6Props {
  unlockedCodes: Record<number, string>;
  onFinishAll: (finalDecision: string) => Promise<void>;
  onBackToMap: () => void;
  isSaving: boolean;
}

interface FinalDecisionQuestion {
  id: string;
  worldNumber: number;
  worldName: string;
  topic: string;
  situation: string;
  icon: any;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export const Zone6CoreSchool: React.FC<Zone6Props> = ({
  unlockedCodes,
  onFinishAll,
  onBackToMap,
  isSaving,
}) => {
  // 5 manual inputs for the 5 zones (NO auto-fill button!)
  const [inputCodes, setInputCodes] = useState<Record<number, string>>({
    1: '',
    2: '',
    3: '',
    4: '',
    5: '',
  });

  const [fused, setFused] = useState(false);
  const [selectedDecisions, setSelectedDecisions] = useState<Record<string, string>>({});
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isRestartingSystem, setIsRestartingSystem] = useState(false);

  // Expected codes for each zone
  const expectedCodes: Record<number, string> = {
    1: '#SEC-SAFE-2040',
    2: '#FACT-CHECK-OK',
    3: '#CREATIVE-CC-VAL',
    4: '#ALGO-ROBOT-RUN',
    5: '#AI-ETHICS-PASS',
  };

  // 5 Separate Decisions representing each of the 5 Worlds
  const finalDecisions: FinalDecisionQuestion[] = [
    {
      id: 'dec-seguranca',
      worldNumber: 1,
      worldName: 'Mundo 1 — Guardião Digital',
      topic: 'Segurança, Privacidade & Bem-estar',
      icon: Shield,
      situation: 'Um novo serviço digital escolar pede a criação de contas para todos os alunos. Qual é a diretriz de segurança correta?',
      options: [
        {
          id: 'opt-1a',
          text: 'Criar palavras-passe fortes e seguras, ativar a autenticação em dois passos e nunca partilhar dados pessoais privados com desconhecidos.',
          isCorrect: true,
          explanation: 'Excelente! Palavras-passe fortes, proteção de dados e 2FA garantem a segurança da rede e da tua pegada digital.',
        },
        {
          id: 'opt-1b',
          text: 'Usar o nome próprio seguido de "123" como palavra-passe para ser fácil de memorizar e partilhar com os amigos.',
          isCorrect: false,
          explanation: 'Palavras-passe fracas e partilhadas deixam as contas vulneráveis a acessos indevidos.',
        },
        {
          id: 'opt-1c',
          text: 'Clicar em qualquer hiperligação recebida por mensagem privada que prometa prémios ou vantagens na escola.',
          isCorrect: false,
          explanation: 'Clicar em ligações desconhecidas é a forma mais comum de cair em esquemas de phishing.',
        },
      ],
    },
    {
      id: 'dec-informacao',
      worldNumber: 2,
      worldName: 'Mundo 2 — Detetive Digital',
      topic: 'Pesquisa, Fontes & Fact-Checking',
      icon: Search,
      situation: 'Surge uma publicação alarmante nas redes sociais sobre o encerramento da cantina, sem autor identificado nem data. O que deves fazer?',
      options: [
        {
          id: 'opt-2a',
          text: 'Investigar quem publicou, verificar a data, comparar a informação com comunicados oficiais e só partilhar se for confirmada.',
          isCorrect: true,
          explanation: 'Excelente! O pensamento crítico e a verificação de fontes impedem a propagação de boatos e desinformação.',
        },
        {
          id: 'opt-2b',
          text: 'Partilhar imediatamente nos grupos de mensagens da turma para avisar toda a gente o mais depressa possível.',
          isCorrect: false,
          explanation: 'Partilhar sem verificar ajuda a espalhar boatos e causa preocupação desnecessária.',
        },
        {
          id: 'opt-2c',
          text: 'Acreditar logo porque o título está escrito em letras maiúsculas e tem muitos emojis de aviso.',
          isCorrect: false,
          explanation: 'Títulos exagerados e letras maiúsculas são estratégias típicas para enganar leitores desatentos.',
        },
      ],
    },
    {
      id: 'dec-direitos',
      worldNumber: 3,
      worldName: 'Mundo 3 — Criador Digital',
      topic: 'Criação, Direitos de Autor & Netiqueta',
      icon: Palette,
      situation: 'A turma está a produzir um mural multimédia e um podcast para a escola. Como devem ser escolhidos os conteúdos?',
      options: [
        {
          id: 'opt-3a',
          text: 'Usar imagens e músicas com licenças Creative Commons ou de Domínio Público, dando os devidos créditos aos autores e colaborando com respeito.',
          isCorrect: true,
          explanation: 'Excelente! Respeitar os direitos de autor e praticar boa netiqueta é a base da criação responsável.',
        },
        {
          id: 'opt-3b',
          text: 'Copiar imagens e músicas comerciais protegidas por direitos de autor e dizer que foram feitas pelos alunos.',
          isCorrect: false,
          explanation: 'Copiar obras protegidas sem autorização viola a lei dos direitos de autor e constitui plágio.',
        },
        {
          id: 'opt-3c',
          text: 'Gravar conversas dos colegas no corredor sem consentimento para colocar no podcast escolar.',
          isCorrect: false,
          explanation: 'Gravar ou divulgar a voz e imagem de outras pessoas sem a sua autorização desrespeita a sua privacidade.',
        },
      ],
    },
    {
      id: 'dec-algoritmo',
      worldNumber: 4,
      worldName: 'Mundo 4 — Engenheiro Digital',
      topic: 'Pensamento Computacional & Algoritmos',
      icon: Terminal,
      situation: 'O sistema de iluminação e ventilação da escola precisa de um algoritmo sustentável. Qual é a melhor solução algorítmica?',
      options: [
        {
          id: 'opt-4a',
          text: 'Definir uma sequência lógica com condições: SE a sala estiver vazia ou com luz solar suficiente, ENTÃO desligar as lâmpadas para poupar energia.',
          isCorrect: true,
          explanation: 'Excelente! Usar condições lógicas e planeamento passo a passo cria soluções eficientes e sustentáveis.',
        },
        {
          id: 'opt-4b',
          text: 'Manter todas as luzes e equipamentos ligados continuamente 24 horas por dia sem qualquer regra ou sensor.',
          isCorrect: false,
          explanation: 'Isso desperdiça energia e ignora os princípios do pensamento computacional e da sustentabilidade.',
        },
        {
          id: 'opt-4c',
          text: 'Alterar as instruções do robô sem as testar nem tentar descobrir onde está o erro quando o programa falha.',
          isCorrect: false,
          explanation: 'Programar exige testar o algoritmo e corrigir os erros (debugging) de forma metódica.',
        },
      ],
    },
    {
      id: 'dec-ia',
      worldNumber: 5,
      worldName: 'Mundo 5 — Explorador da IA',
      topic: 'Inteligência Artificial Ética & Verificação',
      icon: Brain,
      situation: 'Os alunos estão a usar um assistente de Inteligência Artificial para preparar uma apresentação. Qual é a melhor abordagem?',
      options: [
        {
          id: 'opt-5a',
          text: 'Usar a IA como ferramenta de apoio com pedidos claros (prompts), verificar sempre os factos nos manuais para detetar alucinações e nunca partilhar dados pessoais.',
          isCorrect: true,
          explanation: 'Excelente! A IA é uma ferramenta poderosa, mas exige sempre espírito crítico, verificação humana e proteção da privacidade.',
        },
        {
          id: 'opt-5b',
          text: 'Aceitar tudo o que a IA responde como verdade absoluta e copiar o texto diretamente sem ler.',
          isCorrect: false,
          explanation: 'A IA pode alucinar e inventar factos convincentes que parecem reais mas são falsos.',
        },
        {
          id: 'opt-5c',
          text: 'Introduzir a morada, palavras-passe e fotografias dos alunos no assistente para obter respostas mais personalizadas.',
          isCorrect: false,
          explanation: 'Nunca deves fornecer dados pessoais privados ou credenciais a sistemas de Inteligência Artificial.',
        },
      ],
    },
  ];

  const handleInputChange = (zoneId: number, value: string) => {
    setInputCodes((prev) => ({
      ...prev,
      [zoneId]: value,
    }));
    setFeedbackError(null);
  };

  const isZoneCodeValid = (zoneId: number): boolean => {
    const entered = (inputCodes[zoneId] || '').trim().toUpperCase();
    const expected = expectedCodes[zoneId].toUpperCase();
    return entered === expected;
  };

  const allCodesValid = [1, 2, 3, 4, 5].every((id) => isZoneCodeValid(id));

  const handleFuseCodes = () => {
    setFeedbackError(null);
    if (!allCodesValid) {
      const invalidZones = [1, 2, 3, 4, 5].filter((id) => !isZoneCodeValid(id));
      setFeedbackError(
        `Existem códigos incorretos ou em falta nas Zonas: ${invalidZones.join(', ')}. Lembra-te de introduzir exatamente os códigos que conquistaste em cada setor.`
      );
      return;
    }
    setFused(true);
  };

  const handleSelectDecision = (decisionId: string, optionId: string) => {
    if (isSaving || isRestartingSystem) return;
    setFeedbackError(null);
    setSelectedDecisions((prev) => ({
      ...prev,
      [decisionId]: optionId,
    }));
  };

  const handleFinalSubmit = async () => {
    setFeedbackError(null);

    // Check if all 5 decisions have been answered
    const answeredKeys = Object.keys(selectedDecisions);
    if (answeredKeys.length < finalDecisions.length) {
      const missingDec = finalDecisions.find((d) => !selectedDecisions[d.id]);
      setFeedbackError(`Por favor, responde à decisão de: ${missingDec?.worldName} (${missingDec?.topic}).`);
      return;
    }

    // Validate each of the 5 decisions
    for (const dec of finalDecisions) {
      const chosenOptId = selectedDecisions[dec.id];
      const opt = dec.options.find((o) => o.id === chosenOptId);
      if (!opt || !opt.isCorrect) {
        setFeedbackError(`Atenção na decisão de ${dec.worldName}: ${opt?.explanation || 'Revê a tua escolha.'}`);
        return;
      }
    }

    // Show restarting transition
    setIsRestartingSystem(true);

    setTimeout(async () => {
      await onFinishAll(JSON.stringify(selectedDecisions));
    }, 1800);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Sector Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-500/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-400 text-amber-950 text-xs font-black px-2.5 py-0.5 rounded-md uppercase flex items-center gap-1 shadow-xs">
                <Crown className="w-3.5 h-3.5" /> Núcleo Central
              </span>
              <span className="text-xs font-bold text-amber-300">Desafio Integrador Final</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Núcleo Central: A Escola do Futuro</span>
            </h2>
            <p className="text-xs sm:text-sm text-amber-100/90 mt-1 max-w-xl leading-relaxed">
              Chegaste ao coração do sistema! Introduz os 5 códigos de segurança que recuperaste nos setores da escola e responde às 5 decisões éticas finais para reativar a Escola do Futuro.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-4 py-2.5 bg-amber-900/70 hover:bg-amber-800/90 text-amber-200 border border-amber-500/40 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              aria-label="Pedir dica ao Robô-Guia"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>{showHint ? 'Ocultar Dica' : 'Dica do Robô-Guia'}</span>
            </button>
          </div>
        </div>

        {showHint && (
          <div className="mt-4 p-4 bg-amber-950/90 border border-amber-400/40 rounded-2xl text-xs text-amber-200 animate-slideDown flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              👑
            </div>
            <div>
              <strong className="text-amber-300 block mb-0.5">Dica do Núcleo:</strong>
              Lembra-te dos códigos recebidos ao concluir cada setor: Zona 1 (#SEC-SAFE-2040), Zona 2 (#FACT-CHECK-OK), Zona 3 (#CREATIVE-CC-VAL), Zona 4 (#ALGO-ROBOT-RUN) e Zona 5 (#AI-ETHICS-PASS). Introduz cada um na respetiva caixa!
            </div>
          </div>
        )}
      </div>

      {/* Manual 5 Code Entry Terminal */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-600" />
            Etapa 1: Introdução dos 5 Códigos de Segurança
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Digita os códigos que recuperaste nas Zonas 1 a 5 para desbloquear o terminal do Núcleo Central.
          </p>
        </div>

        {/* 5 Code Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ESCAPE_ZONES.slice(0, 5).map((zone) => {
            const isValid = isZoneCodeValid(zone.id);
            const val = inputCodes[zone.id] || '';

            return (
              <div
                key={zone.id}
                className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                  isValid
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : val.length > 0
                    ? 'bg-rose-50/50 border-rose-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                      Zona {zone.id}: {zone.name}
                    </span>
                    {isValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                  </div>
                  <label className="text-[11px] text-slate-500 block mb-1">
                    Código do Setor:
                  </label>
                  <input
                    type="text"
                    disabled={fused}
                    value={val}
                    onChange={(e) => handleInputChange(zone.id, e.target.value)}
                    placeholder="#CÓDIGO..."
                    className={`w-full font-mono text-xs font-bold px-2.5 py-2 rounded-xl border uppercase tracking-wider focus:outline-none transition-colors ${
                      isValid
                        ? 'bg-white border-emerald-400 text-emerald-800'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                    }`}
                  />
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[10px]">
                  {isValid ? (
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verificado
                    </span>
                  ) : (
                    <span className="text-slate-400 font-mono">
                      Ex: #{expectedCodes[zone.id].split('-')[1]}...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {feedbackError && !fused && (
          <div
            role="alert"
            className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800 animate-shake flex items-start gap-2"
          >
            <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{feedbackError}</span>
          </div>
        )}

        {!fused ? (
          <div className="pt-2 text-center">
            <button
              onClick={handleFuseCodes}
              disabled={!allCodesValid}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-50 text-slate-950 font-black text-sm rounded-2xl shadow-md transition-all flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>Validar Códigos e Desbloquear Desafio Final</span>
            </button>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 animate-fadeIn">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Unlock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-emerald-950">
                Os 5 Códigos foram Validados com Sucesso!
              </h4>
              <p className="text-xs text-emerald-800 font-medium mt-0.5">
                O terminal principal está aberto. Responde agora às 5 decisões éticas finais para reativar a Escola do Futuro.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Final 5 Independent Decisions */}
      {fused && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Etapa 2: O Desafio Final — 5 Decisões para Reativar a Escola
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Toma a decisão correta em cada uma das 5 áreas dos Mundos TIC:
              </p>
            </div>
          </div>

          {/* 5 Independent Decisions Cards */}
          <div className="space-y-6">
            {finalDecisions.map((dec, idx) => {
              const Icon = dec.icon;
              const chosenOptId = selectedDecisions[dec.id];

              return (
                <div
                  key={dec.id}
                  className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black text-slate-900 uppercase">
                        Decisão {idx + 1}: {dec.topic}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200 w-max">
                      {dec.worldName}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    {dec.situation}
                  </p>

                  <div className="space-y-2 pt-1">
                    {dec.options.map((opt) => {
                      const isSelected = chosenOptId === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectDecision(dec.id, opt.id)}
                          disabled={isSaving || isRestartingSystem}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-start gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-400/20 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/80'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-amber-600 bg-amber-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="leading-relaxed">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {feedbackError && (
            <div
              role="alert"
              className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800 animate-shake flex items-start gap-2"
            >
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{feedbackError}</span>
            </div>
          )}

          {isRestartingSystem && (
            <div className="p-5 bg-amber-950 text-amber-300 rounded-2xl border border-amber-500/40 text-center space-y-2 animate-pulse">
              <div className="flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest">
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>O sistema está a reiniciar…</span>
              </div>
              <p className="text-xs text-amber-200 font-medium">
                A sincronizar as 5 decisões e a restabelecer todos os setores da Escola do Futuro...
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={onBackToMap}
              disabled={isSaving || isRestartingSystem}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
            >
              ← Voltar ao Mapa
            </button>

            <button
              onClick={handleFinalSubmit}
              disabled={isSaving || isRestartingSystem}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 rounded-2xl font-black text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Award className="w-5 h-5" />
              <span>{isSaving || isRestartingSystem ? 'A Reativar Escola...' : 'Reativar a Escola do Futuro (+150 XP)'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
