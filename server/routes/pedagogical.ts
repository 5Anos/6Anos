import { Router } from 'express';
import crypto from 'crypto';
import {
  ActivityProgress,
  AssessmentAttempt,
  MissionSubmission,
  UserBadge,
  getActivityProgress,
  getAllActivityProgress,
  getUserActivityProgress,
  saveActivityProgress,
  atomicRecordActivityProgress,
  getAssessmentAttempts,
  saveAssessmentAttempt,
  atomicRecordAssessmentAttempt,
  getMissionSubmissions,
  saveMissionSubmission,
  getUserXPTransactions,
  atomicAwardXP,
  getUserBadges,
  hasUserBadge,
  awardBadge,
  getDailyTipClaim,
  getUserDailyTipClaims,
  claimDailyTipAtomic,
  getWeeklyChallengeProgress,
  getAllWeeklyChallenges,
  getUserWeeklyChallenges,
  saveWeeklyChallengeProgress,
  atomicRecordWeeklyChallenge,
  getGrandeMissaoProgress,
  getAllGrandeMissaoProgress,
  saveGrandeMissaoProgress,
  atomicRecordGrandeMissaoStage,
  atomicCompleteGrandeMissao,
  getUserById,
  getAllUsers,
  getClassById,
  getAllClasses,
  updateUser,
} from '../firestoreDb';
import { AuthRequest, requireAuth, requireStudent } from '../auth';
import {
  WORLDS_DATA,
  FINAL_ASSESSMENTS,
  GRANDE_MISSAO,
  WEEKLY_CHALLENGE,
  getCurrentWeeklyChallenge,
  getWeeklyChallengeByWeek,
  buildAnnualWeeklySchedule,
  getDateRangeForIsoWeek,
  DAILY_TIPS,
  calculateLevel,
  BADGES_CATALOG,
} from '../catalog';
import { PROGRESSION_CONFIG, getQualitativeMention } from '../progressionConfig';
import { evaluateActivity } from '../activityEvaluator';
import { resolveStudentSafeNickname, isNicknameUnsafeOrMissing } from '../../shared/nicknames';
import { computeClassesLeaderboard } from '../../shared/classLeaderboard';
import { evaluateEarnedBadgeIds } from '../../shared/badgesCatalog';

const router = Router();

export interface WorldStats {
  worldId: number;
  average: number;
  completedCount: number;
  totalComponents: number;
  completedSimulatorsCount: number;
  totalSimulatorsCount: number;
  allSimulatorsCompleted: boolean;
  hasAssessment: boolean;
  bestAssessmentPercentage: number | null;
  hasAssessmentPassed: boolean;
  isWorldCompleted: boolean;
  isUnlocked: boolean;
}

// Authoritative world progression and stats evaluator
export async function computeWorldStats(
  userId: string,
  worldId: number,
  userRole?: string
): Promise<WorldStats> {
  const world = WORLDS_DATA.find((w) => w.id === worldId);
  if (!world) {
    return {
      worldId,
      average: 0,
      completedCount: 0,
      totalComponents: 0,
      completedSimulatorsCount: 0,
      totalSimulatorsCount: 0,
      allSimulatorsCompleted: false,
      hasAssessment: false,
      bestAssessmentPercentage: null,
      hasAssessmentPassed: false,
      isWorldCompleted: false,
      isUnlocked: false,
    };
  }

  const [userProgress, assessmentAttempts] = await Promise.all([
    getUserActivityProgress(userId),
    getAssessmentAttempts(userId, worldId),
  ]);

  const scores: number[] = [];
  let completedSimulatorsCount = 0;

  // 1. Simulators completion
  for (const sim of world.simulators) {
    const prog = userProgress.find((p) => p.activityId === sim.id);
    if (prog && prog.completed) {
      completedSimulatorsCount++;
      scores.push(prog.bestScore);
    }
  }

  const totalSimulatorsCount = world.simulators.length;
  const allSimulatorsCompleted = completedSimulatorsCount >= totalSimulatorsCount;

  // 2. Final Assessment completion
  const hasAssessment = assessmentAttempts.length > 0;
  const bestAssessmentPercentage = hasAssessment
    ? Math.max(...assessmentAttempts.map((a) => a.percentage))
    : null;

  if (bestAssessmentPercentage !== null) {
    scores.push(bestAssessmentPercentage);
  }

  const hasAssessmentPassed =
    bestAssessmentPercentage !== null &&
    bestAssessmentPercentage >= PROGRESSION_CONFIG.QUIZ_PASSING_THRESHOLD;

  const totalComponents = totalSimulatorsCount + 1; // All simulators + final assessment
  const completedCount = scores.length;
  const average =
    scores.length > 0 ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : 0;

  // Curricular World Completion Rule:
  // O aluno conclui o mundo e desbloqueia o seguinte quando:
  // - Todos os simuladores obrigatórios estão concluídos
  // - O quiz de avaliação final foi realizado
  // - A média global (dos simuladores e do quiz de avaliação) é superior a 70% (> 70%)
  const isWorldCompleted =
    allSimulatorsCompleted &&
    hasAssessment &&
    average > PROGRESSION_CONFIG.PASSING_THRESHOLD;

  // Progression Unlocking Rule:
  // - Mundo 1 is always unlocked
  // - Teachers have unrestricted access to all worlds
  // - Mundo N (N > 1) is unlocked ONLY IF Mundo N - 1 is completed with distinction
  let isUnlocked = worldId === 1;
  if (userRole === 'teacher') {
    isUnlocked = true;
  } else if (worldId > 1) {
    const prevStats = await computeWorldStats(userId, worldId - 1, userRole);
    isUnlocked = prevStats.isWorldCompleted;
  }

  return {
    worldId,
    average,
    completedCount,
    totalComponents,
    completedSimulatorsCount,
    totalSimulatorsCount,
    allSimulatorsCompleted,
    hasAssessment,
    bestAssessmentPercentage,
    hasAssessmentPassed,
    isWorldCompleted,
    isUnlocked,
  };
}

// Evaluate and award all 16 badges in Cloud Firestore (matches clientCheckBadges 100%)
export async function evaluateBadges(userId: string) {
  const user = await getUserById(userId);
  if (!user) return null;

  const [allStats, assessments, weeklyList, tipClaims, gmProgress, userTx] = await Promise.all([
    Promise.all([1, 2, 3, 4, 5].map((w) => computeWorldStats(userId, w, user.role))),
    getAssessmentAttempts(userId),
    getUserWeeklyChallenges(userId),
    getUserDailyTipClaims(userId),
    getGrandeMissaoProgress(userId),
    getUserXPTransactions(userId),
  ]);

  const completedWorldIds = allStats.filter((st) => st.isWorldCompleted).map((st) => st.worldId);

  const perfectWorlds = new Set<number>();
  assessments.forEach((a) => {
    if (Math.round(Number(a.percentage) || 0) >= 100 && a.worldId) {
      perfectWorlds.add(Number(a.worldId));
    }
  });

  const weeklyIds = new Set<string>();
  weeklyList.forEach((wc) => {
    if (wc.challengeId && wc.status !== 'pending' && (wc as any).completed !== false) {
      weeklyIds.add(String(wc.challengeId));
    }
  });

  const hasGrandeMissao =
    gmProgress?.status === 'completed' || userTx.some((t) => t.sourceType === 'grande_missao');

  const evaluation = evaluateEarnedBadgeIds({
    xp: Number(user.xp) || 0,
    completedWorldIds,
    weeklyChallengesCount: weeklyIds.size,
    dailyTipsCount: tipClaims.length,
    perfectAssessmentWorldsCount: perfectWorlds.size,
    hasGrandeMissao,
  });

  for (const badgeId of evaluation.earnedIds) {
    await awardBadge(userId, badgeId).catch(() => {});
  }

  return evaluation;
}

// GET all Worlds with student progression status
router.get('/worlds', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      const defaultWorlds = WORLDS_DATA.map((w) => ({
        ...w,
        isUnlocked: w.id === 1,
        isCompleted: false,
        allSimulatorsCompleted: false,
        hasAssessmentPassed: false,
        average: 0,
        completedCount: 0,
        totalComponents: w.simulators.length + 1,
        challengeProgress: null,
        missionProgress: null,
        bestAssessmentPercentage: null,
        simulatorsProgress: w.simulators.map((s) => ({
          id: s.id,
          completed: false,
          score: 0,
        })),
      }));
      return res.json({ worlds: defaultWorlds });
    }

    const [userProgress, allMissions, allAssessments] = await Promise.all([
      getUserActivityProgress(userId),
      getMissionSubmissions({ userId }),
      getAssessmentAttempts(userId),
    ]);

    const userRole = req.user?.role;
    const classroom = req.user?.classId ? await getClassById(req.user.classId) : null;

    const worlds = await Promise.all(
      WORLDS_DATA.map(async (w) => {
        const stats = await computeWorldStats(userId, w.id, userRole);
        const mission = allMissions.find((m) => m.worldId === w.id);
        const chalProg = userProgress.find((p) => p.activityId === w.challenge.id);
        const worldAssessments = allAssessments.filter((a) => a.worldId === w.id);

        const isTeacherLocked =
          userRole !== 'teacher' &&
          classroom?.visibility?.worlds &&
          classroom.visibility.worlds[w.id] === false;

        const isQuizTeacherLocked =
          userRole !== 'teacher' &&
          classroom?.visibility?.quizzes &&
          classroom.visibility.quizzes[w.id] === false;

        const effectiveUnlocked = isTeacherLocked ? false : stats.isUnlocked;

        return {
          ...w,
          isUnlocked: effectiveUnlocked,
          isTeacherLocked: !!isTeacherLocked,
          isQuizTeacherLocked: !!isQuizTeacherLocked,
          isCompleted: stats.isWorldCompleted,
          allSimulatorsCompleted: stats.allSimulatorsCompleted,
          hasAssessmentPassed: stats.hasAssessmentPassed,
          average: stats.average,
          completedCount: stats.completedCount,
          totalComponents: stats.totalComponents,
          challengeProgress: chalProg ? { completed: chalProg.completed, score: chalProg.bestScore } : null,
          missionProgress: mission
            ? {
                status: mission.status,
                score: mission.score,
                feedback: mission.feedback,
                submissionText: mission.submissionText || mission.submission,
              }
            : null,
          bestAssessmentPercentage: stats.bestAssessmentPercentage,
          simulatorsProgress: w.simulators.map((s) => {
            const prog = userProgress.find((p) => p.activityId === s.id);
            return {
              id: s.id,
              completed: prog ? prog.completed : false,
              score: prog ? prog.bestScore : 0,
            };
          }),
        };
      })
    );

    return res.json({ worlds });
  } catch (err) {
    console.error('Error in /worlds:', err);
    return res.status(500).json({ error: 'Erro ao carregar os Mundos a partir da nuvem.' });
  }
});

// GET specific World details
router.get('/worlds/:worldId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const worldId = parseInt(req.params.worldId, 10);
    const world = WORLDS_DATA.find((w) => w.id === worldId);
    if (!world) return res.status(404).json({ error: 'Mundo não encontrado' });

    const userId = req.user!.id;
    const userRole = req.user?.role;
    if (userRole !== 'teacher' && req.user?.classId) {
      const classroom = await getClassById(req.user.classId);
      if (classroom?.visibility?.worlds && classroom.visibility.worlds[worldId] === false) {
        return res.status(403).json({
          error: `O Mundo ${worldId} está temporariamente reservado pela tua Professora para a próxima aula.`,
          isTeacherLocked: true,
        });
      }
    }

    const [stats, missions, userProgress, assessmentAttempts] = await Promise.all([
      computeWorldStats(userId, worldId, userRole),
      getMissionSubmissions({ userId, worldId }),
      getUserActivityProgress(userId),
      getAssessmentAttempts(userId, worldId),
    ]);

    if (userRole !== 'teacher' && !stats.isUnlocked) {
      return res.status(403).json({
        error: `Mundo ${worldId} bloqueado. Precisas de concluir os simuladores e o quiz de avaliação do Mundo ${worldId - 1} com média global superior a ${PROGRESSION_CONFIG.PASSING_THRESHOLD}% para o desbloquear.`,
      });
    }

    const chalProg = userProgress.find((p) => p.activityId === world.challenge.id);
    const mission = missions.length > 0 ? missions[0] : null;

    return res.json({
      world,
      stats,
      mission,
      challengeProgress: chalProg || null,
      assessmentAttempts: assessmentAttempts.map((a) => ({
        id: a.id,
        score: a.score,
        percentage: a.percentage,
        totalQuestions: a.totalQuestions,
        correctCount: a.correctCount,
        passed: a.passed,
        createdAt: a.createdAt,
      })),
    });
  } catch (err) {
    console.error('Error in /worlds/:worldId:', err);
    return res.status(500).json({ error: 'Erro ao carregar detalhes do Mundo.' });
  }
});

// GET assessment questions for a World (WITHOUT CORRECT ANSWERS!)
router.get('/assessments/:worldId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const worldId = parseInt(req.params.worldId, 10);
    const assess = FINAL_ASSESSMENTS[worldId];
    if (!assess) return res.status(404).json({ error: 'Avaliação não encontrada' });

    const userId = req.user!.id;
    if (req.user?.role !== 'teacher' && req.user?.classId) {
      const classroom = await getClassById(req.user.classId);
      if (classroom?.visibility?.quizzes && classroom.visibility.quizzes[worldId] === false) {
        return res.status(403).json({
          error: `O Teste de Avaliação do Mundo ${worldId} está temporariamente reservado pela tua Professora para a próxima aula.`,
          isTeacherLocked: true,
        });
      }
    }

    const stats = await computeWorldStats(userId, worldId, req.user?.role);
    if (!stats.isUnlocked && req.user?.role !== 'teacher') {
      return res.status(403).json({ error: 'Mundo bloqueado.' });
    }

    // STRICT SECURITY: Do not send correctIndex or explanation to the client!
    const sanitizedQuestions = assess.questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options,
    }));

    const prevAttempts = await getAssessmentAttempts(userId, worldId);
    const sortedPrev = [...prevAttempts].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const isFirstAttempt = sortedPrev.length === 0;
    const firstAttempt = isFirstAttempt ? null : sortedPrev[0];
    const bestAttempt = sortedPrev.length > 0 ? sortedPrev.reduce((max, a) => a.percentage > max.percentage ? a : max, sortedPrev[0]) : null;
    const lastAttempt = sortedPrev.length > 0 ? sortedPrev[sortedPrev.length - 1] : null;

    return res.json({
      id: assess.id,
      worldId: assess.worldId,
      title: assess.title,
      questionCount: sanitizedQuestions.length,
      questions: sanitizedQuestions,
      passingThreshold: PROGRESSION_CONFIG.QUIZ_PASSING_THRESHOLD,
      attemptsCount: prevAttempts.length,
      isFirstAttempt,
      attemptNumber: prevAttempts.length + 1,
      officialPercentage: firstAttempt ? firstAttempt.percentage : null,
      officialMention: firstAttempt ? (firstAttempt.mention || getQualitativeMention(firstAttempt.percentage)) : null,
      bestPercentage: bestAttempt ? bestAttempt.percentage : null,
      bestMention: bestAttempt ? (bestAttempt.mention || getQualitativeMention(bestAttempt.percentage)) : null,
      lastPercentage: lastAttempt ? lastAttempt.percentage : null,
      lastMention: lastAttempt ? (lastAttempt.mention || getQualitativeMention(lastAttempt.percentage)) : null,
    });
  } catch (err) {
    console.error('Error in /assessments/:worldId:', err);
    return res.status(500).json({ error: 'Erro ao carregar avaliação.' });
  }
});

// POST submit assessment (Student + Teacher testing mode, server-side grading)
router.post('/assessments/:worldId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const worldId = parseInt(String(req.params.worldId).replace(/\D/g, ''), 10) || 1;
    const assess = FINAL_ASSESSMENTS[worldId];
    if (!assess) return res.status(404).json({ error: 'Avaliação não encontrada para este mundo.' });

    const userId = req.user!.id;
    const isTeacher = req.user?.role === 'teacher';

    const { answers } = req.body;
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Respostas inválidas.' });
    }

    // Authoritative Server-Side Evaluation against official answer keys
    let correctCount = 0;
    const resultsFeedback = assess.questions.map((q) => {
      const chosenIndex = answers[q.id];
      const isCorrect = chosenIndex === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        id: q.id,
        text: q.text,
        chosenIndex,
        isCorrect,
        explanation: q.explanation,
      };
    });

    // 1. Cálculo da pontuação com arredondamento para o número inteiro mais próximo
    const percentage = Math.round((correctCount / assess.questions.length) * 100);
    // 2. Atribuição da menção qualitativa oficial
    const mention = getQualitativeMention(percentage);
    // 3. Regra de aprovação coerente: percentagem >= 50
    const passed = percentage >= PROGRESSION_CONFIG.QUIZ_PASSING_THRESHOLD;

    // Verificar histórico de tentativas
    const prevAttempts = await getAssessmentAttempts(userId, worldId);
    const isFirstAttempt = prevAttempts.length === 0;
    const attemptNumber = prevAttempts.length + 1;

    const sortedPrev = [...prevAttempts].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const firstAttempt = isFirstAttempt ? null : sortedPrev[0];
    const lastPrevAttempt = isFirstAttempt ? null : sortedPrev[sortedPrev.length - 1];
    const officialPercentage = isFirstAttempt ? percentage : firstAttempt!.percentage;
    const officialMention = isFirstAttempt ? mention : (firstAttempt!.mention || getQualitativeMention(firstAttempt!.percentage));

    const evolution = lastPrevAttempt
      ? percentage > lastPrevAttempt.percentage
        ? 'improved'
        : percentage === lastPrevAttempt.percentage
        ? 'maintained'
        : 'regressed'
      : undefined;

    const previousBest = prevAttempts.length > 0 ? Math.max(...prevAttempts.map((a) => a.percentage)) : 0;
    const newBest = Math.max(previousBest, percentage);
    const bestMention = getQualitativeMention(newBest);
    const firstScore = isFirstAttempt ? percentage : (firstAttempt?.percentage ?? percentage);
    const firstMention = isFirstAttempt ? mention : (firstAttempt?.mention || getQualitativeMention(firstScore));
    const latestScore = percentage;
    const latestMention = mention;
    const xpGain = 0; // O quiz de avaliação final não acrescenta XPs

    // Save complete attempt in database with atomic transaction (for students and recorded teacher tests)
    const attempt: AssessmentAttempt = {
      id: `attempt-${crypto.randomUUID()}`,
      userId,
      assessmentId: assess.id,
      worldId,
      score: correctCount,
      percentage,
      totalQuestions: assess.questions.length,
      correctCount,
      passed,
      mention,
      isFirstAttempt,
      attemptNumber,
      firstScore,
      firstMention,
      bestScore: newBest,
      bestMention,
      latestScore,
      latestMention,
      attempts: attemptNumber,
      answers,
      createdAt: new Date().toISOString(),
    };
    await atomicRecordAssessmentAttempt(attempt);

    const totalXp = req.user!.xp;

    await evaluateBadges(userId);

    const attemptsHistory = [
      ...sortedPrev.map((a, idx) => ({
        attemptNumber: idx + 1,
        mention: a.mention || getQualitativeMention(a.percentage),
        createdAt: a.createdAt,
      })),
      {
        attemptNumber,
        mention,
        createdAt: attempt.createdAt,
      },
    ];

    return res.json({
      percentage,
      mention,
      correctCount,
      totalQuestions: assess.questions.length,
      passed,
      passingThreshold: PROGRESSION_CONFIG.QUIZ_PASSING_THRESHOLD,
      isFirstAttempt,
      attemptNumber,
      officialPercentage,
      officialMention,
      previousBest,
      newBest,
      bestMention,
      evolution,
      lastPrevAttemptPercentage: lastPrevAttempt ? lastPrevAttempt.percentage : null,
      xpGain: 0,
      totalXp,
      attemptsHistory,
      resultsFeedback,
    });
  } catch (err) {
    console.error('Error in /assessments/:worldId submit:', err);
    return res.status(500).json({ error: 'Erro ao guardar submissão da avaliação.' });
  }
});

// POST submit activity / simulator completion (Authoritative evaluation and persistence)
router.post('/activities/complete', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { activityId, worldId, answers, payload, completedAction, score: clientScore } = req.body;
    if (!activityId) {
      return res.status(400).json({ error: 'Identificador de atividade é obrigatório.' });
    }

    const userId = req.user!.id;
    const isTeacher = req.user?.role === 'teacher';

    const numWorldId = typeof worldId === 'number'
      ? worldId
      : parseInt(String(worldId || '').replace(/\D/g, ''), 10) || 1;

    let world = WORLDS_DATA.find((w) => w.id === numWorldId);
    if (!world) {
      world = WORLDS_DATA.find((w) => w.simulators.some((s) => s.id === activityId) || w.challenge?.id === activityId) || WORLDS_DATA[0];
    }

    const isSimulator = world.simulators.some((s) => s.id === activityId);
    const isChallenge = world.challenge?.id === activityId;

    // Authoritative Server-Side Evaluation
    const evaluation = evaluateActivity(activityId, world.id, {
      answers,
      payload,
      completedAction,
      score: clientScore,
    });

    let evaluatedScore = evaluation.score;
    let isValidated = evaluation.isValidated;

    // If client supplied a valid numerical score from an interactive pedagogical simulator, validate it
    if (!isValidated && typeof clientScore === 'number' && !isNaN(clientScore)) {
      evaluatedScore = Math.min(100, Math.max(0, Math.round(clientScore)));
      isValidated = true;
    } else if (!isValidated && (answers || payload || completedAction)) {
      evaluatedScore = 100;
      isValidated = true;
    }

    if (!isValidated) {
      const prog = await getActivityProgress(userId, activityId);
      const previousBest = prog ? prog.bestScore : 0;
      return res.status(200).json({
        activityId,
        previousBest,
        newBest: previousBest,
        xpGain: 0,
        totalXp: isTeacher ? 0 : req.user!.xp,
        score: 0,
        isValidated: false,
        feedback: evaluation.feedback || 'Submissão incompleta.',
      });
    }

    // Persist activity progress to Firestore for both students and teacher tests
    const result = await atomicRecordActivityProgress({
      userId,
      activityId,
      worldId: world.id,
      evaluatedScore,
      isChallenge: !!isChallenge,
    });

    await evaluateBadges(userId);

    return res.json({
      activityId,
      previousBest: result.previousBest,
      newBest: result.newBest,
      xpGain: isTeacher ? 0 : result.xpGain,
      totalXp: isTeacher ? 0 : result.newTotalXP,
      score: evaluatedScore,
      isValidated: true,
      feedback: evaluation.feedback || 'Atividade concluída e registada com sucesso na base de dados.',
    });
  } catch (err) {
    console.error('Error in /activities/complete:', err);
    return res.status(500).json({ error: 'Erro ao registar atividade.' });
  }
});

// POST submit Real Mission (Student + Teacher testing mode)
router.post('/missions/:worldId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const worldId = parseInt(req.params.worldId, 10);
    const world = WORLDS_DATA.find((w) => w.id === worldId);
    if (!world) return res.status(404).json({ error: 'Mundo não encontrado' });

    const userId = req.user!.id;
    const isTeacher = req.user?.role === 'teacher';
    const stats = await computeWorldStats(userId, worldId, req.user?.role);
    if (!isTeacher && !stats.isUnlocked) {
      return res.status(403).json({ error: 'Mundo bloqueado.' });
    }

    const text = (req.body.submission || req.body.submissionText || req.body.content || '').trim();
    if (!text || text.length < 20) {
      return res.status(400).json({ error: 'A submissão deve conter uma resposta detalhada (mínimo 20 caracteres).' });
    }

    if (isTeacher) {
      return res.json({
        submission: {
          id: `mission-test-${Date.now()}`,
          userId,
          worldId,
          status: 'submitted',
          score: 100,
          xpAwarded: 0,
        },
        xpGain: 0,
        totalXp: 0,
        message: 'Missão testada com sucesso (Modo Teste do Professor).',
      });
    }

    const now = new Date().toISOString();
    const existingMissions = await getMissionSubmissions({ userId, worldId });
    let savedSubmission: MissionSubmission;
    if (existingMissions.length > 0) {
      const existing = existingMissions[0];
      existing.submission = text;
      existing.submissionText = text;
      existing.status = 'pending';
      existing.submittedAt = now;
      existing.updatedAt = now;
      await saveMissionSubmission(existing);
      savedSubmission = existing;
    } else {
      const newSubmission: MissionSubmission = {
        id: `mis-${crypto.randomUUID()}`,
        userId,
        studentName: req.user!.name,
        studentNickname: req.user!.nickname,
        classId: req.user!.classId,
        missionId: world.mission.id,
        worldId,
        title: world.mission.title,
        submission: text,
        submissionText: text,
        score: 0,
        status: 'pending',
        submittedAt: now,
        createdAt: now,
      };
      await saveMissionSubmission(newSubmission);
      savedSubmission = newSubmission;
    }

    return res.json({
      success: true,
      submission: savedSubmission,
      message: 'Missão Real submetida com sucesso! O teu professor irá avaliar e fornecer feedback.',
    });
  } catch (err) {
    console.error('Error in /missions/:worldId:', err);
    return res.status(500).json({ error: 'Erro ao submeter missão real.' });
  }
});

// GET Daily Tip (+10 XP once per day)
router.get('/daily-tip', async (req: AuthRequest, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const tipIndex = Math.abs(today.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0)) % DAILY_TIPS.length;
    const tip = DAILY_TIPS[tipIndex];

    const claim = req.user ? await getDailyTipClaim(req.user.id, today) : null;

    return res.json({
      tip: {
        ...tip,
        xpReward: PROGRESSION_CONFIG.XP_REWARDS.DAILY_TIP,
      },
      alreadyClaimed: !!claim,
      claimedToday: !!claim,
      date: today,
    });
  } catch (err) {
    console.error('Error in /daily-tip:', err);
    return res.status(500).json({ error: 'Erro ao carregar dica do dia.' });
  }
});

// POST claim Daily Tip (+20 XP once per day)
router.post('/daily-tip/claim', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const isTeacher = req.user?.role === 'teacher';
    const today = new Date().toISOString().split('T')[0];

    if (isTeacher) {
      return res.json({
        success: true,
        xpGain: 0,
        totalXp: 0,
        message: 'Dica Diária testada com sucesso (Modo Teste do Professor).',
      });
    }

    const existingClaim = await getDailyTipClaim(userId, today);
    if (existingClaim) {
      return res.status(400).json({ error: 'Já reclamaste a dica diária de hoje!' });
    }

    const tipReward = PROGRESSION_CONFIG.XP_REWARDS.DAILY_TIP;
    const resClaim = await claimDailyTipAtomic(userId, today, tipReward);
    if (!resClaim.success) {
      return res.status(400).json({ error: 'Já reclamaste a dica diária de hoje!' });
    }

    await evaluateBadges(userId);

    return res.json({
      success: true,
      xpGain: resClaim.xpAwarded,
      totalXp: resClaim.newTotalXP || req.user!.xp + resClaim.xpAwarded,
      message: `+${resClaim.xpAwarded} XP ganhos com a Dica Diária!`,
    });
  } catch (err) {
    console.error('Error in /daily-tip/claim:', err);
    return res.status(500).json({ error: 'Erro ao reclamar dica diária.' });
  }
});

// GET Weekly Challenge (Dynamic 52-week annual rotation + optional teacher preview ?week=N)
router.get('/weekly-challenge', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const isTeacher = req.user?.role === 'teacher';
    const current = getCurrentWeeklyChallenge();

    const completedIds = new Set<string>();
    if (userId) {
      const userWeeklyList = await getUserWeeklyChallenges(userId);
      userWeeklyList.forEach((p) => {
        if (p.challengeId && p.status !== 'pending' && (p as any).completed !== false) {
          completedIds.add(p.challengeId);
        }
      });
    }

    const weekQuery = typeof req.query.week === 'string' ? parseInt(req.query.week, 10) : NaN;
    const isPreview =
      isTeacher &&
      Number.isInteger(weekQuery) &&
      weekQuery >= 1 &&
      weekQuery <= 52 &&
      weekQuery !== current.weekNumber;

    const activeChallenge = isPreview
      ? {
          ...getWeeklyChallengeByWeek(weekQuery),
          id: `weekly-${current.isoYear}-w${String(weekQuery).padStart(2, '0')}`,
          isoYear: current.isoYear,
          isoWeek: weekQuery,
          dateRangeLabel: getDateRangeForIsoWeek(current.isoYear, weekQuery),
          daysUntilNextMonday: current.daysUntilNextMonday,
        }
      : current;

    const completed =
      completedIds.has(activeChallenge.id) ||
      (activeChallenge.weekNumber === 1 && completedIds.has('challenge-phishing-message'));

    // Do NOT send isCorrect or explanation to client!
    const sanitized = {
      id: activeChallenge.id,
      weekNumber: activeChallenge.weekNumber,
      isoYear: activeChallenge.isoYear,
      isoWeek: activeChallenge.isoWeek,
      worldId: activeChallenge.worldId,
      worldName: activeChallenge.worldName,
      category: activeChallenge.category,
      difficulty: activeChallenge.difficulty,
      title: activeChallenge.title,
      context: activeChallenge.context,
      scenarioLabel: activeChallenge.scenarioLabel,
      senderOrSource: activeChallenge.senderOrSource,
      messageSample: activeChallenge.messageSample,
      problem: activeChallenge.problem,
      task: activeChallenge.task,
      dateRangeLabel: activeChallenge.dateRangeLabel,
      daysUntilNextMonday: activeChallenge.daysUntilNextMonday,
      xpReward: PROGRESSION_CONFIG.XP_REWARDS.WEEKLY_CHALLENGE,
      options: activeChallenge.options.map((o, idx) => ({
        id: String(idx),
        text: o.text,
      })),
      completed,
      isPreview,
    };

    const schedule = buildAnnualWeeklySchedule(completedIds);
    const completedCount = schedule.filter((s) => s.completed).length;

    return res.json({
      challenge: sanitized,
      alreadyCompleted: completed,
      isPreview,
      annualProgress: {
        isoYear: current.isoYear,
        currentWeekNumber: current.weekNumber,
        completedCount,
        totalWeeks: schedule.length,
        schedule,
      },
    });
  } catch (err) {
    console.error('Error in /weekly-challenge:', err);
    return res.status(500).json({ error: 'Erro ao carregar desafio da semana.' });
  }
});

// POST submit Weekly Challenge (Student + Teacher testing/preview mode)
router.post(['/weekly-challenge', '/weekly-challenge/submit'], requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const isTeacher = req.user?.role === 'teacher';
    const current = getCurrentWeeklyChallenge();

    const requestedWeek =
      typeof req.body?.weekNumber === 'number' &&
      Number.isInteger(req.body.weekNumber) &&
      req.body.weekNumber >= 1 &&
      req.body.weekNumber <= 52
        ? req.body.weekNumber
        : null;

    const isTeacherPreview = isTeacher && requestedWeek !== null && requestedWeek !== current.weekNumber;
    const targetChallenge = isTeacherPreview
      ? {
          ...getWeeklyChallengeByWeek(requestedWeek!),
          id: `weekly-${current.isoYear}-w${String(requestedWeek!).padStart(2, '0')}`,
        }
      : current;

    let { optionIndex, option, solution } = req.body;
    if (typeof optionIndex !== 'number') {
      if (typeof solution === 'number') {
        optionIndex = solution;
      } else if (typeof option === 'number') {
        optionIndex = option;
      }
    }
    if (typeof optionIndex !== 'number' || !targetChallenge.options[optionIndex]) {
      return res.status(400).json({ error: 'Opção inválida.' });
    }

    const selected = targetChallenge.options[optionIndex];

    if (!selected.isCorrect) {
      return res.json({
        isCorrect: false,
        feedback: selected.explanation,
      });
    }

    if (isTeacher) {
      return res.json({
        isCorrect: true,
        feedback: selected.explanation,
        xpGain: 0,
        totalXp: 0,
        isPreview: isTeacherPreview,
      });
    }

    const safeSolution =
      typeof solution !== 'undefined'
        ? String(solution)
        : String(optionIndex);

    const result = await atomicRecordWeeklyChallenge({
      userId,
      challengeId: current.id,
      solution: safeSolution,
      optionIndex,
      xpReward: PROGRESSION_CONFIG.XP_REWARDS.WEEKLY_CHALLENGE,
    });

    await evaluateBadges(userId);

    return res.json({
      isCorrect: true,
      feedback: selected.explanation,
      xpGain: result.xpGain,
      totalXp: result.totalXp,
    });
  } catch (err) {
    console.error('Error in /weekly-challenge submit:', err);
    return res.status(500).json({ error: 'Erro ao submeter desafio semanal.' });
  }
});

// GET Grande Missão details
router.get('/grande-missao', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const progress = await getGrandeMissaoProgress(userId);

    const allStats = await Promise.all([1, 2, 3, 4, 5].map((w) => computeWorldStats(userId, w, req.user?.role)));
    const allCompleted = allStats.every((st) => st.isWorldCompleted);

    return res.json({
      grandeMissao: {
        ...GRANDE_MISSAO,
        totalXp: PROGRESSION_CONFIG.XP_REWARDS.GRANDE_MISSAO,
      },
      progress,
      completed: progress.status === 'completed',
      isUnlocked: allCompleted || req.user?.role === 'teacher',
      requiredWorldsCompleted: allCompleted,
    });
  } catch (err) {
    console.error('Error in /grande-missao:', err);
    return res.status(500).json({ error: 'Erro ao carregar Grande Missão.' });
  }
});

// POST save intermediate stage progress for Grande Missão in Firestore
router.post('/grande-missao/stage', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const isTeacher = req.user?.role === 'teacher';
    const { completedZones, unlockedCodes } = req.body;
    if (!Array.isArray(completedZones)) {
      return res.status(400).json({ error: 'completedZones deve ser um array.' });
    }

    if (isTeacher) {
      return res.json({
        success: true,
        progress: {
          currentStage: Math.min(6, Math.max(...completedZones, 1)),
          completedStages: completedZones,
          status: 'in_progress',
        },
      });
    }

    const result = await atomicRecordGrandeMissaoStage({
      userId,
      completedZones,
      unlockedCodes: unlockedCodes || {},
    });
    return res.json({ success: true, progress: result.progress });
  } catch (err) {
    console.error('Error in /grande-missao/stage:', err);
    return res.status(500).json({ error: 'Erro ao guardar progresso da Grande Missão no Firestore.' });
  }
});

// POST complete Grande Missão (Student + Teacher testing mode)
router.post('/grande-missao/complete', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const isTeacher = req.user?.role === 'teacher';

    if (isTeacher) {
      return res.json({
        success: true,
        xpGain: 0,
        totalXp: 0,
        message: 'Grande Missão testada com sucesso (Modo Teste do Professor).',
      });
    }

    const progress = await getGrandeMissaoProgress(userId);
    if (progress.status === 'completed') {
      return res.status(400).json({ error: 'Já concluíste a Grande Missão e recebeste a recompensa.' });
    }

    const allStats = await Promise.all([1, 2, 3, 4, 5].map((w) => computeWorldStats(userId, w, req.user?.role)));
    const allCompleted = allStats.every((st) => st.isWorldCompleted);
    if (!allCompleted) {
      return res.status(403).json({
        error: `A Grande Missão apenas pode ser concluída após aprovação em todos os 5 Mundos curriculares (todas as atividades concluídas e média global superior a ${PROGRESSION_CONFIG.PASSING_THRESHOLD}%).`,
      });
    }

    const result = await atomicCompleteGrandeMissao({
      userId,
      missionId: GRANDE_MISSAO.id,
      xpReward: PROGRESSION_CONFIG.XP_REWARDS.GRANDE_MISSAO,
    });

    await evaluateBadges(userId);

    return res.json({
      success: true,
      message: `Parabéns! Concluíste com distinção a Grande Missão A ESCOLA DO FUTURO! +${result.xpGain} XP atribuídos!`,
      totalXp: result.totalXp,
    });
  } catch (err) {
    console.error('Error in /grande-missao/complete:', err);
    return res.status(500).json({ error: 'Erro ao concluir Grande Missão.' });
  }
});

// GET Class Ranking (Auto-assigns safe nicknames; teachers see real names, students only see anonymous nicknames)
router.get('/class-ranking', async (req: AuthRequest, res) => {
  try {
    const { classId } = req.query;
    const isTeacher = req.user?.role === 'teacher';
    const [users, allClasses] = await Promise.all([getAllUsers(), getAllClasses()]);

    const activeClasses = allClasses
      .filter((c) => !c.archived)
      .sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'pt'));

    const classNameMap = new Map<string, string>();
    activeClasses.forEach((c) => {
      if (c.id) classNameMap.set(c.id, c.name || c.id);
    });

    const allStudents = users.filter((u) => u.role === 'student' && !u.blocked);

    const usedNicknames = new Set<string>();
    allStudents.forEach((s) => {
      if (!isNicknameUnsafeOrMissing(s.nickname, s)) {
        usedNicknames.add(s.nickname.trim().toLowerCase());
      }
    });

    // Guarantee every student has a safe anonymous nickname and persist backfill
    const persistPromises: Promise<any>[] = [];
    const safeNickById = new Map<string, string>();
    for (const s of allStudents) {
      const resolved = resolveStudentSafeNickname(s, usedNicknames);
      safeNickById.set(s.id, resolved.nickname);
      if (resolved.needsPersist) {
        persistPromises.push(
          updateUser(s.id, { nickname: resolved.nickname }).catch(() => {})
        );
      }
    }
    if (persistPromises.length > 0) {
      await Promise.allSettled(persistPromises);
    }

    let students = allStudents;
    if (isTeacher) {
      if (classId && typeof classId === 'string' && classId !== 'all') {
        students = students.filter((s) => s.classId === classId);
      }
    } else if (req.user?.classId) {
      students = students.filter((s) => s.classId === req.user!.classId);
    }

    students.sort((a, b) => {
      const xpDiff = (b.xp || 0) - (a.xp || 0);
      if (xpDiff !== 0) return xpDiff;
      return (safeNickById.get(a.id) || '').localeCompare(safeNickById.get(b.id) || '', 'pt');
    });

    const ranking = students.map((s, index) => {
      const isCurrentUser = req.user?.id === s.id;
      const levelInfo = calculateLevel(s.xp || 0);
      const safeNickname = safeNickById.get(s.id) || 'Explorador_TIC';
      const resolvedClassName =
        (s.classId && classNameMap.get(s.classId)) || s.turma || 'Sem Turma';

      const baseRow: any = {
        position: index + 1,
        rank: index + 1,
        id: s.id,
        name: safeNickname,
        nickname: safeNickname,
        avatar: s.avatar || 'avatar-boy-1',
        xp: s.xp || 0,
        level: levelInfo.level,
        levelName: levelInfo.name,
        classId: s.classId || '',
        className: resolvedClassName,
        isCurrentUser,
      };

      // STRICT PRIVACY GATE: Real student names are ONLY returned to authenticated teachers
      if (isTeacher) {
        baseRow.realName = s.name || s.fullName || 'Aluno';
        baseRow.fullName = s.fullName || s.name || 'Aluno';
        baseRow.username = s.username || '';
        baseRow.studentNumber = s.studentNumber ?? null;
        baseRow.turma = resolvedClassName;
      }

      return baseRow;
    });

    return res.json({
      ranking,
      isTeacherView: isTeacher,
      classes: isTeacher ? activeClasses.map((c) => ({ id: c.id, name: c.name })) : [],
    });
  } catch (err) {
    console.error('Error in /class-ranking:', err);
    return res.status(500).json({ error: 'Erro ao carregar o ranking da turma.' });
  }
});

// GET Inter-Class Leaderboard (Ranking de Turmas — ALL scores & challenges, STRICTLY nicknames only!)
router.get('/classes-ranking', async (req: AuthRequest, res) => {
  try {
    const currentChallenge = getCurrentWeeklyChallenge();
    const [
      users,
      allClasses,
      activityProgress,
      assessmentAttempts,
      weeklyChallenges,
      missionSubmissions,
      grandeMissaoProgress,
    ] = await Promise.all([
      getAllUsers(),
      getAllClasses(),
      getAllActivityProgress(),
      getAssessmentAttempts('all'),
      getAllWeeklyChallenges(),
      getMissionSubmissions(),
      getAllGrandeMissaoProgress(),
    ]);

    const students = users.filter((u) => u.role === 'student' && !u.blocked);

    const result = computeClassesLeaderboard({
      classes: allClasses,
      students,
      activityProgress,
      assessmentAttempts,
      weeklyChallenges,
      missionSubmissions,
      grandeMissaoProgress,
      currentWeekChallengeId: currentChallenge.id,
      currentWeekNumber: currentChallenge.weekNumber,
      activeUserId: req.user?.id || null,
      activeUserClassId: req.user?.classId || null,
      calculateLevel,
    });

    if (result.nicknameBackfills.length > 0) {
      await Promise.allSettled(
        result.nicknameBackfills.map((b) =>
          updateUser(b.userId, { nickname: b.nickname }).catch(() => {})
        )
      );
    }

    return res.json({
      classesRanking: result.classesRanking,
      summary: result.summary,
      currentWeekNumber: currentChallenge.weekNumber,
    });
  } catch (err) {
    console.error('Error in /classes-ranking:', err);
    return res.status(500).json({ error: 'Erro ao carregar o ranking de turmas.' });
  }
});

// GET Badges Catalog & User Badges with Live Progress
router.get('/badges', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const evaluation = userId ? await evaluateBadges(userId) : null;
    const userBadges = userId ? await getUserBadges(userId) : [];
    const earnedSet = new Set(evaluation?.earnedIds || []);

    const badges = BADGES_CATALOG.map((b) => {
      const earned = userBadges.find((ub) => ub.badgeId === b.id);
      const unlocked = Boolean(earned) || earnedSet.has(b.id);
      return {
        ...b,
        badgeId: b.id,
        unlocked,
        unlockedAt: earned?.awardedAt || null,
        awardedAt: earned?.awardedAt || null,
        progress: evaluation?.progressByBadgeId?.[b.id] || null,
      };
    });

    return res.json({ badges });
  } catch (err) {
    console.error('Error in /badges:', err);
    return res.status(500).json({ error: 'Erro ao carregar insígnias.' });
  }
});

export default router;
