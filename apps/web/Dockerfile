# syntax=docker/dockerfile:1
# Build context is the monorepo root (see fly.web.toml [build]).

FROM oven/bun:1.3.14 AS build
WORKDIR /app

# Install workspace deps first (better layer caching).
COPY package.json bun.lock bunfig.toml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN bun install --frozen-lockfile

COPY . .

# NEXT_PUBLIC_* vars are inlined at build time. Override via fly [build.args]
# or `--build-arg`. Server-only vars (API_URL) are set at runtime, not here.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

RUN cd apps/web && bun run build

FROM oven/bun:1.3.14-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Next.js standalone output: minimal server + traced node_modules.
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public

EXPOSE 8080
CMD ["bun", "apps/web/server.js"]
