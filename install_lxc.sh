#!/bin/bash
set -e

# --- Configuration ---
REPO_URL="https://github.com/sfnemis/socialdownload.git"
APP_DIR="socialdownload"
# Generate a random, secure JWT secret
JWT_SECRET=$(openssl rand -hex 32)

# --- Script Start ---
echo "🚀 Starting Social Downloader deployment on Debian LXC..."

# 1. Update system and install dependencies
echo "🔄 Updating system packages and installing dependencies (git, docker)..."
apt-get update && apt-get upgrade -y
apt-get install -y git docker.io curl

# 2. Start and enable Docker service
echo "🐳 Starting and enabling Docker service..."
systemctl start docker
systemctl enable docker

# 3. Clone the application repository
if [ -d "$APP_DIR" ]; then
  echo "📁 Repository directory '$APP_DIR' already exists. Skipping clone."
else
  echo "Cloning repository from $REPO_URL..."
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"

# 4. Create environment file
echo "🔐 Creating .env file with a secure JWT_SECRET..."
cat > .env <<EOF
JWT_SECRET=$JWT_SECRET
EOF

# 5. Create directories for persistent data on the host
echo "./data/db for the database."
echo "./data/downloads for video downloads."
mkdir -p ./data/db
mkdir -p ./data/downloads

# 6. Build the Docker image
echo "🏗️ Building the Docker image 'social-downloader'..."
docker build -t social-downloader .

# 7. Stop and remove any existing container with the same name
if [ "$(docker ps -a -q -f name=social-downloader)" ]; then
    echo "🗑️ Stopping and removing existing 'social-downloader' container..."
    docker stop social-downloader
    docker rm social-downloader
fi

# 8. Run the Docker container
echo "▶️ Running the Docker container..."
docker run -d \
  -p 3000:3000 \
  --name social-downloader \
  --env-file .env \
  -v "$(pwd)/data/db:/data" \
  -v "$(pwd)/data/downloads:/downloads" \
  --restart unless-stopped \
  social-downloader

# 9. Set up the database
echo "⚙️ Setting up the database (migrations and seeding)..."
sleep 5 # Give the container a moment to start up
docker exec social-downloader npm run db:migrate
docker exec social-downloader npm run seed

# --- Done ---
echo "✅ Deployment complete!"
echo "Your Social Downloader is now running on http://<YOUR_LXC_IP>:3000"
echo "Login with admin@example.com and password 'admin'."
echo "IMPORTANT: In the application settings, set your download path to '/downloads' to save files to the persistent volume."
