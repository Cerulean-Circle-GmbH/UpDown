[Back to Sprint 3 Planning](./planning.md)

# Task 0.2: Architect — Gap Analysis: QnD Prototype vs Full Multiplayer Game
[subtask:uuid:e1f2a3b4-c5d6-7890-efab-030000000002]

## Status
- [x] Done

## What EXISTS (playable now)

| Asset | Location | Lines | Status |
|-------|----------|-------|--------|
| Single-player rapid mode | qnd/src/public/js/game.js | 594 | Working |
| Card + GameModel + GameUI (Lit) | qnd/src/public/ts/ | 446 | Working |
| HTTPS server + TUI | qnd/src/ts/server/server.ts | 810 | Working |
| WebSocket basics | server.ts | ~50 | Connect/disconnect/broadcast only |
| PWA + service worker | qnd/src/public/ | — | Working |
| Responsive CSS | qnd/src/public/css/ | — | iPhone 4 to desktop |
| GameLogicEngine (Web4) | components/GameLogicEngine/0.3.19.0 | ~800 | Full game loop, scoring, streaks |
| CardDeckManager (Web4) | components/CardDeckManager/0.3.19.0 | ~600 | 52-card deck, shuffle, deal |
| Game specs | specs/gameplay.md, cards.md | — | Full rules, 13 special cards |

## What's MISSING

| Feature | Priority | Effort | Notes |
|---------|----------|--------|-------|
| **Lobby system** | P0 | HIGH | Create/join/leave rooms, player list, ready state, max 10 players |
| **WebSocket game protocol** | P0 | HIGH | Only connect/disconnect exists — need guess, round-sync, result, lobby messages |
| **Multiplayer game loop** | P0 | HIGH | GM draws card, 10-sec timer, simultaneous guesses, elimination |
| **Multiplayer UI** | P0 | MEDIUM | Show all players, scores, alive/dead, current card for all |
| **Lobby UI** | P1 | MEDIUM | Room list, player avatars, ready buttons |
| **Special cards (13 types)** | P1 | MEDIUM | 3 levels with priority, effects on guess resolution |
| **Player state sync** | P1 | MEDIUM | Round state broadcast, scores, streaks per player |
| **Diamond economy** | P2 | LOW | Stub for Sprint 3 — shop/currency deferred |
| **Leaderboards** | P2 | LOW | Deferred |
| **Chat** | P2 | LOW | Deferred |

## Architecture Decision

**Extend QnD prototype, do NOT rebuild from Web4 components.**

Reasons:
1. QnD has working server, Lit UI, responsive design, PWA
2. Web4 components have logic but no server/UI integration
3. Deadline Sunday — web2 QnD approach, no Web4 ceremony

**What to port from Web4 components:**
- Scoring logic from GameLogicEngine (streaks, multipliers, equal=50pts)
- Deck creation from CardDeckManager (52-card, Fisher-Yates)
- Special card definitions from specs/cards.md

**What to build new:**
- GameRoom class (server-side multiplayer state machine)
- WebSocket message protocol (JSON, typed events)
- LobbyUI Lit component
- MultiplayerGameUI Lit component (extends existing GameUI)
