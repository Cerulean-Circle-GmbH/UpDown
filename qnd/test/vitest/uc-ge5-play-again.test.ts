/**
 * UC-GE5: game.end.playAgain — Full Replay Flow
 * @uc:uuid:ea33c5b7
 *
 * 6 test cases from task-35.5-tester-gui-replay-verification.md
 * Simulates exact client message sequence including ROOM_RESET handling.
 *
 * Impl: GameRoom.ts resetForReplay() / server.ts PLAY_AGAIN handler
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

function waitForType(ws: WebSocket, type: string, timeoutMs = 30000): Promise<any> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout waiting for ${type}`)), timeoutMs);
    const h = (d: any) => {
      const m = JSON.parse(d.toString());
      if (m.type === type) { clearTimeout(t); ws.off('message', h); resolve(m); }
    };
    ws.on('message', h);
  });
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function createRoomAndJoin(playerA: string, playerB: string, maxPlayers = 2): Promise<{
  wA: WebSocket; wB: WebSocket; idA: string; idB: string; roomId: string;
}> {
  const { ws: wA, playerId: idA } = await connectWs();
  const cA = collect(wA, 2000);
  send(wA, { type: 'CREATE_ROOM', playerName: playerA, maxPlayers });
  const msgsA = await cA;
  const roomId = msgsA.find((m: any) => m.type === 'ROOM_JOINED')?.room?.id;
  expect(roomId).toBeDefined();

  const { ws: wB, playerId: idB } = await connectWs();
  const cB = collect(wB, 2000);
  send(wB, { type: 'JOIN_ROOM', roomId, playerName: playerB });
  const msgsB = await cB;
  expect(msgsB.find((m: any) => m.type === 'ROOM_JOINED')).toBeDefined();

  return { wA, wB, idA, idB, roomId };
}

async function playUntilGameOver(wA: WebSocket, wB: WebSocket): Promise<any> {
  return new Promise((resolve) => {
    const handler = (d: any) => {
      const m = JSON.parse(d.toString());
      if (m.type === 'ROUND_START') {
        setTimeout(() => {
          send(wA, { type: 'PLAY_CARD', guess: 'up' });
          send(wB, { type: 'PLAY_CARD', guess: 'up' });
        }, 300);
      }
      if (m.type === 'GAME_OVER') {
        wA.off('message', handler);
        resolve(m);
      }
    };
    wA.on('message', handler);
  });
}

afterAll(() => { sockets.forEach(ws => ws.close()); });

// TC-35.5.1: Full Replay Flow
describe('TC-35.5.1: Full Replay Flow [ea33c5b7]', () => {

  it('creates room, plays game, PLAY_AGAIN resets, second game works', async () => {
    const { wA, wB, idA, idB, roomId } = await createRoomAndJoin('Alice', 'Bob');

    // Start game
    send(wA, { type: 'START_GAME' });
    const gameOver = await playUntilGameOver(wA, wB);
    expect(gameOver).toBeDefined();
    expect(gameOver.leaderboard).toBeDefined();

    // Play Again
    const cResetA = collect(wA, 3000);
    const cResetB = collect(wB, 3000);
    send(wA, { type: 'PLAY_AGAIN' });
    const resetMsgsA = await cResetA;
    const resetMsgsB = await cResetB;

    // VERIFY: Both receive ROOM_RESET with state='waiting'
    const resetA = resetMsgsA.find((m: any) => m.type === 'ROOM_RESET');
    const resetB = resetMsgsB.find((m: any) => m.type === 'ROOM_RESET');
    expect(resetA).toBeDefined();
    expect(resetB).toBeDefined();
    expect(resetA.room.state).toBe('waiting');

    // VERIFY: Player list includes both A and B
    expect(resetA.players.length).toBeGreaterThanOrEqual(2);
    const playerIds = resetA.players.map((p: any) => p.id);
    expect(playerIds).toContain(idA);
    expect(playerIds).toContain(idB);

    // VERIFY: Scores are 0 for both
    for (const p of resetA.players) {
      expect(p.score).toBe(0);
    }

    // Start second game
    send(wA, { type: 'START_GAME' });
    const gameOver2 = await playUntilGameOver(wA, wB);
    expect(gameOver2).toBeDefined();
    expect(gameOver2.leaderboard).toBeDefined();
  }, 60000);
});

// TC-35.5.2: Non-Host Play Again
describe('TC-35.5.2: Non-Host Play Again [ea33c5b7]', () => {

  it('non-host can trigger PLAY_AGAIN', async () => {
    const { wA, wB, idA, idB } = await createRoomAndJoin('Host', 'NonHost');

    send(wA, { type: 'START_GAME' });
    await playUntilGameOver(wA, wB);

    // Bob (non-host) sends PLAY_AGAIN
    const cResetA = collect(wA, 3000);
    const cResetB = collect(wB, 3000);
    send(wB, { type: 'PLAY_AGAIN' });
    const resetMsgsA = await cResetA;
    const resetMsgsB = await cResetB;

    const resetA = resetMsgsA.find((m: any) => m.type === 'ROOM_RESET');
    const resetB = resetMsgsB.find((m: any) => m.type === 'ROOM_RESET');
    expect(resetA).toBeDefined();
    expect(resetB).toBeDefined();
    expect(resetA.room.state).toBe('waiting');
  }, 60000);
});

// TC-35.5.3: Spectator Survives Replay
describe('TC-35.5.3: Spectator Survives Replay [ea33c5b7]', () => {

  it('spectator still connected after PLAY_AGAIN', async () => {
    const { wA, wB, idA, idB, roomId } = await createRoomAndJoin('Alice', 'Bob', 4);

    // Player C joins as spectator
    const { ws: wC, playerId: idC } = await connectWs();
    const cSpec = collect(wC, 2000);
    send(wC, { type: 'SPECTATE', roomId });
    const specMsgs = await cSpec;
    // Spectator may get SPECTATE_JOINED or similar
    await sleep(500);

    send(wA, { type: 'START_GAME' });
    await playUntilGameOver(wA, wB);

    // Play Again
    const cResetC = collect(wC, 3000);
    send(wA, { type: 'PLAY_AGAIN' });
    const resetMsgsC = await cResetC;

    const resetC = resetMsgsC.find((m: any) => m.type === 'ROOM_RESET');
    expect(resetC).toBeDefined();
  }, 60000);
});

// TC-35.5.4: Chat Preserved
describe('TC-35.5.4: Chat Preserved After Replay [ea33c5b7]', () => {

  it('chat history survives PLAY_AGAIN', async () => {
    const { wA, wB, idA, idB, roomId } = await createRoomAndJoin('Chatter', 'Listener');

    // Send chat before game
    send(wA, { type: 'CHAT_MESSAGE', text: 'hello before game' });
    await sleep(500);

    send(wA, { type: 'START_GAME' });

    // Send chat during game
    send(wA, { type: 'CHAT_MESSAGE', text: 'mid-game chat' });
    await playUntilGameOver(wA, wB);

    // Play Again
    const cResetA = collect(wA, 3000);
    send(wA, { type: 'PLAY_AGAIN' });
    const resetMsgs = await cResetA;

    const reset = resetMsgs.find((m: any) => m.type === 'ROOM_RESET');
    expect(reset).toBeDefined();

    // Chat may be in reset.chatHistory or preserved in room state
    // New joiner should get CHAT_HISTORY — verify by joining a third player
    const { ws: wNew } = await connectWs();
    const cNew = collect(wNew, 3000);
    send(wNew, { type: 'JOIN_ROOM', roomId, playerName: 'NewGuy' });
    const newMsgs = await cNew;
    const chatHist = newMsgs.find((m: any) => m.type === 'CHAT_HISTORY');
    if (chatHist) {
      expect(chatHist.messages.length).toBeGreaterThanOrEqual(1);
    }
    // If no CHAT_HISTORY, check reset message for chat
    if (!chatHist && reset.chatHistory) {
      expect(reset.chatHistory.length).toBeGreaterThanOrEqual(1);
    }
    // Pass if either path shows chat survived
    expect(chatHist || reset.chatHistory).toBeDefined();
  }, 60000);
});

// TC-35.5.5: No Stale Errors
describe('TC-35.5.5: No Stale Errors After Replay [ea33c5b7]', () => {

  it('room in ROOM_LIST with state=waiting after replay', async () => {
    const { wA, wB, idA, idB, roomId } = await createRoomAndJoin('Alpha', 'Beta');

    send(wA, { type: 'START_GAME' });
    await playUntilGameOver(wA, wB);

    const cReset = collect(wA, 3000);
    send(wA, { type: 'PLAY_AGAIN' });
    await cReset;

    // Check ROOM_LIST from a fresh connection
    const { ws: wCheck } = await connectWs();
    const cList = collect(wCheck, 2000);
    send(wCheck, { type: 'LIST_ROOMS' });
    const listMsgs = await cList;
    const list = listMsgs.find((m: any) => m.type === 'ROOM_LIST');
    expect(list).toBeDefined();

    const room = list.rooms.find((r: any) => r.id === roomId);
    expect(room).toBeDefined();
    expect(room.state).toBe('waiting');
    expect(room.playerCount).toBe(2);

    // Start game again — no errors
    const cStart = collect(wA, 5000);
    send(wA, { type: 'START_GAME' });
    const startMsgs = await cStart;
    const err = startMsgs.find((m: any) => m.type === 'ERROR');
    expect(err).toBeUndefined();
    const round = startMsgs.find((m: any) => m.type === 'ROUND_START');
    expect(round).toBeDefined();
  }, 60000);
});

// TC-35.5.6: Bot Behavior on Replay
describe('TC-35.5.6: Bot Cleared on Replay [ea33c5b7]', () => {

  it('bot removed after PLAY_AGAIN, host can add new bot', async () => {
    const { ws: wA, playerId: idA } = await connectWs();
    const cCreate = collect(wA, 2000);
    send(wA, { type: 'CREATE_ROOM', playerName: 'Solo', maxPlayers: 2 });
    const createMsgs = await cCreate;
    const roomId = createMsgs.find((m: any) => m.type === 'ROOM_JOINED')?.room?.id;
    expect(roomId).toBeDefined();

    // Add bot
    const cBot = collect(wA, 2000);
    send(wA, { type: 'ADD_BOT' });
    const botMsgs = await cBot;
    const botJoined = botMsgs.find((m: any) => m.type === 'PLAYER_JOINED');
    expect(botJoined).toBeDefined();

    // Start + play until game over
    send(wA, { type: 'START_GAME' });
    const gameOver = await new Promise<any>((resolve) => {
      const h = (d: any) => {
        const m = JSON.parse(d.toString());
        if (m.type === 'ROUND_START') {
          setTimeout(() => send(wA, { type: 'PLAY_CARD', guess: 'up' }), 300);
        }
        if (m.type === 'GAME_OVER') { wA.off('message', h); resolve(m); }
      };
      wA.on('message', h);
    });
    expect(gameOver).toBeDefined();

    // Play Again
    const cReset = collect(wA, 3000);
    send(wA, { type: 'PLAY_AGAIN' });
    const resetMsgs = await cReset;
    const reset = resetMsgs.find((m: any) => m.type === 'ROOM_RESET');
    expect(reset).toBeDefined();

    // VERIFY: Bot cleared — only human player in list
    const humanPlayers = reset.players.filter((p: any) => !p.isBot);
    const botPlayers = reset.players.filter((p: any) => p.isBot);
    expect(humanPlayers.length).toBe(1);
    expect(botPlayers.length).toBe(0);

    // Add new bot and start again
    const cBot2 = collect(wA, 2000);
    send(wA, { type: 'ADD_BOT' });
    const bot2Msgs = await cBot2;
    const bot2Joined = bot2Msgs.find((m: any) => m.type === 'PLAYER_JOINED');
    expect(bot2Joined).toBeDefined();

    const cStart = collect(wA, 5000);
    send(wA, { type: 'START_GAME' });
    const startMsgs = await cStart;
    const round = startMsgs.find((m: any) => m.type === 'ROUND_START');
    expect(round).toBeDefined();
  }, 60000);
});
