#!/usr/bin/env node
/**
 * Full multiplayer game WebSocket test
 * Tests: room create, join, start, play cards, special cards, round results, game over
 * Run: node test/full-game-ws.test.js
 */

import WebSocket from 'ws';

const URL = 'wss://localhost:3443';
const OPTS = { rejectUnauthorized: false };
const R = {};
let roomId, ws1, ws2, round = 0;

function msg(ws, filter) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout waiting for ' + filter)), 12000);
    const handler = (d) => {
      const m = JSON.parse(d.toString());
      if (typeof filter === 'string' && m.type === filter) { clearTimeout(timeout); ws.off('message', handler); resolve(m); }
      if (typeof filter === 'function' && filter(m)) { clearTimeout(timeout); ws.off('message', handler); resolve(m); }
    };
    ws.on('message', handler);
  });
}

function connect() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL, OPTS);
    ws.on('open', () => resolve(ws));
    ws.on('error', reject);
  });
}

async function waitForType(ws, type, timeout = 12000) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), timeout);
    const handler = (d) => {
      const m = JSON.parse(d.toString());
      if (m.type === type) { clearTimeout(timer); ws.off('message', handler); resolve(m); }
    };
    ws.on('message', handler);
  });
}

function send(ws, data) { ws.send(JSON.stringify(data)); }

function collectAll(ws) {
  const msgs = [];
  ws.on('message', (d) => msgs.push(JSON.parse(d.toString())));
  return msgs;
}

try {
  console.log('=== UpDown Full Game WebSocket Test ===\n');

  // Connect both clients
  ws1 = await connect();
  const welcome1 = await waitForType(ws1, 'welcome');
  R.connect1 = welcome1 ? 'PASS' : 'FAIL';
  console.log('1. Host connect:', R.connect1);

  // Collect all messages for both clients
  const c1msgs = collectAll(ws1);

  // Create room
  send(ws1, { type: 'CREATE_ROOM', roomName: 'FullTest', playerName: 'Alice', maxPlayers: 4 });
  await new Promise(r => setTimeout(r, 1000));

  const roomJoined1 = c1msgs.find(m => m.type === 'ROOM_JOINED');
  roomId = roomJoined1?.room?.id;
  R.createRoom = roomId ? 'PASS' : 'FAIL';
  console.log('2. Create room:', R.createRoom, roomId ? '(id=' + roomId + ')' : '');

  // Connect player 2
  ws2 = await connect();
  const welcome2 = await waitForType(ws2, 'welcome');
  R.connect2 = welcome2 ? 'PASS' : 'FAIL';
  console.log('3. Guest connect:', R.connect2);

  const c2msgs = collectAll(ws2);

  // Join room
  send(ws2, { type: 'JOIN_ROOM', roomId, playerName: 'Bob' });
  await new Promise(r => setTimeout(r, 1500));

  const roomJoined2 = c2msgs.find(m => m.type === 'ROOM_JOINED');
  R.joinRoom = roomJoined2 ? 'PASS' : 'FAIL';
  R.playerSync = roomJoined2?.players?.length >= 2 ? 'PASS' : 'FAIL(' + roomJoined2?.players?.length + ')';
  console.log('4. Join room:', R.joinRoom, 'players:', roomJoined2?.players?.length);

  const hostNotified = c1msgs.find(m => m.type === 'PLAYER_JOINED' && m.playerCount >= 2);
  R.joinNotify = hostNotified ? 'PASS' : 'FAIL';
  console.log('5. Host notified:', R.joinNotify);

  // Start game
  send(ws1, { type: 'START_GAME' });
  await new Promise(r => setTimeout(r, 2000));

  const roundStart1 = c1msgs.find(m => m.type === 'ROUND_START');
  R.gameStart = roundStart1 ? 'PASS' : 'FAIL';
  R.countdown = roundStart1?.countdown === 10 ? 'PASS' : 'FAIL(' + roundStart1?.countdown + ')';
  R.currentCard = roundStart1?.currentCard ? 'PASS' : 'FAIL';
  console.log('6. Game start:', R.gameStart, 'countdown:', roundStart1?.countdown, 'card:', roundStart1?.currentCard?.value);

  // Bob plays Protective Shell + wrong guess
  send(ws2, { type: 'PLAY_SPECIAL', cardId: 'protective_shell' });
  send(ws2, { type: 'PLAY_CARD', guess: 'equal' });
  // Alice plays up
  send(ws1, { type: 'PLAY_CARD', guess: 'up' });

  await new Promise(r => setTimeout(r, 2000));

  const specialPlayed = c1msgs.find(m => m.type === 'SPECIAL_CARD_PLAYED');
  R.specialCard = specialPlayed ? 'PASS' : 'FAIL';
  console.log('7. Special card broadcast:', R.specialCard, specialPlayed?.cardName || '');

  // Wait for round result (may need countdown to expire)
  await new Promise(r => setTimeout(r, 12000));

  const result1 = c1msgs.filter(m => m.type === 'ROUND_RESULT');
  if (result1.length > 0) {
    const r1 = result1[0];
    R.roundResult = 'PASS';
    const hasScore = r1.results?.some(r => r.score !== undefined);
    const hasStreak = r1.results?.some(r => r.streak !== undefined);
    R.scores = hasScore ? 'PASS' : 'FAIL';
    R.streaks = hasStreak ? 'PASS' : 'FAIL';

    const bob = r1.results?.find(r => r.name === 'Bob' || r.playerName === 'Bob');
    R.shellProtect = (bob?.correct === false && bob?.eliminated === false) ? 'PASS' :
                     (bob?.correct === true ? 'SKIP(correct)' : 'FAIL');

    console.log('8. Round result:', R.roundResult);
    console.log('   Scores:', R.scores, 'Streaks:', R.streaks);
    console.log('   Shell protect:', R.shellProtect);
    console.log('   Details:', JSON.stringify(r1.results?.map(r => ({n:r.name||r.playerName, c:r.correct, s:r.score, el:r.eliminated}))));
  } else {
    R.roundResult = 'FAIL(no result)';
    console.log('8. Round result: FAIL — no ROUND_RESULT received');
  }

  // Check for game over
  const gameOver = [...c1msgs, ...c2msgs].find(m => m.type === 'GAME_OVER');
  R.gameOver = gameOver ? 'PASS' : 'PENDING';
  R.leaderboard = gameOver?.leaderboard?.length >= 2 ? 'PASS' : (gameOver ? 'FAIL' : 'PENDING');
  console.log('9. Game over:', R.gameOver, gameOver ? 'leaderboard: ' + R.leaderboard : '');

  // Summary
  console.log('\n=== RESULTS ===');
  const checks = [
    ['connect1', 'Host connects'],
    ['connect2', 'Guest connects'],
    ['createRoom', 'Create room'],
    ['joinRoom', 'Join room'],
    ['playerSync', 'Player list sync'],
    ['joinNotify', 'Host join notification'],
    ['gameStart', 'Game starts'],
    ['countdown', '10s countdown'],
    ['currentCard', 'Current card dealt'],
    ['specialCard', 'Special card broadcast'],
    ['roundResult', 'Round result received'],
    ['scores', 'Scores in result'],
    ['streaks', 'Streaks in result'],
    ['shellProtect', 'Protective Shell works'],
    ['gameOver', 'Game over event'],
    ['leaderboard', 'Leaderboard present'],
  ];
  let pass = 0, fail = 0, skip = 0;
  for (const [k, desc] of checks) {
    const v = R[k] || 'NOT TESTED';
    const icon = v === 'PASS' ? '✅' : v.startsWith('FAIL') ? '❌' : v.startsWith('SKIP') ? '⏭️' : '⚪';
    console.log(`${icon} ${desc}: ${v}`);
    if (v === 'PASS') pass++; else if (v.startsWith('FAIL')) fail++; else skip++;
  }
  console.log(`\n${pass}/${checks.length} PASS, ${fail} FAIL, ${skip} SKIP/PENDING`);

  ws1.close();
  ws2.close();
  process.exit(fail > 0 ? 1 : 0);

} catch (err) {
  console.error('TEST ERROR:', err.message);
  if (ws1) ws1.close();
  if (ws2) ws2.close();
  process.exit(1);
}
