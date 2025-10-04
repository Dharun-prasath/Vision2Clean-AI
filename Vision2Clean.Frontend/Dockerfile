# Vision2Clean AI Frontend - Production Docker Image
# Multi-stage build for optimized production deployment

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies for node-gyp
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --silent

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM nginx:alpine AS production

# Install security updates
RUN apk update && apk upgrade

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy custom nginx configuration
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist /usr/share/nginx/html

# Copy health check script
COPY --from=builder /app/docker/healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

# Add labels for better container management
LABEL \
  org.opencontainers.image.title="Vision2Clean AI Frontend" \
  org.opencontainers.image.description="AI-powered waste detection and management frontend" \
  org.opencontainers.image.version="1.0.0" \
  org.opencontainers.image.vendor="Vision2Clean" \
  org.opencontainers.image.licenses="MIT" \
  org.opencontainers.image.source="https://github.com/Dharun-prasath/Vision2Clean-AI"

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD /usr/local/bin/healthcheck.sh

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Development stage
FROM node:18-alpine AS development

WORKDIR /app

# Install dependencies for development
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm install

# Copy source code
COPY . .

# Expose development port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]