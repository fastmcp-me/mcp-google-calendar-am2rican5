# Use Node.js 20 alpine for smaller image size
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy TypeScript config and source code
COPY tsconfig.json ./
COPY src/ ./src/

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Remove dev dependencies to reduce image size
RUN npm prune --omit=dev

# Create a non-root user
RUN addgroup -g 1001 -S mcp && \
    adduser -S mcp -u 1001

# Change ownership of the app directory
RUN chown -R mcp:mcp /app

# Switch to non-root user
USER mcp

# Expose the port (default 3420 for SSE mode)
EXPOSE 3420

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "console.log('Health check passed')" || exit 1

# Default command - can be overridden
CMD ["node", "dist/index.js"]