# syntax=docker/dockerfile:1
# Single-app deployment: Next.js with integrated Hono API

FROM oven/bun:1.3.14 AS build
WORKDIR /app

# Install deps first (better layer caching).
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile

COPY . .

# NEXT_PUBLIC_* vars are inlined at build time. Override via fly [build.args]
# or `--build-arg`. Runtime vars (API_URL, CRON_SECRET) are set on the Fly app.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

RUN bun run build

FROM oven/bun:1.3.14-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Next.js standalone output: minimal server + traced node_modules.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 8080
CMD ["bun", "server.js"]
