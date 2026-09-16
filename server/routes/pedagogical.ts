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
import { AuthRequest, requireAuth } from '../auth';
import {
  WORLDS_DATA,
  FINAL_ASSESSMENTS,
  GRANDE_MISSAO,
  WEEKLY_CHALLENGE,
  DAILY_TIPS,
  calculateLevel,
  BADGES_CATALOG,
} from '../catalog';

const router = Router();

// Helper to compute world average strictly for a student user
export async function computeWorldStats(userId: string, worldId: number): Promise<{
  worldId: number;
  average: number;
  completedCount: number;
  totalComponents: number;
  isUnlocked: boolean;
  hasAssessmentPassed: boolean;
}> {
  const world = WORLDS_DATA.find((w) => w.id === worldId);
  if (!world) {
    return { worldId, average: 0, completedCount: 0, totalComponents: 0, isUnlocked: false, hasAssessmentPassed: false };
  }

  const [userProgress, missions, assessmentAttempts] = await Promise.all([
    getUserActivityProgress(userId),
    getMissionSubmissions({ userId, worldId, status: 'graded' }),
    getAssessmentAttempts(userId, worldId),
  ]);

  const scores: number[] = [];

  // Simulators
  for (const sim of world.simulators) {
    const prog = userProgress.find((p) => p.activityId === sim.id);
    if (prog && prog.completed) {
      scores.push(prog.bestScore);
    }
  }

  // Challenge
  const chalProg = userProgress.find((p) => p.activityId === world.challenge.id);
  if (chalProg && chalProg.completed) {
    scores.push(chalProg.bestScore);
  }

  // Real Mission
  if (missions.length > 0) {
    scores.push(missions[0].score);
  }

  // Final Assessment (best percentage)
  if (assessmentAttempts.length > 0) {
    const bestAssess = Math.max(...assessmentAttempts.map((a) => a.percentage));
    scores.push(bestAssess);
  }

  const average = scores.length > 0 ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : 0;
  const totalComponents = world.simulators.length + 3; // sims + challenge + mission + assessment
  const completedCount = scores.length;

  // Progression rule:
  // Mundo 1 is unlocked initially
  // Mundo N (N > 1) is unlocked ONLY IF previous world average > 65
  let isUnlocked = worldId === 1;
  if (worldId > 1) {
    const prevStats = await computeWorldStats(userId, worldId - 1);
    isUnlocked = prevStats.average > 65; // Strict inequality: 65.1 unlocks
  }

  return {
    worldId,
    average,
    completedCount,
    totalComponents,
    isUnlocked,
    hasAssessmentPassed: assessmentAttempts.some((a) => a.percentage >= 65),
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
    const stats = await computeWorldStats(userId, w);
    if (stats.average > 65 && stats.completedCount >= 3) {
      await awardBadge(userId, worldBadgeMap[w]);
    }
  }

  // Centurion: >= 1000 XP or 100% in an assessment
  const assessments = await getAssessmentAttempts(userId);
  const has100Assess = assessments.some((a) => a.percentage === 100);
  if (user.xp >= 1000 || has100Assess) {
    await awardBadge(userId, 'centuriao-digital');
  }

  // Master: Grande Missão completed + all 5 worlds average > 65
  const userTx = await getUserXPTransactions(userId);
  const hasGM = userTx.some((t) => t.sourceType === 'grande_missao');
  const allStats = await Promise.all([1, 2, 3, 4, 5].map((w) => computeWorldStats(userId, w)));
  const allUnlocked = allStats.every((st) => st.average > 65);
  if (hasGM && allUnlocked) {
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
        average: w.id === 1 ? 60 : 0,
        completedCount: w.id === 1 ? 1 : 0,
        totalComponents: w.simulators.length + 3,
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

    const worlds = await Promise.all(
      WORLDS_DATA.map(async (w) => {
        const stats = await computeWorldStats(userId, w.id);
        const mission = allMissions.find((m) => m.worldId === w.id);
        const chalProg = userProgress.find((p) => p.activityId === w.challenge.id);
        const worldAssessments = allAssessments.filter((a) => a.worldId === w.id);

        return {
          ...w,
          isUnlocked: stats.isUnlocked,
          average: stats.average,
          completedCount: stats.completedCount,
          totalComponents: stats.totalComponents,
          challengeProgress: chalProg ? { completed: chalProg.completed, score: chalProg.bestScore } : null,
          missionProgress: mission
            ? { status: mission.status, score: mission.score, feedback: mission.feedback }
            : null,
          bestAssessmentPercentage:
            worldAssessments.length > 0 ? Math.max(...worldAssessments.map((a) => a.percentage)) : null,
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
    const [stats, missions, userProgress, assessmentAttempts] = await Promise.all([
      computeWorldStats(userId, worldId),
      getMissionSubmissions({ userId, worldId }),
      getUserActivityProgress(userId),
      getAssessmentAttempts(userId, worldId),
    ]);

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

    const stats = await computeWorldStats(req.user!.id, worldId);
    if (!stats.isUnlocked) {
      return res.status(403).json({ error: 'Este Mundo ainda está bloqueado. Completa o Mundo anterior com média > 65%.' });
    }

    // Strip correctIndex and explanation from payload!
    const sanitizedQuestions = assess.questions.map((q, idx) => ({
      id: q.id,
      number: idx + 1,
      text: q.text,
      options: q.options,
    }));

    return res.json({
      id: assess.id,
      worldId: assess.worldId,
      title: assess.title,
      questionCount: sanitizedQuestions.length,
      questions: sanitizedQuestions,
    });
  } catch (err) {
    console.error('Error in /assessments/:worldId:', err);
    return res.status(500).json({ error: 'Erro ao carregar avaliação.' });
  }
});

// POST submit assessment
router.post('/assessments/:worldId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const worldId = parseInt(req.params.worldId, 10);
    const assess = FINAL_ASSESSMENTS[worldId];
    if (!assess) return res.status(404).json({ error: 'Avaliação não encontrada' });

    const userId = req.user!.id;
    const stats = await computeWorldStats(userId, worldId);
    if (!stats.isUnlocked) {
      return res.status(403).json({ error: 'Mundo bloqueado. Não é permitido submeter avaliações de Mundos bloqueados.' });
    }

    const { answers } = req.body;
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Respostas inválidas.' });
    }

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

    const percentage = Math.round((correctCount / assess.questions.length) * 100);

    const prevAttempts = await getAssessmentAttempts(userId, worldId);
    const previousBest = prevAttempts.length > 0 ? Math.max(...prevAttempts.map((a) => a.percentage)) : 0;
    const newBest = Math.max(previousBest, percentage);
    const xpGain = newBest - previousBest;

    // Save attempt in Cloud Firestore
    const attempt: AssessmentAttempt = {
      id: `attempt-${crypto.randomUUID()}`,
      userId,
      assessmentId: assess.id,
      worldId,
      score: correctCount,
      percentage,
      answers,
      createdAt: new Date().toISOString(),
    };
    await saveAssessmentAttempt(attempt);

    let totalXp = req.user!.xp;
    if (xpGain > 0) {
      const result = await atomicAwardXP(userId, xpGain, {
        sourceType: 'assessment',
        sourceId: assess.id,
        previousBest,
        newBest,
      });
      if (result) {
        totalXp = result.newTotalXP;
      }
    }

    await evaluateBadges(userId);

    return res.json({
      percentage,
      correctCount,
      totalQuestions: assess.questions.length,
      passed: percentage > 65,
      previousBest,
      newBest,
      xpGain,
      totalXp,
      resultsFeedback,
    });
  } catch (err) {
    console.error('Error in /assessments/:worldId submit:', err);
    return res.status(500).json({ error: 'Erro ao guardar submissão da avaliação.' });
  }
});

// POST submit activity / simulator completion
router.post('/activities/complete', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { activityId, worldId, score } = req.body;
    if (!activityId || !worldId || typeof score !== 'number') {
      return res.status(400).json({ error: 'Dados da atividade inválidos.' });
    }

    const userId = req.user!.id;
    const world = WORLDS_DATA.find((w) => w.id === worldId);
    if (!world) return res.status(404).json({ error: 'Mundo inexistente' });

    const isSimulator = world.simulators.some((s) => s.id === activityId);
    const isChallenge = world.challenge.id === activityId;
    if (!isSimulator && !isChallenge) {
      return res.status(400).json({ error: 'Atividade não reconhecida no catálogo canónico.' });
    }

    const stats = await computeWorldStats(userId, worldId);
    if (!stats.isUnlocked) {
      return res.status(403).json({ error: 'Mundo bloqueado.' });
    }

    const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));
    let prog = await getActivityProgress(userId, activityId);
    const previousBest = prog ? prog.bestScore : 0;
    const newBest = Math.max(previousBest, normalizedScore);
    const xpGain = newBest - previousBest;

    if (!prog) {
      prog = {
        id: `prog-${crypto.randomUUID()}`,
        userId,
        activityId,
        worldId,
        bestScore: newBest,
        attempts: 1,
        completed: true,
        firstCompletedAt: new Date().toISOString(),
        lastAttemptAt: new Date().toISOString(),
      };
    } else {
      prog.attempts += 1;
      prog.completed = true;
      prog.bestScore = newBest;
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
      score: normalizedScore,
    });
  } catch (err) {
    console.error('Error in /activities/complete:', err);
    return res.status(500).json({ error: 'Erro ao registar atividade.' });
  }
});

// POST submit Real Mission
router.post('/missions/:worldId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const worldId = parseInt(req.params.worldId, 10);
    const world = WORLDS_DATA.find((w) => w.id === worldId);
    if (!world) return res.status(404).json({ error: 'Mundo não encontrado' });

    const userId = req.user!.id;
    const stats = await computeWorldStats(userId, worldId);
    if (!stats.isUnlocked) {
      return res.status(403).json({ error: 'Mundo bloqueado.' });
    }

    const { submission } = req.body;
    if (!submission || submission.trim().length < 20) {
      return res.status(400).json({ error: 'A submissão deve conter uma resposta detalhada (mínimo 20 caracteres).' });
    }

    const existingMissions = await getMissionSubmissions({ userId, worldId });
    if (existingMissions.length > 0) {
      const existing = existingMissions[0];
      existing.submission = submission.trim();
      existing.status = 'pending';
      existing.submittedAt = new Date().toISOString();
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
        submission: submission.trim(),
        score: 0,
        status: 'pending',
        submittedAt: new Date().toISOString(),
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
      tip,
      alreadyClaimed: !!claim,
      xpReward: 10,
    });
  } catch (err) {
    console.error('Error in /daily-tip:', err);
    return res.status(500).json({ error: 'Erro ao carregar dica do dia.' });
  }
});

router.post('/daily-tip/claim', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const today = new Date().toISOString().split('T')[0];

    const result = await claimDailyTipAtomic(userId, today);
    if (!result.success) {
      return res.status(400).json({ error: 'Já recolheste a recompensa da Dica Rápida de hoje! Volta amanhã.' });
    }

    const updatedUser = await getUserById(userId);

    return res.json({
      success: true,
      message: 'Parabéns! Ganhaste +10 XP pela Dica Rápida!',
      totalXp: updatedUser?.xp || req.user!.xp + 10,
    });
  } catch (err) {
    console.error('Error in /daily-tip/claim:', err);
    return res.status(500).json({ error: 'Erro ao reclamar dica diária.' });
  }
});

// GET Weekly Challenge status
router.get('/weekly-challenge', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const challengeProg = userId ? await getWeeklyChallengeProgress(userId, WEEKLY_CHALLENGE.id) : null;

    const sanitized = {
      ...WEEKLY_CHALLENGE,
      options: WEEKLY_CHALLENGE.options.map((o, idx) => ({
        id: idx,
        text: o.text,
      })),
      completed: !!challengeProg,
    };

    return res.json({ challenge: sanitized });
  } catch (err) {
    console.error('Error in /weekly-challenge:', err);
    return res.status(500).json({ error: 'Erro ao carregar desafio da semana.' });
  }
});

// POST submit Weekly Challenge
router.post('/weekly-challenge', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { optionIndex } = req.body;
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

      xpGain = WEEKLY_CHALLENGE.xpReward;
      const resAward = await atomicAwardXP(userId, xpGain, {
        sourceType: 'challenge',
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

    return res.json({
      grandeMissao: GRANDE_MISSAO,
      progress,
      completed: progress.status === 'completed',
    });
  } catch (err) {
    console.error('Error in /grande-missao:', err);
    return res.status(500).json({ error: 'Erro ao carregar Grande Missão.' });
  }
});

// POST complete Grande Missão
router.post('/grande-missao/complete', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const progress = await getGrandeMissaoProgress(userId);

    if (progress.status === 'completed') {
      return res.status(400).json({ error: 'Já concluíste a Grande Missão e recebeste a recompensa.' });
    }

    progress.status = 'completed';
    progress.currentStage = 5;
    progress.completedStages = [1, 2, 3, 4, 5];
    progress.completedAt = new Date().toISOString();
    await saveGrandeMissaoProgress(progress);

    const xpGain = GRANDE_MISSAO.totalXp;
    const resAward = await atomicAwardXP(userId, xpGain, {
      sourceType: 'grande_missao',
      sourceId: GRANDE_MISSAO.id,
      previousBest: 0,
      newBest: 150,
    });

    await evaluateBadges(userId);

    return res.json({
      success: true,
      message: 'Parabéns! Concluíste com distinção a Grande Missão A ESCOLA DO FUTURO! +150 XP atribuídos!',
      totalXp: resAward?.newTotalXP || req.user!.xp + xpGain,
    });
  } catch (err) {
    console.error('Error in /grande-missao/complete:', err);
    return res.status(500).json({ error: 'Erro ao concluir Grande Missão.' });
  }
});

// GET Class-Private Ranking
router.get('/class-ranking', async (req: AuthRequest, res) => {
  try {
    const userClassId = req.user?.classId || 'class-6a';
    const allUsers = await getAllUsers();

    const classStudents = allUsers
      .filter((u) => u.role === 'student' && u.classId === userClassId && !u.blocked)
      .map((s) => {
        const levelInfo = calculateLevel(s.xp);
        return {
          id: s.id,
          nickname: s.nickname,
          avatar: s.avatar,
          xp: s.xp,
          level: levelInfo.level,
          levelName: levelInfo.name,
          isCurrentUser: req.user ? s.id === req.user.id : false,
        };
      })
      .sort((a, b) => b.xp - a.xp)
      .map((s, index) => ({
        position: index + 1,
        ...s,
      }));

    const classroom = userClassId ? await getClassById(userClassId) : null;

    return res.json({
      className: classroom ? classroom.name : 'Turma 6.º A',
      ranking: classStudents,
    });
  } catch (err) {
    console.error('Error in /class-ranking:', err);
    return res.status(500).json({ error: 'Erro ao carregar ranking da turma.' });
  }
});

// GET Badges list (all badges + user ownership)
router.get('/badges', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const userBadges = userId ? await getUserBadges(userId) : [];

    const badges = BADGES_CATALOG.map((badge) => {
      const owned = userBadges.find((b) => b.badgeId === badge.id);
      return {
        ...badge,
        unlocked: !!owned,
        awardedAt: owned ? owned.awardedAt : null,
      };
    });

    return res.json({ badges });
  } catch (err) {
    console.error('Error in /badges:', err);
    return res.status(500).json({ error: 'Erro ao carregar emblemas.' });
  }
});

export default router;
