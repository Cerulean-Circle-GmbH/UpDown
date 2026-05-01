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

## Bugs
- BUG-1: Disconnected player elimination ✅ VERIFIED
- BUG-SCORE: Scores in ROUND_RESULT ✅ VERIFIED
- BUG-INVENTORY: Per-player inventory sync ✅ VERIFIED
- BUG-SPECIAL: Protective Shell in starter inventory ✅ VERIFIED
- BUG-BASEHREF: /mp/ URL prefix breaks relative paths ❌ Expert fixing — add `<base href="/">`
- BUG-BLANK: Page blank because esbuild not building multiplayer.ts ✅ FIXED

## Phase 5: Browser Fix + Real Verification (RELEASE BLOCKER)

- [ ] [Task 8: Fix multiplayer page rendering](./task-8-fix-multiplayer-rendering.md) **🔧 IN PROGRESS**
  - [x] 8.1: Expert — esbuild for multiplayer.ts → dist/multiplayer.js ✅
  - [x] 8.2: Expert — multiplayer.html loads dist/multiplayer.js ✅
  - [x] 8.3: Expert — npm start builds both bundles ✅
  - [ ] 8.4: Expert — Add `<base href="/">` to fix /mp/ relative path prefix ⏳
  - [ ] 8.5: Tester — Verify HTML has base href, JS bundle loads (not 404)
  - [ ] 8.6: Tester — Restart server, check server log — no /mp/dist/ prefixed requests

- [ ] [Task 9: E2E Test Suite](./task-9-dod-browser-verification.md) **🔧 IN PROGRESS**
  - [x] 9.1: Architect — Test cases spec: 8 UCs, 30+ TCs with SEND/EXPECT ✅ task-9-test-cases.md
  - [x] 9.2: Tester — protocol-test-suite.js: 21/26 PASS, 2 test assertion bugs, 3 SKIP ✅
  - [ ] 9.3: Tester — Fix 2 assertion bugs (field name mismatches), re-run → 23/26 PASS
  - [ ] 9.4: Tester — Verify base href: curl /mp shows `<base href="/">`
  - [ ] 9.5: PO — Tron browser test: page renders lobby, game playable
  - [ ] 9.6: PO — DoD checklist verified against ALL evidence

- [ ] [Task 10: Mobile-First CSS](./task-10-mobile-first-css.md) **🔧 IN PROGRESS**
  - [ ] 10.1: Expert — Rewrite multiplayer.css mobile-first (min-width 320px = iPhone 4/SE)
  - [ ] 10.2: Expert — All elements fit without horizontal scroll at 375px (iPhone 15)
  - [ ] 10.3: Expert — Reference existing styles.css from QnD prototype (that one works on mobile)
  - [ ] 10.4: Expert — Card play area thumb-reachable, font/button sizes scale
  - [ ] 10.5: Expert — Keep QnD look and feel
  - [ ] 10.6: Tester — Verify with curl: multiplayer.css has mobile-first media queries (min-width not max-width)
  - [ ] 10.7: Tester — Verify viewport meta tag correct in multiplayer.html
  - [ ] 10.8: PO — Tron tests on iPhone: lobby fits, game fits, cards playable

- [x] [Task 11: Multi-player URL support](./task-11-multiplayer-urls.md) **✅ TESTER VERIFIED**
  - [x] 11.1: Expert — ?name= query param ✅
  - [x] 11.2: Expert — Rebuild + restart ✅
  - [x] 11.3: PO — 5 test URLs provided ✅
  - [x] 11.4: Tester — /mp?name=Tron returns 200 HTML with base href ✅

- [x] [Task 12: Pre-created Rooms with Join Links](./task-12-precreated-rooms.md) **✅ TESTER VERIFIED (4/4 PASS)**
  - [x] 12.1-12.5: Expert — 5 pre-created rooms, auto-start, auto-recreate, join URLs ✅
  - [x] 12.6-12.8: Tester — Rooms appear on startup, join URL works, deep-link serves HTML ✅

- [x] [Task 13: Share Button](./task-13-share-and-persist-rooms.md) **✅ TESTER VERIFIED**
  - [x] 13.1-13.4: Expert — Share button, clipboard copy, shareUrl in LIST_ROOMS ✅
  - [x] 13.5: Tester — shareUrl present in room list ✅

- [x] [Task 14: AI Agent Player](./task-14-ai-agent-player.md) **✅ TRON VERIFIED — bots work + beatable**
  - [x] 14.1: Architect — Spec: card-counting heuristic, 4 personalities ✅
  - [x] 14.2: Expert — Add Bot button, ADD_BOT protocol ✅
  - [x] 14.3: Expert — BotPlayer.ts, 25% random guess + 30% shield = beatable ✅
  - [x] 14.7: Tester — Bot eliminated correctly ✅ (after nerf fix)

- [x] [Task 15: Lobby Auto-Load Rooms on Connect](./task-15-lobby-autoload.md) **✅ TESTER VERIFIED**
  - [x] 15.1-15.3: Expert — Auto-request + server auto-push ROOM_LIST on connect ✅
  - [x] 15.4: Tester — 6/6 PASS ✅
  - [x] 15.5: PO — Tron verified rooms show on first load ✅

- [x] [Task 16: Round Result Visual Feedback](./task-16-round-result-visuals.md) **✅ TESTER VERIFIED**
  - [x] 16.1-16.5: Expert — Both cards shown (7♠→K♥), bet direction, correct/wrong, score+streak ✅
  - [x] 16.6: Tester — 6/6 PASS ✅
  - [x] 16.7: PO — Tron verified ✅

- [ ] [Task 17: Scrollable Room List on Mobile](./task-17-scrollable-room-list.md) **📋 PLANNED**
  - [ ] 17.1: Expert — Room list container: overflow-y: auto, max-height calc(100vh - header/footer), -webkit-overflow-scrolling: touch
  - [ ] 17.2: Expert — Test with 10+ rooms visible on 320px screen
  - [ ] 17.3: Tester — Verify room list scrolls on mobile viewport
  - [ ] 17.4: PO — Tron verifies scrolling works on iPhone

- [ ] [Task 18: Fix "Play Again" Button](./task-18-play-again-fix.md) **📋 PLANNED — TRON BUG**
  - [ ] 18.1: Expert — Investigate "Play Again" behavior: what happens when clicked? Expected: return to lobby or restart game in same room
  - [ ] 18.2: Expert — Fix: Play Again should return player to lobby with room list, or rejoin the same pre-created room
  - [ ] 18.3: Tester — Verify Play Again: game over → click → back in lobby with rooms visible, can join new game
  - [ ] 18.4: PO — Tron verifies Play Again flow feels natural

- [ ] [Task 19: Spectate Mode](./task-19-spectate-mode.md) **📋 PLANNED — TRON FEATURE**
  - [ ] 19.1: Expert — "Spectate" button on rooms that are in-game (not just waiting rooms)
  - [ ] 19.2: Expert — Spectator joins room but gets NO play buttons (Up/Down/Even hidden)
  - [ ] 19.3: Expert — Spectator sees: all players, GM card, round results, scores, who's eliminated
  - [ ] 19.4: Expert — Spectator count shown in room info ("3 playing, 2 watching")
  - [ ] 19.5: Expert — Spectator can leave anytime, or "Join Next Game" when current game ends
  - [ ] 19.6: Tester — Verify spectator sees game state but cannot play cards
  - [ ] 19.7: Tester — Verify spectator doesn't affect game logic (not counted in player list)
  - [ ] 19.8: PO — Tron verifies spectate experience

## E2E Test Results
- Protocol suite: 23/26 PASS, 0 FAIL, 3 SKIP ✅
- Base href fix: deployed, page loads ✅
- Mobile CSS: mobile-first rewrite deployed ✅ (Tron testing on iPhone)

## SPRINT 3: ❌ REOPENED — Mobile CSS not fitting iPhone

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
