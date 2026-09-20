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
    pt: 'Fazer pausas ajuda os olhos a descansar e pode diminuir o cansaço provocado pelos ecrãs.',
    en: 'Taking regular breaks helps rest your eyes and reduces screen fatigue.',
  },
];

export const WORLDS_DATA: WorldContent[] = [
  {
    id: 1,
    title: 'MUNDO 1 — GUARDIÃO DIGITAL',
    subtitle: 'Segurança, Privacidade, Cidadania e Bem-estar Digital',
    icon: 'Shield',
    color: 'emerald',
    intro: {
      greeting: 'Bem-vindo, Guardião Digital!',
      description: [
        'Usamos a Internet para aprender, comunicar, jogar e criar.',
        'Mas, tal como no mundo real, também existem situações em que precisamos de ter cuidado.',
        'Neste Mundo vais aprender a proteger as tuas contas, os teus dados e a tua privacidade. Vais descobrir como reconhecer tentativas de engano, pensar antes de partilhar informação, agir com respeito e cidadania online, e utilizar a tecnologia com boa postura e equilíbrio.',
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
          'Phishing é uma tentativa de enganar alguém para conseguir informação confidencial, credenciais ou dados pessoais.',
          'Pode acontecer através de um email, uma mensagem, uma rede social ou um site falso que imita um serviço conhecido.',
          'Antes de clicar ou responder, aplica sempre a regra operacional de segurança: Parar → verificar o remetente → verificar o endereço/link → não fornecer dados → confirmar através de um canal oficial.',
          'Nem todas as mensagens que recebemos são de confiança, mesmo que pareçam urgentes ou venham em nome de marcas conhecidas.',
        ],
        bulletPoints: [
          'pedem a tua palavra-passe ou códigos de segurança;',
          'prometem ofertas fáceis, moedas de jogos ou prémios;',
          'têm links estranhos ou com pequenos erros na escrita do domínio;',
          'tentam assustar-te ou apressar-te para agires sem pensar.',
        ],
        takeaway: 'Regra de ouro: Parar → verificar o remetente → verificar o link → não fornecer dados → confirmar através de um canal oficial.',
      },
      {
        id: 'w1-t3',
        number: 3,
        title: 'Dados pessoais',
        paragraphs: [
          'Dados pessoais são informações que identificam ou permitem identificar uma pessoa.',
          'Não precisamos de publicar tudo na Internet. Muitas informações devem ser mantidas privadas para proteger a tua segurança no mundo real e digital.',
          'Antes de partilhar alguma coisa, pergunta: "Eu gostaria que qualquer pessoa visse isto?". Se a resposta for não, não partilhes.',
        ],
        bulletPoints: [
          'nome completo;',
          'morada da residência;',
          'número de telefone;',
          'fotografias e vídeos pessoais;',
          'localização em tempo real (GPS);',
          'escola e horários de saída.',
        ],
      },
      {
        id: 'w1-t4',
        number: 4,
        title: 'Pegada digital',
        paragraphs: [
          'A pegada digital é o conjunto de informações e registos que deixamos quando usamos serviços digitais.',
          'Publicações, comentários, fotografias e outras atividades podem fazer parte dessa pegada.',
          'Por isso, pensa antes de publicar. Lembra-te de praticar a cidadania digital e o respeito pelos colegas, evitando comentários agressivos ou partilhas prejudiciais (cyberbullying).',
          'O que colocamos hoje na Internet pode continuar associado a nós no futuro.',
        ],
      },
      {
        id: 'w1-t5',
        number: 5,
        title: 'Bem-estar digital e Ergonomia',
        paragraphs: [
          'A tecnologia faz parte do nosso dia a dia: usamos computadores, telemóveis, tablets e consolas para aprender, comunicar e divertir-nos.',
          'Para mantermos o nosso corpo saudável enquanto usamos a tecnologia, a ergonomia e a postura são fundamentais: manter as costas direitas e apoiadas na cadeira, os pés no chão e os braços alinhados com a mesa.',
          'Não fiques demasiado perto do ecrã e ajusta a posição para conseguires ver confortavelmente num espaço com boa iluminação e sem reflexos.',
          'Fazer pausas ajuda os olhos a descansar e pode diminuir o cansaço provocado pelos ecrãs.',
          'Faz pausas ativas para levantar, esticar e mexer o corpo. À noite, evita ecrãs no escuro antes de dormir para garantir um sono reparador.',
          'Usar tecnologia de forma saudável significa encontrar um equilíbrio entre tempo online, movimento, descanso e atividades com os outros.',
        ],
        bulletPoints: [
          'postura correta (costas direitas e apoiadas);',
          'Não fiques demasiado perto do ecrã e ajusta a posição para conseguires ver confortavelmente;',
          'boa iluminação sem reflexos diretos;',
          'posição confortável dos braços e pulsos na mesa;',
          'Fazer pausas ajuda os olhos a descansar;',
          'desligar ecrãs antes de dormir.',
        ],
        takeaway: 'Lembra-te: postura correta, distância confortável do ecrã, pausas ativas, descanso dos olhos e tempo sem ecrãs.',
      },
    ],
    simulators: [
      {
        id: 'sim-password',
        name: 'Laboratório de Palavras-Passe',
        description: 'Experimenta criar uma palavra-passe de teste e descobre como o comprimento, a imprevisibilidade e a individualidade a tornam verdadeiramente segura.',
        xpReward: 100,
      },
      {
        id: 'sim-phishing',
        name: 'Laboratório de Phishing',
        description: 'Analisa mensagens e emails com cenários realistas, aplicando a regra operacional para detetar tentativas de fraude e remetentes falsificados.',
        xpReward: 100,
      },
      {
        id: 'sim-privacy',
        name: 'Laboratório de Privacidade',
        description: 'Analisa diferentes tipos de informação e classifica entre partilhar publicamente, proteger como privado ou pensar antes de partilhar consoante o contexto.',
        xpReward: 100,
      },
      {
        id: 'sim-digital-footprint',
        name: 'Simulador de Pegada Digital',
        description: 'Analisa situações do dia a dia com diferentes graus de risco e impacto na tua pegada digital permanente e reputação online.',
        xpReward: 100,
      },
      {
        id: 'sim-digital-wellbeing',
        name: 'Simulador de Bem-estar Digital',
        description: 'Avalia a tua ergonomia, postura corporal, iluminação, distância do ecrã e hábitos de descanso para um equilíbrio digital saudável.',
        xpReward: 100,
      },
    ],
    challenge: {
      id: 'ch-guarda-digital',
      title: 'TORNA-TE UM GUARDIÃO',
      description: 'Desafio Integrador do Mundo 1: Analisa situações do quotidiano que combinam palavras-passe, deteção de phishing, privacidade de dados, pegada digital, prevenção do cyberbullying e ergonomia/postura.',
      xpReward: 100,
    },
    mission: {
      id: 'mis-guia-seguranca',
      title: 'O MEU GUIA DE SEGURANÇA',
      description: 'Cria o teu Guia de Segurança pessoal estruturado em 5 regras fundamentais, correspondendo a cada um dos temas do Mundo 1, acompanhadas da respetiva justificação.',
      instructions: [
        '1. Regra 1 (Palavras-passe): Define uma regra sobre a criação de palavras-passe longas, únicas e difíceis de adivinhar e justifica a sua importância.',
        '2. Regra 2 (Phishing): Define a tua regra operacional perante mensagens suspeitas ou com links (Parar → Verificar remetente/link → Confirmar) e justifica o porquê.',
        '3. Regra 3 (Dados Pessoais e Privacidade): Define que dados nunca deves divulgar publicamente e justifica como isso protege a tua segurança.',
        '4. Regra 4 (Pegada Digital e Cidadania): Cria uma regra sobre pensar antes de publicar e manter uma postura de respeito online (prevenção de cyberbullying).',
        '5. Regra 5 (Bem-estar e Ergonomia): Define uma regra prática sobre postura, distância do ecrã, pausas ativas e descanso dos olhos durante o estudo.',
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
        title: 'Pesquisar na Internet',
        paragraphs: [
          'Pesquisar bem não é escolher o primeiro resultado.',
          'Quando procuras informação para um trabalho ou para responder a uma pergunta, observa vários resultados e pensa:',
          '• Este resultado responde mesmo ao que procuro?',
          '• Quem publicou a informação?',
          '• Quando foi publicada?',
          '• Consigo confirmar esta informação noutro local?',
          'Regra do Detetive: encontra, verifica e só depois partilha.',
        ],
        takeaway: 'Regra do Detetive: encontra, verifica e só depois partilha.',
      },
      {
        id: 'w2-t2',
        number: 2,
        title: 'Autoria e fontes',
        paragraphs: [
          'Quem publicou esta informação?',
          'Antes de acreditares numa informação, vê quem a publicou.',
          'Pode ser uma escola, uma organização, um jornal, um especialista ou outra pessoa.',
          'Também é importante perceber de onde veio a informação e se existem dados ou explicações que a apoiem.',
          'Uma fonte conhecida também deve ser verificada.',
        ],
        takeaway: 'Uma fonte conhecida também deve ser verificada.',
      },
      {
        id: 'w2-t3',
        number: 3,
        title: 'Data e atualização',
        paragraphs: [
          'A data também conta.',
          'Algumas informações mudam rapidamente. Por exemplo, notícias, resultados desportivos ou horários.',
          'Outras informações continuam corretas durante muitos anos. Por exemplo, muitos conhecimentos científicos básicos.',
          'Por isso, pergunta:',
          '“Esta informação ainda é atual para aquilo que estou a procurar?”',
        ],
        takeaway: 'Pergunta sempre: “Esta informação ainda é atual para aquilo que estou a procurar?”',
      },
      {
        id: 'w2-t4',
        number: 4,
        title: 'Comparar fontes',
        paragraphs: [
          'Confirma antes de partilhar.',
          'Encontraste uma informação importante? Não acredites nela só porque aparece num site.',
          'Procura outra fonte e vê se a informação também aparece aí.',
          'Se possível, consulta uma fonte diferente e verifica quem está por trás da informação.',
          'Quanto mais importante for a informação, mais importante é confirmar.',
        ],
        takeaway: 'Quanto mais importante for a informação, mais importante é confirmar.',
      },
      {
        id: 'w2-t5',
        number: 5,
        title: 'Notícias e informação',
        paragraphs: [
          'FACTO: Algo que pode ser confirmado.',
          'OPINIÃO: Aquilo que uma pessoa pensa sobre um assunto.',
          'NOTÍCIA: Informação sobre algo que aconteceu.',
          'INFORMAÇÃO FALSA OU ENGANADORA: Informação que não é verdadeira ou que pode levar as pessoas a acreditar numa coisa que não corresponde à realidade.',
        ],
        takeaway: 'Distingue sempre: FACTO (confirmável), OPINIÃO (o que se pensa), NOTÍCIA (o que aconteceu) e INFORMAÇÃO FALSA OU ENGANADORA (não corresponde à realidade).',
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
      description: '🚨 CASO DETETIVE: O Tiago recebe uma mensagem urgente sobre cancelamento de aulas. Investiga antes de partilhar!',
      instructions: [
        '🚨 CASO DETETIVE: O Tiago recebe esta mensagem num grupo: “URGENTE! Amanhã não há aulas! O diretor da escola confirmou. Partilha já com todos!”',
        'Antes de partilhar, tens de investigar:',
        '1. Quem publicou a mensagem?',
        '2. Quando foi publicada?',
        '3. Há alguma prova ou fonte oficial?',
        '4. Onde podes confirmar esta informação?',
        '5. É seguro partilhar já?',
        'Decisão: Não partilhar ainda. Primeiro confirmar a informação numa fonte oficial da escola.',
      ],
      xpReward: 100,
    },
    mission: {
      id: 'mis-kit-detetive',
      title: 'KIT DO DETETIVE',
      description: 'Aplica o Kit do Detetive: analisa uma publicação viral sobre a semana de aulas de quatro dias antes de acreditar ou partilhar.',
      instructions: [
        'MISSÃO — KIT DO DETETIVE',
        'Recebeste uma publicação que diz: “A partir da próxima semana, todos os alunos vão ter aulas quatro dias por semana!”',
        'Antes de acreditares ou partilhares:',
        '1. Descobre quem publicou.',
        '2. Verifica a data.',
        '3. Procura confirmar a informação noutra fonte.',
        '4. Decide se deves partilhar.',
        '5. Explica brevemente porquê.',
        'Missão concluída! Usaste o teu Kit do Detetive: procuraste a fonte, verificaste a data e confirmaste a informação antes de partilhar.',
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
      {
        id: 'w4-t6',
        number: 6,
        title: 'Debugging (Depuração)',
        paragraphs: [
          'Quando um algoritmo ou programa não funciona como esperado, existe um erro ou anomalia lógica.',
          'Debugging é o processo de testar passo a passo, identificar onde ocorreu a falha e corrigir as instruções.',
          'Errar faz parte da programação; encontrar e corrigir erros torna-nos melhores engenheiros digitais.',
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
      {
        id: 'sim-debugging',
        name: 'Simulador de Debugging & Depuração',
        description: 'Testa algoritmos com erros lógicos, localiza o comando incorreto e corrige o programa.',
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
        'A Inteligência Artificial já está presente em muitas ferramentas digitais.',
        'Pode ajudar a gerar ideias, resumir informação, reconhecer padrões, criar textos e imagens ou responder a perguntas.',
        'Mas uma resposta de IA não deve ser aceite automaticamente como verdadeira.',
        'Neste Mundo vais aprender a perceber o que é IA, a escrever melhores prompts, a verificar respostas, a proteger a tua privacidade e a utilizar estas ferramentas sem deixares de pensar por ti.',
      ],
      mission: 'A tua missão: usar a IA como ferramenta, verificar o que ela produz e continuar a ser tu a tomar as decisões.',
    },
    topics: [
      {
        id: 'w5-t1',
        number: 1,
        title: 'O que é Inteligência Artificial?',
        paragraphs: [
          'A Inteligência Artificial (IA) é um conjunto de tecnologias que permite a sistemas informáticos realizar determinadas tarefas a partir de dados, regras, modelos ou padrões.',
          'Dependendo do sistema, a IA pode ser utilizada para reconhecer imagens, compreender linguagem, recomendar conteúdos, identificar padrões ou gerar texto e imagens.',
          'Nem todas as ferramentas digitais usam IA.',
          'Uma calculadora que faz uma soma através de uma operação definida não precisa de IA para funcionar.',
          'Uma ferramenta de IA também não é uma pessoa. Pode produzir respostas que parecem humanas, mas isso não significa que tenha sentimentos, experiências ou consciência como uma pessoa.',
          'É importante perceber o que uma ferramenta consegue fazer e quais são as suas limitações.',
        ],
        takeaway: 'IA é uma tecnologia com capacidades específicas. Não é uma pessoa e não sabe automaticamente tudo.',
      },
      {
        id: 'w5-t2',
        number: 2,
        title: 'IA generativa',
        paragraphs: [
          'A IA generativa é capaz de produzir novos conteúdos a partir de instruções e dos padrões aprendidos pelo modelo.',
          'Pode gerar, por exemplo, texto, imagens, áudio ou código, dependendo da ferramenta.',
          'Quando escrevemos um pedido, a ferramenta gera uma resposta com base no funcionamento do modelo e na informação disponível para esse sistema.',
          'Uma resposta bem escrita não é uma garantia de que está correta.',
          'Por isso, quando a informação é importante, devemos confirmar os factos em fontes adequadas.',
          'Também devemos pensar se o conteúdo gerado é apropriado para o objetivo e se estamos autorizados a utilizá-lo.',
        ],
        takeaway: 'A IA generativa consegue criar conteúdo, mas criar não é o mesmo que garantir que a informação é verdadeira.',
      },
      {
        id: 'w5-t3',
        number: 3,
        title: 'Prompts',
        paragraphs: [
          'Um prompt é a instrução que damos a uma ferramenta de IA.',
          'Um bom prompt explica claramente o que queremos.',
          'Podemos indicar: objetivo, contexto, público-alvo, formato, extensão e critérios importantes.',
          'Exemplo de prompt fraco: "Fala sobre energia." / Exemplo de prompt melhor: "Explica a um aluno do 6.º ano o que são fontes de energia renovável. Dá 3 exemplos e escreve a explicação em 120 palavras, usando linguagem simples."',
          'Um prompt melhor não precisa de ser enorme. Precisa de conter a informação necessária para orientar a resposta.',
        ],
        takeaway: 'Quanto mais claro for o objetivo e o contexto, mais fácil é obter uma resposta adequada.',
      },
      {
        id: 'w5-t4',
        number: 4,
        title: 'A IA pode enganar-se',
        paragraphs: [
          'Uma IA pode produzir uma resposta que parece convincente e, mesmo assim, estar errada.',
          'Pode apresentar: factos incorretos, datas erradas, nomes inventados, fontes que não existem, informações incompletas ou interpretações incorretas.',
          'Este tipo de erro pode ser chamado de alucinação quando um modelo gera informação sem base adequada e a apresenta como se fosse verdadeira.',
          'Não deves confiar numa resposta apenas porque está bem escrita.',
          'Quando o assunto é importante, verifica a informação em fontes adequadas.',
        ],
        takeaway: 'Uma resposta convincente não é necessariamente uma resposta verdadeira.',
      },
      {
        id: 'w5-t5',
        number: 5,
        title: 'Privacidade e IA',
        paragraphs: [
          'Antes de escreveres alguma coisa numa ferramenta de IA, pensa se essa informação precisa realmente de ser partilhada.',
          'Evita introduzir: palavras-passe, códigos de acesso, morada, número de telefone, dados bancários, documentos pessoais ou informação privada de colegas e familiares.',
          'Também deves ter cuidado com fotografias e documentos que contenham informação pessoal.',
          'Cada ferramenta pode ter regras diferentes sobre a utilização e conservação dos dados. Quando não sabes o que acontece aos dados, não partilhes informação privada e pede ajuda a um adulto de confiança.',
          'Uma pergunta pode ser feita sem revelar a identidade ou os dados pessoais envolvidos.',
          'Exemplo: em vez de "O meu colega João Silva, da Escola X, que vive na Rua Y, recebeu esta mensagem...", usar "Um colega recebeu uma mensagem suspeita. Como podemos analisar a situação sem partilhar os seus dados pessoais?"',
        ],
        takeaway: 'Antes de partilhar com uma IA, pergunta: esta informação é privada? É mesmo necessária?',
      },
      {
        id: 'w5-t6',
        number: 6,
        title: 'Pensar com a IA',
        paragraphs: [
          'Uma ferramenta de IA pode ajudar-te a aprender, mas não deve substituir o teu pensamento.',
          'Podes utilizá-la para: gerar ideias, explicar um conceito, sugerir exemplos, ajudar a organizar informação, rever um texto ou encontrar possíveis erros.',
          'Depois tens de: ler, compreender, verificar, escolher, corrigir e assumir a responsabilidade pelo resultado final.',
          'Se entregares uma resposta que não compreendes, a tecnologia pode ter feito o trabalho, mas tu não aprendeste com ele.',
          'Usar IA de forma responsável significa saber quando pedir ajuda à ferramenta e quando precisas de pensar e decidir por ti.',
        ],
        takeaway: 'Usa a IA como ferramenta de apoio, mas mantém o controlo sobre o teu trabalho e as tuas decisões.',
      },
    ],
    simulators: [
      {
        id: 'sim-ia-concepts',
        name: 'Simulador de Conceitos de IA',
        description: 'Distingue entre sistemas baseados em regras/programação, sistemas com IA e atividades humanas.',
        xpReward: 100,
      },
      {
        id: 'sim-ai-generation',
        name: 'Simulador de IA Generativa & Verificação',
        description: 'Identifica as ações críticas necessárias antes de utilizar conteúdos ou imagens gerados por IA.',
        xpReward: 100,
      },
      {
        id: 'sim-prompt',
        name: 'Prompt Simulator Progressivo',
        description: 'Desenvolve prompts em 4 níveis graduais: seleção, diagnóstico de lacunas, melhoria e precisão.',
        xpReward: 100,
      },
      {
        id: 'sim-hallucination',
        name: 'Hallucination & Evidence Simulator',
        description: 'Identifica erros subtis, dados sem fonte e referências inexistentes em respostas plausíveis de IA.',
        xpReward: 100,
      },
      {
        id: 'sim-ai-responsibility',
        name: 'Simulador de Privacidade e Classificação de Dados',
        description: 'Classifica 10 tipos de dados entre partilha segura, precaução contextual ou não partilha com a IA.',
        xpReward: 100,
      },
      {
        id: 'sim-recommendation',
        name: 'Recommendation & Autonomy Simulator',
        description: 'Explora como funcionam os algoritmos de recomendação e toma decisões para diversificar fontes.',
        xpReward: 100,
      },
    ],
    challenge: {
      id: 'ch-detetive-ia',
      title: 'DETETIVE DA IA',
      description: 'Auditoria de 4 etapas: encontrar afirmações a verificar, identificar fontes adequadas, detetar problemas e formular um prompt melhor.',
      xpReward: 100,
    },
    mission: {
      id: 'mis-audita-assistente',
      title: 'AUDITA UM ASSISTENTE DE IA',
      description: 'Analisa uma resposta de IA: identifica afirmações corretas, dados a confirmar, métodos de verificação, privacidade e novo prompt.',
      instructions: [
        '1. Identifica duas afirmações que parecem corretas.',
        '2. Identifica uma afirmação que deve ser confirmada.',
        '3. Explica como poderias verificar essa informação.',
        '4. Identifica uma informação pessoal que não deveria ser colocada num assistente público.',
        '5. Escreve um prompt melhor para pedir novamente a resposta.',
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
        text: 'O teu professor pediu-te para descobrir quais são alguns dos animais em perigo de extinção em Portugal. Qual destas pesquisas é a mais adequada para começar?',
        options: [
          'animais',
          'coisas sobre animais',
          'animais em perigo de extinção em Portugal',
          'Portugal',
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
          'Acreditar logo porque aparece no primeiro resultado do motor de busca.',
          'Consultar outra fonte diferente e independente para verificar se a informação também aparece aí e quem a publicou.',
          'Partilhar com todos os teus contactos antes de ler o texto.',
          'Procurar uma página que apenas tenha copiado o mesmo texto.',
        ],
        correctIndex: 1,
        explanation:
          'Quanto mais importante for a informação, mais importante é confirmar noutra fonte diferente e independente.',
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
        text: 'Ao fazer uma pesquisa na Internet para um trabalho da escola, qual é a ordem correta da Regra do Detetive Digital?',
        options: [
          'Copiar o primeiro resultado → entregar sem ler → fechar o computador.',
          'Encontrar a informação com palavras certas → verificar quem publicou e a data → confirmar noutra fonte → só depois utilizar ou partilhar.',
          'Escolher o site com as cores mais bonitas e copiar o texto.',
          'Partilhar nas redes sociais e perguntar aos amigos se é verdade.',
        ],
        correctIndex: 1,
        explanation:
          'A Regra do Detetive Digital é clara: encontra com pesquisa cuidada, verifica autoria e data, confirma e só depois utiliza ou partilha.',
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
    title: 'Avaliação Final — Explorador da IA',
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
