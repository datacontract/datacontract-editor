#!/usr/bin/env node

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir = join(__dirname, '..', 'dist');

// Read package.json for version
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

// MIME types for static files
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.yaml': 'text/yaml',
  '.yml': 'text/yaml'
};

// Check if dist directory exists
if (!existsSync(distDir)) {
  console.error('Error: dist/ directory not found.');
  console.error('Please run "npm run build" first.');
  process.exit(1);
}

// Check if index.html exists
const indexPath = join(distDir, 'index.html');
if (!existsSync(indexPath)) {
  console.error('Error: dist/index.html not found.');
  console.error('Please run "npm run build" first.');
  process.exit(1);
}

// Find available port
async function findPort(start = 9090) {
  const net = await import('net');

  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(start, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      resolve(findPort(start + 1));
    });
  });
}

// Create HTTP server
const server = createServer((req, res) => {
  let url = req.url.split('?')[0]; // Remove query string

  // Default to index.html for root
  if (url === '/') {
    url = '/index.html';
  }

  let filePath = join(distDir, url);
  const ext = extname(filePath).toLowerCase();

  // If no extension, serve index.html (SPA routing)
  if (!ext && !existsSync(filePath)) {
    filePath = indexPath;
  }

  // Try to serve the file
  if (existsSync(filePath)) {
    try {
      const content = readFileSync(filePath);
      const contentType = mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch (err) {
      res.writeHead(500);
      res.end('Server Error');
    }
  } else {
    // For SPA, serve index.html for unknown routes
    try {
      const content = readFileSync(indexPath);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    } catch (err) {
      res.writeHead(404);
      res.end('Not Found');
    }
  }
});

// Start server
async function start() {
  const port = await findPort(9090);
  const url = `http://localhost:${port}`;

  server.listen(port, async () => {
    console.log(`
  datacontract-editor v${pkg.version}

  Server running at ${url}
  Opening browser...

  Press Ctrl+C to stop
`);

    // Open browser
    try {
      const open = (await import('open')).default;
      await open(url);
    } catch (err) {
      console.log(`  Could not open browser automatically.`);
      console.log(`  Please open ${url} manually.\n`);
    }
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n  Shutting down...\n');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});

start();
