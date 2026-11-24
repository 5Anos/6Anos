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
    title: 'Cadeado Digital & Palavras-Passe Fortes',
    badge: 'Segurança de Contas',
    imageUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Cadeado digital de segurança e chaves num ecrã de computador',
    caption: 'Uma palavra-passe forte funciona como uma fechadura super segura que protege as tuas contas de jogos, escola e redes sociais.',
    visualHighlights: [
      {
        iconName: 'Key',
        label: '10+ Caracteres',
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
    proTip: 'Dica do Guardião: Imagina uma frase divertida (ex: "O_Meu_G@to_Comeu_7_Biscoitos!") para criares palavras-passe fáceis de lembrar e impossíveis de adivinhar!',
    colorTheme: 'blue',
  },

  'w1-t2': {
    topicId: 'w1-t2',
    worldId: 1,
    title: 'O Isco do Phishing e Armadilhas Online',
    badge: 'Alerta de Phishing',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Ecrã com aviso de perigo e tentativa de fraude cibernética com mensagem suspeita',
    caption: 'O termo "phishing" vem de pescar: criminosos lançam um isco atrativo (como prémios falsos) para caçar os teus dados privados.',
    visualHighlights: [
      {
        iconName: 'AlertTriangle',
        label: 'Urgência Falsa',
        description: 'Mensagens que dizem "Clica já nos próximos 5 minutos ou perdes a conta" são quase sempre ciladas.',
      },
      {
        iconName: 'ExternalLink',
        label: 'Links Estranhos',
        description: 'Passa o rato sobre o link sem clicar para verificar para onde ele realmente te direciona.',
      },
      {
        iconName: 'Gift',
        label: 'Prémios Impossíveis',
        description: 'Se parece bom demais para ser verdade (como telemóveis topo de gama grátis), é phishing!',
      },
    ],
    proTip: 'Regra de Ouro: Para, pensa e não cliques. Quando tiveres dúvidas, mostra a mensagem aos teus pais ou professores antes de qualquer ação!',
    colorTheme: 'amber',
  },

  'w1-t3': {
    topicId: 'w1-t3',
    worldId: 1,
    title: 'Escudo Protetor de Dados Pessoais',
    badge: 'Identidade & Privacidade',
    imageUrl: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Símbolo de proteção de dados pessoais e privacidade digital sobre um dispositivo portátil',
    caption: 'Os teus dados pessoais identificam quem és. No mundo digital, a tua morada, escola e telemóvel devem estar sempre protegidos.',
    visualHighlights: [
      {
        iconName: 'EyeOff',
        label: 'Segredos Privados',
        description: 'A tua morada, localização em direto, escola e número de telemóvel devem ficar sempre em segredo.',
      },
      {
        iconName: 'UserCheck',
        label: 'Perfis Fechados',
        description: 'Mantém as tuas contas de redes sociais e jogos em modo privado, visíveis apenas para amigos reais.',
      },
      {
        iconName: 'Camera',
        label: 'Atenção às Fotos',
        description: 'Evita partilhar fotografias onde se veja o símbolo da tua escola ou a matrícula do carro da família.',
      },
    ],
    proTip: 'Pergunta-Chave: Antes de publicares algo, pergunta: "Gostarias que um desconhecido na rua visse isto?". Se a resposta for não, mantém privado!',
    colorTheme: 'blue',
  },

  'w1-t4': {
    topicId: 'w1-t4',
    worldId: 1,
    title: 'A Tua Pegada Digital',
    badge: 'Rasto Online',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Pegadas luminosas e rastos de informação num mapa tecnológico digital',
    caption: 'Cada clique, foto, pesquisa e comentário que fazes deixa um rasto na Internet que mostra quem tu és.',
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
        description: 'Trata os outros com respeito para construíres um rasto digital de que te orgulhes.',
      },
    ],
    proTip: 'Pensa no Futuro: Constrói uma pegada digital de que te orgulhes quando fores mais velho!',
    colorTheme: 'blue',
  },

  'w1-t5': {
    topicId: 'w1-t5',
    worldId: 1,
    title: 'Equilíbrio e Saúde Tecnológica',
    badge: 'Bem-estar Digital',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Jovem a fazer uma pausa tranquila ao ar livre longe do ecrã para descansar a visão',
    caption: 'Os computadores e videojogos são fantásticos, mas o teu corpo precisa de movimento, descanso e tempo com a família e amigos.',
    visualHighlights: [
      {
        iconName: 'Clock',
        label: 'Regra dos 20-20-20',
        description: 'A cada 20 minutos de ecrã, olha 20 segundos para um objeto a 6 metros para descansar a vista.',
      },
      {
        iconName: 'Moon',
        label: 'Sono Reparador',
        description: 'Desliga os ecrãs pelo menos 30 a 60 minutos antes de dormir para não perturbar o sono.',
      },
      {
        iconName: 'Activity',
        label: 'Pausas Ativas',
        description: 'Levanta-te da cadeira, alonga as costas, bebe água fresca e pratica desporto ao ar livre.',
      },
    ],
    proTip: 'Ritmo Saudável: Estabelece horários sem ecrã durante as refeições em família para manteres uma mente viva, focada e bem-disposta!',
    colorTheme: 'emerald',
  },

  // =======================================================================
  // MUNDO 2: DETETIVE DIGITAL (Pesquisa, Fontes e Pensamento Crítico)
  // =======================================================================
  'w2-t1': {
    topicId: 'w2-t1',
    worldId: 2,
    title: 'Palavras-chave & Motores de Busca',
    badge: 'Estratégia de Pesquisa',
    imageUrl: 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Lupa a focar palavras precisas numa barra de pesquisa e teclado digital',
    caption: 'Uma pesquisa inteligente usa termos específicos em vez de frases longas ou vagas, poupando tempo e filtrando o ruído da Internet.',
    visualHighlights: [
      {
        iconName: 'Search',
        label: 'Termos Específicos',
        description: 'Em vez de "animais", pesquisa "linces ibéricos em perigo de extinção em Portugal".',
      },
      {
        iconName: 'FileText',
        label: 'Filtro por Tipo',
        description: 'Podes juntar "filetype:pdf" para encontrar relatórios científicos oficiais e fichas escolares.',
      },
      {
        iconName: 'Filter',
        label: 'Foco no Assunto',
        description: 'Elimina palavras desnecessárias como "por favor diga-me onde posso encontrar".',
      },
    ],
    proTip: 'Truque das Aspas: Usa aspas (" ") para encontrar uma frase exata num motor de busca, como por exemplo: "Rei Dom Afonso Henriques".',
    colorTheme: 'blue',
  },

  'w2-t2': {
    topicId: 'w2-t2',
    worldId: 2,
    title: 'Quem Escreveu Isto?',
    badge: 'Autoria & Confiança',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Caneta e caderno de notas de investigação com foco em quem escreveu',
    caption: 'Qualquer pessoa pode publicar na Internet. Um detetive digital procura sempre saber quem escreveu o texto e se percebe mesmo do assunto.',
    visualHighlights: [
      {
        iconName: 'UserCheck',
        label: 'Nome & Profissão',
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
    badge: 'Verificação da Data',
    imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Calendário e relógio que simbolizam a passagem do tempo e a atualidade da informação',
    caption: 'A ciência e o mundo mudam todos os dias. Uma notícia de 2014 pode já estar desatualizada!',
    visualHighlights: [
      {
        iconName: 'Calendar',
        label: 'Data de Publicação',
        description: 'Procura o dia, mês e ano em que o texto foi publicado ou atualizado.',
      },
      {
        iconName: 'RefreshCw',
        label: 'Informação Recente',
        description: 'Em temas de ciência e tecnologia, prefere artigos dos últimos 1 ou 2 anos.',
      },
      {
        iconName: 'Clock',
        label: 'Notícias Antigas',
        description: 'Cuidado com vídeos e tempestades antigas partilhadas como se fossem de hoje.',
      },
    ],
    proTip: 'Dica do Detetive: Se o artigo não mostrar data, procura a mesma notícia noutro site para confirmar quando aconteceu!',
    colorTheme: 'blue',
  },

  'w2-t4': {
    topicId: 'w2-t4',
    worldId: 2,
    title: 'Comparar Várias Fontes',
    badge: 'Confirmar a Verdade',
    imageUrl: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Vários jornais e artigos impressos lado a lado para comparação',
    caption: 'Nunca fiques só com o primeiro link. Comparar 2 ou 3 sites diferentes de confiança é a melhor forma de confirmar a verdade.',
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
    title: 'Caça às Notícias Falsas (Fact-Checking)',
    badge: 'Desmascarar Boatos',
    imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Lupa de ampliação a inspecionar manchetes de notícias com carimbo de verificação de factos',
    caption: 'Títulos exagerados servem para te assustar ou chamar atenção. O detetive digital respira fundo e confirma as provas com calma.',
    visualHighlights: [
      {
        iconName: 'CheckCircle2',
        label: 'Sites Verificadores',
        description: 'Podes confirmar boatos em sites jornalísticos de verificação (como o Polígrafo).',
      },
      {
        iconName: 'Flame',
        label: 'Títulos Isco (Clickbait)',
        description: 'Títulos em maiúsculas como "NÃO VAIS ACREDITAR!" só querem ganhar cliques.',
      },
      {
        iconName: 'Share2',
        label: 'Travão de Partilha',
        description: 'Não espalhes boatos na turma. Se não tens a certeza, não partilhes!',
      },
    ],
    proTip: 'Regra de Ouro: Para, pensa e confirma as provas antes de carregar em partilhar!',
    colorTheme: 'blue',
  },

  // =======================================================================
  // MUNDO 3: CRIADOR DIGITAL (Comunicação, Colaboração e Direitos de Autor)
  // =======================================================================
  'w3-t1': {
    topicId: 'w3-t1',
    worldId: 3,
    title: 'Comunicação Digital Clara e Empática',
    badge: 'Diálogo Respeitoso',
    imageUrl: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Pessoas a comunicar através de mensagens digitais amigáveis e respeitosas num dispositivo móvel',
    caption: 'Sem expressão facial ou tom de voz, o texto pode parecer frio ou zangado. Escolher bem as palavras evita mal-entendidos.',
    visualHighlights: [
      {
        iconName: 'Smile',
        label: 'Emojis com Moderação',
        description: 'Um emoji sorridente ajuda a esclarecer que estavas a brincar e não a criticar com malícia.',
      },
      {
        iconName: 'VolumeX',
        label: 'Evitar Maiúsculas',
        description: 'ESCREVER TUDO ASSIM equivale a gritar com a outra pessoa no meio da sala de aula.',
      },
      {
        iconName: 'CheckSquare',
        label: 'Releitura Antes do Envio',
        description: 'Lê duas vezes o que escreveste antes de carregar em "Enviar" para garantir clareza e respeito.',
      },
    ],
    proTip: 'Teste da Presença: Se não dirias essa mesma frase cara a cara com o teu colega no recreio, não a escrevas no chat!',
    colorTheme: 'purple',
  },

  'w3-t2': {
    topicId: 'w3-t2',
    worldId: 3,
    title: 'Netiqueta: Boas Maneiras Online',
    badge: 'Boas Maneiras Digitais',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Grupo jovem de estudantes a interagir de forma cooperativa e alegre com computadores',
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
        description: 'Nunca entres em grupos para gozar com alguém. Avisa logo um professor ou adulto!',
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
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Estudantes a trabalhar num documento colaborativo conjunto partilhado no computador',
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
    proTip: 'Dica de Equipa: Usem os comentários do documento para dar sugestões sem estragar o texto dos colegas!',
    colorTheme: 'purple',
  },

  'w3-t4': {
    topicId: 'w3-t4',
    worldId: 3,
    title: 'Direitos de Autor: Respeitar Quem Cria',
    badge: 'Proteção da Criação',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Símbolo de lei e direitos de autor ao lado de livros clássicos de estudo',
    caption: 'Toda a música, foto, texto ou desenho pertence a quem o criou. Encontrar na Internet não quer dizer que possas usar sem regras.',
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
        label: 'Dar o Mérito',
        description: 'Os autores esforçam-se para criar arte; dizer quem fez a obra é justo e correto.',
      },
    ],
    proTip: 'Truque Legal: Ao pesquisar imagens, usa o filtro "Direitos de Utilização" para encontrar fotos livres para usar!',
    colorTheme: 'purple',
  },

  'w3-t5': {
    topicId: 'w3-t5',
    worldId: 3,
    title: 'Dar Crédito e Evitar o Plágio',
    badge: 'Autoria & Fontes',
    imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Páginas abertas de livros de referência com citações e bibliografia anotada',
    caption: 'Plágio é copiar o trabalho de outra pessoa e fingir que foi feito por nós. Indicar a fonte mostra honestidade e rigor!',
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
    proTip: 'Fórmula Simples: Nome do Autor + Ano + Título do Site + Link. Claro, honesto e nota máxima!',
    colorTheme: 'purple',
  },

  'w3-t6': {
    topicId: 'w3-t6',
    worldId: 3,
    title: 'Licenças Creative Commons: Partilhar com Regras',
    badge: 'Cultura Livre',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Criador digital a organizar e partilhar conteúdos artísticos sob licenças abertas',
    caption: 'As licenças Creative Commons (CC) dizem antecipadamente o que podes ou não fazer com uma obra sem teres de contactar o autor.',
    visualHighlights: [
      {
        iconName: 'Check',
        label: 'BY (Atribuição)',
        description: 'Podes usar livremente a imagem ou música, desde que dês sempre os créditos ao autor original.',
      },
      {
        iconName: 'DollarSign',
        label: 'NC (Não Comercial)',
        description: 'Podes usar para fins escolares e pessoais, mas é proibido vender ou ganhar dinheiro com a obra.',
      },
      {
        iconName: 'Shuffle',
        label: 'SA (Partilha Igual)',
        description: 'Se modificares o trabalho, deves partilhar a tua nova versão sob a mesma licença aberta.',
      },
    ],
    proTip: 'Banco Gratuito: Sites como Pixabay, Unsplash e Wikimedia Commons oferecem milhões de fotos sob licenças abertas prontas a usar nos teus trabalhos!',
    colorTheme: 'purple',
  },

  // =======================================================================
  // MUNDO 4: ENGENHEIRO DIGITAL (Pensamento Computacional, Algoritmos e Dados)
  // =======================================================================
  'w4-t1': {
    topicId: 'w4-t1',
    worldId: 4,
    title: 'Decomposição: Dividir Problemas Complexos',
    badge: 'Decomposição Lógica',
    imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Peças de puzzle coloridas que se encaixam ordenadamente para formar uma imagem global',
    caption: 'Um problema gigante torna-se simples quando o partimos em pequenos pedaços fáceis de resolver, um de cada vez.',
    visualHighlights: [
      {
        iconName: 'Scissors',
        label: 'Subtarefas Menores',
        description: 'Em vez de "fazer um jogo inteiro", divide em: "desenhar o herói", "fazer o herói andar" e "marcar pontos".',
      },
      {
        iconName: 'CheckCircle',
        label: 'Vitórias Rápidas',
        description: 'Resolver uma pequena parte dá confiança e clareza para avançar para o desafio seguinte.',
      },
      {
        iconName: 'Compass',
        label: 'Visão Global',
        description: 'No final, junta todas as partes para obter a solução completa e harmoniosa.',
      },
    ],
    proTip: 'Exemplo do Quotidiano: Organizar uma festa de aniversário divide-se em: convidados, comida, música e espaço. Pensar como engenheiro é natural!',
    colorTheme: 'amber',
  },

  'w4-t2': {
    topicId: 'w4-t2',
    worldId: 4,
    title: 'Algoritmos: A Receita Passo a Passo',
    badge: 'Sequência Ordenada',
    imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Linhas claras de código de programação e instruções sequenciais ordenadas num ecrã',
    caption: 'Um computador não adivinha: cumpre ordens à risca. Um algoritmo é uma sequência precisa de passos ordenados para cumprir uma tarefa.',
    visualHighlights: [
      {
        iconName: 'ArrowRight',
        label: 'A Ordem Importa',
        description: 'Não podes calçar os sapatos antes das meias! No código, baralhar a ordem estraga o resultado.',
      },
      {
        iconName: 'Target',
        label: 'Instruções Sem Dúvida',
        description: 'Ordens como "vira à direita 90 graus e anda 3 passos" são exatas e o computador compreende-as perfeitamente.',
      },
      {
        iconName: 'Code',
        label: 'Blocos de Código',
        description: 'Plataformas como o Scratch encaixam blocos coloridos como peças LEGO para criar algoritmos visuais.',
      },
    ],
    proTip: 'Testar com Amigos: Tenta dar instruções a um colega para desenhar uma casa sem ele olhar para ti; vais ver a importância da precisão de cada palavra!',
    colorTheme: 'amber',
  },

  'w4-t3': {
    topicId: 'w4-t3',
    worldId: 4,
    title: 'Condições: Decisões SE / SENÃO',
    badge: 'Tomar Decisões',
    imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Bifurcação de caminhos e sinalética que simboliza escolhas alternativas',
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
        description: 'Quando a condição se cumpre, o computador faz o primeiro grupo de ordens.',
      },
      {
        iconName: 'X',
        label: 'Senão (Não)',
        description: 'Quando não se cumpre, o computador faz o outro caminho alternativo.',
      },
    ],
    proTip: 'No Dia a Dia: "SE estiver a chover, levo guarda-chuva; SENÃO, levo óculos de sol". Usamos condições todos os dias!',
    colorTheme: 'amber',
  },

  'w4-t4': {
    topicId: 'w4-t4',
    worldId: 4,
    title: 'Ciclos & Repetições (Loops)',
    badge: 'Repetir Sem Cansar',
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb325?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Padrão circular espiral e contínuo que simboliza rotação, ciclos e repetição contínua',
    caption: 'Em vez de escreveres a mesma ordem 100 vezes, um ciclo (loop) repete a ação sozinho, poupando tempo e código!',
    visualHighlights: [
      {
        iconName: 'Repeat',
        label: 'Repetir N Vezes',
        description: 'Diz exatamente quantas vezes repetir: "Repete 4 vezes: Anda 100 passos e vira à direita" (desenha um quadrado!).',
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
    proTip: 'A Força do Computador: As pessoas cansam-se de repetir a mesma tarefa; o computador repete 1 milhão de vezes sem errar!',
    colorTheme: 'amber',
  },

  'w4-t5': {
    topicId: 'w4-t5',
    worldId: 4,
    title: 'Dados, Tabelas e Gráficos',
    badge: 'Ler Dados',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Painel com gráficos estatísticos coloridos, barras e tabelas numéricas de análise',
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
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Linhas de código informático com destaques de depuração e análise de erros lógicos',
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
    title: 'O que é IA? Reconhecimento de Padrões',
    badge: 'Conceitos Fundamentais',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Rede neural artificial com ligações luminosas simulando processos de aprendizagem computacional',
    caption: 'A Inteligência Artificial é um programa que analisa milhões de dados para encontrar padrões e fazer previsões ou reconhecer fotos e sons.',
    visualHighlights: [
      {
        iconName: 'Cpu',
        label: 'Não é Consciência',
        description: 'A IA não tem sentimentos, consciência nem opiniões próprias; funciona através de cálculos matemáticos.',
      },
      {
        iconName: 'Database',
        label: 'Treinada com Exemplos',
        description: 'Para reconhecer cães, o sistema analisou milhares de fotos de cães até aprender as suas características visuais.',
      },
      {
        iconName: 'Tool',
        label: 'Ferramenta de Apoio',
        description: 'A IA foi criada para auxiliar e potenciar a inteligência humana, não para a substituir.',
      },
    ],
    proTip: 'Diferença Essencial: Um programa comum segue regras rígidas do programador; um modelo de IA aprende com exemplos e dados!',
    colorTheme: 'indigo',
  },

  'w5-t2': {
    topicId: 'w5-t2',
    worldId: 5,
    title: 'IA Generativa: Criação a partir de Instruções',
    badge: 'Síntese & Criação',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Arte abstrata e criativa gerada por algoritmos neurais de inteligência artificial',
    caption: 'Modelos generativos (como Gemini ou ChatGPT) conseguem criar novas frases, ilustrações, poemas e códigos baseando-se no que aprenderam.',
    visualHighlights: [
      {
        iconName: 'Wand2',
        label: 'Criação Rápida',
        description: 'Gera ideias para histórias, planos de estudo e sugestões em segundos.',
      },
      {
        iconName: 'Sparkles',
        label: 'Previsão Estatística',
        description: 'O modelo prevê palavra a palavra qual é o termo mais provável que vem a seguir.',
      },
      {
        iconName: 'AlertTriangle',
        label: 'Sem Juízo Crítico',
        description: 'A IA não "sabe" se o que está a dizer é moralmente correto ou verdadeiro; apenas gera respostas prováveis.',
      },
    ],
    proTip: 'Uso Criativo: Usa a IA generativa como um parceiro de chuva de ideias (brainstorming), mas dá sempre o teu toque pessoal único!',
    colorTheme: 'indigo',
  },

  'w5-t3': {
    topicId: 'w5-t3',
    worldId: 5,
    title: 'Prompts: Como Pedir Bem à IA',
    badge: 'Falar com a IA',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Ecrã a demonstrar instruções de texto estruturadas e comandos detalhados de prompt',
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
    imageUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Lupa a inspecionar uma resposta com sinal de alerta sobre alucinação e erro factual',
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
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Cofre digital com escudo de privacidade a bloquear o acesso indevido a dados de utilizadores',
    caption: 'Tudo o que escreves numa IA pública pode ficar guardado e ser usado para treinar novas versões do programa.',
    visualHighlights: [
      {
        iconName: 'Shield',
        label: 'Sem Nomes Reais',
        description: 'Nunca escrevas o teu nome completo, nem o dos teus colegas ou professores no chat da IA.',
      },
      {
        iconName: 'Lock',
        label: 'Segredos e Palavras-passe',
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
    imageUrl: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Estudante com olhar focado a usar a tecnologia como ajuda enquanto pensa por si',
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
