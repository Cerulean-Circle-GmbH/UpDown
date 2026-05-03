/**
 * UC-R4: room.join + R5/R6 private + R7 full + R10 leave + H1 host.transfer
 * @uc:uuid:9cc60247,61449e82,148f2e73,d0b57a5a,96f2ecd5,dd0392cf
 *
 * Impl: GameRoom.ts:103 addPlayer(), :254 removePlayer(), :277 host transfer
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

describe('UC-R4 room.join [9cc60247]', () => {

  it('AC-1: join returns ROOM_JOINED with players including self', async () => {
    const { ws: wA } = await connectWs();
    const cA = collectFor(wA, 2000);
    send(wA, { type: 'CREATE_ROOM', roomName: 'JoinTest', playerName: 'Alice', maxPlayers: 4 });
    const mA = await cA;
    const roomId = mA.find((m: any) => m.type === 'ROOM_JOINED')?.room?.id;

    const { ws: wB, playerId: idB } = await connectWs();
    const cB = collectFor(wB, 2000);
    send(wB, { type: 'JOIN_ROOM', roomId, playerName: 'Bob' });
    const mB = await cB;
    const joined = mB.find((m: any) => m.type === 'ROOM_JOINED');
    expect(joined).toBeDefined();
    expect(joined.players.length).toBeGreaterThanOrEqual(2);
    expect(joined.players.find((p: any) => p.id === idB)).toBeDefined();
  });

  it('AC-2: existing players notified via PLAYER_JOINED', async () => {
    const { ws: wA } = await connectWs();
    const cA1 = collectFor(wA, 2000);
    send(wA, { type: 'CREATE_ROOM', roomName: 'NotifyTest', playerName: 'Alice', maxPlayers: 4 });
    await cA1;

    const cA2 = collectFor(wA, 3000);
    const { ws: wB } = await connectWs();
    send(wB, { type: 'JOIN_ROOM', roomId: (await cA1).find((m: any) => m.type === 'ROOM_JOINED')?.room?.id, playerName: 'Bob' });
    const mA2 = await cA2;
    const notif = mA2.find((m: any) => m.type === 'PLAYER_JOINED');
    expect(notif).toBeDefined();
    expect(notif.playerCount).toBeGreaterThanOrEqual(2);
    expect(notif.player.name).toBe('Bob');
  });

  it('AC-3: correct key on private room → join succeeds', async () => {
    const { ws: wA } = await connectWs();
    const cA = collectFor(wA, 2000);
    send(wA, { type: 'CREATE_ROOM', roomName: 'Private', playerName: 'Alice', maxPlayers: 2, roomKey: 'secret' });
    const mA = await cA;
    const roomId = mA.find((m: any) => m.type === 'ROOM_JOINED')?.room?.id;

    const { ws: wB } = await connectWs();
    const cB = collectFor(wB, 2000);
    send(wB, { type: 'JOIN_ROOM', roomId, roomKey: 'secret', playerName: 'Bob' });
    const mB = await cB;
    expect(mB.find((m: any) => m.type === 'ROOM_JOINED')).toBeDefined();
  });

  it('AC-4: wrong key → ERROR', async () => {
    const { ws: wA } = await connectWs();
    const cA = collectFor(wA, 2000);
    send(wA, { type: 'CREATE_ROOM', roomName: 'Locked', playerName: 'Alice', maxPlayers: 2, roomKey: 'right' });
    const mA = await cA;
    const roomId = mA.find((m: any) => m.type === 'ROOM_JOINED')?.room?.id;

    const { ws: wB } = await connectWs();
    const cB = collectFor(wB, 2000);
    send(wB, { type: 'JOIN_ROOM', roomId, roomKey: 'wrong', playerName: 'Eve' });
    const mB = await cB;
    expect(mB.find((m: any) => m.type === 'ERROR')).toBeDefined();
  });

  it('AC-5: full room → ERROR', async () => {
    const { ws: wA } = await connectWs();
    const cA = collectFor(wA, 2000);
    send(wA, { type: 'CREATE_ROOM', roomName: 'TinyRoom', playerName: 'Alice', maxPlayers: 2 });
    const mA = await cA;
    const roomId = mA.find((m: any) => m.type === 'ROOM_JOINED')?.room?.id;

    const { ws: wB } = await connectWs();
    send(wB, { type: 'JOIN_ROOM', roomId, playerName: 'Bob' });
    await sleep(1000);

    const { ws: wC } = await connectWs();
    const cC = collectFor(wC, 2000);
    send(wC, { type: 'JOIN_ROOM', roomId, playerName: 'Charlie' });
    const mC = await cC;
    expect(mC.find((m: any) => m.type === 'ERROR')).toBeDefined();
  });

  it('AC-8: leave room → PLAYER_LEFT + ROOM_LIST to leaver', async () => {
    const { ws: wA } = await connectWs();
    const cA = collectFor(wA, 2000);
    send(wA, { type: 'CREATE_ROOM', roomName: 'LeaveTest', playerName: 'Alice', maxPlayers: 4 });
    const mA = await cA;
    const roomId = mA.find((m: any) => m.type === 'ROOM_JOINED')?.room?.id;

    const { ws: wB } = await connectWs();
    send(wB, { type: 'JOIN_ROOM', roomId, playerName: 'Bob' });
    await sleep(1000);

    const cA2 = collectFor(wA, 3000);
    const cB2 = collectFor(wB, 3000);
    send(wB, { type: 'LEAVE_ROOM' });
    const mA2 = await cA2;
    const mB2 = await cB2;

    expect(mA2.find((m: any) => m.type === 'PLAYER_LEFT')).toBeDefined();
    expect(mB2.find((m: any) => m.type === 'ROOM_LEFT' || m.type === 'ROOM_LIST')).toBeDefined();
  });

  it('AC-9: host leaves → HOST_CHANGED to next player', async () => {
    const { ws: wA } = await connectWs();
    const cA = collectFor(wA, 2000);
    send(wA, { type: 'CREATE_ROOM', roomName: 'HostLeave', playerName: 'Alice', maxPlayers: 4 });
    const mA = await cA;
    const roomId = mA.find((m: any) => m.type === 'ROOM_JOINED')?.room?.id;

    const { ws: wB } = await connectWs();
    const cB1 = collectFor(wB, 2000);
    send(wB, { type: 'JOIN_ROOM', roomId, playerName: 'Bob' });
    await cB1;

    const cB2 = collectFor(wB, 3000);
    wA.close();
    sockets.splice(sockets.indexOf(wA), 1);
    const mB2 = await cB2;
    const hostChanged = mB2.find((m: any) => m.type === 'HOST_CHANGED');
    expect(hostChanged).toBeDefined();
  });
});
