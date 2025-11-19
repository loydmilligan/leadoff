# Backend Dockerfile for LeadOff CRM
FROM node:20-alpine AS base

# Install required dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files and workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/
COPY shared/types/package.json shared/types/

# Install dependencies (recursive to get all workspace packages)
RUN pnpm install --frozen-lockfile -r

# Copy source files
COPY backend backend/
COPY shared shared/

# Generate Prisma client
WORKDIR /app/backend
RUN pnpm exec prisma generate

# Build
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

# Install required dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files and workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/
COPY shared/types/package.json shared/types/

# Install production dependencies only (recursive)
RUN pnpm install --frozen-lockfile --prod -r

# Copy built files and prisma schema
COPY --from=base /app/backend/dist backend/dist
COPY --from=base /app/backend/prisma backend/prisma
COPY --from=base /app/shared shared/

WORKDIR /app/backend

# Generate Prisma client in production stage
RUN pnpm exec prisma generate

# Create data directory for SQLite
RUN mkdir -p data

EXPOSE 3000

# Run migrations and start server
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/server.js"]
