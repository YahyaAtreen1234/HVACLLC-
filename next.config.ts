import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Emits `.next/standalone`: the server plus only the node_modules actually
   * imported, so the container image is a few hundred MB rather than several
   * gigabytes. Required by the Dockerfile.
   */
  output: "standalone",
};

export default nextConfig;
