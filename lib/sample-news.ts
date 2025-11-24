export interface SampleNewsAuthor {
  name: string;
  profile: {
    displayName: string;
  };
}

export interface SampleNewsItem {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage: string;
  publishedAt: string;
  author: SampleNewsAuthor;
}

const PLACEHOLDER_COVER = "/stadium.jpg";

const journalist: SampleNewsAuthor = {
  name: "Jornalista Um",
  profile: {
    displayName: "Jornalista Um",
  },
};

export const sampleNews: SampleNewsItem[] = [
  {
    title: "Estrela em ascensão brilha em clássico decisivo",
    slug: "estrela-em-ascensao-brilha-em-classico-decisivo",
    excerpt:
      "Com atuação inspirada, a jovem promessa decidiu o confronto regional aos 42 minutos do segundo tempo e colocou o clube na liderança do campeonato estadual.",
    content:
      "A tarde ensolarada no estádio municipal recebeu mais de 35 mil torcedores para assistir ao confronto direto pela liderança do campeonato. Aos 42 minutos da etapa final, a joia da base recebeu pela esquerda, cortou para o meio e finalizou com precisão no canto superior.\n\nO gol não apenas garantiu os três pontos, mas também consolidou o nome do atleta entre os principais destaques do torneio. O treinador elogiou a maturidade do jovem camisa 11 e ressaltou o trabalho do departamento de análise de desempenho na preparação do elenco.",
    category: "Campeonatos",
    coverImage: PLACEHOLDER_COVER,
    publishedAt: "2025-08-03T18:30:00.000Z",
    author: journalist,
  },
  {
    title: "Comissão técnica investe em tecnologia para treinos",
    slug: "comissao-tecnica-investe-em-tecnologia-para-treinos",
    excerpt:
      "Departamento de futebol implementa novas metodologias com apoio de análise de dados para potencializar desempenho físico e tático do elenco profissional.",
    content:
      "Os profissionais do clube iniciaram a semana apresentando um novo pacote de soluções tecnológicas que inclui monitoramento de carga em tempo real e simulações táticas em realidade virtual. A iniciativa é fruto de parceria com uma startup especializada em ciência do esporte.\n\nSegundo a equipe de preparação física, os recursos permitem personalizar sessões de treinamento de acordo com o histórico de cada atleta, reduzindo o risco de lesões e acelerando processos de recuperação. O clube pretende expandir o uso das ferramentas para as categorias de base até o final da temporada.",
    category: "Bastidores",
    coverImage: PLACEHOLDER_COVER,
    publishedAt: "2025-08-01T14:00:00.000Z",
    author: journalist,
  },
  {
    title: "Base conquista título invicto em torneio internacional",
    slug: "base-conquista-titulo-invicto-em-torneio-internacional",
    excerpt:
      "Equipe sub-17 vence quatro partidas seguidas, marca onze gols e volta para casa com troféu inédito após campanha sólida em Montevidéu.",
    content:
      "Os jovens atletas mostraram maturidade ao longo do torneio disputado no Uruguai e derrotaram adversários de diferentes estilos de jogo. Na final, a equipe brasileira superou o tradicional Nacional por 2 a 1, com gols de um zagueiro artilheiro e do meia criativo.\n\nA comissão técnica destacou a disciplina tática do grupo e o protagonismo da linha defensiva, que sofreu apenas dois gols em toda a competição. A conquista reforça o investimento contínuo da diretoria em categorias de formação.",
    category: "Categorias de base",
    coverImage: PLACEHOLDER_COVER,
    publishedAt: "2025-07-27T10:15:00.000Z",
    author: journalist,
  },
  {
    title: "Departamento médico apresenta novo protocolo de prevenção",
    slug: "departamento-medico-apresenta-novo-protocolo-de-prevencao",
    excerpt:
      "Clube amplia equipe multidisciplinar e lança programa integrado de fisiologia, nutrição e psicologia para atletas do elenco principal.",
    content:
      "A reformulação do departamento médico foi tema de coletiva no centro de treinamento nesta manhã. Os profissionais apresentaram um protocolo baseado em três pilares: avaliação periódica, acompanhamento nutricional individualizado e suporte psicológico contínuo.\n\nA expectativa é reduzir o tempo de afastamento por contusões musculares em 25% até o fim do ano, além de fortalecer o vínculo entre jogadores e staff técnico.",
    category: "Saúde e performance",
    coverImage: PLACEHOLDER_COVER,
    publishedAt: "2025-07-22T09:00:00.000Z",
    author: journalist,
  },
  {
    title: "Arquibancada prepara mosaico especial para decisão continental",
    slug: "arquibancada-prepara-mosaico-especial-para-decisao-continental",
    excerpt:
      "Grupos da arquibancada se unem em ação solidária que arrecada alimentos enquanto prepara espetáculo de luzes e cores para o jogo mais aguardado do ano.",
    content:
      "Integrantes das principais frentes da arquibancada anunciaram parceria para montar um mosaico 3D que ocupará os quatro setores do estádio. O material foi financiado por campanha coletiva que arrecadou cinco toneladas de alimentos para instituições locais.\n\nAlém do show nas arquibancadas, os apaixonados planejam recepção calorosa ao elenco, com concentração nas imediações do CT na véspera da partida.",
    category: "Arquibancada",
    coverImage: PLACEHOLDER_COVER,
    publishedAt: "2025-07-18T20:45:00.000Z",
    author: journalist,
  },
  {
    title: "Executivo detalha planejamento para a próxima janela",
    slug: "executivo-detalha-planejamento-para-a-proxima-janela",
    excerpt:
      "Diretoria confirma mapa de prioridades para reforços e foca em jogadores com versatilidade para atuar em mais de uma função.",
    content:
      "Em entrevista exclusiva, o diretor executivo explicou que a estratégia do clube passa por contratações pontuais, alinhadas às demandas de comissão técnica e análise de desempenho. O clube monitora atletas sul-americanos com possibilidade de adaptação rápida ao futebol nacional.\n\nO dirigente também destacou o cuidado com a saúde financeira, reforçando que qualquer investimento será acompanhado de mecanismos de performance e metas esportivas claras.",
    category: "Mercado da bola",
    coverImage: PLACEHOLDER_COVER,
    publishedAt: "2025-07-15T16:20:00.000Z",
    author: journalist,
  },
];
