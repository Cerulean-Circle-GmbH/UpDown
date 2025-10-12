#!/usr/bin/env node

/**
 * UpDown Game - HTTPS Server with PWA Support
 * Serves the game with SSL/TLS encryption
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const HTTPS_PORT = 3443;
const PUBLIC_DIR = path.join(__dirname, 'public');
const CERT_DIR = path.join(__dirname, '.certs');
const CERT_FILE = path.join(CERT_DIR, 'cert.pem');
const KEY_FILE = path.join(CERT_DIR, 'key.pem');

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json'
};

// Request handler
function handleRequest(req, res) {
  let filepath = req.url === '/' ? '/index.html' : req.url;
  
  // Remove query string
  filepath = filepath.split('?')[0];
  
  const fullPath = path.join(PUBLIC_DIR, filepath);
  const ext = path.extname(fullPath);
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
      return;
    }

    res.writeHead(200, { 
      'Content-Type': mimeType,
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
}

// Generate self-signed certificate if not exists
function generateCertificate(callback) {
  if (fs.existsSync(CERT_FILE) && fs.existsSync(KEY_FILE)) {
    console.log('✅ SSL certificates found');
    callback();
    return;
  }

  console.log('🔐 Generating self-signed SSL certificate...');
  
  // Create .certs directory
  if (!fs.existsSync(CERT_DIR)) {
    fs.mkdirSync(CERT_DIR, { recursive: true });
  }

  const cmd = `openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 365 \
    -keyout "${KEY_FILE}" -out "${CERT_FILE}" \
    -subj "/CN=localhost"`;

  exec(cmd, (error) => {
    if (error) {
      console.error('❌ Failed to generate certificate:', error.message);
      console.log('📝 Falling back to HTTP only...');
      callback(true); // Indicate HTTP fallback
      return;
    }
    console.log('✅ SSL certificate generated');
    callback();
  });
}

// Start servers
function startServers(httpOnly = false) {
  // HTTP server (redirects to HTTPS if available)
  const httpServer = http.createServer((req, res) => {
    if (!httpOnly) {
      // Redirect to HTTPS
      res.writeHead(301, { 
        'Location': `https://localhost:${HTTPS_PORT}${req.url}` 
      });
      res.end();
    } else {
      handleRequest(req, res);
    }
  });

  httpServer.listen(PORT, () => {
    if (httpOnly) {
      console.log(`🎴 UpDown server running at http://localhost:${PORT}`);
      console.log(`📱 Open your browser to start playing!`);
    } else {
      console.log(`🔄 HTTP redirect running on port ${PORT}`);
    }
  });

  // HTTPS server (if certificates available)
  if (!httpOnly) {
    try {
      const options = {
        key: fs.readFileSync(KEY_FILE),
        cert: fs.readFileSync(CERT_FILE)
      };

      const httpsServer = https.createServer(options, handleRequest);

      httpsServer.listen(HTTPS_PORT, () => {
        console.log(`🎴 UpDown HTTPS server running at https://localhost:${HTTPS_PORT}`);
        console.log(`🔒 SSL/TLS encryption enabled`);
        console.log(`📱 Open your browser to start playing!`);
        console.log(`\n⚠️  Accept the self-signed certificate warning in your browser`);
      });
    } catch (error) {
      console.error('❌ Failed to start HTTPS server:', error.message);
      console.log('📝 Falling back to HTTP only...');
      startServers(true);
    }
  }
}

// Main
console.log('🚀 Starting UpDown Game Server...\n');
generateCertificate((httpOnly) => {
  startServers(httpOnly);
});

