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
  const [fused, setFused] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  const decisions = [
    {
      id: 'dec-1',
      title: 'Opção A: Automatização Total Cega',
      text: 'Entregar todas as decisões pedagógicas, avaliações e disciplina aos algoritmos de IA sem qualquer supervisão de professores ou intervenção humana.',
      isCorrect: false,
      explanation: 'A tecnologia não deve substituir o julgamento humano, o afeto e a sensibilidade dos educadores.',
    },
    {
      id: 'dec-2',
      title: 'Opção B: O Manifesto da Cidadania Digital Humana & Inovadora (Padrão de Excelência)',
      text: 'Integrar ciberdefesa, pensamento crítico, criatividade ética, robótica sustentável e inteligência artificial ao serviço da aprendizagem, do bem-estar e da inclusão, mantendo sempre os seres humanos no centro de todas as decisões.',
      isCorrect: true,
      explanation: 'Esta é a verdadeira visão da Escola do Futuro: tecnologia de ponta com ética humana inabalável!',
    },
    {
      id: 'dec-3',
      title: 'Opção C: Rejeição Total da Tecnologia',
      text: 'Desligar permanentemente todos os computadores, servidores e redes da escola por medo dos riscos digitais, voltando exclusivamente ao papel.',
      isCorrect: false,
      explanation: 'O caminho do futuro não é o medo nem o isolamento, mas sim a literacia e capacitação digital responsável.',
    },
  ];

  const handleFuseCodes = () => {
    setFused(true);
  };

  const handleFinalSubmit = async () => {
    setFeedbackError(null);
    if (!selectedDecision) {
      setFeedbackError('Por favor, escolhe a diretriz ética que vai governar o Núcleo da Escola do Futuro.');
      return;
    }

    const decision = decisions.find((d) => d.id === selectedDecision);
    if (!decision || !decision.isCorrect) {
      setFeedbackError(decision?.explanation || 'Decisão incorreta. Revê os valores da cidadania digital.');
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
              <span>O Núcleo da Escola do Futuro</span>
            </h2>
            <p className="text-xs sm:text-sm text-amber-100/90 mt-1 max-w-xl leading-relaxed">
              Chegaste ao coração do sistema! Reúne os 5 códigos de segurança recuperados nos setores anteriores e estabelece o manifesto ético final para desbloquear a escola.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-4 py-2.5 bg-amber-900/70 hover:bg-amber-800/90 text-amber-200 border border-amber-500/40 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs"
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
              👑
            </div>
            <div>
              <strong className="text-amber-300 block mb-0.5">Dica Suprema:</strong>
              O objetivo de toda a Missão TIC do 6.º ano é usar a tecnologia com segurança, criatividade, empatia e sentido crítico, colocando sempre as pessoas em primeiro lugar!
            </div>
          </div>
        )}
      </div>

      {/* 5 Code Fragments Display */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-600" />
            Painel dos 5 Fragmentos do Código Mestre
          </h3>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 5 de 5 Setores Superados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ESCAPE_ZONES.slice(0, 5).map((zone) => {
            const code = unlockedCodes[zone.id] || zone.codeFragment;
            return (
              <div
                key={zone.id}
                className="bg-slate-900 text-white rounded-2xl p-3.5 border border-slate-800 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                    Setor {zone.id} • {zone.worldName}
                  </span>
                  <div className="font-mono text-xs font-black text-emerald-400 tracking-wider mt-1.5 break-all">
                    {code}
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Fragmento Ativo
                </div>
              </div>
            );
          })}
        </div>

        {!fused ? (
          <div className="pt-4 text-center">
            <button
              onClick={handleFuseCodes}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-sm rounded-2xl shadow-md transition-all flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>Sincronizar e Fundir os 5 Códigos no Núcleo</span>
            </button>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 animate-fadeIn">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Unlock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-emerald-950">
                Código Mestre Desbloqueado: #NUCLEO-UNLOCKED-2040
              </h4>
              <p className="text-xs text-emerald-800 font-medium mt-0.5">
                O console do Diretor Virtual está online. Escolhe o manifesto final para concluir a reinicialização da escola!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Final Ethical Decision Dilemma */}
      {fused && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Dilema Integrador do Diretor Virtual
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
              className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-800 animate-shake flex items-start gap-2"
            >
              <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
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
