import { resolveStudentSafeNickname, isNicknameUnsafeOrMissing } from './nicknames';

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

export interface ComputeClassLeaderboardInput {
  classes: { id: string; name: string; archived?: boolean }[];
  students: {
    id: string;
    name?: string;
    fullName?: string;
    username?: string;
    email?: string;
    nickname?: string;
    avatar?: string;
    classId?: string;
    turma?: string;
    xp?: number;
    blocked?: boolean;
  }[];
  activityProgress: {
    userId: string;
    activityId?: string;
    worldId?: number;
    bestScore?: number;
    score?: number;
    completed?: boolean;
  }[];
  assessmentAttempts: {
    userId: string;
    worldId?: number;
    percentage?: number;
    score?: number;
    passed?: boolean;
  }[];
  weeklyChallenges: {
    userId: string;
    challengeId: string;
    completed?: boolean;
    status?: string;
  }[];
  missionSubmissions: {
    userId: string;
    worldId?: number;
    score?: number;
    status?: string;
  }[];
  grandeMissaoProgress: {
    userId: string;
    status?: string;
  }[];
  currentWeekChallengeId: string;
  currentWeekNumber?: number;
  activeUserId?: string | null;
  activeUserClassId?: string | null;
  calculateLevel: (xp: number) => { level: number; name: string };
}

/**
 * Computes the inter-class leaderboard (Ranking de Turmas) contemplating ALL
 * scores (XP from simulators, world challenges, quizzes, weekly challenges,
 * daily tips, graded missions, and Grande Missão).
 *
 * STRICT PRIVACY GUARANTEE:
 * Output NEVER contains real student names, full names, emails, usernames,
 * or student numbers — ONLY verified anonymous nicknames.
 */
export function computeClassesLeaderboard(input: ComputeClassLeaderboardInput): {
  classesRanking: ClassLeaderboardEntry[];
  nicknameBackfills: { userId: string; nickname: string }[];
  summary: {
    totalClasses: number;
    totalStudents: number;
    totalXp: number;
    totalWeeklyChallenges: number;
    currentWeekChallengeId: string;
  };
} {
  const {
    classes,
    students,
    activityProgress,
    assessmentAttempts,
    weeklyChallenges,
    missionSubmissions,
    grandeMissaoProgress,
    currentWeekChallengeId,
    currentWeekNumber,
    activeUserId,
    activeUserClassId,
    calculateLevel,
  } = input;

  const activeStudents = students.filter((s) => !s.blocked);

  // 1. Resolve unique, RGPD-safe anonymous nicknames for every student
  const usedNicknames = new Set<string>();
  activeStudents.forEach((s) => {
    if (!isNicknameUnsafeOrMissing(s.nickname, s)) {
      usedNicknames.add(String(s.nickname).trim().toLowerCase());
    }
  });

  const safeNickById = new Map<string, string>();
  const nicknameBackfills: { userId: string; nickname: string }[] = [];

  for (const s of activeStudents) {
    const resolved = resolveStudentSafeNickname(s, usedNicknames);
    safeNickById.set(s.id, resolved.nickname);
    if (resolved.needsPersist) {
      nicknameBackfills.push({ userId: s.id, nickname: resolved.nickname });
    }
  }

  // 2. Index per-student activity, quiz, weekly challenge, mission & Grande Missão stats
  const studentActivities = new Map<string, { completedCount: number; scores: number[] }>();
  for (const prog of activityProgress) {
    if (!prog.userId) continue;
    if (prog.completed) {
      const entry = studentActivities.get(prog.userId) || { completedCount: 0, scores: [] };
      entry.completedCount += 1;
      const sc = Number(prog.bestScore ?? prog.score ?? 0);
      if (!Number.isNaN(sc)) entry.scores.push(Math.max(0, Math.min(100, sc)));
      studentActivities.set(prog.userId, entry);
    }
  }

  // Best assessment percentage per (userId, worldId)
  const studentAssessments = new Map<string, Map<number, number>>();
  for (const att of assessmentAttempts) {
    if (!att.userId) continue;
    const wId = Number(att.worldId || 0);
    const pct = Number(att.percentage ?? att.score ?? 0);
    if (Number.isNaN(pct)) continue;
    let worldMap = studentAssessments.get(att.userId);
    if (!worldMap) {
      worldMap = new Map<number, number>();
      studentAssessments.set(att.userId, worldMap);
    }
    const prev = worldMap.get(wId) ?? -1;
    if (pct > prev) worldMap.set(wId, Math.max(0, Math.min(100, pct)));
  }

  // Completed weekly challenges per userId (deduplicated by challengeId)
  const studentWeeklySet = new Map<string, Set<string>>();
  for (const wc of weeklyChallenges) {
    if (!wc.userId || !wc.challengeId) continue;
    if (wc.status === 'pending' || wc.completed === false) continue;
    let set = studentWeeklySet.get(wc.userId);
    if (!set) {
      set = new Set<string>();
      studentWeeklySet.set(wc.userId, set);
    }
    set.add(wc.challengeId);
  }

  // Graded real missions per userId
  const studentMissions = new Map<string, { count: number; scores: number[] }>();
  for (const ms of missionSubmissions) {
    if (!ms.userId || ms.status !== 'graded') continue;
    const entry = studentMissions.get(ms.userId) || { count: 0, scores: [] };
    entry.count += 1;
    const sc = Number(ms.score ?? 0);
    if (!Number.isNaN(sc)) entry.scores.push(Math.max(0, Math.min(100, sc)));
    studentMissions.set(ms.userId, entry);
  }

  // Completed Grande Missão per userId
  const studentGrandeMissao = new Set<string>();
  for (const gm of grandeMissaoProgress) {
    if (gm.userId && gm.status === 'completed') {
      studentGrandeMissao.add(gm.userId);
    }
  }

  // 3. Build active classes registry (all non-archived classes + any classId present on students)
  const activeClassMap = new Map<string, { id: string; name: string }>();
  classes
    .filter((c) => !c.archived && c.id)
    .forEach((c) => {
      activeClassMap.set(c.id, { id: c.id, name: c.name || c.id });
    });

  // Also ensure classes referenced by students (whose class isn't archived) are included
  const archivedClassIds = new Set(classes.filter((c) => c.archived).map((c) => c.id));
  for (const s of activeStudents) {
    if (s.classId && !archivedClassIds.has(s.classId) && !activeClassMap.has(s.classId)) {
      activeClassMap.set(s.classId, {
        id: s.classId,
        name: s.turma || s.classId.replace(/^class-/i, '').toUpperCase(),
      });
    }
  }

  // Group students by classId
  const studentsByClass = new Map<string, typeof activeStudents>();
  for (const clsId of activeClassMap.keys()) {
    studentsByClass.set(clsId, []);
  }
  for (const s of activeStudents) {
    if (s.classId && studentsByClass.has(s.classId)) {
      studentsByClass.get(s.classId)!.push(s);
    }
  }

  // 4. Aggregate metrics per class
  const rawEntries: Omit<ClassLeaderboardEntry, 'position'>[] = [];

  for (const [classId, clsInfo] of activeClassMap.entries()) {
    const classStudents = studentsByClass.get(classId) || [];
    const studentCount = classStudents.length;

    let activeStudentsCount = 0;
    let totalXp = 0;
    let weeklyChallengesCompleted = 0;
    let currentWeekCompletedCount = 0;
    let activitiesCompleted = 0;
    let quizzesCompleted = 0;
    let missionsCompleted = 0;
    let sumStudentAvgPct = 0;

    const members: ClassLeaderboardMember[] = [];

    for (const s of classStudents) {
      const xp = Number(s.xp) || 0;
      const safeNickname = safeNickById.get(s.id) || 'Explorador_TIC';
      const lvl = calculateLevel(xp);

      const act = studentActivities.get(s.id) || { completedCount: 0, scores: [] };
      const assessMap = studentAssessments.get(s.id);
      const assessScores = assessMap ? Array.from(assessMap.values()) : [];
      const weeklySet = studentWeeklySet.get(s.id);
      const weeklyCount = weeklySet ? weeklySet.size : 0;
      const didCurrentWeek = Boolean(
        weeklySet &&
          (weeklySet.has(currentWeekChallengeId) ||
            (currentWeekNumber === 1 && weeklySet.has('challenge-phishing-message')))
      );
      const mis = studentMissions.get(s.id) || { count: 0, scores: [] };
      const didGM = studentGrandeMissao.has(s.id);

      const studentTotalDone =
        weeklyCount + act.completedCount + assessScores.length + mis.count + (didGM ? 1 : 0);

      if (xp > 0 || studentTotalDone > 0) {
        activeStudentsCount += 1;
      }

      totalXp += xp;
      weeklyChallengesCompleted += weeklyCount;
      if (didCurrentWeek) currentWeekCompletedCount += 1;
      activitiesCompleted += act.completedCount;
      quizzesCompleted += assessScores.length;
      missionsCompleted += mis.count + (didGM ? 1 : 0);

      const allStudentScores = [...act.scores, ...assessScores, ...mis.scores];
      const studentAvg =
        allStudentScores.length > 0
          ? allStudentScores.reduce((acc, v) => acc + v, 0) / allStudentScores.length
          : 0;
      sumStudentAvgPct += studentAvg;

      members.push({
        id: s.id,
        nickname: safeNickname,
        avatar: s.avatar || 'avatar-boy-1',
        xp,
        level: lvl.level,
        levelName: lvl.name,
        weeklyChallengesCount: weeklyCount,
        activitiesCompleted: act.completedCount + assessScores.length,
        isCurrentUser: Boolean(activeUserId && activeUserId === s.id),
      });
    }

    // Sort members by XP desc, then weeklyChallengesCount desc, then nickname
    members.sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      if (b.weeklyChallengesCount !== a.weeklyChallengesCount) {
        return b.weeklyChallengesCount - a.weeklyChallengesCount;
      }
      return a.nickname.localeCompare(b.nickname, 'pt');
    });

    const averageXp = studentCount > 0 ? Math.round(totalXp / studentCount) : 0;
    const averageScorePct = studentCount > 0 ? Math.round(sumStudentAvgPct / studentCount) : 0;
    const currentWeekParticipationPct =
      studentCount > 0 ? Math.round((currentWeekCompletedCount / studentCount) * 100) : 0;
    const totalChallengesAndActivities =
      weeklyChallengesCompleted + activitiesCompleted + quizzesCompleted + missionsCompleted;

    rawEntries.push({
      classId,
      className: clsInfo.name,
      isUserClass: Boolean(activeUserClassId && activeUserClassId === classId),
      studentCount,
      activeStudentsCount,
      totalXp,
      averageXp,
      weeklyChallengesCompleted,
      currentWeekCompletedCount,
      currentWeekParticipationPct,
      activitiesCompleted,
      quizzesCompleted,
      missionsCompleted,
      totalChallengesAndActivities,
      averageScorePct,
      topContributors: members.slice(0, 3),
      members,
    });
  }

  // 5. Rank classes fairly:
  // Primary: averageXp (fair across different class sizes, encompasses all scores & challenges)
  // Tie-breakers: weeklyChallengesCompleted -> averageScorePct -> totalXp -> className
  rawEntries.sort((a, b) => {
    if (b.averageXp !== a.averageXp) return b.averageXp - a.averageXp;
    if (b.weeklyChallengesCompleted !== a.weeklyChallengesCompleted) {
      return b.weeklyChallengesCompleted - a.weeklyChallengesCompleted;
    }
    if (b.averageScorePct !== a.averageScorePct) return b.averageScorePct - a.averageScorePct;
    if (b.totalXp !== a.totalXp) return b.totalXp - a.totalXp;
    return a.className.localeCompare(b.className, 'pt');
  });

  const classesRanking: ClassLeaderboardEntry[] = rawEntries.map((entry, idx) => ({
    ...entry,
    position: idx + 1,
  }));

  return {
    classesRanking,
    nicknameBackfills,
    summary: {
      totalClasses: classesRanking.length,
      totalStudents: classesRanking.reduce((acc, c) => acc + c.studentCount, 0),
      totalXp: classesRanking.reduce((acc, c) => acc + c.totalXp, 0),
      totalWeeklyChallenges: classesRanking.reduce((acc, c) => acc + c.weeklyChallengesCompleted, 0),
      currentWeekChallengeId,
    },
  };
}
