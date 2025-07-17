#!/bin/bash

# Quick VPS Deployment Script
# This script automates the basic deployment process

set -e

echo "🚀 ChatGPT Clone VPS Deployment Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    print_error "This script should not be run as root"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version must be 18 or higher. Current version: $(node --version)"
fi

print_status "Node.js version check passed"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "server/package.json" ]; then
    print_error "Please run this script from the project root directory"
fi

print_status "Project structure verified"

# Run repository verification
echo -e "\n🔍 Running repository verification..."
if ! ./verify-repo.sh; then
    print_error "Repository verification failed. Please fix the issues before deploying."
fi

print_status "Repository verification passed"

# Install dependencies
echo -e "\n📦 Installing dependencies..."
npm install
print_status "Frontend dependencies installed"

cd server
npm install
print_status "Backend dependencies installed"
cd ..

# Build applications
echo -e "\n🔨 Building applications..."
npm run build
print_status "Frontend built successfully"

cd server
npm run build
print_status "Backend built successfully"
cd ..

# Check for environment file
if [ ! -f "server/.env" ]; then
    print_warning "No .env file found in server directory"
    echo "Please create server/.env with your configuration:"
    echo "DATABASE_URL=\"postgresql://username:password@localhost:5432/dbname\""
    echo "PORT=5000"
    echo "NODE_ENV=production"
    echo ""
    read -p "Press Enter to continue when you've created the .env file..."
fi

# Database setup
echo -e "\n🗄️  Setting up database..."
cd server
if ! npx prisma migrate deploy; then
    print_error "Database migration failed. Please check your DATABASE_URL and database connectivity."
fi
print_status "Database migrations completed"

if ! npx prisma generate; then
    print_error "Prisma client generation failed"
fi
print_status "Prisma client generated"
cd ..

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "\n📋 Installing PM2..."
    sudo npm install -g pm2
    print_status "PM2 installed"
fi

# Create PM2 ecosystem file
echo -e "\n⚙️  Creating PM2 configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'chatgpt-clone-server',
      script: 'dist/index.js',
      cwd: './server',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};
EOF

print_status "PM2 configuration created"

# Create logs directory
mkdir -p server/logs

# Start application with PM2
echo -e "\n🚀 Starting application..."
pm2 start ecosystem.config.js
print_status "Application started with PM2"

# Save PM2 configuration
pm2 save
print_status "PM2 configuration saved"

# Show status
echo -e "\n📊 Application Status:"
pm2 status

echo -e "\n🎉 Deployment Complete!"
echo "================================"
echo "✅ Frontend built and ready"
echo "✅ Backend running on port 5000"
echo "✅ Database migrations applied"
echo "✅ PM2 process manager configured"
echo ""
echo "Next steps:"
echo "1. Configure Nginx reverse proxy"
echo "2. Set up SSL certificate"
echo "3. Configure firewall"
echo "4. Test your application"
echo ""
echo "Useful commands:"
echo "- View logs: pm2 logs chatgpt-clone-server"
echo "- Restart app: pm2 restart chatgpt-clone-server"
echo "- Stop app: pm2 stop chatgpt-clone-server"
echo "- Monitor: pm2 monit"
echo ""
echo "Frontend files are in: ./dist"
echo "Backend is running on: http://localhost:5000"
echo ""
print_status "Deployment script completed successfully!"
