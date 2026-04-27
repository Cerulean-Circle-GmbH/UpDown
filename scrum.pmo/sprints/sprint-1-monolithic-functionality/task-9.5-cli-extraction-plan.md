# Task 9.5: Extract @web4x/cli + Wire Library Component CLIs

## PO Decision
Option 3 — new `@web4x/cli` component between UCP and all other components.
- Option 1 (library deps on W4TSC) rejected: circular dependency
- Option 2 (CLI in UCP) rejected: pollutes foundation
- Option 3 approved: clean separation of CLI infrastructure

## Dependency Graph (after extraction)

```
@web4x/ucp (foundation — zero deps)
  ├── @web4x/cli (CLI infrastructure — depends on ucp only)
  │     ├── @web4x/unit (+ ucp)
  │     ├── @web4x/persistence (+ ucp)
  │     ├── @web4x/user (+ ucp, unit)
  │     ├── @web4x/filesystem (+ ucp, unit)
  │     ├── @web4x/http (+ ucp)
  │     ├── @web4x/tls (+ ucp)
  │     ├── @web4x/web4tscomponent (+ ucp, unit, persistence)
  │     ├── @web4x/web4test
  │     ├── @web4x/tootsie
  │     ├── @web4x/pdca
  │     └── @web4x/idealminimalcomponent
  └── @web4x/once (depends on ALL above)
```

## Phase A: Create @web4x/cli component

### A.1: Component structure
```
components/CLI/0.3.23.0/
├── package.json          # @web4x/cli, dep: @web4x/ucp
├── tsconfig.json
├── src/
│   ├── sh/build.sh       # Cascading build
│   └── ts/
│       ├── layer2/
│       │   ├── DefaultCLI.ts        # MOVE from W4TSC (single source of truth)
│       │   └── DelegationProxy.ts   # MOVE from W4TSC
│       ├── layer3/
│       │   ├── CLI.interface.ts
│       │   ├── CLIModel.interface.ts
│       │   ├── Colors.interface.ts
│       │   ├── Completion.ts
│       │   ├── Component.interface.ts  # CLI's view of Component
│       │   ├── MethodInfo.interface.ts
│       │   ├── MethodSignature.interface.ts
│       │   ├── User.interface.ts       # CLI's view of User
│       │   ├── Model.interface.ts      # Re-export from @web4x/ucp
│       │   ├── Reference.interface.ts  # Re-export from @web4x/ucp
│       │   └── Scenario.interface.ts   # Re-export from @web4x/ucp
│       └── layer4/
│           ├── DefaultColors.ts
│           ├── HierarchicalCompletionFilter.ts
│           ├── TSCompletion.ts
│           └── TestFileParser.ts
├── cli                   # Self-registering CLI script
└── source.env
```

### A.2: Source of files
- DefaultCLI.ts: MOVE from Web4TSComponent/0.3.23.0/src/ts/layer2/
- DelegationProxy.ts: MOVE from Web4TSComponent/0.3.23.0/src/ts/layer2/
- Layer3 interfaces: MOVE from Web4TSComponent/0.3.23.0/src/ts/layer3/
- Layer4 utilities: MOVE from Web4TSComponent/0.3.23.0/src/ts/layer4/
- After move: W4TSC re-exports from @web4x/cli (same as UcpComponent re-exports from @web4x/ucp)

### A.3: Dependencies
```json
{
  "dependencies": {
    "@web4x/ucp": "file:../../UCP/0.3.23.0"
  }
}
```
No other @web4x deps. DefaultCLI imports UcpComponent from @web4x/ucp. Everything else is local.

### A.4: Verify
- `npx tsc` zero errors
- DefaultCLI self-discovers methods, shows usage
- TSCompletion generates shell completions

## Phase B: Rewire Web4TSComponent

### B.1: Add @web4x/cli dependency
```json
"@web4x/cli": "file:../../CLI/0.3.23.0"
```

### B.2: Replace moved files with re-exports
```typescript
// Web4TSComponent/src/ts/layer2/DefaultCLI.ts → becomes:
export { DefaultCLI } from '@web4x/cli/dist/ts/layer2/DefaultCLI.js';

// Web4TSComponent/src/ts/layer2/DelegationProxy.ts → becomes:
export { DelegationProxy } from '@web4x/cli/dist/ts/layer2/DelegationProxy.js';

// Same for all layer3 CLI interfaces and layer4 utilities
```

### B.3: Verify
- `npx tsc` zero errors on Web4TSComponent
- `web4tscomponent info` still works
- `web4tscomponent on Web4TSComponent 0.3.23.0 links` still works

## Phase C: Wire 6 library components

For each of Unit, Persistence, User, Filesystem, HTTP, TLS:

### C.1: Add @web4x/cli dependency
```json
"@web4x/cli": "file:../../CLI/0.3.23.0"
```

### C.2: Create thin {Name}CLI.ts in layer5
Each component gets ONE new file: `src/ts/layer5/{Name}CLI.ts`
- Imports DefaultCLI from `@web4x/cli`
- Imports DelegationProxy from `@web4x/cli`
- Imports the component's Default{Name} class from local layer2
- Extends DefaultCLI, wraps component in DelegationProxy
- ~50 lines each (same pattern as IdealMinimalComponentCLI)

### C.3: Create Default{Name}.ts if missing
Some library components (Persistence, HTTP, TLS) don't have a Default{Name}.ts that the CLI can wrap. These need a minimal component class that extends UcpComponent with the component's model type.

### C.4: Update CLI shell script
Update each component's `{name}` script to point CLI_PATH to `dist/ts/layer5/{Name}CLI.js`

### C.5: Update package.json main
Point `"main"` to `dist/ts/layer5/{Name}CLI.js`

### C.6: Verify per component
- `npx tsc` zero errors
- `./{name}` builds and shows usage
- `web4tscomponent on {Name} 0.3.23.0 info` works (the 'on' delegation pattern)
- `web4tscomponent on {Name} 0.3.23.0 setCICDVersion latest 0.3.23.0` works

## Phase D: Rewire generated components

Web4Test, Tootsie, PDCA, IdealMinimalComponent currently have their own copies of DefaultCLI etc. Rewire them to import from @web4x/cli:

### D.1: Add @web4x/cli dependency to each
### D.2: Replace local DefaultCLI.ts, DelegationProxy.ts, layer3 CLI interfaces, layer4 utilities with re-exports from @web4x/cli
### D.3: Verify each still works

## Acceptance Criteria

- [ ] @web4x/cli component exists at CLI/0.3.23.0, compiles clean
- [ ] DefaultCLI and DelegationProxy have ONE source of truth (in @web4x/cli)
- [ ] Web4TSComponent re-exports CLI from @web4x/cli, still works
- [ ] All 6 library components have thin {Name}CLI.ts, `on` delegation works
- [ ] All 4 generated components rewired to @web4x/cli, still work
- [ ] `web4tscomponent on Unit latest setCICDVersion latest 0.3.23.1` succeeds
- [ ] Zero copied CLI files across all 13+ components
- [ ] Zero TypeScript errors across entire component tree

## Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| DefaultCLI has hidden deps on W4TSC-specific types | HIGH | Read DefaultCLI imports carefully before moving |
| TSCompletion uses `typescript` npm package | LOW | Add typescript as devDep to @web4x/cli |
| Breaking change for existing scripts | MEDIUM | Re-exports maintain backward compatibility |

## Estimated Effort

| Phase | Work | Files |
|-------|------|-------|
| A: Create @web4x/cli | Create component, move ~15 files | 15 new |
| B: Rewire W4TSC | Replace ~15 files with re-exports | 15 modified |
| C: Wire 6 library components | 6 thin CLIs + deps | 12 new, 12 modified |
| D: Rewire 4 generated components | Replace copies with imports | 60 modified |
| **Total** | | ~45 new, ~87 modified |
