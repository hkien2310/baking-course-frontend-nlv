#!/bin/bash
# Backup script for Muka Baking Database

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="../backups"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "Starting database backup..."
pg_dump -U postgres muka_baking_db > $BACKUP_DIR/backup_$TIMESTAMP.sql

if [ $? -eq 0 ]; then
    echo "Backup successful: $BACKUP_DIR/backup_$TIMESTAMP.sql"
else
    echo "Backup failed!"
fi
