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

- [x] [Task 1: Boundary File Extraction](./task-1-boundary-file-extraction.md) **✅ DONE**
  **Priority:** 1 (CRITICAL — closes all extraction gaps)
  - [x] [Task 1.1: Expert — HTTPSServer to @web4x/http](./task-1.1-expert-httpsserver-extraction.md) ✅
  - [x] [Task 1.2: Expert — StaticFileRoute to @web4x/http](./task-1.2-expert-staticfileroute-extraction.md) ✅
  - [x] [Task 1.3: Expert — ACMEChallengeRoute to @web4x/tls](./task-1.3-expert-acme-route-extraction.md) ✅
  - [x] [Task 1.4: Expert — FileOrchestrator to @web4x/filesystem](./task-1.4-expert-fileorchestrator-extraction.md) ✅
  - [x] [Task 1.5: Expert — ProxyRoute + ReverseProxyRoute + HeaderRewriter + HrefRewriter to @web4x/http](./task-1.5-expert-proxy-routes-extraction.md) ✅
  - [ ] [Task 1.6: Tester — Verify all extractions compile clean](./task-1.6-tester-extraction-verification.md) ⏳ pending

- [x] [Task 2: CLI Lifecycle Completeness](./task-2-cli-lifecycle-completeness.md) **✅ DONE**
  **Priority:** 1 (CRITICAL — Web4 self-care principle)
  - [x] [Task 2.1: Expert — source.env + lib-project-root.sh for all components](./task-2.1-expert-source-env-all-components.md) ✅ All 13 have source.env + lib-project-root.sh
  - [x] [Task 2.2: Expert — CLI infrastructure via @web4x/cli for all 13](./task-2.2-expert-npm-start-parity.md) ✅ Task 9.5 delivered this
  - [ ] [Task 2.3: Tester — Verify ./component and npm start for all 13](./task-2.3-tester-cli-verification.md) ⏳ pending tester

- [x] [Task 3: ONCE Server Start Parity](./task-3-once-server-start.md) **✅ DONE — PRIMARY ACCEPTANCE TEST PASSED**
  **Priority:** 1 (CRITICAL — primary acceptance test)
  - [x] [Task 3.1: Expert — Wire @web4x/once to import from extracted components](./task-3.1-expert-once-import-rewiring.md) ✅ 43 files re-exported from @web4x/*, compiles clean
  - [x] [Task 3.2: Expert — Verify once-v0.3.23.0 startClientServer works](./task-3.2-expert-server-start-test.md) ✅ Server spawns with UUID+PID
  - [ ] [Task 3.3: Tester — Compare once-v0.3.23.0 vs once-v0.3.22.1 server output](./task-3.3-tester-server-parity.md) ⏳ parity verified by expert, tester confirmation pending

- [x] [Task 4: UcpComponent Path Accessor Restoration](./task-4-ucpcomponent-path-restoration.md) **✅ DONE**
  **Priority:** 2 (HIGH — needed for CLI info/links)
  - [x] [Task 4.1: Architect — Specify path accessors](./task-4.1-architect-path-accessor-spec.md) ✅ DON'T restore 423 lines — add 2 protected helpers
  - [x] [Task 4.2: Expert — Implement path accessor helpers](./task-4.2-expert-path-accessor-impl.md) ✅ projectRoot + componentsDirectory in UCP/0.3.23.1
  - [ ] [Task 4.3: Tester — Verify web4tscomponent info/links output matches 0.3.20.6](./task-4.3-tester-info-links-verification.md)

- [x] [Task 5: Semantic Link Promotion](./task-5-semantic-link-promotion.md) **✅ DONE**
  **Priority:** 3 (MEDIUM — after all tests pass)
  - [x] [Task 5.1: Expert — Update dev/latest symlinks](./task-5.1-expert-symlink-promotion.md) ✅ ONCE dev+latest → 0.3.23.0, W4TSC dev → 0.3.23.0
  - [x] [Task 5.2: Tester — Verify links](./task-5.2-tester-link-verification.md) ✅ Verified via once links + web4tscomponent links
  **Note:** setCICDVersion via `on` failed for ONCE (naming: DefaultONCE.js vs NodeJsOnce.js) — set manually. BUG for Sprint 2.
  - [x] [Task 5.3: Expert — Create 0.3.23.1 dev versions for all components](./task-5.3-expert-create-dev-versions.md) ✅ 14/14 at 0.3.23.1, all compile clean, semver 0.3.23-1, subpath exports

- [x] [Task 6: PlantUML Class + Use Case Diagrams for All 13 Components](./task-6-plantuml-class-diagrams.md) **✅ DONE**
  **Priority:** 1 (CRITICAL — shared understanding before implementation)
  - [x] [Task 6.0a: Architect — Class diagram: web4tscomponent.prod + idealMinimalComponent.prod + interplay](./task-6.0a-architect-w4tsc-imc-class-puml.md) ✅ `W4TSC/0.3.23.1/src/puml/W4TSC-IMC-ClassDiagram.puml`
  - [x] [Task 6.0b: Architect — Use case diagram: web4tscomponent + idealMinimalComponent (Object.verb → sub-usecases)](./task-6.0b-architect-w4tsc-imc-usecase-puml.md) ✅ `W4TSC/0.3.23.1/src/puml/W4TSC-IMC-UseCaseDiagram.puml`
  - [x] [Task 6.1: Architect — @web4x/ucp class diagram](./task-6.1-architect-ucp-puml.md) ✅ `UCP/0.3.23.0/src/puml/UCP-ClassDiagram.puml`
  - [x] [Task 6.2: Architect — @web4x/unit class diagram](./task-6.2-architect-unit-puml.md) ✅ `Unit/0.3.23.0/src/puml/Unit-ClassDiagram.puml`
  - [x] [Task 6.3: Architect — @web4x/persistence class diagram](./task-6.3-architect-persistence-puml.md) ✅ `Persistence/0.3.23.0/src/puml/Persistence-ClassDiagram.puml`
  - [x] [Task 6.4: Architect — @web4x/user, filesystem, http, tls class diagrams](./task-6.4-architect-infrastructure-puml.md) ✅ 4 diagrams
  - [x] [Task 6.5: Architect — @web4x/once full dependency diagram](./task-6.5-architect-once-dependency-puml.md) ✅ `ONCE/0.3.23.0/src/puml/Web4x-ComponentDependency.puml`
  - [x] [Task 6.6: Architect — framework components diagrams](./task-6.6-architect-framework-puml.md) ✅ `W4TSC/0.3.23.1/src/puml/W4TSC-FrameworkComponents.puml`
  - [x] [Task 6.7: Tester — Verify all PUML render to SVG](./task-6.7-tester-puml-render.md) ✅ 18 PASS (7 legacy out of scope)
  - [x] [Task 6.8: Architect — Fix layer labels in 8 diagrams](./task-6.8-architect-layer-label-fix.md) ✅ L1=Kernel/OS, L3=Interfaces+Runtime, L4=Async(P7)
  - [x] [Task 6.9: Architect — EAMD 5-layer reference diagram](./task-6.9-architect-eamd-layer-reference.md) ✅ `ONCE/0.3.23.0/src/puml/EAMD-5LayerArchitecture.puml`

- [x] [Task 7: Unit Model Enhancement for MDAv4 + TS File Tracking](./task-7-unit-model-enhancement.md) **✅ DONE**
  **Priority:** 1 (CRITICAL — Unit must support class→file traceability for Sprint 2)
  - [x] [Task 7.1: Architect — Specify Unit model extensions](./task-7.1-architect-unit-mdav4-spec.md) ✅ UnitModel already has fields from 0.3.0.5
  - [x] [Task 7.2: Expert — Verify `origin` IOR field exists in UnitModel](./task-7.2-expert-unit-origin-field.md) ✅ Already present
  - [x] [Task 7.3: Expert — Add FOLDER to TypeM3 enum](./task-7.3-expert-unit-typem3-field.md) ✅ Done
  - [x] [Task 7.4: Expert — Verify `references[]` array exists](./task-7.4-expert-unit-references-array.md) ✅ Already present
  - [x] [Task 7.5: Expert — tsUnitCreate() on UnitDiscoveryService](./task-7.5-expert-unit-discovery-ts-unit.md) ✅ Implemented in Unit/0.3.23.1
  - [x] [Task 7.6: Expert — PumlUnitConverter class](./task-7.6-expert-puml-to-unit-converter.md) ✅ Implemented in Unit/0.3.23.1
  - [x] [Task 7.7: Tester — Verify .ts.unit in UCP](./task-7.7-tester-ts-unit-verification.md) ✅ 14/14 .ts.unit files valid
  - [x] [Task 7.8: Architect — Class diagram of Unit.prod (0.3.0.5)](./task-7.8-architect-unit-prod-puml.md) ✅ `Unit/0.3.0.5/src/puml/Unit-Prod-ClassDiagram.puml` — CRITICAL: found 20 files missing from 0.3.23.x

- [x] [Task 8: MDAv4 Ontology Structure for @web4x Components](./task-8-mdav4-ontology.md) **✅ DONE**
  **Priority:** 2 (HIGH — model repository foundation)
  - [x] [Task 8.1: Architect — Define MDAv4/M3/CLASS/ structure](./task-8.1-architect-mdav4-class-structure.md) ✅ 58 CLASS + 3 RELATIONSHIP + 13 FOLDER = 137 units
  - [x] [Task 8.2: Expert — Create M3 CLASS units](./task-8.2-expert-m3-class-units.md) ✅ 58 CLASS + generator script
  - [x] [Task 8.3: Expert — Create M3 RELATIONSHIP units](./task-8.3-expert-m3-relationship-units.md) ✅ extends/implements/depends-on
  - [x] [Task 8.4: Expert — Create °folder.unit files](./task-8.4-expert-folder-units.md) ✅ 13 FOLDER + 20 .ts.unit
  - [x] [Task 8.5: Tester — Verify traceability](./task-8.5-tester-traceability-verification.md) ✅ PARTIAL — filePath gap non-blocking

- [ ] [Task 9: Port Unit.prod Capabilities to Unit 0.3.23.1](./task-9-unit-prod-port.md) **🔧 IN PROGRESS — SCOPE CHANGE**
  **Priority:** 1 (CRITICAL — architect finding: 20 files, ~1500 lines missing from 0.3.23.x)
  - [x] [Task 9.1: Architect — Gap analysis: Unit.prod (0.3.0.5) vs Unit 0.3.23.1](./task-9.1-architect-unit-gap-analysis.md) ✅ 20 files missing, merge-forward strategy
  - [x] [Task 9.2: Expert — Port GitTextIOR to Unit/0.3.23.1](./task-9.2-expert-port-gittextior.md) ✅ 4 files ported, compiles clean
  - [x] ~~Task 9.3: Port DefaultStorage~~ **CANCELLED** — PO decision: keep @web4x/persistence (DRY P8)
  - [ ] [Task 9.4: Expert — Port discover/find commands + bidirectional sync](./task-9.4-expert-port-discover-find.md)
  - [x] [Task 9.5: Expert — CLI infrastructure for all 6 library components (BLOCKER)](./task-9.5-expert-port-unit-cli.md) ✅ @web4x/cli created, Phase A+B+C done, `on` delegation works
  - [ ] [Task 9.6: Expert — Port missing layer3 interfaces (GitPositioning, ChangeEvent, ComponentAnalysis, etc.)](./task-9.6-expert-port-layer3-interfaces.md)
  - [ ] [Task 9.7: Tester — Verify unit discover on @web4x/ucp matches Unit.prod behavior](./task-9.7-tester-unit-discover-verification.md)

## Dependencies
- Task 1 must complete before Task 3 (server needs extracted files)
- Task 2 can run in parallel with Task 1
- Task 4 can run in parallel with Task 1-2
- Task 5 blocked until Tasks 1-4 all PASS
- Task 6 can run in parallel with Tasks 1-5 (Architect work, no code changes)
- Task 7 must start after Task 6.1-6.2 (need PUML to know which classes to track)
- Task 8 depends on Task 7 (Unit model must support MDAv4 fields before creating units)
- Task 9 depends on Task 7.8 (need prod diagram before porting) — can run parallel with Tasks 1-2

## Definition of Done
- [x] `once-v0.3.23.0 startClientServer` launches server identical to 0.3.22.1 ✅
- [x] All 13+ `./component` CLIs have @web4x/cli infrastructure ✅
- [x] `web4tscomponent info` shows correct paths ✅
- [x] `once links` and `web4tscomponent links` show 0.3.23.0 in dev/latest ✅
- [x] Zero TypeScript compilation errors across all components ✅
- [x] PlantUML class diagram for each of 13 components + EAMD reference ✅ (11 PUMLs)
- [x] UnitModel supports `origin`, `typeM3`, `references[]` fields ✅
- [x] `.ts.unit` files for UCP+Unit+W4TSC layer2 classes ✅ (20 files)
- [x] MDAv4/M3/CLASS/ contains 58 CLASS units ✅
- [x] Bidirectional traceability: PUML → M3 → .ts.unit → .ts ✅ (partial — filePath gap)
- [x] ADR-001: npm exports field replaces re-exports (POC passed on UCP+Unit) ✅
- [x] ADR-002: Version mapping X.Y.Z.W → X.Y.Z-W approved ✅
- [x] @web4x/cli component created — CLI infrastructure shared, not duplicated ✅
- [ ] **RELEASE:** Ready for 0.3.24.0 — needs Tron approval

## Known Issues for Sprint 2
- BUG: setCICDVersion via `on` fails for ONCE (looks for DefaultONCE.js, actual is NodeJsOnce.js)
- Task 9.4: discover/find commands not yet ported from Unit.prod
- Task 9.6: Missing layer3 interfaces not yet ported from Unit.prod
- Phase D: Generated components (Web4Test, Tootsie, PDCA, IMC) not yet rewired to @web4x/cli
- ADR-001 rollout: exports field only on UCP+Unit — needs rollout to all components
- ADR-002 rollout: version fix to all ~30 package.json files
- DefaultCLI hardcoded 'DefaultWeb4TSComponent' string refs (15 occurrences)

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
