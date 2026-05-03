/**
 * UC-CH1: chat.send + chat.history + chat.maxLength
 * @uc:uuid:0dfe22b0,8a319461
 *
 * Impl: server.ts:511 / GameRoom broadcast
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

describe('UC-CH1 chat.send [0dfe22b0]', () => {

  it('AC-1: CHAT_MESSAGE → broadcast to all in room', async () => {
    const { ws: wA } = await connectWs();
    send(wA, { type: 'CREATE_ROOM', roomName: 'ChatRoom', playerName: 'Alice', maxPlayers: 4 });
    await sleep(1000);
    const { ws: wB } = await connectWs();
    const cA = collectFor(wA, 2000);
    send(wB, { type: 'JOIN_ROOM', roomId: (await collectFor(wA, 100)).length ? undefined : undefined, playerName: 'Bob' });
    // Need room ID — get via LIST_ROOMS
    await sleep(500);
    const cList = collectFor(wB, 1500);
    send(wB, { type: 'LIST_ROOMS' });
    const listMsgs = await cList;
    const roomId = listMsgs.find((m: any) => m.type === 'ROOM_LIST')?.rooms?.find((r: any) => r.name === 'ChatRoom')?.id;
    send(wB, { type: 'JOIN_ROOM', roomId, playerName: 'Bob' });
    await sleep(1000);

    const cBob = collectFor(wB, 2000);
    const cAlice = collectFor(wA, 2000);
    send(wA, { type: 'CHAT_MESSAGE', text: 'hello world' });
    const bobMsgs = await cBob;
    const aliceMsgs = await cAlice;
    const bobChat = bobMsgs.find((m: any) => m.type === 'CHAT_MESSAGE' && m.text?.includes('hello'));
    const aliceChat = aliceMsgs.find((m: any) => m.type === 'CHAT_MESSAGE' && m.text?.includes('hello'));
    expect(bobChat).toBeDefined();
    expect(aliceChat).toBeDefined();
    expect(bobChat.senderName).toBe('Alice');
  });

  it('AC-3: text > 200 chars → truncated', async () => {
    const { ws: wA } = await connectWs();
    send(wA, { type: 'CREATE_ROOM', roomName: 'LongChat', playerName: 'Alice', maxPlayers: 2 });
    await sleep(1000);
    send(wA, { type: 'ADD_BOT' });
    await sleep(1000);
    const c = collectFor(wA, 2000);
    send(wA, { type: 'CHAT_MESSAGE', text: 'x'.repeat(300) });
    const msgs = await c;
    const chat = msgs.find((m: any) => m.type === 'CHAT_MESSAGE');
    expect(chat).toBeDefined();
    expect(chat.text.length).toBeLessThanOrEqual(200);
  });

  it('AC-4: new joiner receives CHAT_HISTORY', async () => {
    const { ws: wA } = await connectWs();
    send(wA, { type: 'CREATE_ROOM', roomName: 'HistRoom', playerName: 'Alice', maxPlayers: 4 });
    await sleep(1000);
    send(wA, { type: 'CHAT_MESSAGE', text: 'msg1' });
    send(wA, { type: 'CHAT_MESSAGE', text: 'msg2' });
    await sleep(500);

    const { ws: wB } = await connectWs();
    const cList = collectFor(wB, 1500);
    send(wB, { type: 'LIST_ROOMS' });
    const listMsgs = await cList;
    const roomId = listMsgs.find((m: any) => m.type === 'ROOM_LIST')?.rooms?.find((r: any) => r.name === 'HistRoom')?.id;

    const cB = collectFor(wB, 3000);
    send(wB, { type: 'JOIN_ROOM', roomId, playerName: 'Bob' });
    const msgs = await cB;
    const hist = msgs.find((m: any) => m.type === 'CHAT_HISTORY');
    expect(hist).toBeDefined();
    expect(hist.messages?.length).toBeGreaterThanOrEqual(2);
  });

  it('AC-6: empty text → no broadcast', async () => {
    const { ws: wA } = await connectWs();
    send(wA, { type: 'CREATE_ROOM', roomName: 'EmptyChat', playerName: 'Alice', maxPlayers: 2 });
    await sleep(1000);
    const c = collectFor(wA, 2000);
    send(wA, { type: 'CHAT_MESSAGE', text: '' });
    const msgs = await c;
    const chat = msgs.find((m: any) => m.type === 'CHAT_MESSAGE');
    expect(chat).toBeUndefined();
  });
});
