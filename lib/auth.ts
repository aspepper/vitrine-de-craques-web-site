import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AzureADProvider from "next-auth/providers/azure-ad";
import AppleProvider from "next-auth/providers/apple";
import bcrypt from "bcryptjs";

import prisma from "@/lib/db";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "text", placeholder: "jsmith@example.com" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
        select: {
          id: true,
          name: true,
          email: true,
          passwordHash: true,
          status: true,
          blockedReason: true,
        },
      });

      if (!user || !user.passwordHash) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.passwordHash
      )

      if (!isPasswordValid) {
        return null
      }

      if (user.status === "BLOCKED") {
        throw new Error(
          user.blockedReason
            ? `Conta bloqueada: ${user.blockedReason}`
            : "Conta bloqueada. Entre em contato com o suporte."
        )
      }

      return { id: user.id, name: user.name ?? undefined, email: user.email }
    },
  }),
]

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  providers.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    })
  )
}

if (
  process.env.MICROSOFT_CLIENT_ID &&
  process.env.MICROSOFT_CLIENT_SECRET &&
  process.env.MICROSOFT_TENANT_ID
) {
  providers.push(
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      tenantId: process.env.MICROSOFT_TENANT_ID,
      id: "microsoft",
    })
  )
}

if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
  providers.push(
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
    })
  )
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
    // signOut: '/auth/signout',
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // (e.g. check your email)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out to disable)
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id
      }

      const userId = (user?.id as string | undefined) ?? (token.id as string | undefined) ?? token.sub

      if (!userId) {
        return token
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          status: true,
          blockedReason: true,
          profile: { select: { role: true } },
        },
      })

      if (dbUser) {
        token.id = dbUser.id
        token.status = dbUser.status
        token.blockedReason = dbUser.blockedReason
        token.role = dbUser.profile?.role ?? null
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role ?? null
        session.user.status = token.status
        session.user.blockedReason = token.blockedReason ?? null
      }
      return session
    },
    async signIn({ user }) {
      if (!user?.id) {
        return false
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { status: true, blockedReason: true },
      })

      if (!dbUser) {
        return false
      }

      if (dbUser.status === "BLOCKED") {
        const reason = dbUser.blockedReason
          ? `Conta bloqueada: ${dbUser.blockedReason}`
          : "Conta bloqueada."
        throw new Error(reason)
      }

      return true
    },
  },
  events: {
    async signIn({ user, account }) {
      if (!user?.id) {
        return
      }

      const provider = account?.provider ?? "credentials"
      const isAppProvider = provider === "app" || provider === "mobile"

      await prisma.user.update({
        where: { id: user.id },
        data: isAppProvider
          ? { lastAppLoginAt: new Date() }
          : { lastWebLoginAt: new Date() },
      })
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
