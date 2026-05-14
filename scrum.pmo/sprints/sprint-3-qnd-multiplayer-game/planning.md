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

- [x] [Task 33: Auto-name Rooms with Host Player Name](./task-33-room-autoname.md) **✅ DONE**
  - [x] 33.1: Expert — prefill "{playerName}'s Room" dynamically ✅
  - [x] 33.2: Tester — verified in lobby ✅

- [x] [Task 34: Room UC Test Coverage (R7/R8/R9 + Share Link Verification)](./task-34-room-uc-coverage.md) **✅ DONE**
  - [x] 34.1: Expert — vitest R7/R8/R9 ✅
  - [x] 34.2: Tester — share links 4/4 PASS ✅

- [x] [Task 35: Room Replay — Same Group Plays Multiple Games](./task-35-room-replay.md) **✅ DONE**
  - [x] 35.1: Expert — resetForReplay() ✅
  - [x] 35.2: Expert — PLAY_AGAIN + ROOM_RESET messages ✅
  - [x] 35.3: Expert — Client fix (no leave/rejoin) ✅
  - [x] 35.4: Expert — Cleanup timer fix ✅
  - [x] 35.5: Tester — 6/6 TC PASS (chat fix took 3 iterations) ✅

- [x] [Task 36: Bots Survive Replay](./task-36-bots-survive-replay.md) **✅ DONE**
  - [x] 36.1: Expert — Removed bot deletion from resetForReplay() ✅

- [x] [Task 37: Host Countdown Toggle + Force Next Round](./task-37-host-countdown-toggle.md) **✅ DONE**
  - [x] 37.1: Architect — State diagram updated ✅
  - [x] 37.2: Expert — Server toggle + force handler ✅
  - [x] 37.3: Expert — Client toggle button + force button ✅

- [x] [Task 38: MP UX Parity with /ts](./task-38-mp-ux-parity.md) **✅ DONE (38.1-38.9)**
  - [x] 38.1: Scroll fix ✅
  - [x] 38.2: Fullscreen toggle ✅
  - [x] 38.3: Keybindings U/D/E ✅
  - [x] 38.4: Card labels ✅
  - [x] 38.5: Darken previous card ✅
  - [x] 38.6: Flip animation ✅
  - [x] 38.9: Header parity (in-game only) ✅
  - [x] [Task 38.10: DRY Shared Header Component](./task-38.10-dry-shared-header.md) **✅ DONE**
    - [x] 38.10.1: Expert — Created components/Header.ts ✅
    - [x] 38.10.2: Expert — LobbyUI + MultiplayerUI refactored ✅
    - [ ] 38.10.3: Tester — Verify header consistent across all views ⏳
  - [x] [Task 38.11: Lobby Header Match](./task-38.11-lobby-header-match.md) **✅ DONE** — same game-header class across /ts, /mp lobby, /mp game
  - [x] [Task 38.12: Responsive Layout Parity](./task-38.12-responsive-layout-parity.md) **✅ DONE** — no scrollbar, /ts pattern
  - [x] [Task 38.13: Leave Returns to Lobby](./task-38.13-leave-returns-to-lobby.md) **✅ DONE** — LEAVE_ROOM hides game, shows lobby, refreshes rooms
  - [x] [Task 38.14: Persistent Feedback + Enforce Next Round](./task-38.14-persistent-feedback-no-countdown.md) **✅ DONE**
    - [x] 38.14.1: Expert — Server: stays in revealing when countdown off, forceNextRound from both states ✅
    - [x] 38.14.2: Expert — Client: host "Enforce Next Round ▶", non-host "Waiting for host..." ✅
    - [x] 38.14.3: Tester — 55/55 PASS, persistent feedback + FORCE_NEXT_ROUND verified ✅

  - [x] [Task 38.15: Game Container White + Shadow](./task-38.15-game-container-white-shadow.md) **✅ DONE** — white bg, shadow, border-radius, overflow:hidden
  - [x] [Task 38.16: Lobby Room Panes Purple](./task-38.16-lobby-room-panes-purple.md) **✅ DONE** — purple tints, text readable
  - [x] [Task 38.17: Cards Side-by-Side Layout](./task-38.17-cards-side-by-side.md) **✅ DONE** — cards-row flex, arrow, dimmed previous
  - [x] [Task 38.18: Game Room Bottom Padding](./task-38.18-game-room-bottom-padding.md) **✅ DONE** — 100px padding-bottom
  - [x] [Task 38.19: Game Header No Reload](./task-38.19-game-header-no-reload.md) **✅ DONE** — mp-header hides reload
  - [x] [Task 38.20: Playwright Visual Verification](./task-38.20-tester-playwright-visual-verification.md) **✅ DONE** — 6/6 PASS, all screenshot-verified
  - [x] [Task 38.21: CSS Text Color Regression](./task-38.21-css-text-color-regression.md) **✅ DONE** — 3/3 PASS (player pane, chat, lobby text), play-again SKIP (untestable)

## TRON Requirements (new)

- [x] [Task 42: Card Played Mode — Host Controls with Live Updates](./task-42-card-played-mode.md) **✅ ALREADY EXISTS** — architect confirmed: covered by Tasks 37 + 38.14
  - [x] 42.1: Architect — Review: DUPLICATE of existing forceNextRound (HC→RV→nextRound) ✅
  - [ ] 42.2: Expert — Verify button labels match Tron preference ("Enforce Result" vs "Force Next Round")
  - [ ] 42.5: Tester — Verify existing flow covers all 6 ACs

- [x] [Task 43: Share Link — Append Room Name](./task-43-share-link-room-name.md) **✅ DONE** — ": {roomName}" appended to share text

- [x] [Task 44: Watch→Remove + Stale Room Cleanup + Room Disposal](./task-44-watch-remove-stale-rooms.md) **✅ DONE**
  - [x] 44.1-44.4: Expert — Stale criteria + periodic timer + Remove button + age-based cleanup ✅
  - [ ] 44.5: Tester — Verify cleanup ⏳

- [x] [Task 45: BUG — Stale Rooms](./task-45-stale-rooms-not-cleaning.md) **✅ FIXED** — age-based cleanup + 2-min timer + CREATE_ROOM trigger (needs server restart)
- [x] [Task 46: BUG — Dispose Button](./task-46-missing-finish-button.md) **✅ FIXED** — 🗑 Remove on all host rooms in lobby
- [x] [Task 47: BUG — Leave Regression](./task-47-leave-button-regression.md) **✅ FIXED** — stopPropagation on leave click
- [x] [Task 48: Remove Button on Orphan/Hostless Rooms](./task-48-remove-orphan-rooms.md) **✅ DONE** — any user can remove orphan/empty/finished rooms

- [ ] [Task 49: Card Played Mode — Live Player State + Sequential Host Controls](./task-49-card-played-mode.md) **🔧 IN PROGRESS**
  - [x] 49.1: Architect — Review: NO new messages needed. Client-only rename + button sequencing ✅
  - [x] 49.2: Expert — Renamed: "Enforce Result ▶" + "Next Round ▶", non-host guarded ✅
  - [ ] 49.5: Tester — 2+ player verification ⏳

- [x] [Task 50: BUG — Header Rounded Corners iPhone](./task-50-header-rounded-corners-iphone.md) **✅ FIXED** — explicit border-radius + -webkit prefix on .game-header
- [x] [Task 51: BUG — Bot Host Deadlock + Creator Not Host](./task-51-bot-host-deadlock.md) **✅ FIXED** — creator always host, transfer skips bots, server restarted
- [x] [Task 52: CRITICAL — Game Skips Betting on Revealed Card](./task-52-game-logic-skip-card.md) **✅ FIXED** — nextRound() consumed extra card; now reuses resolveRound() card
- [x] [Task 53: CRITICAL — Wrong Bet Shows "Did Not Bet"](./task-53-wrong-bet-spectator-feedback.md) **✅ FIXED** — proper elimination feedback, "card went DOWN", timeout distinct
- [x] [Task 54: BUG — Spectator After Elimination](./task-54-spectator-after-elimination.md) **✅ FIXED** — eliminated flag, "👁️ watching" message, receives all updates, resets on Play Again
- [x] [Task 55: BUG — Second Room Creation Broken](./task-55-second-room-creation-broken.md) **✅ FIXED** — resetState() in ROOM_JOINED, DRY with ROOM_RESET
- [x] [Task 56: BUG — Duplicate Messages (Keybinding Stacking)](./task-56-duplicate-messages-bot-handling.md) **✅ FIXED** — handler in constructor, guards control state. Tester 3/3 PASS
- [x] [Task 57: WebSocket Status Indicator](./task-57-websocket-status-indicator.md) **✅ DONE** — green/red dot in chat header + clickable reconnect (in progress)
- [x] [Task 58: Edit Profile Panel](./task-58-edit-profile-panel.md) **✅ DONE** — ✏️ button, modal with name/phone/URL/avatar, localStorage persistence
- [ ] [Task 59: Profile Photo Fixes](./task-59-profile-photo-fixes.md) **📋 UNBLOCKED** — T60 done, can resume
- [x] [Task 60: Player Identity Token](./task-60-player-identity-token.md) **✅ DONE** — 3/3 PASS (dedup, name persist, client avatar)

- [x] [Task 61: Parallel Games Architecture Review](./task-61-parallel-games-architecture.md) **✅ DONE** — single-thread fine, <1ms ops, 1000+ rooms trivially
  - [x] 61.1: Architect — No changes needed ✅

- [x] [Task 62: Device Tracking in User Profile](./task-62-device-tracking-user-profile.md) **✅ DONE**
  - [x] 62.1-62.5: Architect spec + Expert implementation ✅
  - [x] 62.6: Tester — Profile popup: 💻 device, screen, platform, count, last seen ✅

- [x] [Task 63: Name Sync Lobby ↔ Profile Editor](./task-63-name-sync-lobby-editor.md) **✅ DONE**
- [x] [Task 64: Eliminated Host Deadlock](./task-64-eliminated-host-deadlock.md) **✅ DONE** — host controls visible when eliminated
- [x] [Task 65: Private Room Key in Share + Join](./task-65-private-room-key.md) **✅ DONE** — key in URL, auto-join works
- [x] [Task 66: Room Name Uses Current Player Name](./task-66-room-name-current-player.md) **✅ DONE**
- [x] [Task 67: Button Press Feedback + Double-Press Protection](./task-67-button-press-feedback.md) **✅ DONE** — withGuard() on 22 buttons, CSS :active states
- [x] [Task 68: BUG — Enforce Result Visible to Non-Host](./task-68-enforce-result-non-host.md) **✅ FIXED** — re-render controls on host transfer
- [x] [Task 69: BUG — Duplicate Player on Cross-Device Leave/Rejoin](./task-69-duplicate-player-cross-device.md) **✅ FIXED** — ghost players purged in resetForReplay(), test PASS
- [x] [Task 70: Back to Lobby Clean URL](./task-70-back-to-lobby-clean-url.md) **✅ DONE** — history.replaceState clears ?join=/?key= on leave

---

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
