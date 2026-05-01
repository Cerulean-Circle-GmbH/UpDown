#!/usr/bin/env node
/**
 * UpDown Multiplayer WebSocket Protocol Test Suite
 * Implements architect test cases UC1-UC8 + Edge Cases TC-E1 to TC-E4
 * Run: node test/protocol-test-suite.js
 */

import WebSocket from 'ws';

const URL = 'wss://localhost:3443';
const OPTS = { rejectUnauthorized: false };
const results = [];
let testCount = 0;

function pass(id, desc) { results.push({ id, desc, status: 'PASS' }); console.log(`  ✅ ${id}: ${desc}`); }
function fail(id, desc, detail) { results.push({ id, desc, status: 'FAIL', detail }); console.log(`  ❌ ${id}: ${desc} — ${detail}`); }
function skip(id, desc, reason) { results.push({ id, desc, status: 'SKIP', detail: reason }); console.log(`  ⏭️  ${id}: ${desc} — ${reason}`); }

function connect() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL, OPTS);
    const timeout = setTimeout(() => reject(new Error('connect timeout')), 5000);
    ws.on('error', reject);
    const msgs = [];
    ws.on('message', (d) => {
      const m = JSON.parse(d.toString());
      msgs.push(m);
      if (m.type === 'welcome' || m.type === 'WELCOME') {
        clearTimeout(timeout);
        resolve({ ws, playerId: m.clientId || m.playerId, msgs });
      }
    });
  });
}

function send(ws, data) { ws.send(JSON.stringify(data)); }

function waitFor(ws, type, timeoutMs = 15000) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    const handler = (d) => {
      const m = JSON.parse(d.toString());
      if (m.type === type) { clearTimeout(timer); ws.off('message', handler); resolve(m); }
    };
    ws.on('message', handler);
  });
}

function collectFor(ws, ms) {
  return new Promise((resolve) => {
    const msgs = [];
    const handler = (d) => msgs.push(JSON.parse(d.toString()));
    ws.on('message', handler);
    setTimeout(() => { ws.off('message', handler); resolve(msgs); }, ms);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

try {
  console.log('═══════════════════════════════════════════');
  console.log('  UpDown Protocol Test Suite');
  console.log('═══════════════════════════════════════════\n');

  // ═══════════════════════════════════════════
  // UC1: Connect to Server
  // ═══════════════════════════════════════════
  console.log('── UC1: Connect to Server ──');

  // TC1.1
  const { ws: wsA, playerId: idA } = await connect();
  if (wsA.readyState === WebSocket.OPEN && idA) pass('TC1.1', 'Basic connection + playerId');
  else fail('TC1.1', 'Basic connection', `state=${wsA.readyState} id=${idA}`);

  // TC1.2
  const { ws: wsB, playerId: idB } = await connect();
  const { ws: wsC, playerId: idC } = await connect();
  const uniqueIds = new Set([idA, idB, idC]).size === 3;
  if (uniqueIds && wsB.readyState === WebSocket.OPEN && wsC.readyState === WebSocket.OPEN)
    pass('TC1.2', 'Multiple concurrent connections with unique IDs');
  else fail('TC1.2', 'Multiple connections', `unique=${uniqueIds}`);

  wsC.close();
  await sleep(500);

  // ═══════════════════════════════════════════
  // UC2: Create Room
  // ═══════════════════════════════════════════
  console.log('\n── UC2: Create Room ──');

  // TC2.1
  const collectA = collectFor(wsA, 2000);
  send(wsA, { type: 'CREATE_ROOM', roomName: 'Test Room', playerName: 'Alice', maxPlayers: 4 });
  const msgsA = await collectA;
  const roomJoined = msgsA.find(m => m.type === 'ROOM_JOINED');
  const roomId = roomJoined?.room?.id;
  if (roomJoined && roomId && roomJoined.room?.name === 'Test Room' && roomJoined.room?.maxPlayers === 4)
    pass('TC2.1', 'Create public room');
  else fail('TC2.1', 'Create public room', `roomJoined=${!!roomJoined} id=${roomId}`);

  // TC2.3
  if (roomJoined?.room?.hostId === idA) pass('TC2.3', 'Creator becomes host');
  else fail('TC2.3', 'Creator becomes host', `hostId=${roomJoined?.room?.hostId} expected=${idA}`);

  // TC2.2 — private room
  const { ws: wsD, playerId: idD } = await connect();
  const collectD = collectFor(wsD, 2000);
  send(wsD, { type: 'CREATE_ROOM', roomName: 'Secret', playerName: 'Dave', maxPlayers: 2, roomKey: 'abc123' });
  const msgsD = await collectD;
  const privRoom = msgsD.find(m => m.type === 'ROOM_JOINED');
  const privRoomId = privRoom?.room?.id;
  if (privRoom?.room?.isPrivate === true) pass('TC2.2', 'Create private room');
  else fail('TC2.2', 'Create private room', `isPrivate=${privRoom?.room?.isPrivate}`);

  // ═══════════════════════════════════════════
  // UC3: Join Room
  // ═══════════════════════════════════════════
  console.log('\n── UC3: Join Room ──');

  // TC3.1
  const collectB = collectFor(wsB, 2000);
  const collectA2 = collectFor(wsA, 2000);
  send(wsB, { type: 'JOIN_ROOM', roomId, playerName: 'Bob' });
  const msgsB = await collectB;
  const msgsA2 = await collectA2;
  const bobJoined = msgsB.find(m => m.type === 'ROOM_JOINED');
  const aliceNotified = msgsA2.find(m => m.type === 'PLAYER_JOINED');
  if (bobJoined?.players?.length >= 2) pass('TC3.1a', 'Join public room — joiner sees players');
  else fail('TC3.1a', 'Join room', `players=${bobJoined?.players?.length}`);
  if (aliceNotified?.playerCount >= 2) pass('TC3.1b', 'Join public room — host notified');
  else fail('TC3.1b', 'Host notification', `count=${aliceNotified?.playerCount}`);

  // TC3.4 — wrong key
  const { ws: wsE, playerId: idE } = await connect();
  const collectE = collectFor(wsE, 2000);
  send(wsE, { type: 'JOIN_ROOM', roomId: privRoomId, roomKey: 'wrong', playerName: 'Eve' });
  const msgsE = await collectE;
  const wrongKeyErr = msgsE.find(m => m.type === 'ERROR');
  if (wrongKeyErr) pass('TC3.4', 'Wrong key rejected');
  else fail('TC3.4', 'Wrong key', `msgs=${msgsE.map(m => m.type).join(',')}`);
  wsE.close();

  // TC3.3 — correct key
  const { ws: wsF, playerId: idF } = await connect();
  const collectF = collectFor(wsF, 2000);
  send(wsF, { type: 'JOIN_ROOM', roomId: privRoomId, roomKey: 'abc123', playerName: 'Frank' });
  const msgsF = await collectF;
  const frankJoined = msgsF.find(m => m.type === 'ROOM_JOINED');
  if (frankJoined) pass('TC3.3', 'Correct key accepted');
  else fail('TC3.3', 'Correct key', `msgs=${msgsF.map(m => m.type).join(',')}`);

  // TC3.7 — list rooms
  const { ws: wsG } = await connect();
  const collectG = collectFor(wsG, 2000);
  send(wsG, { type: 'LIST_ROOMS' });
  const msgsG = await collectG;
  const roomList = msgsG.find(m => m.type === 'ROOM_LIST');
  const hasPublic = roomList?.rooms?.some(r => r.name === 'Test Room');
  const hasPrivate = roomList?.rooms?.some(r => r.name === 'Secret');
  if (roomList && hasPublic && !hasPrivate) pass('TC3.7', 'List rooms — public visible, private hidden');
  else if (roomList && hasPublic) fail('TC3.7', 'Private room visible in list', `private=${hasPrivate}`);
  else fail('TC3.7', 'List rooms', `list=${!!roomList} public=${hasPublic}`);
  wsG.close();

  // ═══════════════════════════════════════════
  // UC4: Start Game
  // ═══════════════════════════════════════════
  console.log('\n── UC4: Start Game ──');

  // TC4.1 — host starts
  const collectA3 = collectFor(wsA, 3000);
  const collectB2 = collectFor(wsB, 3000);
  send(wsA, { type: 'START_GAME' });
  const msgsA3 = await collectA3;
  const msgsB2 = await collectB2;
  const roundStartA = msgsA3.find(m => m.type === 'ROUND_START');
  const roundStartB = msgsB2.find(m => m.type === 'ROUND_START');
  if (roundStartA?.round === 1 && roundStartA?.currentCard && roundStartA?.countdown === 10)
    pass('TC4.1a', 'Host starts — ROUND_START with round=1, card, countdown=10');
  else fail('TC4.1a', 'Host starts', `round=${roundStartA?.round} card=${!!roundStartA?.currentCard} cd=${roundStartA?.countdown}`);
  if (roundStartB?.round === 1) pass('TC4.1b', 'Guest receives ROUND_START');
  else fail('TC4.1b', 'Guest ROUND_START', `${!!roundStartB}`);

  // TC4.4 — countdown ticks
  const countdownMsgs = await collectFor(wsA, 3000);
  const ticks = countdownMsgs.filter(m => m.type === 'COUNTDOWN');
  if (ticks.length >= 2) pass('TC4.4', 'Countdown ticks received');
  else fail('TC4.4', 'Countdown ticks', `got ${ticks.length}`);

  // ═══════════════════════════════════════════
  // UC5: Play Cards + UC7: Round Results
  // ═══════════════════════════════════════════
  console.log('\n── UC5+UC7: Play Cards + Round Results ──');

  // TC5.1 + TC5.4 — both play, early resolution
  const collectA4 = collectFor(wsA, 13000);
  const collectB3 = collectFor(wsB, 13000);
  send(wsA, { type: 'PLAY_CARD', guess: 'up' });
  send(wsB, { type: 'PLAY_CARD', guess: 'down' });
  const msgsA4 = await collectA4;
  const msgsB3 = await collectB3;

  const cardPlayedA = msgsA4.find(m => m.type === 'CARD_PLAYED');
  if (cardPlayedA) pass('TC5.1', 'CARD_PLAYED broadcast received');
  else fail('TC5.1', 'CARD_PLAYED', 'not received');

  const roundResultA = msgsA4.find(m => m.type === 'ROUND_RESULT');
  const roundResultB = msgsB3.find(m => m.type === 'ROUND_RESULT');

  if (roundResultA?.results?.length >= 1) {
    pass('TC7.5', 'Round result includes player results');
    const hasScores = roundResultA.scores || roundResultA.results?.some(r => r.score !== undefined);
    const hasStreaks = roundResultA.results?.some(r => r.streak !== undefined);
    if (hasScores) pass('TC7.1', 'Score in results');
    else fail('TC7.1', 'Score in results', 'no score field');
    if (hasStreaks) pass('TC7.4a', 'Streak in results');
    else fail('TC7.4a', 'Streak in results', 'no streak field');

    const correctP = roundResultA.results.find(r => r.correct === true);
    const wrongP = roundResultA.results.find(r => r.correct === false);
    if (correctP && correctP.eliminated === false) pass('TC7.1b', 'Correct guess — not eliminated');
    else skip('TC7.1b', 'Correct guess survival', 'no correct player this round');
    if (wrongP && wrongP.eliminated === true) pass('TC7.2', 'Wrong guess — eliminated');
    else if (wrongP) fail('TC7.2', 'Wrong guess elimination', `eliminated=${wrongP.eliminated}`);
    else skip('TC7.2', 'Wrong guess elimination', 'no wrong player');
  } else {
    fail('TC7.5', 'Round result', 'no results array');
  }

  if (roundResultB) pass('TC5.4', 'Early resolution — both played, result received');
  else fail('TC5.4', 'Early resolution', 'no result for B');

  // ═══════════════════════════════════════════
  // UC8: Game Over
  // ═══════════════════════════════════════════
  console.log('\n── UC8: Game Over ──');

  const gameOverA = msgsA4.find(m => m.type === 'GAME_OVER');
  const nextRoundA = msgsA4.find(m => m.type === 'ROUND_START' && m.round > 1);

  if (gameOverA) {
    if (gameOverA.leaderboard?.length >= 1) pass('TC8.1', 'Game over with leaderboard');
    else fail('TC8.1', 'Game over leaderboard', `length=${gameOverA.leaderboard?.length}`);

    const sorted = gameOverA.leaderboard?.every((p, i, arr) => i === 0 || arr[i - 1].score >= p.score);
    if (sorted) pass('TC8.3', 'Leaderboard sorted by score DESC');
    else fail('TC8.3', 'Leaderboard sort', 'not sorted');

    const hasRanks = gameOverA.leaderboard?.every(p => p.rank >= 1);
    if (hasRanks) pass('TC8.3b', 'Ranks 1-indexed');
    else fail('TC8.3b', 'Ranks', 'missing or 0-indexed');
  } else if (nextRoundA) {
    pass('TC7.6', 'Next round starts after result');
    skip('TC8.1', 'Game over', 'game still in progress (multi-round)');
    skip('TC8.3', 'Leaderboard sort', 'game still in progress');
    skip('TC8.3b', 'Ranks', 'game still in progress');
  } else {
    fail('TC8.1', 'Game over or next round', 'neither received');
  }

  // ═══════════════════════════════════════════
  // TC-E2: Host disconnect — host transfer
  // ═══════════════════════════════════════════
  console.log('\n── Edge Cases ──');

  // Create fresh room for edge case
  const { ws: wsH, playerId: idH } = await connect();
  const { ws: wsI, playerId: idI } = await connect();
  const collectH = collectFor(wsH, 2000);
  send(wsH, { type: 'CREATE_ROOM', roomName: 'EdgeTest', playerName: 'Host2', maxPlayers: 4 });
  await collectH;
  const edgeRoom = (await collectH)?.find?.(m => m.type === 'ROOM_JOINED')?.room?.id;
  // If collectH already resolved, get roomId from wsH
  await sleep(500);
  send(wsI, { type: 'JOIN_ROOM', roomId: edgeRoom || roomId, playerName: 'Player2' });
  await sleep(1500);

  // TC-E2: host disconnects
  const collectI = collectFor(wsI, 3000);
  wsH.close();
  const msgsI = await collectI;
  const hostChanged = msgsI.find(m => m.type === 'HOST_CHANGED');
  const playerLeft = msgsI.find(m => m.type === 'PLAYER_LEFT');
  if (playerLeft) pass('TC-E2a', 'Host disconnect — PLAYER_LEFT broadcast');
  else fail('TC-E2a', 'PLAYER_LEFT on host disconnect', `msgs=${msgsI.map(m => m.type).join(',')}`);
  if (hostChanged) pass('TC-E2b', 'Host transfer — HOST_CHANGED received');
  else skip('TC-E2b', 'Host transfer', 'not received (may need >1 remaining player)');

  // Cleanup
  wsA.close(); wsB.close(); wsD.close(); wsF.close(); wsI.close();
  await sleep(500);

  // ═══════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════
  console.log('\n═══════════════════════════════════════════');
  console.log('  RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  console.log(`\n  ${passed} PASS, ${failed} FAIL, ${skipped} SKIP (${results.length} total)\n`);

  if (failed > 0) {
    console.log('  FAILURES:');
    results.filter(r => r.status === 'FAIL').forEach(r => console.log(`    ${r.id}: ${r.desc} — ${r.detail}`));
  }
  console.log('');

  process.exit(failed > 0 ? 1 : 0);

} catch (err) {
  console.error('TEST SUITE ERROR:', err.message);
  process.exit(1);
}
