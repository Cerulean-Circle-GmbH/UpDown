# Web4 JsInterface Pattern — Runtime Interface Enforcement

**Date**: 2025-12-22  
**Status**: ✅ **PATTERN DOCUMENTED**  
**Web4 Principle**: P35 (JsInterface for Runtime Interfaces)  
**Details**: [web4-component-anatomy-details.md](./web4-component-anatomy-details.md)

---

## Problem Statement

TypeScript interfaces are erased at runtime. This creates problems for:
- **RelatedObjects**: `image.relatedObjectRegister(FileJsInterface, imageFile)` — needs a class to exist at runtime
- **Implementation lookup**: `FileJsInterface.implementations` — needs a class to query
- **Type guards**: `instanceof FileJsInterface` — impossible with pure interfaces

**Web4 Solution**: The JsInterface pattern creates a **three-layer type hierarchy**:

```
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 1: TypeScript Interface (compile-time only)              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ // File.interface.ts                                        │ │
│ │ interface File {                                            │ │
│ │   get path(): string;                                       │ │
│ │   get model(): Model;                                       │ │
│ │ }                                                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                            │                                    │
│                    implements                                   │
│                            ▼                                    │
│ LAYER 2: Abstract Class (runtime existence)                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ // FileJsInterface.ts                                       │ │
│ │ abstract class FileJsInterface                              │ │
│ │   extends JsInterface implements File {                     │ │
│ │   abstract get path(): string;                              │ │
│ │   abstract get model(): Model;                              │ │
│ │ }                                                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                            │                                    │
│                    implements                                   │
│                            ▼                                    │
│ LAYER 3: Implementation Class (concrete)                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ // DefaultFile.ts                                           │ │
│ │ class DefaultFile                                           │ │
│ │   extends UcpComponent<FileModel>                           │ │
│ │   implements FileJsInterface {                              │ │
│ │   get path(): string { return this.model.path; }            │ │
│ │   get model(): FileModel { return this._model; }            │ │
│ │ }                                                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Naming Convention

| Layer | File Name | Type Name | Purpose |
|-------|-----------|-----------|---------|
| **Interface** | `Xxx.interface.ts` | `Xxx` | Compile-time contract |
| **JsInterface** | `XxxJs.ts` | `XxxJs` | Runtime existence (for collision types) |
| **Implementation** | `DefaultXxx.ts` | `DefaultXxx` | Concrete class |

**Collision-Only Rule**: Only types that collide with browser globals use `Js` suffix:
- `File` → `FileJs` (collides with DOM `File`)
- `Worker` → `WorkerJs` (collides with DOM `Worker`)
- `User`, `Unit`, etc. → Keep simple names (no collision)

**Example** (File/Folder - collision types):
- `File.interface.ts` → `interface File`
- `FileJs.ts` → `abstract class FileJs extends JsInterface implements File`
- `DefaultFile.ts` → `class DefaultFile implements FileJs` with `static implements() { return [FileJs]; }`

---

## Pattern Anatomy

### Layer 1: TypeScript Interface (`File.interface.ts`)

**Purpose**: Define the compile-time contract. This is pure TypeScript and will be erased at runtime.

**Rules**:
- ✅ Defines ALL properties and methods that implementations MUST have
- ✅ Uses proper generics for type safety
- ✅ NO implementation details
- ✅ Name matches the concept (e.g., `File`, `Folder`)

```typescript
// layer3/File.interface.ts
import type { Model } from './Model.interface.js';

/**
 * File - TypeScript interface for file-like objects
 * 
 * This interface is erased at runtime!
 * For runtime existence, see FileJsInterface.ts.
 */
export interface File {
  // Identity
  readonly uuid: string;
  readonly name: string;
  readonly path: string;
  
  // Type discrimination
  readonly isFile: boolean;
  readonly isFolder: boolean;
  
  // Model access (base type for covariance)
  readonly model: Model;
  
  // Operations
  exists(): boolean;
  delete(): Promise<void>;
  parentSet(parent: File | null): void;
  pathSet(newPath: string): void;
}
```

### Layer 2: JsInterface Class (`FileJs.ts`)

**Purpose**: Make the interface exist at runtime by extending `JsInterface`.

**Rules**:
- ✅ `extends JsInterface` — provides runtime existence
- ✅ `implements File` — enforces compile-time contract
- ✅ All methods are `abstract` — implementations must provide them
- ✅ Auto-registration via `static implements()` in subclasses
- ✅ Name is `XxxJs` for collision types (shorter than `XxxJsInterface`)

```typescript
// layer3/FileJs.ts
import { JsInterface } from './JsInterface.js';
import type { File } from './File.interface.js';
import type { Model } from './Model.interface.js';

/**
 * FileJs - Runtime interface for file system nodes
 * 
 * This abstract class:
 * 1. EXISTS at runtime (unlike TypeScript interfaces)
 * 2. IMPLEMENTS File (enforces compile-time contract)
 * 3. Named "FileJs" to avoid collision with browser's File
 */
export abstract class FileJs extends JsInterface implements File {
  
  abstract get uuid(): string;
  abstract get name(): string;
  abstract get path(): string;
  abstract get isFile(): boolean;
  abstract get isFolder(): boolean;
  
  /**
   * Model with covariant return type
   */
  abstract get model(): Model;
  
  abstract exists(): boolean;
  abstract delete(): Promise<void>;
  abstract parentSet(parent: FileJs | null): void;
  abstract pathSet(newPath: string): void;
}
```

### Layer 3: Implementation Class (`DefaultFile.ts`)

**Purpose**: Concrete implementation that fulfills the entire contract.

**Rules**:
- ✅ `extends UcpComponent<FileModel>` — standard Web4 component pattern
- ✅ `implements FileJs` — fulfills the runtime interface
- ✅ `static implements()` — declares JsInterfaces (auto-registered by `super.start()`)
- ✅ Returns concrete model type (covariant)

```typescript
// layer2/DefaultFile.ts
import { UcpComponent } from './UcpComponent.js';
import { FileJs } from '../layer3/FileJs.js';
import type { FileModel } from '../layer3/FileModel.interface.js';

/**
 * DefaultFile - Concrete file implementation
 * 
 * Implements FileJs, which in turn implements File.
 * Complete type-safe chain:
 * 
 * File (interface) ← FileJs (JsInterface) ← DefaultFile (implementation)
 */
export class DefaultFile extends UcpComponent<FileModel> implements FileJs {
  
  /**
   * Declare JsInterfaces this class implements
   */
  static implements() {
    return [FileJs];
  }
  
  /**
   * Auto-registers with declared JsInterfaces
   */
  static start(): void {
    super.start();  // Auto-calls FileJs.implementationRegister(DefaultFile)
  }
  
  get uuid(): string { return this.model.uuid; }
  get name(): string { return this.model.name; }
  get path(): string { return this.model.path; }
  get isFile(): boolean { return true; }
  get isFolder(): boolean { return false; }
  
  get model(): FileModel { return this._model; }
  
  exists(): boolean { /* ... */ }
  async delete(): Promise<void> { /* ... */ }
  parentSet(parent: FileJs | null): void { /* ... */ }
  pathSet(newPath: string): void { this.model.path = newPath; }
}
```

---

## Inheritance Pattern: FolderJs extends FileJs

When an interface extends another interface, the pattern mirrors this:

```
File (interface)          Folder (interface)
     │                          │
     │ implements               │ implements
     ▼                          ▼
   FileJs    ────────────►  FolderJs
     │                          │
     │ implements               │ implements
     ▼                          ▼
DefaultFile          ─────► DefaultFolder
```

### Folder extends File

```typescript
// layer3/Folder.interface.ts
import type { File } from './File.interface.js';
import type { Collection } from './Collection.interface.js';

export interface Folder extends File {
  readonly children: File[];
  readonly childReferences: Collection<File>;
  childAdd(child: File): void;
  childRemove(child: File): boolean;
  childGet(uuid: string): File | null;
}
```

### FolderJs extends FileJs

```typescript
// layer3/FolderJs.ts
import { FileJs } from './FileJs.js';
import type { Folder } from './Folder.interface.js';
import type { Collection } from './Collection.interface.js';

/**
 * FolderJs - Runtime interface for folder components
 */
export abstract class FolderJs extends FileJs implements Folder {
  abstract get children(): FileJs[];
  abstract get childReferences(): Collection<FileJs>;
  abstract childAdd(child: FileJs): void;
  abstract childRemove(child: FileJs): boolean;
  abstract childGet(uuid: string): FileJs | null;
}
```

### DefaultFolder implements FolderJs

```typescript
// layer2/DefaultFolder.ts
export class DefaultFolder extends UcpComponent<FolderModel> 
  implements Container<FileJs>, FolderJs {
  // NOTE: No need to list FileJs - FolderJs extends FileJs!
  
  static implements() {
    return [FileJs, FolderJs];  // Declare both for registration
  }
  
  static start(): void {
    super.start();  // Auto-registers with both FileJs and FolderJs
  }
  
  get isFile(): boolean { return true; }   // A folder IS a file
  get isFolder(): boolean { return true; } // And it's a folder
  
  // ... Folder-specific implementations
}
```

---

## DOM `File` Collision

**Warning**: The browser has a built-in global `File` type (for `<input type="file">`).

When using the Web4 `File` interface in files that might also use the DOM `File`:
1. **Always import explicitly**: `import type { File } from '../layer3/File.interface.js';`
2. TypeScript will prefer the local import over the global

```typescript
// DefaultFile.ts
import type { File } from '../layer3/File.interface.js';  // ← Explicit import

// Now File refers to our interface, not DOM's File
```

---

## Checklist: Creating a New JsInterface

### 1. Create TypeScript Interface (`Xxx.interface.ts`)

```
- [ ] File: layer3/Xxx.interface.ts
- [ ] Interface name: Xxx (clean name)
- [ ] All readonly properties defined
- [ ] All method signatures defined
- [ ] No implementation details
```

### 2. Create JsInterface Class (`XxxJsInterface.ts`)

```
- [ ] File: layer3/XxxJsInterface.ts
- [ ] Class name: XxxJsInterface
- [ ] extends JsInterface
- [ ] implements Xxx
- [ ] All members abstract
- [ ] Uses runtime types (XxxJsInterface) in parameters
```

### 3. Create Implementation (`DefaultXxx.ts`)

```
- [ ] File: layer2/DefaultXxx.ts
- [ ] extends UcpComponent<XxxModel>
- [ ] implements XxxJsInterface
- [ ] static start() calls XxxJsInterface.implementationRegister(DefaultXxx)
- [ ] All abstract methods implemented
- [ ] Model getter returns XxxModel (covariant)
```

---

## Anti-Patterns

### ❌ WRONG: Implementing TS interface directly

```typescript
// BAD: TS interface erased at runtime, can't use for RelatedObjects
class DefaultFile implements File {
  // ...
}

// This fails at runtime:
image.relatedObjectRegister(File, file);  // File doesn't exist at runtime!
```

### ❌ WRONG: Collision with browser types

```typescript
// BAD: "File" collides with browser's File type
abstract class File extends JsInterface implements IFile {
  // ...
}

// GOOD: "FileJs" avoids collision
abstract class FileJs extends JsInterface implements File {
  // ...
}
```

### ❌ WRONG: Using interface type in JsInterface parameters

```typescript
// BAD: File (interface) is erased at runtime
abstract class FileJs extends JsInterface {
  abstract parentSet(parent: File | null): void;  // ❌ File erased!
}

// GOOD: Use runtime type
abstract class FileJs extends JsInterface {
  abstract parentSet(parent: FileJs | null): void;  // ✅ exists at runtime
}
```

### ❌ WRONG: Manual registration instead of static implements()

```typescript
// BAD: Manual, repetitive, easy to forget
static start(): void {
  super.start();
  FileJs.implementationRegister(DefaultFile);  // ❌ Manual
}

// GOOD: Declarative, auto-registered
static implements() { return [FileJs]; }
static start(): void { super.start(); }  // ✅ Auto-registers
```

---

## Benefits

1. **Compile-time safety**: TypeScript interface enforces contract
2. **Runtime existence**: JsInterface class exists in JavaScript
3. **Short naming**: `XxxJs` is clear and avoids browser collisions
4. **Auto-registration**: `static implements()` + `super.start()` = DRY
5. **Implementation registry**: `FileJs.implementations` returns all implementing classes
6. **RelatedObjects compatibility**: Can use `FileJs` as key in registrations
7. **Type covariance**: Implementations can return more specific types

---

## Dual Links

- **This Pattern**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/web4-jsinterface-pattern.md) | [§/.../web4-jsinterface-pattern.md](./web4-jsinterface-pattern.md)
- **Component Anatomy**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/web4-component-anatomy-details.md) | [§/.../web4-component-anatomy-details.md](./web4-component-anatomy-details.md)
- **P35 Details**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/web4-principles-details.md#principle-35-jsinterface-for-runtime-interfaces) | [§/.../web4-principles-details.md](./web4-principles-details.md#principle-35-jsinterface-for-runtime-interfaces)
- **JsInterface.ts**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/src/ts/layer3/JsInterface.ts) | [§/.../layer3/JsInterface.ts](../src/ts/layer3/JsInterface.ts)
- **FileJs.ts**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/src/ts/layer3/FileJs.ts) | [§/.../layer3/FileJs.ts](../src/ts/layer3/FileJs.ts)
- **Impact PDCA**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/2025-12-22-UTC-1400.jsinterface-naming-impact.pdca.md) | [§/.../jsinterface-naming-impact.pdca.md](./2025-12-22-UTC-1400.jsinterface-naming-impact.pdca.md)
- **File/Folder PDCA**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/2025-12-22-UTC-1100.file-folder-inheritance.pdca.md) | [§/.../file-folder-inheritance.pdca.md](./2025-12-22-UTC-1100.file-folder-inheritance.pdca.md)

---

**"TypeScript erases interfaces. JsInterface makes them real — with clear `XxxJs` naming and auto-registration."** 🏛️
