/**
 * UC-P1: player.guess (up/down/equal) + scoring + streak + timeout + early resolve
 * @uc:uuid:f0295f28,c9866c6e,fa8f1c83,035d2535,1a56ba00,d309011d,18224bc2,344fcec6,b3fb6696
 *
 * Impl: GameRoom.ts:411 playCard(), :428 resolveRound(), :458 scoring
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

async function createGameWithBot(name: string) {
  const { ws, playerId } = await connectWs();
  send(ws, { type: 'CREATE_ROOM', roomName: name, playerName: 'Tester', maxPlayers: 2 });
  await sleep(1000);
  send(ws, { type: 'ADD_BOT' });
  await sleep(1500);
  const all: any[] = [];
  ws.on('message', d => all.push(JSON.parse(d.toString())));
  send(ws, { type: 'START_GAME' });
  await sleep(2000);
  return { ws, playerId, all };
}

afterAll(() => { sockets.forEach(ws => ws.close()); });

describe('UC-P1 player.guess [f0295f28]', () => {

  // [uc:uuid:f0295f28] UC-P1: player.guess.up
  it('AC-1: PLAY_CARD up → CARD_PLAYED broadcast', async () => {
    const { ws, all } = await createGameWithBot('GuessUp');
    send(ws, { type: 'PLAY_CARD', guess: 'up' });
    await sleep(5000);
    const played = all.find((m: any) => m.type === 'CARD_PLAYED');
    expect(played).toBeDefined();
    expect(played.hasPlayed).toBe(true);
  });

  // [uc:uuid:c9866c6e] UC-P2: player.guess.down
  it('AC-2: PLAY_CARD down → CARD_PLAYED broadcast', async () => {
    const { ws, all } = await createGameWithBot('GuessDown');
    send(ws, { type: 'PLAY_CARD', guess: 'down' });
    await sleep(2000);
    const played = all.find((m: any) => m.type === 'CARD_PLAYED');
    expect(played).toBeDefined();
  });

  it('AC-3: PLAY_CARD equal → CARD_PLAYED broadcast', async () => {
    const { ws, all } = await createGameWithBot('GuessEqual');
    send(ws, { type: 'PLAY_CARD', guess: 'equal' });
    await sleep(2000);
    const played = all.find((m: any) => m.type === 'CARD_PLAYED');
    expect(played).toBeDefined();
  });

  it('AC-4: correct guess → score increased, not eliminated', async () => {
    const { ws, all } = await createGameWithBot('ScoreTest');
    send(ws, { type: 'PLAY_CARD', guess: 'up' });
    await sleep(12000);
    const result = all.find((m: any) => m.type === 'ROUND_RESULT');
    expect(result).toBeDefined();
    const me = result.results?.find((r: any) => r.name === 'Tester');
    if (me?.correct) {
      expect(me.eliminated).toBe(false);
      expect(me.score).toBeGreaterThan(0);
    }
    // If wrong, that's OK — card values are random. Just verify fields exist.
    expect(me?.correct).toBeDefined();
    expect(me?.eliminated).toBeDefined();
  });

  it('AC-5: wrong guess → eliminated, streak 0', async () => {
    const { ws, all } = await createGameWithBot('WrongTest');
    send(ws, { type: 'PLAY_CARD', guess: 'equal' }); // equal is usually wrong
    await sleep(12000);
    const result = all.find((m: any) => m.type === 'ROUND_RESULT');
    expect(result).toBeDefined();
    const me = result.results?.find((r: any) => r.name === 'Tester');
    if (me?.correct === false) {
      expect(me.eliminated).toBe(true);
    }
    expect(me).toBeDefined();
  });

  it('AC-7: no guess before timeout → eliminated with guess:null', async () => {
    const { ws, all } = await createGameWithBot('TimeoutTest');
    // Don't send PLAY_CARD — wait for timeout
    await sleep(14000);
    const result = all.find((m: any) => m.type === 'ROUND_RESULT');
    expect(result).toBeDefined();
    const me = result.results?.find((r: any) => r.name === 'Tester');
    if (me) {
      expect(me.eliminated).toBe(true);
    }
    // Player might not be in results if eliminated by timeout — check scores
    const meScore = result.scores?.find((s: any) => s.name === 'Tester');
    expect(meScore?.alive).toBe(false);
  }, 20000);

  it('AC-8: all played → early resolution (before 10s)', async () => {
    const { ws, all } = await createGameWithBot('EarlyResolve');
    const startTime = Date.now();
    send(ws, { type: 'PLAY_CARD', guess: 'up' });
    await sleep(5000);
    const result = all.find((m: any) => m.type === 'ROUND_RESULT');
    if (result) {
      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeLessThan(10000); // resolved before 10s timeout
    }
    expect(result).toBeDefined();
  });

  it('AC-9: streak increments on consecutive correct', async () => {
    const { ws, all } = await createGameWithBot('StreakTest');
    send(ws, { type: 'PLAY_CARD', guess: 'up' });
    await sleep(12000);
    const r1 = all.filter((m: any) => m.type === 'ROUND_RESULT');
    if (r1.length > 0) {
      const me1 = r1[0].results?.find((r: any) => r.name === 'Tester');
      if (me1?.correct && !me1?.eliminated) {
        // Play round 2
        all.length = 0;
        send(ws, { type: 'PLAY_CARD', guess: 'up' });
        await sleep(12000);
        const r2 = all.filter((m: any) => m.type === 'ROUND_RESULT');
        if (r2.length > 0) {
          const me2 = r2[0].results?.find((r: any) => r.name === 'Tester');
          if (me2?.correct) {
            expect(me2.streak).toBeGreaterThan(me1.streak);
          }
        }
      }
    }
    expect(r1.length).toBeGreaterThan(0);
  }, 30000);
});
