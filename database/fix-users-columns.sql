
USE chat_app;

SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'chat_app' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'bio';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE users ADD COLUMN bio TEXT AFTER avatar;',
  'SELECT "bio column already exists" AS message;');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'chat_app' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'status';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT "offline" AFTER bio;',
  'SELECT "status column already exists" AS message;');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'chat_app' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'lastSeen';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE users ADD COLUMN lastSeen DATETIME AFTER status;',
  'SELECT "lastSeen column already exists" AS message;');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Users table structure updated successfully!' AS result;
