import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcrypt'

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

  const confed1 = await prisma.confederation.create({
    data: {
      name: 'Confederação Brasileira',
      slug: slugify('Confederação Brasileira'),
      clubs: {
        create: [
          { name: 'Clube A', slug: slugify('Clube A') },
          { name: 'Clube B', slug: slugify('Clube B') },
        ],
      },
    },
    include: { clubs: true },
  })

  const confed2 = await prisma.confederation.create({
    data: {
      name: 'Confederação Paulista',
      slug: slugify('Confederação Paulista'),
      clubs: {
        create: [
          { name: 'Clube C', slug: slugify('Clube C') },
          { name: 'Clube D', slug: slugify('Clube D') },
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

  await prisma.user.create({
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
        title: 'Primeira Notícia',
        slug: 'primeira-noticia',
        content: 'Conteúdo da primeira notícia',
        authorId: agent1.id,
      },
      {
        title: 'Segunda Notícia',
        slug: 'segunda-noticia',
        content: 'Conteúdo da segunda notícia',
        authorId: agent2.id,
      },
      {
        title: 'Terceira Notícia',
        slug: 'terceira-noticia',
        content: 'Conteúdo da terceira notícia',
        authorId: agent1.id,
      },
    ],
  })

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
        clube: 'Time Exemplo A',
        slug: slugify('Time Exemplo A'),
        sigla: 'TEA',
        apelido: 'ExA',
        mascote: 'Mascote A',
        fundacao: 1990,
        maiorIdolo: 'Ídolo A',
        cidade: 'Cidade A',
        estado: 'ST',
      },
      {
        divisao: 'B',
        clube: 'Time Exemplo B',
        slug: slugify('Time Exemplo B'),
        sigla: 'TEB',
        apelido: 'ExB',
        mascote: 'Mascote B',
        fundacao: 1985,
        maiorIdolo: 'Ídolo B',
        cidade: 'Cidade B',
        estado: 'ST',
      },
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
