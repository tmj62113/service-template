# Docker Deployment Guide

This guide explains how to run the E-Commerce Template using Docker and Docker Compose.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Variables](#environment-variables)
4. [Development vs Production](#development-vs-production)
5. [Docker Commands](#docker-commands)
6. [Troubleshooting](#troubleshooting)
7. [Production Deployment](#production-deployment)

---

## Prerequisites

### Install Docker

1. **Docker Desktop** (Mac/Windows):
   - Download from [docker.com](https://www.docker.com/products/docker-desktop)
   - Install and start Docker Desktop

2. **Docker Engine** (Linux):
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh

   # Start Docker
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

3. **Verify Installation**:
   ```bash
   docker --version
   docker-compose --version
   ```

---

## Quick Start

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and set your environment variables (see [Environment Variables](#environment-variables) section).

### 2. Start All Services

```bash
docker-compose up -d
```

This command:
- Builds the application image
- Starts MongoDB
- Starts the application server
- Creates persistent volumes for data

### 3. Check Status

```bash
docker-compose ps
```

You should see:
```
NAME                   STATUS              PORTS
ecommerce-app          Up                  0.0.0.0:3001->3001/tcp
ecommerce-mongodb      Up                  0.0.0.0:27017->27017/tcp
```

### 4. Access the Application

Open your browser to:
- **Application**: http://localhost:3001
- **API**: http://localhost:3001/api
- **Admin**: http://localhost:3001/admin

### 5. View Logs

```bash
# All services
docker-compose logs -f

# Just the app
docker-compose logs -f app

# Just MongoDB
docker-compose logs -f mongodb
```

### 6. Stop Services

```bash
# Stop but keep data
docker-compose stop

# Stop and remove containers (keeps data volumes)
docker-compose down

# Stop and remove everything including data
docker-compose down -v
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# MongoDB Configuration
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=secure_password_here
MONGO_DB_NAME=ecommerce
MONGO_PORT=27017

# Application
APP_PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:3001

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Stripe Payment
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary Image Upload
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Resend Email Service
RESEND_API_KEY=re_...
CONTACT_EMAIL=contact@yourdomain.com

# Shippo Shipping (Optional)
SHIPPO_API_KEY=shippo_live_...

# Sentry Error Tracking (Optional)
SENTRY_DSN=https://...@sentry.io/...

# Mongo Express (Optional - Database Admin UI)
MONGO_EXPRESS_USER=admin
MONGO_EXPRESS_PASSWORD=changeme
```

**IMPORTANT**: Never commit `.env` file to git! It's already in `.gitignore`.

---

## Development vs Production

### Development Mode

For local development with hot reload:

```bash
# Don't use Docker for development
npm install
npm run dev  # Frontend (port 5173)
node server.js  # Backend (port 3001)
```

**Why?** Docker is optimized for production. Development is faster without it.

### Production Mode

Use Docker for:
- Staging environments
- Production deployments
- Testing production builds locally

```bash
docker-compose up -d
```

---

## Docker Commands

### Building

```bash
# Build or rebuild services
docker-compose build

# Build without cache (fresh build)
docker-compose build --no-cache

# Build specific service
docker-compose build app
```

### Running

```bash
# Start services in background
docker-compose up -d

# Start and view logs
docker-compose up

# Start specific service
docker-compose up -d mongodb
```

### Stopping

```bash
# Stop services (keep data)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (DELETES DATA!)
docker-compose down -v

# Stop specific service
docker-compose stop app
```

### Logs

```bash
# View all logs
docker-compose logs

# Follow logs (live)
docker-compose logs -f

# Logs for specific service
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100
```

### Executing Commands

```bash
# Run command in app container
docker-compose exec app sh

# Run npm command
docker-compose exec app npm run test

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p changeme

# Seed database
docker-compose exec app node scripts/seed-database.js
```

### Database Management

```bash
# Backup database
docker-compose exec mongodb mongodump --uri="mongodb://admin:changeme@localhost:27017" --archive > backup.archive

# Restore database
docker-compose exec -T mongodb mongorestore --uri="mongodb://admin:changeme@localhost:27017" --archive < backup.archive

# Access database shell
docker-compose exec mongodb mongosh -u admin -p changeme --authenticationDatabase admin
```

### Cleaning Up

```bash
# Remove stopped containers
docker-compose rm

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Nuclear option: remove everything
docker system prune -a --volumes
```

---

## Troubleshooting

### Port Already in Use

**Error**: `Bind for 0.0.0.0:3001 failed: port is already allocated`

**Solution**:
```bash
# Find what's using the port
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or change port in .env
APP_PORT=3002
```

### MongoDB Connection Failed

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions**:
1. Check MongoDB is running:
   ```bash
   docker-compose ps mongodb
   ```

2. Check MongoDB logs:
   ```bash
   docker-compose logs mongodb
   ```

3. Verify MongoDB credentials in `.env`

4. Restart MongoDB:
   ```bash
   docker-compose restart mongodb
   ```

### Application Won't Start

**Check health**:
```bash
docker-compose ps
```

**View logs**:
```bash
docker-compose logs app
```

**Common issues**:
1. Missing environment variables
2. MongoDB not ready (wait 30 seconds)
3. Port conflict

**Solution**:
```bash
# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Cannot Build Image

**Error**: `failed to solve with frontend dockerfile.v0`

**Solution**:
```bash
# Check Dockerfile syntax
cat Dockerfile

# Try building directly
docker build -t ecommerce-app .

# Check Docker daemon is running
docker info
```

### Data Persists After `docker-compose down`

This is **intentional**! Docker volumes persist data.

**To remove data**:
```bash
docker-compose down -v
```

**To list volumes**:
```bash
docker volume ls
```

**To remove specific volume**:
```bash
docker volume rm ecommerce-template_mongodb_data
```

---

## Production Deployment

### 1. Security Checklist

- [ ] Change default MongoDB passwords
- [ ] Generate strong JWT secret
- [ ] Use production API keys (Stripe, Cloudinary, etc.)
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS with your production domain
- [ ] Enable HTTPS (see below)
- [ ] Set up Sentry error tracking
- [ ] Configure automated backups

### 2. HTTPS with Nginx

Use a reverse proxy for HTTPS:

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

  app:
    # ... existing app config
    expose:
      - "3001"  # Don't expose publicly
```

**nginx.conf**:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
        proxy_pass http://app:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Resource Limits

Add resource limits to `docker-compose.yml`:

```yaml
services:
  app:
    # ... existing config
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  mongodb:
    # ... existing config
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 1G
```

### 4. Health Checks

Health checks are already configured in `docker-compose.yml`:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
  interval: 30s
  timeout: 3s
  retries: 3
  start_period: 40s
```

Monitor health:
```bash
docker-compose ps
# Look for "healthy" status
```

### 5. Automated Backups

Create a backup script `backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"

mkdir -p $BACKUP_DIR

# Backup MongoDB
docker-compose exec -T mongodb mongodump \
  --uri="mongodb://admin:changeme@localhost:27017" \
  --archive > $BACKUP_DIR/mongodb_$DATE.archive

# Keep only last 7 days of backups
find $BACKUP_DIR -name "mongodb_*.archive" -mtime +7 -delete

echo "Backup completed: mongodb_$DATE.archive"
```

**Make executable**:
```bash
chmod +x backup.sh
```

**Automate with cron**:
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup.sh
```

### 6. Monitoring

**View resource usage**:
```bash
docker stats
```

**View container health**:
```bash
docker-compose ps
```

**Set up Sentry** (see `SENTRY_SETUP.md`)

### 7. Deployment Platforms

#### Docker Hub

```bash
# Tag image
docker tag ecommerce-app username/ecommerce-app:latest

# Push to Docker Hub
docker login
docker push username/ecommerce-app:latest
```

#### AWS ECS / Google Cloud Run / Azure Container Instances

Follow platform-specific guides for deploying Docker Compose applications.

---

## Advanced Configuration

### Multi-Stage Optimization

The `Dockerfile` uses multi-stage builds to:
1. Build frontend in one stage
2. Copy only production files to final image
3. Reduce image size by 60%

### Mongo Express (Database UI)

Uncomment in `docker-compose.yml` to enable web-based MongoDB admin:

```yaml
mongo-express:
  image: mongo-express:latest
  # ... (see docker-compose.yml for full config)
```

Access at: http://localhost:8081

**Login**:
- Username: `admin` (or `MONGO_EXPRESS_USER` from `.env`)
- Password: `changeme` (or `MONGO_EXPRESS_PASSWORD` from `.env`)

### Volume Mounts for Development

For live code updates without rebuilds:

```yaml
app:
  # ... existing config
  volumes:
    - ./server.js:/app/server.js
    - ./db:/app/db
    - ./utils:/app/utils
    - ./middleware:/app/middleware
```

**Note**: Not recommended for production.

---

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Restart services: `docker-compose restart`
4. Rebuild: `docker-compose build --no-cache`
5. Check [Troubleshooting](#troubleshooting) section

---

**Last Updated**: January 2025
