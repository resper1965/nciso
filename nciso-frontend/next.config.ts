import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configurações para desenvolvimento
  typescript: {
    // Ignorar erros de TypeScript durante o build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignorar erros de ESLint durante o build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
