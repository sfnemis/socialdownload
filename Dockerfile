# Stage 1: Build the application
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files and install all dependencies for the build
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the Next.js application and the seed script
RUN npm run build
RUN npm run build:scripts

# Stage 2: Production image
FROM node:20-slim

WORKDIR /app

# Install yt-dlp, a production dependency
RUN apt-get update && apt-get install -y python3 python3-pip --no-install-recommends && \
    pip3 install --upgrade yt-dlp --break-system-packages && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy only necessary files from the builder stage
COPY --from=builder /app/package.json /app/package-lock.json* ./
RUN npm install --production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/dist/scripts ./dist/scripts

EXPOSE 3000

CMD ["npm", "start"]
