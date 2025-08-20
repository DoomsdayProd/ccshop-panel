#!/usr/bin/env node

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = process.env.PORT || 3000;

// MIME types for common file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  
  // Remove query parameters
  filePath = filePath.split('?')[0];
  
  // Security: prevent directory traversal
  if (filePath.includes('..')) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  // Try to serve from client build first
  let fullPath = join(__dirname, 'build/client', filePath);
  
  // If file doesn't exist, try serving index.html for SPA routing
  if (!existsSync(fullPath)) {
    if (extname(filePath) === '') {
      fullPath = join(__dirname, 'build/client/index.html');
    } else {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
  }
  
  try {
    const content = readFileSync(fullPath);
    const ext = extname(fullPath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (error) {
    console.error('Error serving file:', error);
    res.writeHead(500);
    res.end('Internal server error');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Static server running on http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${join(__dirname, 'build/client')}`);
  console.log(`🌐 Open your browser and navigate to: http://localhost:${PORT}`);
  console.log(`\n💡 To host this application:`);
  console.log(`   1. Upload the contents of the 'build/client' folder to your web server`);
  console.log(`   2. Configure your server to serve index.html for all routes (SPA routing)`);
  console.log(`   3. Set up environment variables for your database and bot configuration`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
