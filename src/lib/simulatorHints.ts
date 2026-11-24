// Pedagogical metadata, privacy-safe mistake summarization, event bus,
// and static-host (GitHub Pages) Socratic guide for all 28 simulators.
import { evaluatePasswordStrength } from '../utils/passwordEvaluator';

export interface SimulatorMeta {
  id: string;
  title: string;
  worldId: number;
  topic: string;
  clues: string[];
  guidingQuestion: string;
}

export interface SimulatorMistakeEvent {
  simulatorId: string;
  simulatorTitle: string;
  worldId: number;
  topic: string;
  score: number;
  attemptSummary: string;
  timestamp: number;
}

type MistakeListener = (event: SimulatorMistakeEvent) => void;
const listeners = new Set<MistakeListener>();

export function subscribeSimulatorMistake(listener: MistakeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitSimulatorMistake(event: SimulatorMistakeEvent): void {
  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch (err) {
      console.error('[SimulatorHintBus] Listener error:', err);
    }
  });
}

export const SIMULATOR_CATALOG: Record<string, SimulatorMeta> = {
  // Mundo 1 — Guardião Digital
  'sim-password': {
    id: 'sim-password',
    title: 'Palavras-passe Secretas',
    worldId: 1,
    topic: 'Criar palavras-passe fortes (comprimento, imprevisibilidade, sem dados pessoais e variedade de caracteres)',
    clues: [
      'Uma palavra-passe forte precisa de pelo menos 8 caracteres e não deve usar sequências óbvias como "123", "escola" ou "qwerty".',
      'Mistura diferentes tipos de caracteres: letras maiúsculas, minúsculas, números e símbolos (como !, # ou _).',
      'Evita colocar nomes próprios ou datas de nascimento, porque são fáceis de adivinhar.',
    ],
    guidingQuestion: 'Que combinação divertida de uma palavra invulgar, números e um símbolo consegues inventar?',
  },
  'sim-phishing': {
    id: 'sim-phishing',
    title: 'Caça ao Phishing',
    worldId: 1,
    topic: 'Detetar mensagens fraudulentas (remetente, urgência, pedidos de palavra-passe e links estranhos)',
    clues: [
      'Olha sempre primeiro para o endereço de quem enviou o e-mail: o domínio oficial da escola termina de forma fiável.',
      'Desconfia de mensagens com pressa exagerada ("bloqueio hoje!", "30 minutos") ou prémios demasiado bons para ser verdade.',
      'Nenhuma escola ou serviço seguro te pede a palavra-passe através de um link num e-mail.',
    ],
    guidingQuestion: 'Na mensagem que falhaste, qual foi o detalhe no remetente ou no pedido que devia ter acendido o alerta?',
  },
  'sim-privacy': {
    id: 'sim-privacy',
    title: 'Escudo de Privacidade',
    worldId: 1,
    topic: 'Distinguir dados pessoais privados de informações seguras para partilhar',
    clues: [
      'Tudo o que ajuda um desconhecido a encontrar-te na vida real (morada, telemóvel, horários ou escola) deve ficar privado.',
      'Gosto pessoais gerais, como um livro ou passatempo, não revelam onde estás nem quem és na vida real.',
    ],
    guidingQuestion: 'Se um desconhecido lesse essa informação, conseguiria contactar-te ou saber onde estás?',
  },
  'sim-digital-footprint': {
    id: 'sim-digital-footprint',
    title: 'O Rasto Digital',
    worldId: 1,
    topic: 'Avaliar o impacto futuro do que publicamos online (pegada digital)',
    clues: [
      'Tudo o que publicas na Internet pode ficar guardado durante muito tempo e ser visto por outras pessoas.',
      'Fotos com farda escolar, localização GPS ou comentários mal-educados criam riscos para a tua segurança e reputação.',
    ],
    guidingQuestion: 'Gostarias que a tua professora ou a tua família vissem essa publicação daqui a alguns anos?',
  },
  'sim-digital-wellbeing': {
    id: 'sim-digital-wellbeing',
    title: 'Super-Corpo & Ecrãs',
    worldId: 1,
    topic: 'Hábitos saudáveis de tempo de ecrã, sono, postura e concentração',
    clues: [
      'O corpo e os olhos precisam de pausas regulares, movimento e descanso longe dos ecrãs antes de dormir.',
      'Desligar notificações enquanto estudas ajuda o cérebro a concentrar-se melhor.',
    ],
    guidingQuestion: 'Qual destes hábitos ajuda o teu corpo a descansar melhor e qual te deixa mais cansado ou distraído?',
  },

  // Mundo 2 — Detetive Digital
  'sim-keywords': {
    id: 'sim-keywords',
    title: 'Radar de Palavras-Chave',
    worldId: 2,
    topic: 'Escolher palavras-chave curtas e precisas para pesquisar na Internet',
    clues: [
      'Os motores de pesquisa funcionam melhor com 2 a 4 palavras-chave importantes em vez de frases muito compridas ou demasiado vagas.',
      'Corta palavras desnecessárias ("olá", "quero saber") e mantém apenas o assunto principal e o detalhe que procuras.',
    ],
    guidingQuestion: 'Quais são as 2 ou 3 palavras mais importantes que dizem exatamente o que queres encontrar?',
  },
  'sim-author-check': {
    id: 'sim-author-check',
    title: 'Investigação de Autoria',
    worldId: 2,
    topic: 'Verificar quem escreveu uma informação e se a fonte merece confiança',
    clues: [
      'Uma fonte de confiança identifica claramente o autor, a instituição (escola, museu, universidade) e explica quem é.',
      'Desconfia de perfis anónimos, nomes inventados ou páginas sem contactos nem "Quem Somos".',
    ],
    guidingQuestion: 'Consegues saber quem é o autor real dessa publicação e porque é que percebe do assunto?',
  },
  'sim-date-verifier': {
    id: 'sim-date-verifier',
    title: 'Verificação de Datas',
    worldId: 2,
    topic: 'Confirmar se a informação é atual e tem data completa (dia, mês e ano)',
    clues: [
      'Uma notícia verdadeira costuma mostrar uma data clara (dia, mês e ano). Expressões vagas como "ontem" ou "há dias" não chegam.',
      'Em ciência, saúde e tecnologia, uma informação muito antiga pode já estar desatualizada.',
    ],
    guidingQuestion: 'Essa informação mostra claramente quando foi publicada e ainda faz sentido para hoje?',
  },
  'sim-source-compare': {
    id: 'sim-source-compare',
    title: 'Comparar Várias Fontes',
    worldId: 2,
    topic: 'Confirmar um facto comparando duas ou mais fontes independentes e fiáveis',
    clues: [
      'Nunca confies apenas no primeiro site que aparece! Confirma sempre a mesma informação noutras fontes sérias.',
      'Quando vários meios oficiais ou educativos dizem factos que coincidem, a informação ganha muita mais confiança.',
    ],
    guidingQuestion: 'Se só um site estranho diz uma coisa e várias fontes oficiais dizem outra, em qual deves confiar?',
  },
  'sim-news-detective': {
    id: 'sim-news-detective',
    title: 'Caça a Boatos',
    worldId: 2,
    topic: 'Distinguir notícias verdadeiras de boatos e desinformação (clickbait)',
    clues: [
      'Títulos cheios de MAIÚSCULAS, exageros e pedidos como "PARTILHA JÁ!" são pistas clássicas de boato.',
      'Procura sempre factos concretos, autor identificado, data e fontes oficiais antes de acreditar.',
    ],
    guidingQuestion: 'Esse texto tenta informar com calma e provas, ou tenta assustar-te e fazer-te clicar à pressa?',
  },

  // Mundo 3 — Criador Digital
  'sim-avatar-challenge': {
    id: 'sim-avatar-challenge',
    title: 'Desafio do Avatar Seguro',
    worldId: 3,
    topic: 'Criar um perfil online criativo sem expor o nome verdadeiro nem dados privados',
    clues: [
      'O teu nome de jogo deve ser criativo e divertido, mas nunca incluir o teu nome completo, apelido real, escola ou data de nascimento.',
      'Confirma também se ativaste a verificação de privacidade do avatar antes de terminar.',
    ],
    guidingQuestion: 'O nome de jogo que escolheste protege bem a tua identidade real?',
  },
  'sim-comunicacao-digital': {
    id: 'sim-comunicacao-digital',
    title: 'Comunicação Digital',
    worldId: 3,
    topic: 'Escrever mensagens claras, educadas e com um pedido concreto',
    clues: [
      'Uma boa mensagem escolar cumprimenta com simpatia, explica claramente o que precisa e diz quando precisa.',
      'Evita frases bruscas, ordens ou mensagens tão vagas que o colega não sabe o que responder.',
    ],
    guidingQuestion: 'Se fosses o colega a receber essa mensagem, ficarias contente e saberias exatamente o que fazer?',
  },
  'sim-netiqueta': {
    id: 'sim-netiqueta',
    title: 'Teste de Netiqueta',
    worldId: 3,
    topic: 'Boas maneiras e respeito ao comunicar online',
    clues: [
      'ESCREVER TUDO EM MAIÚSCULAS na Internet parece que estás a gritar!',
      'Pensa sempre: dirias essa mesma frase cara a cara ao teu colega no recreio?',
    ],
    guidingQuestion: 'A forma como a mensagem foi escrita mostra respeito e calma, ou pode magoar quem a lê?',
  },
  'sim-colaboracao': {
    id: 'sim-colaboracao',
    title: 'Trabalho em Equipa Digital',
    worldId: 3,
    topic: 'Colaborar online respeitando o trabalho dos colegas e dividindo tarefas',
    clues: [
      'Trabalhar em equipa significa combinar tarefas, ouvir as ideias de todos e nunca apagar o trabalho de um colega sem perguntar.',
      'Usar comentários construtivos ajuda o grupo a melhorar o projeto sem discussões.',
    ],
    guidingQuestion: 'Essa atitude ajuda toda a equipa a avançar junta ou prejudica o trabalho dos colegas?',
  },
  'sim-direitos-autor': {
    id: 'sim-direitos-autor',
    title: 'Direitos de Autor & Permissões',
    worldId: 3,
    topic: 'Respeitar os criadores de imagens, textos e músicas da Internet',
    clues: [
      'Estar disponível na Internet não significa que seja livre para copiar sem autorização.',
      'Para usar obras de outras pessoas de forma justa, precisa de licença aberta (como Creative Commons), domínio público ou autorização, e indicar sempre o autor.',
    ],
    guidingQuestion: 'Nessa situação, o autor deu permissão para usar a obra e recebeu o devido crédito?',
  },
  'sim-plagio-citacao': {
    id: 'sim-plagio-citacao',
    title: 'Citação & Reconhecimento',
    worldId: 3,
    topic: 'Evitar o plágio escrevendo por palavras próprias e citando as fontes',
    clues: [
      'Copiar e colar um texto sem mudar nada nem indicar de onde veio é plágio.',
      'A melhor forma é leres com atenção, explicares a ideia pelas tuas palavras e escreveres sempre o nome da fonte ou do autor.',
    ],
    guidingQuestion: 'Qual das opções mostra que o aluno aprendeu mesmo a matéria e respeitou quem escreveu o texto original?',
  },
  'sim-creative-commons': {
    id: 'sim-creative-commons',
    title: 'Licenças Creative Commons',
    worldId: 3,
    topic: 'Compreender símbolos Creative Commons (BY, NC, ND, SA)',
    clues: [
      'Lembra-te das siglas: BY = dar crédito ao autor; NC = não comercial (sem vender); ND = sem alterações; SA = partilhar com a mesma licença.',
      'Lê bem o que o aluno quer fazer (por exemplo, editar ou usar na escola) e compara com o que a licença permite.',
    ],
    guidingQuestion: 'Que regra específica está escondida nas letras da licença (BY, NC ou ND) desse caso?',
  },

  // Mundo 4 — Engenheiro Digital
  'sim-decomposicao': {
    id: 'sim-decomposicao',
    title: 'Dividir Problemas',
    worldId: 4,
    topic: 'Decomposição: partir um problema grande em passos pequenos e pela ordem certa',
    clues: [
      'Pensa na ordem lógica do dia a dia: o que tem de acontecer PRIMEIRO antes de poderes passar ao passo seguinte?',
      'Verifica se colocaste todos os passos e se nenhum ficou trocado fora de sequência.',
    ],
    guidingQuestion: 'Se seguisses exatamente a ordem que escolheste, conseguirias começar pelo princípio sem saltar nada?',
  },
  'sim-block-coding': {
    id: 'sim-block-coding',
    title: 'O Caminho do Robô',
    worldId: 4,
    topic: 'Programação por blocos e sequência exata de comandos (algoritmo)',
    clues: [
      'O robô faz EXATAMENTE o que tu mandas, passo a passo, sem adivinhar.',
      'Conta com o dedo cada quadradinho da grelha desde a partida até à meta e verifica para onde o robô está virado antes de avançar!',
    ],
    guidingQuestion: 'Em que passo exato é que o robô se desviou do caminho ou parou antes da meta?',
  },
  'sim-algoritmos': {
    id: 'sim-algoritmos',
    title: 'Condições (SE / SENÃO)',
    worldId: 4,
    topic: 'Estruturas condicionais: decidir uma ação SE a condição for verdadeira e outra SENÃO',
    clues: [
      'Lê cada frase em voz alta: "SE isto acontecer, faço A; SENÃO (caso contrário), faço B."',
      'Confirma se não trocaste a ação do SE com a ação do SENÃO!',
    ],
    guidingQuestion: 'Quando a condição acontece mesmo, qual é a reação mais lógica e segura?',
  },
  'sim-ciclos': {
    id: 'sim-ciclos',
    title: 'Repetições (Ciclos / Loops)',
    worldId: 4,
    topic: 'Usar ciclos para repetir uma ação o número exato de vezes sem repetir código',
    clues: [
      'Conta com cuidado quantas vezes a ação precisa de acontecer no total para completar o padrão ou a figura.',
      'Por exemplo, um quadrado tem 4 lados iguais — quantas vezes precisas de repetir "avançar e virar"?',
    ],
    guidingQuestion: 'Se contares cada repetição uma a uma, o número que escolheste chega exatamente ao fim ou fica a faltar/sobrar?',
  },
  'sim-dados': {
    id: 'sim-dados',
    title: 'Dados e Tabelas',
    worldId: 4,
    topic: 'Ler tabelas, identificar o máximo/mínimo e somar valores corretamente',
    clues: [
      'Compara todos os números da tabela linha por linha para encontrar o maior e o menor valor.',
      'Para calcular o total de alunos, soma os votos de todas as linhas com calma — vale a pena somar duas vezes para confirmar!',
    ],
    guidingQuestion: 'Qual foi o cálculo ou a linha da tabela que vale a pena conferir outra vez com calma?',
  },
  'sim-debugging': {
    id: 'sim-debugging',
    title: 'Caça aos Erros (Debugging)',
    worldId: 4,
    topic: 'Detetar um erro (bug) num algoritmo e escolher a correção certa',
    clues: [
      'Faz de conta que és tu o robô e executa cada linha do programa por ordem até encontrares onde algo corre mal.',
      'Primeiro descobre QUAL é o passo errado; depois escolhe a correção que resolve exatamente esse passo.',
    ],
    guidingQuestion: 'Ao seguir o algoritmo passo a passo na tua cabeça, em que linha exata aparece o problema?',
  },

  // Mundo 5 — Explorador da IA
  'sim-ia-concepts': {
    id: 'sim-ia-concepts',
    title: 'Conceitos de IA',
    worldId: 5,
    topic: 'O que é a Inteligência Artificial, como aprende com padrões e o que NÃO é IA',
    clues: [
      'A IA aprende padrões a partir de muitos dados, mas NÃO tem sentimentos, consciência nem vontade própria.',
      'Um objeto simples que só cumpre um botão fixo (como uma torradeira comum) não usa Inteligência Artificial.',
    ],
    guidingQuestion: 'Esse sistema aprende com dados para tomar decisões, ou apenas faz sempre a mesma coisa fixa?',
  },
  'sim-ai-generation': {
    id: 'sim-ai-generation',
    title: 'IA Generativa & Verificação',
    worldId: 5,
    topic: 'Usar a IA generativa com espírito crítico e verificar sempre o resultado',
    clues: [
      'A IA generativa consegue criar textos e imagens novos, mas pode cometer erros ou inventar factos.',
      'Usar a IA de forma inteligente significa pedir ajuda para estudar ou ter ideias, mas ler, melhorar e confirmar sempre tudo.',
    ],
    guidingQuestion: 'Nesta situação, o aluno usou a IA como uma ferramenta de apoio ou confiou nela sem pensar nem confirmar?',
  },
  'sim-prompt': {
    id: 'sim-prompt',
    title: 'Oficina de Prompts',
    worldId: 5,
    topic: 'Escrever pedidos (prompts) claros, com tema, objetivo e formato definidos',
    clues: [
      'Um bom prompt explica claramente: o assunto, para quem é (ex.: aluno do 6.º ano) e como queres a resposta (ex.: em 3 pontos simples).',
      'Prompts demasiado curtos e vagos dão respostas confusas; prompts claros ajudam a IA a ajudar-te melhor.',
    ],
    guidingQuestion: 'Qual dos pedidos dá instruções claras e concretas sem pedir à IA que faça batota por ti?',
  },
  'sim-hallucination': {
    id: 'sim-hallucination',
    title: 'Caça às Alucinações de IA',
    worldId: 5,
    topic: 'Detetar quando a IA inventa factos, datas ou detalhes que parecem verdadeiros',
    clues: [
      'A IA escreve de forma muito confiante mesmo quando está a inventar! A isso chama-se "alucinação".',
      'Verifica sempre datas históricas, nomes de pessoas e factos científicos com o que sabes da escola ou nos manuais.',
    ],
    guidingQuestion: 'Qual dessas frases parece muito bem escrita, mas tem uma data ou um facto impossível na realidade?',
  },
  'sim-ai-responsibility': {
    id: 'sim-ai-responsibility',
    title: 'Privacidade na IA',
    worldId: 5,
    topic: 'Decidir que informações são seguras e quais nunca devem ser escritas num chat de IA',
    clues: [
      'Nunca escrevas dados pessoais teus nem dos teus colegas (nome completo, morada, telemóvel, escola ou palavras-passe) numa ferramenta de IA.',
      'Perguntas gerais sobre matérias escolares ou ideias criativas sem dados privados são seguras.',
    ],
    guidingQuestion: 'Essa frase revela algum dado privado que identifique uma pessoa real?',
  },
  'sim-recommendation': {
    id: 'sim-recommendation',
    title: 'Algoritmos de Recomendação',
    worldId: 5,
    topic: 'Como funcionam as recomendações de vídeos/jogos e como evitar ficar preso numa bolha',
    clues: [
      'Os algoritmos recomendam conteúdos parecidos com aquilo em que clicas, vês até ao fim ou fazes "gosto".',
      'Para não ficares preso a ver sempre o mesmo tipo de conteúdo, convém variar as pesquisas e controlar o tempo de ecrã.',
    ],
    guidingQuestion: 'O que é que o algoritmo observou nas tuas ações para escolher o próximo vídeo ou sugestão?',
  },
};

export function getSimulatorMeta(simulatorId: string, fallbackWorldId = 1): SimulatorMeta {
  if (SIMULATOR_CATALOG[simulatorId]) {
    return SIMULATOR_CATALOG[simulatorId];
  }
  return {
    id: simulatorId,
    title: 'Missão Prática de TIC',
    worldId: fallbackWorldId,
    topic: 'Competências digitais do 6.º Ano',
    clues: [
      'Lê o enunciado com calma e volta ao separador "Vamos aprender?" se precisares de rever as regras principais.',
      'Observa as pistas destacadas em cada situação antes de confirmar a tua resposta.',
    ],
    guidingQuestion: 'Qual foi a parte da atividade que te deixou mais em dúvida?',
  };
}

/**
 * Summarizes the student's submitted payload safely without ever leaking raw passwords or personal data.
 */
export function buildSafeAttemptSummary(simulatorId: string, payload: any, score: number): string {
  if (!payload || typeof payload !== 'object') {
    return `O aluno terminou com ${score}% e falhou alguns pontos.`;
  }

  // NEVER transmit raw password strings to the AI or logs!
  if (simulatorId === 'sim-password' && typeof payload.password === 'string') {
    const evalResult = evaluatePasswordStrength(payload.password);
    return evalResult.issues.length > 0
      ? `A palavra-passe de teste ficou com ${score}% porque: ${evalResult.issues.join('; ')}.`
      : `A palavra-passe de teste ficou com ${score}% e ainda pode ficar mais forte.`;
  }

  if (simulatorId === 'sim-block-coding') {
    const cmds = Array.isArray(payload.commands) ? payload.commands : [];
    const reached = payload.reached === true;
    const level = payload.level ? ` (Nível ${payload.level})` : '';
    return `O aluno testou ${cmds.length} comandos no robô${level} e ${reached ? 'chegou à meta mas pode otimizar' : 'ainda não chegou à meta'} (resultado: ${score}%).`;
  }

  if (simulatorId === 'sim-decomposicao' && Array.isArray(payload.steps)) {
    return `O aluno ordenou ${payload.steps.length} passos, mas a sequência ainda tem passos fora de ordem (resultado: ${score}%).`;
  }

  if (simulatorId === 'sim-avatar-challenge') {
    const checked = payload.avatarPrivacyChecked ? 'ativou a verificação de privacidade' : 'não ativou a verificação de privacidade';
    return `O aluno criou um perfil de avatar (${checked}) e obteve ${score}%.`;
  }

  if (payload.answers && typeof payload.answers === 'object') {
    const count = Object.keys(payload.answers).length;
    return `O aluno respondeu a ${count} itens nesta atividade e obteve ${score}% (algumas respostas precisam de revisão).`;
  }

  return `O aluno completou a tentativa com ${score}% e ainda há aspetos para melhorar.`;
}

/**
 * Static-host (GitHub Pages) Socratic hint generator used ONLY when no Node backend is running.
 */
export function buildStaticSocraticHint(params: {
  simulatorId: string;
  worldId?: number;
  score?: number;
  attemptSummary?: string;
  userMessage?: string;
  turnCount?: number;
}): string {
  const meta = getSimulatorMeta(params.simulatorId, params.worldId || 1);
  const idx = (params.turnCount || 0) % meta.clues.length;
  const clue = meta.clues[idx];

  if (params.userMessage) {
    const lower = params.userMessage.toLowerCase();
    if (lower.includes('resposta') || lower.includes('qual é') || lower.includes('diz-me')) {
      return `Boa tentativa, mas o Robo-Guia não entrega a resposta — tu consegues descobrir sozinho! 💡 Pista: ${clue} ${meta.guidingQuestion}`;
    }
    if (lower.includes('conceito') || lower.includes('explica')) {
      return `Claro! Em "${meta.title}", o mais importante é: ${meta.topic}. ${clue} Queres voltar a tentar agora?`;
    }
    return `Boa pergunta! 💡 ${clue} ${meta.guidingQuestion}`;
  }

  const encouragement =
    typeof params.score === 'number' && params.score >= 60
      ? 'Estás quase lá! Já acertaste uma grande parte, só falta afinar um detalhe.'
      : 'Não desanimes — errar faz parte de aprender e já estás no bom caminho!';

  return `${encouragement} Em "${meta.title}", presta atenção a esta pista: ${clue} ${meta.guidingQuestion}`;
}
