import { UserStatus, VideoBlockAppealStatus, VideoVisibilityStatus } from '@prisma/client'

import prisma from '@/lib/db'

export type RoleDistributionEntry = {
  role: string
  count: number
}

export interface AdminDashboardSummary {
  totalUsers: number
  activeUsers: number
  blockedUsers: number
  webLoggedUsers: number
  appLoggedUsers: number
  totalVideos: number
  blockedVideos: number
  pendingVideoAppeals: number
  roleDistribution: RoleDistributionEntry[]
  newUsersLast30Days: number
  videosCreatedLast30Days: number
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000

function daysAgo(days: number) {
  const date = new Date()
  date.setTime(date.getTime() - days * ONE_DAY_MS)
  return date
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const [totalUsers, blockedUsers, totalVideos, blockedVideos, pendingAppeals, roleStats, newUsersLast30Days, videosLast30Days] =
    await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { status: UserStatus.BLOCKED } }),
      prisma.video.count(),
      prisma.video.count({ where: { visibilityStatus: VideoVisibilityStatus.BLOCKED } }),
      prisma.video.count({ where: { blockAppealStatus: VideoBlockAppealStatus.PENDING } }),
      prisma.profile.groupBy({ by: ['role'], _count: { role: true } }),
      prisma.user.count({ where: { createdAt: { gte: daysAgo(30) } } }),
      prisma.video.count({ where: { createdAt: { gte: daysAgo(30) } } }),
    ])

  const activeUsers = totalUsers - blockedUsers
  const activityCutoff = daysAgo(1)

  const [webLoggedUsers, appLoggedUsers] = await Promise.all([
    prisma.user.count({
      where: {
        status: { not: UserStatus.BLOCKED },
        lastWebLoginAt: { gte: activityCutoff },
      },
    }),
    prisma.user.count({
      where: {
        status: { not: UserStatus.BLOCKED },
        lastAppLoginAt: { gte: activityCutoff },
      },
    }),
  ])

  const roleDistribution: RoleDistributionEntry[] = roleStats.map((entry) => ({
    role: entry.role,
    count: entry._count.role,
  }))

  return {
    totalUsers,
    activeUsers,
    blockedUsers,
    webLoggedUsers,
    appLoggedUsers,
    totalVideos,
    blockedVideos,
    pendingVideoAppeals: pendingAppeals,
    roleDistribution,
    newUsersLast30Days,
    videosCreatedLast30Days: videosLast30Days,
  }
}
