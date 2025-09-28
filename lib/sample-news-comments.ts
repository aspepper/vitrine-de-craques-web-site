export interface SampleNewsComment {
  id: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  content: string;
  createdAt: string;
  replies?: SampleNewsCommentReply[];
}

export interface SampleNewsCommentReply {
  id: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  content: string;
  createdAt: string;
}

const defaultComments: SampleNewsComment[] = [
  {
    id: "sample-news-comment-1",
    authorName: "Carla Mendes",
    content:
      "Atuação impecável. Gostei especialmente da forma como ele buscou o jogo no segundo tempo. A equipe de análise está de parabéns pelo preparo tático!",
    createdAt: "2025-08-04T12:30:00.000Z",
    replies: [
      {
        id: "sample-news-comment-1-reply-1",
        authorName: "Equipe Vitrine",
        content:
          "Obrigada pelo retorno, Carla! Também ficamos impressionados com os dados de velocidade máxima registrados nessa partida.",
        createdAt: "2025-08-04T15:10:00.000Z",
      },
    ],
  },
  {
    id: "sample-news-comment-2",
    authorName: "Marcelo Farias",
    content:
      "O mais interessante é perceber como o departamento médico ajustou a rotina do atleta. Isso explica a intensidade até os minutos finais.",
    createdAt: "2025-08-04T18:45:00.000Z",
  },
];

const articleSpecificComments: Record<string, SampleNewsComment[]> = {
  "estrela-em-ascensao-brilha-em-classico-decisivo": [
    {
      id: "sample-news-comment-estrela-1",
      authorName: "Juliana Prado",
      content:
        "Estive no estádio e a leitura de jogo dele impressionou. A movimentação sem bola fez toda a diferença no lance do gol.",
      createdAt: "2025-08-05T10:20:00.000Z",
      replies: [
        {
          id: "sample-news-comment-estrela-1-reply-1",
          authorName: "Analisando Táticas FC",
          content:
            "Juliana, concordo com você. O mapa de calor divulgado pelo clube mostra como ele atraiu a marcação para abrir espaço ao meia.",
          createdAt: "2025-08-05T12:05:00.000Z",
        },
      ],
    },
    {
      id: "sample-news-comment-estrela-2",
      authorName: "Roberto Lima",
      content:
        "Que personalidade! É legal ver a base recebendo minutagem em jogos grandes. Ansioso para acompanhar a evolução nas próximas rodadas.",
      createdAt: "2025-08-05T13:40:00.000Z",
    },
  ],
};

export function getSampleNewsComments(slug: string): SampleNewsComment[] {
  if (articleSpecificComments[slug]) {
    return articleSpecificComments[slug];
  }

  return defaultComments;
}
