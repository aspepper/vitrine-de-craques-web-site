import { Role } from '@prisma/client'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'

export const ADMIN_ALLOWED_ROLES: Role[] = ['SUPER', 'ADMINISTRADOR', 'MODERADOR']

export function isAdminRole(role: Role | null | undefined): boolean {
  return role ? ADMIN_ALLOWED_ROLES.includes(role) : false
}

export async function requireAdminSession() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || !session.user.role) {
    throw Object.assign(new Error('Unauthorized'), { statusCode: 401 })
  }

  if (!isAdminRole(session.user.role)) {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 })
  }

  return session
}
