import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@fungames/gomoku", "@fungames/shared", "@fungames/db"],
};

export default nextConfig;
