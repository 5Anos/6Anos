import React, { useState } from 'react';
import { Star, Sparkles, CheckCircle2, HeartHandshake, Compass } from 'lucide-react';

interface MetacognitionWidgetProps {
  missionId: string;
  worldThemeColor?: 'emerald' | 'blue' | 'purple' | 'amber' | 'indigo';
  questionPrompt?: string;
  options?: string[];
}

export const MetacognitionWidget: React.FC<MetacognitionWidgetProps> = ({
  missionId,
  worldThemeColor = 'emerald',
  questionPrompt = 'Como te sentes em relação ao que aprendeste nesta missão?',
  options = [
    'Já consigo aplicar este conhecimento no meu dia a dia!',
    'Ainda preciso de rever um pouco para ter a certeza absoluta.',
    'Aprendi uma dica nova que não conhecia antes!',
  ],
}) => {
  const storageKey = `meta_conf_${missionId}`;
  const [confidence, setConfidence] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? parseInt(saved, 10) : null;
    } catch {
      return null;
    }
  });

  const [selectedReflection, setSelectedReflection] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`meta_ref_${missionId}`) || null;
    } catch {
      return null;
    }
  });

  const handleSelectConfidence = (level: number) => {
    setConfidence(level);
    try {
      localStorage.setItem(storageKey, level.toString());
    } catch {}
  };

  const handleSelectReflection = (opt: string) => {
    setSelectedReflection(opt);
    try {
      localStorage.setItem(`meta_ref_${missionId}`, opt);
    } catch {}
  };

  const colorStyles = {
    emerald: {
      border: 'border-emerald-200',
      bg: 'bg-emerald-50/70',
      title: 'text-emerald-900',
      accent: 'bg-emerald-600 text-white',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    blue: {
      border: 'border-blue-200',
      bg: 'bg-blue-50/70',
      title: 'text-blue-900',
      accent: 'bg-blue-600 text-white',
      badge: 'bg-blue-100 text-blue-800',
    },
    purple: {
      border: 'border-purple-200',
      bg: 'bg-purple-50/70',
      title: 'text-purple-900',
      accent: 'bg-purple-600 text-white',
      badge: 'bg-purple-100 text-purple-800',
    },
    amber: {
      border: 'border-amber-200',
      bg: 'bg-amber-50/70',
      title: 'text-amber-900',
      accent: 'bg-amber-600 text-white',
      badge: 'bg-amber-100 text-amber-800',
    },
    indigo: {
      border: 'border-indigo-200',
      bg: 'bg-indigo-50/70',
      title: 'text-indigo-900',
      accent: 'bg-indigo-600 text-white',
      badge: 'bg-indigo-100 text-indigo-800',
    },
  }[worldThemeColor];

  return (
    <div className={`mt-4 p-4 sm:p-5 rounded-2xl border ${colorStyles.border} ${colorStyles.bg} space-y-3`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-500 shrink-0" />
          <span className={`text-xs font-black uppercase tracking-wider ${colorStyles.title}`}>
            Autoavaliação Metacognitiva (Aprender a Aprender)
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-500">
          Reflete sobre a tua evolução pessoal
        </span>
      </div>

      <p className="text-xs font-bold text-slate-700">{questionPrompt}</p>

      {/* Confidence Level 3 Stars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => handleSelectConfidence(1)}
          className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-left flex items-center gap-2 cursor-pointer ${
            confidence === 1
              ? `${colorStyles.accent} shadow-xs`
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="text-base">🌱</span>
          <div>
            <div className="font-extrabold text-[11px]">A dar os primeiros passos</div>
            <div className="text-[10px] opacity-80">Preciso de praticar mais</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleSelectConfidence(2)}
          className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-left flex items-center gap-2 cursor-pointer ${
            confidence === 2
              ? `${colorStyles.accent} shadow-xs`
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="text-base">⭐</span>
          <div>
            <div className="font-extrabold text-[11px]">Quase Mestre</div>
            <div className="text-[10px] opacity-80">Compreendi os conceitos</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleSelectConfidence(3)}
          className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-left flex items-center gap-2 cursor-pointer ${
            confidence === 3
              ? `${colorStyles.accent} shadow-xs`
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="text-base">👑</span>
          <div>
            <div className="font-extrabold text-[11px]">Super Especialista</div>
            <div className="text-[10px] opacity-80">Consigo ensinar a um colega!</div>
          </div>
        </button>
      </div>

      {/* Reflection Options */}
      {confidence !== null && (
        <div className="pt-2 border-t border-slate-200/80 space-y-1.5 animate-in fade-in">
          <span className="text-[11px] font-extrabold text-slate-700 block">
            Qual é a tua conclusão pessoal?
          </span>
          <div className="flex flex-wrap gap-1.5">
            {options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectReflection(opt)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all border text-left cursor-pointer flex items-center gap-1.5 ${
                  selectedReflection === opt
                    ? 'bg-white border-emerald-400 text-emerald-900 shadow-xs ring-1 ring-emerald-300'
                    : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-800'
                }`}
              >
                {selectedReflection === opt && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                <span>{opt}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
