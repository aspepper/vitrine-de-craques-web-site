export interface SampleGameAuthor {
  name: string
  profile: {
    displayName: string
  }
}

export interface SampleGameClub {
  name: string
  slug: string
}

export interface SampleGameItem {
  id: string
  title: string
  slug: string
  category: string
  excerpt: string
  content: string
  coverImage: string
  date: string
  scoreHome: number
  scoreAway: number
  homeClub: SampleGameClub
  awayClub: SampleGameClub
  author: SampleGameAuthor
}

const journalist: SampleGameAuthor = {
  name: "Jornalista Um",
  profile: {
    displayName: "Jornalista Um",
  },
}

const clubeA: SampleGameClub = { name: "Clube A", slug: "clube-a" }
const clubeB: SampleGameClub = { name: "Clube B", slug: "clube-b" }
const clubeC: SampleGameClub = { name: "Clube C", slug: "clube-c" }
const clubeD: SampleGameClub = { name: "Clube D", slug: "clube-d" }

export const sampleGames: SampleGameItem[] = [
  {
    id: "como-zerar-o-minecraft",
    title: "Como zerar o Minecraft?",
    slug: "como-zerar-o-minecraft",
    category: "Dica",
    excerpt: "Aqui vamos mostrar o segredo para chegar ao fim da jornada sem deixar nenhum bloco para trás.",
    content:
      "Dominar o modo sobrevivência exige planejamento e paciência. Comece definindo uma base segura, priorize a coleta de recursos essenciais e não subestime a importância de poções e encantamentos.\n\nDepois de localizar as fortificações, organize o inventário e garanta suprimentos extras antes de atravessar o portal. Na dimensão final, mantenha a calma, destrua os cristais e confie na precisão dos seus movimentos para derrubar o dragão.",
    coverImage:
      "https://images.unsplash.com/photo-1511519984179-62e3b6aa3a36?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2025-08-12T22:00:00.000Z",
    scoreHome: 2,
    scoreAway: 1,
    homeClub: clubeA,
    awayClub: clubeB,
    author: journalist,
  },
  {
    id: "estrategias-para-campeonatos-fps",
    title: "Estratégias avançadas para campeonatos FPS",
    slug: "estrategias-para-campeonatos-fps",
    category: "Análise",
    excerpt: "Estudamos as decisões táticas que diferenciam equipes campeãs em finais presenciais de tiro em primeira pessoa.",
    content:
      "As partidas eliminatórias exigem sincronia perfeita entre comunicação e execução. Times vencedores treinam situações de clutch diariamente, revisitam gravações para entender padrões rivais e mantêm protocolos claros para retomar zonas dominadas.\n\nDurante as finais, o gerenciamento emocional é tão importante quanto a mira. Pausas estratégicas e feedback construtivo ajudam a manter a equipe focada mesmo sob pressão intensa.",
    coverImage:
      "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2025-08-18T19:30:00.000Z",
    scoreHome: 16,
    scoreAway: 14,
    homeClub: clubeC,
    awayClub: clubeD,
    author: journalist,
  },
  {
    id: "bastidores-da-preparacao-tatica",
    title: "Bastidores da preparação tática",
    slug: "bastidores-da-preparacao-tatica",
    category: "Bastidores",
    excerpt: "Conversamos com analistas que transformam dados em estratégias vencedoras antes de cada série decisiva.",
    content:
      "O trabalho começa dias antes da partida com mapeamentos detalhados de tendências. Utilizando ferramentas de análise, os especialistas identificam fragilidades de cada adversário e constroem playlists específicas para treinos práticos.\n\nNo dia do jogo, os relatórios se transformam em chamadas objetivas que guiam a tomada de decisão em tempo real, garantindo que as leituras se convertam em vantagem competitiva.",
    coverImage:
      "https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2025-08-05T17:00:00.000Z",
    scoreHome: 3,
    scoreAway: 0,
    homeClub: clubeB,
    awayClub: clubeA,
    author: journalist,
  },
  {
    id: "rotinas-de-treino-para-mapas-complexos",
    title: "Rotinas de treino para mapas complexos",
    slug: "rotinas-de-treino-para-mapas-complexos",
    category: "Treinamento",
    excerpt: "Veja como staff técnico adapta rotinas de treinos para mapas com múltiplos objetivos simultâneos.",
    content:
      "A construção de repertório começa com sessões individuais para domínio de habilidades e termina com simulações completas da equipe. Cada mapa recebe um plano de contingência que define prioridades, pontos de rotação e chamadas de emergência.\n\nOs treinos também incluem revisão mental guiada para acelerar a memorização de setups e criar confiança em execuções rápidas.",
    coverImage:
      "https://images.unsplash.com/photo-1506634064465-7dabd83d6585?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2025-08-22T15:00:00.000Z",
    scoreHome: 13,
    scoreAway: 11,
    homeClub: clubeC,
    awayClub: clubeA,
    author: journalist,
  },
  {
    id: "equilibrio-mental-em-finais",
    title: "Equilíbrio mental em finais presenciais",
    slug: "equilibrio-mental-em-finais",
    category: "Performance",
    excerpt: "Como psicólogos esportivos atuam para manter atletas concentrados diante de milhares de torcedores.",
    content:
      "Sessões pré-jogo incluem exercícios de respiração, visualização de cenários críticos e reforço positivo personalizado. A proximidade do público exige preparação adicional para bloquear estímulos externos sem perder a conexão com a torcida.\n\nApós cada mapa, a equipe psicológica conduz check-ins rápidos para ajustar níveis de energia e reforçar a comunicação assertiva dentro do grupo.",
    coverImage:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2025-08-10T16:45:00.000Z",
    scoreHome: 2,
    scoreAway: 2,
    homeClub: clubeD,
    awayClub: clubeB,
    author: journalist,
  },
  {
    id: "tecnologia-nos-campeonatos",
    title: "Tecnologia que transforma campeonatos",
    slug: "tecnologia-nos-campeonatos",
    category: "Inovação",
    excerpt: "Ferramentas de análise em nuvem elevam a preparação com dashboards em tempo real para comissão técnica.",
    content:
      "Equipamentos portáteis monitoram movimentos, tempo de reação e padrões de mira em cada treino. Essas métricas abastecem modelos preditivos que ajudam a planejar substituições e definir o ritmo ideal de jogo.\n\nCom dados integrados, as comissões conseguem ajustar estratégias durante as partidas, antecipando tendências dos adversários antes mesmo que apareçam nos placares.",
    coverImage:
      "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2025-08-02T13:20:00.000Z",
    scoreHome: 1,
    scoreAway: 0,
    homeClub: clubeA,
    awayClub: clubeD,
    author: journalist,
  },
  {
    id: "analise-de-meta-competitivo",
    title: "Análise de meta competitivo",
    slug: "analise-de-meta-competitivo",
    category: "Estudo",
    excerpt: "Resumo completo das atualizações que alteraram o equilíbrio entre classes na última temporada.",
    content:
      "Mudanças recentes favoreceram estilos de jogo agressivos, valorizando personagens com alta mobilidade. As equipes que anteciparam essa tendência trouxeram composições híbridas capazes de pressionar desde os minutos iniciais.\n\nPara se manter no topo do meta, especialistas recomendam ciclos semanais de revisão e um banco amplo de estratégias para responder a patches repentinos.",
    coverImage:
      "https://images.unsplash.com/photo-1515719100330-4b3f39cb0d94?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2025-08-28T21:15:00.000Z",
    scoreHome: 3,
    scoreAway: 2,
    homeClub: clubeB,
    awayClub: clubeC,
    author: journalist,
  },
  {
    id: "como-liderar-equipes-remotas",
    title: "Como liderar equipes remotas",
    slug: "como-liderar-equipes-remotas",
    category: "Gestão",
    excerpt: "Treinadores revelam rotinas que mantêm sinergia mesmo com treinos em fusos horários diferentes.",
    content:
      "Calendários compartilhados, sessões diárias de alinhamento e relatórios objetivos são pilares para manter a disciplina. Além disso, a rotação de lideranças auxilia na distribuição das responsabilidades e fortalece a confiança coletiva.\n\nNos playoffs, a equipe já está acostumada a lidar com ajustes repentinos, pois simula mudanças logísticas durante toda a temporada regular.",
    coverImage:
      "https://images.unsplash.com/photo-1472457897821-70d3819a0e24?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2025-09-03T18:00:00.000Z",
    scoreHome: 2,
    scoreAway: 3,
    homeClub: clubeD,
    awayClub: clubeA,
    author: journalist,
  },
  {
    id: "o-futuro-dos-fan-fests",
    title: "O futuro dos fan fests",
    slug: "o-futuro-dos-fan-fests",
    category: "Comunidade",
    excerpt: "Eventos híbridos combinam experiências presenciais e digitais para aproximar torcida e elenco.",
    content:
      "Organizadores apostam em hubs regionais conectados por realidade aumentada, permitindo que torcedores interajam em tempo real com jogadores. Patrocinadores acompanham métricas de engajamento minuto a minuto para personalizar ativações.\n\nO sucesso depende da curadoria de conteúdos exclusivos e de uma equipe de produção capaz de integrar transmissões, ativações e suporte técnico sem falhas.",
    coverImage:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2025-09-08T20:10:00.000Z",
    scoreHome: 4,
    scoreAway: 4,
    homeClub: clubeC,
    awayClub: clubeB,
    author: journalist,
  },
]
