/**
 * Missão TIC — 6.º Ano
 * Authoritative Server-Side Activity Scoring Engine
 *
 * Prevents client-controlled score tampering. Validates raw student
 * submissions against official pedagogical answer keys and logic.
 */

export interface EvaluationInput {
  answers?: any;
  payload?: any;
  completedAction?: string;
  score?: any;
}

export interface EvaluationResult {
  score: number;
  isValidated: boolean;
  feedback?: string;
}

/**
 * Main entry point for evaluating any activity score on the server
 */
export function evaluateActivity(
  activityId: string,
  worldId: number,
  data: EvaluationInput
): EvaluationResult {
  const { answers, payload } = data;
  let input = payload !== undefined ? payload : (answers !== undefined ? answers : {});
  // Unwrap nested answers object if present
  if (input && typeof input === 'object' && input.answers !== undefined && Object.keys(input).length === 1) {
    input = input.answers;
  }

  switch (activityId) {
    // -------------------------------------------------------------
    // WORLD 1: SEGURANÇA, PRIVACIDADE E BEM-ESTAR
    // -------------------------------------------------------------
    case 'sim-password': {
      // Deterministic password strength evaluation
      const pwd = typeof input === 'string' ? input : input?.password || input?.pwdInput || '';
      if (!pwd || typeof pwd !== 'string' || pwd.trim().length === 0) {
        return { score: 0, isValidated: false, feedback: 'Nenhuma palavra-passe fornecida para teste.' };
      }
      let score = 0;
      const len = pwd.length;
      if (len >= 8) score += 20;
      if (len >= 12) score += 20;
      if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 20;
      if (/[0-9]/.test(pwd)) score += 20;
      if (/[^A-Za-z0-9]/.test(pwd)) score += 20;

      const common = ['123', 'password', 'escola', 'alex', 'teste', 'qwerty', '12345', 'admin', 'pass'];
      if (common.some((c) => pwd.toLowerCase().includes(c))) {
        score = Math.max(10, score - 35);
      }
      return { score: Math.min(100, Math.max(0, score)), isValidated: true };
    }

    case 'sim-phishing': {
      // 4 scenarios: 0 (phishing: true), 1 (phishing: false), 2 (phishing: true), 3 (phishing: false)
      const expected: Record<number, boolean> = {
        0: true,
        1: false,
        2: true,
        3: false,
      };
      const ans = input?.answers || input;
      if (typeof ans === 'object' && ans !== null && Object.keys(ans).length > 0) {
        let correctCount = 0;
        let totalChecked = 0;
        for (const [idxStr, val] of Object.entries(ans)) {
          const idx = parseInt(idxStr, 10);
          if (idx in expected) {
            totalChecked++;
            if (Boolean(val) === expected[idx]) {
              correctCount++;
            }
          }
        }
        if (totalChecked > 0) {
          const score = Math.round((correctCount / Object.keys(expected).length) * 100);
          return { score, isValidated: true };
        }
      }
      break;
    }

    case 'sim-privacy': {
      // items: foto-rosto (privado), horario (privado), morada (privado), desenho (publico), resumo (publico)
      const privacyKeys: Record<string, string> = {
        'item-foto': 'privado',
        'item-horario': 'privado',
        'item-morada': 'privado',
        'item-desenho': 'publico',
        'item-resumo': 'publico',
      };
      const ans = input?.answers || input;
      if (typeof ans === 'object' && ans !== null && Object.keys(ans).length > 0) {
        let correctCount = 0;
        let matched = 0;
        for (const [key, expected] of Object.entries(privacyKeys)) {
          if (key in ans) {
            matched++;
            if (ans[key] === expected) correctCount++;
          }
        }
        if (matched > 0) {
          const score = Math.round((correctCount / Object.keys(privacyKeys).length) * 100);
          return { score, isValidated: true };
        }
      }
      break;
    }

    case 'sim-digital-footprint': {
      // items: comentario-ofensivo (risco), elogio-colega (positivo), partilha-localizacao (risco), projeto-scratch (positivo)
      const footprintKeys: Record<string, string> = {
        'fp-comentario': 'risco',
        'fp-elogio': 'positivo',
        'fp-gps': 'risco',
        'fp-scratch': 'positivo',
      };
      const ans = input?.answers || input;
      if (typeof ans === 'object' && ans !== null && Object.keys(ans).length > 0) {
        let correctCount = 0;
        let matched = 0;
        for (const [key, expected] of Object.entries(footprintKeys)) {
          if (key in ans) {
            matched++;
            if (ans[key] === expected) correctCount++;
          }
        }
        if (matched > 0) {
          const score = Math.round((correctCount / Object.keys(footprintKeys).length) * 100);
          return { score, isValidated: true };
        }
      }
      break;
    }

    case 'sim-digital-wellbeing': {
      // items: ecra-noite (risco), pausas-20min (saudavel), ignorar-amigos (risco), desporto-ar-livre (saudavel)
      const wellbeingKeys: Record<string, string> = {
        'wb-noite': 'risco',
        'wb-pausas': 'saudavel',
        'wb-ignorar': 'risco',
        'wb-desporto': 'saudavel',
      };
      const ans = input?.answers || input;
      if (typeof ans === 'object' && ans !== null && Object.keys(ans).length > 0) {
        let correctCount = 0;
        let matched = 0;
        for (const [key, expected] of Object.entries(wellbeingKeys)) {
          if (key in ans) {
            matched++;
            if (ans[key] === expected) correctCount++;
          }
        }
        if (matched > 0) {
          const score = Math.round((correctCount / Object.keys(wellbeingKeys).length) * 100);
          return { score, isValidated: true };
        }
      }
      break;
    }

    // -------------------------------------------------------------
    // WORLD 2: PESQUISA, DETEÇÃO & PENSAMENTO CRÍTICO
    // -------------------------------------------------------------
    case 'sim-keywords': {
      // queryId in ['q1': 30, 'q2': 50, 'q3': 70, 'q4': 100]
      const queryScores: Record<string, number> = {
        q1: 30,
        q2: 50,
        q3: 70,
        q4: 100,
      };
      const qId = typeof input === 'string' ? input : input?.queryId || input?.selectedQuery || input?.id;
      if (qId && qId in queryScores) {
        return { score: queryScores[qId], isValidated: true };
      }
      break;
    }

    case 'sim-author':
    case 'sim-author-check': {
      // author scenarios
      const authorKeys: Record<string, string> = {
        'scen-1': 'falso',
        'scen-2': 'confiavel',
        'scen-3': 'falso',
      };
      const ans = input?.answers || input;
      if (typeof ans === 'object' && ans !== null && Object.keys(ans).length > 0) {
        let correct = 0;
        let matched = 0;
        for (const [k, expected] of Object.entries(authorKeys)) {
          if (k in ans) {
            matched++;
            if (ans[k] === expected) correct++;
          }
        }
        if (matched > 0) {
          const score = Math.round((correct / Object.keys(authorKeys).length) * 100);
          return { score, isValidated: true };
        }
      }
      break;
    }

    case 'sim-date':
    case 'sim-date-verifier': {
      // date scenarios
      const dateKeys: Record<string, string> = {
        'date-1': 'desatualizado',
        'date-2': 'atual',
      };
      const ans = input?.answers || input;
      if (typeof ans === 'object' && ans !== null && Object.keys(ans).length > 0) {
        let correct = 0;
        let matched = 0;
        for (const [k, expected] of Object.entries(dateKeys)) {
          if (k in ans) {
            matched++;
            if (ans[k] === expected) correct++;
          }
        }
        if (matched > 0) {
          const score = Math.round((correct / Object.keys(dateKeys).length) * 100);
          return { score, isValidated: true };
        }
      }
      break;
    }

    case 'sim-compare':
    case 'sim-source-compare': {
      // compare questions: q1: 'opt-2' is correct, q2: 'opt-3' is correct
      const compareKeys: Record<string, string> = {
        'comp-1': 'opt-2',
        'comp-2': 'opt-3',
      };
      const ans = input?.answers || input;
      if (typeof ans === 'object' && ans !== null && Object.keys(ans).length > 0) {
        let correct = 0;
        let matched = 0;
        for (const [k, expected] of Object.entries(compareKeys)) {
          if (k in ans) {
            matched++;
            if (ans[k] === expected) correct++;
          }
        }
        if (matched > 0) {
          const score = Math.round((correct / Object.keys(compareKeys).length) * 100);
          return { score, isValidated: true };
        }
      }
      break;
    }

    case 'sim-news-detective': {
      const decision = input?.decision || input?.newsDecision;
      const audit = input?.audit || input?.newsDetectiveAudit || {};
      const checksCount = Object.values(audit).filter(Boolean).length;
      if (decision === 'verificar') {
        const score = Math.min(100, checksCount * 15 + 40);
        return { score, isValidated: true };
      } else if (decision === 'partilhar') {
        return { score: 30, isValidated: true };
      }
      break;
    }

    // -------------------------------------------------------------
    // WORLD 3: COMUNICAÇÃO, CIDADANIA & DIREITOS DE AUTOR
    // -------------------------------------------------------------
    case 'sim-avatar-challenge': {
      // Checks that avatar is created without revealing real face/name
      const privacyChecked = Boolean(input?.avatarPrivacyChecked || input?.privacyChecked);
      const handle = input?.avatarHandle || input?.nickname || input?.customNickname || '';
      if (privacyChecked && typeof handle === 'string' && handle.trim().length >= 2) {
        return { score: 100, isValidated: true };
      }
      if (privacyChecked) {
        return { score: 70, isValidated: true, feedback: 'Avatar configurado com sucesso.' };
      }
      return { score: 0, isValidated: false, feedback: 'Necessário confirmar privacidade do avatar.' };
    }

    case 'sim-digital-comm':
    case 'sim-comunicacao-digital': {
      const toneScores: Record<string, number> = {
        formal: 100,
        adequado: 90,
        informal: 60,
        agressivo: 20,
      };
      const tone = input?.tone || input?.selectedMessageTone || input?.id || input?.toneId;
      if (tone && tone in toneScores) {
        return { score: toneScores[tone], isValidated: true };
      }
      break;
    }

    case 'sim-netiquette':
    case 'sim-netiqueta': {
      const netiquetteKeys: Record<string, string> = {
        'net-1': 'adequado',
        'net-2': 'inadequado',
        'net-3': 'inadequado',
        'net-4': 'adequado',
      };
      const ans = input?.answers || input;
      if (typeof ans === 'object' && ans !== null && Object.keys(ans).length > 0) {
        let correct = 0;
        let matched = 0;
        for (const [k, expected] of Object.entries(netiquetteKeys)) {
          if (k in ans) {
            matched++;
            if (ans[k] === expected) correct++;
          }
        }
        if (matched > 0) {
          const score = Math.round((correct / Object.keys(netiquetteKeys).length) * 100);
          return { score, isValidated: true };
        }
      }
      break;
    }

    case 'sim-collab':
    case 'sim-colaboracao': {
      const collabKeys: Record<string, string> = {
        'col-1': 'opt-c1',
        'col-2': 'opt-c2',
      };
      const ans = input?.answers || input;
      if (typeof ans === 'object' && ans !== null && Object.keys(ans).length > 0) {
        let correct = 0;
        let matched = 0;
        for (const [k, expected] of Object.entries(collabKeys)) {
          if (k in ans) {
            matched++;
            if (ans[k] === expected) correct++;
          }
        }
        if (matched > 0) {
          const score = Math.round((correct / Object.keys(collabKeys).length) * 100);
          return { score, isValidated: true };
        }
      }
      break;
    }

    case 'sim-copyright':
    case 'sim-direitos-autor': {
      const copyrightKeys: Record<string, string> = {
        'cp-1': 'precisa-autorizacao',
        'cp-2': 'livre-atribuicao',
        'cp-3': 'precisa-autorizacao',
      };
      const ans = input?.answers || input;
      if (typeof ans === 'object' && ans !== null && Object.keys(ans).length > 0) {
        let correct = 0;
        let matched = 0;
        for (const [k, expected] of Object.entries(copyrightKeys)) {
          if (k in ans) {
            matched++;
            if (ans[k] === expected) correct++;
          }
        }
        if (matched > 0) {
          const score = Math.round((correct / Object.keys(copyrightKeys).length) * 100);
          return { score, isValidated: true };
        }
      }
      break;
    }

    case 'sim-plagiarism':
    case 'sim-plagio-citacao': {
      const opt = input?.optionId || input?.selectedOption || (typeof input === 'string' ? input : null);
      if (opt === 'correct' || opt === 'citacao-correta') {
        return { score: 100, isValidated: true };
      } else if (opt && typeof opt === 'string') {
        return { score: 30, isValidated: true };
      }
      break;
    }

    case 'sim-cc':
    case 'sim-creative-commons': {
      const matched = input?.ccMatched || input?.answers || input;
      if (typeof matched === 'object' && matched !== null && Object.keys(matched).length > 0) {
        let count = 0;
        let checked = 0;
        if ('BY' in matched) { checked++; if (matched['BY'] === 'crédito') count++; }
        if ('NC' in matched) { checked++; if (matched['NC'] === 'lucro') count++; }
        if ('ND' in matched) { checked++; if (matched['ND'] === 'alterado') count++; }
        if ('SA' in matched) { checked++; if (matched['SA'] === 'mesma') count++; }
        if (checked > 0) {
          const score = Math.round((count / 4) * 100);
          return { score, isValidated: true };
        }
      }
      break;
    }

    // -------------------------------------------------------------
    // WORLD 4: PENSAMENTO COMPUTACIONAL & ALGORITMOS
    // -------------------------------------------------------------
    case 'sim-decomposicao': {
      const order = Array.isArray(input) ? input : input?.steps || input?.order || input?.decomposedOrder || [];
      if (Array.isArray(order) && order.length > 0) {
        const isCorrect =
          order.length === 4 &&
          order[0] === 'step-1' &&
          order[1] === 'step-2' &&
          order[2] === 'step-3' &&
          order[3] === 'step-4';
        const score = isCorrect ? 100 : Math.min(75, order.length * 15);
        return { score, isValidated: true };
      }
      break;
    }

    case 'sim-block-coding': {
      const program: string[] = Array.isArray(input) ? input : input?.commands || input?.robotProgram || input?.program || [];
      if (Array.isArray(program) && program.length > 0) {
        let curX = 0;
        let curY = 0;
        for (const cmd of program) {
          if ((cmd === 'DIR' || cmd === 'forward') && curX < 3) curX++;
          if ((cmd === 'BAIXO' || cmd === 'down') && curY < 3) curY++;
        }
        const reached = curX === 3 && curY === 3;
        const score = reached ? 100 : Math.round(((curX + curY) / 6) * 80);
        return { score, isValidated: true };
      }
      break;
    }

    case 'sim-algoritmos': {
      const c1 = input?.condition1 || input?.condition1Action || input?.c1;
      const c2 = input?.condition2 || input?.condition2Action || input?.c2;
      if (c1 || c2) {
        let correct = 0;
        if (c1 === 'carregar') correct++;
        if (c2 === 'desviar') correct++;
        const score = Math.round((correct / 2) * 100);
        return { score, isValidated: true };
      }
      break;
    }

    case 'sim-ciclos': {
      const loops = typeof input === 'number' ? input : parseInt(input?.loopCount || input?.count, 10);
      if (!isNaN(loops)) {
        const score = loops === 4 ? 100 : 40;
        return { score, isValidated: true };
      }
      break;
    }

    case 'sim-dados': {
      const day = input?.mostReadDay || input?.day;
      const avg = input?.avgScoreChoice || input?.avg;
      if (day || avg) {
        let correct = 0;
        if (day === 'quinta') correct++;
        if (avg === '24') correct++;
        const score = Math.round((correct / 2) * 100);
        return { score, isValidated: true };
      }
      break;
    }

    case 'sim-debugging': {
      const bug = input?.bugId || input?.debugIdentifiedBug || input?.bug;
      const fix = input?.fixId || input?.debugSelectedFix || input?.fix;
      if (bug || fix) {
        let correct = 0;
        if (bug === 'st-3') correct++;
        if (fix === 'fx-1') correct++;
        const score = Math.round((correct / 2) * 100);
        return { score, isValidated: true };
      }
      break;
    }

    // -------------------------------------------------------------
    // WORLD 5: INTELIGÊNCIA ARTIFICIAL CONCEITUAL & ÉTICA
    // -------------------------------------------------------------
    case 'sim-ia-concepts': {
      const conceptKeys: Record<string, string> = {
        'c-1': 'ia',
        'c-2': 'regra',
        'c-3': 'ia',
        'c-4': 'regra',
        'c-5': 'ia',
        'c-6': 'regra',
      };
      const ans = input?.answers || input;
      if (typeof ans === 'object' && ans !== null && Object.keys(ans).length > 0) {
        let correct = 0;
        let matched = 0;
        for (const [k, expected] of Object.entries(conceptKeys)) {
          if (k in ans) {
            matched++;
            if (ans[k] === expected) correct++;
          }
        }
        if (matched > 0) {
          const score = Math.round((correct / Object.keys(conceptKeys).length) * 100);
          return { score, isValidated: true };
        }
      }
      break;
    }

    case 'sim-ai-generation': {
      // 5 situations with option ids
      const genKeys: Record<string, string> = {
        's-1': 'opt-1-sim',
        's-2': 'opt-2-falso',
        's-3': 'opt-3-verificar',
        's-4': 'opt-4-alucinacao',
        's-5': 'opt-5-rever',
      };
      const ans = input?.answers || input;
      if (typeof ans === 'object' && ans !== null && Object.keys(ans).length > 0) {
        let correct = 0;
        let matched = 0;
        for (const [k, expected] of Object.entries(genKeys)) {
          if (k in ans) {
            matched++;
            if (ans[k] === expected) correct++;
          }
        }
        if (matched > 0) {
          const score = Math.round((correct / Object.keys(genKeys).length) * 100);
          return { score, isValidated: true };
        }
      }
      break;
    }

    case 'sim-prompt': {
      const promptKeys: Record<number | string, string> = {
        1: 'opt-p1-detalhado',
        2: 'opt-p2-persona',
        3: 'opt-p3-passos',
        4: 'opt-p4-revisao',
      };
      const ans = input?.answers || input;
      if (typeof ans === 'object' && ans !== null && Object.keys(ans).length > 0) {
        let correct = 0;
        let matched = 0;
        for (const [k, expected] of Object.entries(promptKeys)) {
          if (k in ans) {
            matched++;
            if (ans[k] === expected) correct++;
          }
        }
        if (matched > 0) {
          const score = Math.round((correct / 4) * 100);
          return { score, isValidated: true };
        }
      }
      if (input?.selectedOption === 'detailed') {
        return { score: 100, isValidated: true };
      }
      break;
    }

    case 'sim-hallucination': {
      const hallKeys: Record<string, string> = {
        'h-1': 'alucinacao',
        'h-2': 'fato',
        'h-3': 'alucinacao',
        'h-4': 'fato',
        'h-5': 'alucinacao',
        'h-6': 'fato',
      };
      const ans = input?.answers || input;
      if (typeof ans === 'object' && ans !== null && Object.keys(ans).length > 0) {
        let correct = 0;
        let matched = 0;
        for (const [k, expected] of Object.entries(hallKeys)) {
          if (k in ans) {
            matched++;
            if (ans[k] === expected) correct++;
          }
        }
        if (matched > 0) {
          const score = Math.round((correct / Object.keys(hallKeys).length) * 100);
          return { score, isValidated: true };
        }
      }
      break;
    }

    case 'sim-ai-responsibility': {
      const privacyDataKeys: Record<string, string> = {
        'd-1': 'proibido',
        'd-2': 'seguro',
        'd-3': 'proibido',
        'd-4': 'proibido',
        'd-5': 'seguro',
        'd-6': 'proibido',
        'd-7': 'seguro',
        'd-8': 'proibido',
        'd-9': 'seguro',
        'd-10': 'proibido',
      };
      const ans = input?.answers || input;
      if (typeof ans === 'object' && ans !== null && Object.keys(ans).length > 0) {
        let correct = 0;
        let matched = 0;
        for (const [k, expected] of Object.entries(privacyDataKeys)) {
          if (k in ans) {
            matched++;
            if (ans[k] === expected) correct++;
          }
        }
        if (matched > 0) {
          const score = Math.round((correct / Object.keys(privacyDataKeys).length) * 100);
          return { score, isValidated: true };
        }
      }
      break;
    }

    case 'sim-recommendation': {
      const recKeys: Record<string, string> = {
        'r-1': 'opt-r1-bolha',
        'r-2': 'opt-r2-diversificar',
        'r-3': 'opt-r3-anuncio',
        'r-4': 'opt-r4-critica',
        'r-5': 'opt-r5-autonomia',
      };
      const ans = input?.answers || input;
      if (typeof ans === 'object' && ans !== null && Object.keys(ans).length > 0) {
        let correct = 0;
        let matched = 0;
        for (const [k, expected] of Object.entries(recKeys)) {
          if (k in ans) {
            matched++;
            if (ans[k] === expected) correct++;
          }
        }
        if (matched > 0) {
          const score = Math.round((correct / Object.keys(recKeys).length) * 100);
          return { score, isValidated: true };
        }
      }
      break;
    }
  }

  // Case 2: Activity has no server-side evaluator or insufficient/invalid input.
  // The server NEVER trusts client-provided scores, completedAction, or unverified claims.
  return {
    score: 0,
    isValidated: false,
    feedback: 'Atividade sem validação pedagógica do servidor ou dados de submissão insuficientes.',
  };
}
