FROM node:18-bullseye-slim AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Setup production node_modules
FROM base as deps-prod
WORKDIR /app

ENV NODE_ENV production

# Copy all deps and then prune only dev deps
COPY --from=deps /app/node_modules /app/node_modules
COPY package.json package-lock.json* ./
RUN npm prune --omit=dev

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY ./.env.azure ./.env.local

RUN npm run build

# Production image, copy all the files and run the server
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 remix

COPY --from=builder --chown=remix:nodejs /app/build ./build
COPY --from=deps-prod --chown=remix:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=remix:nodejs /app/package.json ./package.json
COPY --from=builder --chown=remix:nodejs /app/server.mjs ./server.mjs

USER remix

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.mjs"]
