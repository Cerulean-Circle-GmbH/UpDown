[Back to Sprint 1 Planning](./planning.md) | [Back to Task 4](./task-4-ucpcomponent-path-restoration.md)

# Task 4.1: Architect — Path Accessor Specification (UCP vs W4TSC)
[subtask:uuid:d1e2f3a4-b5c6-7890-defa-400000000001]

## Status
- [x] Planned
- [x] In Progress
- [ ] QA Review
- [ ] Done

## Problem Statement

During de-monolithization, 423 lines were removed from UcpComponent (926 → 503 lines). These included CLI path accessors that read from a back-referenced CLI model. The question: which accessors should be restored to UcpComponent (foundation) vs which belong only in DefaultWeb4TSComponent/DefaultCLI (component lifecycle tool)?

## Evidence Gathered

### ONCE 0.3.22.2 UcpComponent had these accessors:
```typescript
get projectRoot(): string        // → cli.model.projectRoot
get componentsDirectory(): string // → cli.model.componentsDirectory  
get testDataDirectory(): string   // → cli.model.testDataDirectory
get scriptsDirectory(): string    // → cli.model.scriptsDirectory
get targetDirectory(): string     // → projectRoot (deprecated alias)
get isTestIsolation(): boolean    // → projectRoot.includes('/test/data')
```
All delegated to `this.cliField?.model?.*` — UcpComponent held a back-reference to DefaultCLI.

### UCP 0.3.23.0 UcpComponent has:
None of the above. No CLI back-reference. No path accessors.

### DefaultCLI (W4TSC prod 0.3.19.1) has:
- `calculateProjectRootInternal()` — the single source of truth for project root
- Sets `model.projectRoot`, `model.componentsDir`, `model.scriptsDir`, `model.testDataDir` on init
- This is Path Authority (PC.4): CLI calculates once, passes to component

### DefaultIdealMinimalComponent (IMC prod 0.1.0.0) has:
```typescript
get projectRoot(): string          // derives from componentRoot (3 levels up)
get componentsDirectory(): string  // derives from projectRoot + 'components'
```
These are LOCAL derivations from `model.componentRoot`, NOT from a CLI back-reference.

## Architecture Decision

### Principle: Path Authority Lives in DefaultCLI, NOT UcpComponent

The ONCE 0.3.22.2 pattern was architecturally wrong: UcpComponent (foundation) held a back-reference to DefaultCLI (a W4TSC concept). This created a circular dependency:
```
UcpComponent → cliField → DefaultCLI → component → UcpComponent
```

The correct pattern (already implemented in IMC) is:
```
DefaultCLI calculates paths once (Path Authority)
  → passes to component via model fields (componentRoot, projectRoot)
  → component derives other paths from model
```

### Decision: DO NOT RESTORE path accessors to UcpComponent

| Accessor | Restore to UcpComponent? | Where it belongs | Why |
|----------|------------------------|-----------------|-----|
| `projectRoot` | **NO** | DefaultCLI.model + derived in component subclass | Path Authority: CLI owns discovery. Components derive from componentRoot. |
| `componentRoot` | **NO** | Component model field (set by CLI on init) | Already in Web4TSComponentModel and IdealMinimalComponentModel. |
| `componentsDirectory` | **NO** | Derived from projectRoot in component subclass | Simple derivation: `join(projectRoot, 'components')`. Not foundation concern. |
| `testDataDirectory` | **NO** | DefaultCLI.model only | Test isolation is a CLI concern. Components don't need this. |
| `scriptsDirectory` | **NO** | DefaultCLI.model only | Script management is a CLI concern. |
| `targetDirectory` | **NO** | Deprecated alias for projectRoot | Already deprecated in 0.3.22.2. Remove, don't restore. |
| `isTestIsolation` | **NO** | DefaultCLI.model flag | CLI sets this. Components read from model.isTestIsolation. |
| `cliField` (back-ref) | **NO** | Remove entirely | Circular dependency. Violates layering (L2 component shouldn't know about L5 CLI). |

### What SHOULD be in UcpComponent (and already is)

UcpComponent correctly has:
- `get model(): TModel` — proxy access to model (generic, any model type)
- `get componentVersion(): string` — returns '0.0.0.0' (overridden by subclasses)
- `init(scenario?)` — takes scenario with model containing paths
- No path calculation — that's the CLI's job

### What DefaultWeb4TSComponent should do (and already does in 0.3.23.0)

DefaultWeb4TSComponent.init() uses `import.meta.url` self-discovery to set:
- `model.componentRoot` — resolved real path from import.meta.url
- `model.version` — extracted from directory name
- `model.projectRoot` — derived from componentRoot (3 levels up)

This is the BUG-W02 fix already applied. It works without any UcpComponent path accessors.

### What generated components should do (IMC pattern — correct)

```typescript
// In DefaultIdealMinimalComponent (or any generated component):
get projectRoot(): string {
  return resolve(this.model.componentRoot, '..', '..', '..');
}
get componentsDirectory(): string {
  return join(this.projectRoot, 'components');
}
```

Simple derivation. No CLI back-reference needed. Each component derives paths from its own `model.componentRoot`.

## Specification for Expert (Task 4.2)

### Action: Add componentRoot-based path helpers to UcpComponent

Instead of restoring the CLI back-reference, add TWO protected helper methods to UcpComponent that any component subclass can use:

```typescript
// In UcpComponent<TModel>:

/**
 * Derive project root from component root (3 levels up from components/{Name}/{Version})
 * Override if component has a different directory structure.
 */
protected get projectRoot(): string {
  const componentRoot = (this.model as any)?.componentRoot;
  if (!componentRoot) return '';
  return resolve(componentRoot, '..', '..', '..');
}

/**
 * Components directory derived from project root
 */
protected get componentsDirectory(): string {
  const root = this.projectRoot;
  if (!root) return '';
  return join(root, 'components');
}
```

**Why protected, not public:** These are implementation helpers for subclasses, not part of the public UcpComponent API. External code should access paths via the typed model (e.g., `component.model.projectRoot`).

**Why in UcpComponent at all:** Every component that extends UcpComponent (DefaultUnit, DefaultFile, DefaultUser, etc.) needs to derive projectRoot from componentRoot. Without these helpers, every subclass duplicates the same 3-levels-up logic. DRY (P8).

### What NOT to do
- ❌ Do NOT restore `cliField` back-reference
- ❌ Do NOT add `testDataDirectory`, `scriptsDirectory`, `targetDirectory` to UcpComponent
- ❌ Do NOT make path accessors public — they're protected helpers
- ❌ Do NOT add `isTestIsolation` — that's a CLI model flag

## Acceptance Criteria
- [ ] UcpComponent has `protected get projectRoot(): string` (derives from model.componentRoot)
- [ ] UcpComponent has `protected get componentsDirectory(): string` (derives from projectRoot)
- [ ] No `cliField` back-reference in UcpComponent
- [ ] No `testDataDirectory`, `scriptsDirectory`, `targetDirectory` in UcpComponent
- [ ] DefaultWeb4TSComponent still works (uses import.meta.url, not CLI back-ref)
- [ ] IdealMinimalComponent still works (its own projectRoot getter compatible)
- [ ] `web4tscomponent info` and `once info` both show correct paths
- [ ] Zero TypeScript errors across all 13 components
