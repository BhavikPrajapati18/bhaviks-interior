import type { NextConfig } from "next";

let supabaseHost: string | null = null;
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    if (url.protocol === "https:") supabaseHost = url.hostname;
  }
} catch { /* Preview mode: no configured storage host. */ }

const nextConfig: NextConfig = {
  // Private client files (max 10 MB) travel through authenticated server actions.
  experimental: { serverActions: { bodySizeLimit: "11mb" } },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      ...(supabaseHost ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }] : []),
    ],
  },
};
export default nextConfig;
