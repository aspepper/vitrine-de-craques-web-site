export interface SampleGameAuthor {
  name: string
  profile: {
    displayName: string
  }
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
  author: SampleGameAuthor
}

const PLACEHOLDER_COVER = "/stadium.jpg"

const journalist: SampleGameAuthor = {
  name: "Jornalista Um",
  profile: {
    displayName: "Jornalista Um",
  },
}

export const sampleGames: SampleGameItem[] = [
  {
    id: "blog-controle-retro-curiosidades-easter-egg-games",
    title:
      "Blog do Controle Retro: curiosidades sobre o primeiro easter egg dos games",
    slug: "blog-controle-retro-curiosidades-easter-egg-games",
    category: "Curiosidades",
    excerpt:
      "Descubra como um desenvolvedor da Atari escondeu seu nome dentro de Adventure, abrindo caminho para a cultura dos easter eggs nos jogos modernos.",
    content:
      "Enquanto revisava clássicos do Atari 2600, o Blog do Controle Retro mergulhou na história de Warren Robinett e de sua ousadia ao esconder a sala secreta em Adventure. O objetivo era garantir reconhecimento em uma época em que a Atari não creditava os criadores.\n\nO blogueiro resgatou imagens das revistas especializadas da década de 1980 que revelaram o segredo ao público e comparou a prática com os easter eggs contemporâneos em séries como Assassin's Creed e The Legend of Zelda. O texto ainda traz dicas de jogos independentes atuais que mantêm a tradição dos segredos para fãs atentos.",
    coverImage: PLACEHOLDER_COVER,
    date: "2024-07-10T15:30:00.000Z",
    author: journalist,
  },
  {
    id: "diario-do-game-pass-bastidores-sea-of-stars",
    title: "Diário do Game Pass comenta os bastidores de Sea of Stars",
    slug: "diario-do-game-pass-bastidores-sea-of-stars",
    category: "Novidades",
    excerpt:
      "Em visita ao estúdio Sabotage, blogueiro brasileiro revela artes conceituais inéditas e planos de expansão do RPG inspirado em Chrono Trigger.",
    content:
      "O Diário do Game Pass foi recebido pelo time da Sabotage em Quebec e ouviu detalhes sobre a atualização planejada para Sea of Stars em 2025. Entre as novidades estão um modo roguelite cooperativo e novas canções compostas por Yasunori Mitsuda.\n\nO artigo também detalha como o estúdio utiliza um quadro de referência com cenas icônicas de jogos clássicos para guiar a paleta de cores e a iluminação. Ao final, há recomendações de soundtracks para ouvir durante a exploração e entrevistas com fãs brasileiros que criam mods cosméticos para o título.",
    coverImage: PLACEHOLDER_COVER,
    date: "2024-07-05T18:00:00.000Z",
    author: journalist,
  },
  {
    id: "blog-save-point-itens-curiosos-final-fantasy-xiv",
    title: "Blog Save Point lista itens perdidos mais curiosos de Final Fantasy XIV",
    slug: "blog-save-point-itens-curiosos-final-fantasy-xiv",
    category: "MMO",
    excerpt:
      "Colecionadores contam histórias inusitadas de glamours raros, mascotes escondidos e quests sazonais que desapareceram de Eorzea.",
    content:
      "O Blog Save Point reuniu relatos de jogadores veteranos de Final Fantasy XIV para mapear itens que sumiram com o passar das expansões. Há menções ao Cascavel de Safira, uma montaria vista apenas durante o beta fechado de A Realm Reborn, e às roupas temáticas do evento Lightning Strikes.\n\nAlém disso, o blogueiro ouviu moderadores de comunidades independentes que documentam relíquias digitais e ofereceu um passo a passo para transformar screenshots em cartões colecionáveis impressos com realidade aumentada.",
    coverImage: PLACEHOLDER_COVER,
    date: "2024-07-02T21:10:00.000Z",
    author: journalist,
  },
  {
    id: "checkpoint-indie-prototipos-hollow-knight-silksong",
    title: "Checkpoint Indie revela protótipos secretos de Hollow Knight: Silksong",
    slug: "checkpoint-indie-prototipos-hollow-knight-silksong",
    category: "Indies",
    excerpt:
      "Durante evento fechado, Team Cherry mostrou rascunhos jogáveis com habilidades descartadas e criaturas que podem reaparecer como conteúdo bônus.",
    content:
      "O Checkpoint Indie acompanhou uma apresentação da Team Cherry e teve acesso a protótipos de Hollow Knight: Silksong desenvolvidos entre 2019 e 2021. Os registros incluem um gancho de seda utilizado para atravessar abismos e um sistema de alquimia que permitiria personalizar agulhas com venenos.\n\nSegundo o estúdio, parte das ideias pode ser reaproveitada em um diário digital liberado após o lançamento. O blogueiro aproveitou para listar artes conceituais favoritas e sugerir desafios para speedrunners inspirados no novo bestiário.",
    coverImage: PLACEHOLDER_COVER,
    date: "2024-06-28T12:45:00.000Z",
    author: journalist,
  },
  {
    id: "guia-do-arcade-restauracao-fliperamas-raros",
    title: "Guia do Arcade comenta a restauração de fliperamas raros",
    slug: "guia-do-arcade-restauracao-fliperamas-raros",
    category: "História",
    excerpt:
      "Colecionador brasileiro mostra bastidores da reforma de máquinas clássicas e ensina como preservar placas e componentes antigos.",
    content:
      "O Guia do Arcade visitou o laboratório de um restaurador no Rio de Janeiro que comprou gabinetes de Metal Slug X e de Out Run em um leilão europeu. O processo inclui o envio das placas para especialistas em eletrônica e o uso de impressoras 3D para reconstruir peças quebradas.\n\nO post traz uma checklist para quem deseja iniciar coleções domésticas, além de um glossário com termos técnicos e links para comunidades que ajudam a encontrar ROMs legais e kits de iluminação LED.",
    coverImage: PLACEHOLDER_COVER,
    date: "2024-06-22T10:00:00.000Z",
    author: journalist,
  },
  {
    id: "blog-xp-speed-testa-modo-foto-secreto-forza-horizon-5",
    title: "Blog XP Speed testa o modo foto secreto de Forza Horizon 5",
    slug: "blog-xp-speed-testa-modo-foto-secreto-forza-horizon-5",
    category: "Atualizações",
    excerpt:
      "Modo experimental permite capturar replays com câmera drone em tempestades e compartilha filtros usados pela Playground Games para trailers.",
    content:
      "O Blog XP Speed participou de um ensaio técnico em parceria com a Playground Games e pôde experimentar um modo foto ainda em desenvolvimento. Entre os recursos estão o ajuste fino de partículas de poeira e a possibilidade de sincronizar o nascer do sol com a trilha sonora dinâmica.\n\nA matéria também traz comentários de fotógrafos virtuais sobre como a comunidade pode usar os replays para treinar inteligência artificial que reconhece estilos de pilotagem. Há ainda um tutorial para exportar as capturas em formato RAW e editá-las no celular.",
    coverImage: PLACEHOLDER_COVER,
    date: "2024-06-18T23:30:00.000Z",
    author: journalist,
  },
]
