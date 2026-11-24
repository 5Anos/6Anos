export interface StudentUser {
  id: string;              // UID único (ex: "aluno_6a_01" ou gerado pelo Firebase Auth/DB)
  fullName: string;        // Nome completo oficial (ex: "Anderson Oliveira dos Santos")
  name: string;            // Nome curto (ex: "Anderson Oliveira")
  turma: string;           // Turma normalizada (ex: "6.º A")
  studentNumber: number;   // Número de chamada na pauta (ex: 1, 2, 3...)
  username: string;        // Nome de utilizador simples (ex: "anderson.santos")
  email: string;           // Email virtual/real (ex: "anderson.santos@escola.local")
  initialPassword: string; // Palavra-passe legível em texto limpo para o cartão (ex: "sol350")
  role: 'student';
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  fullName?: string;
  turma?: string;
  studentNumber?: number | null;
  username?: string;
  initialPassword?: string;
  email: string;
  nickname: string;
  avatar: string;
  role: 'student' | 'teacher';
  classId: string;
  className?: string;
  locale: 'pt' | 'en';
  xp: number;
  level: number;
  levelName: string;
  blocked: boolean;
  mustChangePassword?: boolean;
}

export interface WorldSummary {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  isUnlocked: boolean;
  isCompleted?: boolean;
  hasAssessment?: boolean;
  hasAssessmentPassed?: boolean;
  average: number;
  completedCount: number;
  totalComponents: number;
  challengeProgress: { completed: boolean; score: number } | null;
  missionProgress: { status: 'pending' | 'graded'; score: number; feedback?: string } | null;
  bestAssessmentPercentage: number | null;
  simulatorsProgress: { id: string; completed: boolean; score: number }[];
  intro: {
    greeting: string;
    description: string[];
    mission: string;
  };
  topics: {
    id: string;
    number: number;
    title: string;
    paragraphs: string[];
    bulletPoints?: string[];
    takeaway?: string;
  }[];
  simulators: {
    id: string;
    name: string;
    description: string;
    xpReward: number;
  }[];
  challenge: {
    id: string;
    title: string;
    description: string;
    xpReward: number;
  };
  mission: {
    id: string;
    title: string;
    description: string;
    instructions: string[];
    xpReward: number;
  };
}

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  awardedAt: string | null;
}

export interface RankingStudent {
  position: number;
  rank?: number;
  id: string;
  nickname: string;
  avatar: string;
  xp: number;
  level: number;
  levelName: string;
  classId?: string;
  className?: string;
  isCurrentUser: boolean;
  // Strictly populated ONLY for authenticated teachers (never returned to students)
  realName?: string;
  fullName?: string;
  username?: string;
  studentNumber?: number | null;
  turma?: string;
}

export interface ClassLeaderboardMember {
  id: string;
  nickname: string;
  avatar: string;
  xp: number;
  level: number;
  levelName: string;
  weeklyChallengesCount: number;
  activitiesCompleted: number;
  isCurrentUser: boolean;
}

export interface ClassLeaderboardEntry {
  position: number;
  classId: string;
  className: string;
  isUserClass: boolean;
  studentCount: number;
  activeStudentsCount: number;
  totalXp: number;
  averageXp: number;
  weeklyChallengesCompleted: number;
  currentWeekCompletedCount: number;
  currentWeekParticipationPct: number;
  activitiesCompleted: number;
  quizzesCompleted: number;
  missionsCompleted: number;
  totalChallengesAndActivities: number;
  averageScorePct: number;
  topContributors: ClassLeaderboardMember[];
  members: ClassLeaderboardMember[];
}

export interface AssessmentQuestion {
  id: string;
  number: number;
  text: string;
  options: string[];
}

export interface AssessmentResultFeedback {
  id: string;
  text: string;
  chosenIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export interface AssessmentSubmissionResult {
  percentage: number;
  mention: string;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  isFirstAttempt: boolean;
  attemptNumber: number;
  officialPercentage?: number;
  officialMention?: string;
  previousBest: number;
  newBest: number;
  bestMention?: string;
  evolution?: 'improved' | 'maintained' | 'regressed';
  xpGain: number;
  totalXp: number;
  attemptsHistory?: {
    attemptNumber: number;
    mention: string;
    createdAt?: string;
  }[];
  resultsFeedback: AssessmentResultFeedback[];
}

export interface DailyTipData {
  tip: {
    id: string;
    pt: string;
    en: string;
  };
  alreadyClaimed: boolean;
  xpReward: number;
}

export interface AnnualWeeklyScheduleItem {
  weekNumber: number;
  id: string;
  worldId: number;
  worldName: string;
  category: string;
  difficulty: 'Fácil' | 'Médio' | 'Desafio';
  title: string;
  dateRangeLabel: string;
  xpReward: number;
  isCurrent: boolean;
  isPast: boolean;
  isFuture: boolean;
  completed: boolean;
}

export interface WeeklyChallengeData {
  challenge: {
    id: string;
    weekNumber: number;
    isoYear: number;
    isoWeek: number;
    worldId: number;
    worldName: string;
    category: string;
    difficulty: 'Fácil' | 'Médio' | 'Desafio';
    title: string;
    context: string;
    scenarioLabel: string;
    senderOrSource?: string;
    messageSample: string;
    problem: string;
    task: string;
    dateRangeLabel: string;
    daysUntilNextMonday: number;
    options: { id: string | number; text: string }[];
    xpReward: number;
    completed: boolean;
    isPreview?: boolean;
  };
  alreadyCompleted?: boolean;
  isPreview?: boolean;
  annualProgress?: {
    isoYear: number;
    currentWeekNumber: number;
    completedCount: number;
    totalWeeks: number;
    schedule: AnnualWeeklyScheduleItem[];
  };
}

