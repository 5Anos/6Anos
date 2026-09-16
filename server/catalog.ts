export interface WorldContent {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  intro: {
    greeting: string;
    description: string[];
    mission: string;
  };
  topics: {
    id: string;
    number: number;
    title: string;
    paragraphs: string[];
    bulletPoints?: string[];
    takeaway?: string;
  }[];
  simulators: {
    id: string;
    name: string;
    description: string;
    xpReward: number;
  }[];
  challenge: {
    id: string;
    title: string;
    description: string;
    xpReward: number;
  };
  mission: {
    id: string;
    title: string;
    description: string;
    instructions: string[];
    xpReward: number;
  };
}

export interface QuestionCatalogItem {
  id: string;
  text: string;
  options: string[];
  correctIndex: number; // Stored securely on server, stripped before sending to client!
  explanation: string;
}

export interface LevelInfo {
  level: number;
  name: string;
  minXp: number;
}

export const LEVELS: LevelInfo[] = [
  { level: 1, name: 'Novato Digital', minXp: 0 },
  { level: 2, name: 'Explorador Digital', minXp: 100 },
  { level: 3, name: 'Guardião Digital', minXp: 250 },
  { level: 4, name: 'Detetive Digital', minXp: 500 },
  { level: 5, name: 'Criador Digital', minXp: 800 },
  { level: 6, name: 'Engenheiro Digital', minXp: 1200 },
  { level: 7, name: 'Explorador da IA', minXp: 1700 },
  { level: 8, name: 'Mestre da Missão TIC', minXp: 2300 },
];

export function calculateLevel(xp: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

export function getNextLevelInfo(xp: number) {
  const current = calculateLevel(xp);
  const next = LEVELS.find((l) => l.level === current.level + 1) || null;
  const currentMin = current.minXp;
  const nextMin = next ? next.minXp : currentMin + 500;
  const progressInLevel = xp - currentMin;
  const neededInLevel = nextMin - currentMin;
  const percentage = next ? Math.min(100, Math.max(0, Math.round((progressInLevel / neededInLevel) * 100))) : 100;
  return {
    current,
    next,
    currentMin,
    nextMin,
    progressInLevel,
    neededInLevel,
    percentage,
  };
}

export const BADGES_CATALOG = [
  {
    id: 'primeiros-passos',
    title: 'Primeiros Passos',
    description: 'Criaste a tua conta e deste os primeiros passos na Missão TIC.',
    icon: 'Footprints',
  },
  {
    id: 'guardiao-digital',
    title: 'Guardião Digital',
    description: 'Completaste os desafios de segurança e privacidade do Mundo 1.',
    icon: 'ShieldCheck',
  },
  {
    id: 'detetive-digital',
    title: 'Detetive Digital',
    description: 'Dominaste a pesquisa crítica e verificação de fontes no Mundo 2.',
    icon: 'Search',
  },
  {
    id: 'criador-digital',
    title: 'Criador Digital',
    description: 'Mostraste respeito pela netiqueta e direitos de autor no Mundo 3.',
    icon: 'Palette',
  },
  {
    id: 'engenheiro-digital',
    title: 'Engenheiro Digital',
    description: 'Desvendaste algoritmos, ciclos e pensamento computacional no Mundo 4.',
    icon: 'Code2',
  },
  {
    id: 'explorador-da-ia',
    title: 'Explorador da IA',
    description: 'Aprendeste a usar a Inteligência Artificial com responsabilidade no Mundo 5.',
    icon: 'Sparkles',
  },
  {
    id: 'centuriao-digital',
    title: 'Centurião Digital',
    description: 'Alcançaste mais de 1000 XP ou obtiveste 100% numa Avaliação Final.',
    icon: 'Award',
  },
  {
    id: 'mestre-da-missao-tic',
    title: 'Mestre da Missão TIC',
    description: 'Concluíste a Grande Missão e demonstraste excelência em todas as áreas.',
    icon: 'Crown',
  },
];

export const DAILY_TIPS = [
  {
    id: 'tip-1',
    pt: 'Antes de clicares num link recebido por mensagem, verifica sempre para onde ele realmente te leva.',
    en: 'Before clicking a link received via message, always verify where it actually leads.',
  },
  {
    id: 'tip-2',
    pt: 'Uma palavra-passe forte deve ter pelo menos 10 caracteres, combinando letras, números e símbolos.',
    en: 'A strong password should be at least 10 characters long, combining letters, numbers, and symbols.',
  },
  {
    id: 'tip-3',
    pt: 'Encontrar uma imagem na Internet não significa que ela seja tua: verifica sempre os direitos de autor.',
    en: 'Finding an image on the Internet does not make it yours: always check copyright and licenses.',
  },
  {
    id: 'tip-4',
    pt: 'A Inteligência Artificial pode inventar respostas com convicção. Confirma sempre factos importantes!',
    en: 'Artificial Intelligence can invent answers with confidence. Always double-check important facts!',
  },
  {
    id: 'tip-5',
    pt: 'Descansa os olhos a cada 20 minutos de ecrã: olha para um ponto distante durante 20 segundos.',
    en: 'Rest your eyes every 20 minutes of screen time: look at a distant point for 20 seconds.',
  },
];

export const WORLDS_DATA: WorldContent[] = [
  {
    id: 1,
    title: 'MUNDO 1 — GUARDIÃO DIGITAL',
    subtitle: 'Segurança, Privacidade e Bem-estar',
    icon: 'Shield',
    color: 'emerald',
    intro: {
      greeting: 'Bem-vindo, Guardião Digital!',
      description: [
        'Usamos a Internet para aprender, comunicar, jogar e criar.',
        'Mas também existem alguns riscos.',
        'Neste Mundo vais aprender a proteger as tuas contas, os teus dados e a tua privacidade.',
        'Vais também descobrir como usar a tecnologia de forma mais segura e saudável.',
      ],
      mission: 'A tua missão: parar, pensar e proteger.',
    },
    topics: [
      {
        id: 'w1-t1',
        number: 1,
        title: 'Palavras-passe',
        paragraphs: [
          'Uma palavra-passe protege uma conta.',
          'Uma boa palavra-passe deve ser difícil de adivinhar e diferente das que usas noutras contas.',
          'Evita usar o teu nome, a tua data de nascimento ou palavras muito fáceis.',
          'Nunca partilhes a tua palavra-passe com amigos.',
          'Se precisares de ajuda, pede ajuda a um adulto de confiança.',
        ],
        takeaway: 'Lembra-te: uma palavra-passe é pessoal e deve ser secreta.',
      },
      {
        id: 'w1-t2',
        number: 2,
        title: 'Phishing',
        paragraphs: [
          'Phishing é uma tentativa de enganar alguém para conseguir informação.',
          'Pode acontecer através de um email, uma mensagem, uma rede social ou um site falso.',
          'Antes de clicar, para e verifica.',
          'Nem todas as mensagens que recebemos são de confiança.',
        ],
        bulletPoints: [
          'pedem a tua palavra-passe;',
          'prometem prémios;',
          'têm links estranhos;',
          'tentam assustar-te ou apressar-te.',
        ],
      },
      {
        id: 'w1-t3',
        number: 3,
        title: 'Dados pessoais',
        paragraphs: [
          'Dados pessoais são informações sobre nós.',
          'Não precisamos de publicar tudo na Internet.',
          'Antes de partilhar alguma coisa, pergunta: Eu gostaria que qualquer pessoa visse isto? Se não, não partilhes.',
        ],
        bulletPoints: [
          'nome;',
          'morada;',
          'número de telefone;',
          'fotografia;',
          'localização;',
          'escola;',
          'palavra-passe.',
        ],
      },
      {
        id: 'w1-t4',
        number: 4,
        title: 'Pegada digital',
        paragraphs: [
          'A pegada digital é o conjunto de informações e registos que deixamos quando usamos serviços digitais.',
          'Publicações, comentários, fotografias e outras atividades podem fazer parte dessa pegada.',
          'Por isso, pensa antes de publicar.',
          'O que colocamos hoje na Internet pode continuar associado a nós no futuro.',
        ],
      },
      {
        id: 'w1-t5',
        number: 5,
        title: 'Bem-estar digital',
        paragraphs: [
          'A tecnologia deve fazer parte da nossa vida, mas não deve ocupar todo o nosso tempo.',
          'Se estiveres cansado, irritado ou preocupado, faz uma pausa e fala com um adulto de confiança.',
          'Usar tecnologia de forma saudável também é importante.',
        ],
        bulletPoints: [
          'fazer pausas;',
          'descansar os olhos;',
          'mexer o corpo;',
          'dormir bem;',
          'ter tempo sem ecrãs.',
        ],
      },
    ],
    simulators: [
      {
        id: 'sim-password',
        name: 'Password Simulator',
        description: 'Testa a robustez de palavras-passe contra tentativas de ataque e aprende a criar senhas fortes.',
        xpReward: 100,
      },
      {
        id: 'sim-phishing',
        name: 'Phishing Simulator',
        description: 'Analisa mensagens e emails suspeitos, identificando links fraudulentos e truques de engenharia social.',
        xpReward: 100,
      },
      {
        id: 'sim-privacy',
        name: 'Privacy Simulator',
        description: 'Classifica dados pessoais entre públicos e privados e configura um perfil digital seguro.',
        xpReward: 100,
      },
    ],
    challenge: {
      id: 'ch-guarda-digital',
      title: 'TORNA-TE UM GUARDIÃO',
      description: 'O aluno recebe situações do dia a dia e escolhe a atitude mais segura.',
      xpReward: 100,
    },
    mission: {
      id: 'mis-guia-seguranca',
      title: 'O MEU GUIA DE SEGURANÇA',
      description: 'Criar 5 regras pessoais para utilizar a Internet de forma segura.',
      instructions: [
        'Pensa nas situações reais em que usas a Internet (telemóvel, computador, jogos).',
        'Formula 5 regras claras, práticas e fáceis de aplicar.',
        'Explica porque cada regra te protege a ti e aos teus amigos.',
        'Submete o teu guia para validação e feedback do professor.',
      ],
      xpReward: 100,
    },
  },
  {
    id: 2,
    title: 'MUNDO 2 — DETETIVE DIGITAL',
    subtitle: 'Pesquisa, Fontes e Pensamento Crítico',
    icon: 'Search',
    color: 'blue',
    intro: {
      greeting: 'Bem-vindo, Detetive Digital!',
      description: [
        'Na Internet encontramos respostas para quase tudo.',
        'Mas encontrar uma informação não significa que ela seja verdadeira.',
        'Neste Mundo vais aprender a pesquisar melhor, verificar fontes e pensar antes de acreditar ou partilhar.',
      ],
      mission: 'A tua missão: não acreditar logo. Investigar primeiro.',
    },
    topics: [
      {
        id: 'w2-t1',
        number: 1,
        title: 'Pesquisar melhor',
        paragraphs: [
          'Uma boa pesquisa começa com palavras-chave claras.',
          'Em vez de escrever: animais, podemos escrever: animais em perigo de extinção em Portugal.',
          'Uma pesquisa mais específica ajuda a encontrar resultados mais úteis.',
          'Quanto mais clara for a pergunta, mais fácil será procurar a resposta.',
        ],
      },
      {
        id: 'w2-t2',
        number: 2,
        title: 'Quem criou a informação?',
        paragraphs: [
          'Quando encontramos uma informação, devemos tentar descobrir quem a criou.',
          'Pergunta: Quem escreveu isto?',
          'Procura o nome do autor ou da organização.',
          'Uma página sem autor ou sem informação sobre a origem merece mais cuidado.',
          'Antes de confiar, procura saber de onde veio a informação.',
        ],
      },
      {
        id: 'w2-t3',
        number: 3,
        title: 'Verificar a data',
        paragraphs: [
          'A informação pode ficar desatualizada.',
          'Uma notícia antiga pode não explicar o que acontece hoje.',
          'Por isso, verifica a data, principalmente quando procuras notícias ou acontecimentos recentes.',
          'Uma informação antiga pode não responder a uma pergunta atual.',
        ],
      },
      {
        id: 'w2-t4',
        number: 4,
        title: 'Comparar fontes',
        paragraphs: [
          'Não precisas de acreditar na primeira página que encontras.',
          'Compara duas ou três fontes.',
          'Se várias fontes independentes apresentam a mesma informação, tens uma pista importante.',
          'Se uma fonte diz uma coisa e outras dizem o contrário, investiga mais.',
          'Comparar ajuda a encontrar informação mais segura.',
        ],
      },
      {
        id: 'w2-t5',
        number: 5,
        title: 'Pensar antes de partilhar',
        paragraphs: [
          'Uma fotografia pode ser verdadeira e, mesmo assim, estar a ser usada fora do contexto.',
          'Um título pode ser exagerado.',
          'Uma publicação pode misturar factos com opiniões.',
          'Uma informação muito partilhada também pode estar errada.',
          'Para. Verifica. Compara. Só depois partilha.',
        ],
      },
    ],
    simulators: [
      {
        id: 'sim-news-detective',
        name: 'NEWS DETECTIVE',
        description: 'Analisa pequenas notícias e procura autor, data, fonte, evidências e outras fontes para classificar a fiabilidade.',
        xpReward: 100,
      },
    ],
    challenge: {
      id: 'ch-operacao-detetive',
      title: 'OPERAÇÃO DETETIVE',
      description: 'Recebe uma informação viral e descobre quem publicou, a data, se existem provas e se outras fontes confirmam.',
      xpReward: 100,
    },
    mission: {
      id: 'mis-kit-detetive',
      title: 'KIT DO DETETIVE',
      description: 'Criar 5 perguntas para utilizar antes de acreditar ou partilhar uma informação.',
      instructions: [
        'Cria 5 perguntas de verificação rápida (ex.: "Quem é o autor?").',
        'Explica que tipo de resposta devemos esperar em cada uma.',
        'Dá um exemplo de como aplicar o teu kit a uma publicação das redes sociais.',
      ],
      xpReward: 100,
    },
  },
  {
    id: 3,
    title: 'MUNDO 3 — CRIADOR DIGITAL',
    subtitle: 'Comunicação, Colaboração e Direitos de Autor',
    icon: 'Palette',
    color: 'purple',
    intro: {
      greeting: 'Bem-vindo, Criador Digital!',
      description: [
        'Criar conteúdos digitais é divertido.',
        'Podemos escrever, desenhar, fotografar, apresentar ideias e trabalhar com outras pessoas.',
        'Mas criar também significa respeitar.',
        'Neste Mundo vais aprender a comunicar, colaborar e utilizar conteúdos de outras pessoas de forma correta.',
      ],
      mission: 'A tua missão: expressar ideias com respeito, clareza e autoria.',
    },
    topics: [
      {
        id: 'w3-t1',
        number: 1,
        title: 'Comunicar online',
        paragraphs: [
          'Quando escrevemos uma mensagem, a outra pessoa não consegue ouvir a nossa voz.',
          'Por isso, uma frase pode parecer mais agressiva do que queríamos.',
          'Antes de enviar, lê novamente.',
          'Pergunta: Eu diria isto pessoalmente? Se não, talvez seja melhor mudar a mensagem.',
          'Do outro lado do ecrã também existe uma pessoa.',
        ],
      },
      {
        id: 'w3-t2',
        number: 2,
        title: 'Netiqueta',
        paragraphs: [
          'Netiqueta significa ter boas maneiras na Internet.',
          'As boas maneiras também existem online.',
        ],
        bulletPoints: [
          'respeitar os outros;',
          'não insultar;',
          'não espalhar rumores;',
          'não escrever tudo em MAIÚSCULAS;',
          'ouvir opiniões diferentes;',
          'pedir ajuda quando algo corre mal.',
        ],
      },
      {
        id: 'w3-t3',
        number: 3,
        title: 'Trabalhar em equipa',
        paragraphs: [
          'Trabalhar online com outras pessoas exige organização.',
          'Uma boa equipa não precisa de pensar da mesma maneira.',
          'Precisa de conseguir trabalhar em conjunto.',
        ],
        bulletPoints: [
          'dividir tarefas;',
          'cumprir prazos;',
          'ouvir os colegas;',
          'ajudar;',
          'respeitar ideias;',
          'reconhecer o trabalho dos outros.',
        ],
      },
      {
        id: 'w3-t4',
        number: 4,
        title: 'Direitos de autor',
        paragraphs: [
          'Encontrar uma fotografia, um texto ou uma música na Internet não significa que possamos copiá-los livremente.',
          'Esse trabalho pode pertencer a outra pessoa.',
          'Antes de utilizar um conteúdo, verifica se tens autorização e quais são as condições de utilização.',
          'Encontrar na Internet não significa que seja nosso.',
        ],
      },
      {
        id: 'w3-t5',
        number: 5,
        title: 'Plágio e autoria',
        paragraphs: [
          'Plágio é apresentar o trabalho de outra pessoa como se fosse nosso.',
          'Quando utilizamos uma ideia, texto ou imagem de outra pessoa, devemos respeitar a autoria e as regras de utilização.',
          'Criar também é saber respeitar o trabalho dos outros.',
        ],
      },
      {
        id: 'w3-t6',
        number: 6,
        title: 'Creative Commons',
        paragraphs: [
          'Alguns autores utilizam licenças Creative Commons para explicar como outras pessoas podem utilizar os seus trabalhos.',
          'As licenças têm regras diferentes.',
          'Por isso, antes de utilizar uma imagem ou outro conteúdo, verifica a licença.',
          'A licença ajuda-nos a saber o que podemos fazer com um conteúdo.',
        ],
      },
    ],
    simulators: [
      {
        id: 'sim-avatar-challenge',
        name: 'Avatar Challenge',
        description: 'Cria uma representação digital única sem partilhar fotografias do teu rosto real ou dados pessoais.',
        xpReward: 100,
      },
      {
        id: 'sim-comunicacao-digital',
        name: 'Comunicação Digital',
        description: 'Interpreta o tom de várias mensagens e descobre como pequenos ajustes de pontuação evitam conflitos.',
        xpReward: 100,
      },
      {
        id: 'sim-direitos-autor',
        name: 'Direitos de Autor',
        description: 'Associa imagens às respetivas licenças de utilização e regras de atribuição de autoria.',
        xpReward: 100,
      },
    ],
    challenge: {
      id: 'ch-corrige-mensagem',
      title: 'CORRIGE A MENSAGEM',
      description: 'O aluno recebe uma mensagem pouco cuidada e deve transformá-la numa mensagem clara, educada e adequada.',
      xpReward: 100,
    },
    mission: {
      id: 'mis-codigo-comunicacao',
      title: 'CÓDIGO DE COMUNICAÇÃO DA TURMA',
      description: 'Criar 7 regras para comunicar e trabalhar em equipa de forma respeitosa.',
      instructions: [
        'Redige 7 regras práticas de convivência e respeito para os grupos de trabalho da turma.',
        'Inclui regras sobre o uso de maiúsculas, horários de mensagens e partilha de ficheiros.',
        'Descreve o que fazer quando surge uma discordância.',
      ],
      xpReward: 100,
    },
  },
  {
    id: 4,
    title: 'MUNDO 4 — ENGENHEIRO DIGITAL',
    subtitle: 'Pensamento Computacional, Algoritmos e Dados',
    icon: 'Terminal',
    color: 'amber',
    intro: {
      greeting: 'Bem-vindo, Engenheiro Digital!',
      description: [
        'Os computadores seguem instruções.',
        'Neste Mundo vais aprender a dividir problemas, criar algoritmos, tomar decisões, repetir tarefas e organizar dados.',
        'Não precisas de ser programador para pensar como um engenheiro.',
        'Basta aprender a resolver problemas passo a passo.',
      ],
      mission: 'A tua missão: decompor problemas e desenhar soluções precisas.',
    },
    topics: [
      {
        id: 'w4-t1',
        number: 1,
        title: 'Dividir um problema',
        paragraphs: [
          'Um problema grande pode parecer difícil.',
          'Uma forma de o tornar mais simples é dividi-lo em partes mais pequenas.',
          'Por exemplo, organizar uma atividade pode ser dividido em: escolher a data; fazer uma lista; preparar o espaço; escolher as tarefas; verificar se está tudo pronto.',
          'Dividir um problema ajuda-nos a encontrar uma solução.',
        ],
      },
      {
        id: 'w4-t2',
        number: 2,
        title: 'Algoritmos',
        paragraphs: [
          'Um algoritmo é uma sequência de passos para resolver um problema ou realizar uma tarefa.',
          'Por exemplo: colocar pasta na escova; escovar os dentes; passar a boca por água; arrumar a escova.',
          'A ordem dos passos é importante.',
          'Um algoritmo explica o que fazer e em que ordem.',
        ],
      },
      {
        id: 'w4-t3',
        number: 3,
        title: 'Condições',
        paragraphs: [
          'Um programa pode precisar de tomar uma decisão.',
          'Por exemplo: SE estiver a chover → levar guarda-chuva. SENÃO → não levar guarda-chuva.',
          'Os computadores usam condições para escolher o que fazer.',
          'Uma condição permite escolher uma ação.',
        ],
      },
      {
        id: 'w4-t4',
        number: 4,
        title: 'Repetições',
        paragraphs: [
          'Algumas tarefas precisam de ser repetidas.',
          'Em vez de escrever: avançar, avançar, avançar, avançar, podemos escrever: repetir 4 vezes: avançar.',
          'Os ciclos tornam os algoritmos mais simples e organizados.',
          'Quando uma ação se repete, podemos usar um ciclo.',
        ],
      },
      {
        id: 'w4-t5',
        number: 5,
        title: 'Dados',
        paragraphs: [
          'Dados são informações que podemos organizar e analisar.',
          'Podemos colocar dados numa tabela. Exemplo: Ana (80), Rui (65), Sofia (90).',
          'Depois podemos criar um gráfico e procurar padrões.',
          'Organizar dados ajuda-nos a perceber melhor a informação.',
        ],
      },
    ],
    simulators: [
      {
        id: 'sim-block-coding',
        name: 'Block Coding',
        description: 'Encaixa blocos de comando para guiar a personagem até à meta no menor número de passos.',
        xpReward: 100,
      },
      {
        id: 'sim-algoritmos',
        name: 'Algoritmos & Condições',
        description: 'Ordena passos lógicos e usa regras SE / SENÃO para tomar decisões automáticas.',
        xpReward: 100,
      },
      {
        id: 'sim-ciclos',
        name: 'Ciclos',
        description: 'Simplifica sequências longas de instruções substituindo blocos repetidos por ciclos eficientes.',
        xpReward: 100,
      },
      {
        id: 'sim-dados',
        name: 'Dados',
        description: 'Analisa tabelas, calcula totais e médias e interpreta gráficos informativos.',
        xpReward: 100,
      },
    ],
    challenge: {
      id: 'ch-robo-perdido',
      title: 'ROBÔ PERDIDO',
      description: 'Um robô precisa de chegar ao destino. O aluno deve criar a sequência correta de instruções e utilizar repetições quando fizer sentido.',
      xpReward: 100,
    },
    mission: {
      id: 'mis-pensar-engenheiro',
      title: 'PENSA COMO UM ENGENHEIRO',
      description: 'Escolher uma tarefa do dia a dia e escrever um algoritmo com 5 a 8 passos.',
      instructions: [
        'Escolhe uma tarefa quotidiana (ex.: fazer o saco de desporto, preparar o pequeno-almoço).',
        'Escreve entre 5 a 8 passos sequenciais com ordem estrita.',
        'Inclui pelo menos uma condição (SE ... SENÃO).',
      ],
      xpReward: 100,
    },
  },
  {
    id: 5,
    title: 'MUNDO 5 — EXPLORADOR DA IA',
    subtitle: 'IA, Prompts e Responsabilidade',
    icon: 'Sparkles',
    color: 'indigo',
    intro: {
      greeting: 'Bem-vindo, Explorador da IA!',
      description: [
        'A Inteligência Artificial já faz parte de muitas ferramentas que usamos.',
        'Pode ajudar a criar ideias, explicar assuntos, escrever textos e resolver problemas.',
        'Mas a IA não sabe tudo.',
        'Neste Mundo vais aprender a utilizá-la com inteligência e responsabilidade.',
      ],
      mission: 'A tua missão: pensar com a IA e nunca deixar que ela pense por ti.',
    },
    topics: [
      {
        id: 'w5-t1',
        number: 1,
        title: 'O que é Inteligência Artificial?',
        paragraphs: [
          'A Inteligência Artificial, ou IA, é uma tecnologia que permite aos computadores realizar tarefas que parecem exigir inteligência.',
          'Por exemplo: reconhecer imagens; compreender linguagem; encontrar padrões; gerar textos; fazer recomendações.',
          'A IA é uma ferramenta.',
          'Não é uma pessoa.',
        ],
      },
      {
        id: 'w5-t2',
        number: 2,
        title: 'IA generativa',
        paragraphs: [
          'A IA generativa consegue criar conteúdos a partir de instruções.',
          'Pode criar: textos; imagens; ideias; código.',
          'Mas uma resposta criada por IA não é automaticamente verdadeira.',
          'Devemos verificar aquilo que recebemos.',
        ],
      },
      {
        id: 'w5-t3',
        number: 3,
        title: 'Prompts',
        paragraphs: [
          'Um prompt é a instrução que damos a uma ferramenta de IA.',
          'Um prompt claro ajuda a explicar melhor o que queremos.',
          'Por exemplo, em vez de: “Fala sobre animais.” podemos escrever: “Explica a uma criança de 11 anos porque devemos proteger os animais em perigo, usando 5 frases simples.”',
          'Uma instrução clara pode produzir uma resposta mais útil.',
        ],
      },
      {
        id: 'w5-t4',
        number: 4,
        title: 'A IA pode enganar-se',
        paragraphs: [
          'Por vezes, uma IA apresenta uma resposta que parece correta, mas contém erros.',
          'Pode inventar: nomes; datas; acontecimentos; fontes; factos.',
          'Por isso, devemos verificar informação importante.',
          'Uma resposta convincente também pode estar errada.',
        ],
      },
      {
        id: 'w5-t5',
        number: 5,
        title: 'Privacidade e IA',
        paragraphs: [
          'Antes de colocar informação numa ferramenta de IA, pensa no que estás a partilhar.',
          'Não devemos colocar: passwords; morada; número de telefone; dados bancários; informação privada de outras pessoas.',
          'Se não tens a certeza, pergunta a um adulto de confiança.',
          'Não partilhes dados privados só porque uma ferramenta os pede.',
        ],
      },
      {
        id: 'w5-t6',
        number: 6,
        title: 'Pensar com a IA',
        paragraphs: [
          'Podemos usar IA para ter ideias, compreender um tema ou melhorar um trabalho.',
          'Mas devemos continuar a: pensar; verificar; escolher; corrigir; criar.',
          'Se a IA fizer todo o trabalho, podemos acabar com um trabalho que nem sequer compreendemos.',
          'Usar IA bem significa pensar com ela, não deixar que ela pense por nós.',
        ],
      },
    ],
    simulators: [
      {
        id: 'sim-hallucination',
        name: 'Hallucination Simulator',
        description: 'Deteta dados falsos e referências inventadas numa resposta que parece escrita por um perito.',
        xpReward: 100,
      },
      {
        id: 'sim-recommendation',
        name: 'Recommendation Simulator',
        description: 'Observa como os algoritmos usam o teu histórico para sugerir vídeos e aprende a escapar à "bolha".',
        xpReward: 100,
      },
      {
        id: 'sim-prompt',
        name: 'Prompt Simulator',
        description: 'Experimenta prompts vagos versus prompts detalhados com contexto e compara os resultados obtidos.',
        xpReward: 100,
      },
      {
        id: 'sim-ai-responsibility',
        name: 'AI Responsibility',
        description: 'Testa a partilha segura de ficheiros e perguntas, filtrando dados confidenciais e privados.',
        xpReward: 100,
      },
    ],
    challenge: {
      id: 'ch-detetive-ia',
      title: 'DETETIVE DA IA',
      description: 'O aluno recebe uma resposta produzida por IA e procura informação estranha, afirmações sem prova, possíveis erros e dados a confirmar.',
      xpReward: 100,
    },
    mission: {
      id: 'mis-audita-assistente',
      title: 'AUDITA UM ASSISTENTE DE IA',
      description: 'O aluno analisa uma resposta de IA e identifica o que parece correto, o que precisa de confirmação, que dados não deveria partilhar e como melhorar o prompt.',
      instructions: [
        'Lê a resposta do assistente sobre a história de Portugal.',
        'Identifica pelo menos 2 afirmações corretas e 1 alucinação (erro histórico factual).',
        'Escreve uma versão melhorada do prompt para obter informação mais rigorosa.',
      ],
      xpReward: 100,
    },
  },
];

// The 5 Final Assessments - Exactly 8 questions each (40 questions total)
// Correct answers and explanations are stored ONLY here on the server!
export const FINAL_ASSESSMENTS: Record<number, { id: string; worldId: number; title: string; questions: QuestionCatalogItem[] }> = {
  1: {
    id: 'assessment-world-1',
    worldId: 1,
    title: 'Avaliação Final — Guardião Digital',
    questions: [
      {
        id: 'w1-q1',
        text: 'Qual das seguintes palavras-passe é considerada a mais segura para proteger a tua conta escolar?',
        options: [
          'Alex2012',
          '12345678',
          'G@to_Verde#89!',
          'minhapalavrapasse',
        ],
        correctIndex: 2,
        explanation: 'Uma palavra-passe forte mistura letras maiúsculas e minúsculas, números e símbolos especiais, sem incluir o teu nome ou datas óbvias.',
      },
      {
        id: 'w1-q2',
        text: 'Recebeste uma mensagem no telemóvel a dizer que ganhaste um telemóvel topo de gama e tens de clicar num link imediato. O que deves fazer?',
        options: [
          'Clicar rapidamente para não perder o prémio.',
          'Desconfiar, não clicar no link e mostrar a mensagem a um adulto de confiança.',
          'Reencaminhar a mensagem para todos os teus colegas de turma.',
          'Colocar a tua palavra-passe na página para confirmar a entrega.',
        ],
        correctIndex: 1,
        explanation: 'Mensagens que prometem prémios fabulosos e pedem pressa são a forma mais comum de phishing para roubar contas ou infetar dispositivos.',
      },
      {
        id: 'w1-q3',
        text: 'Qual dos seguintes elementos constitui um dado pessoal sensível que não deves divulgar publicamente na Internet?',
        options: [
          'O teu animal preferido.',
          'A cor do teu estojo escolar.',
          'A tua morada de casa e número de telemóvel.',
          'Um desenho que fizeste no Paint.',
        ],
        correctIndex: 2,
        explanation: 'A tua morada, telefone, escola e fotografias da tua casa são dados pessoais que põem em causa a tua privacidade e segurança física.',
      },
      {
        id: 'w1-q4',
        text: 'O que representa a nossa "pegada digital"?',
        options: [
          'A marca dos nossos dedos no ecrã tátil do computador.',
          'O conjunto de registos, publicações, fotografias e comentários que deixamos na Internet ao longo do tempo.',
          'O número de passos que damos enquanto jogamos online.',
          'A velocidade a que descarregamos um ficheiro.',
        ],
        correctIndex: 1,
        explanation: 'Tudo o que publicamos ou pesquisamos fica associado à nossa identidade digital e pode ser visto no futuro por muitas outras pessoas.',
      },
      {
        id: 'w1-q5',
        text: 'Um colega pede-te a palavra-passe da tua conta de email para te ajudar a entregar um trabalho da escola. Como deves responder?',
        options: [
          'Dar a palavra-passe, desde que ele prometa que a apaga a seguir.',
          'Explicar-lhe educadamente que a palavra-passe é estritamente pessoal e pedir antes ajuda ao professor.',
          'Publicar a palavra-passe no chat do grupo para ser mais fácil.',
          'Mudar a palavra-passe para 1234 para ele memorizar facilmente.',
        ],
        correctIndex: 1,
        explanation: 'As palavras-passe nunca devem ser partilhadas com amigos nem colegas, porque perdes o controlo sobre quem acede aos teus dados.',
      },
      {
        id: 'w1-q6',
        text: 'Em relação ao bem-estar digital, qual é a atitude mais equilibrada?',
        options: [
          'Estar sempre com o telemóvel ligado até adormecer na cama.',
          'Fazer pausas regulares de 20 minutos, mexer o corpo e dormir tempo suficiente sem ecrãs.',
          'Jogar durante 8 horas seguidas se for fim de semana.',
          'Ignorar as dores nos olhos e nas costas se o jogo for divertido.',
        ],
        correctIndex: 1,
        explanation: 'A tecnologia é fantástica, mas o descanso, sono de qualidade e atividade física são essenciais para o teu crescimento e saúde.',
      },
      {
        id: 'w1-q7',
        text: 'Se vires um comentário maldoso ou bullying num grupo online da turma, qual é a atitude correta de um Guardião Digital?',
        options: [
          'Juntar-te aos insultos para não seres posto de lado.',
          'Partilhar o comentário com mais pessoas fora da escola.',
          'Não alimentar os insultos, apoiar quem está a sofrer e avisar um professor ou adulto de confiança.',
          'Apagar todas as mensagens para ninguém descobrir.',
        ],
        correctIndex: 2,
        explanation: 'Um Guardião Digital apoia os colegas e corta a corrente de assédio online pedindo apoio aos adultos responsáveis.',
      },
      {
        id: 'w1-q8',
        text: 'A regra fundamental do Guardião Digital é:',
        options: [
          'Clicar em tudo primeiro e pensar depois.',
          'Parar, pensar e proteger antes de qualquer ação online.',
          'Nunca usar tecnologia em circunstância alguma.',
          'Apenas navegar com uma conta partilhada com 5 amigos.',
        ],
        correctIndex: 1,
        explanation: '"Parar, pensar e proteger" é a melhor estratégia para evitar enganos, fraudes e partilhas inadequadas na rede.',
      },
    ],
  },
  2: {
    id: 'assessment-world-2',
    worldId: 2,
    title: 'Avaliação Final — Detetive Digital',
    questions: [
      {
        id: 'w2-q1',
        text: 'Qual das seguintes pesquisas no motor de busca permite obter resultados mais precisos sobre o Lince-ibérico?',
        options: [
          'animais',
          'animais portugueses',
          'conservação do lince-ibérico em Portugal projetos',
          'gatos selvagens giros',
        ],
        correctIndex: 2,
        explanation: 'Usar palavras-chave específicas e termos contextuais permite ao motor de busca filtrar artigos rigorosos em vez de páginas genéricas.',
      },
      {
        id: 'w2-q2',
        text: 'Encontraste uma notícia na internet sobre um suposto terramoto recente, mas a página não indica o autor nem a organização responsável. O que deves fazer?',
        options: [
          'Partilhar imediatamente com os teus pais para os avisar.',
          'Desconfiar e verificar se fontes jornalísticas ou o Instituto de Meteorologia confirmam o facto.',
          'Acreditar a 100%, porque tudo o que está na Internet é verificado.',
          'Copiar o texto para um trabalho de TIC sem referir a página.',
        ],
        correctIndex: 1,
        explanation: 'Páginas sem autor conhecido ou sem entidade credível exigem verificação imediata em outras fontes independentes.',
      },
      {
        id: 'w2-q3',
        text: 'Porque é que verificar a data de uma notícia ou artigo de pesquisa é tão importante?',
        options: [
          'Porque os computadores não conseguem ler textos antigos.',
          'Porque a informação pode ter ficado desatualizada e já não refletir a realidade atual.',
          'Porque as notícias de sexta-feira são sempre falsas.',
          'Porque só as notícias publicadas hoje têm direitos de autor.',
        ],
        correctIndex: 1,
        explanation: 'Acontecimentos científicos, leis e notícias evoluem com o tempo. Uma notícia antiga usada fora do seu momento pode gerar desinformação.',
      },
      {
        id: 'w2-q4',
        text: 'O que significa a técnica de "comparar fontes"?',
        options: [
          'Mudar o tipo de letra do documento Word entre Arial e Times New Roman.',
          'Consultar dois ou três sites independentes e credíveis para confirmar se os factos apresentados coincidem.',
          'Copiar textos de sites diferentes e juntá-los sem ler.',
          'Contar quantas palavras cada site tem.',
        ],
        correctIndex: 1,
        explanation: 'Cruzar dados entre múltiplos órgãos reconhecidos é a regra de ouro do jornalismo e da investigação escolar.',
      },
      {
        id: 'w2-q5',
        text: 'O que é um "título clickbait" (isco de cliques)?',
        options: [
          'Um título informativo com resumo dos factos.',
          'Um título exagerado ou sensacionalista desenhado para atrair cliques com curiosidade ou choque artificial.',
          'O nome de um peixe encontrado no oceano.',
          'Um endereço de correio eletrónico seguro.',
        ],
        correctIndex: 1,
        explanation: 'Clickbaits usam exclamações, mistério exagerado e meias-verdades para ganhar cliques e publicidade.',
      },
      {
        id: 'w2-q6',
        text: 'Uma fotografia partilhada na Internet pode ser autêntica e, ainda assim, enganadora. Como é que isso pode acontecer?',
        options: [
          'Porque as máquinas fotográficas mudam a cor dos acontecimentos.',
          'Porque pode ser uma foto real de há 10 anos noutro país a ser apresentada como se tivesse ocorrido ontem na tua cidade.',
          'Porque a luz solar distorce a verdade.',
          'Porque todas as fotos online são geradas por robôs.',
        ],
        correctIndex: 1,
        explanation: 'Descontextualizar imagens antigas e atribuir-lhes novos acontecimentos falsos é uma das formas mais frequentes de desinformação.',
      },
      {
        id: 'w2-q7',
        text: 'Qual é a diferença entre um "facto" e uma "opinião" num artigo?',
        options: [
          'Um facto é algo verificável e demonstrável; uma opinião reflete a perspetiva ou sentimento pessoal de alguém.',
          'Os factos são sempre longos e as opiniões são curtas.',
          'Não há diferença; tudo na internet é facto.',
          'As opiniões só existem na televisão.',
        ],
        correctIndex: 0,
        explanation: 'Reconhecer a diferença entre declarações baseadas em provas factuais e pontos de vista pessoais é crucial para o pensamento crítico.',
      },
      {
        id: 'w2-q8',
        text: 'A ordem correta de atitude de um Detetive Digital antes de partilhar uma notícia é:',
        options: [
          'Partilhar logo para ser o primeiro → Ler depois se houver tempo.',
          'Para → Verifica → Compara → Só depois decide se partilha.',
          'Acreditar se tiver muitos "gostos" → Comentar ofensivamente.',
          'Enviar a um influenciador digital famoso.',
        ],
        correctIndex: 1,
        explanation: 'Parar, verificar o autor/data, comparar fontes e agir com responsabilidade protege toda a comunidade escolar de boatos.',
      },
    ],
  },
  3: {
    id: 'assessment-world-3',
    worldId: 3,
    title: 'Avaliação Final — Criador Digital',
    questions: [
      {
        id: 'w3-q1',
        text: 'Quando escrevemos uma mensagem num grupo da turma toda em LETRAS MAIÚSCULAS, o que é que isso normalmente transmite na netiqueta?',
        options: [
          'Que estamos a falar calmamente e com respeito.',
          'Que estamos a gritar ou a ser agressivos.',
          'Que a mensagem é oficial do Ministério da Educação.',
          'Que o teclado tem pouca bateria.',
        ],
        correctIndex: 1,
        explanation: 'Na comunicação digital, escrever em MAIÚSCULAS é equivalente a gritar com o interlocutor.',
      },
      {
        id: 'w3-q2',
        text: 'O que deves perguntar a ti próprio antes de enviar uma mensagem ou comentário para um colega online?',
        options: [
          '"Quantos gostos vou receber com isto?"',
          '"Eu diria isto pessoalmente, cara a cara, a esta pessoa?"',
          '"Será que o meu professor vai demorar mais de uma hora a ler?"',
          '"Consigo enviar isto 50 vezes seguidas?"',
        ],
        correctIndex: 1,
        explanation: 'Do outro lado do ecrã está uma pessoa real com sentimentos. Se não o dirias cara a cara com respeito, não deves escrever online.',
      },
      {
        id: 'w3-q3',
        text: 'Encontraste uma fotografia bonita na pesquisa do Google Imagens para a capa do teu trabalho de TIC. Podes copiá-la e dizer que foste tu que a tiraste?',
        options: [
          'Sim, porque se está no Google é de toda a gente.',
          'Não, isso é plágio e desrespeita os direitos de autor do criador.',
          'Sim, desde que a foto tenha mais de 3 cores.',
          'Sim, mas apenas se a entregares em papel impresso.',
        ],
        correctIndex: 1,
        explanation: 'Apresentar criações de outrem como sendo nossas é plágio. Devemos respeitar a propriedade intelectual e dar crédito.',
      },
      {
        id: 'w3-q4',
        text: 'O que indicam as licenças "Creative Commons" (CC) num conteúdo?',
        options: [
          'Que o ficheiro está infetado com vírus informático.',
          'As condições autorizadas pelo autor para partilhar, usar ou modificar a sua obra com respeito pela atribuição.',
          'Que o conteúdo é proibido para menores de 18 anos.',
          'Que a obra pertence exclusivamente à NASA.',
        ],
        correctIndex: 1,
        explanation: 'As licenças Creative Commons facilitam a partilha legal de obras, indicando expressamente como o autor permite que a sua criação seja aproveitada.',
      },
      {
        id: 'w3-q5',
        text: 'Num trabalho de grupo online, qual destas atitudes demonstra espírito colaborativo eficaz?',
        options: [
          'Fazer tudo sozinho e apagar o texto dos colegas sem lhes dizer nada.',
          'Dividir tarefas com prazos combinados, escutar opiniões diferentes e valorizar o contributo de todos.',
          'Não fazer nada e esperar que o líder do grupo resolva tudo.',
          'Mudar a palavra-passe do documento partilhado para ninguém mexer.',
        ],
        correctIndex: 1,
        explanation: 'A colaboração baseia-se na partilha equilibrada, comunicação constante e respeito mútuo pelo esforço de cada elemento.',
      },
      {
        id: 'w3-q6',
        text: 'Se precisares de citar um parágrafo de um livro ou site no teu trabalho escolar, como deves proceder?',
        options: [
          'Colocar o texto entre aspas e indicar claramente o autor, a fonte e a data.',
          'Copiar o texto e fingir que as ideias foram tuas.',
          'Trocar apenas duas palavras para não dar nas vistas.',
          'Pedir à IA para dizer que o texto foi inventado por ti.',
        ],
        correctIndex: 0,
        explanation: 'Fazer uma citação correta com identificação da fonte demonstra rigor intelectual e honestidade académica.',
      },
      {
        id: 'w3-q7',
        text: 'Qual é a vantagem de criar um avatar personalizado (desenho/robô) em vez de usar uma fotografia real do teu rosto nas plataformas abertas?',
        options: [
          'Fica mais feio do que a realidade.',
          'Protege a tua identidade e privacidade pessoal enquanto te permite exprimir criatividade.',
          'Gasta menos eletricidade no monitor.',
          'Permite enganar os professores na atribuição de notas.',
        ],
        correctIndex: 1,
        explanation: 'Avatares ilustrados mantêm a tua identidade protegida em plataformas digitais públicas sem expor a tua imagem real a estranhos.',
      },
      {
        id: 'w3-q8',
        text: 'O que significa o símbolo de licença "BY" numa obra Creative Commons?',
        options: [
          'Proibido ver em Portugal.',
          'Atribuição: é obrigatório dar o devido crédito ao autor original da obra.',
          'Apenas para uso em computadores antigos.',
          'Pode ser vendida por qualquer valor.',
        ],
        correctIndex: 1,
        explanation: 'A sigla BY (Attribution) exige que se reconheça o autor original da fotografia, texto ou recurso multimédia.',
      },
    ],
  },
  4: {
    id: 'assessment-world-4',
    worldId: 4,
    title: 'Avaliação Final — Engenheiro Digital',
    questions: [
      {
        id: 'w4-q1',
        text: 'O que é um algoritmo na ciência da computação e nas TIC?',
        options: [
          'Um vírus perigoso que estraga o computador.',
          'Uma sequência ordenada de instruções claras para resolver um problema ou realizar uma tarefa.',
          'O nome da pessoa que inventou a Internet.',
          'Um monitor de alta resolução com ecrã tátil.',
        ],
        correctIndex: 1,
        explanation: 'Um algoritmo é como uma receita detalhada: contém passos sequenciais que, seguidos à risca, alcançam o resultado pretendido.',
      },
      {
        id: 'w4-q2',
        text: 'Quando enfrentamos um problema complexo, qual é o primeiro princípio do Pensamento Computacional a aplicar?',
        options: [
          'Desistir logo porque é demasiado difícil.',
          'Dividir o problema grande em partes mais pequenas e fáceis de resolver (decomposição).',
          'Comprar um computador novo com mais memória.',
          'Executar comandos aleatórios até funcionar.',
        ],
        correctIndex: 1,
        explanation: 'A decomposição permite repartir uma tarefa complexa em etapas simples e gerenciáveis.',
      },
      {
        id: 'w4-q3',
        text: 'Observa a instrução: "SE o semáforo estiver verde → Atravessar a rua; SENÃO → Esperar no passeio". Isto é um exemplo de:',
        options: [
          'Uma estrutura condicional de decisão.',
          'Um erro grave de programação.',
          'Um ciclo infinito sem saída.',
          'Uma base de dados relacional.',
        ],
        correctIndex: 0,
        explanation: 'As estruturas condicionais (SE / SENÃO) permitem aos algoritmos e robôs tomarem decisões diferentes com base na situação.',
      },
      {
        id: 'w4-q4',
        text: 'Em vez de escrever: "Avançar; Avançar; Avançar; Avançar; Avançar", qual é a forma algorítmica mais eficiente?',
        options: [
          'Avançar 0 vezes.',
          'Repetir 5 vezes: Avançar (usar um ciclo de repetição).',
          'Saltar para o fim do ecrã sem avançar.',
          'Escrever tudo em maiúsculas.',
        ],
        correctIndex: 1,
        explanation: 'Os ciclos (loops) simplificam o código, evitam repetições desnecessárias e reduzem erros no algoritmo.',
      },
      {
        id: 'w4-q5',
        text: 'Porque é que a ordem das instruções num algoritmo é de máxima importância?',
        options: [
          'Porque se colocares a pasta na boca antes de abrir o tubo de pasta, a escovagem não funciona.',
          'A ordem nunca tem importância nos computadores.',
          'Porque os computadores leem tudo de baixo para cima.',
          'Porque o teclado avaria se mudares os passos.',
        ],
        correctIndex: 0,
        explanation: 'Os computadores executam as ordens exatamente pela sequência prescrita. Uma troca na ordem gera resultados incorretos ou falhas lógicas.',
      },
      {
        id: 'w4-q6',
        text: 'Uma tabela com as pontuações de 20 alunos de uma turma numa prova contém dados. O que podemos fazer para retirar conclusões mais fáceis?',
        options: [
          'Apagar todos os números para não ocupar espaço.',
          'Calcular a média da turma, ordenar os valores do maior para o menor e gerar um gráfico visual.',
          'Mudar o nome da escola.',
          'Guardar a tabela numa pasta escondida.',
        ],
        correctIndex: 1,
        explanation: 'Organizar, tratar e visualizar dados em gráficos permite identificar padrões, sucessos e áreas que precisam de reforço de aprendizagem.',
      },
      {
        id: 'w4-q7',
        text: 'Num ambiente de blocos de programação (como o Scratch), o que representa um bloco "SE ... ENTÃO"?',
        options: [
          'Uma pausa para almoço do robô.',
          'Uma verificação lógica: só se a condição for verdadeira é que os blocos interiores são executados.',
          'Um comando que desliga o monitor.',
          'A velocidade com que a música toca.',
        ],
        correctIndex: 1,
        explanation: 'O bloco condicional testa se um acontecimento ocorreu (ex.: tocou na borda?) para disparar uma resposta programada.',
      },
      {
        id: 'w4-q8',
        text: 'O que significa "depurar" (fazer debugging) num programa ou algoritmo?',
        options: [
          'Limpar o pó do rato e do tapete com um pano.',
          'Encontrar onde está o erro lógico na sequência de passos e corrigi-lo para que o programa funcione bem.',
          'Comprar uma licença cara de software.',
          'Pedir a outra pessoa para fazer o trabalho todo.',
        ],
        correctIndex: 1,
        explanation: 'Depurar é a arte do programador de testar, encontrar falhas e ajustar as instruções até a solução funcionar na perfeição.',
      },
    ],
  },
  5: {
    id: 'assessment-world-5',
    worldId: 5,
    title: 'Avaliação Final — Explorador da IA',
    questions: [
      {
        id: 'w5-q1',
        text: 'O que é a Inteligência Artificial (IA) em termos simples?',
        options: [
          'Um robô de metal com sentimentos humanos e consciência própria.',
          'Uma tecnologia de software capaz de realizar tarefas computacionais que parecem exigir raciocínio humano, como reconhecer padrões ou gerar textos.',
          'Uma entidade extraterrestre com superpoderes.',
          'Uma simples calculadora que apenas soma dois números.',
        ],
        correctIndex: 1,
        explanation: 'A IA é uma ferramenta informática avançada criada por pessoas para processar grandes volumes de dados e resolver problemas concretos.',
      },
      {
        id: 'w5-q2',
        text: 'O que é um "prompt" numa aplicação de IA generativa?',
        options: [
          'O botão de desligar a corrente da tomada.',
          'A instrução ou pergunta em linguagem natural que fornecemos ao modelo para obter a resposta desejada.',
          'Um erro que faz o computador apagar todos os ficheiros.',
          'A velocidade de ligação da fibra ótica à Internet.',
        ],
        correctIndex: 1,
        explanation: 'O prompt é a mensagem através da qual guiamos o assistente inteligente com contexto, objetivos e especificações.',
      },
      {
        id: 'w5-q3',
        text: 'Qual destes dois prompts produzirá um resultado de melhor qualidade para um trabalho sobre a água no 6.º ano?',
        options: [
          'Prompt A: "Água."',
          'Prompt B: "Explica a importância da água para os seres vivos, destacando 3 medidas de poupança no dia a dia, numa linguagem clara para alunos do 6.º ano com cerca de 150 palavras."',
          'Prompt C: "Escreve qualquer coisa aí."',
          'Prompt D: "Faz o meu trabalho todo sem eu ler."',
        ],
        correctIndex: 1,
        explanation: 'Prompts com contexto, público-alvo, estrutura definida e limites claros evitam respostas vagas e produzem conteúdos pertinentes.',
      },
      {
        id: 'w5-q4',
        text: 'O que é uma "alucinação" quando falamos de modelos de linguagem de Inteligência Artificial?',
        options: [
          'Quando o monitor do computador começa a piscar em azul e amarelo.',
          'Quando a IA inventa dados, datas, fontes ou factos falsos com um tom convincente como se fossem verdadeiros.',
          'Quando o robô fica com sono por falta de bateria.',
          'Quando a aplicação descarrega um jogo sem autorização.',
        ],
        correctIndex: 1,
        explanation: 'Os modelos de IA geram texto prevendo palavras prováveis. Podem formular declarações erradas com total confiança.',
      },
      {
        id: 'w5-q5',
        text: 'Que tipo de informação NUNCA deves introduzir num assistente público de Inteligência Artificial?',
        options: [
          'Uma pergunta sobre a digestão humana ou sobre as capitais da Europa.',
          'Passwords pessoais, nomes completos com morada de residência e números de telefone da tua família.',
          'Um poema que queiras melhorar para o dia da mãe.',
          'Uma lista de ideias para uma peça de teatro escolar.',
        ],
        correctIndex: 1,
        explanation: 'Dados privados e credenciais nunca devem ser submetidos em ferramentas de IA, pois esses dados podem ser registados e expostos.',
      },
      {
        id: 'w5-q6',
        text: 'Porque é que não deves entregar um trabalho escolar gerado a 100% por IA sem o leres nem o verificares?',
        options: [
          'Porque podes estar a entregar erros graves inventados pela ferramenta e não desenvolves o teu próprio conhecimento crítico.',
          'Porque a tinta da impressora fica amarela.',
          'Porque o computador sabe sempre mais do que todos os professores do mundo.',
          'Porque as frases da IA só funcionam durante 24 horas.',
        ],
        correctIndex: 0,
        explanation: 'A IA é um assistente para te inspirar. O pensamento, a seleção crítica e a aprendizagem genuína têm de ser feitos por ti.',
      },
      {
        id: 'w5-q7',
        text: 'Como funcionam os algoritmos de recomendação em plataformas de vídeos online (como o YouTube ou TikTok)?',
        options: [
          'Escolhem os vídeos por sorteio aleatório todas as manhãs.',
          'Analisam os vídeos que viste até ao fim, os teus cliques e o tempo que passas para recomendar conteúdos semelhantes e prender a tua atenção.',
          'Apenas mostram vídeos aprovados pela direção da tua escola.',
          'Mostram os mesmos três vídeos a todas as crianças do planeta.',
        ],
        correctIndex: 1,
        explanation: 'Os motores de recomendação usam algoritmos preditivos baseados no teu comportamento passado para manter os utilizadores na plataforma.',
      },
      {
        id: 'w5-q8',
        text: 'Qual é o lema central do Explorador da IA responsável?',
        options: [
          '"Deixar a máquina pensar por mim."',
          '"Usar a IA como parceira de trabalho, pensando com ela e verificando sempre o que ela produz."',
          '"Acreditar cegamente no primeiro resultado."',
          '"Nunca usar nenhum tipo de computador."',
        ],
        correctIndex: 1,
        explanation: '"Pensar com a IA, não deixar que ela pense por nós" é a chave para o futuro digital e cidadania consciente.',
      },
    ],
  },
};

// Grande Missão: A ESCOLA DO FUTURO (5 stages, 150 XP)
export const GRANDE_MISSAO = {
  id: 'grande-missao-escola-futuro',
  title: 'A ESCOLA DO FUTURO',
  totalXp: 150,
  narrativa: 'A tua escola foi selecionada para criar o Projeto Tecnológico Piloto do Futuro. Em 5 etapas decisivas, irás arquitetar as regras de segurança, os sistemas de pesquisa, o código de netiqueta, os algoritmos do refeitório e a auditoria do tutor de IA da escola!',
  stages: [
    {
      step: 1,
      domain: 'Mundo 1',
      title: 'Etapa 1 — Segurança e Privacidade',
      scenario: 'A escola vai disponibilizar computadores e redes Wi-Fi a todos os alunos. Como proteger os acessos e a privacidade dos estudantes?',
      task: 'Define os 3 pilares da política de palavras-passe e acesso seguro das contas dos alunos.',
      options: [
        'Contas partilhadas com password fácil e memorizável por todos.',
        'Contas individuais únicas com palavras-passe robustas (mínimo 10 carateres) e autenticação segura.',
        'Deixar os computadores sempre ligados sem palavra-passe para poupar tempo.',
      ],
      correctOption: 1,
      feedback: 'Contas individuais e senhas fortes garantem que a pegada e privacidade de cada estudante permanecem protegidas.',
    },
    {
      step: 2,
      domain: 'Mundo 2',
      title: 'Etapa 2 — Pesquisa e Desinformação',
      scenario: 'Na biblioteca digital, os alunos precisam de pesquisar fontes fiáveis para os trabalhos da disciplina de Ciências e História.',
      task: 'Qual a metodologia oficial que a escola deve ensinar aos alunos antes de aceitarem uma notícia?',
      options: [
        'Acreditar no primeiro link que aparecer no topo dos resultados.',
        'Aplicar o Kit do Detetive: verificar quem escreveu, a data, a fonte oficial e comparar com outros meios fiáveis.',
        'Usar apenas imagens das redes sociais sem verificar o texto.',
      ],
      correctOption: 1,
      feedback: 'Excelente! Investigar a autoria, a data e comparar fontes impede a propagação de boatos na escola.',
    },
    {
      step: 3,
      domain: 'Mundo 3',
      title: 'Etapa 3 — Comunicação e Netiqueta',
      scenario: 'Os grupos de trabalho colaborativo usam murais digitais e chats escolares para planear projetos em equipa.',
      task: 'Qual o compromisso ético indispensável para a convivência saudável na comunidade escolar online?',
      options: [
        'Proibido discordar do colega de equipa.',
        'Tratar todos com respeito, não usar palavras agressivas ou maiúsculas contínuas e creditar sempre os autores dos materiais.',
        'Partilhar prints privados das conversas de equipa noutras redes.',
      ],
      correctOption: 1,
      feedback: 'A empatia, netiqueta e respeito pela autoria formam o alicerce de uma equipa vencedora.',
    },
    {
      step: 4,
      domain: 'Mundo 4',
      title: 'Etapa 4 — Algoritmos e Automação',
      scenario: 'O refeitório da escola quer reduzir as filas e o desperdício de comida criando um algoritmo automático de reserva.',
      task: 'Qual a lógica algorítmica correta para o sistema gerir o stock de refeições?',
      options: [
        'SE o aluno confirmar reserva até às 10h → Adicionar refeição ao tabuleiro; SENÃO → Oferecer opção de snack de contingência.',
        'Cozinhar o triplo da comida e deitar fora o que sobrar ao final da tarde.',
        'Sortear 10 alunos por dia para terem direito a almoço.',
      ],
      correctOption: 0,
      feedback: 'Uma estrutura condicional precisa (SE ... SENÃO) poupa recursos, tempo e garante almoço para todos de forma sustentável.',
    },
    {
      step: 5,
      domain: 'Mundo 5',
      title: 'Etapa 5 — Auditoria de um Assistente de IA',
      scenario: 'A escola quer instalar um Assistente de IA para tirar dúvidas aos estudantes do 6.º ano. Como garantir uma utilização responsável?',
      task: 'Qual a diretriz obrigatória que todos os alunos e professores devem seguir?',
      options: [
        'Deixar que o robô faça os testes e trabalhos pelos alunos.',
        'Usar a IA como orientador de ideias, verificando sempre os factos e nunca fornecendo palavras-passe ou dados privados de colegas.',
        'Desligar todos os computadores da escola e proibir a palavra tecnologia.',
      ],
      correctOption: 1,
      feedback: 'Brilhante! A IA é uma ferramenta para apoiar a nossa curiosidade, mantendo sempre a integridade e privacidade no centro.',
    },
  ],
};

// Weekly challenge data
export const WEEKLY_CHALLENGE = {
  id: 'challenge-phishing-message',
  title: 'Consegues descobrir se esta mensagem é phishing?',
  context: 'Recebeste uma SMS urgente com o seguinte conteúdo:',
  messageSample: 'ALERTA ESCOLAR URGENTE: O teu computador portátil escolar foi bloqueado por infração. Clica em http://bit.ly/escola-recupera-login-99 agora ou a tua matrícula será cancelada em 15 minutos!',
  problem: 'A mensagem usa sinais clássicos de engenharia social para assustar o aluno.',
  task: 'Identifica os sinais suspeitos e toma a decisão correta.',
  options: [
    {
      text: 'É fidedigna: como refere a escola e tem urgência, devo clicar já no link antes dos 15 minutos.',
      isCorrect: false,
      explanation: 'Incorreto! A urgência e a ameaça extrema de cancelamento de matrícula são táticas de intimidação para te impedir de pensar criticamente.',
    },
    {
      text: 'É phishing: usa ameaças de tempo limitado, um link encurtado estranho e pede dados de acesso escolar.',
      isCorrect: true,
      explanation: 'Correto! A escola nunca envia SMS com links estranhos a ameaçar cancelamento em 15 minutos. Deves apagar e avisar o professor.',
    },
    {
      text: 'É segura desde que o endereço comece com http.',
      isCorrect: false,
      explanation: 'Incorreto! Links HTTP simples nem sequer são encriptados, e qualquer pessoa pode criar páginas falsas nesse formato.',
    },
  ],
  xpReward: 50,
};
