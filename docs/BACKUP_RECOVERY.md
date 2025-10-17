# Backup and Recovery Procedures

Comprehensive guide for backing up and recovering your e-commerce application data.

## Table of Contents

1. [What to Backup](#what-to-backup)
2. [Automated Backups](#automated-backups)
3. [Manual Backups](#manual-backups)
4. [Cloud Backup Solutions](#cloud-backup-solutions)
5. [Recovery Procedures](#recovery-procedures)
6. [Disaster Recovery Plan](#disaster-recovery-plan)
7. [Testing Backups](#testing-backups)

---

## What to Backup

### Critical Data

1. **MongoDB Database** (Priority: CRITICAL)
   - Products
   - Orders
   - Customers
   - Users (admin accounts)
   - Newsletter subscribers
   - Contact messages

2. **Environment Variables** (Priority: CRITICAL)
   - `.env` file (store securely, NEVER commit to git)
   - API keys and secrets
   - Database credentials

3. **Uploaded Images** (Priority: HIGH)
   - Product images (if stored locally)
   - Note: Cloudinary images are already backed up

4. **Application Code** (Priority: MEDIUM)
   - Already backed up in Git repository
   - Ensure all changes are committed and pushed

5. **Server Configuration** (Priority: MEDIUM)
   - Nginx configuration
   - SSL certificates
   - Docker compose files
   - Firewall rules

### What NOT to Backup

- `node_modules/` (can be reinstalled)
- `dist/` or `build/` (can be rebuilt)
- Log files (unless needed for debugging)
- Temporary files

---

## Automated Backups

### 1. MongoDB Automated Backup Script

Create `/scripts/backup-mongodb.sh`:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="$HOME/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30
LOG_FILE="$BACKUP_DIR/backup.log"

# MongoDB credentials (from .env or set here)
MONGO_URI="${MONGODB_URI:-mongodb://localhost:27017/ecommerce}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting MongoDB backup..."

# Backup using mongodump
mongodump \
    --uri="$MONGO_URI" \
    --gzip \
    --archive="$BACKUP_DIR/mongodb_backup_$DATE.gz" \
    2>&1 | tee -a "$LOG_FILE"

if [ $? -eq 0 ]; then
    log "✓ Backup completed successfully: mongodb_backup_$DATE.gz"

    # Get backup size
    SIZE=$(du -h "$BACKUP_DIR/mongodb_backup_$DATE.gz" | cut -f1)
    log "Backup size: $SIZE"
else
    log "✗ Backup failed!"
    exit 1
fi

# Clean up old backups
log "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "mongodb_backup_*.gz" -mtime +$RETENTION_DAYS -delete
log "Cleanup completed"

# Count remaining backups
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "mongodb_backup_*.gz" | wc -l)
log "Total backups: $BACKUP_COUNT"

log "Backup process finished"
```

**Make executable:**
```bash
chmod +x scripts/backup-mongodb.sh
```

**Test the script:**
```bash
./scripts/backup-mongodb.sh
```

### 2. Docker MongoDB Backup Script

If using Docker, create `/scripts/backup-mongodb-docker.sh`:

```bash
#!/bin/bash

BACKUP_DIR="$HOME/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="${MONGO_CONTAINER:-ecommerce-mongodb}"

mkdir -p "$BACKUP_DIR"

echo "Backing up MongoDB from Docker container..."

docker exec $CONTAINER_NAME mongodump \
    --uri="mongodb://admin:changeme@localhost:27017" \
    --gzip \
    --archive > "$BACKUP_DIR/mongodb_backup_$DATE.gz"

if [ $? -eq 0 ]; then
    echo "✓ Backup completed: mongodb_backup_$DATE.gz"
    SIZE=$(du -h "$BACKUP_DIR/mongodb_backup_$DATE.gz" | cut -f1)
    echo "Size: $SIZE"
else
    echo "✗ Backup failed!"
    exit 1
fi

# Clean up old backups (keep last 30 days)
find "$BACKUP_DIR" -name "mongodb_backup_*.gz" -mtime +30 -delete
```

### 3. Schedule Automated Backups

**Using Cron (Linux/macOS):**

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/scripts/backup-mongodb.sh

# Add weekly backup on Sundays at 3 AM
0 3 * * 0 /path/to/scripts/backup-mongodb.sh

# Add hourly backup during business hours (9 AM - 5 PM)
0 9-17 * * * /path/to/scripts/backup-mongodb.sh
```

**Using systemd timer (Linux):**

Create `/etc/systemd/system/mongodb-backup.service`:

```ini
[Unit]
Description=MongoDB Backup Service

[Service]
Type=oneshot
ExecStart=/path/to/scripts/backup-mongodb.sh
User=your-username
```

Create `/etc/systemd/system/mongodb-backup.timer`:

```ini
[Unit]
Description=MongoDB Backup Timer

[Timer]
OnCalendar=daily
OnCalendar=02:00
Persistent=true

[Install]
WantedBy=timers.target
```

**Enable the timer:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable mongodb-backup.timer
sudo systemctl start mongodb-backup.timer

# Check status
sudo systemctl status mongodb-backup.timer
```

---

## Manual Backups

### MongoDB Manual Backup

**Local MongoDB:**
```bash
# Backup to archive
mongodump --uri="mongodb://localhost:27017/ecommerce" \
    --gzip \
    --archive=backup.gz

# Backup to directory
mongodump --uri="mongodb://localhost:27017/ecommerce" \
    --out=./backup
```

**Docker MongoDB:**
```bash
# Backup to file
docker exec ecommerce-mongodb mongodump \
    --uri="mongodb://admin:changeme@localhost:27017" \
    --gzip \
    --archive > backup.gz

# Backup specific collection
docker exec ecommerce-mongodb mongodump \
    --uri="mongodb://admin:changeme@localhost:27017" \
    --db=ecommerce \
    --collection=orders \
    --gzip \
    --archive > orders_backup.gz
```

**MongoDB Atlas (Cloud):**
```bash
# Download backup via Atlas UI
# 1. Go to Atlas dashboard
# 2. Select your cluster
# 3. Click "Backups" tab
# 4. Click "Download" on desired snapshot

# Or use mongodump with Atlas connection string
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/ecommerce" \
    --gzip \
    --archive=atlas_backup.gz
```

### Environment Variables Backup

```bash
# Backup .env file (store securely!)
cp .env .env.backup.$(date +%Y%m%d)

# Encrypt backup
gpg --symmetric --cipher-algo AES256 .env.backup.$(date +%Y%m%d)

# Store encrypted file in secure location
# DELETE unencrypted backup!
rm .env.backup.$(date +%Y%m%d)
```

### Application Code Backup

```bash
# Ensure all changes are committed
git status
git add .
git commit -m "Backup before deployment"
git push origin main

# Create a tagged release
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0
```

---

## Cloud Backup Solutions

### 1. AWS S3 Backup

**Install AWS CLI:**
```bash
# macOS
brew install awscli

# Linux
sudo apt install awscli
```

**Configure AWS:**
```bash
aws configure
# Enter: Access Key, Secret Key, Region, Output format
```

**Backup script with S3:**

```bash
#!/bin/bash

BACKUP_DIR="/tmp/mongodb-backup"
DATE=$(date +%Y%m%d_%H%M%S)
S3_BUCKET="s3://your-backup-bucket/mongodb"

# Create backup
mongodump --uri="$MONGODB_URI" --gzip --archive="$BACKUP_DIR/backup_$DATE.gz"

# Upload to S3
aws s3 cp "$BACKUP_DIR/backup_$DATE.gz" "$S3_BUCKET/backup_$DATE.gz"

# Clean up local backup
rm "$BACKUP_DIR/backup_$DATE.gz"

# Set lifecycle policy to delete old backups after 90 days
```

### 2. Google Cloud Storage Backup

```bash
#!/bin/bash

BACKUP_DIR="/tmp/mongodb-backup"
DATE=$(date +%Y%m%d_%H%M%S)
GCS_BUCKET="gs://your-backup-bucket/mongodb"

# Create backup
mongodump --uri="$MONGODB_URI" --gzip --archive="$BACKUP_DIR/backup_$DATE.gz"

# Upload to GCS
gsutil cp "$BACKUP_DIR/backup_$DATE.gz" "$GCS_BUCKET/backup_$DATE.gz"

# Clean up
rm "$BACKUP_DIR/backup_$DATE.gz"
```

### 3. DigitalOcean Spaces Backup

```bash
#!/bin/bash

BACKUP_DIR="/tmp/mongodb-backup"
DATE=$(date +%Y%m%d_%H%M%S)
SPACES_BUCKET="your-space"
SPACES_REGION="nyc3"

# Create backup
mongodump --uri="$MONGODB_URI" --gzip --archive="$BACKUP_DIR/backup_$DATE.gz"

# Upload to Spaces (using s3cmd)
s3cmd put "$BACKUP_DIR/backup_$DATE.gz" \
    "s3://$SPACES_BUCKET/mongodb/backup_$DATE.gz" \
    --host="$SPACES_REGION.digitaloceanspaces.com" \
    --host-bucket="%(bucket)s.$SPACES_REGION.digitaloceanspaces.com"

# Clean up
rm "$BACKUP_DIR/backup_$DATE.gz"
```

### 4. MongoDB Atlas Automated Backups

**Enable in Atlas Dashboard:**
1. Go to your cluster
2. Click "Backup" tab
3. Enable "Continuous Backups" or "Cloud Backups"
4. Set retention policy (7, 30, 90 days, etc.)

**Snapshots are automatic and stored in Atlas infrastructure**

---

## Recovery Procedures

### Full Database Restore

**From local backup:**
```bash
# Restore from archive
mongorestore --uri="mongodb://localhost:27017/ecommerce" \
    --gzip \
    --archive=backup.gz \
    --drop

# Restore from directory
mongorestore --uri="mongodb://localhost:27017/ecommerce" \
    ./backup \
    --drop
```

**From Docker:**
```bash
# Restore to Docker container
docker exec -i ecommerce-mongodb mongorestore \
    --uri="mongodb://admin:changeme@localhost:27017" \
    --gzip \
    --archive \
    --drop < backup.gz
```

**From cloud backup:**
```bash
# Download from S3
aws s3 cp s3://your-bucket/backup.gz ./backup.gz

# Restore
mongorestore --uri="$MONGODB_URI" --gzip --archive=backup.gz --drop
```

### Partial Collection Restore

```bash
# Restore only 'products' collection
mongorestore --uri="mongodb://localhost:27017/ecommerce" \
    --gzip \
    --archive=backup.gz \
    --nsInclude="ecommerce.products" \
    --drop
```

### Point-in-Time Recovery (MongoDB Atlas)

1. Go to Atlas dashboard
2. Select cluster → Backups
3. Choose snapshot timestamp
4. Click "Restore"
5. Select restore target (same cluster, new cluster, or download)

### Environment Variables Recovery

```bash
# Decrypt backup
gpg .env.backup.20250115.gpg

# Restore to .env
cp .env.backup.20250115 .env

# Verify all variables are present
cat .env
```

### Application Recovery

```bash
# Clone repository
git clone https://github.com/your-username/your-repo.git
cd your-repo

# Checkout specific version
git checkout v1.0.0

# Install dependencies
npm install

# Restore environment variables
cp .env.backup .env

# Restore database
mongorestore --uri="$MONGODB_URI" --gzip --archive=backup.gz --drop

# Build application
npm run build

# Start application
node server.js
```

---

## Disaster Recovery Plan

### Scenario 1: Database Corruption

**Detection:**
- Application errors related to database
- MongoDB startup failures
- Data inconsistencies

**Recovery Steps:**
1. Stop application
2. Identify corrupt collections
3. Restore from most recent backup
4. Verify data integrity
5. Restart application
6. Test critical functions

**Time to Recover:** 15-30 minutes

### Scenario 2: Complete Server Failure

**Detection:**
- Server unreachable
- Hardware failure
- OS corruption

**Recovery Steps:**
1. Provision new server
2. Install dependencies (Node.js, MongoDB, Docker)
3. Clone application repository
4. Restore environment variables
5. Restore database from backup
6. Configure DNS/networking
7. Deploy application
8. Test functionality

**Time to Recover:** 2-4 hours

### Scenario 3: Accidental Data Deletion

**Detection:**
- Missing products/orders
- User reports
- Empty collections

**Recovery Steps:**
1. Identify time of deletion
2. Find backup before deletion
3. Export specific collection from backup
4. Import to production (without --drop flag)
5. Verify restored data
6. Notify affected users

**Time to Recover:** 30 minutes - 1 hour

### Scenario 4: Security Breach

**Detection:**
- Unauthorized access
- Modified/deleted data
- Compromised credentials

**Recovery Steps:**
1. IMMEDIATELY disconnect server from internet
2. Change ALL passwords and API keys
3. Analyze breach (logs, intrusion detection)
4. Restore database from backup BEFORE breach
5. Patch security vulnerabilities
6. Restore connection with new credentials
7. Monitor for suspicious activity
8. Notify affected users (GDPR/legal requirements)

**Time to Recover:** 4-8 hours

---

## Testing Backups

### Monthly Backup Test Procedure

**1. Download backup:**
```bash
cp ~/backups/mongodb/mongodb_backup_latest.gz ./test_restore.gz
```

**2. Create test database:**
```bash
# Restore to test database
mongorestore --uri="mongodb://localhost:27017/ecommerce_test" \
    --gzip \
    --archive=test_restore.gz
```

**3. Verify data:**
```bash
# Connect to test database
mongosh mongodb://localhost:27017/ecommerce_test

# Run verification queries
db.products.countDocuments()
db.orders.countDocuments()
db.users.countDocuments()

# Sample some records
db.products.find().limit(5)
```

**4. Test application with test database:**
```bash
# Temporarily change MONGODB_URI to test database
export MONGODB_URI="mongodb://localhost:27017/ecommerce_test"

# Start application
npm run dev

# Test critical paths:
# - Browse products
# - View order history
# - Admin login
```

**5. Document results:**
```markdown
## Backup Test - January 15, 2025

**Backup File:** mongodb_backup_20250115_020001.gz
**Backup Size:** 45 MB
**Restore Time:** 12 seconds
**Data Verified:** ✓ All collections present
**Application Test:** ✓ All features working

**Issues:** None
**Next Test Date:** February 15, 2025
```

**6. Clean up:**
```bash
# Drop test database
mongosh mongodb://localhost:27017/ecommerce_test --eval "db.dropDatabase()"

# Delete test backup
rm test_restore.gz
```

### Automated Backup Verification

Create `/scripts/verify-backup.sh`:

```bash
#!/bin/bash

LATEST_BACKUP=$(ls -t ~/backups/mongodb/*.gz | head -1)
TEST_DB="ecommerce_backup_test"

echo "Testing backup: $LATEST_BACKUP"

# Restore to test database
mongorestore --uri="mongodb://localhost:27017/$TEST_DB" \
    --gzip \
    --archive="$LATEST_BACKUP" \
    --drop \
    --quiet

# Verify collections exist
PRODUCTS=$(mongosh "mongodb://localhost:27017/$TEST_DB" \
    --quiet \
    --eval "db.products.countDocuments()")

ORDERS=$(mongosh "mongodb://localhost:27017/$TEST_DB" \
    --quiet \
    --eval "db.orders.countDocuments()")

# Clean up
mongosh "mongodb://localhost:27017/$TEST_DB" --quiet --eval "db.dropDatabase()"

if [ "$PRODUCTS" -gt 0 ] && [ "$ORDERS" -gt 0 ]; then
    echo "✓ Backup verification successful"
    echo "  Products: $PRODUCTS"
    echo "  Orders: $ORDERS"
    exit 0
else
    echo "✗ Backup verification failed!"
    exit 1
fi
```

---

## Best Practices

### Backup Strategy

✓ **3-2-1 Rule:**
- 3 copies of data
- 2 different storage types
- 1 offsite copy

✓ **Frequency:**
- Production: Daily (or more frequent)
- Staging: Weekly
- Development: Optional

✓ **Retention:**
- Daily backups: Keep 7 days
- Weekly backups: Keep 4 weeks
- Monthly backups: Keep 12 months

✓ **Testing:**
- Test restores monthly
- Document test results
- Update procedures as needed

✓ **Security:**
- Encrypt backups at rest
- Encrypt backups in transit
- Secure backup storage access
- Never commit `.env` to git

✓ **Monitoring:**
- Alert on backup failures
- Track backup sizes over time
- Monitor backup age

---

## Troubleshooting

### Backup Fails with "Connection Refused"

**Solution:**
```bash
# Check MongoDB is running
systemctl status mongod  # Linux
brew services list       # macOS with Homebrew

# Check connection
mongosh mongodb://localhost:27017
```

### Restore Fails with "Duplicate Key Error"

**Solution:**
```bash
# Use --drop flag to replace existing data
mongorestore --uri="$MONGODB_URI" --gzip --archive=backup.gz --drop
```

### Backup Size Too Large

**Solutions:**
1. Compress backups (use --gzip)
2. Exclude unnecessary collections
3. Clean up old data
4. Use incremental backups (Atlas)

### Out of Disk Space

**Solutions:**
```bash
# Check disk usage
df -h

# Find large backups
du -sh ~/backups/*

# Clean old backups
find ~/backups -mtime +30 -delete
```

---

## Emergency Contacts

**In case of data loss:**
1. Database Administrator: [contact info]
2. System Administrator: [contact info]
3. MongoDB Atlas Support: https://support.mongodb.com
4. Hosting Provider Support: [provider support]

---

**Last Updated:** January 2025
**Next Review:** February 2025
