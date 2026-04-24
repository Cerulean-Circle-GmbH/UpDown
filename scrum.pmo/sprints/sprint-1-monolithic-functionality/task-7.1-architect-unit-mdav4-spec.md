[Back to Sprint 1 Planning](./planning.md) | [Back to Task 7](./task-7-unit-model-enhancement.md)

# Task 7.1: Architect — UnitModel MDAv4 Extension Specification
[subtask:uuid:d1e2f3a4-b5c6-7890-defa-700000000001]

## Status
- [x] Planned
- [x] In Progress
- [ ] QA Review
- [ ] Done

## Assessment: Model Already Has Required Fields

After reading the actual UCP 0.3.23.0 source, the UnitModel **already contains** all three fields specified in the task:

| Field | Status | File |
|-------|--------|------|
| `origin: string` | EXISTS | UnitModel.interface.ts:40 |
| `typeM3?: TypeM3` | EXISTS | UnitModel.interface.ts:46 |
| `references: UnitReference[]` | EXISTS | UnitModel.interface.ts:56 |

The `UnitReference` interface already has `linkLocation`, `linkTarget`, `syncStatus` (SyncStatus enum with SYNCED/OUTDATED/BROKEN/UNKNOWN/MODIFIED/TO_BE_CHECKED/RUNTIME).

### What IS Missing

1. **TypeM3 enum** lacks `FOLDER` value — MDAv4 uses `typeM3: "FOLDER"` but enum only has CLASS/ATTRIBUTE/RELATIONSHIP
2. **UnitDiscoveryService** does not create `.ts.unit` files next to source
3. **No PUML→Unit converter** exists
4. **No MDAv4/M3/ directory structure** in the UpDown project

## Specification

### Change 1: Add FOLDER to TypeM3 Enum

**File:** `UCP/0.3.23.1/src/ts/layer3/TypeM3.enum.ts`

```typescript
export enum TypeM3 {
  CLASS = 'CLASS',
  ATTRIBUTE = 'ATTRIBUTE',
  RELATIONSHIP = 'RELATIONSHIP',
  FOLDER = 'FOLDER'           // NEW — for MDAv4/M3/FOLDER/ units
}
```

**Why:** The MDAv4 examples from Web4Articles use `typeM3: "FOLDER"` for folder units (see `MDAv4/M3/FOLDER/0.3.0.5.unit`). Without this enum value, the existing code would use a string literal instead of the enum, violating P4 (Enum Everywhere).

### Change 2: UnitDiscoveryService — Create .ts.unit Files

**File:** `Unit/0.3.23.1/src/ts/layer2/UnitDiscoveryService.ts`

New method: `tsUnitCreate(classFilePath: string, m3Unit: Scenario<UnitModel>): Promise<void>`

**Behavior:**
1. Receives path to a `.ts` file and the M3 CLASS unit scenario
2. Creates `{classFilePath}.unit` (e.g., `UcpComponent.ts.unit`) as JSON
3. The `.ts.unit` file contains the SAME UUID as the M3 CLASS unit
4. The `.ts.unit` model includes:
   - `typeM3: TypeM3.CLASS`
   - `origin`: IOR pointing to the .ts file (e.g., `ior:file://{absolute-path}`)
   - `references[]`: contains link to M3 CLASS unit location
5. Updates the M3 CLASS unit's `references[]` to include a back-link to this `.ts.unit`

**Contract:**
```typescript
async tsUnitCreate(
  classFilePath: string,           // /components/UCP/0.3.23.1/src/ts/layer2/UcpComponent.ts
  m3UnitScenario: Scenario<UnitModel>  // The M3 CLASS unit to link to
): Promise<void>
```

**File output:** `{classFilePath}.unit` — JSON scenario with same UUID as M3 unit.

### Change 3: PUML→Unit Converter

**New file:** `Unit/0.3.23.1/src/ts/layer2/PumlUnitConverter.ts`

**Class:** `PumlUnitConverter`

**Responsibility:** Parse a PlantUML class diagram and create M3 CLASS units for each class found.

**Methods:**
```typescript
class PumlUnitConverter {
  constructor()
  init(config: { 
    scenarioService: ScenarioService;
    projectRoot: string;
    componentName: string;
    componentVersion: string;
  }): this

  // Parse PUML file, return list of discovered classes
  async pumlParse(pumlFilePath: string): Promise<PumlClass[]>

  // Create M3 CLASS unit for each discovered class
  async m3UnitsCreate(classes: PumlClass[]): Promise<Scenario<UnitModel>[]>

  // Create .ts.unit files linking M3 units to source .ts files
  async tsUnitsLink(
    m3Units: Scenario<UnitModel>[],
    componentRoot: string
  ): Promise<void>

  // Full pipeline: parse PUML → create M3 units → link .ts files
  async convertPuml(
    pumlFilePath: string,
    componentRoot: string
  ): Promise<ConversionResult>
}

interface PumlClass {
  name: string;              // "UcpComponent"
  stereotype?: string;       // "<<P6: Empty Constructor>>"
  extends?: string;          // "Component"
  implements?: string[];     // ["IComponent"]
  methods: string[];         // ["init(scenario?): this", ...]
  properties: string[];      // ["model: TModel", ...]
  packageName?: string;      // "Layer 2 — Implementation"
}

interface ConversionResult {
  pumlFile: string;
  classesFound: number;
  m3UnitsCreated: number;
  tsUnitsLinked: number;
  errors: string[];
}
```

**PUML parsing rules:**
- `class "ClassName"` → PumlClass with name
- `<<stereotype>>` → stereotype field
- `ClassName --|> Parent : extends` → extends field
- `ClassName ..|> Interface : implements` → implements[] field
- Lines inside class body starting with `+` → public methods/properties
- `package "Name"` → packageName

### Change 4: MDAv4 Directory Structure

**Location:** `{projectRoot}/MDAv4/M3/`

```
MDAv4/
├── M3/
│   ├── CLASS/
│   │   ├── UcpComponent.unit
│   │   ├── UcpController.unit
│   │   ├── TypeRegistry.unit
│   │   ├── DefaultUnit.unit
│   │   ├── ... (one per layer2 class)
│   │   └── °folder.unit
│   ├── RELATIONSHIP/
│   │   ├── extends.unit
│   │   ├── implements.unit
│   │   ├── depends-on.unit
│   │   └── °folder.unit
│   ├── FOLDER/
│   │   ├── {component-name}.unit (one per component)
│   │   └── °folder.unit
│   └── °folder.unit
└── °folder.unit
```

Each `.unit` file follows the scenario JSON format from Web4Articles MDAv4 examples.

## Traceability Chain (verified against Web4Articles)

```
1. PlantUML class diagram
   └── src/puml/ComponentName-ClassDiagram.puml
       Contains: class "ClassName" { +methods }
   
2. PumlUnitConverter.pumlParse()
   └── Extracts PumlClass[] from PUML AST
   
3. PumlUnitConverter.m3UnitsCreate()
   └── Creates: MDAv4/M3/CLASS/ClassName.unit
       { typeM3: "CLASS", origin: "ior:file://...ts", references: [...] }
   
4. PumlUnitConverter.tsUnitsLink() / UnitDiscoveryService.tsUnitCreate()
   └── Creates: components/X/0.3.23.1/src/ts/layer2/ClassName.ts.unit
       Same UUID as M3 unit, references[] links back to M3
   
5. Source file
   └── components/X/0.3.23.1/src/ts/layer2/ClassName.ts
       The actual TypeScript class
```

**Bidirectional verification:**
- M3 unit `references[]` → contains entry with `linkLocation` pointing to `.ts.unit`
- `.ts.unit` `references[]` → contains entry with `linkLocation` pointing to M3 unit

## Acceptance Criteria for Expert Implementation

- [ ] TypeM3 enum has FOLDER value added
- [ ] `UnitDiscoveryService.tsUnitCreate()` method exists and creates `.ts.unit` files
- [ ] `PumlUnitConverter` class exists in Unit/0.3.23.1/src/ts/layer2/
- [ ] `PumlUnitConverter.pumlParse()` can parse the UCP-ClassDiagram.puml we created
- [ ] Running converter on UCP diagram creates 5 M3 CLASS units (UcpComponent, UcpController, TypeRegistry, UUIDProvider, SHA256Provider)
- [ ] Each M3 unit has `references[]` linking to its `.ts.unit`
- [ ] Each `.ts.unit` has `references[]` linking back to M3 unit
- [ ] MDAv4/M3/CLASS/ directory contains the 5 units
- [ ] `npx tsc` compiles with zero errors after all changes

## PlantUML: Enhanced UnitModel

See `Unit/0.3.23.0/src/puml/UnitModel-Enhanced.puml` (created alongside this spec).
