/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      '@prisma/client',
      'prisma',
      'applicationinsights',
    ],
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
