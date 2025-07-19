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

# --- Stop any previous versions --- #
echo "---> Stopping any previous running versions of the app..."
# Stop pm2 process if it exists
pm2 delete socialdownload || true

# --- System Setup --- #
echo "---> Updating system and installing dependencies..."
apt-get update
apt-get install -y curl git python3 python3-pip

# Install Node.js v20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install global packages
npm install -g pm2
pip3 install --upgrade yt-dlp --break-system-packages

# --- Application Deployment --- #
# This script assumes it's run from within the project directory.

echo "---> Installing application dependencies..."
npm install

echo "---> Building application..."
npm run build

echo "---> Starting application with pm2..."
pm2 start npm --name "socialdownload" -- start

# Save the pm2 process list to restart on server reboot
pm2 save

echo "---"
echo "Deployment complete!"
echo "Application 'socialdownload' is running and managed by pm2."
echo "To view logs, run: pm2 logs socialdownload"
echo "To stop the app, run: pm2 stop socialdownload"
echo "Your Social Downloader is now running on http://<YOUR_LXC_IP>:3000"
echo "Login with admin@example.com and password 'admin'."
echo "IMPORTANT: In the application settings, set your download path to '/downloads' to save files to the persistent volume."
