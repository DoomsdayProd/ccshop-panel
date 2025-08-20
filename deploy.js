#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting deployment process...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Please run this script from the web directory.');
  process.exit(1);
}

try {
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Build the application
  console.log('🔨 Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Check if build was successful
  if (fs.existsSync('dist')) {
    console.log('✅ Build completed successfully!');
    console.log('\n📁 Your built application is in the "dist" folder');
    console.log('\n🌐 To host your application:');
    console.log('   1. Upload the contents of the "dist" folder to your web server');
    console.log('   2. Configure your web server to serve the index.html file');
    console.log('   3. Set up environment variables for database and bot configuration');
    console.log('\n🔧 For local development, run: npm run dev');
  } else {
    console.log('⚠️  Build completed, but dist folder not found');
  }
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
