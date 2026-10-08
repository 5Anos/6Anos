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
import { WORLDS_DATA, BADGES_CATALOG, calculateLevel } from '../data/catalog';
import { PROGRESSION_CONFIG, getQualitativeMention } from '../progressionConfig';
import {
  extractShortName,
  generateKidUsername,
  generateKidPassword,
  normalizeTurmaTag,
} from '../utils/kidCredentials';
import { hashPasswordClient } from './clientAuthUtils';

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

  if (pathname === '/api/pedagogical/grande-missao/stage' && method === 'POST') {
    const res = await clientSaveGrandeMissaoStage(body.stageNumber, body.answers);
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

  const missionSubmitMatch = pathname.match(/^\/api\/pedagogical\/missions\/(\d+)$/);
  if (missionSubmitMatch && method === 'POST') {
    const worldId = parseInt(missionSubmitMatch[1], 10);
    const userId = getActiveClientUserId();
    if (!userId) throw new Error('Não autenticado');

    const db = getClientFirestore();
    const subId = `sub-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    await setDoc(doc(db, 'missionSubmissions', subId), {
      id: subId,
      userId,
      worldId,
      textResponse: body.textResponse || '',
      fileUrl: body.fileUrl || '',
      fileName: body.fileName || '',
      status: 'pending',
      createdAt: now,
    });
    return { success: true, submissionId: subId } as any;
  }

  // 3. TEACHER ROUTES DIRECTLY ON FIRESTORE
  const db = getClientFirestore();

  if (pathname === '/api/teacher/dashboard-stats') {
    const qUsers = query(collection(db, 'users'));
    const userSnap = await getDocs(qUsers);
    const allUsers = userSnap.docs.map((d) => d.data() as ClientUser);
    const students = allUsers.filter((u) => u.role === 'student');
    const classes = await clientGetClasses();

    const [assessSnap, progSnap] = await Promise.all([
      getDocs(collection(db, 'assessmentAttempts')),
      getDocs(collection(db, 'activityProgress')),
    ]);
    const allAssessments = assessSnap.docs.map((d) => d.data() as any);
    const allProgress = progSnap.docs.map((d) => d.data() as any);

    const totalStudents = students.length;
    const activeStudents = students.filter((s) => !s.blocked).length;
    const totalXP = students.reduce((acc, s) => acc + (s.xp || 0), 0);
    const avgXP = totalStudents > 0 ? Math.round(totalXP / totalStudents) : 0;
    const totalSimulatorsCompleted = allProgress.filter((p) => p.completed).length;
    const totalQuizzesAttempted = allAssessments.length;

    let totalScoreSum = 0;
    let totalScoreCount = 0;

    const worldPerformance = WORLDS_DATA.map((w) => {
      let sumAvg = 0;
      let count = 0;
      let completedCount = 0;

      for (const s of students) {
        const worldSims = w.simulators;
        const studentSims = allProgress.filter(
          (p) => p.userId === s.id && worldSims.some((sim) => sim.id === p.activityId) && p.completed
        );
        const attempts = allAssessments.filter((a) => a.userId === s.id && a.worldId === w.id);

        const components: number[] = [];
        if (studentSims.length > 0) {
          const simAvg = studentSims.reduce((sum: number, p: any) => sum + (p.bestScore || 0), 0) / studentSims.length;
          components.push(simAvg);
        }
        if (attempts.length > 0) {
          const quizBest = Math.max(...attempts.map((a: any) => a.percentage || 0));
          components.push(quizBest);
        }

        if (components.length > 0) {
          const studentWorldAvg = Math.round(components.reduce((a: number, b: number) => a + b, 0) / components.length);
          sumAvg += studentWorldAvg;
          count++;
          totalScoreSum += studentWorldAvg;
          totalScoreCount++;
          if (studentWorldAvg >= PROGRESSION_CONFIG.PASSING_THRESHOLD) {
            completedCount++;
          }
        }
      }

      const averageScore = count > 0 ? Math.round(sumAvg / count) : 0;
      return {
        worldId: w.id,
        title: w.title,
        averageScore,
        studentsAttempted: count,
        studentsCompleted: completedCount,
        classAverage: averageScore,
        studentsActive: count,
        studentsUnlockedNext: completedCount,
      };
    });

    const globalAverageScore =
      totalScoreCount > 0 ? Math.round(totalScoreSum / totalScoreCount) : 0;

    return {
      totalStudents,
      activeStudents,
      totalClasses: classes.length,
      classes,
      totalQuizzesAttempted,
      totalSimulatorsCompleted,
      globalAverageScore,
      avgXP,
      studentsNeedingHelp: 0,
      worldPerformance,
      worldStats: worldPerformance,
    } as any;
  }

  if (pathname === '/api/teacher/students') {
    const classId = searchParams.get('classId');
    const qUsers = query(collection(db, 'users'), where('role', '==', 'student'));
    const userSnap = await getDocs(qUsers);
    let students = userSnap.docs.map((d) => d.data() as ClientUser);

    if (classId && classId !== 'all') {
      students = students.filter((s) => s.classId === classId);
    }

    const studentsFormatted = students.map((s) => {
      const sanitized = sanitizeClientUser(s);
      return {
        ...sanitized,
        overallAverage: 0,
        completedWorldsCount: 0,
        unlockedWorldsCount: 1,
        simulatorsAverage: 0,
        assessmentsAverage: 0,
        progressPercentage: 0,
        status: s.blocked ? 'suspended' : 'active',
        needsIntervention: false,
        worldAverages: {},
      };
    });

    return { students: studentsFormatted } as any;
  }

  if (pathname === '/api/teacher/classes') {
    const classes = await clientGetClasses();
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

    const [assessSnap, progSnap] = await Promise.all([
      getDocs(collection(db, 'assessmentAttempts')),
      getDocs(collection(db, 'activityProgress')),
    ]);
    const allAssessments = assessSnap.docs.map((d) => d.data() as any);
    const allProgress = progSnap.docs.map((d) => d.data() as any);

    students.sort((a, b) => {
      if (a.studentNumber && b.studentNumber) return a.studentNumber - b.studentNumber;
      return a.name.localeCompare(b.name);
    });

    // 1. Pauta Geral
    const pautaGeral = students.map((s, idx) => {
      const classroom = classes.find((c) => c.id === s.classId);
      const level = Math.floor((s.xp || 0) / 100) + 1;

      const worldScores: number[] = [];
      for (const w of WORLDS_DATA) {
        const worldSims = w.simulators;
        const studentSims = allProgress.filter(
          (p) => p.userId === s.id && worldSims.some((sim) => sim.id === p.activityId) && p.completed
        );
        const simAvg =
          studentSims.length > 0
            ? studentSims.reduce((sum: number, p: any) => sum + (p.bestScore || 0), 0) / studentSims.length
            : 0;

        const worldAttempts = allAssessments.filter((a) => a.userId === s.id && a.worldId === w.id);
        const bestQuiz =
          worldAttempts.length > 0 ? Math.max(...worldAttempts.map((a: any) => a.percentage || 0)) : null;

        let worldScore = 0;
        if (studentSims.length > 0 && bestQuiz !== null) {
          worldScore = Math.round((simAvg + bestQuiz) / 2);
        } else if (bestQuiz !== null) {
          worldScore = Math.round(bestQuiz);
        } else if (studentSims.length > 0) {
          worldScore = Math.round(simAvg);
        }

        worldScores.push(worldScore);
      }

      const activeScores = worldScores.filter((sc) => sc > 0);
      const globalAverage =
        activeScores.length > 0
          ? Math.round(activeScores.reduce((a, b) => a + b, 0) / activeScores.length)
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
        level,
        levelName: `Nível ${level}`,
      };
    });

    // 2. Pautas por Mundo
    const pautasPorMundo = WORLDS_DATA.map((w) => {
      const worldStudents = students.map((s, idx) => {
        const classroom = classes.find((c) => c.id === s.classId);

        const worldSims = w.simulators;
        const studentSims = allProgress.filter(
          (p) => p.userId === s.id && worldSims.some((sim) => sim.id === p.activityId) && p.completed
        );
        const simulatorsAvg =
          studentSims.length > 0
            ? Math.round(studentSims.reduce((sum: number, p: any) => sum + (p.bestScore || 0), 0) / studentSims.length)
            : 0;

        const chalProg = allProgress.find((p) => p.userId === s.id && p.activityId === w.challenge.id);
        const challengeScore = chalProg && chalProg.completed ? chalProg.bestScore : 0;

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
        const assessmentMention = bestAttempt
          ? (bestAttempt.mention || getQualitativeMention(bestAttempt.percentage))
          : '—';

        const components: number[] = [];
        if (studentSims.length > 0) components.push(simulatorsAvg);
        if (challengeScore > 0) components.push(challengeScore);
        if (bestAttempt) components.push(bestAttempt.percentage);

        const worldAverage =
          components.length > 0
            ? Math.round(components.reduce((a: number, b: number) => a + b, 0) / components.length)
            : 0;

        const isWorldPassed = worldAverage >= PROGRESSION_CONFIG.PASSING_THRESHOLD;

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
          challengeScore,
          missionScore: 0,
          assessmentScore,
          officialAssessmentScore,
          assessmentMention,
          worldAverage,
          isWorldPassed,
          isNextUnlocked: isWorldPassed,
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
        assessmentTitle: `Avaliação do Mundo ${w.id}`,
        totalQuestions: 8,
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
        const studentStats = students.map((st) => {
          const prog = allProgress.find((p) => p.userId === st.id && p.activityId === s.id);
          const classroom = classes.find((c) => c.id === st.classId);
          return {
            studentId: st.id,
            studentName: st.fullName || st.name,
            studentNickname: st.nickname,
            className: classroom ? classroom.name : 'Sem Turma',
            completed: prog ? prog.completed : false,
            bestScore: prog ? prog.bestScore : 0,
            attempts: prog ? prog.attempts : 0,
            lastAttemptAt: prog ? prog.lastAttemptAt : null,
          };
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
    return { challenges: [] } as any;
  }

  if (pathname === '/api/teacher/xp-breakdown') {
    return { breakdown: [] } as any;
  }

  if (pathname === '/api/teacher/grande-missao-summary') {
    return { summary: { totalStarted: 0, totalCompleted: 0, stagesCount: {} } } as any;
  }

  if (pathname === '/api/teacher/badges-summary') {
    return { badges: [] } as any;
  }

  if (pathname === '/api/teacher/audit-logs') {
    return { logs: [] } as any;
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
        xp: 100,
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
      xp: 100,
      blocked: false,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, 'users', studentId), studentDoc);
    return { success: true, student: studentDoc } as any;
  }

  // Create class
  if (pathname === '/api/teacher/classes' && method === 'POST') {
    const { name } = body;
    const classId = `class-${normalizeTurmaTag(name || 'nova-turma')}-${Date.now().toString(36)}`;
    const newClass = {
      id: classId,
      name: name || 'Nova Turma',
      code: '',
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'classes', classId), newClass);
    return { success: true, classroom: newClass } as any;
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
      await updateDoc(doc(db, 'classes', cId), { ...body, updatedAt: new Date().toISOString() });
      return { success: true } as any;
    }
    if (method === 'DELETE') {
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

  // Delete all students of a class
  const classStudentsMatch = pathname.match(/^\/api\/teacher\/classes\/([^\/]+)\/students$/);
  if (classStudentsMatch && method === 'DELETE') {
    const cId = classStudentsMatch[1];
    const qStudents = query(collection(db, 'users'), where('classId', '==', cId), where('role', '==', 'student'));
    const snap = await getDocs(qStudents);
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
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
      const sId = sDoc.id;
      await updateDoc(sDoc.ref, { xp: 100, updatedAt: new Date().toISOString() });
      const qProg = query(collection(db, 'activityProgress'), where('userId', '==', sId));
      const snapProg = await getDocs(qProg);
      for (const p of snapProg.docs) await deleteDoc(p.ref);
      const qAssess = query(collection(db, 'assessmentAttempts'), where('userId', '==', sId));
      const snapAssess = await getDocs(qAssess);
      for (const a of snapAssess.docs) await deleteDoc(a.ref);
      const qWc = query(collection(db, 'weeklyChallenges'), where('userId', '==', sId));
      const snapWc = await getDocs(qWc);
      for (const w of snapWc.docs) await deleteDoc(w.ref);
      await deleteDoc(doc(db, 'grandeMissaoProgress', sId)).catch(() => {});
    }
    return { success: true, count: snap.size, message: `Progresso reiniciado para ${snap.size} alunos.` } as any;
  }

  // Reset platform students progress
  if (pathname === '/api/teacher/platform/reset-all-students-progress' && method === 'POST') {
    const qStudents = query(collection(db, 'users'), where('role', '==', 'student'));
    const snap = await getDocs(qStudents);
    for (const sDoc of snap.docs) {
      const sId = sDoc.id;
      await updateDoc(sDoc.ref, { xp: 100, updatedAt: new Date().toISOString() });
      const qProg = query(collection(db, 'activityProgress'), where('userId', '==', sId));
      const snapProg = await getDocs(qProg);
      for (const p of snapProg.docs) await deleteDoc(p.ref);
      const qAssess = query(collection(db, 'assessmentAttempts'), where('userId', '==', sId));
      const snapAssess = await getDocs(qAssess);
      for (const a of snapAssess.docs) await deleteDoc(a.ref);
      const qWc = query(collection(db, 'weeklyChallenges'), where('userId', '==', sId));
      const snapWc = await getDocs(qWc);
      for (const w of snapWc.docs) await deleteDoc(w.ref);
      await deleteDoc(doc(db, 'grandeMissaoProgress', sId)).catch(() => {});
    }
    return { success: true, count: snap.size, message: `Progresso global reiniciado para ${snap.size} alunos.` } as any;
  }

  // Grade mission
  const missionGradeMatch = pathname.match(/^\/api\/teacher\/missions\/([^\/]+)\/grade$/);
  if (missionGradeMatch && method === 'POST') {
    const subId = missionGradeMatch[1];
    const subRef = doc(db, 'missionSubmissions', subId);
    const { score, feedback } = body;
    const normalizedScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
    const now = new Date().toISOString();

    let resultingSub: any = null;
    let xpGain = 0;

    await runTransaction(db, async (txn) => {
      const subSnap = await txn.get(subRef);
      if (!subSnap.exists()) throw new Error('Submissão não encontrada');
      const subData = subSnap.data();
      const prevScore = Number(subData.score) || 0;
      const newBest = Math.max(prevScore, normalizedScore);
      xpGain = Math.max(0, newBest - prevScore);

      resultingSub = {
        ...subData,
        score: normalizedScore,
        feedback: feedback ? String(feedback).trim() : '',
        status: 'graded',
        gradedAt: now,
        updatedAt: now,
      };

      txn.set(subRef, resultingSub, { merge: true });

      if (xpGain > 0 && subData.userId) {
        const uRef = doc(db, 'users', subData.userId);
        const uSnap = await txn.get(uRef);
        if (uSnap.exists()) {
          const curXp = Number(uSnap.data().xp) || 0;
          const newTotalXp = curXp + xpGain;
          txn.update(uRef, { xp: newTotalXp, updatedAt: now });

          const txId = `xp-${crypto.randomUUID()}`;
          const txRef = doc(db, 'xpTransactions', txId);
          txn.set(txRef, {
            id: txId,
            userId: subData.userId,
            amount: xpGain,
            reason: 'Correção de Missão Real',
            sourceType: 'mission',
            sourceId: subData.missionId || subId,
            previousBest: prevScore,
            newBest,
            xpGain,
            createdAt: now,
          });
        }
      }
    });

    return { success: true, submission: resultingSub, xpGain } as any;
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
    const sRef = doc(db, 'users', sId);
    await updateDoc(sRef, { xp: 100, updatedAt: new Date().toISOString() });
    const qProg = query(collection(db, 'activityProgress'), where('userId', '==', sId));
    const snapProg = await getDocs(qProg);
    for (const p of snapProg.docs) await deleteDoc(p.ref);
    const qAssess = query(collection(db, 'assessmentAttempts'), where('userId', '==', sId));
    const snapAssess = await getDocs(qAssess);
    for (const a of snapAssess.docs) await deleteDoc(a.ref);
    const qWc = query(collection(db, 'weeklyChallenges'), where('userId', '==', sId));
    const snapWc = await getDocs(qWc);
    for (const w of snapWc.docs) await deleteDoc(w.ref);
    await deleteDoc(doc(db, 'grandeMissaoProgress', sId)).catch(() => {});
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
        amount,
        reason: body.reason || 'Bónus pedagógico atribuído pela Professora',
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

      const [cSnap, progSnap, assessSnap, missionSnap, badgeSnap, txSnap] = await Promise.all([
        student.classId ? getDoc(doc(db, 'classes', student.classId)) : Promise.resolve(null as any),
        getDocs(query(collection(db, 'activityProgress'), where('userId', '==', sId))),
        getDocs(query(collection(db, 'assessmentAttempts'), where('userId', '==', sId))),
        getDocs(query(collection(db, 'missionSubmissions'), where('userId', '==', sId))),
        getDocs(query(collection(db, 'badges'), where('userId', '==', sId))),
        getDocs(query(collection(db, 'xpTransactions'), where('userId', '==', sId))),
      ]);

      const classroom = cSnap && cSnap.exists() ? cSnap.data() : null;
      const badges = badgeSnap.docs.map((d) => d.data());
      const xpHistory = txSnap.docs
        .map((d) => d.data())
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const worldDetails: Record<number, any> = {};
      for (let w = 1; w <= 5; w++) {
        const stats = await clientComputeWorldStats(sId, w, 'student');
        worldDetails[w] = stats;
      }

      const levelInfo = calculateLevel(student.xp || 0);

      const xpBreakdown = {
        simulators: xpHistory
          .filter((t: any) => t.sourceType === 'activity' || t.sourceType === 'simulator')
          .reduce((acc: number, t: any) => acc + (t.xpGain || 0), 0),
        challenges: xpHistory
          .filter((t: any) => t.sourceType === 'challenge' || t.sourceType === 'weekly_challenge')
          .reduce((acc: number, t: any) => acc + (t.xpGain || 0), 0),
        grandeMissao: xpHistory
          .filter((t: any) => t.sourceType === 'grande_missao')
          .reduce((acc: number, t: any) => acc + (t.xpGain || 0), 0),
        missions: xpHistory
          .filter((t: any) => t.sourceType === 'mission')
          .reduce((acc: number, t: any) => acc + (t.xpGain || 0), 0),
        dailyTips: xpHistory
          .filter((t: any) => t.sourceType === 'daily_tip')
          .reduce((acc: number, t: any) => acc + (t.xpGain || 0), 0),
        bonus: xpHistory
          .filter((t: any) => t.sourceType === 'bonus')
          .reduce((acc: number, t: any) => acc + (t.xpGain || 0), 0),
        total: student.xp || 0,
      };

      const gmSnap = await getDoc(doc(db, 'grandeMissaoProgress', sId));
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
      if (body.name) updates.name = body.name;
      if (body.fullName) updates.fullName = body.fullName;
      if (body.classId) updates.classId = body.classId;
      if (body.turma) updates.turma = body.turma;
      if (body.studentNumber) updates.studentNumber = Number(body.studentNumber);
      if (typeof body.blocked === 'boolean') updates.blocked = body.blocked;
      await updateDoc(sRef, updates);
      return { success: true } as any;
    }

    if (method === 'DELETE') {
      await deleteDoc(sRef);
      return { success: true } as any;
    }
  }

  throw new Error(`Rota não encontrada no serviço local: ${pathname}`);
}
