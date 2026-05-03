/**
 * UC-R2: room.create + UC-R3: room.create.private + UC-R1: rooms.list
 * @uc:uuid:fbfed148,177c8da5,1c21171d,7cd55a0b
 *
 * Verifies room creation, host assignment, privacy, and list visibility.
 * Impl: WebSocketClient.ts:60 createRoom() / RoomManager.ts:643 / GameRoom.ts:103
 */

import { describe, it, expect, afterAll } from 'vitest';
import WebSocket from 'ws';

const WS_URL = 'wss://localhost:3443';
const WS_OPTS = { rejectUnauthorized: false };

const openSockets: WebSocket[] = [];

function connectWs(): Promise<{ ws: WebSocket; playerId: string }> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL, WS_OPTS);
    const timeout = setTimeout(() => reject(new Error('connect timeout')), 5000);
    ws.on('error', reject);
    ws.on('message', (d) => {
      const m = JSON.parse(d.toString());
      if (m.type === 'welcome') {
        clearTimeout(timeout);
        openSockets.push(ws);
        resolve({ ws, playerId: m.clientId });
      }
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

afterAll(() => {
  openSockets.forEach(ws => ws.close());
});

describe('UC-R2 room.create [fbfed148]', () => {

  let publicRoomId: string;
  let privateRoomId: string;
  let hostId: string;

  // AC-1: CREATE_ROOM returns ROOM_JOINED with id, name, maxPlayers
  it('AC-1: CREATE_ROOM returns ROOM_JOINED with id, name, maxPlayers', async () => {
    const { ws, playerId } = await connectWs();
    hostId = playerId;
    const collect = collectFor(ws, 2000);
    send(ws, { type: 'CREATE_ROOM', roomName: 'Vitest Room', playerName: 'Alice', maxPlayers: 4 });
    const msgs = await collect;
    const joined = msgs.find((m: any) => m.type === 'ROOM_JOINED');
    expect(joined).toBeDefined();
    expect(joined.room.id).toBeDefined();
    expect(typeof joined.room.id).toBe('string');
    expect(joined.room.id.length).toBeGreaterThan(0);
    expect(joined.room.name).toBe('Vitest Room');
    expect(joined.room.maxPlayers).toBe(4);
    publicRoomId = joined.room.id;
  });

  // AC-2: creator becomes host (hostId === playerId)
  // @uc:uuid:177c8da5
  it('AC-2: creator becomes host', async () => {
    const { ws, playerId } = await connectWs();
    const collect = collectFor(ws, 2000);
    send(ws, { type: 'CREATE_ROOM', roomName: 'Host Test', playerName: 'HostCheck', maxPlayers: 2 });
    const msgs = await collect;
    const joined = msgs.find((m: any) => m.type === 'ROOM_JOINED');
    expect(joined).toBeDefined();
    expect(joined.room.hostId).toBe(playerId);
  });

  // AC-3: roomKey makes room private
  // @uc:uuid:1c21171d
  it('AC-3: roomKey makes room private', async () => {
    const { ws } = await connectWs();
    const collect = collectFor(ws, 2000);
    send(ws, { type: 'CREATE_ROOM', roomName: 'Secret Room', playerName: 'Dave', maxPlayers: 2, roomKey: 'mykey' });
    const msgs = await collect;
    const joined = msgs.find((m: any) => m.type === 'ROOM_JOINED');
    expect(joined).toBeDefined();
    expect(joined.room.isPrivate).toBe(true);
    privateRoomId = joined.room.id;
  });

  // AC-4: private room hidden from LIST_ROOMS
  // @uc:uuid:7cd55a0b
  it('AC-4: private room hidden from LIST_ROOMS', async () => {
    const { ws } = await connectWs();
    const collect = collectFor(ws, 2000);
    send(ws, { type: 'LIST_ROOMS' });
    const msgs = await collect;
    const list = msgs.find((m: any) => m.type === 'ROOM_LIST');
    expect(list).toBeDefined();
    const found = list.rooms.find((r: any) => r.id === privateRoomId);
    expect(found).toBeUndefined();
  });

  // AC-5: public room visible in LIST_ROOMS
  it('AC-5: public room visible in LIST_ROOMS', async () => {
    const { ws: wCreator } = await connectWs();
    const cCreate = collectFor(wCreator, 2000);
    send(wCreator, { type: 'CREATE_ROOM', roomName: 'ListVisible', playerName: 'Lister', maxPlayers: 3 });
    const createMsgs = await cCreate;
    const myRoomId = createMsgs.find((m: any) => m.type === 'ROOM_JOINED')?.room?.id;
    expect(myRoomId).toBeDefined();

    const { ws: wChecker } = await connectWs();
    const cList = collectFor(wChecker, 2000);
    send(wChecker, { type: 'LIST_ROOMS' });
    const listMsgs = await cList;
    const list = listMsgs.find((m: any) => m.type === 'ROOM_LIST');
    expect(list).toBeDefined();
    const found = list.rooms.find((r: any) => r.id === myRoomId);
    expect(found).toBeDefined();
  });

  // AC-6: playerCount is 1 after creation
  it('AC-6: playerCount is 1 after creation', async () => {
    const { ws } = await connectWs();
    const collect = collectFor(ws, 2000);
    send(ws, { type: 'CREATE_ROOM', roomName: 'Count Test', playerName: 'Solo', maxPlayers: 3 });
    const msgs = await collect;
    const joined = msgs.find((m: any) => m.type === 'ROOM_JOINED');
    expect(joined).toBeDefined();
    expect(joined.room.playerCount).toBe(1);
  });

  // AC-7: creator in players[] array
  it('AC-7: creator in players[] array', async () => {
    const { ws, playerId } = await connectWs();
    const collect = collectFor(ws, 2000);
    send(ws, { type: 'CREATE_ROOM', roomName: 'Players Test', playerName: 'Creator', maxPlayers: 2 });
    const msgs = await collect;
    const joined = msgs.find((m: any) => m.type === 'ROOM_JOINED');
    expect(joined).toBeDefined();
    expect(joined.players).toBeDefined();
    expect(joined.players.length).toBe(1);
    expect(joined.players[0].id).toBe(playerId);
    expect(joined.players[0].name).toBe('Creator');
  });
});
