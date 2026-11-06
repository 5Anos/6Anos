import React, { useState } from 'react';
import {
  Palette,
  Layout,
  BookOpen,
  Eye,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Check,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';

interface CanvaPostersModuleProps {
  onNavigateTab?: (tab: string) => void;
}

export const CanvaPostersModule: React.FC<CanvaPostersModuleProps> = ({ onNavigateTab }) => {
  // Sub-separadores da Oficina (Navegação estruturada para crianças de 10 anos)
  const [activeSubTab, setActiveSubTab] = useState<'intro' | 'rules' | 'tutorial' | 'examples' | 'checklist'>('examples');

  // Estado dos Exemplos de Cartazes Escolares
  const [schoolPosterId, setSchoolPosterId] = useState<string>('onde_colocar');

  // Estado da Checklist
  const [checklist, setChecklist] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });

  const toggleChecklist = (id: number) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;

  // -------------------------------------------------------------
  // OS 6 CARTAZES ESCOLARES ORIGINAIS (EXATAMENTE COMO NAS IMAGENS)
  // -------------------------------------------------------------
  const schoolPosters = [
    {
      id: 'onde_colocar',
      category: 'ecopontos',
      icon: '♻️',
      sidebarTag: 'GUIA VISUAL DOS ECOPONTOS',
      sidebarTitle: 'ONDE DEVO COLOCAR?',
      sidebarDesc: 'Guia Oficial de Separação de Resíduos na Escola',
      headerRight: 'Guia Visual dos Ecopontos',
    },
    {
      id: 'pilhao',
      category: 'pilhao',
      icon: '🔋',
      sidebarTag: 'ALERTA PILHÃO',
      sidebarTitle: 'PERIGO: PILHAS NO LIXO COMUM!',
      sidebarDesc: 'Uma única pilha contém metais pesados tóxicos...',
      headerRight: 'Alerta Pilhão',
    },
    {
      id: 'plastico_zero',
      category: 'plastico',
      icon: '🌊',
      sidebarTag: 'CAMPANHA PLÁSTICO ZERO',
      sidebarTitle: 'O TEU LANCHE PROTEGE O MAR?',
      sidebarDesc: 'Faz a escolha certa no recreio escolar e diz adeus...',
      headerRight: 'Campanha Plástico Zero',
    },
    {
      id: 'e_lixo',
      category: 'eletronicos',
      icon: '💻',
      sidebarTag: 'CAMPANHA ELETRÃO / E-LIXO',
      sidebarTitle: 'FESTIVAL DO REEE & ELETRÓNICOS',
      sidebarDesc: 'Aparelhos elétricos e cabos avariados não vão par...',
      headerRight: 'Campanha Eletrão / E-Lixo',
    },
    {
      id: 'papel_arvores',
      category: 'ecopontos',
      icon: '♻️',
      sidebarTag: 'INFOGRAFIA PAPEL & ÁRVORES',
      sidebarTitle: 'O QUE ACONTECE QUANDO RECICLAS O ...',
      sidebarDesc: 'Descobre a viagem incrível de uma folha de...',
      headerRight: 'Infografia Papel & Árvores',
    },
    {
      id: 'compostagem',
      category: 'plastico',
      icon: '🌊',
      sidebarTag: 'OFICINA DE COMPOSTAGEM',
      sidebarTitle: 'OFICINA: DA CASCA AO ADUBO!',
      sidebarDesc: 'Vem aprender a transformar as sobras de fruta do...',
      headerRight: 'Oficina de Compostagem',
    },
  ];

  const activePoster = schoolPosters.find((p) => p.id === schoolPosterId) || schoolPosters[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER DO MÓDULO */}
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
              Oficina de Cartazes no Canva 🖌️
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Descobre como criar cartazes apelativos para a escola! Explora cada separador e aprende, passo a passo, a dar vida às tuas ideias.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-center">
            <span className="text-[10px] font-black uppercase text-emerald-800 block">Exemplos Reais</span>
            <span className="text-sm font-black text-emerald-950">6 Exemplos Escolares ♻️</span>
          </div>
        </div>
      </div>

      {/* BARRA DE SUB-SEPARADORES: NAVEGAÇÃO CLARA E FOCADA (PARA ALUNOS DE 10 ANOS) */}
      <div className="bg-slate-900 border border-slate-800 p-2 sm:p-2.5 rounded-3xl shadow-lg">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {[
            { id: 'intro', label: '1. O Que é?', icon: '📖', badge: 'Conceito' },
            { id: 'rules', label: '2. Regras de Ouro', icon: '🏆', badge: '5 Regras & Erros' },
            { id: 'tutorial', label: '3. No Canva', icon: '🖌️', badge: 'Passo a Passo' },
            { id: 'examples', label: '4. Exemplos de Cartazes', icon: '🖼️', badge: '6 Cartazes Reais' },
            { id: 'checklist', label: '5. Checklist', icon: '✅', badge: 'Radar de Vistos' },
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3 py-2.5 sm:py-3 rounded-2xl font-black text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer text-center ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400 scale-[1.02]'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base">{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                </div>
                <span className={`text-[9px] uppercase tracking-wider font-bold ${
                  isActive ? 'text-blue-100' : 'text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEPARADOR 1: O QUE É UM CARTAZ?                                          */}
      {/* ========================================================================= */}
      {activeSubTab === 'intro' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3 text-blue-600">
                <BookOpen className="w-6 h-6" />
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    1. O Que é um Cartaz e Qual é o Seu Super-Poder? 🦸‍♂️
                  </h3>
                  <p className="text-xs text-slate-500">
                    Aprende a captar a atenção num instante no corredor da escola
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-black">
                Capítulo 1 de 5
              </span>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              Um cartaz é um <strong>grito visual</strong>! É uma mensagem rápida feita para chamar a atenção de alguém que vai a caminhar pelo corredor da escola ou pela rua.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                  ⏱️
                </div>
                <h4 className="text-sm font-black text-slate-900">A Regra dos 3 Segundos</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Se uma pessoa não perceber o tema nos primeiros <strong>3 segundos</strong> enquanto passa a andar, o cartaz falhou o objetivo!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-sm">
                  🎯
                </div>
                <h4 className="text-sm font-black text-slate-900">Uma Ideia Principal</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Nunca tentes dizer 10 coisas ao mesmo tempo. Escolhe <strong>uma única mensagem forte</strong> (ex.: "Separa o plástico").
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                  ❤️
                </div>
                <h4 className="text-sm font-black text-slate-900">Despertar Emoção</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Um bom cartaz faz rir, surpreende, assusta ligeiramente ou faz pensar. Imagens com sentimento gravam-se na memória!
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                ANATOMIA DE UM CARTAZ ESCOLAR CAMPEÃO:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <strong className="text-yellow-400 block mb-1">1. Título Impactante</strong>
                  <span>Letras gigantes, poucas palavras, lê-se a 2 metros.</span>
                </div>
                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <strong className="text-cyan-400 block mb-1">2. Imagem Central</strong>
                  <span>Uma foto ou ilustração que fala por si sem confusão.</span>
                </div>
                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <strong className="text-emerald-400 block mb-1">3. Os 3 Qs</strong>
                  <span>O Quê, Quando e Onde (data, hora e local do evento).</span>
                </div>
                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <strong className="text-pink-400 block mb-1">4. Chamada à Ação</strong>
                  <span>O que o leitor deve fazer (ex.: "Deposita no Pilhão").</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveSubTab('rules')}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-3 rounded-2xl transition-all cursor-pointer shadow-md"
              >
                <span>Seguinte: 2. Regras de Ouro</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEPARADOR 2: REGRAS DE OURO & ERROS                                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'rules' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3 text-indigo-600">
                <Layout className="w-6 h-6" />
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    2. As 5 Regras de Ouro de um Cartaz Campeão 🏆
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hierarquia visual: o que o olho humano deve ler primeiro, segundo e terceiro
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-black">
                Capítulo 2 de 5
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase tracking-wide">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">1</span>
                  <span>O Título Gigante (3 a 5 palavras)</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Deve ser a maior letra de todo o cartaz. Usa palavras fortes que criem curiosidade!
                  <br />
                  <span className="text-emerald-700 font-bold">✓ Exemplo:</span> <em>"FEIRA DO LIVRO MÁGICA"</em>
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase tracking-wide">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">2</span>
                  <span>Os 3 Qs Essenciais (A Mensagem)</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Todo o cartaz precisa de responder claramente:
                  <br />
                  • <strong>O QUÊ?</strong> (o evento) • <strong>QUANDO?</strong> (data/horas) • <strong>ONDE?</strong> (local exato).
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase tracking-wide">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">3</span>
                  <span>Uma Imagem Forte Vale Mais Que Dez</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Escolhe <strong>uma única ilustração ou foto marcante</strong> que ocupe o centro. Espalhar 15 autocolantes pequenos gera ruído visual!
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase tracking-wide">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">4</span>
                  <span>A Regra do Contraste e das 3 Cores</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  • <strong>Fundo escuro</strong> pede letras claras (branco ou amarelo).
                  <br />
                  • <strong>Fundo claro</strong> pede letras escuras (azul-escuro ou preto).
                </p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
              <span className="text-2xl shrink-0">🌿</span>
              <div className="space-y-1">
                <h5 className="text-xs font-black uppercase tracking-wide text-emerald-900">
                  Regra 5: O Cartaz Precisa de "Respirar" (Espaço em Branco)
                </h5>
                <p className="text-xs text-emerald-950 leading-relaxed">
                  Não tenhas medo de deixar margens e espaços vazios! Os espaços limpos afastados dos limites da folha ajudam o cérebro a ler sem cansaço e dão um aspeto limpo e profissional.
                </p>
              </div>
            </div>
          </div>

          {/* OS 4 ERROS */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  O Que NUNCA Fazer num Cartaz (Os 4 Erros Típicos) 🚫
                </h3>
                <p className="text-xs text-slate-500">
                  Erros comuns que deves evitar na aula de TIC
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                <div className="flex items-center gap-2 text-rose-700 font-black text-xs uppercase">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>Erro 1: Usar 8 tipos de letra diferentes</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  O cartaz parece uma colagem anónima de jornal! Usa apenas <strong>duas fontes</strong> em todo o trabalho.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                <div className="flex items-center gap-2 text-rose-700 font-black text-xs uppercase">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>Erro 2: Texto colado aos limites da folha</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Ao imprimir na impressora da escola ou ao cortar, as letras nas bordas podem desaparecer. Deixa margem de segurança à volta.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                <div className="flex items-center gap-2 text-rose-700 font-black text-xs uppercase">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>Erro 3: Parágrafos enormes de redação</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Ninguém para no corredor a ler um bloco com 20 linhas. Usa tópicos curtos, números ou frases diretas.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                <div className="flex items-center gap-2 text-rose-700 font-black text-xs uppercase">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>Erro 4: Letras claras em fundo claro</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Amarelo sobre branco, ou cinzento sobre azul bebé. Testa se consegues ler dando três passos para trás do ecrã!
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveSubTab('intro')}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior: O Que é um Cartaz</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('tutorial')}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-3 rounded-2xl transition-all cursor-pointer shadow-md"
              >
                <span>Seguinte: 3. No Canva</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEPARADOR 3: PASSO A PASSO NO CANVA                                       */}
      {/* ========================================================================= */}
      {activeSubTab === 'tutorial' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3 text-cyan-600">
                <Sliders className="w-6 h-6" />
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    3. Como Fazer o Teu Cartaz no Canva Passo a Passo 🖌️
                  </h3>
                  <p className="text-xs text-slate-500">
                    O guia prático para abrires o Canva e começares a criar
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full text-xs font-black">
                Capítulo 3 de 5
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-50/80 border border-cyan-200 text-xs text-cyan-950 font-medium flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-cyan-700 shrink-0" />
              <span>
                <strong>Dica de Segurança TIC:</strong> Usa o Canva sempre com a tua conta escolar. Nunca coloques fotos pessoais tuas, a tua morada nem o teu contacto num cartaz público!
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm shrink-0">
                  1
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900">
                    Começar: Escolher o Modelo "Cartaz" (Poster A3 / A4)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Depois de entrares no Canva, clica no botão roxo <strong>"Criar um design"</strong> (no canto superior direito) e escreve <strong>"Cartaz"</strong>. Escolhe o formato vertical A3 (o tamanho ideal para cartazes escolares e exposições de parede) ou A4.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm shrink-0">
                  2
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900">
                    O Fundo: Cor Sólida ou Fotografia Limpa
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Clica na folha em branco e escolhe uma cor de fundo no quadrado colorido no topo.
                    <br />
                    <span className="text-blue-700 font-bold">Truque Pro:</span> Evita fundos cheios de manchas ou padrões muito detalhados, porque tornam as letras difíceis de ler.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-sm shrink-0">
                  3
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900">
                    Texto: Adicionar Título e Subtítulo
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    No menu esquerdo clica em <strong>Texto</strong>:
                    <br />
                    • Clica em <strong>"Adicionar título"</strong> para a frase principal (usa uma fonte grossa e fácil de ler, como <em>Montserrat</em>, <em>Bebas Neue</em> ou <em>League Spartan</em>).
                    <br />
                    • Clica em <strong>"Adicionar subtítulo"</strong> para a data, hora e local.
                  </p>
                </div>
              </div>

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

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveSubTab('rules')}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior: Regras de Ouro</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('examples')}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-3 rounded-2xl transition-all cursor-pointer shadow-md"
              >
                <span>Seguinte: 4. Ver Exemplos Reais</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEPARADOR 4: EXEMPLOS DE CARTAZES (OS 6 EXEMPLOS ESCOLARES ORIGINAIS)       */}
      {/* ========================================================================= */}
      {activeSubTab === 'examples' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* CABEÇALHO DA GALERIA ESCOLAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-3xl border border-slate-800 text-white shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">♻️</span>
              <div>
                <h3 className="text-sm font-black text-white">
                  Galeria de Exemplos Reais sobre Reciclagem
                </h3>
                <p className="text-[11px] text-slate-400">
                  Clica nos cartões da esquerda para ver a simulação real de impressão em formato vertical A3
                </p>
              </div>
            </div>

            <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-black shrink-0 self-start sm:self-auto">
              📋 6 Exemplos Oficiais da Escola (Formato A3)
            </div>
          </div>

          {/* OS 6 CARTAZES ESCOLARES ORIGINAIS EM FORMATO A3 */}
          <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-4 sm:p-6 text-white shadow-2xl space-y-6">
              {/* CORPO PRINCIPAL: BARRA LATERAL À ESQUERDA + CARTAZ FORMATO A3 À DIREITA */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* BARRA LATERAL ESQUERDA: LISTA DE CARTAZES */}
                <div className="lg:col-span-4 space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 block">
                    CLICA PARA VISUALIZAR O CARTAZ:
                  </span>

                  <div className="space-y-2.5">
                    {schoolPosters.map((poster) => {
                      const isSelected = poster.id === activePoster.id;
                      return (
                        <div
                          key={poster.id}
                          onClick={() => setSchoolPosterId(poster.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 relative select-none ${
                            isSelected
                              ? 'bg-[#121c3b] border-emerald-400 ring-2 ring-emerald-400/30 shadow-lg'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${
                            isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white'
                          }`}>
                            {poster.icon}
                          </div>

                          <div className="flex-1 min-w-0 pr-12">
                            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 block truncate">
                              {poster.sidebarTag}
                            </span>
                            <h4 className="text-xs font-black text-white truncate">
                              {poster.sidebarTitle}
                            </h4>
                            <p className="text-[10px] text-slate-400 truncate">
                              {poster.sidebarDesc}
                            </p>
                          </div>

                          {isSelected && (
                            <div className="absolute right-3 top-3 bg-emerald-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                              <span>A Ver</span>
                              <span>👁️</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* LADO DIREITO: O CARTAZ VERTICAL FORMATO A3 (SIMULAÇÃO REAL DE IMPRESSÃO ESCOLAR) */}
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 font-bold px-1">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Eye className="w-4 h-4" />
                      <span>Cartaz Vertical Formato A3 (Simulação Real de Impressão Escolar)</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-md text-[10px] font-black">
                        📐 Formato A3 (29,7 × 42 cm)
                      </span>
                      <span className="text-slate-400 text-[11px] truncate">
                        {activePoster.headerRight}
                      </span>
                    </div>
                  </div>

                  {/* 1. CARTAZ A3: ONDE DEVO COLOCAR? */}
                  {activePoster.id === "onde_colocar" && (
                    <div className="max-w-2xl mx-auto bg-white text-slate-900 border-2 border-slate-700/60 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 select-none ring-1 ring-black/5">
                      <div className="text-center space-y-1.5">
                        <span className="inline-block bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full">
                          CAMPANHA ESCOLAR • 6.º ANO • FORMATO A3
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                          ONDE DEVO COLOCAR?
                        </h2>
                        <p className="text-xs sm:text-sm font-extrabold text-slate-700">
                          Guia Oficial de Separação de Resíduos na Escola
                        </p>
                      </div>

                      {/* IMAGEM PRINCIPAL DO CARTAZ A3 */}
                      <div className="relative aspect-[16/8] sm:aspect-[16/7] w-full rounded-2xl overflow-hidden shadow-md border border-slate-200">
                        <img
                          src="/src/assets/images/ecopontos_school_bins_1793976160312.jpg"
                          alt="Ecopontos Escolar Amarelo, Azul e Verde"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-slate-900/85 backdrop-blur-xs text-white text-[9px] font-black px-2.5 py-0.5 rounded-md shadow-xs">
                          Ecopontos Oficiais da Escola ♻️
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Amarelo */}
                        <div className="border-2 border-amber-400 rounded-2xl p-3.5 bg-amber-50/50 space-y-2.5 text-left">
                          <div className="bg-amber-400 text-slate-950 text-center py-1 rounded-xl text-xs font-black uppercase shadow-xs">
                            🟡 AMARELO
                          </div>
                          <div className="text-center">
                            <h5 className="text-xs font-black text-slate-900">Plástico &amp; Metal</h5>
                            <span className="text-[10px] text-amber-800 font-bold italic">Espalmar antes de colocar!</span>
                          </div>
                          <div className="text-[10px] space-y-1">
                            <span className="font-black text-emerald-800 block">O QUE COLOCAR (SIM ✅):</span>
                            <ul className="text-slate-800 space-y-0.5">
                              <li>• Garrafas de água e sumos</li>
                              <li>• Pacotes de leite e néctar</li>
                              <li>• Latas de conserva e refrigerante</li>
                              <li>• Sacos plásticos e iogurtes</li>
                            </ul>
                          </div>
                          <div className="text-[10px] space-y-1 pt-1.5 border-t border-amber-200">
                            <span className="font-black text-rose-700 block">NÃO COLOCAR (NÃO ❌):</span>
                            <ul className="text-slate-700 space-y-0.5">
                              <li>• Baldes ou brinquedos partidos</li>
                              <li>• Canetas e marcadores escolares</li>
                              <li>• Pratos de plástico sujos</li>
                            </ul>
                          </div>
                        </div>

                        {/* Azul */}
                        <div className="border-2 border-blue-500 rounded-2xl p-3.5 bg-blue-50/50 space-y-2.5 text-left">
                          <div className="bg-blue-600 text-white text-center py-1 rounded-xl text-xs font-black uppercase shadow-xs">
                            🔵 AZUL
                          </div>
                          <div className="text-center">
                            <h5 className="text-xs font-black text-slate-900">Papel &amp; Cartão</h5>
                            <span className="text-[10px] text-blue-800 font-bold italic">Folhas limpas e secas!</span>
                          </div>
                          <div className="text-[10px] space-y-1">
                            <span className="font-black text-emerald-800 block">O QUE COLOCAR (SIM ✅):</span>
                            <ul className="text-slate-800 space-y-0.5">
                              <li>• Folhas de cadernos e rascunhos</li>
                              <li>• Caixas de cartão espalmadas</li>
                              <li>• Fotocópias de estudo</li>
                              <li>• Jornais, revistas e panfletos</li>
                            </ul>
                          </div>
                          <div className="text-[10px] space-y-1 pt-1.5 border-t border-blue-200">
                            <span className="font-black text-rose-700 block">NÃO COLOCAR (NÃO ❌):</span>
                            <ul className="text-slate-700 space-y-0.5">
                              <li>• Guardanapos de cozinha sujos</li>
                              <li>• Toalhetes húmidos de limpeza</li>
                              <li>• Papel de prata dos chocolates</li>
                            </ul>
                          </div>
                        </div>

                        {/* Verde */}
                        <div className="border-2 border-emerald-500 rounded-2xl p-3.5 bg-emerald-50/50 space-y-2.5 text-left">
                          <div className="bg-emerald-600 text-white text-center py-1 rounded-xl text-xs font-black uppercase shadow-xs">
                            🟢 VERDE
                          </div>
                          <div className="text-center">
                            <h5 className="text-xs font-black text-slate-900">Vidro</h5>
                            <span className="text-[10px] text-emerald-800 font-bold italic">Retirar as tampas metálicas!</span>
                          </div>
                          <div className="text-[10px] space-y-1">
                            <span className="font-black text-emerald-800 block">O QUE COLOCAR (SIM ✅):</span>
                            <ul className="text-slate-800 space-y-0.5">
                              <li>• Garrafas de água em vidro</li>
                              <li>• Frascos de doce ou iogurte</li>
                              <li>• Boiões de comida de vidro</li>
                              <li>• Frascos de molho lavados</li>
                            </ul>
                          </div>
                          <div className="text-[10px] space-y-1 pt-1.5 border-t border-emerald-200">
                            <span className="font-black text-rose-700 block">NÃO COLOCAR (NÃO ❌):</span>
                            <ul className="text-slate-700 space-y-0.5">
                              <li>• Copos de vidro partidos</li>
                              <li>• Espelhos e vidros de janelas</li>
                              <li>• Lâmpadas ou loiças cerâmicas</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-center text-xs font-bold text-sky-900">
                        💧 Dica importante: não é preciso lavar as embalagens com água, basta que estejam completamente vazias!
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-3 border-t border-slate-200">
                        <span>📍 Ecopontos em todos os corredores</span>
                        <span>Eco-Escola • Clube de TIC</span>
                      </div>
                    </div>
                  )}

                  {/* 2. CARTAZ A3: ALERTA PILHÃO */}
                  {activePoster.id === "pilhao" && (
                    <div className="max-w-2xl mx-auto bg-[#54091c] text-white border-2 border-rose-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 select-none ring-1 ring-white/10">
                      <div className="text-center space-y-1.5">
                        <span className="inline-block bg-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full">
                          🟡 AVISO URGENTE DE SEGURANÇA AMBIENTAL • A3
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                          PERIGO: PILHAS NO LIXO COMUM!
                        </h2>
                        <p className="text-xs sm:text-sm font-semibold text-rose-200 max-w-xl mx-auto leading-relaxed">
                          Uma única pilha contém metais pesados tóxicos como chumbo e mercúrio que poluem rios e nascentes.
                        </p>
                      </div>

                      {/* IMAGEM PRINCIPAL DO CARTAZ A3 */}
                      <div className="relative aspect-[16/8] sm:aspect-[16/7] w-full rounded-2xl overflow-hidden shadow-md border border-rose-700/60">
                        <img
                          src="/src/assets/images/pilhao_hazard_batteries_1793976138543.jpg"
                          alt="Pilhas gastas e metais pesados perigosos"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5 text-right">
                          <span className="text-[10px] font-black text-yellow-300 bg-black/60 px-2 py-0.5 rounded">
                            ⚠️ Não misturar com lixo comum nem queimar!
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                        <div className="bg-black/40 border border-white/10 rounded-2xl p-3 space-y-1">
                          <span className="text-lg sm:text-xl font-black text-yellow-400 block">30.000 Litros</span>
                          <p className="text-[10px] text-slate-300">
                            de água que uma só pilha-botão pode contaminar no solo.
                          </p>
                        </div>
                        <div className="bg-black/40 border border-white/10 rounded-2xl p-3 space-y-1">
                          <span className="text-lg sm:text-xl font-black text-yellow-400 block">100 Anos</span>
                          <p className="text-[10px] text-slate-300">
                            o tempo que os metais pesados demoram a desaparecer da natureza.
                          </p>
                        </div>
                        <div className="bg-black/40 border border-white/10 rounded-2xl p-3 space-y-1">
                          <span className="text-lg sm:text-xl font-black text-yellow-400 block">100% Reciclável</span>
                          <p className="text-[10px] text-slate-300">
                            o aço, zinco e níquel retirados das pilhas recolhidas.
                          </p>
                        </div>
                      </div>

                      <div className="bg-black/30 border border-white/10 rounded-2xl p-4 space-y-2.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-yellow-300 block">
                          COMO PROCEDER EM 3 PASSOS SIMPLES:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0">1</span>
                            <div>
                              <strong className="text-xs font-black block text-white">Junta em Casa</strong>
                              <p className="text-[10px] text-slate-300">Guarda as pilhas gastas numa caixa de sapatos.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0">2</span>
                            <div>
                              <strong className="text-xs font-black block text-white">Traz para a Escola</strong>
                              <p className="text-[10px] text-slate-300">Leva-as na mochila sem molhar nem furar.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0">3</span>
                            <div>
                              <strong className="text-xs font-black block text-white">Deposita no Pilhão</strong>
                              <p className="text-[10px] text-slate-300">Coloca no contentor vermelho junto à Portaria.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-400 text-slate-950 rounded-xl p-3 text-center text-xs font-black shadow-md">
                        ⚠️ Pilhas danificadas ou a verter líquido? Nunca toques com as mãos e avisa um professor ou funcionário.
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-bold text-rose-200 pt-3 border-t border-rose-800">
                        <span>📍 Pilhão Vermelho na Entrada do Bloco A</span>
                        <span>🗓️ Todas as Sextas • Recolha Oficial</span>
                      </div>
                    </div>
                  )}

                  {/* 3. CARTAZ A3: CAMPANHA PLÁSTICO ZERO */}
                  {activePoster.id === "plastico_zero" && (
                    <div className="max-w-2xl mx-auto bg-white text-slate-900 border-2 border-slate-700/60 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 select-none ring-1 ring-black/5">
                      <div className="text-center space-y-1.5">
                        <span className="inline-block bg-cyan-600 text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full">
                          🌊 SEMANA ECO-ESCOLAS • FORMATO A3
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                          O TEU LANCHE PROTEGE O MAR?
                        </h2>
                        <p className="text-xs sm:text-sm font-extrabold text-cyan-800 max-w-xl mx-auto">
                          Faz a escolha certa no recreio escolar e diz adeus aos plásticos de uso único.
                        </p>
                      </div>

                      {/* IMAGEM PRINCIPAL DO CARTAZ A3 */}
                      <div className="relative aspect-[16/8] sm:aspect-[16/7] w-full rounded-2xl overflow-hidden shadow-md border border-cyan-200">
                        <img
                          src="/src/assets/images/ocean_sea_turtle_clean_1793976181779.jpg"
                          alt="Tartaruga marinha em mar limpo e preservado"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-cyan-950/85 backdrop-blur-xs text-cyan-200 text-[9px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                          <span>🐢</span>
                          <span>Menos plástico no recreio escolar = Oceanos com vida!</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="border border-rose-300 bg-rose-50/50 rounded-2xl p-4 space-y-2.5 text-left">
                          <div>
                            <h5 className="text-xs font-black text-rose-700">EVITA ESTES HÁBITOS ❌</h5>
                            <span className="text-[10px] text-slate-500">Produzem 20 kg de lixo por aluno todos os anos</span>
                          </div>
                          <ul className="text-xs text-slate-800 space-y-1.5 font-medium">
                            <li>❌ Garrafas pequenas de plástico descartável</li>
                            <li>❌ Embrulhos de papel de alumínio descartáveis</li>
                            <li>❌ Sacos plásticos de uso único para a fruta</li>
                            <li>❌ Palhinhas e talheres de plástico fino</li>
                          </ul>
                        </div>

                        <div className="border border-emerald-300 bg-emerald-50/50 rounded-2xl p-4 space-y-2.5 text-left">
                          <div>
                            <h5 className="text-xs font-black text-emerald-800">PREFERE ESTAS SOLUÇÕES ✅</h5>
                            <span className="text-[10px] text-slate-500">Laváveis, económicas e amigas dos oceanos</span>
                          </div>
                          <ul className="text-xs text-slate-800 space-y-1.5 font-medium">
                            <li>✓ Garrafa de aço inoxidável ou vidro resistente</li>
                            <li>✓ Caixa tipo "lunchbox" hermética reutilizável</li>
                            <li>✓ Bolsas de tecido laváveis para bolachas e pão</li>
                            <li>✓ Fruta fresca na sua casca natural protetora</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-cyan-700 text-white rounded-xl p-3 text-center text-xs font-black shadow-md">
                        🌊 Se 200 alunos usarem garrafa reutilizável, poupam-se mais de 30.000 embalagens plásticas num só ano letivo!
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-slate-500 pt-3 border-t border-slate-200">
                        <span>🗓️ Semana de 2 a 6 de Junho</span>
                        <span>📍 Refeitório &amp; Bar dos Alunos</span>
                        <span>Projeto Mar Sem Plástico • 6.º Ano</span>
                      </div>
                    </div>
                  )}

                  {/* 4. CARTAZ A3: FESTIVAL DO REEE & ELETRÓNICOS */}
                  {activePoster.id === "e_lixo" && (
                    <div className="max-w-2xl mx-auto bg-[#191033] text-white border-2 border-purple-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 select-none ring-1 ring-white/10">
                      <div className="text-center space-y-1.5">
                        <span className="inline-block bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full">
                          ⚡ GRANDE EVENTO ESCOLAR • FORMATO A3
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-yellow-400 tracking-tight leading-tight">
                          FESTIVAL DO REEE &amp; ELETRÓNICOS
                        </h2>
                        <p className="text-xs sm:text-sm font-semibold text-purple-200 max-w-xl mx-auto">
                          Aparelhos elétricos e cabos avariados não vão para o caixote. Traz e dá-lhes uma nova vida!
                        </p>
                      </div>

                      {/* IMAGEM PRINCIPAL DO CARTAZ A3 */}
                      <div className="relative aspect-[16/8] sm:aspect-[16/7] w-full rounded-2xl overflow-hidden shadow-md border border-purple-700/60">
                        <img
                          src="/src/assets/images/e_waste_school_collection_1793976179627.jpg"
                          alt="Recolha escolar de lixo eletrónico e computadores"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-purple-950/85 backdrop-blur-xs text-yellow-300 text-[9px] font-black px-2.5 py-0.5 rounded-md">
                          Ponto de Entrega: Tenda Electrão ⚡
                        </div>
                      </div>

                      <div className="space-y-2 text-left">
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 block text-center">
                          O QUE PODES TRAZER DE CASA:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-white/10 border border-white/15 rounded-xl p-3 space-y-0.5">
                            <div className="flex items-center gap-2 font-black text-xs text-yellow-300">
                              <span>💻</span>
                              <span>Informática</span>
                            </div>
                            <p className="text-[10px] text-slate-300">
                              Teclados, ratos, impressoras antigas, cabos USB e carregadores avariados.
                            </p>
                          </div>

                          <div className="bg-white/10 border border-white/15 rounded-xl p-3 space-y-0.5">
                            <div className="flex items-center gap-2 font-black text-xs text-yellow-300">
                              <span>🎧</span>
                              <span>Som &amp; Imagem</span>
                            </div>
                            <p className="text-[10px] text-slate-300">
                              Auscultadores partidos, colunas, consolas portáteis e câmaras.
                            </p>
                          </div>

                          <div className="bg-white/10 border border-white/15 rounded-xl p-3 space-y-0.5">
                            <div className="flex items-center gap-2 font-black text-xs text-yellow-300">
                              <span>🔌</span>
                              <span>Pequenos Domésticos</span>
                            </div>
                            <p className="text-[10px] text-slate-300">
                              Torradeiras, secadores de cabelo velhos, ventoinhas e ferros de engomar.
                            </p>
                          </div>

                          <div className="bg-white/10 border border-white/15 rounded-xl p-3 space-y-0.5">
                            <div className="flex items-center gap-2 font-black text-xs text-yellow-300">
                              <span>📱</span>
                              <span>Telefones &amp; Tablets</span>
                            </div>
                            <p className="text-[10px] text-slate-300">
                              Telemóveis estragados e ecrãs sem conserto (limpos de cartões SIM).
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-400 text-slate-950 rounded-xl p-3 text-center text-xs font-black shadow-md">
                        🏆 A turma do 2.º Ciclo que recolher o maior peso de material elétrico ganha uma oficina prática de drones!
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-purple-200 pt-3 border-t border-purple-800">
                        <span>🗓️ Quarta-feira, 28 de Maio • 14h30 às 17h00</span>
                        <span>📍 Átrio Principal da Escola • Tenda Electrão</span>
                        <span>Clube de Robótica &amp; Dep. TIC</span>
                      </div>
                    </div>
                  )}

                  {/* 5. CARTAZ A3: INFOGRAFIA PAPEL & ÁRVORES */}
                  {activePoster.id === "papel_arvores" && (
                    <div className="max-w-2xl mx-auto bg-white text-slate-900 border-2 border-slate-700/60 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 select-none ring-1 ring-black/5">
                      <div className="text-center space-y-1.5">
                        <span className="inline-block bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full">
                          📄 SABIAS QUE? • EDIÇÃO ESPECIAL • FORMATO A3
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                          O QUE ACONTECE QUANDO RECICLAS O PAPEL?
                        </h2>
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 max-w-xl mx-auto">
                          Descobre a viagem incrível de uma folha de rascunho desde a tua sala até ao novo livro.
                        </p>
                      </div>

                      {/* IMAGEM PRINCIPAL DO CARTAZ A3 */}
                      <div className="relative aspect-[16/8] sm:aspect-[16/7] w-full rounded-2xl overflow-hidden shadow-md border border-blue-200">
                        <img
                          src="/src/assets/images/paper_forest_recycle_1793976198199.jpg"
                          alt="Ciclo do papel reciclado e preservação florestal"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-emerald-950/85 backdrop-blur-xs text-emerald-300 text-[9px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                          <span>🌲</span>
                          <span>1 tonelada de papel reciclado salva 20 árvores adultas na floresta</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                        <div className="border border-blue-200 bg-blue-50/50 rounded-2xl p-3 space-y-1">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs mx-auto flex items-center justify-center">
                            1
                          </div>
                          <strong className="text-xs font-black text-slate-900 block">Separação na Sala</strong>
                          <p className="text-[10px] text-slate-600">
                            Colocas o papel de rascunho no contentor azul sem agrafos nem plástico.
                          </p>
                        </div>

                        <div className="border border-blue-200 bg-blue-50/50 rounded-2xl p-3 space-y-1">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs mx-auto flex items-center justify-center">
                            2
                          </div>
                          <strong className="text-xs font-black text-slate-900 block">Trituração &amp; Polpa</strong>
                          <p className="text-[10px] text-slate-600">
                            Na fábrica o papel é misturado com água até formar uma pasta limpa.
                          </p>
                        </div>

                        <div className="border border-blue-200 bg-blue-50/50 rounded-2xl p-3 space-y-1">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs mx-auto flex items-center justify-center">
                            3
                          </div>
                          <strong className="text-xs font-black text-slate-900 block">Secagem em Rolos</strong>
                          <p className="text-[10px] text-slate-600">
                            A pasta é prensada em rolos gigantes com quilómetros de papel branqueado.
                          </p>
                        </div>

                        <div className="border border-blue-200 bg-blue-50/50 rounded-2xl p-3 space-y-1">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs mx-auto flex items-center justify-center">
                            4
                          </div>
                          <strong className="text-xs font-black text-slate-900 block">Novos Livros &amp; Caixas</strong>
                          <p className="text-[10px] text-slate-600">
                            Renascem caixas de cereais, cadernos escolares e papel higiénico.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                        <div className="border border-emerald-300 bg-emerald-50/60 rounded-2xl p-3 space-y-0.5">
                          <span className="text-lg font-black text-emerald-800 block">20 Árvores</span>
                          <p className="text-[10px] text-slate-600">salvas por cada tonelada de papel reciclado.</p>
                        </div>
                        <div className="border border-emerald-300 bg-emerald-50/60 rounded-2xl p-3 space-y-0.5">
                          <span className="text-lg font-black text-emerald-800 block">30.000 Litros</span>
                          <p className="text-[10px] text-slate-600">de água poupados em comparação com papel novo de madeira.</p>
                        </div>
                        <div className="border border-emerald-300 bg-emerald-50/60 rounded-2xl p-3 space-y-0.5">
                          <span className="text-lg font-black text-emerald-800 block">Até 7 Vezes</span>
                          <p className="text-[10px] text-slate-600">o número de vezes que a mesma fibra de papel pode ser reciclada.</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-3 border-t border-slate-200">
                        <span>📍 Todas as salas de aula e reprografia</span>
                        <span>Biblioteca Escolar &amp; Turmas de Ciências</span>
                      </div>
                    </div>
                  )}

                  {/* 6. CARTAZ A3: OFICINA DE COMPOSTAGEM */}
                  {activePoster.id === "compostagem" && (
                    <div className="max-w-2xl mx-auto bg-white text-slate-900 border-2 border-slate-700/60 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 select-none ring-1 ring-black/5">
                      <div className="text-center space-y-1.5">
                        <span className="inline-block bg-lime-600 text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full">
                          🌱 INSCRIÇÕES ABERTAS • VAGAS LIMITADAS • FORMATO A3
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                          OFICINA: DA CASCA AO ADUBO!
                        </h2>
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 max-w-xl mx-auto">
                          Vem aprender a transformar as sobras de fruta do teu recreio em terra fértil para a nossa horta.
                        </p>
                      </div>

                      {/* IMAGEM PRINCIPAL DO CARTAZ A3 */}
                      <div className="relative aspect-[16/8] sm:aspect-[16/7] w-full rounded-2xl overflow-hidden shadow-md border border-lime-300">
                        <img
                          src="/src/assets/images/compost_organic_soil_1793976138126.jpg"
                          alt="Alunos na horta pedagógica a criar adubo orgânico"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-lime-950/85 backdrop-blur-xs text-lime-300 text-[9px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                          <span>🌱</span>
                          <span>Horta Pedagógica Escolar: transforma sobras em adubo vivo!</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-center">
                        <div className="border border-slate-200 bg-slate-50/70 rounded-2xl p-4 space-y-1.5">
                          <span className="text-2xl">🌱</span>
                          <strong className="text-xs font-black text-slate-900 block">Os 2 Ingredientes</strong>
                          <p className="text-[10px] text-slate-600 leading-relaxed">
                            Equilíbrio perfeito entre restos verdes (húmidos) e restos castanhos (folhas secas).
                          </p>
                        </div>

                        <div className="border border-slate-200 bg-slate-50/70 rounded-2xl p-4 space-y-1.5">
                          <span className="text-2xl">🪱</span>
                          <strong className="text-xs font-black text-slate-900 block">Ajudantes Invisíveis</strong>
                          <p className="text-[10px] text-slate-600 leading-relaxed">
                            Minhocas, bactérias benéficas e fungos que trabalham dia e noite sem parar.
                          </p>
                        </div>

                        <div className="border border-slate-200 bg-slate-50/70 rounded-2xl p-4 space-y-1.5">
                          <span className="text-2xl">⏱️</span>
                          <strong className="text-xs font-black text-slate-900 block">A Maturação</strong>
                          <p className="text-[10px] text-slate-600 leading-relaxed">
                            Como cheirar e sentir a temperatura do compostor para saber quando está pronto.
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-100 rounded-xl p-3 text-center text-xs font-bold text-slate-700">
                        🧺 O que deves trazer: luvas de jardinagem, calçado confortável e muita curiosidade!
                      </div>

                      <div className="bg-lime-600 hover:bg-lime-700 text-white rounded-xl p-3 text-center text-xs font-black shadow-md cursor-pointer transition-all">
                        📢 INSCRIÇÕES GRATUITAS NA BIBLIOTECA ESCOLAR ATÉ TERÇA-FEIRA!
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-slate-500 pt-3 border-t border-slate-200">
                        <span>🗓️ Quinta-feira, 15 de Maio • 15h30</span>
                        <span>📍 Horta Pedagógica da Escola (junto ao campo exterior)</span>
                        <span>Prof.ª de Ciências &amp; Eco-Delegados</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>


          {/* BOTÕES DE NAVEGAÇÃO */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setActiveSubTab('tutorial')}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior: Como Fazer no Canva</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('checklist')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-3 rounded-2xl transition-all cursor-pointer shadow-md"
            >
              <span>Seguinte: 5. Checklist</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEPARADOR 5: CHECKLIST DO TEU CARTAZ                                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'checklist' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
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
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl shrink-0 self-start sm:self-auto">
                {completedCount} de 5 verificados
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
                  title: 'A imagem principal está nítida e não ficou deformada?',
                  desc: 'Puxaste sempre pelos quatro círculos nos cantos para não achatar nem esticar?',
                },
                {
                  id: 5,
                  title: 'Deixaste margens de respiração à volta da folha?',
                  desc: 'Nenhuma palavra está colada aos limites para não ser cortada na impressora.',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                    checklist[item.id]
                      ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
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

            {completedCount === 5 && (
              <div className="p-4 bg-emerald-100/70 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-900 animate-in fade-in">
                <span className="text-2xl">🎉</span>
                <p className="text-xs sm:text-sm font-bold">
                  Parabéns! O teu cartaz cumpre todos os requisitos de um trabalho nota 10 em TIC!
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveSubTab('examples')}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior: Ver Exemplos de Cartazes</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab ? onNavigateTab('dashboard') : setActiveSubTab('intro')}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-3 rounded-2xl transition-all cursor-pointer shadow-md"
              >
                <span>Concluir Revisão do Módulo</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
