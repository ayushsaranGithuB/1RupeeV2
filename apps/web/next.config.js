import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Emit a self-contained server bundle for a small production container image.
  output: "standalone",
  // Trace deps from the monorepo root so workspace packages are included.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
};

export default nextConfig;
