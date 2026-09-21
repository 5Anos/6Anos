/**
 * Missão TIC — 6.º Ano
 * Centralized Progression Configuration (Client Mirror)
 */

export const PROGRESSION_CONFIG = {
  // Authoritative passing/competency threshold for world average (in %)
  PASSING_THRESHOLD: 70,

  // Curricular Quiz Approval threshold (>= 50%)
  QUIZ_PASSING_THRESHOLD: 50,

  // Total worlds
  TOTAL_WORLDS: 5,

  // Standard Milestone XP Rewards
  XP_REWARDS: {
    INITIAL_WELCOME: 100,
    GRANDE_MISSAO: 150,
    WEEKLY_CHALLENGE: 30,
    DAILY_TIP: 20,
    WORLD_MISSION_MAX: 100,
    SIMULATOR_MAX: 100,
    ASSESSMENT_MAX: 0,
  },

  BADGES: {
    MIN_ACTIVITIES_FOR_WORLD_BADGE: 3,
    CENTURION_XP_THRESHOLD: 1000,
  },
} as const;

export function isWorldPassed(score: number): boolean {
  return score > PROGRESSION_CONFIG.PASSING_THRESHOLD;
}

export function isQuizPassed(percentage: number): boolean {
  return Math.round(percentage) >= PROGRESSION_CONFIG.QUIZ_PASSING_THRESHOLD;
}

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

