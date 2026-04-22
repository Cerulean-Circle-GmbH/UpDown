# Sprint 1 Requirements — Recreate Monolithic Functionality

## Unchecked Requirements

- [ ] **R1** All extracted @web4x/* components must produce identical runtime behavior to ONCE 0.3.22.2 [requirement:uuid:a1b2c3d4-e5f6-7890-abcd-100000000001]
  ([task-1](./task-1-boundary-file-extraction.md))

- [ ] **R2** HTTPSServer must be available in @web4x/http with TLS dependency [requirement:uuid:a1b2c3d4-e5f6-7890-abcd-100000000002]
  ([task-1](./task-1-boundary-file-extraction.md))

- [ ] **R3** `once-v0.3.23.0 start` must launch full HTTP+HTTPS server identical to `once-v0.3.22.1 start` [requirement:uuid:a1b2c3d4-e5f6-7890-abcd-100000000003]
  ([task-3](./task-3-once-server-start.md))

- [ ] **R4** All 13 components must have `./component` CLI with self-registration, source.env, lib-project-root.sh [requirement:uuid:a1b2c3d4-e5f6-7890-abcd-100000000004]
  ([task-2](./task-2-cli-lifecycle-completeness.md))

- [ ] **R5** UcpComponent in @web4x/ucp must restore CLI path accessors removed during extraction (423 lines) [requirement:uuid:a1b2c3d4-e5f6-7890-abcd-100000000005]
  ([task-4](./task-4-ucpcomponent-path-restoration.md))

- [ ] **R6** Filesystem component must include FileOrchestrator (L4) and Layer 5 views [requirement:uuid:a1b2c3d4-e5f6-7890-abcd-100000000006]
  ([task-1](./task-1-boundary-file-extraction.md))

- [ ] **R7** Semantic version links (dev/test/prod/latest) must point to 0.3.23.1 (dev), release as 0.3.24.0 after all tests pass [requirement:uuid:a1b2c3d4-e5f6-7890-abcd-100000000007]
  ([task-5](./task-5-semantic-link-promotion.md))

- [ ] **R8** PlantUML class diagram must exist for each of the 13 components, renderable to SVG [requirement:uuid:a1b2c3d4-e5f6-7890-abcd-100000000008]
  ([task-6](./task-6-plantuml-class-diagrams.md))

- [ ] **R9** UnitModel must support `origin` (IOR to source .ts file), `typeM3` (CLASS/RELATIONSHIP/FOLDER), and `references[]` (bidirectional links) [requirement:uuid:a1b2c3d4-e5f6-7890-abcd-100000000009]
  ([task-7](./task-7-unit-model-enhancement.md))

- [ ] **R10** Every layer2 .ts class in @web4x/ucp must have a `.ts.unit` tracking file next to it [requirement:uuid:a1b2c3d4-e5f6-7890-abcd-100000000010]
  ([task-7](./task-7-unit-model-enhancement.md))

- [ ] **R11** MDAv4/M3/CLASS/ must contain M3 CLASS units for all layer2 classes across 13 components [requirement:uuid:a1b2c3d4-e5f6-7890-abcd-100000000011]
  ([task-8](./task-8-mdav4-ontology.md))

- [ ] **R12** Bidirectional traceability verified: PUML class → M3 CLASS unit → .ts.unit → .ts source file [requirement:uuid:a1b2c3d4-e5f6-7890-abcd-100000000012]
  ([task-8](./task-8-mdav4-ontology.md))
