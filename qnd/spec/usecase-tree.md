# UpDown QnD — Use Case Tree
## Object.verb → Class.method Traceability

```
ENTER /mp
│
├── connection
│   ├── connection.open
│   │   ├── Client: WebSocketClient.connect()
│   │   └── Server: server.setupWebSocketServer() → ws.on('connection')
│   │       └── sends: welcome { clientId, onlineCount }
│   │
│   └── connection.close
│       ├── Client: WebSocketClient.ws.onclose
│       └── Server: ws.on('close') → room.removePlayer(clientId)
│
├── rooms
│   ├── rooms.list
│   │   ├── Client: WebSocketClient.listRooms() → { type: 'LIST_ROOMS' }
│   │   ├── Server: RoomManager.listRooms() → filters !isPrivate
│   │   └── Response: { type: 'ROOM_LIST', rooms[] }
│   │       └── UI: LobbyUI.renderRoomList()
│   │
│   ├── room.create
│   │   ├── Client: WebSocketClient.createRoom(name, playerName, max, key?)
│   │   ├── Server: RoomManager.createRoom(name, hostId, max, key)
│   │   │   └── new GameRoom(name, hostId, max, key)
│   │   ├── Server: GameRoom.addPlayer(hostId, ws, name, avatar)
│   │   │   ├── player.isHost = true (hostId === first human)
│   │   │   ├── player.inventory = GameRoom.generateStarterInventory()
│   │   │   ├── broadcasts: PLAYER_JOINED { player, playerCount }
│   │   │   └── sends to host: ROOM_JOINED { room, players[], minPlayers }
│   │   └── UI: LobbyUI.on('ROOM_JOINED') → onEnterRoom(roomId)
│   │       └── transition: LobbyUI.hide() → MultiplayerUI.show()
│   │
│   ├── room.join
│   │   ├── Client: WebSocketClient.joinRoom(roomId, playerName, key?)
│   │   ├── Server: RoomManager.getRoom(roomId)
│   │   │   ├── guard: room exists? → ERROR 'Room not found'
│   │   │   ├── guard: private + wrong key? → ERROR 'Wrong room key'
│   │   │   └── guard: full or wrong state? → ERROR 'Room is full or game in progress'
│   │   ├── Server: GameRoom.addPlayer(id, ws, name, avatar)
│   │   │   ├── guard: players.size < maxPlayers
│   │   │   ├── guard: state === 'waiting' || state === 'exchange'
│   │   │   ├── broadcasts: PLAYER_JOINED { player, playerCount }
│   │   │   ├── sends to joiner: ROOM_JOINED { room, players[] }
│   │   │   └── sends to joiner: CHAT_HISTORY { messages[] } (if any)
│   │   └── UI: MultiplayerUI.on('ROOM_JOINED') → render()
│   │
│   ├── room.leave
│   │   ├── Client: WebSocketClient.leaveRoom() → { type: 'LEAVE_ROOM' }
│   │   ├── Server: GameRoom.removePlayer(id)
│   │   │   ├── if mid-round (countdown/revealing):
│   │   │   │   ├── player.disconnected = true
│   │   │   │   ├── player.alive = false
│   │   │   │   └── broadcasts: PLAYER_DISCONNECTED { playerId }
│   │   │   ├── else:
│   │   │   │   ├── players.delete(id)
│   │   │   │   └── broadcasts: PLAYER_LEFT { playerId, playerCount }
│   │   │   └── if was host:
│   │   │       └── room.hostTransfer
│   │   └── UI: onLeaveRoom() → MultiplayerUI.hide() → LobbyUI.show()
│   │
│   └── room.share
│       ├── Client: shareOrCopy(url) (no server)
│       │   ├── navigator.share() (mobile)
│       │   └── navigator.clipboard.writeText() (desktop)
│       └── URL: /mp?join={roomId}
│
├── host
│   ├── host.transfer
│   │   ├── Server: GameRoom.removePlayer() → hostId reassigned
│   │   │   └── first non-disconnected player becomes host
│   │   ├── broadcasts: HOST_CHANGED { hostId }
│   │   └── UI: MultiplayerUI.on('HOST_CHANGED') → isHost = true → renderControls()
│   │
│   ├── host.addBot
│   │   ├── Client: WebSocketClient.addBot(personality?)
│   │   ├── Server: GameRoom.addBot(personality?)
│   │   │   ├── new BotPlayer(personality) — cautious|gambler|equal-lover|random
│   │   │   ├── players.set(botId, { ws: null, isBot: true })
│   │   │   ├── bots.set(botId, botInstance)
│   │   │   └── broadcasts: PLAYER_JOINED { player { isBot: true } }
│   │   └── UI: MultiplayerUI.on('PLAYER_JOINED') → renderPlayers()
│   │
│   └── host.startGame → game.start
│
├── game
│   ├── game.start
│   │   ├── Client: WebSocketClient.startGame() → { type: 'START_GAME' }
│   │   ├── guard: only host can start
│   │   ├── Server: GameRoom.startGame()
│   │   │   ├── deck = GameRoom.createShuffledDeck() — 52 cards, Fisher-Yates
│   │   │   ├── gmHand = deck.pop() × 7
│   │   │   ├── players.forEach → reset score/streak/alive
│   │   │   ├── bots.forEach → BotPlayer.reset()
│   │   │   ├── if players < minPlayers → auto addBot() to fill
│   │   │   └── GameRoom.nextRound()
│   │   └── → round.start (first round)
│   │
│   ├── round
│   │   ├── round.start
│   │   │   ├── Server: GameRoom.nextRound()
│   │   │   │   ├── guard: gmHand + deck empty? → game.end
│   │   │   │   ├── guard: no alive players? → game.end
│   │   │   │   ├── round++
│   │   │   │   ├── previousCard = currentCard
│   │   │   │   ├── currentCard = gmHand.splice(random)
│   │   │   │   ├── gmHand.push(deck.pop()) — refill
│   │   │   │   ├── players.forEach → currentGuess = null, specialCard = null
│   │   │   │   ├── state = 'countdown', countdownSeconds = 10
│   │   │   │   ├── sendTo each player: ROUND_START { round, currentCard, previousCard, countdown, cardsLeft, alivePlayers[], inventory[], frozen }
│   │   │   │   ├── GameRoom.startCountdown()
│   │   │   │   └── GameRoom.scheduleBotDecisions()
│   │   │   └── UI: MultiplayerUI.on('ROUND_START') → renderGame()
│   │   │
│   │   ├── round.countdown
│   │   │   ├── Server: setInterval 1s → countdown--
│   │   │   │   ├── broadcasts: COUNTDOWN { seconds }
│   │   │   │   └── if seconds <= 0 → round.resolve
│   │   │   └── UI: MultiplayerUI.on('COUNTDOWN') → updateCountdown()
│   │   │
│   │   ├── round.resolve
│   │   │   ├── Server: GameRoom.resolveRound()
│   │   │   │   ├── state = 'revealing'
│   │   │   │   ├── draw nextCard from gmHand (comparison card)
│   │   │   │   ├── refill gmHand from deck
│   │   │   │   │
│   │   │   │   ├── PHASE 1: base results
│   │   │   │   │   └── each alive player:
│   │   │   │   │       ├── guess === null → eliminated (timeout)
│   │   │   │   │       ├── guess 'up' → correct if next > current
│   │   │   │   │       ├── guess 'down' → correct if next < current
│   │   │   │   │       └── guess 'equal' → correct if next === current
│   │   │   │   │
│   │   │   │   ├── PHASE 2: special cards
│   │   │   │   │   └── SpecialCards.resolveSpecialCards(played, baseResults, gmHand, aliveCount)
│   │   │   │   │       ├── sort by priority (level 3 > 2 > 1)
│   │   │   │   │       └── each card:
│   │   │   │   │           ├── protective_shell → survive even if wrong
│   │   │   │   │           ├── double_points → score × 2
│   │   │   │   │           ├── peek → (client-side info only)
│   │   │   │   │           ├── sacrifice → die but give points to target
│   │   │   │   │           ├── swap → swap result with target
│   │   │   │   │           ├── reveal_hand → (client-side info only)
│   │   │   │   │           ├── freeze → target can't play next round
│   │   │   │   │           ├── one_for_the_team → all wrong players survive
│   │   │   │   │           ├── second_chance → retry on wrong guess
│   │   │   │   │           ├── point_steal → steal % of target's score
│   │   │   │   │           └── mass_intelligence → (client-side info only)
│   │   │   │   │
│   │   │   │   ├── PHASE 3: apply to players
│   │   │   │   │   └── each player: score += roundScore, streak++|0, alive = result
│   │   │   │   │
│   │   │   │   ├── currentCard = nextCard
│   │   │   │   ├── broadcasts: ROUND_RESULT { round, revealedCard, previousCard, results[], specialEffects[], scores[], cardsLeft }
│   │   │   │   │
│   │   │   │   └── check end:
│   │   │   │       ├── no alive players → setTimeout(game.end, 2s)
│   │   │   │       ├── no cards left → setTimeout(game.end, 2s)
│   │   │   │       └── else → state = 'exchange' → setTimeout(round.start, 3s)
│   │   │   │
│   │   │   └── UI: MultiplayerUI.on('ROUND_RESULT') → renderRoundResult()
│   │   │
│   │   └── round.exchange
│   │       ├── Server: state = 'exchange' (3 second pause)
│   │       │   ├── GameRoom.cleanupDisconnected() — remove marked players
│   │       │   └── → round.start (next round)
│   │       └── UI: shows result screen, waits for next ROUND_START
│   │
│   └── game.end
│       ├── Server: GameRoom.endGame()
│       │   ├── state = 'finished'
│       │   ├── clearInterval(countdownTimer)
│       │   ├── leaderboard = players.sort(score DESC, rounds DESC)
│       │   │   └── each player: diamonds = rankBonus + roundBonus + streakBonus
│       │   ├── broadcasts: GAME_OVER { leaderboard[], playAgain, roomId }
│       │   └── auto-cleanup after 60s or recreate
│       └── UI: MultiplayerUI.on('GAME_OVER') → renderGameOver()
│           ├── shows: 🥇🥈🥉 ranks, scores, diamonds
│           ├── button: "🔄 Play Again" → leaveRoom + rejoin
│           └── button: "← Back to Lobby" → leaveRoom
│
├── player
│   ├── player.guess
│   │   ├── Client: WebSocketClient.playCard(guess) → { type: 'PLAY_CARD', guess }
│   │   ├── Server: GameRoom.playCard(playerId, guess)
│   │   │   ├── guard: player alive, state === 'countdown'
│   │   │   ├── guard: player.frozen → unfreeze, skip turn
│   │   │   ├── player.currentGuess = guess
│   │   │   ├── broadcasts: CARD_PLAYED { playerId, hasPlayed: true }
│   │   │   └── if allAlive played → cancel timer → round.resolve
│   │   └── UI: MultiplayerUI.on('CARD_PLAYED') → renderPlayerStatus()
│   │
│   ├── player.playSpecial
│   │   ├── Client: WebSocketClient.playSpecial(cardId, targetId?)
│   │   ├── Server: GameRoom.playSpecialCard(playerId, cardId, targetId?)
│   │   │   ├── guard: player alive, state === 'countdown'
│   │   │   ├── guard: card in inventory, not already used
│   │   │   ├── player.specialCard = cardId
│   │   │   ├── inventory.remove(cardId)
│   │   │   ├── usedSpecials.push(cardId)
│   │   │   └── broadcasts: SPECIAL_CARD_PLAYED { playerId, cardName, cardEmoji }
│   │   └── UI: button disabled + opacity 0.4
│   │
│   └── player.profile
│       └── UI: MultiplayerUI.showProfile(playerId) — client only, no server
│
├── bot
│   ├── bot.decide
│   │   ├── Server: GameRoom.scheduleBotDecisions() → setTimeout(1-8s)
│   │   │   └── BotPlayer.decideGuess(currentCard)
│   │   │       ├── count remaining cards above/below/equal
│   │   │       ├── probUp = cardsAbove / remaining
│   │   │       ├── probDown = cardsBelow / remaining
│   │   │       ├── probEqual = cardsEqual / remaining
│   │   │       ├── apply personality modifier
│   │   │       └── return argmax(probUp, probDown, probEqual)
│   │   └── → player.guess (internal, no WS message)
│   │
│   └── bot.observe
│       └── Server: BotPlayer.observeCard(card) — tracks played cards
│
├── spectator
│   ├── spectator.join
│   │   ├── Client: WebSocketClient.spectateRoom(roomId, name)
│   │   ├── Server: GameRoom.addSpectator(id, ws, name)
│   │   │   ├── spectators.set(id, { ws, name })
│   │   │   ├── sends: SPECTATE_JOINED { room, players[], currentCard, previousCard, round, state }
│   │   │   ├── sends: CHAT_HISTORY { messages[] }
│   │   │   └── broadcastsAll: SPECTATOR_JOINED { name, spectatorCount }
│   │   └── UI: MultiplayerUI.on('SPECTATE_JOINED') → isSpectator = true → render()
│   │
│   ├── spectator.leave
│   │   ├── Client: WebSocketClient.leaveSpectate() → { type: 'LEAVE_SPECTATE' }
│   │   ├── Server: GameRoom.removeSpectator(id)
│   │   │   └── broadcastsAll: SPECTATOR_LEFT { spectatorCount }
│   │   └── UI: onLeaveRoom() → back to lobby
│   │
│   └── spectator.joinNext
│       ├── Client: WebSocketClient.joinNextGame(name)
│       ├── Server: GameRoom.promoteSpectator(id, name, avatar)
│       │   ├── guard: state === 'waiting' || 'exchange'
│       │   ├── guard: players.size < maxPlayers
│       │   ├── spectators.delete(id)
│       │   └── → room.join (addPlayer)
│       └── UI: isSpectator = false → becomes regular player
│
└── chat
    ├── chat.send
    │   ├── Client: WebSocketClient.sendChat(text)
    │   ├── Server: handleGameMessage case 'CHAT_MESSAGE'
    │   │   ├── text.slice(0, 200) — max length
    │   │   ├── room.chatHistory.push(msg) — max 50
    │   │   └── room.broadcast: CHAT_MESSAGE { senderId, senderName, text, timestamp }
    │   └── UI: MultiplayerUI.on('CHAT_MESSAGE') → append to chat div
    │
    ├── chat.history
    │   ├── Server: sent on room.join / spectator.join
    │   │   └── CHAT_HISTORY { messages[] }
    │   └── UI: MultiplayerUI.on('CHAT_HISTORY') → render all past messages
    │
    └── chat.invite
        └── → room.share (same share logic, from chat panel)
```
