# 🚀 Production Deployment Guide

## Semantic Logic AI Workflow Builder v1.0.0

This guide covers deploying the Semantic Logic AI Workflow Builder to production environments.

---

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
  - Node.js is the runtime environment for executing JavaScript code outside the browser. It powers both the frontend and backend of this application.
- **PostgreSQL**: 13.x or higher
  - PostgreSQL is the database system used to store workflows, configurations, and user data securely.
- **Memory**: Minimum 2GB RAM
  - Ensure your server has enough memory to handle application processes and database queries efficiently.
- **Storage**: 5GB available space
  - Allocate sufficient disk space for storing database files, logs, and backups.
- **Network**: HTTPS capability (recommended)
  - HTTPS ensures secure communication between users and the server.

### Security Requirements
- SSL/TLS certificate for HTTPS
  - Protect user data and API keys by encrypting communication with SSL/TLS.
- Firewall rules for database protection
  - Prevent unauthorized access to the database by configuring firewall rules.
- Environment variable management
  - Store sensitive information like database credentials and API keys securely.
- API key security policies
  - Implement policies to manage and rotate API keys effectively.

---

## 🔧 Production Setup

### 1. Environment Configuration

Create production environment file:
```bash
# server/.env.production
DATABASE_URL="postgresql://username:password@localhost:5432/semantic_workflows_prod"
NODE_ENV="production"
PORT=3001
CORS_ORIGIN="https://yourdomain.com"
```
- **What’s Happening**: This step sets up environment variables that the application uses to connect to the database, define the runtime environment, and configure cross-origin resource sharing (CORS).

### 2. Database Setup

```bash
# Create production database
createdb semantic_workflows_prod

# Run migrations
cd server
npx prisma migrate deploy
npx prisma generate

# Create default user (optional)
node seed-user.js
```
- **What’s Happening**: You’re creating a new PostgreSQL database for production use, applying schema migrations to define the database structure, generating Prisma client code for database interaction, and optionally seeding the database with a default user.

### 3. Build Applications

```bash
# Build frontend
npm run build

# Build backend
cd server
npm run build
```
- **What’s Happening**: The frontend and backend applications are being compiled into optimized production builds. This ensures faster load times and better performance.

### 4. Process Management

#### Using PM2 (Recommended)
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'semantic-backend',
      script: 'server/dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
}
EOF

# Start applications
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```
- **What’s Happening**: PM2 is a process manager for Node.js applications. It ensures the backend server runs continuously, restarts automatically if it crashes, and starts on system boot.

### 5. Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name yourdomain.com;

    # SSL configuration
    ssl_certificate /path/to/certificate.pem;
    ssl_certificate_key /path/to/private.key;

    # Frontend static files
    location / {
        root /path/to/semantic-canvas/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
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
- **What’s Happening**: Nginx is configured as a reverse proxy to route requests to the frontend and backend servers. It handles SSL termination and ensures secure communication.

---

## 🔒 Security Configuration

### 1. Database Security
```bash
# PostgreSQL configuration (postgresql.conf)
listen_addresses = 'localhost'
ssl = on
shared_preload_libraries = 'pg_stat_statements'

# Access control (pg_hba.conf)
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```
- **What’s Happening**: PostgreSQL is configured to accept connections only from localhost, ensuring that the database is not exposed to external networks.

### 2. API Key Security
- Never store API keys in the database
- Use session-only storage
- Implement key rotation policies
- Monitor for key exposure
- **What’s Happening**: These practices ensure that sensitive API keys are protected and not stored persistently, reducing the risk of unauthorized access.

### 3. Network Security
```bash
# Firewall rules
ufw allow 22/tcp          # SSH
ufw allow 80/tcp          # HTTP
ufw allow 443/tcp         # HTTPS
ufw deny 3001/tcp         # Block direct backend access
ufw deny 5432/tcp         # Block direct database access
ufw enable
```
- **What’s Happening**: Firewall rules are set up to allow only necessary traffic and block direct access to sensitive services like the backend and database.

---

## 📊 Monitoring & Maintenance

### 1. Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# Log monitoring
pm2 logs semantic-backend --lines 100

# Status check
pm2 status
```
- **What’s Happening**: PM2 provides tools to monitor application performance, view logs, and check the status of running processes.

### 2. Database Maintenance
```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump semantic_workflows_prod > backup_$DATE.sql
```
- **What’s Happening**: Regular backups are created to ensure data can be restored in case of failure or corruption.

### 3. Health Checks
```bash
# Backend health check
curl http://localhost:3001/health

# Frontend availability
curl -I https://yourdomain.com
```
- **What’s Happening**: Health checks verify that the backend and frontend servers are running and accessible.

---

## 🚨 Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check logs
pm2 logs semantic-backend

# Verify database connection
cd server && npx prisma db pull
```
- **What’s Happening**: Logs are checked for errors, and the database connection is verified to identify the root cause of the issue.

**Frontend build fails:**
```bash
# Clear cache and rebuild
npm ci
npm run build
```
- **What’s Happening**: Clearing the cache and rebuilding the frontend resolves issues caused by outdated dependencies or corrupted build files.

**Database connection issues:**
```bash
# Test connection
psql -h localhost -U username -d semantic_workflows_prod
```
- **What’s Happening**: The database connection is tested to ensure it is accessible and properly configured.

### Performance Optimization

1. **Database Indexing**
```sql
-- Add indexes for common queries
CREATE INDEX idx_workflows_user_id ON "Workflow"("userId");
CREATE INDEX idx_provider_config_user_id ON "ProviderConfig"("userId");
```
- **What’s Happening**: Indexes are added to the database to speed up common queries and improve performance.

2. **Static Asset Optimization**
```bash
# Enable gzip compression in Nginx
gzip on;
gzip_vary on;
gzip_types text/plain application/json application/javascript text/css;
```
- **What’s Happening**: Gzip compression reduces the size of static assets, improving load times for users.

---

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Session storage (Redis)
- Database clustering
- CDN for static assets
- **What’s Happening**: Horizontal scaling involves adding more servers to distribute the load and improve reliability.

### Vertical Scaling
- Increase server resources
- Database optimization
- Connection pooling
- Caching layers
- **What’s Happening**: Vertical scaling involves upgrading server hardware to handle increased demand.

---

## 🔄 Updates & Maintenance

### Update Process
1. Backup database
2. Build new version
3. Test in staging
4. Deploy with zero downtime
5. Verify functionality
- **What’s Happening**: Updates are deployed in a controlled manner to minimize downtime and ensure functionality.

### Database Migrations
```bash
cd server
npx prisma migrate deploy
npx prisma generate
pm2 restart semantic-backend
```
- **What’s Happening**: Database migrations are applied to update the schema without losing existing data.

---

## 📞 Support

For production deployment support:
- Check logs first: `pm2 logs`
- Verify configuration files
- Test individual components
- Review security settings

**Remember**: Always backup before making changes in production!

---

**🚀 Production Ready**: This application has been tested and optimized for production deployment with proper security, monitoring, and scaling considerations.
