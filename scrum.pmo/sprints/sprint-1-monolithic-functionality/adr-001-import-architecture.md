# ADR-001: Import Architecture — Eliminating Re-Export Duplication

**Status:** PROPOSED
**Author:** web4-architect @ web4team:0.1
**Date:** 2026-04-27
**Triggered by:** Tron directive — re-export duplication violates DRY (P8)

## Problem

Current pattern: each component has 5-10 thin re-export files in layer3/:
```typescript
// Unit/0.3.23.0/src/ts/layer3/Model.interface.ts (entire file)
export type { Model } from '@web4x/ucp/dist/ts/layer3/Model.interface.js';
```

Internal code does:
```typescript
// Unit layer2/ScenarioService.ts
import type { Model } from '../layer3/Model.interface.js';  // hits re-export
```

**What's wrong:**
1. **DRY violation (P8):** 9 re-export files in Unit, 6 in Persistence, 6 in Filesystem — ~50 files across all components that contain zero logic
2. **White-box knowledge (P18):** Re-exports encode `@web4x/ucp/dist/ts/layer3/` — knowledge of UCP's internal directory structure
3. **Maintenance burden:** If UCP reorganizes layers, every re-export in every consumer must update
4. **Two-hop imports:** `ScenarioService.ts → ../layer3/Model.interface.js → @web4x/ucp/dist/ts/layer3/Model.interface.js` — unnecessary indirection

## Analysis: What npm Already Solves

With `"@web4x/ucp": "file:../../UCP/0.3.23.0"` in package.json, npm already:
- Resolves `@web4x/ucp` to the correct directory
- Creates `node_modules/@web4x/ucp` symlink
- Makes all exports available via the package name

The ONLY question is: how do consumers reference specific exports?

## Options Evaluated

### Option A: Direct imports (no re-exports)

```typescript
// Unit layer2/ScenarioService.ts
import type { Model } from '@web4x/ucp/dist/ts/layer3/Model.interface.js';
import { UcpComponent } from '@web4x/ucp/dist/ts/layer2/UcpComponent.js';
```

Delete all re-export files. Internal code imports directly from deps.

| Pro | Con |
|-----|-----|
| Zero duplication (P8 pure) | Path `dist/ts/layer3/` is white-box knowledge (P18 violation) |
| One source of truth | If UCP reorganizes, all consumers break |
| No maintenance overhead | Verbose import paths |

**Verdict:** Better than re-exports but still encodes internal structure.

### Option B: Barrel files (index.ts per component)

Each component has `src/ts/index.ts`:
```typescript
// UCP/0.3.23.0/src/ts/index.ts
export { UcpComponent } from './layer2/UcpComponent.js';
export { UcpController } from './layer2/UcpController.js';
export type { Model } from './layer3/Model.interface.js';
export type { Scenario } from './layer3/Scenario.interface.js';
// ... all public exports
```

Consumers:
```typescript
import { UcpComponent, type Model, type Scenario } from '@web4x/ucp';
```

| Pro | Con |
|-----|-----|
| Black-box (P18 pure) — consumers don't know layers | Barrel files can prevent tree-shaking |
| Clean single import line | One huge index.ts per component |
| Standard npm pattern | Must maintain barrel alongside source |

**Verdict:** Good for black-box, but barrel maintenance is its own DRY problem.

### Option C: npm `exports` field in package.json

```jsonc
// UCP/0.3.23.0/package.json
{
  "exports": {
    ".": "./dist/ts/index.js",
    "./UcpComponent": "./dist/ts/layer2/UcpComponent.js",
    "./Model": "./dist/ts/layer3/Model.interface.js",
    "./Scenario": "./dist/ts/layer3/Scenario.interface.js",
    "./IOR": "./dist/ts/layer4/IOR.js"
  }
}
```

Consumers:
```typescript
import { UcpComponent } from '@web4x/ucp/UcpComponent';
import type { Model } from '@web4x/ucp/Model';
import { IOR } from '@web4x/ucp/IOR';
```

| Pro | Con |
|-----|-----|
| Black-box (P18) — `exports` IS the public API contract | Requires Node.js 12.7+ (we have 24) |
| No barrel file needed — package.json IS the barrel | Each new export needs package.json update |
| npm-standard solution | TypeScript needs `moduleResolution: "NodeNext"` (we already have it) |
| Zero re-export files | Slightly verbose for many imports |

### Option D: Hybrid — `exports` field + barrel `index.ts`

```jsonc
// package.json
{
  "exports": {
    ".": "./dist/ts/index.js",
    "./layer2/*": "./dist/ts/layer2/*",
    "./layer3/*": "./dist/ts/layer3/*",
    "./layer4/*": "./dist/ts/layer4/*"
  }
}
```

```typescript
// Barrel import (most common types):
import { UcpComponent, type Model, type Scenario } from '@web4x/ucp';

// Specific import (less common):
import { TypeRegistry } from '@web4x/ucp/layer2/TypeRegistry.js';
```

| Pro | Con |
|-----|-----|
| Best of both — barrel for common, specific for rare | Two mechanisms to maintain |
| Wildcard exports preserve layer access | Layer paths still visible (partial white-box) |
| Gradual migration possible | |

## Recommendation: Option C (npm exports field)

**Reasoning:**

1. **npm already solves this.** The `exports` field in package.json is the npm-standard way to define a package's public API. We're reinventing it with re-export files.

2. **P18 compliance.** Consumers see `@web4x/ucp/Model`, not `@web4x/ucp/dist/ts/layer3/Model.interface.js`. The internal layer structure is hidden.

3. **P8 compliance.** Zero re-export files. One source of truth per type. The `exports` field in package.json is the ONLY place that maps public names to internal paths.

4. **Already compatible.** We use `"module": "NodeNext"` and `"moduleResolution": "NodeNext"` in all tsconfig.json files. Node.js 24 fully supports `exports`.

5. **Self-contained components.** Each component's package.json defines exactly what it exports. No consumer needs to know about layers, dist paths, or file naming conventions.

## Migration Plan

### Step 1: Add `exports` to @web4x/ucp package.json
```jsonc
{
  "exports": {
    ".": "./dist/ts/layer5/UcpCLI.js",
    "./UcpComponent": "./dist/ts/layer2/UcpComponent.js",
    "./UcpController": "./dist/ts/layer2/UcpController.js",
    "./TypeRegistry": "./dist/ts/layer2/TypeRegistry.js",
    "./UUIDProvider": "./dist/ts/layer2/UUIDProvider.js",
    "./SHA256Provider": "./dist/ts/layer2/SHA256Provider.js",
    "./Model": "./dist/ts/layer3/Model.interface.js",
    "./Scenario": "./dist/ts/layer3/Scenario.interface.js",
    "./Reference": "./dist/ts/layer3/Reference.interface.js",
    "./JsInterface": "./dist/ts/layer3/JsInterface.js",
    "./UcpModel": "./dist/ts/layer3/UcpModel.js",
    "./TypeDescriptor": "./dist/ts/layer3/TypeDescriptor.js",
    "./IOR": "./dist/ts/layer4/IOR.js",
    "./FileLoader": "./dist/ts/layer4/FileLoader.js"
  }
}
```

### Step 2: Update ONE consumer (Unit) as proof
```typescript
// BEFORE (two hops via re-export):
import type { Model } from '../layer3/Model.interface.js';

// AFTER (direct via exports):
import type { Model } from '@web4x/ucp/Model';
```

Delete `Unit/0.3.23.0/src/ts/layer3/Model.interface.ts` (the re-export file).

### Step 3: Verify TypeScript resolves correctly
`npx tsc` must compile with zero errors. TypeScript with `moduleResolution: "NodeNext"` reads the `exports` field.

### Step 4: Roll out to all components
Delete all re-export files. Update all imports to use `@web4x/{pkg}/{ExportName}`.

## What We Do NOT Need

- **Re-export files** — replaced by `exports` field
- **Barrel index.ts** — `exports` field IS the barrel
- **White-box dist/ts/layer3/ paths** — hidden behind export names

## Risk

| Risk | Mitigation |
|------|------------|
| TypeScript can't resolve `exports` field | We already use `moduleResolution: "NodeNext"` — this is supported |
| Breaking change for existing imports | Gradual migration — `exports` can coexist with direct paths during transition |
| Too many exports to maintain | Start with commonly-imported types only; add on demand |

## Decision Required

PO: approve Option C and authorize Step 1-2 as proof of concept on @web4x/ucp + @web4x/unit?
