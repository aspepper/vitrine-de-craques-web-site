import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import { Role, UserStatus } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role?: Role | null
      status?: UserStatus
      blockedReason?: string | null
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    passwordHash?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role?: Role | null
    status?: UserStatus
    blockedReason?: string | null
  }
}
