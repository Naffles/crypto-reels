#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎰 Setting up CryptoReels development environment...\n');

// Function to run commands with proper error handling
function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });
    console.log('✅ Success\n');
  } catch (error) {
    console.error(`❌ Failed to run: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Function to copy environment files
function setupEnvironmentFiles() {
  console.log('📝 Setting up environment files...');
  
  const envFiles = [
    { src: 'backend/.env.example', dest: 'backend/.env' },
    { src: 'frontend/.env.local.example', dest: 'frontend/.env.local' }
  ];
  
  envFiles.forEach(({ src, dest }) => {
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
      console.log(`✅ Created ${dest}`);
    } else {
      console.log(`⚠️  ${dest} already exists, skipping`);
    }
  });
  
  console.log('');
}

// Main installation process
async function install() {
  try {
    // Install root dependencies
    console.log('📦 Installing root dependencies...');
    runCommand('npm install');
    
    // Install backend dependencies
    console.log('📦 Installing backend dependencies...');
    runCommand('npm install', path.join(process.cwd(), 'backend'));
    
    // Install frontend dependencies
    console.log('📦 Installing frontend dependencies...');
    runCommand('npm install', path.join(process.cwd(), 'frontend'));
    
    // Setup environment files
    setupEnvironmentFiles();
    
    // Create logs directory for backend
    const logsDir = path.join(process.cwd(), 'backend', 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
      console.log('✅ Created backend/logs directory');
    }
    
    console.log('🎉 CryptoReels setup complete!\n');
    console.log('🚀 To start development:');
    console.log('   npm run dev\n');
    console.log('🐳 To start with Docker:');
    console.log('   docker-compose -f docker-compose.development.yml up\n');
    console.log('🧪 To test iframe embedding:');
    console.log('   Open test-iframe.html in your browser after starting the servers\n');
    console.log('📚 Backend API: http://localhost:3003');
    console.log('🎮 Frontend: http://localhost:3002');
    console.log('🔗 Test iframe: file:///' + path.join(process.cwd(), 'test-iframe.html'));
    
  } catch (error) {
    console.error('❌ Installation failed:', error.message);
    process.exit(1);
  }
}

// Run installation
install();