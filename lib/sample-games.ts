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
  scoreHome: number | null
  scoreAway: number | null
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

const flamengo: SampleGameClub = {
  name: "Clube de Regatas do Flamengo",
  slug: "clube-de-regatas-do-flamengo",
}
const palmeiras: SampleGameClub = {
  name: "Sociedade Esportiva Palmeiras",
  slug: "sociedade-esportiva-palmeiras",
}
const realMadrid: SampleGameClub = {
  name: "Real Madrid Club de Fútbol",
  slug: "real-madrid-club-de-futbol",
}
const manchesterCity: SampleGameClub = {
  name: "Manchester City Football Club",
  slug: "manchester-city-football-club",
}

export const sampleGames: SampleGameItem[] = [
  {
    id: "flamengo-esports-analisa-hades-ii-acesso-antecipado",
    title: "Flamengo eSports analisa Hades II após estreia em acesso antecipado",
    slug: "flamengo-esports-analisa-hades-ii-acesso-antecipado",
    category: "Lançamentos",
    excerpt:
      "Equipe rubro-negra promoveu live especial para destacar as novidades de Hades II, que chegou ao acesso antecipado no PC com Melinoë como protagonista e planos de atualização constantes.",
    content:
      "O núcleo de criação de conteúdo do Flamengo eSports aproveitou o lançamento de Hades II em 6 de maio para apresentar ao público as mudanças da sequência da Supergiant Games. Durante a transmissão, analistas convidados do Palmeiras Gaming apontaram a nova árvore de habilidades ligada à bruxaria e o ritmo mais cadenciado das expedições ao Submundo.\n\nAlém de mostrar as builds favoritas para Melinoë, a equipe reforçou que o estúdio pretende acrescentar biomas, encontros narrativos e sistemas de progressão ao longo do acesso antecipado em Steam e Epic Games Store. A live contou com perguntas dos torcedores e sorteios de gift cards para incentivar a base de fãs a testar o roguelike.",
    coverImage:
      "https://images.unsplash.com/photo-1527608973515-92770e70d1f5?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2024-05-07T14:00:00.000Z",
    scoreHome: null,
    scoreAway: null,
    homeClub: flamengo,
    awayClub: palmeiras,
    author: journalist,
  },
  {
    id: "palmeiras-gaming-destaques-xbox-showcase-2024",
    title: "Palmeiras Gaming debate destaques do Xbox Games Showcase 2024",
    slug: "palmeiras-gaming-destaques-xbox-showcase-2024",
    category: "Eventos",
    excerpt:
      "Departamento de eSports palestrou sobre Gears of War: E-Day, DOOM: The Dark Ages e Call of Duty: Black Ops 6 logo após a apresentação da Microsoft em Los Angeles.",
    content:
      "Minutos depois do Xbox Games Showcase de 9 de junho, o Palmeiras reuniu sócios na arena digital do clube para comentar os anúncios que movimentaram o evento. Representantes da organização analisaram o retorno de Marcus Fenix em Gears of War: E-Day, apontando como a ambientação emergencial pode inspirar narrativas transmídia para a torcida.\n\nA conversa também destacou o trailer cinemático de DOOM: The Dark Ages, previsto para 2025, e o compromisso da Microsoft em lançar Call of Duty: Black Ops 6 em 25 de outubro diretamente no Game Pass. Parceiros do Manchester City eSports participaram remotamente para explicar como o ecossistema Xbox pretende integrar crossplay e progressão compartilhada entre console e PC.",
    coverImage:
      "https://images.unsplash.com/photo-1526481280695-3c46992875a0?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2024-06-09T23:30:00.000Z",
    scoreHome: null,
    scoreAway: null,
    homeClub: palmeiras,
    awayClub: manchesterCity,
    author: journalist,
  },
  {
    id: "real-madrid-esports-zelda-echoes-of-wisdom",
    title: "Real Madrid eSports promove maratona sobre Zelda: Echoes of Wisdom",
    slug: "real-madrid-esports-zelda-echoes-of-wisdom",
    category: "Nintendo",
    excerpt:
      "Comunidade merengue celebrou o anúncio do novo The Legend of Zelda, que coloca a princesa como protagonista e chega ao Nintendo Switch em setembro.",
    content:
      "Após o Nintendo Direct de 18 de junho, o Real Madrid eSports organizou uma maratona de lives para explicar as mecânicas de The Legend of Zelda: Echoes of Wisdom. Os apresentadores destrincharam a habilidade de copiar objetos e criaturas para resolver puzzles, destacando como o recurso amplia possibilidades de speedrun para a comunidade.\n\nO clube também comentou a data de lançamento mundial de 26 de setembro de 2024 e preparou desafios temáticos em parceria com o Flamengo, que emprestou sua equipe de design para produzir overlays inspirados em Hyrule. A programação incluiu oficinas para pais e filhos interessados em explorar o catálogo do Switch durante as férias europeias.",
    coverImage:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2024-06-20T18:15:00.000Z",
    scoreHome: null,
    scoreAway: null,
    homeClub: realMadrid,
    awayClub: flamengo,
    author: journalist,
  },
  {
    id: "manchester-city-esports-fortnite-festival-metallica",
    title: "Manchester City eSports celebra temporada Metallica no Fortnite Festival",
    slug: "manchester-city-esports-fortnite-festival-metallica",
    category: "Atualizações",
    excerpt:
      "Clube inglês montou hub interativo para aproveitar os shows e desafios lançados junto à banda Metallica na quarta temporada do modo musical de Fortnite.",
    content:
      "A Epic Games lançou em 13 de junho a quarta temporada do Fortnite Festival com Metallica como atração principal, incluindo palco temático, instrumentos inéditos e uma experiência rítmica dedicada ao álbum M72. O Manchester City eSports reabriu seu centro de visitas para transmitir as apresentações virtuais e orientar a torcida sobre como desbloquear recompensas exclusivas.\n\nNo evento, especialistas do Real Madrid eSports demonstraram as novas faixas no modo Jam Stage e comentaram o inédito modo PvP onde dois grupos duelam ao som de clássicos como \"Enter Sandman\". O clube aproveitou para divulgar seletivas de criadores que produzirão clipes highlight da temporada no Creative 2.0.",
    coverImage:
      "https://images.unsplash.com/photo-1510723180108-346f3779edc6?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2024-06-14T12:45:00.000Z",
    scoreHome: null,
    scoreAway: null,
    homeClub: manchesterCity,
    awayClub: realMadrid,
    author: journalist,
  },
  {
    id: "flamengo-real-madrid-state-of-play-2024",
    title: "Flamengo e Real Madrid analisam novidades do State of Play",
    slug: "flamengo-real-madrid-state-of-play-2024",
    category: "PlayStation",
    excerpt:
      "Clubes promoveram mesa redonda sobre Astro Bot e Concord, principais anúncios do State of Play de maio, discutindo estratégias de conteúdo para agosto e setembro.",
    content:
      "Durante o State of Play de 30 de maio, a Sony confirmou Astro Bot para 6 de setembro e apresentou gameplay cooperativo de Concord, o hero shooter da Firewalk Studios agendado para 23 de agosto no PS5 e PC. Flamengo e Real Madrid reuniram suas equipes de mídia para planejar séries de vídeos que expliquem as habilidades das personagens e as possibilidades competitivas do título.\n\nOs grupos compartilharam insights sobre como adaptar o humor característico de Astro Bot às redes sociais e combinar os trailers de Concord com workshops de tiro em primeira pessoa. Também houve debate sobre o beta multijogador que ocorrerá em julho, com inscrições abertas para membros premium das duas comunidades.",
    coverImage:
      "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2024-05-31T10:00:00.000Z",
    scoreHome: null,
    scoreAway: null,
    homeClub: flamengo,
    awayClub: realMadrid,
    author: journalist,
  },
  {
    id: "palmeiras-flamengo-preparam-black-ops-6",
    title: "Palmeiras e Flamengo montam camp de Call of Duty: Black Ops 6",
    slug: "palmeiras-flamengo-preparam-black-ops-6",
    category: "FPS",
    excerpt:
      "Organizações brasileiras criaram agenda conjunta para estudar o novo sistema de movimento omnidirecional revelado pela Treyarch e pela Raven Software.",
    content:
      "Depois da apresentação detalhada de Call of Duty: Black Ops 6 no Xbox Showcase Extended, Palmeiras e Flamengo agendaram sessões semanais de laboratório para experimentar o esquema de movimentação 360° que chega ao multiplayer. Técnicos das duas casas destacaram que o modo campanha ambientado na Guerra Fria dos anos 90 e o retorno do Zombies em formato baseado em rodadas abrem oportunidades para narrativas transmídia.\n\nOs staffs de performance também mapearam o calendário competitivo previsto para o lançamento de 25 de outubro de 2024, alinhando treinos táticos com parceiros internacionais e reforçando a produção de conteúdo educativo para iniciantes. O objetivo é chegar ao Day One com compêndio de loadouts e guias de mapas pronto para a comunidade.",
    coverImage:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2024-06-12T21:10:00.000Z",
    scoreHome: null,
    scoreAway: null,
    homeClub: palmeiras,
    awayClub: flamengo,
    author: journalist,
  },
]
