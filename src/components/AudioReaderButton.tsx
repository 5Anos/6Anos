import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

interface AudioReaderButtonProps {
  textToRead: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const AudioReaderButton: React.FC<AudioReaderButtonProps> = ({
  textToRead,
  label = 'Ouvir Texto',
  className = '',
  size = 'sm',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSupported) return;

    const synth = window.speechSynthesis;

    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
      return;
    }

    synth.cancel(); // Stop any ongoing speech

    // Clean up text for clearer pronunciation
    const cleanText = textToRead
      .replace(/[#*_~`]/g, '')
      .replace(/https?:\/\/\S+/g, 'link de internet')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-PT';
    utterance.rate = 0.95; // Slightly slower pace for 6th grade comprehension
    utterance.pitch = 1.05; // Friendly and engaging tone

    // Try finding European Portuguese voice if available
    const voices = synth.getVoices();
    const ptPtVoice = voices.find(
      (v) => v.lang.toLowerCase() === 'pt-pt' || v.lang.toLowerCase() === 'pt_pt'
    ) || voices.find((v) => v.lang.toLowerCase().startsWith('pt'));

    if (ptPtVoice) {
      utterance.voice = ptPtVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    synth.speak(utterance);
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={handleToggleSpeak}
      title={isPlaying ? 'Parar leitura em voz alta' : 'Ouvir em voz alta (Acessibilidade e Leitura)'}
      className={`inline-flex items-center gap-1.5 transition-all rounded-full font-bold cursor-pointer ${
        isPlaying
          ? 'bg-rose-500 text-white shadow-sm ring-2 ring-rose-300 animate-pulse px-3 py-1 text-xs'
          : 'bg-white/90 hover:bg-white text-slate-700 hover:text-blue-700 border border-slate-200/90 shadow-2xs hover:shadow-xs px-2.5 py-1 text-xs'
      } ${className}`}
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-3.5 h-3.5 shrink-0" />
          <span className="font-extrabold text-[11px]">Parar Voz</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="text-[11px] font-bold">{label}</span>
          <Sparkles className="w-2.5 h-2.5 text-amber-500" />
        </>
      )}
    </button>
  );
};
