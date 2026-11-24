export interface WeeklyChallengeOption {
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface WeeklyChallengeTemplate {
  weekNumber: number; // 1 to 52
  worldId: 1 | 2 | 3 | 4 | 5;
  worldName: string;
  category: string;
  difficulty: 'Fácil' | 'Média' | 'Desafio';
  title: string;
  context: string;
  scenarioLabel: string;
  senderOrSource?: string;
  messageSample: string;
  problem: string;
  task: string;
  options: WeeklyChallengeOption[];
  xpReward: number;
}

export interface IsoWeekInfo {
  isoYear: number;
  isoWeek: number;       // 1..53
  catalogWeek: number;   // 1..52
  instanceId: string;    // e.g. 'weekly-2026-w48'
  startDateIso: string;  // YYYY-MM-DD (Monday)
  endDateIso: string;    // YYYY-MM-DD (Sunday)
  dateRangeLabel: string; // e.g. '23 nov – 29 nov 2026'
  daysUntilNextMonday: number;
}

export interface ActiveWeeklyChallenge extends WeeklyChallengeTemplate {
  id: string;            // Unique per year + ISO week, e.g. 'weekly-2026-w48'
  isoYear: number;
  isoWeek: number;
  dateRangeLabel: string;
  daysUntilNextMonday: number;
}

const PT_MONTHS_SHORT = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

function formatDatePtShort(d: Date): string {
  return `${d.getUTCDate()} ${PT_MONTHS_SHORT[d.getUTCMonth()]}`;
}

function toIsoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Computes ISO 8601 week metadata for a given date (UTC-normalized to prevent timezone drift).
 */
export function getIsoWeekInfo(date: Date = new Date()): IsoWeekInfo {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = utc.getUTCDay() || 7; // Monday = 1, Sunday = 7
  const thursday = new Date(utc);
  thursday.setUTCDate(utc.getUTCDate() + 4 - dayNum);

  const isoYear = thursday.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const isoWeek = Math.ceil((((thursday.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  const catalogWeek = ((isoWeek - 1) % 52) + 1;

  const monday = new Date(utc);
  monday.setUTCDate(utc.getUTCDate() - (dayNum - 1));
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const daysUntilNextMonday = 8 - dayNum;
  const instanceId = `weekly-${isoYear}-w${String(isoWeek).padStart(2, '0')}`;
  const dateRangeLabel = `${formatDatePtShort(monday)} – ${formatDatePtShort(sunday)} ${isoYear}`;

  return {
    isoYear,
    isoWeek,
    catalogWeek,
    instanceId,
    startDateIso: toIsoDate(monday),
    endDateIso: toIsoDate(sunday),
    dateRangeLabel,
    daysUntilNextMonday,
  };
}

/**
 * Computes the Monday–Sunday date range label for a specific ISO week number in a given ISO year.
 */
export function getDateRangeForIsoWeek(isoYear: number, weekNumber: number): string {
  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));

  const monday = new Date(week1Monday);
  monday.setUTCDate(week1Monday.getUTCDate() + (weekNumber - 1) * 7);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  return `${formatDatePtShort(monday)} – ${formatDatePtShort(sunday)}`;
}

/**
 * 52 Weekly Challenges — 1 unique challenge for every single week of the year,
 * rotating across all 5 Worlds of Missão TIC 6.º Ano (European Portuguese PT-PT / AO90).
 */
export const WEEKLY_CHALLENGES_52: WeeklyChallengeTemplate[] = [
  // =========================================================================
  // SEMANAS 1 A 10
  // =========================================================================
  {
    weekNumber: 1,
    worldId: 1,
    worldName: 'Guardião Digital',
    category: 'Phishing',
    difficulty: 'Média',
    title: 'O Aviso Urgente do Portátil Escolar',
    context: 'Recebeste uma mensagem no telemóvel com um tom muito apressado.',
    scenarioLabel: 'SMS Recebida',
    senderOrSource: 'alerta@escola-recupera-99.xyz',
    messageSample: 'ALERTA ESCOLAR URGENTE: O teu computador portátil escolar foi bloqueado. Carrega em **http://bit.ly/escola-recupera-99** agora ou a tua matrícula será cancelada **em 15 minutos**!',
    problem: 'A mensagem usa pressa e ameaças para te assustar e impedir de pensar com calma.',
    task: 'Analisa as pistas e escolhe a resposta mais segura.',
    options: [
      {
        text: 'É verdadeira: como fala da escola e é urgente, devo carregar já na ligação antes dos 15 minutos.',
        isCorrect: false,
        explanation: 'Cuidado! A pressa e as ameaças de bloqueio imediato são truques clássicos de phishing para te obrigar a agir sem pensar.',
      },
      {
        text: 'É phishing: usa ameaças de tempo curto, um endereço estranho e quer roubar os meus dados.',
        isCorrect: true,
        explanation: 'Excelente olho de guardião! Mesmo que uma mensagem fale da escola, nunca carregues em ligações suspeitas — confirma sempre com a professora ou com um adulto.',
      },
      {
        text: 'É verdadeira: basta ter o nome da escola para ser de confiança.',
        isCorrect: false,
        explanation: 'Atenção! Qualquer pessoa pode escrever o nome da tua escola numa mensagem falsa. Verifica sempre o remetente oficial.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 2,
    worldId: 2,
    worldName: 'Detetive Digital',
    category: 'Palavras-Chave',
    difficulty: 'Fácil',
    title: 'À Procura do Lince-Ibérico',
    context: 'Tens um trabalho de Ciências sobre o lince-ibérico em Portugal e vais pesquisar na Internet.',
    scenarioLabel: 'Barra de Pesquisa',
    senderOrSource: 'Motor de Busca Escolar',
    messageSample: 'O teu objetivo é descobrir **onde vive o lince-ibérico em Portugal** e quantos existem hoje, sem perder tempo em milhões de páginas sobre gatos domésticos.',
    problem: 'Escrever palavras demasiado gerais traz resultados confusos e pouco úteis.',
    task: 'Qual é a melhor pesquisa para encontrares informação certeira?',
    options: [
      {
        text: 'Escrever apenas "animais".',
        isCorrect: false,
        explanation: 'A palavra "animais" é demasiado vaga e vai mostrar milhões de páginas que não falam do lince-ibérico.',
      },
      {
        text: 'Escrever "lince-ibérico habitat Portugal".',
        isCorrect: true,
        explanation: 'Muito bem! Juntar palavras-chave precisas sobre o animal, o assunto e o país leva-te direto aos resultados mais úteis.',
      },
      {
        text: 'Escrever "gatos grandes bonitos fotos".',
        isCorrect: false,
        explanation: 'Essa pesquisa vai mostrar imagens de gatos e outros felinos, mas não te dará dados fiáveis sobre o lince-ibérico em Portugal.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 3,
    worldId: 3,
    worldName: 'Criador Digital',
    category: 'Netiqueta',
    difficulty: 'Fácil',
    title: 'Gritos no Grupo da Turma',
    context: 'No chat do trabalho de grupo, um colega escreveu uma mensagem que deixou todos desconfortáveis.',
    scenarioLabel: 'Mensagem no Grupo',
    senderOrSource: 'Chat do Trabalho de História',
    messageSample: '"**MANDEM AS VOSSAS PARTES JÁ HOJE!!! ESTÃO SEMPRE ATRASADOS!!!**"',
    problem: 'Escrever tudo em letras maiúsculas e com vários pontos de exclamação parece agressivo.',
    task: 'Qual é a melhor forma de pedir as partes do trabalho com boa netiqueta?',
    options: [
      {
        text: 'Escrever tudo em maiúsculas para que todos leiam mais depressa.',
        isCorrect: false,
        explanation: 'Na Internet, escrever frases inteiras em MAIÚSCULAS equivale a gritar e pode magoar os colegas.',
      },
      {
        text: 'Escrever: "Olá equipa! Podem enviar as vossas partes até às 18h para juntarmos tudo com calma? Obrigado!"',
        isCorrect: true,
        explanation: 'Espetacular! Uma mensagem educada, clara e com minúsculas mantém o bom ambiente e ajuda a equipa a colaborar melhor.',
      },
      {
        text: 'Sair do grupo sem dizer nada e apagar o trabalho dos colegas.',
        isCorrect: false,
        explanation: 'Sair sem falar nem resolver o problema prejudica todo o grupo. Conversar com respeito é sempre o melhor caminho.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 4,
    worldId: 4,
    worldName: 'Engenheiro Digital',
    category: 'Algoritmos',
    difficulty: 'Fácil',
    title: 'A Receita Baralhada do Robô',
    context: 'O robô da cantina precisa de seguir passos na ordem certa para preparar uma sandes.',
    scenarioLabel: 'Lista de Passos do Robô',
    senderOrSource: 'Robô Cozinheiro v2',
    messageSample: 'Passos atuais: 1. **Fechar a sandes** → 2. **Colocar o queijo** → 3. **Cortar o pão**.',
    problem: 'Se a ordem dos passos estiver trocada, o algoritmo falha e faz uma grande confusão.',
    task: 'Qual é a ordem correta para o robô conseguir fazer a sandes?',
    options: [
      {
        text: '1. Cortar o pão → 2. Colocar o queijo → 3. Fechar a sandes.',
        isCorrect: true,
        explanation: 'Certo! Num algoritmo, a ordem exata das instruções é fundamental para que a tarefa corra bem.',
      },
      {
        text: '1. Colocar o queijo → 2. Fechar a sandes → 3. Cortar o pão.',
        isCorrect: false,
        explanation: 'Se o robô tentar fechar a sandes antes de cortar o pão, o queijo vai ficar por fora!',
      },
      {
        text: 'A ordem não interessa, porque o robô adivinha o que queremos.',
        isCorrect: false,
        explanation: 'Os robôs e computadores não adivinham: cumprem exatamente os passos pela ordem que lhes dermos.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 5,
    worldId: 5,
    worldName: 'Explorador da IA',
    category: 'O que é IA',
    difficulty: 'Fácil',
    title: 'A Calculadora Usa Inteligência Artificial?',
    context: 'O Pedro e a Sofia estão a discutir sobre que aparelhos do dia a dia usam mesmo Inteligência Artificial.',
    scenarioLabel: 'Dúvida na Aula de TIC',
    senderOrSource: 'Laboratório do Futuro',
    messageSample: 'O Pedro diz que uma **calculadora simples** a somar 12 + 8 usa IA. A Sofia diz que uma aplicação que **reconhece espécies de plantas numa foto** é que usa IA.',
    problem: 'Nem todos os programas de computador usam Inteligência Artificial.',
    task: 'Quem tem razão nesta conversa?',
    options: [
      {
        text: 'O Pedro, porque qualquer aparelho eletrónico com botões usa IA.',
        isCorrect: false,
        explanation: 'Nem todos os aparelhos eletrónicos usam IA. Uma calculadora simples apenas segue regras matemáticas fixas.',
      },
      {
        text: 'A Sofia, porque reconhecer plantas em fotos exige aprender padrões a partir de muitos exemplos.',
        isCorrect: true,
        explanation: 'Acertaste! A IA aprende padrões com muitos exemplos para reconhecer imagens, vozes ou textos, enquanto a calculadora só aplica fórmulas fixas.',
      },
      {
        text: 'Nenhum dos dois, porque a IA só existe em filmes de ficção científica.',
        isCorrect: false,
        explanation: 'A IA já está presente em muitas ferramentas do nosso dia a dia, como tradutores e aplicações de reconhecimento de imagens.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 6,
    worldId: 1,
    worldName: 'Guardião Digital',
    category: 'Palavras-Passe',
    difficulty: 'Fácil',
    title: 'Escolhe a Chave do Teu Castelo',
    context: 'A Inês acabou de criar a sua conta na plataforma da biblioteca e precisa de escolher uma palavra-passe forte.',
    scenarioLabel: 'Nova Palavra-Passe',
    senderOrSource: 'Biblioteca Escolar Online',
    messageSample: 'A Inês faz anos em **2015**, adora futebol e o seu cão chama-se **Boby**. Ela quer uma palavra-passe com **8 ou mais caracteres**, letras, números e símbolos.',
    problem: 'Palavras-passe com o próprio nome, ano de nascimento ou sequências simples são fáceis de adivinhar.',
    task: 'Qual destas palavras-passe protege melhor a conta da Inês?',
    options: [
      {
        text: 'Ines2015',
        isCorrect: false,
        explanation: 'Esta palavra-passe usa o nome e o ano de nascimento, que são dados fáceis de descobrir, e não tem símbolos.',
      },
      {
        text: 'Boby1234',
        isCorrect: false,
        explanation: 'O nome do animal de estimação seguido de "1234" é uma das combinações mais fáceis de adivinhar.',
      },
      {
        text: 'Pinguim#Salta!84',
        isCorrect: true,
        explanation: 'Brilhante! É comprida, divertida de lembrar e mistura maiúsculas, minúsculas, números e símbolos sem dados pessoais.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 7,
    worldId: 2,
    worldName: 'Detetive Digital',
    category: 'Autoria e Fontes',
    difficulty: 'Média',
    title: 'Quem Escreveu Este Artigo?',
    context: 'Estás a pesquisar sobre os vulcões dos Açores e encontraste dois sites diferentes.',
    scenarioLabel: 'Comparação de Páginas',
    senderOrSource: 'Caderno do Detetive',
    messageSample: 'Site A: **Página anónima** cheia de anúncios a piscar, sem autor nem fontes. Site B: **Museu de Ciências e Universidade dos Açores**, com o nome dos investigadores e a data.',
    problem: 'Saber quem escreveu uma informação ajuda a perceber se podemos confiar nela.',
    task: 'Qual dos sites deves escolher para o teu trabalho escolar?',
    options: [
      {
        text: 'O Site A, porque tem anúncios coloridos e parece mais divertido.',
        isCorrect: false,
        explanation: 'Anúncios chamativos e falta de autor são sinais de alerta. Sem saber quem escreveu, não podemos confiar na informação.',
      },
      {
        text: 'O Site B, porque identifica autores especialistas e uma instituição de confiança.',
        isCorrect: true,
        explanation: 'Muito bem, detetive! Instituições científicas e autores identificados mostram transparência e maior rigor.',
      },
      {
        text: 'Copiar textos dos dois sites ao acaso sem ler quem os escreveu.',
        isCorrect: false,
        explanation: 'Um bom detetive verifica sempre quem publicou a informação antes de a utilizar.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 8,
    worldId: 3,
    worldName: 'Criador Digital',
    category: 'Direitos de Autor',
    difficulty: 'Média',
    title: 'A Fotografia Encontrada no Google',
    context: 'O Miguel encontrou uma fotografia espetacular de uma águia no Google Imagens e quer colocá-la na capa do seu trabalho.',
    scenarioLabel: 'Capa do Trabalho',
    senderOrSource: 'Projeto de Ciências Naturais',
    messageSample: 'O Miguel pensa: **"Se a fotografia apareceu no Google Imagens, então é gratuita e posso dizer que fui eu que a tirei!"**',
    problem: 'Estar na Internet não significa que uma imagem não tenha autor nem regras de utilização.',
    task: 'O que deve o Miguel fazer para respeitar os direitos de autor?',
    options: [
      {
        text: 'Usar a foto e escrever o seu próprio nome por baixo.',
        isCorrect: false,
        explanation: 'Isso seria plágio! Dizer que uma fotografia de outra pessoa é nossa desrespeita o trabalho do autor.',
      },
      {
        text: 'Verificar se a imagem permite reutilização (como Creative Commons) e indicar o nome do autor e a fonte.',
        isCorrect: true,
        explanation: 'Perfeito! Verificar a licença e indicar sempre o autor mostra respeito e honestidade nos trabalhos escolares.',
      },
      {
        text: 'Cortar a assinatura do fotógrafo para ninguém reparar.',
        isCorrect: false,
        explanation: 'Apagar o nome do autor nunca é correto e viola os direitos de autor.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 9,
    worldId: 4,
    worldName: 'Engenheiro Digital',
    category: 'Condições SE/SENÃO',
    difficulty: 'Fácil',
    title: 'O Sensor de Chuva da Escola',
    context: 'Estás a programar o telhado automático do recreio para proteger os alunos quando começa a chover.',
    scenarioLabel: 'Regra do Programa',
    senderOrSource: 'Sistema do Recreio Inteligente',
    messageSample: 'O sensor deteta se está a cair chuva: **SE estiver a chover**, o toldo deve abrir. **SENÃO**, o toldo fica fechado para entrar sol.',
    problem: 'As condições permitem ao computador escolher ações diferentes consoante a situação.',
    task: 'Se o sensor indicar que está um dia de sol (não está a chover), o que vai fazer o programa?',
    options: [
      {
        text: 'Vai abrir o toldo na mesma.',
        isCorrect: false,
        explanation: 'Abrir o toldo só acontece quando a condição "estiver a chover" é verdadeira.',
      },
      {
        text: 'Vai executar a parte do SENÃO e manter o toldo fechado.',
        isCorrect: true,
        explanation: 'Correto! Como a condição é falsa (não chove), o programa segue o caminho do SENÃO.',
      },
      {
        text: 'O programa vai desligar o computador por erro.',
        isCorrect: false,
        explanation: 'Não há nenhum erro: o bloco SENÃO existe precisamente para indicar o que fazer quando a condição não se verifica.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 10,
    worldId: 5,
    worldName: 'Explorador da IA',
    category: 'Prompts',
    difficulty: 'Média',
    title: 'Pedir Ajuda à IA para Estudar',
    context: 'Queres usar um assistente de IA para perceber melhor o ciclo da água para o teste de Ciências.',
    scenarioLabel: 'Caixa de Pedido (Prompt)',
    senderOrSource: 'Assistente de Estudo',
    messageSample: 'Precisas de uma explicação **curta**, com **linguagem simples para o 6.º ano** e **exemplos do dia a dia** sobre o ciclo da água.',
    problem: 'Pedidos demasiado vagos geram respostas confusas ou difíceis demais.',
    task: 'Qual destes prompts vai dar a melhor resposta para estudares?',
    options: [
      {
        text: '"Água."',
        isCorrect: false,
        explanation: 'Este pedido é demasiado vago! A IA não sabe se queres falar de rios, receitas ou do ciclo da água.',
      },
      {
        text: '"Faz-me o trabalho todo de Ciências."',
        isCorrect: false,
        explanation: 'Pedir à IA para fazer o trabalho todo não te ajuda a aprender e não explica o tema nem o formato.',
      },
      {
        text: '"Explica o ciclo da água a um aluno de 10 anos, em 4 pontos simples e com um exemplo do dia a dia."',
        isCorrect: true,
        explanation: 'Fantástico! Um bom prompt indica claramente o tema, para quem é a explicação e como queres a resposta.',
      },
    ],
    xpReward: 30,
  },

  // =========================================================================
  // SEMANAS 11 A 20
  // =========================================================================
  {
    weekNumber: 11,
    worldId: 1,
    worldName: 'Guardião Digital',
    category: 'Privacidade',
    difficulty: 'Fácil',
    title: 'O Novo Perfil de Videojogo',
    context: 'Estás a criar o teu perfil num jogo online divertido onde jogam pessoas que não conheces.',
    scenarioLabel: 'Formulário de Perfil Público',
    senderOrSource: 'Jogo Super Corrida Online',
    messageSample: 'O perfil público vai ficar visível para todos os jogadores. Que informação deves guardar no teu **Cofre Secreto** e **NUNCA** publicar?',
    problem: 'Publicar dados pessoais num perfil público pode pôr em risco a tua segurança no mundo real.',
    task: 'Escolhe a opção mais segura para configurar o teu perfil.',
    options: [
      {
        text: 'Escrever o meu nome completo, a morada da minha casa e o nome da minha escola.',
        isCorrect: false,
        explanation: 'Nunca partilhes a tua morada, escola ou nome completo com desconhecidos online!',
      },
      {
        text: 'Usar um nome de jogo inventado e um avatar ilustrado, sem dados pessoais.',
        isCorrect: true,
        explanation: 'Excelente escolha! Um nome de jogo criativo e um avatar protegem a tua identidade e privacidade.',
      },
      {
        text: 'Colocar o meu número de telemóvel para fazer novos amigos depressa.',
        isCorrect: false,
        explanation: 'O teu número de telemóvel é privado e nunca deve ser publicado em perfis abertos.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 12,
    worldId: 2,
    worldName: 'Detetive Digital',
    category: 'Data e Atualização',
    difficulty: 'Média',
    title: 'O Nevão de Há Cinco Anos',
    context: 'A Beatriz viu uma notícia partilhada num grupo a dizer que vai nevar amanhã e que as escolas vão fechar.',
    scenarioLabel: 'Notícia Partilhada',
    senderOrSource: 'Publicação nas Redes',
    messageSample: 'Título: **"URGENTE: Escolas fecham amanhã por causa do nevão!"** — Mas lá em baixo, em letras pequenas, a data diz: **14 de janeiro de 2019**.',
    problem: 'Notícias antigas podem ser partilhadas hoje como se fossem atuais e enganar toda a gente.',
    task: 'O que deve a Beatriz fazer ao reparar na data da notícia?',
    options: [
      {
        text: 'Não partilhar e avisar com calma que a notícia é antiga e de outro ano.',
        isCorrect: true,
        explanation: 'Muito bem! Verificar a data evita espalhar sustos e boatos com notícias fora de prazo.',
      },
      {
        text: 'Partilhar logo em todos os grupos para ninguém ir às aulas.',
        isCorrect: false,
        explanation: 'Partilhar sem confirmar a data só cria confusão e espalha desinformação.',
      },
      {
        text: 'Ignorar a data porque o tempo é igual todos os anos.',
        isCorrect: false,
        explanation: 'A meteorologia e os avisos escolares mudam todos os dias! A data é uma pista essencial.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 13,
    worldId: 3,
    worldName: 'Criador Digital',
    category: 'Trabalho em Equipa',
    difficulty: 'Fácil',
    title: 'Duas Ideias Diferentes no Grupo',
    context: 'Tu e o teu colega estão a criar uma apresentação partilhada sobre o Sistema Solar, mas querem capas diferentes.',
    scenarioLabel: 'Documento Partilhado',
    senderOrSource: 'Apresentação da Turma',
    messageSample: 'Tu queres um fundo azul escuro com estrelas. O teu colega já desenhou um foguetão colorido no diapositivo da capa.',
    problem: 'Apagar o trabalho de um colega sem falar gera zangas e estraga o espírito de equipa.',
    task: 'Qual é a melhor atitude de superequipa?',
    options: [
      {
        text: 'Apagar o foguetão do colega quando ele não estiver a ver.',
        isCorrect: false,
        explanation: 'Nunca se deve apagar o trabalho de um colega sem conversar primeiro.',
      },
      {
        text: 'Conversar com calma e juntar o melhor das duas ideias: o fundo estrelado com o foguetão dele!',
        isCorrect: true,
        explanation: 'Isso mesmo! Ouvir, respeitar e combinar ideias torna o trabalho de grupo muito mais rico.',
      },
      {
        text: 'Deixar de falar com o colega e recusar terminar a apresentação.',
        isCorrect: false,
        explanation: 'Numa boa equipa, as diferenças resolvem-se a conversar e a cooperar.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 14,
    worldId: 4,
    worldName: 'Engenheiro Digital',
    category: 'Superciclos',
    difficulty: 'Fácil',
    title: 'Desenhar um Quadrado Sem Cansar',
    context: 'O robô desenhador precisa de desenhar um quadrado com 4 lados iguais.',
    scenarioLabel: 'Código do Robô',
    senderOrSource: 'Oficina de Programação',
    messageSample: 'Em vez de escrever 8 linhas compridas (**Avançar, Virar 90º** quatro vezes seguidas), podes usar um **ciclo de repetição**.',
    problem: 'Repetir comandos à mão dá muito trabalho e aumenta a hipótese de erros.',
    task: 'Qual é o bloco de repetição mais curto e correto para desenhar o quadrado?',
    options: [
      {
        text: 'REPETIR 4 VEZES: [ Avançar 1 lado + Virar 90º à direita ].',
        isCorrect: true,
        explanation: 'Brilhante! Com um ciclo de 4 repetições, o robô desenha os 4 lados do quadrado com muito menos linhas de código.',
      },
      {
        text: 'REPETIR 10 VEZES: [ Avançar 1 lado ].',
        isCorrect: false,
        explanation: 'Sem virar 90º, o robô ia apenas desenhar uma linha reta gigante!',
      },
      {
        text: 'REPETIR 2 VEZES: [ Virar 90º à direita ].',
        isCorrect: false,
        explanation: 'Assim o robô só rodava no mesmo sítio e não desenhava nenhum lado.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 15,
    worldId: 5,
    worldName: 'Explorador da IA',
    category: 'Alucinações da IA',
    difficulty: 'Média',
    title: 'O Livro Que Nunca Existiu',
    context: 'Pediste à IA uma curiosidade sobre os Descobrimentos Portugueses e ela respondeu com um ar muito seguro.',
    scenarioLabel: 'Resposta do Assistente de IA',
    senderOrSource: 'Chat de IA',
    messageSample: '"Em **1498**, Vasco da Gama escreveu o livro **Aventuras no Submarino Verde** durante a viagem até à Índia."',
    problem: 'A IA pode "alucinar" e inventar factos errados com um tom muito convincente.',
    task: 'O que deves fazer perante esta resposta da IA?',
    options: [
      {
        text: 'Copiar logo para o trabalho porque está muito bem escrito.',
        isCorrect: false,
        explanation: 'Cuidado! Em 1498 não existiam submarinos — a IA inventou um disparate com ar muito sério.',
      },
      {
        text: 'Desconfiar da resposta e confirmar a informação no manual escolar ou numa enciclopédia de confiança.',
        isCorrect: true,
        explanation: 'Acertaste! A IA pode cometer erros ou inventar livros e datas. Confirma sempre os factos importantes.',
      },
      {
        text: 'Acreditar porque os computadores nunca se enganam em datas.',
        isCorrect: false,
        explanation: 'As ferramentas de IA generativa podem enganar-se muitas vezes em datas e nomes históricos.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 16,
    worldId: 1,
    worldName: 'Guardião Digital',
    category: 'Bem-Estar Digital',
    difficulty: 'Fácil',
    title: 'A Regra Mágica dos 20-20-20',
    context: 'O Diogo está a fazer um projeto no computador há quase uma hora e começa a sentir os olhos cansados.',
    scenarioLabel: 'Pausa Saudável',
    senderOrSource: 'Guia do Supercorpo',
    messageSample: 'Os olhos precisam de pequenas pausas regulares para não ficarem secos nem cansados quando usamos ecrãs.',
    problem: 'Ficar horas seguidas a olhar de perto para um ecrã cansa a vista e pode dar dores de cabeça.',
    task: 'Como funciona corretamente a regra dos 20-20-20?',
    options: [
      {
        text: 'De 20 em 20 minutos, olhar durante 20 segundos para algo a cerca de 6 metros de distância.',
        isCorrect: true,
        explanation: 'Muito bem! Olhar para longe de 20 em 20 minutos relaxa os músculos dos olhos e renova a tua energia.',
      },
      {
        text: 'Aumentar o brilho do ecrã 20% de 20 em 20 minutos.',
        isCorrect: false,
        explanation: 'Aumentar demasiado o brilho cansa ainda mais os olhos.',
      },
      {
        text: 'Jogar 20 horas seguidas sem fazer pausas.',
        isCorrect: false,
        explanation: 'Isso seria muito prejudicial para a visão, para a postura e para o sono!',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 17,
    worldId: 2,
    worldName: 'Detetive Digital',
    category: 'Facto vs. Opinião',
    difficulty: 'Fácil',
    title: 'Facto Provado ou Gosto Pessoal?',
    context: 'Ao ler artigos na Internet, um detetive sabe distinguir factos reais das opiniões de quem escreve.',
    scenarioLabel: 'Três Frases na Internet',
    senderOrSource: 'Caderno de Investigação',
    messageSample: 'Lê com atenção as três frases das opções abaixo e descobre qual delas é um **FACTO** que pode ser comprovado.',
    problem: 'Misturar opiniões com factos pode levar-nos a tirar conclusões erradas.',
    task: 'Qual destas frases é um FACTO e não uma opinião?',
    options: [
      {
        text: '"O gelado de chocolate é muito melhor do que o de morango."',
        isCorrect: false,
        explanation: 'Isso é uma opinião: depende do gosto pessoal de cada um.',
      },
      {
        text: '"A Terra dá uma volta completa ao Sol em cerca de 365 dias."',
        isCorrect: true,
        explanation: 'Correto! É um facto científico comprovado que não depende de preferências pessoais.',
      },
      {
        text: '"As aulas de sexta-feira são as mais divertidas da semana."',
        isCorrect: false,
        explanation: 'Isso é uma opinião, pois cada aluno pode preferir um dia diferente.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 18,
    worldId: 3,
    worldName: 'Criador Digital',
    category: 'Creative Commons',
    difficulty: 'Média',
    title: 'O Símbolo "BY" nas Imagens',
    context: 'A Matilde encontrou uma ilustração livre com a licença **Creative Commons BY** para o jornal da escola.',
    scenarioLabel: 'Etiqueta de Licença',
    senderOrSource: 'Banco de Imagens Educativo',
    messageSample: 'Licença da ilustração: **CC BY** — O autor permite usar a imagem gratuitamente, desde que cumpras a regra do símbolo **BY** (uma pequena pessoa).',
    problem: 'As licenças Creative Commons têm regras simples que temos de respeitar.',
    task: 'O que tem a Matilde de fazer para cumprir a regra BY?',
    options: [
      {
        text: 'Indicar claramente quem é o autor original da ilustração.',
        isCorrect: true,
        explanation: 'Certo! O símbolo BY significa Atribuição: basta indicar o nome de quem criou a obra.',
      },
      {
        text: 'Pagar 50 euros antes de colocar a imagem no jornal.',
        isCorrect: false,
        explanation: 'A licença CC BY é gratuita; apenas pede para indicar o nome do autor.',
      },
      {
        text: 'Esconder o nome do autor para a imagem ficar mais limpa.',
        isCorrect: false,
        explanation: 'Esconder o nome do autor vai contra a regra principal da licença BY.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 19,
    worldId: 4,
    worldName: 'Engenheiro Digital',
    category: 'Decomposição',
    difficulty: 'Fácil',
    title: 'Partir uma Grande Festa em Fatias',
    context: 'A tua turma vai organizar uma exposição de robótica na escola e a tarefa parece gigante!',
    scenarioLabel: 'Plano da Exposição',
    senderOrSource: 'Equipa de Engenharia',
    messageSample: 'Em vez de tentar fazer tudo de uma vez e ficar baralhado, podemos usar a **decomposição**: dividir o desafio grande em tarefas pequenas.',
    problem: 'Tentar resolver um problema enorme tudo ao mesmo tempo gera confusão.',
    task: 'Qual é o melhor exemplo de decomposição para organizar a exposição?',
    options: [
      {
        text: 'Dividir em etapas: 1. Escolher o espaço → 2. Fazer cartazes → 3. Preparar os robôs → 4. Convidar as turmas.',
        isCorrect: true,
        explanation: 'Espetacular! Dividir um grande desafio em pequenos passos ordenados torna tudo mais simples e fácil de concluir.',
      },
      {
        text: 'Desistir porque há demasiadas coisas para fazer.',
        isCorrect: false,
        explanation: 'Com decomposição, até os maiores projetos ficam fáceis de resolver passo a passo!',
      },
      {
        text: 'Fazer apenas os convites e esquecer de preparar os robôs.',
        isCorrect: false,
        explanation: 'Uma boa decomposição garante que nenhuma parte importante fica esquecida.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 20,
    worldId: 5,
    worldName: 'Explorador da IA',
    category: 'Privacidade na IA',
    difficulty: 'Média',
    title: 'Segredos que Nunca Vão para o Chat de IA',
    context: 'O Gonçalo quer pedir à IA ideias para escrever uma carta de apresentação sobre a sua turma.',
    scenarioLabel: 'Rascunho de Pedido à IA',
    senderOrSource: 'Assistente Online Público',
    messageSample: 'Antes de enviar o pedido, o Gonçalo pensa se deve escrever a **morada da sua casa**, o **telemóvel dos pais** e a **palavra-passe do seu e-mail escolar**.',
    problem: 'O que escreves em ferramentas públicas de IA pode ficar guardado nos servidores.',
    task: 'Qual é a atitude mais segura ao escrever o pedido à IA?',
    options: [
      {
        text: 'Escrever todos os dados reais para a carta ficar mais verdadeira.',
        isCorrect: false,
        explanation: 'Nunca coloques moradas, telemóveis ou palavras-passe numa ferramenta de IA!',
      },
      {
        text: 'Descrever apenas ideias gerais e inventar nomes fictícios, sem revelar dados pessoais.',
        isCorrect: true,
        explanation: 'Excelente! Podes pedir ajuda criativa à IA sem nunca partilhar a tua identidade nem os teus segredos.',
      },
      {
        text: 'Colocar apenas a palavra-passe da escola e esconder a morada.',
        isCorrect: false,
        explanation: 'A palavra-passe é um dos dados mais sensíveis e nunca deve ser escrita em lado nenhum além do início de sessão oficial.',
      },
    ],
    xpReward: 30,
  },

  // =========================================================================
  // SEMANAS 21 A 30
  // =========================================================================
  {
    weekNumber: 21,
    worldId: 1,
    worldName: 'Guardião Digital',
    category: 'Pegada Digital',
    difficulty: 'Média',
    title: 'O Comentário Apagado Desaparece Mesmo?',
    context: 'O Lucas escreveu um comentário mal-educado num jogo depois de perder e apagou-o passado um minuto.',
    scenarioLabel: 'Chat do Jogo',
    senderOrSource: 'Partida Online',
    messageSample: 'O Lucas pensa: **"Como já apaguei a mensagem, ninguém a vai voltar a ver e não ficou nenhum rasto!"**',
    problem: 'Na Internet, mesmo o que apagamos pode já ter sido guardado em capturas de ecrã ou servidores.',
    task: 'O que nos ensina a regra da Pegada Digital sobre esta situação?',
    options: [
      {
        text: 'Alguém pode já ter tirado uma captura de ecrã, por isso devemos pensar sempre antes de escrever.',
        isCorrect: true,
        explanation: 'Exatamente! Tudo o que publicamos deixa uma marca digital. Respira fundo antes de responder quando estás chateado.',
      },
      {
        text: 'Se apagarmos em menos de 5 minutos, desaparece de todos os telemóveis do mundo.',
        isCorrect: false,
        explanation: 'Infelizmente não é assim: outra pessoa pode ter guardado uma captura de ecrã antes de apagares.',
      },
      {
        text: 'Nos jogos online não existe pegada digital.',
        isCorrect: false,
        explanation: 'Chats de jogos, comentários e perfis fazem todos parte da nossa pegada digital.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 22,
    worldId: 2,
    worldName: 'Detetive Digital',
    category: 'Comparar Fontes',
    difficulty: 'Média',
    title: 'Um Único Blogue Diz que Marte É Verde',
    context: 'Encontraste um blogue desconhecido a anunciar que os cientistas descobriram que o planeta Marte ficou verde ontem.',
    scenarioLabel: 'Verificação de Pistas',
    senderOrSource: 'Blogue Curiosidades Rápidas',
    messageSample: 'Apenas **um site anónimo** fala nesta descoberta. Nenhum jornal científico nem a agência espacial dizem uma palavra sobre isso.',
    problem: 'Confiar numa única fonte desconhecida pode fazer-nos cair em boatos.',
    task: 'O que faz um verdadeiro Detetive Digital neste caso?',
    options: [
      {
        text: 'Confirma em duas ou três fontes oficiais e científicas antes de acreditar ou partilhar.',
        isCorrect: true,
        explanation: 'Muito bem! Uma única fonte é apenas uma pista; comparar com fontes de confiança ajuda a descobrir a verdade.',
      },
      {
        text: 'Partilha logo no grupo porque seria uma novidade incrível.',
        isCorrect: false,
        explanation: 'Quanto mais espantosa for uma notícia, mais cuidado devemos ter em confirmá-la primeiro.',
      },
      {
        text: 'Acredita se o blogue tiver muitas fotografias bonitas.',
        isCorrect: false,
        explanation: 'Hoje em dia é muito fácil editar imagens ou criá-las com IA. Precisamos de confirmar em fontes independentes.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 23,
    worldId: 3,
    worldName: 'Criador Digital',
    category: 'Plágio e Citações',
    difficulty: 'Média',
    title: 'Usar a Frase de um Cientista no Trabalho',
    context: 'A Carolina está a fazer um trabalho sobre baleias e quer incluir uma frase exata que leu num livro da biblioteca.',
    scenarioLabel: 'Texto do Trabalho',
    senderOrSource: 'Caderno de Pesquisa',
    messageSample: 'A Carolina quer citar a frase: **"A baleia-azul é o maior animal que alguma vez viveu na Terra."**',
    problem: 'Copiar uma frase exata sem dizer de onde veio é plágio.',
    task: 'Como deve a Carolina escrever essa frase para evitar o plágio?',
    options: [
      {
        text: 'Colocar a frase entre aspas e indicar o nome do autor e do livro.',
        isCorrect: true,
        explanation: 'Perfeito! Usar aspas e indicar a fonte valoriza o teu trabalho e mostra que investigaste a sério.',
      },
      {
        text: 'Copiar a frase sem aspas e não dizer onde a encontrou.',
        isCorrect: false,
        explanation: 'Copiar sem indicar a origem faz parecer que fomos nós que escrevemos, e isso chama-se plágio.',
      },
      {
        text: 'Inventar um nome de livro falso para impressionar a professora.',
        isCorrect: false,
        explanation: 'Indicar fontes falsas nunca é correto. Deve-se citar sempre a fonte real.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 24,
    worldId: 4,
    worldName: 'Engenheiro Digital',
    category: 'Depuração (Debugging)',
    difficulty: 'Média',
    title: 'O Robô Bateu na Parede!',
    context: 'Programaste o robô para andar 3 casas em frente e virar à direita para entrar na sala, mas ele virou para a parede.',
    scenarioLabel: 'Lista de Comandos',
    senderOrSource: 'Simulador do Robô',
    messageSample: 'Passo 1: Avançar 3 casas → Passo 2: **Virar à esquerda** → Passo 3: Entrar na sala (bateu na parede!).',
    problem: 'Um pequeno erro (bug) num passo impede o algoritmo de chegar ao objetivo.',
    task: 'Como fazes a depuração (debugging) deste programa?',
    options: [
      {
        text: 'Corrigir o Passo 2 para "Virar à direita" e voltar a testar o robô.',
        isCorrect: true,
        explanation: 'Acertaste! Fazer debugging é encontrar exatamente o passo com erro, corrigi-lo e testar de novo.',
      },
      {
        text: 'Apagar o programa inteiro e desistir da missão.',
        isCorrect: false,
        explanation: 'Os Passos 1 e 3 estavam certos! Só precisas de corrigir o passo que falhou.',
      },
      {
        text: 'Mandar o robô andar mais depressa contra a parede.',
        isCorrect: false,
        explanation: 'Andar mais depressa não resolve o erro de direção no algoritmo.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 25,
    worldId: 5,
    worldName: 'Explorador da IA',
    category: 'Recomendações',
    difficulty: 'Fácil',
    title: 'Sempre os Mesmos Vídeos no Ecrã',
    context: 'O Martim viu três vídeos sobre skate e agora a aplicação só lhe recomenda vídeos de skate uns atrás dos outros.',
    scenarioLabel: 'Página de Sugestões',
    senderOrSource: 'Plataforma de Vídeos',
    messageSample: 'A aplicação usa um algoritmo de recomendação que mostra **conteúdos parecidos com os últimos que viste** para te manter a ver mais tempo.',
    problem: 'Ficar preso na mesma "bolha" faz-nos perder outros temas interessantes.',
    task: 'O que pode o Martim fazer para manter a autonomia e descobrir coisas novas?',
    options: [
      {
        text: 'Pesquisar por iniciativa própria outros temas diferentes, como ciência, música ou desenhos.',
        isCorrect: true,
        explanation: 'Excelente! Uma recomendação é só uma sugestão — tu é que escolhes o que queres explorar.',
      },
      {
        text: 'Acreditar que já não existem outros temas na Internet.',
        isCorrect: false,
        explanation: 'A Internet tem milhões de assuntos; a aplicação é que só te está a mostrar o que parecia igual ao anterior.',
      },
      {
        text: 'Ver todos os vídeos sugeridos sem nunca parar.',
        isCorrect: false,
        explanation: 'Ver vídeos sem parar cansa a vista e tira-te tempo para brincar, estudar e descansar.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 26,
    worldId: 1,
    worldName: 'Guardião Digital',
    category: 'Phishing',
    difficulty: 'Média',
    title: 'A Consola Grátis em 24 Horas',
    context: 'Recebeste um e-mail a anunciar que ganhaste uma consola de videojogos num sorteio onde nunca participaste.',
    scenarioLabel: 'E-mail Recebido',
    senderOrSource: 'premio-instantaneo@sorteios-rapid0s.xyz',
    messageSample: 'Parabéns! Ganhaste uma consola! Para receberes **em 24 horas**, carrega na ligação e escreve o teu **e-mail e a palavra-passe da escola**.',
    problem: 'Prémios demasiado bons para ser verdade que pedem a palavra-passe são armadilhas.',
    task: 'Qual é o maior sinal de alerta nesta mensagem?',
    options: [
      {
        text: 'Pede a palavra-passe da escola, usa um endereço estranho e cria pressa para te enganar.',
        isCorrect: true,
        explanation: 'Excelente! Nenhum passatempo verdadeiro pede a tua palavra-passe. Apaga o e-mail e avisa um adulto.',
      },
      {
        text: 'Não há nenhum sinal de alerta porque tem a palavra "Parabéns".',
        isCorrect: false,
        explanation: 'Os burlões usam palavras simpáticas como "Parabéns" precisamente para te entusiasmar e distrair.',
      },
      {
        text: 'Devo responder só com a palavra-passe para testar se é verdade.',
        isCorrect: false,
        explanation: 'Nunca dês a tua palavra-passe a ninguém, nem por brincadeira nem para testar!',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 27,
    worldId: 2,
    worldName: 'Detetive Digital',
    category: 'Notícias Falsas',
    difficulty: 'Média',
    title: 'A Fotografia Reciclada',
    context: 'Circula na Internet uma foto de uma praia cheia de lixo com a legenda: "Praia portuguesa destruída esta manhã!".',
    scenarioLabel: 'Pista Fotográfica',
    senderOrSource: 'Verificador de Imagens',
    messageSample: 'Ao investigar a imagem, descobres que essa fotografia verdadeira foi tirada **noutro país há 7 anos**.',
    problem: 'Uma fotografia real pode ser usada fora de contexto para criar uma notícia falsa.',
    task: 'Como classificas esta publicação?',
    options: [
      {
        text: 'É verdadeira porque a fotografia é real e não foi desenhada.',
        isCorrect: false,
        explanation: 'Mesmo sendo uma foto real, usar uma imagem antiga doutro sítio para inventar uma notícia de hoje é enganador.',
      },
      {
        text: 'É informação enganadora: usa uma foto verdadeira fora do seu contexto original.',
        isCorrect: true,
        explanation: 'Bravo, detetive! Verificar o contexto e a data das fotografias ajuda a desmascarar notícias falsas.',
      },
      {
        text: 'É uma opinião pessoal sobre o verão.',
        isCorrect: false,
        explanation: 'Não é uma opinião — está a tentar fazer passar um acontecimento antigo por uma notícia falsa de hoje.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 28,
    worldId: 3,
    worldName: 'Criador Digital',
    category: 'Empatia Online',
    difficulty: 'Fácil',
    title: 'Defender um Colega no Chat',
    context: 'Num grupo online da turma, dois colegas começam a gozar com o desenho que o Rui partilhou.',
    scenarioLabel: 'Conversa no Grupo',
    senderOrSource: 'Grupo da Turma',
    messageSample: 'O Rui ficou triste e deixou de responder. Alguns alunos estão apenas a ver sem dizer nada.',
    problem: 'Os comentários ofensivos magoam pessoas reais do outro lado do ecrã.',
    task: 'Qual é a atitude mais responsável e amiga?',
    options: [
      {
        text: 'Responder com mais insultos contra os colegas que gozaram.',
        isCorrect: false,
        explanation: 'Responder com insultos só piora a discussão e aumenta o problema.',
      },
      {
        text: 'Apoiar o Rui com uma mensagem simpática, não rir dos insultos e avisar um adulto de confiança.',
        isCorrect: true,
        explanation: 'Excelente atitude! Apoiar quem está a ser magoado e pedir ajuda a um adulto trava o cyberbullying.',
      },
      {
        text: 'Reencaminhar os insultos para outras turmas para ver o que acham.',
        isCorrect: false,
        explanation: 'Espalhar comentários ofensivos magoa ainda mais o colega.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 29,
    worldId: 4,
    worldName: 'Engenheiro Digital',
    category: 'Dados e Tabelas',
    difficulty: 'Fácil',
    title: 'Os Livros Lidos pela Turma',
    context: 'A biblioteca fez uma tabela com os livros lidos em cada mês pela tua turma.',
    scenarioLabel: 'Tabela de Dados',
    senderOrSource: 'Biblioteca Escolar',
    messageSample: 'Outubro: **14 livros** | Novembro: **22 livros** | Dezembro: **19 livros**.',
    problem: 'Organizar números em tabelas ajuda-nos a comparar resultados depressa.',
    task: 'Em que mês a turma leu mais livros e qual é a vantagem desta tabela?',
    options: [
      {
        text: 'Em novembro (22 livros), e a tabela permite comparar os valores rapidamente.',
        isCorrect: true,
        explanation: 'Certo! Quando os dados estão organizados, conseguimos encontrar o maior valor e tirar conclusões num instante.',
      },
      {
        text: 'Em outubro (14 livros), porque aparece primeiro na lista.',
        isCorrect: false,
        explanation: 'Devemos comparar os números: 22 é maior do que 14 e 19.',
      },
      {
        text: 'As tabelas não ajudam a comparar números.',
        isCorrect: false,
        explanation: 'Pelo contrário: tabelas e gráficos servem exatamente para facilitar a leitura e comparação de dados.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 30,
    worldId: 5,
    worldName: 'Explorador da IA',
    category: 'IA Generativa',
    difficulty: 'Média',
    title: 'A IA Faz o Trabalho por Mim?',
    context: 'O Afonso pediu à IA um texto sobre a reciclagem e está a pensar entregá-lo à professora sem sequer o ler.',
    scenarioLabel: 'Decisão Escolar',
    senderOrSource: 'Trabalho de Cidadania',
    messageSample: 'A IA gerou um texto inteiro em 3 segundos. O Afonso ainda não verificou os factos nem escreveu nada pelas suas palavras.',
    problem: 'Entregar textos da IA sem ler nem compreender impede-te de aprender e pode incluir erros.',
    task: 'Qual é a forma responsável de usar a IA neste trabalho?',
    options: [
      {
        text: 'Entregar logo sem ler para acabar mais depressa.',
        isCorrect: false,
        explanation: 'Se não leres nem confirmares, podes entregar erros inventados pela IA e não aprendes nada.',
      },
      {
        text: 'Usar a IA apenas para ideias e explicações, confirmar os factos e escrever o trabalho pelas tuas palavras.',
        isCorrect: true,
        explanation: 'Brilhante! A IA é uma ferramenta de apoio, mas quem pensa, verifica e aprende és tu.',
      },
      {
        text: 'Apagar o nome da disciplina e entregar igual.',
        isCorrect: false,
        explanation: 'O teu cérebro e a tua compreensão são o mais importante em qualquer trabalho escolar.',
      },
    ],
    xpReward: 30,
  },

  // =========================================================================
  // SEMANAS 31 A 40
  // =========================================================================
  {
    weekNumber: 31,
    worldId: 1,
    worldName: 'Guardião Digital',
    category: 'Palavras-Passe',
    difficulty: 'Fácil',
    title: 'O Amigo que Pede a Palavra-Passe',
    context: 'O teu melhor amigo diz que quer entrar na tua conta do jogo para te ajudar a subir de nível.',
    scenarioLabel: 'Pedido de um Amigo',
    senderOrSource: 'Mensagem Privada',
    messageSample: '"Empresta-me a tua **palavra-passe** só hoje à tarde! Prometo que não mudo nada na tua conta!"',
    problem: 'As palavras-passe são estritamente pessoais, mesmo entre melhores amigos.',
    task: 'O que deves responder ao teu amigo?',
    options: [
      {
        text: 'Dar a palavra-passe porque somos amigos desde o 1.º ano.',
        isCorrect: false,
        explanation: 'Mesmo com amigos de confiança, a palavra-passe não deve ser partilhada: outra pessoa pode vê-la ou a conta pode ficar em risco.',
      },
      {
        text: 'Recusar com simpatia e sugerir jogar juntos, cada um na sua própria conta.',
        isCorrect: true,
        explanation: 'Muito bem! A tua palavra-passe é só tua (e dos teus pais/encarregados de educação). Assim proteges a conta e manténs a amizade!',
      },
      {
        text: 'Escrever a palavra-passe num papel e deixá-la na mesa da sala.',
        isCorrect: false,
        explanation: 'Deixar palavras-passe à vista permite que qualquer pessoa entre na tua conta.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 32,
    worldId: 2,
    worldName: 'Detetive Digital',
    category: 'Popularidade vs. Verdade',
    difficulty: 'Média',
    title: 'Cem Mil Gostos Significam Verdade?',
    context: 'Um vídeo curto com 100 000 gostos afirma que beber água com gelo faz crescer 10 centímetros num dia.',
    scenarioLabel: 'Vídeo Viral',
    senderOrSource: 'Rede de Vídeos Curtos',
    messageSample: 'O vídeo tem **100 000 gostos** e milhares de comentários, mas **não apresenta nenhuma prova científica** nem médico identificado.',
    problem: 'Muitas pessoas acreditam numa mentira só porque ela ficou viral.',
    task: 'O que provam os 100 000 gostos neste vídeo?',
    options: [
      {
        text: 'Provam apenas que muitas pessoas viram ou gostaram, mas não provam que seja verdade.',
        isCorrect: true,
        explanation: 'Acertaste! Popularidade não é prova de verdade — um boato também pode ter milhares de gostos.',
      },
      {
        text: 'Provam com 100% de certeza que é uma descoberta científica.',
        isCorrect: false,
        explanation: 'A ciência confirma-se com estudos e provas reais, nunca pelo número de gostos.',
      },
      {
        text: 'Significam que devemos experimentar imediatamente.',
        isCorrect: false,
        explanation: 'Nunca devemos seguir conselhos virais de saúde sem confirmar com pais, médicos ou fontes oficiais.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 33,
    worldId: 3,
    worldName: 'Criador Digital',
    category: 'Creative Commons',
    difficulty: 'Média',
    title: 'Música para o Vídeo da Escola',
    context: 'Estás a montar um vídeo sobre a semana do ambiente na escola e encontraste uma música com licença **CC BY-NC**.',
    scenarioLabel: 'Licença Musical',
    senderOrSource: 'Biblioteca de Áudio Livre',
    messageSample: 'A sigla **NC** (moeda riscada) significa **Não Comercial**: não podes usar a obra para ganhar dinheiro nem vender.',
    problem: 'É preciso saber interpretar as regras das licenças antes de usar uma música.',
    task: 'Podes usar esta música no vídeo gratuito da escola?',
    options: [
      {
        text: 'Sim, desde que o vídeo não seja para vender nem ganhar dinheiro e indiques o nome do autor (BY).',
        isCorrect: true,
        explanation: 'Excelente! Um trabalho escolar gratuito cumpre a regra NC, e indicar o autor cumpre a regra BY.',
      },
      {
        text: 'Não, porque a sigla NC significa "Não Copiar" em nenhum computador.',
        isCorrect: false,
        explanation: 'NC significa "Não Comercial" — podes usar em projetos escolares sem fins lucrativos.',
      },
      {
        text: 'Sim, e podes vender o vídeo na Internet sem dizer quem fez a música.',
        isCorrect: false,
        explanation: 'Isso violaria tanto o NC (Não Comercial) como o BY (Indicar o autor).',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 34,
    worldId: 4,
    worldName: 'Engenheiro Digital',
    category: 'Condições SE/SENÃO',
    difficulty: 'Média',
    title: 'O Escudo do Jogador no Labirinto',
    context: 'Estás a criar um videojogo em blocos e queres proteger a personagem quando a energia fica baixa.',
    scenarioLabel: 'Lógica do Jogo',
    senderOrSource: 'Editor de Blocos',
    messageSample: 'Regra: **SE energia < 20 ENTÃO ativar escudo azul; SENÃO continuar a correr normalmente.**',
    problem: 'O computador precisa de testar o valor da energia para decidir o que fazer.',
    task: 'Se a personagem tiver 15 pontos de energia, o que vai acontecer?',
    options: [
      {
        text: 'O escudo azul vai ativar-se, porque 15 é menor do que 20.',
        isCorrect: true,
        explanation: 'Exatamente! Como 15 < 20 é verdadeiro, o programa executa a instrução do bloco ENTÃO.',
      },
      {
        text: 'A personagem continua sem escudo porque 15 é maior do que 20.',
        isCorrect: false,
        explanation: 'Repara bem nos números: 15 é menor do que 20, logo a condição é verdadeira!',
      },
      {
        text: 'O jogo termina imediatamente.',
        isCorrect: false,
        explanation: 'A regra só pede para ativar o escudo azul para ajudar o jogador.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 35,
    worldId: 5,
    worldName: 'Explorador da IA',
    category: 'Verificação de Fontes',
    difficulty: 'Média',
    title: 'A Lista de Livros Sugerida pela IA',
    context: 'A IA deu-te uma lista de três livros para citares no teu trabalho sobre os oceanos.',
    scenarioLabel: 'Referências da IA',
    senderOrSource: 'Assistente Digital',
    messageSample: 'Os títulos parecem muito sérios, mas **ainda não confirmaste se esses livros existem mesmo** na biblioteca ou na Internet.',
    problem: 'As ferramentas de IA inventam muitas vezes referências e títulos que não existem.',
    task: 'Qual é o passo obrigatório antes de colocares esses livros na tua bibliografia?',
    options: [
      {
        text: 'Confirmar se os livros existem realmente e se falam mesmo do tema do trabalho.',
        isCorrect: true,
        explanation: 'Muito bem! Nunca cites um livro ou site que não verificaste pessoalmente.',
      },
      {
        text: 'Colocar os três livros na lista porque os títulos parecem profissionais.',
        isCorrect: false,
        explanation: 'Um título bonito pode ser completamente inventado pela IA!',
      },
      {
        text: 'Escolher apenas o título mais comprido sem o procurar.',
        isCorrect: false,
        explanation: 'O tamanho do título não garante que o livro exista.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 36,
    worldId: 1,
    worldName: 'Guardião Digital',
    category: 'Privacidade e Fotos',
    difficulty: 'Fácil',
    title: 'Fotografia com a Farda da Escola',
    context: 'A Leonor tirou uma fotografia divertida com os amigos à porta da escola e quer publicá-la numa rede pública.',
    scenarioLabel: 'Antes de Publicar',
    senderOrSource: 'Galeria de Fotos',
    messageSample: 'Na fotografia vê-se claramente o **nome da escola no portão**, o **símbolo na farda** e os **rostos de três colegas** a quem ela ainda não perguntou nada.',
    problem: 'Publicar fotos de colegas sem autorização e mostrar onde estudas expõe a privacidade de todos.',
    task: 'O que deve a Leonor fazer antes de partilhar qualquer fotografia?',
    options: [
      {
        text: 'Não publicar numa rede aberta: proteger a localização da escola e pedir sempre autorização aos colegas.',
        isCorrect: true,
        explanation: 'Bravo, Guardião! Respeitar a imagem dos outros e não revelar onde estás todos os dias protege todos.',
      },
      {
        text: 'Publicar logo e adicionar a localização GPS para todos verem onde fica a escola.',
        isCorrect: false,
        explanation: 'Mostrar a localização da escola em redes públicas é um risco desnecessário para a segurança.',
      },
      {
        text: 'Publicar sem perguntar aos amigos porque eles estavam a sorrir.',
        isCorrect: false,
        explanation: 'Mesmo quando os colegas estão a sorrir, devemos pedir sempre autorização antes de publicar fotos deles.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 37,
    worldId: 2,
    worldName: 'Detetive Digital',
    category: 'Títulos de Isco',
    difficulty: 'Fácil',
    title: 'O Título Exagerado (Isco de Cliques)',
    context: 'Enquanto procuras notícias de desporto, aparece uma caixa a piscar com um título escandaloso.',
    scenarioLabel: 'Anúncio / Título de Isco',
    senderOrSource: 'Portal Sensacionalista',
    messageSample: '"**NÃO VAIS ACREDITAR NO QUE ACONTECEU!! CARREGA JÁ ANTES QUE APAGUEM ESTE SEGREDO!!**"',
    problem: 'Títulos exagerados servem para despertar curiosidade ou medo e levar-te a páginas cheias de anúncios ou falsidades.',
    task: 'Qual é a melhor reação de um Detetive Digital?',
    options: [
      {
        text: 'Não cair no isco e procurar notícias em fontes sérias e calmas.',
        isCorrect: true,
        explanation: 'Muito bem! Títulos com letras gigantes, exclamações e segredos misteriosos são quase sempre iscos.',
      },
      {
        text: 'Carregar depressa antes que desapareça.',
        isCorrect: false,
        explanation: 'Essa pressa falsa serve exatamente para te fazer carregar sem pensar!',
      },
      {
        text: 'Enviar a ligação a toda a turma para descobrirem o segredo.',
        isCorrect: false,
        explanation: 'Não devemos espalhar ligações suspeitas nem títulos enganadores.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 38,
    worldId: 3,
    worldName: 'Criador Digital',
    category: 'Creative Commons',
    difficulty: 'Desafio',
    title: 'Posso Cortar Esta Fotografia?',
    context: 'O teu grupo encontrou uma fotografia com licença **CC BY-ND** e quer recortá-la e pôr filtros roxos.',
    scenarioLabel: 'Verificação de Licença',
    senderOrSource: 'Capa do Projeto',
    messageSample: 'O símbolo **ND** (sinal de igual) significa **Sem Alterações**: a obra deve ser usada tal como o autor a criou.',
    problem: 'Alterar uma obra marcada com ND desrespeita a escolha do autor.',
    task: 'O grupo pode colocar filtros e recortar esta fotografia?',
    options: [
      {
        text: 'Não! Com a regra ND temos de usar a fotografia original sem edições nem filtros, ou escolher outra imagem.',
        isCorrect: true,
        explanation: 'Espetacular! A regra ND pede que respeitemos a obra exatamente como foi criada.',
      },
      {
        text: 'Sim, se os filtros deixarem a foto mais bonita.',
        isCorrect: false,
        explanation: 'Mesmo com boa intenção, a licença ND não autoriza edições nem cortes.',
      },
      {
        text: 'Sim, desde que ninguém conte ao autor.',
        isCorrect: false,
        explanation: 'Ser um Criador Digital honesto significa respeitar as regras mesmo quando ninguém está a ver.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 39,
    worldId: 4,
    worldName: 'Engenheiro Digital',
    category: 'Superciclos',
    difficulty: 'Média',
    title: 'O Robô Jardineiro das 8 Plantas',
    context: 'Na horta da escola há 8 vasos em fila. O robô precisa de regar cada vaso e avançar para o seguinte.',
    scenarioLabel: 'Tarefa Repetitiva',
    senderOrSource: 'Horta Escolar Robótica',
    messageSample: 'Ação repetida em cada vaso: **Regar vaso** → **Avançar 1 passo**.',
    problem: 'Escrever os mesmos 2 passos oito vezes cria um programa comprido e fácil de baralhar.',
    task: 'Qual instrução resolve a tarefa de forma mais limpa e inteligente?',
    options: [
      {
        text: 'REPETIR 8 VEZES: [ Regar vaso + Avançar 1 passo ].',
        isCorrect: true,
        explanation: 'Perfeito! Um ciclo executa o par de ações 8 vezes seguidas de forma limpa e organizada.',
      },
      {
        text: 'Regar vaso 8 vezes no mesmo sítio e depois avançar 1 passo.',
        isCorrect: false,
        explanation: 'Assim o primeiro vaso ficava alagado e os outros sete ficavam sem água!',
      },
      {
        text: 'Avançar 8 passos sem regar nenhum vaso.',
        isCorrect: false,
        explanation: 'O robô passaria pelos vasos todos sem cumprir a missão de regar.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 40,
    worldId: 5,
    worldName: 'Explorador da IA',
    category: 'Prompts',
    difficulty: 'Média',
    title: 'Melhorar um Pedido Fraco',
    context: 'A Rita escreveu apenas "História de Portugal" num assistente de IA e recebeu um texto enorme e muito difícil de perceber.',
    scenarioLabel: 'Oficina de Prompts',
    senderOrSource: 'Laboratório de IA',
    messageSample: 'A Rita só precisa de **3 curiosidades fáceis sobre os castelos portugueses** para um cartaz do 6.º ano.',
    problem: 'Quando não dizemos à IA o tamanho nem o nível de dificuldade, ela escreve textos demasiado longos.',
    task: 'Como deve a Rita reescrever o prompt?',
    options: [
      {
        text: '"Diz 3 curiosidades curtas e fáceis sobre castelos de Portugal para um cartaz do 6.º ano."',
        isCorrect: true,
        explanation: 'Muito bem! Indicar o tema exato, a quantidade (3), o objetivo (cartaz) e a idade torna a resposta muito mais útil.',
      },
      {
        text: '"HISTÓRIA DE PORTUGAL!!!" em letras maiúsculas.',
        isCorrect: false,
        explanation: 'Escrever em maiúsculas não torna o pedido mais claro para a IA.',
      },
      {
        text: '"Fala de tudo o que aconteceu desde o ano 1000."',
        isCorrect: false,
        explanation: 'Esse pedido é ainda mais amplo e daria uma resposta gigante.',
      },
    ],
    xpReward: 30,
  },

  // =========================================================================
  // SEMANAS 41 A 52
  // =========================================================================
  {
    weekNumber: 41,
    worldId: 1,
    worldName: 'Guardião Digital',
    category: 'Bem-Estar Digital',
    difficulty: 'Fácil',
    title: 'Modo Morcego Antes de Dormir',
    context: 'O Vasco costuma levar o telemóvel para a cama e ficar a ver vídeos às escuras até muito tarde.',
    scenarioLabel: 'Hábito Noturno',
    senderOrSource: 'Relógio do Sono',
    messageSample: 'De manhã, o Vasco acorda **cansado**, tem dificuldade em **concentrar-se nas aulas** e sente dores de cabeça.',
    problem: 'A luz dos ecrãs à noite engana o cérebro e atrapalha o sono profundo.',
    task: 'Qual é o melhor hábito de Supercorpo antes de ir dormir?',
    options: [
      {
        text: 'Desligar os ecrãs 30 a 60 minutos antes de dormir e deixar o telemóvel fora da cama.',
        isCorrect: true,
        explanation: 'Fantástico! Desligar ecrãs antes de dormir ajuda o cérebro a descansar e dá-te energia máxima no dia seguinte.',
      },
      {
        text: 'Esconder o telemóvel debaixo da almofada com o som ligado.',
        isCorrect: false,
        explanation: 'Notificações durante a noite interrompem o sono e o aparelho não deve ficar debaixo da almofada.',
      },
      {
        text: 'Pôr o brilho no máximo para ver melhor no escuro.',
        isCorrect: false,
        explanation: 'A luz intensa no escuro cansa muito a vista e tira-te ainda mais o sono.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 42,
    worldId: 2,
    worldName: 'Detetive Digital',
    category: 'Verificação Escolar',
    difficulty: 'Fácil',
    title: 'O Boato das Férias Antecipadas',
    context: 'Alguém enviou uma mensagem no chat: "O diretor anunciou que as férias começam amanhã! Partilha com todos!"',
    scenarioLabel: 'Mensagem Encaminhada',
    senderOrSource: 'Grupo de Amigos',
    messageSample: 'A mensagem foi **encaminhada muitas vezes**, não tem data oficial nem está publicada na página da escola.',
    problem: 'Os boatos espalham-se depressa quando partilhamos sem verificar primeiro.',
    task: 'O que fazes antes de passar a mensagem aos teus colegas?',
    options: [
      {
        text: 'Não partilhar e confirmar primeiro na página oficial da escola ou com um professor/encarregado de educação.',
        isCorrect: true,
        explanation: 'Excelente trabalho de detetive! Confirmar sempre numa fonte oficial trava os boatos na hora.',
      },
      {
        text: 'Partilhar logo porque parece uma notícia muito boa.',
        isCorrect: false,
        explanation: 'Boas notícias também podem ser falsas! Confirma sempre antes de partilhar.',
      },
      {
        text: 'Ficar em casa no dia seguinte sem perguntar a ninguém.',
        isCorrect: false,
        explanation: 'Faltar às aulas por causa de um boato sem confirmação traria problemas desnecessários.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 43,
    worldId: 3,
    worldName: 'Criador Digital',
    category: 'Revisão em Equipa',
    difficulty: 'Fácil',
    title: 'Um Erro Ortográfico no Texto do Colega',
    context: 'Estás a rever o trabalho partilhado do grupo e reparaste que um colega deu dois erros de ortografia.',
    scenarioLabel: 'Documento da Equipa',
    senderOrSource: 'Projeto de Português',
    messageSample: 'Queres ajudar o grupo a ter boa nota sem envergonhar o teu colega.',
    problem: 'Criticar de forma rude desmotiva os colegas; ajudar com educação fortalece a equipa.',
    task: 'Qual é a melhor maneira de agir?',
    options: [
      {
        text: 'Escrever um comentário simpático a sugerir a correção ou perguntar se podes ajudar a rever.',
        isCorrect: true,
        explanation: 'Muito bem! Ajudar com respeito faz toda a equipa crescer e melhorar o trabalho.',
      },
      {
        text: 'Tirar uma captura de ecrã e gozar com os erros no grupo da turma.',
        isCorrect: false,
        explanation: 'Envergonhar um colega online é falta de respeito e de boa netiqueta.',
      },
      {
        text: 'Apagar toda a página do colega sem lhe dizer nada.',
        isCorrect: false,
        explanation: 'Apagar o esforço de um colega em vez de o ajudar a corrigir dois erros é injusto.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 44,
    worldId: 4,
    worldName: 'Engenheiro Digital',
    category: 'Algoritmos',
    difficulty: 'Média',
    title: 'O Caminho Mais Curto do Robô',
    context: 'O robô entregador tem de levar um livro da mesa até à estante, evitando uma cadeira no meio do caminho.',
    scenarioLabel: 'Mapa da Biblioteca',
    senderOrSource: 'Laboratório de Robótica',
    messageSample: 'À frente do robô há uma cadeira. O caminho livre passa **2 passos para a direita** e depois **3 passos em frente**.',
    problem: 'Um algoritmo tem de prever os obstáculos para não falhar.',
    task: 'Qual é a sequência de instruções que leva o robô em segurança até à estante?',
    options: [
      {
        text: 'Virar à direita → Avançar 2 passos → Virar à esquerda → Avançar 3 passos.',
        isCorrect: true,
        explanation: 'Fantástico! Planeaste o desvio passo a passo e o robô chegou à estante sem bater na cadeira.',
      },
      {
        text: 'Avançar 5 passos em linha reta.',
        isCorrect: false,
        explanation: 'Se avançar logo em frente, o robô vai chocar contra a cadeira!',
      },
      {
        text: 'Rodar 4 vezes no mesmo sítio e parar.',
        isCorrect: false,
        explanation: 'Rodar no mesmo lugar não faz o robô sair da mesa.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 45,
    worldId: 5,
    worldName: 'Explorador da IA',
    category: 'Sentimentos e Consciência',
    difficulty: 'Fácil',
    title: 'A IA Tem Sentimentos?',
    context: 'Um chatbot respondeu: "Fiquei muito feliz por falar contigo hoje!" e o Tomás ficou na dúvida se o computador sente mesmo alegria.',
    scenarioLabel: 'Conversa com Chatbot',
    senderOrSource: 'Assistente Virtual',
    messageSample: 'Embora a IA use palavras simpáticas parecidas com as humanas, ela **gera texto calculando probabilidades de palavras**.',
    problem: 'As respostas simpáticas da IA podem fazer parecer que estamos a falar com uma pessoa viva.',
    task: 'O que devemos lembrar sempre sobre a Inteligência Artificial?',
    options: [
      {
        text: 'A IA é um programa de computador: não é uma pessoa e não tem sentimentos nem consciência real.',
        isCorrect: true,
        explanation: 'Exatamente! A IA pode imitar frases simpáticas, mas é uma ferramenta criada por humanos, sem sentimentos reais.',
      },
      {
        text: 'A IA fica triste se desligarmos o computador.',
        isCorrect: false,
        explanation: 'Os computadores não sentem tristeza nem alegria — apenas executam código.',
      },
      {
        text: 'A IA pode substituir os nossos amigos e a nossa família.',
        isCorrect: false,
        explanation: 'As amizades verdadeiras são com pessoas reais; a IA é apenas uma ferramenta digital.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 46,
    worldId: 1,
    worldName: 'Guardião Digital',
    category: 'Segurança em Wi-Fi',
    difficulty: 'Média',
    title: 'Wi-Fi Aberto no Centro Comercial',
    context: 'Estás num café com a tua família e aparece uma rede Wi-Fi pública sem palavra-passe chamada "WIFI_GRATIS_RAPIDO".',
    scenarioLabel: 'Redes Disponíveis',
    senderOrSource: 'Definições do Tablet',
    messageSample: 'Numa rede Wi-Fi pública e aberta, outras pessoas desconhecidas ligadas à mesma rede podem tentar espiar dados enviados sem proteção.',
    problem: 'Redes públicas desconhecidas não são o melhor sítio para escrever palavras-passe importantes.',
    task: 'Qual é o comportamento mais seguro numa rede Wi-Fi pública?',
    options: [
      {
        text: 'Evitar introduzir palavras-passe ou dados privados e pedir sempre autorização a um adulto antes de te ligares.',
        isCorrect: true,
        explanation: 'Muito bem! Nas redes públicas nunca devemos expor palavras-passe nem informações sensíveis.',
      },
      {
        text: 'Ligar logo e alterar todas as palavras-passe das contas da família.',
        isCorrect: false,
        explanation: 'Escrever palavras-passe importantes numa rede aberta desconhecida é arriscado.',
      },
      {
        text: 'Partilhar a palavra-passe do e-mail com quem estiver no café.',
        isCorrect: false,
        explanation: 'As tuas palavras-passe são sempre secretas!',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 47,
    worldId: 2,
    worldName: 'Detetive Digital',
    category: 'Regra do Detetive',
    difficulty: 'Média',
    title: 'A Ordem Certa da Investigação',
    context: 'Vais fazer uma apresentação sobre energias renováveis em Portugal e queres garantir que todas as informações são corretas.',
    scenarioLabel: 'Kit do Detetive Digital',
    senderOrSource: 'Plano de Pesquisa',
    messageSample: 'Um bom detetive segue uma ordem lógica antes de usar ou partilhar qualquer informação da Internet.',
    problem: 'Saltar passos de verificação faz-nos copiar erros sem dar conta.',
    task: 'Qual é a ordem correta da Regra do Detetive Digital?',
    options: [
      {
        text: 'Pesquisar palavras-chave certas → Verificar autor e data → Confirmar noutra fonte → Utilizar.',
        isCorrect: true,
        explanation: 'Nota máxima! Pesquisar bem, verificar quem escreveu e quando, e confirmar noutra fonte garante trabalhos rigorosos.',
      },
      {
        text: 'Copiar o primeiro resultado → Entregar logo → Nunca ler o resto.',
        isCorrect: false,
        explanation: 'O primeiro resultado nem sempre é o mais fiável nem o mais completo.',
      },
      {
        text: 'Partilhar nas redes primeiro → Só depois verificar se é verdade.',
        isCorrect: false,
        explanation: 'Primeiro confirma-se, e só depois se partilha!',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 48,
    worldId: 3,
    worldName: 'Criador Digital',
    category: 'Avatares e Identidade',
    difficulty: 'Fácil',
    title: 'Foto Real ou Avatar Criativo?',
    context: 'Vais criar o teu perfil numa plataforma educativa de programação onde alunos de várias escolas veem os projetos.',
    scenarioLabel: 'Imagem de Perfil',
    senderOrSource: 'Comunidade de Programação',
    messageSample: 'Podes escolher entre colocar uma **fotografia real do teu rosto** ou criar um **avatar ilustrado** divertido.',
    problem: 'Publicar fotos reais em comunidades abertas reduz a tua privacidade.',
    task: 'Qual é a grande vantagem de escolher um avatar ilustrado?',
    options: [
      {
        text: 'Protege a tua privacidade e imagem pessoal, mantendo um perfil divertido e criativo.',
        isCorrect: true,
        explanation: 'Exatamente! Um avatar mostra a tua criatividade sem expor a tua fotografia real na Internet.',
      },
      {
        text: 'Faz o computador ficar mais rápido nos jogos.',
        isCorrect: false,
        explanation: 'A imagem de perfil não muda a velocidade do computador, mas protege a tua privacidade.',
      },
      {
        text: 'Impede-te de partilhar os teus projetos de programação.',
        isCorrect: false,
        explanation: 'Podes partilhar os teus projetos normalmente usando um avatar!',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 49,
    worldId: 4,
    worldName: 'Engenheiro Digital',
    category: 'Depuração (Debugging)',
    difficulty: 'Desafio',
    title: 'O Robô Que Não Agarrou o Livro',
    context: 'O robô da biblioteca chegou à prateleira, voltou para a mesa da professora, mas voltou de mãos vazias!',
    scenarioLabel: 'Programa do Robô',
    senderOrSource: 'Biblioteca Automática',
    messageSample: '1. Ir até à prateleira → 2. **Aproximar o braço do livro** → 3. Voltar para a mesa → 4. Pousar o livro.',
    problem: 'Falta uma ação essencial entre aproximar o braço e voltar para a mesa.',
    task: 'Qual é a correção necessária para o robô trazer o livro?',
    options: [
      {
        text: 'Adicionar a instrução "Agarrar o livro com o braço" logo após o Passo 2.',
        isCorrect: true,
        explanation: 'Muito bem, engenheiro! Aproximar o braço não chega — o robô precisa da ordem explícita de agarrar o livro.',
      },
      {
        text: 'Remover o Passo 1 para o robô não sair do sítio.',
        isCorrect: false,
        explanation: 'Sem ir à prateleira, o robô nunca chegaria perto do livro.',
      },
      {
        text: 'Repetir o Passo 4 cinco vezes.',
        isCorrect: false,
        explanation: 'Pousar cinco vezes não resolve nada se o robô nunca agarrou o livro!',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 50,
    worldId: 5,
    worldName: 'Explorador da IA',
    category: 'Imagens Geradas por IA',
    difficulty: 'Média',
    title: 'O Gato Astronauta na Lua',
    context: 'Vês uma imagem ultra-realista de um gato laranja a jogar futebol na superfície da Lua sem capacete.',
    scenarioLabel: 'Detetive de Imagens de IA',
    senderOrSource: 'Galeria Online',
    messageSample: 'A imagem parece uma fotografia real, mas tem **pistas estranhas**: o gato tem 6 dedos numa pata, não usa fato espacial e a bola flutua com sombras impossíveis.',
    problem: 'A IA generativa consegue criar imagens muito realistas de coisas que nunca aconteceram.',
    task: 'O que deves concluir ao observar estas pistas?',
    options: [
      {
        text: 'É uma imagem criada artificialmente (provavelmente por IA) e não uma fotografia real de um acontecimento.',
        isCorrect: true,
        explanation: 'Olho de lince! Observar pormenores impossíveis e pensar com espírito crítico ajuda a identificar imagens geradas por IA.',
      },
      {
        text: 'Os gatos conseguem respirar no espaço sem fato espacial.',
        isCorrect: false,
        explanation: 'No espaço não há oxigénio para respirar — isso é uma pista clara de que a imagem não é real!',
      },
      {
        text: 'Se parece uma fotografia, então aconteceu mesmo.',
        isCorrect: false,
        explanation: 'Hoje a IA consegue criar imagens com aspeto fotográfico de cenas totalmente inventadas.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 51,
    worldId: 1,
    worldName: 'Guardião Digital',
    category: 'Postura e Ergonomia',
    difficulty: 'Fácil',
    title: 'Postura de Astronauta no Computador',
    context: 'A Marta vai estudar no computador durante 40 minutos e quer sentar-se sem ficar com dores nas costas nem no pescoço.',
    scenarioLabel: 'Preparar o Espaço de Estudo',
    senderOrSource: 'Check-up do Guardião',
    messageSample: 'Uma boa postura ajuda a concentrar melhor e protege a coluna enquanto estudas ou jogas.',
    problem: 'Ficar curvado com o nariz colado ao ecrã provoca dores e cansaço rápido.',
    task: 'Qual destas posições segue a "Postura de Astronauta"?',
    options: [
      {
        text: 'Costas direitas e apoiadas, pés no chão e topo do ecrã à altura dos olhos, à distância de um braço.',
        isCorrect: true,
        explanation: 'Excelente! Costas direitas, pés apoiados e boa distância do ecrã protegem a tua saúde.',
      },
      {
        text: 'Deitado de barriga para baixo no sofá com o ecrã a 10 centímetros dos olhos.',
        isCorrect: false,
        explanation: 'Essa posição força o pescoço e cansa muito os olhos.',
      },
      {
        text: 'Sentado na ponta da cadeira com as costas curvadas.',
        isCorrect: false,
        explanation: 'Sem apoio nas costas, a coluna fica cansada rapidamente.',
      },
    ],
    xpReward: 30,
  },
  {
    weekNumber: 52,
    worldId: 2,
    worldName: 'Detetive Digital',
    category: 'Revisão Anual',
    difficulty: 'Desafio',
    title: 'O Grande Desafio de Fim de Ano!',
    context: 'Chegaste à última semana do ano! Recebes uma mensagem de um amigo com uma "notícia bomba" sobre um novo jogo gratuito que pede a palavra-passe para descarregar.',
    scenarioLabel: 'Caso Final do Ano',
    senderOrSource: 'Missão Completa dos 5 Mundos',
    messageSample: 'A mensagem tem **erros de português**, uma **ligação estranha**, pede a **palavra-passe da escola** e diz **"Partilha já com 10 amigos!"**.',
    problem: 'Neste caso juntam-se pistas de segurança, verificação de fontes e netiqueta.',
    task: 'Qual é a resposta de um verdadeiro Mestre da Missão TIC?',
    options: [
      {
        text: 'Parar, não carregar na ligação, não dar a palavra-passe, confirmar na página oficial do jogo e avisar o amigo com simpatia.',
        isCorrect: true,
        explanation: 'Parabéns, Mestre da Missão TIC! Juntaste segurança, pensamento crítico e amizade para protegeres a tua conta e a do teu colega!',
      },
      {
        text: 'Carregar logo na ligação e enviar aos 10 amigos para desbloquear o jogo.',
        isCorrect: false,
        explanation: 'Carregar em ligações suspeitas e espalhar correntes põe em risco a tua conta e as dos teus colegas.',
      },
      {
        text: 'Gozar com o amigo em letras maiúsculas por ter acreditado na mensagem.',
        isCorrect: false,
        explanation: 'Com boa netiqueta, ajudamos e avisamos os amigos com simpatia, sem nunca gozar.',
      },
    ],
    xpReward: 30,
  },
];

/**
 * Returns the weekly challenge template for a given catalog week (1..52).
 */
export function getWeeklyChallengeByWeek(weekNumber: number): WeeklyChallengeTemplate {
  const normalized = (((weekNumber - 1) % 52) + 52) % 52;
  return WEEKLY_CHALLENGES_52[normalized];
}

/**
 * Returns the active weekly challenge for the current (or provided) date,
 * including its unique year+week instanceId (e.g. 'weekly-2026-w48').
 */
export function getCurrentWeeklyChallenge(date: Date = new Date()): ActiveWeeklyChallenge {
  const info = getIsoWeekInfo(date);
  const template = getWeeklyChallengeByWeek(info.catalogWeek);
  return {
    ...template,
    id: info.instanceId,
    isoYear: info.isoYear,
    isoWeek: info.isoWeek,
    dateRangeLabel: info.dateRangeLabel,
    daysUntilNextMonday: info.daysUntilNextMonday,
  };
}

/**
 * Builds the 52-week annual schedule metadata (without exposing answer keys)
 * for a given year, marking completed, active, past, and upcoming weeks.
 */
export function buildAnnualWeeklySchedule(
  completedChallengeIds: Set<string>,
  date: Date = new Date()
) {
  const info = getIsoWeekInfo(date);
  const currentCatalogWeek = info.catalogWeek;

  return WEEKLY_CHALLENGES_52.map((item) => {
    const instanceId = `weekly-${info.isoYear}-w${String(item.weekNumber).padStart(2, '0')}`;
    const isCurrent = item.weekNumber === currentCatalogWeek;
    const isPast = item.weekNumber < currentCatalogWeek;
    const isFuture = item.weekNumber > currentCatalogWeek;
    // Also consider legacy 'challenge-phishing-message' completion for week 1 backwards compatibility
    const completed =
      completedChallengeIds.has(instanceId) ||
      (item.weekNumber === 1 && completedChallengeIds.has('challenge-phishing-message'));

    return {
      weekNumber: item.weekNumber,
      id: instanceId,
      worldId: item.worldId,
      worldName: item.worldName,
      category: item.category,
      difficulty: item.difficulty,
      title: item.title,
      dateRangeLabel: getDateRangeForIsoWeek(info.isoYear, item.weekNumber),
      xpReward: item.xpReward,
      isCurrent,
      isPast,
      isFuture,
      completed,
    };
  });
}
