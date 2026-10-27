import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@fungames/gomoku", "@fungames/shared", "@fungames/db"],
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
