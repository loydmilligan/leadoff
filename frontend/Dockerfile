# Frontend Dockerfile for LeadOff CRM
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY frontend/package.json frontend/
COPY shared/types/package.json shared/types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY frontend frontend/
COPY shared shared/

# Build frontend
WORKDIR /app/frontend
RUN pnpm build

# Production stage with nginx
FROM nginx:alpine AS production

# Copy built files
COPY --from=base /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
