# ADR-002: Version Mapping — Web4 4-Part X.Y.Z.W ↔ npm Semver

**Status:** PROPOSED
**Author:** web4-architect @ web4team:0.1
**Date:** 2026-04-27
**Triggered by:** `npm install` error `Invalid Version: 0.3.23.0` during ADR-001 POC

## Problem

Web4 uses 4-part versions: `X.Y.Z.W` (major.minor.patch.revision)
npm requires 3-part semver: `X.Y.Z` or `X.Y.Z-prerelease`

**Current state is inconsistent:**

| Component | package.json version | npm valid? |
|-----------|---------------------|------------|
| UCP 0.3.23.1 | `"0.3.23.1"` | NO |
| Unit 0.3.23.1 | `"0.3.23-1"` | YES |
| W4TSC 0.3.23.1 | `"0.3.23.1"` | NO |
| ONCE 0.3.22.2 | `"0.3.22.2"` | NO |
| Unit prod 0.3.0.5 | `"0.3.0.5"` | NO |

**When it breaks:** `npm install` of `file:` dependencies validates the target package's version. Newer npm (v11+) is stricter. With `"private": true` npm sometimes tolerates invalid versions for the package itself, but rejects them when resolving as a dependency.

## Web4 SemanticVersion Model

Web4's `SemanticVersion` class uses 4 fields:

```typescript
interface VersionModel {
  major: number;    // Breaking changes
  minor: number;    // New features
  patch: number;    // Bug fixes
  revision: number; // Build/iteration number
}
```

**Semantic links map to versions:**
- `prod` → stable release (e.g., 0.3.19.1)
- `test` → under testing (e.g., 0.3.19.3)
- `dev` → development (e.g., 0.3.20.6)
- `latest` → most recent (e.g., 0.3.23.1)

**Promotion:** `0.3.23.0` (initial) → `0.3.23.1` (dev iteration) → `0.3.24.0` (release)

The 4th part (revision) serves as the build/iteration counter within a patch level. It maps naturally to npm's prerelease field.

## Options

### Option A: Hyphen separator — `X.Y.Z-W`

```
Web4:  0.3.23.0  →  npm: 0.3.23-0
Web4:  0.3.23.1  →  npm: 0.3.23-1
Web4:  0.3.0.5   →  npm: 0.3.0-5
```

**Mapping rule:** Replace last `.` with `-`
**Reverse:** Replace last `-` with `.`

| Pro | Con |
|-----|-----|
| Valid npm semver | `0.3.23-0` sorts BEFORE `0.3.23` in semver (prerelease < release) |
| Minimal change to existing code | Requires find/replace in all package.json files |
| SemanticVersion.ts can handle both formats | Directory names stay 4-part, package.json uses 3-part — dual identity |

### Option B: Dot-separated prerelease — `X.Y.Z-W.0`

```
Web4:  0.3.23.0  →  npm: 0.3.23-0.0
Web4:  0.3.23.1  →  npm: 0.3.23-1.0
```

Avoids ambiguity but more complex. Not recommended.

### Option C: Keep 4-part, disable npm version validation

Use `--legacy-peer-deps` or `--no-optional` or patch npm config.

| Pro | Con |
|-----|-----|
| No code changes | Fragile — breaks with npm updates |
| | Doesn't fix root cause |

### Option D: Map revision to patch — `X.Y.(Z*100+W)`

```
Web4:  0.3.23.0  →  npm: 0.3.2300
Web4:  0.3.23.1  →  npm: 0.3.2301
Web4:  0.3.0.5   →  npm: 0.3.5
```

| Pro | Con |
|-----|-----|
| Valid semver, no prerelease | Patch numbers become huge |
| | `0.3.5` collides with `0.3.0.5` |
| | Loses semantic meaning |

## Recommendation: Option A — `X.Y.Z-W`

**Reasoning:**

1. **Minimal mapping.** `0.3.23.0` → `0.3.23-0`: replace last dot with hyphen. Reversible.

2. **Valid npm semver.** `-0` is a valid prerelease identifier. npm handles it correctly for `file:` deps.

3. **Sorting is correct for our workflow.** In npm semver, `0.3.23-0 < 0.3.23-1 < 0.3.24-0`. This matches Web4's promotion order: initial build → iterations → next patch.

4. **The "prerelease < release" issue is irrelevant.** We don't publish to npm registry. With `"private": true` and `file:` deps, we never compare against a bare `0.3.23` version. All our versions have 4 parts, so all map to prerelease — sorting is consistent within that space.

5. **Directory names stay 4-part.** The filesystem uses `components/UCP/0.3.23.0/`. Only `package.json` version changes. SemanticVersion.ts handles both formats — it already parses `X.Y.Z-W` via the prerelease field.

## Implementation

### Rule
- **Filesystem directories:** Always 4-part `X.Y.Z.W` (unchanged)
- **package.json `version`:** Always 3-part `X.Y.Z-W` (hyphen before revision)
- **SemanticVersion class:** Reads/writes both formats
- **CLI display:** Shows 4-part `X.Y.Z.W` (human-facing)
- **`file:` dep paths:** Reference directory name (4-part): `"file:../../UCP/0.3.23.0"`

### Migration

1. Update all package.json `version` fields: `s/(\d+\.\d+\.\d+)\.(\d+)/\1-\2/`
2. Update SemanticVersion.toString() to output `X.Y.Z-W` for package.json context
3. Keep SemanticVersion.parse() accepting both `X.Y.Z.W` and `X.Y.Z-W`
4. `file:` dep paths remain unchanged (they reference directory names)

### Affected Files
Every `package.json` in every component version. ~30 files.

### Not Affected
- Directory names (`components/UCP/0.3.23.0/` stays)
- `file:` dependency paths (`"file:../../UCP/0.3.23.0"` stays — references dir, not package version)
- CLI output (`web4tscomponent info` shows `0.3.23.0`)
- Semantic link names (`dev`, `prod`, `test`, `latest`)
- `scripts/versions/` symlink names (`once-v0.3.23.0`)

## Decision Required

PO: approve Option A and authorize migration of all package.json version fields to `X.Y.Z-W` format?
