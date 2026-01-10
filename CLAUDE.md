# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UpDown is a multiplayer card game built on the **Web4TSComponent framework** - a TypeScript component architecture implementing CMM4 (Capability Maturity Model Level 4) development practices. The framework emphasizes "Radical OOP" - 100% model-driven state management with zero parameters.

To understand how to work with this project read dilligently
/Users/Shared/Workspaces/2cuGitHub/Web4Articles/scrum.pmo/roles/_shared/howto.fractal.pdca.md
[Fractal PDCA Howto](../Web4Articles/scrum.pmo/roles/_shared/howto.fractal.pdca.md) with a depth of level 1.

## Build & Test Commands

### Component-Level (Recommended)
```bash
# Navigate to a component version directory first
cd components/COMPONENT_NAME/VERSION

# Build (includes ESLint enforcement)
./src/sh/build.sh

# Run tests
npm test

# Run specific test file (hierarchical test runner) for functional vitests but these are NOT compliant as they are not radiccal OOP
./component test file 1
./component test file 1
./component test describe 1 
./component test itCase 1

#Radical OOP tests are used similarly
# Run specific test file (hierarchical test runner) for functional vitests but these are NOT compliant as they are not radiccal OOP
./component tootsie file 1
./component tootsie file 2

```

### Project-Level
```bash
# Install dependencies (from project root)
npm install

# Lint all components (slow - prefer per-component)
npm run lint:all
```

### QND Prototype
```bash
cd qnd
npm start      # Start HTTPS server on localhost:3443
npm run stop   # Stop server
```

## Architecture

### Layer System (layer1-5)
Every Web4TSComponent follows a strict 5-layer structure:
- **layer2/** - Implementation classes (`DefaultX.ts`, business logic)
- **layer3/** - Interface definitions (`*.interface.ts`, contracts)
- **layer4/** - Utility classes (completion, formatting, helpers)
- **layer5/** - CLI entry points (`*CLI.ts`, command routing)

### Key Components
- **Web4TSComponent** - Framework/meta-component providing CLI generation, versioning, component lifecycle
- **ONCE** - Distributed communication system with hierarchical WebSocket servers
- **PDCA** - Training component demonstrating Radical OOP principles
- **UpDown.Cards/Core/Demo** - Card game implementation

### Version Format
Versions use X.Y.Z.W format (major.minor.patch.revision). Semantic links (`dev`, `test`, `prod`, `latest`) point to specific versions.

## Radical OOP Patterns

### Empty Constructor + init()
```typescript
class MyComponent implements Component {
  model!: MyModel;

  constructor() {}  // Always empty

  init(scenario?: Scenario<MyModel>): this {
    this.model = { uuid, name, ... };
    return this;
  }
}
```

### Method Chaining
All methods return `this` for chaining:
```typescript
async doSomething(): Promise<this> {
  this.model.value = "updated";
  return this;
}
```

### Auto-Discovery CLI
Public methods automatically become CLI commands with tab completion.

## Code Conventions

### ESLint Enforced Rules
- No CommonJS (`require()`, `module.exports`) - use ES modules only
- No `__dirname`/`__filename` - use `import.meta.url` with `fileURLToPath()`
- No underscores in identifiers - use camelCase/PascalCase only
- No Jest - use Vitest
- All promises must be awaited or explicitly voided

### TypeScript Config
- Target: ES2022
- Module: NodeNext
- Strict mode enabled
- Output to `dist/`

## Directory Structure

```
components/           # All Web4 components with versioned directories
  Web4TSComponent/   # Framework (dev, test, prod, latest symlinks)
  ONCE/              # Communication infrastructure
  UpDown.*/          # Game components
qnd/                 # Quick prototype (vanilla JS/TS game)
scenarios/           # Generated state persistence (gitignored)
docs/                # Project documentation
```

## Component CLI Usage

```bash
# Component help
./component --help

# Common operations
./web4tscomponent create MyComponent 0.1.0.0 all
./web4tscomponent on COMPONENT VERSION test
./web4tscomponent on COMPONENT VERSION build
./web4tscomponent on COMPONENT VERSION upgrade nextBuild
```

---

## MANDATORY CHECKLISTS (Read Before Every Commit)

**READ these files at session start and before every commit:**

1. **CMM3 Compliance Checklist**
   - [GitHub](https://github.com/Cerulean-Circle-GmbH/Web4Articles/blob/dev/2025-10-17-UTC-0747/scrum.pmo/roles/_shared/cmm3.compliance.checklist.md) | [§/scrum.pmo/roles/_shared/cmm3.compliance.checklist.md](/Users/Shared/Workspaces/2cuGitHub/Web4Articles/scrum.pmo/roles/_shared/cmm3.compliance.checklist.md)

2. **Web4 Principles Checklist (35 Principles)**
   - [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/web4-principles-checklist.md) | [§/components/ONCE/0.3.22.1/session/web4-principles-checklist.md](/Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.22.1/session/web4-principles-checklist.md)

3. **Web4 Component Anatomy Checklist**
   - [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/web4-component-anatomy-checklist.md) | [§/components/ONCE/0.3.22.1/session/web4-component-anatomy-checklist.md](/Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.22.1/session/web4-component-anatomy-checklist.md)
