export interface AuthUser {
  id: string;
  name: string;
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
  id: string;
  nickname: string;
  avatar: string;
  xp: number;
  level: number;
  levelName: string;
  isCurrentUser: boolean;
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

export interface WeeklyChallengeData {
  challenge: {
    id: string;
    title: string;
    context: string;
    messageSample: string;
    problem: string;
    task: string;
    options: { id: number; text: string }[];
    xpReward: number;
    completed: boolean;
  };
}
