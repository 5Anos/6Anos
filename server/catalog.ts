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
    pt: 'Descansa os olhos a cada 20 minutos de ecrã: olha para um ponto distante durante 20 segundos.',
    en: 'Rest your eyes every 20 minutes of screen time: look at a distant point for 20 seconds.',
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
          'O ecrã deve ficar à distância de um braço esticado (cerca de 50 a 70 cm), ao nível ou ligeiramente abaixo dos olhos, num espaço com boa iluminação e sem reflexos.',
          'Aplica a regra dos 20-20-20: a cada 20 minutos de ecrã, olha durante 20 segundos para um ponto a pelo menos 6 metros de distância para relaxar a musculatura dos olhos.',
          'Faz pausas ativas para levantar, esticar e mexer o corpo. À noite, evita ecrãs no escuro antes de dormir para garantir um sono reparador.',
          'Usar tecnologia de forma saudável significa encontrar um equilíbrio entre tempo online, movimento, descanso e atividades com os outros.',
        ],
        bulletPoints: [
          'postura correta (costas direitas e apoiadas);',
          'distância adequada do ecrã (50 a 70 cm);',
          'boa iluminação sem reflexos diretos;',
          'posição confortável dos braços e pulsos na mesa;',
          'pausas ativas e descanso dos olhos (regra 20-20-20);',
          'desligar ecrãs antes de dormir.',
        ],
        takeaway: 'Lembra-te: postura correta, distância do ecrã, pausas ativas, descanso dos olhos e tempo sem ecrãs.',
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
    subtitle: 'Comunicação, Colaboração, Criação e Direitos de Autor',
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
      mission: 'A tua missão: comunicar, colaborar e criar conteúdos digitais com respeito e responsabilidade.',
    },
    topics: [
      {
        id: 'w3-t1',
        number: 1,
        title: 'Comunicar online',
        paragraphs: [
          'Quando escrevemos uma mensagem, a outra pessoa não consegue ouvir a nossa voz nem ver a nossa expressão.',
          'Por isso, uma mensagem pode parecer mais zangada ou desagradável do que queríamos.',
          'Antes de enviar, lê novamente e pergunta:',
          '“Está claro? É respeitoso? Eu diria isto da mesma forma pessoalmente?”',
          'Se a resposta for não, muda a mensagem antes de a enviar.',
        ],
      },
      {
        id: 'w3-t2',
        number: 2,
        title: 'Netiqueta',
        paragraphs: [
          'Netiqueta significa ter boas maneiras na Internet.',
          'As boas maneiras também existem online.',
          'Evita escrever frases inteiras em MAIÚSCULAS quando queres falar normalmente. Na Internet, isso pode parecer que estás a gritar.',
        ],
        bulletPoints: [
          'respeitar os outros;',
          'não insultar;',
          'não excluir, gozar ou humilhar colegas;',
          'não espalhar rumores;',
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
          'Se um colega tiver dificuldade, tenta ajudar em vez de fazer o trabalho todo por ele.',
          'Se houver opiniões diferentes, expliquem as ideias, ouçam-se e procurem uma solução em conjunto.',
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
          'Encontrar uma fotografia, um texto, uma música ou um vídeo na Internet não significa que possamos usá-lo como quisermos.',
          'Antes de utilizares um conteúdo, verifica se podes utilizá-lo e quais são as regras.',
          'Se for necessário, indica quem criou o conteúdo.',
          'Estar na Internet não significa que seja livre para copiar.',
        ],
      },
      {
        id: 'w3-t5',
        number: 5,
        title: 'Plágio e autoria',
        paragraphs: [
          'Plágio é apresentar o trabalho de outra pessoa como se fosse nosso.',
          'Se utilizares uma ideia, texto, imagem ou outro conteúdo criado por outra pessoa, deves respeitar o autor e indicar de onde veio.',
          'Copiar e colocar o nosso nome não transforma o trabalho em nosso.',
          'Direitos de autor: o trabalho pertence a quem o criou.',
          'Plágio: fingir que o trabalho de outra pessoa é nosso.',
        ],
      },
      {
        id: 'w3-t6',
        number: 6,
        title: 'Creative Commons',
        paragraphs: [
          'Creative Commons são licenças que indicam o que podemos fazer com um conteúdo criado por outra pessoa.',
          'BY → indicar quem criou.',
          'NC → não usar para ganhar dinheiro.',
          'ND → não alterar.',
          'SA → se adaptares e partilhares, mantém a mesma licença.',
        ],
      },
    ],
    simulators: [
      {
        id: 'sim-comunicacao-digital',
        name: 'Comunicação Digital',
        description: 'Interpreta o tom de várias mensagens e descobre como escrever mensagens claras e respeitosas.',
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
        description: 'Resolve desafios de organização, entreajuda e convivência num trabalho de grupo online.',
        xpReward: 100,
      },
      {
        id: 'sim-direitos-autor',
        name: 'Direitos de Autor & Permissões',
        description: 'Verifica condições de utilização de imagens, músicas e textos em trabalhos escolares.',
        xpReward: 100,
      },
      {
        id: 'sim-plagio-citacao',
        name: 'Simulador de Citação & Reconhecimento',
        description: 'Aprende a indicar autores, referenciar fontes e evitar o plágio em trabalhos escolares.',
        xpReward: 100,
      },
      {
        id: 'sim-creative-commons',
        name: 'Simulador de Licenças Creative Commons',
        description: 'Aprende o significado prático de cada regra de partilha e utilização (BY, NC, ND, SA).',
        xpReward: 100,
      },
      {
        id: 'sim-avatar-challenge',
        name: 'Avatar Challenge',
        description: 'Cria a tua identidade visual digital única e original sem expor fotos reais ou dados pessoais.',
        xpReward: 100,
      },
    ],
    challenge: {
      id: 'ch-corrige-mensagem',
      title: 'CORRIGE A MENSAGEM',
      description: 'O teu grupo está a preparar um trabalho. Um colega ainda não enviou a sua parte e o prazo está a aproximar-se. Escreve uma mensagem que resolva a situação sem criar conflito.',
      xpReward: 100,
    },
    mission: {
      id: 'mis-codigo-comunicacao',
      title: 'CÓDIGO DE COMUNICAÇÃO DA TURMA',
      description: 'Criar um pequeno Código de Comunicação da Turma com regras e exemplos de convivência e autoria digital.',
      instructions: [
        'Cria um pequeno Código de Comunicação da Turma com regras claras e exemplos práticos.',
        'Inclui orientações sobre comunicação online e netiqueta (sem gritar em maiúsculas nem excluir colegas).',
        'Descreve boas práticas de colaboração em equipa (divisão justa e entreajuda).',
        'Explica como respeitar os direitos de autor (dar crédito e não copiar sem autorização).',
      ],
      xpReward: 100,
    },
  },
  {
    id: 4,
    title: 'MUNDO 4 — LABORATÓRIO DE ENGENHARIA',
    subtitle: 'Pensamento Computacional, Algoritmos e Dados',
    icon: 'Terminal',
    color: 'amber',
    intro: {
      greeting: 'Bem-vindo ao Laboratório de Engenharia!',
      description: [
        'Os computadores funcionam seguindo instruções claras e organizadas.',
        'Neste Mundo vais aprender a dividir problemas grandes em tarefas mais pequenas, criar algoritmos, tomar decisões com condições, repetir passos e organizar dados.',
        'Não precisas de saber programar para pensar como um engenheiro.',
        'Basta aprender a analisar problemas e a encontrar soluções passo a passo.',
      ],
      mission: 'A tua missão: resolver problemas passo a passo, criar algoritmos claros e organizar dados.',
    },
    topics: [
      {
        id: 'w4-t1',
        number: 1,
        title: 'Dividir um problema',
        paragraphs: [
          'Um problema grande pode parecer difícil. Uma forma de o resolver é dividi-lo em problemas mais pequenos.',
          'Por exemplo, organizar um trabalho de grupo pode ser dividido em:',
          'Resolver uma parte de cada vez torna o problema mais fácil de compreender e de concluir com sucesso.',
        ],
        bulletPoints: [
          'Escolher o tema do trabalho;',
          'Pesquisar informação;',
          'Organizar as ideias;',
          'Criar o trabalho;',
          'Rever antes de entregar.',
        ],
        takeaway: 'Dividir uma tarefa grande em passos pequenos torna qualquer desafio mais simples de resolver.',
      },
      {
        id: 'w4-t2',
        number: 2,
        title: 'Algoritmos',
        paragraphs: [
          'Um algoritmo é uma sequência de passos para realizar uma tarefa ou resolver um problema.',
          'Uma receita de cozinha é um exemplo de algoritmo: tem passos que devem ser seguidos por uma determinada ordem.',
          'Um bom algoritmo deve ser claro e ter os passos pela ordem certa.',
        ],
        bulletPoints: [
          'Passo 1: Reunir os ingredientes necessários;',
          'Passo 2: Misturar os ingredientes pela ordem indicada;',
          'Passo 3: Colocar a mistura no forno durante o tempo correto;',
          'Passo 4: Deixar arrefecer antes de servir.',
        ],
        takeaway: 'Um algoritmo funciona quando todos os passos são claros e executados na ordem correta.',
      },
      {
        id: 'w4-t3',
        number: 3,
        title: 'Condições',
        paragraphs: [
          'Uma condição permite tomar uma decisão dependendo do que acontece.',
          'No dia a dia usamos condições constantemente:',
          'Em programação, usamos condições para dizer ao computador o que deve fazer em diferentes situações: SE uma condição for verdadeira, faz uma coisa; SENÃO, faz outra.',
        ],
        bulletPoints: [
          'SE estiver a chover → levo um guarda-chuva.',
          'SENÃO → não preciso de o levar.',
          'SE o jogador tiver 100 pontos → passa de nível.',
          'SENÃO → continua no nível atual.',
        ],
        takeaway: 'As condições (SE... ENTÃO... SENÃO...) permitem escolher ações diferentes consoante a situação.',
      },
      {
        id: 'w4-t4',
        number: 4,
        title: 'Repetições',
        paragraphs: [
          'Quando precisamos de repetir os mesmos passos várias vezes, podemos usar uma repetição.',
          'Em vez de escrever o mesmo comando muitas vezes, podemos simplesmente indicar que queremos repeti-lo.',
          'As repetições tornam as instruções muito mais curtas, organizadas e fáceis de ler.',
        ],
        bulletPoints: [
          'Sem repetição: Avançar 1 passo; Avançar 1 passo; Avançar 1 passo; Avançar 1 passo.',
          'Com repetição: REPETIR 4 VEZES: avançar um passo.',
        ],
        takeaway: 'Uma repetição executa a mesma ação várias vezes sem precisarmos de escrever o comando repetidamente.',
      },
      {
        id: 'w4-t5',
        number: 5,
        title: 'Dados',
        paragraphs: [
          'Os dados são informações que podemos recolher e organizar.',
          'Exemplos de dados do nosso dia a dia na escola:',
          'Depois de recolher dados, podemos organizá-los em tabelas ou gráficos e procurar padrões ou diferenças para tirar conclusões úteis.',
        ],
        bulletPoints: [
          'Número de alunos de uma turma;',
          'Desporto preferido de cada colega;',
          'Tempo gasto a estudar durante a semana;',
          'Número de livros lidos por mês.',
        ],
        takeaway: 'Organizar dados em tabelas ajuda-nos a comparar valores, encontrar o maior ou menor e compreender melhor a informação.',
      },
      {
        id: 'w4-t6',
        number: 6,
        title: 'Debugging (Procurar e Corrigir Erros)',
        paragraphs: [
          'Debugging significa procurar e corrigir erros.',
          'Quando um algoritmo ou programa não funciona como esperávamos, devemos:',
          'Errar faz parte da aprendizagem; testar e corrigir os erros ajuda-nos a pensar melhor e a encontrar a solução certa.',
        ],
        bulletPoints: [
          '1. Descobrir onde está o problema;',
          '2. Perceber o que deveria acontecer;',
          '3. Corrigir o passo errado;',
          '4. Testar novamente até funcionar.',
        ],
        takeaway: 'Fazer debugging é como ser um detetive: encontramos o passo errado, corrigimo-lo e testamos de novo.',
      },
    ],
    simulators: [
      {
        id: 'sim-decomposicao',
        name: 'Simulador de Dividir Problemas',
        description: 'Separa uma tarefa grande em passos menores e coloca-os pela ordem correta de execução.',
        xpReward: 100,
      },
      {
        id: 'sim-block-coding',
        name: 'O Caminho do Robô',
        description: 'Planeia uma sequência de movimentos com as 4 direções e desvia-te de obstáculos para chegar à meta.',
        xpReward: 100,
      },
      {
        id: 'sim-algoritmos',
        name: 'Simulador de Condições (SE / SENÃO)',
        description: 'Toma decisões lógicas automáticas usando regras SE... ENTÃO... SENÃO... em situações do dia a dia e jogos.',
        xpReward: 100,
      },
      {
        id: 'sim-ciclos',
        name: 'Simulador de Repetições',
        description: 'Simplifica sequências longas descobrindo o número de repetições necessárias para cada tarefa.',
        xpReward: 100,
      },
      {
        id: 'sim-dados',
        name: 'Simulador de Dados e Tabelas',
        description: 'Lê dados de tabelas escolares, compara valores e encontra respostas a partir da informação organizada.',
        xpReward: 100,
      },
      {
        id: 'sim-debugging',
        name: 'Simulador de Debugging',
        description: 'Analisa algoritmos com erros, encontra o passo que está a falhar e aplica a correção certa.',
        xpReward: 100,
      },
    ],
    challenge: {
      id: 'ch-robo-perdido',
      title: 'ROBÔ PERDIDO',
      description: 'Planeia um algoritmo com as quatro direções para levar o robô até ao destino sem bater nos obstáculos.',
      xpReward: 100,
    },
    mission: {
      id: 'mis-pensar-engenheiro',
      title: 'PENSA COMO UM ENGENHEIRO',
      description: 'Escolher uma tarefa do dia a dia e escrever um algoritmo com passos claros e ordenados.',
      instructions: [
        'Escolhe uma tarefa simples do dia a dia (ex.: preparar a mochila para a escola, organizar a secretária, regar uma planta, preparar o material para uma aula).',
        'Divide a tarefa em passos simples e coloca-os pela ordem certa.',
        'Inclui pelo menos uma condição simples (SE ... SENÃO).',
        'Verifica se outra pessoa conseguiria seguir o teu algoritmo sem ter dúvidas.',
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
        text: 'No grupo de chat da turma para o trabalho de TIC, o Tomás escreve a seguinte mensagem: "HOJE À TARDE TODOS TÊM DE MANDAR O RESUMO JÁ!!!". De acordo com a netiqueta, qual é o principal problema desta mensagem?',
        options: [
          'Utilizou poucas palavras e devia ter escrito um texto muito longo.',
          'Escrever frases inteiras em MAIÚSCULAS parece que está a gritar ou a ser agressivo com os colegas.',
          'As mensagens de grupo só podem ser enviadas durante a aula de TIC.',
          'Deveria ter enviado um sticker animado antes da frase.',
        ],
        correctIndex: 1,
        explanation: 'Escrever frases inteiras em maiúsculas na Internet parece que estamos a gritar. Devemos comunicar com clareza e respeito.',
      },
      {
        id: 'w3-q2',
        text: 'A Rita quer enviar uma mensagem sobre o trabalho de um colega num grupo online. Qual é a regra que ela deve aplicar antes de carregar em "Enviar"?',
        options: [
          'Perguntar a si própria: "Está claro? É respeitoso? Eu diria isto da mesma forma pessoalmente?"',
          'Verificar se a mensagem tem mais de cinquenta palavras.',
          'Garantir que envia a mensagem depois da meia-noite.',
          'Pedir a vários colegas para partilharem a mensagem sem autorização.',
        ],
        correctIndex: 0,
        explanation: 'Antes de enviar uma mensagem, devemos reler e pensar se é clara, respeitosa e se a diríamos da mesma forma cara a cara.',
      },
      {
        id: 'w3-q3',
        text: 'O João precisa de uma imagem sobre os oceanos para a capa do trabalho. Encontra uma fotografia na Internet, copia-a para o trabalho e assina com o seu próprio nome. Como se avalia esta atitude?',
        options: [
          'Está correta, porque tudo o que está na Internet pode ser assinado por qualquer pessoa.',
          'É incorreta, pois copiar o trabalho de outra pessoa e colocar o nosso nome é plágio e desrespeita o autor.',
          'Está correta, desde que a fotografia seja impressa a cores.',
          'É correta se o João disser que gostou muito da fotografia.',
        ],
        correctIndex: 1,
        explanation: 'Plágio é fingir que o trabalho de outra pessoa é nosso. Copiar e colocar o nosso nome não transforma o trabalho em nosso.',
      },
      {
        id: 'w3-q4',
        text: 'Num trabalho de grupo, a Sofia e o Pedro têm ideias diferentes sobre como organizar a apresentação. Qual é a melhor atitude para resolverem a situação?',
        options: [
          'A Sofia apaga o que o Pedro fez sem o avisar para impor a sua ideia.',
          'O Pedro recusa-se a participar e deixa de falar com o grupo.',
          'Ambos explicam as suas ideias com calma, ouvem-se e procuram uma solução em conjunto.',
          'Esperam pelo dia da entrega e dizem ao professor que não conseguiram fazer nada.',
        ],
        correctIndex: 2,
        explanation: 'Trabalhar em equipa significa ouvir opiniões diferentes, explicar ideias com respeito e procurar soluções em conjunto.',
      },
      {
        id: 'w3-q5',
        text: 'Para ilustrar um artigo no blogue da escola, a Matilde encontra uma fotografia com a licença Creative Commons "BY". O que é que ela tem de fazer?',
        options: [
          'Pagar dinheiro ao autor antes de utilizar a foto.',
          'Não usar a fotografia se o blogue for lido por outros colegas.',
          'Indicar claramente quem criou a fotografia.',
          'Mudar as cores da fotografia para ninguém reconhecer.',
        ],
        correctIndex: 2,
        explanation: 'A regra BY nas licenças Creative Commons significa que temos de indicar sempre quem criou o conteúdo.',
      },
      {
        id: 'w3-q6',
        text: 'O Lucas está a escrever um trabalho e quer incluir uma frase importante que leu num artigo informativo. Como deve proceder para respeitar o autor e evitar o plágio?',
        options: [
          'Colocar o texto entre aspas e indicar quem é o autor e de onde veio a informação.',
          'Copiar o texto diretamente sem aspas e assinar como se fosse seu.',
          'Mudar apenas uma palavra para fingir que a ideia foi dele.',
          'Apagar a informação para não ter de indicar a fonte.',
        ],
        correctIndex: 0,
        explanation: 'Se utilizares as palavras exatas de outra pessoa, deves colocar entre aspas e indicar quem escreveu e a fonte.',
      },
      {
        id: 'w3-q7',
        text: 'Para participar numa plataforma escolar, a Leonor decidiu criar um avatar ilustrado personalizado em vez de colocar uma foto real do seu rosto. Qual é a grande vantagem desta decisão?',
        options: [
          'Aumenta a velocidade da ligação à Internet no computador.',
          'Cria uma identidade visual original sem copiar outros e sem expor dados pessoais ou fotos reais.',
          'Impede que os colegas leiam as mensagens de estudo.',
          'Garante que recebe nota máxima automaticamente.',
        ],
        correctIndex: 1,
        explanation: 'Criar um avatar permite ter uma identidade visual personalizada e criativa, protegendo a privacidade e os dados pessoais.',
      },
      {
        id: 'w3-q8',
        text: 'Ao pesquisar uma música para colocar num vídeo escolar, a Beatriz encontra uma licença Creative Commons com a indicação "NC". O que significa esta regra?',
        options: [
          'A música só pode ser tocada durante o fim de semana.',
          'A música não pode ser usada para ganhar dinheiro ou com fins comerciais.',
          'A música não pode ser ouvida em computadores da escola.',
          'A música tem de ser apagada após 24 horas.',
        ],
        correctIndex: 1,
        explanation: 'A indicação NC (Não Comercial) significa que o conteúdo pode ser usado para fins educativos ou pessoais, mas não para ganhar dinheiro.',
      },
      {
        id: 'w3-q9',
        text: 'A Inês quer colocar uma música que encontrou na Internet como fundo num vídeo da escola. Ela pode simplesmente usá-la porque a encontrou online?',
        options: [
          'Sim, porque tudo o que está na Internet pode ser utilizado como quisermos.',
          'Não. Estar na Internet não significa que seja livre para copiar; é preciso verificar se podemos utilizar e quais são as regras.',
          'Sim, desde que o vídeo tenha menos de 30 segundos.',
          'Sim, se não mostrar o vídeo ao professor.',
        ],
        correctIndex: 1,
        explanation: 'Estar na Internet não significa que possamos usar o conteúdo como quisermos. Devemos verificar sempre as regras e autorizações.',
      },
      {
        id: 'w3-q10',
        text: 'Uma imagem tem a licença Creative Commons com a indicação "ND". O grupo da Carolina quer recortar a imagem e mudar as suas cores. Podem fazê-lo?',
        options: [
          'Sim, porque recortar imagens é sempre permitido.',
          'Não. A indicação ND significa que o conteúdo não pode ser alterado nem modificado.',
          'Sim, desde que coloquem o trabalho na capa.',
          'Sim, se utilizarem apenas no telemóvel.',
        ],
        correctIndex: 1,
        explanation: 'A regra ND (não alterar) significa que a criação deve ser utilizada tal como o autor a criou, sem alterações nem montagens.',
      },
    ],
  },
  4: {
    id: 'assessment-world-4',
    worldId: 4,
    title: 'Avaliação Final — Laboratório de Engenharia',
    questions: [
      {
        id: 'w4-q1',
        text: 'O professor pediu à turma para organizar uma apresentação sobre a Internet. Qual é a melhor forma de começar esta tarefa?',
        options: [
          'Tentar fazer tudo ao mesmo tempo sem qualquer plano.',
          'Dividir a tarefa em partes menores: escolher o tema, pesquisar, fazer os diapositivos e rever.',
          'Fazer apenas a capa e entregar logo o trabalho.',
          'Desistir porque o trabalho parece muito grande.',
        ],
        correctIndex: 1,
        explanation: 'Dividir um problema grande em partes mais pequenas torna a tarefa muito mais simples de compreender e de concluir com sucesso.',
      },
      {
        id: 'w4-q2',
        text: 'O que é um algoritmo?',
        options: [
          'Um tipo de computador muito rápido.',
          'Uma imagem gravada na Internet.',
          'Uma sequência de passos para realizar uma tarefa ou resolver um problema.',
          'Um vírus informático que apaga ficheiros.',
        ],
        correctIndex: 2,
        explanation: 'Um algoritmo é uma sequência ordenada de instruções ou passos claros que seguimos para atingir um objetivo ou resolver um desafio.',
      },
      {
        id: 'w4-q3',
        text: 'Para programar um robô a lavar as mãos de forma correta, qual é a ordem certa dos passos?',
        options: [
          'Secar as mãos → colocar sabão → molhar as mãos → esfregar.',
          'Molhar as mãos → colocar sabão → esfregar com água → secar as mãos.',
          'Esfregar com água → secar as mãos → colocar sabão → molhar as mãos.',
          'Colocar sabão → secar as mãos → molhar as mãos → esfregar.',
        ],
        correctIndex: 1,
        explanation: 'Num bom algoritmo, a ordem dos passos é essencial: primeiro molhamos as mãos, colocamos sabão, esfregamos e só no fim secamos.',
      },
      {
        id: 'w4-q4',
        text: 'Num jogo, queremos que a personagem use um escudo se a energia for inferior a 20 pontos. Como escrevemos esta decisão?',
        options: [
          'REPETIR 20 VEZES: usar escudo.',
          'SE energia < 20 ENTÃO: usar escudo; SENÃO: continuar sem escudo.',
          'DIVIDIR energia por 20 partes.',
          'PROCURAR ERROS na barra de energia.',
        ],
        correctIndex: 1,
        explanation: 'Uma condição (SE... ENTÃO... SENÃO...) permite ao programa tomar decisões dependendo do estado do jogo ou das variáveis.',
      },
      {
        id: 'w4-q5',
        text: 'Num semáforo inteligente para peões, qual é a regra condicional correta para garantir a segurança?',
        options: [
          'SE o sinal for verde ENTÃO: esperar; SENÃO: atravessar a correr.',
          'SE o sinal for verde ENTÃO: atravessar com segurança; SENÃO: esperar no passeio.',
          'REPETIR: avançar sempre sem olhar para os carros.',
          'SE estiver a chover ENTÃO: desligar o semáforo.',
        ],
        correctIndex: 1,
        explanation: 'A condição verifica o estado da luz: se estiver verde, o peão pode avançar com segurança; caso contrário (senão), deve aguardar no passeio.',
      },
      {
        id: 'w4-q6',
        text: 'Um robô precisa de dar 6 passos em linha reta. Em vez de escrever "Avançar 1 passo" 6 vezes seguidas, qual é a melhor instrução?',
        options: [
          'SE avançar ENTÃO 6 passos.',
          'REPETIR 6 VEZES: avançar um passo.',
          'PARAR 6 VEZES antes de avançar.',
          'DIVIDIR o robô em 6 partes.',
        ],
        correctIndex: 1,
        explanation: 'Usar uma repetição (REPETIR X VEZES) evita escrever o mesmo comando repetidamente e torna o algoritmo muito mais curto e limpo.',
      },
      {
        id: 'w4-q7',
        text: 'Para desenhar um quadrado, o robô repete 4 vezes o conjunto (avançar e virar 90 graus). Qual é a vantagem de usar uma repetição?',
        options: [
          'Evita repetir o mesmo código várias vezes e torna o programa mais simples e organizado.',
          'Faz com que o robô desenhe apenas um dos lados do quadrado.',
          'Obriga o computador a desligar após desenhar cada linha.',
          'Gasta mais memória no computador.',
        ],
        correctIndex: 0,
        explanation: 'As repetições tornam os programas mais fáceis de ler, poupam esforço e diminuem a probabilidade de esquecer algum passo.',
      },
      {
        id: 'w4-q8',
        text: 'Numa votação da turma sobre o desporto preferido: Futebol (12 votos), Basquetebol (8 votos) e Natação (6 votos). O que representam estes números?',
        options: [
          'São dados recolhidos e organizados que nos permitem analisar as preferências da turma.',
          'São erros numéricos que precisam de debugging.',
          'São passos de uma receita de culinária.',
          'São repetições que o computador não consegue ler.',
        ],
        correctIndex: 0,
        explanation: 'Os dados são informações que recolhemos e organizamos em tabelas ou gráficos para procurar respostas e comparar resultados.',
      },
      {
        id: 'w4-q9',
        text: 'O que significa o termo "debugging" na resolução de problemas e algoritmos?',
        options: [
          'Apagar todo o programa assim que algo corre mal.',
          'Procurar, identificar e corrigir erros para que o algoritmo funcione como esperado.',
          'Comprar um computador novo.',
          'Mudar a cor de fundo do ecrã.',
        ],
        correctIndex: 1,
        explanation: 'Debugging significa descobrir onde está o erro (o "bug"), perceber o que devia acontecer e corrigir a instrução até o programa funcionar.',
      },
      {
        id: 'w4-q10',
        text: 'O robô devia virar à direita para entrar na sala, mas virou para a esquerda e bateu numa parede. O que deves fazer?',
        options: [
          'Corrigir a instrução errada mudando "virar à esquerda" para "virar à direita" e testar novamente.',
          'Deixar o robô a bater na parede sem fazer nada.',
          'Apagar todas as instruções que já estavam corretas.',
          'Mudar a porta da sala de sítio.',
        ],
        correctIndex: 0,
        explanation: 'No processo de debugging, analisamos o passo onde ocorreu a falha, substituímos a instrução incorreta pela correta e testamos de novo.',
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
