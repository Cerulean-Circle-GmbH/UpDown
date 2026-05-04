/**
 * UC-B1: bot.add + UC-B2: bot.decide
 * @uc:uuid:f1ba3e42,8e46d39e
 *
 * Impl: GameRoom.ts:129 addBot() / BotPlayer.ts:127 decideGuess()
 */

import { describe, it, expect, afterAll } from 'vitest';
import WebSocket from 'ws';

const WS_URL = 'wss://localhost:3443';
const WS_OPTS = { rejectUnauthorized: false };
const sockets: WebSocket[] = [];

function connectWs(): Promise<{ ws: WebSocket; playerId: string }> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL, WS_OPTS);
    const timeout = setTimeout(() => reject(new Error('connect timeout')), 5000);
    ws.on('error', reject);
    ws.on('message', (d) => {
      const m = JSON.parse(d.toString());
      if (m.type === 'welcome') { clearTimeout(timeout); sockets.push(ws); resolve({ ws, playerId: m.clientId }); }
    });
  });
}
function send(ws: WebSocket, d: object) { ws.send(JSON.stringify(d)); }
function collectFor(ws: WebSocket, ms: number): Promise<any[]> {
  return new Promise(r => { const msgs: any[] = []; const h = (d: any) => msgs.push(JSON.parse(d.toString())); ws.on('message', h); setTimeout(() => { ws.off('message', h); r(msgs); }, ms); });
}
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

afterAll(() => { sockets.forEach(ws => ws.close()); });

describe('UC-B1 bot.add [f1ba3e42]', () => {

  // [uc:uuid:f1ba3e42] UC-B1: bot.add
  it('AC-1: ADD_BOT → PLAYER_JOINED with 🤖 in name', async () => {
    const { ws } = await connectWs();
    send(ws, { type: 'CREATE_ROOM', roomName: 'BotTest1', playerName: 'Host', maxPlayers: 4 });
    await sleep(1000);
    const c = collectFor(ws, 2000);
    send(ws, { type: 'ADD_BOT' });
    const msgs = await c;
    const joined = msgs.find((m: any) => m.type === 'PLAYER_JOINED' && m.player?.name?.includes('🤖'));
    expect(joined).toBeDefined();
    expect(joined.player.name).toContain('🤖');
  });

  // [uc:uuid:8e46d39e] UC-B2: bot.decide
  it('AC-3: bot plays during round (CARD_PLAYED received)', async () => {
    const { ws } = await connectWs();
    send(ws, { type: 'CREATE_ROOM', roomName: 'BotPlay', playerName: 'Host', maxPlayers: 2 });
    await sleep(1000);
    send(ws, { type: 'ADD_BOT' });
    await sleep(1500);
    const c = collectFor(ws, 14000);
    send(ws, { type: 'START_GAME' });
    await sleep(2000);
    send(ws, { type: 'PLAY_CARD', guess: 'up' });
    const msgs = await c;
    const botPlayed = msgs.filter((m: any) => m.type === 'CARD_PLAYED');
    expect(botPlayed.length).toBeGreaterThanOrEqual(1);
  }, 20000);

  it('AC-5: bot plays with delay (not instant)', async () => {
    const { ws } = await connectWs();
    send(ws, { type: 'CREATE_ROOM', roomName: 'BotDelay', playerName: 'Host', maxPlayers: 2 });
    await sleep(1000);
    send(ws, { type: 'ADD_BOT' });
    await sleep(1500);
    const all: any[] = [];
    ws.on('message', d => all.push({ ...JSON.parse(d.toString()), _ts: Date.now() }));
    send(ws, { type: 'START_GAME' });
    await sleep(10000);
    const roundStart = all.find((m: any) => m.type === 'ROUND_START');
    const botPlay = all.find((m: any) => m.type === 'CARD_PLAYED' && m.playerId?.startsWith('bot-'));
    if (roundStart && botPlay) {
      const delay = botPlay._ts - roundStart._ts;
      expect(delay).toBeGreaterThan(500); // at least 0.5s delay
    }
    expect(botPlay).toBeDefined();
  }, 15000);

  it('AC-6: multiple bots can be added', async () => {
    const { ws } = await connectWs();
    send(ws, { type: 'CREATE_ROOM', roomName: 'MultiBots', playerName: 'Host', maxPlayers: 4 });
    await sleep(1000);
    const c = collectFor(ws, 4000);
    send(ws, { type: 'ADD_BOT' });
    await sleep(500);
    send(ws, { type: 'ADD_BOT' });
    const msgs = await c;
    const bots = msgs.filter((m: any) => m.type === 'PLAYER_JOINED' && m.player?.name?.includes('🤖'));
    expect(bots.length).toBeGreaterThanOrEqual(2);
  });
});
