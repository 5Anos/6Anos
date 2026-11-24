import { Router } from 'express';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { AuthRequest } from '../auth';

const router = Router();

interface ChatTurn {
  role: 'student' | 'tutor';
  text: string;
}

interface SimulatorHintRequest {
  simulatorId: string;
  simulatorTitle?: string;
  worldId?: number;
  topic?: string;
  score?: number;
  attemptSummary?: string;
  userMessage?: string;
  history?: ChatTurn[];
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const TUTOR_SYSTEM_INSTRUCTION = `És o Robo-Guia, um tutor digital simpático, paciente e encorajador da plataforma educativa "MISSÃO TIC 6.º ANO" em Portugal.
Ajudas crianças de 10 a 12 anos (2.º Ciclo em Portugal) quando erram ou têm dúvidas num simulador de TIC.

REGRAS OBRIGATÓRIAS:
1. Escreve SEMPRE em Português Europeu (PT-PT) natural e trata o aluno por "tu". Nunca uses português do Brasil.
2. Usa frases curtas, vocabulário simples e leitura rápida (máximo 3 a 4 frases curtas no total).
3. REGRA DE OURO: NUNCA entregues a resposta certa, nunca digas que opção clicar, nunca escrevas a solução exata (ex.: nunca escrevas o código final, a palavra-passe pronta nem a classificação certa de cada item).
4. Incentiva sempre o aluno (elogia o esforço e lembra que errar faz parte de aprender).
5. Dá UMA pista concreta e personalizada com base no tema do simulador e no erro descrito, e termina com uma pequena pergunta orientadora que ajude o aluno a descobrir a solução sozinho.`;

router.post('/simulator-hint', async (req: AuthRequest, res) => {
  try {
    const body = (req.body || {}) as SimulatorHintRequest;
    const simulatorId = typeof body.simulatorId === 'string' ? body.simulatorId.trim().slice(0, 80) : '';
    const simulatorTitle =
      typeof body.simulatorTitle === 'string' && body.simulatorTitle.trim()
        ? body.simulatorTitle.trim().slice(0, 120)
        : 'Atividade de TIC';
    const worldId = Number.isFinite(Number(body.worldId)) ? Number(body.worldId) : 1;
    const topic = typeof body.topic === 'string' ? body.topic.trim().slice(0, 160) : '';
    const score = Number.isFinite(Number(body.score)) ? Math.max(0, Math.min(100, Number(body.score))) : undefined;
    const attemptSummary =
      typeof body.attemptSummary === 'string' ? body.attemptSummary.trim().slice(0, 500) : '';
    const userMessage =
      typeof body.userMessage === 'string' ? body.userMessage.trim().slice(0, 400) : '';
    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];

    if (!simulatorId && !userMessage) {
      return res.status(400).json({ error: 'Contexto do simulador ou mensagem em falta.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'O serviço de dicas inteligentes do Robo-Guia não está configurado neste servidor.',
      });
    }

    const studentName = req.user?.nickname || req.user?.name?.split(' ')[0] || 'Explorador';

    const contextLines: string[] = [
      `Aluno: ${studentName} (10-12 anos, 2.º Ciclo, Portugal).`,
      `Mundo ${worldId} — Simulador: ${simulatorTitle} (ID: ${simulatorId || 'geral'}).`,
    ];
    if (topic) contextLines.push(`Conceito pedagógico: ${topic}.`);
    if (typeof score === 'number') {
      contextLines.push(`Resultado obtido na tentativa: ${score}%.`);
    }
    if (attemptSummary) {
      contextLines.push(`O que aconteceu na tentativa do aluno: ${attemptSummary}.`);
    }

    const historyText =
      history.length > 0
        ? '\nConversa recente:\n' +
          history
            .map((h) => `${h.role === 'student' ? 'Aluno' : 'Robo-Guia'}: ${String(h.text || '').slice(0, 300)}`)
            .join('\n')
        : '';

    const prompt = userMessage
      ? `${contextLines.join('\n')}${historyText}\n\nPergunta do aluno no chat: "${userMessage}"\n\nResponde como Robo-Guia com uma pista personalizada em PT-PT, encorajando o aluno e SEM entregar a resposta certa.`
      : `${contextLines.join('\n')}${historyText}\n\nO aluno acabou de errar neste simulador e ainda não acertou tudo. Envia uma mensagem curta de incentivo no chat com uma pista personalizada para o ajudar a descobrir o erro sozinho, SEM revelar a resposta certa.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const hintText = (response.text || '').trim();
    if (!hintText) {
      return res.status(502).json({
        error: 'O Robo-Guia não conseguiu gerar uma dica neste momento. Tenta novamente.',
      });
    }

    return res.json({
      hint: hintText,
      simulatorId,
      simulatorTitle,
    });
  } catch (err: any) {
    console.error('[AI Simulator Hint Error]', err);
    const status = typeof err?.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 500;
    return res.status(status).json({
      error:
        status === 429
          ? 'O Robo-Guia está com muitos pedidos neste momento. Espera uns segundos e tenta novamente.'
          : 'Não foi possível contactar o Robo-Guia agora. Tenta novamente dentro de momentos.',
    });
  }
});

export default router;
