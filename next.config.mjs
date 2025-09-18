const prismaEnginePaths = [
  './node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node',
  './node_modules/.prisma/client/libquery_engine-debian-openssl-1.1.x.so.node',
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
    outputFileTracingIncludes: {
      '/': [
        './node_modules/.prisma/client/**',
        './node_modules/@prisma/client/**',
        ...prismaEnginePaths,
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
