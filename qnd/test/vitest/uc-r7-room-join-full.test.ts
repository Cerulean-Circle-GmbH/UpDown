/**
 * UC-R7: room.join.full — join when room is at maxPlayers
 * [uc:uuid:d0b57a5a]
 *
 * Impl: GameRoom.ts addPlayer() — size >= maxPlayers returns false
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

describe('UC-R7 room.join.full [d0b57a5a]', () => {

  // [uc:uuid:d0b57a5a] UC-R7: room.join.full
  it('AC-1: joining a full room returns ERROR', async () => {
    // Create room with maxPlayers=2
    const { ws: wA } = await connectWs();
    send(wA, { type: 'CREATE_ROOM', roomName: 'Tiny Room', playerName: 'Alice', maxPlayers: 2 });
    await sleep(500);

    // Second player joins — should succeed
    const { ws: wB } = await connectWs();
    const cB = collectFor(wB, 1000);
    send(wB, { type: 'JOIN_ROOM', roomId: '', playerName: 'Bob' });
    await sleep(200);

    // Get room ID from Alice's messages
    const cA = collectFor(wA, 500);
    send(wA, { type: 'LIST_ROOMS' });
    const msgsA = await cA;
    const roomList = msgsA.find(m => m.type === 'ROOM_LIST');
    const roomId = roomList?.rooms?.[0]?.id;
    expect(roomId).toBeDefined();

    // Bob joins with actual room ID
    const { ws: wB2 } = await connectWs();
    const cB2 = collectFor(wB2, 1000);
    send(wB2, { type: 'JOIN_ROOM', roomId, playerName: 'Bob' });
    const msgsB2 = await cB2;
    const joined = msgsB2.find(m => m.type === 'ROOM_JOINED');
    expect(joined).toBeDefined();

    // Third player joins — room full, should get ERROR
    const { ws: wC } = await connectWs();
    const cC = collectFor(wC, 1000);
    send(wC, { type: 'JOIN_ROOM', roomId, playerName: 'Charlie' });
    const msgsC = await cC;
    const error = msgsC.find(m => m.type === 'ERROR');
    expect(error).toBeDefined();
    expect(error.message).toContain('full');
  });
});
