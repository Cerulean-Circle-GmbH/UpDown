/**
 * UC-C1: connection.open
 * @uc:uuid:92a061e0
 *
 * Verifies WebSocket connection to game server and welcome handshake.
 * Impl: WebSocketClient.ts:14 connect() / server.ts:303 setupWebSocketServer()
 */

import { describe, it, expect, afterAll } from 'vitest';
import WebSocket from 'ws';

const WS_URL = 'wss://localhost:3443';
const WS_OPTS = { rejectUnauthorized: false };

const openSockets: WebSocket[] = [];

function connectWs(): Promise<{ ws: WebSocket; welcome: any }> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL, WS_OPTS);
    const timeout = setTimeout(() => reject(new Error('connect timeout')), 5000);
    ws.on('error', reject);
    ws.on('message', (d) => {
      const m = JSON.parse(d.toString());
      if (m.type === 'welcome') {
        clearTimeout(timeout);
        openSockets.push(ws);
        resolve({ ws, welcome: m });
      }
    });
  });
}

afterAll(() => {
  openSockets.forEach(ws => ws.close());
});

describe('UC-C1 connection.open [92a061e0]', () => {

  // AC-1: WebSocket connects successfully
  // [uc:uuid:92a061e0] UC-C1: connection.open
  it('AC-1: WebSocket connects and reaches OPEN state', async () => {
    const { ws } = await connectWs();
    expect(ws.readyState).toBe(WebSocket.OPEN);
  });

  // AC-2: Server sends welcome with clientId
  // [uc:uuid:92a061e0] UC-C1: connection.open — welcome
  it('AC-2: Welcome message has type and clientId', async () => {
    const { welcome } = await connectWs();
    expect(welcome.type).toBe('welcome');
    expect(welcome.clientId).toBeDefined();
    expect(typeof welcome.clientId).toBe('string');
    expect(welcome.clientId.length).toBeGreaterThan(0);
  });

  // AC-3: Multiple concurrent connections get unique IDs
  // [uc:uuid:aa33a8d3] UC-C1b: connection.open.multi
  it('AC-3: Three connections get unique clientIds', async () => {
    const c1 = await connectWs();
    const c2 = await connectWs();
    const c3 = await connectWs();
    const ids = new Set([c1.welcome.clientId, c2.welcome.clientId, c3.welcome.clientId]);
    expect(ids.size).toBe(3);
    expect(c1.ws.readyState).toBe(WebSocket.OPEN);
    expect(c2.ws.readyState).toBe(WebSocket.OPEN);
    expect(c3.ws.readyState).toBe(WebSocket.OPEN);
  });

  // AC-4: Welcome includes online count
  it('AC-4: Welcome includes onlineCount >= 1', async () => {
    const { welcome } = await connectWs();
    expect(welcome.onlineCount).toBeDefined();
    expect(typeof welcome.onlineCount).toBe('number');
    expect(welcome.onlineCount).toBeGreaterThanOrEqual(1);
  });
});
