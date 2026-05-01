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

- [x] [Task 3: Lobby UI](./task-3-lobby-ui.md) **✅ DONE**
  - [x] 3.1: Expert — LobbyUI.ts + WebSocketClient.ts ✅
  - [x] 3.2: Expert — Room view with player list + start button ✅
  - [x] 3.3: Tester — 8/9 PASS (room create, join, player sync, game start, card play, elimination, game over, reconnect) ✅

- [x] [Task 4: Multiplayer Game UI](./task-4-multiplayer-game-ui.md) **✅ DONE**
  - [x] 4.1: Expert — MultiplayerUI.ts with GM card, countdown, player table ✅
  - [x] 4.2: Expert — Card play UI: Up/Down/Even selection ✅
  - [x] 4.3: Expert — Round result display ✅ (score field added after tester bug report)
  - [x] 4.4: Expert — Game over display ✅
  - [x] 4.5: Tester — Full multiplayer game in 2 browsers ✅ 8/9 PASS
  **BUG-1 FIXED:** Disconnected player elimination before round resolve
  **BUG-SCORE FIXED:** Scores now included in ROUND_RESULT broadcast

## Phase 3: Special Cards (Expert — PRIORITY 3)

- [x] [Task 5: Special Effect Cards](./task-5-special-cards.md) **✅ DONE**
  - [x] 5.1: Expert — SpecialCards.ts (241 lines): 11 cards across L1/L2/L3 ✅
  - [x] 5.2: Expert — L1: Protective Shell, Mass Intelligence, Double Points, Peek ✅
  - [x] 5.3: Expert — L2: Sacrifice, Swap, Reveal Hand, Freeze ✅
  - [x] 5.4: Expert — L3: One for the Team, Second Chance, Point Steal ✅
  - [x] 5.5: Expert — PLAY_SPECIAL protocol + playSpecial() client ✅
  - [x] 5.6: Expert — 3-phase resolve: base → special effects → apply. Priority L3>L2>L1. No stacking ✅
  - [ ] 5.7: Tester — Special card effects verification ⏳ IN PROGRESS

## Phase 4: Polish ✅ DONE — TESTER RE-VERIFIED

- [x] [Task 6: Scoring and Economy](./task-6-scoring-economy.md) **✅ TESTER VERIFIED**
  - [x] 6.1: Scores+streaks in ROUND_RESULT ✅ (fixed, re-verified by tester)
  - [x] 6.2: Diamond rewards ✅
  - [x] 6.3: Leaderboard in game over ✅

- [x] [Task 7: PWA and Mobile](./task-7-pwa-mobile.md) **✅ DONE**
  - [x] 7.1: PWA manifest ✅
  - [x] 7.2: Mobile CSS ✅
  - [ ] 7.3: Mobile layout — needs human browser test

## Bugs — ALL FIXED + TESTER VERIFIED
- BUG-1: Disconnected player elimination ✅ VERIFIED
- BUG-SCORE: Scores in ROUND_RESULT ✅ VERIFIED (fixed after first FAIL)
- BUG-INVENTORY: Per-player inventory sync ✅ VERIFIED
- BUG-SPECIAL: Protective Shell in starter inventory ✅ VERIFIED (shield saves wrong guess)

## Tester Regression (re-verification after fixes)
- T1 Room create: PASS
- T2 Room join: PASS
- T3 Player list sync: PASS
- T4 Game start: PASS
- T5 Card play + timer: PASS
- T6 Scores in results: **PASS** (fixed)
- T7 Special cards (Protective Shell): **PASS** (fixed)
- T8 Mobile layout: needs human

## SPRINT 3: ❌ REOPENED — Tron browser test: BLANK PAGE

### Root Cause
multiplayer.html loads raw .ts file (`<script src="ts/multiplayer.ts">`). Browser can't execute TypeScript. esbuild only builds main.ts, not multiplayer.ts. Tester validated WebSocket protocol only — never loaded page in browser.

### Process Failure
Tester tested protocol messages, not browser rendering. DoD says "Multiplayer game works with 2+ players in browser" — never actually verified in a browser.

## Phase 5: Browser Fix (RELEASE BLOCKER)

- [ ] [Task 8: Fix multiplayer page rendering](./task-8-fix-multiplayer-rendering.md)
  - [ ] 8.1: Expert — Add esbuild for multiplayer.ts → dist/multiplayer.js
  - [ ] 8.2: Expert — Update multiplayer.html to load dist/multiplayer.js
  - [ ] 8.3: Expert — Add multiplayer build to npm start
  - [ ] 8.4: Expert — Verify page loads and renders in browser (use expert shell)
  - [ ] 8.5: Tester — Load https://localhost:3443/mp in browser, verify lobby renders

- [ ] [Task 9: DoD Browser Verification](./task-9-dod-browser-verification.md)
  - [ ] 9.1: Tester — Open 2 browser tabs, create room, join room — SCREENSHOT or describe what renders
  - [ ] 9.2: Tester — Start game, play cards, see round results in browser
  - [ ] 9.3: Tester — Play special card (Protective Shell) — verify UI shows it
  - [ ] 9.4: Tester — Game over screen shows leaderboard
  - [ ] 9.5: PO — Verify DoD checklist against ACTUAL browser evidence, not protocol logs

## DoD Validation (MUST ALL BE BROWSER-VERIFIED)
- [ ] Multiplayer game works with 2+ players **IN BROWSER** (not just WS protocol)
- [ ] Lobby UI renders: room list, create, join
- [ ] Game UI renders: GM card, countdown, Up/Down/Even buttons
- [ ] Special card UI renders: inventory, play button
- [ ] Round results display: scores, streaks
- [ ] Game over: leaderboard visible
- [ ] PWA installable
- [ ] Works on mobile browsers

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
