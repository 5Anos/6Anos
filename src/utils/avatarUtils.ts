import { CustomAvatarConfig, AvatarCategoryDef } from '../types/avatar';

export const DEFAULT_AVATAR_CONFIG: CustomAvatarConfig = {
  skin: 'skin-1',
  hair: 'short-tousled',
  hairColor: '#3F2305',
  eyes: 'happy',
  expression: 'smile',
  glasses: 'none',
  hat: 'none',
  clothing: 'hoodie',
  clothingColor: '#2563EB',
  background: 'blue-tech',
};

// Available Categories and Options
export const AVATAR_CATEGORIES: AvatarCategoryDef[] = [
  {
    id: 'skin',
    label: 'Tom de Pele',
    icon: '👤',
    options: [
      { id: 'skin-1', label: 'Pele Clara', color: '#FFEDD5' },
      { id: 'skin-2', label: 'Pele Morena Clara', color: '#FED7AA' },
      { id: 'skin-3', label: 'Pele Morena', color: '#FDBA74' },
      { id: 'skin-4', label: 'Pele Bronzeada', color: '#EA580C' },
      { id: 'skin-5', label: 'Pele Escura', color: '#9A3412' },
    ],
  },
  {
    id: 'hair',
    label: 'Cabelo',
    icon: '💇',
    options: [
      { id: 'short-tousled', label: 'Despenteado Moderno' },
      { id: 'ponytail', label: 'Rabo de Cavalo' },
      { id: 'curly', label: 'Caracóis Volumosos' },
      { id: 'bob-cut', label: 'Corte Bob / Liso' },
      { id: 'short-spiky', label: 'Espetado Dinâmico' },
      { id: 'long-wavy', label: 'Longo Ondulado' },
      { id: 'afro-puff', label: 'Afro / Black Power' },
      { id: 'buzz-cut', label: 'Rapado / Curto' },
    ],
  },
  {
    id: 'hairColor',
    label: 'Cor do Cabelo',
    icon: '🎨',
    options: [
      { id: '#3F2305', label: 'Castanho Escuro', color: '#3F2305' },
      { id: '#111827', label: 'Preto Ébano', color: '#111827' },
      { id: '#EAB308', label: 'Loiro Dourado', color: '#EAB308' },
      { id: '#B45309', label: 'Ruivo / Cobre', color: '#B45309' },
      { id: '#3B82F6', label: 'Azul Elétrico', color: '#3B82F6' },
      { id: '#8B5CF6', label: 'Roxo Neon', color: '#8B5CF6' },
      { id: '#EC4899', label: 'Rosa Choque', color: '#EC4899' },
      { id: '#94A3B8', label: 'Prata / Cinza', color: '#94A3B8' },
    ],
  },
  {
    id: 'eyes',
    label: 'Olhar & Expressão',
    icon: '🙂',
    options: [
      { id: 'happy', label: 'Olhos Vivos & Curiosos' },
      { id: 'confident', label: 'Olhar Confiante' },
      { id: 'wink', label: 'Piscadela Amigável' },
      { id: 'sparkle', label: 'Brilho Gamer / Estrelas' },
      { id: 'focused', label: 'Foco Total / Analítico' },
    ],
  },
  {
    id: 'expression',
    label: 'Sorriso',
    icon: '✨',
    options: [
      { id: 'smile', label: 'Sorriso Amigável' },
      { id: 'grin', label: 'Sorriso Rasgado' },
      { id: 'cool', label: 'Sorriso Estiloso' },
      { id: 'laugh', label: 'Riso Aberto' },
    ],
  },
  {
    id: 'glasses',
    label: 'Óculos',
    icon: '👓',
    options: [
      { id: 'none', label: 'Sem Óculos' },
      { id: 'round', label: 'Óculos Redondos' },
      { id: 'square', label: 'Óculos Retangulares Geek' },
      { id: 'vr-visor', label: 'Visor VR Ciber' },
      { id: 'sunglasses', label: 'Óculos de Sol Estilosos' },
    ],
  },
  {
    id: 'hat',
    label: 'Acessórios & Chapéus',
    icon: '🎩',
    options: [
      { id: 'none', label: 'Sem Acessório' },
      { id: 'headset', label: 'Headset Gamer Pro' },
      { id: 'cap-back', label: 'Boné para Trás' },
      { id: 'grad-cap', label: 'Capelo Académico TIC' },
      { id: 'cyber-band', label: 'Fita Ciber Neon' },
      { id: 'crown', label: 'Coroa de Campeão' },
    ],
  },
  {
    id: 'clothing',
    label: 'Roupa',
    icon: '👕',
    options: [
      { id: 'hoodie', label: 'Hoodie com Fecho' },
      { id: 'tech-tee', label: 'T-Shirt Tecnológica' },
      { id: 'explorer-jacket', label: 'Casaco de Explorador' },
      { id: 'cyber-suit', label: 'Traje Espacial / Ciber' },
      { id: 'collar-shirt', label: 'Camisa Casual' },
    ],
  },
  {
    id: 'clothingColor',
    label: 'Cor da Roupa',
    icon: '🎨',
    options: [
      { id: '#2563EB', label: 'Azul Real', color: '#2563EB' },
      { id: '#7C3AED', label: 'Roxo Índigo', color: '#7C3AED' },
      { id: '#059669', label: 'Verde Esmeralda', color: '#059669' },
      { id: '#D97706', label: 'Laranja Âmbar', color: '#D97706' },
      { id: '#DB2777', label: 'Rosa Magenta', color: '#DB2777' },
      { id: '#0F172A', label: 'Preto Noturno', color: '#0F172A' },
      { id: '#06B6D4', label: 'Azul Ciano', color: '#06B6D4' },
      { id: '#DC2626', label: 'Vermelho Fogo', color: '#DC2626' },
    ],
  },
  {
    id: 'background',
    label: 'Fundo do Avatar',
    icon: '🌄',
    options: [
      { id: 'blue-tech', label: 'Azul Tecnológico', color: '#2563EB' },
      { id: 'purple-sunset', label: 'Crepúsculo Roxo', color: '#7C3AED' },
      { id: 'emerald-cyber', label: 'Matriz Esmeralda', color: '#059669' },
      { id: 'cosmic-dark', label: 'Espaço Cósmico', color: '#1E1B4B' },
      { id: 'gold-glory', label: 'Dourado de Campeão', color: '#D97706' },
      { id: 'sky-clean', label: 'Céu Diurno Limpo', color: '#0284C7' },
    ],
  },
];

// Map legacy avatar IDs to valid CustomAvatarConfig
export const LEGACY_AVATAR_MAP: Record<string, CustomAvatarConfig> = {
  'avatar-boy-1': {
    skin: 'skin-1',
    hair: 'short-tousled',
    hairColor: '#3F2305',
    eyes: 'happy',
    expression: 'smile',
    glasses: 'none',
    hat: 'none',
    clothing: 'hoodie',
    clothingColor: '#2563EB',
    background: 'blue-tech',
  },
  'avatar-girl-1': {
    skin: 'skin-2',
    hair: 'ponytail',
    hairColor: '#3F2305',
    eyes: 'happy',
    expression: 'smile',
    glasses: 'none',
    hat: 'none',
    clothing: 'tech-tee',
    clothingColor: '#DB2777',
    background: 'purple-sunset',
  },
  'avatar-boy-2': {
    skin: 'skin-2',
    hair: 'bob-cut',
    hairColor: '#111827',
    eyes: 'confident',
    expression: 'smile',
    glasses: 'none',
    hat: 'none',
    clothing: 'tech-tee',
    clothingColor: '#0284C7',
    background: 'sky-clean',
  },
  'avatar-robot': {
    skin: 'skin-1',
    hair: 'buzz-cut',
    hairColor: '#94A3B8',
    eyes: 'sparkle',
    expression: 'cool',
    glasses: 'vr-visor',
    hat: 'headset',
    clothing: 'cyber-suit',
    clothingColor: '#06B6D4',
    background: 'emerald-cyber',
  },
  'avatar-super': {
    skin: 'skin-3',
    hair: 'short-spiky',
    hairColor: '#111827',
    eyes: 'confident',
    expression: 'grin',
    glasses: 'none',
    hat: 'crown',
    clothing: 'explorer-jacket',
    clothingColor: '#D97706',
    background: 'gold-glory',
  },
  'teacher-1': {
    skin: 'skin-2',
    hair: 'bob-cut',
    hairColor: '#3F2305',
    eyes: 'confident',
    expression: 'smile',
    glasses: 'square',
    hat: 'grad-cap',
    clothing: 'collar-shirt',
    clothingColor: '#7C3AED',
    background: 'purple-sunset',
  },
};

/**
 * Parses an avatar string or object into a CustomAvatarConfig.
 * Handles JSON strings, objects, and legacy string IDs seamlessly.
 */
export function parseAvatarConfig(raw: any): CustomAvatarConfig {
  if (!raw) return { ...DEFAULT_AVATAR_CONFIG };

  if (typeof raw === 'object' && raw.skin && raw.hair) {
    return { ...DEFAULT_AVATAR_CONFIG, ...raw };
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object' && parsed.skin) {
          return { ...DEFAULT_AVATAR_CONFIG, ...parsed };
        }
      } catch {
        // Fall through
      }
    }

    if (LEGACY_AVATAR_MAP[trimmed]) {
      return { ...LEGACY_AVATAR_MAP[trimmed] };
    }
  }

  return { ...DEFAULT_AVATAR_CONFIG };
}

/**
 * Serializes a CustomAvatarConfig to a compact JSON string.
 */
export function serializeAvatarConfig(config: CustomAvatarConfig): string {
  return JSON.stringify(config);
}

/**
 * Generates a completely randomized, 100% valid avatar configuration.
 */
export function generateRandomAvatar(): CustomAvatarConfig {
  const getRandom = (category: AvatarCategoryDef) => {
    const opts = category.options;
    return opts[Math.floor(Math.random() * opts.length)].id;
  };

  const skinCategory = AVATAR_CATEGORIES.find((c) => c.id === 'skin')!;
  const hairCategory = AVATAR_CATEGORIES.find((c) => c.id === 'hair')!;
  const hairColorCategory = AVATAR_CATEGORIES.find((c) => c.id === 'hairColor')!;
  const eyesCategory = AVATAR_CATEGORIES.find((c) => c.id === 'eyes')!;
  const expressionCategory = AVATAR_CATEGORIES.find((c) => c.id === 'expression')!;
  const glassesCategory = AVATAR_CATEGORIES.find((c) => c.id === 'glasses')!;
  const hatCategory = AVATAR_CATEGORIES.find((c) => c.id === 'hat')!;
  const clothingCategory = AVATAR_CATEGORIES.find((c) => c.id === 'clothing')!;
  const clothingColorCategory = AVATAR_CATEGORIES.find((c) => c.id === 'clothingColor')!;
  const bgCategory = AVATAR_CATEGORIES.find((c) => c.id === 'background')!;

  return {
    skin: getRandom(skinCategory),
    hair: getRandom(hairCategory),
    hairColor: getRandom(hairColorCategory),
    eyes: getRandom(eyesCategory),
    expression: getRandom(expressionCategory),
    glasses: getRandom(glassesCategory),
    hat: getRandom(hatCategory),
    clothing: getRandom(clothingCategory),
    clothingColor: getRandom(clothingColorCategory),
    background: getRandom(bgCategory),
  };
}

/**
 * Generates a GDPR-compliant, fun public nickname for students
 * Format: [PERSONAGEM]_[ADJETIVO]_[NÚMERO]
 */
export function generateSafeNickname(): string {
  const characters = [
    'Panda',
    'Lince',
    'Falcao',
    'Astronauta',
    'CyberGuardiao',
    'Gamer',
    'Explorador',
    'Lontra',
    'Aguia',
    'Ninja',
    'Coruja',
    'Golfinho',
    'Robo',
    'Pioneiro',
    'Genio',
    'Raposa',
    'Lobo',
    'Fenix',
    'Dragao',
    'Titan',
  ];

  const adjectives = [
    'Criativo',
    'Veloz',
    'Curioso',
    'Brilhante',
    'Valente',
    'Audaz',
    'Atento',
    'Engenhoso',
    'Perspicaz',
    'Focado',
    'Sabio',
    'Esperto',
    'Inovador',
    'Divertido',
    'Agil',
    'Invencivel',
    'Heroico',
    'Radiante',
  ];

  const char = characters[Math.floor(Math.random() * characters.length)];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const num = Math.floor(100 + Math.random() * 900); // 100 - 999

  return `${char}_${adj}_${num}`;
}
