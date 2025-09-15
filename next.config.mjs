const prismaClientIncludes = [
  './node_modules/.prisma/client/**/*',
  './node_modules/@prisma/client/**/*',
  './node_modules/@prisma/engines/**/*',
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
    outputFileTracingIncludes: {
      '/': prismaClientIncludes,
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
