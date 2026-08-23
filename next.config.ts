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

  images: {
    /**
     * Uploaded photos are served from Vercel Blob, on a per-store subdomain.
     *
     * `next/image` refuses any remote host that is not listed here, so without
     * this an upload would succeed, the URL would be stored correctly, and the
     * picture would still not appear — the hardest kind of fault to place,
     * because every part looks right except the last one.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
