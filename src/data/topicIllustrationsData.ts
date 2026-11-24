import world1Img from '../assets/images/world1_guardiao_digital_1795551244105.jpg';
import world2Img from '../assets/images/world2_detetive_digital_1795551242741.jpg';
import world3Img from '../assets/images/world3_criador_digital_1795551243412.jpg';
import world4Img from '../assets/images/world4_engenheiro_digital_1795551243614.jpg';
import world5Img from '../assets/images/world5_explorador_ia_1795551243497.jpg';

export interface TopicVisualData {
  topicId: string;
  worldId: number;
  title: string;
  badge: string;
  imageUrl: string;
  imageAlt: string;
  caption: string;
  visualHighlights: {
    iconName: string;
    label: string;
    description: string;
  }[];
  proTip: string;
  colorTheme: 'blue' | 'amber' | 'purple' | 'emerald' | 'indigo';
}

export const TOPIC_VISUALS_DATA: Record<string, TopicVisualData> = {
  // =======================================================================
  // MUNDO 1: GUARDIÃO DIGITAL (Segurança, Privacidade e Bem-estar)
  // =======================================================================
  'w1-t1': {
    topicId: 'w1-t1',
    worldId: 1,
    title: 'Cadeado Digital e Palavras-Passe Fortes',
    badge: 'Segurança de Contas',
    imageUrl: world1Img,
    imageAlt: 'Ilustração da Guardiã Digital com escudo verde, chave dourada e cadeado seguro',
    caption: 'Uma palavra-passe forte funciona como uma fechadura muito segura que protege as tuas contas de jogos, escola e redes sociais.',
    visualHighlights: [
      {
        iconName: 'Key',
        label: '8+ Caracteres',
        description: 'Mistura letras maiúsculas, minúsculas, números e símbolos (!@#).',
      },
      {
        iconName: 'ShieldAlert',
        label: 'Sem Dados Pessoais',
        description: 'Nunca uses nomes de família, datas de aniversário ou o nome do teu animal de estimação.',
      },
      {
        iconName: 'Lock',
        label: 'Segredo Pessoal',
        description: 'A tua palavra-passe é só tua. Não a partilhes com amigos nem colegas.',
      },
    ],
    proTip: 'Dica do Guardião: Imagina uma frase divertida (ex.: "O_Meu_G@to_Comeu_7_Biscoitos!") para criares palavras-passe fáceis de lembrar e impossíveis de adivinhar!',
    colorTheme: 'emerald',
  },

  'w1-t2': {
    topicId: 'w1-t2',
    worldId: 1,
    title: 'O Isco do Phishing e Mensagens Falsas',
    badge: 'Alerta de Phishing',
    imageUrl: world1Img,
    imageAlt: 'Ilustração da Guardiã Digital pronta para bloquear mensagens falsas e armadilhas online',
    caption: 'A palavra "phishing" vem de pescar: os burlões lançam um isco chamativo (como prémios falsos) para apanhar os teus dados privados.',
    visualHighlights: [
      {
        iconName: 'AlertTriangle',
        label: 'Urgência Falsa',
        description: 'Mensagens que dizem "Carrega já nos próximos 5 minutos ou perdes a conta" são quase sempre armadilhas.',
      },
      {
        iconName: 'ExternalLink',
        label: 'Ligações Estranhas',
        description: 'Passa o rato por cima da ligação sem carregar para veres para que site te leva na realidade.',
      },
      {
        iconName: 'Gift',
        label: 'Prémios Impossíveis',
        description: 'Se parece bom demais para ser verdade (como telemóveis grátis), é phishing!',
      },
    ],
    proTip: 'Regra de Ouro: Para, pensa e não carregues. Se tiveres dúvidas, mostra a mensagem aos teus pais ou professores antes de fazeres qualquer coisa!',
    colorTheme: 'amber',
  },

  'w1-t3': {
    topicId: 'w1-t3',
    worldId: 1,
    title: 'Escudo Protetor de Dados Pessoais',
    badge: 'Identidade e Privacidade',
    imageUrl: world1Img,
    imageAlt: 'Ilustração da Guardiã Digital a proteger dados pessoais com um escudo brilhante',
    caption: 'Os teus dados pessoais mostram quem és. No mundo digital, a tua morada, a tua escola e o teu telemóvel devem ficar sempre protegidos.',
    visualHighlights: [
      {
        iconName: 'EyeOff',
        label: 'Segredos Privados',
        description: 'A tua morada, localização em direto, escola e número de telemóvel devem ficar sempre em segredo.',
      },
      {
        iconName: 'UserCheck',
        label: 'Perfis Fechados',
        description: 'Mantém as tuas contas de jogos e redes sociais em modo privado, só para amigos que conheces mesmo.',
      },
      {
        iconName: 'Camera',
        label: 'Atenção às Fotos',
        description: 'Evita partilhar fotografias onde se veja o símbolo da tua escola ou a matrícula do carro da família.',
      },
    ],
    proTip: 'Pergunta-Chave: Antes de publicares algo, pergunta: "Gostaria que um desconhecido na rua visse isto?". Se a resposta for não, guarda em privado!',
    colorTheme: 'emerald',
  },

  'w1-t4': {
    topicId: 'w1-t4',
    worldId: 1,
    title: 'A Tua Pegada Digital (Rasto Online)',
    badge: 'Pegada Digital',
    imageUrl: world1Img,
    imageAlt: 'Ilustração da Guardiã Digital a cuidar de uma pegada digital positiva e segura',
    caption: 'Cada foto, pesquisa e comentário que fazes deixa um rasto na Internet — a tua pegada digital — que mostra quem tu és.',
    visualHighlights: [
      {
        iconName: 'History',
        label: 'Fica Guardado',
        description: 'Mesmo depois de apagares uma mensagem, alguém pode ter tirado uma captura de ecrã.',
      },
      {
        iconName: 'Sparkles',
        label: 'Pegada Positiva',
        description: 'Partilha trabalhos escolares criativos, curiosidades e atitudes simpáticas.',
      },
      {
        iconName: 'MessageCircle',
        label: 'Comentários Amigos',
        description: 'Trata os outros com respeito para construíres uma pegada digital de que te orgulhes.',
      },
    ],
    proTip: 'Pensa no Futuro: Constrói uma pegada digital de que te orgulhes quando fores mais velho!',
    colorTheme: 'emerald',
  },

  'w1-t5': {
    topicId: 'w1-t5',
    worldId: 1,
    title: 'Equilíbrio e Saúde com os Ecrãs',
    badge: 'Bem-Estar Digital',
    imageUrl: world1Img,
    imageAlt: 'Ilustração da Guardiã Digital cheia de energia num ambiente luminoso e saudável',
    caption: 'Os computadores e videojogos são divertidos, mas o teu corpo precisa de movimento, descanso e tempo com a família e os amigos.',
    visualHighlights: [
      {
        iconName: 'Clock',
        label: 'Regra dos 20-20-20',
        description: 'De 20 em 20 minutos de ecrã, olha durante 20 segundos para um objeto a 6 metros para descansar a vista.',
      },
      {
        iconName: 'Moon',
        label: 'Sono Reparador',
        description: 'Desliga os ecrãs pelo menos 30 a 60 minutos antes de dormir para descansares melhor.',
      },
      {
        iconName: 'Activity',
        label: 'Pausas Ativas',
        description: 'Levanta-te da cadeira, estica as costas, bebe água fresca e brinca ao ar livre.',
      },
    ],
    proTip: 'Ritmo Saudável: Combina momentos sem ecrã durante as refeições em família para teres mais energia e boa disposição!',
    colorTheme: 'emerald',
  },

  // =======================================================================
  // MUNDO 2: DETETIVE DIGITAL (Pesquisa, Fontes e Pensamento Crítico)
  // =======================================================================
  'w2-t1': {
    topicId: 'w2-t1',
    worldId: 2,
    title: 'Palavras-Chave e Motores de Pesquisa',
    badge: 'Pesquisa Inteligente',
    imageUrl: world2Img,
    imageAlt: 'Ilustração do Detetive Digital com lupa a pesquisar entre livros, globo e pistas',
    caption: 'Uma boa pesquisa usa palavras exatas em vez de frases muito compridas, ajudando-te a encontrar respostas certas mais depressa.',
    visualHighlights: [
      {
        iconName: 'Search',
        label: 'Palavras Exatas',
        description: 'Em vez de "animais", pesquisa "lince-ibérico perigo de extinção Portugal".',
      },
      {
        iconName: 'FileText',
        label: 'Filtrar por Ficheiro',
        description: 'Podes juntar "filetype:pdf" para encontrar fichas escolares e documentos oficiais.',
      },
      {
        iconName: 'Filter',
        label: 'Direto ao Assunto',
        description: 'Corta palavras a mais como "olá, por favor diz-me onde encontro...".',
      },
    ],
    proTip: 'Truque das Aspas: Usa aspas (" ") para procurar uma frase exata, por exemplo: "D. Afonso Henriques".',
    colorTheme: 'blue',
  },

  'w2-t2': {
    topicId: 'w2-t2',
    worldId: 2,
    title: 'Quem Escreveu Isto?',
    badge: 'Autoria e Confiança',
    imageUrl: world2Img,
    imageAlt: 'Ilustração do Detetive Digital a verificar quem escreveu cada livro e site',
    caption: 'Qualquer pessoa pode publicar na Internet. Um detetive digital procura sempre saber quem escreveu o texto e se percebe mesmo do assunto.',
    visualHighlights: [
      {
        iconName: 'UserCheck',
        label: 'Nome e Profissão',
        description: 'Artigos de confiança mostram o nome do autor, o que faz e como o contactar.',
      },
      {
        iconName: 'Building',
        label: 'Site de Confiança',
        description: 'Vê a página "Sobre Nós" para saber se o site é de uma escola, universidade, museu ou jornal.',
      },
      {
        iconName: 'HelpCircle',
        label: 'Autores Anónimos',
        description: 'Páginas sem nome de autor ou com perfis falsos merecem o dobro da atenção!',
      },
    ],
    proTip: 'Truque Rápido: Se não encontrares o nome do autor nem da instituição, procura a mesma informação noutro site!',
    colorTheme: 'blue',
  },

  'w2-t3': {
    topicId: 'w2-t3',
    worldId: 2,
    title: 'A Data Também Conta!',
    badge: 'Verificar a Data',
    imageUrl: world2Img,
    imageAlt: 'Ilustração do Detetive Digital com um calendário para confirmar a data das notícias',
    caption: 'A ciência e o mundo mudam todos os dias. Uma notícia antiga pode já estar desatualizada!',
    visualHighlights: [
      {
        iconName: 'Calendar',
        label: 'Data de Publicação',
        description: 'Procura o dia, mês e ano em que o texto foi publicado ou atualizado.',
      },
      {
        iconName: 'RefreshCw',
        label: 'Informação Atual',
        description: 'Em temas de ciência e tecnologia, prefere artigos recentes (dos últimos 1 ou 2 anos).',
      },
      {
        iconName: 'Clock',
        label: 'Notícias Antigas',
        description: 'Cuidado com vídeos e fotografias antigas partilhadas como se fossem de hoje.',
      },
    ],
    proTip: 'Dica do Detetive: Se o artigo não mostrar data, procura a mesma notícia noutro site para confirmar quando aconteceu!',
    colorTheme: 'blue',
  },

  'w2-t4': {
    topicId: 'w2-t4',
    worldId: 2,
    title: 'Confirmar em Várias Fontes',
    badge: 'Comparar Fontes',
    imageUrl: world2Img,
    imageAlt: 'Ilustração do Detetive Digital a comparar vários livros e fontes de informação',
    caption: 'Nunca fiques só com o primeiro resultado. Comparar 2 ou 3 sites diferentes de confiança é a melhor forma de confirmar a verdade.',
    visualHighlights: [
      {
        iconName: 'Layers',
        label: 'Regra das 3 Fontes',
        description: 'Se três jornais ou sites sérios confirmam a notícia, é muito provável que seja verdadeira.',
      },
      {
        iconName: 'AlertCircle',
        label: 'Notícia Isolada',
        description: 'Se só um blogue estranho fala de uma "descoberta incrível", desconfia logo!',
      },
      {
        iconName: 'Compass',
        label: 'Sites Oficiais',
        description: 'Procura sites oficiais (.gov.pt), universidades (.edu / .pt) ou enciclopédias conhecidas.',
      },
    ],
    proTip: 'Pensa como um Cientista: Uma fonte dá uma pista; três fontes diferentes confirmam a verdade!',
    colorTheme: 'blue',
  },

  'w2-t5': {
    topicId: 'w2-t5',
    worldId: 2,
    title: 'Caça às Notícias Falsas',
    badge: 'Confirmar Factos',
    imageUrl: world2Img,
    imageAlt: 'Ilustração do Detetive Digital com lupa pronto para desmascarar boatos online',
    caption: 'Títulos exagerados servem para te assustar ou chamar a atenção. O detetive digital respira fundo e confirma as provas com calma.',
    visualHighlights: [
      {
        iconName: 'CheckCircle2',
        label: 'Sites Verificadores',
        description: 'Podes confirmar boatos em sites jornalísticos que verificam factos (como o Polígrafo).',
      },
      {
        iconName: 'Flame',
        label: 'Títulos-Isco (Clickbait)',
        description: 'Títulos em maiúsculas como "NÃO VAIS ACREDITAR!" só querem fazer-te carregar depressa.',
      },
      {
        iconName: 'Share2',
        label: 'Travão de Partilha',
        description: 'Não espalhes boatos na turma. Se não tens a certeza, não partilhes!',
      },
    ],
    proTip: 'Regra de Ouro: Para, pensa e confirma as provas antes de carregares em partilhar!',
    colorTheme: 'blue',
  },

  // =======================================================================
  // MUNDO 3: CRIADOR DIGITAL (Comunicação, Colaboração e Direitos de Autor)
  // =======================================================================
  'w3-t1': {
    topicId: 'w3-t1',
    worldId: 3,
    title: 'Comunicação Digital Clara e Simpática',
    badge: 'Diálogo Respeitoso',
    imageUrl: world3Img,
    imageAlt: 'Ilustração de dois colegas a conversar e criar juntos com simpatia num estúdio criativo',
    caption: 'Quando escrevemos, a outra pessoa não vê o nosso rosto nem ouve a nossa voz. Escolher bem as palavras evita mal-entendidos.',
    visualHighlights: [
      {
        iconName: 'Smile',
        label: 'Emojis com Moderação',
        description: 'Um emoji sorridente ajuda a mostrar que estás a ser simpático ou a brincar sem magoar.',
      },
      {
        iconName: 'VolumeX',
        label: 'Evitar Maiúsculas',
        description: 'ESCREVER TUDO ASSIM parece que estás a gritar com a outra pessoa no meio da sala de aula.',
      },
      {
        iconName: 'CheckSquare',
        label: 'Ler Antes de Enviar',
        description: 'Lê duas vezes o que escreveste antes de carregares em "Enviar" para teres a certeza de que é claro e educado.',
      },
    ],
    proTip: 'Teste do Recreio: Se não dirias essa frase cara a cara ao teu colega no recreio, não a escrevas online!',
    colorTheme: 'purple',
  },

  'w3-t2': {
    topicId: 'w3-t2',
    worldId: 3,
    title: 'Netiqueta: Boas Maneiras Online',
    badge: 'Boas Maneiras',
    imageUrl: world3Img,
    imageAlt: 'Ilustração de dois alunos sorridentes a colaborar com respeito num projeto digital',
    caption: 'Netiqueta junta "Net" (Internet) e "Etiqueta" (boa educação). É manter online o mesmo respeito que temos na sala de aula.',
    visualHighlights: [
      {
        iconName: 'Heart',
        label: 'Respeito pelas Diferenças',
        description: 'Podemos ter opiniões diferentes sem ofender nem gozar com ninguém.',
      },
      {
        iconName: 'Clock',
        label: 'Horas Certas',
        description: 'Evita mandar mensagens sobre trabalhos tarde à noite ou de madrugada.',
      },
      {
        iconName: 'Shield',
        label: 'Zero Ciberbullying',
        description: 'Nunca entres em grupos para gozar com alguém. Avisa logo um professor ou um adulto!',
      },
    ],
    proTip: 'Espalha Simpatia: Um simples "Obrigado!" ou "Bom trabalho, equipa!" melhora logo o ambiente do grupo!',
    colorTheme: 'purple',
  },

  'w3-t3': {
    topicId: 'w3-t3',
    worldId: 3,
    title: 'Trabalho de Equipa Online',
    badge: 'Projetos em Equipa',
    imageUrl: world3Img,
    imageAlt: 'Ilustração de dois amigos a trabalhar juntos no mesmo projeto digital',
    caption: 'Com documentos online partilhados, todos os colegas podem construir o mesmo trabalho ao mesmo tempo!',
    visualHighlights: [
      {
        iconName: 'Users',
        label: 'Divisão Justa de Tarefas',
        description: 'Combinem quem pesquisa, quem escreve e quem escolhe as imagens.',
      },
      {
        iconName: 'GitBranch',
        label: 'Histórico de Versões',
        description: 'Os documentos online guardam as versões antigas para poderes recuperar o texto se alguém apagar sem querer.',
      },
      {
        iconName: 'Edit3',
        label: 'Respeito pelo Trabalho',
        description: 'Nunca apagues a parte de um colega sem falar primeiro com ele.',
      },
    ],
    proTip: 'Dica de Equipa: Usem os comentários do documento para dar sugestões simpáticas sem estragar o texto dos colegas!',
    colorTheme: 'purple',
  },

  'w3-t4': {
    topicId: 'w3-t4',
    worldId: 3,
    title: 'Direitos de Autor: Respeitar Quem Cria',
    badge: 'Respeitar os Autores',
    imageUrl: world3Img,
    imageAlt: 'Ilustração de jovens criadores rodeados de desenhos, pinturas e notas musicais',
    caption: 'Toda a música, foto, texto ou desenho pertence a quem o criou. Encontrar na Internet não quer dizer que possas copiar sem regras.',
    visualHighlights: [
      {
        iconName: 'Bookmark',
        label: 'O Símbolo © Copyright',
        description: 'Significa que a obra está protegida e precisas de autorização do autor para a usar.',
      },
      {
        iconName: 'Image',
        label: 'Imagens na Internet',
        description: 'Não copies fotos do Google Imagens sem confirmar se o autor permite usá-las.',
      },
      {
        iconName: 'Award',
        label: 'Reconhecer o Esforço',
        description: 'Os autores esforçam-se para criar arte; dizer quem fez a obra é justo e correto.',
      },
    ],
    proTip: 'Truque Útil: Ao pesquisar imagens, usa o filtro "Direitos de Utilização" para encontrar fotos livres para usar!',
    colorTheme: 'purple',
  },

  'w3-t5': {
    topicId: 'w3-t5',
    worldId: 3,
    title: 'Indicar o Autor e Evitar o Plágio',
    badge: 'Autoria e Fontes',
    imageUrl: world3Img,
    imageAlt: 'Ilustração de dois estudantes a criar os seus próprios desenhos e trabalhos originais',
    caption: 'Plágio é copiar o trabalho de outra pessoa e fingir que foi feito por nós. Indicar a fonte mostra honestidade!',
    visualHighlights: [
      {
        iconName: 'Quote',
        label: 'Usar Aspas (" ")',
        description: 'Se copiares uma frase exata, põe-na entre aspas e diz logo quem a escreveu.',
      },
      {
        iconName: 'BookOpen',
        label: 'Pelas Tuas Palavras',
        description: 'Lê a informação, fecha a página e explica o que aprendeste pelas tuas próprias palavras.',
      },
      {
        iconName: 'List',
        label: 'Lista de Fontes',
        description: 'No final do trabalho, escreve sempre a lista dos livros e sites onde pesquisaste.',
      },
    ],
    proTip: 'Fórmula Simples: Nome do Autor + Ano + Título do Site + Endereço. Claro, honesto e nota máxima!',
    colorTheme: 'purple',
  },

  'w3-t6': {
    topicId: 'w3-t6',
    worldId: 3,
    title: 'Licenças Creative Commons: Partilhar com Regras',
    badge: 'Licenças Abertas',
    imageUrl: world3Img,
    imageAlt: 'Ilustração de colegas a partilhar criações artísticas com respeito pelas licenças',
    caption: 'As licenças Creative Commons (CC) dizem logo o que podes ou não fazer com uma foto ou música sem precisares de ligar ao autor.',
    visualHighlights: [
      {
        iconName: 'Check',
        label: 'BY (Indicar o Autor)',
        description: 'Podes usar livremente a imagem ou música, desde que indiques sempre quem a criou.',
      },
      {
        iconName: 'DollarSign',
        label: 'NC (Não Comercial)',
        description: 'Podes usar em trabalhos da escola e pessoais, mas não podes vender nem ganhar dinheiro com ela.',
      },
      {
        iconName: 'Shuffle',
        label: 'SA (Mesma Licença)',
        description: 'Se mudares a obra, tens de partilhar a tua nova versão com a mesma licença.',
      },
    ],
    proTip: 'Onde Encontrar Fotos Livres: Sites como Pixabay e Wikimedia Commons têm muitas fotos com licenças abertas prontas para trabalhos escolares!',
    colorTheme: 'purple',
  },

  // =======================================================================
  // MUNDO 4: ENGENHEIRO DIGITAL (Pensamento Computacional, Algoritmos e Dados)
  // =======================================================================
  'w4-t1': {
    topicId: 'w4-t1',
    worldId: 4,
    title: 'Decomposição: Dividir Problemas Grandes',
    badge: 'Dividir em Partes',
    imageUrl: world4Img,
    imageAlt: 'Ilustração do Engenheiro Digital a encaixar blocos de código coloridos num tabuleiro',
    caption: 'Um problema gigante fica fácil quando o partimos em pequenos pedaços, resolvendo um de cada vez.',
    visualHighlights: [
      {
        iconName: 'Scissors',
        label: 'Tarefas Pequenas',
        description: 'Em vez de "fazer um jogo inteiro", divide em: "desenhar o herói", "fazer o herói andar" e "marcar pontos".',
      },
      {
        iconName: 'CheckCircle',
        label: 'Vitórias Rápidas',
        description: 'Resolver uma parte pequena dá-te confiança para avançar para o passo seguinte.',
      },
      {
        iconName: 'Compass',
        label: 'Juntar Tudo no Fim',
        description: 'No final, juntas todas as partes e tens o projeto completo a funcionar!',
      },
    ],
    proTip: 'No Dia a Dia: Organizar uma festa de anos divide-se em: convites, bolo, música e jogos. Pensar como engenheiro é natural!',
    colorTheme: 'amber',
  },

  'w4-t2': {
    topicId: 'w4-t2',
    worldId: 4,
    title: 'Algoritmos: A Receita Passo a Passo',
    badge: 'Passos por Ordem',
    imageUrl: world4Img,
    imageAlt: 'Ilustração do Engenheiro Digital a guiar um robô passo a passo num caminho de blocos',
    caption: 'Um computador não adivinha: cumpre as ordens à risca. Um algoritmo é uma lista ordenada de passos claros para cumprir uma tarefa.',
    visualHighlights: [
      {
        iconName: 'ArrowRight',
        label: 'A Ordem Importa',
        description: 'Não podes calçar os sapatos antes das meias! No código, trocar a ordem estraga o resultado.',
      },
      {
        iconName: 'Target',
        label: 'Ordens Claras',
        description: 'Instruções como "vira à direita e avança 3 passos" são exatas e o robô percebe-as logo.',
      },
      {
        iconName: 'Code',
        label: 'Blocos de Código',
        description: 'Programas como o Scratch encaixam blocos coloridos como peças de LEGO para criar algoritmos.',
      },
    ],
    proTip: 'Jogo com Amigos: Tenta explicar a um colega como desenhar uma casa sem ele olhar; vais ver como cada palavra conta!',
    colorTheme: 'amber',
  },

  'w4-t3': {
    topicId: 'w4-t3',
    worldId: 4,
    title: 'Condições: Decisões SE / SENÃO',
    badge: 'Tomar Decisões',
    imageUrl: world4Img,
    imageAlt: 'Ilustração do Engenheiro Digital a ajudar o robô a decidir o caminho certo no tabuleiro',
    caption: 'Um programa escolhe o caminho certo usando regras: "SE a vida chegar a zero, o jogo acaba; SENÃO, continua a jogar!".',
    visualHighlights: [
      {
        iconName: 'GitMerge',
        label: 'Regra SE / SENÃO',
        description: 'Ajuda o programa a escolher entre dois caminhos conforme o que acontece (teclas, pontos ou sensores).',
      },
      {
        iconName: 'Check',
        label: 'Se for Verdade (Sim)',
        description: 'Quando a condição acontece, o computador segue o primeiro grupo de ordens.',
      },
      {
        iconName: 'X',
        label: 'Senão (Não)',
        description: 'Quando não acontece, o computador escolhe o outro caminho.',
      },
    ],
    proTip: 'No Dia a Dia: "SE estiver a chover, levo guarda-chuva; SENÃO, levo óculos de sol". Usamos condições todos os dias!',
    colorTheme: 'amber',
  },

  'w4-t4': {
    topicId: 'w4-t4',
    worldId: 4,
    title: 'Ciclos e Repetições (Loops)',
    badge: 'Repetir sem Cansar',
    imageUrl: world4Img,
    imageAlt: 'Ilustração do Engenheiro Digital a usar blocos repetidos para o robô chegar à meta',
    caption: 'Em vez de escreveres a mesma ordem 100 vezes, um ciclo (loop) repete a ação sozinho, poupando tempo e código!',
    visualHighlights: [
      {
        iconName: 'Repeat',
        label: 'Repetir N Vezes',
        description: 'Diz exatamente quantas vezes repetir: "Repete 4 vezes: Avança 100 passos e vira à direita" (desenha um quadrado!).',
      },
      {
        iconName: 'Infinity',
        label: 'Repetir Sempre',
        description: 'Nos jogos, serve para verificar sem parar se a bola tocou na parede ou na raquete.',
      },
      {
        iconName: 'Zap',
        label: 'Código Mais Curto',
        description: 'Menos linhas de código tornam o programa mais rápido e fácil de corrigir.',
      },
    ],
    proTip: 'A Força do Computador: As pessoas cansam-se de repetir a mesma tarefa; o computador repete um milhão de vezes sem errar!',
    colorTheme: 'amber',
  },

  'w4-t5': {
    topicId: 'w4-t5',
    worldId: 4,
    title: 'Dados, Tabelas e Gráficos',
    badge: 'Ler Dados',
    imageUrl: world4Img,
    imageAlt: 'Ilustração do Engenheiro Digital a organizar peças e informação na oficina STEM',
    caption: 'Muitos números soltos são difíceis de ler. Quando os organizamos em tabelas e gráficos, percebemos tudo num instante!',
    visualHighlights: [
      {
        iconName: 'BarChart2',
        label: 'Gráficos de Barras',
        description: 'Ótimos para comparar grupos (por exemplo, o desporto preferido da turma).',
      },
      {
        iconName: 'PieChart',
        label: 'Gráficos Circulares',
        description: 'Mostram como o total se divide em fatias (percentagens).',
      },
      {
        iconName: 'TrendingUp',
        label: 'Gráficos de Linhas',
        description: 'Mostram como algo sobe ou desce ao longo do tempo, como a temperatura da semana.',
      },
    ],
    proTip: 'Olho Atento: Antes de responderes sobre um gráfico, lê sempre o título e o que significa cada barra ou linha!',
    colorTheme: 'amber',
  },

  'w4-t6': {
    topicId: 'w4-t6',
    worldId: 4,
    title: 'Debugging: Encontrar e Corrigir Erros',
    badge: 'Caça aos Bugs',
    imageUrl: world4Img,
    imageAlt: 'Ilustração do Engenheiro Digital a testar e melhorar o percurso do robô',
    caption: 'Testar o código com calma, descobrir onde falhou e corrigir o erro é o segredo para criar programas que funcionam bem.',
    visualHighlights: [
      {
        iconName: 'Bug',
        label: 'Encontrar o Erro',
        description: 'Observa exatamente em que momento o robô ou programa faz algo diferente do que querias.',
      },
      {
        iconName: 'Search',
        label: 'Descobrir o Porquê',
        description: 'Vê as ordens antes e depois para perceberes qual foi o passo que falhou.',
      },
      {
        iconName: 'CheckCircle2',
        label: 'Testar de Novo',
        description: 'Corrige o erro e volta a testar para teres a certeza de que agora funciona bem!',
      },
    ],
    proTip: 'Truque de Programador: Lê os passos em voz alta como se fosses o robô — vais descobrir quase todos os erros logo à primeira!',
    colorTheme: 'amber',
  },

  // =======================================================================
  // MUNDO 5: EXPLORADOR DA IA (IA, Prompts e Responsabilidade)
  // =======================================================================
  'w5-t1': {
    topicId: 'w5-t1',
    worldId: 5,
    title: 'O que é a IA? Aprender com Padrões',
    badge: 'Como Funciona a IA',
    imageUrl: world5Img,
    imageAlt: 'Ilustração da Exploradora da IA com o seu robô ajudante a observar livros e planetas',
    caption: 'A Inteligência Artificial é um programa que observa milhões de exemplos para encontrar padrões e reconhecer fotos, textos ou sons.',
    visualHighlights: [
      {
        iconName: 'Cpu',
        label: 'Não Tem Sentimentos',
        description: 'A IA não sente alegria nem tristeza e não pensa como uma pessoa; faz cálculos muito rápidos.',
      },
      {
        iconName: 'Database',
        label: 'Treinada com Exemplos',
        description: 'Para reconhecer cães, o programa viu milhares de fotos de cães até aprender o que têm em comum.',
      },
      {
        iconName: 'Tool',
        label: 'Ferramenta de Apoio',
        description: 'A IA serve para ajudar as pessoas, não para pensar no lugar delas.',
      },
    ],
    proTip: 'Diferença Essencial: Um programa normal segue sempre as mesmas regras fixas; a IA aprende a partir de muitos exemplos!',
    colorTheme: 'indigo',
  },

  'w5-t2': {
    topicId: 'w5-t2',
    worldId: 5,
    title: 'IA Generativa: Criar a Partir de Pedidos',
    badge: 'Criar com a IA',
    imageUrl: world5Img,
    imageAlt: 'Ilustração da Exploradora da IA rodeada de ideias, livros e planetas luminosos',
    caption: 'A IA generativa consegue criar textos, desenhos, histórias e ideias novas a partir do que lhe pedes.',
    visualHighlights: [
      {
        iconName: 'Wand2',
        label: 'Criação Rápida',
        description: 'Dá ideias para histórias, planos de estudo e desenhos em poucos segundos.',
      },
      {
        iconName: 'Sparkles',
        label: 'Adivinha a Palavra Seguinte',
        description: 'O programa escolhe, palavra a palavra, o que parece fazer mais sentido vir a seguir.',
      },
      {
        iconName: 'AlertTriangle',
        label: 'Não Sabe o Que É Verdade',
        description: 'A IA não sabe se algo é verdadeiro ou falso; por isso, tens sempre de confirmar!',
      },
    ],
    proTip: 'Uso Criativo: Usa a IA para ter ideias novas, mas escreve e dá sempre o teu toque pessoal!',
    colorTheme: 'indigo',
  },

  'w5-t3': {
    topicId: 'w5-t3',
    worldId: 5,
    title: 'Prompts: Como Pedir Bem à IA',
    badge: 'Falar com a IA',
    imageUrl: world5Img,
    imageAlt: 'Ilustração da Exploradora da IA a dar indicações claras ao seu pequeno robô ajudante',
    caption: 'Quanto mais claro e completo for o teu pedido (prompt), melhor e mais útil vai ser a resposta da IA!',
    visualHighlights: [
      {
        iconName: 'User',
        label: 'Quem Deve Ser (Papel)',
        description: 'Diz à IA como deve explicar: "Age como um professor de Ciências do 6.º ano".',
      },
      {
        iconName: 'FileText',
        label: 'Assunto Claro',
        description: 'Explica o que estás a fazer: "Estou a preparar um trabalho sobre a poluição nos oceanos".',
      },
      {
        iconName: 'Layout',
        label: 'Como Queres a Resposta',
        description: 'Pede o formato: "Escreve 4 pontos curtos e fáceis de perceber".',
      },
    ],
    proTip: 'Fórmula Mágica: Papel + Tarefa + Assunto + Formato = Resposta excelente!',
    colorTheme: 'indigo',
  },

  'w5-t4': {
    topicId: 'w5-t4',
    worldId: 5,
    title: 'Alucinações de IA: Quando a Máquina Inventa',
    badge: 'Confirmar os Factos',
    imageUrl: world5Img,
    imageAlt: 'Ilustração da Exploradora da IA a confirmar informações em livros escolares',
    caption: 'Às vezes a IA responde com ar muito seguro, mas inventa livros que não existem, datas erradas ou factos falsos!',
    visualHighlights: [
      {
        iconName: 'AlertOctagon',
        label: 'Parece Verdade, Mas Não É',
        description: 'A IA raramente diz "não sei"; prefere tentar adivinhar e pode acabar por inventar.',
      },
      {
        iconName: 'Search',
        label: 'Confirmar Sempre',
        description: 'Confirma sempre datas de História, contas e nomes de cientistas nos livros escolares.',
      },
      {
        iconName: 'Link2',
        label: 'Pede Fontes Reais',
        description: 'Pergunta sempre: "Em que livro ou site oficial posso confirmar esta informação?".',
      },
    ],
    proTip: 'Regra de Ouro da IA: Nunca copies uma resposta da IA para um trabalho sem primeiro confirmar se é verdadeira!',
    colorTheme: 'indigo',
  },

  'w5-t5': {
    topicId: 'w5-t5',
    worldId: 5,
    title: 'Privacidade: O Que Não Deves Contar à IA',
    badge: 'Proteger Segredos',
    imageUrl: world5Img,
    imageAlt: 'Ilustração da Exploradora da IA a usar a tecnologia de forma segura e responsável',
    caption: 'Tudo o que escreves numa IA pública pode ficar guardado e ser usado para treinar novas versões do programa.',
    visualHighlights: [
      {
        iconName: 'Shield',
        label: 'Sem Nomes Reais',
        description: 'Nunca escrevas o teu nome completo, nem o dos teus colegas ou professores na conversa com a IA.',
      },
      {
        iconName: 'Lock',
        label: 'Segredos e Palavras-Passe',
        description: 'Nunca coloques palavras-passe, moradas, números de telefone ou fotos tuas na IA.',
      },
      {
        iconName: 'Settings',
        label: 'Definir Privacidade',
        description: 'Pede a um adulto para ajudar a desligar o histórico de conversas quando possível.',
      },
    ],
    proTip: 'Truque de Segurança: Em vez de nomes verdadeiros, escreve "Aluno A" ou "Cidade X"!',
    colorTheme: 'indigo',
  },

  'w5-t6': {
    topicId: 'w5-t6',
    worldId: 5,
    title: 'Pensar Com a IA: Tu Tens o Comando!',
    badge: 'Decide Por Ti',
    imageUrl: world5Img,
    imageAlt: 'Ilustração da Exploradora da IA a liderar com criatividade ao lado do seu robô ajudante',
    caption: 'A IA é como uma bicicleta para a tua mente: ajuda-te a ir mais longe, mas és sempre tu quem pedala e escolhe o caminho!',
    visualHighlights: [
      {
        iconName: 'Brain',
        label: 'Tu És o Condutor',
        description: 'Se a IA fizer o trabalho todo por ti, o teu cérebro não treina nem aprende.',
      },
      {
        iconName: 'Filter',
        label: 'Sai da Bolha',
        description: 'As aplicações mostram-te sempre vídeos parecidos; procura também temas novos por tua iniciativa!',
      },
      {
        iconName: 'CheckCircle',
        label: 'Pensamento Crítico',
        description: 'Lê sempre a resposta da IA e decide se faz sentido ou se precisas de a melhorar.',
      },
    ],
    proTip: 'Regra do Explorador: Usa a IA para aprender e ter ideias, mas pensa sempre pela tua cabeça!',
    colorTheme: 'indigo',
  },
};
