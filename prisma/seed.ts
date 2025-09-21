import { PrismaClient, Role, Prisma } from '@prisma/client'
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

function placeholderLogo(text: string, color: string) {
  const safeColor = color.replace('#', '').toUpperCase()
  const normalizedText = text.trim().replace(/\s+/g, ' ')
  const safeText = encodeURIComponent(normalizedText).replace(/%20/g, '+')
  return `https://via.placeholder.com/160x160.png/${safeColor}/FFFFFF?text=${safeText}`
}

type ConfederationSeed = {
  name: string
  abbreviation: string
  color: string
  foundedOn: string
  purpose: string
  currentPresident: string
  officialStatementDate: string
  statementFocus: string
  statementAction: string
  statementOrientation: string
  clubs?: { name: string }[]
}

function composeStatement(seed: ConfederationSeed) {
  return [
    `${seed.name} informa que ${seed.statementFocus}.`,
    `${seed.currentPresident} reforçou que ${seed.statementAction}.`,
    `A entidade orienta que ${seed.statementOrientation}.`,
  ].join('\n\n')
}

function parseDate(input: string) {
  return new Date(`${input}T00:00:00.000Z`)
}

async function main() {
  console.log('Start seeding ...')

  const hashedPassword = await bcrypt.hash('senha@2025', 10)

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
    },
    {
      title: 'Blog Save Point lista itens perdidos mais curiosos de Final Fantasy XIV',
      slug: 'blog-save-point-itens-curiosos-final-fantasy-xiv',
      category: 'MMO',
      excerpt:
        'Colecionadores contam histórias inusitadas de glamours raros, mascotes escondidos e quests sazonais que desapareceram de Eorzea.',
      content:
        'O Blog Save Point reuniu relatos de jogadores veteranos de Final Fantasy XIV para mapear itens que sumiram com o passar das expansões. Há menções ao Cascavel de Safira, uma montaria vista apenas durante o beta fechado de A Realm Reborn, e às roupas temáticas do evento Lightning Strikes.\n\nAlém disso, o blogueiro ouviu moderadores de comunidades independentes que documentam relíquias digitais e ofereceu um passo a passo para transformar screenshots em cartões colecionáveis impressos com realidade aumentada.',
      coverImage:
        'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1600&q=80&fm=webp',
      date: '2024-07-02T21:10:00.000Z',
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
    },
    {
      title: 'Guia do Arcade comenta a restauração de fliperamas raros',
      slug: 'guia-do-arcade-restauracao-fliperamas-raros',
      category: 'História',
      excerpt:
        'Colecionador brasileiro mostra bastidores da reforma de máquinas clássicas e ensina como preservar placas e componentes antigos.',
      content:
        'O Guia do Arcade visitou o laboratório de um restaurador no Rio de Janeiro que comprou gabinetes de Metal Slug X e de Out Run em um leilão europeu. O processo inclui o envio das placas para especialistas em eletrônica e o uso de impressoras 3D para reconstruir peças quebradas.\n\nO post traz uma checklist para quem deseja iniciar coleções domésticas, além de um glossário com termos técnicos e links para comunidades que ajudam a encontrar ROMs legais e kits de iluminação LED.',
      coverImage:
        'https://images.unsplash.com/photo-1527608973515-92770e70d1f5?auto=format&fit=crop&w=1600&q=80&fm=webp',
      date: '2024-06-22T10:00:00.000Z',
    },
    {
      title: 'Blog XP Speed testa o modo foto secreto de Forza Horizon 5',
      slug: 'blog-xp-speed-testa-modo-foto-secreto-forza-horizon-5',
      category: 'Atualizações',
      excerpt:
        'Modo experimental permite capturar replays com câmera drone em tempestades e compartilha filtros usados pela Playground Games para trailers.',
      content:
        'O Blog XP Speed participou de um ensaio técnico em parceria com a Playground Games e pôde experimentar um modo foto ainda em desenvolvimento. Entre os recursos estão o ajuste fino de partículas de poeira e a possibilidade de sincronizar o nascer do sol com a trilha sonora dinâmica.\n\nA matéria também traz comentários de fotógrafos virtuais sobre como a comunidade pode usar os replays para treinar inteligência artificial que reconhece estilos de pilotagem. Há ainda um tutorial para exportar as capturas em formato RAW e editá-las no celular.',
      coverImage:
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80&fm=webp',
      date: '2024-06-18T23:30:00.000Z',
    },
  ]

  const confederationLogoUrls: Record<string, string> = {
    FIFA: '/logos-confederations/logo-fifa.png',
    CBF: '/logos-confederations/logo-cbf.png',
    'FPF-SP': '/logos-confederations/logo-fpf.png',
    FERJ: '/logos-confederations/logo-ferj.png',
    'FMF-MG': '/logos-confederations/logo-fmf-mg.png',
    'FGF-RS': '/logos-confederations/logo-fgf-rs.png',
    'FPF-PR': '/logos-confederations/logo-fpf-pr.png',
    'FCF-SC': '/logos-confederations/logo-fcf-sc.png',
    'FBF-BA': '/logos-confederations/logo-fbf-ba.png',
    'FPF-PE': '/logos-confederations/logo-fpf-pe.png',
    'FCF-CE': '/logos-confederations/logo-fcf-ce.png',
    'FGF-GO': '/logos-confederations/logo-fgf-go.png',
    'FPF-PA': '/logos-confederations/logo-fpf-pa.png',
    'FPF-PB': '/logos-confederations/logo-fpf-pb.png',
    'FNF-RN': '/logos-confederations/logo-fnf-rn.png',
    'FSF-SE': '/logos-confederations/logo-fsf-se.png',
    'FAF-AL': '/logos-confederations/logo-faf-al.png',
    'FAF-AM': '/logos-confederations/logo-faf-am.png',
    'FAF-AP': '/logos-confederations/logo-faf-ap.png',
    'FFAC-AC': '/logos-confederations/logo-ffac-ac.png',
    'FRF-RR': '/logos-confederations/logo-frf-rr.png',
    'FFER-RO': '/logos-confederations/logo-ffer-ro.png',
    'FTF-TO': '/logos-confederations/logo-ftf-to.png',
    FFDF: '/logos-confederations/logo-ffdf.png',
    'FES-ES': '/logos-confederations/logo-fes-es.png',
    'FMF-MA': '/logos-confederations/logo-fmf-ma.png',
    'FFP-PI': '/logos-confederations/logo-ffp-pi.png',
    'FMF-MT': '/logos-confederations/logo-fmf-mt.png',
    'FFMS-MS': '/logos-confederations/logo-ffms-ms.png',
  }

  const confederationsSeedData: ConfederationSeed[] = [
    {
      name: 'Fédération Internationale de Football Association',
      abbreviation: 'FIFA',
      color: '002F6C',
      foundedOn: '1904-05-21',
      purpose:
        'Coordena e desenvolve o futebol mundial, definindo regras globais e organizando competições entre seleções e clubes.',
      currentPresident: 'Gianni Infantino',
      officialStatementDate: '2024-10-25',
      statementFocus:
        'as atualizações finais do regulamento da Copa do Mundo de Clubes 2025 foram publicadas no portal oficial',
      statementAction:
        'a cooperação entre confederações é essencial para implementar as medidas de sustentabilidade e governança anunciadas',
      statementOrientation:
        'as associações nacionais alinhem seus calendários e reportem ajustes até 30 de novembro',
    },
    {
      name: 'Confederação Brasileira de Futebol',
      abbreviation: 'CBF',
      color: '0B3B8C',
      foundedOn: '1914-06-08',
      purpose:
        'Administra o futebol no Brasil, organizando seleções nacionais, campeonatos e programas de desenvolvimento de base.',
      currentPresident: 'Ednaldo Rodrigues',
      officialStatementDate: '2024-10-18',
      statementFocus:
        'o calendário nacional de competições 2025 foi revisado com ajustes para as datas FIFA e para o Brasileirão feminino',
      statementAction:
        'os clubes e federações devem cumprir os novos prazos de registro e infraestrutura definidos',
      statementOrientation:
        'as entidades estaduais enviem confirmação das sedes e laudos técnicos até 15 de novembro',
      clubs: [
        { name: 'Clube de Regatas do Flamengo' },
        { name: 'Sociedade Esportiva Palmeiras' },
      ],
    },
    {
      name: 'Federação Paulista de Futebol',
      abbreviation: 'FPF-SP',
      color: 'B91C1C',
      foundedOn: '1941-04-22',
      purpose:
        'Organiza as competições profissionais e amadoras do estado de São Paulo e apoia projetos de formação de atletas.',
      currentPresident: 'Reinaldo Carneiro Bastos',
      officialStatementDate: '2024-10-10',
      statementFocus:
        'a versão final do regulamento do Paulistão 2025 foi homologada com atualização das vagas da Copa do Brasil',
      statementAction:
        'os departamentos jurídicos dos clubes acompanhem a implementação do protocolo disciplinar unificado',
      statementOrientation:
        'os clubes confirmem os estádios habilitados até 5 de novembro',
      clubs: [
        { name: 'Sport Club Corinthians Paulista' },
        { name: 'São Paulo Futebol Clube' },
      ],
    },
    {
      name: 'Federação de Futebol do Estado do Rio de Janeiro',
      abbreviation: 'FERJ',
      color: '0EA5E9',
      foundedOn: '1978-09-29',
      purpose:
        'Coordena o futebol profissional e de base no Rio de Janeiro, promovendo competições e cursos de capacitação.',
      currentPresident: 'Rubens Lopes',
      officialStatementDate: '2024-10-09',
      statementFocus:
        'o conselho arbitral aprovou o formato da Taça Guanabara 2025 e a ampliação do VAR para todas as fases',
      statementAction:
        'os clubes mantenham diálogo constante com a equipe de arbitragem para alinhar procedimentos',
      statementOrientation:
        'as equipes protocolem seus planejamentos de logística até 4 de novembro',
    },
    {
      name: 'Federação Mineira de Futebol',
      abbreviation: 'FMF-MG',
      color: '2563EB',
      foundedOn: '1915-07-04',
      purpose:
        'Administra os campeonatos de Minas Gerais, apoia o desenvolvimento das categorias de base e promove cursos técnicos.',
      currentPresident: 'Adriano Aro',
      officialStatementDate: '2024-10-07',
      statementFocus:
        'o Módulo I do Campeonato Mineiro 2025 terá calendário alinhado à Libertadores e à Recopa',
      statementAction:
        'as equipes apresentem planos de gramado e iluminação exigidos para transmissões',
      statementOrientation:
        'os clubes enviem relatórios de adequação estrutural até 12 de novembro',
    },
    {
      name: 'Federação Gaúcha de Futebol',
      abbreviation: 'FGF-RS',
      color: '15803D',
      foundedOn: '1918-05-18',
      purpose:
        'Promove o futebol no Rio Grande do Sul, coordenando competições profissionais, de base e projetos de arbitragem.',
      currentPresident: 'Luciano Hocsman',
      officialStatementDate: '2024-10-11',
      statementFocus:
        'o conselho técnico deliberou sobre ajustes no Campeonato Gaúcho 2025 e nas competições femininas',
      statementAction:
        'os departamentos de futebol mantenham comunicação para garantir cumprimento dos protocolos de segurança',
      statementOrientation:
        'os clubes validem os laudos de estádios e enviem ao departamento de competições até 6 de novembro',
    },
    {
      name: 'Federação Paranaense de Futebol',
      abbreviation: 'FPF-PR',
      color: '1D4ED8',
      foundedOn: '1937-08-05',
      purpose:
        'Administra o futebol no Paraná, incentivando o desenvolvimento técnico, o licenciamento e a formação de atletas.',
      currentPresident: 'Hélio Cury',
      officialStatementDate: '2024-09-30',
      statementFocus:
        'a nova grade de jogos do Campeonato Paranaense 2025 incorpora janelas exclusivas para as Copas regionais',
      statementAction:
        'os clubes intensifiquem projetos de base e mantenham atualizados os cadastros de atletas',
      statementOrientation:
        'as agremiações confirmem datas e horários preferenciais até 1º de novembro',
    },
    {
      name: 'Federação Catarinense de Futebol',
      abbreviation: 'FCF-SC',
      color: '047857',
      foundedOn: '1924-04-12',
      purpose:
        'Responsável pelas competições de Santa Catarina, fomenta a formação de atletas, arbitragem e futebol feminino.',
      currentPresident: 'Rubens Angelotti',
      officialStatementDate: '2024-10-05',
      statementFocus:
        'a reunião arbitral aprovou o uso integral da tecnologia de linha de gol no Catarinense 2025',
      statementAction:
        'os clubes priorizem treinamentos com a equipe de arbitragem e VAR regional',
      statementOrientation:
        'as equipes encaminhem suas demandas de infraestrutura até 8 de novembro',
    },
    {
      name: 'Federação Bahiana de Futebol',
      abbreviation: 'FBF-BA',
      color: '9333EA',
      foundedOn: '1913-09-14',
      purpose:
        'Gerencia o futebol na Bahia, promovendo competições estaduais, programas sociais e qualificação profissional.',
      currentPresident: 'Ricardo Lima',
      officialStatementDate: '2024-09-28',
      statementFocus:
        'o Baianão 2025 terá formato com grupo único e fases regionais voltadas ao interior',
      statementAction:
        'as diretorias reforcem o programa de compliance financeiro',
      statementOrientation:
        'os filiados atualizem cadastros de categorias de base até 31 de outubro',
    },
    {
      name: 'Federação Pernambucana de Futebol',
      abbreviation: 'FPF-PE',
      color: 'EA580C',
      foundedOn: '1915-06-16',
      purpose:
        'Coordena o futebol pernambucano, garantindo competições profissionais, incentivo às bases e arbitragem qualificada.',
      currentPresident: 'Evandro Carvalho',
      officialStatementDate: '2024-09-27',
      statementFocus:
        'o regulamento do Campeonato Pernambucano 2025 foi ratificado com cota de transmissão redefinida',
      statementAction:
        'os clubes respeitem as novas obrigações de licenciamento feminino e sub-20',
      statementOrientation:
        'as equipes encaminhem documentação financeira até 30 de outubro',
    },
    {
      name: 'Federação Cearense de Futebol',
      abbreviation: 'FCF-CE',
      color: '0891B2',
      foundedOn: '1920-03-23',
      purpose:
        'Supervisiona o futebol cearense, promovendo competições estaduais e ações de capacitação para clubes e árbitros.',
      currentPresident: 'Mauro Carmélio',
      officialStatementDate: '2024-09-25',
      statementFocus:
        'o Campeonato Cearense 2025 terá fases preliminares integradas ao projeto de interiorização',
      statementAction:
        'os clubes consolidem planos de segurança para jogos noturnos',
      statementOrientation:
        'as equipes apresentem listas atualizadas de atletas sub-23 até 5 de novembro',
    },
    {
      name: 'Federação Goiana de Futebol',
      abbreviation: 'FGF-GO',
      color: '10B981',
      foundedOn: '1931-11-01',
      purpose:
        'Coordena o futebol de Goiás, oferecendo suporte às categorias de base e à profissionalização de clubes.',
      currentPresident: 'André Pitta',
      officialStatementDate: '2024-09-26',
      statementFocus:
        'o Goianão 2025 adotará formato híbrido com fase de pontos corridos e eliminatórias',
      statementAction:
        'os clubes cumpram o cronograma de certificação dos centros de treinamento',
      statementOrientation:
        'as associações entreguem relatórios de responsabilidade social até 7 de novembro',
    },
    {
      name: 'Federação Paraense de Futebol',
      abbreviation: 'FPF-PA',
      color: 'F97316',
      foundedOn: '1941-12-02',
      purpose:
        'Organiza o Parazão e competições de base no Pará, apoiando projetos de inclusão e formação esportiva.',
      currentPresident: 'Ricardo Gluck Paul',
      officialStatementDate: '2024-10-03',
      statementFocus:
        'as diretrizes da Copa Verde 2025 e do Parazão foram alinhadas com a CBF',
      statementAction:
        'os clubes intensifiquem investimentos em gramados drenantes devido ao período chuvoso',
      statementOrientation:
        'as equipes formalizem ajustes de mando de campo até 9 de novembro',
    },
    {
      name: 'Federação Paraibana de Futebol',
      abbreviation: 'FPF-PB',
      color: 'DB2777',
      foundedOn: '1947-04-24',
      purpose:
        'Administra as competições da Paraíba, promovendo o futebol feminino, projetos de base e integridade esportiva.',
      currentPresident: 'Michelle Ramalho',
      officialStatementDate: '2024-09-24',
      statementFocus:
        'a reforma do Campeonato Paraibano 2025 amplia vagas para competições nacionais',
      statementAction:
        'os filiados adotem o protocolo de integridade para contratos e patrocínios',
      statementOrientation:
        'os clubes finalizem a regularização de estádios até 4 de novembro',
    },
    {
      name: 'Federação Norte-rio-grandense de Futebol',
      abbreviation: 'FNF-RN',
      color: '3B82F6',
      foundedOn: '1918-01-14',
      purpose:
        'Promove o futebol do Rio Grande do Norte, integrando competições profissionais, femininas e projetos sociais.',
      currentPresident: 'José Vanildo',
      officialStatementDate: '2024-09-23',
      statementFocus:
        'o Potiguar 2025 terá calendário antecipado para conciliar participações na Copa do Nordeste',
      statementAction:
        'os clubes mantenham diálogo com órgãos de segurança para eventos de maior público',
      statementOrientation:
        'as agremiações entreguem planos de contingência climática até 28 de outubro',
    },
    {
      name: 'Federação Sergipana de Futebol',
      abbreviation: 'FSF-SE',
      color: 'EF4444',
      foundedOn: '1920-11-09',
      purpose:
        'Coordena o futebol em Sergipe, com foco em calendário estadual, categorias de base e fortalecimento do feminino.',
      currentPresident: 'Milton Dantas',
      officialStatementDate: '2024-09-29',
      statementFocus:
        'o Sergipano 2025 confirmou expansão do arbitral feminino e reformulação do sub-17',
      statementAction:
        'os clubes priorizem programas sociais ligados à base',
      statementOrientation:
        'as entidades protocolem demandas de infraestrutura até 3 de novembro',
    },
    {
      name: 'Federação Alagoana de Futebol',
      abbreviation: 'FAF-AL',
      color: '0284C7',
      foundedOn: '1927-09-01',
      purpose:
        'Organiza as competições em Alagoas, incentivando a base, o futebol feminino e ações educacionais com clubes.',
      currentPresident: 'Felipe Feijó',
      officialStatementDate: '2024-09-21',
      statementFocus:
        'o conselho arbitral aprovou adequações no Alagoano 2025 e no calendário de base',
      statementAction:
        'os clubes fortaleçam a governança médica e os exames pré-temporada',
      statementOrientation:
        'as equipes entreguem cronograma de categorias sub-15 e sub-17 até 25 de outubro',
    },
    {
      name: 'Federação Amazonense de Futebol',
      abbreviation: 'FAF-AM',
      color: '047857',
      foundedOn: '1914-10-23',
      purpose:
        'Promove o futebol no Amazonas, ajustando competições ao clima local e apoiando o desenvolvimento de talentos.',
      currentPresident: 'Aderson Frota',
      officialStatementDate: '2024-09-20',
      statementFocus:
        'o Barezão 2025 terá partidas em horários alternativos para reduzir impactos climáticos',
      statementAction:
        'os clubes reforcem planos de hidratação e suporte médico',
      statementOrientation:
        'as agremiações compartilhem relatórios ambientais até 27 de outubro',
    },
    {
      name: 'Federação Amapaense de Futebol',
      abbreviation: 'FAF-AP',
      color: '1E3A8A',
      foundedOn: '1945-06-26',
      purpose:
        'Coordena o futebol no Amapá, trabalhando pela modernização de estádios e pelo fortalecimento das categorias de base.',
      currentPresident: 'Josielson Penha',
      officialStatementDate: '2024-09-18',
      statementFocus:
        'o estadual 2025 confirma parceria com a prefeitura para modernizar o Zerão',
      statementAction:
        'os clubes acompanhem as obras e ajustem treinos para preservar gramado',
      statementOrientation:
        'as equipes mantenham atualizados os cadastros de categorias femininas até 30 de outubro',
    },
    {
      name: 'Federação de Futebol do Acre',
      abbreviation: 'FFAC-AC',
      color: '166534',
      foundedOn: '1954-04-29',
      purpose:
        'Administra o futebol no Acre, com foco em interiorização, capacitação técnica e apoio às categorias amadoras.',
      currentPresident: 'Antonio Aquino Lopes',
      officialStatementDate: '2024-09-19',
      statementFocus:
        'o Acreano 2025 terá fases regionais para diminuir deslocamentos',
      statementAction:
        'os clubes invistam em logística compartilhada e controle financeiro',
      statementOrientation:
        'as agremiações apresentem planos de hospedagem até 1º de novembro',
    },
    {
      name: 'Federação Roraimense de Futebol',
      abbreviation: 'FRF-RR',
      color: 'F59E0B',
      foundedOn: '1948-06-09',
      purpose:
        'Gerencia o futebol de Roraima, promovendo o estadual, ações sociais e formação continuada de arbitragem.',
      currentPresident: 'Zeca Xaud',
      officialStatementDate: '2024-09-17',
      statementFocus:
        'o estadual 2025 confirmou acordo para iluminação LED no Ribeirão',
      statementAction:
        'os clubes participem de treinamentos operacionais com a concessionária',
      statementOrientation:
        'as equipes protocolem demandas de categorias femininas até 28 de outubro',
    },
    {
      name: 'Federação de Futebol do Estado de Rondônia',
      abbreviation: 'FFER-RO',
      color: '1E40AF',
      foundedOn: '1944-01-30',
      purpose:
        'Coordena o futebol rondoniense, apoiando projetos de base, arbitragem e desenvolvimento de clubes profissionais.',
      currentPresident: 'Heitor Mendonça',
      officialStatementDate: '2024-09-16',
      statementFocus:
        'o Rondoniense 2025 ajustou regulamento de registro de atletas sub-23',
      statementAction:
        'os clubes reforcem monitoramento de inscrições para evitar punições',
      statementOrientation:
        'as agremiações enviem comprovantes de regularidade fiscal até 24 de outubro',
    },
    {
      name: 'Federação Tocantinense de Futebol',
      abbreviation: 'FTF-TO',
      color: 'FACC15',
      foundedOn: '1990-01-07',
      purpose:
        'Administra o futebol do Tocantins, incentivando competições estaduais, formação de base e integração com a CBF.',
      currentPresident: 'Leomar Quintanilha',
      officialStatementDate: '2024-09-22',
      statementFocus:
        'o Tocantinense 2025 terá calendário integrado às competições nacionais de base',
      statementAction:
        'os clubes invistam em centros de treinamento compartilhados',
      statementOrientation:
        'as equipes apresentem projetos de iluminação homologada até 5 de novembro',
    },
    {
      name: 'Federação de Futebol do Distrito Federal',
      abbreviation: 'FFDF',
      color: '14B8A6',
      foundedOn: '1959-06-16',
      purpose:
        'Coordena o futebol no Distrito Federal, promovendo competições, programas de integridade e qualificação de clubes.',
      currentPresident: 'Daniel Vasconcelos',
      officialStatementDate: '2024-09-15',
      statementFocus:
        'o Candangão 2025 foi oficializado com semifinais em ida e volta',
      statementAction:
        'os clubes mantenham regularidade trabalhista e médica',
      statementOrientation:
        'as agremiações atualizem cadastros no BID até 20 de outubro',
    },
    {
      name: 'Federação de Futebol do Estado do Espírito Santo',
      abbreviation: 'FES-ES',
      color: '7C3AED',
      foundedOn: '1917-02-25',
      purpose:
        'Organiza o Capixabão e competições de base, investindo em transmissão digital e formação de profissionais.',
      currentPresident: 'Gustavo Vieira',
      officialStatementDate: '2024-09-14',
      statementFocus:
        'o Capixabão 2025 terá transmissão digital com sinal unificado',
      statementAction:
        'os clubes adequem estruturas de cabines e internet',
      statementOrientation:
        'as equipes confirmem laudos técnicos até 18 de outubro',
    },
    {
      name: 'Federação Maranhense de Futebol',
      abbreviation: 'FMF-MA',
      color: 'EA384D',
      foundedOn: '1918-06-11',
      purpose:
        'Promove o futebol no Maranhão, integrando competições estaduais, femininas e projetos socioeducativos.',
      currentPresident: 'Antônio Américo',
      officialStatementDate: '2024-09-13',
      statementFocus:
        'o Maranhense 2025 estabeleceu calendário para competições sub-19 e feminina',
      statementAction:
        'os clubes reforcem departamentos médicos e de nutrição',
      statementOrientation:
        'as agremiações entreguem seus planos de viagens até 21 de outubro',
    },
    {
      name: 'Federação de Futebol do Piauí',
      abbreviation: 'FFP-PI',
      color: '22C55E',
      foundedOn: '1941-11-26',
      purpose:
        'Coordena o futebol piauiense, oferecendo suporte a competições estaduais, base e capacitação de gestores.',
      currentPresident: 'Robert Brown Carcará',
      officialStatementDate: '2024-09-12',
      statementFocus:
        'o Campeonato Piauiense 2025 confirmou ajustes no número de datas e na inscrição de atletas',
      statementAction:
        'os clubes atentem para o novo módulo de licenciamento digital',
      statementOrientation:
        'as equipes enviem documentação digitalizada até 18 de outubro',
    },
    {
      name: 'Federação Mato-grossense de Futebol',
      abbreviation: 'FMF-MT',
      color: '0F766E',
      foundedOn: '1942-05-20',
      purpose:
        'Administra o futebol em Mato Grosso, priorizando infraestrutura, arbitragem e formação de atletas.',
      currentPresident: 'Carlos Orione',
      officialStatementDate: '2024-09-11',
      statementFocus:
        'o Mato-grossense 2025 terá centralização das operações de arbitragem',
      statementAction:
        'os clubes participem dos workshops de tecnologia oferecidos',
      statementOrientation:
        'as agremiações apresentem cronograma de adequação de estádios até 17 de outubro',
    },
    {
      name: 'Federação de Futebol de Mato Grosso do Sul',
      abbreviation: 'FFMS-MS',
      color: '38BDF8',
      foundedOn: '1978-12-23',
      purpose:
        'Coordena o futebol sul-mato-grossense, estimulando o calendário estadual, a base e projetos de arbitragem.',
      currentPresident: 'Adriano Kobal',
      officialStatementDate: '2024-09-10',
      statementFocus:
        'o Sul-Mato-Grossense 2025 priorizará jogos aos finais de semana e integração com a base',
      statementAction:
        'os clubes reforcem programas de formação de árbitros assistentes locais',
      statementOrientation:
        'as equipes validem cadastro de atletas sub-20 até 16 de outubro',
    },
  ]

  // Reset dependent tables so the seed can run multiple times without unique constraint errors.
  await prisma.$transaction([
    prisma.verificationToken.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.news.deleteMany(),
    prisma.game.deleteMany(),
    prisma.video.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.user.deleteMany(),
    prisma.times.deleteMany(),
    prisma.club.deleteMany(),
    prisma.confederation.deleteMany(),
  ])

  for (const confed of confederationsSeedData) {
    const data: Prisma.ConfederationCreateInput = {
      name: confed.name,
      slug: slugify(confed.name),
      logoUrl: confederationLogoUrls[confed.abbreviation] ?? placeholderLogo(confed.abbreviation, confed.color),
      foundedAt: parseDate(confed.foundedOn),
      purpose: confed.purpose,
      currentPresident: confed.currentPresident,
      officialStatementDate: parseDate(confed.officialStatementDate),
      officialStatement: composeStatement(confed),
    }

    if (confed.clubs?.length) {
      data.clubs = {
        create: confed.clubs.map((club) => ({
          name: club.name,
          slug: slugify(club.name),
        })),
      }
    }

    await prisma.confederation.create({ data })
  }

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

  const gameData = seedGames.map((game) => ({
    title: game.title,
    slug: game.slug,
    category: game.category,
    excerpt: game.excerpt,
    content: game.content,
    coverImage: game.coverImage,
    date: new Date(game.date),
    authorId: blogger.id,
  }))

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
