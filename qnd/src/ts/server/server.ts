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
import readline from 'node:readline';

const execAsync = promisify(exec);

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = 3000;
const HTTPS_PORT = 3443;
const PUBLIC_DIR = path.join(__dirname, '../../public');
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

interface ClientSession {
  id: string;
  ip: string;
  userAgent: string;
  connectedAt: Date;
  requestCount: number;
  lastRequest: Date;
}

// Global state for TUI
const clientSessions = new Map<string, ClientSession>();
let totalRequests = 0;
let serverStartTime = new Date();

/**
 * Track client session
 */
function trackClient(req: http.IncomingMessage): void {
  const ip = req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const sessionId = `${ip}-${userAgent}`;
  
  totalRequests++;
  
  if (!clientSessions.has(sessionId)) {
    clientSessions.set(sessionId, {
      id: sessionId,
      ip,
      userAgent,
      connectedAt: new Date(),
      requestCount: 1,
      lastRequest: new Date()
    });
  } else {
    const session = clientSessions.get(sessionId)!;
    session.requestCount++;
    session.lastRequest = new Date();
  }
}

/**
 * Handle incoming HTTP requests
 */
async function handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  // Track client
  trackClient(req);
  
  try {
    let filepath = req.url || '/';
    
    // Remove query string
    filepath = filepath.split('?')[0];

    // Route handling
    if (filepath === '/') {
      filepath = '/index.html';
    } else if (filepath === '/js') {
      filepath = '/index-js.html';
    } else if (filepath === '/ts') {
      filepath = '/index-ts.html';
    }
    
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
 * Terminal UI (TUI) functions
 */
function clearScreen(): void {
  console.clear();
  process.stdout.write('\x1b[H'); // Move cursor to home
}

function showHelp(): void {
  clearScreen();
  const uptime = Math.floor((Date.now() - serverStartTime.getTime()) / 1000);
  
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║             🎴 UpDown Server - Terminal UI                    ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log('║                                                                ║');
  console.log('║  📊 Server Status                                              ║');
  console.log(`║    HTTPS: https://localhost:${HTTPS_PORT}                                  ║`);
  console.log(`║    HTTP:  http://localhost:${PORT} → HTTPS                           ║`);
  console.log(`║    Uptime: ${uptime}s                                              ║`);
  console.log(`║    Requests: ${totalRequests}                                             ║`);
  console.log(`║    Sessions: ${clientSessions.size}                                              ║`);
  console.log('║                                                                ║');
  console.log('║  ⌨️  Keyboard Commands                                          ║');
  console.log('║                                                                ║');
  console.log('║    [h] or [?] - Show this help screen                          ║');
  console.log('║    [s] - Show server status                                    ║');
  console.log('║    [c] - Show connected clients                                ║');
  console.log('║    [r] - Show recent requests                                  ║');
  console.log('║    [l] - Show live request log                                 ║');
  console.log('║    [clear] - Clear screen                                      ║');
  console.log('║    [q] - Return to this help screen                            ║');
  console.log('║    [d] - Stop server and exit                                  ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('\n💡 Press any key to start...\n');
}

function showStatus(): void {
  clearScreen();
  const uptime = Math.floor((Date.now() - serverStartTime.getTime()) / 1000);
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;
  
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    📊 Server Status                            ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║  Started:        ${serverStartTime.toLocaleString()}          `);
  console.log(`║  Uptime:         ${hours}h ${minutes}m ${seconds}s                            `);
  console.log(`║  Total Requests: ${totalRequests}                                       `);
  console.log(`║  Active Sessions: ${clientSessions.size}                                     `);
  console.log(`║  HTTPS Port:     ${HTTPS_PORT}                                        `);
  console.log(`║  HTTP Port:      ${PORT}                                         `);
  console.log(`║  Public Dir:     ${path.basename(PUBLIC_DIR)}                               `);
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('\nPress [q] to return to help, [d] to stop server...\n');
}

function showClients(): void {
  clearScreen();
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                  👥 Connected Clients                          ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  
  if (clientSessions.size === 0) {
    console.log('║  No clients connected yet                                      ║');
  } else {
    const sessions = Array.from(clientSessions.values());
    sessions.forEach((session, index) => {
      console.log(`║  Client ${index + 1}:                                                    `);
      console.log(`║    IP: ${session.ip.padEnd(40)}   `);
      console.log(`║    Requests: ${session.requestCount}                                          `);
      console.log(`║    Last: ${session.lastRequest.toLocaleTimeString()}                             `);
      console.log('║                                                                ║');
    });
  }
  
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('\nPress [q] to return to help, [d] to stop server...\n');
}

/**
 * Setup Terminal UI
 */
function setupTUI(): void {
  // Set up raw mode for immediate key capture
  if (process.stdin.isTTY) {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
  }

  let requestLog: string[] = [];
  let logMode = false;

  process.stdin.on('keypress', (str, key) => {
    if (!key) return;

    // Handle Ctrl+C
    if (key.ctrl && key.name === 'c') {
      console.log('\n\n🛑 Shutting down server (Ctrl+C)...');
      process.exit(0);
    }

    // Handle commands
    switch (key.name) {
      case 'd':
        console.log('\n\n🛑 Shutting down server (pressed [d])...');
        process.exit(0);
        break;

      case 'h':
      case '?':
      case 'q':
        logMode = false;
        showHelp();
        break;

      case 's':
        logMode = false;
        showStatus();
        break;

      case 'c':
        logMode = false;
        showClients();
        break;

      case 'l':
        logMode = !logMode;
        if (logMode) {
          clearScreen();
          console.log('📡 Live Request Log (press [q] to exit)...\n');
        } else {
          showHelp();
        }
        break;

      case 'r':
        logMode = false;
        clearScreen();
        console.log('📜 Recent Requests:\n');
        requestLog.slice(-20).forEach(log => console.log(log));
        console.log('\nPress [q] to return to help...\n');
        break;

      default:
        if (key.name === 'return' && str === 'clear') {
          clearScreen();
        }
        break;
    }
  });

  // Log requests in live mode
  const originalTrack = global.trackClient;
  // Intercept tracking to show live logs
  setInterval(() => {
    if (logMode && totalRequests > 0) {
      const lastSession = Array.from(clientSessions.values()).pop();
      if (lastSession) {
        const logEntry = `[${new Date().toLocaleTimeString()}] ${lastSession.ip} - Request #${lastSession.requestCount}`;
        requestLog.push(logEntry);
        if (requestLog.length > 100) requestLog.shift();
        console.log(logEntry);
      }
    }
  }, 1000);

  // Show initial help
  showHelp();
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  console.log('🚀 Starting UpDown Game Server (TypeScript ESM)...\n');
  
  const hasSSL = await generateCertificate();
  await startServers(!hasSSL);
  
  // Setup TUI after servers start
  setupTUI();
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
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
  }
  console.log('\n\n🛑 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
  }
  console.log('\n\n🛑 Shutting down server...');
  process.exit(0);
});

// Run the server
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

