export type SampleVideo = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  likesCount: number;
  interestedAgents: {
    id: string;
    name: string;
    avatarUrl?: string;
  }[];
  comments: {
    id: string;
    authorName: string;
    authorAvatarUrl?: string;
    content: string;
    createdAt: string;
  }[];
};

const DEFAULT_AVATAR = "/place-holder-image-error.png";

export const sampleVideos: SampleVideo[] = [
  {
    id: "sample-video-1",
    title: "Compilado de jogadas do atacante sub-17",
    description:
      "Sequência de dribles curtos e finalizações de perna esquerda durante a Copa Base Sul-Americana.",
    videoUrl: "https://storage.googleapis.com/coverr-main/mp4/Footboys.mp4",
    likesCount: 184,
    interestedAgents: [
      {
        id: "agent-sample-1",
        name: "Agente Especialista",
        avatarUrl: DEFAULT_AVATAR,
      },
      {
        id: "agent-sample-2",
        name: "Marcos Ribeiro",
      },
    ],
    comments: [
      {
        id: "comment-sample-1",
        authorName: "Marina Campos",
        authorAvatarUrl: DEFAULT_AVATAR,
        content:
          "Excelente controle de bola nos espaços curtos. Gostaria de ver mais lances sob pressão para a próxima avaliação.",
        createdAt: "2024-05-18T14:20:00.000Z",
      },
      {
        id: "comment-sample-2",
        authorName: "Diego Fernandes",
        content: "Tem um primeiro passo muito forte. Vamos marcar uma conversa com a família?",
        createdAt: "2024-05-17T10:05:00.000Z",
      },
    ],
  },
  {
    id: "sample-video-2",
    title: "Zagueiro demonstrando saída de bola",
    description:
      "Lances com domínio orientado e inversões rápidas durante amistoso contra equipe profissional.",
    videoUrl: "https://storage.googleapis.com/coverr-main/mp4/Mountains.mp4",
    likesCount: 96,
    interestedAgents: [
      {
        id: "agent-sample-3",
        name: "Ana Beatriz",
        avatarUrl: DEFAULT_AVATAR,
      },
    ],
    comments: [
      {
        id: "comment-sample-3",
        authorName: "Carlos Eduardo",
        authorAvatarUrl: DEFAULT_AVATAR,
        content: "Boa leitura de jogo, principalmente na inversão para o lateral direito.",
        createdAt: "2024-04-22T18:45:00.000Z",
      },
    ],
  },
];
