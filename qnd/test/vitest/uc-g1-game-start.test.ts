/**
 * UC-G1: game.start + RD1 round.start + RD2 countdown + G2 autoFill + H4 nonHost
 * @uc:uuid:560d9a46,f8e39106,224c5b9e,f89b9338,57311798
 *
 * Impl: GameRoom.ts:290 startGame(), :315 nextRound(), :369 startCountdown()
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

describe('UC-G1 game.start [560d9a46]', () => {

  it('AC-1: START_GAME → ROUND_START with round:1, card, countdown:10', async () => {
    const { ws: wA, playerId: idA } = await connectWs();
    send(wA, { type: 'CREATE_ROOM', roomName: 'StartTest', playerName: 'Alice', maxPlayers: 2 });
    await sleep(1500);
    const { ws: wB } = await connectWs();
    // Get roomId from a fresh LIST_ROOMS
    const cList = collectFor(wA, 2000);
    send(wA, { type: 'LIST_ROOMS' });
    const listMsgs = await cList;
    const rooms = listMsgs.find((m: any) => m.type === 'ROOM_LIST')?.rooms;
    const roomId = rooms?.find((r: any) => r.name === 'StartTest')?.id;
    send(wB, { type: 'JOIN_ROOM', roomId, playerName: 'Bob' });
    await sleep(1500);

    const cAll = collectFor(wA, 5000);
    send(wA, { type: 'START_GAME' });
    const msgs = await cAll;
    const rs = msgs.find((m: any) => m.type === 'ROUND_START');
    expect(rs).toBeDefined();
    expect(rs.round).toBe(1);
    expect(rs.currentCard).toBeDefined();
    expect(rs.currentCard.suit).toBeDefined();
    expect(rs.currentCard.value).toBeDefined();
    expect(rs.countdown).toBe(10);
  });

  it('AC-2: alivePlayers[] contains all player IDs', async () => {
    const { ws: wA, playerId: idA } = await connectWs();
    const cA = collectFor(wA, 2000);
    send(wA, { type: 'CREATE_ROOM', roomName: 'AliveTest', playerName: 'Alice', maxPlayers: 2 });
    await cA;
    const roomId = (await cA).find((m: any) => m.type === 'ROOM_JOINED')?.room?.id;
    const { ws: wB, playerId: idB } = await connectWs();
    send(wB, { type: 'JOIN_ROOM', roomId, playerName: 'Bob' });
    await sleep(1000);

    const cAll = collectFor(wA, 3000);
    send(wA, { type: 'START_GAME' });
    const msgs = await cAll;
    const rs = msgs.find((m: any) => m.type === 'ROUND_START');
    expect(rs.alivePlayers).toBeDefined();
    expect(rs.alivePlayers).toContain(idA);
    expect(rs.alivePlayers).toContain(idB);
  });

  it('AC-3: cardsLeft reflects deck + gmHand size', async () => {
    const { ws: wA } = await connectWs();
    const cA = collectFor(wA, 2000);
    send(wA, { type: 'CREATE_ROOM', roomName: 'DeckTest', playerName: 'Alice', maxPlayers: 2 });
    await cA;
    send(wA, { type: 'ADD_BOT' });
    await sleep(1000);

    const cAll = collectFor(wA, 3000);
    send(wA, { type: 'START_GAME' });
    const msgs = await cAll;
    const rs = msgs.find((m: any) => m.type === 'ROUND_START');
    expect(rs.cardsLeft).toBeDefined();
    expect(typeof rs.cardsLeft).toBe('number');
    expect(rs.cardsLeft).toBeGreaterThan(0);
  });

  it('AC-5: countdown ticks received', async () => {
    const { ws: wA } = await connectWs();
    const cA = collectFor(wA, 2000);
    send(wA, { type: 'CREATE_ROOM', roomName: 'CountdownTest', playerName: 'Alice', maxPlayers: 2 });
    await cA;
    send(wA, { type: 'ADD_BOT' });
    await sleep(1000);

    const cAll = collectFor(wA, 5000);
    send(wA, { type: 'START_GAME' });
    const msgs = await cAll;
    const ticks = msgs.filter((m: any) => m.type === 'COUNTDOWN');
    expect(ticks.length).toBeGreaterThanOrEqual(2);
    expect(ticks[0].seconds).toBeLessThan(10);
  });

  it('AC-6: non-host START_GAME rejected or ignored', async () => {
    const { ws: wA } = await connectWs();
    const cA = collectFor(wA, 2000);
    send(wA, { type: 'CREATE_ROOM', roomName: 'NonHostTest', playerName: 'Alice', maxPlayers: 4 });
    await cA;
    const roomId = (await cA).find((m: any) => m.type === 'ROOM_JOINED')?.room?.id;

    const { ws: wB } = await connectWs();
    send(wB, { type: 'JOIN_ROOM', roomId, playerName: 'Bob' });
    await sleep(1000);

    const cB = collectFor(wB, 3000);
    send(wB, { type: 'START_GAME' });
    const msgs = await cB;
    const roundStart = msgs.find((m: any) => m.type === 'ROUND_START');
    expect(roundStart).toBeUndefined();
  });

  it('AC-7: ADD_BOT before start → bot in game', async () => {
    const { ws: wA } = await connectWs();
    const cA = collectFor(wA, 2000);
    send(wA, { type: 'CREATE_ROOM', roomName: 'BotStartTest', playerName: 'Alice', maxPlayers: 2 });
    await cA;

    const cBot = collectFor(wA, 2000);
    send(wA, { type: 'ADD_BOT' });
    const botMsgs = await cBot;
    const botJoined = botMsgs.find((m: any) => m.type === 'PLAYER_JOINED' && m.player?.name?.includes('🤖'));
    expect(botJoined).toBeDefined();

    const cStart = collectFor(wA, 3000);
    send(wA, { type: 'START_GAME' });
    const startMsgs = await cStart;
    const rs = startMsgs.find((m: any) => m.type === 'ROUND_START');
    expect(rs).toBeDefined();
    expect(rs.alivePlayers.length).toBe(2);
  });
});
