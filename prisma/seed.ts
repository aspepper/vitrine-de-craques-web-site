import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  const hashedPassword = await bcrypt.hash('password', 10)

  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: hashedPassword,
      profile: {
        create: {
          bio: 'This is a test user bio.',
        },
      },
      videos: {
        create: [
          {
            title: 'Meu primeiro highlight!',
            description: 'Uma jogada incrível que fiz na semana passada.',
            videoUrl: 'https://example.com/video1.mp4',
            thumbnailUrl: 'https://example.com/thumb1.jpg',
          },
          {
            title: 'Golaço de falta',
            description: 'Um dos meus melhores gols até hoje.',
            videoUrl: 'https://example.com/video2.mp4',
            thumbnailUrl: 'https://example.com/thumb2.jpg',
          },
        ],
      },
    },
    include: {
      videos: true,
      profile: true,
    },
  })

  console.log(`Seeding finished.`)
  console.log(`Created user with id: ${user.id}`)
  console.log(`Created ${user.videos.length} videos`)
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
