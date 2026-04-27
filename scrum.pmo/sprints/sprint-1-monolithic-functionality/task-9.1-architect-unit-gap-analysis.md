[Back to Sprint 1 Planning](./planning.md) | [Back to Task 9](./task-9-unit-prod-parity.md)

# Task 9.1: Architect — Unit Gap Analysis: prod (0.3.0.5) vs extraction (0.3.23.x)
[subtask:uuid:d1e2f3a4-b5c6-7890-defa-900000000001]

## Status
- [x] In Progress
- [ ] QA Review
- [ ] Done

## Source Diagrams
- Unit.prod: `components/Unit/0.3.0.5/src/puml/Unit-Prod-ClassDiagram.puml`
- Unit 0.3.23.x: `components/Unit/0.3.23.0/src/puml/Unit-ClassDiagram.puml`

---

## 1. File Inventory

### Unit 0.3.0.5 (prod) — 30 files
| Layer | File | Lines | Status in 0.3.23.x |
|-------|------|-------|-------------------|
| **L2** | DefaultUnit.ts | ~2,000+ | PARTIAL — 498 lines, many methods missing |
| **L2** | GitTextIOR.ts | 196 | **MISSING** |
| **L2** | DefaultStorage.ts | 173 | **MISSING** (replaced by @web4x/persistence) |
| **L2** | DefaultCLI.ts | 1,011 | **MISSING** (0.3.23.x has no CLI of its own) |
| **L3** | BaseIOR.interface.ts | 27 | **MISSING** |
| **L3** | CLI.interface.ts | 25 | **MISSING** |
| **L3** | ChangeEvent.interface.ts | 14 | **MISSING** |
| **L3** | ColorScheme.interface.ts | 25 | **MISSING** |
| **L3** | Completion.ts | 4 | **MISSING** |
| **L3** | ComponentAnalysis.interface.ts | 36 | **MISSING** |
| **L3** | GitPositioning.interface.ts | 15 | **MISSING** |
| **L3** | GitTextIORScenario.interface.ts | 24 | **MISSING** |
| **L3** | IOR.interface.ts | 11 | **MISSING** (different from @web4x/ucp IOR) |
| **L3** | MethodInfo.interface.ts | 24 | **MISSING** |
| **L3** | Model.interface.ts | 14 | Re-export from @web4x/ucp |
| **L3** | NamedLink.interface.ts | 12 | **MISSING** |
| **L3** | Scenario.interface.ts | 18 | Re-export from @web4x/ucp |
| **L3** | Storage.interface.ts | 30 | **MISSING** (in @web4x/persistence) |
| **L3** | StorageModel.interface.ts | 12 | **MISSING** (in @web4x/persistence) |
| **L3** | StorageScenario.interface.ts | 13 | **MISSING** (in @web4x/persistence) |
| **L3** | TypeM3.enum.ts | 14 | Re-export from @web4x/ucp |
| **L3** | UUID.interface.ts | 44 | **MISSING** |
| **L3** | UUIDv4.class.ts | 171 | **MISSING** |
| **L3** | Unit.interface.ts | 177 | **MISSING** |
| **L3** | UnitIdentifier.type.ts | 87 | **MISSING** |
| **L3** | UnitModel.interface.ts | 26 | Re-export from @web4x/ucp |
| **L3** | UnitReference.interface.ts | 20 | Re-export from @web4x/ucp |
| **L3** | Upgrade.interface.ts | 9 | **MISSING** |
| **L4** | TSCompletion.ts | 100+ | **MISSING** |
| **L5** | UnitCLI.ts | 100+ | **MISSING** |

### Unit 0.3.23.0 (extraction) — 14 files
| Layer | File | Lines | Status in 0.3.0.5 |
|-------|------|-------|-------------------|
| **L2** | DefaultUnit.ts | 498 | EXISTS but different (extends UcpComponent) |
| **L2** | UnitDiscoveryService.ts | 440 | **NEW** — not in prod |
| **L2** | ScenarioService.ts | 439 | **NEW** — not in prod |
| **L3** | ComponentManifest.interface.ts | 112 | **NEW** — not in prod |
| **L3** | UnitDefinition.interface.ts | 60 | **NEW** — not in prod |
| **L3** | 9 re-export files | 2 each | Thin re-exports from @web4x/ucp |

---

## 2. Missing Capabilities — Classified by Priority

### CRITICAL — Sprint 1 Blockers

#### C1: GitTextIOR (git-based origin tracking)
- **File:** GitTextIOR.ts (196 lines)
- **Dependencies:** BaseIOR.interface.ts, GitPositioning.interface.ts, GitTextIORScenario.interface.ts + Node.js core (fs, path, url, crypto)
- **What it does:** Creates IOR strings in format `ior:git:text:{url}#{positioning}` for tracking origin of code at sub-file granularity
- **Positioning formats:** `#L42` (line), `#L42:15-67:23` (line:col range), `#L1250-1890` (char range)
- **Why critical:** Without GitTextIOR, units cannot track which git file they originated from. MDAv4 M3 CLASS units need origin IORs. Sprint 1 Task 7 (Unit model enhancement) depends on this.
- **Porting effort:** SMALL — 196 lines, only Node.js core deps, no @web4x deps

#### C2: Unified references[] array
- **Current 0.3.23.x:** UnitModel has `references?: UnitReference[]` but DefaultUnit doesn't populate it with the same patterns
- **Prod pattern:** Single `references[]` with `{linkLocation, linkTarget, syncStatus}` entries, replacing separate `symlinkPaths[]` and `namedLinks[]`
- **SyncStatus enum:** SYNCED, OUTDATED, BROKEN, UNKNOWN, MODIFIED, TO_BE_CHECKED (6 values vs 3 in 0.3.23.x)
- **Why critical:** Bidirectional traceability requires the unified reference pattern. MDAv4 M3 CLASS units link via references[].
- **Porting effort:** SMALL — interface already exists in @web4x/ucp, need to add MODIFIED and TO_BE_CHECKED to SyncStatus enum

#### C3: Unit.interface.ts (full command protocol)
- **File:** Unit.interface.ts (177 lines)
- **What it defines:** Complete unit protocol with `on()`, `set()/get()`, `discover()`, `find()`, `references()`, `copyInto()`, `link()/linkInto()`, `rename()`, `definition()`
- **Why critical:** Without the interface, DefaultUnit has no contract for implementors
- **Porting effort:** MEDIUM — 177 lines, needs review for @web4x/ucp compatibility

### HIGH — Needed for Sprint 1 Completeness

#### H1: Discovery & Search (discover/find/list)
- **In prod DefaultUnit:** `discover(identifier)`, `find(name)`, `list()`, `references(identifier)`
- **Missing from 0.3.23.x DefaultUnit:** These methods don't exist
- **Note:** 0.3.23.x has UnitDiscoveryService which does file-level discovery, but prod's discover/find work at the unit-reference level (searching for copies across the project)
- **Why high:** MDAv4 traceability requires finding all references to a unit
- **Porting effort:** MEDIUM — methods exist in prod, need adaptation to UcpComponent pattern

#### H2: Bidirectional Sync
- **Methods:** `detectCopyChanges(copyPath, originalUUID)`, `notifyOriginOfCopyChange(...)`, `syncFromCopy(...)`, `syncToCopy(...)`
- **What it does:** Detects when a copy of a unit has changed, notifies the origin, and can sync in either direction
- **Why high:** Without sync, units become stale when source files change
- **Porting effort:** MEDIUM-LARGE — complex logic, needs git hash comparison

#### H3: Folder Support
- **What it does:** Creates `°folder.unit` in directories, analyzes file count/subfolder count/total size/folder hash
- **Method:** `createFromFolder(folderPath)` in DefaultUnit
- **Why high:** MDAv4/M3/FOLDER/ entries need folder units
- **Porting effort:** SMALL — isolated functionality, ~100 lines

#### H4: DefaultStorage (Unit's own storage)
- **File:** DefaultStorage.ts (173 lines)
- **What it does:** 5-level UUID folder storage, symlink creation, project root detection
- **In 0.3.23.x:** Replaced by @web4x/persistence UcpStorage
- **Decision needed:** Keep using @web4x/persistence (shared) or restore DefaultStorage (self-contained)?
- **PO Decision Required:** Does Unit need its own storage, or is delegation to @web4x/persistence correct?

#### H5: UnitCLI (create/classify commands)
- **File:** UnitCLI.ts (100+ lines)
- **What it adds beyond DefaultCLI:** `create(name, definition?, typeM3?)`, `classify(uuid, typeM3)`
- **Why high:** Without CLI, units can only be created programmatically, not from command line
- **Porting effort:** SMALL — extends DefaultCLI, minimal code

### MEDIUM — Useful but Not Blocking

#### M1: UUIDv4 value object
- **File:** UUIDv4.class.ts (171 lines) + UUID.interface.ts (44 lines)
- **What it does:** Immutable UUID wrapper with generate/from/isValid/equals/toHex
- **In 0.3.23.x:** Uses raw string UUIDs via UUIDProvider
- **Porting effort:** SMALL — standalone class, no deps beyond UUID interface

#### M2: UnitIdentifier type
- **File:** UnitIdentifier.type.ts (87 lines)
- **What it does:** Union type `string | UUIDv4` with parsing logic (accepts UUID string or .unit file path)
- **Depends on:** UUIDv4
- **Porting effort:** SMALL

#### M3: Terminal Identity
- **Methods:** `setTerminalIdentity(name, origin, definition)`, `validateTerminalIdentity()`
- **What it does:** Sets the unit's "name" as a terminal identity (the final, human-readable identifier)
- **Porting effort:** SMALL — 2 methods

#### M4: Rename operations
- **Methods:** `rename(newName)`, `renameLink(oldPath, newPath)`
- **Porting effort:** SMALL — file operations

#### M5: ChangeEvent interface
- **File:** ChangeEvent.interface.ts (14 lines)
- **What it does:** Tracks changes with targetUuid, eventType, timestamp, actor
- **Porting effort:** TRIVIAL

#### M6: NamedLink interface
- **File:** NamedLink.interface.ts (12 lines)
- **Merged into:** references[] in prod (location + filename)
- **Porting effort:** TRIVIAL or N/A (already covered by UnitReference)

### LOW — CLI/UI Infrastructure (can use W4TSC's)

#### L1: DefaultCLI (1,011 lines)
- **Decision:** Unit 0.3.23.x should use Web4TSComponent's DefaultCLI via DelegationProxy (same as IMC)
- **Action:** No porting needed — use delegation pattern

#### L2: TSCompletion (layer4)
- **Already in:** @web4x/web4tscomponent layer4
- **Action:** Import from W4TSC, don't duplicate

#### L3: ColorScheme, ComponentAnalysis, Completion interfaces
- **Already in:** @web4x/web4tscomponent layer3/4
- **Action:** Import from W4TSC

---

## 3. Dependency Graph for Porting

```
Porting order (bottom-up):

1. INTERFACES FIRST (zero deps):
   ├── BaseIOR.interface.ts (27 lines)
   ├── GitPositioning.interface.ts (15 lines)
   ├── GitTextIORScenario.interface.ts (24 lines)
   ├── UUID.interface.ts (44 lines)
   ├── Unit.interface.ts (177 lines)
   ├── UnitIdentifier.type.ts (87 lines)  [needs UUID]
   ├── ChangeEvent.interface.ts (14 lines)
   └── Upgrade.interface.ts (9 lines)

2. VALUE OBJECTS (deps: interfaces only):
   └── UUIDv4.class.ts (171 lines)  [needs UUID.interface]

3. GITTEXT IOR (deps: interfaces + Node.js core):
   └── GitTextIOR.ts (196 lines)  [needs BaseIOR, GitPositioning, GitTextIORScenario]

4. DEFAULTUNIT METHODS (deps: GitTextIOR + existing Unit 0.3.23.x):
   ├── discover/find/list methods
   ├── Bidirectional sync methods
   ├── Folder support (createFromFolder)
   ├── Terminal identity methods
   └── Rename methods

5. UNITCLI (deps: DefaultUnit + DefaultCLI from W4TSC):
   └── UnitCLI.ts with create/classify commands
```

---

## 4. Recommendation

### Porting Strategy: "Merge Forward"

The 0.3.23.x Unit should MERGE prod capabilities into its existing UcpComponent-based architecture. NOT replace — merge.

**Keep from 0.3.23.x:**
- UcpComponent extension (gives model proxy, ISR, RelatedObjects)
- UnitDiscoveryService (auto-discovery — prod doesn't have this)
- ScenarioService (migration + CRUD — prod doesn't have this)
- ComponentManifest (prod doesn't have this)
- @web4x/persistence delegation (shared storage, not own DefaultStorage)

**Port from 0.3.0.5:**
- GitTextIOR + its 3 interfaces (total: ~262 lines)
- Missing DefaultUnit methods: discover, find, list, references, copyInto, rename, renameLink, definition, setTerminalIdentity, validateTerminalIdentity, folder support (~500 lines estimated)
- Bidirectional sync: detectCopyChanges, notifyOriginOfCopyChange, syncFromCopy, syncToCopy (~200 lines estimated)
- UUIDv4 + UUID.interface (215 lines)
- UnitIdentifier.type (87 lines)
- Unit.interface.ts (177 lines — the contract)
- UnitCLI create/classify (~50 lines)
- SyncStatus enum additions (MODIFIED, TO_BE_CHECKED)

**Total porting estimate:** ~1,500 lines of new code into Unit 0.3.23.1

### Expert Work Breakdown (for Sprint 1 Task 9)

| Subtask | Files to Create/Modify | Lines | Priority |
|---------|----------------------|-------|----------|
| 9.2: Port GitTextIOR + interfaces | 4 new files | ~262 | CRITICAL |
| 9.3: Port Unit.interface.ts + UnitIdentifier | 2 new files | ~264 | CRITICAL |
| 9.4: Add missing DefaultUnit methods | Modify DefaultUnit.ts | ~500 | HIGH |
| 9.5: Port bidirectional sync | Modify DefaultUnit.ts | ~200 | HIGH |
| 9.6: Port folder support | Modify DefaultUnit.ts | ~100 | HIGH |
| 9.7: Port UUIDv4 + UUID.interface | 2 new files | ~215 | MEDIUM |
| 9.8: Add SyncStatus values | Modify enum in @web4x/ucp | ~5 | SMALL |
| 9.9: Create UnitCLI with create/classify | 1 new file + modify build | ~100 | MEDIUM |
| 9.10: Tester — verify all ported features | Test execution | — | REQUIRED |

---

## 5. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| GitTextIOR format incompatible with @web4x/ucp IOR | HIGH | Keep as separate class, not subclass of @web4x/ucp IOR |
| DefaultUnit method signatures differ between versions | MEDIUM | Use prod signatures as contract, adapt internals to UcpComponent |
| DefaultStorage removal breaks standalone unit operations | MEDIUM | PO decision: @web4x/persistence is shared, unit uses it via ScenarioService |
| UUIDv4 conflicts with UUIDProvider in @web4x/ucp | LOW | UUIDv4 is a value object, UUIDProvider is a factory — complementary, not conflicting |

---

## 6. PO Decisions (2026-04-25)

### D1: DefaultStorage — KEEP @web4x/persistence
Do NOT port DefaultStorage. Unit delegates storage to @web4x/persistence via ScenarioService. DRY (P8).

### D2: Merge Forward — APPROVED
Keep 0.3.23.x UcpComponent architecture. Port prod capabilities INTO it. Do not replace.

### D3: Priority Order for Expert
1. **C1: GitTextIOR** (196 lines, small, unblocks everything) — FIRST
2. **C2: Unified references** (add MODIFIED + TO_BE_CHECKED to SyncStatus)
3. **C3: Unit.interface.ts** (177 lines — the contract)
4. **H1: discover/find** (search operations)
5. **H3: Folder support** (°folder.unit)
6. **H5: UnitCLI** (create/classify commands)

### D4: Bidirectional Sync — DEFERRED to Sprint 2
H2 (detectCopyChanges, syncFrom/To) is deferred. Sprint 1 focuses on creation + discovery. Sprint 2 adds live sync.

### Updated Work Breakdown (PO-approved)

| Order | Subtask | Files | Lines | Sprint |
|-------|---------|-------|-------|--------|
| 1 | 9.2: Port GitTextIOR + 3 interfaces | 4 new files | ~262 | Sprint 1 |
| 2 | 9.3: Add SyncStatus values (MODIFIED, TO_BE_CHECKED) | Modify @web4x/ucp enum | ~5 | Sprint 1 |
| 3 | 9.4: Port Unit.interface.ts + UnitIdentifier | 2 new files | ~264 | Sprint 1 |
| 4 | 9.5: Add discover/find/list/references to DefaultUnit | Modify DefaultUnit.ts | ~300 | Sprint 1 |
| 5 | 9.6: Port folder support (createFromFolder, °folder.unit) | Modify DefaultUnit.ts | ~100 | Sprint 1 |
| 6 | 9.7: Port UUIDv4 + UUID.interface | 2 new files | ~215 | Sprint 1 |
| 7 | 9.8: Create UnitCLI with create/classify | 1 new file | ~100 | Sprint 1 |
| 8 | 9.9: Port terminal identity methods | Modify DefaultUnit.ts | ~50 | Sprint 1 |
| — | 9.10: Port bidirectional sync | Modify DefaultUnit.ts | ~200 | **Sprint 2** |
| LAST | 9.11: Tester — verify all ported features | Test execution | — | Sprint 1 |

**Total Sprint 1 porting:** ~1,296 lines (excludes deferred sync)

---

**Architect:** web4-architect @ web4team:0.1
**Created:** 2026-04-25
**PO Decisions:** 2026-04-25, web4-po @ web4team:0.0
**Evidence:** Diagrams Unit-Prod-ClassDiagram.puml + Unit-ClassDiagram.puml, source code comparison
