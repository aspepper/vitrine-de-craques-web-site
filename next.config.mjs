import { existsSync } from 'node:fs';

const prismaEngineCandidates = [
  './node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node',
  './node_modules/.prisma/client/libquery_engine-debian-openssl-1.1.x.so.node',
  './node_modules/.prisma/client/libquery_engine-darwin.dylib.node',
  './node_modules/.prisma/client/libquery_engine-darwin-arm64.dylib.node',
];

const prismaEnginePaths = prismaEngineCandidates.filter((enginePath) =>
  existsSync(enginePath),
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: [
      '@prisma/client',
      'prisma',
      'applicationinsights',
      'sharp',
    ],
    outputFileTracingIncludes: {
      '/': [
        './node_modules/.prisma/client/**',
        './node_modules/@prisma/client/**',
        ...prismaEnginePaths,
        './node_modules/applicationinsights/**',
        './prisma/**',
      ],
    },
    outputFileTracingExcludes: {
      '/': [
      ],
    },
  },
  reactStrictMode: true,
  images: {
    // Desabilitar a otimização server-side evita que falhas de download externas
    // quebrem o build ou resultem em erros 500 na camada do SWA.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com', // Exemplo para S3
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
