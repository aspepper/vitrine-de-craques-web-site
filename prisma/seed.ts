import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Seed Users and Profiles
  const users = [];
  const roles = ['ATHLETE', 'FAN', 'AGENT', 'PRESS'] as const;
  const names = [
    'Carlos Pereira', 'Sofia Mendes', 'Lucas Alves', 'Juliana Costa',
    'Matheus Oliveira', 'Beatriz Santos', 'Gabriel Lima', 'Larissa Souza',
    'Enzo Rodrigues', 'Manuela Ferreira', 'Davi Martins', 'Isabella Gonçalves'
  ];
  const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador'];
  const states = ['SP', 'RJ', 'MG', 'BA'];
  const positions = ['Atacante', 'Meio-campo', 'Zagueiro', 'Goleiro', 'Lateral'];
  const teams = ['Corinthians', 'Flamengo', 'Palmeiras', 'Vasco da Gama'];

  for (let i = 0; i < names.length; i++) {
    const role = roles[i % roles.length];
    const user = await prisma.user.create({
      data: {
        name: names[i],
        email: `${names[i].toLowerCase().replace(' ', '.')}@example.com`,
        image: `https://placehold.co/100x100/any/FFFFFF/png?text=${names[i].charAt(0)}`,
        role: role,
        profile: {
          create: {
            bio: `Um apaixonado por futebol em busca de novas oportunidades e conexões.`,
            ...(role === 'ATHLETE' && {
              athlete: {
                create: {
                  position: positions[i % positions.length],
                  height: 170 + (i % 20),
                  city: cities[i % cities.length],
                  state: states[i % states.length],
                }
              }
            }),
            ...(role === 'FAN' && {
              fan: {
                create: {
                  favoriteTeam: teams[i % teams.length],
                  city: cities[i % cities.length],
                }
              }
            }),
            ...(role === 'AGENT' && {
              agent: {
                create: {
                  contact: `${names[i].toLowerCase().replace(' ', '.')}@agent.com`,
                  state: states[i % states.length],
                }
              }
            }),
          }
        }
      },
    });
    users.push(user);
  }
  console.log(`Created ${users.length} users.`);

  // Seed Videos
  const athleteUsers = await prisma.user.findMany({ where: { role: 'ATHLETE' } });
  for (const user of athleteUsers) {
    await prisma.video.create({
      data: {
        title: `Melhores momentos de ${user.name}`,
        description: 'Uma compilação das minhas melhores jogadas.',
        url: 'https://placehold.co/1080x1920.mp4',
        authorId: user.id,
        likes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 200),
        shares: Math.floor(Math.random() * 100),
      },
    });
  }
  console.log(`Created videos for athletes.`);

  // Seed Articles
  const pressUsers = await prisma.user.findMany({ where: { role: 'PRESS' } });
  const articleCategories = ['Análise Tática', 'Mercado da Bola', 'Entrevista', 'Opinião'];
  for (const user of pressUsers) {
    await prisma.article.create({
      data: {
        title: `A nova geração de talentos: uma análise aprofundada`,
        summary: 'O futebol de base revela surpresas e promessas que podem mudar o cenário do esporte nos próximos anos.',
        content: `## O Futuro é Agora

O cenário do futebol de base nunca esteve tão aquecido. Com a tecnologia, jovens talentos ganham visibilidade de formas antes inimagináveis. Esta é uma análise sobre as principais tendências e nomes para ficar de olho.`,
        category: articleCategories[pressUsers.indexOf(user) % articleCategories.length],
        authorId: user.id,
        published: true,
      },
    });
  }
  console.log(`Created articles for press users.`);

  // Seed Clubs
  const clubData = [
    { name: "Corinthians", slug: "corinthians", coatOfArmsUrl: "https://placehold.co/100x100/000000/FFFFFF/png?text=SCCP", country: "Brasil", state: "SP" },
    { name: "Flamengo", slug: "flamengo", coatOfArmsUrl: "https://placehold.co/100x100/FF0000/000000/png?text=CRF", country: "Brasil", state: "RJ" },
    { name: "Palmeiras", slug: "palmeiras", coatOfArmsUrl: "https://placehold.co/100x100/006437/FFFFFF/png?text=SEP", country: "Brasil", state: "SP" },
    { name: "São Paulo", slug: "sao-paulo", coatOfArmsUrl: "https://placehold.co/100x100/FF0000/FFFFFF/png?text=SPFC", country: "Brasil", state: "SP" },
    { name: "Grêmio", slug: "gremio", coatOfArmsUrl: "https://placehold.co/100x100/0D80BF/FFFFFF/png?text=GFPA", country: "Brasil", state: "RS" },
    { name: "Internacional", slug: "internacional", coatOfArmsUrl: "https://placehold.co/100x100/FF0000/FFFFFF/png?text=SCI", country: "Brasil", state: "RS" },
    { name: "Atlético Mineiro", slug: "atletico-mg", coatOfArmsUrl: "https://placehold.co/100x100/000000/FFFFFF/png?text=CAM", country: "Brasil", state: "MG" },
    { name: "Cruzeiro", slug: "cruzeiro", coatOfArmsUrl: "https://placehold.co/100x100/003366/FFFFFF/png?text=CEC", country: "Brasil", state: "MG" },
  ];
  await prisma.club.createMany({ data: clubData });
  console.log(`Created ${clubData.length} clubs.`);

  // Seed Confederations
  const confederationData = [
    { name: "FIFA", slug: "fifa", description: "Fédération Internationale de Football Association", logoUrl: "https://placehold.co/100x100/154284/FFFFFF/png?text=FIFA" },
    { name: "CONMEBOL", slug: "conmebol", description: "Confederação Sul-Americana de Futebol", logoUrl: "https://placehold.co/100x100/0033A0/FFFFFF/png?text=CSF" },
    { name: "UEFA", slug: "uefa", description: "Union of European Football Associations", logoUrl: "https://placehold.co/100x100/0055A4/FFFFFF/png?text=UEFA" },
  ];
  await prisma.confederation.createMany({ data: confederationData });
  console.log(`Created ${confederationData.length} confederations.`);

  // Seed Games
  const gameData = [
    { title: "EA FC 25: Dicas para o Modo Carreira", slug: "ea-fc-25-dicas", tag: "Dica", description: "Aprenda a gerenciar seu time e descobrir jovens talentos no modo carreira mais popular do mundo.", ctaUrl: "#", imageUrl: "https://placehold.co/600x400/1E40AF/FFFFFF/png?text=EA+FC+25" },
    { title: "Football Manager 2025: Primeiras Impressões", slug: "fm-25-preview", tag: "Análise", description: "Veja o que há de novo no simulador de gerenciamento de futebol mais completo do mercado.", ctaUrl: "#", imageUrl: "https://placehold.co/600x400/6D28D9/FFFFFF/png?text=FM+25" },
    { title: "eFootball: Dominando a Master League", slug: "efootball-master-league", tag: "Tutorial", description: "Um guia passo a passo para levar seu time à glória na Master League do eFootball.", ctaUrl: "#", imageUrl: "https://placehold.co/600x400/BE185D/FFFFFF/png?text=eFootball" },
  ];
  await prisma.game.createMany({ data: gameData });
  console.log(`Created ${gameData.length} games.`);

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
