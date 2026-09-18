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
    slug: 'servidor-central',
    name: 'O Servidor Central',
    worldName: 'Guardião Digital',
    worldNumber: 1,
    codeFragment: '#SEC-SAFE-2040',
    description: 'Investiga um alerta crítico de intrusão, descobre os indícios de phishing e reconfigura o protocolo de ciberdefesa da escola.',
    tag: 'Cibersegurança & 2FA',
    iconName: 'Shield',
    color: 'emerald',
    accentBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderColor: 'border-emerald-500/40',
  },
  {
    id: 2,
    slug: 'arquivo-noticias',
    name: 'O Arquivo de Notícias',
    worldName: 'Detetive Digital',
    worldNumber: 2,
    codeFragment: '#FACT-CHECK-OK',
    description: 'Analisa publicações que circulam na rede escolar, aplica o teste de verificação de fontes e isola os boatos fraudulentos.',
    tag: 'Pensamento Crítico & Fact-Checking',
    iconName: 'Search',
    color: 'blue',
    accentBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    borderColor: 'border-blue-500/40',
  },
  {
    id: 3,
    slug: 'estudio-criativo',
    name: 'O Estúdio Criativo',
    worldName: 'Criador Digital',
    worldNumber: 3,
    codeFragment: '#CREATIVE-CC-VAL',
    description: 'Prepara a transmissão multimédia da escola selecionando recursos com licença aberta (Creative Commons) e netiqueta exemplar.',
    tag: 'Direitos de Autor & Netiqueta',
    iconName: 'Palette',
    color: 'purple',
    accentBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    borderColor: 'border-purple-500/40',
  },
  {
    id: 4,
    slug: 'oficina-automacao',
    name: 'A Oficina de Automação',
    worldName: 'Engenheiro Digital',
    worldNumber: 4,
    codeFragment: '#ALGO-ROBOT-RUN',
    description: 'Monta a lógica condicional do Robô Zelador para economizar energia e patrulhar as salas da escola inteligente.',
    tag: 'Algoritmos & Sensores',
    iconName: 'Terminal',
    color: 'amber',
    accentBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    borderColor: 'border-amber-500/40',
  },
  {
    id: 5,
    slug: 'laboratorio-ia',
    name: 'O Laboratório de IA',
    worldName: 'Explorador da IA',
    worldNumber: 5,
    codeFragment: '#AI-ETHICS-PASS',
    description: 'Depura o assistente virtual da escola, calibra os prompts de segurança e impede a divulgação acidental de dados pessoais.',
    tag: 'Engenharia de Prompts & Ética',
    iconName: 'Brain',
    color: 'indigo',
    accentBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    borderColor: 'border-indigo-500/40',
  },
  {
    id: 6,
    slug: 'nucleo-central',
    name: 'O Núcleo da Escola do Futuro',
    worldName: 'Desafio Integrador Final',
    worldNumber: 6,
    codeFragment: '#MASTER-CORE-2040',
    description: 'Insere os 5 fragmentos de código, desbloqueia o Núcleo Principal e toma a decisão ética definitiva sobre a Escola do Futuro.',
    tag: 'Desafio Supremo Integrado',
    iconName: 'Crown',
    color: 'yellow',
    accentBg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    borderColor: 'border-yellow-500/40',
  },
];
