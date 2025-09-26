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
        avatarUrl: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&q=80&fm=webp",
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
        authorAvatarUrl:
          "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&q=80&fm=webp",
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
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80&fm=webp",
      },
    ],
    comments: [
      {
        id: "comment-sample-3",
        authorName: "Carlos Eduardo",
        authorAvatarUrl:
          "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=160&q=80&fm=webp",
        content: "Boa leitura de jogo, principalmente na inversão para o lateral direito.",
        createdAt: "2024-04-22T18:45:00.000Z",
      },
    ],
  },
];
