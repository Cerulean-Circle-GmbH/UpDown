/**
 * UC-GE1: game.end (allEliminated + leaderboard + playAgain)
 * @uc:uuid:38d62fef,e73e7784,e4bd6ed5
 *
 * Impl: GameRoom.ts:528 endGame(), :545 leaderboard sort
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
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

afterAll(() => { sockets.forEach(ws => ws.close()); });

describe('UC-GE1 game.end [38d62fef]', () => {

  it('AC-1: all eliminated → GAME_OVER', async () => {
    const { ws } = await connectWs();
    const all: any[] = [];
    ws.on('message', d => all.push(JSON.parse(d.toString())));
    send(ws, { type: 'CREATE_ROOM', roomName: 'EndTest', playerName: 'Tester', maxPlayers: 2 });
    await sleep(1000);
    send(ws, { type: 'ADD_BOT' });
    await sleep(1500);
    send(ws, { type: 'START_GAME' });

    // Don't play — get eliminated by timeout round 1. Bot plays solo until game ends.
    // Wait for GAME_OVER (bot vs deck, eventually one side wins)
    for (let i = 0; i < 15; i++) {
      await sleep(13000);
      if (all.find(m => m.type === 'GAME_OVER')) break;
    }
    const go = all.find(m => m.type === 'GAME_OVER');
    expect(go).toBeDefined();
  }, 210000);

  it('AC-3: leaderboard sorted by score DESC', async () => {
    const { ws } = await connectWs();
    const all: any[] = [];
    ws.on('message', d => all.push(JSON.parse(d.toString())));
    send(ws, { type: 'CREATE_ROOM', roomName: 'SortTest', playerName: 'Tester', maxPlayers: 2 });
    await sleep(1000);
    send(ws, { type: 'ADD_BOT' });
    await sleep(1500);
    send(ws, { type: 'START_GAME' });
    for (let i = 0; i < 5; i++) {
      await sleep(2000);
      send(ws, { type: 'PLAY_CARD', guess: 'up' });
      await sleep(12000);
      if (all.find(m => m.type === 'GAME_OVER')) break;
    }
    const go = all.find(m => m.type === 'GAME_OVER');
    if (go?.leaderboard?.length >= 2) {
      const sorted = go.leaderboard.every((p: any, i: number, arr: any[]) =>
        i === 0 || arr[i - 1].score >= p.score);
      expect(sorted).toBe(true);
    }
    expect(go).toBeDefined();
  }, 80000);

  it('AC-4: leaderboard has rank, name, score, rounds', async () => {
    const { ws } = await connectWs();
    const all: any[] = [];
    ws.on('message', d => all.push(JSON.parse(d.toString())));
    send(ws, { type: 'CREATE_ROOM', roomName: 'FieldsTest', playerName: 'Tester', maxPlayers: 2 });
    await sleep(1000);
    send(ws, { type: 'ADD_BOT' });
    await sleep(1500);
    send(ws, { type: 'START_GAME' });
    for (let i = 0; i < 5; i++) {
      await sleep(2000);
      send(ws, { type: 'PLAY_CARD', guess: 'equal' });
      await sleep(12000);
      if (all.find(m => m.type === 'GAME_OVER')) break;
    }
    const go = all.find(m => m.type === 'GAME_OVER');
    expect(go).toBeDefined();
    expect(go.leaderboard).toBeDefined();
    const p = go.leaderboard[0];
    expect(p.rank).toBe(1);
    expect(p.name).toBeDefined();
    expect(p.score).toBeDefined();
    expect(p.rounds).toBeDefined();
  }, 80000);

  it('AC-7: GAME_OVER contains playAgain:true', async () => {
    const { ws } = await connectWs();
    const all: any[] = [];
    ws.on('message', d => all.push(JSON.parse(d.toString())));
    send(ws, { type: 'CREATE_ROOM', roomName: 'PlayAgainTest', playerName: 'Tester', maxPlayers: 2 });
    await sleep(1000);
    send(ws, { type: 'ADD_BOT' });
    await sleep(1500);
    send(ws, { type: 'START_GAME' });
    for (let i = 0; i < 5; i++) {
      await sleep(2000);
      send(ws, { type: 'PLAY_CARD', guess: 'equal' });
      await sleep(12000);
      if (all.find(m => m.type === 'GAME_OVER')) break;
    }
    const go = all.find(m => m.type === 'GAME_OVER');
    expect(go).toBeDefined();
    expect(go.playAgain).toBe(true);
  }, 80000);
});
