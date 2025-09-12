import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  const hashedPassword = await bcrypt.hash('password', 10)

  const confed = await prisma.confederation.create({
    data: {
      name: 'Confederação Brasileira',
      clubs: {
        create: [
          { name: 'Clube A' },
          { name: 'Clube B' },
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

  await prisma.game.create({
    data: {
      date: new Date(),
      homeClubId: confed.clubs[0].id,
      awayClubId: confed.clubs[1].id,
      scoreHome: 0,
      scoreAway: 0,
    },
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
