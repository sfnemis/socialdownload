# 1. Stage: Install dependencies
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install

# 2. Stage: Build the application
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Stage: Production image
FROM node:20-slim AS production
WORKDIR /app

# Install yt-dlp first
RUN apt-get update && apt-get install -y python3 python3-pip --no-install-recommends && \
    pip3 install --upgrade yt-dlp --break-system-packages && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy production dependencies
COPY --from=deps /app/package.json /app/package-lock.json* /app/
COPY --from=deps /app/prisma /app/prisma
RUN npm install --production

# Copy built application and public assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Copy Prisma client from the 'deps' stage where it was generated
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["npm", "start"]
