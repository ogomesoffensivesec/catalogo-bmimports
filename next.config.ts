import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },     // ignora ESLint no build
  typescript: { ignoreBuildErrors: true }, 
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      // adicione outros hosts usados
    ],
  },
};

export default nextConfig;
