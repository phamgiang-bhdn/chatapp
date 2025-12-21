#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Starting Chat Application with Docker...');
console.log('');

try {
  execSync('docker info', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ Docker is not running. Please start Docker Desktop first.');
  process.exit(1);
}

console.log('📦 Building Docker images...');
try {
  execSync('docker-compose build', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to build Docker images');
  process.exit(1);
}

console.log('');
console.log('🔄 Starting all services...');
try {
  execSync('docker-compose up -d', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to start services');
  process.exit(1);
}

console.log('');
console.log('⏳ Waiting for services to be ready...');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  await wait(10000);
  
  console.log('');
  console.log('✅ Services are starting up!');
  console.log('');
  console.log('📊 Service Status:');
  try {
    execSync('docker-compose ps', { stdio: 'inherit' });
  } catch (error) {
  }
  
  console.log('');
  console.log('🌐 Application URLs:');
  console.log('   Frontend:     http://localhost:9000');
  console.log('   API Gateway:  http://localhost:8000');
  console.log('   MySQL:        localhost:3307');
  console.log('');
  console.log('📝 Useful commands:');
  console.log('   View logs:    npm run logs');
  console.log('   Stop all:     npm run stop');
  console.log('   Restart:      npm run restart');
  console.log('   Seed DB:      npm run seed');
  console.log('');
  console.log('✨ Happy chatting!');
  console.log('');
})();
