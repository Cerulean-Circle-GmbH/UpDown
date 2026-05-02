# UpDown QnD — Use Case Implementation & Test Coverage

Every use case must have: (1) implementation, (2) regression test case.

## Coverage Matrix

| UC | Object.verb | Implementation | Test | Status |
|----|-------------|---------------|------|--------|
| **CONNECTION** |
| UC-C1 | connection.open | WebSocketClient.connect() :108 / server.ts:303 | TC1.1 protocol-test-suite.js:70 | ✅ COVERED |
| UC-C2 | connection.close | server.ts ws.on('close') / GameRoom.removePlayer():254 | TC-E2 protocol-test-suite.js:262 | ✅ COVERED |
| **ROOMS** |
| UC-R1 | rooms.list | WebSocketClient.listRooms():72 / RoomManager.listRooms():660 | TC3.7 protocol-test-suite.js:152 + TC-R2:313 + TC-R4:342 | ✅ COVERED |
| UC-R2 | room.create | WebSocketClient.createRoom():60 / RoomManager.createRoom():643 / GameRoom.addPlayer():103 | TC2.1 protocol-test-suite.js:91 + TC2.3:101 | ✅ COVERED |
| UC-R3 | room.create.private | WebSocketClient.createRoom(key):60 / GameRoom(roomKey):70 | TC2.2 protocol-test-suite.js:105 | ✅ COVERED |
| UC-R4 | room.join | WebSocketClient.joinRoom():64 / GameRoom.addPlayer():103 | TC3.1 protocol-test-suite.js:120 | ✅ COVERED |
| UC-R5 | room.join.private.correct | GameRoom.addPlayer() with key check | TC3.3 protocol-test-suite.js:143 | ✅ COVERED |
| UC-R6 | room.join.private.wrong | server.ts:422 key mismatch → ERROR | TC3.4 protocol-test-suite.js:133 | ✅ COVERED |
| UC-R7 | room.join.full | GameRoom.addPlayer():75 size check | — | ❌ MISSING |
| UC-R8 | room.join.midGame | GameRoom.addPlayer():76 state === 'exchange' | — | ❌ MISSING |
| UC-R9 | room.join.rejected | GameRoom.addPlayer():76 state === 'countdown' | — | ❌ MISSING |
| UC-R10 | room.leave | WebSocketClient.leaveRoom():68 / GameRoom.removePlayer():254 | TC-R1 protocol-test-suite.js:299 | ✅ COVERED |
| UC-R11 | room.share | shareOrCopy() in LobbyUI:181 / MultiplayerUI:197,345 | — | ❌ NO TEST (client-only, manual) |
| **HOST** |
| UC-H1 | host.transfer | GameRoom.removePlayer():277 hostId reassign | TC-E2 protocol-test-suite.js:262 | ✅ COVERED |
| UC-H2 | host.addBot | WebSocketClient.addBot():88 / GameRoom.addBot():129 | — | ❌ MISSING |
| UC-H3 | host.startGame | → game.start | TC4.1 protocol-test-suite.js:170 | ✅ COVERED |
| UC-H4 | host.startGame.nonHost | server.ts:448 hostId check | — | ❌ MISSING |
| **GAME** |
| UC-G1 | game.start | WebSocketClient.startGame():76 / GameRoom.startGame():290 | TC4.1 protocol-test-suite.js:170 | ✅ COVERED |
| UC-G2 | game.start.autoFillBots | GameRoom.startGame():292 addBot() loop | — | ❌ MISSING |
| **ROUND** |
| UC-RD1 | round.start | GameRoom.nextRound():315 → ROUND_START | TC4.1 protocol-test-suite.js:170 (implicit) | ⚠️ PARTIAL |
| UC-RD2 | round.countdown | GameRoom.startCountdown():369 → COUNTDOWN | TC4.4 protocol-test-suite.js:184 | ✅ COVERED |
| UC-RD3 | round.resolve | GameRoom.resolveRound():428 → ROUND_RESULT | TC5.1 protocol-test-suite.js:195 (implicit) | ⚠️ PARTIAL |
| UC-RD4 | round.resolve.allPlayed | GameRoom.playCard():420 allPlayed → early resolve | TC5.4 protocol-test-suite.js:195 | ✅ COVERED |
| UC-RD5 | round.resolve.timeout | GameRoom.startCountdown():374 seconds <= 0 | — | ❌ MISSING (would need 10s wait) |
| UC-RD6 | round.resolve.specials | SpecialCards.resolveSpecialCards():242 | — | ❌ MISSING |
| UC-RD7 | round.exchange | GameRoom.resolveRound():532 state='exchange' 3s | — | ❌ MISSING |
| UC-RD8 | round.deckExhausted | GameRoom.nextRound():320 gmHand+deck empty → endGame | — | ❌ MISSING |
| **PLAYER** |
| UC-P1 | player.guess.up | WebSocketClient.playCard('up'):80 / GameRoom.playCard():411 | TC5.1 protocol-test-suite.js:195 | ✅ COVERED |
| UC-P2 | player.guess.down | WebSocketClient.playCard('down'):80 / GameRoom.playCard():411 | TC5.1 (only tests one guess) | ⚠️ PARTIAL |
| UC-P3 | player.guess.equal | WebSocketClient.playCard('equal'):80 / GameRoom.playCard():411 | — | ❌ MISSING |
| UC-P4 | player.guess.correct | GameRoom.resolveRound():458 score += 10 + streak | full-game-ws.test.js (implicit) | ⚠️ PARTIAL |
| UC-P5 | player.guess.wrong | GameRoom.resolveRound():492 alive = false | full-game-ws.test.js (implicit) | ⚠️ PARTIAL |
| UC-P6 | player.guess.timeout | GameRoom.resolveRound():453 guess === null → eliminated | — | ❌ MISSING |
| UC-P7 | player.guess.frozen | GameRoom.playCard():414 frozen → unfreeze, skip | — | ❌ MISSING |
| UC-P8 | player.guess.dead | GameRoom.playCard():412 !alive → ignored | — | ❌ MISSING |
| UC-P9 | player.playSpecial | WebSocketClient.playSpecial():84 / GameRoom.playSpecialCard():384 | — | ❌ MISSING |
| UC-P10 | player.playSpecial.notInInventory | GameRoom.playSpecialCard():388 guard | — | ❌ MISSING |
| UC-P11 | player.playSpecial.alreadyUsed | GameRoom.playSpecialCard():389 guard | — | ❌ MISSING |
| UC-P12 | player.profile | MultiplayerUI.showProfile() (client-only) | — | ❌ NO TEST (client-only) |
| UC-P13 | player.streak | GameRoom.resolveRound():489 streak++ on correct | — | ❌ MISSING |
| UC-P14 | player.score | GameRoom.resolveRound():485 score += 10 + streak | — | ❌ MISSING |
| **BOT** |
| UC-B1 | bot.add | GameRoom.addBot():129 / BotPlayer constructor | — | ❌ MISSING |
| UC-B2 | bot.decide | BotPlayer.decideGuess():127 card-counting heuristic | — | ❌ MISSING |
| UC-B3 | bot.decide.cautious | BotPlayer personality=cautious → argmax | — | ❌ MISSING |
| UC-B4 | bot.decide.gambler | BotPlayer personality=gambler → 20% surprise | — | ❌ MISSING |
| UC-B5 | bot.decide.equalLover | BotPlayer personality=equal-lover → +15% bias | — | ❌ MISSING |
| UC-B6 | bot.decide.random | BotPlayer personality=random → Math.random | — | ❌ MISSING |
| UC-B7 | bot.observe | BotPlayer.observeCard() → tracks played cards | — | ❌ MISSING |
| UC-B8 | bot.playDelayed | GameRoom.scheduleBotDecisions() → 1-8s delay | — | ❌ MISSING |
| **SPECTATOR** |
| UC-S1 | spectator.join | WebSocketClient.spectateRoom():92 / GameRoom.addSpectator():146 | — | ❌ MISSING |
| UC-S2 | spectator.leave | WebSocketClient.leaveSpectate():97 / GameRoom.removeSpectator():159 | — | ❌ MISSING |
| UC-S3 | spectator.joinNext | WebSocketClient.joinNextGame():100 / GameRoom.promoteSpectator():169 | — | ❌ MISSING |
| UC-S4 | spectator.seesGame | broadcastAll() includes spectators | — | ❌ MISSING |
| **CHAT** |
| UC-CH1 | chat.send | WebSocketClient.sendChat():104 / server.ts:511 / broadcast | — | ❌ MISSING |
| UC-CH2 | chat.history | GameRoom.addPlayer():122 sends CHAT_HISTORY | — | ❌ MISSING |
| UC-CH3 | chat.maxLength | server.ts:515 text.slice(0, 200) | — | ❌ MISSING |
| UC-CH4 | chat.maxHistory | server.ts:518 chatHistory max 50 | — | ❌ MISSING |
| **GAME END** |
| UC-GE1 | game.end.allEliminated | GameRoom.resolveRound():528 alivePlayers.length === 0 | — | ❌ MISSING |
| UC-GE2 | game.end.deckEmpty | GameRoom.resolveRound():528 gmHand+deck === 0 | — | ❌ MISSING |
| UC-GE3 | game.end.leaderboard | GameRoom.endGame():541 sort + diamonds | — | ❌ MISSING |
| UC-GE4 | game.end.diamonds | GameRoom.endGame():550 rank+round+streak bonus | — | ❌ MISSING |
| UC-GE5 | game.end.playAgain | MultiplayerUI.renderGameOver():571 leaveRoom+rejoin | — | ❌ MISSING |
| **SPECIAL CARDS (13 types)** |
| UC-SC1 | special.protectiveShell | SpecialCards.ts protective_shell → survive wrong | — | ❌ MISSING |
| UC-SC2 | special.doublePoints | SpecialCards.ts double_points → score × 2 | — | ❌ MISSING |
| UC-SC3 | special.peek | SpecialCards.ts peek → see GM hand | — | ❌ MISSING |
| UC-SC4 | special.sacrifice | SpecialCards.ts sacrifice → die, give pts | — | ❌ MISSING |
| UC-SC5 | special.swap | SpecialCards.ts swap → swap result with target | — | ❌ MISSING |
| UC-SC6 | special.revealHand | SpecialCards.ts reveal_hand → show GM cards | — | ❌ MISSING |
| UC-SC7 | special.freeze | SpecialCards.ts freeze → target skips turn | — | ❌ MISSING |
| UC-SC8 | special.oneForTheTeam | SpecialCards.ts one_for_the_team → all survive | — | ❌ MISSING |
| UC-SC9 | special.secondChance | SpecialCards.ts second_chance → retry | — | ❌ MISSING |
| UC-SC10 | special.pointSteal | SpecialCards.ts point_steal → steal % | — | ❌ MISSING |
| UC-SC11 | special.massIntelligence | SpecialCards.ts mass_intelligence → info | — | ❌ MISSING |
| UC-SC12 | special.priorityOrder | SpecialCards.resolveSpecialCards() L3 > L2 > L1 | — | ❌ MISSING |
| UC-SC13 | special.inventory | GameRoom.generateStarterInventory() | — | ❌ MISSING |

## Coverage Summary

| Category | Total UCs | Covered | Partial | Missing | % |
|----------|-----------|---------|---------|---------|---|
| Connection | 2 | 2 | 0 | 0 | 100% |
| Rooms | 11 | 6 | 0 | 5 | 55% |
| Host | 4 | 2 | 0 | 2 | 50% |
| Game | 2 | 1 | 0 | 1 | 50% |
| Round | 8 | 1 | 2 | 5 | 19% |
| Player | 14 | 1 | 3 | 10 | 14% |
| Bot | 8 | 0 | 0 | 8 | 0% |
| Spectator | 4 | 0 | 0 | 4 | 0% |
| Chat | 4 | 0 | 0 | 4 | 0% |
| Game End | 5 | 0 | 0 | 5 | 0% |
| Special Cards | 13 | 0 | 0 | 13 | 0% |
| **TOTAL** | **75** | **13** | **5** | **57** | **17%** |

## Priority for Missing Tests

### P0 — Core gameplay (must have)
- UC-P4/P5: correct/wrong guess with score verification
- UC-P13/P14: streak and score calculation
- UC-GE1/GE2: game end conditions
- UC-GE3: leaderboard ordering
- UC-RD5: timeout elimination
- UC-B1/B2: bot add + decide

### P1 — Multiplayer flow
- UC-R7/R8/R9: room join edge cases (full, mid-game)
- UC-H2/H4: bot management, non-host rejection
- UC-S1/S3: spectator join + promote
- UC-CH1/CH3: chat send + length limit

### P2 — Special cards
- UC-SC1 through UC-SC11: each card effect
- UC-SC12: priority ordering
- UC-SC13: inventory generation

### P3 — Edge cases
- UC-P6/P7/P8: timeout, frozen, dead player
- UC-RD6/RD7/RD8: specials resolution, exchange, deck exhaustion
- UC-GE4/GE5: diamonds, play again
