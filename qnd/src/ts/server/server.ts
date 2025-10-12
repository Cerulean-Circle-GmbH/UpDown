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
const serverLogs: string[] = [];
const MAX_LOGS = 1000; // Keep last 1000 log entries

/**
 * Add a log entry
 */
function addLog(message: string): void {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}`;
  serverLogs.push(logEntry);
  if (serverLogs.length > MAX_LOGS) {
    serverLogs.shift();
  }
}

/**
 * Track client session
 */
function trackClient(req: http.IncomingMessage): void {
  const ip = req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const sessionId = `${ip}-${userAgent}`;
  const url = req.url || '/';
  const method = req.method || 'GET';
  
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
    addLog(`New client: ${ip}`);
  } else {
    const session = clientSessions.get(sessionId)!;
    session.requestCount++;
    session.lastRequest = new Date();
  }
  
  // Log request
  addLog(`${method} ${url} - ${ip}`);
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
    return true;
  }
  
  try {
    // Create .certs directory
    await fs.mkdir(CERT_DIR, { recursive: true });

    const cmd = `openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 365 \
      -keyout "${KEY_FILE}" -out "${CERT_FILE}" \
      -subj "/CN=localhost" 2>/dev/null`;

    await execAsync(cmd);
    return true;
  } catch (error) {
    // Silently fall back to HTTP only
    return false;
  }
}

/**
 * Start HTTP and HTTPS servers (silently)
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

  httpServer.listen(PORT);

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

      httpsServer.listen(HTTPS_PORT);
    } catch (error) {
      // Silently fall back to HTTP only
      await startServers(true);
    }
  }
}

/**
 * ANSI Color Codes
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Bright foreground colors
  brightBlack: '\x1b[90m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
  
  // Background colors
  bgBlack: '\x1b[40m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m'
};

/**
 * Terminal UI (TUI) functions
 */
function clearScreen(): void {
  console.clear();
  process.stdout.write('\x1b[H\x1b[2J'); // Clear screen and move to home
}

/**
 * Get available lines for logs based on terminal height and current view
 */
function getAvailableLogLines(viewLines: number): number {
  const terminalHeight = process.stdout.rows || 24;
  const availableLines = terminalHeight - viewLines - 3; // -3 for spacing
  return Math.max(5, Math.min(availableLines, 20)); // Between 5 and 20 lines
}

/**
 * Display log tail below the current view
 */
function displayLogTail(viewLines: number): void {
  const logLines = getAvailableLogLines(viewLines);
  const recentLogs = serverLogs.slice(-logLines);
  
  console.log(`\n${colors.cyan}${colors.bright}─────────────────────── Server Log ────────────────────────${colors.reset}`);
  if (recentLogs.length === 0) {
    console.log(`${colors.dim}No activity yet...${colors.reset}`);
  } else {
    recentLogs.forEach(log => {
      // Colorize log entries
      let coloredLog = log;
      if (log.includes('New client')) {
        coloredLog = log.replace('New client:', `${colors.brightGreen}New client:${colors.reset}`);
      } else if (log.includes('GET')) {
        coloredLog = log.replace('GET', `${colors.brightBlue}GET${colors.reset}`);
      } else if (log.includes('POST')) {
        coloredLog = log.replace('POST', `${colors.brightYellow}POST${colors.reset}`);
      } else if (log.includes('🚀')) {
        coloredLog = `${colors.brightMagenta}${log}${colors.reset}`;
      } else if (log.includes('📡') || log.includes('🔄')) {
        coloredLog = `${colors.brightCyan}${log}${colors.reset}`;
      }
      console.log(`${colors.dim}${coloredLog}${colors.reset}`);
    });
  }
}

function showHelp(): void {
  clearScreen();
  const uptime = Math.floor((Date.now() - serverStartTime.getTime()) / 1000);
  
  console.log(`${colors.brightMagenta}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}             ${colors.bright}🎴 UpDown Server - Terminal UI${colors.reset}                    ${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}╠════════════════════════════════════════════════════════════════╣${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}                                                                ${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}  ${colors.brightCyan}📊 Server Status${colors.reset}                                              ${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}    ${colors.green}HTTPS:${colors.reset} ${colors.brightBlue}https://localhost:${HTTPS_PORT}${colors.reset}                                  ${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}    ${colors.green}HTTP:${colors.reset}  ${colors.brightBlue}http://localhost:${PORT}${colors.reset} → HTTPS                           ${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}    ${colors.green}Uptime:${colors.reset} ${colors.brightYellow}${uptime}s${colors.reset}                                              ${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}    ${colors.green}Requests:${colors.reset} ${colors.brightYellow}${totalRequests}${colors.reset}                                             ${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}    ${colors.green}Sessions:${colors.reset} ${colors.brightYellow}${clientSessions.size}${colors.reset}                                              ${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}                                                                ${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}  ${colors.brightCyan}⌨️  Keyboard Commands${colors.reset}                                          ${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}                                                                ${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}    ${colors.brightGreen}[h]${colors.reset} or ${colors.brightGreen}[?]${colors.reset} - Show this help screen                          ${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}    ${colors.brightGreen}[s]${colors.reset} - Show server status                                    ${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}    ${colors.brightGreen}[c]${colors.reset} - Show connected clients                                ${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}    ${colors.brightGreen}[r]${colors.reset} - Show recent requests                                  ${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}    ${colors.brightGreen}[l]${colors.reset} - Show live request log                                 ${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}    ${colors.brightGreen}[q]${colors.reset} - Return to this help screen                            ${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}    ${colors.brightRed}[d]${colors.reset} - ${colors.red}Stop server and exit${colors.reset}                                  ${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}                                                                ${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}╚════════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`\n${colors.brightYellow}💡 Press any key for commands...${colors.reset}`);
  
  displayLogTail(22); // Help view is ~22 lines
}

function showStatus(): void {
  clearScreen();
  const uptime = Math.floor((Date.now() - serverStartTime.getTime()) / 1000);
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;
  
  console.log(`${colors.brightCyan}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}                    ${colors.bright}📊 Server Status${colors.reset}                            ${colors.brightCyan}║${colors.reset}`);
  console.log(`${colors.brightCyan}╠════════════════════════════════════════════════════════════════╣${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}  ${colors.green}Started:${colors.reset}        ${colors.white}${serverStartTime.toLocaleString()}${colors.reset}          ${colors.brightCyan}║${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}  ${colors.green}Uptime:${colors.reset}         ${colors.brightYellow}${hours}h ${minutes}m ${seconds}s${colors.reset}                            ${colors.brightCyan}║${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}  ${colors.green}Total Requests:${colors.reset} ${colors.brightMagenta}${totalRequests}${colors.reset}                                       ${colors.brightCyan}║${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}  ${colors.green}Active Sessions:${colors.reset} ${colors.brightGreen}${clientSessions.size}${colors.reset}                                     ${colors.brightCyan}║${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}  ${colors.green}HTTPS Port:${colors.reset}     ${colors.brightBlue}${HTTPS_PORT}${colors.reset}                                        ${colors.brightCyan}║${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}  ${colors.green}HTTP Port:${colors.reset}      ${colors.brightBlue}${PORT}${colors.reset}                                         ${colors.brightCyan}║${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}  ${colors.green}Public Dir:${colors.reset}     ${colors.white}${path.basename(PUBLIC_DIR)}${colors.reset}                               ${colors.brightCyan}║${colors.reset}`);
  console.log(`${colors.brightCyan}╚════════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`\n${colors.dim}Press ${colors.brightGreen}[q]${colors.reset}${colors.dim} to return to help, ${colors.brightRed}[d]${colors.reset}${colors.dim} to stop server...${colors.reset}`);
  
  displayLogTail(13); // Status view is ~13 lines
}

function showClients(): void {
  clearScreen();
  console.log(`${colors.brightGreen}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.brightGreen}║${colors.reset}                  ${colors.bright}👥 Connected Clients${colors.reset}                          ${colors.brightGreen}║${colors.reset}`);
  console.log(`${colors.brightGreen}╠════════════════════════════════════════════════════════════════╣${colors.reset}`);
  
  let viewLines = 5; // Header + footer
  
  if (clientSessions.size === 0) {
    console.log(`${colors.brightGreen}║${colors.reset}  ${colors.dim}No clients connected yet${colors.reset}                                      ${colors.brightGreen}║${colors.reset}`);
    viewLines += 1;
  } else {
    const sessions = Array.from(clientSessions.values());
    sessions.forEach((session, index) => {
      console.log(`${colors.brightGreen}║${colors.reset}  ${colors.brightYellow}Client ${index + 1}:${colors.reset}                                                    ${colors.brightGreen}║${colors.reset}`);
      console.log(`${colors.brightGreen}║${colors.reset}    ${colors.green}IP:${colors.reset} ${colors.brightCyan}${session.ip.padEnd(40)}${colors.reset}   ${colors.brightGreen}║${colors.reset}`);
      console.log(`${colors.brightGreen}║${colors.reset}    ${colors.green}Requests:${colors.reset} ${colors.brightMagenta}${session.requestCount}${colors.reset}                                          ${colors.brightGreen}║${colors.reset}`);
      console.log(`${colors.brightGreen}║${colors.reset}    ${colors.green}Last:${colors.reset} ${colors.white}${session.lastRequest.toLocaleTimeString()}${colors.reset}                             ${colors.brightGreen}║${colors.reset}`);
      console.log(`${colors.brightGreen}║${colors.reset}                                                                ${colors.brightGreen}║${colors.reset}`);
      viewLines += 5;
    });
  }
  
  console.log(`${colors.brightGreen}╚════════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`\n${colors.dim}Press ${colors.brightGreen}[q]${colors.reset}${colors.dim} to return to help, ${colors.brightRed}[d]${colors.reset}${colors.dim} to stop server...${colors.reset}`);
  
  displayLogTail(viewLines);
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

  let currentView: 'help' | 'status' | 'clients' | 'live' = 'help';
  let liveLogInterval: NodeJS.Timeout | null = null;

  // Auto-refresh current view every 2 seconds
  setInterval(() => {
    if (currentView === 'help') {
      showHelp();
    } else if (currentView === 'status') {
      showStatus();
    } else if (currentView === 'clients') {
      showClients();
    }
  }, 2000);

  process.stdin.on('keypress', (str, key) => {
    if (!key) return;

    // Handle Ctrl+C
    if (key.ctrl && key.name === 'c') {
      if (liveLogInterval) clearInterval(liveLogInterval);
      console.log('\n\n🛑 Shutting down server (Ctrl+C)...');
      process.exit(0);
    }

    // Handle commands
    switch (key.name) {
      case 'd':
        if (liveLogInterval) clearInterval(liveLogInterval);
        console.log('\n\n🛑 Shutting down server (pressed [d])...');
        process.exit(0);
        break;

      case 'h':
      case '?':
      case 'q':
        if (liveLogInterval) {
          clearInterval(liveLogInterval);
          liveLogInterval = null;
        }
        currentView = 'help';
        showHelp();
        break;

      case 's':
        if (liveLogInterval) {
          clearInterval(liveLogInterval);
          liveLogInterval = null;
        }
        currentView = 'status';
        showStatus();
        break;

      case 'c':
        if (liveLogInterval) {
          clearInterval(liveLogInterval);
          liveLogInterval = null;
        }
        currentView = 'clients';
        showClients();
        break;

      case 'l':
        if (liveLogInterval) {
          clearInterval(liveLogInterval);
          liveLogInterval = null;
          currentView = 'help';
          showHelp();
        } else {
          currentView = 'live';
          clearScreen();
          console.log(`${colors.brightMagenta}📡 Live Request Log${colors.reset} ${colors.dim}(press ${colors.brightGreen}[q]${colors.reset}${colors.dim} to exit)...${colors.reset}\n`);
          
          // Start live log updates
          liveLogInterval = setInterval(() => {
            clearScreen();
            console.log(`${colors.brightMagenta}📡 Live Request Log${colors.reset} ${colors.dim}(press ${colors.brightGreen}[q]${colors.reset}${colors.dim} to exit)...${colors.reset}\n`);
            const terminalHeight = process.stdout.rows || 24;
            const logLines = terminalHeight - 4;
            const recentLogs = serverLogs.slice(-logLines);
            recentLogs.forEach(log => {
              // Colorize log entries
              let coloredLog = log;
              if (log.includes('New client')) {
                coloredLog = log.replace('New client:', `${colors.brightGreen}New client:${colors.reset}`);
              } else if (log.includes('GET')) {
                coloredLog = log.replace('GET', `${colors.brightBlue}GET${colors.reset}`);
              } else if (log.includes('POST')) {
                coloredLog = log.replace('POST', `${colors.brightYellow}POST${colors.reset}`);
              } else if (log.includes('🚀')) {
                coloredLog = `${colors.brightMagenta}${log}${colors.reset}`;
              } else if (log.includes('📡') || log.includes('🔄')) {
                coloredLog = `${colors.brightCyan}${log}${colors.reset}`;
              }
              console.log(coloredLog);
            });
          }, 500); // Update every 500ms
        }
        break;

      case 'r':
        if (liveLogInterval) {
          clearInterval(liveLogInterval);
          liveLogInterval = null;
        }
        clearScreen();
        console.log(`${colors.brightYellow}📜 Recent Requests${colors.reset} ${colors.dim}(last 50)${colors.reset}:\n`);
        const terminalHeight = process.stdout.rows || 24;
        const displayLines = Math.min(50, terminalHeight - 5);
        serverLogs.slice(-displayLines).forEach(log => {
          // Colorize log entries
          let coloredLog = log;
          if (log.includes('New client')) {
            coloredLog = log.replace('New client:', `${colors.brightGreen}New client:${colors.reset}`);
          } else if (log.includes('GET')) {
            coloredLog = log.replace('GET', `${colors.brightBlue}GET${colors.reset}`);
          } else if (log.includes('POST')) {
            coloredLog = log.replace('POST', `${colors.brightYellow}POST${colors.reset}`);
          } else if (log.includes('🚀')) {
            coloredLog = `${colors.brightMagenta}${log}${colors.reset}`;
          } else if (log.includes('📡') || log.includes('🔄')) {
            coloredLog = `${colors.brightCyan}${log}${colors.reset}`;
          }
          console.log(coloredLog);
        });
        console.log(`\n${colors.dim}Press ${colors.brightGreen}[q]${colors.reset}${colors.dim} to return to help...${colors.reset}`);
        break;

      default:
        if (key.name === 'return' && str === 'clear') {
          clearScreen();
        }
        break;
    }
  });

  // Show initial help
  showHelp();
  
  // Log server start
  addLog('🚀 Server started');
  addLog(`📡 HTTPS: https://localhost:${HTTPS_PORT}`);
  addLog(`🔄 HTTP redirect: http://localhost:${PORT}`);
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  // Generate certificates silently
  const hasSSL = await generateCertificate();
  
  // Start servers silently
  await startServers(!hasSSL);
  
  // Wait a brief moment for servers to be ready
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Setup TUI - this takes over the terminal completely
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

