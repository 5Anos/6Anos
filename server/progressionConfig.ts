/**
 * Missão TIC — 6.º Ano
 * Centralized Progression Configuration & Rules
 *
 * Single Source of Truth for:
 * - Curricular competency thresholds (> 70%)
 * - World unlocking prerequisites
 * - Required components per world
 * - XP rewards for milestones
 */

export const PROGRESSION_CONFIG = {
  // Single authoritative competency threshold for world average progression (in %)
  PASSING_THRESHOLD: 70,

  // Curricular Quiz Approval threshold (>= 50%)
  QUIZ_PASSING_THRESHOLD: 50,

  // Total worlds in the curricular program
  TOTAL_WORLDS: 5,

  // Required simulators per world
  REQUIRED_SIMULATORS: {
    1: [
      'sim-password',
      'sim-phishing',
      'sim-privacy',
      'sim-digital-footprint',
      'sim-digital-wellbeing',
    ],
    2: [
      'sim-keywords',
      'sim-author-check',
      'sim-date-verifier',
      'sim-source-compare',
      'sim-news-detective',
    ],
    3: [
      'sim-avatar-challenge',
      'sim-comunicacao-digital',
      'sim-netiqueta',
      'sim-colaboracao',
      'sim-direitos-autor',
      'sim-plagio-citacao',
      'sim-creative-commons',
    ],
    4: [
      'sim-decomposicao',
      'sim-block-coding',
      'sim-algoritmos',
      'sim-ciclos',
      'sim-dados',
      'sim-debugging',
    ],
    5: [
      'sim-ia-concepts',
      'sim-ai-generation',
      'sim-prompt',
      'sim-hallucination',
      'sim-ai-responsibility',
      'sim-recommendation',
    ],
  } as Record<number, string[]>,

  // Standard Milestone XP Rewards
  XP_REWARDS: {
    INITIAL_WELCOME: 100,
    GRANDE_MISSAO: 150,
    WEEKLY_CHALLENGE: 30, // 30 XP semanal
    DAILY_TIP: 20,         // 20 XP diário
    WORLD_MISSION_MAX: 100,
    SIMULATOR_MAX: 100,
    ASSESSMENT_MAX: 0,     // 0 XP para quizzes (avaliação pedagógica pura)
  },

  // Badge unlock rules
  BADGES: {
    MIN_ACTIVITIES_FOR_WORLD_BADGE: 3,
    CENTURION_XP_THRESHOLD: 1000,
  },
} as const;

export type QualitativeMention = 'Muito Fraco' | 'Não Satisfaz' | 'Satisfaz' | 'Bom' | 'Muito Bom';

/**
 * Escala Curricular Oficial de Menções Qualitativas:
 * 0–19%   → Muito Fraco
 * 20–49%  → Não Satisfaz
 * 50–69%  → Satisfaz
 * 70–89%  → Bom
 * 90–100% → Muito Bom
 */
export function getQualitativeMention(percentage: number): QualitativeMention {
  const rounded = Math.round(percentage);
  if (rounded >= 90) return 'Muito Bom';
  if (rounded >= 70) return 'Bom';
  if (rounded >= 50) return 'Satisfaz';
  if (rounded >= 20) return 'Não Satisfaz';
  return 'Muito Fraco';
}

export interface WorldProgressionPolicyResult {
  isUnlocked: boolean;
  isCompleted: boolean;
  allSimulatorsCompleted: boolean;
  hasAssessment: boolean;
  hasAssessmentPassed: boolean;
  bestAssessmentPercentage: number;
  completedSimulatorsCount: number;
  totalSimulatorsCount: number;
  average: number;
  missingRequirements: string[];
}
