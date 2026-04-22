[Back to Sprints](../)

# Sprint 2 Planning — Load UpDown Game Component in ONCE + Add Lit Views

## Sprint Goal
Load the UpDown card game components through @web4x/once 0.3.23.0 and add Lit-based views for the ONCE server status, peer discovery, and game UI. This proves the de-monolithized architecture can serve a real application with browser-rendered views.

## Sprint Overview
**Duration:** 2 weeks
**Focus:** Game component loading, Lit view rendering, browser delivery via EAMD.ucp
**Team:** web4-expert (0.1), web4-tester (0.2), web4-po (0.0)
**Depends on:** Sprint 1 completed (0.3.24.0 released, server start parity, all extractions done)
**Version:** dev on 0.3.24.1, release as 0.3.25.0 after all tests pass
**Definition of Done:** Browser navigates to once-v0.3.24.1 server, sees UpDown game with Lit views

## Requirements
See [requirements.md](./requirements.md) for full traceability.

## Task List (Sprint 2)

> **Note:** Subtasks indicate the affected role. Week 1 focuses on game loading, Week 2 on Lit views.

### WEEK 1: GAME COMPONENT LOADING

- [ ] [Task 1: UpDown Game Component Registration](./task-1-updown-game-registration.md)
  **Priority:** 1 (CRITICAL — game must load in ONCE kernel)
  - [ ] [Task 1.1: Architect — UpDown component dependency graph with PlantUML](./task-1.1-architect-updown-dependency-puml.md)
  - [ ] [Task 1.2: Expert — Create UpDown.Core/0.3.23.0 with @web4x/once dep](./task-1.2-expert-updown-core-extraction.md)
  - [ ] [Task 1.3: Expert — Create UpDown.Cards/0.3.23.0](./task-1.3-expert-updown-cards-extraction.md)
  - [ ] [Task 1.4: Tester — Verify game component loads in ONCE kernel](./task-1.4-tester-game-loading.md)

- [ ] [Task 2: EAMD.ucp Static Asset Serving](./task-2-eamd-ucp-static-serving.md)
  **Priority:** 1 (CRITICAL — browser needs /EAMD.ucp/ routes)
  - [ ] [Task 2.1: Expert — StaticFileRoute serves /EAMD.ucp/components/](./task-2.1-expert-eamd-static-route.md)
  - [ ] [Task 2.2: Tester — Browser fetch /EAMD.ucp/components/ONCE/0.3.23.0/dist/ts/layer1/ONCE.js](./task-2.2-tester-browser-fetch.md)

### WEEK 2: LIT VIEWS

- [ ] [Task 3: Lit View Infrastructure](./task-3-lit-view-infrastructure.md)
  **Priority:** 1 (CRITICAL — view rendering foundation)
  - [ ] [Task 3.1: Architect — View hierarchy PlantUML (AbstractWebBean → LitUcpView → ItemView/OverView)](./task-3.1-architect-view-hierarchy-puml.md)
  - [ ] [Task 3.2: Expert — Extract Lit views from ONCE layer5 to @web4x/once](./task-3.2-expert-lit-view-extraction.md)
  - [ ] [Task 3.3: Expert — CSSLoader for component-scoped styles](./task-3.3-expert-css-loader.md)
  - [ ] [Task 3.4: Tester — Verify OnceServerStatusView renders in browser](./task-3.4-tester-view-rendering.md)

- [ ] [Task 4: UpDown Game Views](./task-4-updown-game-views.md)
  **Priority:** 2 (HIGH — game UI)
  - [ ] [Task 4.1: Expert — CardDeckView, GameBoardView using Lit](./task-4.1-expert-game-views.md)
  - [ ] [Task 4.2: Tester — Browser renders card game UI](./task-4.2-tester-game-ui.md)

- [ ] [Task 5: Peer Discovery + WebSocket](./task-5-peer-discovery-websocket.md)
  **Priority:** 2 (HIGH — multiplayer foundation)
  - [ ] [Task 5.1: Expert — OncePeerItemView shows discovered peers](./task-5.1-expert-peer-views.md)
  - [ ] [Task 5.2: Expert — WebSocket connection between two ONCE instances](./task-5.2-expert-websocket-p2p.md)
  - [ ] [Task 5.3: Tester — Two browsers see each other via peer discovery](./task-5.3-tester-peer-discovery.md)

- [ ] [Task 6: PlantUML for UpDown + View Hierarchy](./task-6-updown-view-puml.md)
  **Priority:** 1 (CRITICAL — Architect must spec before implementation)
  - [ ] [Task 6.1: Architect — UpDown.Core + UpDown.Cards class diagram with game model](./task-6.1-architect-updown-class-puml.md)
  - [ ] [Task 6.2: Architect — Lit View hierarchy class diagram (AbstractWebBean → LitUcpView → *ItemView/*OverView)](./task-6.2-architect-lit-view-hierarchy-puml.md)
  - [ ] [Task 6.3: Architect — Component interaction sequence diagram (browser → ONCE → game)](./task-6.3-architect-interaction-sequence-puml.md)

- [ ] [Task 7: Unit Tracking for UpDown + Views](./task-7-unit-tracking-updown.md)
  **Priority:** 2 (HIGH — traceability for new code)
  - [ ] [Task 7.1: Expert — Create .ts.unit for every UpDown layer2 class](./task-7.1-expert-updown-ts-units.md)
  - [ ] [Task 7.2: Expert — Create .ts.unit for every Lit view class](./task-7.2-expert-view-ts-units.md)
  - [ ] [Task 7.3: Expert — Create M3 CLASS units from Sprint 2 PUML diagrams](./task-7.3-expert-m3-units-from-puml.md)
  - [ ] [Task 7.4: Expert — Verify PUML→M3→.ts.unit→.ts traceability chain for UpDown](./task-7.4-expert-traceability-chain.md)
  - [ ] [Task 7.5: Tester — Count Unit coverage: % of Sprint 2 classes with .ts.unit](./task-7.5-tester-unit-coverage.md)

## Dependencies
- Sprint 1 must be DONE (0.3.24.0 released, server start parity, Unit model enhanced with origin/typeM3/references)
- Task 1 before Task 2 (game must register before serving)
- Task 2 before Task 3 (static serving needed for Lit imports)
- Task 3 before Tasks 4, 5 (view infrastructure before game/peer views)
- Task 6 runs in parallel with Tasks 1-2 (Architect specs while Expert builds)
- Task 7 runs after Task 6 + Tasks 3-5 (need both PUML and implemented classes)

## Definition of Done
- [ ] Browser navigates to `http://localhost:42777` and sees ONCE status page with Lit views
- [ ] UpDown game components registered and loadable via IOR
- [ ] CardDeckView renders cards in browser
- [ ] OncePeerItemView shows discovered peers
- [ ] Two ONCE instances discover each other via WebSocket
- [ ] All 13+ components compile with zero errors
- [ ] PlantUML class + sequence diagrams for UpDown and View hierarchy
- [ ] .ts.unit files for every UpDown and View layer2 class
- [ ] M3 CLASS units created from Sprint 2 PUML diagrams
- [ ] Traceability chain verified: PUML → M3 → .ts.unit → .ts (tester measured)

## Sprint Metrics
- **View Coverage:** number of Lit views rendering in browser
- **Component Loading:** UpDown components loadable via IOR
- **P2P Connectivity:** Two peers discover and connect
- **PUML Coverage:** diagrams for all Sprint 2 components
- **Unit Coverage:** % of Sprint 2 layer2 classes with .ts.unit tracking
- **Traceability Depth:** PUML → M3 → .ts.unit → .ts verified per class

---

**Product Owner:** web4-po @ web4team:0.0
**Created:** 2026-04-21
**Sprint:** Sprint 2 — UpDown Game + Lit Views
