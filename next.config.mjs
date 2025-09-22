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
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: [
      '@prisma/client',
      'prisma',
      'applicationinsights',
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
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com', // Exemplo para S3
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
