# Web4 JsInterface Pattern — Runtime Interface Enforcement

**Date**: 2025-12-22  
**Status**: ✅ **PATTERN DOCUMENTED**  
**Web4 Principle**: P35 (JsInterface for Runtime Interfaces)

---

## Problem Statement

TypeScript interfaces are erased at runtime. This creates problems for:
- **RelatedObjects**: `image.relatedObjectRegister(File, imageFile)` — needs `File` to exist at runtime
- **Implementation lookup**: `File.implementations` — needs a class to query
- **Type guards**: `instanceof File` — impossible with pure interfaces

**Web4 Solution**: The JsInterface pattern creates a **three-layer type hierarchy**:

```
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 1: TypeScript Interface (compile-time only)              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ interface IFile {                                            │ │
│ │   get path(): string;                                       │ │
│ │   get model(): FileModel;                                   │ │
│ │ }                                                            │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                            │                                    │
│                    implements                                   │
│                            ▼                                    │
│ LAYER 2: Abstract Class (runtime existence)                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ abstract class File extends JsInterface implements IFile {  │ │
│ │   abstract get path(): string;                              │ │
│ │   abstract get model(): Model; // Covariant return          │ │
│ │ }                                                            │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                            │                                    │
│                    implements                                   │
│                            ▼                                    │
│ LAYER 3: Implementation Class (concrete)                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ class DefaultFile                                            │ │
│ │   extends UcpComponent<FileModel>                           │ │
│ │   implements File {                                          │ │
│ │   get path(): string { return this.model.path; }            │ │
│ │   get model(): FileModel { return this._model; }            │ │
│ │ }                                                            │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Pattern Anatomy

### Layer 1: TypeScript Interface (`IFile.interface.ts`)

**Purpose**: Define the compile-time contract. This is pure TypeScript and will be erased at runtime.

**Rules**:
- ✅ Extends `Model` or domain-specific base interface
- ✅ Defines ALL properties and methods that implementations MUST have
- ✅ Uses proper generics for type safety
- ✅ NO implementation details

```typescript
// layer3/IFile.interface.ts
import type { Model } from './Model.interface.js';
import type { Reference } from './Reference.interface.js';

/**
 * IFile - TypeScript interface for file-like objects
 * 
 * This interface is erased at runtime!
 * For runtime existence, see File.ts (JsInterface class).
 */
export interface IFile {
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
  parentSet(parent: IFile | null): void;
  pathSet(newPath: string): void;
}
```

### Layer 2: Abstract Class (`File.ts`)

**Purpose**: Make the interface exist at runtime by extending `JsInterface`.

**Rules**:
- ✅ `extends JsInterface` — provides runtime existence
- ✅ `implements IFile` — enforces compile-time contract
- ✅ All methods are `abstract` — implementations must provide them
- ✅ Registers implementations via `File.implementationRegister()`
- ✅ Covariant return types allowed (e.g., `Model` → `FileModel`)

```typescript
// layer3/File.ts
import { JsInterface } from './JsInterface.js';
import type { IFile } from './IFile.interface.js';
import type { Model } from './Model.interface.js';

/**
 * File - Runtime interface for file system nodes
 * 
 * ✅ Web4 Principle 35: JsInterface for Runtime Interfaces
 * 
 * This abstract class:
 * 1. EXISTS at runtime (unlike TypeScript interfaces)
 * 2. IMPLEMENTS IFile (enforces compile-time contract)
 * 3. REGISTERS implementations via File.implementationRegister()
 */
export abstract class File extends JsInterface implements IFile {
  
  // ═══════════════════════════════════════════════════════════════
  // IFile contract (abstract = must be implemented)
  // ═══════════════════════════════════════════════════════════════
  
  abstract get uuid(): string;
  abstract get name(): string;
  abstract get path(): string;
  abstract get isFile(): boolean;
  abstract get isFolder(): boolean;
  
  /**
   * Model with covariant return type
   * 
   * IFile defines: readonly model: Model
   * DefaultFile returns: FileModel (extends Model)
   * DefaultFolder returns: FolderModel (extends Model)
   * 
   * TypeScript allows this because FileModel extends Model.
   */
  abstract get model(): Model;
  
  abstract exists(): boolean;
  abstract delete(): Promise<void>;
  abstract parentSet(parent: File | null): void;  // File, not IFile (runtime type)
  abstract pathSet(newPath: string): void;
}
```

### Layer 3: Implementation Class (`DefaultFile.ts`)

**Purpose**: Concrete implementation that fulfills the entire contract.

**Rules**:
- ✅ `extends UcpComponent<FileModel>` — standard Web4 component pattern
- ✅ `implements File` — fulfills both IFile (via File) and runtime registration
- ✅ Registers in `static start()` — JsInterface pattern
- ✅ Returns concrete model type (covariant)

```typescript
// layer2/DefaultFile.ts
import { UcpComponent } from './UcpComponent.js';
import { File } from '../layer3/File.js';
import type { FileModel } from '../layer3/FileModel.interface.js';

/**
 * DefaultFile - Concrete file implementation
 * 
 * Implements the File JsInterface, which in turn implements IFile.
 * This creates a complete type-safe chain:
 * 
 * IFile (TS interface) ← File (JsInterface) ← DefaultFile (implementation)
 */
export class DefaultFile extends UcpComponent<FileModel> implements File {
  
  /**
   * Register with JsInterface on class load
   */
  static start(): void {
    super.start();
    File.implementationRegister(DefaultFile);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // File interface implementation
  // ═══════════════════════════════════════════════════════════════
  
  get uuid(): string {
    return this.model.uuid;
  }
  
  get name(): string {
    return this.model.name;
  }
  
  get path(): string {
    return this.model.path;
  }
  
  get isFile(): boolean {
    return true;
  }
  
  get isFolder(): boolean {
    return false;
  }
  
  /**
   * Covariant return: File.model returns Model, we return FileModel
   */
  get model(): FileModel {
    return this._model;
  }
  
  exists(): boolean {
    // Implementation...
  }
  
  async delete(): Promise<void> {
    // Implementation...
  }
  
  parentSet(parent: File | null): void {
    // Implementation...
  }
  
  pathSet(newPath: string): void {
    this.model.path = newPath;
    this.model.modifiedAt = Date.now();
  }
}
```

---

## Inheritance Pattern: Folder extends File

When an interface extends another interface, the pattern mirrors this:

```
IFile (interface)          IFolder (interface)
     │                          │
     │ implements               │ implements
     ▼                          ▼
File (JsInterface)   ─────► Folder (JsInterface)
     │                          │
     │ implements               │ implements
     ▼                          ▼
DefaultFile          ─────► DefaultFolder
```

### IFolder extends IFile

```typescript
// layer3/IFolder.interface.ts
import type { IFile } from './IFile.interface.js';
import type { Collection } from './Collection.interface.js';

export interface IFolder extends IFile {
  readonly children: Collection<IFile>;
  childAdd(child: IFile): void;
  childRemove(child: IFile): boolean;
  childGet(uuid: string): IFile | null;
}
```

### Folder extends File

```typescript
// layer3/Folder.ts
import { File } from './File.js';
import type { IFolder } from './IFolder.interface.js';
import type { Collection } from './Collection.interface.js';

/**
 * Folder - Runtime interface for folder components
 * 
 * Extends File (which implements IFile) and implements IFolder.
 */
export abstract class Folder extends File implements IFolder {
  abstract get children(): File[];  // Runtime type: File (JsInterface)
  abstract get childReferences(): Collection<File>;
  abstract childAdd(child: File): void;
  abstract childRemove(child: File): boolean;
  abstract childGet(uuid: string): File | null;
}
```

### DefaultFolder implements Folder

```typescript
// layer2/DefaultFolder.ts
export class DefaultFolder extends UcpComponent<FolderModel> 
  implements Container<File>, File, Folder {
  
  static start(): void {
    super.start();
    File.implementationRegister(DefaultFolder);
    Folder.implementationRegister(DefaultFolder);
  }
  
  get isFile(): boolean { return true; }   // A folder IS a file
  get isFolder(): boolean { return true; } // And it's a folder
  
  // ... Folder-specific implementations
}
```

---

## Model Alignment

The model interface should align with the JsInterface contract:

### FileModel matches IFile properties

```typescript
// layer3/FileModel.interface.ts
export interface FileModel extends Model {
  // IFile.path
  path: string;
  
  // IFile.name (via Model.name)
  // name: string; — inherited from Model
  
  // IFile.uuid (via Model.uuid)
  // uuid: string; — inherited from Model
  
  // File-specific (not in IFile)
  filename: string;
  mimetype: string;
  size: number;
  // ...
}
```

### Type Safety Chain

```
IFile.model: Model           ← base type
File.model: Model            ← abstract, same as interface
DefaultFile.model: FileModel ← concrete, covariant return

TypeScript allows: FileModel extends Model
So: DefaultFile.model returns FileModel, satisfies File.model: Model
```

---

## Complete Example: Image with RelatedObjects

```typescript
// Image component stores its file reference
class DefaultImage extends UcpComponent<ImageModel> {
  private imageFile: File | null = null;
  
  async loadFromFile(file: File): Promise<void> {
    this.imageFile = file;
    
    // Register in RelatedObjects — File exists at runtime!
    this.relatedObjectRegister(File, file);
    
    // Load content via file's model
    const blob = (file.model as FileModel).content;
    this.model.imageData = await this.blobToDataUrl(blob);
  }
  
  // Later, retrieve the file
  getFile(): File | null {
    return this.relatedObjectLookupFirst(File);
  }
}

// Usage
const image = new DefaultImage();
await image.loadFromFile(someFile);

// Query implementations
const fileImpls = File.implementations;  // [DefaultFile, DefaultFolder]
const folderImpls = Folder.implementations;  // [DefaultFolder]
```

---

## Checklist: Creating a New JsInterface

### 1. Create TypeScript Interface (`IXxx.interface.ts`)

```
- [ ] File: layer3/IXxx.interface.ts
- [ ] Extends: relevant base interface or none
- [ ] Properties: all readonly properties defined
- [ ] Methods: all method signatures defined
- [ ] No implementation details
```

### 2. Create JsInterface Class (`Xxx.ts`)

```
- [ ] File: layer3/Xxx.ts
- [ ] extends JsInterface
- [ ] implements IXxx
- [ ] All members abstract
- [ ] Model property returns base type (for covariance)
- [ ] Uses runtime types (Xxx, not IXxx) in parameters
```

### 3. Create Implementation (`DefaultXxx.ts`)

```
- [ ] File: layer2/DefaultXxx.ts
- [ ] extends UcpComponent<XxxModel>
- [ ] implements Xxx (the JsInterface, not IXxx)
- [ ] static start() calls Xxx.implementationRegister(DefaultXxx)
- [ ] All abstract methods implemented
- [ ] Model getter returns XxxModel (covariant)
```

### 4. Create Model Interface (`XxxModel.interface.ts`)

```
- [ ] File: layer3/XxxModel.interface.ts
- [ ] extends Model
- [ ] Properties align with IXxx interface
- [ ] File-specific properties added
```

---

## Anti-Patterns

### ❌ WRONG: Implementing TS interface directly

```typescript
// BAD: TS interface erased at runtime, can't use for RelatedObjects
class DefaultFile implements IFile {
  // ...
}

// This fails at runtime:
image.relatedObjectRegister(IFile, file);  // IFile doesn't exist!
```

### ❌ WRONG: Abstract class without JsInterface

```typescript
// BAD: No implementation registry
abstract class File {
  abstract get path(): string;
}

// Can't do:
File.implementations  // Property doesn't exist
```

### ❌ WRONG: Using TS interface type in JsInterface

```typescript
// BAD: IFile doesn't exist at runtime
abstract class File extends JsInterface {
  abstract parentSet(parent: IFile | null): void;  // ❌ IFile erased!
}

// GOOD: Use runtime type
abstract class File extends JsInterface {
  abstract parentSet(parent: File | null): void;  // ✅ File exists at runtime
}
```

---

## Benefits

1. **Compile-time safety**: TypeScript interface enforces contract
2. **Runtime existence**: JsInterface class exists in JavaScript
3. **Implementation registry**: `File.implementations` returns all implementing classes
4. **RelatedObjects compatibility**: Can use `File` as key in registrations
5. **Type covariance**: Implementations can return more specific types
6. **DRY**: Interface defined once, enforced at compile-time, exists at runtime

---

## Dual Links

- **This Pattern**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/web4-jsinterface-pattern.md) | [§/.../web4-jsinterface-pattern.md](./web4-jsinterface-pattern.md)
- **P35 Details**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/web4-principles-details.md#principle-35-jsinterface-for-runtime-interfaces) | [§/.../web4-principles-details.md](./web4-principles-details.md#principle-35-jsinterface-for-runtime-interfaces)
- **JsInterface.ts**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/src/ts/layer3/JsInterface.ts) | [§/.../layer3/JsInterface.ts](../src/ts/layer3/JsInterface.ts)
- **File/Folder PDCA**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/2025-12-22-UTC-1100.file-folder-inheritance.pdca.md) | [§/.../file-folder-inheritance.pdca.md](./2025-12-22-UTC-1100.file-folder-inheritance.pdca.md)

---

**"TypeScript erases interfaces. JsInterface makes them real."** 🏛️

