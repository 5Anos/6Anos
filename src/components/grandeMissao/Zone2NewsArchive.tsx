import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  KeyRound,
  FileText,
  AlertCircle,
  BadgeCheck,
  ShieldCheck,
} from 'lucide-react';

interface Zone2Props {
  onComplete: (code: string) => void;
  onBackToMap: () => void;
  alreadyCompleted: boolean;
}

interface ArticleItem {
  id: string;
  title: string;
  author: string;
  source: string;
  date: string;
  snippet: string;
  realClassification: 'real' | 'fake';
  explanation: string;
}

export const Zone2NewsArchive: React.FC<Zone2Props> = ({
  onComplete,
  onBackToMap,
  alreadyCompleted,
}) => {
  const articles: ArticleItem[] = [
    {
      id: 'art-1',
      title: '🚨 URGENTE: Robôs com IA vão substituir todos os professores da escola na próxima segunda-feira!',
      author: 'Utilizador Anónimo @viral_trends_99',
      source: 'Vídeo curto sem referências numa rede social',
      date: 'Sem data especificada',
      snippet: 'Diz-se que a escola comprou 50 androides para dar todas as aulas e os testes serão corrigidos por lasers em 3 segundos. Partilha antes que apaguem!',
      realClassification: 'fake',
      explanation: 'Título sensacionalista com emojis alarmistas, autor anónimo, sem data e sem qualquer comunicado da Direção da Escola.',
    },
    {
      id: 'art-2',
      title: '🏆 Equipa de Robótica do 6.º Ano conquista 1.º Lugar no Torneio Regional de Sustentabilidade',
      author: 'Prof.ª Teresa Gonçalves (Coordenação de TIC)',
      source: 'Jornal Digital Oficial da Escola & Portal DGE',
      date: '14 de Novembro de 2024',
      snippet: 'Os alunos desenvolveram uma lixeira inteligente equipada com sensores de triagem automática de plástico e papel. A entrega dos prémios contou com a presença da Direção.',
      realClassification: 'real',
      explanation: 'Notícia redigida por uma professora identificada, publicada em órgão oficial da escola, com dados cruzados e data precisa.',
    },
    {
      id: 'art-3',
      title: '⚡ DESCOBERTA: Deixar o telemóvel no congelador durante 5 minutos duplica a velocidade da Internet Wi-Fi',
      author: 'Blog "Dicas Mágicas Rápidas"',
      source: 'Site sem secção "Quem Somos" e cheio de anúncios suspeitos',
      date: 'Ontem',
      snippet: 'Cientistas secretos descobriram que as temperaturas negativas aceleram os fotões do router. Faz já o teste em tua casa!',
      realClassification: 'fake',
      explanation: 'Afirmação cientificamente absurda, sem fontes credíveis e com risco real de estragar o equipamento eletrónico com humidade.',
    },
  ];

  const [classifications, setClassifications] = useState<Record<string, 'real' | 'fake'>>({});
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(alreadyCompleted);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const handleClassify = (id: string, type: 'real' | 'fake') => {
    if (submitted) return;
    setFeedbackError(null);
    setClassifications((prev) => ({ ...prev, [id]: type }));
  };

  const handleValidateZone = () => {
    setFeedbackError(null);

    // Check if all are classified
    const answeredCount = Object.keys(classifications).length;
    if (answeredCount < articles.length) {
      setFeedbackError('Por favor, classifica todos os 3 artigos antes de validar a verificação.');
      return;
    }

    // Check accuracy
    const allCorrect = articles.every(
      (art) => classifications[art.id] === art.realClassification
    );

    if (!allCorrect) {
      const wrongArt = articles.find(
        (art) => classifications[art.id] !== art.realClassification
      );
      setFeedbackError(
        `Atenção: A classificação do artigo "${wrongArt?.title.slice(0, 35)}..." não está correta. ${wrongArt?.explanation}`
      );
      return;
    }

    // Success!
    setSubmitted(true);
    onComplete('#FACT-CHECK-OK');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Sector Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-500/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-black px-2.5 py-0.5 rounded-md uppercase">
                Setor 2 • Mundo 2
              </span>
              <span className="text-xs font-bold text-slate-300">Detetive Digital</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <Search className="w-8 h-8 text-blue-400 shrink-0" />
              <span>O Arquivo de Notícias</span>
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-xl leading-relaxed">
              O sistema de informação da escola foi invadido por boatos e notícias falsas. Aplica os critérios do Detetive Digital (Autor, Fonte, Data e Conteúdo) para restabelecer a verdade!
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-4 py-2.5 bg-blue-900/60 hover:bg-blue-800/80 text-blue-200 border border-blue-500/30 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              aria-label="Pedir dica ao Robo-Guia"
            >
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span>{showHint ? 'Ocultar Dica' : 'Dica do Robo-Guia'}</span>
            </button>
          </div>
        </div>

        {showHint && (
          <div className="mt-4 p-4 bg-blue-950/90 border border-blue-400/40 rounded-2xl text-xs text-blue-200 animate-slideDown flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              🔍
            </div>
            <div>
              <strong className="text-blue-300 block mb-0.5">Dica de Fact-Checking:</strong>
              Desconfia sempre de títulos com letras maiúsculas alarmistas, apelos à partilha rápida e sem identificação clara de quem escreveu.
            </div>
          </div>
        )}
      </div>

      {/* Main Articles Fact-Check Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Mesa de Verificação de Fontes (3 Casos em Análise)
          </h3>
          <span className="text-xs font-bold text-slate-500">
            {Object.keys(classifications).length} de {articles.length} analisados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {articles.map((art, idx) => {
            const currentChoice = classifications[art.id];
            const isConfirmed = submitted && currentChoice === art.realClassification;

            return (
              <div
                key={art.id}
                className={`bg-white rounded-3xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                  currentChoice === 'real'
                    ? 'border-emerald-300 bg-emerald-50/20 ring-2 ring-emerald-400/20'
                    : currentChoice === 'fake'
                    ? 'border-amber-300 bg-amber-50/20 ring-2 ring-amber-400/20'
                    : 'border-slate-200/90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      Artigo #{idx + 1}
                    </span>
                    {currentChoice && (
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          currentChoice === 'real'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {currentChoice === 'real' ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Confiável
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 text-amber-600" /> Boato
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-black text-slate-900 leading-snug mb-2.5">
                    {art.title}
                  </h4>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-[11px] text-slate-600 space-y-1 mb-3">
                    <div>
                      <strong className="text-slate-800">Autor:</strong> {art.author}
                    </div>
                    <div>
                      <strong className="text-slate-800">Fonte:</strong> {art.source}
                    </div>
                    <div>
                      <strong className="text-slate-800">Data:</strong> {art.date}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-700 font-medium italic bg-blue-50/40 p-2.5 rounded-xl border border-blue-100 leading-relaxed mb-4">
                    "{art.snippet}"
                  </p>
                </div>

                {/* Selection Buttons */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                    Classificação do Detetive:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleClassify(art.id, 'real')}
                      disabled={submitted}
                      className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        currentChoice === 'real'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <BadgeCheck className="w-3.5 h-3.5" />
                      <span>Confiável</span>
                    </button>

                    <button
                      onClick={() => handleClassify(art.id, 'fake')}
                      disabled={submitted}
                      className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        currentChoice === 'fake'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-amber-50 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Boato</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">
                  Arquivo de Notícias Restaurado!
                </h4>
                <div className="inline-block mt-0.5 px-3 py-1 bg-blue-900 text-blue-300 rounded-xl font-mono text-xs font-black tracking-widest">
                  CÓDIGO 2: #FACT-CHECK-OK
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
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <span>Validar Fact-Checking</span>
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
