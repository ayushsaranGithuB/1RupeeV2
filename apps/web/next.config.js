import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
};

// Makes Cloudflare bindings (env vars, ASSETS, etc.) available via
// getCloudflareContext() during `next dev`, so local dev matches Workers.
initOpenNextCloudflareForDev();

export default nextConfig;
