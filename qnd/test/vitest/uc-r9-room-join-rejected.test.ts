/**
 * UC-R9: room.join.rejected — join during active countdown phase
 * [uc:uuid:d466a7f1]
 *
 * Impl: GameRoom.ts addPlayer() — state !== 'waiting' && state !== 'exchange' → false
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

function send(ws: WebSocket, data: object) { ws.send(JSON.stringify(data)); }

function collectFor(ws: WebSocket, ms: number): Promise<any[]> {
  return new Promise((resolve) => {
    const msgs: any[] = [];
    const handler = (d: any) => msgs.push(JSON.parse(d.toString()));
    ws.on('message', handler);
    setTimeout(() => { ws.off('message', handler); resolve(msgs); }, ms);
  });
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

afterAll(() => { sockets.forEach(ws => ws.close()); });

describe('UC-R9 room.join.rejected [d466a7f1]', () => {

  // [uc:uuid:d466a7f1] UC-R9: room.join.rejected — join during active countdown
  it('AC-1: joining during countdown phase returns ERROR', async () => {
    // Create room with a bot and start game
    const { ws: wA } = await connectWs();
    send(wA, { type: 'CREATE_ROOM', roomName: 'Active Game', playerName: 'Alice', maxPlayers: 5 });
    await sleep(1000);
    send(wA, { type: 'ADD_BOT' });
    await sleep(500);
    send(wA, { type: 'START_GAME' });

    // Wait for ROUND_START (game is now in countdown)
    await sleep(2000);

    // Get room ID
    const { ws: wB } = await connectWs();
    const cList = collectFor(wB, 500);
    send(wB, { type: 'LIST_ROOMS' });
    const listMsgs = await cList;
    const roomList = listMsgs.find(m => m.type === 'ROOM_LIST');
    const roomId = roomList?.rooms?.[0]?.id;
    expect(roomId).toBeDefined();

    // Try to join during countdown — should be rejected
    const cJoin = collectFor(wB, 1000);
    send(wB, { type: 'JOIN_ROOM', roomId, playerName: 'Bob' });
    const joinMsgs = await cJoin;
    const error = joinMsgs.find(m => m.type === 'ERROR');
    expect(error).toBeDefined();
    expect(error.message).toContain('full or game in progress');
  }, 15000);
});
