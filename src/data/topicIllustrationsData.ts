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
    title: 'Cadeado Digital & Senhas Robustas',
    badge: 'Segurança de Acessos',
    imageUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Cadeado digital de segurança e chaves de encriptação num ecrã de computador',
    caption: 'Uma senha forte funciona como uma fechadura blindada que protege as tuas contas de jogos, escola e redes sociais.',
    visualHighlights: [
      {
        iconName: 'Key',
        label: '10+ Caracteres',
        description: 'Combina maiúsculas, minúsculas, números e símbolos especiais (!@#).',
      },
      {
        iconName: 'ShieldAlert',
        label: 'Zero Dados Pessoais',
        description: 'Nunca uses nomes de família, datas de aniversário ou o nome do teu animal de estimação.',
      },
      {
        iconName: 'Lock',
        label: 'Segredo Absoluto',
        description: 'Não partilhes senhas com amigos; apenas com os teus pais ou encarregados de educação.',
      },
    ],
    proTip: 'Dica do Guardião: Imagina uma frase divertida (ex: "O_Meu_G@to_Comeu_7_Biscoitos!") para criar senhas fáceis de lembrar e impossíveis de adivinhar!',
    colorTheme: 'blue',
  },

  'w1-t2': {
    topicId: 'w1-t2',
    worldId: 1,
    title: 'O Isco do Phishing e Fraudes Online',
    badge: 'Alerta Cibernético',
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
        label: 'Informações Confidenciais',
        description: 'Morada, localização em direto, escola onde andas e número de telemóvel são privados.',
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
    title: 'A Tua Pegada no Espaço Digital',
    badge: 'Reputação Online',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Pegadas luminosas e rastos de informação num mapa tecnológico digital',
    caption: 'Cada clique, publicação, pesquisa e comentário que fazes deixa uma marca duradoura na Internet que constrói a tua reputação.',
    visualHighlights: [
      {
        iconName: 'History',
        label: 'Permanência na Nuvem',
        description: 'Mesmo depois de apagares uma mensagem, outros podem ter guardado capturas de ecrã.',
      },
      {
        iconName: 'Sparkles',
        label: 'Pegada Positiva',
        description: 'Partilha projetos escolares criativos, curiosidades científicas e atitudes solidárias.',
      },
      {
        iconName: 'MessageCircle',
        label: 'Comentários Conscientes',
        description: 'Trata os outros com gentileza para construíres um registo digital do qual te possas orgulhar.',
      },
    ],
    proTip: 'Pensamento Futuro: Constrói uma pegada digital de que te orgulhes daqui a 10 anos quando fores para a universidade ou procurares trabalho!',
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
    title: 'Investigação da Autoria e Credibilidade',
    badge: 'Quem Escreveu?',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Caneta e caderno de notas de investigação jornalística com foco na autoria',
    caption: 'Qualquer pessoa pode publicar na web. Um detetive digital procura sempre saber quem assina o artigo e qual a sua experiência no assunto.',
    visualHighlights: [
      {
        iconName: 'UserCheck',
        label: 'Nome & Biografia',
        description: 'Artigos fiáveis indicam claramente o autor, a sua formação e contacto profissional.',
      },
      {
        iconName: 'Building',
        label: 'Entidade Responsável',
        description: 'Verifica a secção "Sobre Nós" para ver se a página pertence a uma universidade, museu ou jornal.',
      },
      {
        iconName: 'HelpCircle',
        label: 'Autores Anónimos',
        description: 'Páginas sem autor identificável ou com perfis falsos exigem o dobro da cautela.',
      },
    ],
    proTip: 'Verificação em 30 Segundos: Se não encontrares o nome do autor nem da entidade no cabeçalho ou rodapé, procura a mesma informação noutra fonte!',
    colorTheme: 'blue',
  },

  'w2-t3': {
    topicId: 'w2-t3',
    worldId: 2,
    title: 'Linha Temporal & Atualidade dos Factos',
    badge: 'Verificação da Data',
    imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Calendário e relógio que simbolizam a passagem do tempo e a frescura da informação',
    caption: 'A ciência e a sociedade evoluem todos os dias. Uma notícia de 2014 pode já não corresponder à realidade ou às descobertas de hoje.',
    visualHighlights: [
      {
        iconName: 'Calendar',
        label: 'Data de Publicação',
        description: 'Procura o dia, mês e ano em que o texto foi escrito ou atualizado pela última vez.',
      },
      {
        iconName: 'RefreshCw',
        label: 'Atualizações Recentes',
        description: 'Em temas de ciência e tecnologia, prefere fontes revistas nos últimos 1 a 2 anos.',
      },
      {
        iconName: 'Clock',
        label: 'Acontecimentos Reciclados',
        description: 'Cuidado com vídeos e tempestades antigas partilhadas como se estivessem a acontecer hoje.',
      },
    ],
    proTip: 'Dica do Detetive: Se um artigo não mostra data visível, usa o filtro temporal do motor de busca para confirmar o ano original!',
    colorTheme: 'blue',
  },

  'w2-t4': {
    topicId: 'w2-t4',
    worldId: 2,
    title: 'Triangulação: Comparar Múltiplas Fontes',
    badge: 'Cruzamento de Dados',
    imageUrl: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Vários jornais e artigos impressos lado a lado para comparação de perspetivas',
    caption: 'Nunca fiques apenas com o primeiro link encontrado. Comparar pelo menos 2 a 3 fontes independentes é a chave para confirmar a verdade.',
    visualHighlights: [
      {
        iconName: 'Layers',
        label: 'Regra dos 3 Pontos',
        description: 'Se três meios de comunicação sérios confirmam a notícia, a probabilidade de ser real é enorme.',
      },
      {
        iconName: 'AlertCircle',
        label: 'Informação Isolada',
        description: 'Se apenas um blogue estranho fala de uma "descoberta revolucionária", desconfia imediatamente.',
      },
      {
        iconName: 'Compass',
        label: 'Fontes Oficiais',
        description: 'Consulta sites governamentais (.gov.pt), universidades (.edu / .pt) ou enciclopédias reconhecidas.',
      },
    ],
    proTip: 'Pensa como um Cientista: Dois factos que concordam dão uma pista; três fontes independentes dão uma confirmação sólida!',
    colorTheme: 'blue',
  },

  'w2-t5': {
    topicId: 'w2-t5',
    worldId: 2,
    title: 'Fact-Checking e Combate à Desinformação',
    badge: 'Desmascarar Fake News',
    imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Lupa de ampliação a inspecionar manchetes de notícias com carimbo de verificação de factos',
    caption: 'Títulos sensacionalistas foram feitos para despertar emoções fortes e partilhas impulsivas. O detetive digital analisa as provas com calma.',
    visualHighlights: [
      {
        iconName: 'CheckCircle2',
        label: 'Verificadores Oficiais',
        description: 'Recorre a plataformas de verificação jornalística (como Polígrafo ou Factcheck) para esclarecer boatos virais.',
      },
      {
        iconName: 'Flame',
        label: 'Títulos Isco (Clickbait)',
        description: 'Títulos em maiúsculas com "NÃO VAIS ACREDITAR!" tentam apenas ganhar cliques sem oferecer informação séria.',
      },
      {
        iconName: 'Share2',
        label: 'Travão de Partilha',
        description: 'Não sejas o transmissor de boatos na turma. Se não tens a certeza absoluta, não partilhes.',
      },
    ],
    proTip: 'Regra de Ouro: Para, pensa e checa as evidências antes de carregar no botão de partilha!',
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
    title: 'Netiqueta: Cidadania no Espaço Virtual',
    badge: 'Boas Maneiras Digitais',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Grupo jovem de estudantes a interagir de forma cooperativa e alegre com computadores',
    caption: 'Netiqueta é a combinação de "Rede" (Net) e "Etiqueta". Significa manter a mesma educação e respeito que temos no mundo físico.',
    visualHighlights: [
      {
        iconName: 'Heart',
        label: 'Respeito pelas Diferenças',
        description: 'Podemos discordar de uma ideia sem ofender ou diminuir o colega que a expressou.',
      },
      {
        iconName: 'Clock',
        label: 'Horários Sensatos',
        description: 'Evita enviar mensagens sobre trabalhos de grupo a altas horas da noite ou no fim de semana.',
      },
      {
        iconName: 'Shield',
        label: 'Ciberbullying Zero',
        description: 'Nunca participes em grupos criados para gozar com alguém. Denuncia situações injustas a um professor.',
      },
    ],
    proTip: 'Espalha Gentileza: Um simples "Obrigado pela partilha" ou "Bom trabalho equipa" melhora o ambiente de qualquer grupo escolar!',
    colorTheme: 'purple',
  },

  'w3-t3': {
    topicId: 'w3-t3',
    worldId: 3,
    title: 'Colaboração na Nuvem e Trabalho de Equipa',
    badge: 'Projetos em Equipa',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Estudantes a trabalhar num documento colaborativo conjunto partilhado no computador',
    caption: 'Ferramentas de edição em tempo real permitem que vários alunos construam um trabalho incrível em simultâneo.',
    visualHighlights: [
      {
        iconName: 'Users',
        label: 'Divisão Clara de Tarefas',
        description: 'Definam quem pesquisa, quem redige o texto e quem escolhe as imagens com prazos acordados.',
      },
      {
        iconName: 'GitBranch',
        label: 'Histórico de Versões',
        description: 'Os documentos online guardam alterações passadas para poderes recuperar texto apagado sem pânico.',
      },
      {
        iconName: 'Edit3',
        label: 'Respeito pelas Edições',
        description: 'Nunca apagues o parágrafo de um colega sem falar com ele e explicar a tua sugestão de melhoria.',
      },
    ],
    proTip: 'Comunicação Ativa: Usem a secção de comentários dentro do documento para debater ideias sem alterar o texto final diretamente!',
    colorTheme: 'purple',
  },

  'w3-t4': {
    topicId: 'w3-t4',
    worldId: 3,
    title: 'Direitos de Autor & Propriedade Intelectual',
    badge: 'Proteção da Criação',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Símbolo de lei e direitos de autor ao lado de livros clássicos de estudo',
    caption: 'Toda a obra original — música, fotografia, texto ou desenho — pertence a quem a criou. Encontrar na web não significa poder usar sem regras.',
    visualHighlights: [
      {
        iconName: 'Bookmark',
        label: 'O Símbolo © Copyright',
        description: 'Indica que todos os direitos estão reservados e precisas de autorização expressa do autor.',
      },
      {
        iconName: 'Image',
        label: 'Imagens na Web',
        description: 'Não copies fotos aleatórias do Google Imagens sem verificar se o autor autoriza a sua utilização.',
      },
      {
        iconName: 'Award',
        label: 'Reconhecer o Mérito',
        description: 'Os criadores dedicam horas a produzir arte; reconhecer a sua autoria é um dever ético e legal.',
      },
    ],
    proTip: 'Filtro Legal: Quando pesquisares imagens no motor de busca, usa a ferramenta "Direitos de Utilização" para encontrar fotos livres de royalties!',
    colorTheme: 'purple',
  },

  'w3-t5': {
    topicId: 'w3-t5',
    worldId: 3,
    title: 'Citação Académica e Prevenção do Plágio',
    badge: 'Autoria & Referências',
    imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Páginas abertas de livros de referência com citações e bibliografia anotada',
    caption: 'Plágio é copiar o trabalho de outro e fingir que fomos nós que o fizemos. Citar a fonte demonstra inteligência, rigor e honestidade.',
    visualHighlights: [
      {
        iconName: 'Quote',
        label: 'Uso de Aspas (" ")',
        description: 'Se copiares uma frase palavra por palavra, coloca-a entre aspas e indica logo a seguir quem a disse.',
      },
      {
        iconName: 'BookOpen',
        label: 'A Tua Própria Voz',
        description: 'Lê a fonte, fecha a página e escreve o resumo por tuas próprias palavras (fazer paráfrase).',
      },
      {
        iconName: 'List',
        label: 'Bibliografia Final',
        description: 'Coloca no fim do teu trabalho escolar a lista de livros e links consultados.',
      },
    ],
    proTip: 'Fórmula de Citação: Nome do Autor + Ano + Título da Página + Link. Simples, transparente e digno de nota máxima!',
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
    title: 'Condições: Decisões SE / SENÃO (Branching)',
    badge: 'Tomada de Decisão',
    imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Bifurcação de caminhos e sinalética que simboliza caminhos e escolhas alternativas',
    caption: 'Um programa inteligente escolhe o caminho a seguir avaliando condições: "SE a vida for zero, termina o jogo; SENÃO, continua a jogar".',
    visualHighlights: [
      {
        iconName: 'GitMerge',
        label: 'Estrutura IF / ELSE',
        description: 'Permite bifurcar o fluxo do algoritmo com base em dados de sensores, teclas premidas ou variáveis.',
      },
      {
        iconName: 'Check',
        label: 'Condição Verdadeira',
        description: 'Se a resposta for "Sim", o computador executa o primeiro bloco de instruções.',
      },
      {
        iconName: 'X',
        label: 'Condição Falsa (Senão)',
        description: 'Se for "Não", o computador salta e executa a alternativa correspondente.',
      },
    ],
    proTip: 'No Dia a Dia: "SE estiver a chover, levo guarda-chuva; SENÃO, levo óculos de sol". As condições estão presentes em tudo o que fazemos!',
    colorTheme: 'amber',
  },

  'w4-t4': {
    topicId: 'w4-t4',
    worldId: 4,
    title: 'Ciclos & Repetições: Automação Inteligente',
    badge: 'Loops & Otimização',
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb325?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Padrão circular espiral e contínuo que simboliza rotação, ciclos e repetição contínua',
    caption: 'Em vez de escreveres a mesma instrução 100 vezes, um ciclo (loop) repete a ação automaticamente, poupando esforço e código.',
    visualHighlights: [
      {
        iconName: 'Repeat',
        label: 'Repetir N Vezes',
        description: 'Define um número exato de repetições: "Repete 4 vezes: Anda 100 passos, Vira 90º à direita" (desenha um quadrado!).',
      },
      {
        iconName: 'Infinity',
        label: 'Repetir Sempre',
        description: 'Usado em jogos para verificar continuamente se a bola tocou na raquete ou na parede.',
      },
      {
        iconName: 'Zap',
        label: 'Eficiência de Código',
        description: 'Menos linhas de código significam programas mais rápidos, leves e muito mais fáceis de corrigir.',
      },
    ],
    proTip: 'A Força do Computador: Os humanos cansam-se de repetir tarefas monótonas; os computadores conseguem repetir um cálculo 1 milhão de vezes sem errar!',
    colorTheme: 'amber',
  },

  'w4-t5': {
    topicId: 'w4-t5',
    worldId: 4,
    title: 'Dados, Gráficos e Padrões Estatísticos',
    badge: 'Interpretação de Dados',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Painel com gráficos estatísticos coloridos, barras e tabelas numéricas de análise',
    caption: 'Dados brutos em números são difíceis de compreender. Quando os organizamos em tabelas e gráficos, descobrimos tendências invisíveis.',
    visualHighlights: [
      {
        iconName: 'BarChart2',
        label: 'Gráficos de Barras',
        description: 'Ideais para comparar quantidades entre diferentes grupos (ex: desporto favorito da turma).',
      },
      {
        iconName: 'PieChart',
        label: 'Gráficos Circulares',
        description: 'Mostram como o todo está dividido em fatias proporcionais (percentagens).',
      },
      {
        iconName: 'TrendingUp',
        label: 'Linha Temporal',
        description: 'Acompanham a subida ou descida de temperaturas ou pontuações ao longo de semanas.',
      },
    ],
    proTip: 'Olhos Críticos: Ao analisares um gráfico, lê sempre o título e os rótulos dos eixos antes de tirares conclusões apressadas!',
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
    title: 'Engenharia de Prompts: A Arte de Pedir Bem',
    badge: 'Comunicação com a IA',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Ecrã a demonstrar instruções de texto estruturadas e comandos detalhados de prompt',
    caption: 'Quanto melhor e mais detalhada for a instrução (prompt) que dás à IA, mais útil, rigorosa e adequada será a resposta recebida.',
    visualHighlights: [
      {
        iconName: 'User',
        label: 'Papel (Role)',
        description: 'Diz à IA quem ela deve ser: "Age como um professor de Ciências do 6.º ano".',
      },
      {
        iconName: 'FileText',
        label: 'Contexto Claro',
        description: 'Explica o objetivo: "Estou a preparar uma apresentação sobre a poluição dos oceanos".',
      },
      {
        iconName: 'Layout',
        label: 'Formato Exato',
        description: 'Pede como queres o resultado: "Apresenta em 4 pontos curtos e simples".',
      },
    ],
    proTip: 'Fórmula Mágica: Papel + Tarefa + Contexto + Formato = Resposta de Alta Qualidade!',
    colorTheme: 'indigo',
  },

  'w5-t4': {
    topicId: 'w5-t4',
    worldId: 5,
    title: 'Alucinações de IA: Quando a Máquina Inventa',
    badge: 'Deteção de Alucinações',
    imageUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Lupa a inspecionar uma resposta com sinal de alerta sobre alucinação e erro factual',
    caption: 'Por vezes, a IA responde com enorme confiança inventando nomes de livros que não existem, datas erradas e acontecimentos fictícios.',
    visualHighlights: [
      {
        iconName: 'AlertOctagon',
        label: 'Confiança Enganadora',
        description: 'A IA nunca diz "não sei"; ela tenta sempre completar a resposta, mesmo que tenha de inventar.',
      },
      {
        iconName: 'Search',
        label: 'Auditoria Obrigatória',
        description: 'Verifica sempre datas históricas, fórmulas matemáticas e nomes de cientistas em livros escolares.',
      },
      {
        iconName: 'Link2',
        label: 'Pede Fontes Reais',
        description: 'Pede à ferramenta: "Onde posso confirmar esta informação num livro ou site oficial?".',
      },
    ],
    proTip: 'Regra de Ouro da IA: Nunca copies e coles uma resposta de IA num trabalho escolar sem antes verificar se os factos são verdadeiros!',
    colorTheme: 'indigo',
  },

  'w5-t5': {
    topicId: 'w5-t5',
    worldId: 5,
    title: 'Privacidade e Alimentação dos Modelos de IA',
    badge: 'Proteção de Segredos',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Cofre digital com escudo de privacidade a bloquear o acesso indevido a dados de utilizadores',
    caption: 'Tudo o que digitas numa ferramenta pública de IA pode ser armazenado e usado pelos criadores para treinar futuras versões do modelo.',
    visualHighlights: [
      {
        iconName: 'Shield',
        label: 'Zero Nomes Reais',
        description: 'Nunca partilhes o teu nome completo, dos teus colegas ou professores nas janelas de chat de IA.',
      },
      {
        iconName: 'Lock',
        label: 'Segredos e Senhas',
        description: 'Nunca insiras senhas, moradas de casa, números de cartão ou fotografias pessoais em assistentes de IA.',
      },
      {
        iconName: 'Settings',
        label: 'Configurar Privacidade',
        description: 'Muitas ferramentas permitem desligar o histórico para evitar que os teus textos sejam usados em treinos.',
      },
    ],
    proTip: 'Higiene de Dados: Se precisares de analisar um texto pessoal, substitui os nomes verdadeiros por "Pessoa A" e as cidades por "Cidade X"!',
    colorTheme: 'indigo',
  },

  'w5-t6': {
    topicId: 'w5-t6',
    worldId: 5,
    title: 'Pensar com a IA: Parceria Consciente',
    badge: 'Autonomia Humana',
    imageUrl: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Estudante com olhar focado a usar a tecnologia como copiloto enquanto pensa autonomamente',
    caption: 'A IA deve ser como uma bicicleta para a tua mente: ajuda-te a chegar mais longe e mais depressa, mas és sempre tu quem pedala e escolhe o destino.',
    visualHighlights: [
      {
        iconName: 'Brain',
        label: 'Tu És o Condutor',
        description: 'Se a IA fizer o teu trabalho por ti, o teu cérebro não treina nem aprende nada de novo.',
      },
      {
        iconName: 'Filter',
        label: 'Fura a Bolha',
        description: 'Algoritmos de recomendação mostram-te apenas o que já gostas; procura intencionalmente assuntos diferentes.',
      },
      {
        iconName: 'CheckCircle',
        label: 'Espírito Crítico',
        description: 'Avalia se a sugestão da IA faz sentido no teu contexto ou se precisa de ajustes profundos.',
      },
    ],
    proTip: 'Conclusão Mestre: O futuro pertence a quem sabe pensar criticamente e usar a inteligência artificial como aliada ética e inteligente!',
    colorTheme: 'indigo',
  },
};
