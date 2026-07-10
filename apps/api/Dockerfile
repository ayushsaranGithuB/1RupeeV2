# syntax=docker/dockerfile:1
# Build context is the monorepo root (see fly.api.toml [build]).

FROM oven/bun:1.3.14 AS build
WORKDIR /app

# Install workspace deps first (better layer caching).
COPY package.json bun.lock bunfig.toml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN bun install --frozen-lockfile

# Bundle the API into a single self-contained file (postgres, drizzle, etc.).
COPY . .
RUN cd apps/api && bun build src/index.ts --outdir dist --target bun

FROM oven/bun:1.3.14-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV API_PORT=3001
COPY --from=build /app/apps/api/dist ./dist
EXPOSE 3001
CMD ["bun", "dist/index.js"]
