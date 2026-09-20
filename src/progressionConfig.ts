/**
 * Missão TIC — 6.º Ano
 * Centralized Progression Configuration (Client Mirror)
 */

export const PROGRESSION_CONFIG = {
  // Authoritative passing/competency threshold (in %)
  PASSING_THRESHOLD: 75,

  // Total worlds
  TOTAL_WORLDS: 5,

  // Standard Milestone XP Rewards
  XP_REWARDS: {
    GRANDE_MISSAO: 150,
    WEEKLY_CHALLENGE: 50,
    DAILY_TIP: 10,
    WORLD_MISSION_MAX: 100,
    SIMULATOR_MAX: 100,
    ASSESSMENT_MAX: 100,
  },

  BADGES: {
    MIN_ACTIVITIES_FOR_WORLD_BADGE: 3,
    CENTURION_XP_THRESHOLD: 1000,
  },
} as const;

export function isWorldPassed(score: number): boolean {
  return score >= PROGRESSION_CONFIG.PASSING_THRESHOLD;
}
