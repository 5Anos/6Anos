import {
  clientGetClasses,
  clientLogin,
  clientRegister,
  clientGetCurrentUser,
  clientUpdateProfile,
  clientLogout,
  clientGetWorlds,
  clientCompleteActivity,
  clientGetAssessment,
  clientSubmitAssessment,
  clientGetClassRanking,
  clientGetDailyTip,
  clientClaimDailyTip,
  clientGetWeeklyChallenge,
  clientSubmitWeeklyChallenge,
  clientGetGrandeMissao,
  clientSaveGrandeMissaoStage,
  clientCompleteGrandeMissao,
  clientSubmitMission,
  clientComputeWorldStats,
  getActiveClientUserId,
  sanitizeClientUser,
  ClientUser,
} from './clientFirestoreService';
import { getClientFirestore } from './firebaseClient';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  runTransaction,
} from 'firebase/firestore';
import {
  WORLDS_DATA,
  BADGES_CATALOG,
  FINAL_ASSESSMENTS,
  GRANDE_MISSAO,
  WEEKLY_CHALLENGE,
  DAILY_TIPS,
  calculateLevel,
} from '../data/catalog';
import { PROGRESSION_CONFIG, getQualitativeMention } from '../progressionConfig';
import {
  extractShortName,
  generateKidUsername,
  generateKidPassword,
  normalizeTurmaTag,
  normalizeTurmaName,
} from '../utils/kidCredentials';
import { hashPasswordClient } from './clientAuthUtils';
import { buildStaticSocraticHint } from './simulatorHints';

export async function clientDispatch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const urlObj = new URL(endpoint, 'http://localhost');
  const pathname = urlObj.pathname;
  const searchParams = urlObj.searchParams;

  let body: any = {};
  if (options.body && typeof options.body === 'string') {
    try {
      body = JSON.parse(options.body);
    } catch {}
  }

  // 1. AUTH ROUTES
  if (pathname === '/api/auth/classes') {
    const classes = await clientGetClasses();
    return { classes } as any;
  }

  if (pathname === '/api/auth/login' && method === 'POST') {
    const identifier = body.email || body.identifier || body.nickname || body.username || '';
    const res = await clientLogin(identifier, body.password);
    return res as any;
  }

  if (pathname === '/api/auth/register' && method === 'POST') {
    const res = await clientRegister({
      name: body.name,
      email: body.email,
      password: body.password,
      nickname: body.nickname,
      classId: body.classId || body.classCode || body.classroomCode,
      avatar: body.avatar,
      locale: body.locale,
    });
    return res as any;
  }

  if (pathname === '/api/auth/me') {
    const res = await clientGetCurrentUser();
    return res as any;
  }

  if (pathname === '/api/auth/profile' && method === 'POST') {
    const res = await clientUpdateProfile(body);
    return res as any;
  }

  if (pathname === '/api/auth/logout' && method === 'POST') {
    return clientLogout() as any;
  }

  // 2. PEDAGOGICAL ROUTES
  if (pathname === '/api/pedagogical/worlds') {
    const res = await clientGetWorlds();
    return res as any;
  }

  if (pathname === '/api/pedagogical/activities/complete' && method === 'POST') {
    const rawScore = typeof body.score === 'number' ? body.score : 100;
    const res = await clientCompleteActivity(body.activityId, rawScore, body.durationSeconds);
    return res as any;
  }

  const assessMatch = pathname.match(/^\/api\/pedagogical\/assessments\/(\d+)(\/submit)?$/);
  if (assessMatch) {
    const worldId = parseInt(assessMatch[1], 10);
    if (method === 'POST') {
      const res = await clientSubmitAssessment(worldId, body.answers || {}, body.durationSeconds);
      return res as any;
    } else {
      const res = await clientGetAssessment(worldId);
      return res as any;
    }
  }

  if (pathname === '/api/pedagogical/class-ranking') {
    const res = await clientGetClassRanking();
    return res as any;
  }

  if (pathname === '/api/pedagogical/daily-tip/claim' && method === 'POST') {
    const res = await clientClaimDailyTip();
    return res as any;
  }

  if (pathname === '/api/pedagogical/daily-tip') {
    const res = await clientGetDailyTip();
    return res as any;
  }

  if (pathname === '/api/pedagogical/weekly-challenge' || pathname === '/api/pedagogical/weekly-challenge/submit') {
    if (method === 'POST') {
      const res = await clientSubmitWeeklyChallenge(body);
      return res as any;
    } else {
      const res = await clientGetWeeklyChallenge();
      return res as any;
    }
  }

  const missionSubmitMatch = pathname.match(/^\/api\/pedagogical\/missions\/(\d+)$/);
  if (missionSubmitMatch && method === 'POST') {
    const worldId = parseInt(missionSubmitMatch[1], 10);
    const text = body.submission || body.submissionText || body.content || '';
    const res = await clientSubmitMission(worldId, text);
    return res as any;
  }

  if (pathname === '/api/pedagogical/grande-missao/stage' && method === 'POST') {
    const res = await clientSaveGrandeMissaoStage(body);
    return res as any;
  }

  if (pathname === '/api/pedagogical/grande-missao/complete' && method === 'POST') {
    const res = await clientCompleteGrandeMissao();
    return res as any;
  }

  if (pathname === '/api/pedagogical/grande-missao') {
    const res = await clientGetGrandeMissao();
    return res as any;
  }

  // 2.5 STATIC-HOST SOCRATIC HINTS (GitHub Pages without Node backend)
  if (pathname === '/api/ai/simulator-hint' && method === 'POST') {
    const hint = buildStaticSocraticHint({
      simulatorId: typeof body.simulatorId === 'string' ? body.simulatorId : '',
      worldId: Number(body.worldId) || 1,
      score: typeof body.score === 'number' ? body.score : undefined,
      attemptSummary: typeof body.attemptSummary === 'string' ? body.attemptSummary : undefined,
      userMessage: typeof body.userMessage === 'string' ? body.userMessage : undefined,
      turnCount: Array.isArray(body.history) ? body.history.length : 0,
    });
    return {
      hint,
      simulatorId: body.simulatorId || '',
      simulatorTitle: body.simulatorTitle || 'Atividade de TIC',
    } as any;
  }


  // 3. TEACHER ROUTES DIRECTLY ON FIRESTORE
  const db = getClientFirestore();

  if (pathname === '/api/teacher/dashboard-stats') {
    const classId = searchParams.get('classId') || 'all';
    const qUsers = query(collection(db, 'users'));
    const userSnap = await getDocs(qUsers);
    const allUsers = userSnap.docs.map((d) => d.data() as ClientUser);
    const allStudents = allUsers.filter((u) => u.role === 'student');
    const totalStudentsAll = allStudents.length;
    let students = allStudents;
    if (classId && classId !== 'all') {
      students = students.filter((s) => s.classId === classId);
    }
    const classes = (await clientGetClasses()).sort((a: any, b: any) =>
      (a.name || '').localeCompare(b.name || '', 'pt', { numeric: true, sensitivity: 'base' })
    );

    const [assessSnap, progSnap] = await Promise.all([
      getDocs(collection(db, 'assessmentAttempts')),
      getDocs(collection(db, 'activityProgress')),
    ]);
    const allAssessments = assessSnap.docs.map((d) => d.data() as any);
    const allProgress = progSnap.docs.map((d) => d.data() as any);

    const studentIds = new Set(students.map((s) => s.id));
    const allSimIds = new Set(WORLDS_DATA.flatMap((w) => w.simulators.map((sim) => sim.id)));
    const totalStudents = students.length;
    const activeStudents = students.filter((s) => !s.blocked).length;
    const totalXP = students.reduce((acc, s) => acc + (s.xp || 0), 0);
    const avgXP = totalStudents > 0 ? Math.round(totalXP / totalStudents) : 0;
    const totalSimulatorsCompleted = allProgress.filter(
      (p) => studentIds.has(p.userId) && allSimIds.has(p.activityId) && (p.completed || (p.bestScore && p.bestScore > 0))
    ).length;
    const totalQuizzesAttempted = allAssessments.filter((a) => studentIds.has(a.userId)).length;

    const studentWorldAvgsMap = new Map<string, number[]>();
    const lowWorldStudentIds = new Set<string>();

    const worldPerformance = WORLDS_DATA.map((w) => {
      let sumAvg = 0;
      let count = 0;
      let completedCount = 0;

      for (const s of students) {
        const worldSims = w.simulators;
        const studentSims = allProgress.filter(
          (p) => p.userId === s.id && worldSims.some((sim) => sim.id === p.activityId) && (p.completed || (p.bestScore && p.bestScore > 0))
        );
        const attempts = allAssessments.filter((a) => a.userId === s.id && a.worldId === w.id);

        const canonicalScores: number[] = studentSims.map((p: any) => Number(p.bestScore) || 0);
        if (attempts.length > 0) {
          canonicalScores.push(Math.max(...attempts.map((a: any) => Number(a.percentage) || 0)));
        }

        if (canonicalScores.length > 0) {
          const studentWorldAvg = Number(
            (canonicalScores.reduce((a, b) => a + b, 0) / canonicalScores.length).toFixed(1)
          );
          sumAvg += studentWorldAvg;
          count++;
          const list = studentWorldAvgsMap.get(s.id) || [];
          list.push(studentWorldAvg);
          studentWorldAvgsMap.set(s.id, list);

          if (studentWorldAvg < 50) {
            lowWorldStudentIds.add(s.id);
          }
          const allSimsDone = studentSims.length >= worldSims.length;
          if (allSimsDone && attempts.length > 0 && studentWorldAvg > PROGRESSION_CONFIG.PASSING_THRESHOLD) {
            completedCount++;
          }
        }
      }

      // Média da turma: soma das médias a dividir por todos os alunos da turma (quem não realizou conta 0%)
      const averageScore = totalStudents > 0 ? Math.round(sumAvg / totalStudents) : 0;
      return {
        worldId: w.id,
        title: w.title,
        averageScore,
        studentsAttempted: count,
        totalStudents,
        studentsCompleted: completedCount,
        classAverage: averageScore,
        studentsActive: count,
        studentsUnlockedNext: completedCount,
      };
    });

    let classGlobalSum = 0;
    for (const s of students) {
      const avgs = studentWorldAvgsMap.get(s.id);
      if (avgs && avgs.length > 0) {
        classGlobalSum += avgs.reduce((a, b) => a + b, 0) / avgs.length;
      }
    }
    const globalAverageScore =
      totalStudents > 0 ? Math.round(classGlobalSum / totalStudents) : 0;

    const studentsNeedingHelp = students.filter((s) => {
      const failedAttempts = allAssessments.filter((a) => a.userId === s.id && (Number(a.percentage) || 0) < 50).length;
      return failedAttempts >= 2 || lowWorldStudentIds.has(s.id);
    }).length;

    return {
      totalStudents,
      totalStudentsAll,
      activeStudents,
      totalClasses: classes.length,
      classes,
      totalQuizzesAttempted,
      totalSimulatorsCompleted,
      globalAverageScore,
      avgXP,
      studentsNeedingHelp,
      worldPerformance,
      worldStats: worldPerformance,
    } as any;
  }

  if (pathname === '/api/teacher/students' && method === 'GET') {
    const classId = searchParams.get('classId');
    const [userSnap, classes, progSnap, assessSnap, missionSnap] = await Promise.all([
      getDocs(query(collection(db, 'users'), where('role', '==', 'student'))),
      clientGetClasses(),
      getDocs(collection(db, 'activityProgress')),
      getDocs(collection(db, 'assessmentAttempts')),
      getDocs(collection(db, 'missionSubmissions')),
    ]);

    let students = userSnap.docs.map((d) => d.data() as ClientUser);
    const allProgress = progSnap.docs.map((d) => d.data() as any);
    const allAssessments = assessSnap.docs.map((d) => d.data() as any);
    const allMissions = missionSnap.docs.map((d) => d.data() as any);

    if (classId && classId !== 'all') {
      students = students.filter((s) => s.classId === classId);
    }

    const studentsFormatted = students.map((s) => {
      const sanitized = sanitizeClientUser(s);
      const classroom = classes.find((c: any) => c.id === s.classId);
      const userProg = allProgress.filter((p) => p.userId === s.id);
      const userAssess = allAssessments.filter((a) => a.userId === s.id);
      const userMissions = allMissions.filter((m) => m.userId === s.id);

      let prevUnlocked = true;
      let prevPassed = true;
      const worldAverages = WORLDS_DATA.map((w) => {
        const scores: number[] = [];
        let completedSimulatorsCount = 0;
        for (const sim of w.simulators) {
          const prog = userProg.find((p) => p.activityId === sim.id);
          if (prog && (prog.completed || (typeof prog.bestScore === 'number' && prog.bestScore > 0))) {
            completedSimulatorsCount++;
            scores.push(Number(prog.bestScore) || 0);
          }
        }
        const wAttempts = userAssess.filter((a) => a.worldId === w.id);
        const hasAssessment = wAttempts.length > 0;
        const bestAssess = hasAssessment
          ? Math.max(...wAttempts.map((a) => Number(a.percentage) || 0))
          : null;
        if (bestAssess !== null) scores.push(bestAssess);

        const average =
          scores.length > 0
            ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
            : 0;
        const allSimsDone = completedSimulatorsCount >= w.simulators.length;
        const isCompleted = allSimsDone && hasAssessment && average > PROGRESSION_CONFIG.PASSING_THRESHOLD;
        const isUnlocked = w.id === 1 ? true : prevUnlocked && prevPassed;

        prevUnlocked = isUnlocked;
        prevPassed = isCompleted;

        return {
          worldId: w.id,
          average,
          completedCount: scores.length,
          totalComponents: w.simulators.length + 1,
          isUnlocked,
          isCompleted,
          hasAssessmentPassed: bestAssess !== null && bestAssess >= PROGRESSION_CONFIG.QUIZ_PASSING_THRESHOLD,
        };
      });

      const activeWorlds = worldAverages.filter((w) => w.completedCount > 0);
      const globalAverage =
        activeWorlds.length > 0
          ? Number((activeWorlds.reduce((acc, w) => acc + w.average, 0) / activeWorlds.length).toFixed(1))
          : 0;

      const completedWorldsCount = worldAverages.filter((w) => w.isCompleted).length;
      const unlockedWorldsCount = worldAverages.filter((w) => w.isUnlocked).length;
      const simScores = userProg.filter((p) => p.completed).map((p) => Number(p.bestScore) || 0);
      const simulatorsAverage =
        simScores.length > 0 ? Math.round(simScores.reduce((a, b) => a + b, 0) / simScores.length) : 0;
      const assessScores = userAssess.map((a) => Number(a.percentage) || 0);
      const assessmentsAverage =
        assessScores.length > 0 ? Math.round(assessScores.reduce((a, b) => a + b, 0) / assessScores.length) : 0;

      const failedAttempts = userAssess.filter((a) => (Number(a.percentage) || 0) < 50).length;
      const lowWorldAvg = worldAverages.some((w) => w.isUnlocked && w.completedCount > 0 && w.average < 50);
      const needsHelp = failedAttempts >= 2 || lowWorldAvg;
      const pendingMissionsCount = userMissions.filter((m) => m.status === 'pending').length;

      return {
        ...sanitized,
        className: classroom ? classroom.name : s.turma || 'Sem Turma',
        turma: s.turma || (classroom ? classroom.name : 'Sem Turma'),
        globalAverage,
        overallAverage: globalAverage,
        completedWorldsCount,
        unlockedWorldsCount,
        simulatorsAverage,
        assessmentsAverage,
        pendingMissionsCount,
        progressPercentage: Math.round((completedWorldsCount / WORLDS_DATA.length) * 100),
        status: s.blocked ? 'suspended' : 'active',
        needsHelp,
        needsIntervention: needsHelp,
        helpReason: needsHelp
          ? failedAttempts >= 2
            ? 'Múltiplas tentativas de avaliação abaixo de 50%'
            : 'Média inferior a 50% num mundo ativo'
          : undefined,
        worldAverages,
      };
    });

    return { students: studentsFormatted } as any;
  }

  if (pathname === '/api/teacher/classes' && method === 'GET') {
    const classes = (await clientGetClasses()).sort((a: any, b: any) =>
      (a.name || '').localeCompare(b.name || '', 'pt', { numeric: true, sensitivity: 'base' })
    );
    return { classes } as any;
  }

  if (pathname === '/api/teacher/pauta') {
    const classId = searchParams.get('classId');
    const qUsers = query(collection(db, 'users'), where('role', '==', 'student'));
    const userSnap = await getDocs(qUsers);
    let students = userSnap.docs.map((d) => d.data() as ClientUser);
    const classes = await clientGetClasses();

    if (classId && classId !== 'all') {
      students = students.filter((s) => s.classId === classId);
    }

    const [assessSnap, progSnap, missionSnap] = await Promise.all([
      getDocs(collection(db, 'assessmentAttempts')),
      getDocs(collection(db, 'activityProgress')),
      getDocs(collection(db, 'missionSubmissions')),
    ]);
    const allAssessments = assessSnap.docs.map((d) => d.data() as any);
    const allProgress = progSnap.docs.map((d) => d.data() as any);
    const allMissions = missionSnap.docs.map((d) => d.data() as any);

    students.sort((a, b) => {
      if (a.studentNumber && b.studentNumber) return a.studentNumber - b.studentNumber;
      return a.name.localeCompare(b.name);
    });

    // 1. Pauta Geral (usa exatamente a mesma média canónica dos simuladores + melhor quiz)
    const pautaGeral = students.map((s, idx) => {
      const classroom = classes.find((c) => c.id === s.classId);
      const levelInfo = calculateLevel(s.xp || 0);

      const worldScores: number[] = [];
      for (const w of WORLDS_DATA) {
        const worldSims = w.simulators;
        const studentSims = allProgress.filter(
          (p) => p.userId === s.id && worldSims.some((sim) => sim.id === p.activityId) && (p.completed || (p.bestScore && p.bestScore > 0))
        );
        const worldAttempts = allAssessments.filter((a) => a.userId === s.id && a.worldId === w.id);
        const bestQuiz =
          worldAttempts.length > 0 ? Math.max(...worldAttempts.map((a: any) => a.percentage || 0)) : null;

        const canonicalScores: number[] = studentSims.map((p: any) => Number(p.bestScore) || 0);
        if (bestQuiz !== null) canonicalScores.push(Number(bestQuiz) || 0);

        const worldScore =
          canonicalScores.length > 0
            ? Number((canonicalScores.reduce((a, b) => a + b, 0) / canonicalScores.length).toFixed(1))
            : 0;
        worldScores.push(worldScore);
      }

      const activeScores = worldScores.filter((sc) => sc > 0);
      const globalAverage =
        activeScores.length > 0
          ? Number((activeScores.reduce((a, b) => a + b, 0) / activeScores.length).toFixed(1))
          : 0;

      return {
        studentId: s.id,
        studentName: s.fullName || s.name,
        studentNickname: s.nickname || s.username,
        classId: s.classId,
        className: classroom ? classroom.name : 'Sem Turma',
        studentNumber: s.studentNumber || idx + 1,
        worldScores,
        globalAverage,
        totalXP: s.xp || 0,
        level: levelInfo.level,
        levelName: levelInfo.name,
      };
    });

    // 2. Pautas por Mundo
    const pautasPorMundo = WORLDS_DATA.map((w) => {
      const worldStudents = students.map((s, idx) => {
        const classroom = classes.find((c) => c.id === s.classId);

        const worldSims = w.simulators;
        const studentSims = allProgress.filter(
          (p) => p.userId === s.id && worldSims.some((sim) => sim.id === p.activityId) && (p.completed || (p.bestScore && p.bestScore > 0))
        );
        const simulatorsAvg =
          studentSims.length > 0
            ? Math.round(studentSims.reduce((sum: number, p: any) => sum + (p.bestScore || 0), 0) / studentSims.length)
            : 0;

        const attempts = allAssessments
          .filter((a) => a.userId === s.id && a.worldId === w.id)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        const firstAttempt = attempts.length > 0 ? attempts[0] : null;
        const bestAttempt =
          attempts.length > 0
            ? attempts.reduce((max, a) => (a.percentage > max.percentage ? a : max), attempts[0])
            : null;

        const assessmentScore = bestAttempt ? bestAttempt.percentage : 0;
        const officialAssessmentScore = firstAttempt ? firstAttempt.percentage : null;
        const officialAssessmentMention = firstAttempt
          ? (firstAttempt.mention || getQualitativeMention(firstAttempt.percentage))
          : '—';
        const assessmentMention = bestAttempt
          ? (bestAttempt.mention || getQualitativeMention(bestAttempt.percentage))
          : '—';

        const wMission = allMissions.find((m) => m.userId === s.id && m.worldId === w.id);
        const missionScore = wMission && typeof wMission.score === 'number' ? wMission.score : 0;

        // Canonical World Average & Unlock Rule (exact match with /worlds and /students)
        const canonicalScores: number[] = studentSims.map((p: any) => Number(p.bestScore) || 0);
        if (bestAttempt) canonicalScores.push(Number(bestAttempt.percentage) || 0);
        const worldAverage =
          canonicalScores.length > 0
            ? Number((canonicalScores.reduce((a, b) => a + b, 0) / canonicalScores.length).toFixed(1))
            : 0;

        const isWorldPassed =
          studentSims.length >= worldSims.length &&
          bestAttempt !== null &&
          worldAverage > PROGRESSION_CONFIG.PASSING_THRESHOLD;

        return {
          studentId: s.id,
          studentName: s.fullName || s.name,
          studentNickname: s.nickname || s.username,
          classId: s.classId,
          className: classroom ? classroom.name : 'Sem Turma',
          studentNumber: s.studentNumber || idx + 1,
          simulatorsCount: studentSims.length,
          simulatorsTotal: worldSims.length,
          simulatorsAvg,
          missionScore,
          assessmentScore,
          officialAssessmentScore,
          officialAssessmentMention,
          assessmentMention,
          attemptsCount: attempts.length,
          worldAverage,
          isWorldPassed,
          isNextUnlocked: isWorldPassed,
          unlockedNext: isWorldPassed,
        };
      });

      return {
        worldId: w.id,
        worldTitle: w.title,
        students: worldStudents,
      };
    });

    return { pautaGeral, pautasPorMundo } as any;
  }

  if (pathname === '/api/teacher/assessments-summary') {
    const qUsers = query(collection(db, 'users'), where('role', '==', 'student'));
    const userSnap = await getDocs(qUsers);
    const students = userSnap.docs.map((d) => d.data() as ClientUser);
    const classes = await clientGetClasses();
    const assessSnap = await getDocs(collection(db, 'assessmentAttempts'));
    const allAssessments = assessSnap.docs.map((d) => d.data() as any);

    const worldsAssessments = WORLDS_DATA.map((w) => {
      const worldAttempts = allAssessments.filter((a) => a.worldId === w.id);
      const studentResults = students.map((s) => {
        const studentAttempts = worldAttempts.filter((a) => a.userId === s.id);
        const sorted = [...studentAttempts].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const first = sorted.length > 0 ? sorted[0] : null;
        const best = sorted.length > 0 ? sorted.reduce((max, a) => (a.percentage > max.percentage ? a : max), sorted[0]) : null;
        const last = sorted.length > 0 ? sorted[sorted.length - 1] : null;
        const classroom = classes.find((c) => c.id === s.classId);

        return {
          studentId: s.id,
          studentName: s.fullName || s.name,
          studentNickname: s.nickname,
          classId: s.classId,
          className: classroom ? classroom.name : 'Sem Turma',
          hasAttempted: sorted.length > 0,
          attemptsCount: sorted.length,
          officialPercentage: first ? first.percentage : null,
          officialMention: first ? (first.mention || getQualitativeMention(first.percentage)) : null,
          bestPercentage: best ? best.percentage : null,
          bestMention: best ? (best.mention || getQualitativeMention(best.percentage)) : null,
          lastPercentage: last ? last.percentage : null,
          lastMention: last ? (last.mention || getQualitativeMention(last.percentage)) : null,
          passed: first ? first.percentage >= 50 : false,
          firstAttemptAt: first ? first.createdAt : null,
          lastAttemptAt: last ? last.createdAt : null,
        };
      });

      const attempted = studentResults.filter((r) => r.hasAttempted);
      const passed = studentResults.filter((r) => r.passed);
      const avgScore = attempted.length > 0 ? Math.round(attempted.reduce((a, r) => a + (r.bestPercentage || 0), 0) / attempted.length) : 0;

      return {
        worldId: w.id,
        worldTitle: w.title,
        assessmentTitle: FINAL_ASSESSMENTS[w.id]?.title || `Avaliação do Mundo ${w.id}`,
        totalQuestions: FINAL_ASSESSMENTS[w.id]?.questions.length || 10,
        totalAttempted: attempted.length,
        totalPassed: passed.length,
        totalPending: students.length - attempted.length,
        averageScore: avgScore,
        students: studentResults,
      };
    });

    return { worldsAssessments } as any;
  }

  if (pathname === '/api/teacher/activities-summary') {
    const qUsers = query(collection(db, 'users'), where('role', '==', 'student'));
    const userSnap = await getDocs(qUsers);
    const students = userSnap.docs.map((d) => d.data() as ClientUser);
    const classes = await clientGetClasses();
    const progSnap = await getDocs(collection(db, 'activityProgress'));
    const allProgress = progSnap.docs.map((d) => d.data() as any);

    const worldsActivities = WORLDS_DATA.map((w) => {
      const sims = w.simulators.map((s) => {
        const studentStats = students
          .map((st) => {
            const prog = allProgress.find((p) => p.userId === st.id && p.activityId === s.id);
            const classroom = classes.find((c) => c.id === st.classId);
            return {
              studentId: st.id,
              studentName: st.fullName || st.name,
              studentNickname: st.nickname,
              studentNumber: st.studentNumber ?? null,
              classId: st.classId || '',
              className: classroom ? classroom.name : st.turma || 'Sem Turma',
              completed: prog ? (prog.completed || (typeof prog.bestScore === 'number' && prog.bestScore > 0)) : false,
              bestScore: prog ? Number(prog.bestScore) || 0 : 0,
              attempts: prog ? Number(prog.attempts) || 0 : 0,
              lastAttemptAt: prog ? prog.lastAttemptAt || prog.updatedAt || null : null,
            };
          })
          .sort((a, b) => {
            const clsCmp = a.className.localeCompare(b.className);
            if (clsCmp !== 0) return clsCmp;
            const numA = a.studentNumber ?? 9999;
            const numB = b.studentNumber ?? 9999;
            if (numA !== numB) return numA - numB;
            return a.studentName.localeCompare(b.studentName);
          });

        const completedCount = studentStats.filter((r) => r.completed).length;
        const avgScore = completedCount > 0 ? Math.round(studentStats.filter((r) => r.completed).reduce((a, r) => a + r.bestScore, 0) / completedCount) : 0;

        return {
          id: s.id,
          title: s.name,
          description: s.description,
          xpReward: s.xpReward,
          completedCount,
          pendingCount: students.length - completedCount,
          averageScore: avgScore,
          students: studentStats,
        };
      });

      return {
        worldId: w.id,
        worldTitle: w.title,
        activities: sims,
      };
    });

    return { worldsActivities } as any;
  }

  if (pathname === '/api/teacher/challenges-summary') {
    const [userSnap, classes, progSnap, weeklySnap] = await Promise.all([
      getDocs(query(collection(db, 'users'), where('role', '==', 'student'))),
      clientGetClasses(),
      getDocs(collection(db, 'activityProgress')),
      getDocs(collection(db, 'weeklyChallenges')),
    ]);
    const students = userSnap.docs.map((d) => d.data() as ClientUser);
    const allProgress = progSnap.docs.map((d) => d.data() as any);
    const allWeekly = weeklySnap.docs.map((d) => d.data() as any);

    const worldChallenges = WORLDS_DATA.map((w) => {
      const ch = w.challenge;
      const studentStats = students.map((st) => {
        const prog = allProgress.find((p) => p.userId === st.id && p.activityId === ch.id);
        const classroom = classes.find((c: any) => c.id === st.classId);
        return {
          studentId: st.id,
          studentName: st.fullName || st.name,
          studentNickname: st.nickname,
          className: classroom ? classroom.name : 'Sem Turma',
          completed: prog ? !!prog.completed : false,
          bestScore: prog ? Number(prog.bestScore) || 0 : 0,
          attempts: prog ? Number(prog.attempts) || 0 : 0,
          lastAttemptAt: prog ? prog.lastAttemptAt || prog.updatedAt || null : null,
        };
      });
      const completedCount = studentStats.filter((r) => r.completed).length;
      return {
        worldId: w.id,
        worldTitle: w.title,
        id: ch.id,
        title: ch.title,
        xpReward: ch.xpReward,
        completedCount,
        pendingCount: students.length - completedCount,
        students: studentStats,
      };
    });

    const weeklyStats = students.map((st) => {
      const prog = allWeekly.find((p) => p.userId === st.id && p.challengeId === WEEKLY_CHALLENGE.id);
      const classroom = classes.find((c: any) => c.id === st.classId);
      return {
        studentId: st.id,
        studentName: st.fullName || st.name,
        studentNickname: st.nickname,
        className: classroom ? classroom.name : 'Sem Turma',
        completed: !!prog,
        score: prog ? prog.score || 100 : 0,
        completedAt: prog ? prog.completedAt || null : null,
      };
    });

    return {
      worldChallenges,
      weeklyChallenge: {
        id: WEEKLY_CHALLENGE.id,
        title: WEEKLY_CHALLENGE.title,
        task: WEEKLY_CHALLENGE.task,
        xpReward: PROGRESSION_CONFIG.XP_REWARDS.WEEKLY_CHALLENGE,
        totalCompleted: weeklyStats.filter((r) => r.completed).length,
        students: weeklyStats,
      },
    } as any;
  }

  if (pathname === '/api/teacher/xp-breakdown') {
    const [userSnap, classes, txSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      clientGetClasses(),
      getDocs(collection(db, 'xpTransactions')),
    ]);
    const allUsers = userSnap.docs.map((d) => d.data() as ClientUser);
    const students = allUsers.filter((u) => u.role === 'student');
    const allTransactions = txSnap.docs
      .map((d) => d.data() as any)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const studentsBreakdown = students.map((s) => {
      const txs = allTransactions.filter((t) => t.userId === s.id);
      const classroom = classes.find((c: any) => c.id === s.classId);
      const levelInfo = calculateLevel(s.xp || 0);
      return {
        studentId: s.id,
        studentName: s.fullName || s.name,
        studentNickname: s.nickname,
        className: classroom ? classroom.name : 'Sem Turma',
        totalXP: s.xp || 0,
        level: levelInfo.level,
        levelName: levelInfo.name,
        sources: {
          initial: 0,
          activities: txs
            .filter((t) => t.sourceType === 'activity' || t.sourceType === 'simulator')
            .reduce((sum, t) => sum + (Number(t.xpGain) || 0), 0),
          challenges: txs
            .filter((t) => t.sourceType === 'challenge' || t.sourceType === 'weekly_challenge')
            .reduce((sum, t) => sum + (Number(t.xpGain) || 0), 0),
          assessments: txs
            .filter((t) => t.sourceType === 'assessment')
            .reduce((sum, t) => sum + (Number(t.xpGain) || 0), 0),
          missions: txs
            .filter((t) => t.sourceType === 'mission')
            .reduce((sum, t) => sum + (Number(t.xpGain) || 0), 0),
          dailyTips: txs
            .filter((t) => t.sourceType === 'daily_tip')
            .reduce((sum, t) => sum + (Number(t.xpGain) || 0), 0),
          grandeMissao: txs
            .filter((t) => t.sourceType === 'grande_missao')
            .reduce((sum, t) => sum + (Number(t.xpGain) || 0), 0),
          bonus: txs
            .filter((t) => t.sourceType === 'bonus')
            .reduce((sum, t) => sum + (Number(t.xpGain) || 0), 0),
        },
      };
    });

    return {
      studentsBreakdown,
      latestTransactions: allTransactions.slice(0, 50).map((t) => {
        const student = allUsers.find((u) => u.id === t.userId);
        return {
          ...t,
          studentName: student ? student.fullName || student.name : 'Aluno',
          studentNickname: student ? student.nickname : '',
        };
      }),
    } as any;
  }

  if (pathname === '/api/teacher/grande-missao-summary') {
    const [userSnap, classes, gmSnap] = await Promise.all([
      getDocs(query(collection(db, 'users'), where('role', '==', 'student'))),
      clientGetClasses(),
      getDocs(collection(db, 'grandeMissaoProgress')),
    ]);
    const students = userSnap.docs.map((d) => d.data() as ClientUser);
    const allGM = gmSnap.docs.map((d) => d.data() as any);

    const studentResults = students.map((s) => {
      const gm = allGM.find((g) => g.userId === s.id);
      const classroom = classes.find((c: any) => c.id === s.classId);
      return {
        studentId: s.id,
        studentName: s.fullName || s.name,
        studentNickname: s.nickname,
        className: classroom ? classroom.name : 'Sem Turma',
        status: gm ? gm.status : 'not_started',
        currentStage: gm ? gm.currentStage : 1,
        completedStages: gm ? gm.completedStages || [] : [],
        completedAt: gm ? gm.completedAt || null : null,
      };
    });

    return {
      config: GRANDE_MISSAO,
      totalCompleted: studentResults.filter((s) => s.status === 'completed').length,
      totalInProgress: studentResults.filter((s) => s.status === 'in_progress').length,
      totalNotStarted: studentResults.filter((s) => s.status === 'not_started').length,
      students: studentResults,
    } as any;
  }

  if (pathname === '/api/teacher/badges-summary') {
    const [userSnap, classes, badgeSnap] = await Promise.all([
      getDocs(query(collection(db, 'users'), where('role', '==', 'student'))),
      clientGetClasses(),
      getDocs(collection(db, 'badges')),
    ]);
    const students = userSnap.docs.map((d) => d.data() as ClientUser);
    const badgeMap = new Map<string, any>();
    for (const d of badgeSnap.docs) {
      const b = d.data() as any;
      if (b.userId && b.badgeId) {
        badgeMap.set(`${b.userId}_${b.badgeId}`, b);
      }
    }
    const allBadges = Array.from(badgeMap.values());

    const badgesCatalog = BADGES_CATALOG.map((b) => {
      const owned = allBadges.filter((ub) => ub.badgeId === b.id);
      return {
        ...b,
        unlockedCount: owned.length,
        percentage: students.length > 0 ? Math.round((owned.length / students.length) * 100) : 0,
      };
    });

    const studentsBadges = students.map((s) => {
      const classroom = classes.find((c: any) => c.id === s.classId);
      const userBadges = allBadges.filter((b) => b.userId === s.id);
      return {
        studentId: s.id,
        studentName: s.fullName || s.name,
        studentNickname: s.nickname,
        className: classroom ? classroom.name : 'Sem Turma',
        badgeCount: userBadges.length,
        badges: userBadges.map((b) => {
          const cat = BADGES_CATALOG.find((c) => c.id === b.badgeId);
          return {
            id: b.id,
            badgeId: b.badgeId,
            name: cat ? cat.title : b.badgeId,
            awardedAt: b.awardedAt,
          };
        }),
      };
    });

    return { badgesCatalog, studentsBadges } as any;
  }

  if (pathname === '/api/teacher/daily-tips-summary') {
    const [userSnap, classes, claimsSnap] = await Promise.all([
      getDocs(query(collection(db, 'users'), where('role', '==', 'student'))),
      clientGetClasses(),
      getDocs(collection(db, 'dailyTipClaims')),
    ]);
    const students = userSnap.docs.map((d) => d.data() as ClientUser);
    const allClaims = claimsSnap.docs.map((d) => d.data() as any);

    const studentStats = students.map((s) => {
      const claims = allClaims.filter((c) => c.userId === s.id);
      const classroom = classes.find((c: any) => c.id === s.classId);
      return {
        studentId: s.id,
        studentName: s.fullName || s.name,
        studentNickname: s.nickname,
        className: classroom ? classroom.name : 'Sem Turma',
        totalClaims: claims.length,
        lastClaimAt: claims.length > 0 ? claims[claims.length - 1].claimedAt : null,
      };
    });

    return { totalTipsInCatalog: DAILY_TIPS.length, studentStats } as any;
  }

  if (pathname === '/api/teacher/missions' && method === 'GET') {
    const statusFilter = searchParams.get('status');
    const worldFilter = searchParams.get('worldId');
    const classFilter = searchParams.get('classId');
    const [missionSnap, userSnap, classes] = await Promise.all([
      getDocs(collection(db, 'missionSubmissions')),
      getDocs(collection(db, 'users')),
      clientGetClasses(),
    ]);
    const allUsers = userSnap.docs.map((d) => d.data() as ClientUser);
    let missions = missionSnap.docs.map((d) => d.data() as any);

    if (statusFilter && statusFilter !== 'all') {
      missions = missions.filter((m) => m.status === statusFilter);
    }
    if (worldFilter && worldFilter !== 'all') {
      const wId = parseInt(worldFilter, 10);
      missions = missions.filter((m) => m.worldId === wId);
    }
    if (classFilter && classFilter !== 'all') {
      missions = missions.filter((m) => m.classId === classFilter);
    }

    const result = missions.map((m) => {
      const student = allUsers.find((u) => u.id === m.userId);
      const classroom = student ? classes.find((c: any) => c.id === student.classId) : null;
      return {
        ...m,
        studentName: student ? student.fullName || student.name : m.studentName || 'Aluno',
        studentNickname: student ? student.nickname : m.studentNickname || '',
        studentAvatar: student ? student.avatar : 'avatar-boy-1',
        className: classroom ? classroom.name : 'Sem Turma',
      };
    });
    return { missions: result } as any;
  }

  const gradeMissionMatch = pathname.match(/^\/api\/teacher\/missions\/([^\/]+)\/grade$/);
  if (gradeMissionMatch && method === 'POST') {
    const submissionId = gradeMissionMatch[1];
    const { score, feedback } = body;
    if (typeof score !== 'number' || score < 0 || score > 100) {
      throw new Error('A classificação deve ser um número entre 0 e 100.');
    }
    const normalizedScore = Math.round(score);
    const subRef = doc(db, 'missionSubmissions', submissionId);
    const now = new Date().toISOString();
    let updatedSubmission: any = null;

    await runTransaction(db, async (txn) => {
      const subSnap = await txn.get(subRef);
      if (!subSnap.exists()) throw new Error('Submissão não encontrada.');
      const subData = subSnap.data() as any;
      const userRef = doc(db, 'users', subData.userId);
      const userSnap = await txn.get(userRef);
      if (!userSnap.exists()) throw new Error('Aluno associado não encontrado.');
      const uData = userSnap.data() as ClientUser;
      const prevBest = Number(subData.score) || 0;
      const xpGain = Math.max(0, normalizedScore - prevBest);
      const newXp = (Number(uData.xp) || 0) + xpGain;

      updatedSubmission = {
        ...subData,
        score: normalizedScore,
        feedback: feedback ? String(feedback).trim() : '',
        status: 'graded',
        gradedAt: now,
        gradedBy: 'Professora',
        updatedAt: now,
      };
      txn.set(subRef, updatedSubmission, { merge: true });
      if (xpGain > 0) {
        txn.update(userRef, { xp: newXp, updatedAt: now });
        const txId = `xp-${crypto.randomUUID()}`;
        txn.set(doc(db, 'xpTransactions', txId), {
          id: txId,
          userId: subData.userId,
          sourceType: 'mission',
          sourceId: subData.missionId || submissionId,
          previousBest: prevBest,
          newBest: normalizedScore,
          xpGain,
          createdAt: now,
        });
      }
    });

    return {
      success: true,
      message: 'Missão avaliada com sucesso e XP atribuído ao aluno!',
      submission: updatedSubmission,
    } as any;
  }

  if (pathname === '/api/teacher/audit-logs') {
    const snap = await getDocs(collection(db, 'auditLogs'));
    const auditLogs = snap.docs
      .map((d) => {
        const data = d.data() as any;
        return {
          ...data,
          timestamp: data.timestamp || data.createdAt,
        };
      })
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
    return { auditLogs } as any;
  }

  // 4. BATCH IMPORT OF STUDENTS
  if (pathname === '/api/teacher/students/batch-import' && method === 'POST') {
    const { students: rawStudents, defaultTurma, defaultClassId } = body;
    if (!Array.isArray(rawStudents) || rawStudents.length === 0) {
      throw new Error('Nenhum aluno fornecido para importação.');
    }

    const qAllUsers = query(collection(db, 'users'));
    const userSnap = await getDocs(qAllUsers);
    const allUsers = userSnap.docs.map((d) => d.data() as ClientUser);
    const existingUsernames = new Set(allUsers.map((u) => (u.username || u.nickname || '').toLowerCase()));

    const classesSnap = await getDocs(collection(db, 'classes'));
    const classesMap = new Map<string, any>();
    for (const cDoc of classesSnap.docs) {
      const c = cDoc.data();
      classesMap.set(c.id, c);
      if (c.name) classesMap.set(c.name.toLowerCase(), c);
    }

    const createdStudents: any[] = [];
    const now = new Date().toISOString();

    for (let i = 0; i < rawStudents.length; i++) {
      const item = rawStudents[i];
      const fullName = (item.fullName || item.name || '').trim();
      if (!fullName) continue;

      const turmaName = item.turma || defaultTurma || '6.º A';
      const studentNum =
        typeof item.studentNumber === 'number'
          ? item.studentNumber
          : parseInt(item.studentNumber || item.number || item['N.º'] || item['Número'] || `${i + 1}`, 10) || i + 1;

      // Ensure class exists
      let classObj = classesMap.get(item.classId || defaultClassId || '') || classesMap.get(turmaName.toLowerCase());
      if (!classObj) {
        const newClassId = `class-${normalizeTurmaTag(turmaName)}`;
        classObj = {
          id: newClassId,
          name: turmaName,
          code: '',
          createdAt: now,
        };
        await setDoc(doc(db, 'classes', newClassId), classObj);
        classesMap.set(classObj.id, classObj);
        classesMap.set(classObj.name.toLowerCase(), classObj);
      }

      const { displayName } = extractShortName(fullName);
      const shortName = item.name && item.name.trim() ? item.name.trim() : displayName;
      const username = item.customUsername || generateKidUsername(fullName, turmaName, existingUsernames);
      existingUsernames.add(username.toLowerCase());

      const initialPassword = item.customPassword || generateKidPassword();
      const email = item.email || `${username}@escola.local`;

      const { hash, salt } = await hashPasswordClient(initialPassword);
      const studentId = `student-${crypto.randomUUID()}`;

      const studentDoc: ClientUser = {
        id: studentId,
        name: shortName,
        fullName,
        turma: turmaName,
        studentNumber: studentNum,
        username,
        email,
        initialPassword,
        passwordHash: hash,
        passwordSalt: salt,
        nickname: username,
        avatar: 'avatar-boy-1',
        role: 'student',
        classId: classObj.id,
        locale: 'pt',
        xp: 0,
        blocked: false,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(doc(db, 'users', studentId), studentDoc);

      const bRef = doc(db, 'badges', `${studentId}_primeiros-passos`);
      await setDoc(
        bRef,
        {
          id: `${studentId}_primeiros-passos`,
          userId: studentId,
          badgeId: 'primeiros-passos',
          awardedAt: now,
        },
        { merge: true }
      ).catch(() => {});

      createdStudents.push({
        id: studentDoc.id,
        fullName: studentDoc.fullName,
        name: studentDoc.name,
        turma: studentDoc.turma,
        studentNumber: studentDoc.studentNumber,
        username: studentDoc.username,
        email: studentDoc.email,
        initialPassword: studentDoc.initialPassword,
        classId: studentDoc.classId,
      });
    }

    return {
      success: true,
      message: `${createdStudents.length} alunos registados com credenciais geradas com sucesso!`,
      importedCount: createdStudents.length,
      students: createdStudents,
    } as any;
  }

  // Single student creation
  if (pathname === '/api/teacher/students' && method === 'POST') {
    const { name, fullName, turma, studentNumber, customUsername, customPassword, classId } = body;
    const finalFullName = (fullName || name || 'Aluno').trim();
    const finalTurma = turma || '6.º A';
    const finalClassId = classId || `class-${normalizeTurmaTag(finalTurma)}`;
    const { displayName } = extractShortName(finalFullName);
    const shortName = name && name.trim() ? name.trim() : displayName;

    const qAllUsers = query(collection(db, 'users'));
    const userSnap = await getDocs(qAllUsers);
    const allUsers = userSnap.docs.map((d) => d.data() as ClientUser);
    const existingUsernames = new Set(allUsers.map((u) => (u.username || u.nickname || '').toLowerCase()));

    const username = customUsername || generateKidUsername(finalFullName, finalTurma, existingUsernames);
    const initialPassword = customPassword || generateKidPassword();
    const { hash, salt } = await hashPasswordClient(initialPassword);
    const studentId = `student-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const studentDoc: ClientUser = {
      id: studentId,
      name: shortName,
      fullName: finalFullName,
      turma: finalTurma,
      studentNumber: Number(studentNumber) || 1,
      username,
      email: `${username}@escola.local`,
      initialPassword,
      passwordHash: hash,
      passwordSalt: salt,
      nickname: username,
      avatar: 'avatar-boy-1',
      role: 'student',
      classId: finalClassId,
      locale: 'pt',
      xp: 0,
      blocked: false,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, 'users', studentId), studentDoc);
    return { success: true, student: studentDoc } as any;
  }

  // Create class
  if (pathname === '/api/teacher/classes' && method === 'POST') {
    const rawName = typeof body.name === 'string' ? body.name.trim() : '';
    if (!rawName) {
      throw new Error('O nome da turma é obrigatório.');
    }
    const existingClasses = await clientGetClasses();
    const duplicate = existingClasses.find(
      (c: any) => (c.name || '').trim().toLowerCase() === rawName.toLowerCase()
    );
    if (duplicate) {
      throw new Error(`Já existe uma turma com o nome "${duplicate.name}".`);
    }
    const cleanCode = typeof body.code === 'string' ? body.code.trim().toUpperCase().slice(0, 50) : '';
    const tag = normalizeTurmaTag(rawName).slice(0, 40) || 'turma';
    const classId = `class-${tag}-${Date.now().toString(36)}`;
    const newClass = {
      id: classId,
      name: rawName.slice(0, 100),
      code: cleanCode,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'classes', classId), newClass);
    return { success: true, class: newClass, classroom: newClass } as any;
  }

  // Class detail / update / delete
  const classDetailMatch = pathname.match(/^\/api\/teacher\/classes\/([^\/]+)$/);
  if (classDetailMatch) {
    const cId = classDetailMatch[1];
    if (method === 'GET') {
      const cSnap = await getDoc(doc(db, 'classes', cId));
      if (!cSnap.exists()) throw new Error('Turma não encontrada');
      return { classroom: cSnap.data() } as any;
    }
    if (method === 'PUT') {
      const updates: Record<string, any> = { updatedAt: new Date().toISOString() };
      if (typeof body.name === 'string' && body.name.trim()) {
        updates.name = body.name.trim().slice(0, 100);
      }
      if (typeof body.code === 'string') {
        updates.code = body.code.trim().toUpperCase().slice(0, 50);
      }
      if (typeof body.archived === 'boolean') {
        updates.archived = body.archived;
      }
      if (body.visibility && typeof body.visibility === 'object') {
        updates.visibility = body.visibility;
      }
      await updateDoc(doc(db, 'classes', cId), updates);
      if (updates.name) {
        const studentSnap = await getDocs(
          query(collection(db, 'users'), where('classId', '==', cId))
        );
        for (const sDoc of studentSnap.docs) {
          await updateDoc(doc(db, 'users', sDoc.id), {
            turma: updates.name,
            updatedAt: new Date().toISOString(),
          }).catch(() => {});
        }
      }
      return { success: true } as any;
    }
    if (method === 'DELETE') {
      const studentSnap = await getDocs(
        query(collection(db, 'users'), where('classId', '==', cId))
      );
      for (const sDoc of studentSnap.docs) {
        await updateDoc(doc(db, 'users', sDoc.id), {
          classId: '',
          turma: '',
          updatedAt: new Date().toISOString(),
        }).catch(() => {});
      }
      await deleteDoc(doc(db, 'classes', cId));
      return { success: true } as any;
    }
  }

  // Class visibility
  const classVisibilityMatch = pathname.match(/^\/api\/teacher\/classes\/([^\/]+)\/visibility$/);
  if (classVisibilityMatch) {
    const cId = classVisibilityMatch[1];
    const cRef = doc(db, 'classes', cId);
    if (method === 'GET') {
      const cSnap = await getDoc(cRef);
      const cData = cSnap.exists() ? cSnap.data() : {};
      return { classId: cId, visibility: cData.visibility || {} } as any;
    }
    if (method === 'PUT') {
      await setDoc(cRef, { visibility: body.visibility || body }, { merge: true });
      return { success: true, visibility: body.visibility || body } as any;
    }
  }

// Helper to completely delete a student and all associated records
async function deleteStudentCompletely(db: any, sId: string) {
  await deleteDoc(doc(db, 'users', sId)).catch(() => {});
  const userScopedCollections = [
    'activityProgress',
    'assessmentAttempts',
    'weeklyChallenges',
    'badges',
    'xpTransactions',
    'dailyTipClaims',
    'missionSubmissions',
    'sessions',
  ];
  for (const colName of userScopedCollections) {
    const q = query(collection(db, colName), where('userId', '==', sId));
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      await deleteDoc(d.ref).catch(() => {});
    }
  }
  await deleteDoc(doc(db, 'grandeMissaoProgress', sId)).catch(() => {});
}

// Helper to reset a student's progress and history
async function resetStudentProgressData(db: any, sId: string) {
  const sRef = doc(db, 'users', sId);
  await updateDoc(sRef, {
    xp: 0,
    updatedAt: new Date().toISOString(),
  }).catch(() => {});
  const progressCollections = [
    'activityProgress',
    'assessmentAttempts',
    'weeklyChallenges',
    'badges',
    'xpTransactions',
    'dailyTipClaims',
    'missionSubmissions',
  ];
  for (const colName of progressCollections) {
    const q = query(collection(db, colName), where('userId', '==', sId));
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      await deleteDoc(d.ref).catch(() => {});
    }
  }
  await deleteDoc(doc(db, 'grandeMissaoProgress', sId)).catch(() => {});
}

  // Delete all students of a class
  const classStudentsMatch = pathname.match(/^\/api\/teacher\/classes\/([^\/]+)\/students$/);
  if (classStudentsMatch && method === 'DELETE') {
    const cId = classStudentsMatch[1];
    const qStudents = query(collection(db, 'users'), where('classId', '==', cId), where('role', '==', 'student'));
    const snap = await getDocs(qStudents);
    for (const d of snap.docs) {
      await deleteStudentCompletely(db, d.id);
    }
    return { success: true, count: snap.size } as any;
  }

  // Reset class students progress
  const classResetProgMatch = pathname.match(/^\/api\/teacher\/classes\/([^\/]+)\/reset-progress$/);
  if (classResetProgMatch && method === 'POST') {
    const cId = classResetProgMatch[1];
    const qStudents = query(collection(db, 'users'), where('classId', '==', cId), where('role', '==', 'student'));
    const snap = await getDocs(qStudents);
    for (const sDoc of snap.docs) {
      await resetStudentProgressData(db, sDoc.id);
    }
    return { success: true, count: snap.size, message: `Progresso reiniciado para ${snap.size} alunos.` } as any;
  }

  // Reset platform students progress
  if (pathname === '/api/teacher/platform/reset-all-students-progress' && method === 'POST') {
    const qStudents = query(collection(db, 'users'), where('role', '==', 'student'));
    const snap = await getDocs(qStudents);
    for (const sDoc of snap.docs) {
      await resetStudentProgressData(db, sDoc.id);
    }
    return { success: true, count: snap.size, message: `Progresso global reiniciado para ${snap.size} alunos.` } as any;
  }

  // Bulk teacher operations
  if (pathname === '/api/teacher/bulk/move-class' && method === 'POST') {
    const { studentIds, targetClassId } = body;
    if (!Array.isArray(studentIds) || !targetClassId) throw new Error('Parâmetros inválidos');
    const cSnap = await getDoc(doc(db, 'classes', targetClassId));
    const className = cSnap.exists() ? cSnap.data().name : 'Turma';
    for (const sId of studentIds) {
      await updateDoc(doc(db, 'users', sId), {
        classId: targetClassId,
        turma: className,
        updatedAt: new Date().toISOString(),
      }).catch(() => {});
    }
    return { success: true, count: studentIds.length } as any;
  }

  if (pathname === '/api/teacher/bulk/block' && method === 'POST') {
    const { studentIds } = body;
    if (!Array.isArray(studentIds)) throw new Error('Lista de alunos inválida');
    for (const sId of studentIds) {
      await updateDoc(doc(db, 'users', sId), {
        blocked: true,
        updatedAt: new Date().toISOString(),
      }).catch(() => {});
    }
    return { success: true, count: studentIds.length } as any;
  }

  if (pathname === '/api/teacher/bulk/unblock' && method === 'POST') {
    const { studentIds } = body;
    if (!Array.isArray(studentIds)) throw new Error('Lista de alunos inválida');
    for (const sId of studentIds) {
      await updateDoc(doc(db, 'users', sId), {
        blocked: false,
        updatedAt: new Date().toISOString(),
      }).catch(() => {});
    }
    return { success: true, count: studentIds.length } as any;
  }

  if (pathname === '/api/teacher/bulk/delete' && method === 'POST') {
    const { studentIds } = body;
    if (!Array.isArray(studentIds)) throw new Error('Lista de alunos inválida');
    for (const sId of studentIds) {
      await deleteStudentCompletely(db, sId);
    }
    return { success: true, count: studentIds.length } as any;
  }

  // Teacher actions: toggle block, delete student, etc.
  const toggleBlockMatch = pathname.match(/^\/api\/teacher\/students\/([^\/]+)\/toggle-block$/);
  if (toggleBlockMatch && method === 'POST') {
    const sId = toggleBlockMatch[1];
    const sRef = doc(db, 'users', sId);
    const sSnap = await getDoc(sRef);
    if (!sSnap.exists()) throw new Error('Aluno não encontrado');
    const curBlocked = sSnap.data().blocked || false;
    await updateDoc(sRef, { blocked: !curBlocked, updatedAt: new Date().toISOString() });
    return { success: true, blocked: !curBlocked } as any;
  }

  const quickResetMatch = pathname.match(/^\/api\/teacher\/students\/([^\/]+)\/quick-reset-password$/);
  if (quickResetMatch && method === 'POST') {
    const sId = quickResetMatch[1];
    const sRef = doc(db, 'users', sId);
    const sSnap = await getDoc(sRef);
    if (!sSnap.exists()) throw new Error('Aluno não encontrado');
    const newPassword = `sol${Math.floor(100 + Math.random() * 900)}`;
    const { hash, salt } = await hashPasswordClient(newPassword);
    await updateDoc(sRef, {
      initialPassword: newPassword,
      passwordHash: hash,
      passwordSalt: salt,
      updatedAt: new Date().toISOString(),
    });
    return { success: true, newPassword } as any;
  }

  const pwdResetMatch = pathname.match(/^\/api\/teacher\/students\/([^\/]+)\/reset-password$/);
  if (pwdResetMatch && method === 'POST') {
    const sId = pwdResetMatch[1];
    const sRef = doc(db, 'users', sId);
    const { newPassword, requireChangeOnNextLogin } = body;
    if (!newPassword || newPassword.length < 6) {
      throw new Error('A palavra-passe deve ter pelo menos 6 caracteres.');
    }
    const { hash, salt } = await hashPasswordClient(newPassword);
    await updateDoc(sRef, {
      initialPassword: newPassword,
      passwordHash: hash,
      passwordSalt: salt,
      mustChangePassword: !!requireChangeOnNextLogin,
      updatedAt: new Date().toISOString(),
    });
    return { success: true, message: 'Palavra-passe redefinida com sucesso!' } as any;
  }

  const resetStudentProgMatch = pathname.match(/^\/api\/teacher\/students\/([^\/]+)\/reset-progress$/);
  if (resetStudentProgMatch && method === 'POST') {
    const sId = resetStudentProgMatch[1];
    await resetStudentProgressData(db, sId);
    return { success: true, message: 'Progresso do aluno reiniciado com sucesso.' } as any;
  }

  const bonusXpMatch = pathname.match(/^\/api\/teacher\/students\/([^\/]+)\/xp$/);
  if (bonusXpMatch && method === 'POST') {
    const sId = bonusXpMatch[1];
    const sRef = doc(db, 'users', sId);
    const amount = parseInt(String(body.xpAmount), 10) || 50;
    const now = new Date().toISOString();
    const txId = `xp-${crypto.randomUUID()}`;
    const txRef = doc(db, 'xpTransactions', txId);
    let finalTotal = 0;

    await runTransaction(db, async (txn) => {
      const sSnap = await txn.get(sRef);
      if (!sSnap.exists()) throw new Error('Aluno não encontrado');
      const uData = sSnap.data() as ClientUser;
      const prevXp = Number(uData.xp) || 0;
      finalTotal = prevXp + amount;

      txn.update(sRef, {
        xp: finalTotal,
        updatedAt: now,
      });

      txn.set(txRef, {
        id: txId,
        userId: sId,
        sourceType: 'bonus',
        sourceId: `bonus-${Date.now()}`,
        previousBest: prevXp,
        newBest: finalTotal,
        xpGain: amount,
        createdAt: now,
      });
    });

    return { success: true, newTotalXP: finalTotal, message: `+${amount} XP atribuídos!` } as any;
  }

  // Student Dossier, Update, and Delete
  const studentDossierMatch = pathname.match(/^\/api\/teacher\/students\/([^\/]+)$/);
  if (studentDossierMatch) {
    const sId = studentDossierMatch[1];
    const sRef = doc(db, 'users', sId);

    if (method === 'GET') {
      const sSnap = await getDoc(sRef);
      if (!sSnap.exists()) throw new Error('Aluno não encontrado');
      const student = sSnap.data() as ClientUser;

      const [cSnap, progSnap, assessSnap, badgeSnap, txSnap, gmSnap, missionSnap] = await Promise.all([
        student.classId ? getDoc(doc(db, 'classes', student.classId)) : Promise.resolve(null as any),
        getDocs(query(collection(db, 'activityProgress'), where('userId', '==', sId))),
        getDocs(query(collection(db, 'assessmentAttempts'), where('userId', '==', sId))),
        getDocs(query(collection(db, 'badges'), where('userId', '==', sId))),
        getDocs(query(collection(db, 'xpTransactions'), where('userId', '==', sId))),
        getDoc(doc(db, 'grandeMissaoProgress', sId)),
        getDocs(query(collection(db, 'missionSubmissions'), where('userId', '==', sId))),
      ]);

      const classroom = cSnap && cSnap.exists() ? cSnap.data() : null;
      const userProgress = progSnap.docs.map((d) => d.data() as any);
      const userAssessments = assessSnap.docs.map((d) => d.data() as any);
      const userMissions = missionSnap.docs.map((d) => d.data() as any);

      const badgeMap = new Map<string, any>();
      for (const d of badgeSnap.docs) {
        const b = d.data() as any;
        if (b.badgeId) badgeMap.set(b.badgeId, b);
      }
      const badges = Array.from(badgeMap.values());

      const xpHistory = txSnap.docs
        .map((d) => d.data() as any)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      let prevUnlocked = true;
      let prevPassed = true;
      const worldDetails = WORLDS_DATA.map((w) => {
        const scores: number[] = [];
        let completedSimulatorsCount = 0;

        const simulators = w.simulators.map((sim) => {
          const prog = userProgress.find((p) => p.activityId === sim.id);
          const completed = Boolean(prog && (prog.completed || (typeof prog.bestScore === 'number' && prog.bestScore > 0)));
          const bestScore = prog ? Number(prog.bestScore) || 0 : 0;
          if (completed) {
            completedSimulatorsCount++;
            scores.push(bestScore);
          }
          return {
            id: sim.id,
            title: sim.name,
            completed,
            bestScore,
            attempts: prog ? Number(prog.attempts) || 0 : 0,
            lastAttemptAt: prog ? prog.lastAttemptAt || prog.updatedAt || null : null,
          };
        });

        const wAttempts = userAssessments
          .filter((a) => a.worldId === w.id)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        const hasAssessment = wAttempts.length > 0;
        const firstAttempt = hasAssessment ? wAttempts[0] : null;
        const bestAttempt = hasAssessment
          ? wAttempts.reduce((max, a) => (a.percentage > max.percentage ? a : max), wAttempts[0])
          : null;
        const lastAttempt = hasAssessment ? wAttempts[wAttempts.length - 1] : null;

        if (bestAttempt) scores.push(Number(bestAttempt.percentage) || 0);

        const average =
          scores.length > 0
            ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
            : 0;
        const allSimulatorsCompleted = completedSimulatorsCount >= w.simulators.length;
        const isCompleted = allSimulatorsCompleted && hasAssessment && average > PROGRESSION_CONFIG.PASSING_THRESHOLD;
        const isUnlocked = w.id === 1 ? true : prevUnlocked && prevPassed;

        prevUnlocked = isUnlocked;
        prevPassed = isCompleted;

        const chalProg = userProgress.find((p) => p.activityId === w.challenge.id);
        const wMission = userMissions.find((m) => m.worldId === w.id);

        return {
          worldId: w.id,
          title: w.title,
          subtitle: w.subtitle,
          average,
          completedCount: scores.length,
          totalComponents: w.simulators.length + 1,
          isUnlocked,
          isCompleted,
          simulators,
          challenge: {
            id: w.challenge.id,
            title: w.challenge.title,
            completed: Boolean(chalProg?.completed),
            bestScore: chalProg ? Number(chalProg.bestScore) || 0 : 0,
            attempts: chalProg ? Number(chalProg.attempts) || 0 : 0,
          },
          mission: wMission || null,
          assessments: wAttempts.map((a) => ({
            ...a,
            mention: a.mention || getQualitativeMention(a.percentage || 0),
          })),
          assessmentSummary: {
            attemptsCount: wAttempts.length,
            official: firstAttempt
              ? {
                  score: firstAttempt.score,
                  percentage: firstAttempt.percentage,
                  mention: firstAttempt.mention || getQualitativeMention(firstAttempt.percentage),
                  createdAt: firstAttempt.createdAt,
                  passed: firstAttempt.percentage >= 50,
                }
              : null,
            best: bestAttempt
              ? {
                  score: bestAttempt.score,
                  percentage: bestAttempt.percentage,
                  mention: bestAttempt.mention || getQualitativeMention(bestAttempt.percentage),
                  createdAt: bestAttempt.createdAt,
                  passed: bestAttempt.percentage >= 50,
                }
              : null,
            last: lastAttempt
              ? {
                  score: lastAttempt.score,
                  percentage: lastAttempt.percentage,
                  mention: lastAttempt.mention || getQualitativeMention(lastAttempt.percentage),
                  createdAt: lastAttempt.createdAt,
                  passed: lastAttempt.percentage >= 50,
                }
              : null,
          },
        };
      });

      const levelInfo = calculateLevel(student.xp || 0);

      const xpBreakdown = {
        initial: 0,
        activities: xpHistory
          .filter((t: any) => t.sourceType === 'activity' || t.sourceType === 'simulator')
          .reduce((acc: number, t: any) => acc + (Number(t.xpGain) || 0), 0),
        assessments: xpHistory
          .filter((t: any) => t.sourceType === 'assessment')
          .reduce((acc: number, t: any) => acc + (Number(t.xpGain) || 0), 0),
        challenges: xpHistory
          .filter((t: any) => t.sourceType === 'challenge' || t.sourceType === 'weekly_challenge')
          .reduce((acc: number, t: any) => acc + (Number(t.xpGain) || 0), 0),
        missions: xpHistory
          .filter((t: any) => t.sourceType === 'mission')
          .reduce((acc: number, t: any) => acc + (Number(t.xpGain) || 0), 0),
        grandeMissao: xpHistory
          .filter((t: any) => t.sourceType === 'grande_missao')
          .reduce((acc: number, t: any) => acc + (Number(t.xpGain) || 0), 0),
        dailyTips: xpHistory
          .filter((t: any) => t.sourceType === 'daily_tip')
          .reduce((acc: number, t: any) => acc + (Number(t.xpGain) || 0), 0),
        bonus: xpHistory
          .filter((t: any) => t.sourceType === 'bonus')
          .reduce((acc: number, t: any) => acc + (Number(t.xpGain) || 0), 0),
        total: student.xp || 0,
      };

      const grandeMissao = gmSnap.exists()
        ? gmSnap.data()
        : { currentStage: 1, completedStages: [], status: 'not_started' };

      return {
        student: {
          id: student.id,
          name: student.name,
          fullName: student.fullName || student.name,
          turma: student.turma || (classroom ? classroom.name : 'Sem Turma'),
          studentNumber: student.studentNumber || 1,
          username: student.username || student.nickname,
          initialPassword: student.initialPassword || '',
          email: student.email,
          nickname: student.nickname,
          avatar: student.avatar,
          classId: student.classId,
          className: classroom ? classroom.name : student.turma || 'Sem Turma',
          locale: student.locale,
          xp: student.xp,
          level: levelInfo.level,
          levelName: levelInfo.name,
          blocked: student.blocked,
          mustChangePassword: student.mustChangePassword || false,
          createdAt: student.createdAt,
          lastLoginAt: student.lastLoginAt,
        },
        worldDetails,
        xpBreakdown,
        badges: badges.map((b: any) => {
          const cat = BADGES_CATALOG.find((bc) => bc.id === b.badgeId);
          return {
            id: b.id,
            badgeId: b.badgeId,
            name: cat ? cat.title : b.badgeId,
            description: cat ? cat.description : '',
            icon: cat ? cat.icon : 'Award',
            awardedAt: b.awardedAt,
          };
        }),
        xpHistory,
        dailyTipsCount: xpHistory.filter((t: any) => t.sourceType === 'daily_tip').length,
        weeklyChallengesCompleted: xpHistory.filter((t: any) => t.sourceType === 'weekly_challenge').length,
        grandeMissao,
      } as any;
    }

    if (method === 'PUT') {
      const updates: any = { updatedAt: new Date().toISOString() };
      if (body.nickname) updates.nickname = body.nickname;
      if (body.username) {
        updates.username = body.username;
        updates.nickname = body.username;
      }
      if (body.fullName) {
        updates.fullName = body.fullName;
        if (!body.name) updates.name = extractShortName(body.fullName).displayName;
      }
      if (body.name) updates.name = body.name;
      if (body.classId !== undefined) {
        const cleanClassId = typeof body.classId === 'string' ? body.classId.trim() : '';
        updates.classId = cleanClassId;
        if (cleanClassId === '') {
          updates.turma = '';
        } else {
          const cSnap = await getDoc(doc(db, 'classes', cleanClassId));
          if (cSnap.exists()) {
            updates.turma = cSnap.data().name;
          } else if (body.turma) {
            updates.turma = normalizeTurmaName(body.turma);
          }
        }
      } else if (body.turma !== undefined) {
        const cleanTurma = typeof body.turma === 'string' ? body.turma.trim() : '';
        if (!cleanTurma) {
          updates.turma = '';
          updates.classId = '';
        } else {
          const normalizedTurma = normalizeTurmaName(cleanTurma);
          const allClasses = await clientGetClasses();
          const matchedClass = allClasses.find(
            (c: any) =>
              (c.name || '').trim().toLowerCase() === cleanTurma.toLowerCase() ||
              normalizeTurmaName(c.name || '').toLowerCase() === normalizedTurma.toLowerCase()
          );
          if (matchedClass) {
            updates.classId = matchedClass.id;
            updates.turma = matchedClass.name;
          } else {
            updates.turma = normalizedTurma;
          }
        }
      }
      if (body.studentNumber) updates.studentNumber = Number(body.studentNumber);
      if (typeof body.blocked === 'boolean') updates.blocked = body.blocked;
      if (typeof body.mustChangePassword === 'boolean') updates.mustChangePassword = body.mustChangePassword;
      await updateDoc(sRef, updates);
      return { success: true } as any;
    }

    if (method === 'DELETE') {
      await deleteStudentCompletely(db, sId);
      return { success: true } as any;
    }
  }

  throw new Error(`Rota não encontrada no serviço local: ${pathname}`);
}

export async function clientDownloadExport(urlStr: string, defaultFilename: string) {
  const db = getClientFirestore();
  const urlObj = new URL(urlStr, 'http://localhost');
  const pathname = urlObj.pathname;
  const classId = urlObj.searchParams.get('classId') || 'all';

  const qUsers = query(collection(db, 'users'), where('role', '==', 'student'));
  const userSnap = await getDocs(qUsers);
  let students = userSnap.docs.map((d) => d.data() as ClientUser);

  if (classId && classId !== 'all') {
    students = students.filter((s) => s.classId === classId);
  }

  students.sort((a, b) => (a.studentNumber || 0) - (b.studentNumber || 0) || a.name.localeCompare(b.name));

  let csvContent = '';

  if (pathname.includes('credentials')) {
    csvContent = 'Número;Nome Completo;Turma;Utilizador (Login);Palavra-passe Inicial\n';
    students.forEach((s) => {
      csvContent += `${s.studentNumber || 1};"${s.fullName || s.name}";"${s.turma || '6.º A'}";"${s.username || s.nickname}";"${s.initialPassword || ''}"\n`;
    });
  } else if (pathname.includes('pauta')) {
    csvContent = 'Número;Nome Completo;Utilizador;Turma;XP Total;Nível\n';
    students.forEach((s) => {
      const levelInfo = calculateLevel(s.xp || 0);
      csvContent += `${s.studentNumber || 1};"${s.fullName || s.name}";"${s.username || s.nickname}";"${s.turma || '6.º A'}";${s.xp || 0};"${levelInfo.name}"\n`;
    });
  } else {
    csvContent = 'Número;Nome Completo;Utilizador;Turma;XP Total;Nível;Data de Registo\n';
    students.forEach((s) => {
      const levelInfo = calculateLevel(s.xp || 0);
      const dateStr = s.createdAt ? new Date(s.createdAt).toLocaleDateString('pt-PT') : '-';
      csvContent += `${s.studentNumber || 1};"${s.fullName || s.name}";"${s.username || s.nickname}";"${s.turma || '6.º A'}";${s.xp || 0};"${levelInfo.name}";"${dateStr}"\n`;
    });
  }

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = defaultFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(blobUrl);
}
