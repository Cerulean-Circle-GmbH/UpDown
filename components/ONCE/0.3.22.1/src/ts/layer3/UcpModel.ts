/**
 * UcpModel.ts - Reactive Model Wrapper with Change Tracking
 * 
 * Wraps a component model in a JavaScript Proxy for reactive view updates.
 * 
 * Provides two accessors:
 * - model (proxy): Assignments trigger immediate view + persistence updates
 * - value (raw): Assignments tracked in updateObject, no immediate update
 * 
 * Change Tracking:
 * - updateObject accumulates changes made via this.value
 * - isDirty = true when updateObject has any keys
 * - commit() triggers views + persistence, then empties updateObject
 * 
 * Web4 Principles:
 * - P4: Radical OOP (no arrow functions)
 * - P5: Reference<T> for nullable
 * - P6: Empty constructor
 * - P7: Layer 3 is SYNCHRONOUS
 * 
 * @layer3
 * @ior ior:esm:/ONCE/{version}/UcpModel
 * @pdca 2025-12-12-UTC-2300.i9-1-ucpmodel-class.pdca.md
 */

import type { Reference } from './Reference.interface.js';

/**
 * UcpModel<T> - Reactive model wrapper
 * 
 * Usage:
 *   const ucpModel = new UcpModel<MyModel>().init(rawModel, updateCallback);
 *   ucpModel.model.state = 'RUNNING';  // Triggers immediate updates
 *   ucpModel.value.count = 5;          // Tracked, no update until commit()
 */
export class UcpModel<T extends object> {
  
  /** The raw underlying model data */
  private rawModel!: T;
  
  /** Proxy wrapper that triggers immediate updates */
  private proxyModel!: T;
  
  /** Proxy for value access that tracks changes without triggering updates */
  private valueProxy!: T;
  
  /** Tracks changes made via this.value - keys are changed property names */
  private updateObjectInternal: Partial<T> = {};
  
  /** Callback for view updates (from UcpController.viewsUpdateAll) */
  private viewUpdateCallback!: () => void;
  
  /** Callback for persistence (from RelatedObjects PersistenceManager lookup) */
  private persistenceCallback: Reference<() => void> = null;
  
  /**
   * Empty constructor - Web4 Principle 6
   */
  constructor() {
    // Empty - initialization via init()
  }
  
  /**
   * Initialize with model and callbacks
   * @param model Raw model from modelDefault() or scenario
   * @param onViewUpdate Callback to viewsUpdateAll()
   * @returns this for chaining
   */
  init(model: T, onViewUpdate: () => void): this {
    this.rawModel = model;
    this.viewUpdateCallback = onViewUpdate;
    this.proxyModel = this.modelProxyCreate(model);
    this.valueProxy = this.valueProxyCreate(model);
    this.updateObjectInternal = {};
    return this;
  }
  
  /**
   * Set persistence callback (from RelatedObjects PersistenceManager lookup)
   * @param callback Function to call for persistence
   */
  persistenceCallbackSet(callback: () => void): void {
    this.persistenceCallback = callback;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // PUBLIC ACCESSORS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get the proxied model (PUBLIC accessor)
   * 
   * Assignments trigger IMMEDIATE view + persistence updates:
   *   this.model.state = LifecycleState.RUNNING  // → views re-render NOW
   * 
   * Reading returns underlying value:
   *   const state = this.model.state  // → reads from rawModel
   */
  get model(): T {
    return this.proxyModel;
  }
  
  /**
   * Get the value proxy (PROTECTED accessor - for internal batch operations)
   * 
   * Assignments are TRACKED but don't trigger updates:
   *   this.value.state = LifecycleState.RUNNING  
   *   // → updateObject = { state: RUNNING }, no re-render
   * 
   * Use for batch operations or internal state changes.
   * Call commit() to trigger updates and clear updateObject.
   */
  get value(): T {
    return this.valueProxy;
  }
  
  /**
   * Get the accumulated changes (read-only copy)
   * Shows which properties were changed via this.value since last commit
   */
  get updateObject(): Partial<T> {
    return { ...this.updateObjectInternal };
  }
  
  /**
   * Check if model has uncommitted changes
   * isDirty = updateObject has any keys
   */
  get isDirty(): boolean {
    return Object.keys(this.updateObjectInternal).length > 0;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // COMMIT / ROLLBACK
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Commit all tracked changes
   * 
   * 1. Trigger view updates (sync - Layer 5)
   * 2. Trigger persistence (via RelatedObjects PersistenceManagers)
   * 3. Empty updateObject
   */
  commit(): void {
    if (!this.isDirty) {
      return;  // Nothing to commit
    }
    
    // 1. Update all views (SYNCHRONOUS)
    this.viewUpdateCallback();
    
    // 2. Notify persistence managers (if configured)
    if (this.persistenceCallback) {
      this.persistenceCallback();
    }
    
    // 3. Clear updateObject - all changes committed
    this.updateObjectInternal = {};
  }
  
  /**
   * Discard all uncommitted changes
   * Note: The rawModel already has the values - this just clears the tracking
   */
  rollback(): void {
    this.updateObjectInternal = {};
  }
  
  // ═══════════════════════════════════════════════════════════════
  // MERGE OPERATIONS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Merge scenario into model (triggers immediate updates)
   * Used when receiving scenario from WebSocket
   * @param partial Partial model to merge
   */
  merge(partial: Partial<T>): void {
    Object.assign(this.proxyModel, partial);
  }
  
  /**
   * Merge scenario silently (tracked, no immediate update)
   * Use for batch loading from scenarios
   * @param partial Partial model to merge
   */
  mergeSilent(partial: Partial<T>): void {
    Object.assign(this.valueProxy, partial);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // PRIVATE: PROXY CREATION
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Create proxy wrapper for model access (triggers immediate updates)
   * @param model Raw model to wrap
   * @returns Proxied model
   */
  private modelProxyCreate(model: T): T {
    const ucpModel = this;
    
    return new Proxy(model, {
      set: function(target, property, value) {
        const key = property as keyof T;
        (target as Record<keyof T, unknown>)[key] = value;
        
        // Clear any pending change for this property (immediate update supersedes)
        delete ucpModel.updateObjectInternal[key];
        
        // Trigger immediate updates
        ucpModel.viewUpdateCallback();  // SYNCHRONOUS!
        if (ucpModel.persistenceCallback) {
          ucpModel.persistenceCallback();
        }
        
        return true;
      },
      get: function(target, property) {
        return (target as Record<string | symbol, unknown>)[property];
      }
    });
  }
  
  /**
   * Create proxy wrapper for value access (tracks changes, no update)
   * @param model Raw model to wrap
   * @returns Proxied model for silent access
   */
  private valueProxyCreate(model: T): T {
    const ucpModel = this;
    
    return new Proxy(model, {
      set: function(target, property, value) {
        const key = property as keyof T;
        (target as Record<keyof T, unknown>)[key] = value;
        
        // Track the change in updateObject
        ucpModel.updateObjectInternal[key] = value;
        
        // NO update triggered - caller must call commit()
        return true;
      },
      get: function(target, property) {
        return (target as Record<string | symbol, unknown>)[property];
      }
    });
  }
}






