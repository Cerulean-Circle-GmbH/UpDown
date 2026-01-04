# Web4 ISR: Lazy Load Pattern

**Internet Object Reference Self-Replacement (ISR)**  
**Updated:** 2026-01-01

> "References resolve themselves. Layer 4 awaits. Layers 2/3 assume resolved."

## Recent Updates (2026-01-01)

- ✅ `IOR.resolveAndReplace()` now has try/catch for fire-and-forget mode
- ✅ Fire-and-forget errors are logged, not thrown (build continues)
- ✅ Static ESM imports in `UcpModel.ts` (P20 compliance)

## Core Concept

```
┌──────────────────────────────────────────────────────────────────┐
│                       ISR LIFECYCLE                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Model Load          One-Layer Prefetch        Ready State      │
│   ──────────          ─────────────────         ───────────      │
│                                                                  │
│   children: [         children: [               children: [      │
│     "ior:...",          IOR<FileJs>,              DefaultFile,   │
│     "ior:...",          IOR<FileJs>,              DefaultFolder, │
│     "ior:..."           IOR<FileJs>               DefaultFile    │
│   ]                   ]                         ]                │
│                                                                  │
│   ┌─────────┐        ┌─────────────┐           ┌────────────┐   │
│   │ STRINGS │───────►│ IOR OBJECTS │──────────►│ INSTANCES  │   │
│   └─────────┘        └─────────────┘           └────────────┘   │
│                       (resolving...)             (ready!)        │
│                                                                  │
│   isResolved: false   isResolving: true         isResolved: true │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## The Problem: children vs childReferences

Before ISR, we needed two properties:

```typescript
// ❌ DUPLICATION (current transitional state)
interface Folder extends File {
  readonly children: File[];           // Resolved only (filtered)
  readonly childReferences: Collection<File>;  // Raw (may have IORs)
}
```

With ISR fully implemented:

```typescript
// ✅ DRY (target state)
interface Folder extends File {
  readonly children: Collection<File>;  // ISR handles resolution
}
```

## Resolution State Tracking

### UcpModel tracks resolution state

```typescript
// layer3/UcpModel.ts
export class UcpModel<T extends Model> {
  
  /** True if all LazyReference<T> properties are resolved to instances */
  get isResolved(): boolean {
    return this.unresolvedCount === 0;
  }
  
  /** True if resolution is in progress */
  get isResolving(): boolean {
    return this.pendingResolutions > 0;
  }
  
  /** Number of unresolved references (strings or IOR objects) */
  private unresolvedCount: number = 0;
  
  /** Number of pending async resolutions */
  private pendingResolutions: number = 0;
  
  /** Promise that resolves when all references are resolved */
  awaitResolved(): Promise<void> {
    if (this.isResolved) return Promise.resolve();
    return new Promise(resolve => {
      this.onResolved = resolve;
    });
  }
}
```

### Layer 4 awaits, Layers 2/3 assume resolved

```typescript
// layer4/FolderOrchestrator.ts — ASYNC
export class FolderOrchestrator {
  
  async loadFolder(ior: string): Promise<DefaultFolder> {
    // 1. Load the folder scenario
    const folder = await IOR.load<DefaultFolder>(ior);
    
    // 2. Await one-layer prefetch (children become instances)
    await folder.model.awaitResolved();
    
    // 3. Now safe to return — children are resolved
    return folder;
  }
}

// layer2/DefaultFolder.ts — SYNC (assumes resolved)
export class DefaultFolder {
  
  // Safe: Layer 4 awaited resolution before calling
  get children(): Collection<FileJs> {
    return this.model.children;  // All instances, no strings
  }
  
  // Safe: Can iterate without checking types
  childFindByName(name: string): FileJs | null {
    for (const child of this.children) {
      if (child.name === name) return child;  // child IS a FileJs
    }
    return null;
  }
}
```

## Example: `<folder-over-view>` Component

### View Layer (Layer 5)

```typescript
// layer5/views/FolderOverView.ts
export class FolderOverView extends View<FolderModel> {
  
  render(): string {
    // View receives RESOLVED model — can safely iterate
    return `
      <folder-over-view>
        ${this.model.children.map(child => `
          <file-item-view uuid="${child.uuid}">
            ${child.name}
          </file-item-view>
        `).join('')}
      </folder-over-view>
    `;
  }
}
```

### Controller Layer (Layer 2)

```typescript
// layer2/UcpController.ts
export class UcpController<T extends Model> {
  
  /** Render view — model MUST be resolved */
  render(): void {
    if (!this.model.isResolved) {
      throw new Error('Cannot render: model not resolved. Use await model.awaitResolved() in Layer 4');
    }
    this.view.render();
  }
}
```

### Orchestrator Layer (Layer 4)

```typescript
// layer4/FolderOrchestrator.ts
export class FolderOrchestrator {
  
  async openFolder(folder: DefaultFolder): Promise<void> {
    // 1. Ensure model is resolved (one-layer prefetch)
    await folder.model.awaitResolved();
    
    // 2. Now safe to render
    folder.controller.render();
    
    // 3. Selecting a child triggers NEXT level of prefetch
    const selectedChild = folder.children[0];
    if (selectedChild?.isFolder) {
      await (selectedChild as DefaultFolder).model.awaitResolved();
      selectedChild.controller.render();
    }
  }
}
```

## Self-Replacing References

### How ISR works in `Collection<T>`

```typescript
// layer3/Collection.interface.ts
export interface Collection<T> extends Array<LazyReference<T>> {
  /** Access triggers ISR */
  [index: number]: LazyReference<T>;
}

// LazyReference<T> can be:
// - string: "ior:esm:/ONCE/0.3.22.1/DefaultFile/uuid-123"
// - IOR<T>: Object with pending resolution
// - T: Resolved instance (DefaultFile, DefaultFolder, etc.)
```

### UcpModel Proxy triggers resolution

```typescript
// layer3/UcpModel.ts
const handler: ProxyHandler<T> = {
  get(target, prop) {
    const value = target[prop as keyof T];
    
    // If it's an IOR string, start resolution
    if (typeof value === 'string' && value.startsWith('ior:')) {
      this.startResolution(prop, value);
      return this.getIORObject(value);  // Return IOR object (resolving)
    }
    
    // If it's a Collection, wrap with ISR proxy
    if (Array.isArray(value)) {
      return this.wrapCollection(value);
    }
    
    return value;
  }
};
```

## Resolution Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      RESOLUTION FLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. LOAD SCENARIO                                                   │
│     ─────────────                                                   │
│     IOR.load("ior:esm:/Folder/uuid") → Scenario JSON                │
│                                                                     │
│  2. CREATE INSTANCE                                                 │
│     ───────────────                                                 │
│     DefaultFolder created with model.children = ["ior:...", ...]    │
│     model.isResolved = false                                        │
│     model.unresolvedCount = 3                                       │
│                                                                     │
│  3. ONE-LAYER PREFETCH (automatic)                                  │
│     ──────────────────                                              │
│     For each IOR string in model:                                   │
│       - Start async resolution                                      │
│       - Replace string with IOR object (tracking resolution)        │
│       - model.pendingResolutions++                                  │
│                                                                     │
│  4. RESOLUTION COMPLETE                                             │
│     ────────────────────                                            │
│     Each IOR resolves → replaces itself with instance               │
│     model.pendingResolutions--                                      │
│     model.unresolvedCount--                                         │
│     When unresolvedCount === 0 → model.isResolved = true            │
│     onResolved callback fires                                       │
│                                                                     │
│  5. READY FOR SYNC ACCESS                                           │
│     ──────────────────────                                          │
│     Layer 4 awaited → model.awaitResolved()                         │
│     Layer 2/3 can now safely access model.children as instances     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Principles

| Principle | Description |
|-----------|-------------|
| **One-Layer Prefetch** | When an instance is created, immediate children are prefetched |
| **Layer 4 Awaits** | Async orchestrators await `model.awaitResolved()` before proceeding |
| **Layer 2/3 Assumes Resolved** | Sync code can safely assume references are instances |
| **Self-Replacement** | IOR objects replace themselves with instances in the model |
| **View Gets Resolved** | Views always receive fully resolved models |

## Anti-Patterns

### ❌ WRONG: Assuming resolved in Layer 2 without Layer 4 await

```typescript
// layer2/DefaultFolder.ts
childFindByName(name: string): FileJs | null {
  for (const child of this.model.children) {
    // ❌ CRASH: child might be a string!
    if (child.name === name) return child;
  }
}
```

### ✅ CORRECT: Layer 4 ensures resolution

```typescript
// layer4/FolderOrchestrator.ts
async findChildByName(folder: DefaultFolder, name: string): Promise<FileJs | null> {
  await folder.model.awaitResolved();  // Ensure resolved
  return folder.childFindByName(name);  // Now safe
}
```

### ❌ WRONG: Filtering in getter (current workaround)

```typescript
// layer2/DefaultFolder.ts
get children(): FileJs[] {
  // ❌ WORKAROUND: Filtering every time
  return this.model.children.filter(c => c instanceof FileJs);
}
```

### ✅ CORRECT: Trust ISR, return Collection

```typescript
// layer2/DefaultFolder.ts
get children(): Collection<FileJs> {
  // ✅ ISR guarantees resolution after Layer 4 await
  return this.model.children;
}
```

## Related Patterns

### Guard Pattern for Sync Methods

Sync methods use `guardReady()` to gracefully skip execution when not resolved:

```typescript
open(): this {
  if (!this.guardReady()) return this;  // Skip if not ready
  this.model.isOpen = true;
  return this;
}
```

**See**: [§/.../web4-lazy-load-save-guard-pattern.md](./web4-lazy-load-save-guard-pattern.md)

---

## Dual Links

- **Guard Pattern**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/web4-lazy-load-save-guard-pattern.md) | [§/.../web4-lazy-load-save-guard-pattern.md](./web4-lazy-load-save-guard-pattern.md)
- **PDCA**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/2025-12-22-UTC-1500.isr-resolution-tracking.pdca.md) | [§/.../isr-resolution-tracking.pdca.md](./2025-12-22-UTC-1500.isr-resolution-tracking.pdca.md)
- **UcpModel.ts**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/src/ts/layer3/UcpModel.ts) | [§/.../layer3/UcpModel.ts](../src/ts/layer3/UcpModel.ts)
- **JsInterface Pattern**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/web4-jsinterface-pattern.md) | [§/.../web4-jsinterface-pattern.md](./web4-jsinterface-pattern.md)

---

**"Layer 4 awaits resolution. Layer 2/3 trusts it. Views render instances."** 🏛️

