<!--
SPDX-License-Identifier: AGPL-3.0-only WITH AI-GPL-Addendum
SPDX-FileComment: See AI-GPL.md for AI-specific terms.
Copyright (c) 2025 Cerulean Circle GmbH
Copyleft: See AGPLv3 (LICENSE) and AI-GPL Addendum (AI-GPL.md)
Backlinks: /LICENSE, /AI-GPL.md
-->

# 🔍 ESLint Configuration & TRUE Radical OOP Enforcement

**Status:** ✅ Operational (since Nov 11, 2025)  
**Version:** 1.0.0  
**PDCA:** [components/ONCE/0.3.20.2/session/2025-11-11-UTC-0748.enforce-radical-oop-with-eslint.pdca.md](components/ONCE/0.3.20.2/session/2025-11-11-UTC-0748.enforce-radical-oop-with-eslint.pdca.md)

---

## **📋 Overview**

This project uses ESLint to automatically enforce **TRUE Radical OOP** principles across all Web4 TypeScript components. The linting strategy is designed for **per-component efficiency** rather than slow project-wide scans.

---

## **🎯 Linting Strategy**

### **Automatic Linting (Recommended)**

**Every component build automatically lints its own source code:**

```bash
cd components/ONCE/0.3.20.2
./src/sh/build.sh  # Lints src/**/*.ts before compilation
```

**What happens:**
1. 🔍 ESLint runs on `src/**/*.ts` only (fast, component-scoped)
2. ❌ Build fails if violations found
3. ✅ TypeScript compiles only after lint passes

**Benefits:**
- ⚡ **Fast:** Only lints files being built
- 🎯 **Targeted:** Component-specific feedback
- 🛡️ **Safe:** Blocks compilation of non-compliant code

---

## **⚠️ Manual Linting (Discouraged)**

**Project-wide linting is SLOW and should be avoided:**

```bash
# ⚠️ WARNING: This will scan ALL components (slow!)
npm run lint:all

# Auto-fix all components (even slower!)
npm run lint:fix:all
```

**Why discouraged?**
- 🐌 Scans hundreds of TypeScript files across all versions
- 🕐 Takes 30+ seconds for large projects
- 🎯 Less actionable feedback (mixed component results)

**When to use:**
- Pre-release verification of entire codebase
- Investigating cross-component patterns
- CI/CD pipeline checks

---

## **🔧 Configuration Files**

### **`eslint.config.mjs`** (Project Root)

**Format:** ESLint Flat Config (ES Module)  
**Purpose:** Centralized Radical OOP rules for all components

**Key Rules:**
- 🚫 **No CommonJS:** Blocks `require()`, `module.exports`
- 🚫 **No Legacy Globals:** Blocks `__dirname`, `__filename`
- ✅ **Async/Await:** Enforces modern promise handling
- ✅ **TypeScript Strictness:** Explicit types, no `any` warnings
- ✅ **Code Quality:** Prefer `const`, arrow functions, template literals

**File Location:** `/Users/Shared/Workspaces/2cuGitHub/UpDown/eslint.config.mjs`

### **`.eslintignore`** (Project Root)

**Ignored Paths:**
- `dist/` - Compiled JavaScript output
- `node_modules/` - Third-party dependencies
- `**/*.js`, `**/*.mjs`, `**/*.cjs` - JavaScript files (we only lint TypeScript)
- `scenarios/` - Generated scenario data
- `**/scenarios/` - Component-level scenarios

**File Location:** `/Users/Shared/Workspaces/2cuGitHub/UpDown/.eslintignore`

---

## **🛠️ How It Works**

### **Build Script Integration**

Every component's `build.sh` includes this lint step:

```bash
# Run ESLint before building (Radical OOP enforcement)
if [ "$VERBOSE" = "true" ]; then
    echo "🔍 Running ESLint to enforce TRUE Radical OOP..."
fi
if ! npx eslint 'src/**/*.ts' --max-warnings 0 --format compact 2>&1; then
    echo "❌ ESLint found Radical OOP violations!" >&2
    echo "📋 Fix violations or run 'npm run lint:fix' from project root" >&2
    exit 1
fi
if [ "$VERBOSE" = "true" ]; then
    echo "✅ ESLint passed - TRUE Radical OOP compliance verified"
fi
```

**Template Location:** `components/Web4TSComponent/0.3.19.0/templates/sh/build.sh.template`

### **New Components**

All components created with `web4tscomponent initProject` automatically include linting in their build scripts.

---

## **📖 TRUE Radical OOP Principles**

The ESLint configuration enforces these principles:

| Principle | Detectable? | ESLint Rule |
|-----------|-------------|-------------|
| **No CommonJS** | ✅ Fully | `no-restricted-syntax` (require, module.exports) |
| **ES Modules Only** | ✅ Fully | `no-restricted-syntax` (exports) |
| **No Legacy Globals** | ✅ Fully | `no-restricted-globals` (__dirname, __filename) |
| **Async/Await** | ⚠️ Partially | `@typescript-eslint/no-floating-promises` |
| **TypeScript Strictness** | ✅ Fully | `@typescript-eslint/*` rules |
| **Empty Constructor** | ❌ Manual | (Requires code review) |
| **Scenario Initialization** | ❌ Manual | (Requires code review) |
| **Model-Driven State** | ❌ Manual | (Requires code review) |

**Legend:**
- ✅ Fully = Automated by ESLint
- ⚠️ Partially = Some cases automated
- ❌ Manual = Requires human review

---

## **🐛 Fixing Violations**

### **Common Violations & Fixes**

#### **1. CommonJS `require()`**

**❌ Error:**
```typescript
const fs = require('fs');  // 🚫 CommonJS require() is PROHIBITED
```

**✅ Fix:**
```typescript
// Static import (for types and known modules)
import fs from 'fs';

// Dynamic import (for conditional loading)
const fs = await import('fs');
```

#### **2. Legacy `__dirname`**

**❌ Error:**
```typescript
const configPath = path.join(__dirname, 'config.json');  // 🚫 __dirname is PROHIBITED
```

**✅ Fix:**
```typescript
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configPath = join(__dirname, 'config.json');
```

#### **3. Floating Promises**

**❌ Error:**
```typescript
this.initialize();  // 🚫 Promises must be awaited
```

**✅ Fix:**
```typescript
await this.initialize();  // ✅ Properly awaited

// OR (if intentionally fire-and-forget)
void this.initialize();  // ✅ Explicit void cast
```

---

## **📚 Additional Resources**

- **PDCA Documentation:** [components/ONCE/0.3.20.2/session/2025-11-11-UTC-0748.enforce-radical-oop-with-eslint.pdca.md](components/ONCE/0.3.20.2/session/2025-11-11-UTC-0748.enforce-radical-oop-with-eslint.pdca.md)
- **ESM Migration PDCA:** [components/ONCE/0.3.20.2/session/2025-11-11-UTC-0735.migrate-commonjs-to-esm.pdca.md](components/ONCE/0.3.20.2/session/2025-11-11-UTC-0735.migrate-commonjs-to-esm.pdca.md)
- **Radical OOP Analysis:** [Web4Articles/components/Web4TSComponent/0.3.18.1/session/2025-11-06-UTC-0030.functional-vs-radical-oop-analysis.pdca.md](../Web4Articles/components/Web4TSComponent/0.3.18.1/session/2025-11-06-UTC-0030.functional-vs-radical-oop-analysis.pdca.md)

---

## **🎓 Developer Workflow**

### **Recommended Flow**

1. Make code changes in your component
2. Run component build: `./src/sh/build.sh`
3. Lint automatically runs (fast, component-scoped)
4. Fix any violations reported
5. Build completes successfully

### **What NOT to Do**

❌ Don't run `npm run lint:all` after every change  
❌ Don't disable linting in build scripts  
❌ Don't commit code that doesn't pass linting

### **CI/CD Integration**

For CI/CD pipelines, prefer:
```bash
# Lint specific component being tested
cd components/ONCE/0.3.20.2
npx eslint 'src/**/*.ts' --max-warnings 0
```

Rather than:
```bash
# ❌ Slow project-wide scan
npm run lint:all
```

---

**🔄 This document is maintained by Web4TSComponent build infrastructure.**  
**Last updated:** Nov 11, 2025  
**Version:** 1.0.0

