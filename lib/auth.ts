import { createHash } from "crypto";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { LoggerInstance, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AzureADProvider from "next-auth/providers/azure-ad";
import AppleProvider from "next-auth/providers/apple";
import bcrypt from "bcryptjs";

import prisma from "@/lib/db";
import { logError } from "@/lib/error";

const resolvedSecret = (() => {
  const explicitSecret =
    process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? process.env.JWT_SECRET;

  if (explicitSecret) {
    return explicitSecret;
  }

  const fallbackSeed =
    process.env.WEBSITE_HOSTNAME || process.env.HOSTNAME || "vitrine-de-craques";

  console.warn(
    "[Auth] NEXTAUTH_SECRET ausente. Usando fallback derivado do host. Configure NEXTAUTH_SECRET nas variáveis de ambiente para produção.",
    { fallbackSeed },
  );

  return createHash("sha256").update(fallbackSeed).digest("hex");
})();

const resolvedUrl = (() => {
  const configuredUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  const host = process.env.WEBSITE_HOSTNAME || process.env.HOSTNAME;
  if (host) {
    const inferredUrl = host.startsWith("http") ? host : `https://${host}`;
    console.warn(
      "[Auth] NEXTAUTH_URL ausente. Inferindo a partir do host. Configure NEXTAUTH_URL para corresponder ao domínio público.",
      { inferredUrl },
    );
    return inferredUrl;
  }

  const localUrl = "http://localhost:3000";
  console.warn(
    "[Auth] NEXTAUTH_URL ausente. Recuando para localhost. Configure NEXTAUTH_URL para o domínio de produção.",
    { localUrl },
  );
  return localUrl;
})();

process.env.NEXTAUTH_SECRET ||= resolvedSecret;
process.env.NEXTAUTH_URL ||= resolvedUrl;

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

const logger: LoggerInstance = {
  error(code, metadata) {
    logError(new Error(String(code)), "NEXTAUTH_ERROR", {
      scope: "NextAuthLogger",
      code,
      metadata,
    }).catch((loggingError) => {
      console.error("Falha ao registrar erro do NextAuth", loggingError);
    });
  },
  warn(code) {
    logError(new Error(String(code)), "NEXTAUTH_WARN", {
      scope: "NextAuthLogger",
      code,
    }).catch((loggingError) => {
      console.error("Falha ao registrar aviso do NextAuth", loggingError);
    });
  },
  debug(code, metadata) {
    console.debug("[NextAuth]", code, metadata);
  },
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  secret: resolvedSecret,
  trustHost: true,
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
  logger,
  secret: process.env.NEXTAUTH_SECRET,
};
