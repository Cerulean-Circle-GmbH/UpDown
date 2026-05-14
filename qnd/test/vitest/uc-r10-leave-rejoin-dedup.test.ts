/**
 * UC-R10: room.leave + rejoin — no duplicate players
 * @uc:uuid:96f2ecd5
 *
 * Regression test: leave room then rejoin must not create duplicate player entries.
 * Two clients leave and rejoin — player list must stay at exactly 2.
 *
 * Impl: GameRoom.ts:254 removePlayer() / GameRoom.ts:103 addPlayer()
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

function collect(ws: WebSocket, ms: number): Promise<any[]> {
  return new Promise(r => {
    const msgs: any[] = [];
    const h = (d: any) => msgs.push(JSON.parse(d.toString()));
    ws.on('message', h);
    setTimeout(() => { ws.off('message', h); r(msgs); }, ms);
  });
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

afterAll(() => { sockets.forEach(ws => ws.close()); });

describe('UC-R10 leave+rejoin dedup [96f2ecd5]', () => {

  it('leave and rejoin does not create duplicate player entries', async () => {
    // Step 1: Client A creates room
    const { ws: wA, playerId: idA } = await connectWs();
    const cCreate = collect(wA, 2000);
    send(wA, { type: 'CREATE_ROOM', roomName: 'DedupTest', playerName: 'Alice', maxPlayers: 4 });
    const createMsgs = await cCreate;
    const roomId = createMsgs.find(m => m.type === 'ROOM_JOINED')?.room?.id;
    expect(roomId).toBeDefined();

    // Step 2: Client B joins
    const { ws: wB, playerId: idB } = await connectWs();
    const cJoinB = collect(wB, 2000);
    send(wB, { type: 'JOIN_ROOM', roomId, playerName: 'Bob' });
    const joinBMsgs = await cJoinB;
    const bobJoined = joinBMsgs.find(m => m.type === 'ROOM_JOINED');
    expect(bobJoined).toBeDefined();
    expect(bobJoined.players.length).toBe(2);

    // Step 3: Client A leaves then rejoins
    send(wA, { type: 'LEAVE_ROOM' });
    await sleep(1000);

    const { ws: wA2, playerId: idA2 } = await connectWs();
    const cRejoinA = collect(wA2, 2000);
    send(wA2, { type: 'JOIN_ROOM', roomId, playerName: 'Alice' });
    const rejoinAMsgs = await cRejoinA;
    const aliceRejoined = rejoinAMsgs.find(m => m.type === 'ROOM_JOINED');
    expect(aliceRejoined).toBeDefined();

    const playersAfterA = aliceRejoined.players;
    expect(playersAfterA.length).toBe(2);

    // Step 4: Client B leaves then re-enters
    send(wB, { type: 'LEAVE_ROOM' });
    await sleep(1000);

    const { ws: wB2, playerId: idB2 } = await connectWs();
    const cRejoinB = collect(wB2, 2000);
    send(wB2, { type: 'JOIN_ROOM', roomId, playerName: 'Bob' });
    const rejoinBMsgs = await cRejoinB;
    const bobRejoined = rejoinBMsgs.find(m => m.type === 'ROOM_JOINED');
    expect(bobRejoined).toBeDefined();

    // Step 5: Assert exactly 2 players — no duplicates
    const finalPlayers = bobRejoined.players;
    expect(finalPlayers.length).toBe(2);

    const names = finalPlayers.map((p: any) => p.name);
    expect(names).toContain('Alice');
    expect(names).toContain('Bob');

    // No duplicate names
    const uniqueNames = [...new Set(names)];
    expect(uniqueNames.length).toBe(names.length);

    // No duplicate IDs
    const ids = finalPlayers.map((p: any) => p.id);
    const uniqueIds = [...new Set(ids)];
    expect(uniqueIds.length).toBe(ids.length);
  }, 30000);
});
