# Use pnpm official image as base
FROM docker.io/node:20.11.1 AS base
RUN npm install -g pnpm

# Install dependencies and build
FROM base AS builder

# Define build argument for database URL
ARG DATABASE_URL

WORKDIR /app

# Copy configuration files
COPY package.json pnpm-lock.yaml* ./
COPY next.config.mjs ./
COPY tsconfig.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files and build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Use DATABASE_URL from build arg
ENV DATABASE_URL=${DATABASE_URL}
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Ensure pnpm is available
RUN corepack enable && corepack prepare pnpm@latest --activate

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs


# Copy necessary files
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

# Copy the built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set the correct permissions
RUN chown -R nextjs:nodejs .

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]