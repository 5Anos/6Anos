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
    action?: string;
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
    instructions?: string[];
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
  { level: 2, name: 'Explorador Digital', minXp: 200 },
  { level: 3, name: 'Guardião Digital', minXp: 400 },
  { level: 4, name: 'Detetive Digital', minXp: 700 },
  { level: 5, name: 'Criador Digital', minXp: 1100 },
  { level: 6, name: 'Engenheiro Digital', minXp: 1600 },
  { level: 7, name: 'Explorador da IA', minXp: 2200 },
  { level: 8, name: 'Mestre da Missão TIC', minXp: 2900 },
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
    statement: 'Devemos clicar imediatamente em qualquer link recebido se a mensagem disser que é urgente.',
    isTrue: false,
    feedbackCorrect: 'Exatamente! As mensagens que criam urgência para clicar costumam ser armadilhas de phishing.',
    feedbackIncorrect: 'Cuidado! A pressa é a tática preferida dos criminosos para te impedir de pensar com calma.',
  },
  {
    id: 'tip-2',
    pt: 'A tua palavra-passe é pessoal. Não a partilhes com amigos, nem mesmo para jogos.',
    en: 'Your password is personal. Never share it with friends, even for gaming.',
    statement: 'A tua palavra-passe é pessoal e não deves partilhá-la com amigos ou colegas da turma.',
    isTrue: true,
    feedbackCorrect: 'Exatamente! A tua palavra-passe protege as tuas coisas e deve manter-se sempre em segredo.',
    feedbackIncorrect: 'Atenção! Mesmo o teu melhor amigo não deve saber a tua senha pessoal.',
  },
  {
    id: 'tip-3',
    pt: 'Encontrar uma imagem no Google não significa que ela seja tua: verifica sempre os direitos de autor.',
    en: 'Finding an image on Google does not make it yours: always check copyright and licenses.',
    statement: 'Podemos copiar qualquer imagem bonita da Internet e dizer no trabalho escolar que fomos nós a fazê-la.',
    isTrue: false,
    feedbackCorrect: 'Muito bem! Apresentar trabalhos de outros como se fossem nossos chama-se plágio.',
    feedbackIncorrect: 'Errado! As imagens têm autores reais e devemos sempre respeitar os direitos de autor.',
  },
  {
    id: 'tip-4',
    pt: 'A Inteligência Artificial pode inventar respostas com convicção. Confirma sempre factos importantes!',
    en: 'Artificial Intelligence can invent answers with confidence. Always double-check important facts!',
    statement: 'Se uma resposta da Inteligência Artificial estiver escrita com um tom muito seguro, é garantido que é verdade.',
    isTrue: false,
    feedbackCorrect: 'Correto! A IA pode alucinar e inventar informações falsas com um ar muito convincente.',
    feedbackIncorrect: 'Cuidado! Uma IA pode errar mesmo parecendo muito segura. Confirma sempre em fontes fiáveis.',
  },
  {
    id: 'tip-5',
    pt: 'Fazer pausas ajuda os olhos a descansar e pode diminuir o cansaço provocado pelos ecrãs.',
    en: 'Taking regular breaks helps rest your eyes and reduces screen fatigue.',
    statement: 'Aplicar a regra dos 20-20-20 (olhar a 20 metros por 20 segundos a cada 20 minutos) ajuda a descansar a vista.',
    isTrue: true,
    feedbackCorrect: 'Excelente! Pequenas pausas regulares mantêm a visão descansada e a energia no máximo.',
    feedbackIncorrect: 'Incorreto! Olhar para longe a cada 20 minutos é um hábito de ouro para quem usa ecrãs.',
  },
];

export const WORLDS_DATA: WorldContent[] = [
  {
    id: 1,
    title: 'MUNDO 1 — GUARDIÃO DIGITAL 🛡️',
    subtitle: 'O Teu Escudo de Segurança, Privacidade e Super-Poderes Digitais!',
    icon: 'Shield',
    color: 'emerald',
    intro: {
      greeting: 'Olá, Guardião Digital! 🚀',
      description: [
        'Adoramos usar a Internet para jogar com amigos, ver vídeos divertidos e aprender coisas incríveis!',
        'Mas, tal como quando andamos na rua, no mundo digital também precisamos de saber proteger o nosso castelo.',
        'Neste Mundo vais ganhar super-poderes: criar palavras-passe invencíveis, desmascarar truques e armadilhas falsas, guardar os teus segredos a sete chaves e manter o teu corpo cheio de energia para jogar!',
      ],
      mission: 'A tua missão secreta: Parar, Pensar e Proteger! 🛡️✨',
    },
    topics: [
      {
        id: 'w1-t1',
        number: 1,
        title: 'Palavras-passe Secretas 🗝️',
        paragraphs: [
          'A tua palavra-passe é a chave que protege as tuas contas de jogos e da escola.',
          'Usa palavras divertidas com números e símbolos para ficar forte (ex.: "Gato_Ninja_Comeu_9_Pizzas!").',
          'A tua palavra-passe é pessoal. Não a partilhes com amigos nem colegas.',
        ],
        takeaway: 'Regra de Ouro: Palavra-passe comprida, pessoal e super secreta! 🗝️',
      },
      {
        id: 'w1-t2',
        number: 2,
        title: 'Caça ao Phishing 🎣',
        paragraphs: [
          'Phishing são mensagens falsas que tentam roubar a tua palavra-passe ou conta.',
          'Desconfia de promessas de moedas grátis (como Robux) ou avisos a dizer "Clica em 5 minutos!".',
          'Regra do Detetive: Se parece bom demais para ser verdade, é uma armadilha!',
        ],
        bulletPoints: [
          'Promessas de moedas ou prémios grátis;',
          'Avisos com pressa para te assustar;',
          'Links estranhos com letras trocadas;',
          'Pedidos para introduzires a tua senha.',
        ],
        takeaway: 'Regra do Detetive: Se parece bom demais para ser verdade, é uma armadilha! 🛑',
      },
      {
        id: 'w1-t3',
        number: 3,
        title: 'Escudo de Privacidade 🚪',
        paragraphs: [
          'Os teus dados pessoais dizem quem és e onde estás.',
          'Guarda a tua morada e telemóvel no teu cofre secreto.',
          'Pede sempre autorização antes de publicar fotos com amigos!',
        ],
        bulletPoints: [
          'Morada de casa (super secreto);',
          'Número de telemóvel (super secreto);',
          'Fotos com amigos (pedir sempre autorização);',
          'Projetos escolares e desenhos (partilhar com orgulho).',
        ],
      },
      {
        id: 'w1-t4',
        number: 4,
        title: 'O Rasto Digital 👣',
        paragraphs: [
          'Tudo o que publicas ou comentas na Internet constrói o teu rasto digital.',
          'Mesmo quando apagas algo, alguém pode já ter guardado uma cópia ou feito uma captura de ecrã. Por isso, pensa antes de publicar.',
          'Espalha comentários amigos e sê sempre respeitador com os outros online.',
        ],
      },
      {
        id: 'w1-t5',
        number: 5,
        title: 'Super-Corpo & Bem-Estar 🕹️',
        paragraphs: [
          'Um bom jogador cuida da postura, dos olhos e do sono para ter energia máxima!',
          'Postura de astronauta: costas direitas e ecrã à distância de um braço.',
          'Regra dos 20-20-20: a cada 20 minutos, descansa os olhos 20 segundos olhando ao longe.',
        ],
        bulletPoints: [
          'Postura de astronauta (costas direitas);',
          'Distância de um braço do ecrã;',
          'Pausas regulares para descansar a vista (20-20-20);',
          'Desligar ecrãs antes de dormir.',
        ],
        takeaway: 'Regra do Campeão: Corpo direito, olhos descansados e energia no máximo! ⚡',
      },
    ],
    simulators: [
      {
        id: 'sim-password',
        name: 'Laboratório de Palavras-Passe',
        description: 'Experimenta criar senhas invencíveis com a técnica da frase maluca e testa o teu escudo!',
        xpReward: 100,
      },
      {
        id: 'sim-phishing',
        name: 'Laboratório de Phishing',
        description: 'Usa o teu radar de detetive para apanhar mensagens falsas e proteger a tua conta.',
        xpReward: 100,
      },
      {
        id: 'sim-privacy',
        name: 'Laboratório de Privacidade',
        description: 'Descobre o que deve ficar no teu cofre secreto e o que podes partilhar com o mundo.',
        xpReward: 100,
      },
      {
        id: 'sim-digital-footprint',
        name: 'Simulador de Pegada Digital',
        description: 'Avalia situações do dia a dia e aprende a deixar um rasto brilhante no ciberespaço.',
        xpReward: 100,
      },
      {
        id: 'sim-digital-wellbeing',
        name: 'Simulador de Bem-estar Digital',
        description: 'Treina a postura de astronauta e hábitos saudáveis para teres super-energia gamer!',
        xpReward: 100,
      },
    ],
    challenge: {
      id: 'ch-guarda-digital',
      title: 'TORNA-TE UM GUARDIÃO',
      description: 'Desafio Integrador do Mundo 1: Mostra que dominas senhas, caça ao phishing, privacidade, pegada digital e postura de campeão!',
      xpReward: 100,
    },
    mission: {
      id: 'mis-guia-seguranca',
      title: 'O MEU GUIA DE SEGURANÇA',
      description: 'Cria o teu Guia de Guardião com as 5 regras de ouro para navegar e jogar em segurança na Internet.',
      instructions: [
        '1. Regra 1 (Palavras-passe): Escreve a tua dica secreta para criar uma senha comprida e invencível.',
        '2. Regra 2 (Phishing): Explica os 3 passos para não morder o isco de mensagens falsas.',
        '3. Regra 3 (Dados Pessoais): Indica que informações guardas a sete chaves no teu cofre.',
        '4. Regra 4 (Pegada Digital): Dá uma dica para espalhar energia positiva e ser um bom amigo online.',
        '5. Regra 5 (Super-Corpo): Explica a postura de astronauta e a regra dos 20-20-20.',
      ],
      xpReward: 100,
    },
  },
  {
    id: 2,
    title: 'MUNDO 2 — DETETIVE DIGITAL 🔍',
    subtitle: 'A Lupa da Verdade: Caça a Pistas, Fontes Seguras e Notícias Falsas!',
    icon: 'Search',
    color: 'blue',
    intro: {
      greeting: 'Olá, Super-Detetive da Informação! 🕵️‍♂️',
      description: [
        'Na Internet encontramos milhares de páginas, vídeos e mensagens todos os dias, mas nem tudo o que brilha é verdade!',
        'Neste Mundo vais ganhar a Lupa Mágica do Detetive: aprender a encontrar respostas certeiras, descobrir quem é o autor, verificar as datas e caçar boatos antes de carregar em partilhar!',
      ],
      mission: 'A tua missão de detetive: investigar pistas, confirmar factos e nunca morder o isco de notícias falsas! 🔎',
    },
    topics: [
      {
        id: 'w2-t1',
        number: 1,
        title: 'O Radar das Palavras-Chave 🔍',
        paragraphs: [
          'Pesquisar na Internet é como ser um detetive à procura de pistas secretas: não basta escolher o primeiro resultado que aparece à frente!',
          'Se escreveres apenas uma palavra vaga como "animais", vais encontrar milhões de páginas com cães, gatos e dinossauros do mundo inteiro.',
          'Mas se fores específico e usares as palavras-chave certas — como "animais em perigo extinção Portugal" —, o motor de busca leva-te direto ao tesouro!',
        ],
        bulletPoints: [
          'Usa palavras-chave precisas e específicas;',
          'Combina o tema com o país ou a data que procuras;',
          'Não cliques logo no primeiro link: lê o pequeno resumo;',
          'Se não encontrares à primeira, experimenta outras palavras.',
        ],
        takeaway: 'Regra de Ouro do Detetive: Palavras precisas encontram respostas certas! 🎯',
      },
      {
        id: 'w2-t2',
        number: 2,
        title: 'Quem Escreveu Isto? O Selo do Autor 🕵️',
        paragraphs: [
          'Quem está por trás desta página na Internet? Será um cientista, uma escola, um jornal de confiança... ou alguém a inventar uma partida?',
          'Antes de acreditares no que lês, procura sempre o nome do autor ou a instituição que publicou o artigo.',
          'Um site fiável mostra quem escreveu, explica onde foi buscar os dados e não tem medo de mostrar a cara!',
        ],
        bulletPoints: [
          'Procura a página "Sobre nós" ou o nome do autor;',
          'Verifica se o site pertence a uma escola, universidade ou museu;',
          'Desconfia de textos sem autor e cheios de anúncios suspeitos;',
          'Uma fonte conhecida também deve ser verificada.',
        ],
        takeaway: 'Regra de Ouro: Sem autor identificado, a informação fica sob suspeita! 🛑',
      },
      {
        id: 'w2-t3',
        number: 3,
        title: 'A Máquina do Tempo: A Data Conta Muito! ⏳',
        paragraphs: [
          'Imagina que lês uma notícia que diz: "Amanhã cai um nevão e não há aulas!", mas depois descobres que a notícia foi escrita há 5 anos!',
          'Algumas informações mudam a toda a hora, como a previsão do tempo, os resultados desportivos ou os horários dos comboios.',
          'Outras informações, como as regras da matemática ou a história dos castelos, mantêm-se iguais durante séculos.',
        ],
        bulletPoints: [
          'Verifica sempre o ano e o dia da publicação;',
          'Para notícias e tecnologia, procura sempre informação recente;',
          'Para ciência e história, confirma se os factos ainda são aceites;',
          'Não partilhes avisos antigos como se fossem de hoje.',
        ],
        takeaway: 'Regra de Ouro: Informação fora de prazo pode ser uma grande armadilha! 📅',
      },
      {
        id: 'w2-t4',
        number: 4,
        title: 'O Super-Poder de Comparar Fontes 📑',
        paragraphs: [
          'Encontraste uma informação incrível e surpreendente num site? Excelente pista! Mas um bom detetive nunca confia numa única testemunha!',
          'Abre outro site de confiança e vê se diz o mesmo. Se dois ou três especialistas independentes confirmam a história, então tens uma prova sólida!',
          'Se só um site anónimo fala sobre o assunto, o melhor é manter o travão a fundo e não espalhar o rumor.',
        ],
        bulletPoints: [
          'Nunca fiques apenas com uma fonte;',
          'Procura a mesma notícia num jornal respeitado ou enciclopédia;',
          'Vê se as fontes citam as mesmas provas e estudos;',
          'Quanto mais incrível for a novidade, mais provas deves exigir.',
        ],
        takeaway: 'Regra de Ouro: Uma fonte é uma pista; três fontes concordantes são uma certeza! 🏆',
      },
      {
        id: 'w2-t5',
        number: 5,
        title: 'Caça às Notícias Falsas: Facto vs Opinião 🚨',
        paragraphs: [
          'Nem tudo o que está na Internet é verdade! Existem notícias falsas criadas de propósito para enganar ou ganhar cliques.',
          'FACTO: Algo que aconteceu e que pode ser provado (ex.: "A água congela a 0 ºC").',
          'OPINIÃO: O que alguém sente ou pensa (ex.: "O gelado de morango é o melhor do mundo!").',
          'NOTÍCIA FALSA OU BOATO: Uma mentira disfarçada de notícia para assustar ou enganar as pessoas.',
        ],
        bulletPoints: [
          'Distingue facto (provado) de opinião (gosto pessoal);',
          'Desconfia de títulos com muitas MAIÚSCULAS ou pontos de exclamação (ex.: "URGENTE!!!");',
          'Verifica as fotos: imagens antigas são muitas vezes recicladas com legendas falsas;',
          'Se sentires medo ou raiva, para, respira e investiga antes de partilhar.',
        ],
        takeaway: 'Regra de Ouro do Campeão: Se não tens a certeza absoluta, não partilhes! 🛡️',
      },
    ],
    simulators: [
      {
        id: 'sim-keywords',
        name: 'Radar de Palavras-Chave 🔍',
        description: 'Treina a arte de usar palavras precisas para encontrar tesouros escondidos na Internet sem perder tempo!',
        xpReward: 100,
      },
      {
        id: 'sim-author-check',
        name: 'Quem é o Autor? 🕵️',
        description: 'Examina cartões de artigos e descobre quais têm autores fiáveis e quais devem ser descartados.',
        xpReward: 100,
      },
      {
        id: 'sim-date-verifier',
        name: 'Máquina do Tempo das Datas ⏳',
        description: 'Avalia a frescura da informação e aprende quando uma notícia antiga se torna numa armadilha.',
        xpReward: 100,
      },
      {
        id: 'sim-source-compare',
        name: 'Comparador de Pistas & Fontes 📑',
        description: 'Cruza relatórios diferentes e descobre como encontrar a verdade através da comparação inteligente.',
        xpReward: 100,
      },
      {
        id: 'sim-news-detective',
        name: 'Caçador de Notícias Falsas 🚨',
        description: 'Desmascara boatos virais, separa factos de opiniões e salva a turma de cair em ciladas!',
        xpReward: 100,
      },
    ],
    challenge: {
      id: 'ch-operacao-detetive',
      title: 'OPERAÇÃO DETETIVE: O BOATO DA ESCOLA 🚨',
      description: 'O Tiago recebeu uma mensagem urgente a dizer que amanhã não há aulas! Ajuda-o a investigar antes de espalhar o pânico!',
      instructions: [
        '🚨 CASO URGENTE: O Tiago recebe no telemóvel: “URGENTE! Amanhã não há aulas! O diretor confirmou. Partilha já com todos!”',
        'Passo 1 (Autor): Quem enviou a mensagem? É um canal oficial da direção ou um número desconhecido?',
        'Passo 2 (Data): A mensagem tem data oficial ou apenas a palavra "amanhã"?',
        'Passo 3 (Provas): Existe algum comunicado no portal oficial da escola?',
        'Passo 4 (Confirmação): Pergunta a um professor ou encarregado de educação antes de partilhar.',
        'Decisão do Detetive: NÃO partilhar! Confirmar primeiro na página oficial da escola.',
      ],
      xpReward: 100,
    },
    mission: {
      id: 'mis-kit-detetive',
      title: 'O MEU KIT DE DETETIVE DIGITAL 🎒',
      description: 'Cria o teu Guia Prático com 5 passos infalíveis para desmascarar boatos e pesquisar como um verdadeiro cientista.',
      instructions: [
        '1. Regra 1 (Palavras-Chave): Escreve como transformas uma pesquisa vaga numa pesquisa de especialista.',
        '2. Regra 2 (Autor): Explica onde procuras quem escreveu a informação.',
        '3. Regra 3 (Data): Dá um exemplo de uma informação que perde a validade rapidamente.',
        '4. Regra 4 (Comparar): Explica por que razão consultar duas ou três fontes evita enganos.',
        '5. Regra 5 (Facto vs Opinião): Explica a diferença entre um facto comprovado e uma opinião pessoal.',
      ],
      xpReward: 100,
    },
  },
  {
    id: 3,
    title: 'MUNDO 3 — CRIADOR DIGITAL 🎨',
    subtitle: 'Super-Poderes de Criação: Respeito, Netiqueta e Licenças Fixes!',
    icon: 'Palette',
    color: 'purple',
    intro: {
      greeting: 'Olá, Criador de Conteúdos Digitais! 🎨✨',
      description: [
        'Criar na Internet é uma aventura fantástica: podemos desenhar, programar jogos, editar vídeos, escrever histórias e colaborar com amigos de todo o lado!',
        'Mas um verdadeiro criador também sabe que a liberdade digital vem acompanhada de super-responsabilidades: respeitar os colegas, falar com simpatia e não roubar o trabalho dos outros!',
      ],
      mission: 'A tua missão criativa: espalhar ideias geniais com respeito, empatia e dando sempre os créditos a quem merece! 🤝',
    },
    topics: [
      {
        id: 'w3-t1',
        number: 1,
        title: 'Mensagens & Emojis: Falar com o Coração 💬',
        paragraphs: [
          'Quando falamos cara a cara, o nosso sorriso, o olhar e o tom de voz ajudam os outros a perceber se estamos a brincar ou a falar a sério.',
          'Mas numa mensagem escrita no chat da turma, a outra pessoa só vê as letras frias no ecrã. Uma frase curta pode parecer irritada mesmo quando não queríamos!',
          'Por isso, antes de carregar em "Enviar", lê a tua mensagem e pergunta: "Se alguém me dissesse isto, eu ficaria magoado?".',
        ],
        bulletPoints: [
          'Do outro lado do ecrã está uma pessoa real com sentimentos;',
          'Usa palavras gentis e emojis para expressar o tom certo;',
          'Não envies mensagens quando estiveres zangado: espera 5 minutos;',
          'Se não o dirias pessoalmente com respeito, não o escrevas online.',
        ],
        takeaway: 'Regra de Ouro da Empatia: Trata os outros online como gostarias de ser tratado! 💖',
      },
      {
        id: 'w3-t2',
        number: 2,
        title: 'Netiqueta: As Boas Maneiras da Internet ✨',
        paragraphs: [
          'Já ouviste falar em "Netiqueta"? É a junção de "Net" (Rede) com "Etiqueta" (boas maneiras)!',
          'Sabias que escrever palavras com TODAS AS LETRAS MAIÚSCULAS é o mesmo que gritar bem alto aos ouvidos de alguém? É desconfortável e parece agressivo!',
          'Ter boa netiqueta é saber conviver em paz, esperar pela nossa vez de falar e não encher os grupos de conversa com piadas chatas ou spam.',
        ],
        bulletPoints: [
          'Evita escrever tudo em MAIÚSCULAS (não queremos gritar!);',
          'Não espalhes boatos ou segredos de colegas;',
          'Respeita as opiniões diferentes das tuas;',
          'Se vires alguém a ser maltratado, apoia o colega e avisa um adulto.',
        ],
        takeaway: 'Regra de Ouro da Netiqueta: Educação e simpatia abrem todas as portas no mundo digital! 🚪🌟',
      },
      {
        id: 'w3-t3',
        number: 3,
        title: 'Super-Equipa Online: Colaborar e Vencer 🤝',
        paragraphs: [
          'Trabalhar num documento ou apresentação partilhada com os teus colegas de turma pode ser muito divertido e rápido!',
          'Numa boa equipa, ninguém manda sozinho e ninguém fica a olhar sem fazer nada. Dividem-se as tarefas de forma justa e combinam-se prazos que todos conseguem cumprir.',
          'Se alguém tiver uma ideia diferente da tua, não apagues o trabalho do colega: conversem com calma para juntar o melhor das duas ideias!',
        ],
        bulletPoints: [
          'Divide as tarefas de forma justa: cada um tem a sua missão;',
          'Cumpre os prazos para não atrasar o grupo;',
          'Nunca apagues o texto de um colega sem falar com ele;',
          'Elogia o esforço e as boas ideias dos teus parceiros de equipa.',
        ],
        takeaway: 'Regra de Ouro da Equipa: Juntos chegamos muito mais longe do que sozinhos! 🚀',
      },
      {
        id: 'w3-t4',
        number: 4,
        title: 'Direitos de Autor: Respeitar a Arte dos Outros 🎨',
        paragraphs: [
          'Imagina que passaste uma tarde inteira a fazer um desenho incrível para um concurso e, no dia seguinte, outro aluno tirou uma fotocópia, apagou a tua assinatura e disse que tinha sido ele a fazer. Seria muito injusto, certo?',
          'Na Internet acontece o mesmo! Cada fotografia, música, vídeo ou texto pertence a quem o criou. Isso chama-se "Direito de Autor"!',
          'Encontrar uma imagem bonita no Google não significa que ela seja tua para usares como quiseres.',
        ],
        bulletPoints: [
          'Tudo o que está na Internet tem um autor que trabalhou para o criar;',
          'Pede autorização antes de utilizar trabalhos alheios;',
          'Procura bancos de imagens e músicas livres para estudantes;',
          'Respeita a arte e o esforço de todos os criadores.',
        ],
        takeaway: 'Regra de Ouro: Encontrar não é ser dono; respeitar a criação é ser justo! ⚖️',
      },
      {
        id: 'w3-t5',
        number: 5,
        title: 'Caça ao Plágio & Dar Crédito com Orgulho 📜',
        paragraphs: [
          'O que é "plágio"? É a palavra feia que usamos quando alguém faz "copiar e colar" do trabalho de outra pessoa e finge que a ideia foi sua!',
          'Pesquisar e ler coisas incríveis é ótimo! Mas quando usas uma frase ou informação especial, deves sempre dizer onde a encontraste: "Segundo o livro tal..." ou "De acordo com o cientista fulano...".',
          'Colocar o nome do autor e a fonte no teu trabalho escolar não tira valor ao teu esforço — pelo contrário, mostra que és um estudante sério e inteligente!',
        ],
        bulletPoints: [
          'Plágio é copiar o trabalho de outros e fingir que é nosso;',
          'Usa aspas quando copiares uma frase exata ("...");',
          'Escreve sempre uma lista de fontes no final do teu trabalho;',
          'Reescreve as ideias pelas tuas próprias palavras.',
        ],
        takeaway: 'Regra de Ouro do Estudante: Citar a fonte dá brilho e verdade ao teu trabalho! ✨',
      },
      {
        id: 'w3-t6',
        number: 6,
        title: 'Licenças Creative Commons: A Partilha Generosa 🔓',
        paragraphs: [
          'Muitos artistas, fotógrafos e cientistas adoram partilhar as suas obras com o mundo e usam as licenças especiais chamadas "Creative Commons"!',
          'Estas licenças têm símbolos fáceis de reconhecer que explicam logo o que podes ou não podes fazer:',
          '• BY (Pessoa): Tens de dar os créditos ao autor original.',
          '• NC (Moeda riscada): Podes usar para estudar, mas NÃO podes vender nem ter lucro.',
          '• ND (Sinal de igual): Tens de manter a obra original sem cortes nem filtros.',
          '• SA (Seta em círculo): Se fizeres algo novo a partir desta obra, tens de partilhar com a mesma licença.',
        ],
        bulletPoints: [
          'Símbolo BY = Diz quem é o autor original;',
          'Símbolo NC = Não comercial (proibido vender);',
          'Símbolo ND = Sem alterações ou filtros;',
          'Símbolo SA = Partilha nos mesmos moldes.',
        ],
        takeaway: 'Regra de Ouro: Segue os símbolos das licenças para partilhar arte em segurança! 🎨',
      },
    ],
    simulators: [
      {
        id: 'sim-comunicacao-digital',
        name: 'Conversas & Emojis Digitais 💬',
        description: 'Descobre como pequenos ajustes de palavras e pontuação transformam mensagens frias em amizade pura!',
        xpReward: 100,
      },
      {
        id: 'sim-netiqueta',
        name: 'Detetive de Netiqueta ✨',
        description: 'Resolve conflitos em grupos de conversação da turma e aprende as boas maneiras mais fixes do mundo online.',
        xpReward: 100,
      },
      {
        id: 'sim-colaboracao',
        name: 'Super-Equipa Online 🤝',
        description: 'Distribui tarefas de forma justa, cumpre prazos e cria apresentações nota máxima em equipa!',
        xpReward: 100,
      },
      {
        id: 'sim-direitos-autor',
        name: 'Direitos de Autor & Respeito 🎨',
        description: 'Aprende quando podes usar imagens e músicas da Internet e como pedir autorização aos autores.',
        xpReward: 100,
      },
      {
        id: 'sim-plagio-citacao',
        name: 'Caça ao Plágio & Citações 📜',
        description: 'Transforma cópias preguiçosas em trabalhos brilhantes com citações corretas e créditos completos!',
        xpReward: 100,
      },
      {
        id: 'sim-creative-commons',
        name: 'O Jogo das Licenças Creative Commons 🔓',
        description: 'Associa os símbolos BY, NC, ND e SA aos seus poderes e descobre o que cada autor autorizou!',
        xpReward: 100,
      },
      {
        id: 'sim-avatar-challenge',
        name: 'Desafio do Avatar Misterioso 👤',
        description: 'Desenha a tua identidade digital secreta e diverte-te sem expor a tua fotografia real na Internet!',
        xpReward: 100,
      },
    ],
    challenge: {
      id: 'ch-corrige-mensagem',
      title: 'OPERAÇÃO MENSAGEM FIXE 💬',
      description: 'O Tomás enviou uma mensagem a gritar em maiúsculas! Ajuda-o a transformá-la numa mensagem educada e amigável.',
      xpReward: 100,
    },
    mission: {
      id: 'mis-codigo-comunicacao',
      title: 'O CÓDIGO DE OURO DA TURMA 🏆',
      description: 'Cria as 7 Regras de Ouro da Tua Turma para conversas e trabalhos de grupo online sem conflitos.',
      instructions: [
        '1. Regra 1 (Tom e Respeito): Escreve a regra para evitar frases que pareçam agressivas.',
        '2. Regra 2 (Maiúsculas): Explica porque não se deve escrever tudo em MAIÚSCULAS.',
        '3. Regra 3 (Trabalho de Equipa): Define como a turma deve dividir as tarefas de forma justa.',
        '4. Regra 4 (Discordâncias): O que fazer quando dois colegas têm ideias diferentes?',
        '5. Regra 5 (Horários): Até que horas é aceitável mandar mensagens no grupo de trabalho?',
        '6. Regra 6 (Créditos): Como garantir que ninguém copia o trabalho de outros sem autorização.',
        '7. Regra 7 (Apoio Mútuo): O que fazer se alguém da turma estiver a sofrer com comentários ofensivos.',
      ],
      xpReward: 100,
    },
  },
  {
    id: 4,
    title: 'MUNDO 4 — ENGENHEIRO DIGITAL 🤖',
    subtitle: 'Comandar Máquinas: Decomposição, Algoritmos, Ciclos e Caça a Bugs!',
    icon: 'Terminal',
    color: 'amber',
    intro: {
      greeting: 'Olá, Super-Engenheiro de Robôs & Código! 🤖💻',
      description: [
        'Sabias que os computadores e os robôs mais potentes do mundo não conseguem pensar sozinhos? Eles só fazem exatamente aquilo que nós lhes mandamos!',
        'Neste Mundo vais aprender a linguagem dos computadores: partir missões gigantes em pedacinhos fáceis, dar ordens passo a passo com algoritmos, usar ciclos mágicos para não repetir trabalho e caçar os "bugs" (erros) como um mestre da programação!',
      ],
      mission: 'A tua missão de engenheiro: comandar o robô, resolver labirintos e criar soluções inteligentes passo a passo! 🕹️⚡',
    },
    topics: [
      {
        id: 'w4-t1',
        number: 1,
        title: 'Partir o Problema em Fatias (Decomposição) 🧩',
        paragraphs: [
          'Quando olhas para um desafio enorme — como construir um jogo completo ou organizar uma festa escolar —, pode parecer impossível à primeira vista!',
          'O segredo dos grandes génios é a "Decomposição": cortar o problema em fatias pequenas, como quem fatia uma pizza deliciosa.',
          'Em vez de tentar fazer tudo ao mesmo tempo, resolves uma fatia de cada vez: primeiro o cenário, depois as personagens, a seguir os pontos e por fim a música!',
        ],
        bulletPoints: [
          'Decompor é partir um problema grande em partes pequeninas;',
          'Cada pedaço pequeno é fácil e rápido de resolver;',
          'Juntando as partes todas, o desafio gigante fica superado!',
          'Se algo parecer difícil, pergunta: "Qual é o primeiro passinho?".',
        ],
        takeaway: 'Regra de Ouro da Engenharia: Um passo de cada vez transforma o impossível em realidade! 🧩✨',
      },
      {
        id: 'w4-t2',
        number: 2,
        title: 'Comandar com Algoritmos: A Receita Perfeita 🤖',
        paragraphs: [
          'O que é um "Algoritmo"? Não te assustes com o nome estranho! Um algoritmo é simplesmente uma receita passo a passo para realizar uma tarefa sem falhas.',
          'Imagina a receita para lavar os dentes: 1. Pôr pasta na escova → 2. Escovar os dentes → 3. Bochechar com água → 4. Lavar e arrumar a escova.',
          'A ordem das instruções é super importante! Se tentares bochechar antes de pôr a pasta, o resultado vai ser uma grande confusão!',
        ],
        bulletPoints: [
          'Um algoritmo é uma lista de ordens organizadas por ordem estrita;',
          'O computador segue as ordens exatamente como tu as escreveste;',
          'A ordem certa é o segredo para o sucesso do programa;',
          'Instruções claras evitam que as máquinas fiquem confusas.',
        ],
        takeaway: 'Regra de Ouro dos Algoritmos: Ordem certa e passos claros criam magia nas máquinas! 📜⚡',
      },
      {
        id: 'w4-t3',
        number: 3,
        title: 'Decisões Inteligentes: O Poder do SE e SENÃO 🔀',
        paragraphs: [
          'As máquinas também conseguem tomar decisões se nós lhes dermos as regras certas!',
          'Usamos a regra mágica do SE ... SENÃO: "SE estiver a chover, leva o guarda-chuva. SENÃO, leva os óculos de sol!".',
          'Num videojogo funciona igual: "SE a personagem tocar na moeda de ouro, ganha 10 pontos. SENÃO, continua a correr!".',
        ],
        bulletPoints: [
          'Uma condição testa uma pergunta (ex.: "Há um obstáculo à frente?");',
          'SE a resposta for SIM, o robô faz uma ação (ex.: virar à direita);',
          'SENÃO, o robô faz outra ação diferente (ex.: avançar em frente);',
          'É assim que os robôs se desviam de paredes e tomam decisões.',
        ],
        takeaway: 'Regra de Ouro das Condições: Com o SE e o SENÃO, os teus robôs ganham cérebro próprio! 🧠💡',
      },
      {
        id: 'w4-t4',
        number: 4,
        title: 'Super-Ciclos: Repetir Sem Cansar 🔁',
        paragraphs: [
          'Imagina que precisas de mandar o robô andar 100 passos em frente. Irias escrever "Avançar, Avançar, Avançar..." cem vezes? Que trabalheira!',
          'Os programadores espertos usam "Ciclos" (ou Loops): basta escrever "REPETIR 100 VEZES: Avançar!".',
          'Com um ciclo, poupas tempo, o teu código fica limpo e o computador executa a tarefa a uma velocidade supersónica!',
        ],
        bulletPoints: [
          'Um ciclo repete ações automaticamente quantas vezes quiseres;',
          'Evita ter de escrever as mesmas instruções muitas vezes;',
          'Torna o programa mais curto, elegante e fácil de ler;',
          'Podes repetir até chegar à meta ou enquanto houver energia.',
        ],
        takeaway: 'Regra de Ouro dos Ciclos: Deixa o computador repetir por ti e foca-te nas grandes ideias! 🚀🔁',
      },
      {
        id: 'w4-t5',
        number: 5,
        title: 'Caçadores de Dados & Gráficos Fixes 📊',
        paragraphs: [
          'O que são "Dados"? São pedacinhos de informação que recolhemos sobre o mundo: números, nomes, cores, pontuações ou temperaturas.',
          'Quando organizamos esses dados numa tabela (por exemplo, os golos marcados por cada amigo no recreio), conseguimos criar gráficos coloridos!',
          'Olhar para um gráfico ajuda-nos a ver padrões que antes estavam escondidos: quem marcou mais, que dias foram mais quentes e onde precisamos de melhorar.',
        ],
        bulletPoints: [
          'Dados são informações organizadas (ex.: idade, notas, tempos de corrida);',
          'Tabelas guardam os dados em linhas e colunas organizadas;',
          'Gráficos transformam números em desenhos fáceis de compreender;',
          'Analisar dados ajuda a tomar decisões com base na verdade.',
        ],
        takeaway: 'Regra de Ouro dos Dados: Organizar a informação dá super-visão sobre o mundo! 📈🔍',
      },
      {
        id: 'w4-t6',
        number: 6,
        title: 'Caça aos Bugs: O Treino do Debugging 🐞',
        paragraphs: [
          'Sabias que a palavra "Bug" significa inseto em inglês? Diz a lenda que o primeiro erro de computador foi causado por uma borboleta noturna que entrou dentro de uma máquina gigante!',
          'Hoje em dia, chamamos "Bug" a qualquer erro que faça o programa comportar-se de maneira esquisita ou parar.',
          'Fazer "Debugging" (depuração) é ser um detetive de código: testar passo a passo, descobrir onde está o engano e corrigi-lo com orgulho!',
        ],
        bulletPoints: [
          'Errar faz parte de aprender a programar: todos os cientistas erram;',
          'Não fiques frustrado: respira fundo e lê as instruções uma a uma;',
          'Testa o programa devagar para ver em que passo o robô se engana;',
          'Corrigir um bug dá uma das melhores sensações de vitória do mundo!',
        ],
        takeaway: 'Regra de Ouro do Debugging: Cada erro que corriges torna-te num programador mais forte! 🏆🛠️',
      },
    ],
    simulators: [
      {
        id: 'sim-decomposicao',
        name: 'Fatiador de Problemas 🧩',
        description: 'Pega em missões complexas e divide-as em fatias fáceis e ordenadas para vencer o desafio.',
        xpReward: 100,
      },
      {
        id: 'sim-block-coding',
        name: 'Oficina de Blocos de Código 🤖',
        description: 'Encaixa blocos de movimento e programa o robô para navegar no labirinto com precisão cirúrgica.',
        xpReward: 100,
      },
      {
        id: 'sim-algoritmos',
        name: 'Laboratório de SE e SENÃO 🔀',
        description: 'Cria algoritmos com sensores inteligentes que tomam decisões quando encontram perigos no caminho.',
        xpReward: 100,
      },
      {
        id: 'sim-ciclos',
        name: 'A Roda dos Super-Ciclos 🔁',
        description: 'Substitui listas longas e repetitivas por ciclos mágicos e poupa linhas de comando preciosas.',
        xpReward: 100,
      },
      {
        id: 'sim-dados',
        name: 'Explorador de Dados & Gráficos 📊',
        description: 'Organiza tabelas de pontos, calcula médias e descobre os segredos escondidos nos gráficos.',
        xpReward: 100,
      },
      {
        id: 'sim-debugging',
        name: 'Caçador de Bugs Misteriosos 🐞',
        description: 'Testa programas com erros lógicos, encontra o comando defeituoso e conserta o robô avariado!',
        xpReward: 100,
      },
    ],
    challenge: {
      id: 'ch-robo-perdido',
      title: 'OPERAÇÃO ROBÔ NO LABIRINTO 🤖',
      description: 'O Robô Explorador precisa de chegar à estação de recarga! Encaixa os blocos certos e usa ciclos para poupar energia.',
      xpReward: 100,
    },
    mission: {
      id: 'mis-pensar-engenheiro',
      title: 'O MEU PRIMEIRO ALGORITMO DE MESTRE 📜',
      description: 'Escolhe uma tarefa do teu dia a dia e desenha um algoritmo infalível com 5 a 8 passos e pelo menos uma decisão com SE.',
      instructions: [
        '1. Escolhe uma tarefa real (ex.: fazer o saco de desporto, preparar um lanche saudável ou montar um jogo de tabuleiro).',
        '2. Escreve entre 5 e 8 passos por ordem estrita de execução.',
        '3. Inclui pelo menos uma regra com "SE ... SENÃO" (ex.: "SE estiver frio, pôr o casaco; SENÃO, levar camisola").',
        '4. Testa o teu algoritmo pedindo a um colega para o executar exatamente como está escrito.',
        '5. Se ele encontrar um erro, faz o teu próprio debugging!',
      ],
      xpReward: 100,
    },
  },
  {
    id: 5,
    title: 'MUNDO 5 — EXPLORADOR DA IA ✨',
    subtitle: 'O Laboratório do Futuro: Prompts Mágicos, Mente Crítica e Segurança!',
    icon: 'Sparkles',
    color: 'indigo',
    intro: {
      greeting: 'Olá, Explorador do Futuro e da IA! 🧠🚀',
      description: [
        'A Inteligência Artificial (IA) parece magia, mas é pura ciência da computação! Já está nos telemóveis, nos filtros das fotos, nos tradutores e nos assistentes inteligentes!',
        'Neste Mundo vais aprender os super-poderes da IA: como escrever prompts mágicos para ela te ajudar a estudar, por que razão ela às vezes inventa disparates com ar sério (as famosas "alucinações") e como proteger os teus dados privados para seres sempre tu quem tem o comando da tua vida!',
      ],
      mission: 'A tua missão de explorador: usar a IA como uma ferramenta fantástica sem nunca deixar de pensar com a tua própria cabeça! 💡🛡️',
    },
    topics: [
      {
        id: 'w5-t1',
        number: 1,
        title: 'O que é a Inteligência Artificial? 🧠',
        paragraphs: [
          'Já te perguntaste como é que o telemóvel reconhece a tua cara ou como é que uma aplicação traduz uma frase em segundos?',
          'A Inteligência Artificial (IA) é um conjunto de programas avançados capazes de encontrar padrões em milhares de exemplos para realizar tarefas que antes só os humanos faziam.',
          'Atenção: uma calculadora normal que soma 5 + 5 NÃO usa IA — ela só segue uma fórmula matemática simples. E a IA NÃO é uma pessoa viva: não tem sentimentos, não sonha nem tem consciência própria!',
        ],
        bulletPoints: [
          'A IA aprende observando milhões de exemplos e dados;',
          'Consegue reconhecer imagens, vozes e responder a perguntas;',
          'Não é um ser humano e não tem sentimentos nem sentimentos reais;',
          'Não sabe tudo e precisa de ser guiada com inteligência.',
        ],
        takeaway: 'Regra de Ouro: A IA é uma ferramenta poderosa criada por pessoas, não um ser vivo com magia! 🤖⚡',
      },
      {
        id: 'w5-t2',
        number: 2,
        title: 'Máquinas que Criam: A IA Generativa 🎨',
        paragraphs: [
          'A "IA Generativa" é um ramo especial da inteligência artificial capaz de criar coisas novas a partir do teu pedido: textos, imagens, músicas ou até códigos de computador!',
          'Quando pedes à IA: "Desenha um dragão azul a comer esparguete num skate", o modelo junta padrões visuais que aprendeu para criar uma imagem nova em segundos.',
          'Mas atenção: só porque um texto ou uma imagem parecem bem feitos e bonitos, isso NÃO garante que a informação esteja cientificamente correta!',
        ],
        bulletPoints: [
          'IA Generativa produz conteúdos novos a partir de instruções;',
          'Pode criar resumos, ideias, histórias e ilustrações incríveis;',
          'Um texto bem escrito pode conter mentiras e dados inventados;',
          'Confirma sempre factos importantes em livros e enciclopédias.',
        ],
        takeaway: 'Regra de Ouro: Criatividade não é garantia de verdade; verifica sempre o que a IA cria! 🎨🔍',
      },
      {
        id: 'w5-t3',
        number: 3,
        title: 'A Arte dos Prompts Mágicos ✨',
        paragraphs: [
          'Como se fala com uma IA? Através de um "Prompt", que é o pedido ou instrução escrita que lhe dás.',
          'Se escreveres um prompt fraquinho como "Fala sobre o espaço", a IA vai dar uma resposta genérica e aborrecida.',
          'Mas se fores um mestre dos prompts e disseres: "Explica a um aluno do 6.º ano como funciona a gravidade na Lua, dá 2 exemplos divertidos e escreve em 100 palavras simples", a resposta vai ser espetacular!',
        ],
        bulletPoints: [
          'Prompt é a instrução que dás à IA para obter ajuda;',
          'Explica quem és (ex.: aluno do 6.º ano);',
          'Diz o objetivo com clareza e pede exemplos práticos;',
          'Define o tamanho da resposta (ex.: 3 tópicos ou 100 palavras).',
        ],
        takeaway: 'Regra de Ouro dos Prompts: Quanto mais claro e detalhado for o teu pedido, melhor será a resposta! 🎯📝',
      },
      {
        id: 'w5-t4',
        number: 4,
        title: 'Cuidado! A IA Alucina e Inventa Coisas 🔎',
        paragraphs: [
          'Sabias que a IA pode ter "alucinações"? Em tecnologia, chamamos alucinação quando a IA inventa factos falsos com um ar tão seguro e convincente que parece a maior verdade do mundo!',
          'Ela pode inventar datas de batalhas que nunca aconteceram, nomes de livros inexistentes e até citar cientistas que nunca nasceram!',
          'Nunca copies respostas de IA para um teste ou trabalho de casa sem antes confirmar cada detalhe numa fonte oficial.',
        ],
        bulletPoints: [
          'Alucinação é quando a IA inventa informação falsa;',
          'A IA responde sempre com tom seguro, mesmo quando está errada;',
          'Datas, números e nomes de livros são os erros mais comuns;',
          'Nunca aceites uma resposta como certa só porque parece bonita.',
        ],
        takeaway: 'Regra de Ouro: Confiança não é certeza; desconfia e confirma sempre as pistas! 🕵️‍♀️📚',
      },
      {
        id: 'w5-t5',
        number: 5,
        title: 'O Cofre Secreto: Privacidade e IA 🔐',
        paragraphs: [
          'Tudo o que escreves numa ferramenta pública de IA pode ser gravado e usado para treinar futuros computadores pelo mundo fora!',
          'Por isso, existe uma regra sagrada: NUNCA coloques dados pessoais nem palavras-passe numa IA!',
          'Nada de moradas, telemóveis, nomes completos de colegas, fotos da tua família ou segredos da escola. Podes pedir ajuda sobre qualquer assunto sem nunca revelar quem tu és!',
        ],
        bulletPoints: [
          'Nunca partilhes palavras-passe ou dados bancários;',
          'Não coloques o teu nome completo, morada ou telemóvel;',
          'Protege a identidade dos teus colegas e professores;',
          'Faz perguntas gerais sem revelar detalhes da tua vida privada.',
        ],
        takeaway: 'Regra de Ouro da Privacidade: Guarda os teus dados a sete chaves e usa a IA em modo anónimo! 🗝️🛡️',
      },
      {
        id: 'w5-t6',
        number: 6,
        title: 'O Humano é Quem Manda! O Teu Cérebro é Único 🚀',
        paragraphs: [
          'A IA é como uma bicicleta veloz: ajuda-te a chegar mais rápido ao teu destino, mas és TU quem tem de pedalar, escolher o caminho e travar nas curvas perigosas!',
          'Usa a IA para ter ideias, tirar dúvidas e encontrar inspiração, mas nunca deixes que seja ela a fazer o trabalho todo por ti.',
          'Se entregares um trabalho que não compreendes, não aprendeste nada. O teu cérebro, a tua criatividade e o teu coração são insubstituíveis!',
        ],
        bulletPoints: [
          'A IA é um assistente, não o dono do teu cérebro;',
          'Lê, pensa, corrige e dá sempre o teu toque pessoal ao trabalho;',
          'Tu és o responsável final por tudo o que apresentas;',
          'Pensar pela própria cabeça é o maior super-poder que existe!',
        ],
        takeaway: 'Regra de Ouro do Futuro: A tecnologia é fantástica, mas a inteligência humana está sempre no comando! 🌟👑',
      },
    ],
    simulators: [
      {
        id: 'sim-ia-concepts',
        name: 'Radar de IA: É Robô ou É Humano? 🧠',
        description: 'Distingue ferramentas normais de programação, sistemas inteligentes de IA e feitos humanos!',
        xpReward: 100,
      },
      {
        id: 'sim-ai-generation',
        name: 'Estúdio de Criação & Verificação 🎨',
        description: 'Analisa obras geradas por computador e aprende a verificar se a informação é de confiança.',
        xpReward: 100,
      },
      {
        id: 'sim-prompt',
        name: 'Laboratório de Prompts Mágicos ✨',
        description: 'Treina a arte de escrever pedidos detalhados e transforma respostas fracas em ouro puro!',
        xpReward: 100,
      },
      {
        id: 'sim-hallucination',
        name: 'Caçador de Alucinações da IA 🔎',
        description: 'Apanha respostas traiçoeiras com erros disfarçados e fontes inventadas pela máquina.',
        xpReward: 100,
      },
      {
        id: 'sim-ai-responsibility',
        name: 'Guardião de Privacidade na IA 🔐',
        description: 'Separa o que pode ser partilhado com a IA do que deve ficar fechado no teu cofre secreto.',
        xpReward: 100,
      },
      {
        id: 'sim-recommendation',
        name: 'Descobridor de Algoritmos & Feeds 🧭',
        description: 'Explora como as redes sociais e vídeos recomendam conteúdos e liberta-te da bolha digital!',
        xpReward: 100,
      },
    ],
    challenge: {
      id: 'ch-detetive-ia',
      title: 'OPERAÇÃO DETETIVE DA IA 🕵️‍♂️',
      description: 'Auditoria em 4 etapas: encontra os erros da IA, identifica fontes fiáveis e escreve um super-prompt!',
      xpReward: 100,
    },
    mission: {
      id: 'mis-audita-assistente',
      title: 'O MEU GUIA DO EXPLORADOR DA IA 📜',
      description: 'Cria o teu Guia de Sobrevivência e Inteligência Artificial com as 5 regras de ouro do futuro digital.',
      instructions: [
        '1. Regra 1 (O que é IA): Explica aos teus pais ou amigos o que a IA consegue fazer e o que não consegue.',
        '2. Regra 2 (Prompts): Dá a tua fórmula secreta para escrever um prompt nota máxima.',
        '3. Regra 3 (Alucinações): Explica por que razão nunca se deve confiar a 100% numa resposta bonita.',
        '4. Regra 4 (Privacidade): Lista 3 informações que nunca na vida deves escrever num chat de IA.',
        '5. Regra 5 (Super-Cérebro): Explica porque é que o ser humano tem de ser sempre o comandante final.',
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
    title: 'Avaliação Final — Guardião Digital 🛡️',
    questions: [
      {
        id: 'w1-q1',
        text: 'A Leonor quer escolher uma palavra-passe forte para a sua conta escolar. Qual destas opções é a mais segura?',
        options: [
          'Leonor2014! (o seu primeiro nome e ano de nascimento)',
          '12345678Escola (uma sequência numérica simples)',
          'futebol2026 (o desporto preferido e o ano atual)',
          'Gato#Com#Skate*24 (uma frase longa com símbolos)',
        ],
        correctIndex: 3,
        explanation:
          'Uma palavra-passe deve ser longa e misturar palavras, números e símbolos, sem incluir dados pessoais óbvios como nomes ou datas.',
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
        text: 'Um jogo online pede a tua localização, fotografia e palavra-passe para te dar um fato grátis. O que deves fazer?',
        options: [
          'Recusar partilhar esses dados privados e pedir conselho a um adulto.',
          'Dar apenas a localização e a senha para desbloquear o fato rápido.',
          'Inventar dados falsos de um colega da turma para conseguir o fato.',
          'Aceitar partilhar tudo porque os jogos online são sempre seguros.',
        ],
        correctIndex: 0,
        explanation:
          'Nenhum brinde de jogo justifica entregar dados privados ou senhas. Deves proteger a tua privacidade e falar com um adulto.',
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
    title: 'Avaliação Final — Detetive Digital 🔍',
    questions: [
      {
        id: 'w2-q1',
        text: 'O teu professor pediu-te para pesquisar os animais em risco de extinção em Portugal. Qual destas pesquisas é a mais eficaz?',
        options: [
          'animais selvagens do mundo',
          'notícias gerais sobre animais',
          'animais em perigo de extinção em Portugal',
          'histórias sobre a floresta portuguesa',
        ],
        correctIndex: 2,
        explanation:
          'Pesquisar com palavras-chave específicas sobre o assunto e a região ajuda a encontrar resultados mais diretos e úteis.',
      },
      {
        id: 'w2-q2',
        text: 'Precisas de dados sobre o clima para um trabalho de Ciências. Onde encontras a informação mais confiável?',
        options: [
          'Num vídeo curto sem autor num perfil anónimo.',
          'No site oficial do Instituto de Meteorologia ou de uma instituição científica.',
          'Num fórum de videojogos.',
          'Num comentário num grupo de chat.',
        ],
        correctIndex: 1,
        explanation:
          'Instituições científicas e oficiais identificam os seus autores e apresentam dados verificáveis.',
      },
      {
        id: 'w2-q3',
        text: 'Encontras um artigo num site muito conhecido. O que deves ter em conta sobre o autor e a informação?',
        options: [
          'Se o site for conhecido, a informação nunca precisa de ser verificada.',
          'Uma fonte conhecida também deve ser verificada, vendo quem escreveu e se há dados a apoiar.',
          'Se o autor estiver identificado, é impossível haver qualquer erro.',
          'Nenhum site conhecido deve ser lido.',
        ],
        correctIndex: 1,
        explanation:
          'Uma fonte conhecida também deve ser verificada: vê quem publicou e se existem dados ou explicações que apoiem a informação.',
      },
      {
        id: 'w2-q4',
        text: 'Queres consultar o calendário dos torneios de futebol escolar deste ano. Porque é importante verificar a data da publicação?',
        options: [
          'Porque calendários e notícias mudam com o tempo e precisamos de informação atual para o que procuramos.',
          'Porque qualquer publicação com mais de uma semana é mentira.',
          'Porque a data só serve para historiadores.',
          'Porque as notícias antigas deixam de poder ser abertas no computador.',
        ],
        correctIndex: 0,
        explanation:
          'Algumas informações, como datas e horários, mudam rapidamente. Deves sempre perguntar: “Esta informação ainda é atual para aquilo que procuro?”.',
      },
      {
        id: 'w2-q5',
        text: 'Encontraste uma informação importante sobre um novo jogo que vai ser lançado. Como deves confirmar se é verdadeira?',
        options: [
          'Acreditar logo porque é o primeiro resultado do motor de busca.',
          'Confirmar a notícia na página oficial dos criadores do jogo.',
          'Partilhar com todos os contactos para ver o que eles acham.',
          'Procurar vídeos no YouTube com o maior número de gostos.',
        ],
        correctIndex: 1,
        explanation:
          'Quanto mais importante for a informação, mais importante é confirmar numa fonte oficial e independente.',
      },
      {
        id: 'w2-q6',
        text: 'Qual das seguintes frases apresenta um FACTO e não uma opinião?',
        options: [
          '“A água pura ferve a 100 ºC ao nível do mar.”',
          '“O jogo de futebol de ontem foi o mais emocionante do ano.”',
          '“Acho que a aula de Educação Visual é a mais divertida.”',
          '“A sobremesa da cantina hoje estava muito saborosa.”',
        ],
        correctIndex: 0,
        explanation:
          'Um FACTO é algo que pode ser confirmado com provas ou dados objetivos. As restantes frases exprimem sentimentos ou preferências pessoais (opiniões).',
      },
      {
        id: 'w2-q7',
        text: 'Uma fotografia verdadeira de uma tempestade ocorrida há 5 anos é publicada hoje com a legenda: “Tempestade destrói escola hoje!”. Qual é o problema desta publicação?',
        options: [
          'A fotografia foi desenhada à mão.',
          'Uma fotografia verdadeira está a ser usada fora do seu contexto para levar as pessoas a acreditar em algo que não corresponde à realidade.',
          'As fotografias na Internet apagam-se ao fim de dois dias.',
          'Não há problema nenhum porque a chuva é sempre igual.',
        ],
        correctIndex: 1,
        explanation:
          'Uma fotografia verdadeira usada fora do seu contexto original torna-se informação falsa ou enganadora.',
      },
      {
        id: 'w2-q8',
        text: 'O Tiago recebe esta mensagem num grupo: “URGENTE! Amanhã não há aulas! O diretor da escola confirmou. Partilha já com todos!”. O que deve o Tiago fazer?',
        options: [
          'Partilhar imediatamente em todos os grupos da turma.',
          'Não partilhar ainda e confirmar primeiro a informação numa fonte oficial da escola ou com um professor.',
          'Faltar à escola sem perguntar a ninguém.',
          'Publicar nas redes sociais a dizer que a escola fechou para sempre.',
        ],
        correctIndex: 1,
        explanation:
          'Uma mensagem pode parecer verdadeira e mesmo assim estar errada. Não partilhes ainda; confirma primeiro a informação numa fonte oficial.',
      },
      {
        id: 'w2-q9',
        text: 'Uma publicação na Internet tem milhares de partilhas e gostos. O que é que isto prova?',
        options: [
          'Prova com 100% de certeza que a informação é verdadeira.',
          'Prova apenas que muitas pessoas viram ou partilharam, mas a informação pode estar incorreta.',
          'Prova que foi escrita por uma equipa de cientistas.',
          'Prova que é uma notícia urgente confirmada pelo governo.',
        ],
        correctIndex: 1,
        explanation:
          'Popularidade não é prova de verdade. Antes de partilhares, deves procurar provas e confirmar.',
      },
      {
        id: 'w2-q10',
        text: 'Ao fazer uma pesquisa na Internet para a escola, qual é a ordem correta da Regra do Detetive Digital?',
        options: [
          'Pesquisar termos precisos → verificar autoria e data → confirmar noutra fonte → utilizar.',
          'Copiar logo o primeiro resultado → imprimir o trabalho → entregar sem fazer revisão.',
          'Escolher o site com as ilustrações mais coloridas → aceitar tudo o que está escrito.',
          'Publicar nas redes sociais → perguntar aos amigos se é verdade → só depois ler.',
        ],
        correctIndex: 0,
        explanation:
          'A Regra do Detetive Digital é clara: encontra com pesquisa cuidada, verifica autoria e data, confirma e só depois utiliza.',
      },
    ],
  },
  3: {
    id: 'assessment-world-3',
    worldId: 3,
    title: 'Avaliação Final — Criador Digital 🎨',
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
    title: 'Avaliação Final — Engenheiro Digital 🤖',
    questions: [
      {
        id: 'w4-q1',
        text: 'O que significa decompor um problema?',
        options: [
          'Torná-lo mais difícil.',
          'Dividi-lo em partes menores e mais fáceis de resolver.',
          'Apagar o problema.',
          'Fazer tudo ao mesmo tempo.',
        ],
        correctIndex: 1,
        explanation: 'Decompor é o processo de dividir um problema complexo em partes menores, tornando-o muito mais fácil de compreender e resolver.',
      },
      {
        id: 'w4-q2',
        text: 'O que é um algoritmo?',
        options: [
          'Uma imagem digital.',
          'Um tipo de computador.',
          'Uma sequência organizada de instruções para resolver um problema.',
          'Uma palavra-passe.',
        ],
        correctIndex: 2,
        explanation: 'Um algoritmo é uma sequência lógica e ordenada de passos ou instruções claras com vista à resolução de uma tarefa ou problema.',
      },
      {
        id: 'w4-q3',
        text: 'Qual destas sequências representa melhor um algoritmo para fazer uma sandes?',
        options: [
          'Pegar no pão → colocar o recheio → fechar a sandes.',
          'Comer → procurar pão → colocar o prato.',
          'Fechar a sandes → procurar ingredientes → comer o pão.',
          'Guardar a sandes → lavar as mãos → procurar pão.',
        ],
        correctIndex: 0,
        explanation: 'A sequência lógica e cronológica correta começa com a base do pão, segue para a adição do recheio e finaliza fechando a sandes.',
      },
      {
        id: 'w4-q4',
        text: 'Qual destas opções representa uma repetição?',
        options: [
          'Escolher uma cor.',
          'Abrir um ficheiro.',
          'Verificar uma palavra-passe uma vez.',
          'Repetir “Avançar” 8 vezes.',
        ],
        correctIndex: 3,
        explanation: 'Uma repetição (ou ciclo/loop) executa a mesma instrução várias vezes de forma automática e eficiente.',
      },
      {
        id: 'w4-q5',
        text: 'Qual é um exemplo de uma condição?',
        options: [
          'Avançar duas casas.',
          'Repetir uma instrução.',
          'SE estiver a chover, ENTÃO levar guarda-chuva.',
          'Escrever o nome.',
        ],
        correctIndex: 2,
        explanation: 'Uma estrutura condicional testa um estado (SE estiver a chover) para decidir qual a ação a executar (ENTÃO levar guarda-chuva).',
      },
      {
        id: 'w4-q6',
        text: 'Se uma turma tem 24 alunos, que tipo de informação é “24”?',
        options: [
          'Um dado numérico.',
          'Uma fotografia.',
          'Um som.',
          'Uma palavra-passe.',
        ],
        correctIndex: 0,
        explanation: 'O valor 24 representa uma quantidade expressa através de algarismos, constituindo um dado de tipo numérico.',
      },
      {
        id: 'w4-q7',
        text: 'Um robô deveria avançar 4 casas, mas avança apenas 3. O que devemos fazer?',
        options: [
          'Apagar o objetivo.',
          'Ignorar o erro.',
          'Reiniciar sempre sem procurar o problema.',
          'Verificar as instruções e corrigir o algoritmo.',
        ],
        correctIndex: 3,
        explanation: 'Quando um algoritmo não atinge o objetivo esperado, devemos analisar os passos programados, detetar onde falhou e corrigir a instrução.',
      },
      {
        id: 'w4-q8',
        text: 'O que fazemos durante o debugging?',
        options: [
          'Criamos um novo computador.',
          'Testamos o algoritmo, encontramos erros e corrigimo-los.',
          'Eliminamos todos os dados.',
          'Mudamos a cor do programa.',
        ],
        correctIndex: 1,
        explanation: 'Debugging (depuração) é a atividade fundamental de testar, identificar anomalias lógicas e corrigir o código para que funcione devidamente.',
      },
      {
        id: 'w4-q9',
        text: 'Qual destas situações utiliza melhor um ciclo?',
        options: [
          'Repetir a mesma instrução 10 vezes através de “REPETIR 10 VEZES”.',
          'Escolher uma palavra.',
          'Guardar uma fotografia.',
          'Escrever uma única instrução.',
        ],
        correctIndex: 0,
        explanation: 'Um ciclo simplifica algoritmos extensos, substituindo 10 comandos idênticos por uma única instrução de repetição com contador.',
      },
      {
        id: 'w4-q10',
        text: 'Qual é a vantagem de organizar corretamente os dados?',
        options: [
          'Torna sempre os dados secretos.',
          'Faz desaparecer os dados.',
          'Facilita a consulta, comparação e interpretação da informação.',
          'Impede qualquer erro automaticamente.',
        ],
        correctIndex: 2,
        explanation: 'Organizar dados em tabelas ou categorias estruturadas permite consultar, cruzar e retirar conclusões de forma rápida e rigorosa.',
      },
    ],
  },
  5: {
    id: 'assessment-world-5',
    worldId: 5,
    title: 'Avaliação Final — Explorador da IA ✨',
    questions: [
      {
        id: 'w5-q1',
        text: 'Qual destas situações é um exemplo de utilização de Inteligência Artificial?',
        options: [
          'Um programa soma automaticamente 25 + 17 através de uma operação definida.',
          'Uma aplicação utiliza um modelo treinado com muitos exemplos para reconhecer objetos numa fotografia.',
          'Um aluno decide sozinho como organizar um trabalho de grupo.',
          'Um relógio mostra as horas através de um mecanismo programado.',
        ],
        correctIndex: 1,
        explanation: 'Reconhecer padrões em imagens através de um modelo treinado com muitos exemplos é uma aplicação possível de IA.',
      },
      {
        id: 'w5-q2',
        text: 'Qual afirmação descreve melhor uma IA generativa?',
        options: [
          'É uma ferramenta que apenas armazena ficheiros.',
          'É um programa que nunca produz informação nova.',
          'É um sistema capaz de gerar conteúdos como texto, imagens ou outros tipos de conteúdo a partir de instruções.',
          'É uma pessoa que responde através de um computador.',
        ],
        correctIndex: 2,
        explanation: 'IA generativa refere-se a sistemas capazes de gerar novos conteúdos a partir de instruções e do funcionamento do modelo.',
      },
      {
        id: 'w5-q3',
        text: 'Queres pedir a uma IA uma explicação sobre reciclagem para um trabalho do 6.º ano. Qual destes prompts fornece melhor orientação?',
        options: [
          '"Reciclagem."',
          '"Diz coisas sobre lixo."',
          '"Faz o trabalho."',
          '"Explica a um aluno do 6.º ano porque é importante reciclar. Apresenta 3 exemplos de materiais recicláveis e escreve a explicação em linguagem simples."',
        ],
        correctIndex: 3,
        explanation: 'O prompt D indica o objetivo, o público, o conteúdo pretendido e o estilo da resposta.',
      },
      {
        id: 'w5-q4',
        text: 'Uma IA responde a uma pergunta de História e apresenta uma data muito específica, mas não indica nenhuma fonte. O que deves fazer?',
        options: [
          'Confirmar a data numa fonte adequada antes de a utilizar.',
          'Aceitar a data porque a resposta parece profissional.',
          'Partilhar a resposta para perguntar aos amigos se parece verdadeira.',
          'Considerar a informação verdadeira se a IA tiver respondido rapidamente.',
        ],
        correctIndex: 0,
        explanation: 'Uma resposta convincente pode conter erros. Informação factual importante deve ser confirmada em fontes adequadas.',
      },
      {
        id: 'w5-q5',
        text: 'Qual destas afirmações sobre uma resposta de IA é mais correta?',
        options: [
          'Se estiver bem escrita, é necessariamente verdadeira.',
          'Uma IA pode apresentar informação incorreta ou inventada de forma convincente.',
          'Uma IA só pode errar quando a pergunta tiver erros ortográficos.',
          'Uma IA verifica automaticamente todas as informações antes de responder.',
        ],
        correctIndex: 1,
        explanation: 'Modelos de IA podem gerar respostas incorretas, incompletas ou inventadas. A aparência de confiança não garante a verdade.',
      },
      {
        id: 'w5-q6',
        text: 'Qual destas informações não deves colocar numa ferramenta pública de IA?',
        options: [
          'Uma pergunta sobre como estudar para um teste.',
          'Uma ideia para uma história de ficção.',
          'Uma palavra-passe da tua conta.',
          'Uma pergunta sobre os planetas.',
        ],
        correctIndex: 2,
        explanation: 'Palavras-passe são credenciais privadas e não devem ser partilhadas com ferramentas de IA ou outras pessoas.',
      },
      {
        id: 'w5-q7',
        text: 'Queres pedir ajuda à IA sobre um problema de um colega. Qual é a forma mais cuidadosa de fazer a pergunta?',
        options: [
          'Indicar o nome completo, morada e número de telefone do colega.',
          'Enviar uma fotografia do cartão de cidadão do colega.',
          'Publicar todos os dados pessoais para a IA perceber melhor.',
          'Descrever o problema sem revelar dados pessoais desnecessários.',
        ],
        correctIndex: 3,
        explanation: 'Podemos explicar uma situação utilizando apenas a informação necessária e evitando dados pessoais desnecessários.',
      },
      {
        id: 'w5-q8',
        text: 'Uma plataforma continua a recomendar-te vídeos sobre o mesmo tema porque tens visto e pesquisado muitos vídeos desse assunto. O que podes fazer para explorar conteúdos diferentes?',
        options: [
          'Procurar deliberadamente outros temas e interagir com fontes diferentes.',
          'Ver ainda mais vídeos do mesmo tema.',
          'Acreditar que tudo o que aparece no feed é selecionado para ti por uma pessoa.',
          'Partilhar automaticamente todos os vídeos recomendados.',
        ],
        correctIndex: 0,
        explanation: 'Os sistemas de recomendação podem utilizar sinais do nosso comportamento. Procurar e explorar temas diferentes pode ajudar a diversificar o conteúdo que encontramos.',
      },
      {
        id: 'w5-q9',
        text: 'Uma IA cria um texto para um trabalho escolar. Qual é a atitude mais responsável?',
        options: [
          'Entregar o texto sem o ler.',
          'Copiar exatamente tudo o que a IA escreveu.',
          'Ler, compreender, verificar a informação e adaptar o texto ao trabalho.',
          'Dizer que a IA nunca comete erros.',
        ],
        correctIndex: 2,
        explanation: 'A IA pode ser uma ferramenta de apoio, mas o aluno deve compreender, verificar e assumir responsabilidade pelo trabalho.',
      },
      {
        id: 'w5-q10',
        text: 'Uma IA apresenta uma lista de referências para apoiar uma resposta. Qual é a atitude correta?',
        options: [
          'Considerar automaticamente que todas as referências existem.',
          'Verificar se as fontes existem e se realmente apoiam as afirmações apresentadas.',
          'Escolher a referência com o título mais impressionante.',
          'Utilizar apenas a primeira referência da lista sem a consultar.',
        ],
        correctIndex: 1,
        explanation: 'Uma IA pode apresentar referências incorretas ou inexistentes. As fontes devem ser verificadas antes de serem utilizadas.',
      },
    ],
  },
};

// Grande Missão: A ESCOLA DO FUTURO (6 zonas, 5 códigos, 150 XP)
export const GRANDE_MISSAO = {
  id: 'grande-missao-escola-futuro',
  title: 'A ESCOLA DO FUTURO',
  totalXp: 150,
  narrativa: 'Em 5 zonas da escola vais recuperar os cinco códigos de segurança. Depois, no Núcleo Central, vais introduzir os cinco códigos e enfrentar o desafio final para reativar a Escola do Futuro.',
  stages: [
    {
      step: 1,
      domain: 'Mundo 1 — Guardião Digital',
      title: 'Zona 1 — Centro de Segurança',
      scenario: 'A escola vai disponibilizar computadores e redes Wi-Fi a todos os alunos. Como proteger os acessos e a privacidade dos estudantes?',
      task: 'Define os pilares de segurança e acesso seguro das contas dos alunos para obteres o Código 1.',
      options: [
        'Contas partilhadas com password fácil e memorizável por todos.',
        'Contas individuais únicas com palavras-passe robustas (mínimo 10 carateres) e autenticação segura.',
        'Deixar os computadores sempre ligados sem palavra-passe para poupar tempo.',
      ],
      correctOption: 1,
      feedback: 'Código 1 desbloqueado (#SEC-SAFE-2040)! Contas individuais e senhas fortes garantem que a pegada e privacidade de cada estudante permanecem protegidas.',
    },
    {
      step: 2,
      domain: 'Mundo 2 — Detetive Digital',
      title: 'Zona 2 — Arquivo Secreto',
      scenario: 'No arquivo digital, os alunos precisam de pesquisar fontes fiáveis para os trabalhos da disciplina de Ciências e História.',
      task: 'Qual a metodologia oficial que a escola deve ensinar aos alunos antes de aceitarem uma notícia para obteres o Código 2?',
      options: [
        'Acreditar no primeiro link que aparecer no topo dos resultados.',
        'Aplicar o Kit do Detetive: verificar quem escreveu, a data, a fonte oficial e comparar com outros meios fiáveis.',
        'Usar apenas imagens das redes sociais sem verificar o texto.',
      ],
      correctOption: 1,
      feedback: 'Código 2 desbloqueado (#FACT-CHECK-OK)! Investigar a autoria, a data e comparar fontes impede a propagação de boatos na escola.',
    },
    {
      step: 3,
      domain: 'Mundo 3 — Criador Digital',
      title: 'Zona 3 — Estúdio Criativo',
      scenario: 'Os grupos de trabalho colaborativo usam murais digitais e chats escolares para planear projetos em equipa.',
      task: 'Qual o compromisso ético indispensável para a convivência saudável na comunidade escolar online para obteres o Código 3?',
      options: [
        'Proibido discordar do colega de equipa.',
        'Tratar todos com respeito, não usar palavras agressivas ou maiúsculas contínuas e creditar sempre os autores dos materiais.',
        'Partilhar prints privados das conversas de equipa noutras redes.',
      ],
      correctOption: 1,
      feedback: 'Código 3 desbloqueado (#CREATIVE-CC-VAL)! A empatia, netiqueta e respeito pela autoria formam o alicerce de uma equipa vencedora.',
    },
    {
      step: 4,
      domain: 'Mundo 4 — Engenheiro Digital',
      title: 'Zona 4 — Laboratório de Engenharia',
      scenario: 'O robô assistente precisa de um algoritmo de rota para restabelecer a energia dos servidores sem bater nos obstáculos.',
      task: 'Qual a lógica algorítmica correta para programar a sequência de movimentos do robô para obteres o Código 4?',
      options: [
        'Planear os passos na ordem certa com as direções adequadas, contornando os obstáculos até à meta.',
        'Mover o robô em direções aleatórias sem olhar para os obstáculos.',
        'Desligar o robô e esperar que a energia volte sozinha.',
      ],
      correctOption: 0,
      feedback: 'Código 4 desbloqueado (#ALGO-ROBOT-RUN)! Uma sequência de passos clara e ordenada permite ao robô cumprir a missão com sucesso.',
    },
    {
      step: 5,
      domain: 'Mundo 5 — Explorador da IA',
      title: 'Zona 5 — Laboratório de IA',
      scenario: 'A escola quer auditar o assistente de IA antes de o ligar à rede geral. Como garantir uma utilização responsável e segura?',
      task: 'Qual a diretriz obrigatória para utilizar a IA com responsabilidade e obteres o Código 5?',
      options: [
        'Deixar que o robô faça os testes e trabalhos pelos alunos sem verificação.',
        'Usar a IA como apoio a ideias e explicações, verificando sempre os factos e nunca fornecendo palavras-passe ou dados privados.',
        'Desligar todos os computadores da escola e proibir a palavra tecnologia.',
      ],
      correctOption: 1,
      feedback: 'Código 5 desbloqueado (#AI-ETHICS-PASS)! A IA apoia a curiosidade com responsabilidade, mantendo sempre a integridade e a privacidade.',
    },
    {
      step: 6,
      domain: 'A Escola do Futuro',
      title: 'Zona 6 — Núcleo Central',
      scenario: 'Chegaste ao Núcleo Central com os 5 códigos de segurança recuperados nas 5 zonas da escola.',
      task: 'Introduzir os 5 códigos de segurança no terminal mestre para reativar todos os sistemas da Escola do Futuro.',
      options: [
        'Introduzir os 5 códigos de segurança recuperados e restaurar a energia do Núcleo.',
        'Apagar todos os registos do sistema e reiniciar sem códigos.',
        'Bloquear o acesso permanente à escola.',
      ],
      correctOption: 0,
      feedback: 'Missão Cumprida (#NUCLEO-UNLOCKED-2040)! Os 5 códigos foram validados e todos os subsistemas da Escola do Futuro estão reativados com sucesso!',
    },
  ],
};

// Weekly challenge data
export const WEEKLY_CHALLENGE = {
  id: 'challenge-phishing-message',
  title: 'Consegues descobrir se esta mensagem é phishing?',
  context: 'Recebeste uma SMS urgente com o seguinte conteúdo:',
  messageSample: 'ALERTA ESCOLAR URGENTE: O teu computador portátil escolar foi bloqueado por infração. Clica em http://bit.ly/escola-recupera-login-99 agora ou a tua matrícula será cancelada em 15 minutos!',
  problem: 'A mensagem usa sinais de urgência e pressão para assustar o aluno.',
  task: 'Identifica os sinais suspeitos e toma a decisão correta.',
  options: [
    {
      text: 'É fidedigna: como refere a escola e tem urgência, devo clicar já no link antes dos 15 minutos.',
      isCorrect: false,
      explanation: 'Incorreto! A urgência e a pressão de tempo são táticas para te impedir de pensar criticamente e verificar a informação com calma.',
    },
    {
      text: 'É phishing: usa ameaças de tempo limitado, um link estranho e pede dados de acesso.',
      isCorrect: true,
      explanation: 'Correto! Mesmo que uma mensagem pareça ser da escola, não deves confiar apenas no remetente ou no link. Se tiveres dúvidas, confirma a informação através de um canal oficial que já conheces.',
    },
    {
      text: 'É fidedigna: se a mensagem tem o nome da escola, não é preciso confirmar em nenhum outro canal.',
      isCorrect: false,
      explanation: 'Incorreto! Não confies numa mensagem apenas pelo aspeto do remetente ou do link. Confirma sempre através de um canal oficial conhecido.',
    },
  ],
  xpReward: 50,
};
