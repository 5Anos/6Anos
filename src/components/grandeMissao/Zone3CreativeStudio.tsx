import React, { useState } from 'react';
import {
  Palette,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  KeyRound,
  Image as ImageIcon,
  Music,
  MessageSquare,
  Sparkles,
  Share2,
} from 'lucide-react';

interface Zone3Props {
  onComplete: (code: string) => void;
  onBackToMap: () => void;
  alreadyCompleted: boolean;
}

export const Zone3CreativeStudio: React.FC<Zone3Props> = ({
  onComplete,
  onBackToMap,
  alreadyCompleted,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(alreadyCompleted);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const imageOptions = [
    {
      id: 'img-a',
      title: 'Fotografia sem créditos encontrada no Google Imagens (Todos os direitos reservados ©)',
      isCorrect: false,
      tag: 'Violação de Copyright',
      explanation: 'Não podes usar imagens aleatórias da internet sem permissão expressa do autor.',
    },
    {
      id: 'img-b',
      title: 'Ilustração Científica com Licença Creative Commons CC-BY 4.0 (Livre com atribuição)',
      isCorrect: true,
      tag: 'Creative Commons CC-BY',
      explanation: 'Excelente! A licença CC-BY permite a reutilização e partilha, bastando dar o devido crédito ao autor.',
    },
    {
      id: 'img-c',
      title: 'Cópia de cartaz promocional de filme comercial com marca de água protegida',
      isCorrect: false,
      tag: 'Uso Não Autorizado',
      explanation: 'Material de empresas comerciais com marca de água não é de uso livre.',
    },
  ];

  const audioOptions = [
    {
      id: 'aud-a',
      title: 'Música pop de sucesso comercial descarregada de uma plataforma não oficial',
      isCorrect: false,
      tag: 'Violação de Direitos',
      explanation: 'Músicas comerciais exigem licenças pagas e não podem ser pirateadas para projetos escolares públicos.',
    },
    {
      id: 'aud-b',
      title: 'Trilha sonora instrumental sob licença livre / Domínio Público com créditos no rodapé',
      isCorrect: true,
      tag: 'Domínio Público / CC0',
      explanation: 'Perfeito! Músicas em domínio público ou com licenças abertas são seguras e legais para projetos escolares.',
    },
    {
      id: 'aud-c',
      title: 'Gravação da conversa privada de um colega no recreio sem o consentimento dele',
      isCorrect: false,
      tag: 'Violação de Privacidade',
      explanation: 'Gravar colegas sem consentimento viola a privacidade e as regras básicas de cidadania digital.',
    },
  ];

  const textOptions = [
    {
      id: 'txt-a',
      title: '"Vídeo feito por mim e quem criticar não percebe nada do assunto!"',
      isCorrect: false,
      tag: 'Má Netiqueta',
      explanation: 'Linguagem defensiva e agressiva que desrespeita as normas de boa convivência online.',
    },
    {
      id: 'txt-b',
      title: '"Projeto de Podcast do 6.º Ano sobre a Proteção dos Oceanos. Fontes e músicas creditadas na descrição."',
      isCorrect: true,
      tag: 'Netiqueta Positiva & Citação',
      explanation: 'Exemplar! Apresentação clara, tom respeitoso e reconhecimento formal de todas as fontes e autores.',
    },
  ];

  const handleValidateZone = () => {
    setFeedbackError(null);

    if (!selectedImage || !selectedAudio || !selectedText) {
      setFeedbackError('Tens de selecionar 1 recurso para cada categoria (Imagem, Áudio e Legenda de Publicação).');
      return;
    }

    const img = imageOptions.find((i) => i.id === selectedImage);
    const aud = audioOptions.find((a) => a.id === selectedAudio);
    const txt = textOptions.find((t) => t.id === selectedText);

    if (!img?.isCorrect) {
      setFeedbackError(`Imagem: ${img?.explanation}`);
      return;
    }
    if (!aud?.isCorrect) {
      setFeedbackError(`Áudio: ${aud?.explanation}`);
      return;
    }
    if (!txt?.isCorrect) {
      setFeedbackError(`Legenda: ${txt?.explanation}`);
      return;
    }

    // Success!
    setSubmitted(true);
    onComplete('#CREATIVE-CC-VAL');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Sector Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-fuchsia-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-500/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-black px-2.5 py-0.5 rounded-md uppercase">
                Setor 3 • Mundo 3
              </span>
              <span className="text-xs font-bold text-slate-300">Criador Digital</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <Palette className="w-8 h-8 text-purple-400 shrink-0" />
              <span>Estúdio Criativo</span>
            </h2>
            <p className="text-xs sm:text-sm text-purple-100/80 mt-1 max-w-xl leading-relaxed">
              No estúdio é necessário preparar uma publicação digital para ajudar a reativar a escola. Seleciona materiais que respeitem a autoria e os direitos de autor (Creative Commons) e usa uma comunicação positiva e colaborativa!
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-4 py-2.5 bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-500/30 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              aria-label="Pedir dica ao Robo-Guia"
            >
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <span>{showHint ? 'Ocultar Dica' : 'Dica do Robo-Guia'}</span>
            </button>
          </div>
        </div>

        {showHint && (
          <div className="mt-4 p-4 bg-purple-950/90 border border-purple-400/40 rounded-2xl text-xs text-purple-200 animate-slideDown flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              🎨
            </div>
            <div>
              <strong className="text-purple-300 block mb-0.5">Dica de Criação Ética:</strong>
              As licenças Creative Commons (como CC-BY) e o Domínio Público são os melhores amigos dos criadores digitais. Lembra-te de creditar sempre os criadores originais!
            </div>
          </div>
        )}
      </div>

      {/* 3 Steps Selection Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Image Resource */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-slate-100">
              <ImageIcon className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                1. Imagem de Fundo
              </h3>
            </div>
            <div className="space-y-2.5">
              {imageOptions.map((opt) => {
                const isSelected = selectedImage === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (submitted) return;
                      setFeedbackError(null);
                      setSelectedImage(opt.id);
                    }}
                    disabled={submitted}
                    className={`w-full text-left p-3 rounded-2xl border text-xs font-semibold transition-all flex flex-col gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50 border-purple-500 text-purple-950 ring-2 ring-purple-400/20'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white text-slate-600 self-start border border-slate-200">
                      {opt.tag}
                    </span>
                    <span className="leading-snug">{opt.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 2: Audio Track Resource */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-slate-100">
              <Music className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                2. Banda Sonora do Podcast
              </h3>
            </div>
            <div className="space-y-2.5">
              {audioOptions.map((opt) => {
                const isSelected = selectedAudio === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (submitted) return;
                      setFeedbackError(null);
                      setSelectedAudio(opt.id);
                    }}
                    disabled={submitted}
                    className={`w-full text-left p-3 rounded-2xl border text-xs font-semibold transition-all flex flex-col gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50 border-purple-500 text-purple-950 ring-2 ring-purple-400/20'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white text-slate-600 self-start border border-slate-200">
                      {opt.tag}
                    </span>
                    <span className="leading-snug">{opt.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 3: Text & Netiquette */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-slate-100">
              <MessageSquare className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                3. Legenda & Netiqueta
              </h3>
            </div>
            <div className="space-y-2.5">
              {textOptions.map((opt) => {
                const isSelected = selectedText === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (submitted) return;
                      setFeedbackError(null);
                      setSelectedText(opt.id);
                    }}
                    disabled={submitted}
                    className={`w-full text-left p-3 rounded-2xl border text-xs font-semibold transition-all flex flex-col gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50 border-purple-500 text-purple-950 ring-2 ring-purple-400/20'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white text-slate-600 self-start border border-slate-200">
                      {opt.tag}
                    </span>
                    <span className="leading-snug">{opt.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Verification Feedback & Actions */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          {feedbackError && (
            <div
              role="alert"
              className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-800 animate-shake flex items-center gap-2 mb-2 sm:mb-0"
            >
              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{feedbackError}</span>
            </div>
          )}

          {submitted && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">
                  Estúdio Criativo Publicado com Sucesso!
                </h4>
                <div className="inline-block mt-0.5 px-3 py-1 bg-purple-900 text-purple-300 rounded-xl font-mono text-xs font-black tracking-widest">
                  CÓDIGO 3: #CREATIVE-CC-VAL
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onBackToMap}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
          >
            ← Ver Mapa do Escape Room
          </button>

          {!submitted ? (
            <button
              onClick={handleValidateZone}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <span>Validar Publicação</span>
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
  );
};
