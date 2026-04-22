[Back to Sprint 1 Planning](./planning.md)

# Task 7: Unit Model Enhancement for MDAv4 + TS File Tracking
[task:uuid:b1c2d3e4-f5a6-7890-bcde-200000000007]

## Status
- [ ] Planned
- [ ] In Progress
  - [ ] refinement
  - [ ] creating test cases
  - [ ] implementing
  - [ ] testing
- [ ] QA Review
- [ ] Done

## Traceability
  - up
    - [requirement:uuid:a1b2c3d4-e5f6-7890-abcd-100000000009](./requirements.md) (R9 — UnitModel fields)
    - [requirement:uuid:a1b2c3d4-e5f6-7890-abcd-100000000010](./requirements.md) (R10 — .ts.unit files)
  - down
    - [Task 7.1: Architect — Specify Unit model extensions](./task-7.1-architect-unit-mdav4-spec.md)
    - [Task 7.2: Expert — Add `origin` IOR field](./task-7.2-expert-unit-origin-field.md)
    - [Task 7.3: Expert — Add `typeM3` field](./task-7.3-expert-unit-typem3-field.md)
    - [Task 7.4: Expert — Add `references[]` array](./task-7.4-expert-unit-references-array.md)
    - [Task 7.5: Expert — UnitDiscoveryService creates .ts.unit](./task-7.5-expert-unit-discovery-ts-unit.md)
    - [Task 7.6: Expert — PUML→Unit converter](./task-7.6-expert-puml-to-unit-converter.md)
    - [Task 7.7: Tester — Verify .ts.unit for @web4x/ucp](./task-7.7-tester-ts-unit-verification.md)

## Task Description
Enhance @web4x/unit's UnitModel to support the MDAv4 ontology pattern observed in Web4Articles. This enables:
1. **Origin tracking:** Each unit knows which .ts file it represents via `origin` IOR
2. **M3 type classification:** CLASS, RELATIONSHIP, FOLDER via `typeM3`
3. **Bidirectional references:** `references[]` array tracks all locations where this unit is linked
4. **Automatic .ts.unit creation:** UnitDiscoveryService generates .ts.unit files next to source
5. **PUML→Unit conversion:** Parse PlantUML class diagrams into M3 CLASS units

## Context
The MDAv4 pattern from Web4Articles (Sprint 22) established:
- `MDAv4/M3/CLASS/{ClassName}.unit` — M3 metaclass definitions
- `{component}/src/ts/layer2/{ClassName}.ts.unit` — symlink to M3 unit, placed next to source
- `references[]` — bidirectional links enabling "who uses this class?" queries
- `origin` — IOR pointing to the canonical source file (e.g., `ior:git:.../{ClassName}.ts`)

This pattern must be replicated for the @web4x de-monolithized components, creating a model repository where every TypeScript class is tracked as a Unit with full traceability from PlantUML diagram to source code.

## Intention
After this task, the Unit component understands MDAv4 M3 concepts and can:
1. Track which .ts file a class lives in (`origin`)
2. Classify units by MOF M3 type (`typeM3: CLASS | RELATIONSHIP | FOLDER`)
3. Maintain bidirectional references between M3 units, .ts.unit files, and ontology entries
4. Automatically create .ts.unit files when discovering component classes
5. Parse PlantUML diagrams and create corresponding M3 units

### MDAv4 Traceability Chain (target state)
```
PlantUML class diagram (src/puml/ComponentArchitecture.puml)
    ↓ parsed by PUML→Unit converter (Task 7.6)
MDAv4/M3/CLASS/{ClassName}.unit (scenario JSON with typeM3, origin, references)
    ↓ symlinked next to source
{Component}/src/ts/layer2/{ClassName}.ts.unit (same UUID as M3 unit)
    ↓ origin IOR points to
{Component}/src/ts/layer2/{ClassName}.ts (the actual TypeScript source)
```

### UnitModel Fields to Add
```typescript
interface UnitModel extends Model {
  // Existing fields...
  uuid: string;
  name: string;
  definition: string;
  
  // NEW — MDAv4 support
  origin?: string;           // IOR to source file: "ior:git:github.com/.../ClassName.ts"
  typeM3?: 'CLASS' | 'RELATIONSHIP' | 'FOLDER';  // MOF M3 classification
  references?: UnitReference[];  // Bidirectional link tracking
}

interface UnitReference {
  linkLocation: string;  // Where the link lives: "ior:local:ln:file:/.../ClassName.unit"
  linkTarget: string;    // What it points to: "ior:unit:uuid:{uuid}"
  syncStatus: 'SYNCED' | 'OUT_OF_SYNC' | 'BROKEN';
}
```

## Steps
1. **Architect** specs the UnitModel extension (Task 7.1)
2. **Expert** adds `origin` field to UnitModel interface in @web4x/unit layer3 (Task 7.2)
3. **Expert** adds `typeM3` field with enum values (Task 7.3)
4. **Expert** adds `references[]` with UnitReference interface (Task 7.4)
5. **Expert** modifies UnitDiscoveryService to create .ts.unit files (Task 7.5)
6. **Expert** creates PUML parser that reads @startuml class diagrams and creates M3 units (Task 7.6)
7. **Tester** runs discovery on @web4x/ucp, verifies .ts.unit files exist for UcpComponent, UcpController, TypeRegistry, UUIDProvider, SHA256Provider (Task 7.7)

## Acceptance Criteria
- [ ] `UnitModel` interface has `origin?: string`, `typeM3?: string`, `references?: UnitReference[]`
- [ ] `UnitReference` interface defined with `linkLocation`, `linkTarget`, `syncStatus`
- [ ] Running `unit discover UCP/0.3.23.1` creates .ts.unit next to each layer2 .ts file
- [ ] Each .ts.unit contains valid JSON with `typeM3: "CLASS"`, `origin` pointing to .ts file
- [ ] PUML converter parses a simple class diagram and creates corresponding M3 CLASS units
- [ ] `MDAv4/M3/CLASS/UcpComponent.unit` exists with `references[]` linking to `UCP/0.3.23.1/src/ts/layer2/UcpComponent.ts.unit`
- [ ] Bidirectional: M3 unit → .ts.unit AND .ts.unit → M3 unit (both directions verified)

## QA Audit & User Feedback
- [ ] [2026-04-21] QA review pending
  - [ ] Issue: Does Unit model match Web4Articles MDAv4 pattern exactly?
  - [ ] Resolution: pending
