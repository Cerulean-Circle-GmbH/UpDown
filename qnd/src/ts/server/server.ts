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
import { exec, execFile } from 'node:child_process';
import crypto from 'node:crypto';
import { promisify } from 'node:util';
import readline from 'node:readline';
import { WebSocketServer, WebSocket } from 'ws';
import fetch from 'node-fetch';
import { marked } from 'marked';
import { RoomManager } from './GameRoom.js';
import { MSG } from '../shared/MessageTypes.js';

const execAsync = promisify(exec);
const ADMIN_KEY = process.env.ADMIN_KEY || crypto.randomUUID();

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env (manual parse, no deps)
const ENV_PATH = path.join(__dirname, '../../../.env');
const envVars: Record<string, string> = {};
if (fsSync.existsSync(ENV_PATH)) {
  fsSync.readFileSync(ENV_PATH, 'utf-8').split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim();
  });
}

// Detect local IP fallback
import os from 'node:os';
function getLocalIP(): string {
  for (const ifaces of Object.values(os.networkInterfaces())) {
    if (!ifaces) continue;
    for (const iface of ifaces) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}

// Configuration
const PORT = 3000;
const HTTPS_PORT = 3443;
const BASE_DOMAIN = envVars['BASE_DOMAIN'] || '';
const PUBLIC_DIR = path.join(__dirname, '../../public');
const CERT_DIR = path.join(__dirname, '.certs');
const CERT_FILE = path.join(CERT_DIR, 'cert.pem');
const KEY_FILE = path.join(CERT_DIR, 'key.pem');

// MIME types mapping
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.ts': 'application/javascript', // Serve TypeScript as JavaScript for browser
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

interface WebSocketClient {
  ws: WebSocket;
  id: string;
  ip: string;
  userAgent: string;
  connectedAt: number;
  avatarUrl: string;
  deviceId: string;
  playerToken: string;
}

// Global state for TUI
const clientSessions = new Map<string, ClientSession>();
const wsClients = new Set<WebSocketClient>();
const avatarCache = new Map<string, string>(); // clientId -> data URL
const tokenToClient = new Map<string, string>(); // playerToken -> clientId
let totalRequests = 0;

// Player profiles — persisted to data/profiles.json
interface DeviceInfo {
  deviceId: string;
  userAgent: string;
  ip: string;
  screenSize: string;
  platform: string;
  firstSeen: string;
  lastSeen: string;
  connectionCount: number;
}
interface PlayerProfile {
  token: string;
  name: string;
  avatar: string;
  phone: string;
  url: string;
  devices: DeviceInfo[];
  secretCode: string;
  consolidatedFrom: string[];
  redirectTo?: string;
  gamesPlayed: number;
  wins: number;
  totalScore: number;
  totalDiamonds: number;
  bestScore: number;
  bestStreak: number;
  bestRank: number;
  lastPlayed: string;
  bugReports: { date: string; text: string; status: string }[];
}
const PROFILES_PATH = path.join(__dirname, '../../../data/profiles.json');
const playerProfiles = new Map<string, PlayerProfile>();

function loadProfiles(): void {
  try {
    if (fsSync.existsSync(PROFILES_PATH)) {
      const data = JSON.parse(fsSync.readFileSync(PROFILES_PATH, 'utf-8'));
      for (const p of data) playerProfiles.set(p.token, p);
    }
  } catch {}
  // Backfill missing fields for pre-T86 profiles
  let dirty = false;
  for (const p of playerProfiles.values()) {
    if (!p.secretCode) { p.secretCode = generateSecretCode(); dirty = true; }
    if (!p.consolidatedFrom) { p.consolidatedFrom = []; dirty = true; }
    if (!p.bugReports) { p.bugReports = []; dirty = true; }
    for (const d of (p.devices || [])) {
      if (!d.deviceId) { d.deviceId = crypto.randomUUID(); dirty = true; }
    }
  }
  if (dirty) saveProfiles();
}
function saveProfiles(): void {
  try {
    fsSync.mkdirSync(path.dirname(PROFILES_PATH), { recursive: true });
    fsSync.writeFileSync(PROFILES_PATH, JSON.stringify([...playerProfiles.values()], null, 2));
  } catch {}
}
loadProfiles();

function generateSecretCode(): string {
  return String(1000 + Math.floor(Math.random() * 9000));
}

// Bug report forwarding
const execFileAsync = promisify(execFile);
let bugReportTarget = 'upDownTeam:0.0';
const PAIRING_PATH = path.join(__dirname, '../../../data/agent-pairing.json');
try { const p = JSON.parse(fsSync.readFileSync(PAIRING_PATH, 'utf-8')); if (p.bugReportTarget) bugReportTarget = p.bugReportTarget; } catch {}

function sanitizeBugReport(text: string): string {
  return text.slice(0, 500).replace(/[`$\\'";\n\r]/g, '').replace(/[^\x20-\x7E]/g, '').trim();
}
function appendBugReport(name: string, text: string, token: string = ''): void {
  const file = path.join(__dirname, '../../../data/bug-reports.json');
  let reports: any[] = [];
  try { reports = JSON.parse(fsSync.readFileSync(file, 'utf-8')); } catch {}
  reports.push({ name, token, text, timestamp: new Date().toISOString() });
  fsSync.writeFileSync(file, JSON.stringify(reports, null, 2));
}

function recordGameResults(leaderboard: any[]): void {
  addLog(`🏆 Recording ${leaderboard.length} game results`);
  for (const entry of leaderboard) {
    const token = entry.playerToken;
    if (!token) continue;
    const profile = playerProfiles.get(token);
    if (!profile) continue;
    profile.gamesPlayed = (profile.gamesPlayed || 0) + 1;
    profile.totalScore = (profile.totalScore || 0) + entry.score;
    profile.totalDiamonds = (profile.totalDiamonds || 0) + (entry.diamonds || 0);
    profile.wins = (profile.wins || 0) + (entry.rank === 1 ? 1 : 0);
    profile.bestScore = Math.max(profile.bestScore || 0, entry.score);
    profile.bestStreak = Math.max(profile.bestStreak || 0, entry.maxStreak || 0);
    profile.bestRank = Math.min(profile.bestRank || 999, entry.rank);
    profile.lastPlayed = new Date().toISOString();
  }
  saveProfiles();
}

// Game room manager — preset rooms created on startup
const roomManager = new RoomManager();
roomManager.setGlobalGameOverCallback(recordGameResults);
roomManager.createPresetRooms();
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

    // API: leaderboard data
    if (req.method === 'POST' && filepath === '/api/bug-status') {
      let body = '';
      req.on('data', (chunk: Buffer) => body += chunk);
      req.on('end', () => {
        try {
          const { adminKey, playerToken, bugIndex, status } = JSON.parse(body);
          if (adminKey !== ADMIN_KEY) { res.writeHead(403); res.end('Forbidden'); return; }
          if (!['PLANNED', 'IN PROGRESS', 'FIXED', 'WONTFIX'].includes(status)) { res.writeHead(400); res.end('Invalid status'); return; }
          const profile = playerProfiles.get(playerToken);
          if (!profile || !profile.bugReports || !profile.bugReports[bugIndex]) { res.writeHead(404); res.end('Bug report not found'); return; }
          profile.bugReports[bugIndex].status = status;
          saveProfiles();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, updated: profile.bugReports[bugIndex] }));
          addLog(`🐛 Bug status updated: ${playerToken.slice(0,8)} #${bugIndex} → ${status}`);
        } catch { res.writeHead(400); res.end('Bad request'); }
      });
      return;
    }

    if (filepath === '/api/bugs') {
      const allBugs: any[] = [];
      playerProfiles.forEach((p, token) => {
        (p.bugReports || []).forEach((b, i) => {
          allBugs.push({ token: token.slice(0, 8), name: p.name, index: i, ...b });
        });
      });
      allBugs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
      res.end(JSON.stringify(allBugs));
      return;
    }

    if (filepath === '/api/leaderboard') {
      const entries = [...playerProfiles.values()]
        .filter(p => (p.gamesPlayed || 0) > 0 && !p.redirectTo)
        .sort((a, b) => (b.totalDiamonds || 0) - (a.totalDiamonds || 0)
          || (b.wins || 0) - (a.wins || 0)
          || (b.bestScore || 0) - (a.bestScore || 0)
          || (b.gamesPlayed || 0) - (a.gamesPlayed || 0))
        .map((p, i) => ({
          rank: i + 1, name: p.name || 'Unknown',
          totalDiamonds: p.totalDiamonds || 0, wins: p.wins || 0,
          gamesPlayed: p.gamesPlayed || 0, bestScore: p.bestScore || 0,
          bestStreak: p.bestStreak || 0
        }));
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
      res.end(JSON.stringify({ entries }));
      return;
    }

    // API: serve config for client
    if (filepath === '/api/config') {
      const domain = BASE_DOMAIN || getLocalIP();
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
      res.end(JSON.stringify({ baseDomain: domain, httpsPort: HTTPS_PORT, version: '0.3.0', branch: 'qndNow' }));
      return;
    }

    // Docs: render .md files from project
    const PROJECT_ROOT = path.join(__dirname, '../../../../');
    const DOCS_DIR = path.join(__dirname, '../../../docs');
    const MD_CSS = 'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;max-width:700px;margin:40px auto;padding:0 20px;color:#333;line-height:1.6}a{color:#667eea}h1,h2,h3{margin-top:1.5em}code{background:#f0f0f0;padding:2px 6px;border-radius:4px;font-size:0.9em}pre{background:#f5f5f5;padding:12px;border-radius:8px;overflow-x:auto}pre code{background:none;padding:0}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}';
    if (filepath === '/docs' || filepath === '/docs/') {
      try {
        const files = fsSync.readdirSync(DOCS_DIR).filter(f => f.endsWith('.md'));
        const list = files.map(f => `<li><a href="/docs/${f}">${f.replace('.md', '')}</a></li>`).join('');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>UpDown Docs</title><style>${MD_CSS}</style></head><body><h1>📖 UpDown Docs</h1><p><a href="/">← Home</a></p><ul>${list}</ul></body></html>`);
      } catch { res.writeHead(404); res.end('Docs not found'); }
      return;
    }
    if (filepath.startsWith('/docs/') && filepath.endsWith('.md')) {
      const relPath = filepath.slice(6);
      if (relPath.includes('..')) { res.writeHead(403); res.end('Forbidden'); return; }
      const mdFile = path.join(DOCS_DIR, relPath);
      try {
        const md = fsSync.readFileSync(mdFile, 'utf-8');
        const html = marked(md) as string;
        const backLink = path.dirname(relPath) === '.' ? '/docs' : `/docs/${path.dirname(relPath)}`;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${path.basename(filepath, '.md')} — UpDown</title><style>${MD_CSS}</style></head><body><p><a href="${backLink}">← Back</a> · <a href="/docs">Docs</a> · <a href="/">Home</a></p>${html}</body></html>`);
      } catch { res.writeHead(404); res.end('Doc not found'); }
      return;
    }
    if (filepath.startsWith('/md/') && filepath.endsWith('.md')) {
      const relPath = filepath.slice(4);
      if (relPath.includes('..')) { res.writeHead(403); res.end('Forbidden'); return; }
      const mdFile = path.join(PROJECT_ROOT, relPath);
      try {
        const md = fsSync.readFileSync(mdFile, 'utf-8');
        const dirPrefix = path.dirname(relPath);
        const relinked = md.replace(/\]\(([^)]+\.md)\)/g, (_, p) => `](/md/${dirPrefix}/${p})`);
        const html = marked(relinked) as string;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${path.basename(filepath, '.md')} — UpDown</title><style>${MD_CSS}</style></head><body><p><a href="/">← Home</a></p>${html}</body></html>`);
      } catch { res.writeHead(404); res.end('File not found'); }
      return;
    }

    // Remove query string
    filepath = filepath.split('?')[0];

    // Route handling (supports both /js and /js/ patterns)
    if (filepath === '/' || filepath === '/index.html') {
      filepath = '/index.html';
    } else if (filepath === '/js' || filepath === '/js/') {
      filepath = '/index-js.html'; // Serve the main HTML file
    } else if (filepath === '/ts' || filepath === '/ts/') {
      filepath = '/index-ts.html'; // Serve the main HTML file
    } else if (filepath === '/mp' || filepath === '/mp/' || filepath === '/multiplayer' || filepath === '/multiplayer/') {
      filepath = '/multiplayer.html';
    } else if (filepath === '/bug-report' || filepath === '/bug-report/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>🐛 Bug Report — UpDown</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:20px;color:#333}
.container{background:white;border-radius:20px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.3);max-width:500px;width:100%}
h1{text-align:center;margin-bottom:16px;font-size:1.5rem}
.back{display:inline-block;margin-bottom:12px;color:#667eea;text-decoration:none;font-size:0.9rem}
textarea{width:100%;min-height:120px;border:2px solid rgba(102,126,234,0.3);border-radius:10px;padding:12px;font-size:0.95rem;font-family:inherit;resize:vertical}
textarea:focus{outline:none;border-color:#667eea}
.submit{width:100%;padding:12px;background:#e74c3c;color:white;border:none;border-radius:10px;font-size:1rem;font-weight:600;cursor:pointer;margin-top:12px}
.submit:disabled{opacity:0.5;cursor:default}
.submit:active:not(:disabled){transform:scale(0.97)}
.status{text-align:center;margin-top:12px;font-size:0.9rem}
.ver{text-align:center;font-size:0.7rem;opacity:0.4;margin-top:16px}
</style></head><body>
<div class="container">
<a class="back" href="/">← Back</a>
<h1>🐛 Bug Report</h1>
<p id="reporter-id" style="font-size:0.75rem;text-align:center;color:#667eea;margin-bottom:8px"></p>
<p style="font-size:0.85rem;opacity:0.6;margin-bottom:12px;text-align:center">Describe the bug you found. Your report will be sent to the development team.</p>
<textarea id="bug-text" placeholder="What happened? What did you expect?" maxlength="500"></textarea>
<p id="char-counter" style="text-align:right;font-size:0.75rem;color:#999;margin:4px 0 8px">0/500</p>
<button class="submit" id="bug-submit">Submit Bug Report</button>
<p class="status" id="bug-status"></p>
<p class="ver" id="ver"></p>
</div>
<script>
var ws,connected=false;
function connect(){
  ws=new WebSocket((location.protocol==='https:'?'wss:':'ws:')+'//'+location.host);
  ws.onopen=function(){connected=true};
  ws.addEventListener('message',function(e){
    var m=JSON.parse(e.data);
    if(m.type==='welcome'){
      var token=localStorage.getItem('updown-player-id')||'';
      var devId=localStorage.getItem('updown-device-id')||'';
      if(token)ws.send(JSON.stringify({type:'IDENTIFY',playerToken:token,deviceId:devId,name:localStorage.getItem('updown-name')||'',screenWidth:screen.width,screenHeight:screen.height,platform:navigator.platform}));
    }
    if(m.type==='TOKEN_REDIRECT'&&m.newToken)localStorage.setItem('updown-player-id',m.newToken);
  });
  ws.onmessage=function(e){
    var m=JSON.parse(e.data);
    if(m.type==='PROFILE'&&m.profile){var r=document.getElementById('reporter-id');if(r)r.textContent='Reporting as: '+(m.profile.name||'Unknown')+' ('+m.profile.token.slice(0,8)+'...)'}
    if(m.type==='BUG_REPORT_OK'){document.getElementById('bug-status').textContent='✅ Report sent! Thank you.';document.getElementById('bug-text').value='';document.getElementById('char-counter').textContent='0/500';document.getElementById('char-counter').style.color='#999';document.getElementById('bug-submit').disabled=false}
    if(m.type==='ERROR'){document.getElementById('bug-status').textContent='❌ '+m.message;document.getElementById('bug-submit').disabled=false}
  };
  ws.onclose=function(){connected=false;setTimeout(connect,2000)};
}
connect();
document.getElementById('bug-text').addEventListener('input',function(){
  var len=this.value.length;var el=document.getElementById('char-counter');
  el.textContent=len+'/500';el.style.color=len>=450?'#e74c3c':len>=400?'#ff9800':'#999';
});
document.getElementById('bug-submit').addEventListener('click',function(){
  var text=document.getElementById('bug-text').value.trim();
  if(!text){document.getElementById('bug-status').textContent='Please describe the bug.';return}
  if(!connected){document.getElementById('bug-status').textContent='Connecting...';return}
  document.getElementById('bug-submit').disabled=true;
  document.getElementById('bug-status').textContent='Sending...';
  ws.send(JSON.stringify({type:'BUG_REPORT',text:text}));
});
fetch('/api/config').then(function(r){return r.json()}).then(function(c){document.getElementById('ver').textContent='v'+c.version+' · '+c.branch}).catch(function(){});
</script></body></html>`);
      return;
    } else if (filepath === '/profile' || filepath === '/profile/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>👤 Profile — UpDown</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:20px;color:#333}
.container{background:white;border-radius:20px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.3);max-width:500px;width:100%}
h1{text-align:center;margin-bottom:16px;font-size:1.5rem}
h3{font-size:1rem;margin:16px 0 8px;border-bottom:1px solid #eee;padding-bottom:4px}
.back{display:inline-block;margin-bottom:12px;color:#667eea;text-decoration:none;font-size:0.9rem}
.code{text-align:center;font-size:2rem;font-weight:700;letter-spacing:8px;color:#667eea;padding:12px;background:rgba(102,126,234,0.08);border-radius:10px;margin:12px 0}
.field{display:flex;justify-content:space-between;padding:6px 0;font-size:0.85rem;border-bottom:1px solid rgba(0,0,0,0.05)}
.field .label{opacity:0.6}
.device{background:rgba(102,126,234,0.06);border-radius:8px;padding:8px 10px;margin-bottom:6px;font-size:0.8rem}
.device .dtype{font-weight:600}
.device .dmeta{opacity:0.5;font-size:0.75rem;margin-top:2px}
.empty{text-align:center;opacity:0.6;padding:16px}
.ver{text-align:center;font-size:0.7rem;opacity:0.4;margin-top:16px}
</style></head><body>
<div class="container">
<a class="back" href="/mp">← Back to Lobby</a>
<h1>👤 My Profile</h1>
<div id="profile"><p class="empty">Connecting...</p></div>
<p class="ver" id="ver"></p>
</div>
<script>
const token=localStorage.getItem('updown-player-id');
if(!token){document.getElementById('profile').innerHTML='<p class="empty">No profile found. Play a game first.</p>'}
else{
  const ws=new WebSocket((location.protocol==='https:'?'wss:':'ws:')+'//'+location.host);
  ws.onmessage=e=>{
    const m=JSON.parse(e.data);
    if(m.type==='welcome'){ws.send(JSON.stringify({type:'IDENTIFY',playerToken:token,deviceId:localStorage.getItem('updown-device-id')||'',screenWidth:screen.width,screenHeight:screen.height,platform:navigator.platform}))}
    if(m.type==='TOKEN_REDIRECT'&&m.newToken){localStorage.setItem('updown-player-id',m.newToken)}
    if(m.type==='PROFILE'&&m.profile){
      const p=m.profile;var cids=m.connectedDeviceIds||[];
      const el=document.getElementById('profile');
      const ua=navigator.userAgent;
      const dtype=ua.includes('Mobile')?'📱 Mobile':ua.includes('Mac')?'💻 Mac':ua.includes('Windows')?'🖥 Windows':ua.includes('Linux')?'🐧 Linux':'🌐 Browser';
      el.innerHTML='<div class="field"><span class="label">Name</span><span>'+(p.name||'Unknown')+'</span></div>'
        +'<div class="field"><span class="label">Token</span><span style="font-size:0.6rem;opacity:0.5;word-break:break-all">'+p.token+'</span></div>'
        +'<h3>🔑 Your Secret Code</h3>'
        +'<div class="code">'+(p.secretCode||'----')+'</div>'
        +'<p style="text-align:center;font-size:0.75rem;opacity:0.5;margin-bottom:8px">Share this code so friends can link their account to yours</p>'
        +'<h3>📊 Stats</h3>'
        +'<div class="field"><span class="label">Games</span><span>'+(p.gamesPlayed||0)+'</span></div>'
        +'<div class="field"><span class="label">Wins</span><span>'+(p.wins||0)+'</span></div>'
        +'<div class="field"><span class="label">Best Score</span><span>'+(p.bestScore||0)+'</span></div>'
        +'<div class="field"><span class="label">Best Streak</span><span>'+(p.bestStreak||0)+'🔥</span></div>'
        +'<div class="field"><span class="label">Diamonds</span><span>💎 '+(p.totalDiamonds||0)+'</span></div>'
        +'<h3>📱 Devices ('+(p.devices?.length||0)+')</h3>'
        +(p.devices&&p.devices.length?p.devices.map(function(d){
          var t=d.userAgent||'';var short=t.includes('Mobile')?'📱 Mobile':t.includes('Mac')?'💻 Mac':t.includes('Windows')?'🖥 Windows':t.includes('Linux')?'🐧 Linux':'🌐 Browser';
          var online=cids.indexOf(d.deviceId)>=0;var dot=online?'<span style="color:#4CAF50">●</span>':'<span style="color:#f44336">●</span>';
          return '<div class="device">'+dot+' <span class="dtype">'+short+'</span> <span style="opacity:0.4">'+((d.deviceId||'').slice(0,8)||'legacy')+'</span><div class="dmeta">IP: '+(d.ip||'unknown').replace('::ffff:','')+'</div><div class="dmeta">'+(d.screenSize||'')+(d.platform?' · '+d.platform:'')+(d.connectionCount?' · '+d.connectionCount+'× connected':'')+'</div><div class="dmeta">Last: '+new Date(d.lastSeen).toLocaleString()+'</div></div>'
        }).join(''):'<p class="empty">No devices recorded</p>')
        +'<h3>🐛 My Bug Reports ('+(p.bugReports?.length||0)+')</h3>'
        +(p.bugReports&&p.bugReports.length?p.bugReports.map(function(b){
          var statusColor=b.status==='FIXED'?'#4CAF50':b.status==='IN PROGRESS'?'#ff9800':'#999';
          return '<div class="device"><span style="color:'+statusColor+';font-weight:600">'+b.status+'</span> <span style="opacity:0.5;font-size:0.7rem">'+new Date(b.date).toLocaleDateString()+'</span><div class="dmeta">'+b.text+'</div></div>'
        }).join(''):'<p class="empty">No bug reports filed</p>');
    }
  };
}
fetch('/api/config').then(r=>r.json()).then(c=>{document.getElementById('ver').textContent='v'+c.version+' · '+c.branch}).catch(()=>{});
</script></body></html>`);
      return;
    } else if (filepath === '/leaderboard' || filepath === '/leaderboard/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>🏆 Leaderboard — UpDown</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:20px;color:#333}
.container{background:white;border-radius:20px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.3);max-width:500px;width:100%}
h1{text-align:center;margin-bottom:16px;font-size:1.5rem}
.back{display:inline-block;margin-bottom:12px;color:#667eea;text-decoration:none;font-size:0.9rem}
.row{display:flex;justify-content:space-between;padding:8px 10px;border-radius:6px;font-size:0.85rem;margin-bottom:4px}
.row:nth-child(odd){background:rgba(102,126,234,0.06)}
.medal{font-size:1rem;margin-right:4px}
.name{flex:1;margin-left:6px;font-weight:600}
.stat{opacity:0.7;font-size:0.8rem;margin-left:8px}
.empty{text-align:center;opacity:0.6;padding:20px}
.ver{text-align:center;font-size:0.7rem;opacity:0.4;margin-top:16px}
</style></head><body>
<div class="container">
<a class="back" href="/mp">← Back to Lobby</a>
<h1>🏆 Leaderboard</h1>
<div id="lb"><p class="empty">Loading...</p></div>
<p class="ver" id="ver"></p>
</div>
<script>
fetch('/api/leaderboard').then(r=>r.json()).then(d=>{
  const lb=document.getElementById('lb');
  if(!d.entries||!d.entries.length){lb.innerHTML='<p class="empty">No games played yet</p>';return}
  lb.innerHTML=d.entries.slice(0,50).map(e=>{
    const m=e.rank===1?'🥇':e.rank===2?'🥈':e.rank===3?'🥉':'#'+e.rank;
    return '<div class="row"><span class="medal">'+m+'</span><span class="name">'+e.name+'</span><span class="stat">💎'+e.totalDiamonds+'</span><span class="stat">'+e.wins+'W</span><span class="stat">'+e.gamesPlayed+'G</span><span class="stat">'+e.bestStreak+'🔥</span></div>'
  }).join('')
}).catch(()=>{document.getElementById('lb').innerHTML='<p class="empty">Could not load leaderboard</p>'});
fetch('/api/config').then(r=>r.json()).then(c=>{document.getElementById('ver').textContent='v'+c.version+' · '+c.branch}).catch(()=>{});
</script></body></html>`);
      return;
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
      
      // Setup WebSocket server
      setupWebSocketServer(httpsServer);
    } catch (error) {
      // Silently fall back to HTTP only
      await startServers(true);
    }
  }
}

/**
 * Fetch a unique avatar from thispersondoesnotexist.com
 */
async function fetchUniqueAvatar(): Promise<string> {
  try {
    const response = await fetch('https://thispersondoesnotexist.com/');
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Failed to fetch avatar:', error);
    // Fallback to app icon
    return '/icon-192.png';
  }
}

/**
 * Setup WebSocket server for real-time player notifications
 */
// [uc:uuid:92a061e0] UC-C1: connection.open — [uc:uuid:aa33a8d3] UC-C1b: connection.open.multi
function setupWebSocketServer(server: https.Server): void {
  const wss = new WebSocketServer({ server });
  
  wss.on('connection', async (ws: WebSocket, req: http.IncomingMessage) => {
    const ip = req.socket.remoteAddress || 'unknown';
    const clientId = `${ip}-${Date.now()}`;
    const connectedAt = Date.now();
    const userAgent = req.headers['user-agent'] || '';

    // Fetch a unique avatar from thispersondoesnotexist.com
    // Each call generates a NEW image
    const avatarUrl = await fetchUniqueAvatar();
    avatarCache.set(clientId, avatarUrl);

    const client: WebSocketClient = { ws, id: clientId, ip, userAgent, connectedAt, avatarUrl, deviceId: '', playerToken: '' };
    wsClients.add(client);
    
    addLog(`🎮 WebSocket connected: ${ip} (${wsClients.size} online)`);
    
    // Send welcome message with full player list
    ws.send(JSON.stringify({
      type: 'welcome',
      clientId,
      onlineCount: wsClients.size,
      players: getAllPlayers()
    }));
    
    // Send config + room list immediately
    ws.send(JSON.stringify({ type: MSG.SERVER_CONFIG, shareDomain: BASE_DOMAIN || getLocalIP(), httpsPort: HTTPS_PORT }));
    ws.send(JSON.stringify({ type: MSG.ROOM_LIST, rooms: roomManager.listRooms() }));

    // Broadcast new player to all other clients
    broadcastNewPlayer(client);
    
    // Handle game messages
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        handleGameMessage(clientId, ws, client.avatarUrl, msg);
      } catch (e) {
        // Ignore non-JSON messages
      }
    });

    ws.on('close', () => {
      wsClients.delete(client);
      avatarCache.delete(clientId);
      for (const [token, cid] of tokenToClient) { if (cid === clientId) tokenToClient.delete(token); }
      addLog(`👋 WebSocket disconnected: ${ip} (${wsClients.size} online)`);

      // Remove from any game room or spectator list
      const room = roomManager.findPlayerRoom(clientId);
      if (room) {
        room.removePlayer(clientId);
        if (room.players.size === 0 && !room.autoRecreate) roomManager.removeRoom(room.id);
        addLog(`🚪 ${clientId.slice(0,8)} left room ${room.name}`);
      }
      const specRoom = roomManager.findSpectatorRoom(clientId);
      if (specRoom) {
        specRoom.removeSpectator(clientId);
      }

      // Broadcast player left to all remaining clients
      broadcastPlayerLeft(client);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      wsClients.delete(client);
      avatarCache.delete(clientId);
    });
  });
}

/**
 * Get all connected players
 */
function getAllPlayers() {
  return Array.from(wsClients).map(client => ({
    playerId: client.id,
    playerIp: client.ip.replace(/^::ffff:/, ''),
    connectedAt: client.connectedAt,
    avatarUrl: client.avatarUrl
  }));
}

/**
 * Broadcast player left to all clients
 */
function broadcastPlayerLeft(leftClient: WebSocketClient): void {
  const message = JSON.stringify({
    type: 'player-left',
    playerId: leftClient.id,
    timestamp: Date.now()
  });
  
  wsClients.forEach(client => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}

/**
 * Handle game protocol messages from WebSocket clients
 */
function handleGameMessage(clientId: string, ws: WebSocket, avatarUrl: string, msg: any): void {
  const send = (data: object) => ws.send(JSON.stringify(data));

  switch (msg.type) {
    case MSG.CREATE_ROOM: { // [uc:uuid:fbfed148] UC-R2 — [uc:uuid:177c8da5] UC-R2b — [uc:uuid:1c21171d] UC-R3
      // Auto-cleanup stale finished rooms before creating new one
      const cleaned = roomManager.cleanupStale();
      if (cleaned > 0) addLog(`🧹 Auto-cleaned ${cleaned} stale room(s)`);

      const playerName = msg.playerName || 'Player';
      const roomName = msg.roomName || msg.name || `${playerName}'s Room`;
      const useAvatar = msg.clientAvatar || avatarUrl;
      const room = roomManager.createRoom(
        roomName,
        clientId,
        msg.maxPlayers || 10,
        msg.roomKey || null
      );
      if (msg.playerToken) tokenToClient.set(msg.playerToken, clientId);
      const createProfile = msg.playerToken ? playerProfiles.get(msg.playerToken) : undefined;
      room.addPlayer(clientId, ws, playerName, useAvatar, msg.playerToken || '', createProfile?.phone || '', createProfile?.url || '');
      room.hostId = clientId; // Creator is ALWAYS host
      addLog(`🏠 Room created: ${room.name} (${room.id}) by ${clientId.slice(0,8)}`);
      break;
    }

    case MSG.JOIN_ROOM: { // [uc:uuid:9cc60247] UC-R4 — [uc:uuid:61449e82] UC-R5 — [uc:uuid:148f2e73] UC-R6
      const room = roomManager.getRoom(msg.roomId);
      if (!room) { send({ type: MSG.ERROR, message: 'Room not found' }); break; }
      if (room.isPrivate && room.roomKey !== msg.roomKey) { send({ type: MSG.ERROR, message: 'Wrong room key' }); break; }
      const joinName = msg.playerName || 'Player';
      // Token-based dedup: same token already in room = reject
      if (msg.playerToken) {
        const oldId = tokenToClient.get(msg.playerToken);
        if (oldId && oldId !== clientId && room.players.has(oldId)) {
          send({ type: MSG.ERROR, message: 'You are already in this room' }); break;
        }
        tokenToClient.set(msg.playerToken, clientId);
      } else {
        // Fallback: name+IP dedup
        const thisClient = [...wsClients].find(c => c.id === clientId);
        if (thisClient) {
          const dup = [...room.players.values()].some(p => {
            const pc = [...wsClients].find(c => c.id === p.id);
            return p.name === joinName && pc?.ip === thisClient.ip;
          });
          if (dup) { send({ type: MSG.ERROR, message: 'You are already in this room' }); break; }
        }
      }
      const useAvatar = msg.clientAvatar || avatarUrl;
      const joinProfile = msg.playerToken ? playerProfiles.get(msg.playerToken) : undefined;
      const joined = room.addPlayer(clientId, ws, joinName, useAvatar, msg.playerToken || '', joinProfile?.phone || '', joinProfile?.url || '');
      if (!joined) { send({ type: MSG.ERROR, message: 'Room is full or game in progress' }); break; }
      addLog(`🎮 ${joinName} joined room ${room.name}`);
      break;
    }

    case MSG.LEAVE_ROOM: { // [uc:uuid:96f2ecd5] UC-R10
      const room = roomManager.findPlayerRoom(clientId);
      if (room) {
        room.removePlayer(clientId);
        if (room.players.size === 0) roomManager.removeRoom(room.id);
        send({ type: MSG.ROOM_LEFT });
        send({ type: MSG.ROOM_LIST, rooms: roomManager.listRooms() });
        addLog(`🚪 ${clientId.slice(0,8)} left room ${room.name}`);
      }
      break;
    }

    case MSG.REMOVE_ROOM: { // UC-R13: room.remove (host, or anyone for orphan/empty/finished)
      const room = roomManager.getRoom(msg.roomId);
      if (!room) { addLog(`🗑 Remove failed: room ${msg.roomId} not found`); break; }
      if (room.players.size > 0 && room.hostId !== clientId) {
        send({ type: MSG.ERROR, message: 'Room still has players' }); break;
      }
      const isHost = room.hostId === clientId;
      const isEmpty = room.players.size === 0;
      const notPreset = !room.autoRecreate;
      if (isHost || isEmpty || notPreset) {
        roomManager.removeRoom(room.id);
        // Broadcast updated room list to all connected clients
        wsClients.forEach(c => {
          if (c.ws.readyState === WebSocket.OPEN) {
            c.ws.send(JSON.stringify({ type: MSG.ROOM_LIST, rooms: roomManager.listRooms() }));
          }
        });
        addLog(`🗑 Room removed: ${room.name} by host ${clientId.slice(0,8)}`);
      }
      break;
    }

    case MSG.LIST_ROOMS: { // [uc:uuid:7cd55a0b] UC-R1
      send({ type: MSG.ROOM_LIST, rooms: roomManager.listRooms() });
      break;
    }

    case MSG.START_GAME: { // [uc:uuid:560d9a46] UC-G1 — [uc:uuid:57311798] UC-H4: nonHost check
      const room = roomManager.findPlayerRoom(clientId);
      if (room && room.hostId === clientId) {
        room.startGame();
        addLog(`🎲 Game started in room ${room.name} with ${room.players.size} players`);
      }
      break;
    }

    case MSG.TOGGLE_COUNTDOWN: {
      const room = roomManager.findPlayerRoom(clientId);
      if (room && room.hostId === clientId) {
        room.toggleCountdown(!room.countdownEnabled);
        addLog(`⏱️ Countdown ${room.countdownEnabled ? 'ON' : 'OFF'} in room ${room.name}`);
      }
      break;
    }

    case MSG.FORCE_NEXT_ROUND: {
      const room = roomManager.findPlayerRoom(clientId);
      if (room && room.hostId === clientId) {
        room.forceNextRound();
        addLog(`⏩ Force next round in room ${room.name}`);
      }
      break;
    }

    case MSG.PLAY_AGAIN: { // [uc:uuid:ea33c5b7] UC-GE5: game.end.playAgain
      const room = roomManager.findPlayerRoom(clientId);
      if (room && room.state === 'finished') {
        room.resetForReplay();
        const players = [...room.players.values()].map(p => ({ id: p.id, name: p.name, avatarUrl: p.avatarUrl, score: 0, alive: true }));
        room.broadcast({ type: MSG.ROOM_RESET, room: room.info(), players, hostId: room.hostId, chatHistory: room.chatHistory });
        addLog(`🔄 Room ${room.name} reset for replay by ${clientId.slice(0,8)}`);
      }
      break;
    }

    case MSG.PLAY_CARD: { // [uc:uuid:f0295f28] UC-P1 — [uc:uuid:c9866c6e] UC-P2 — [uc:uuid:fa8f1c83] UC-P3
      const room = roomManager.findPlayerRoom(clientId);
      if (room && (msg.guess === 'up' || msg.guess === 'down' || msg.guess === 'equal')) {
        room.playCard(clientId, msg.guess);
      }
      break;
    }

    case MSG.PLAY_SPECIAL: { // [uc:uuid:f43897d5] UC-P9
      const room = roomManager.findPlayerRoom(clientId);
      if (room && msg.cardId) {
        room.playSpecialCard(clientId, msg.cardId, msg.targetPlayerId);
      }
      break;
    }

    case MSG.ADD_BOT: { // [uc:uuid:fc6c941a] UC-H2: host.addBot — [uc:uuid:f1ba3e42] UC-B1
      const room = roomManager.findPlayerRoom(clientId);
      if (room && room.hostId === clientId) {
        const botId = room.addBot(msg.personality);
        addLog(`🤖 Bot added to room ${room.name}: ${botId}`);
      }
      break;
    }

    case MSG.SPECTATE_ROOM: // [uc:uuid:ac08aa49] UC-S1: spectator.join
    case MSG.SPECTATE: {
      const room = roomManager.getRoom(msg.roomId);
      if (room) {
        room.addSpectator(clientId, ws, msg.playerName || 'Spectator');
        addLog(`👁️ ${msg.playerName || clientId.slice(0,8)} spectating room ${room.name}`);
      } else {
        send({ type: MSG.ERROR, message: 'Room not found' });
      }
      break;
    }

    case MSG.LEAVE_SPECTATE: { // [uc:uuid:d30575e7] UC-S2
      const room = roomManager.findSpectatorRoom(clientId);
      if (room) {
        room.removeSpectator(clientId);
        send({ type: MSG.SPECTATE_LEFT });
      }
      break;
    }

    case MSG.JOIN_NEXT_GAME: { // [uc:uuid:df7ec971] UC-S3
      const room = roomManager.findSpectatorRoom(clientId);
      if (room) {
        const ok = room.promoteSpectator(clientId, msg.playerName || 'Player', avatarUrl);
        if (!ok) send({ type: MSG.ERROR, message: 'Cannot join — room full or game in progress' });
      }
      break;
    }

    case MSG.CHAT_MESSAGE: { // [uc:uuid:0dfe22b0] UC-CH1 — [uc:uuid:8a319461] UC-CH3: maxLength — [uc:uuid:f552ec48] UC-CH4: maxHistory
      const room = roomManager.findPlayerRoom(clientId) || roomManager.findSpectatorRoom(clientId);
      if (room && msg.text && typeof msg.text === 'string') {
        const text = msg.text.slice(0, 200);
        const player = room.players.get(clientId);
        const spec = room.spectators.get(clientId);
        const name = player?.name || spec?.name || 'Anonymous';
        const chatMsg = { senderId: clientId, senderName: name, text, timestamp: Date.now() };
        room.chatHistory.push(chatMsg);
        if (room.chatHistory.length > 50) room.chatHistory.shift();
        room.broadcast({ type: MSG.CHAT_MESSAGE, ...chatMsg });
      }
      break;
    }

    case MSG.GAME_STATE: {
      const room = roomManager.findPlayerRoom(clientId);
      if (room) {
        send({ type: MSG.GAME_STATE, room: room.info(), currentCard: room.currentCard, previousCard: room.previousCard });
      }
      break;
    }

    case MSG.IDENTIFY: {
      let token = msg.playerToken;
      if (!token) break;
      // Follow redirect chain for consolidated profiles
      let redirectProfile = playerProfiles.get(token);
      if (redirectProfile?.redirectTo) {
        const newToken = redirectProfile.redirectTo;
        send({ type: MSG.TOKEN_REDIRECT, newToken });
        token = newToken;
      }
      tokenToClient.set(token, clientId);
      const thisClient = [...wsClients].find(c => c.id === clientId);
      if (thisClient) { thisClient.deviceId = msg.deviceId || ''; thisClient.playerToken = token; }
      const ua = thisClient?.userAgent || '';
      const ip = thisClient?.ip || '';
      const screenSize = msg.screenWidth && msg.screenHeight ? `${msg.screenWidth}x${msg.screenHeight}` : '';
      const now = new Date().toISOString();

      let profile = playerProfiles.get(token);
      if (!profile) {
        profile = { token, name: '', avatar: '', phone: '', url: '', devices: [], secretCode: generateSecretCode(), consolidatedFrom: [], gamesPlayed: 0, wins: 0, totalScore: 0, totalDiamonds: 0, bestScore: 0, bestStreak: 0, bestRank: 999, lastPlayed: '', bugReports: [] };
        playerProfiles.set(token, profile);
      }
      if (msg.name) profile.name = msg.name;
      if (msg.avatar) profile.avatar = msg.avatar;
      if (msg.phone) profile.phone = msg.phone;
      if (msg.url) profile.url = msg.url;

      const devId = msg.deviceId || '';
      const existing = (devId && profile.devices.find(d => d.deviceId === devId))
        || profile.devices.find(d => d.userAgent === ua && d.ip === ip);
      if (existing) {
        existing.lastSeen = now;
        existing.connectionCount++;
        if (screenSize) existing.screenSize = screenSize;
        if (msg.platform) existing.platform = msg.platform;
        if (devId && !existing.deviceId) existing.deviceId = devId;
      } else {
        profile.devices.push({ deviceId: devId, userAgent: ua, ip, screenSize, platform: msg.platform || '', firstSeen: now, lastSeen: now, connectionCount: 1 });
      }
      saveProfiles();
      const connectedDeviceIds = [...wsClients].filter(c => c.playerToken === token && c.deviceId).map(c => c.deviceId);
      send({ type: MSG.PROFILE, profile, connectedDeviceIds });
      break;
    }

    case MSG.GET_LEADERBOARD: {
      const myToken = [...tokenToClient.entries()].find(([, cid]) => cid === clientId)?.[0];
      const entries = [...playerProfiles.values()]
        .filter(p => (p.gamesPlayed || 0) > 0 && !p.redirectTo)
        .sort((a, b) => (b.totalDiamonds || 0) - (a.totalDiamonds || 0)
          || (b.wins || 0) - (a.wins || 0)
          || (b.bestScore || 0) - (a.bestScore || 0)
          || (b.gamesPlayed || 0) - (a.gamesPlayed || 0))
        .map((p, i) => ({
          rank: i + 1, name: p.name || 'Unknown',
          totalDiamonds: p.totalDiamonds || 0, wins: p.wins || 0,
          gamesPlayed: p.gamesPlayed || 0, bestScore: p.bestScore || 0,
          bestStreak: p.bestStreak || 0, isYou: p.token === myToken
        }));
      const myRank = entries.findIndex(e => e.isYou) + 1;
      send({ type: MSG.LEADERBOARD, entries, myRank });
      break;
    }

    case MSG.CONSOLIDATE: {
      const myToken = [...tokenToClient.entries()].find(([, cid]) => cid === clientId)?.[0];
      if (!myToken) { send({ type: MSG.CONSOLIDATE_FAILED, reason: 'Not identified' }); break; }
      const myProfile = playerProfiles.get(myToken);
      if (!myProfile) { send({ type: MSG.CONSOLIDATE_FAILED, reason: 'No profile' }); break; }
      const targetToken = msg.targetToken;
      if (!targetToken) { send({ type: MSG.CONSOLIDATE_FAILED, reason: 'No target' }); break; }
      if (targetToken === myToken) { send({ type: MSG.CONSOLIDATE_FAILED, reason: 'Cannot link with yourself' }); break; }

      // Security: target must be in same room
      const myRoom = roomManager.findPlayerRoom(clientId);
      if (!myRoom) { send({ type: MSG.CONSOLIDATE_FAILED, reason: 'Not in a room' }); break; }
      const targetClientId = tokenToClient.get(targetToken) || [...wsClients].find(c => c.playerToken === targetToken)?.id;
      const targetInRoom = targetClientId ? myRoom.players.has(targetClientId) : [...myRoom.players.values()].some(p => p.playerToken === targetToken);
      if (!targetInRoom) { send({ type: MSG.CONSOLIDATE_FAILED, reason: 'Player not in your room' }); break; }

      const secretCode = msg.secretCode;
      if (!secretCode) { send({ type: MSG.CONSOLIDATE_FAILED, reason: 'Secret code required' }); break; }

      const friend = playerProfiles.get(targetToken);
      if (!friend) { send({ type: MSG.CONSOLIDATE_FAILED, reason: 'Player has no profile' }); break; }
      if (friend.secretCode !== secretCode) {
        send({ type: MSG.CONSOLIDATE_FAILED, reason: 'Wrong secret code' });
        addLog(`🔒 Link account REJECTED: ${myToken.slice(0,8)} → ${targetToken.slice(0,8)} (wrong code)`);
        break;
      }
      if (myProfile.consolidatedFrom?.includes(friend.token)) { send({ type: MSG.CONSOLIDATE_FAILED, reason: 'Already linked' }); break; }

      addLog(`🤝 Link account: ${myToken.slice(0,8)} absorbs ${targetToken.slice(0,8)}`);

      // Merge stats (additive counts, max bests)
      myProfile.gamesPlayed = (myProfile.gamesPlayed || 0) + (friend.gamesPlayed || 0);
      myProfile.wins = (myProfile.wins || 0) + (friend.wins || 0);
      myProfile.totalScore = (myProfile.totalScore || 0) + (friend.totalScore || 0);
      myProfile.totalDiamonds = (myProfile.totalDiamonds || 0) + (friend.totalDiamonds || 0);
      myProfile.bestScore = Math.max(myProfile.bestScore || 0, friend.bestScore || 0);
      myProfile.bestStreak = Math.max(myProfile.bestStreak || 0, friend.bestStreak || 0);
      myProfile.bestRank = Math.min(myProfile.bestRank || 999, friend.bestRank || 999);
      myProfile.lastPlayed = [myProfile.lastPlayed, friend.lastPlayed].filter(Boolean).sort().pop() || '';

      // Merge devices (dedup by deviceId)
      const existingIds = new Set(myProfile.devices.map(d => d.deviceId).filter(Boolean));
      for (const d of friend.devices) {
        if (d.deviceId && existingIds.has(d.deviceId)) continue;
        myProfile.devices.push(d);
      }

      if (!myProfile.consolidatedFrom) myProfile.consolidatedFrom = [];
      myProfile.consolidatedFrom.push(friend.token);

      // Mark target as redirect stub — keep in Map for reconnect TOKEN_REDIRECT
      friend.redirectTo = myToken;
      friend.devices = [];
      friend.secretCode = '';
      friend.bugReports = [];
      saveProfiles();

      send({ type: MSG.CONSOLIDATE_OK, mergedDevices: friend.devices.length, mergedGames: friend.gamesPlayed || 0 });
      break;
    }

    case MSG.UPDATE_SECRET_CODE: {
      const myToken = [...tokenToClient.entries()].find(([, cid]) => cid === clientId)?.[0];
      if (!myToken) { send({ type: MSG.SECRET_CODE_FAILED, reason: 'Not identified' }); break; }
      const myProfile = playerProfiles.get(myToken);
      if (!myProfile) { send({ type: MSG.SECRET_CODE_FAILED, reason: 'No profile' }); break; }
      const newCode = String(msg.code || '');
      if (!/^\d{4}$/.test(newCode)) { send({ type: MSG.SECRET_CODE_FAILED, reason: 'Must be a 4-digit number' }); break; }
      myProfile.secretCode = newCode;
      saveProfiles();
      send({ type: MSG.SECRET_CODE_OK, code: newCode });
      break;
    }

    case MSG.BUG_REPORT: {
      const text = sanitizeBugReport(msg.text || '');
      if (!text) { send({ type: MSG.ERROR, message: 'Empty bug report' }); break; }
      const bugClient = [...wsClients].find(c => c.id === clientId);
      const reporterToken = bugClient?.playerToken || [...tokenToClient.entries()].find(([, cid]) => cid === clientId)?.[0] || 'unknown';
      const reporterProfile = reporterToken !== 'unknown' ? playerProfiles.get(reporterToken) : undefined;
      const playerName = roomManager.findPlayerRoom(clientId)?.players.get(clientId)?.name || reporterProfile?.name || 'Anonymous';
      const prompt = `[@browser-user ${playerName} ${reporterToken.slice(0, 8)}] BUG REPORT: ${text}`;
      // Store in reporter's profile
      if (reporterToken !== 'unknown') {
        const reporterProfile = playerProfiles.get(reporterToken);
        if (reporterProfile) {
          if (!reporterProfile.bugReports) reporterProfile.bugReports = [];
          reporterProfile.bugReports.push({ date: new Date().toISOString(), text, status: 'PLANNED' });
          saveProfiles();
        }
      }
      try {
        execFile('otmux', ['send', bugReportTarget, prompt, 'Enter'], (err) => {
          if (err) { appendBugReport(playerName, text, reporterToken); }
        });
        send({ type: MSG.BUG_REPORT_OK });
        addLog(`🐛 Bug report from ${playerName} (${reporterToken.slice(0, 8)}): ${text.slice(0, 50)}...`);
      } catch {
        appendBugReport(playerName, text, reporterToken);
        send({ type: MSG.BUG_REPORT_OK });
      }
      break;
    }

    case MSG.PAIR_BUG_REPORT: {
      if (msg.pane && typeof msg.pane === 'string') {
        bugReportTarget = msg.pane.replace(/[^a-zA-Z0-9:._-]/g, '');
        try { fsSync.writeFileSync(PAIRING_PATH, JSON.stringify({ bugReportTarget, pairedAt: new Date().toISOString() })); } catch {}
        send({ type: MSG.PAIR_OK, target: bugReportTarget });
        addLog(`🔗 Bug report paired to ${bugReportTarget}`);
      }
      break;
    }
  }
}

/**
 * Broadcast new player connection to all clients except the new one
 */
function broadcastNewPlayer(newClient: WebSocketClient): void {
  const message = JSON.stringify({
    type: 'player-joined',
    playerId: newClient.id,
    playerIp: newClient.ip.replace(/^::ffff:/, ''), // Clean IPv6 prefix
    avatarUrl: newClient.avatarUrl,
    timestamp: Date.now()
  });
  
  wsClients.forEach(client => {
    if (client.id !== newClient.id && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
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
 * Calculate visible string length (without ANSI codes)
 */
function visibleLength(str: string): number {
  // Remove ANSI escape codes
  return str.replace(/\x1b\[[0-9;]*m/g, '').length;
}

/**
 * Pad string to specific width accounting for ANSI codes
 */
function padToWidth(str: string, width: number): string {
  const visible = visibleLength(str);
  const padding = width - visible;
  return str + ' '.repeat(Math.max(0, padding));
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
  const boxWidth = 64;
  
  console.log(`${colors.brightMagenta}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}${padToWidth(`             ${colors.bright}🎴 UpDown Server - Terminal UI${colors.reset}`, boxWidth)}${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}╠════════════════════════════════════════════════════════════════╣${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}${padToWidth('', boxWidth)}${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}${padToWidth(`  ${colors.brightCyan}📊 Server Status${colors.reset}`, boxWidth)}${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}${padToWidth(`    ${colors.green}HTTPS:${colors.reset} ${colors.brightBlue}https://localhost:${HTTPS_PORT}${colors.reset}`, boxWidth)}${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}${padToWidth(`    ${colors.green}HTTP:${colors.reset}  ${colors.brightBlue}http://localhost:${PORT}${colors.reset} → HTTPS`, boxWidth)}${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}${padToWidth(`    ${colors.green}Uptime:${colors.reset} ${colors.brightYellow}${uptime}s${colors.reset}`, boxWidth)}${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}${padToWidth(`    ${colors.green}Requests:${colors.reset} ${colors.brightYellow}${totalRequests}${colors.reset}`, boxWidth)}${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}${padToWidth(`    ${colors.green}Sessions:${colors.reset} ${colors.brightYellow}${clientSessions.size}${colors.reset}`, boxWidth)}${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}${padToWidth('', boxWidth)}${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}${padToWidth(`  ${colors.brightCyan}⌨️  Keyboard Commands${colors.reset}  `, boxWidth)}${colors.brightMagenta} ║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}${padToWidth('', boxWidth)}${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}${padToWidth(`    ${colors.brightGreen}[h]${colors.reset} or ${colors.brightGreen}[?]${colors.reset} - Show this help screen`, boxWidth)}${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}${padToWidth(`    ${colors.brightGreen}[s]${colors.reset} - Show server status`, boxWidth)}${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}${padToWidth(`    ${colors.brightGreen}[c]${colors.reset} - Show connected clients`, boxWidth)}${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}${padToWidth(`    ${colors.brightGreen}[e]${colors.reset} - Show recent requests`, boxWidth)}${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}${padToWidth(`    ${colors.brightGreen}[l]${colors.reset} - Show live request log`, boxWidth)}${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}${padToWidth(`    ${colors.brightCyan}[p]${colors.reset} - ${colors.cyan}Open browser (play game)${colors.reset}`, boxWidth)}${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}${padToWidth(`    ${colors.brightYellow}[r]${colors.reset} - ${colors.yellow}Rebuild client and restart${colors.reset}`, boxWidth)}${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}${padToWidth(`    ${colors.brightGreen}[q]${colors.reset} - Return to this help screen`, boxWidth)}${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}${padToWidth(`    ${colors.brightRed}[d]${colors.reset} - ${colors.red}Stop server and exit${colors.reset}`, boxWidth)}${colors.brightMagenta}║${colors.reset}`);
  console.log(`${colors.brightMagenta}║${colors.reset}${padToWidth('', boxWidth)}${colors.brightMagenta}║${colors.reset}`);
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
  const boxWidth = 64;
  
  console.log(`${colors.brightCyan}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}${padToWidth(`                    ${colors.bright}📊 Server Status${colors.reset}`, boxWidth)}${colors.brightCyan}║${colors.reset}`);
  console.log(`${colors.brightCyan}╠════════════════════════════════════════════════════════════════╣${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}${padToWidth(`  ${colors.green}Started:${colors.reset}        ${colors.white}${serverStartTime.toLocaleString()}${colors.reset}`, boxWidth)}${colors.brightCyan}║${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}${padToWidth(`  ${colors.green}Uptime:${colors.reset}         ${colors.brightYellow}${hours}h ${minutes}m ${seconds}s${colors.reset}`, boxWidth)}${colors.brightCyan}║${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}${padToWidth(`  ${colors.green}Total Requests:${colors.reset} ${colors.brightMagenta}${totalRequests}${colors.reset}`, boxWidth)}${colors.brightCyan}║${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}${padToWidth(`  ${colors.green}Active Sessions:${colors.reset} ${colors.brightGreen}${clientSessions.size}${colors.reset}`, boxWidth)}${colors.brightCyan}║${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}${padToWidth(`  ${colors.green}HTTPS Port:${colors.reset}     ${colors.brightBlue}${HTTPS_PORT}${colors.reset}`, boxWidth)}${colors.brightCyan}║${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}${padToWidth(`  ${colors.green}HTTP Port:${colors.reset}      ${colors.brightBlue}${PORT}${colors.reset}`, boxWidth)}${colors.brightCyan}║${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}${padToWidth(`  ${colors.green}Public Dir:${colors.reset}     ${colors.white}${path.basename(PUBLIC_DIR)}${colors.reset}`, boxWidth)}${colors.brightCyan}║${colors.reset}`);
  console.log(`${colors.brightCyan}╚════════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`\n${colors.dim}Press ${colors.brightGreen}[q]${colors.reset}${colors.dim} to return to help, ${colors.brightRed}[d]${colors.reset}${colors.dim} to stop server...${colors.reset}`);
  
  displayLogTail(13); // Status view is ~13 lines
}

function showClients(): void {
  clearScreen();
  const boxWidth = 64;
  
  console.log(`${colors.brightGreen}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.brightGreen}║${colors.reset}${padToWidth(`                  ${colors.bright}👥 Connected Clients${colors.reset}`, boxWidth)}${colors.brightGreen}║${colors.reset}`);
  console.log(`${colors.brightGreen}╠════════════════════════════════════════════════════════════════╣${colors.reset}`);
  
  let viewLines = 5; // Header + footer
  
  if (clientSessions.size === 0) {
    console.log(`${colors.brightGreen}║${colors.reset}${padToWidth(`  ${colors.dim}No clients connected yet${colors.reset}`, boxWidth)}${colors.brightGreen}║${colors.reset}`);
    viewLines += 1;
  } else {
    const sessions = Array.from(clientSessions.values());
    sessions.forEach((session, index) => {
      console.log(`${colors.brightGreen}║${colors.reset}${padToWidth(`  ${colors.brightYellow}Client ${index + 1}:${colors.reset}`, boxWidth)}${colors.brightGreen}║${colors.reset}`);
      console.log(`${colors.brightGreen}║${colors.reset}${padToWidth(`    ${colors.green}IP:${colors.reset} ${colors.brightCyan}${session.ip}${colors.reset}`, boxWidth)}${colors.brightGreen}║${colors.reset}`);
      console.log(`${colors.brightGreen}║${colors.reset}${padToWidth(`    ${colors.green}Requests:${colors.reset} ${colors.brightMagenta}${session.requestCount}${colors.reset}`, boxWidth)}${colors.brightGreen}║${colors.reset}`);
      console.log(`${colors.brightGreen}║${colors.reset}${padToWidth(`    ${colors.green}Last:${colors.reset} ${colors.white}${session.lastRequest.toLocaleTimeString()}${colors.reset}`, boxWidth)}${colors.brightGreen}║${colors.reset}`);
      console.log(`${colors.brightGreen}║${colors.reset}${padToWidth('', boxWidth)}${colors.brightGreen}║${colors.reset}`);
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

  process.stdin.on('keypress', async (str, key) => {
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

      case 'e':
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

      case 'p':
        if (liveLogInterval) {
          clearInterval(liveLogInterval);
          liveLogInterval = null;
        }
        clearScreen();
        console.log(`${colors.brightCyan}🌐 Opening browser...${colors.reset}\n`);
        
        try {
          const url = `https://localhost:${HTTPS_PORT}/ts`;
          let openCommand = '';
          
          if (process.platform === 'darwin') {
            openCommand = `open "${url}"`;
          } else if (process.platform === 'linux') {
            openCommand = `xdg-open "${url}" || sensible-browser "${url}"`;
          } else if (process.platform === 'win32') {
            openCommand = `start "${url}"`;
          }
          
          if (openCommand) {
            await execAsync(openCommand);
            console.log(`${colors.brightGreen}✅ Browser opened: ${colors.brightBlue}${url}${colors.reset}\n`);
            addLog(`🌐 Browser opened: ${url}`);
          } else {
            console.log(`${colors.brightYellow}⚠️  Platform not supported for auto-open${colors.reset}\n`);
            console.log(`${colors.dim}Manually open: ${colors.brightBlue}${url}${colors.reset}\n`);
          }
          
          console.log(`${colors.dim}Press ${colors.brightGreen}[q]${colors.reset}${colors.dim} to return to help...${colors.reset}\n`);
        } catch (error: any) {
          console.log(`${colors.brightRed}❌ Failed to open browser${colors.reset}\n`);
          console.log(`${colors.dim}Manually open: ${colors.brightBlue}https://localhost:${HTTPS_PORT}/ts${colors.reset}\n`);
          console.log(`${colors.dim}Press ${colors.brightGreen}[q]${colors.reset}${colors.dim} to return to help...${colors.reset}\n`);
        }
        break;

      case 'r':
        if (liveLogInterval) {
          clearInterval(liveLogInterval);
          liveLogInterval = null;
        }
        clearScreen();
        console.log(`${colors.brightYellow}🔨 Rebuilding client...${colors.reset}\n`);
        
        try {
          const { stdout, stderr } = await execAsync('npm run build', { cwd: __dirname });
          clearScreen();
          console.log(`${colors.brightGreen}✅ Build successful!${colors.reset}\n`);
          if (stdout) console.log(stdout);
          console.log(`\n${colors.brightCyan}💡 Reload your browser to see changes${colors.reset}`);
          console.log(`${colors.dim}Press ${colors.brightGreen}[q]${colors.reset}${colors.dim} to return to help...${colors.reset}\n`);
          addLog('🔨 Client rebuilt successfully');
        } catch (error: any) {
          clearScreen();
          console.log(`${colors.brightRed}❌ Build failed!${colors.reset}\n`);
          console.log(error.stderr || error.message);
          console.log(`${colors.dim}\nPress ${colors.brightGreen}[q]${colors.reset}${colors.dim} to return to help...${colors.reset}\n`);
          addLog('❌ Client build failed');
        }
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
  addLog(`🔑 Admin key: ${ADMIN_KEY}`);
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
  
  // Periodic stale room cleanup every 2 minutes
  setInterval(() => {
    const cleaned = roomManager.cleanupStale();
    if (cleaned > 0) {
      addLog(`🧹 Periodic cleanup: ${cleaned} stale room(s)`);
      wsClients.forEach(c => {
        if (c.ws.readyState === WebSocket.OPEN) {
          c.ws.send(JSON.stringify({ type: MSG.ROOM_LIST, rooms: roomManager.listRooms() }));
        }
      });
    }
  }, 2 * 60 * 1000);

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

