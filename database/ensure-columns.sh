#!/bin/bash
# MySQL initialization script - ensures all columns exist
# This runs every time the container starts

echo "🔧 Checking and fixing users table structure..."

# Wait for MySQL to be ready
until mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "SELECT 1" &> /dev/null; do
  echo "⏳ Waiting for MySQL to be ready..."
  sleep 2
done

# Function to check if column exists
column_exists() {
  local column_name=$1
  mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -sse "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='$MYSQL_DATABASE' AND TABLE_NAME='users' AND COLUMN_NAME='$column_name';"
}

# Check and add bio column
if [ "$(column_exists 'bio')" -eq 0 ]; then
  echo "➕ Adding 'bio' column..."
  mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "ALTER TABLE users ADD COLUMN bio TEXT AFTER avatar;"
else
  echo "✅ Column 'bio' exists"
fi

# Check and add status column
if [ "$(column_exists 'status')" -eq 0 ]; then
  echo "➕ Adding 'status' column..."
  mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'offline' AFTER bio;"
else
  echo "✅ Column 'status' exists"
fi

# Check and add lastSeen column
if [ "$(column_exists 'lastSeen')" -eq 0 ]; then
  echo "➕ Adding 'lastSeen' column..."
  mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "ALTER TABLE users ADD COLUMN lastSeen DATETIME AFTER status;"
else
  echo "✅ Column 'lastSeen' exists"
fi

# Check and add isActive column
if [ "$(column_exists 'isActive')" -eq 0 ]; then
  echo "➕ Adding 'isActive' column..."
  mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "ALTER TABLE users ADD COLUMN isActive TINYINT(1) DEFAULT 1 AFTER lastSeen;"
else
  echo "✅ Column 'isActive' exists"
fi

echo "✨ Users table structure check complete!"
