# Social Video Downloader

This is a web application for downloading videos from YouTube, Instagram, and X (formerly Twitter). It features user management, cookie support for private videos, customizable download locations, and a clean, modern interface.

## Features

- **Multi-Platform Downloader**: Download videos and audio from YouTube, Instagram, and X.
- **User Authentication**: Secure login and registration system with JWT-based authentication.
- **User & Admin Roles**: A default admin user is created, and new users are assigned the 'USER' role.
- **Custom Settings**: Users can specify their download path and provide cookies to download private/members-only content.
- **File Browser**: View downloaded files, neatly categorized by platform.
- **Easy Deployment**: Containerized with Docker and includes a simple installation script for Proxmox LXC on Debian.

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Database**: Prisma ORM with SQLite
- **Authentication**: JWT, bcryptjs
- **Downloader**: `yt-dlp-wrap`

## Getting Started

### Prerequisites

- Node.js (v20.x or later)
- npm
- `yt-dlp` installed and available in your system's PATH. (The Docker container handles this automatically).

### Local Development Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd socialdownload
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create your environment file:**
    Copy the example file and generate a secret key.
    ```bash
    cp .env.local.example .env.local
    ```
    Open `.env.local` and replace `your-super-secret-jwt-key` with a long, random string.

4.  **Set up the database and seed it:**
    This will create the SQLite database file and add a default admin user.
    ```bash
    npx prisma generate
    npx prisma db push
    npm run seed
    ```
    The default admin credentials are:
    - **Email**: `admin@example.com`
    - **Password**: `admin`

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at [http://localhost:3000](http://localhost:3000).

## Deployment

### Using Docker

1.  **Build the image:**
    ```bash
    docker build -t social-downloader .
    ```

2.  **Run the container:**
    Create directories for persistent data first.
    ```bash
    mkdir -p data/db
    mkdir -p data/downloads
    ```
    Then run the container, making sure to create and point to a `.env` file.
    ```bash
    docker run -d \
      -p 3000:3000 \
      --name social-downloader \
      --env-file .env \
      -v "$(pwd)/data/db:/app/prisma" \
      -v "$(pwd)/data/downloads:/downloads" \
      --restart unless-stopped \
      social-downloader
    ```

### Using the Proxmox LXC Script (Debian 12)

The `install_lxc.sh` script automates the entire setup process on a fresh Debian 12 container.

1.  **Edit the script:**
    Open `install_lxc.sh` and change the `REPO_URL` variable to your repository's URL.

2.  **Run the script as root:**
    Copy the script to your LXC container and run it.
    ```bash
    chmod +x install_lxc.sh
    ./install_lxc.sh
    ```
    The script will install Docker, clone the repo, build the image, and run the container.

**Important**: After deploying, go to the application's settings page and set the **Download Path** to `/downloads` to ensure files are saved to the persistent volume created by the deployment scripts.
