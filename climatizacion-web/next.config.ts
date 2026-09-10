import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Local public/ assets — keep optimization on; unoptimized fallback if needed
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
