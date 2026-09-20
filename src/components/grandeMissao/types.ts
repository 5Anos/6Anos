export interface ZoneInfo {
  id: number;
  slug: string;
  name: string;
  worldName: string;
  worldNumber: number;
  codeFragment: string;
  description: string;
  tag: string;
  iconName: string;
  color: string;
  accentBg: string;
  borderColor: string;
}

export interface GrandeMissaoProgressState {
  completedZones: number[]; // e.g. [1, 2, 3, 4, 5, 6]
  currentZoneId: number | null; // null means on the Map Hub
  unlockedCodes: Record<number, string>;
  isFinished: boolean;
  score: number;
  completedAt?: string;
}

export const ESCAPE_ZONES: ZoneInfo[] = [
  {
    id: 1,
    slug: 'centro-seguranca',
    name: 'Centro de Segurança',
    worldName: 'Guardião Digital',
    worldNumber: 1,
    codeFragment: '#SEC-SAFE-2040',
    description: 'Investiga um alerta de segurança na rede da escola, identifica os sinais de phishing e protege os dados pessoais e as palavras-passe.',
    tag: 'Segurança, Privacidade & Bem-estar',
    iconName: 'Shield',
    color: 'emerald',
    accentBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderColor: 'border-emerald-500/40',
  },
  {
    id: 2,
    slug: 'arquivo-secreto',
    name: 'Arquivo Secreto',
    worldName: 'Detetive Digital',
    worldNumber: 2,
    codeFragment: '#FACT-CHECK-OK',
    description: 'Investiga informações encontradas no arquivo, verifica autores e datas, compara fontes e distingue factos de boatos antes de partilhar.',
    tag: 'Pesquisa, Fontes & Fact-Checking',
    iconName: 'Search',
    color: 'blue',
    accentBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    borderColor: 'border-blue-500/40',
  },
  {
    id: 3,
    slug: 'estudio-criativo',
    name: 'Estúdio Criativo',
    worldName: 'Criador Digital',
    worldNumber: 3,
    codeFragment: '#CREATIVE-CC-VAL',
    description: 'Prepara uma mensagem multimédia para a escola, escolhendo imagens e sons com licenças abertas (Creative Commons) e netiqueta exemplar.',
    tag: 'Criação, Direitos de Autor & Netiqueta',
    iconName: 'Palette',
    color: 'purple',
    accentBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    borderColor: 'border-purple-500/40',
  },
  {
    id: 4,
    slug: 'laboratorio-engenharia',
    name: 'Laboratório de Engenharia',
    worldName: 'Engenheiro Digital',
    worldNumber: 4,
    codeFragment: '#ALGO-ROBOT-RUN',
    description: 'Programa a rota do robô através de comandos de direção (cima, baixo, esquerda, direita) para contornar obstáculos e religar a energia.',
    tag: 'Algoritmos, Robô & Planeamento',
    iconName: 'Terminal',
    color: 'amber',
    accentBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    borderColor: 'border-amber-500/40',
  },
  {
    id: 5,
    slug: 'laboratorio-ia',
    name: 'Laboratório de IA',
    worldName: 'Explorador da IA',
    worldNumber: 5,
    codeFragment: '#AI-ETHICS-PASS',
    description: 'Testa o assistente de IA, melhora os pedidos (prompts), deteta respostas com informações inventadas e protege a privacidade.',
    tag: 'Prompts, Verificação & Ética na IA',
    iconName: 'Brain',
    color: 'indigo',
    accentBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    borderColor: 'border-indigo-500/40',
  },
  {
    id: 6,
    slug: 'nucleo-central',
    name: 'Núcleo Central',
    worldName: 'A Escola do Futuro',
    worldNumber: 6,
    codeFragment: '#MASTER-CORE-2040',
    description: 'Introduz os 5 códigos de segurança recuperados nas zonas anteriores e responde às 5 decisões éticas finais para reativar a Escola do Futuro.',
    tag: 'Desafio Final Integrador',
    iconName: 'Crown',
    color: 'yellow',
    accentBg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    borderColor: 'border-yellow-500/40',
  },
];
