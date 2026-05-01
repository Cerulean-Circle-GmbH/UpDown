[Back to Sprints](../)

# Sprint 3 Planning — QnD UpDown Multiplayer Card Game

## Sprint Goal
Fully working UpDown multiplayer online card game with lobby, all special cards, scoring, and leaderboard. PWA web app. Deadline: Sunday. Quick and dirty — web2 is OK.

## Version Strategy
- Branch: `qndNow`
- Working directory: `qnd/`
- No @web4x component versions — direct development in qnd/

## Sprint Overview
**Duration:** Until Sunday
**Focus:** Complete multiplayer game from existing QnD prototype
**Team:** ud-po (0.0), ud-architect (0.1), ud-expert (0.2), ud-tester (0.4)
**Approach:** Quick and dirty. Keep existing QnD look/feel and PWA style. Reuse existing game components where possible.

## Phase 0: Discovery (CURRENT — all agents reading)

### Task 0.1: All agents — Read specs and existing code
**Status:** IN PROGRESS
**Deliverable:** Each agent reports what exists vs what's missing

Files to read:
- `specs/gameplay.md` — full game rules, rounds, scoring
- `specs/cards.md` — special effect cards (Level 1/2/3)
- `specs/multiplayer.md` — lobby/social features
- `qnd/` — existing prototype (HTTPS server, Lit components, vanilla JS)
- `qnd/src/public/ts/` — Card.ts, GameModel.ts, GameUI.ts, main.ts
- `qnd/src/public/js/game.js` — vanilla JS game logic
- `qnd/src/ts/server/server.ts` — HTTPS + WebSocket server
- `qnd/spec/` — server.spec.md, ux.spec.md
- Existing components: GameLogicEngine, CardDeckManager, UpDown.Core/Cards/Server/UI

### Task 0.2: Architect — Gap analysis: spec vs QnD prototype
**Status:** ✅ DONE
**Deliverable:** task-0.2-gap-analysis.md

### Task 0.3: PO + Architect — Sprint task planning
**Status:** ✅ DONE
**Deliverable:** This file — 7 tasks across 4 phases

## Phase 1: Server — Multiplayer Infrastructure ✅ DONE

- [x] [Task 1: WebSocket Game Rooms](./task-1-websocket-game-rooms.md) **✅ DONE**
  - [x] 1.1: Expert — GameRoom class (380 lines): room create/join/leave, player list, room state ✅
  - [x] 1.2: Expert — WS protocol: CREATE/JOIN/LEAVE/LIST/START/PLAY_CARD/ROUND_START/ROUND_RESULT/COUNTDOWN/GAME_OVER ✅
  - [x] 1.3: Expert — Room manager: create/list/join rooms, private rooms with key, cleanup ✅
  - [ ] 1.4: Tester — 2 browsers can join same room ⏳

- [x] [Task 2: Multiplayer Game Loop on Server](./task-2-multiplayer-game-loop.md) **✅ DONE (merged into Task 1)**
  - [x] 2.1: GM logic: 52-card French deck, 7-card hand, random card play ✅
  - [x] 2.2: Round loop: deal → place Up/Down/Even → 10s countdown → reveal → score ✅
  - [x] 2.3: Player state: score, alive/eliminated ✅
  - [x] 2.4: Exchange phase: join/leave between rounds ✅
  - [ ] 2.5: Tester — Full game loop with 2+ players ⏳

## Phase 2: Client — Multiplayer UI (Expert — IN PROGRESS)

- [ ] [Task 3: Lobby UI](./task-3-lobby-ui.md) **🔧 IN PROGRESS**
  - [ ] 3.1: Expert — LobbyUI Lit component: list rooms, create room, join with key, player count
  - [ ] 3.2: Expert — Room view: player list, ready state, start game button (host only)
  - [ ] 3.3: Tester — Can create room, join room, see other players

- [ ] [Task 4: Multiplayer Game UI](./task-4-multiplayer-game-ui.md) **🔧 IN PROGRESS**
  - [ ] 4.1: Expert — Extend GameUI for multiplayer: show all players at table, GM card, countdown timer
  - [ ] 4.2: Expert — Card play UI: player selects Up/Down/Even, optional special card, submit before timer
  - [ ] 4.3: Expert — Round result display: who guessed right/wrong, scores updated
  - [ ] 4.4: Expert — Game over: final scores, leaderboard, play again
  - [ ] 4.5: Tester — Full multiplayer game playable in 2 browsers

## Phase 3: Special Cards (Expert — PRIORITY 3)

- [ ] [Task 5: Special Effect Cards](./task-5-special-cards.md)
  - [ ] 5.1: Expert — Card data model: Level 1/2/3 cards from specs/cards.md
  - [ ] 5.2: Expert — Level 1 cards: Mass Intelligence, Protective Shell, Spy, Copy Cat
  - [ ] 5.3: Expert — Level 2 cards: Sacrifice, Double Points, Shield, Reveal Hand
  - [ ] 5.4: Expert — Level 3 cards: One for the Team, Freeze, Swap Hands
  - [ ] 5.5: Expert — Special card UI: card slots in hand, play alongside main card
  - [ ] 5.6: Expert — Server-side card resolution: priority by level, effect application
  - [ ] 5.7: Tester — Each special card effect works correctly in multiplayer

## Phase 4: Polish (Expert+Tester — PRIORITY 4, if time)

- [ ] [Task 6: Scoring and Economy](./task-6-scoring-economy.md)
  - [ ] 6.1: Expert — Points per round survived, bonus for completing deck
  - [ ] 6.2: Expert — Diamond rewards per game
  - [ ] 6.3: Expert — Leaderboard display (session-based, no persistence needed for QnD)

- [ ] [Task 7: PWA and Mobile](./task-7-pwa-mobile.md)
  - [ ] 7.1: Expert — Verify PWA install works with multiplayer
  - [ ] 7.2: Expert — Mobile touch: card selection, swipe gestures
  - [ ] 7.3: Tester — Works on mobile Safari + Chrome

## Critical Path
```
Task 1 (rooms) → Task 2 (game loop) → Task 3 (lobby UI) → Task 4 (game UI) → Task 5 (special cards)
                                                                                 ↓
                                                                          Task 6 (scoring) + Task 7 (PWA)
```
Tasks 1+2 are server-side, can be tested with raw WebSocket before UI exists.
Tasks 3+4 are client-side, need Tasks 1+2 done.
Task 5 extends the working game. Tasks 6+7 are polish.

## Existing Assets Inventory

### QnD Prototype (`qnd/`)
- HTTPS server with WebSocket (server.ts)
- Lit components: Card.ts, GameModel.ts, GameUI.ts
- Vanilla JS: game.js
- PWA: manifest.json, sw.js, icons
- Responsive CSS: styles.css
- esbuild bundler configured

### Existing Game Components (`components/`)
- GameLogicEngine — game rules engine
- CardDeckManager — card deck operations
- UpDown.Core — core game model
- UpDown.Cards — card definitions
- UpDown.Server — server-side game logic
- UpDown.UI — game UI components
- GameUserInterface — UI framework
- GameDemoSystem — demo/testing

### Spec Requirements (from specs/)
- French-suited 52-card deck
- Up/Down/Even card guessing
- 10-second countdown per round
- Up to 10 players per lobby
- Private lobbies with key
- Special effect cards (Level 1/2/3)
- Game Master (GM) deals from 7-card hand
- Scoring and leaderboard
- Diamond economy (in-game currency)
- PWA with offline support

## Definition of Done
- [ ] Multiplayer game works with 2+ players in browser
- [ ] Lobby system: create, join with key, leave
- [ ] Full card game loop: deal → guess → reveal → score
- [ ] All 3 main cards (Up, Down, Even) functional
- [ ] At least Level 1 special cards implemented
- [ ] 10-second countdown timer
- [ ] Score tracking and display
- [ ] WebSocket real-time sync between players
- [ ] PWA installable
- [ ] Works on mobile browsers

## Process Rules
- Branch: qndNow
- Quick and dirty — web2 OK, no web4 component versioning
- Keep QnD look/feel and PWA style
- Every agent updates context file after each task
- SM monitors and rewinds agents as needed

---

**Product Owner:** ud-po @ upDownTeam:0.0
**Created:** 2026-05-01
**Deadline:** Sunday
