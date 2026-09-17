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
        'Mas, tal como no mundo real, também existem situações em que precisamos de ter cuidado.',
        'Neste Mundo vais aprender a proteger as tuas contas, os teus dados e a tua privacidade. Vais descobrir como reconhecer tentativas de engano, pensar antes de partilhar informação e utilizar a tecnologia de forma equilibrada.',
      ],
      mission: 'A tua missão: parar, pensar e proteger.',
    },
    topics: [
      {
        id: 'w1-t1',
        number: 1,
        title: 'Palavras-passe',
        paragraphs: [
          'Uma palavra-passe protege o acesso a uma conta. Por isso, deve ser difícil de adivinhar e não deve ser partilhada com outras pessoas.',
          'Evita utilizar o teu nome, a tua data de nascimento, o nome do teu animal de estimação ou outras informações que alguém possa descobrir facilmente.',
          'Sempre que possível, utiliza palavras-passe diferentes em contas diferentes. Assim, se uma palavra-passe for descoberta, as restantes contas continuam mais protegidas.',
          'Uma palavra-passe segura deve ser suficientemente longa e pode combinar letras, números e símbolos.',
          'Nunca partilhes a tua palavra-passe com amigos ou colegas. Se precisares de ajuda para proteger uma conta, fala com um adulto de confiança.',
          'Lembra-te: uma palavra-passe é pessoal. Mantém-na secreta.',
        ],
        takeaway: 'Lembra-te: uma palavra-passe é pessoal, deve ser difícil de adivinhar e nunca deve ser partilhada.',
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
          'A tecnologia faz parte do nosso dia a dia: usamos computadores, telemóveis, tablets e consolas para aprender, comunicar e divertir-nos.',
          'Mas também precisamos de tempo para descansar, dormir, mexer o corpo, estar com outras pessoas e fazer atividades sem ecrãs.',
          'Se estiveres há muito tempo num ecrã, faz uma pausa. Se estiveres cansado, irritado ou preocupado com alguma situação online, fala com um adulto de confiança.',
          'Usar tecnologia de forma saudável não significa deixar de a utilizar. Significa aprender a encontrar um equilíbrio.',
          'Lembra-te: pausa, descansa, mexe-te e reserva algum tempo para estar sem ecrãs.',
        ],
        takeaway: 'Lembra-te: pausa, descansa, mexe-te e reserva algum tempo para estar sem ecrãs.',
      },
    ],
    simulators: [
      {
        id: 'sim-password',
        name: 'Laboratório de Palavras-Passe',
        description: 'Experimenta criar uma palavra-passe de teste e descobre quais características ajudam a torná-la mais difícil de adivinhar.',
        xpReward: 100,
      },
      {
        id: 'sim-phishing',
        name: 'Laboratório de Phishing',
        description: 'Analisa mensagens e emails suspeitos, identificando sinais de alerta e descobre se são tentativas de phishing ou comunicações legítimas.',
        xpReward: 100,
      },
      {
        id: 'sim-privacy',
        name: 'Laboratório de Privacidade',
        description: 'Analisa diferentes informações e decide se faz sentido partilhá-las publicamente ou se deves protegê-las.',
        xpReward: 100,
      },
      {
        id: 'sim-digital-footprint',
        name: 'Simulador de Pegada Digital',
        description: 'Analisa situações do dia a dia e pensa no que cada ação pode deixar registado na tua pegada digital.',
        xpReward: 100,
      },
      {
        id: 'sim-digital-wellbeing',
        name: 'Simulador de Bem-estar Digital',
        description: 'Avalia hábitos diários de tempo de ecrã e constrói um equilíbrio digital saudável.',
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
        '1. Pensa em situações reais em que utilizas a Internet: escola, jogos, mensagens, vídeos ou redes sociais.',
        '2. Cria 5 regras claras que possas realmente aplicar no teu dia a dia.',
        '3. As tuas regras devem proteger contas, dados pessoais, privacidade ou bem-estar digital.',
        '4. Explica brevemente porque cada regra é importante.',
        '5. Revê o teu guia antes de o entregar: as regras são claras, práticas e fáceis de seguir?',
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
        'Na Internet encontramos milhões de páginas, mas nem toda a informação merece a mesma confiança.',
        'Neste Mundo vais aprender a pesquisar melhor, descobrir quem criou uma informação, verificar a data, comparar fontes e pensar antes de partilhar.',
      ],
      mission: 'A tua missão: investigar antes de acreditar.',
    },
    topics: [
      {
        id: 'w2-t1',
        number: 1,
        title: 'Pesquisar melhor',
        paragraphs: [
          'Quando procuramos informação na Internet, nem sempre a primeira pesquisa dá bons resultados.',
          'Uma pesquisa demasiado vaga pode apresentar milhões de páginas que não respondem àquilo que procuramos.',
          'Para encontrar informação mais útil, pensa primeiro no que queres descobrir e escolhe palavras-chave que indiquem claramente o assunto.',
          'Por exemplo, se quiseres saber quais são os animais em perigo de extinção em Portugal, pesquisar apenas “animais” é demasiado vago.',
          'Uma pesquisa como “animais em perigo de extinção em Portugal” é mais específica e ajuda a encontrar resultados mais relacionados com a pergunta.',
          'Não precisas de escrever muitas palavras. Precisas de escolher as palavras certas.',
        ],
        takeaway: 'Antes de pesquisar, pensa: “O que quero realmente descobrir?”',
      },
      {
        id: 'w2-t2',
        number: 2,
        title: 'Quem criou a informação?',
        paragraphs: [
          'Quando encontramos uma informação na Internet, devemos tentar descobrir de onde veio.',
          'Pergunta: Quem escreveu isto?',
          'Procura o nome do autor ou da organização responsável.',
          'Também é importante perceber se essa pessoa ou organização tem conhecimentos relacionados com o assunto.',
          'Mas atenção: ter um autor identificado não significa que tudo o que escreveu esteja automaticamente correto.',
          'O autor é apenas uma das pistas que devemos analisar.',
          'Antes de confiar, procura saber quem criou a informação e verifica se existem outras evidências que a apoiem.',
        ],
        takeaway: 'Saber quem criou a informação é uma pista importante, mas não é a única coisa que devemos verificar.',
      },
      {
        id: 'w2-t3',
        number: 3,
        title: 'Verificar a data',
        paragraphs: [
          'A informação pode mudar com o tempo.',
          'Uma notícia publicada há vários anos pode ter sido verdadeira quando foi escrita, mas já não explicar aquilo que acontece atualmente.',
          'Por isso, quando procuras informação sobre acontecimentos recentes, verifica sempre a data.',
          'Mas não basta olhar para a data.',
          'Pergunta também: “Esta informação continua adequada para aquilo que estou a tentar descobrir?”',
          'Uma notícia antiga pode continuar a ser útil para conhecer um acontecimento histórico, mas pode ser inadequada para explicar uma situação atual.',
          'A data ajuda-nos a perceber o contexto da informação.',
        ],
        takeaway: 'Uma informação pode ser verdadeira e, mesmo assim, estar desatualizada para a pergunta que estás a fazer.',
      },
      {
        id: 'w2-t4',
        number: 4,
        title: 'Comparar fontes',
        paragraphs: [
          'Não precisas de acreditar na primeira página que encontras.',
          'Quando uma informação é importante, procura confirmá-la através de outras fontes.',
          'Compara: quem publicou; quando foi publicado; que evidências apresenta; se outras fontes independentes dizem o mesmo.',
          'Se várias fontes independentes apresentam informação semelhante, isso é uma pista importante.',
          'Mas se todas estiverem simplesmente a copiar a mesma fonte original, não são realmente fontes independentes.',
          'Se encontrares informações diferentes, não escolhas automaticamente a que mais gostas. Investiga mais.',
          'Comparar fontes significa procurar evidências antes de tirar uma conclusão.',
        ],
        takeaway: 'Não compares apenas quantas páginas dizem uma coisa. Compara a qualidade e a independência das fontes.',
      },
      {
        id: 'w2-t5',
        number: 5,
        title: 'Pensar antes de partilhar',
        paragraphs: [
          'Antes de partilhares uma informação, para alguns segundos.',
          'Pergunta: Quem publicou? Quando foi publicada? Existem provas? Outras fontes confirmam?',
          'Uma fotografia pode ser verdadeira e estar a ser apresentada fora do contexto.',
          'Um título pode exagerar aquilo que o texto realmente diz.',
          'Uma opinião pode ser apresentada como se fosse um facto.',
          'E uma publicação com muitos gostos ou partilhas também pode estar errada.',
          'Popularidade não é prova.',
          'A melhor atitude é: Para. Verifica. Compara. Só depois decide se partilhas.',
        ],
        takeaway: 'Antes de partilhar, procura provas — não apenas gostos, partilhas ou títulos chamativos.',
      },
    ],
    simulators: [
      {
        id: 'sim-keywords',
        name: 'Simulador de Pesquisa Inteligente',
        description: 'Experimenta termos vagos vs pesquisas com palavras-chave precisas para encontrar informação relevante.',
        xpReward: 100,
      },
      {
        id: 'sim-author-check',
        name: 'Simulador de Autoria & Origem',
        description: 'Inspeciona a autoria e as referências de diferentes páginas para reconhecer pistas de credibilidade e necessidade de verificação.',
        xpReward: 100,
      },
      {
        id: 'sim-date-verifier',
        name: 'Simulador de Linha Temporal & Data',
        description: 'Analisa o contexto temporal da informação e aprende a avaliar se uma data é adequada à tua pergunta.',
        xpReward: 100,
      },
      {
        id: 'sim-source-compare',
        name: 'Simulador de Comparação de Fontes',
        description: 'Investiga a independência das fontes e compara origens diferentes para confirmar factos com evidências.',
        xpReward: 100,
      },
      {
        id: 'sim-news-detective',
        name: 'DETETIVE DE NOTÍCIAS',
        description: 'Analisa uma informação antes de a partilhar. Procura o autor, verifica a data, procura evidências e compara outras fontes.',
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
        'Cria o teu próprio “Kit do Detetive Digital” com 5 perguntas que deves fazer antes de acreditar ou partilhar uma informação.',
        'Para cada pergunta: 1. escreve a pergunta; 2. explica que pista estás a tentar descobrir; 3. dá um pequeno exemplo de como utilizarias essa pergunta numa publicação online.',
        'O teu kit deve ajudar-te a verificar: quem publicou; quando foi publicado; que evidências existem; se outras fontes confirmam; se a informação está a ser apresentada no contexto correto.',
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
        id: 'sim-comunicacao-digital',
        name: 'Comunicação Digital',
        description: 'Interpreta o tom de várias mensagens e descobre como pequenos ajustes de pontuação evitam conflitos.',
        xpReward: 100,
      },
      {
        id: 'sim-netiqueta',
        name: 'Simulador de Netiqueta',
        description: 'Avalia comportamentos em grupos de conversação escolar e aprende as boas maneiras digitais.',
        xpReward: 100,
      },
      {
        id: 'sim-colaboracao',
        name: 'Simulador de Colaboração & Equipa',
        description: 'Resolve desafios de organização, divisão justa de tarefas e prazos num trabalho de grupo online.',
        xpReward: 100,
      },
      {
        id: 'sim-direitos-autor',
        name: 'Direitos de Autor & Permissões',
        description: 'Verifica condições legais de utilização de imagens, músicas e textos encontrados na Internet.',
        xpReward: 100,
      },
      {
        id: 'sim-plagio-citacao',
        name: 'Simulador de Citação & Reconhecimento',
        description: 'Aprende a referenciar autores, citar fontes originais e evitar o plágio em trabalhos escolares.',
        xpReward: 100,
      },
      {
        id: 'sim-creative-commons',
        name: 'Simulador de Licenças Creative Commons',
        description: 'Associa os símbolos oficiais (BY, NC, ND, SA) às respetivas regras e permissões de partilha.',
        xpReward: 100,
      },
      {
        id: 'sim-avatar-challenge',
        name: 'Avatar Challenge',
        description: 'Cria uma representação digital única sem partilhar fotografias do teu rosto real ou dados pessoais.',
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
        id: 'sim-decomposicao',
        name: 'Simulador de Decomposição',
        description: 'Divide desafios e problemas complexos em sub-tarefas simples e sequenciais de resolução.',
        xpReward: 100,
      },
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
        id: 'sim-ia-concepts',
        name: 'Simulador de Conceitos de IA',
        description: 'Distingue entre programação com regras fixas, algoritmos de IA baseados em dados e capacidades humanas.',
        xpReward: 100,
      },
      {
        id: 'sim-ai-generation',
        name: 'Simulador de IA Generativa & Verificação',
        description: 'Experimenta a criação e análise crítica de conteúdos gerados por modelos de inteligência artificial.',
        xpReward: 100,
      },
      {
        id: 'sim-prompt',
        name: 'Prompt Simulator',
        description: 'Experimenta prompts vagos versus prompts detalhados com contexto e compara os resultados obtidos.',
        xpReward: 100,
      },
      {
        id: 'sim-hallucination',
        name: 'Hallucination Simulator',
        description: 'Deteta dados falsos e referências inventadas numa resposta que parece escrita por um perito.',
        xpReward: 100,
      },
      {
        id: 'sim-ai-responsibility',
        name: 'AI Responsibility',
        description: 'Testa a partilha segura de ficheiros e perguntas, filtrando dados confidenciais e privados.',
        xpReward: 100,
      },
      {
        id: 'sim-recommendation',
        name: 'Recommendation Simulator',
        description: 'Observa como os algoritmos usam o teu histórico para sugerir vídeos e aprende a escapar à "bolha".',
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
        text: 'A Leonor precisa de criar uma palavra-passe para a sua conta escolar. Qual destas opções apresenta a estratégia mais segura?',
        options: [
          'Leonor2014',
          '12345678',
          'futebol2025',
          'Criar uma palavra-passe longa e única, que não inclua o nome, datas ou outras informações fáceis de adivinhar.',
        ],
        correctIndex: 3,
        explanation:
          'Uma palavra-passe deve ser difícil de adivinhar, suficientemente longa e não deve utilizar informações pessoais óbvias. Também é importante evitar reutilizar a mesma palavra-passe noutras contas.',
      },
      {
        id: 'w1-q2',
        text: 'Recebes uma mensagem que diz que ganhaste um prémio e que tens apenas alguns minutos para clicar num link e confirmar os teus dados. O que deves fazer?',
        options: [
          'Não clicar no link, desconfiar da mensagem e pedir ajuda a um adulto de confiança.',
          'Clicar rapidamente para não perder o prémio.',
          'Reencaminhar a mensagem para os teus colegas para saber se eles também receberam.',
          'Introduzir apenas o nome, porque os restantes dados são privados.',
        ],
        correctIndex: 0,
        explanation:
          'Uma mensagem que promete um prémio, cria urgência e pede dados pode ser uma tentativa de phishing. O mais seguro é não clicar e pedir ajuda a um adulto de confiança.',
      },
      {
        id: 'w1-q3',
        text: 'Estás a criar um perfil num novo serviço online. Qual destas informações deves tratar com maior cuidado e evitar publicar?',
        options: [
          'O teu género de música preferido.',
          'A tua morada e o teu número de telefone.',
          'O teu animal favorito.',
          'A tua cor preferida.',
        ],
        correctIndex: 1,
        explanation:
          'A morada e o número de telefone são dados pessoais. Antes de partilhares informações online, pensa se é realmente necessário e se gostarias que qualquer pessoa tivesse acesso a elas.',
      },
      {
        id: 'w1-q4',
        text: 'O Diogo publicou uma fotografia numa rede social há alguns anos. Atualmente já não utiliza essa rede social. Qual afirmação é mais correta?',
        options: [
          'A fotografia desaparece automaticamente quando o Diogo deixa de utilizar a rede social.',
          'Apenas o Diogo pode ter uma cópia da fotografia.',
          'A fotografia pode continuar a fazer parte da sua pegada digital e ter sido guardada ou partilhada por outras pessoas.',
          'A fotografia deixa de existir porque já passaram vários anos.',
        ],
        correctIndex: 2,
        explanation:
          'Conteúdos publicados online podem continuar associados à nossa pegada digital e podem ser guardados ou partilhados por outras pessoas.',
      },
      {
        id: 'w1-q5',
        text: 'Um colega pede-te a palavra-passe da tua conta escolar porque diz que precisa dela para te ajudar num trabalho. O que deves fazer?',
        options: [
          'Não partilhar a palavra-passe e procurar outra forma segura de obter ajuda.',
          'Dar-lhe a palavra-passe, desde que prometas alterá-la no final.',
          'Partilhar a palavra-passe apenas através de uma mensagem privada.',
          'Mudar a palavra-passe para uma mais simples para o colega conseguir memorizar.',
        ],
        correctIndex: 0,
        explanation:
          'Uma palavra-passe é pessoal e não deve ser partilhada com colegas. Se precisares de ajuda, procura uma alternativa segura ou fala com um adulto de confiança.',
      },
      {
        id: 'w1-q6',
        text: 'A Marta está há várias horas a utilizar um computador. Começa a sentir cansaço nos olhos e desconforto nas costas, mas quer continuar porque está a jogar. Qual seria a atitude mais equilibrada?',
        options: [
          'Continuar até terminar o jogo e só depois descansar.',
          'Aumentar o brilho do ecrã e continuar.',
          'Aproximar-se do ecrã para conseguir ver melhor.',
          'Fazer uma pausa, descansar dos ecrãs e mexer o corpo antes de voltar a utilizar o computador.',
        ],
        correctIndex: 3,
        explanation:
          'Fazer pausas, descansar dos ecrãs e mexer o corpo são hábitos importantes para uma utilização equilibrada da tecnologia.',
      },
      {
        id: 'w1-q7',
        text: 'Num grupo online da turma, alguns alunos começam a publicar comentários ofensivos sobre um colega. Qual é a atitude mais responsável?',
        options: [
          'Responder aos comentários com outros insultos para defender o colega.',
          'Não alimentar os insultos, apoiar o colega e procurar ajuda junto de um adulto de confiança.',
          'Partilhar os comentários noutro grupo para pedir opiniões.',
          'Ignorar sempre a situação, mesmo que o colega esteja a ser prejudicado.',
        ],
        correctIndex: 1,
        explanation:
          'Não devemos alimentar os insultos. Apoiar a pessoa afetada e procurar ajuda de um adulto responsável é uma atitude adequada.',
      },
      {
        id: 'w1-q8',
        text: 'Recebes uma mensagem de alguém que não conheces. A mensagem contém um link e pede-te para introduzires os dados da tua conta escolar. Qual é a atitude que melhor aplica a regra “Parar, pensar e proteger”?',
        options: [
          'Abrir o link primeiro e decidir depois se parece seguro.',
          'Pedir a um colega para abrir o link por ti.',
          'Parar antes de clicar, pensar se o pedido é legítimo e não fornecer os dados sem verificar a situação.',
          'Responder à mensagem com a tua palavra-passe para descobrir o que acontece.',
        ],
        correctIndex: 2,
        explanation:
          '“Parar, pensar e proteger” significa não agir impulsivamente. Devemos analisar a situação antes de clicar ou partilhar informações.',
      },
      {
        id: 'w1-q9',
        text: 'Um jogo online pede-te a tua localização, fotografia, número de telefone e palavra-passe para desbloquear uma funcionalidade gratuita. O que deves fazer?',
        options: [
          'Pensar se esses dados são realmente necessários, evitar partilhar informações pessoais e pedir ajuda a um adulto se tiveres dúvidas.',
          'Fornecer todos os dados porque a funcionalidade é gratuita.',
          'Fornecer apenas a palavra-passe, porque os outros dados não são importantes.',
          'Fornecer os dados e apagar a conta depois de desbloquear a funcionalidade.',
        ],
        correctIndex: 0,
        explanation:
          'Uma funcionalidade gratuita não significa que devamos fornecer todos os nossos dados. Devemos pensar sobre a necessidade dessas informações e proteger a nossa privacidade.',
      },
      {
        id: 'w1-q10',
        text: 'Recebes esta mensagem:\n\n“AVISO: a tua conta escolar será bloqueada hoje! Para evitar o bloqueio, clica neste link e confirma imediatamente a tua palavra-passe, morada e número de telefone.”\n\nQual é a atitude mais segura?',
        options: [
          'Clicar imediatamente no link, porque a mensagem diz que a conta será bloqueada.',
          'Não clicar no link, desconfiar do pedido e confirmar a situação através de um canal oficial ou junto de um adulto de confiança.',
          'Introduzir apenas a palavra-passe e deixar os restantes dados em branco.',
          'Reencaminhar a mensagem para os colegas para perceber se também receberam o aviso.',
        ],
        correctIndex: 1,
        explanation:
          'A mensagem apresenta vários sinais de alerta: cria urgência, pede informações pessoais e utiliza um link. Não deves clicar nem fornecer os dados. Deves verificar a situação através de uma fonte oficial ou pedir ajuda a um adulto de confiança.',
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
        text: 'O teu professor pediu-te para descobrir quais são alguns dos animais em perigo de extinção em Portugal. Qual destas pesquisas é mais específica para começar?',
        options: [
          'animais',
          'animais interessantes',
          'animais em perigo de extinção em Portugal',
          'coisas sobre animais',
        ],
        correctIndex: 2,
        explanation:
          'A pesquisa C utiliza palavras-chave que indicam claramente o tema e o contexto geográfico, tornando os resultados mais relevantes.',
      },
      {
        id: 'w2-q2',
        text: 'Queres descobrir quais são as causas da poluição dos rios em Portugal. Qual pesquisa é mais adequada?',
        options: [
          'rios',
          'poluição',
          'problemas',
          'causas da poluição dos rios em Portugal',
        ],
        correctIndex: 3,
        explanation:
          'Uma boa pesquisa utiliza palavras-chave relacionadas diretamente com aquilo que queremos descobrir.',
      },
      {
        id: 'w2-q3',
        text: 'Encontras um artigo escrito por uma pessoa identificada. O artigo apresenta uma afirmação importante, mas não mostra fontes nem evidências. O que deves concluir?',
        options: [
          'A identificação do autor é uma pista, mas devemos procurar outras evidências antes de confiar totalmente.',
          'A informação é verdadeira porque o autor está identificado.',
          'A informação é falsa porque não tem fontes.',
          'Devemos partilhar o artigo para descobrir se outras pessoas concordam.',
        ],
        correctIndex: 0,
        explanation:
          'Saber quem criou a informação é importante, mas não é suficiente para provar que uma afirmação é verdadeira. Devemos procurar evidências e outras fontes.',
      },
      {
        id: 'w2-q4',
        text: 'Encontras uma publicação que diz:\n\n“As escolas vão fechar na próxima segunda-feira.”\n\nA publicação foi escrita há quatro anos. O que deves fazer?',
        options: [
          'Partilhar imediatamente porque a publicação tem uma afirmação clara.',
          'Considerar que a informação pode estar desatualizada e procurar uma fonte atual e oficial.',
          'Acreditar porque uma publicação antiga não pode ser alterada.',
          'Considerar que todas as informações antigas são falsas.',
        ],
        correctIndex: 1,
        explanation:
          'Uma informação antiga pode estar desatualizada. Para responder a uma pergunta atual, devemos procurar informação atual e confirmar o contexto.',
      },
      {
        id: 'w2-q5',
        text: 'Encontraste uma informação num blogue. Queres verificar se é verdadeira. Qual estratégia é mais útil?',
        options: [
          'Procurar outras páginas independentes e comparar as evidências apresentadas.',
          'Procurar outra página que copie exatamente o mesmo texto.',
          'Escolher a página com mais comentários.',
          'Escolher a página com o título mais convincente.',
        ],
        correctIndex: 0,
        explanation:
          'Comparar fontes independentes permite procurar confirmação e analisar diferentes evidências. Duas páginas que apenas copiam a mesma informação não são uma confirmação independente.',
      },
      {
        id: 'w2-q6',
        text: 'Qual destes títulos merece maior atenção antes de ser partilhado?',
        options: [
          '“Relatório apresenta novos dados sobre a qualidade da água.”',
          '“Investigadores analisam a qualidade da água de vários rios.”',
          '“Estudo apresenta resultados sobre a qualidade da água.”',
          '“RESULTADO INCRÍVEL!!! NÃO VAIS ACREDITAR NO QUE DESCOBRIRAM!!!”',
        ],
        correctIndex: 3,
        explanation:
          'Um título exagerado e construído para provocar curiosidade ou choque pode ser clickbait. O título, por si só, não prova que a informação seja falsa, por isso devemos verificar o conteúdo.',
      },
      {
        id: 'w2-q7',
        text: 'Uma fotografia verdadeira de uma inundação ocorrida há cinco anos é publicada hoje com a frase “Esta inundação aconteceu ontem”. Qual é o problema?',
        options: [
          'A fotografia tem necessariamente de ser falsa.',
          'Uma fotografia verdadeira pode ser utilizada fora do seu contexto original.',
          'Fotografias com mais de cinco anos deixam de poder ser vistas.',
          'As fotografias não podem ser utilizadas como informação.',
        ],
        correctIndex: 1,
        explanation:
          'Uma fotografia pode ser verdadeira e, mesmo assim, ser enganadora quando é apresentada como se mostrasse outro acontecimento, local ou momento.',
      },
      {
        id: 'w2-q8',
        text: 'Qual destas frases apresenta uma afirmação que pode ser verificada através de evidências?',
        options: [
          '“O parque recebeu 50 000 visitantes no ano passado.”',
          '“Este é o melhor parque de Portugal.”',
          '“Na minha opinião, este computador é fantástico.”',
          '“Acho que todas as pessoas deviam visitar este parque.”',
        ],
        correctIndex: 0,
        explanation:
          'O número de visitantes é uma afirmação que pode ser confirmada através de dados. As restantes apresentam opiniões ou avaliações pessoais.',
      },
      {
        id: 'w2-q9',
        text: 'A Inês encontra uma notícia nas redes sociais. Tem um título muito chamativo e milhares de partilhas. Ela lê apenas o título e partilha imediatamente. Qual foi o principal erro?',
        options: [
          'Utilizou uma rede social.',
          'A notícia tinha demasiadas partilhas.',
          'Leu o título demasiado depressa.',
          'Não verificou a informação antes de a partilhar.',
        ],
        correctIndex: 3,
        explanation:
          'O número de partilhas não prova que uma informação seja verdadeira. Antes de partilhar, devemos verificar a fonte, a data e as evidências.',
      },
      {
        id: 'w2-q10',
        text: 'Recebes uma publicação que afirma:\n\n“A partir da próxima semana todas as escolas vão começar a ter aulas aos sábados!”\n\nA publicação não indica autor nem fonte. Tem muitas partilhas e comentários.\n\nQual é a atitude mais adequada?',
        options: [
          'Partilhar porque tem muitas partilhas e deve ser importante.',
          'Acreditar porque várias pessoas comentaram a publicação.',
          'Verificar quem publicou, procurar a data, procurar uma fonte oficial e comparar a informação antes de decidir se é verdadeira ou se deve ser partilhada.',
          'Considerar automaticamente que é falsa porque não gostaste da notícia.',
        ],
        correctIndex: 2,
        explanation:
          'O número de partilhas e comentários não é prova de verdade. Antes de partilhar uma informação importante, devemos verificar a origem, a data, as evidências e procurar confirmação em fontes credíveis.',
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
        text: 'No grupo de chat da turma para o trabalho de TIC, o Tomás escreve a seguinte mensagem: "HOJE À TARDE TODOS TÊM DE MANDAR O RESUMO JÁ!!!". De acordo com as regras da netiqueta, qual é o principal problema desta mensagem?',
        options: [
          'Utilizou poucas palavras e devia ter escrito um texto de duas páginas.',
          'Escrever tudo em MAIÚSCULAS transmite a ideia de que está a gritar ou a ser agressivo com os colegas.',
          'As mensagens de grupo só podem ser enviadas durante o horário escolar.',
          'Deveria ter enviado uma imagem animada antes da frase.',
        ],
        correctIndex: 1,
        explanation: 'Na comunicação digital, escrever frases inteiras em MAIÚSCULAS é interpretado como gritar. Para uma comunicação respeitosa, devemos usar minúsculas e um tom empático.',
      },
      {
        id: 'w3-q2',
        text: 'A Rita está prestes a enviar uma mensagem crítica sobre o trabalho de um colega num grupo online. Qual é a regra de ouro que ela deve aplicar antes de premir "Enviar"?',
        options: [
          'Perguntar a si própria: "Eu diria isto pessoalmente, cara a cara, com respeito a esta pessoa?"',
          'Verificar se a mensagem tem pelo menos 50 palavras.',
          'Garantir que envia a mensagem depois das 23h00.',
          'Pedir a cinco colegas que partilhem a mensagem em privado.',
        ],
        correctIndex: 0,
        explanation: 'A empatia digital consiste em lembrar que do outro lado do ecrã está uma pessoa real. Se não o diríamos cara a cara com respeito, não o devemos escrever online.',
      },
      {
        id: 'w3-q3',
        text: 'O João precisa de uma imagem de um ecossistema marinho para a capa do seu trabalho escolar. Encontra uma fotografia espetacular no Google Imagens, copia-a para o trabalho e assina com o seu próprio nome. Como se avalia esta atitude?',
        options: [
          'Está correta, porque tudo o que aparece no Google é de utilização livre.',
          'É incorreta, pois ao apresentar o trabalho de outra pessoa como sendo seu, o João cometeu plágio e violou os direitos de autor.',
          'Está correta, desde que a fotografia seja impressa a cores.',
          'É correta se o João enviar um e-mail ao professor a pedir desculpa antecipadamente.',
        ],
        correctIndex: 1,
        explanation: 'Apresentar uma criação alheia como nossa é plágio. Devemos respeitar a propriedade intelectual, verificar a licença e dar o devido crédito ao autor original.',
      },
      {
        id: 'w3-q4',
        text: 'Num trabalho de grupo online sobre a História de Portugal, a Sofia e o Pedro têm ideias diferentes sobre como organizar a apresentação. Qual é a melhor atitude para resolver a situação com espírito colaborativo?',
        options: [
          'A Sofia apaga os diapositivos do Pedro sem avisar para impor a sua ideia.',
          'O Pedro abandona o grupo e recusa-se a fazer a sua parte.',
          'Ambos ouvem as propostas um do outro, debatem os pontos positivos e combinam uma solução que integre o melhor das duas ideias.',
          'Esperam que a apresentação seja no dia seguinte e dizem ao professor que não conseguiram fazer nada.',
        ],
        correctIndex: 2,
        explanation: 'Trabalhar bem em equipa envolve ouvir opiniões diferentes, negociar com respeito e unir esforços para alcançar o objetivo comum.',
      },
      {
        id: 'w3-q5',
        text: 'Para ilustrar um artigo do blogue da escola, a Matilde procura imagens com licença Creative Commons. Encontra uma fotografia marcada com o símbolo "CC BY". O que é que este símbolo exige que ela faça?',
        options: [
          'Pagar 10 euros ao autor antes de utilizar a foto.',
          'Não fazer qualquer alteração e usá-la apenas em computadores portáteis.',
          'Não utilizar a fotografia se o blogue for lido por mais de 100 pessoas.',
          'Fazer a atribuição, ou seja, dar o devido crédito ao autor original da fotografia.',
        ],
        correctIndex: 3,
        explanation: 'A sigla BY (Attribution / Atribuição) nas licenças Creative Commons obriga a identificar e dar crédito ao criador da obra.',
      },
      {
        id: 'w3-q6',
        text: 'O Lucas está a escrever um trabalho sobre energia renovável e quer incluir uma definição exata que leu num artigo científico online. Como deve proceder para não cometer plágio?',
        options: [
          'Colocar o texto entre aspas e indicar claramente o nome do autor, o título da fonte e a data de publicação.',
          'Copiar o texto integralmente e mudar apenas as vírgulas.',
          'Inventar um nome de autor falso para que o professor pense que ele pesquisou em vários livros.',
          'Apagar a definição e dizer que não encontrou informação sobre o tema.',
        ],
        correctIndex: 0,
        explanation: 'Citar corretamente (usando aspas e identificando o autor e a fonte) é uma prática académica transparente que valoriza a investigação realizada.',
      },
      {
        id: 'w3-q7',
        text: 'A professora de TIC pediu à turma para criar um perfil numa plataforma de aprendizagem online. Em vez de publicar uma fotografia real do seu rosto, a Leonor optou por criar um avatar ilustrado. Qual é a grande vantagem desta decisão?',
        options: [
          'Aumenta a velocidade da ligação à Internet no computador.',
          'Protege a sua identidade visual e privacidade em ambientes digitais, mantendo o perfil personalizado e criativo.',
          'Impede que os colegas consigam ler as mensagens do grupo.',
          'Garante que obtém automaticamente nota máxima no trabalho.',
        ],
        correctIndex: 1,
        explanation: 'A utilização de avatares personalizados é uma excelente estratégia para proteger a privacidade e os dados pessoais, evitando a exposição de imagens reais em plataformas abertas.',
      },
      {
        id: 'w3-q8',
        text: 'Ao pesquisar uma música para colocar no fundo de um vídeo escolar, a Beatriz encontra uma licença Creative Commons com a sigla "NC" (Non-Commercial / Não Comercial). O que significa esta restrição?',
        options: [
          'A música não pode ser ouvida em telemóveis.',
          'A música pode ser utilizada livremente, desde que o vídeo não seja vendido nem usado para obter lucro financeiro.',
          'A música só pode ser tocada durante o fim de semana.',
          'A música é exclusiva para anúncios publicitários da televisão.',
        ],
        correctIndex: 1,
        explanation: 'A cláusula NC (Não Comercial) autoriza a utilização e partilha da obra apenas para fins educativos ou pessoais sem fins lucrativos.',
      },
      {
        id: 'w3-q9',
        text: 'Num projeto escolar colaborativo num documento em nuvem, o Bernardo reparou que um colega cometeu alguns erros de ortografia no capítulo 2. Qual é a conduta ética e construtiva a adotar?',
        options: [
          'Escrever um comentário privado ou de grupo educado a apontar as sugestões de melhoria ou ajudar a corrigir com autorização do colega.',
          'Publicar no grupo da turma que o colega não sabe escrever para todos verem.',
          'Apagar todo o capítulo 2 e escrever sobre outro assunto sem avisar.',
          'Bloquear o colega para que ele não consiga voltar a entrar no documento.',
        ],
        correctIndex: 0,
        explanation: 'Em ambientes colaborativos, o feedback deve ser sempre construtivo, respeitoso e focado na melhoria do trabalho em equipa.',
      },
      {
        id: 'w3-q10',
        text: 'Uma fotografia tem a licença Creative Commons "CC BY-ND" (Sem Derivações). O grupo de trabalho da Carolina quer recortar a imagem, mudar a cor do fundo e colocar filtros antes de a usar na capa. Podem fazê-lo?',
        options: [
          'Sim, porque os filtros melhoram a qualidade da fotografia.',
          'Sim, desde que não mostrem ao autor original.',
          'Não, porque a condição ND (No Derivatives / Sem Derivações) proíbe alterar, transformar ou criar obras derivadas a partir do original.',
          'Sim, mas apenas se a imagem for utilizada num trabalho de Matemática.',
        ],
        correctIndex: 2,
        explanation: 'A sigla ND (Sem Derivações) significa que a obra deve ser partilhada exatamente como o autor a criou, sem edições, cortes ou alterações.',
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
