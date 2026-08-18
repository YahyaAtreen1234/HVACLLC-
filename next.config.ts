import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Emits `.next/standalone`: the server plus only the node_modules actually
   * imported, so the container image is a few hundred MB rather than several
   * gigabytes. Required by the Dockerfile.
   *
   * Skipped on Vercel, which builds its own serverless output and sets VERCEL
   * during the build. Leaving a self-hosting flag on for a platform that does
   * not use it is a needless way to inherit someone else's edge case.
   */
  output: process.env.VERCEL ? undefined : "standalone",

  /**
   * `pg` resolves optional native and dialect modules at runtime. Bundling it
   * turns those into unresolved-import build errors, so it is loaded from
   * node_modules instead.
   */
  serverExternalPackages: ["pg"],
};

export default nextConfig;
