# Backend Dockerfile for LeadOff CRM
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY backend/package.json backend/
COPY shared/types/package.json shared/types/

# Install dependencies
RUN pnpm install --frozen-lockfile

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

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY backend/package.json backend/
COPY shared/types/package.json shared/types/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files and prisma
COPY --from=base /app/backend/dist backend/dist
COPY --from=base /app/backend/prisma backend/prisma
COPY --from=base /app/backend/node_modules/.prisma backend/node_modules/.prisma
COPY --from=base /app/shared shared/

WORKDIR /app/backend

# Create data directory for SQLite
RUN mkdir -p data

EXPOSE 3000

# Run migrations and start server
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/server.js"]
