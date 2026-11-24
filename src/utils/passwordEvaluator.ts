export interface PasswordEvaluation {
  score: number;
  hasMinLength: boolean;
  hasUpperAndLower: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  isMostlyPredictable: boolean;
  hasPersonalData: boolean;
  title: string;
  description: string;
  issues: string[];
}

const COMMON_TOKENS = [
  '123456789',
  '12345678',
  '1234567',
  '123456',
  '12345',
  '1234',
  '123',
  'palavrapasse',
  'password',
  'qwerty',
  'portugal',
  'futebol',
  'escola',
  'teste',
  'admin',
  'pass',
  '0000',
  '1111',
  '000',
  '111',
  '999',
  'abc',
];

const OBVIOUS_NAME_REGEX =
  /(^|[^a-zA-ZÀ-ÿ])(alex|tiago|leonor|marta|diogo|joao|joão|maria|ana|pedro|lucas|matilde|tomas|tomás|beatriz|francisco|afonso|goncalo|gonçalo|rodrigo|martim|santiago)(?=$|[^a-zA-ZÀ-ÿ])/gi;

const OBVIOUS_YEAR_REGEX = /(?:19\d\d|20\d\d)/g;

export function evaluatePasswordStrength(rawPassword: string): PasswordEvaluation {
  const pwd = typeof rawPassword === 'string' ? rawPassword : '';
  const len = pwd.length;

  const hasMinLength = len >= 8;
  const hasUpper = /[A-ZÀ-ÖØ-Þ]/.test(pwd);
  const hasLower = /[a-zß-öø-ÿ]/.test(pwd);
  const hasUpperAndLower = hasUpper && hasLower;
  const hasNumbers = /[0-9]/.test(pwd);
  const hasSymbols = /[^A-Za-z0-9À-ÖØ-öø-ÿ]/.test(pwd);

  // Base score aligned with the 4 visual checklist criteria (25 pts each = 100 pts)
  let score = 0;

  if (len >= 8) {
    score += 25;
  } else if (len >= 6) {
    score += 15;
  } else if (len >= 4) {
    score += 10;
  } else if (len > 0) {
    score += 5;
  }

  if (hasUpperAndLower) {
    score += 25;
  } else if (hasUpper || hasLower) {
    score += 10;
  }

  if (hasNumbers) {
    score += 25;
  }

  if (hasSymbols) {
    score += 25;
  }

  // Check if the password as a whole relies heavily on common sequences or personal data.
  // Long creative passphrases (e.g. "Gato\1234Fedorente?!!") keep plenty of unpredictable
  // characters even if a number sequence appears inside them, so they are NOT penalized.
  let remaining = pwd.toLowerCase();
  let matchedCommonToken = false;
  let matchedPersonalData = false;

  for (const token of COMMON_TOKENS) {
    if (remaining.includes(token)) {
      matchedCommonToken = true;
      remaining = remaining.split(token).join('');
    }
  }

  const afterNames = remaining.replace(OBVIOUS_NAME_REGEX, '$1');
  if (afterNames !== remaining) {
    matchedPersonalData = true;
    remaining = afterNames;
  }

  const afterYears = remaining.replace(OBVIOUS_YEAR_REGEX, '');
  if (afterYears !== remaining) {
    matchedPersonalData = true;
    remaining = afterYears;
  }

  const remainingLength = remaining.replace(/\s+/g, '').length;
  const isMostlyPredictable = matchedCommonToken && remainingLength < 6;
  const hasPersonalData = matchedPersonalData && remainingLength < 6;

  if (isMostlyPredictable || hasPersonalData) {
    score -= remainingLength <= 2 ? 30 : 15;
  }

  score = Math.min(100, Math.max(len > 0 ? 10 : 0, score));

  // Build specific, accurate improvement tips
  const issues: string[] = [];
  if (!hasMinLength) {
    issues.push(`tem apenas ${len} caracteres (precisa de pelo menos 8)`);
  }
  if (!hasUpperAndLower) {
    issues.push('falta misturar letras maiúsculas e minúsculas');
  }
  if (!hasNumbers) {
    issues.push('falta adicionar pelo menos um número');
  }
  if (!hasSymbols) {
    issues.push('falta incluir um símbolo especial (como #, !, ? ou _)');
  }
  if (isMostlyPredictable) {
    issues.push('baseia-se demasiado em palavras ou sequências comuns (como "123", "escola" ou "qwerty")');
  }
  if (hasPersonalData) {
    issues.push('usa um nome próprio ou ano fácil de adivinhar');
  }

  let title = '';
  let description = '';

  if (score === 100) {
    title = '🛡️ Palavra-passe Muito Segura e Invencível!';
    description =
      'Excelente! A tua palavra-passe cumpre todos os critérios de segurança: é comprida, mistura maiúsculas, minúsculas, números e símbolos, e é difícil de adivinhar. Usa palavras-passe diferentes para cada conta e nunca as partilhes com ninguém!';
  } else if (score >= 70) {
    title = '✓ Palavra-passe Segura (Boa Proteção)';
    const tipText =
      issues.length > 0
        ? `Para chegar aos 100 pontos, melhora isto: ${issues.join('; ')}.`
        : 'Muito bom! Continua a criar combinações criativas e imprevisíveis.';
    description = `Boa proteção! ${tipText}`;
  } else if (score >= 50) {
    title = '⚡ Palavra-passe Razoável (Pode Melhorar)';
    const tipText =
      issues.length > 0
        ? `O que falta melhorar: ${issues.join('; ')}.`
        : 'Tenta torná-la mais comprida e imprevisível.';
    description = `A tua palavra-passe tem pontos positivos, mas um robô ainda pode tentar adivinhá-la. ${tipText}`;
  } else {
    title = '⚠️ Palavra-passe Curta ou Vulnerável';
    const tipText =
      issues.length > 0
        ? `Atenção: ${issues.join('; ')}. `
        : '';
    description = `${tipText}Experimenta o método da frase maluca, como "Gato_Ninja_Comeu_9_Pizzas!".`;
  }

  return {
    score,
    hasMinLength,
    hasUpperAndLower,
    hasNumbers,
    hasSymbols,
    isMostlyPredictable,
    hasPersonalData,
    title,
    description,
    issues,
  };
}
