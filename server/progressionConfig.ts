/**
 * Missão TIC — 6.º Ano
 * Centralized Progression Configuration & Rules
 *
 * Single Source of Truth for:
 * - Curricular competency thresholds (75%)
 * - World unlocking prerequisites
 * - Required components per world
 * - XP rewards for milestones
 */

export const PROGRESSION_CONFIG = {
  // Single authoritative competency threshold (in %)
  PASSING_THRESHOLD: 75,

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
    GRANDE_MISSAO: 150,
    WEEKLY_CHALLENGE: 50,
    DAILY_TIP: 10,
    WORLD_MISSION_MAX: 100,
    SIMULATOR_MAX: 100,
    ASSESSMENT_MAX: 100,
  },

  // Badge unlock rules
  BADGES: {
    MIN_ACTIVITIES_FOR_WORLD_BADGE: 3,
    CENTURION_XP_THRESHOLD: 1000,
  },
} as const;

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
