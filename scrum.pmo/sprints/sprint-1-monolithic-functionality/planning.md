[Back to Sprints](../)

# Sprint 1 Planning — Recreate Monolithic Functionality in De-monolithized Code

## Sprint Goal
Upgrade all 13 @web4x/* components from 0.3.23.0 to **0.3.23.1** (dev version). Recreate monolithic functionality lost during de-monolithization. All development and testing happens on 0.3.23.1. On successful test completion, release as **0.3.24.0** (prod).

## Version Strategy
```
0.3.23.0  — initial extraction (done, frozen)
0.3.23.1  — dev: Sprint 1 work happens here (boundary extraction, Unit enhancement, PUML)
0.3.24.0  — prod: released after all Sprint 1 tests pass
```
Pattern: Same as Web4TSComponent where `latest → 0.3.23.1` already exists.

## Sprint Overview
**Duration:** 1 week
**Focus:** Boundary file extraction, CLI completeness, server start parity, PUML + Unit traceability
**Team:** web4-expert (0.1), web4-tester (0.2), web4-po (0.0)
**Input:** Loss report from Phase 6 audit
**Definition of Done:** `once-v0.3.23.1 start` serves HTTP+HTTPS with routes, all 13 CLIs self-register, release 0.3.24.0

## Requirements
See [requirements.md](./requirements.md) for full traceability.

## Task List (Sprint 1)

> **Note:** Subtasks indicate the affected role. Ordered to avoid blocking deps.

- [ ] [Task 1: Boundary File Extraction](./task-1-boundary-file-extraction.md)
  **Priority:** 1 (CRITICAL — closes all extraction gaps)
  - [ ] [Task 1.1: Expert — HTTPSServer to @web4x/http](./task-1.1-expert-httpsserver-extraction.md)
  - [ ] [Task 1.2: Expert — StaticFileRoute to @web4x/http](./task-1.2-expert-staticfileroute-extraction.md)
  - [ ] [Task 1.3: Expert — ACMEChallengeRoute to @web4x/tls](./task-1.3-expert-acme-route-extraction.md)
  - [ ] [Task 1.4: Expert — FileOrchestrator to @web4x/filesystem](./task-1.4-expert-fileorchestrator-extraction.md)
  - [ ] [Task 1.5: Expert — ProxyRoute + ReverseProxyRoute to @web4x/http](./task-1.5-expert-proxy-routes-extraction.md)
  - [ ] [Task 1.6: Tester — Verify all extractions compile clean](./task-1.6-tester-extraction-verification.md)

- [ ] [Task 2: CLI Lifecycle Completeness](./task-2-cli-lifecycle-completeness.md)
  **Priority:** 1 (CRITICAL — Web4 self-care principle)
  - [ ] [Task 2.1: Expert — source.env + lib-project-root.sh for all 7 new components](./task-2.1-expert-source-env-all-components.md)
  - [ ] [Task 2.2: Expert — npm start parity for all 13 components](./task-2.2-expert-npm-start-parity.md)
  - [ ] [Task 2.3: Tester — Verify ./component and npm start for all 13](./task-2.3-tester-cli-verification.md)

- [ ] [Task 3: ONCE Server Start Parity](./task-3-once-server-start.md)
  **Priority:** 1 (CRITICAL — primary acceptance test)
  - [ ] [Task 3.1: Expert — Wire @web4x/once to import from extracted components](./task-3.1-expert-once-import-rewiring.md)
  - [ ] [Task 3.2: Expert — Verify once-v0.3.23.1 start launches HTTP+HTTPS](./task-3.2-expert-server-start-test.md)
  - [ ] [Task 3.3: Tester — Compare once-v0.3.23.1 vs once-v0.3.22.1 server output](./task-3.3-tester-server-parity.md)

- [ ] [Task 4: UcpComponent Path Accessor Restoration](./task-4-ucpcomponent-path-restoration.md)
  **Priority:** 2 (HIGH — needed for CLI info/links)
  - [ ] [Task 4.1: Architect — Specify which path accessors belong in UCP vs W4TSC](./task-4.1-architect-path-accessor-spec.md)
  - [ ] [Task 4.2: Expert — Implement path accessor restoration](./task-4.2-expert-path-accessor-impl.md)
  - [ ] [Task 4.3: Tester — Verify web4tscomponent info/links output matches 0.3.20.6](./task-4.3-tester-info-links-verification.md)

- [ ] [Task 5: Semantic Link Promotion](./task-5-semantic-link-promotion.md)
  **Priority:** 3 (MEDIUM — after all tests pass)
  - [ ] [Task 5.1: Expert — Update dev/latest symlinks for ONCE and W4TSC](./task-5.1-expert-symlink-promotion.md)
  - [ ] [Task 5.2: Tester — Verify once links and web4tscomponent links show 0.3.23.1](./task-5.2-tester-link-verification.md)

- [ ] [Task 6: PlantUML Class + Use Case Diagrams for All 13 Components](./task-6-plantuml-class-diagrams.md)
  **Priority:** 1 (CRITICAL — shared understanding before implementation)
  - [ ] [Task 6.0a: Architect — Class diagram: web4tscomponent.prod + idealMinimalComponent.prod + interplay](./task-6.0a-architect-w4tsc-imc-class-puml.md)
  - [ ] [Task 6.0b: Architect — Use case diagram: web4tscomponent + idealMinimalComponent (Object.verb → sub-usecases)](./task-6.0b-architect-w4tsc-imc-usecase-puml.md)
  - [ ] [Task 6.1: Architect — @web4x/ucp class diagram (UcpComponent, UcpController, TypeRegistry, UcpModel, JsInterface, IOR)](./task-6.1-architect-ucp-puml.md)
  - [ ] [Task 6.2: Architect — @web4x/unit class diagram (DefaultUnit, UnitDiscoveryService, ScenarioService)](./task-6.2-architect-unit-puml.md)
  - [ ] [Task 6.3: Architect — @web4x/persistence class diagram (UcpStorage, BrowserScenarioStorage)](./task-6.3-architect-persistence-puml.md)
  - [ ] [Task 6.4: Architect — @web4x/user, @web4x/filesystem, @web4x/http, @web4x/tls class diagrams](./task-6.4-architect-infrastructure-puml.md)
  - [ ] [Task 6.5: Architect — @web4x/once full dependency diagram (all 13 components)](./task-6.5-architect-once-dependency-puml.md)
  - [ ] [Task 6.6: Architect — @web4x/web4tscomponent, web4test, tootsie, pdca, idealminimal diagrams](./task-6.6-architect-framework-puml.md)
  - [ ] [Task 6.7: Tester — Verify all PUML render to SVG without errors](./task-6.7-tester-puml-render.md)

- [ ] [Task 7: Unit Model Enhancement for MDAv4 + TS File Tracking](./task-7-unit-model-enhancement.md)
  **Priority:** 1 (CRITICAL — Unit must support class→file traceability for Sprint 2)
  - [ ] [Task 7.1: Architect — Specify Unit model extensions for MDAv4 M3 CLASS tracking](./task-7.1-architect-unit-mdav4-spec.md)
  - [ ] [Task 7.2: Expert — Add `origin` IOR field to UnitModel (tracks source .ts file)](./task-7.2-expert-unit-origin-field.md)
  - [ ] [Task 7.3: Expert — Add `typeM3` field to UnitModel (CLASS/RELATIONSHIP/FOLDER)](./task-7.3-expert-unit-typem3-field.md)
  - [ ] [Task 7.4: Expert — Add `references[]` array for bidirectional link tracking](./task-7.4-expert-unit-references-array.md)
  - [ ] [Task 7.5: Expert — UnitDiscoveryService creates .ts.unit files next to .ts source](./task-7.5-expert-unit-discovery-ts-unit.md)
  - [ ] [Task 7.6: Expert — PUML→Unit converter: parse class diagrams into M3 CLASS units](./task-7.6-expert-puml-to-unit-converter.md)
  - [ ] [Task 7.7: Tester — Verify .ts.unit created for each layer2 class in @web4x/ucp](./task-7.7-tester-ts-unit-verification.md)

- [ ] [Task 8: MDAv4 Ontology Structure for @web4x Components](./task-8-mdav4-ontology.md)
  **Priority:** 2 (HIGH — model repository foundation)
  - [ ] [Task 8.1: Architect — Define MDAv4/M3/CLASS/ structure for all @web4x classes](./task-8.1-architect-mdav4-class-structure.md)
  - [ ] [Task 8.2: Expert — Create M3 CLASS units for every layer2 class across 13 components](./task-8.2-expert-m3-class-units.md)
  - [ ] [Task 8.3: Expert — Create M3 RELATIONSHIP units (extends, implements, depends-on)](./task-8.3-expert-m3-relationship-units.md)
  - [ ] [Task 8.4: Expert — Create °folder.unit for each component's MDAv4 directory](./task-8.4-expert-folder-units.md)
  - [ ] [Task 8.5: Tester — Verify bidirectional traceability: M3 CLASS ↔ .ts.unit ↔ .ts file](./task-8.5-tester-traceability-verification.md)

## Dependencies
- Task 1 must complete before Task 3 (server needs extracted files)
- Task 2 can run in parallel with Task 1
- Task 4 can run in parallel with Task 1-2
- Task 5 blocked until Tasks 1-4 all PASS
- Task 6 can run in parallel with Tasks 1-5 (Architect work, no code changes)
- Task 7 must start after Task 6.1-6.2 (need PUML to know which classes to track)
- Task 8 depends on Task 7 (Unit model must support MDAv4 fields before creating units)

## Definition of Done
- [ ] `once-v0.3.23.1 start` launches HTTP+HTTPS server with all routes
- [ ] All 13 `./component` CLIs self-register and show correct version
- [ ] `web4tscomponent info` shows correct paths (not 0.0.0.0)
- [ ] `once links` and `web4tscomponent links` show 0.3.23.1 in dev/latest
- [ ] Zero TypeScript compilation errors across all 13 components at 0.3.23.1
- [ ] PlantUML class diagram exists for each of the 13 components, renders to SVG
- [ ] UnitModel supports `origin`, `typeM3`, `references[]` fields
- [ ] `.ts.unit` file exists next to every layer2 .ts file in @web4x/ucp
- [ ] MDAv4/M3/CLASS/ contains units for all layer2 classes
- [ ] Bidirectional traceability: PUML class → M3 CLASS unit → .ts.unit → .ts file
- [ ] Tester PASS on all subtasks
- [ ] **RELEASE:** All tests pass → upgrade all 13 components to 0.3.24.0 (prod)

## Release Process
```
1. All Sprint 1 tasks DONE on 0.3.23.1
2. Tester runs full regression (T1-T8 + new tests)
3. All PASS → Expert runs: web4tscomponent on {Component} 0.3.23.1 upgrade nextBuild
   → creates 0.3.24.0 for each component
4. Update semantic links: dev → 0.3.24.0, latest → 0.3.24.0
5. Tag and commit
```

## Sprint Metrics
- **Extraction Coverage:** % of ONCE 0.3.22.2 files properly placed in standalone components
- **CLI Completeness:** 13/13 components with working ./component at 0.3.23.1
- **Server Parity:** HTTP routes served by 0.3.23.1 vs 0.3.22.1
- **PUML Coverage:** 13/13 components with class diagrams
- **Unit Coverage:** % of layer2 classes with .ts.unit tracking files
- **Traceability Depth:** PUML → M3 → .ts.unit → .ts (4 levels verified)
- **Release Gate:** 0/13 → 13/13 components at 0.3.24.0

---

**Product Owner:** web4-po @ web4team:0.0
**Created:** 2026-04-21
**Sprint:** Sprint 1 — Monolithic Functionality Recreation
**Version:** dev on 0.3.23.1, release as 0.3.24.0
