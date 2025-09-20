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
    id: "flamengo-vence-palmeiras-maracana-2024",
    title: "Flamengo controla Palmeiras e vence no Maracanã",
    slug: "flamengo-vence-palmeiras-maracana-2024",
    category: "Campeonato Brasileiro",
    excerpt:
      "Com atuação dominante, o Flamengo pressionou desde o início, abriu vantagem na primeira etapa e segurou a reação alviverde para somar três pontos importantes.",
    content:
      "A equipe rubro-negra começou a partida acelerada, empurrada por mais de 60 mil torcedores no Maracanã. Gerson abriu o placar logo aos 12 minutos após boa troca de passes pelo lado esquerdo, e Pedro ampliou de cabeça ainda antes do intervalo.\n\nNo segundo tempo, o Palmeiras ajustou a marcação e diminuiu com Raphael Veiga em cobrança de falta, mas parou nas defesas de Rossi e no posicionamento seguro da linha defensiva. O resultado recoloca o Flamengo na briga direta pela liderança do Brasileirão.",
    coverImage:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2024-04-21T19:00:00.000Z",
    scoreHome: 2,
    scoreAway: 1,
    homeClub: flamengo,
    awayClub: palmeiras,
    author: journalist,
  },
  {
    id: "real-madrid-manchester-city-champions-2024",
    title: "Real Madrid e Manchester City empatam em jogaço pela Champions",
    slug: "real-madrid-manchester-city-champions-2024",
    category: "UEFA Champions League",
    excerpt:
      "No Bernabéu, merengues e citizens travaram duelo elétrico com golaços de fora da área e muita intensidade nas transições ofensivas.",
    content:
      "Logo aos dois minutos, Bernardo Silva surpreendeu Lunin em cobrança de falta rasteira e abriu o placar para o City. O Real Madrid reagiu com personalidade e virou ainda na primeira etapa graças a um chute desviado de Eduardo Camavinga e a um contra-ataque letal finalizado por Rodrygo.\n\nNo segundo tempo, a equipe inglesa retomou o controle territorial e voltou a liderar o marcador com gols de Phil Foden e Joško Gvardiol em finalizações longas. Mas Federico Valverde, em voleio certeiro, decretou o 3 a 3 e levou a decisão das quartas de final para Manchester em aberto.",
    coverImage:
      "https://images.unsplash.com/photo-1521566652839-697aa473761a?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2024-04-09T19:00:00.000Z",
    scoreHome: 3,
    scoreAway: 3,
    homeClub: realMadrid,
    awayClub: manchesterCity,
    author: journalist,
  },
  {
    id: "palmeiras-flamengo-supercopa-2023",
    title: "Palmeiras supera Flamengo na Supercopa do Brasil",
    slug: "palmeiras-flamengo-supercopa-2023",
    category: "Supercopa do Brasil",
    excerpt:
      "Verdão levou a melhor no duelo de campeões nacionais ao aproveitar espaço nos contra-ataques e contar com brilho de Raphael Veiga.",
    content:
      "Em partida disputada em Brasília, Abel Ferreira escalou um Palmeiras agressivo nas transições. Raphael Veiga converteu duas cobranças de pênalti e Dudu completou a vitória por 4 a 3 em confronto frenético, com alternância no placar durante os 90 minutos.\n\nDo lado rubro-negro, Gabigol marcou duas vezes, mas a equipe carioca esbarrou em falhas defensivas na bola parada. O título reforça a hegemonia recente do Palmeiras nas competições nacionais e aumenta a confiança para a temporada.",
    coverImage:
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2023-01-28T19:30:00.000Z",
    scoreHome: 4,
    scoreAway: 3,
    homeClub: palmeiras,
    awayClub: flamengo,
    author: journalist,
  },
  {
    id: "manchester-city-real-madrid-etuad-2024",
    title: "City domina Real Madrid e avança à semifinal",
    slug: "manchester-city-real-madrid-etuad-2024",
    category: "UEFA Champions League",
    excerpt:
      "Com pressão alta implacável, o Manchester City não deu chances aos espanhóis e carimbou vaga entre os quatro melhores da Europa.",
    content:
      "Pep Guardiola manteve a equipe inglesa em bloco adiantado, sufocando a saída de bola merengue. Erling Haaland abriu o placar de cabeça após cruzamento de Kevin De Bruyne, e Bernardo Silva ampliou aproveitando rebote dentro da área.\n\nApesar da tentativa de reação do Real Madrid com Vinícius Júnior, o City continuou controlando a posse e fechou a contagem com um chute colocado de Julián Álvarez nos minutos finais, consolidando o 3 a 0 e a classificação no Etihad Stadium.",
    coverImage:
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2024-04-17T19:00:00.000Z",
    scoreHome: 3,
    scoreAway: 0,
    homeClub: manchesterCity,
    awayClub: realMadrid,
    author: journalist,
  },
  {
    id: "palmeiras-goleia-flamengo-allianz-2022",
    title: "Palmeiras goleia Flamengo com show coletivo",
    slug: "palmeiras-goleia-flamengo-allianz-2022",
    category: "Campeonato Brasileiro",
    excerpt:
      "Verdão apresentou intensidade desde o apito inicial, marcou duas vezes em jogadas trabalhadas e construiu goleada no Allianz Parque.",
    content:
      "Mesmo com desfalques, o Palmeiras impôs ritmo forte diante de sua torcida. Rony inaugurou o placar ao completar cruzamento de Mayke, e Scarpa ampliou em chute de fora da área. Na etapa final, Dudu fechou a vitória por 3 a 0 aproveitando contra-ataque puxado por Danilo.\n\nO Flamengo buscou diminuir com Arrascaeta, mas encontrou dificuldade para furar o bloqueio defensivo palmeirense. A vitória manteve o time paulista no topo da tabela e reforçou a confiança para a sequência da temporada.",
    coverImage:
      "https://images.unsplash.com/photo-1529421302014-762ad1a18cb0?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2022-08-21T19:00:00.000Z",
    scoreHome: 3,
    scoreAway: 0,
    homeClub: palmeiras,
    awayClub: flamengo,
    author: journalist,
  },
  {
    id: "flamengo-virada-real-madrid-mundial-2018",
    title: "Flamengo busca virada histórica contra o Real Madrid",
    slug: "flamengo-virada-real-madrid-mundial-2018",
    category: "Copa Intercontinental",
    excerpt:
      "Rubro-negros reagiram no segundo tempo com gols de jovens da base e construíram triunfo inesquecível diante dos espanhóis.",
    content:
      "Em amistoso festivo que celebrou campeões mundiais, o Real Madrid abriu vantagem de 2 a 0 com Benzema e Modrić. A torcida flamenguista, porém, empurrou o time para uma reação fulminante na etapa final: Vinícius Júnior diminuiu em jogada individual, Arrascaeta empatou em cobrança de falta e Gabriel Barbosa virou nos acréscimos com finalização no ângulo.\n\nEmbora seja um confronto comemorativo, a partida mostrou a força das categorias de base rubro-negras e a conexão entre gerações vencedoras do clube carioca.",
    coverImage:
      "https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2018-12-15T21:00:00.000Z",
    scoreHome: 3,
    scoreAway: 2,
    homeClub: flamengo,
    awayClub: realMadrid,
    author: journalist,
  },
  {
    id: "real-madrid-virada-manchester-city-2022",
    title: "Real Madrid vira sobre o Manchester City e vai à final",
    slug: "real-madrid-virada-manchester-city-2022",
    category: "UEFA Champions League",
    excerpt:
      "Com dois gols de Rodrygo nos acréscimos e pênalti convertido por Benzema na prorrogação, o Real Madrid escreveu mais um capítulo épico em sua história europeia.",
    content:
      "Precisando reverter a vantagem inglesa, os merengues mantiveram a paciência mesmo após Riyad Mahrez abrir o placar para o Manchester City no segundo tempo. A entrada de Rodrygo mudou o roteiro: o brasileiro empatou aos 90 minutos e virou no lance seguinte ao aproveitar cruzamento de Carvajal.\n\nNa prorrogação, Rubén Dias cometeu falta em Benzema dentro da área e o francês marcou o gol da classificação. O Santiago Bernabéu explodiu em festa com a vitória por 3 a 1, garantindo vaga em mais uma final de Champions League.",
    coverImage:
      "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2022-05-04T19:00:00.000Z",
    scoreHome: 3,
    scoreAway: 1,
    homeClub: realMadrid,
    awayClub: manchesterCity,
    author: journalist,
  },
  {
    id: "flamengo-palmeiras-final-libertadores-2021",
    title: "Palmeiras bate Flamengo na prorrogação e fatura a América",
    slug: "flamengo-palmeiras-final-libertadores-2021",
    category: "Copa Libertadores",
    excerpt:
      "Deyverson saiu do banco, aproveitou vacilo da defesa rubro-negra e marcou o gol do bicampeonato consecutivo do Palmeiras.",
    content:
      "A final em Montevidéu foi marcada por equilíbrio e tensão até o fim. Raphael Veiga abriu o placar logo cedo ao completar assistência de Mayke, enquanto Gabigol empatou para o Flamengo no segundo tempo com finalização precisa na entrada da área.\n\nNa prorrogação, Andreas Pereira perdeu a bola na intermediária, Deyverson arrancou livre e tocou na saída de Diego Alves para decretar o 2 a 1. O título consolidou o domínio palmeirense na Libertadores e aumentou a rivalidade recente entre os clubes brasileiros.",
    coverImage:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2021-11-27T20:00:00.000Z",
    scoreHome: 1,
    scoreAway: 2,
    homeClub: flamengo,
    awayClub: palmeiras,
    author: journalist,
  },
  {
    id: "manchester-city-flamengo-amistoso-2020",
    title: "Manchester City aproveita amistoso e supera Flamengo",
    slug: "manchester-city-flamengo-amistoso-2020",
    category: "Amistoso Internacional",
    excerpt:
      "Com escalação mista, o City venceu graças ao controle de posse e aos gols de Sterling e Mahrez na etapa final.",
    content:
      "O confronto preparatório disputado em Miami reuniu dois estilos distintos. O Flamengo, comandado por Jorge Jesus, tentou manter a intensidade característica, enquanto o Manchester City rodou o elenco e priorizou as triangulações curtas.\n\nApós primeiro tempo equilibrado, os ingleses abriram o placar com Raheem Sterling aproveitando passe de Phil Foden. Pouco depois, Riyad Mahrez acertou chute colocado de fora da área. Pedro ainda descontou para os cariocas, mas os citizens administraram a vantagem até o apito final.",
    coverImage:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80&fm=webp",
    date: "2020-07-18T23:00:00.000Z",
    scoreHome: 2,
    scoreAway: 1,
    homeClub: manchesterCity,
    awayClub: flamengo,
    author: journalist,
  },
]
