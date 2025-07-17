# 🚀 Production Deployment Guide

This guide provides a comprehensive walkthrough for deploying the Semantic Logic AI Workflow Builder to a production environment on a Virtual Private Server (VPS). It is designed to be clear and accessible for both experienced and junior developers.

---

## 📋 Pre-Deployment Checklist

Before starting the deployment process, ensure you have met the following requirements.

### ✅ Repository & Application Status
- [x] **All critical files verified**: No empty or missing files in the repository.
- [x] **Frontend builds successfully**: The Vite-based frontend compiles without errors (`npm run build`).
- [x] **Backend builds successfully**: The TypeScript server compiles without errors (`npm run build` in `server` directory).
- [x] **No compilation errors**: The entire TypeScript project compiles without any issues.
- [x] **Database schema ready**: The `prisma/schema.prisma` file is valid and ready for migration.
- [x] **Dependencies installed**: All `npm` packages for both frontend and backend can be installed successfully.

### ✅ System & Environment Requirements
- **OS**: Ubuntu 20.04 LTS or newer.
- **Node.js**: Version 18.x or higher.
- **PostgreSQL**: Version 13.x or higher.
- **Memory**: Minimum 2GB RAM (4GB is recommended for better performance).
- **Storage**: Minimum 20GB SSD storage.
- **Domain & DNS**: A registered domain name with an 'A' record pointing to your VPS's public IP address.
- **Network**: A public IP address and open ports for HTTP (80), HTTPS (443), and SSH (22).

### ✅ Security Requirements
- **SSL/TLS Certificate**: A valid certificate is required for enabling HTTPS. We will use Let's Encrypt.
- **Firewall**: A configured firewall to protect the application and database from unauthorized access.
- **Environment Variables**: A secure method for managing sensitive data like database credentials and API keys.

---

## 🚀 Deployment Steps

Follow these steps carefully to deploy the application.

### 1. Server Setup
First, connect to your VPS via SSH and install the necessary system packages.

```bash
# Update system packages to their latest versions
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18+)
# This command adds the Node.js v18 repository and installs it.
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL database server
sudo apt install postgresql postgresql-contrib -y

# Install PM2, a process manager for Node.js, to keep the application running
sudo npm install -g pm2

# Install Nginx, a high-performance web server and reverse proxy
sudo apt install nginx -y

# Install Certbot, a tool to automatically obtain and renew SSL certificates from Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
```
- **What’s Happening**: This initial setup prepares your server with all the required software: a JavaScript runtime (Node.js), a database (PostgreSQL), a process manager (PM2), a web server (Nginx), and an SSL tool (Certbot).

### 2. Database Setup
Next, create a dedicated database and user for the application.

```bash
# Switch to the 'postgres' user to access the database command line
sudo -u postgres psql

# Inside the PostgreSQL prompt, run the following SQL commands:
CREATE DATABASE chatgpt_clone;
CREATE USER app_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE chatgpt_clone TO app_user;
\q
```
- **What’s Happening**: You are creating a new database named `chatgpt_clone` and a user `app_user`. It's crucial to replace `'your_secure_password'` with a strong, unique password. The user is granted full permissions for the new database.

### 3. Application Deployment
Clone the application code from its Git repository and install all dependencies.

```bash
# Clone the repository from GitHub
git clone https://github.com/iamcapote/chatgpt-clone-285.git
cd chatgpt-clone-285

# Install frontend dependencies from the root directory
npm install

# Navigate to the server directory and install backend dependencies
cd server
npm install
```
- **What’s Happening**: The project's source code is downloaded. Then, `npm install` is run in both the main project folder and the `server` subfolder to download all the necessary libraries for the frontend and backend, respectively.

### 4. Environment Configuration
Create a `.env` file to store sensitive configuration details for the server.

In the `/server` directory, create a file named `.env`:
```bash
# /workspaces/chatgpt-clone-285/server/.env
# Database Connection String
# Use the username and password you created in Step 2
DATABASE_URL="postgresql://app_user:your_secure_password@localhost:5432/chatgpt_clone"

# Server Configuration
PORT=5000
NODE_ENV=production

# Cross-Origin Resource Sharing (CORS)
# Replace 'https://yourdomain.com' with your actual domain
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting (optional, but recommended)
RATE_LIMIT_WINDOW_MS=900000 # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Security Headers (enabled by default)
HELMET_ENABLED=true
```
- **What’s Happening**: This file provides the application with essential configuration. It tells the server how to connect to the database, which port to listen on, and what security settings to apply. **This file should never be committed to version control.**

### 5. Build & Migrate
Compile the frontend and backend code into optimized production builds and apply the database schema.

```bash
# Navigate back to the project root directory
cd ..

# Build the frontend application
npm run build

# Navigate back to the server directory
cd server

# Build the backend application
npm run build

# Apply database migrations and generate the Prisma client
npx prisma migrate deploy
npx prisma generate
```
- **What’s Happening**: `npm run build` transpiles and bundles the source code into efficient static files. `prisma migrate deploy` applies your database schema to the newly created database, setting up all the necessary tables. `prisma generate` creates a type-safe database client that your server code uses to interact with the database.

### 6. Process Management with PM2
Configure PM2 to manage the backend server, ensuring it runs continuously and restarts automatically if it crashes.

Create an `ecosystem.config.js` file in the project's root directory:
```javascript
// /path/to/chatgpt-clone-285/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'chatgpt-clone-server',
      script: 'dist/index.js', // The entry point of the built server application
      cwd: '/path/to/chatgpt-clone-285/server', // The directory where the server runs
      instances: 'max', // Run on all available CPU cores
      exec_mode: 'cluster', // Enables clustering for better performance
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      // Log files
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log'
    }
  ]
};
```
- **What’s Happening**: This configuration file tells PM2 how to run and manage your application. It specifies the application name, the script to execute, and enables cluster mode to distribute the load across all CPU cores, significantly improving performance. Remember to replace `/path/to/chatgpt-clone-285` with the actual path.

### 7. Reverse Proxy with Nginx
Configure Nginx to serve your application to the public. It will direct traffic to your frontend for the main site and to your backend for API requests.

Create a new Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/chatgpt-clone
```
Paste the following configuration into the file. **Remember to replace `yourdomain.com` and `/path/to/chatgpt-clone-285`**.

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Serve the frontend application
    location / {
        root /path/to/chatgpt-clone-285/dist;
        try_files $uri $uri/ /index.html;

        # Security Headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    }

    # Forward API and tRPC requests to the backend server
    location ~ ^/(api|trpc) {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
- **What’s Happening**: Nginx acts as the public-facing entry point. It serves the static frontend files (HTML, CSS, JS) and intelligently forwards any requests starting with `/api` or `/trpc` to your backend Node.js server running on port 5000.

### 8. Enable SSL and Start Services
Activate the Nginx configuration, obtain an SSL certificate, and start the application with PM2.

```bash
# Enable the new Nginx site by creating a symbolic link
sudo ln -s /etc/nginx/sites-available/chatgpt-clone /etc/nginx/sites-enabled/

# Test the Nginx configuration for syntax errors
sudo nginx -t

# Reload Nginx to apply the changes
sudo systemctl reload nginx

# Obtain an SSL certificate from Let's Encrypt using Certbot
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Start the application using the PM2 ecosystem file
pm2 start ecosystem.config.js

# Save the PM2 process list so it restarts on server reboot
pm2 save

# Configure PM2 to start automatically on system startup
pm2 startup
```
- **What’s Happening**: The Nginx site is enabled. Certbot automatically handles the SSL certificate process, configuring Nginx for HTTPS. Finally, PM2 starts your backend server and ensures it will automatically run even after the server reboots.

---

## 🔄 Automated Deployment Script

To simplify future updates, create a `deploy.sh` script in the root of your project.

```bash
#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

echo "🚀 Starting deployment..."

# Pull the latest changes from the main branch
git pull origin main

echo "📦 Installing dependencies..."
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

echo "⚙️ Building applications..."
# Build the frontend and backend
npm run build
cd server
npm run build
cd ..

echo "🗄️ Applying database migrations..."
# Run database migrations
cd server
npx prisma migrate deploy
npx prisma generate
cd ..

echo "🔄 Restarting services..."
# Restart the server with PM2
pm2 restart chatgpt-clone-server

# Reload Nginx to apply any potential changes
sudo systemctl reload nginx

echo "✅ Deployment complete!"
```
Make the script executable: `chmod +x deploy.sh`. Now you can deploy updates by simply running `./deploy.sh`.

---

## 🔒 Security Best Practices

### Firewall Configuration
Use UFW (Uncomplicated Firewall) to secure your server by allowing only necessary traffic.

```bash
# Allow SSH (so you don't lock yourself out)
sudo ufw allow ssh

# Allow HTTP and HTTPS traffic through Nginx
sudo ufw allow 'Nginx Full'

# Explicitly deny direct access to the backend and database ports
sudo ufw deny 5000/tcp
sudo ufw deny 5432/tcp

# Enable the firewall
sudo ufw enable
```

### API Key Security
- **Client-Side Storage**: User-provided API keys (like OpenAI keys) should **never** be stored on the server or in the database. They should be managed exclusively on the client-side, using browser session storage for security.
- **Monitoring**: Regularly monitor for any signs of key exposure or abuse.

---

## 📊 Monitoring & Maintenance

### Health Checks and Logs
Regularly check the health and performance of your application.

```bash
# Monitor system resource usage (CPU, RAM)
htop

# Get a real-time dashboard of your PM2-managed applications
pm2 monit

# View the latest logs for your application
pm2 logs chatgpt-clone-server --lines 100

# Check the status of the Nginx service
sudo systemctl status nginx
```

### Backup Strategy
Protect your data by performing regular backups.

```bash
# Create a manual backup of the PostgreSQL database
pg_dump -U app_user -h localhost chatgpt_clone > backup_$(date +%Y%m%d_%H%M%S).sql

# Create a compressed archive of your entire application directory
tar -czf app_backup_$(date +%Y%m%d_%H%M%S).tar.gz /path/to/chatgpt-clone-285
```
It's highly recommended to automate this process using cron jobs.

---

## 🚨 Troubleshooting

### Common Issues & Solutions
1.  **Build Failures**:
    *   **Check Node.js version**: Run `node -v` to ensure it's v18+.
    *   **Clear npm cache**: `npm cache clean --force`.
    *   **Reinstall dependencies**: Delete `node_modules` and `package-lock.json`, then run `npm install`.

2.  **Database Connection Issues**:
    *   **Verify credentials**: Double-check the `DATABASE_URL` in your `.env` file.
    *   **Check service status**: Ensure PostgreSQL is running with `sudo systemctl status postgresql`.
    *   **Test connection**: `psql -U app_user -h localhost -d chatgpt_clone`.

3.  **Nginx 502 Bad Gateway Error**:
    *   **Check backend status**: Make sure your application is running in PM2 with `pm2 status`.
    *   **Verify proxy URL**: Ensure the `proxy_pass` address in your Nginx config is correct (e.g., `http://localhost:5000`).
    *   **Check firewall**: Make sure the firewall isn't blocking the connection between Nginx and your app.

---

## 📈 Scaling Considerations

### Horizontal Scaling (Handling More Users)
- **Load Balancing**: Use Nginx or a dedicated load balancer to distribute traffic across multiple instances of the application running on different servers.
- **Shared Session Store**: If you implement user sessions, use a centralized store like Redis to ensure session consistency across all instances.

### Vertical Scaling (Handling a Bigger Workload)
- **Increase Resources**: Upgrade your VPS with more CPU, RAM, or faster storage.
- **Database Optimization**: Add indexes to your database tables for frequently queried columns to speed up read operations.

---

## ✅ Final Go-Live Checklist
- [ ] Domain is configured and DNS has propagated.
- [ ] SSL certificate is installed and valid.
- [ ] Database migrations have run successfully.
- [ ] Production environment variables are set and verified.
- [ ] Firewall rules are configured and active.
- [ ] Automated backup and monitoring strategies are in place.
- [ ] All application features have been tested in the production environment.

---

**🎯 Production Ready**: By following this guide, your application will be deployed using best practices for security, performance, and reliability.

