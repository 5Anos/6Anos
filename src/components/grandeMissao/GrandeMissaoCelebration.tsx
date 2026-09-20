import React from 'react';
import {
  Crown,
  Award,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Shield,
  Search,
  Palette,
  Terminal,
  Brain,
  Download,
  Share2,
} from 'lucide-react';

interface CelebrationProps {
  xpWon: number;
  onBackToDashboard: () => void;
  onViewBadges?: () => void;
  onViewMap?: () => void;
  studentName?: string;
}

export const GrandeMissaoCelebration: React.FC<CelebrationProps> = ({
  xpWon,
  onBackToDashboard,
  onViewBadges,
  onViewMap,
  studentName = 'Aluno(a)',
}) => {
  const pillars = [
    {
      icon: Shield,
      title: 'Guardião Digital',
      desc: 'Ciberdefesa, 2FA e bloqueio de phishing',
      color: 'emerald',
      code: '#SEC-SAFE-2040',
    },
    {
      icon: Search,
      title: 'Detetive Digital',
      desc: 'Pensamento crítico e fact-checking de notícias',
      color: 'blue',
      code: '#FACT-CHECK-OK',
    },
    {
      icon: Palette,
      title: 'Criador Digital',
      desc: 'Creative Commons, direitos de autor e netiqueta',
      color: 'purple',
      code: '#CREATIVE-CC-VAL',
    },
    {
      icon: Terminal,
      title: 'Engenheiro Digital',
      desc: 'Lógica condicional, sensores e eficiência energética',
      color: 'amber',
      code: '#ALGO-ROBOT-RUN',
    },
    {
      icon: Brain,
      title: 'Explorador da IA',
      desc: 'Engenharia de prompts éticos e privacidade',
      color: 'indigo',
      code: '#AI-ETHICS-PASS',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn py-4">
      {/* Golden Diploma Card */}
      <div className="bg-white border-2 border-amber-400 rounded-3xl p-8 sm:p-12 text-center shadow-xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-amber-100 rounded-full blur-2xl opacity-60 pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-yellow-100 rounded-full blur-2xl opacity-60 pointer-events-none" />

        {/* Crown Trophy Badge */}
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg ring-8 ring-amber-100 animate-bounce">
            <Crown className="w-14 h-14" />
          </div>
          <span className="absolute -bottom-2 inset-x-0 bg-slate-900 text-amber-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs mx-auto w-max">
            Mestre TIC 2040
          </span>
        </div>

        <span className="text-xs font-black text-amber-700 uppercase tracking-widest block mb-1">
          Certificado de Distinção Máxima
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
          ESCOLA DO FUTURO REATIVADA!
        </h2>

        <p className="text-sm text-slate-700 font-medium max-w-xl mx-auto leading-relaxed mb-6">
          Conseguiste, <strong className="text-slate-900">{studentName}</strong>! Usaste conhecimentos de segurança, pesquisa, criação digital, pensamento computacional e inteligência artificial para reativar a Escola do Futuro. A partir de agora, és oficialmente: <strong className="text-amber-800 uppercase font-black">Mestre da Missão TIC</strong>!
        </p>

        {/* Reward Pill */}
        <div className="inline-flex items-center gap-2 bg-amber-400 text-amber-950 font-black text-sm px-6 py-2.5 rounded-full shadow-md mb-8">
          <Sparkles className="w-4 h-4 fill-current" />
          <span>+{xpWon || 150} XP Creditados & Insígnia "Mestre da Missão TIC" Atribuída!</span>
        </div>

        {/* 5 Pillars Summary */}
        <div className="text-left bg-slate-50 border border-slate-200/90 rounded-2xl p-5 mb-8">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Competências Curriculares Consolidadas:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-2.5 border border-slate-200 flex items-center gap-2.5 shadow-xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-900 truncate">
                      {p.title}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {p.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>Voltar ao Painel Principal</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onViewMap && (
            <button
              onClick={onViewMap}
              className="px-6 py-3 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs rounded-xl border border-amber-300 shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Explorar Mapa de Setores e Códigos</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
