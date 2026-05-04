[Back to Sprints](../)

# Sprint 3 Planning — QnD UpDown Multiplayer Card Game

## Sprint Goal
Fully working UpDown multiplayer online card game. Deadline: Sunday. QnD — web2 OK.

## Version / Branch
- Branch: `qndNow`
- Working directory: `qnd/`

## Team
- ud-po (0.0), ud-architect (0.1), ud-expert (0.2), ud-tester (0.4)
- Shells: expert (0.3), tester (0.5 — server runs here)

---

## COMPLETED TASKS (26 done)

### Phase 1: Server ✅
- [x] Task 1: WebSocket Game Rooms (GameRoom.ts 500+ lines) ✅
- [x] Task 2: Multiplayer Game Loop (merged into T1) ✅

### Phase 2: Client UI ✅
- [x] Task 3: Lobby UI (LobbyUI.ts) ✅
- [x] Task 4: Multiplayer Game UI (MultiplayerUI.ts) ✅

### Phase 3: Game Features ✅
- [x] Task 5: Special Cards (11 cards L1-L3, SpecialCards.ts) ✅
- [x] Task 6: Scoring + Economy ✅
- [x] Task 7: PWA + Mobile ✅

### Phase 4: Browser Fixes ✅
- [x] Task 8: esbuild fix (multiplayer.ts → dist/) ✅
- [x] Task 9: E2E Test Suite (23/26 PASS) ✅
- [x] Task 10: Mobile-First CSS (320px min) ✅

### Phase 5: Multiplayer UX ✅
- [x] Task 11: ?name= query param ✅
- [x] Task 12: Pre-created rooms + join URLs ✅
- [x] Task 13: Share button (clipboard + navigator.share) ✅
- [x] Task 14: AI Bot Player (4 personalities, beatable) ✅
- [x] Task 15: Auto-load rooms on connect ✅
- [x] Task 16: Round result card visuals (7♠→K♥) ✅
- [x] Task 17: Scrollable room list ✅
- [x] Task 18: Play Again button ✅
- [x] Task 19: Spectate mode ✅
- [x] Task 20: Auto-start removed, host Start Game button ✅

### Phase 6: Social + Polish ✅
- [x] Task 21: .env BASE_DOMAIN=home.donges.it, SERVER_CONFIG, mobile share ✅
- [x] Task 22: Room invite button ✅
- [x] Task 23: Room chat (slide-up pane, peek animation, CHAT_HISTORY for new joiners) ✅
- [x] Task 24: Auto-host (first human = host, transfer on leave) ✅
- [x] Task 25: Invite in chat header, host-only Start Game ✅
- [x] Task 26: Clickable player profiles (stats, bot personality) ✅

---

## BUGS FIXED
- BUG-1: Disconnected player elimination ✅
- BUG-SCORE: Scores in ROUND_RESULT ✅
- BUG-INVENTORY: Per-player inventory sync ✅
- BUG-SPECIAL: Protective Shell in starter ✅
- BUG-BASEHREF: /mp/ relative path prefix ✅
- BUG-BLANK: esbuild not building multiplayer.ts ✅
- BUG-BOT: Bot unkillable (nerfed to 25% random) ✅
- BUG-ROOMNAME: All rooms named "Game Room" ✅
- BUG-CHAT-DOUBLE: Own messages shown twice ✅
- BUG-JOIN-LINK: Room not found (stable slug IDs) ✅
- BUG-DOMAIN: .env was donges.home.it (fixed to home.donges.it) ✅

---

## TESTER VERIFICATION (batch run 2026-05-02)
- [x] Chat sync: 2 clients both receive CHAT_MESSAGE ✅
- [x] Chat history: new joiner gets CHAT_HISTORY ✅
- [x] No auto-start: game doesn't start without host ✅
- [x] Host-only START_GAME ✅
- [x] Invite URL in ROOM_JOINED ✅
- [x] SERVER_CONFIG shareDomain=home.donges.it ✅
- [ ] Player profile avatarUrl — FAIL (cosmetic, protocol test has no avatar)

## PENDING TRON VERIFICATION
- [ ] PWA installable on iPhone
- [ ] Mobile layout fits iPhone 15
- [ ] Chat pane UX on mobile
- [ ] Full game playthrough on mobile

---

## ARCHITECT DELIVERABLES
- [x] Gap analysis: task-0.2-gap-analysis.md ✅
- [x] AI bot spec: task-14-ai-agent-player-spec.md ✅
- [x] E2E test cases: task-9-test-cases.md (30+ TCs) ✅
- [x] Use case diagram: qnd/spec/qnd-usecase-diagram.puml ✅
- [x] DRY violations audit: qnd/spec/dry-violations.md ✅

---

## DRY Refactoring (from architect audit — qnd/spec/dry-violations.md)

- [x] [Task 27: DRY — MessageTypes.ts](./task-27-dry-message-types.md) **✅ DONE**
  - [x] 27.1: Expert — Created shared/MessageTypes.ts ✅
  - [x] 27.2: Expert — Replaced hardcoded strings ✅
  - [x] 27.3: Tester — Regression 34/37 PASS, 0 FAIL, 3 SKIP ✅

- [x] [Task 28: DRY — ShareUtil.ts](./task-28-dry-share-util.md) **✅ DONE**
  - [x] 28.1: Expert — shareOrCopy() verified ✅
  - [x] 28.2: Expert — generateInviteMessage() single source ✅

## Professional Test Suite (vitest migration)

- [x] [Task 32: Vitest Migration — UC-based test suite with full traceability](./task-32-vitest-migration.md) **✅ DONE — 47/47 PASS**
  9 UC category test files, 47 tests, UUID traceability throughout
  - [x] 32.1: UC-C1 connection.open ✅
  - [x] 32.2: UC-R2 room.create ✅
  - [x] 32.3: UC-R4 room.join ✅
  - [x] 32.4: UC-G1 game.start ✅
  - [x] 32.5: UC-P1 player.guess ✅
  - [x] 32.6: UC-B1 bot.add ✅
  - [x] 32.7: UC-S1 spectator.join ✅
  - [x] 32.8: UC-CH1 chat.send ✅
  - [x] 32.9: UC-GE1 game.end ✅
  Architect created 9 task files (32.1-32.9) with 61 AC. Tester implemented all. Serialized config fixed flaky timeouts.

- [ ] [Task 33: Auto-name Rooms with Host Player Name](./task-33-room-autoname.md) **🔧 IN PROGRESS**
  - [ ] 33.1: Expert — server.ts CREATE_ROOM default name "{playerName}'s Room"
  - [ ] 33.2: Tester — verify room names in lobby

- [ ] [Task 34: Room UC Test Coverage (R7/R8/R9 + Share Link Verification)](./task-34-room-uc-coverage.md) **🔧 IN PROGRESS**
  - [ ] 34.1: Expert — vitest for R7 (join full), R8 (join mid-game), R9 (join rejected)
  - [ ] 34.2: Tester — verify share links work end-to-end (user-created + pre-created + expired)

- [ ] [Task 29: DRY — CardUtils.ts](./task-29-dry-card-utils.md) **📋 DEFERRED**
  - [ ] 29.1: Expert — Extract suitSymbol(), cardColor(), cardToHtml() — 7 locations → 1

- [ ] [Task 30: DRY — ScoreCalculator.ts](./task-30-dry-score-calc.md) **📋 DEFERRED**
  - [ ] 30.1: Expert — Shared scoring formula between GameModel + GameRoom

- [ ] [Task 31: DRY — SpecialCards import](./task-31-dry-special-cards.md) **📋 DEFERRED**
  - [ ] 31.1: Expert — Client imports card data from SpecialCards.ts, no duplicate catalog

---

## DoD (pending Tron browser verification)
- [x] Multiplayer game works with 2+ players ✅ (Tron tested)
- [x] Lobby with pre-created rooms on load ✅ (Tron verified)
- [x] Full game loop: deal → guess → reveal → score ✅
- [x] Up/Down/Even cards functional ✅
- [x] Special cards (L1 at minimum) ✅
- [x] Round result shows both cards + why ✅ (Tron verified)
- [x] Score tracking ✅
- [x] WebSocket real-time sync ✅
- [x] Bots playable ✅ (Tron verified)
- [x] Share/invite with home.donges.it domain ✅
- [x] Chat in rooms ✅
- [x] Spectate mode ✅
- [x] Host controls (Start Game) ✅
- [x] Player profiles ✅
- [ ] PWA installable — needs Tron test
- [ ] Works on mobile browsers — needs Tron test

---

**Product Owner:** ud-po @ upDownTeam:0.0
**Sprint:** Sprint 3 — QnD Multiplayer Game
**Deadline:** Sunday
