import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Private client files (max 10MB) travel through an authenticated server action.
  // Next.js defaults to 1MB, so allow enough headroom for multipart encoding.
  experimental: { serverActions: { bodySizeLimit: "11mb" } },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" }
    ]
  }
};
export default nextConfig;
