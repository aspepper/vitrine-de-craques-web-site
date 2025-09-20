import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function main() {
  console.log('Start seeding ...')

  const hashedPassword = await bcrypt.hash('password', 10)

  const seedGames = [
    {
      title: 'Blog do Controle Retro: curiosidades sobre o primeiro easter egg dos games',
      slug: 'blog-controle-retro-curiosidades-easter-egg-games',
      category: 'Curiosidades',
      excerpt:
        'Descubra como um desenvolvedor da Atari escondeu seu nome dentro de Adventure, abrindo caminho para a cultura dos easter eggs nos jogos modernos.',
      content:
        'Enquanto revisava clássicos do Atari 2600, o Blog do Controle Retro mergulhou na história de Warren Robinett e de sua ousadia ao esconder a sala secreta em Adventure. O objetivo era garantir reconhecimento em uma época em que a Atari não creditava os criadores.\n\nO blogueiro resgatou imagens das revistas especializadas da década de 1980 que revelaram o segredo ao público e comparou a prática com os easter eggs contemporâneos em séries como Assassin\'s Creed e The Legend of Zelda. O texto ainda traz dicas de jogos independentes atuais que mantêm a tradição dos segredos para fãs atentos.',
      coverImage:
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80&fm=webp',
      date: '2024-07-10T15:30:00.000Z',
      scoreHome: null,
      scoreAway: null,
      homeClubSlug: 'clube-de-regatas-do-flamengo',
      awayClubSlug: 'sociedade-esportiva-palmeiras',
    },
    {
      title: 'Diário do Game Pass comenta os bastidores de Sea of Stars',
      slug: 'diario-do-game-pass-bastidores-sea-of-stars',
      category: 'Novidades',
      excerpt:
        'Em visita ao estúdio Sabotage, blogueiro brasileiro revela artes conceituais inéditas e planos de expansão do RPG inspirado em Chrono Trigger.',
      content:
        'O Diário do Game Pass foi recebido pelo time da Sabotage em Quebec e ouviu detalhes sobre a atualização planejada para Sea of Stars em 2025. Entre as novidades estão um modo roguelite cooperativo e novas canções compostas por Yasunori Mitsuda.\n\nO artigo também detalha como o estúdio utiliza um quadro de referência com cenas icônicas de jogos clássicos para guiar a paleta de cores e a iluminação. Ao final, há recomendações de soundtracks para ouvir durante a exploração e entrevistas com fãs brasileiros que criam mods cosméticos para o título.',
      coverImage:
        'https://images.unsplash.com/photo-1526481280695-3c46992875a0?auto=format&fit=crop&w=1600&q=80&fm=webp',
      date: '2024-07-05T18:00:00.000Z',
      scoreHome: null,
      scoreAway: null,
      homeClubSlug: 'sociedade-esportiva-palmeiras',
      awayClubSlug: 'manchester-city-football-club',
    },
    {
      title: 'Blog Save Point lista itens perdidos mais curiosos de Final Fantasy XIV',
      slug: 'blog-save-point-itens-curiosos-final-fantasy-xiv',
      category: 'MMO',
      excerpt:
        'Colecionadores contam histórias inusitadas de glamours raros, mascotes escondidos e quests sazonais que desapareceram de Eorzea.',
      content:
        'O Blog Save Point reuniu relatos de jogadores veteranos de Final Fantasy XIV para mapear itens que sumiram com o passar das expansões. Há menções ao Cascavel de Safira, uma montaria vista apenas durante o beta fechado de A Realm Reborn, e às roupas temáticas do evento Lightning Strikes.\n\nAlém disso, o blogueiro entrevistou membros do Real Madrid eSports sobre como criam guias para caçadores de relíquias e ofereceu um passo a passo para transformar screenshots em cartões colecionáveis impressos com realidade aumentada.',
      coverImage:
        'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1600&q=80&fm=webp',
      date: '2024-07-02T21:10:00.000Z',
      scoreHome: null,
      scoreAway: null,
      homeClubSlug: 'real-madrid-club-de-futbol',
      awayClubSlug: 'clube-de-regatas-do-flamengo',
    },
    {
      title: 'Checkpoint Indie revela protótipos secretos de Hollow Knight: Silksong',
      slug: 'checkpoint-indie-prototipos-hollow-knight-silksong',
      category: 'Indies',
      excerpt:
        'Durante evento fechado, Team Cherry mostrou rascunhos jogáveis com habilidades descartadas e criaturas que podem reaparecer como conteúdo bônus.',
      content:
        'O Checkpoint Indie acompanhou uma apresentação da Team Cherry e teve acesso a protótipos de Hollow Knight: Silksong desenvolvidos entre 2019 e 2021. Os registros incluem um gancho de seda utilizado para atravessar abismos e um sistema de alquimia que permitiria personalizar agulhas com venenos.\n\nSegundo o estúdio, parte das ideias pode ser reaproveitada em um diário digital liberado após o lançamento. O blogueiro aproveitou para listar artes conceituais favoritas e sugerir desafios para speedrunners inspirados no novo bestiário.',
      coverImage:
        'https://images.unsplash.com/photo-1510723180108-346f3779edc6?auto=format&fit=crop&w=1600&q=80&fm=webp',
      date: '2024-06-28T12:45:00.000Z',
      scoreHome: null,
      scoreAway: null,
      homeClubSlug: 'manchester-city-football-club',
      awayClubSlug: 'real-madrid-club-de-futbol',
    },
    {
      title: 'Guia do Arcade comenta a restauração de fliperamas raros',
      slug: 'guia-do-arcade-restauracao-fliperamas-raros',
      category: 'História',
      excerpt:
        'Colecionador flamenguista mostra bastidores da reforma de máquinas clássicas e ensina como preservar placas e componentes antigos.',
      content:
        'O Guia do Arcade visitou o laboratório de um restaurador no Rio de Janeiro que comprou gabinetes de Metal Slug X e de Out Run em um leilão europeu. O processo inclui o envio das placas para um técnico parceiro do Palmeiras e o uso de impressoras 3D para reconstruir peças quebradas.\n\nO post traz uma checklist para quem deseja iniciar coleções domésticas, além de um glossário com termos técnicos e links para comunidades que ajudam a encontrar ROMs legais e kits de iluminação LED.',
      coverImage:
        'https://images.unsplash.com/photo-1527608973515-92770e70d1f5?auto=format&fit=crop&w=1600&q=80&fm=webp',
      date: '2024-06-22T10:00:00.000Z',
      scoreHome: null,
      scoreAway: null,
      homeClubSlug: 'clube-de-regatas-do-flamengo',
      awayClubSlug: 'real-madrid-club-de-futbol',
    },
    {
      title: 'Blog XP Speed testa o modo foto secreto de Forza Horizon 5',
      slug: 'blog-xp-speed-testa-modo-foto-secreto-forza-horizon-5',
      category: 'Atualizações',
      excerpt:
        'Modo experimental permite capturar replays com câmera drone em tempestades e compartilha filtros usados pela Playground Games para trailers.',
      content:
        'O Blog XP Speed participou de um ensaio técnico em parceria com a Playground Games e pôde experimentar um modo foto ainda em desenvolvimento. Entre os recursos estão o ajuste fino de partículas de poeira e a possibilidade de sincronizar o nascer do sol com a trilha sonora dinâmica.\n\nA matéria também traz comentários do departamento de dados do Manchester City sobre como a comunidade pode usar os replays para treinar inteligência artificial que reconhece estilos de pilotagem. Há ainda um tutorial para exportar as capturas em formato RAW e editá-las no celular.',
      coverImage:
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80&fm=webp',
      date: '2024-06-18T23:30:00.000Z',
      scoreHome: null,
      scoreAway: null,
      homeClubSlug: 'sociedade-esportiva-palmeiras',
      awayClubSlug: 'clube-de-regatas-do-flamengo',
    },
  ]

  const confed1 = await prisma.confederation.create({
    data: {
      name: 'Confederação Brasileira de Futebol',
      slug: slugify('Confederação Brasileira de Futebol'),
      clubs: {
        create: [
          { name: 'Clube de Regatas do Flamengo', slug: slugify('Clube de Regatas do Flamengo') },
          { name: 'Sociedade Esportiva Palmeiras', slug: slugify('Sociedade Esportiva Palmeiras') },
        ],
      },
    },
    include: { clubs: true },
  })

  const confed2 = await prisma.confederation.create({
    data: {
      name: 'União das Associações Europeias de Futebol',
      slug: slugify('União das Associações Europeias de Futebol'),
      clubs: {
        create: [
          { name: 'Real Madrid Club de Fútbol', slug: slugify('Real Madrid Club de Futbol') },
          { name: 'Manchester City Football Club', slug: slugify('Manchester City Football Club') },
        ],
      },
    },
    include: { clubs: true },
  })

  const [agent1, agent2] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'agent1@example.com',
        name: 'Agente Um',
        passwordHash: hashedPassword,
        profile: {
          create: {
            displayName: 'Agente Um',
            role: Role.AGENTE,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'agent2@example.com',
        name: 'Agente Dois',
        passwordHash: hashedPassword,
        profile: {
          create: {
            displayName: 'Agente Dois',
            role: Role.AGENTE,
          },
        },
      },
    }),
  ])

  const [athlete1, athlete2] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'athlete1@example.com',
        name: 'Atleta Um',
        passwordHash: hashedPassword,
        profile: {
          create: {
            displayName: 'Atleta Um',
            role: Role.ATLETA,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'athlete2@example.com',
        name: 'Atleta Dois',
        passwordHash: hashedPassword,
        profile: {
          create: {
            displayName: 'Atleta Dois',
            role: Role.ATLETA,
          },
        },
      },
    }),
  ])

  const journalist = await prisma.user.create({
    data: {
      email: 'press1@example.com',
      name: 'Jornalista Um',
      passwordHash: hashedPassword,
      profile: {
        create: {
          displayName: 'Jornalista Um',
          role: Role.IMPRENSA,
          cpf: '11122233344',
          ddd: '11',
          telefone: '912345678',
          uf: 'SP',
          cidade: 'São Paulo',
          site: 'https://meublog.com',
          endereco: 'Rua Exemplo, 123 - São Paulo/SP',
          redesSociais: 'https://twitter.com/jornalistaum',
          areaAtuacao: 'Esportes',
          portfolio: 'https://portfolio.example.com/jornalistaum',
        },
      },
      accounts: {
        create: {
          type: 'oauth',
          provider: 'google',
          providerAccountId: 'press1-google',
          access_token: 'token',
          token_type: 'bearer',
        },
      },
      sessions: {
        create: {
          sessionToken: 'press1-session',
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      },
    },
  })

  const blogger = await prisma.user.create({
    data: {
      email: 'bloggamer@example.com',
      name: 'Blogueiro Gamer',
      passwordHash: hashedPassword,
      profile: {
        create: {
          displayName: 'Blogueiro Gamer',
          role: Role.IMPRENSA,
          bio: 'Criador do blog Controle Retro, apaixonado por curiosidades do universo gamer.',
          site: 'https://controlevintage.blog',
          redesSociais: 'https://instagram.com/controlevintage',
          areaAtuacao: 'Blog e cobertura de cultura gamer',
          cidade: 'Belo Horizonte',
          uf: 'MG',
        },
      },
    },
  })

  await prisma.verificationToken.create({
    data: {
      identifier: 'press1@example.com',
      token: 'press1-token',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  })

  await prisma.news.createMany({
    data: [
      {
        title: 'Estrela em ascensão brilha em clássico decisivo',
        slug: slugify('Estrela em ascensão brilha em clássico decisivo'),
        excerpt:
          'Com atuação inspirada, a jovem promessa decidiu o confronto regional aos 42 minutos do segundo tempo e colocou o clube na liderança do campeonato estadual.',
        content:
          'A tarde ensolarada no estádio municipal recebeu mais de 35 mil torcedores para assistir ao confronto direto pela liderança do campeonato. Aos 42 minutos da etapa final, a joia da base recebeu pela esquerda, cortou para o meio e finalizou com precisão no canto superior.\n\nO gol não apenas garantiu os três pontos, mas também consolidou o nome do atleta entre os principais destaques do torneio. O treinador elogiou a maturidade do jovem camisa 11 e ressaltou o trabalho do departamento de análise de desempenho na preparação do elenco.',
        category: 'Campeonatos',
        coverImage:
          'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1600&q=80&fm=webp',
        publishedAt: new Date('2025-08-03T18:30:00Z'),
        authorId: journalist.id,
      },
      {
        title: 'Comissão técnica investe em tecnologia para treinos',
        slug: slugify('Comissão técnica investe em tecnologia para treinos'),
        excerpt:
          'Departamento de futebol implementa novas metodologias com apoio de análise de dados para potencializar desempenho físico e tático do elenco profissional.',
        content:
          'Os profissionais do clube iniciaram a semana apresentando um novo pacote de soluções tecnológicas que inclui monitoramento de carga em tempo real e simulações táticas em realidade virtual. A iniciativa é fruto de parceria com uma startup especializada em ciência do esporte.\n\nSegundo a equipe de preparação física, os recursos permitem personalizar sessões de treinamento de acordo com o histórico de cada atleta, reduzindo o risco de lesões e acelerando processos de recuperação. O clube pretende expandir o uso das ferramentas para as categorias de base até o final da temporada.',
        category: 'Bastidores',
        coverImage:
          'https://images.unsplash.com/photo-1526234255934-99a3be5496ef?auto=format&fit=crop&w=1600&q=80&fm=webp',
        publishedAt: new Date('2025-08-01T14:00:00Z'),
        authorId: journalist.id,
      },
      {
        title: 'Base conquista título invicto em torneio internacional',
        slug: slugify('Base conquista título invicto em torneio internacional'),
        excerpt:
          'Equipe sub-17 vence quatro partidas seguidas, marca onze gols e volta para casa com troféu inédito após campanha sólida em Montevidéu.',
        content:
          'Os jovens atletas mostraram maturidade ao longo do torneio disputado no Uruguai e derrotaram adversários de diferentes estilos de jogo. Na final, a equipe brasileira superou o tradicional Nacional por 2 a 1, com gols de um zagueiro artilheiro e do meia criativo.\n\nA comissão técnica destacou a disciplina tática do grupo e o protagonismo da linha defensiva, que sofreu apenas dois gols em toda a competição. A conquista reforça o investimento contínuo da diretoria em categorias de formação.',
        category: 'Categorias de base',
        coverImage:
          'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1600&q=80&fm=webp',
        publishedAt: new Date('2025-07-27T10:15:00Z'),
        authorId: journalist.id,
      },
      {
        title: 'Departamento médico apresenta novo protocolo de prevenção',
        slug: slugify('Departamento médico apresenta novo protocolo de prevenção'),
        excerpt:
          'Clube amplia equipe multidisciplinar e lança programa integrado de fisiologia, nutrição e psicologia para atletas do elenco principal.',
        content:
          'A reformulação do departamento médico foi tema de coletiva no centro de treinamento nesta manhã. Os profissionais apresentaram um protocolo baseado em três pilares: avaliação periódica, acompanhamento nutricional individualizado e suporte psicológico contínuo.\n\nA expectativa é reduzir o tempo de afastamento por contusões musculares em 25% até o fim do ano, além de fortalecer o vínculo entre jogadores e staff técnico.',
        category: 'Saúde e performance',
        coverImage:
          'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1600&q=80&fm=webp',
        publishedAt: new Date('2025-07-22T09:00:00Z'),
        authorId: journalist.id,
      },
      {
        title: 'Torcida prepara mosaico especial para decisão continental',
        slug: slugify('Torcida prepara mosaico especial para decisão continental'),
        excerpt:
          'Organizadas se unem em ação solidária que arrecada alimentos enquanto prepara espetáculo de luzes e cores para o jogo mais aguardado do ano.',
        content:
          'Integrantes das principais torcidas organizadas anunciaram parceria para montar um mosaico 3D que ocupará os quatro setores do estádio. O material foi financiado por campanha coletiva que arrecadou cinco toneladas de alimentos para instituições locais.\n\nAlém do show nas arquibancadas, os torcedores planejam recepção calorosa ao elenco, com concentração nas imediações do CT na véspera da partida.',
        category: 'Torcida',
        coverImage:
          'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&q=80&fm=webp',
        publishedAt: new Date('2025-07-18T20:45:00Z'),
        authorId: journalist.id,
      },
      {
        title: 'Executivo detalha planejamento para a próxima janela',
        slug: slugify('Executivo detalha planejamento para a próxima janela'),
        excerpt:
          'Diretoria confirma mapa de prioridades para reforços e foca em jogadores com versatilidade para atuar em mais de uma função.',
        content:
          'Em entrevista exclusiva, o diretor executivo explicou que a estratégia do clube passa por contratações pontuais, alinhadas às demandas de comissão técnica e análise de desempenho. O clube monitora atletas sul-americanos com possibilidade de adaptação rápida ao futebol nacional.\n\nO dirigente também destacou o cuidado com a saúde financeira, reforçando que qualquer investimento será acompanhado de mecanismos de performance e metas esportivas claras.',
        category: 'Mercado da bola',
        coverImage:
          'https://images.unsplash.com/photo-1527718641255-324f8e2d0423?auto=format&fit=crop&w=1600&q=80&fm=webp',
        publishedAt: new Date('2025-07-15T16:20:00Z'),
        authorId: journalist.id,
      },
    ],
  })

  const clubMap = new Map<string, string>(
    [...confed1.clubs, ...confed2.clubs].map((club) => [club.slug, club.id])
  )

  const gameData = seedGames.map((game) => {
    const homeClubId = clubMap.get(game.homeClubSlug)
    const awayClubId = clubMap.get(game.awayClubSlug)

    if (!homeClubId || !awayClubId) {
      throw new Error(`Clube não encontrado para o jogo ${game.slug}`)
    }

    return {
      title: game.title,
      slug: game.slug,
      category: game.category,
      excerpt: game.excerpt,
      content: game.content,
      coverImage: game.coverImage,
      date: new Date(game.date),
      scoreHome: game.scoreHome,
      scoreAway: game.scoreAway,
      homeClubId,
      awayClubId,
      authorId: blogger.id,
    }
  })

  await prisma.game.createMany({ data: gameData })

  await prisma.video.createMany({
    data: [
      {
        title: 'Lance do Atleta Um',
        videoUrl: 'https://example.com/video1.mp4',
        userId: athlete1.id,
      },
      {
        title: 'Lance do Atleta Dois',
        videoUrl: 'https://example.com/video2.mp4',
        userId: athlete2.id,
      },
    ],
  })

  await prisma.times.createMany({
        data: [
      {
        divisao: 'A',
        clube: 'Atlético Mineiro',
        slug: slugify('Atlético Mineiro'),
        sigla: 'CAM',
        apelido: 'Galo',
        mascote: 'Galo',
        fundacao: 1908,
        maiorIdolo: 'Reinaldo',
        cidade: 'Belo Horizonte',
        estado: 'MG',
      },
      {
        divisao: 'A',
        clube: 'Bahia',
        slug: slugify('Bahia'),
        sigla: 'ECB',
        apelido: 'Esquadrão de Aço',
        mascote: 'Super-Homem (Tricolor)',
        fundacao: 1931,
        maiorIdolo: 'Bobô',
        cidade: 'Salvador',
        estado: 'BA',
      },
      {
        divisao: 'A',
        clube: 'Botafogo',
        slug: slugify('Botafogo'),
        sigla: 'BFR',
        apelido: 'Glorioso / Fogão',
        mascote: 'Manequinho / Biriba (cão)',
        fundacao: 1904,
        maiorIdolo: 'Garrincha',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
      },
      {
        divisao: 'A',
        clube: 'Ceará',
        slug: slugify('Ceará'),
        sigla: 'CSC',
        apelido: 'Vozão / Vovô',
        mascote: 'Vovô',
        fundacao: 1914,
        maiorIdolo: 'Magno Alves',
        cidade: 'Fortaleza',
        estado: 'CE',
      },
      {
        divisao: 'A',
        clube: 'Corinthians',
        slug: slugify('Corinthians'),
        sigla: 'SCCP',
        apelido: 'Timão',
        mascote: 'Mosqueteiro',
        fundacao: 1910,
        maiorIdolo: 'Sócrates',
        cidade: 'São Paulo',
        estado: 'SP',
      },
      {
        divisao: 'A',
        clube: 'Cruzeiro',
        slug: slugify('Cruzeiro'),
        sigla: 'CEC',
        apelido: 'Raposa / Cabuloso',
        mascote: 'Raposa',
        fundacao: 1921,
        maiorIdolo: 'Tostão',
        cidade: 'Belo Horizonte',
        estado: 'MG',
      },
      {
        divisao: 'A',
        clube: 'Flamengo',
        slug: slugify('Flamengo'),
        sigla: 'CRF',
        apelido: 'Mengão / Rubro-Negro',
        mascote: 'Urubu',
        fundacao: 1895,
        maiorIdolo: 'Zico',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
      },
      {
        divisao: 'A',
        clube: 'Fluminense',
        slug: slugify('Fluminense'),
        sigla: 'FFC',
        apelido: 'Tricolor',
        mascote: 'Cartola (hist.) / Guerreirinho (atual em jogos)',
        fundacao: 1902,
        maiorIdolo: 'Fred',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
      },
      {
        divisao: 'A',
        clube: 'Fortaleza',
        slug: slugify('Fortaleza'),
        sigla: 'FEC',
        apelido: 'Leão do Pici',
        mascote: 'Leão',
        fundacao: 1918,
        maiorIdolo: 'Clodoaldo',
        cidade: 'Fortaleza',
        estado: 'CE',
      },
      {
        divisao: 'A',
        clube: 'Grêmio',
        slug: slugify('Grêmio'),
        sigla: 'GFBPA',
        apelido: 'Imortal Tricolor',
        mascote: 'Mosqueteiro',
        fundacao: 1903,
        maiorIdolo: 'Renato Portaluppi',
        cidade: 'Porto Alegre',
        estado: 'RS',
      },
      {
        divisao: 'A',
        clube: 'Internacional',
        slug: slugify('Internacional'),
        sigla: 'SCI',
        apelido: 'Colorado',
        mascote: 'Saci',
        fundacao: 1909,
        maiorIdolo: 'Falcão',
        cidade: 'Porto Alegre',
        estado: 'RS',
      },
      {
        divisao: 'A',
        clube: 'Juventude',
        slug: slugify('Juventude'),
        sigla: 'ECJ',
        apelido: 'Juve / Papada',
        mascote: 'Periquito',
        fundacao: 1913,
        maiorIdolo: '',
        cidade: 'Caxias do Sul',
        estado: 'RS',
      },
      {
        divisao: 'A',
        clube: 'Mirassol',
        slug: slugify('Mirassol'),
        sigla: 'MFC',
        apelido: 'Leão',
        mascote: 'Leão',
        fundacao: 1925,
        maiorIdolo: '',
        cidade: 'Mirassol',
        estado: 'SP',
      },
      {
        divisao: 'A',
        clube: 'Palmeiras',
        slug: slugify('Palmeiras'),
        sigla: 'SEP',
        apelido: 'Verdão',
        mascote: 'Porco (Gobbato)',
        fundacao: 1914,
        maiorIdolo: 'Ademir da Guia',
        cidade: 'São Paulo',
        estado: 'SP',
      },
      {
        divisao: 'A',
        clube: 'Red Bull Bragantino',
        slug: slugify('Red Bull Bragantino'),
        sigla: 'RBB',
        apelido: 'Massa Bruta',
        mascote: 'Toro Loko (touro)',
        fundacao: 1928,
        maiorIdolo: 'Mauro Silva',
        cidade: 'Bragança Paulista',
        estado: 'SP',
      },
      {
        divisao: 'A',
        clube: 'Santos',
        slug: slugify('Santos'),
        sigla: 'SFC',
        apelido: 'Peixe',
        mascote: 'Baleião e Baleinha (golfinhos)',
        fundacao: 1912,
        maiorIdolo: 'Pelé',
        cidade: 'Santos',
        estado: 'SP',
      },
      {
        divisao: 'A',
        clube: 'Sport',
        slug: slugify('Sport'),
        sigla: 'SCR',
        apelido: 'Leão da Ilha',
        mascote: 'Leão',
        fundacao: 1905,
        maiorIdolo: 'Magrão',
        cidade: 'Recife',
        estado: 'PE',
      },
      {
        divisao: 'A',
        clube: 'São Paulo',
        slug: slugify('São Paulo'),
        sigla: 'SPFC',
        apelido: 'Tricolor Paulista',
        mascote: 'Santo Paulo',
        fundacao: 1930,
        maiorIdolo: 'Rogério Ceni',
        cidade: 'São Paulo',
        estado: 'SP',
      },
      {
        divisao: 'A',
        clube: 'Vasco da Gama',
        slug: slugify('Vasco da Gama'),
        sigla: 'CRVG',
        apelido: 'Gigante da Colina',
        mascote: 'Almirante',
        fundacao: 1898,
        maiorIdolo: 'Roberto Dinamite',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
      },
      {
        divisao: 'A',
        clube: 'Vitória',
        slug: slugify('Vitória'),
        sigla: 'ECV',
        apelido: 'Leão da Barra',
        mascote: 'Leão',
        fundacao: 1899,
        maiorIdolo: 'Ramon Menezes',
        cidade: 'Salvador',
        estado: 'BA',
      },
      {
        divisao: 'B',
        clube: 'Amazonas',
        slug: slugify('Amazonas'),
        sigla: 'AMZ',
        apelido: 'Onça-Pintada / Aurinegro',
        mascote: 'Onça-pintada',
        fundacao: 2019,
        maiorIdolo: '',
        cidade: 'Manaus',
        estado: 'AM',
      },
      {
        divisao: 'B',
        clube: 'América Mineiro',
        slug: slugify('América Mineiro'),
        sigla: 'AFC',
        apelido: 'Coelho',
        mascote: 'Coelho',
        fundacao: 1912,
        maiorIdolo: '',
        cidade: 'Belo Horizonte',
        estado: 'MG',
      },
      {
        divisao: 'B',
        clube: 'Athletic (MG)',
        slug: slugify('Athletic (MG)'),
        sigla: 'AC',
        apelido: 'Esquadrão de Aço',
        mascote: '',
        fundacao: 1909,
        maiorIdolo: '',
        cidade: 'São João del-Rei',
        estado: 'MG',
      },
      {
        divisao: 'B',
        clube: 'Athletico Paranaense',
        slug: slugify('Athletico Paranaense'),
        sigla: 'CAP',
        apelido: 'Furacão',
        mascote: 'Furacão',
        fundacao: 1924,
        maiorIdolo: 'Sicupira',
        cidade: 'Curitiba',
        estado: 'PR',
      },
      {
        divisao: 'B',
        clube: 'Atlético Goianiense',
        slug: slugify('Atlético Goianiense'),
        sigla: 'ACG',
        apelido: 'Dragão',
        mascote: 'Dragão',
        fundacao: 1937,
        maiorIdolo: '',
        cidade: 'Goiânia',
        estado: 'GO',
      },
      {
        divisao: 'B',
        clube: 'Avaí',
        slug: slugify('Avaí'),
        sigla: 'AVA',
        apelido: 'Leão da Ilha',
        mascote: 'Leão',
        fundacao: 1923,
        maiorIdolo: 'Marquinhos',
        cidade: 'Florianópolis',
        estado: 'SC',
      },
      {
        divisao: 'B',
        clube: 'Botafogo-SP',
        slug: slugify('Botafogo-SP'),
        sigla: 'BFC',
        apelido: 'Pantera',
        mascote: 'Pantera',
        fundacao: 1918,
        maiorIdolo: 'Sócrates',
        cidade: 'Ribeirão Preto',
        estado: 'SP',
      },
      {
        divisao: 'B',
        clube: 'CRB',
        slug: slugify('CRB'),
        sigla: 'CRB',
        apelido: 'Galo',
        mascote: 'Galo',
        fundacao: 1912,
        maiorIdolo: '',
        cidade: 'Maceió',
        estado: 'AL',
      },
      {
        divisao: 'B',
        clube: 'Chapecoense',
        slug: slugify('Chapecoense'),
        sigla: 'ACF',
        apelido: 'Chape / Verdão do Oeste',
        mascote: 'Índio Condá',
        fundacao: 1973,
        maiorIdolo: '',
        cidade: 'Chapecó',
        estado: 'SC',
      },
      {
        divisao: 'B',
        clube: 'Coritiba',
        slug: slugify('Coritiba'),
        sigla: 'CFC',
        apelido: 'Coxa',
        mascote: 'Vovô Coxa',
        fundacao: 1909,
        maiorIdolo: 'Dirceu Krüger',
        cidade: 'Curitiba',
        estado: 'PR',
      },
      {
        divisao: 'B',
        clube: 'Criciúma',
        slug: slugify('Criciúma'),
        sigla: 'CEC',
        apelido: 'Tigre',
        mascote: 'Tigre',
        fundacao: 1947,
        maiorIdolo: '',
        cidade: 'Criciúma',
        estado: 'SC',
      },
      {
        divisao: 'B',
        clube: 'Cuiabá',
        slug: slugify('Cuiabá'),
        sigla: 'CUI',
        apelido: 'Dourado',
        mascote: 'Dourado (peixe)',
        fundacao: 2001,
        maiorIdolo: '',
        cidade: 'Cuiabá',
        estado: 'MT',
      },
      {
        divisao: 'B',
        clube: 'Ferroviária',
        slug: slugify('Ferroviária'),
        sigla: 'AFE',
        apelido: 'Ferrinha / Locomotiva',
        mascote: 'Locomotiva',
        fundacao: 1950,
        maiorIdolo: '',
        cidade: 'Araraquara',
        estado: 'SP',
      },
      {
        divisao: 'B',
        clube: 'Goiás',
        slug: slugify('Goiás'),
        sigla: 'GEC',
        apelido: 'Esmeraldino',
        mascote: 'Periquito',
        fundacao: 1943,
        maiorIdolo: 'Túlio Maravilha',
        cidade: 'Goiânia',
        estado: 'GO',
      },
      {
        divisao: 'B',
        clube: 'Novorizontino',
        slug: slugify('Novorizontino'),
        sigla: 'GEN',
        apelido: 'Tigre do Vale',
        mascote: 'Tigre',
        fundacao: 2010,
        maiorIdolo: '',
        cidade: 'Novo Horizonte',
        estado: 'SP',
      },
      {
        divisao: 'B',
        clube: 'Operário Ferroviário',
        slug: slugify('Operário Ferroviário'),
        sigla: 'OFEC',
        apelido: 'Fantasma',
        mascote: 'Fantasma',
        fundacao: 1912,
        maiorIdolo: '',
        cidade: 'Ponta Grossa',
        estado: 'PR',
      },
      {
        divisao: 'B',
        clube: 'Paysandu',
        slug: slugify('Paysandu'),
        sigla: 'PSC',
        apelido: 'Papão da Curuzu',
        mascote: 'Lobo',
        fundacao: 1914,
        maiorIdolo: 'Iarley',
        cidade: 'Belém',
        estado: 'PA',
      },
      {
        divisao: 'B',
        clube: 'Remo',
        slug: slugify('Remo'),
        sigla: 'CR',
        apelido: 'Leão Azul',
        mascote: 'Leão',
        fundacao: 1905,
        maiorIdolo: 'Bira',
        cidade: 'Belém',
        estado: 'PA',
      },
      {
        divisao: 'B',
        clube: 'Vila Nova',
        slug: slugify('Vila Nova'),
        sigla: 'VEC',
        apelido: 'Tigrão / Colorado',
        mascote: 'Tigre',
        fundacao: 1943,
        maiorIdolo: '',
        cidade: 'Goiânia',
        estado: 'GO',
      },
      {
        divisao: 'B',
        clube: 'Volta Redonda',
        slug: slugify('Volta Redonda'),
        sigla: 'VRFC',
        apelido: 'Voltaço',
        mascote: '',
        fundacao: 1976,
        maiorIdolo: '',
        cidade: 'Volta Redonda',
        estado: 'RJ',
      },
      {
        divisao: 'C',
        clube: 'ABC',
        slug: slugify('ABC'),
        sigla: 'ABC',
        apelido: 'Mais Querido',
        mascote: 'Elefante',
        fundacao: 1915,
        maiorIdolo: 'Marinho Chagas',
        cidade: 'Natal',
        estado: 'RN',
      },
      {
        divisao: 'C',
        clube: 'Anápolis',
        slug: slugify('Anápolis'),
        sigla: 'AFC',
        apelido: 'Galo da Comarca',
        mascote: 'Galo',
        fundacao: 1946,
        maiorIdolo: '',
        cidade: 'Anápolis',
        estado: 'GO',
      },
      {
        divisao: 'C',
        clube: 'Botafogo-PB',
        slug: slugify('Botafogo-PB'),
        sigla: 'BFC',
        apelido: 'Belo',
        mascote: 'Belo',
        fundacao: 1931,
        maiorIdolo: '',
        cidade: 'João Pessoa',
        estado: 'PB',
      },
      {
        divisao: 'C',
        clube: 'Brusque',
        slug: slugify('Brusque'),
        sigla: 'BFC',
        apelido: 'Quadricolor',
        mascote: '',
        fundacao: 1987,
        maiorIdolo: '',
        cidade: 'Brusque',
        estado: 'SC',
      },
      {
        divisao: 'C',
        clube: 'CSA',
        slug: slugify('CSA'),
        sigla: 'CSA',
        apelido: 'Azulão',
        mascote: 'Azulão',
        fundacao: 1913,
        maiorIdolo: '',
        cidade: 'Maceió',
        estado: 'AL',
      },
      {
        divisao: 'C',
        clube: 'Caxias',
        slug: slugify('Caxias'),
        sigla: 'SERC',
        apelido: 'Grená',
        mascote: '',
        fundacao: 1935,
        maiorIdolo: '',
        cidade: 'Caxias do Sul',
        estado: 'RS',
      },
      {
        divisao: 'C',
        clube: 'Confiança',
        slug: slugify('Confiança'),
        sigla: 'ADC',
        apelido: 'Dragão',
        mascote: 'Dragão',
        fundacao: 1936,
        maiorIdolo: '',
        cidade: 'Aracaju',
        estado: 'SE',
      },
      {
        divisao: 'C',
        clube: 'Figueirense',
        slug: slugify('Figueirense'),
        sigla: 'FFC',
        apelido: 'Furacão do Estreito',
        mascote: '',
        fundacao: 1921,
        maiorIdolo: '',
        cidade: 'Florianópolis',
        estado: 'SC',
      },
      {
        divisao: 'C',
        clube: 'Floresta',
        slug: slugify('Floresta'),
        sigla: 'FEC',
        apelido: 'Verdão da Vila',
        mascote: '',
        fundacao: 1954,
        maiorIdolo: '',
        cidade: 'Fortaleza',
        estado: 'CE',
      },
      {
        divisao: 'C',
        clube: 'Guarani',
        slug: slugify('Guarani'),
        sigla: 'GFC',
        apelido: 'Bugre',
        mascote: 'Índio Bugre',
        fundacao: 1911,
        maiorIdolo: 'Careca',
        cidade: 'Campinas',
        estado: 'SP',
      },
      {
        divisao: 'C',
        clube: 'Itabaiana',
        slug: slugify('Itabaiana'),
        sigla: 'AOI',
        apelido: 'Tremendão',
        mascote: 'Tremendão',
        fundacao: 1938,
        maiorIdolo: '',
        cidade: 'Itabaiana',
        estado: 'SE',
      },
      {
        divisao: 'C',
        clube: 'Ituano',
        slug: slugify('Ituano'),
        sigla: 'IFC',
        apelido: 'Galo de Itu',
        mascote: 'Galo',
        fundacao: 1947,
        maiorIdolo: '',
        cidade: 'Itu',
        estado: 'SP',
      },
      {
        divisao: 'C',
        clube: 'Londrina',
        slug: slugify('Londrina'),
        sigla: 'LEC',
        apelido: 'Tubarão',
        mascote: 'Tubarão',
        fundacao: 1956,
        maiorIdolo: '',
        cidade: 'Londrina',
        estado: 'PR',
      },
      {
        divisao: 'C',
        clube: 'Maringá',
        slug: slugify('Maringá'),
        sigla: 'MFC',
        apelido: 'Dogão',
        mascote: 'Cão (Dogão)',
        fundacao: 2010,
        maiorIdolo: '',
        cidade: 'Maringá',
        estado: 'PR',
      },
      {
        divisao: 'C',
        clube: 'Náutico',
        slug: slugify('Náutico'),
        sigla: 'CNC',
        apelido: 'Timbu',
        mascote: 'Timbu',
        fundacao: 1901,
        maiorIdolo: 'Kuki',
        cidade: 'Recife',
        estado: 'PE',
      },
      {
        divisao: 'C',
        clube: 'Ponte Preta',
        slug: slugify('Ponte Preta'),
        sigla: 'AAP',
        apelido: 'Macaca',
        mascote: 'Macaca',
        fundacao: 1900,
        maiorIdolo: 'Dicá',
        cidade: 'Campinas',
        estado: 'SP',
      },
      {
        divisao: 'C',
        clube: 'Retrô',
        slug: slugify('Retrô'),
        sigla: 'RFC',
        apelido: 'Fênix',
        mascote: 'Fênix',
        fundacao: 2016,
        maiorIdolo: '',
        cidade: 'Camaragibe',
        estado: 'PE',
      },
      {
        divisao: 'C',
        clube: 'São Bernardo',
        slug: slugify('São Bernardo'),
        sigla: 'SBFC',
        apelido: 'Cachorrão',
        mascote: 'Cachorrão',
        fundacao: 2004,
        maiorIdolo: '',
        cidade: 'São Bernardo do Campo',
        estado: 'SP',
      },
      {
        divisao: 'C',
        clube: 'Tombense',
        slug: slugify('Tombense'),
        sigla: 'TEC',
        apelido: 'Carcará',
        mascote: 'Carcará',
        fundacao: 1914,
        maiorIdolo: '',
        cidade: 'Tombos',
        estado: 'MG',
      },
      {
        divisao: 'C',
        clube: 'Ypiranga-RS',
        slug: slugify('Ypiranga-RS'),
        sigla: 'YFC',
        apelido: 'Canarinho',
        mascote: 'Canarinho',
        fundacao: 1924,
        maiorIdolo: '',
        cidade: 'Erechim',
        estado: 'RS',
      }
    ],
  })

  await prisma.game.createMany({
    data: [
      {
        date: new Date(),
        slug: `${confed1.clubs[0].slug}-vs-${confed1.clubs[1].slug}`,
        homeClubId: confed1.clubs[0].id,
        awayClubId: confed1.clubs[1].id,
        scoreHome: 0,
        scoreAway: 0,
      },
      {
        date: new Date(),
        slug: `${confed2.clubs[0].slug}-vs-${confed2.clubs[1].slug}`,
        homeClubId: confed2.clubs[0].id,
        awayClubId: confed2.clubs[1].id,
        scoreHome: 1,
        scoreAway: 1,
      },
    ],
  })

  console.log('Seeding finished.')
}

main()
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
