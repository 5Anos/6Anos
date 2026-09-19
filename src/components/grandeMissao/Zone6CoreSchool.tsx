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
  ClipboardPaste,
} from 'lucide-react';
import { ESCAPE_ZONES } from './types';

interface Zone6Props {
  unlockedCodes: Record<number, string>;
  onFinishAll: (finalDecision: string) => Promise<void>;
  onBackToMap: () => void;
  isSaving: boolean;
}

export const Zone6CoreSchool: React.FC<Zone6Props> = ({
  unlockedCodes,
  onFinishAll,
  onBackToMap,
  isSaving,
}) => {
  // 5 manual inputs for the 5 zones
  const [inputCodes, setInputCodes] = useState<Record<number, string>>({
    1: '',
    2: '',
    3: '',
    4: '',
    5: '',
  });

  const [fused, setFused] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Expected codes for each zone
  const expectedCodes: Record<number, string> = {
    1: '#SEC-SAFE-2040',
    2: '#FACT-CHECK-OK',
    3: '#CREATIVE-CC-VAL',
    4: '#ALGO-ROBOT-RUN',
    5: '#AI-ETHICS-PASS',
  };

  // 5 Final Decisions
  const decisions = [
    {
      id: 'dec-1',
      title: 'Decisão 1: Automatização Total sem Supervisão Humana',
      text: 'Entregar todas as decisões pedagógicas, avaliações dos alunos e segurança exclusivamente aos algoritmos de IA, dispensando a mediação e o acolhimento dos professores.',
      isCorrect: false,
      explanation: 'A tecnologia não substitui a sensibilidade, o afeto, a empatia e o discernimento pedagógico dos professores.',
    },
    {
      id: 'dec-2',
      title: 'Decisão 2: Rejeição Total da Tecnologia e Regresso ao Papel',
      text: 'Desligar em definitivo todos os computadores, servidores e ligações digitais da escola por receio dos riscos virtuais, regressando em exclusivo aos suportes em papel.',
      isCorrect: false,
      explanation: 'Isolar os alunos do mundo digital não os protege; pelo contrário, retira-lhes oportunidades essenciais de literacia e futuro.',
    },
    {
      id: 'dec-3',
      title: 'Decisão 3: O Manifesto da Cidadania Digital Humana & Inovadora (Padrão de Excelência)',
      text: 'Integrar cibersegurança sólida, pensamento crítico analítico, respeito pelos direitos de autor, robótica sustentável e inteligência artificial ética ao serviço da aprendizagem, do bem-estar e da inclusão, colocando sempre os seres humanos no centro de todas as decisões.',
      isCorrect: true,
      explanation: 'Excelente! Esta é a verdadeira essência da Missão TIC: tecnologia de ponta guiada por valores humanos e cidadania exemplar.',
    },
    {
      id: 'dec-4',
      title: 'Decisão 4: Comercialização de Dados dos Alunos por Equipamentos',
      text: 'Permitir a empresas publicitárias a recolha livre e monetização dos perfis de navegação e dados privados dos alunos em troca de computadores e internet gratuita.',
      isCorrect: false,
      explanation: 'A privacidade, segurança e os dados pessoais dos alunos são direitos fundamentais inegociáveis.',
    },
    {
      id: 'dec-5',
      title: 'Decisão 5: Publicação Livre sem Moderação, Respeito ou Direitos de Autor',
      text: 'Autorizar que qualquer utilizador publique anonimamente o que quiser nas redes escolares sem regras de netiqueta, verificação de factos ou atribuição de créditos aos autores.',
      isCorrect: false,
      explanation: 'A liberdade na internet exige respeito mútuo, combate ao ciberbullying, verificação rigorosa de factos e respeito pelos direitos de autor.',
    },
  ];

  const handleInputChange = (zoneId: number, value: string) => {
    setInputCodes((prev) => ({
      ...prev,
      [zoneId]: value,
    }));
    setFeedbackError(null);
  };

  const handleAutoFillUnlocked = () => {
    setInputCodes({
      1: unlockedCodes[1] || expectedCodes[1],
      2: unlockedCodes[2] || expectedCodes[2],
      3: unlockedCodes[3] || expectedCodes[3],
      4: unlockedCodes[4] || expectedCodes[4],
      5: unlockedCodes[5] || expectedCodes[5],
    });
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
        `Existem códigos incorretos ou em falta nas Zonas: ${invalidZones.join(', ')}. Verifica os teus registos das missões anteriores ou utiliza a ajuda do diário de bordo.`
      );
      return;
    }
    setFused(true);
  };

  const handleFinalSubmit = async () => {
    setFeedbackError(null);
    if (!selectedDecision) {
      setFeedbackError('Por favor, seleciona a diretriz ética que deve governar o Núcleo da Escola do Futuro.');
      return;
    }

    const decision = decisions.find((d) => d.id === selectedDecision);
    if (!decision || !decision.isCorrect) {
      setFeedbackError(decision?.explanation || 'Decisão incorreta. Revê os princípios da cidadania digital.');
      return;
    }

    await onFinishAll(selectedDecision);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Sector Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-500/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-400 text-amber-950 text-xs font-black px-2.5 py-0.5 rounded-md uppercase flex items-center gap-1 shadow-xs">
                <Crown className="w-3.5 h-3.5" /> Núcleo Central 2040
              </span>
              <span className="text-xs font-bold text-amber-300">Desafio Integrador Final</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Núcleo Central: A Escola do Futuro</span>
            </h2>
            <p className="text-xs sm:text-sm text-amber-100/90 mt-1 max-w-xl leading-relaxed">
              Chegaste ao coração do sistema! Insere os 5 códigos de segurança recuperados nos setores anteriores e estabelece a diretriz ética definitiva para salvar a Escola do Futuro.
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
              <strong className="text-amber-300 block mb-0.5">Dica Suprema:</strong>
              Lembra-te dos códigos recebidos ao concluir cada zona: Zona 1 (#SEC-SAFE-2040), Zona 2 (#FACT-CHECK-OK), Zona 3 (#CREATIVE-CC-VAL), Zona 4 (#ALGO-ROBOT-RUN), Zona 5 (#AI-ETHICS-PASS). Podes preenchê-los manualmente ou carregar do teu diário de bordo!
            </div>
          </div>
        )}
      </div>

      {/* Manual 5 Code Entry Terminal */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-600" />
              Terminal de Entrada Manual dos 5 Códigos de Segurança
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Introduz manualmente os fragmentos de código recolhidos nas Zonas 1 a 5 para desbloquear o Núcleo Central.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAutoFillUnlocked}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors shrink-0"
            title="Preencher com os códigos guardados no teu diário de bordo"
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-amber-600" />
            <span>Preencher do Diário de Bordo</span>
          </button>
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
                    Código ({zone.worldName}):
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
                    <span className="text-slate-400">
                      Ex: {expectedCodes[zone.id].slice(0, 5)}...
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
              <span>Validar e Sincronizar os 5 Códigos no Núcleo</span>
            </button>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 animate-fadeIn">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Unlock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-emerald-950">
                Código Mestre Ativado: #MASTER-CORE-2040
              </h4>
              <p className="text-xs text-emerald-800 font-medium mt-0.5">
                Os 5 setores foram integrados com sucesso! Agora seleciona a diretriz ética final entre as 5 decisões possíveis para concluir a Grande Missão.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Final 5 Ethical Decisions */}
      {fused && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                O Dilema Integrador da Escola do Futuro (5 Decisões Finais)
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Qual é a diretriz suprema que deve orientar a Escola do Futuro para sempre?
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {decisions.map((dec) => {
              const isSelected = selectedDecision === dec.id;
              return (
                <button
                  key={dec.id}
                  onClick={() => {
                    setFeedbackError(null);
                    setSelectedDecision(dec.id);
                  }}
                  disabled={isSaving}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex flex-col gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/90 border-amber-500 text-amber-950 ring-2 ring-amber-400/30 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                      {dec.title}
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-amber-600 bg-amber-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {dec.text}
                  </p>
                </button>
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

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={onBackToMap}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
            >
              ← Voltar ao Mapa
            </button>

            <button
              onClick={handleFinalSubmit}
              disabled={isSaving || !selectedDecision}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 rounded-2xl font-black text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Award className="w-5 h-5" />
              <span>{isSaving ? 'A Gravar Vitória...' : 'Salvar o Futuro da Escola (+150 XP)'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
