#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const force = args.includes('--force');

console.log('========================================');
console.log('   Database Seeder Script');
console.log('========================================');
console.log('');

if (!force) {
  console.log('This script will:');
  console.log('  1. Delete all existing seed data');
  console.log('  2. Run seeders to populate database');
  console.log('');
  console.log('WARNING: This will DELETE all data in tables:');
  console.log('  - users');
  console.log('  - conversations');
  console.log('  - conversation_participants');
  console.log('  - messages');
  console.log('  - user_follows');
  console.log('  - notifications');
  console.log('');
  console.log('Use --force flag to skip confirmation');
  console.log('');
}

try {
  execSync('docker ps --filter name=chat-mysql --format "{{.Names}}"', { stdio: 'pipe' });
} catch (error) {
  console.error('ERROR: MySQL container is not running!');
  console.error('Please start the application first with: npm start');
  process.exit(1);
}
const containerCheck = execSync('docker ps -a --filter name=chat-mysql --format "{{.Names}}"', { encoding: 'utf-8' });
if (!containerCheck.trim()) {
  console.error('ERROR: MySQL container not found!');
  console.error('Please start the application first with: npm start');
  process.exit(1);
}

if (!force) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Are you sure? (yes/no): ', (answer) => {
    rl.close();
    if (answer.toLowerCase() !== 'yes') {
      console.log('Operation cancelled.');
      process.exit(0);
    }
    runSeed();
  });
} else {
  runSeed();
}

function runSeed() {
  console.log('Checking Docker container...');
  
  try {
    const containerStatus = execSync('docker ps --filter name=chat-mysql --format "{{.Status}}"', { encoding: 'utf-8' });
    if (!containerStatus.trim()) {
      console.error('ERROR: MySQL container is not running!');
      console.error('Please start the application first with: npm start');
      process.exit(1);
    }
    console.log('✓ MySQL container is running');
  } catch (error) {
    console.error('ERROR: Could not check container status');
    process.exit(1);
  }

  console.log('');
  console.log('Step 1: Clearing existing data...');
  
  try {
    execSync(
      'docker exec -i chat-mysql mysql -uroot -proot_password_123 chat_app -e "SET FOREIGN_KEY_CHECKS = 0; TRUNCATE TABLE notifications; TRUNCATE TABLE messages; TRUNCATE TABLE conversation_participants; TRUNCATE TABLE conversations; TRUNCATE TABLE user_follows; TRUNCATE TABLE users; SET FOREIGN_KEY_CHECKS = 1;"',
      { stdio: 'inherit' }
    );
  } catch (error) {
    console.log('WARNING: Could not truncate tables. Trying DELETE...');
    try {
      execSync(
        'docker exec -i chat-mysql mysql -uroot -proot_password_123 chat_app -e "DELETE FROM notifications; DELETE FROM messages; DELETE FROM conversation_participants; DELETE FROM conversations; DELETE FROM user_follows; DELETE FROM users;"',
        { stdio: 'inherit' }
      );
    } catch (deleteError) {
      console.error('ERROR: Could not clear database tables');
      process.exit(1);
    }
  }

  console.log('');
  console.log('Step 2: Running seeders...');
  console.log('');

  const databasePath = path.join(__dirname, '..', 'database');
  
  if (!fs.existsSync(path.join(databasePath, 'node_modules'))) {
    console.log('Installing dependencies...');
    try {
      execSync('npm install', { cwd: databasePath, stdio: 'inherit' });
    } catch (error) {
      console.error('ERROR: Failed to install dependencies!');
      process.exit(1);
    }
  }

  try {
    execSync('npm run seed', { 
      cwd: databasePath, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });
  } catch (error) {
    console.error('');
    console.error('ERROR: Seeding failed!');
    process.exit(1);
  }

  console.log('');
  console.log('========================================');
  console.log('   Seeding completed successfully!');
  console.log('========================================');
  console.log('');
  console.log('Test accounts (password: 12345678):');
  console.log('  - user01 / user01@example.com (Nguyễn Văn An)');
  console.log('  - user02 / user02@example.com (Trần Thị Bình)');
  console.log('  - user03 / user03@example.com (Lê Văn Cường)');
  console.log('  - user04 / user04@example.com (Phạm Thị Dung)');
  console.log('  - user05 / user05@example.com (Hoàng Văn Đức)');
  console.log('  - user06 / user06@example.com (Vũ Thị Em)');
  console.log('  - user07 / user07@example.com (Đỗ Văn Phong)');
  console.log('  - user08 / user08@example.com (Bùi Thị Giang)');
  console.log('');
}
