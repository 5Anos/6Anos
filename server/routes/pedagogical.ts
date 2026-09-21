import { Router } from 'express';
import crypto from 'crypto';
import {
  ActivityProgress,
  AssessmentAttempt,
  MissionSubmission,
  UserBadge,
  getActivityProgress,
  getUserActivityProgress,
  saveActivityProgress,
  getAssessmentAttempts,
  saveAssessmentAttempt,
  getMissionSubmissions,
  saveMissionSubmission,
  getUserXPTransactions,
  atomicAwardXP,
  getUserBadges,
  hasUserBadge,
  awardBadge,
  getDailyTipClaim,
  claimDailyTipAtomic,
  getWeeklyChallengeProgress,
  saveWeeklyChallengeProgress,
  getGrandeMissaoProgress,
  saveGrandeMissaoProgress,
  getUserById,
  getAllUsers,
  getClassById,
} from '../firestoreDb';
import { AuthRequest, requireAuth, requireStudent } from '../auth';
import {
  WORLDS_DATA,
  FINAL_ASSESSMENTS,
  GRANDE_MISSAO,
  WEEKLY_CHALLENGE,
  DAILY_TIPS,
  calculateLevel,
  BADGES_CATALOG,
} from '../catalog';
import { PROGRESSION_CONFIG, getQualitativeMention } from '../progressionConfig';
import { evaluateActivity } from '../activityEvaluator';

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
    bestAssessmentPercentage >= PROGRESSION_CONFIG.PASSING_THRESHOLD;

  const totalComponents = totalSimulatorsCount + 1; // All simulators + final assessment
  const completedCount = scores.length;
  const average =
    scores.length > 0 ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : 0;

  // Curricular World Completion Rule:
  // A world is completed ONLY when:
  // - All required simulators are completed
  // - The final assessment has been taken
  // - The assessment score meets or exceeds the competency threshold (75%)
  // - The world average across components meets or exceeds 75%
  const isWorldCompleted =
    allSimulatorsCompleted &&
    hasAssessmentPassed &&
    average >= PROGRESSION_CONFIG.PASSING_THRESHOLD;

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

// Check and award world badges or centurion badge in Cloud Firestore
export async function evaluateBadges(userId: string) {
  const user = await getUserById(userId);
  if (!user) return;

  const worldBadgeMap: Record<number, string> = {
    1: 'guardiao-digital',
    2: 'detetive-digital',
    3: 'criador-digital',
    4: 'engenheiro-digital',
    5: 'explorador-da-ia',
  };

  for (let w = 1; w <= 5; w++) {
    const stats = await computeWorldStats(userId, w, user.role);
    if (stats.isWorldCompleted) {
      await awardBadge(userId, worldBadgeMap[w]);
    }
  }

  // Centurion: >= 1000 XP or 100% in an assessment
  const assessments = await getAssessmentAttempts(userId);
  const has100Assess = assessments.some((a) => a.percentage === 100);
  if (user.xp >= PROGRESSION_CONFIG.BADGES.CENTURION_XP_THRESHOLD || has100Assess) {
    await awardBadge(userId, 'centuriao-digital');
  }

  // Master: Grande Missão completed + all 5 worlds completed
  const userTx = await getUserXPTransactions(userId);
  const hasGM = userTx.some((t) => t.sourceType === 'grande_missao');
  const allStats = await Promise.all([1, 2, 3, 4, 5].map((w) => computeWorldStats(userId, w, user.role)));
  const allCompleted = allStats.every((st) => st.isWorldCompleted);
  if (hasGM && allCompleted) {
    await awardBadge(userId, 'mestre-da-missao-tic');
  }
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
    const worlds = await Promise.all(
      WORLDS_DATA.map(async (w) => {
        const stats = await computeWorldStats(userId, w.id, userRole);
        const mission = allMissions.find((m) => m.worldId === w.id);
        const chalProg = userProgress.find((p) => p.activityId === w.challenge.id);
        const worldAssessments = allAssessments.filter((a) => a.worldId === w.id);

        return {
          ...w,
          isUnlocked: stats.isUnlocked,
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
    const [stats, missions, userProgress, assessmentAttempts] = await Promise.all([
      computeWorldStats(userId, worldId, userRole),
      getMissionSubmissions({ userId, worldId }),
      getUserActivityProgress(userId),
      getAssessmentAttempts(userId, worldId),
    ]);

    if (userRole !== 'teacher' && !stats.isUnlocked) {
      return res.status(403).json({
        error: `Mundo ${worldId} bloqueado. Precisas de concluir todas as atividades e obter pelo menos ${PROGRESSION_CONFIG.PASSING_THRESHOLD}% na Avaliação Final do Mundo anterior para o desbloquear.`,
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
      passingThreshold: PROGRESSION_CONFIG.PASSING_THRESHOLD,
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

// POST submit assessment (Student ONLY, server-side grading, complete attempt record)
router.post('/assessments/:worldId', requireStudent, async (req: AuthRequest, res) => {
  try {
    const worldId = parseInt(req.params.worldId, 10);
    const assess = FINAL_ASSESSMENTS[worldId];
    if (!assess) return res.status(404).json({ error: 'Avaliação não encontrada' });

    const userId = req.user!.id;
    const stats = await computeWorldStats(userId, worldId, req.user?.role);
    if (!stats.isUnlocked) {
      return res.status(403).json({ error: 'Mundo bloqueado. Não é permitido submeter avaliações de Mundos bloqueados.' });
    }

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
    const passed = percentage >= PROGRESSION_CONFIG.PASSING_THRESHOLD;

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

    // Save complete attempt in database with official persistent fields
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
    await saveAssessmentAttempt(attempt);

    const totalXp = req.user!.xp;

    await evaluateBadges(userId);

    return res.json({
      percentage,
      mention,
      correctCount,
      totalQuestions: assess.questions.length,
      passed,
      passingThreshold: PROGRESSION_CONFIG.PASSING_THRESHOLD,
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
      resultsFeedback,
    });
  } catch (err) {
    console.error('Error in /assessments/:worldId submit:', err);
    return res.status(500).json({ error: 'Erro ao guardar submissão da avaliação.' });
  }
});

// POST submit activity / simulator completion (Student ONLY, authoritative evaluation)
router.post('/activities/complete', requireStudent, async (req: AuthRequest, res) => {
  try {
    const { activityId, worldId, answers, payload, completedAction, score: clientScore } = req.body;
    if (!activityId || !worldId) {
      return res.status(400).json({ error: 'Identificador de atividade e Mundo são obrigatórios.' });
    }

    const userId = req.user!.id;
    const world = WORLDS_DATA.find((w) => w.id === worldId);
    if (!world) return res.status(404).json({ error: 'Mundo inexistente' });

    const isSimulator = world.simulators.some((s) => s.id === activityId);
    const isChallenge = world.challenge.id === activityId;
    if (!isSimulator && !isChallenge) {
      return res.status(400).json({ error: 'Atividade não reconhecida no catálogo canónico.' });
    }

    const stats = await computeWorldStats(userId, worldId, req.user?.role);
    if (!stats.isUnlocked) {
      return res.status(403).json({ error: 'Mundo bloqueado.' });
    }

    // Authoritative Server-Side Evaluation
    const evaluation = evaluateActivity(activityId, worldId, {
      answers,
      payload,
      completedAction,
      score: clientScore,
    });

    // If evaluation is not validated, do NOT update score, progress, or XP
    if (!evaluation.isValidated) {
      const prog = await getActivityProgress(userId, activityId);
      const previousBest = prog ? prog.bestScore : 0;
      return res.status(200).json({
        activityId,
        previousBest,
        newBest: previousBest,
        xpGain: 0,
        totalXp: req.user!.xp,
        score: 0,
        isValidated: false,
        feedback: evaluation.feedback || 'Submissão incompleta ou não validada pelo motor pedagógico.',
      });
    }

    const evaluatedScore = evaluation.score;

    let prog = await getActivityProgress(userId, activityId);
    const isFirst = !prog || prog.attempts === 0;
    const previousBest = prog ? (Number(prog.bestScore) || 0) : 0;
    const firstScore = isFirst ? evaluatedScore : (prog.firstScore ?? previousBest);
    const newBest = Math.max(previousBest, evaluatedScore);
    const latestScore = evaluatedScore;
    const attempts = (prog ? prog.attempts : 0) + 1;
    const xpGain = newBest - previousBest;
    const previousAwardedXp = prog ? (Number(prog.awardedXp) || 0) : 0;
    const awardedXp = previousAwardedXp + Math.max(0, xpGain);

    if (!prog) {
      prog = {
        id: `${userId}_${activityId}`,
        userId,
        activityId,
        worldId,
        firstScore,
        bestScore: newBest,
        latestScore,
        attempts: 1,
        awardedXp,
        completed: true,
        firstCompletedAt: new Date().toISOString(),
        lastAttemptAt: new Date().toISOString(),
      };
    } else {
      prog.firstScore = firstScore;
      prog.bestScore = newBest;
      prog.latestScore = latestScore;
      prog.attempts = attempts;
      prog.awardedXp = awardedXp;
      prog.completed = true;
      prog.lastAttemptAt = new Date().toISOString();
    }

    await saveActivityProgress(prog);

    let totalXp = req.user!.xp;
    if (xpGain > 0) {
      const result = await atomicAwardXP(userId, xpGain, {
        sourceType: isChallenge ? 'challenge' : 'activity',
        sourceId: activityId,
        previousBest,
        newBest,
      });
      if (result) {
        totalXp = result.newTotalXP;
      }
    }

    await evaluateBadges(userId);

    return res.json({
      activityId,
      previousBest,
      newBest,
      xpGain,
      totalXp,
      score: evaluatedScore,
      isValidated: true,
      feedback: evaluation.feedback,
    });
  } catch (err) {
    console.error('Error in /activities/complete:', err);
    return res.status(500).json({ error: 'Erro ao registar atividade.' });
  }
});

// POST submit Real Mission (Student ONLY, normalized submission fields)
router.post('/missions/:worldId', requireStudent, async (req: AuthRequest, res) => {
  try {
    const worldId = parseInt(req.params.worldId, 10);
    const world = WORLDS_DATA.find((w) => w.id === worldId);
    if (!world) return res.status(404).json({ error: 'Mundo não encontrado' });

    const userId = req.user!.id;
    const stats = await computeWorldStats(userId, worldId, req.user?.role);
    if (!stats.isUnlocked) {
      return res.status(403).json({ error: 'Mundo bloqueado.' });
    }

    const text = (req.body.submission || req.body.submissionText || req.body.content || '').trim();
    if (!text || text.length < 20) {
      return res.status(400).json({ error: 'A submissão deve conter uma resposta detalhada (mínimo 20 caracteres).' });
    }

    const now = new Date().toISOString();
    const existingMissions = await getMissionSubmissions({ userId, worldId });
    if (existingMissions.length > 0) {
      const existing = existingMissions[0];
      existing.submission = text;
      existing.submissionText = text;
      existing.status = 'pending';
      existing.submittedAt = now;
      existing.updatedAt = now;
      await saveMissionSubmission(existing);
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
    }

    return res.json({
      success: true,
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
      claimedToday: !!claim,
      date: today,
    });
  } catch (err) {
    console.error('Error in /daily-tip:', err);
    return res.status(500).json({ error: 'Erro ao carregar dica do dia.' });
  }
});

// POST claim Daily Tip (Student ONLY, exactly once per day)
router.post('/daily-tip/claim', requireStudent, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const today = new Date().toISOString().split('T')[0];

    const existingClaim = await getDailyTipClaim(userId, today);
    if (existingClaim) {
      return res.status(400).json({ error: 'Já reclamaste a dica diária de hoje!' });
    }

    const tipReward = PROGRESSION_CONFIG.XP_REWARDS.DAILY_TIP;
    const resClaim = await claimDailyTipAtomic(userId, today);
    if (!resClaim.success) {
      return res.status(400).json({ error: 'Não foi possível reclamar a dica diária.' });
    }

    const resAward = await atomicAwardXP(userId, tipReward, {
      sourceType: 'daily_tip',
      sourceId: `daily_tip_${today}`,
      previousBest: 0,
      newBest: tipReward,
    });

    await evaluateBadges(userId);

    return res.json({
      success: true,
      xpGain: tipReward,
      totalXp: resAward?.newTotalXP || req.user!.xp + tipReward,
      message: `+${tipReward} XP ganhos com a Dica Diária!`,
    });
  } catch (err) {
    console.error('Error in /daily-tip/claim:', err);
    return res.status(500).json({ error: 'Erro ao reclamar dica diária.' });
  }
});

// GET Weekly Challenge
router.get('/weekly-challenge', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const progress = userId ? await getWeeklyChallengeProgress(userId, WEEKLY_CHALLENGE.id) : null;

    // Do NOT send isCorrect or explanation to client!
    const sanitized = {
      id: WEEKLY_CHALLENGE.id,
      title: WEEKLY_CHALLENGE.title,
      context: WEEKLY_CHALLENGE.context,
      messageSample: WEEKLY_CHALLENGE.messageSample,
      problem: WEEKLY_CHALLENGE.problem,
      task: WEEKLY_CHALLENGE.task,
      xpReward: PROGRESSION_CONFIG.XP_REWARDS.WEEKLY_CHALLENGE,
      options: WEEKLY_CHALLENGE.options.map((o, idx) => ({
        id: String(idx),
        text: o.text,
      })),
      completed: progress?.status === 'completed',
    };

    return res.json({ challenge: sanitized });
  } catch (err) {
    console.error('Error in /weekly-challenge:', err);
    return res.status(500).json({ error: 'Erro ao carregar desafio da semana.' });
  }
});

// POST submit Weekly Challenge (Student ONLY)
router.post(['/weekly-challenge', '/weekly-challenge/submit'], requireStudent, async (req: AuthRequest, res) => {
  try {
    let { optionIndex, isPhishing } = req.body;
    if (typeof optionIndex !== 'number' && typeof isPhishing === 'boolean') {
      optionIndex = isPhishing ? 1 : 0;
    }
    if (typeof optionIndex !== 'number' || !WEEKLY_CHALLENGE.options[optionIndex]) {
      return res.status(400).json({ error: 'Opção inválida.' });
    }

    const userId = req.user!.id;
    const already = await getWeeklyChallengeProgress(userId, WEEKLY_CHALLENGE.id);

    const selected = WEEKLY_CHALLENGE.options[optionIndex];
    if (!selected.isCorrect) {
      return res.json({
        isCorrect: false,
        feedback: selected.explanation,
      });
    }

    let xpGain = 0;
    let totalXp = req.user!.xp;

    if (!already) {
      await saveWeeklyChallengeProgress({
        id: `wc-${crypto.randomUUID()}`,
        userId,
        challengeId: WEEKLY_CHALLENGE.id,
        status: 'completed',
        score: 100,
        completedAt: new Date().toISOString(),
      });

      xpGain = PROGRESSION_CONFIG.XP_REWARDS.WEEKLY_CHALLENGE;
      const resAward = await atomicAwardXP(userId, xpGain, {
        sourceType: 'weekly_challenge',
        sourceId: WEEKLY_CHALLENGE.id,
        previousBest: 0,
        newBest: 100,
      });
      if (resAward) {
        totalXp = resAward.newTotalXP;
      }
    }

    return res.json({
      isCorrect: true,
      feedback: selected.explanation,
      xpGain,
      totalXp,
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
router.post('/grande-missao/stage', requireStudent, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { completedZones, unlockedCodes } = req.body;
    if (!Array.isArray(completedZones)) {
      return res.status(400).json({ error: 'completedZones deve ser um array.' });
    }

    const progress = await getGrandeMissaoProgress(userId);
    const mergedStages = Array.from(new Set([...(progress.completedStages || []), ...completedZones]));
    const mergedAnswers = { ...(progress.stageAnswers || {}), ...(unlockedCodes || {}) };

    progress.completedStages = mergedStages;
    progress.stageAnswers = mergedAnswers;
    if (progress.status !== 'completed') {
      progress.status = mergedStages.length > 0 ? 'in_progress' : 'not_started';
    }
    progress.currentStage = Math.min(6, Math.max(...mergedStages, 1));
    progress.updatedAt = new Date().toISOString();

    await saveGrandeMissaoProgress(progress);
    return res.json({ success: true, progress });
  } catch (err) {
    console.error('Error in /grande-missao/stage:', err);
    return res.status(500).json({ error: 'Erro ao guardar progresso da Grande Missão no Firestore.' });
  }
});

// POST complete Grande Missão (Student ONLY, enforces all 5 worlds passed at 75%)
router.post('/grande-missao/complete', requireStudent, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const progress = await getGrandeMissaoProgress(userId);

    if (progress.status === 'completed') {
      return res.status(400).json({ error: 'Já concluíste a Grande Missão e recebeste a recompensa.' });
    }

    const allStats = await Promise.all([1, 2, 3, 4, 5].map((w) => computeWorldStats(userId, w, req.user?.role)));
    const allCompleted = allStats.every((st) => st.isWorldCompleted);
    if (!allCompleted) {
      return res.status(403).json({
        error: `A Grande Missão apenas pode ser concluída após aprovação em todos os 5 Mundos curriculares (todas as atividades concluídas e média >= ${PROGRESSION_CONFIG.PASSING_THRESHOLD}%).`,
      });
    }

    progress.status = 'completed';
    progress.currentStage = 5;
    progress.completedStages = [1, 2, 3, 4, 5];
    progress.completedAt = new Date().toISOString();
    await saveGrandeMissaoProgress(progress);

    const xpGain = PROGRESSION_CONFIG.XP_REWARDS.GRANDE_MISSAO;
    const resAward = await atomicAwardXP(userId, xpGain, {
      sourceType: 'grande_missao',
      sourceId: GRANDE_MISSAO.id,
      previousBest: 0,
      newBest: 150,
    });

    await evaluateBadges(userId);

    return res.json({
      success: true,
      message: `Parabéns! Concluíste com distinção a Grande Missão A ESCOLA DO FUTURO! +${xpGain} XP atribuídos!`,
      totalXp: resAward?.newTotalXP || req.user!.xp + xpGain,
    });
  } catch (err) {
    console.error('Error in /grande-missao/complete:', err);
    return res.status(500).json({ error: 'Erro ao concluir Grande Missão.' });
  }
});

// GET Class Ranking
router.get('/class-ranking', async (req: AuthRequest, res) => {
  try {
    const { classId } = req.query;
    const users = await getAllUsers();
    let students = users.filter((u) => u.role === 'student' && !u.blocked);

    if (classId && typeof classId === 'string' && classId !== 'all') {
      students = students.filter((s) => s.classId === classId);
    }

    students.sort((a, b) => b.xp - a.xp);

    const ranking = students.slice(0, 50).map((s, index) => {
      const isCurrentUser = req.user?.id === s.id;
      const levelInfo = calculateLevel(s.xp);
      return {
        position: index + 1,
        rank: index + 1,
        id: s.id,
        name: isCurrentUser ? s.name : s.nickname,
        nickname: s.nickname,
        avatar: s.avatar,
        xp: s.xp,
        level: levelInfo.level,
        levelName: levelInfo.name,
        classId: s.classId,
        isCurrentUser,
      };
    });

    return res.json({ ranking });
  } catch (err) {
    console.error('Error in /class-ranking:', err);
    return res.status(500).json({ error: 'Erro ao carregar o ranking da turma.' });
  }
});

// GET Badges Catalog & User Badges
router.get('/badges', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const userBadges = userId ? await getUserBadges(userId) : [];

    const badges = BADGES_CATALOG.map((b) => {
      const earned = userBadges.find((ub) => ub.badgeId === b.id);
      return {
        ...b,
        unlocked: !!earned,
        unlockedAt: earned?.awardedAt || null,
      };
    });

    return res.json({ badges });
  } catch (err) {
    console.error('Error in /badges:', err);
    return res.status(500).json({ error: 'Erro ao carregar insígnias.' });
  }
});

export default router;
