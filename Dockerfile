# Multi-stage Dockerfile for E-Commerce Template
# Stage 1: Build frontend
# Stage 2: Production runtime

# ============================================
# Stage 1: Build Frontend
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build frontend (creates dist/ folder)
RUN npm run build

# ============================================
# Stage 2: Production Runtime
# ============================================
FROM node:20-alpine

# Install curl for healthchecks
RUN apk add --no-cache curl

# Create app user (security best practice)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy backend source code
COPY --chown=nodejs:nodejs server.js ./
COPY --chown=nodejs:nodejs db ./db
COPY --chown=nodejs:nodejs utils ./utils
COPY --chown=nodejs:nodejs middleware ./middleware

# Copy built frontend from builder stage
COPY --from=frontend-builder --chown=nodejs:nodejs /app/dist ./dist

# Create logs directory
RUN mkdir -p logs && chown nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start the server
CMD ["node", "server.js"]
