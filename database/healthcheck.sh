#!/bin/bash
# Healthcheck script that also ensures columns exist

# First check if MySQL is ready
if ! mysqladmin ping -h"localhost" -uroot -p"$MYSQL_ROOT_PASSWORD" --silent; then
  exit 1
fi

# Function to check and add column if missing
ensure_column() {
  local column_name=$1
  local column_def=$2
  local after_column=$3
  
  local exists=$(mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -sse \
    "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA='$MYSQL_DATABASE' 
     AND TABLE_NAME='users' 
     AND COLUMN_NAME='$column_name';")
  
  if [ "$exists" -eq 0 ]; then
    mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e \
      "ALTER TABLE users ADD COLUMN $column_name $column_def AFTER $after_column;" 2>/dev/null || true
  fi
}

# Check if users table exists first
table_exists=$(mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -sse \
  "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
   WHERE TABLE_SCHEMA='$MYSQL_DATABASE' 
   AND TABLE_NAME='users';")

if [ "$table_exists" -eq 1 ]; then
  # Ensure all required columns exist
  ensure_column "bio" "TEXT" "avatar"
  ensure_column "status" "VARCHAR(20) DEFAULT 'offline'" "bio"
  ensure_column "lastSeen" "DATETIME" "status"
  ensure_column "isActive" "TINYINT(1) DEFAULT 1" "lastSeen"
fi

exit 0
