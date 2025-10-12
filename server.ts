#!/usr/bin/env node

/**
 * UpDown Game - Modern TypeScript ESM HTTPS Server with PWA Support
 * Serves the game with SSL/TLS encryption and Progressive Web App features
 */

import https from 'node:https';
import http from 'node:http';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = 3000;
const HTTPS_PORT = 3443;
const PUBLIC_DIR = path.join(__dirname, 'public');
const CERT_DIR = path.join(__dirname, '.certs');
const CERT_FILE = path.join(CERT_DIR, 'cert.pem');
const KEY_FILE = path.join(CERT_DIR, 'key.pem');

// MIME types mapping
const MIME_TYPES: Record<string, string> = {
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
} as const;

interface RequestHandler {
  (req: http.IncomingMessage, res: http.ServerResponse): void;
}

/**
 * Handle incoming HTTP requests
 */
async function handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  try {
    let filepath = req.url === '/' ? '/index.html' : req.url || '/';
    
    // Remove query string
    filepath = filepath.split('?')[0];
    
    const fullPath = path.join(PUBLIC_DIR, filepath);
    const ext = path.extname(fullPath);
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    // Security: Prevent directory traversal
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
      return;
    }

    const data = await fs.readFile(fullPath);
    res.writeHead(200, { 
      'Content-Type': mimeType,
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    } else {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
    }
  }
}

/**
 * Generate self-signed SSL certificate
 */
async function generateCertificate(): Promise<boolean> {
  if (fsSync.existsSync(CERT_FILE) && fsSync.existsSync(KEY_FILE)) {
    console.log('✅ SSL certificates found');
    return true;
  }

  console.log('🔐 Generating self-signed SSL certificate...');
  
  try {
    // Create .certs directory
    await fs.mkdir(CERT_DIR, { recursive: true });

    const cmd = `openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 365 \
      -keyout "${KEY_FILE}" -out "${CERT_FILE}" \
      -subj "/CN=localhost"`;

    await execAsync(cmd);
    console.log('✅ SSL certificate generated');
    return true;
  } catch (error) {
    console.error('❌ Failed to generate certificate:', error);
    console.log('📝 Falling back to HTTP only...');
    return false;
  }
}

/**
 * Start HTTP and HTTPS servers
 */
async function startServers(httpOnly: boolean = false): Promise<void> {
  // HTTP server (redirects to HTTPS if available)
  const httpServer = http.createServer((req, res) => {
    if (!httpOnly) {
      // Redirect to HTTPS using the request's Host header
      const host = req.headers.host ? req.headers.host.replace(/:\d+$/, '') : 'localhost';
      res.writeHead(301, { 
        'Location': `https://${host}:${HTTPS_PORT}${req.url}` 
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
      const [key, cert] = await Promise.all([
        fs.readFile(KEY_FILE, 'utf-8'),
        fs.readFile(CERT_FILE, 'utf-8')
      ]);

      const options: https.ServerOptions = { key, cert };
      const httpsServer = https.createServer(options, (req, res) => {
        handleRequest(req, res);
      });

      httpsServer.listen(HTTPS_PORT, () => {
        console.log(`🎴 UpDown HTTPS server running at https://localhost:${HTTPS_PORT}`);
        console.log(`🔒 SSL/TLS encryption enabled`);
        console.log(`📱 Open your browser to start playing!`);
        console.log(`\n⚠️  Accept the self-signed certificate warning in your browser`);
      });
    } catch (error) {
      console.error('❌ Failed to start HTTPS server:', error);
      console.log('📝 Falling back to HTTP only...');
      await startServers(true);
    }
  }
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  console.log('🚀 Starting UpDown Game Server (TypeScript ESM)...\n');
  
  const hasSSL = await generateCertificate();
  await startServers(!hasSSL);
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down server...');
  process.exit(0);
});

// Run the server
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

