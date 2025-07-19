# 1. Base Image
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# 2. Builder Image
FROM base AS builder

WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# 3. Production Image
FROM base AS production

WORKDIR /app

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy Prisma schema and generated client for runtime use
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# The server needs yt-dlp at runtime
# hadolint ignore=DL3018
RUN apk add --no-cache python3 py3-pip && \
    pip3 install --upgrade yt-dlp

# Expose the port the app runs on
EXPOSE 3000

# Set the command to start the app
CMD ["npm", "start"]
