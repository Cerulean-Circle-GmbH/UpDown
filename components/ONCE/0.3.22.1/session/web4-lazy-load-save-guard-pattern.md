# Web4: Lazy Load/Save Guard Pattern

**"Methods always work. When not ready, they do nothing gracefully."**

> Radical OOP: Methods return `this`, work on model, and guard against unresolved state.

## Core Concept

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LAZY LOAD/SAVE GUARD                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   User Action          Guard Check           Result                 │
│   ───────────          ───────────           ──────                 │
│                                                                     │
│   Click "Open"    →    isReady?    →    YES: Execute method         │
│                                    →    NO:  Log warning, return this│
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  // Pattern: First line of every sync method                │   │
│   │  if (!this.guardReady()) return this;                       │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   UI NEVER BLOCKS — Methods gracefully degrade until ready          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## The Guard Method

### UcpComponent.guardReady()

```typescript
// layer2/UcpComponent.ts
export abstract class UcpComponent<TModel extends Model> {
  
  /**
   * Guard for sync methods — returns false if not ready
   * 
   * Usage: First line of every sync Layer 1/2/5 method
   * 
   * @example
   * ```typescript
   * open(): this {
   *   if (!this.guardReady()) return this;
   *   // ... actual implementation
   *   return this;
   * }
   * ```
   * 
   * @returns true if ready (resolved), false if not ready (logs warning)
   */
  protected guardReady(): boolean {
    if (!this.model.isResolved) {
      console.warn(
        `[${this.constructor.name}] Method called before resolution complete. ` +
        `Skipping execution. await model.awaitResolved() in Layer 4.`
      );
      return false;
    }
    return true;
  }
  
  /**
   * Guard for view methods — can be called from View or UcpController
   * 
   * @returns true if model is resolved and ready for rendering
   */
  get isReady(): boolean {
    return this.model.isResolved;
  }
}
```

### UcpModel.isResolved

```typescript
// layer3/UcpModel.ts
export class UcpModel<T extends Model> {
  
  /** True if all LazyReference properties are resolved to instances */
  get isResolved(): boolean {
    return this.unresolvedCount === 0;
  }
}
```

## Pattern: Methods Return `this`

### Radical OOP Chaining

```typescript
// Every sync method returns this for chaining
folder
  .open()           // if not ready: logs, returns this
  .selectChild(0)   // if not ready: logs, returns this  
  .expand();        // if not ready: logs, returns this

// When ready, all execute. When not ready, all gracefully skip.
```

### Method Template

```typescript
// layer2/DefaultFolder.ts
export class DefaultFolder extends UcpComponent<FolderModel> {
  
  /**
   * Open this folder for browsing
   * 
   * Pattern: guardReady() → work on model → return this
   */
  open(): this {
    if (!this.guardReady()) return this;
    
    this.model.isOpen = true;
    this.model.modifiedAt = Date.now();
    
    return this;
  }
  
  /**
   * Select a child by index
   */
  selectChild(index: number): this {
    if (!this.guardReady()) return this;
    
    if (index >= 0 && index < this.model.children.length) {
      this.model.selectedIndex = index;
    }
    
    return this;
  }
  
  /**
   * Expand to show children
   */
  expand(): this {
    if (!this.guardReady()) return this;
    
    this.model.isExpanded = true;
    
    return this;
  }
  
  /**
   * Collapse to hide children
   */
  collapse(): this {
    if (!this.guardReady()) return this;
    
    this.model.isExpanded = false;
    
    return this;
  }
}
```

## View Integration

### FolderOverView uses isReady

```typescript
// layer5/views/FolderOverView.ts
export class FolderOverView extends View<FolderModel> {
  
  render(): string {
    // Guard: Show loading state if not ready
    if (!this.component.isReady) {
      return `
        <folder-over-view class="loading">
          <loading-spinner></loading-spinner>
          <p>Loading folder...</p>
        </folder-over-view>
      `;
    }
    
    // Ready: Render full content
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
  
  /**
   * Handle click — safe to call anytime
   * 
   * If not ready, component methods will gracefully skip
   */
  onClick(event: Event): void {
    const target = event.target as HTMLElement;
    const uuid = target.getAttribute('uuid');
    
    if (uuid) {
      // Safe: guardReady() inside selectChildByUuid()
      this.component.selectChildByUuid(uuid);
    }
  }
}
```

### Custom Element with Reactive Updates

```typescript
// layer5/elements/FolderOverViewElement.ts
export class FolderOverViewElement extends HTMLElement {
  
  private component: Reference<DefaultFolder> = null;
  
  async connectedCallback(): Promise<void> {
    // 1. Load component (Layer 4 — async)
    const ior = this.getAttribute('ior');
    this.component = await IOR.load<DefaultFolder>(ior);
    
    // 2. Render immediately (may show loading state)
    this.innerHTML = this.component.view.render();
    
    // 3. Re-render when resolved
    this.component.model.awaitResolved().then(() => {
      this.innerHTML = this.component.view.render();
    });
    
    // 4. Subscribe to model changes for reactive updates
    this.component.model.onChange(() => {
      this.innerHTML = this.component.view.render();
    });
  }
}
```

## Flow: Responsive UI

```
┌─────────────────────────────────────────────────────────────────────┐
│                      RESPONSIVE UI FLOW                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   1. USER CLICKS FOLDER                                             │
│      ─────────────────                                              │
│      View calls: component.open()                                   │
│                                                                     │
│   2. GUARD CHECK                                                    │
│      ───────────                                                    │
│      if (!this.guardReady()) return this;                           │
│                                                                     │
│      NOT READY:                     READY:                          │
│      ├─ Log: "Skipping..."          ├─ this.model.isOpen = true     │
│      └─ return this (no-op)         └─ return this                  │
│                                                                     │
│   3. MODEL CHANGE TRIGGERS RE-RENDER                                │
│      ──────────────────────────────                                 │
│      If ready: View shows folder contents                           │
│      If not:   View shows loading spinner                           │
│                                                                     │
│   4. RESOLUTION COMPLETES                                           │
│      ────────────────────                                           │
│      awaitResolved() promise resolves                               │
│      View re-renders with full content                              │
│                                                                     │
│   UI NEVER BLOCKS — EXTREME RESPONSIVENESS                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Save Guard Pattern

### Saving works the same way

```typescript
// layer2/DefaultFolder.ts
export class DefaultFolder extends UcpComponent<FolderModel> {
  
  /**
   * Save folder state
   * 
   * Pattern: guardReady() → serialize model → persist → return this
   */
  save(): this {
    if (!this.guardReady()) return this;
    
    // Trigger async save in background (fire-and-forget)
    this.saveAsync().catch(err => {
      console.error(`[${this.constructor.name}] Save failed:`, err);
    });
    
    return this;
  }
  
  /**
   * Async save implementation (Layer 4)
   */
  private async saveAsync(): Promise<void> {
    await this.model.awaitResolved();  // Ensure all children resolved
    await IOR.save(this.toScenario());
  }
}
```

### Chained Save

```typescript
// View event handler
onSave(): void {
  this.component
    .updateName(newName)  // if not ready: skip
    .save();              // if not ready: skip
    
  // When ready, both execute and save triggers async persist
}
```

## Anti-Patterns

### ❌ WRONG: Blocking on resolution in sync method

```typescript
// layer2/DefaultFolder.ts
open(): this {
  // ❌ WRONG: Blocking in sync method!
  while (!this.model.isResolved) {
    // Infinite loop in browser!
  }
  this.model.isOpen = true;
  return this;
}
```

### ❌ WRONG: Throwing exception when not ready

```typescript
// layer2/DefaultFolder.ts
open(): this {
  if (!this.model.isResolved) {
    // ❌ WRONG: Breaks UI, requires try-catch everywhere
    throw new Error('Not ready');
  }
  this.model.isOpen = true;
  return this;
}
```

### ❌ WRONG: Returning void or undefined

```typescript
// layer2/DefaultFolder.ts
open(): void {
  // ❌ WRONG: Can't chain, not radical OOP
  if (!this.model.isResolved) return;
  this.model.isOpen = true;
}
```

### ✅ CORRECT: Guard, log, return this

```typescript
// layer2/DefaultFolder.ts
open(): this {
  if (!this.guardReady()) return this;  // ✅ Log warning, return this
  this.model.isOpen = true;
  return this;
}
```

## Key Principles

| Principle | Description |
|-----------|-------------|
| **Methods Return `this`** | Every sync method returns `this` for chaining |
| **Guard First Line** | `if (!this.guardReady()) return this;` |
| **Work on Model** | Methods modify `this.model.*` properties |
| **No Exceptions** | Graceful degradation, not error throwing |
| **Log Warning** | Console warning helps debugging |
| **View Uses `isReady`** | Show loading UI when not ready |
| **Reactive Re-render** | Model changes trigger view updates |

## Integration with ISR

| Pattern | Role |
|---------|------|
| **ISR** (IOR Self-Replacement) | Resolves references in background |
| **Guard** | Skips method execution until resolved |
| **awaitResolved()** | Layer 4 waits for complete resolution |
| **isReady** | View checks before rendering content |
| **onChange** | Re-renders when resolution completes |

## Dual Links

- **ISR Pattern**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/web4-isr-lazy-load-pattern.md) | [§/.../web4-isr-lazy-load-pattern.md](./web4-isr-lazy-load-pattern.md)
- **Resolution Tracking PDCA**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/2025-12-22-UTC-1500.isr-resolution-tracking.pdca.md) | [§/.../isr-resolution-tracking.pdca.md](./2025-12-22-UTC-1500.isr-resolution-tracking.pdca.md)
- **UcpComponent.ts**: [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/src/ts/layer2/UcpComponent.ts) | [§/.../layer2/UcpComponent.ts](../src/ts/layer2/UcpComponent.ts)

---

**"Sync methods never block, never throw. They guard, log, and return this."** 🏛️

