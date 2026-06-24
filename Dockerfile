# ============================================================
# Stage 1: Install ALL dependencies (including devDeps for build)
# ============================================================
FROM node:20-alpine AS deps

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci 2>&1

# ============================================================
# Stage 2: Build the Next.js application + compile server.ts
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Compile the custom WebSocket server (TypeScript is available via devDeps)
RUN npx tsc server.ts --outDir . --module commonjs --esModuleInterop --skipLibCheck --target es2020

# ============================================================
# Stage 3: Production runtime
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the built Next.js output and public assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Copy package.json BEFORE pruning so npm knows which deps are dev-only
COPY --from=builder /app/package.json ./package.json

# Copy only production node_modules (prune devDeps)
COPY --from=deps /app/node_modules ./node_modules
RUN npm prune --omit=dev 2>&1 || true

# Copy compiled server and config
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/next.config.ts ./next.config.ts

# Create a volume mount point for the SQLite database
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Override DATABASE_URL to use the persistent volume path
ENV DATABASE_URL="file:/app/data/orbit.db"

CMD ["node", "server.js"]
