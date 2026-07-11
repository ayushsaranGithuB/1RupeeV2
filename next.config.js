/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
};

export default nextConfig;
