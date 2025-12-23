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
| **JsInterface** | `XxxJsInterface.ts` | `XxxJsInterface` | Runtime existence |
| **Implementation** | `DefaultXxx.ts` | `DefaultXxx` | Concrete class |

**Example**:
- `File.interface.ts` → `interface File`
- `FileJsInterface.ts` → `abstract class FileJsInterface extends JsInterface implements File`
- `DefaultFile.ts` → `class DefaultFile extends UcpComponent<FileModel> implements FileJsInterface`

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

### Layer 2: JsInterface Class (`FileJsInterface.ts`)

**Purpose**: Make the interface exist at runtime by extending `JsInterface`.

**Rules**:
- ✅ `extends JsInterface` — provides runtime existence
- ✅ `implements File` — enforces compile-time contract
- ✅ All methods are `abstract` — implementations must provide them
- ✅ Registers implementations via `FileJsInterface.implementationRegister()`
- ✅ Name is `XxxJsInterface` to clearly indicate runtime representation

```typescript
// layer3/FileJsInterface.ts
import { JsInterface } from './JsInterface.js';
import type { File } from './File.interface.js';
import type { Model } from './Model.interface.js';

/**
 * FileJsInterface - Runtime interface for file system nodes
 * 
 * This abstract class:
 * 1. EXISTS at runtime (unlike TypeScript interfaces)
 * 2. IMPLEMENTS File (enforces compile-time contract)
 * 3. REGISTERS implementations via FileJsInterface.implementationRegister()
 */
export abstract class FileJsInterface extends JsInterface implements File {
  
  abstract get uuid(): string;
  abstract get name(): string;
  abstract get path(): string;
  abstract get isFile(): boolean;
  abstract get isFolder(): boolean;
  
  /**
   * Model with covariant return type
   * 
   * File interface defines: readonly model: Model
   * DefaultFile returns: FileModel (extends Model)
   */
  abstract get model(): Model;
  
  abstract exists(): boolean;
  abstract delete(): Promise<void>;
  abstract parentSet(parent: FileJsInterface | null): void;
  abstract pathSet(newPath: string): void;
}
```

### Layer 3: Implementation Class (`DefaultFile.ts`)

**Purpose**: Concrete implementation that fulfills the entire contract.

**Rules**:
- ✅ `extends UcpComponent<FileModel>` — standard Web4 component pattern
- ✅ `implements FileJsInterface` — fulfills the runtime interface
- ✅ Registers in `static start()` — JsInterface pattern
- ✅ Returns concrete model type (covariant)

```typescript
// layer2/DefaultFile.ts
import { UcpComponent } from './UcpComponent.js';
import { FileJsInterface } from '../layer3/FileJsInterface.js';
import type { FileModel } from '../layer3/FileModel.interface.js';

/**
 * DefaultFile - Concrete file implementation
 * 
 * Implements FileJsInterface, which in turn implements File.
 * Complete type-safe chain:
 * 
 * File (interface) ← FileJsInterface (JsInterface) ← DefaultFile (implementation)
 */
export class DefaultFile extends UcpComponent<FileModel> implements FileJsInterface {
  
  /**
   * Register with JsInterface on class load
   */
  static start(): void {
    super.start();
    FileJsInterface.implementationRegister(DefaultFile);
  }
  
  get uuid(): string { return this.model.uuid; }
  get name(): string { return this.model.name; }
  get path(): string { return this.model.path; }
  get isFile(): boolean { return true; }
  get isFolder(): boolean { return false; }
  
  /**
   * Covariant return: FileJsInterface.model returns Model, we return FileModel
   */
  get model(): FileModel { return this._model; }
  
  exists(): boolean { /* ... */ }
  async delete(): Promise<void> { /* ... */ }
  parentSet(parent: FileJsInterface | null): void { /* ... */ }
  pathSet(newPath: string): void { this.model.path = newPath; }
}
```

---

## Inheritance Pattern: FolderJsInterface extends FileJsInterface

When an interface extends another interface, the pattern mirrors this:

```
File (interface)          Folder (interface)
     │                          │
     │ implements               │ implements
     ▼                          ▼
FileJsInterface    ─────► FolderJsInterface
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

### FolderJsInterface extends FileJsInterface

```typescript
// layer3/FolderJsInterface.ts
import { FileJsInterface } from './FileJsInterface.js';
import type { Folder } from './Folder.interface.js';
import type { Collection } from './Collection.interface.js';

/**
 * FolderJsInterface - Runtime interface for folder components
 */
export abstract class FolderJsInterface extends FileJsInterface implements Folder {
  abstract get children(): FileJsInterface[];
  abstract get childReferences(): Collection<FileJsInterface>;
  abstract childAdd(child: FileJsInterface): void;
  abstract childRemove(child: FileJsInterface): boolean;
  abstract childGet(uuid: string): FileJsInterface | null;
}
```

### DefaultFolder implements FolderJsInterface

```typescript
// layer2/DefaultFolder.ts
export class DefaultFolder extends UcpComponent<FolderModel> 
  implements Container<FileJsInterface>, FileJsInterface, FolderJsInterface {
  
  static start(): void {
    super.start();
    FileJsInterface.implementationRegister(DefaultFolder);
    FolderJsInterface.implementationRegister(DefaultFolder);
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

### ❌ WRONG: Abstract class without JsInterface suffix

```typescript
// BAD: Confusing naming
abstract class File extends JsInterface implements IFile {
  // ...
}

// GOOD: Clear naming
abstract class FileJsInterface extends JsInterface implements File {
  // ...
}
```

### ❌ WRONG: Using interface type in JsInterface parameters

```typescript
// BAD: File is erased at runtime, can't instanceof check
abstract class FileJsInterface extends JsInterface {
  abstract parentSet(parent: File | null): void;  // ❌ File erased!
}

// GOOD: Use runtime type
abstract class FileJsInterface extends JsInterface {
  abstract parentSet(parent: FileJsInterface | null): void;  // ✅ exists at runtime
}
```

---

## Benefits

1. **Compile-time safety**: TypeScript interface enforces contract
2. **Runtime existence**: JsInterface class exists in JavaScript
3. **Clear naming**: `XxxJsInterface` clearly indicates runtime representation
4. **Implementation registry**: `FileJsInterface.implementations` returns all implementing classes
5. **RelatedObjects compatibility**: Can use `FileJsInterface` as key in registrations
6. **Type covariance**: Implementations can return more specific types

---

## Dual Links

- **This Pattern**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/web4-jsinterface-pattern.md) | [§/.../web4-jsinterface-pattern.md](./web4-jsinterface-pattern.md)
- **Component Anatomy**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/web4-component-anatomy-details.md) | [§/.../web4-component-anatomy-details.md](./web4-component-anatomy-details.md)
- **P35 Details**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/web4-principles-details.md#principle-35-jsinterface-for-runtime-interfaces) | [§/.../web4-principles-details.md](./web4-principles-details.md#principle-35-jsinterface-for-runtime-interfaces)
- **JsInterface.ts**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/src/ts/layer3/JsInterface.ts) | [§/.../layer3/JsInterface.ts](../src/ts/layer3/JsInterface.ts)
- **File/Folder PDCA**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/2025-12-22-UTC-1100.file-folder-inheritance.pdca.md) | [§/.../file-folder-inheritance.pdca.md](./2025-12-22-UTC-1100.file-folder-inheritance.pdca.md)

---

**"TypeScript erases interfaces. JsInterface makes them real — with clear `XxxJsInterface` naming."** 🏛️
