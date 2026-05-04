# UpDown QnD — Traceability Matrix
## UC-UUID → Task → Implementation → Test

**Source of truth** for use case traceability. UUIDs link PUML diagrams, test files, and this matrix.
Implementation file:line references maintained here (NOT as comments in source — avoids DRY rot on refactor).

---

## COVERED (13 UCs — all 4 pieces present)

| UUID | UC | Object.verb | Task | Impl File:Method | Test File:Line | Status |
|------|-----|-------------|------|-----------------|----------------|--------|
| 92a061e0 | UC-C1 | connection.open | Sprint3/T1 | WebSocketClient.ts:14 connect() / server.ts:303 setupWebSocketServer() | vitest/uc-c1-connection-open.test.ts (4 AC) | ✅ |
| aa33a8d3 | UC-C1b | connection.open.multi | Sprint3/T1 | server.ts:303 (concurrent) | protocol-test-suite.js:75 TC1.2 | ✅ |
| e6b4716c | UC-C2 | connection.close | Sprint3/T1 | server.ts ws.on('close') / GameRoom.ts:254 removePlayer() | protocol-test-suite.js:262 TC-E2 | ✅ |
| 7cd55a0b | UC-R1 | rooms.list | Sprint3/T2 | WebSocketClient.ts:72 listRooms() / RoomManager.ts:660 listRooms() | protocol-test-suite.js:152 TC3.7 + :448 TC-R2 + :477 TC-R4 | ✅ |
| fbfed148 | UC-R2 | room.create | Sprint3/T2 | WebSocketClient.ts:60 createRoom() / RoomManager.ts:643 createRoom() / GameRoom.ts:103 addPlayer() | vitest/uc-r2-room-create.test.ts (7 AC) | ✅ |
| 177c8da5 | UC-R2b | room.create.host | Sprint3/T2 | GameRoom.ts:116 hostId assignment | protocol-test-suite.js:101 TC2.3 | ✅ |
| 1c21171d | UC-R3 | room.create.private | Sprint3/T2 | GameRoom.ts:70 isPrivate / server.ts:422 key check | protocol-test-suite.js:105 TC2.2 | ✅ |
| 9cc60247 | UC-R4 | room.join | Sprint3/T3 | WebSocketClient.ts:64 joinRoom() / GameRoom.ts:103 addPlayer() | protocol-test-suite.js:120 TC3.1a+TC3.1b | ✅ |
| 61449e82 | UC-R5 | room.join.private.correct | Sprint3/T3 | server.ts:422 key match | protocol-test-suite.js:143 TC3.3 | ✅ |
| 148f2e73 | UC-R6 | room.join.private.wrong | Sprint3/T3 | server.ts:422 key mismatch → ERROR | protocol-test-suite.js:133 TC3.4 | ✅ |
| 96f2ecd5 | UC-R10 | room.leave | Sprint3/T3 | WebSocketClient.ts:68 leaveRoom() / GameRoom.ts:254 removePlayer() | protocol-test-suite.js:434 TC-R1 | ✅ |
| dd0392cf | UC-H1 | host.transfer | Sprint3/T3 | GameRoom.ts:277 hostId reassign | protocol-test-suite.js:262 TC-E2a+TC-E2b | ✅ |
| 560d9a46 | UC-G1 | game.start | Sprint3/T4 | WebSocketClient.ts:76 startGame() / GameRoom.ts:290 startGame() → nextRound() | protocol-test-suite.js:170 TC4.1a+TC4.1b | ✅ |
| 0dfe22b0 | UC-CH1 | chat.send | Sprint3/T10 | server.ts:511 / GameRoom broadcast | test/vitest/uc-ch1-chat.test.ts | ✅ |
| f1ba3e42 | UC-B1 | bot.add | Sprint3/T14 | GameRoom.ts:129 addBot() / BotPlayer constructor | test/vitest/uc-b1-bot-add.test.ts | ✅ |

## PARTIAL (5 UCs — implementation exists, test is incomplete)

| UUID | UC | Object.verb | Task | Impl File:Method | Test File:Line | Gap |
|------|-----|-------------|------|-----------------|----------------|-----|
| f8e39106 | UC-RD1 | round.start | Sprint3/T4 | GameRoom.ts:315 nextRound() → ROUND_START | protocol-test-suite.js:170 (implicit in TC4.1) | No dedicated test for ROUND_START fields |
| 224c5b9e | UC-RD2 | round.countdown | Sprint3/T4 | GameRoom.ts:369 startCountdown() → COUNTDOWN | protocol-test-suite.js:184 TC4.4 | Only checks ≥2 ticks, not full 10→0 |
| e5c73817 | UC-RD3 | round.resolve | Sprint3/T5 | GameRoom.ts:428 resolveRound() → ROUND_RESULT | protocol-test-suite.js:195 (implicit in TC5.1) | No verification of result correctness |
| f0295f28 | UC-P1 | player.guess.up | Sprint3/T5 | GameRoom.ts:411 playCard() | protocol-test-suite.js:195 TC5.1 | Only tests 'up', not 'down'/'equal' |
| b3fb6696 | UC-RD4 | round.resolve.allPlayed | Sprint3/T5 | GameRoom.ts:420 allPlayed → early resolve | protocol-test-suite.js:230 TC5.4 | No timer cancellation verification |

## MISSING — P0 Core Gameplay (12 UCs)

| UUID | UC | Object.verb | Task | Impl File:Method | Test Needed |
|------|-----|-------------|------|-----------------|-------------|
| c9866c6e | UC-P2 | player.guess.down | Sprint3/T5 | GameRoom.ts:411 playCard('down') | Verify correct=true when next < current |
| fa8f1c83 | UC-P3 | player.guess.equal | Sprint3/T5 | GameRoom.ts:411 playCard('equal') | Verify correct=true when next === current |
| 035d2535 | UC-P4 | player.guess.correct | Sprint3/T5 | GameRoom.ts:458 score += 10 + streak | Verify score increase in ROUND_RESULT |
| 1a56ba00 | UC-P5 | player.guess.wrong | Sprint3/T5 | GameRoom.ts:492 alive = false | Verify eliminated in ROUND_RESULT |
| d309011d | UC-P13 | player.streak | Sprint3/T5 | GameRoom.ts:489 streak++ | Verify streak increments across rounds |
| 18224bc2 | UC-P14 | player.score | Sprint3/T5 | GameRoom.ts:485 score += 10 + streak | Verify cumulative scoring formula |
| 344fcec6 | UC-P6 | player.guess.timeout | Sprint3/T5 | GameRoom.ts:453 guess === null → eliminated | Wait 10s, verify elimination |
| 38d62fef | UC-GE1 | game.end.allEliminated | Sprint3/T11 | GameRoom.ts:528 alivePlayers === 0 → endGame() | All wrong → GAME_OVER |
| e73e7784 | UC-GE2 | game.end.deckEmpty | Sprint3/T11 | GameRoom.ts:528 gmHand+deck === 0 → endGame() | Play until deck exhausted |
| e4bd6ed5 | UC-GE3 | game.end.leaderboard | Sprint3/T11 | GameRoom.ts:545 sort(score DESC) | Verify ordering in GAME_OVER |
| 8e46d39e | UC-B2 | bot.decide | Sprint3/T14 | BotPlayer.ts:127 decideGuess() | Verify bot plays during round |

## MISSING — P1 Multiplayer Flow (11 UCs)

| UUID | UC | Object.verb | Task | Impl File:Method | Test Needed |
|------|-----|-------------|------|-----------------|-------------|
| d0b57a5a | UC-R7 | room.join.full | Sprint3/T3 | GameRoom.ts addPlayer() size guard | vitest/uc-r7-room-join-full.test.ts (1 AC) | ✅ |
| 8db2e073 | UC-R8 | room.join.midGame | Sprint3/T3 | GameRoom.ts addPlayer() exchange state | vitest/uc-r8-room-join-midgame.test.ts (1 AC) | ✅ |
| d466a7f1 | UC-R9 | room.join.rejected | Sprint3/T3 | GameRoom.ts addPlayer() countdown guard | vitest/uc-r9-room-join-rejected.test.ts (1 AC) | ✅ |
| fc6c941a | UC-H2 | host.addBot | Sprint3/T14 | GameRoom.ts:129 addBot() | Host sends ADD_BOT → bot appears |
| 57311798 | UC-H4 | host.startGame.nonHost | Sprint3/T4 | server.ts:448 hostId check | Non-host START_GAME → ERROR |
| f89b9338 | UC-G2 | game.start.autoFillBots | Sprint3/T4 | GameRoom.ts:292 addBot() loop | Start with 1 player → bots auto-added |
| ac08aa49 | UC-S1 | spectator.join | Sprint3/T8 | GameRoom.ts:146 addSpectator() | SPECTATE → SPECTATE_JOINED |
| d30575e7 | UC-S2 | spectator.leave | Sprint3/T8 | GameRoom.ts:159 removeSpectator() | LEAVE_SPECTATE → SPECTATOR_LEFT |
| df7ec971 | UC-S3 | spectator.joinNext | Sprint3/T8 | GameRoom.ts:169 promoteSpectator() | JOIN_NEXT_GAME → becomes player |
| 8a319461 | UC-CH3 | chat.maxLength | Sprint3/T10 | server.ts:515 text.slice(0, 200) | Send 300 chars → truncated to 200 |

## MISSING — P2 Special Cards (13 UCs)

| UUID | UC | Object.verb | Task | Impl File:Method | Test Needed |
|------|-----|-------------|------|-----------------|-------------|
| 58aca2aa | UC-SC1 | special.protectiveShell | Sprint3/T6 | SpecialCards.ts protective_shell | Wrong guess + shield → survive |
| fc29d64c | UC-SC2 | special.doublePoints | Sprint3/T6 | SpecialCards.ts double_points | Correct + 2x → double score |
| 7c992d5a | UC-SC3 | special.peek | Sprint3/T6 | SpecialCards.ts peek | Peek → GM hand info in response |
| 994dc326 | UC-SC4 | special.sacrifice | Sprint3/T6 | SpecialCards.ts sacrifice | Player dies, target gets points |
| 288df581 | UC-SC5 | special.swap | Sprint3/T6 | SpecialCards.ts swap | Swap result with target |
| c11e9372 | UC-SC6 | special.revealHand | Sprint3/T6 | SpecialCards.ts reveal_hand | GM hand revealed to all |
| 872c8b2b | UC-SC7 | special.freeze | Sprint3/T6 | SpecialCards.ts freeze | Target can't play next round |
| 5c153b82 | UC-SC8 | special.oneForTheTeam | Sprint3/T6 | SpecialCards.ts one_for_the_team | All wrong players survive |
| 7ed5c89e | UC-SC9 | special.secondChance | Sprint3/T6 | SpecialCards.ts second_chance | Wrong → retry |
| 47b2e416 | UC-SC10 | special.pointSteal | Sprint3/T6 | SpecialCards.ts point_steal | Steal % of target score |
| 725f1f43 | UC-SC11 | special.massIntelligence | Sprint3/T6 | SpecialCards.ts mass_intelligence | Info revealed |
| fb209fdd | UC-SC12 | special.priorityOrder | Sprint3/T6 | SpecialCards.ts resolveSpecialCards() | L3 resolves before L2 before L1 |
| dda127ab | UC-SC13 | special.inventory | Sprint3/T6 | GameRoom.ts generateStarterInventory() | Player gets starter cards |

## MISSING — P3 Edge Cases & Extras (14 UCs)

| UUID | UC | Object.verb | Task | Impl File:Method | Test Needed |
|------|-----|-------------|------|-----------------|-------------|
| e4b6d041 | UC-P7 | player.guess.frozen | Sprint3/T6 | GameRoom.ts:414 frozen → unfreeze, skip | Frozen player can't play |
| d51d24ec | UC-P8 | player.guess.dead | Sprint3/T5 | GameRoom.ts:412 !alive → ignored | Dead player PLAY_CARD → no effect |
| f43897d5 | UC-P9 | player.playSpecial | Sprint3/T6 | GameRoom.ts:384 playSpecialCard() | PLAY_SPECIAL → SPECIAL_CARD_PLAYED |
| b6862ad2 | UC-P10 | player.playSpecial.notInInventory | Sprint3/T6 | GameRoom.ts:388 inventory guard | Card not in inventory → ignored |
| c503e19a | UC-P11 | player.playSpecial.alreadyUsed | Sprint3/T6 | GameRoom.ts:389 usedSpecials guard | Already used → ignored |
| 34620f4b | UC-RD5 | round.resolve.timeout | Sprint3/T5 | GameRoom.ts:374 countdown → 0 → resolveRound() | Full 10s timeout → auto-resolve |
| 4af9fb90 | UC-RD6 | round.resolve.specials | Sprint3/T6 | SpecialCards.resolveSpecialCards() | Specials modify base results |
| 76f767e4 | UC-RD7 | round.exchange | Sprint3/T5 | GameRoom.ts:532 state='exchange' 3s | Verify 3s pause between rounds |
| 7886e805 | UC-RD8 | round.deckExhausted | Sprint3/T5 | GameRoom.ts:320 empty → endGame() | GM hand + deck empty → GAME_OVER |
| b1be7a22 | UC-GE4 | game.end.diamonds | Sprint3/T11 | GameRoom.ts:550 rank+round+streak bonus | Verify diamond calculation |
| ea33c5b7 | UC-GE5 | game.end.playAgain | Sprint3/T11 | MultiplayerUI.ts:571 leaveRoom+rejoin | Play Again → new game in same room |
| 91825bbd | UC-S4 | spectator.seesGame | Sprint3/T8 | GameRoom.ts broadcastAll() | Spectator receives ROUND_START etc. |
| 7b4f1505 | UC-CH2 | chat.history | Sprint3/T10 | GameRoom.ts:122 CHAT_HISTORY on join | Join room → see past messages |
| f552ec48 | UC-CH4 | chat.maxHistory | Sprint3/T10 | server.ts:518 chatHistory max 50 | Send 60 messages → only 50 kept |

## MISSING — Bot Details (6 UCs)

| UUID | UC | Object.verb | Task | Impl File:Method | Test Needed |
|------|-----|-------------|------|-----------------|-------------|
| fe84fad6 | UC-B3 | bot.decide.cautious | Sprint3/T14 | BotPlayer.ts cautious personality | Card=2 → bot picks 'up' (optimal) |
| f0364019 | UC-B4 | bot.decide.gambler | Sprint3/T14 | BotPlayer.ts gambler personality | 20% chance of suboptimal pick |
| a4c55c47 | UC-B5 | bot.decide.equalLover | Sprint3/T14 | BotPlayer.ts equal-lover personality | +15% bias toward 'equal' |
| a067feff | UC-B6 | bot.decide.random | Sprint3/T14 | BotPlayer.ts random personality | Uniform random distribution |
| b324159f | UC-B7 | bot.observe | Sprint3/T14 | BotPlayer.ts observeCard() | Played cards tracked for counting |
| 2d695025 | UC-B8 | bot.playDelayed | Sprint3/T14 | GameRoom.ts scheduleBotDecisions() | Bot plays after 1-8s random delay |

## MISSING — Client-Only (2 UCs, no server test needed)

| UUID | UC | Object.verb | Task | Impl File:Method | Test |
|------|-----|-------------|------|-----------------|------|
| 433fe03f | UC-R11 | room.share | Sprint3/T10 | LobbyUI.ts:181 / MultiplayerUI.ts:197,345 shareOrCopy() | Manual (navigator.share API) |
| — | UC-P12 | player.profile | Sprint3/T10 | MultiplayerUI.ts showProfile() | Manual (client-only) |

---

## Summary

| Category | Total | ✅ Covered | ⚠️ Partial | ❌ Missing |
|----------|-------|-----------|-----------|-----------|
| Connection | 3 | 3 | 0 | 0 |
| Rooms | 8 | 7 | 0 | 1 |
| Host | 4 | 2 | 0 | 2 |
| Game | 2 | 1 | 0 | 1 |
| Round | 8 | 0 | 4 | 4 |
| Player | 14 | 0 | 1 | 13 |
| Bot | 8 | 1 | 0 | 7 |
| Spectator | 4 | 0 | 0 | 4 |
| Chat | 4 | 1 | 0 | 3 |
| Game End | 5 | 0 | 0 | 5 |
| Special Cards | 13 | 0 | 0 | 13 |
| Client-only | 2 | 0 | 0 | 2 |
| **TOTAL** | **75** | **15** | **5** | **55** |
