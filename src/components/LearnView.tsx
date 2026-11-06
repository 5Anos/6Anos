import React, { useState } from 'react';
import {
  Palette,
  Layout,
  Type,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Download,
  Share2,
  Sliders,
  Award,
  BookOpen,
  Eye,
  Lightbulb,
  Check,
  RotateCcw,
  Monitor,
  Video,
  FileSpreadsheet,
  Mic,
  Star,
  ExternalLink,
  ShieldCheck,
  Presentation,
  Play,
  Users,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileText,
  Volume2,
  VolumeX,
  Recycle,
  Trash2,
  BatteryCharging,
  Leaf,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LearnViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const LearnView: React.FC<LearnViewProps> = ({ onNavigateTab }) => {
  const { user, refreshUser } = useAuth();
  const [activeCategory, setActiveCategory] = useState<'canva_posters' | 'presentations' | 'video' | 'infographics' | 'podcasts'>('canva_posters');

  // Exemplos de Cartazes de Reciclagem (Galeria e Análise)
  const [selectedRecyclePosterId, setSelectedRecyclePosterId] = useState<string>('p1');
  const [filterRecycleCategory, setFilterRecycleCategory] = useState<'all' | 'ponto_verde' | 'pilhas' | 'eletronicos' | 'reutilizacao'>('all');
  const [checklist, setChecklist] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });

  // Interactive PowerPoint Simulator State
  const [pptTopic, setPptTopic] = useState<'solar_system' | 'castles' | 'ocean_life' | 'internet'>('solar_system');
  const [activeSlide, setActiveSlide] = useState<number>(0); // 0 to 3
  const [pptSlideStyle, setPptSlideStyle] = useState<'ideal_6x6' | 'too_much_text' | 'empty_no_data'>('ideal_6x6');
  const [pptTransition, setPptTransition] = useState<'smooth' | 'crazy_distraction'>('smooth');
  const [pptSpeakerBehavior, setPptSpeakerBehavior] = useState<'confident_audience' | 'back_turned_reading'>('confident_audience');
  const [pptChecklist, setPptChecklist] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });
  const [pptSubmitted, setPptSubmitted] = useState<boolean>(false);

  const toggleChecklist = (num: number) => {
    setChecklist((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  const completedChecklistCount = Object.values(checklist).filter(Boolean).length;

  // PowerPoint Themes and Slide data
  const pptThemes = {
    solar_system: {
      name: 'O Sistema Solar',
      icon: '🪐',
      accentColor: 'from-blue-600 to-indigo-700',
      slides: [
        {
          type: 'cover',
          title: 'O FASCINANTE SISTEMA SOLAR',
          subtitle: 'Trabalho de Ciências Naturais & TIC',
          author: 'Autores: Inês & Tomás • 6.º A',
          date: 'Ano Letivo 2025/2026',
        },
        {
          type: 'agenda',
          title: 'De que vamos falar hoje?',
          bulletsIdeal: [
            'O que é o Sistema Solar e onde fica',
            'Os 8 planetas (Rochosos e Gasosos)',
            'Curiosidades sobre o Planeta Marte',
            'O que aprendemos e fontes de pesquisa',
          ],
          bulletsOverloaded: [
            'O Sistema Solar é constituído pelo Sol e por todos os corpos celestes que orbitam à sua volta ao longo de milhões de anos de evolução cósmica desde a nebulosa primordial.',
            'Vamos falar de Mercúrio, Vénus, Terra, Marte, Júpiter, Saturno, Úrano e Neptuno e também de Plutão que já foi considerado planeta mas hoje em dia é classificado como anão.',
            'Também vamos explicar a velocidade da luz e a distância da Terra ao Sol que é de cerca de 150 milhões de quilómetros.',
          ],
        },
        {
          type: 'content',
          title: 'Planeta Marte: O Planeta Vermelho',
          image: '🔴',
          bulletsIdeal: [
            'Quarto planeta a contar do Sol',
            'Cor avermelhada devido ao óxido de ferro',
            'Tem a maior montanha do Sistema Solar (Monte Olimpo)',
            'Robôs da NASA procuram sinais de água antiga',
          ],
          bulletsOverloaded: [
            'Marte é o quarto planeta a partir do Sol e o segundo menor do Sistema Solar, maior apenas do que Mercúrio. Batizado em homenagem à divindade romana da guerra, muitas vezes é descrito como o Planeta Vermelho porque o óxido de ferro predominante na sua superfície dá-lhe uma aparência avermelhada que o torna visível a olho nu na abóbada celeste durante a noite.',
          ],
        },
        {
          type: 'conclusion',
          title: 'Conclusão & O Que Aprendemos',
          bulletsIdeal: [
            'A Terra é o único planeta conhecido com vida',
            'Explorar o espaço ajuda a proteger o nosso planeta',
            'Fontes: Manual de Ciências e NASA Kids Club',
            'Muito obrigado! Têm alguma pergunta? 🌟',
          ],
          bulletsOverloaded: [
            'Concluímos portanto que o espaço é muito grande e que ainda há muitas coisas por descobrir e que os cientistas continuam a enviar satélites e sondas para o espaço e que foi muito divertido fazer este trabalho no PowerPoint da escola.',
          ],
        },
      ],
    },
    castles: {
      name: 'Castelos de Portugal',
      icon: '🏰',
      accentColor: 'from-amber-600 to-orange-700',
      slides: [
        {
          type: 'cover',
          title: 'CASTELOS MEDIEVAIS DE PORTUGAL',
          subtitle: 'História & Geografia de Portugal • TIC',
          author: 'Autores: Beatriz & Rodrigo • 6.º B',
          date: 'Ano Letivo 2025/2026',
        },
        {
          type: 'agenda',
          title: 'O que vamos descobrir?',
          bulletsIdeal: [
            'Para que serviam os castelos no século XII',
            'As partes principais de uma fortaleza de pedra',
            'O histórico Castelo de Guimarães',
            'Resumo final e espaço para perguntas',
          ],
          bulletsOverloaded: [
            'Durante a Idade Média os reis e nobres precisavam de defender o território conquistado durante a Reconquista Cristã construindo muralhas de pedra altas e fossos profundos para impedir o avanço dos exércitos inimigos em todas as regiões do reino de Portugal.',
            'Vamos explicar detalhadamente a Torre de Menagem, a barbacã, os adarves, as ameias, as seteiras e os caminhos de ronda.',
          ],
        },
        {
          type: 'content',
          title: 'Castelo de Guimarães: Berço da Nação',
          image: '🛡️',
          bulletsIdeal: [
            'Construído no século X pela Condessa Mumadona',
            'Ligado ao nascimento de D. Afonso Henriques',
            'Torre de Menagem com 28 metros de altura',
            'Classificado como Monumento Nacional',
          ],
          bulletsOverloaded: [
            'O Castelo de Guimarães localiza-se na freguesia de Oliveira do Castelo e é um dos mais significativos monumentos militares portugueses, tendo sido mandado edificar no século X para defender o mosteiro de São Mamede dos ataques frequentes de mouros e de normandos.',
          ],
        },
        {
          type: 'conclusion',
          title: 'O Que Aprendemos',
          bulletsIdeal: [
            'Os castelos protegiam as populações medievais',
            'A arquitetura de pedra durou quase mil anos',
            'Fontes: Museu Virtual da História & Livro Escolar',
            'Obrigado pela vossa atenção! 🏰',
          ],
          bulletsOverloaded: [
            'Esperamos que tenham gostado da nossa apresentação sobre os castelos e que tenham aprendido muito sobre os reis de Portugal.',
          ],
        },
      ],
    },
    ocean_life: {
      name: 'Golfinhos do Sado',
      icon: '🐬',
      accentColor: 'from-cyan-600 to-blue-700',
      slides: [
        {
          type: 'cover',
          title: 'OS GOLFINHOS DO RIO SADO',
          subtitle: 'Proteção Marinha e Biodiversidade • 6.º Ano',
          author: 'Autores: Martim & Sofia • 6.º C',
          date: 'Ano Letivo 2025/2026',
        },
        {
          type: 'agenda',
          title: 'Tópicos da Apresentação',
          bulletsIdeal: [
            'A comunidade única de roazes-corvineiros',
            'Como comunicam e caçam em família',
            'As ameaças da poluição e do tráfego marítimo',
            'Como todos nós podemos ajudar a proteger',
          ],
          bulletsOverloaded: [
            'O estuário do Sado abriga uma das únicas populações residentes de golfinhos na Europa que se alimentam de chocos e peixes e que enfrentam sérios problemas ecológicos causados pelo lixo plástico e pelas embarcações a motor que circulam na baía de Setúbal todos os dias.',
          ],
        },
        {
          type: 'content',
          title: 'Como Vivem os Roazes no Estuário',
          image: '🌊',
          bulletsIdeal: [
            'Cerca de 30 golfinhos vivem fixos no Sado',
            'Usam ecolocalização (estalidos) para caçar',
            'Trabalham em equipa para cercar os peixes',
            'As crias aprendem tudo com as mães',
          ],
          bulletsOverloaded: [
            'Estes cetáceos mamíferos inteligentes emitem sons de alta frequência chamados cliques que ricocheteiam nos obstáculos e nos cardumes permitindo-lhes criar um mapa tridimensional na sua mente mesmo quando a água está turva ou durante a noite profunda.',
          ],
        },
        {
          type: 'conclusion',
          title: 'A Mensagem Final',
          bulletsIdeal: [
            'Proteger os oceanos começa em terra firme',
            'Evitar plásticos descartáveis nos lanches',
            'Fontes: Reserva Natural do Estuário do Sado',
            'Obrigado a todos! Têm dúvidas? 🐬',
          ],
          bulletsOverloaded: [
            'Acabámos o nosso trabalho e achamos que os golfinhos são muito giros e devemos apanhar o lixo da praia sempre que vamos a banhos no Verão.',
          ],
        },
      ],
    },
    internet: {
      name: 'Cabos Submarinos da Internet',
      icon: '💻',
      accentColor: 'from-purple-600 to-indigo-700',
      slides: [
        {
          type: 'cover',
          title: 'A INTERNET POR DEBAIXO DO MAR',
          subtitle: 'Como a Informação Viaja pelo Mundo • TIC',
          author: 'Autores: Diogo & Leonor • 6.º A',
          date: 'Ano Letivo 2025/2026',
        },
        {
          type: 'agenda',
          title: 'O que vamos desvendar?',
          bulletsIdeal: [
            'A internet não vive nas nuvens: vive no mar!',
            'O que é um cabo submarino de fibra ótica',
            'Portugal como porta de entrada na Europa (Sines)',
            'Conclusão e curiosidades fascinantes',
          ],
          bulletsOverloaded: [
            'Muita gente pensa que a internet funciona apenas por satélites no espaço mas 99% do tráfego mundial viaja através de cabos de fibra ótica submarinos que atravessam os oceanos a milhares de metros de profundidade.',
          ],
        },
        {
          type: 'content',
          title: 'Cabos de Fibra Ótica: Raios de Luz',
          image: '🌐',
          bulletsIdeal: [
            'Cabos com a espessura de uma mangueira de jardim',
            'Transportam informação através de pulsos de luz',
            'Velocidade próxima da velocidade da luz',
            'Revestimento de aço contra dentes de tubarões!',
          ],
          bulletsOverloaded: [
            'A fibra ótica é constituída por filamentos de vidro puríssimo tão finos como um fio de cabelo por onde viajam feixes de laser infravermelho codificados em impulsos binários de zeros e uns com uma capacidade de transmissão de centenas de terabits por segundo.',
          ],
        },
        {
          type: 'conclusion',
          title: 'Conclusão da Equipa',
          bulletsIdeal: [
            'A internet depende de cabos físicos reais',
            'Portugal é um centro mundial de conexões',
            'Fontes: Submarine Cable Map & Manual TIC',
            'Muito obrigado pela atenção de todos! 🚀',
          ],
          bulletsOverloaded: [
            'Foi esta a nossa pesquisa e agora já sabem que quando vêem vídeos no YouTube a informação vem a viajar por baixo de água e não pelo céu.',
          ],
        },
      ],
    },
  };

  const currentPptTheme = pptThemes[pptTopic];
  const activeSlideData = currentPptTheme.slides[activeSlide];

  const calculatePptScore = () => {
    let score = 0;
    if (pptSlideStyle === 'ideal_6x6') score += 40;
    else if (pptSlideStyle === 'empty_no_data') score += 15;
    else if (pptSlideStyle === 'too_much_text') score += 10;

    if (pptTransition === 'smooth') score += 30;
    else score += 10;

    if (pptSpeakerBehavior === 'confident_audience') score += 30;
    else score += 10;

    return score;
  };

  const currentPptScore = calculatePptScore();

  const handleTestPpt = () => {
    setPptSubmitted(true);
  };

  const togglePptChecklist = (num: number) => {
    setPptChecklist((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  const completedPptChecklistCount = Object.values(pptChecklist).filter(Boolean).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* 🚀 HUB HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-10 text-white shadow-xl shadow-blue-500/10">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Oficina de Criação Prática • Aprender</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Aprende a Criar Projetos Digitais 🎨✨
          </h1>

          <p className="text-xs sm:text-base text-blue-50 leading-relaxed font-normal">
            Aqui encontras tutoriais passo a passo, truques de design e laboratórios práticos para dominares as ferramentas informáticas mais úteis da escola. Aprende a fazer cartazes, apresentações e vídeos como um verdadeiro profissional!
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs font-bold text-blue-100">
            <span className="bg-white/10 px-3 py-1 rounded-lg">🎯 Para Alunos do 6.º Ano (~11-12 anos)</span>
            <span className="bg-white/10 px-3 py-1 rounded-lg">💡 Aprendizagem Autónoma</span>
            <span className="bg-white/10 px-3 py-1 rounded-lg">⭐ Ferramentas Gratuitas & Seguras</span>
          </div>
        </div>

        {/* Decorative corner illustration */}
        <div className="absolute right-4 -bottom-6 opacity-20 sm:opacity-30 pointer-events-none hidden md:block">
          <Palette className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* 📌 CATEGORY / CONTENT SELECTOR TABS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase font-black tracking-wider text-slate-500">
            Escolhe o Conteúdo de Aprendizagem
          </h2>
          <span className="text-xs text-blue-600 font-bold">2 Conteúdos Disponíveis • Mais em breve!</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => setActiveCategory('canva_posters')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
              activeCategory === 'canva_posters'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 ring-2 ring-blue-400'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🎨</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                activeCategory === 'canva_posters' ? 'bg-white text-blue-700' : 'bg-emerald-100 text-emerald-800'
              }`}>
                Ativo
              </span>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black leading-snug">Cartazes no Canva</p>
              <p className={`text-[10px] ${activeCategory === 'canva_posters' ? 'text-blue-100' : 'text-slate-400'}`}>
                Design & Comunicação
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveCategory('presentations')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
              activeCategory === 'presentations'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 ring-2 ring-indigo-400'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">📽️</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                activeCategory === 'presentations' ? 'bg-white text-indigo-700' : 'bg-amber-100 text-amber-900 font-extrabold'
              }`}>
                Novo!
              </span>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black leading-snug">PowerPoint & Slides</p>
              <p className={`text-[10px] ${activeCategory === 'presentations' ? 'text-indigo-100' : 'text-slate-400'}`}>
                Outlook / Microsoft 365
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveCategory('video')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
              activeCategory === 'video'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🎬</span>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                Em breve
              </span>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black leading-snug">Vídeo Criativo</p>
              <p className="text-[10px] text-slate-400">Planos, Som & Corte</p>
            </div>
          </button>

          <button
            onClick={() => setActiveCategory('infographics')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
              activeCategory === 'infographics'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">📊</span>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                Em breve
              </span>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black leading-snug">Infografias</p>
              <p className="text-[10px] text-slate-400">Dados & Esquemas</p>
            </div>
          </button>

          <button
            onClick={() => setActiveCategory('podcasts')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
              activeCategory === 'podcasts'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🎙️</span>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                Em breve
              </span>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black leading-snug">Podcasts</p>
              <p className="text-[10px] text-slate-400">Voz, Guião & Gravação</p>
            </div>
          </button>
        </div>
      </div>

      {/* ⚠️ PLACEHOLDER NOTICE FOR FUTURE MODULES */}
      {activeCategory !== 'canva_posters' && activeCategory !== 'presentations' && (
        <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-3xl">
            🚀
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-black text-slate-900">Conteúdo em Preparação!</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Estamos a desenhar este guia interativo para a tua turma. Entretanto, explora os nossos conteúdos ativos: <strong>Cartazes no Canva</strong> ou <strong>PowerPoint no Outlook</strong>!
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setActiveCategory('canva_posters')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Cartazes no Canva 🎨
            </button>
            <button
              onClick={() => setActiveCategory('presentations')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              PowerPoint no Outlook 📽️
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 CONTEÚDO 1: CARTAZES NO CANVA (EXPLICAÇÃO COMPLETA P/ 11 ANOS) */}
      {/* ========================================================================= */}
      {activeCategory === 'canva_posters' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* HEADER DA ATIVIDADE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 text-2xl">
                🎨
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-md">
                    Guia Prático • Módulo 1
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-bold text-slate-500">6.º Ano TIC</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Cartazes: Aprender a Criar no Canva & Galeria de Reciclagem 🖌️♻️
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Descobre as regras de ouro do design (hierarquia, contraste e margens) e explora vários exemplos reais de cartazes temáticos de Reciclagem para a escola!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-center">
                <span className="text-[10px] font-black uppercase text-emerald-800 block">Exemplos Reais</span>
                <span className="text-sm font-black text-emerald-950">6 Cartazes de Reciclagem ♻️</span>
              </div>
            </div>
          </div>

          {/* SECÇÃO 1: O QUE É UM CARTAZ E O SEU SUPER-PODER? */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 text-blue-600">
              <BookOpen className="w-6 h-6" />
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                1. O Que é um Cartaz e Qual é o Seu Super-Poder? 🦸‍♂️
              </h3>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              Um cartaz é um <strong>grito visual</strong>! É uma mensagem rápida feita para chamar a atenção de alguém que vai a caminhar pelo corredor da escola ou pela rua.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                <div className="text-2xl">⏱️</div>
                <h4 className="text-xs font-black uppercase text-blue-800 tracking-wide">
                  A Regra dos 3 Segundos
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Quem passa pelo teu cartaz só decide se vai ler em <strong>3 segundos</strong>. Se estiver cheio de texto ou confuso, a pessoa segue em frente e não descobre o teu evento!
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="text-2xl">🎯</div>
                <h4 className="text-xs font-black uppercase text-amber-800 tracking-wide">
                  Um Único Objetivo Principal
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Um cartaz só deve ensinar <strong>uma coisa principal</strong>: anunciar uma Feira do Livro, avisar sobre a reciclagem, ou convidar para um torneio de futebol.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="text-2xl">👁️</div>
                <h4 className="text-xs font-black uppercase text-emerald-800 tracking-wide">
                  Lê-se à Distância
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  O título tem de se ler a <strong>2 metros de distância</strong>. Se precisares de lupa ou de colar a cara à folha, o tamanho da letra está pequeno demais!
                </p>
              </div>
            </div>
          </div>

          {/* SECÇÃO 2: AS 5 REGRAS DE OURO DO CARTAZ (HIERARQUIA VISUAL) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 text-indigo-600">
              <Layout className="w-6 h-6" />
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                2. As 5 Regras de Ouro de um Cartaz Campeão 🏆
              </h3>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              No design chamamos a isto <strong>"Hierarquia Visual"</strong>: o que é que a pessoa deve ver em primeiro lugar, em segundo e em terceiro?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Regra 1 */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase tracking-wide">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">1</span>
                  <span>O Título Gigante (3 a 5 palavras)</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Deve ser a maior letra de todo o cartaz. Usa palavras fortes que criem curiosidade!
                  <br />
                  <span className="text-emerald-700 font-bold">✓ Exemplo:</span> <em>"FEIRA DO LIVRO MÁGICA"</em>
                  <br />
                  <span className="text-rose-600 font-bold">✗ Errado:</span> <em>"Aviso informativo sobre a realização da décima feira do livro da escola no pavilhão central"</em> (muito comprido!).
                </p>
              </div>

              {/* Regra 2 */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase tracking-wide">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">2</span>
                  <span>Os 3 Qs Essenciais (A Mensagem)</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Todo o cartaz informativo precisa de responder claramente:
                  <br />
                  • <strong>O QUÊ?</strong> O evento (ex.: Torneio de Robótica)
                  <br />
                  • <strong>QUANDO?</strong> Data e horas exatas (ex.: 24 de Maio às 14h30)
                  <br />
                  • <strong>ONDE?</strong> O local preciso (ex.: Biblioteca Escolar)
                </p>
              </div>

              {/* Regra 3 */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase tracking-wide">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">3</span>
                  <span>Uma Imagem Forte Vale Mais Que Dez</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Escolhe <strong>uma única ilustração ou foto marcante</strong> que ocupe o centro do cartaz. Espalhar 15 autocolantes pequenos faz o cartaz parecer uma confusão de brinquedos espalhados no chão!
                </p>
              </div>

              {/* Regra 4 */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase tracking-wide">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">4</span>
                  <span>A Regra do Contraste e das 3 Cores</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  • <strong>Fundo escuro</strong> pede letras claras (branco ou amarelo).
                  <br />
                  • <strong>Fundo claro</strong> pede letras escuras (azul-escuro ou preto).
                  <br />
                  • <strong>Nunca faças:</strong> amarelo em fundo branco ou cinzento em fundo azul claro (as letras desaparecem!).
                  <br />
                  • Usa no máximo <strong>2 a 3 cores principais</strong>.
                </p>
              </div>
            </div>

            {/* Regra 5: Respiração */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
              <span className="text-2xl shrink-0">🌿</span>
              <div className="space-y-1">
                <h5 className="text-xs font-black uppercase tracking-wide text-emerald-900">
                  Regra 5: O Cartaz Precisa de "Respirar" (Espaço em Branco)
                </h5>
                <p className="text-xs text-emerald-950 leading-relaxed">
                  Não tenhas medo de deixar partes da folha vazias! Os espaços limpos e as margens afastadas dos cantos ajudam o cérebro a ler sem cansaço e dão um aspeto moderno e profissional ao teu trabalho.
                </p>
              </div>
            </div>
          </div>

          {/* SECÇÃO 3: PASSO A PASSO NO CANVA */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 text-cyan-600">
              <Sliders className="w-6 h-6" />
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                3. Como Fazer o Teu Cartaz no Canva Passo a Passo 🖌️
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-50/80 border border-cyan-200 text-xs text-cyan-950 font-medium flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-cyan-700 shrink-0" />
              <span>
                <strong>Dica de Segurança TIC:</strong> Usa o Canva sempre com a conta escolar autorizada pelo teu professor ou pais. Nunca coloques fotos pessoais da tua casa, nem a tua morada, nem o teu número de telemóvel num cartaz público!
              </span>
            </div>

            <div className="space-y-4">
              {/* Passo 1 */}
              <div className="flex gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm shrink-0">
                  1
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900">
                    Começar: Escolher o Modelo "Cartaz" (Poster A4)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Depois de entrares no Canva, clica no botão roxo <strong>"Criar um design"</strong> (no canto superior direito) e escreve <strong>"Cartaz"</strong>. Escolhe o formato vertical A4 tradicional para folha de papel.
                  </p>
                </div>
              </div>

              {/* Passo 2 */}
              <div className="flex gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm shrink-0">
                  2
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900">
                    Tela em Branco ou Modelo? (Como Personalizar)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    No menu lateral esquerdo em <strong>Modelos</strong> podes inspirar-te. Mas não deixes o modelo como está! Substitui os textos com as tuas palavras, ajusta as cores para o teu tema e apaga os elementos desnecessários.
                  </p>
                </div>
              </div>

              {/* Passo 3 */}
              <div className="flex gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm shrink-0">
                  3
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900">
                    Inserir o Título e Textos (Máximo de 2 Fontes!)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Clica em <strong>Texto</strong> na barra lateral:
                    <br />
                    • Clica em <strong>"Adicionar título"</strong> para a frase principal (usa uma fonte grossa e fácil de ler, como <em>Montserrat</em>, <em>Bebas Neue</em> ou <em>League Spartan</em>).
                    <br />
                    • Clica em <strong>"Adicionar subtítulo"</strong> para a data, hora e local.
                  </p>
                </div>
              </div>

              {/* Passo 4 */}
              <div className="flex gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-black text-sm shrink-0">
                  4
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900">
                    Elementos e Fotos: Estica SEMPRE pelo Canto!
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Clica em <strong>Elementos</strong> e procura ícones limpos (ex.: "livro", "robô", "árvore").
                    <br />
                    <span className="text-amber-700 font-bold">⚠️ Segredo de Designer:</span> Para aumentar ou diminuir uma imagem, puxa <strong>sempre pelos quatro círculos nos cantos</strong>. Se puxares pelas barras laterais do meio, vais achatar e deformar a imagem!
                  </p>
                </div>
              </div>

              {/* Passo 5 */}
              <div className="flex gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm shrink-0">
                  5
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900">
                    Guardar e Transferir para Imprimir ou Entregar
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Quando o teu cartaz estiver pronto, clica no botão <strong>Partilhar</strong> (canto superior direito) → <strong>Transferir</strong>:
                    <br />
                    • Se for para <strong>imprimir em papel</strong> na escola: escolhe <strong>PDF Standard</strong>.
                    <br />
                    • Se for para <strong>mostrar no computador</strong> ou enviar por email: escolhe <strong>PNG</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECÇÃO 4: OS 4 ERROS QUE NUNCA DEVES COMETER */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                4. O Que NUNCA Fazer num Cartaz (Os 4 Erros Típicos) 🚫
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-700 font-black text-xs uppercase">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>Erro 1: Usar 8 tipos de letra diferentes</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  O cartaz fica a parecer uma carta anónima recortada de jornal! Usa apenas <strong>duas fontes</strong> em todo o trabalho.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-700 font-black text-xs uppercase">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>Erro 2: Texto colado aos limites da folha</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Ao imprimir na impressora da escola ou ao cortar, as letras nas bordas podem desaparecer. Deixa sempre uma margem de segurança à volta.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-700 font-black text-xs uppercase">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>Erro 3: Parágrafos enormes de redação</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Ninguém para no corredor a ler um bloco com 20 linhas. Usa tópicos curtos, números ou frases diretas de uma linha.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-700 font-black text-xs uppercase">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>Erro 4: Letras claras em fundo claro</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Amarelo sobre branco, ou cinzento claro sobre azul bebé. Testa sempre se consegues ler dando três passos para trás do ecrã!
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* ========================================================================= */}
          {/* SECÇÃO 5: GALERIA DE CARTAZES DE RECICLAGEM — EXEMPLOS PRÁTICOS NO CANVA */}
          {/* ========================================================================= */}
          {(() => {
            const recyclePosters = [
              {
                id: 'p1',
                category: 'ponto_verde',
                categoryLabel: 'Guia Visual dos Ecopontos',
                layoutType: 'three_columns',
                badgeText: 'Campanha Escolar • 6.º Ano',
                title: 'ONDE DEVO COLOCAR?',
                slogan: 'Guia Oficial de Separação de Resíduos na Escola',
                date: 'Ano Letivo 2025/2026',
                location: 'Ecopontos em todos os corredores',
                contact: 'Eco-Escola • Clube de TIC',
                columns: [
                  {
                    name: 'AMARELO',
                    headerBg: 'bg-amber-400 text-slate-950',
                    boxBg: 'bg-amber-50/90 border-amber-300 text-slate-900',
                    accentColor: 'text-amber-600',
                    icon: '🟡',
                    material: 'Plástico & Metal',
                    rule: 'Espalmar antes de colocar!',
                    yes: ['Garrafas de água e sumos', 'Pacotes de leite e néctar', 'Latas de conserva e refrigerante', 'Sacos plásticos e iogurtes'],
                    no: ['Baldes ou brinquedos partidos', 'Canetas e marcadores escolares', 'Pratos de plástico sujos com comida'],
                  },
                  {
                    name: 'AZUL',
                    headerBg: 'bg-blue-600 text-white',
                    boxBg: 'bg-blue-50/90 border-blue-300 text-slate-900',
                    accentColor: 'text-blue-600',
                    icon: '🔵',
                    material: 'Papel & Cartão',
                    rule: 'Folhas limpas e secas!',
                    yes: ['Folhas de cadernos e rascunhos', 'Caixas de cartão espalmadas', 'Fotocópias de estudo', 'Jornais, revistas e panfletos'],
                    no: ['Guardanapos e papel de cozinha sujo', 'Toalhetes húmidos de limpeza', 'Papel de prata dos chocolates'],
                  },
                  {
                    name: 'VERDE',
                    headerBg: 'bg-emerald-600 text-white',
                    boxBg: 'bg-emerald-50/90 border-emerald-300 text-slate-900',
                    accentColor: 'text-emerald-600',
                    icon: '🟢',
                    material: 'Vidro',
                    rule: 'Retirar as tampas metálicas!',
                    yes: ['Garrafas de água em vidro', 'Frascos de doce ou iogurte', 'Boiões de comida de vidro', 'Frascos de molho lavados'],
                    no: ['Copos de vidro partidos', 'Espelhos e vidros de janelas', 'Lâmpadas ou loiças cerâmicas'],
                  },
                ],
                bannerTip: '💧 Dica importante: não é preciso lavar as embalagens com água, basta que estejam completamente vazias!',
              },
              {
                id: 'p2',
                category: 'pilhas',
                layoutType: 'alert_hero',
                categoryLabel: 'Alerta Pilhão',
                badgeText: 'Aviso Urgente de Segurança Ambiental',
                title: 'PERIGO: PILHAS NO LIXO COMUM!',
                slogan: 'Uma única pilha contém metais pesados tóxicos como chumbo e mercúrio que poluem rios e nascentes.',
                date: 'Todas as Sextas • Recolha Oficial',
                location: 'Pilhão Vermelho na Entrada do Bloco A',
                contact: 'Brigada Verde da Escola',
                stats: [
                  { num: '30.000 Litros', label: 'de água que uma só pilha-botão pode contaminar no solo.' },
                  { num: '100 Anos', label: 'o tempo que os metais pesados demoram a desaparecer da natureza.' },
                  { num: '100% Reciclável', label: 'o aço, zinco e níquel retirados das pilhas recolhidas.' },
                ],
                steps: [
                  { step: '1', title: 'Junta em Casa', desc: 'Guarda as pilhas gastas de comandos e brinquedos numa caixa de sapatos.' },
                  { step: '2', title: 'Traz para a Escola', desc: 'Leva-as na mochila sem molhar nem perfurar o invólucro.' },
                  { step: '3', title: 'Deposita no Pilhão', desc: 'Coloca no contentor vermelho próprio junto à Portaria.' },
                ],
                warning: '⚠️ Pilhas danificadas ou a verter líquido? Nunca toques com as mãos e avisa um professor ou funcionário.',
              },
              {
                id: 'p3',
                category: 'reutilizacao',
                layoutType: 'split_comparison',
                categoryLabel: 'Campanha Plástico Zero',
                badgeText: 'Semana Eco-Escolas',
                title: 'O TEU LANCHE PROTEGE O MAR?',
                slogan: 'Faz a escolha certa no recreio escolar e diz adeus aos plásticos de uso único.',
                date: 'Semana de 2 a 6 de Junho',
                location: 'Refeitório & Bar dos Alunos',
                contact: 'Projeto Mar Sem Plástico • 6.º Ano',
                sideBad: {
                  title: 'EVITA ESTES HÁBITOS ❌',
                  subtitle: 'Produzem 20 kg de lixo por aluno todos os anos',
                  items: [
                    'Garrafas pequenas de plástico descartável',
                    'Embrulhos de papel de alumínio descartáveis',
                    'Sacos plásticos de uso único para a fruta',
                    'Palhinhas e talheres de plástico fino',
                  ],
                },
                sideGood: {
                  title: 'PREFERE ESTAS SOLUÇÕES ✅',
                  subtitle: 'Laváveis, económicas e amigas dos oceanos',
                  items: [
                    'Garrafa de aço inoxidável ou vidro resistente',
                    'Caixa tipo "lunchbox" hermética reutilizável',
                    'Bolsas de tecido laváveis para bolachas e pão',
                    'Fruta fresca na sua casca natural protetora',
                  ],
                },
                actionBanner: '🌊 Se 200 alunos usarem garrafa reutilizável, poupam-se mais de 30.000 embalagens plásticas num só ano letivo!',
              },
              {
                id: 'p4',
                category: 'eletronicos',
                layoutType: 'event_announcement',
                categoryLabel: 'Campanha Eletrão / E-Lixo',
                badgeText: 'Grande Evento Escolar',
                title: 'FESTIVAL DO REEE & ELETRÓNICOS',
                slogan: 'Aparelhos elétricos e cabos avariados não vão para o caixote. Traz e dá-lhes uma nova vida!',
                date: 'Quarta-feira, 28 de Maio • 14h30 às 17h00',
                location: 'Átrio Principal da Escola • Tenda Electrão',
                contact: 'Clube de Robótica & Departamento de TIC',
                acceptedItems: [
                  { title: 'Informática', icon: '💻', desc: 'Teclados, ratos, impressoras antigas, cabos USB e carregadores avariados.' },
                  { title: 'Som & Imagem', icon: '🎧', desc: 'Auscultadores partidos, colunas, consolas portáteis e câmaras.' },
                  { title: 'Pequenos Domésticos', icon: '🔌', desc: 'Torradeiras, secadores de cabelo velhos, ventoinhas e ferros de engomar.' },
                  { title: 'Telefones & Tablets', icon: '📱', desc: 'Telemóveis estragados e ecrãs sem conserto (limpos de cartões SIM).' },
                ],
                rewardInfo: '🏆 A turma do 2.º Ciclo que recolher o maior peso de material elétrico ganha uma oficina prática de drones!',
              },
              {
                id: 'p5',
                category: 'ponto_verde',
                layoutType: 'infographic_facts',
                categoryLabel: 'Infografia Papel & Árvores',
                badgeText: 'Sabias Que? • Edição Especial',
                title: 'O QUE ACONTECE QUANDO RECICLAS O PAPEL?',
                slogan: 'Descobre a viagem incrível de uma folha de rascunho desde a tua sala até ao novo livro.',
                date: 'Campanha Papelada Útil',
                location: 'Todas as salas de aula e reprografia',
                contact: 'Biblioteca Escolar & Turmas de Ciências',
                cycleSteps: [
                  { num: '1', title: 'Separação na Sala', text: 'Colocas o papel de rascunho no contentor azul sem agrafos nem plástico.' },
                  { num: '2', title: 'Trituração & Polpa', text: 'Na fábrica de reciclagem o papel é misturado com água até formar uma pasta limpa.' },
                  { num: '3', title: 'Secagem em Rolos', text: 'A pasta é prensada em rolos gigantes com quilómetros de papel novo branqueado.' },
                  { num: '4', title: 'Novos Livros & Caixas', text: 'Renascem caixas de cereais, cadernos escolares e papel higiénico ecológico.' },
                ],
                impactNumbers: [
                  { big: '20 Árvores', desc: 'salvas por cada tonelada de papel reciclado.' },
                  { big: '30.000 Litros', desc: 'de água poupados em comparação com papel novo de madeira.' },
                  { big: 'Até 7 Vezes', desc: 'o número de vezes que a mesma fibra de papel pode ser reciclada.' },
                ],
              },
              {
                id: 'p6',
                category: 'reutilizacao',
                layoutType: 'workshop_poster',
                categoryLabel: 'Oficina de Compostagem',
                badgeText: 'Inscrições Abertas • Vagas Limitadas',
                title: 'OFICINA: DA CASCA AO ADUBO!',
                slogan: 'Vem aprender a transformar as sobras de fruta do teu recreio em terra fértil para a nossa horta.',
                date: 'Quinta-feira, 15 de Maio • 15h30',
                location: 'Horta Pedagógica da Escola (junto ao campo exterior)',
                contact: 'Prof.ª de Ciências & Eco-Delegados',
                learnings: [
                  { icon: '🌿', title: 'Os 2 Ingredientes', desc: 'Equilíbrio perfeito entre restos verdes (húmidos) e restos castanhos (folhas secas).' },
                  { icon: '🪱', title: 'Ajudantes Invisíveis', desc: 'Minhocas, bactérias benéficas e fungos que trabalham dia e noite sem parar.' },
                  { icon: '⏱️', title: 'A Maturação', desc: 'Como cheirar e sentir a temperatura do compostor para saber quando está pronto.' },
                ],
                bringList: '🧺 O que deves trazer: luvas de jardinagem, calçado confortável e muita curiosidade!',
                enrollment: 'Inscrições gratuitas na Biblioteca Escolar até terça-feira!',
              },
            ];

            const currentPoster = recyclePosters.find((p) => p.id === selectedRecyclePosterId) || recyclePosters[0];
            const filteredPosters = filterRecycleCategory === 'all'
              ? recyclePosters
              : recyclePosters.filter((p) => p.category === filterRecycleCategory);

            return (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-8 animate-in fade-in">
                {/* CABEÇALHO DA GALERIA */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-2 bg-emerald-400 text-emerald-950 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      <Recycle className="w-3.5 h-3.5" />
                      <span>Galeria de Modelos Reais • Formato Canva</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                      <span>Exemplos de Cartazes sobre Reciclagem</span>
                      <span className="text-emerald-400">♻️</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                      Explora <strong>6 cartazes com layouts e propósitos diferentes</strong>: guias de triagem em 3 colunas, alertas urgentes, comparações lado a lado, convocatórias de eventos e infografias de processo. Clica para ver em tamanho A4 real.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg">
                      6
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Modelos Distintos</span>
                      <span className="text-xs font-black text-white">Composições Reais</span>
                    </div>
                  </div>
                </div>

                {/* FILTROS POR CATEGORIA */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                    <span className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-emerald-400" />
                      <span>Filtrar por Tema do Cartaz:</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      A mostrar {filteredPosters.length} de {recyclePosters.length} cartazes
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all', label: 'Todos os Exemplos (6)', icon: '🌟' },
                      { id: 'ponto_verde', label: 'Ecopontos & Papel (2)', icon: '🟡🔵🟢' },
                      { id: 'pilhas', label: 'Pilhão & Tóxicos (1)', icon: '🔋' },
                      { id: 'reutilizacao', label: 'Plástico Zero & Horta (2)', icon: '🌊🌱' },
                      { id: 'eletronicos', label: 'Resíduos Eletrónicos (1)', icon: '💻' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFilterRecycleCategory(f.id as any)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                          filterRecycleCategory === f.id
                            ? 'bg-emerald-500 text-emerald-950 border-emerald-300 shadow-md font-black'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{f.icon}</span>
                        <span>{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* GRELHA PRINCIPAL: SELETOR DE CARTAZES + VISUALIZADOR REALISTA A4 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* SELETOR LATERAL */}
                  <div className="lg:col-span-4 space-y-3">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-1">
                      Clica para Visualizar o Cartaz:
                    </span>

                    <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
                      {filteredPosters.map((poster) => {
                        const isSelected = poster.id === currentPoster.id;
                        return (
                          <div
                            key={poster.id}
                            onClick={() => setSelectedRecyclePosterId(poster.id)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left flex items-start gap-3 ${
                              isSelected
                                ? 'bg-emerald-500/15 border-emerald-400 ring-2 ring-emerald-400/40 shadow-md'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl shrink-0">
                              {poster.category === 'pilhas' ? '🔋' : poster.category === 'eletronicos' ? '💻' : poster.category === 'ponto_verde' ? '♻️' : '🌊'}
                            </div>
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider truncate">
                                  {poster.categoryLabel}
                                </span>
                                {isSelected && (
                                  <span className="text-[9px] bg-emerald-400 text-emerald-950 font-black px-1.5 py-0.5 rounded-full shrink-0">
                                    A Ver 👁️
                                  </span>
                                )}
                              </div>
                              <h4 className="text-xs font-black text-white leading-tight truncate">
                                {poster.title}
                              </h4>
                              <p className="text-[11px] text-slate-300 line-clamp-1">
                                {poster.slogan}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* VISUALIZADOR DO CARTAZ A4 (LAYOUTS REALISTAS E DIVERSIFICADOS) */}
                  <div className="lg:col-span-8 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                      <span className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-emerald-400" />
                        <span>Folha A4 Vertical (Simulação Real de Impressão)</span>
                      </span>
                      <span className="text-[11px] text-emerald-300 font-mono font-bold bg-white/10 px-2.5 py-0.5 rounded-md">
                        {currentPoster.categoryLabel}
                      </span>
                    </div>

                    {/* ========================================================================= */}
                    {/* CARTAZ 1: GUIA DOS 3 ECOPONTOS (LAYOUT EM 3 COLUNAS VISUAIS) */}
                    {/* ========================================================================= */}
                    {currentPoster.layoutType === 'three_columns' && (
                      <div className="w-full bg-slate-950 border-4 border-slate-700 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl flex flex-col justify-between overflow-hidden relative select-none">
                        {/* Fundo da Folha A4 */}
                        <div className="bg-white rounded-2xl p-5 sm:p-7 space-y-5 border border-slate-300 shadow-sm flex flex-col justify-between min-h-[620px]">
                          {/* Topo Oficial */}
                          <div className="border-b-2 border-slate-200 pb-3 text-center space-y-1">
                            <span className="inline-block bg-slate-900 text-white text-[10px] uppercase tracking-widest font-black px-3 py-0.5 rounded-full">
                              {currentPoster.badgeText}
                            </span>
                            <h1 className="text-xl sm:text-3xl font-black text-slate-950 tracking-tight leading-tight uppercase font-sans">
                              {currentPoster.title}
                            </h1>
                            <p className="text-xs sm:text-sm font-bold text-slate-600">
                              {currentPoster.slogan}
                            </p>
                          </div>

                          {/* 3 Colunas dos Ecopontos com SIM e NÃO */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-auto">
                            {currentPoster.columns?.map((col, idx) => (
                              <div key={idx} className={`rounded-xl border-2 ${col.boxBg} p-3.5 flex flex-col justify-between space-y-3 shadow-xs`}>
                                <div className="space-y-1.5">
                                  <div className={`py-1.5 px-2 rounded-lg font-black text-xs text-center uppercase tracking-wider ${col.headerBg}`}>
                                    {col.icon} {col.name}
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xs font-black text-slate-900">{col.material}</div>
                                    <div className="text-[10px] font-bold text-slate-600 italic">{col.rule}</div>
                                  </div>
                                </div>

                                <div className="space-y-2 text-[11px] leading-snug">
                                  <div>
                                    <span className="text-[10px] font-black text-emerald-800 uppercase block mb-1">
                                      O que colocar (SIM ✅):
                                    </span>
                                    <ul className="space-y-1 text-slate-800">
                                      {col.yes.map((y, yIdx) => (
                                        <li key={yIdx} className="flex items-start gap-1">
                                          <span className="text-emerald-600 font-bold">•</span>
                                          <span>{y}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div className="pt-1.5 border-t border-slate-200/80">
                                    <span className="text-[10px] font-black text-rose-800 uppercase block mb-1">
                                      Não colocar (NÃO ❌):
                                    </span>
                                    <ul className="space-y-1 text-slate-700">
                                      {col.no.map((n, nIdx) => (
                                        <li key={nIdx} className="flex items-start gap-1">
                                          <span className="text-rose-600 font-bold">•</span>
                                          <span>{n}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Dica de Rodapé */}
                          <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-center text-xs font-semibold text-slate-700">
                            {currentPoster.bannerTip}
                          </div>

                          {/* Rodapé da Escola */}
                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-bold text-slate-500">
                            <span>📍 {currentPoster.location}</span>
                            <span>{currentPoster.contact}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ========================================================================= */}
                    {/* CARTAZ 2: ALERTA DO PILHÃO (LAYOUT DE ALERTA HERO) */}
                    {/* ========================================================================= */}
                    {currentPoster.layoutType === 'alert_hero' && (
                      <div className="w-full bg-slate-950 border-4 border-rose-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col justify-between overflow-hidden relative select-none">
                        <div className="bg-gradient-to-b from-rose-900 via-rose-950 to-slate-950 rounded-2xl p-5 sm:p-7 border border-rose-600/50 flex flex-col justify-between min-h-[620px] space-y-5">
                          {/* Topo com Aviso Urgente */}
                          <div className="text-center space-y-2 border-b border-rose-400/30 pb-4">
                            <span className="inline-block bg-yellow-400 text-slate-950 text-[10px] sm:text-xs uppercase tracking-widest font-black px-3.5 py-1 rounded-full shadow-md">
                              🛑 {currentPoster.badgeText}
                            </span>
                            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight uppercase font-sans">
                              {currentPoster.title}
                            </h1>
                            <p className="text-xs sm:text-sm font-medium text-rose-200 max-w-lg mx-auto">
                              {currentPoster.slogan}
                            </p>
                          </div>

                          {/* 3 Factos de Impacto em Caixas Pretas */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-auto">
                            {currentPoster.stats?.map((stat, sIdx) => (
                              <div key={sIdx} className="bg-black/50 border border-rose-500/40 rounded-xl p-3.5 text-center space-y-1">
                                <div className="text-lg sm:text-xl font-black text-yellow-300">{stat.num}</div>
                                <div className="text-[11px] text-slate-200 leading-snug">{stat.label}</div>
                              </div>
                            ))}
                          </div>

                          {/* 3 Passos de Ação do Aluno */}
                          <div className="bg-white/10 rounded-xl p-4 border border-white/15 space-y-2.5">
                            <span className="text-[11px] font-black text-yellow-300 uppercase tracking-wider block">
                              Como Proceder em 3 Passos Simples:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {currentPoster.steps?.map((step, stIdx) => (
                                <div key={stIdx} className="bg-black/30 p-2.5 rounded-lg border border-white/10 flex items-start gap-2">
                                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                                    {step.step}
                                  </span>
                                  <div className="space-y-0.5">
                                    <div className="text-xs font-bold text-white">{step.title}</div>
                                    <div className="text-[10px] text-slate-300 leading-tight">{step.desc}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Caixa de Aviso de Segurança */}
                          <div className="p-3 bg-yellow-400 text-slate-950 rounded-xl font-bold text-xs text-center shadow-md">
                            {currentPoster.warning}
                          </div>

                          {/* Rodapé com Local do Pilhão */}
                          <div className="pt-2 border-t border-rose-400/30 flex items-center justify-between text-[10px] font-bold text-rose-200">
                            <span>📍 {currentPoster.location}</span>
                            <span>📅 {currentPoster.date}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ========================================================================= */}
                    {/* CARTAZ 3: PLÁSTICO ZERO (LAYOUT DE COMPARAÇÃO LADO A LADO) */}
                    {/* ========================================================================= */}
                    {currentPoster.layoutType === 'split_comparison' && (
                      <div className="w-full bg-slate-950 border-4 border-cyan-800 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl flex flex-col justify-between overflow-hidden relative select-none">
                        <div className="bg-sky-50 rounded-2xl p-5 sm:p-7 border border-cyan-200 flex flex-col justify-between min-h-[620px] space-y-5">
                          {/* Cabeçalho */}
                          <div className="text-center space-y-1.5 border-b-2 border-cyan-200 pb-3">
                            <span className="inline-block bg-cyan-700 text-white text-[10px] uppercase tracking-widest font-black px-3 py-0.5 rounded-full">
                              🌊 {currentPoster.badgeText}
                            </span>
                            <h1 className="text-xl sm:text-3xl font-black text-cyan-950 tracking-tight leading-tight uppercase font-sans">
                              {currentPoster.title}
                            </h1>
                            <p className="text-xs sm:text-sm font-bold text-cyan-800">
                              {currentPoster.slogan}
                            </p>
                          </div>

                          {/* Comparação Lado a Lado: EVITA vs. PREFERE */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-auto">
                            {/* Lado Mau */}
                            <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 space-y-3">
                              <div className="space-y-0.5 border-b border-rose-200 pb-2">
                                <h3 className="text-xs sm:text-sm font-black text-rose-800">{currentPoster.sideBad?.title}</h3>
                                <p className="text-[10px] text-rose-600 font-semibold">{currentPoster.sideBad?.subtitle}</p>
                              </div>
                              <ul className="space-y-2 text-xs text-rose-950">
                                {currentPoster.sideBad?.items.map((it, iIdx) => (
                                  <li key={iIdx} className="flex items-start gap-2">
                                    <span className="text-rose-600 font-bold">✗</span>
                                    <span>{it}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Lado Bom */}
                            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 space-y-3">
                              <div className="space-y-0.5 border-b border-emerald-200 pb-2">
                                <h3 className="text-xs sm:text-sm font-black text-emerald-800">{currentPoster.sideGood?.title}</h3>
                                <p className="text-[10px] text-emerald-600 font-semibold">{currentPoster.sideGood?.subtitle}</p>
                              </div>
                              <ul className="space-y-2 text-xs text-emerald-950 font-medium">
                                {currentPoster.sideGood?.items.map((it, iIdx) => (
                                  <li key={iIdx} className="flex items-start gap-2">
                                    <span className="text-emerald-600 font-bold">✓</span>
                                    <span>{it}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Frase Forte de Impacto Coletivo */}
                          <div className="p-3 bg-cyan-900 text-cyan-100 rounded-xl text-center text-xs font-bold leading-relaxed shadow-sm">
                            {currentPoster.actionBanner}
                          </div>

                          {/* Rodapé com Informação Prática */}
                          <div className="pt-2 border-t border-cyan-200 flex items-center justify-between text-[10px] font-bold text-cyan-900">
                            <span>📅 {currentPoster.date}</span>
                            <span>📍 {currentPoster.location}</span>
                            <span>{currentPoster.contact}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ========================================================================= */}
                    {/* CARTAZ 4: FESTIVAL ELETRÃO (LAYOUT DE EVENTO ESCOLAR) */}
                    {/* ========================================================================= */}
                    {currentPoster.layoutType === 'event_announcement' && (
                      <div className="w-full bg-slate-950 border-4 border-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col justify-between overflow-hidden relative select-none">
                        <div className="bg-gradient-to-b from-purple-950 via-slate-900 to-indigo-950 rounded-2xl p-5 sm:p-7 border border-purple-500/40 flex flex-col justify-between min-h-[620px] space-y-5">
                          {/* Cabeçalho Tech */}
                          <div className="text-center space-y-2 border-b border-purple-400/30 pb-4">
                            <span className="inline-block bg-purple-500 text-white text-[10px] uppercase tracking-widest font-black px-3.5 py-0.5 rounded-full">
                              ⚡ {currentPoster.badgeText}
                            </span>
                            <h1 className="text-xl sm:text-3xl font-black text-yellow-300 tracking-tight leading-tight uppercase font-sans">
                              {currentPoster.title}
                            </h1>
                            <p className="text-xs sm:text-sm font-medium text-slate-200 max-w-md mx-auto">
                              {currentPoster.slogan}
                            </p>
                          </div>

                          {/* O que Podes Trazer: 4 Categorias com Ícones */}
                          <div className="space-y-2 my-auto">
                            <span className="text-xs font-black text-purple-300 uppercase tracking-wider block text-center">
                              O que podes trazer de casa:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {currentPoster.acceptedItems?.map((item, itIdx) => (
                                <div key={itIdx} className="bg-white/10 p-3 rounded-xl border border-white/15 flex items-start gap-2.5">
                                  <span className="text-2xl shrink-0">{item.icon}</span>
                                  <div className="space-y-0.5 min-w-0">
                                    <h4 className="text-xs font-black text-white">{item.title}</h4>
                                    <p className="text-[10px] text-slate-300 leading-snug">{item.desc}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Caixa de Incentivo / Prémio */}
                          <div className="p-3 bg-yellow-400 text-slate-950 rounded-xl text-xs font-bold text-center shadow-md">
                            {currentPoster.rewardInfo}
                          </div>

                          {/* Rodapé Oficial com Data e Sala */}
                          <div className="pt-2 border-t border-purple-400/30 flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] font-bold text-slate-300">
                            <span>📅 {currentPoster.date}</span>
                            <span>📍 {currentPoster.location}</span>
                            <span>{currentPoster.contact}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ========================================================================= */}
                    {/* CARTAZ 5: CICLO DO PAPEL (LAYOUT INFOGRÁFICO DE PROCESSO) */}
                    {/* ========================================================================= */}
                    {currentPoster.layoutType === 'infographic_facts' && (
                      <div className="w-full bg-slate-950 border-4 border-blue-800 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl flex flex-col justify-between overflow-hidden relative select-none">
                        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-blue-200 flex flex-col justify-between min-h-[620px] space-y-5">
                          {/* Topo Educativo */}
                          <div className="text-center space-y-1.5 border-b-2 border-blue-100 pb-3">
                            <span className="inline-block bg-blue-600 text-white text-[10px] uppercase tracking-widest font-black px-3 py-0.5 rounded-full">
                              📄 {currentPoster.badgeText}
                            </span>
                            <h1 className="text-xl sm:text-2xl font-black text-blue-950 tracking-tight leading-tight uppercase font-sans">
                              {currentPoster.title}
                            </h1>
                            <p className="text-xs sm:text-sm font-semibold text-slate-600">
                              {currentPoster.slogan}
                            </p>
                          </div>

                          {/* 4 Etapas do Ciclo de Reciclagem com Setas */}
                          <div className="space-y-2 my-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                              {currentPoster.cycleSteps?.map((step, stIdx) => (
                                <div key={stIdx} className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center space-y-1">
                                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs mx-auto flex items-center justify-center">
                                    {step.num}
                                  </div>
                                  <div className="text-xs font-black text-blue-950">{step.title}</div>
                                  <div className="text-[10px] text-slate-600 leading-tight">{step.text}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 3 Números de Impacto Ecológico */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {currentPoster.impactNumbers?.map((imp, imIdx) => (
                              <div key={imIdx} className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-center">
                                <div className="text-base font-black text-emerald-800">{imp.big}</div>
                                <div className="text-[10px] font-semibold text-slate-700 leading-tight mt-0.5">{imp.desc}</div>
                              </div>
                            ))}
                          </div>

                          {/* Rodapé */}
                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-bold text-slate-500">
                            <span>📍 {currentPoster.location}</span>
                            <span>{currentPoster.contact}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ========================================================================= */}
                    {/* CARTAZ 6: OFICINA DE COMPOSTAGEM (LAYOUT WORKSHOP & INSCRIÇÃO) */}
                    {/* ========================================================================= */}
                    {currentPoster.layoutType === 'workshop_poster' && (
                      <div className="w-full bg-slate-950 border-4 border-lime-700 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl flex flex-col justify-between overflow-hidden relative select-none">
                        <div className="bg-stone-50 rounded-2xl p-5 sm:p-7 border border-lime-300 flex flex-col justify-between min-h-[620px] space-y-5">
                          {/* Topo com Selo da Horta */}
                          <div className="text-center space-y-1.5 border-b-2 border-stone-200 pb-3">
                            <span className="inline-block bg-lime-600 text-white text-[10px] uppercase tracking-widest font-black px-3.5 py-0.5 rounded-full">
                              🌱 {currentPoster.badgeText}
                            </span>
                            <h1 className="text-xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight uppercase font-sans">
                              {currentPoster.title}
                            </h1>
                            <p className="text-xs sm:text-sm font-semibold text-stone-700">
                              {currentPoster.slogan}
                            </p>
                          </div>

                          {/* O que vamos aprender: 3 cartões ilustrados */}
                          <div className="space-y-2 my-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {currentPoster.learnings?.map((lr, lIdx) => (
                                <div key={lIdx} className="bg-white border border-stone-200 rounded-xl p-3.5 text-center space-y-1.5 shadow-2xs">
                                  <div className="text-2xl">{lr.icon}</div>
                                  <div className="text-xs font-black text-stone-900">{lr.title}</div>
                                  <div className="text-[10px] text-stone-600 leading-snug">{lr.desc}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* O que trazer & Caixa de Inscrição */}
                          <div className="space-y-2">
                            <div className="p-2.5 bg-stone-200/80 rounded-xl text-[11px] font-bold text-stone-800 text-center">
                              {currentPoster.bringList}
                            </div>
                            <div className="p-3 bg-lime-600 text-white rounded-xl text-xs font-black uppercase tracking-wider text-center shadow-md">
                              📢 {currentPoster.enrollment}
                            </div>
                          </div>

                          {/* Rodapé com Horário e Horta */}
                          <div className="pt-2 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-[10px] font-bold text-stone-600 gap-1">
                            <span>📅 {currentPoster.date}</span>
                            <span>📍 {currentPoster.location}</span>
                            <span>{currentPoster.contact}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* SECÇÃO 6: CHECKLIST RÁPIDA DO DESIGNER (RADAR DOS 5 VISTOS) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    5. Checklist do Teu Cartaz Real no Canva ✅
                  </h3>
                  <p className="text-xs text-slate-500">
                    Antes de imprimires ou enviares o teu trabalho à professora, passa por estes 5 vistos:
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl shrink-0">
                {completedChecklistCount} de 5 verificados
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 1,
                  title: 'O título lê-se bem a 2 metros de distância?',
                  desc: 'Dá 3 passos para trás do ecrã do computador. Consegues ler sem esforço?',
                },
                {
                  id: 2,
                  title: 'Tem os 3 Qs essenciais (O Quê, Quando e Onde)?',
                  desc: 'Quem ler o cartaz sabe exatamente a data, a hora e o local do evento?',
                },
                {
                  id: 3,
                  title: 'O texto tem contraste forte com o fundo?',
                  desc: 'Fundo escuro com letra clara, ou fundo claro com letra bem escura.',
                },
                {
                  id: 4,
                  title: 'As imagens foram redimensionadas pelo canto sem distorcer?',
                  desc: 'Pessoas e objetos têm formas naturais e não ficaram achatados nem esticados.',
                },
                {
                  id: 5,
                  title: 'Não há erros de ortografia e o cartaz tem espaço para "respirar"?',
                  desc: 'Revê as palavras com calma e garante que há margens limpas nas bordas.',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    checklist[item.id]
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
                      checklist[item.id]
                        ? 'bg-emerald-600 text-white'
                        : 'border-2 border-slate-300 bg-white'
                    }`}
                  >
                    {checklist[item.id] && <Check className="w-4 h-4 font-black" />}
                  </div>
                  <div className="space-y-0.5">
                    <p className={`text-xs sm:text-sm font-bold ${
                      checklist[item.id] ? 'text-emerald-950 line-through' : 'text-slate-900'
                    }`}>
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {completedChecklistCount === 5 && (
              <div className="p-4 bg-emerald-100/70 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-900">
                <span className="text-2xl">🎉</span>
                <p className="text-xs sm:text-sm font-bold">
                  Parabéns! O teu cartaz cumpre todos os requisitos de um trabalho nota 10 em TIC!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 CONTEÚDO 2: APRESENTAÇÕES NO POWERPOINT (OUTLOOK / MICROSOFT 365) */}
      {/* ========================================================================= */}
      {activeCategory === 'presentations' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* HEADER DA ATIVIDADE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20 text-2xl">
                📽️
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black text-orange-600 tracking-wider bg-orange-50 px-2.5 py-0.5 rounded-md">
                    Guia Prático • Módulo 2
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-bold text-slate-500">PowerPoint no Outlook / Microsoft 365</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Apresentações: Criar Diapositivos no PowerPoint 📊✨
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Aprende o segredo dos 9 pontinhos do Outlook, a Regra 6x6 e como brilhar a apresentar em frente à turma!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-center">
                <span className="text-[10px] font-black uppercase text-amber-800 block">Recompensa</span>
                <span className="text-sm font-black text-amber-950">+50 XP no Laboratório</span>
              </div>
            </div>
          </div>

          {/* SECÇÃO 1: O QUE É UMA APRESENTAÇÃO E QUAL O SEU VERDADEIRO OBJETIVO? */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 text-orange-600">
              <Presentation className="w-6 h-6" />
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                1. O Que é uma Apresentação no PowerPoint e Para Que Serve? 🎯
              </h3>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              Um diapositivo (slide) no PowerPoint é uma tela projetada na parede da sala de aula para apoiar a tua apresentação. Mas atenção ao maior segredo de todos:
            </p>

            {/* DESTAQUE PRINCIPAL */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 space-y-2">
              <div className="flex items-center gap-2 text-orange-800 font-black text-sm uppercase">
                <span>💡</span>
                <span>A Regra de Ouro n.º 1 do Apresentador</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold">
                O PowerPoint <strong className="text-orange-950 underline">NÃO é uma cábula gigante</strong> para leres palavra por palavra de costas para a turma! Ele serve para os teus colegas verem fotos, gráficos e palavras-chave enquanto <strong className="text-orange-950">TU</strong> falas e explicas o tema virado para a sala.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-2xl">🗣️</div>
                <h4 className="text-xs font-black uppercase text-slate-900 tracking-wide">
                  O Orador És Tu!
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Os teus colegas e o professor vieram ouvir a tua voz e aprender com o teu trabalho. O diapositivo é apenas o teu ajudante.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-2xl">👁️</div>
                <h4 className="text-xs font-black uppercase text-slate-900 tracking-wide">
                  Apoio Visual Imediato
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Uma imagem do planeta Marte ou o mapa de um castelo ajuda a turma a perceber tudo muito mais depressa do que um texto comprido.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-2xl">⏱️</div>
                <h4 className="text-xs font-black uppercase text-slate-900 tracking-wide">
                  Ritmo & Concentração
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Passar de slide de 1 em 1 minuto mantém a atenção da turma acordada e cheia de curiosidade para saber o que vem a seguir.
                </p>
              </div>
            </div>
          </div>

          {/* SECÇÃO 2: COMO ENTRAR NO POWERPOINT DO OUTLOOK (MICROSOFT 365) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 text-indigo-600">
              <Monitor className="w-6 h-6" />
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                2. Como Abrir o PowerPoint a partir do Outlook Escolar (Microsoft 365) 🌐
              </h3>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Na escola, todos os alunos têm acesso ao Microsoft 365 através do email institucional. Podes criar as tuas apresentações diretamente no navegador sem precisar de instalar nada!
            </p>

            {/* OS 5 PASSOS DO OUTLOOK */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                  1
                </div>
                <h4 className="text-xs font-black text-indigo-950 uppercase">Abre o Outlook</h4>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  Entra no teu email escolar no computador ou tablet com o teu login e palavra-passe da escola.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                  2
                </div>
                <h4 className="text-xs font-black text-indigo-950 uppercase">Os 9 Pontinhos</h4>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  No canto superior esquerdo (ao lado de Outlook), clica no quadrado com <strong>9 pontinhos</strong> (o <em>"Waffle"</em>).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                  3
                </div>
                <h4 className="text-xs font-black text-indigo-950 uppercase">Escolhe o PowerPoint</h4>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  Clica no ícone laranja com a letra <strong>P</strong>. Abre-se o PowerPoint Online no teu ecrã!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                  4
                </div>
                <h4 className="text-xs font-black text-indigo-950 uppercase">Nova Apresentação</h4>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  Clica em <strong>"Nova apresentação em branco"</strong> para começares com um tema limpo e arrumado.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                  5
                </div>
                <h4 className="text-xs font-black text-indigo-950 uppercase">Dá Nome ao Ficheiro</h4>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  Clica no título no cimo e dá o nome do teu trabalho. Fica <strong>gravado automaticamente</strong> no OneDrive!
                </p>
              </div>
            </div>
          </div>

          {/* SECÇÃO 3: A REGRA 6X6 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 text-emerald-600">
              <Layout className="w-6 h-6" />
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                3. A Famosa "Regra 6x6" do PowerPoint 📏
              </h3>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Todos os grandes apresentadores do mundo usam esta fórmula para não aborrecerem o público:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-300 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-black text-xs uppercase">
                  <Check className="w-4 h-4 font-black text-emerald-600" />
                  <span>No Máximo 6 Tópicos</span>
                </div>
                <p className="text-xs text-emerald-950 leading-relaxed">
                  Nunca coloques mais de <strong>4 a 6 linhas</strong> com marcadores num único slide. Dá espaço para o olhar descansar!
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-300 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-black text-xs uppercase">
                  <Check className="w-4 h-4 font-black text-emerald-600" />
                  <span>No Máximo 6 a 7 Palavras por Linha</span>
                </div>
                <p className="text-xs text-emerald-950 leading-relaxed">
                  Usa palavras-chave e ideias curtas. As frases compridas e os detalhes dizes <strong>TU</strong> a falar para a sala!
                </p>
              </div>
            </div>

            {/* COMPARAÇÃO VISUAL: BOM VS MAU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                <span className="text-xs font-black uppercase text-rose-800 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>✗ Slide Testamento (O Que NÃO Fazer)</span>
                </span>
                <div className="p-3 bg-white rounded-xl border border-rose-200 text-[10px] text-slate-400 space-y-1 font-mono">
                  <p className="font-bold text-slate-500">Planeta Marte</p>
                  <p>Marte é o quarto planeta a partir do Sol e o segundo menor do Sistema Solar, maior apenas do que Mercúrio. Recebeu o seu nome em homenagem ao deus romano da guerra e é frequentemente descrito como o Planeta Vermelho devido ao óxido de ferro na sua superfície rochosa...</p>
                </div>
                <p className="text-[11px] text-rose-700 italic">
                  A turma cansa-se a tentar ler, a letra fica minúscula e ninguém presta atenção a quem fala!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <span className="text-xs font-black uppercase text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>✓ Slide com a Regra 6x6 (Perfeito!)</span>
                </span>
                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-slate-800 space-y-1">
                  <p className="font-black text-indigo-700">Planeta Marte: O Planeta Vermelho</p>
                  <ul className="list-disc pl-4 text-[11px] space-y-0.5 text-slate-700">
                    <li>4.º planeta a contar do Sol</li>
                    <li>Cor avermelhada (óxido de ferro)</li>
                    <li>Maior montanha do Sistema Solar</li>
                    <li>Robôs procuram vestígios de água</li>
                  </ul>
                </div>
                <p className="text-[11px] text-emerald-700 italic">
                  Letra grande, leitura em 5 segundos e a turma fica com os olhos postos em ti!
                </p>
              </div>
            </div>
          </div>

          {/* SECÇÃO 4: O ESQUELETO DA APRESENTAÇÃO ESCOLAR */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 text-purple-600">
              <Layers className="w-6 h-6" />
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                4. O Esqueleto Perfeito de uma Apresentação Escolar (4 a 6 Slides) 뼈
              </h3>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Sempre que o professor te pedir um trabalho de grupo ou individual em TIC, Ciências ou História, organiza os slides por esta ordem:
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
                <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                  S1
                </span>
                <div>
                  <h4 className="text-xs font-black uppercase text-purple-950">Slide 1: A Capa (O Cartão de Visita)</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Título grande e chamativo, nome dos alunos que fizeram o trabalho, número, turma, disciplina e data.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
                <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                  S2
                </span>
                <div>
                  <h4 className="text-xs font-black uppercase text-purple-950">Slide 2: A Agenda / De que vamos falar?</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    3 ou 4 tópicos curtos que mostram o caminho da apresentação. Dá segurança à turma e ao professor!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
                <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                  S3-4
                </span>
                <div>
                  <h4 className="text-xs font-black uppercase text-purple-950">Slides 3 e 4: O Desenvolvimento (1 Ideia por Diapositivo!)</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Nunca mistures assuntos diferentes. À esquerda colocas 3 tópicos; à direita colocas uma foto grande e nítida.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
                <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                  S5
                </span>
                <div>
                  <h4 className="text-xs font-black uppercase text-purple-950">Slide 5: Conclusão & O Que Aprendemos</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    2 a 3 ideias finais que resumem as grandes descobertas que a tua equipa fez durante a pesquisa.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
                <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                  S6
                </span>
                <div>
                  <h4 className="text-xs font-black uppercase text-purple-950">Slide 6: Fontes & Agradecimento</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Onde encontraste a informação (livro da escola, site seguro) e a frase final: <em>"Obrigado pela vossa atenção! Têm alguma pergunta?"</em>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECÇÃO 5: TRANSIÇÕES E ANIMAÇÕES */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 text-pink-600">
              <Play className="w-6 h-6" />
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                5. Transições e Animações: O Perigo das "Piruetas Loucas" 🎭
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <h4 className="text-xs font-black uppercase text-indigo-700 tracking-wide">
                  O que é uma Transição?
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  É a passagem do Slide 1 para o Slide 2.
                  <br />
                  <span className="text-emerald-700 font-bold">✓ O segredo dos mestres:</span> Escolhe a transição <strong>"Desvanecer"</strong> ou <strong>"Empurrar"</strong> e clica em <strong>"Aplicar a todos"</strong>. Fica suave e elegante!
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <h4 className="text-xs font-black uppercase text-pink-700 tracking-wide">
                  O que é uma Animação?
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  É fazer um tópico ou uma foto entrar no ecrã com um clique.
                  <br />
                  <span className="text-emerald-700 font-bold">✓ O segredo dos mestres:</span> Usa apenas o efeito <strong>"Aparecer"</strong> para os tópicos surgirem à medida que vais falando.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-xs font-black uppercase text-rose-900">
                  ⚠️ Cuidado com o Efeito "Circo Digital"
                </h5>
                <p className="text-xs text-rose-950 leading-relaxed">
                  Muitos alunos acham divertido colocar letras a dar cambalhotas, a cair do teto ou com sons de buzina e laser. Mas na sala de aula isso distrai toda a gente, irrita os professores e transmite falta de seriedade. <strong>No PowerPoint, menos efeitos significam mais nota!</strong>
                </p>
              </div>
            </div>
          </div>

          {/* SECÇÃO 6: OS 4 ERROS FATAIS */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 text-rose-600">
              <XCircle className="w-6 h-6" />
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                6. Os 4 Erros Mais Graves na Apresentação Oral em Aula 🚫
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                <h5 className="text-xs font-black text-rose-800 uppercase">
                  1. Falar de costas para a turma
                </h5>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Virar as costas para ler a parede faz com que a tua voz não chegue aos colegas e parece que não estudaste a matéria!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                <h5 className="text-xs font-black text-rose-800 uppercase">
                  2. Letras escuras em fundo escuro
                </h5>
                <p className="text-xs text-slate-700 leading-relaxed">
                  No ecrã do teu computador pode parecer visível, mas no projetor da sala de aula a imagem fica mais clara e o texto desaparece!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                <h5 className="text-xs font-black text-rose-800 uppercase">
                  3. Esticar imagens pelos lados
                </h5>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Puxar uma foto pela barra lateral achata os planetas e deforma os animais. Puxa sempre pelas bolinhas dos cantos!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                <h5 className="text-xs font-black text-rose-800 uppercase">
                  4. Falar a correr sem respirar
                </h5>
                <p className="text-xs text-slate-700 leading-relaxed">
                  O nervosismo faz-nos falar rápido demais. Respira fundo, faz uma pausa de 2 segundos entre cada diapositivo e sorri!
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECÇÃO 7: LABORATÓRIO INTERATIVO — "SIMULADOR DO PROJETOR DE SALA" */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 bg-orange-400 text-slate-950 px-3 py-0.5 rounded-full text-[10px] font-black uppercase">
                  <span>🎮 Laboratório Interativo</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Simulador do Projetor da Sala de Aula 📽️🏫
                </h3>
                <p className="text-xs text-slate-300">
                  Constrói a tua apresentação de 4 slides, testa a reação da turma e recebe o teu certificado de Apresentador Campeão!
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/10 shrink-0">
                <Award className="w-6 h-6 text-yellow-300" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-300 block">Nota Oral & Slides</span>
                  <span className="text-lg font-black text-yellow-300">{currentPptScore} / 100</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* PAINEL DE CONTROLO DO APRESENTADOR (ESQUERDA) */}
              <div className="lg:col-span-6 space-y-5">
                {/* 1. Escolha de Tema */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300">
                    1. Escolhe o Tema do Trabalho:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(pptThemes) as Array<keyof typeof pptThemes>).map((key) => (
                      <button
                        key={key}
                        onClick={() => {
                          setPptTopic(key);
                          setActiveSlide(0);
                        }}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-2 border ${
                          pptTopic === key
                            ? 'bg-orange-600 text-white border-orange-400 shadow-xs'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <span>{pptThemes[key].icon}</span>
                        <span className="truncate">{pptThemes[key].name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Navegador de Diapositivos (Slide 1 a 4) */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center justify-between">
                    <span>2. Diapositivo a Projetar:</span>
                    <span className="text-xs text-orange-400 font-bold">Slide {activeSlide + 1} de 4</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Capa (Título)', 'Agenda', 'Conteúdo', 'Conclusão'].map((label, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSlide(idx)}
                        className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                          activeSlide === idx
                            ? 'bg-indigo-600 text-white border-indigo-400 ring-2 ring-indigo-300'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <span className="block text-[10px] opacity-75">S{idx + 1}</span>
                        <span className="truncate block">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Estilo de Conteúdo dos Slides */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300">
                    3. Quantidade de Texto no Slide (Regra 6x6):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPptSlideStyle('ideal_6x6')}
                      className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                        pptSlideStyle === 'ideal_6x6'
                          ? 'bg-emerald-600 text-white border-emerald-400'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      Regra 6x6 (Ideal 🟢)
                    </button>
                    <button
                      onClick={() => setPptSlideStyle('too_much_text')}
                      className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                        pptSlideStyle === 'too_much_text'
                          ? 'bg-rose-600 text-white border-rose-400'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      Testamento Copiado (🔴)
                    </button>
                    <button
                      onClick={() => setPptSlideStyle('empty_no_data')}
                      className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                        pptSlideStyle === 'empty_no_data'
                          ? 'bg-amber-600 text-white border-amber-400'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      Vazio / Sem Dados (🟡)
                    </button>
                  </div>
                </div>

                {/* 4. Transição */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300">
                    4. Efeito de Transição entre Diapositivos:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPptTransition('smooth')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                        pptTransition === 'smooth'
                          ? 'bg-emerald-600 text-white border-emerald-400'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      Suave: Desvanecer (🟢)
                    </button>
                    <button
                      onClick={() => setPptTransition('crazy_distraction')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                        pptTransition === 'crazy_distraction'
                          ? 'bg-rose-600 text-white border-rose-400'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      Piruetas com Lasers (🔴)
                    </button>
                  </div>
                </div>

                {/* 5. Comportamento do Apresentador */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300">
                    5. Postura do Aluno a Apresentar:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => setPptSpeakerBehavior('confident_audience')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                        pptSpeakerBehavior === 'confident_audience'
                          ? 'bg-emerald-600 text-white border-emerald-400'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      👀 Olhar para a turma e falar com calma (🟢)
                    </button>
                    <button
                      onClick={() => setPptSpeakerBehavior('back_turned_reading')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                        pptSpeakerBehavior === 'back_turned_reading'
                          ? 'bg-rose-600 text-white border-rose-400'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      🤦 De costas para a turma a ler o ecrã (🔴)
                    </button>
                  </div>
                </div>
              </div>

              {/* TELA DE PROJEÇÃO DA SALA DE AULA (DIREITA) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-orange-400" />
                    <span>Projetor da Sala de Aula (Em Direto)</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveSlide((prev) => Math.max(0, prev - 1))}
                      disabled={activeSlide === 0}
                      className="p-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] font-mono px-2">
                      {activeSlide + 1} / 4
                    </span>
                    <button
                      onClick={() => setActiveSlide((prev) => Math.min(3, prev + 1))}
                      disabled={activeSlide === 3}
                      className="p-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ECRÃ DE PROJEÇÃO DA SALA (16:9 FORMAT) */}
                <div className="w-full aspect-[16/9] rounded-2xl border-4 border-slate-700 bg-white shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden relative text-slate-900 select-none">
                  {/* Slide Content rendering */}
                  {activeSlideData.type === 'cover' && (
                    <div className="my-auto text-center space-y-3">
                      <span className="inline-block text-3xl sm:text-4xl mb-1">{currentPptTheme.icon}</span>
                      <h1 className="text-lg sm:text-2xl font-black text-indigo-950 tracking-tight leading-snug">
                        {activeSlideData.title}
                      </h1>
                      <p className="text-xs sm:text-sm font-bold text-slate-600">
                        {activeSlideData.subtitle}
                      </p>
                      <div className="pt-2 text-[10px] text-slate-500 font-medium">
                        <p>{activeSlideData.author}</p>
                        <p>{activeSlideData.date}</p>
                      </div>
                    </div>
                  )}

                  {activeSlideData.type !== 'cover' && (
                    <div className="space-y-4 my-auto">
                      <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                        <h2 className="text-sm sm:text-base font-black text-indigo-950">
                          {activeSlideData.title}
                        </h2>
                        <span className="text-base">{currentPptTheme.icon}</span>
                      </div>

                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className={`${activeSlideData.image ? 'col-span-8' : 'col-span-12'}`}>
                          {pptSlideStyle === 'ideal_6x6' && (
                            <ul className="space-y-1.5 text-xs text-slate-800">
                              {activeSlideData.bulletsIdeal?.map((b, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-orange-600 font-black">•</span>
                                  <span className="font-semibold leading-relaxed">{b}</span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {pptSlideStyle === 'too_much_text' && (
                            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[9px] text-slate-600 leading-relaxed max-h-28 overflow-y-auto">
                              <p className="font-mono">{activeSlideData.bulletsOverloaded?.[0]}</p>
                            </div>
                          )}

                          {pptSlideStyle === 'empty_no_data' && (
                            <div className="p-4 border border-dashed border-amber-300 rounded-xl text-center text-[10px] text-amber-700">
                              ⚠️ Slide quase vazio. Falta informação essencial para apoiar a explicação!
                            </div>
                          )}
                        </div>

                        {activeSlideData.image && (
                          <div className="col-span-4 text-center">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-3xl sm:text-4xl shadow-inner">
                              {activeSlideData.image}
                            </div>
                            <span className="text-[9px] text-slate-400 font-medium block mt-1">Figura ilustrativa</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rodapé do Slide */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[9px] text-slate-400 font-medium">
                    <span>PowerPoint Online • {currentPptTheme.name}</span>
                    <span>Diapositivo {activeSlide + 1}</span>
                  </div>

                  {/* Silhueta do Apresentador em frente à turma */}
                  <div className="absolute bottom-1 right-6 pointer-events-none">
                    {pptSpeakerBehavior === 'confident_audience' ? (
                      <div className="flex items-center gap-1.5 bg-emerald-100/90 border border-emerald-300 text-emerald-900 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <Users className="w-3 h-3 text-emerald-600" />
                        <span>A olhar para a turma 👀</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-rose-100/90 border border-rose-300 text-rose-900 px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse">
                        <span>🤦 De costas a ler o ecrã</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* AVALIAÇÃO DA APRESENTAÇÃO */}
                <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      Diagnóstico da Apresentação Oral
                    </span>
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                      currentPptScore >= 80 ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-400 text-amber-950'
                    }`}>
                      {currentPptScore === 100 ? '🌟 Apresentador Nota 10!' : currentPptScore >= 70 ? '👍 Bom Desempenho' : '⚠️ Precisa de Treino'}
                    </span>
                  </div>

                  <ul className="text-xs space-y-1 text-slate-200">
                    <li className="flex items-center gap-2">
                      {pptSlideStyle === 'ideal_6x6' ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span>Regra 6x6: {pptSlideStyle === 'ideal_6x6' ? 'Tópicos limpos e fáceis de ler.' : 'Texto em excesso que cansa a vista da turma.'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      {pptTransition === 'smooth' ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span>Transição: {pptTransition === 'smooth' ? 'Passagem suave e profissional.' : 'Efeitos malucos que tiram a atenção do assunto.'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      {pptSpeakerBehavior === 'confident_audience' ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span>Postura: {pptSpeakerBehavior === 'confident_audience' ? 'Excelente contacto visual com a sala.' : 'A ler de costas sem olhar para os colegas.'}</span>
                    </li>
                  </ul>

                  <button
                    onClick={handleTestPpt}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Validar a Minha Apresentação (+50 XP)</span>
                  </button>

                  {pptSubmitted && (
                    <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs text-emerald-200 animate-in fade-in space-y-1">
                      <p className="font-bold">🎉 Fantástico! Praticaste a postura e o design no PowerPoint!</p>
                      <p className="text-[11px] text-emerald-300">
                        {currentPptScore >= 80
                          ? 'A tua apresentação tem clareza, respeito pelo público e merece nota máxima na aula de TIC!'
                          : 'Lembra-te: aplica a Regra 6x6 e mantém sempre o contacto visual com a turma para chegares aos 100 pontos!'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECÇÃO 8: CHECKLIST DO APRESENTADOR NOTA 10 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    7. Checklist do Apresentador Nota 10 (Radar dos 5 Vistos) ✅
                  </h3>
                  <p className="text-xs text-slate-500">
                    Passa por estes 5 pontos no PowerPoint antes do dia da apresentação oral:
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl shrink-0">
                {completedPptChecklistCount} de 5 verificados
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 1,
                  title: 'A capa tem o título, os nomes do grupo, turma e disciplina?',
                  desc: 'Quem está a assistir precisa de saber quem são os autores e o tema do trabalho.',
                },
                {
                  id: 2,
                  title: 'Os diapositivos cumprem a Regra 6x6 (sem parágrafos gigantes)?',
                  desc: 'No máximo 6 tópicos curtos por slide, com palavras-chave que tu explicas a falar.',
                },
                {
                  id: 3,
                  title: 'O contraste entre as letras e o fundo é forte?',
                  desc: 'Fundo claro com letras escuras, para que todos no fundo da sala consigam ler.',
                },
                {
                  id: 4,
                  title: 'As transições e animações são discretas (sem barulhos nem piruetas)?',
                  desc: 'Efeito suave (Desvanecer) aplicado a todos os diapositivos.',
                },
                {
                  id: 5,
                  title: 'Treinei a apresentação em voz alta olhando para a frente?',
                  desc: 'Praticar uma vez antes em casa ou na biblioteca dá-te toda a calma e confiança!',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => togglePptChecklist(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    pptChecklist[item.id]
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
                      pptChecklist[item.id]
                        ? 'bg-emerald-600 text-white'
                        : 'border-2 border-slate-300 bg-white'
                    }`}
                  >
                    {pptChecklist[item.id] && <Check className="w-4 h-4 font-black" />}
                  </div>
                  <div className="space-y-0.5">
                    <p className={`text-xs sm:text-sm font-bold ${
                      pptChecklist[item.id] ? 'text-emerald-950 line-through' : 'text-slate-900'
                    }`}>
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {completedPptChecklistCount === 5 && (
              <div className="p-4 bg-emerald-100/70 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-900">
                <span className="text-2xl">🎉</span>
                <p className="text-xs sm:text-sm font-bold">
                  Parabéns! Estás 100% preparado para arrasar na tua apresentação escolar!
                </p>
              </div>
            )}
          </div>

          {/* SECÇÃO 9: DESAFIO PRÁTICO REAL NO OUTLOOK / POWERPOINT */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 text-orange-700">
              <Sparkles className="w-6 h-6" />
              <h3 className="text-lg font-black text-slate-900">
                8. O Teu Desafio Prático no PowerPoint do Outlook! 🚀
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Agora abre o teu <strong>Outlook escolar</strong>, clica nos 9 pontinhos, escolhe o <strong>PowerPoint</strong> e cria a tua primeira apresentação de 4 slides sobre um tema que adores:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-white rounded-xl border border-orange-200 text-xs font-bold text-slate-800 shadow-xs">
                🪐 Curiosidades do Espaço
              </div>
              <div className="p-3 bg-white rounded-xl border border-orange-200 text-xs font-bold text-slate-800 shadow-xs">
                🏰 Um Castelo de Portugal
              </div>
              <div className="p-3 bg-white rounded-xl border border-orange-200 text-xs font-bold text-slate-800 shadow-xs">
                🤖 O Meu Robô de Sonho
              </div>
              <div className="p-3 bg-white rounded-xl border border-orange-200 text-xs font-bold text-slate-800 shadow-xs">
                🐾 Animais em Vias de Extinção
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 font-medium">
                Partilha o link do trabalho no OneDrive com o teu colega de grupo para trabalharem juntos em tempo real!
              </p>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('worlds')}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <span>Voltar aos Mundos TIC</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
