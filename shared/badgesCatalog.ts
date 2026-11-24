export type BadgeCategory = 'jornada' | 'mundos' | 'pontos' | 'desafios' | 'excelencia';
export type BadgeTier = 'bronze' | 'prata' | 'ouro' | 'lendaria';

export interface BadgeCatalogDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  tier: BadgeTier;
  target?: number;
  targetUnit?: string;
}

export interface LevelDefinition {
  level: number;
  name: string;
  minXp: number;
}

/**
 * Curva de Níveis equilibrada para todo o ano letivo do 6.º Ano:
 * - 29 simuladores (até 2900 XP)
 * - 52 desafios semanais (30 XP/semana -> ~1080 XP no ano letivo)
 * - Dicas diárias (20 XP/dia)
 * - Missões reais + Grande Missão Final (+150 XP)
 */
export const SHARED_LEVELS: LevelDefinition[] = [
  { level: 1, name: 'Novato Digital', minXp: 0 },
  { level: 2, name: 'Aprendiz Digital', minXp: 250 },
  { level: 3, name: 'Explorador Digital', minXp: 600 },
  { level: 4, name: 'Navegador Digital', minXp: 1050 },
  { level: 5, name: 'Especialista TIC', minXp: 1600 },
  { level: 6, name: 'Estratega Digital', minXp: 2250 },
  { level: 7, name: 'Campeão TIC', minXp: 3000 },
  { level: 8, name: 'Lenda da Missão TIC', minXp: 4000 },
];

export const BADGE_THRESHOLDS = {
  XP_ESTRELA: 750,
  XP_PIONEIRO: 1750,
  XP_CAMPEAO: 3000,
  XP_LENDA: 4500,
  WEEKLY_BRONZE: 3,
  WEEKLY_PRATA: 10,
  WEEKLY_OURO: 25,
  DAILY_TIPS_CURIOSA: 10,
  PERFECT_ASSESSMENTS: 2,
} as const;

export const SHARED_BADGES_CATALOG: BadgeCatalogDefinition[] = [
  // 1. Jornada Inicial
  {
    id: 'primeiros-passos',
    title: 'Primeiros Passos',
    description: 'Entraste na Missão TIC e iniciaste a tua aventura digital!',
    icon: 'Footprints',
    category: 'jornada',
    tier: 'bronze',
  },

  // 2. Os 5 Mundos Curriculares
  {
    id: 'guardiao-digital',
    title: 'Guardião Digital',
    description: 'Concluíste os desafios de segurança e a avaliação do Mundo 1 com média acima de 70%.',
    icon: 'ShieldCheck',
    category: 'mundos',
    tier: 'prata',
  },
  {
    id: 'detetive-digital',
    title: 'Detetive Digital',
    description: 'Dominaste a pesquisa e a verificação de fontes no Mundo 2 com média acima de 70%.',
    icon: 'Search',
    category: 'mundos',
    tier: 'prata',
  },
  {
    id: 'criador-digital',
    title: 'Criador Digital',
    description: 'Concluíste o Mundo 3 de comunicação, netiqueta e direitos de autor acima de 70%.',
    icon: 'Palette',
    category: 'mundos',
    tier: 'prata',
  },
  {
    id: 'engenheiro-digital',
    title: 'Engenheiro Digital',
    description: 'Superaste os algoritmos, ciclos e programação do Mundo 4 com média acima de 70%.',
    icon: 'Code2',
    category: 'mundos',
    tier: 'ouro',
  },
  {
    id: 'explorador-da-ia',
    title: 'Explorador da IA',
    description: 'Concluíste o Mundo 5 de Inteligência Artificial responsável com média acima de 70%.',
    icon: 'Sparkles',
    category: 'mundos',
    tier: 'ouro',
  },

  // 3. Marcos de Pontuação XP (escala progressiva ao longo do ano letivo)
  {
    id: 'estrela-digital',
    title: 'Estrela Digital',
    description: `Alcançaste ${BADGE_THRESHOLDS.XP_ESTRELA} XP ao completar atividades e desafios!`,
    icon: 'Zap',
    category: 'pontos',
    tier: 'bronze',
    target: BADGE_THRESHOLDS.XP_ESTRELA,
    targetUnit: 'XP',
  },
  {
    id: 'pioneiro-tic',
    title: 'Pioneiro TIC',
    description: `Chegaste aos ${BADGE_THRESHOLDS.XP_PIONEIRO.toLocaleString('pt-PT')} XP — excelente ritmo a meio do ano letivo!`,
    icon: 'Rocket',
    category: 'pontos',
    tier: 'prata',
    target: BADGE_THRESHOLDS.XP_PIONEIRO,
    targetUnit: 'XP',
  },
  {
    id: 'centuriao-digital',
    title: 'Campeão Digital',
    description: `Conquistaste ${BADGE_THRESHOLDS.XP_CAMPEAO.toLocaleString('pt-PT')} XP — dedicação exemplar pelos mundos e desafios!`,
    icon: 'Award',
    category: 'pontos',
    tier: 'ouro',
    target: BADGE_THRESHOLDS.XP_CAMPEAO,
    targetUnit: 'XP',
  },
  {
    id: 'lenda-tic',
    title: 'Lenda da Missão TIC',
    description: `Ultrapassaste os ${BADGE_THRESHOLDS.XP_LENDA.toLocaleString('pt-PT')} XP — um feito lendário ao longo de todo o ano!`,
    icon: 'Trophy',
    category: 'pontos',
    tier: 'lendaria',
    target: BADGE_THRESHOLDS.XP_LENDA,
    targetUnit: 'XP',
  },

  // 4. Desafios Semanais & Hábitos Diários
  {
    id: 'desafiador-semanal',
    title: 'Desafiador Semanal',
    description: `Completaste ${BADGE_THRESHOLDS.WEEKLY_BRONZE} Desafios Semanais com sucesso!`,
    icon: 'Flame',
    category: 'desafios',
    tier: 'bronze',
    target: BADGE_THRESHOLDS.WEEKLY_BRONZE,
    targetUnit: 'desafios',
  },
  {
    id: 'cacador-desafios',
    title: 'Caçador de Desafios',
    description: `Completaste ${BADGE_THRESHOLDS.WEEKLY_PRATA} Desafios Semanais diferentes ao longo do ano!`,
    icon: 'Target',
    category: 'desafios',
    tier: 'prata',
    target: BADGE_THRESHOLDS.WEEKLY_PRATA,
    targetUnit: 'desafios',
  },
  {
    id: 'maratonista-semanal',
    title: 'Maratonista Anual',
    description: `Completaste ${BADGE_THRESHOLDS.WEEKLY_OURO} Desafios Semanais — consistência impressionante!`,
    icon: 'CalendarCheck',
    category: 'desafios',
    tier: 'ouro',
    target: BADGE_THRESHOLDS.WEEKLY_OURO,
    targetUnit: 'desafios',
  },
  {
    id: 'mente-curiosa',
    title: 'Mente Curiosa',
    description: `Acertaste ${BADGE_THRESHOLDS.DAILY_TIPS_CURIOSA} Dicas do Dia em dias diferentes!`,
    icon: 'Lightbulb',
    category: 'desafios',
    tier: 'prata',
    target: BADGE_THRESHOLDS.DAILY_TIPS_CURIOSA,
    targetUnit: 'dicas',
  },

  // 5. Excelência & Grande Missão
  {
    id: 'nota-maxima',
    title: 'Nota Máxima',
    description: `Conseguiste 100% em pelo menos ${BADGE_THRESHOLDS.PERFECT_ASSESSMENTS} Avaliações Finais de mundos diferentes!`,
    icon: 'Star',
    category: 'excelencia',
    tier: 'ouro',
    target: BADGE_THRESHOLDS.PERFECT_ASSESSMENTS,
    targetUnit: 'testes a 100%',
  },
  {
    id: 'mestre-da-missao-tic',
    title: 'Mestre da Missão TIC',
    description: 'Concluíste os 5 Mundos e venceste a Grande Missão Final!',
    icon: 'Crown',
    category: 'excelencia',
    tier: 'lendaria',
  },
];

export interface BadgeEvaluationContext {
  xp: number;
  completedWorldIds: number[];
  weeklyChallengesCount: number;
  dailyTipsCount: number;
  perfectAssessmentWorldsCount: number;
  hasGrandeMissao: boolean;
}

/**
 * Pure deterministic evaluator returning all badge IDs earned by a student
 * plus live progress counters for every badge in the catalog.
 */
export function evaluateEarnedBadgeIds(ctx: BadgeEvaluationContext): {
  earnedIds: string[];
  progressByBadgeId: Record<string, { current: number; target: number; unit: string; percent: number }>;
} {
  const earned = new Set<string>();
  const progressByBadgeId: Record<
    string,
    { current: number; target: number; unit: string; percent: number }
  > = {};

  // Always earned once account exists
  earned.add('primeiros-passos');

  // World badges
  const worldBadgeMap: Record<number, string> = {
    1: 'guardiao-digital',
    2: 'detetive-digital',
    3: 'criador-digital',
    4: 'engenheiro-digital',
    5: 'explorador-da-ia',
  };
  for (const wId of ctx.completedWorldIds) {
    if (worldBadgeMap[wId]) earned.add(worldBadgeMap[wId]);
  }

  // XP milestone badges (progressive scale across the school year)
  const xp = Math.max(0, Number(ctx.xp) || 0);
  const xpMilestones: [string, number][] = [
    ['estrela-digital', BADGE_THRESHOLDS.XP_ESTRELA],
    ['pioneiro-tic', BADGE_THRESHOLDS.XP_PIONEIRO],
    ['centuriao-digital', BADGE_THRESHOLDS.XP_CAMPEAO],
    ['lenda-tic', BADGE_THRESHOLDS.XP_LENDA],
  ];
  for (const [bId, target] of xpMilestones) {
    progressByBadgeId[bId] = {
      current: Math.min(xp, target),
      target,
      unit: 'XP',
      percent: Math.min(100, Math.round((xp / target) * 100)),
    };
    if (xp >= target) earned.add(bId);
  }

  // Weekly challenge badges
  const weekly = Math.max(0, ctx.weeklyChallengesCount || 0);
  const weeklyMilestones: [string, number][] = [
    ['desafiador-semanal', BADGE_THRESHOLDS.WEEKLY_BRONZE],
    ['cacador-desafios', BADGE_THRESHOLDS.WEEKLY_PRATA],
    ['maratonista-semanal', BADGE_THRESHOLDS.WEEKLY_OURO],
  ];
  for (const [bId, target] of weeklyMilestones) {
    progressByBadgeId[bId] = {
      current: Math.min(weekly, target),
      target,
      unit: 'desafios',
      percent: Math.min(100, Math.round((weekly / target) * 100)),
    };
    if (weekly >= target) earned.add(bId);
  }

  // Daily tips consistency badge
  const tips = Math.max(0, ctx.dailyTipsCount || 0);
  progressByBadgeId['mente-curiosa'] = {
    current: Math.min(tips, BADGE_THRESHOLDS.DAILY_TIPS_CURIOSA),
    target: BADGE_THRESHOLDS.DAILY_TIPS_CURIOSA,
    unit: 'dicas',
    percent: Math.min(100, Math.round((tips / BADGE_THRESHOLDS.DAILY_TIPS_CURIOSA) * 100)),
  };
  if (tips >= BADGE_THRESHOLDS.DAILY_TIPS_CURIOSA) {
    earned.add('mente-curiosa');
  }

  // Excellence: 100% on at least 2 distinct world final assessments
  const perfects = Math.max(0, ctx.perfectAssessmentWorldsCount || 0);
  progressByBadgeId['nota-maxima'] = {
    current: Math.min(perfects, BADGE_THRESHOLDS.PERFECT_ASSESSMENTS),
    target: BADGE_THRESHOLDS.PERFECT_ASSESSMENTS,
    unit: 'testes a 100%',
    percent: Math.min(100, Math.round((perfects / BADGE_THRESHOLDS.PERFECT_ASSESSMENTS) * 100)),
  };
  if (perfects >= BADGE_THRESHOLDS.PERFECT_ASSESSMENTS) {
    earned.add('nota-maxima');
  }

  // Master: all 5 worlds completed + Grande Missão completed
  const worldsDone = new Set(ctx.completedWorldIds).size;
  const masterSteps = worldsDone + (ctx.hasGrandeMissao ? 1 : 0);
  progressByBadgeId['mestre-da-missao-tic'] = {
    current: Math.min(masterSteps, 6),
    target: 6,
    unit: 'etapas',
    percent: Math.min(100, Math.round((masterSteps / 6) * 100)),
  };
  if (worldsDone >= 5 && ctx.hasGrandeMissao) {
    earned.add('mestre-da-missao-tic');
  }

  return {
    earnedIds: Array.from(earned),
    progressByBadgeId,
  };
}
