/**
 * Component.ts - Runtime JsInterface for Components
 * 
 * ✅ Web4 Principle 35: JsInterface for Runtime Interfaces
 * 
 * This is the RUNTIME representation of Component.interface.ts.
 * TypeScript interfaces are erased at runtime. Component extends JsInterface
 * to exist at runtime for:
 * - TypeRegistry: runtime type introspection
 * - Implementation lookup: `Component.implementations` → all component classes
 * - RelatedObjects: interface-based lookup
 * 
 * Pattern:
 * - Component.interface.ts: Compile-time contract (ERASED)
 * - Component.ts (this file): Abstract class extends JsInterface
 * - UcpComponent.ts: Base implementation extends Component
 * 
 * @ior ior:esm:/ONCE/{version}/Component
 * @pdca session/2026-01-06-UTC-1600.web4-component-lifecycle.pdca.md
 */

import { JsInterface } from './JsInterface.js';
import { LifecycleState } from './LifecycleState.enum.js';
import type { Model } from './Model.interface.js';
import type { Scenario } from './Scenario.interface.js';
import type { IORModel } from './IORModel.interface.js';
import type { Component as ComponentInterface } from './Component.interface.js';

/**
 * Component - Runtime interface for all Web4 components
 * 
 * Extends JsInterface for runtime type introspection.
 * All UcpComponent subclasses implement this.
 */
export abstract class Component<TModel extends Model = Model> 
extends JsInterface 
implements ComponentInterface<TModel> {
  
  // ═══════════════════════════════════════════════════════════════
  // CLASS LEVEL LIFECYCLE STATE
  // ═══════════════════════════════════════════════════════════════
  
  /** Class-level lifecycle state (static, on constructor function) */
  private static classStateField: LifecycleState = LifecycleState.UNLOADED;
  
  /**
   * Get class lifecycle state
   */
  static get classState(): LifecycleState {
    return this.classStateField;
  }
  
  /**
   * Check if class is started (TypeRegistry + Views + CSS ready)
   */
  static get isStarted(): boolean {
    return this.classStateField === LifecycleState.STARTED;
  }
  
  /**
   * LOAD phase - called when module is imported
   * Loads .type.json metadata
   */
  static load(): void {
    this.classStateField = LifecycleState.LOADING;
    // Subclasses load .type.json here
    this.classStateField = LifecycleState.LOADED;
  }
  
  /**
   * START phase - called after load, before any instances
   * Registers with TypeRegistry, loads Views, applies CSS
   */
  static async start(args?: string[]): Promise<void> {
    if (this.classStateField === LifecycleState.STARTED) return; // Idempotent
    
    this.classStateField = LifecycleState.STARTING;
    
    // Subclasses: TypeRegistry, JsInterface, Views, CSS
    
    this.classStateField = LifecycleState.STARTED;
  }
  
  /**
   * STOP phase - called before unload
   * Unregisters from TypeRegistry
   */
  static stop(): void {
    this.classStateField = LifecycleState.CLASS_STOPPING;
    // Subclasses: unregister Views, TypeRegistry
    this.classStateField = LifecycleState.CLASS_STOPPED;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // INSTANCE LEVEL LIFECYCLE STATE
  // ═══════════════════════════════════════════════════════════════
  
  /** Instance lifecycle state */
  private instanceStateField: LifecycleState = LifecycleState.CREATED;
  
  /**
   * Get instance lifecycle state
   */
  get instanceState(): LifecycleState {
    return this.instanceStateField;
  }
  
  /**
   * Set instance lifecycle state (protected for subclasses)
   */
  protected set instanceState(state: LifecycleState) {
    this.instanceStateField = state;
  }
  
  /**
   * Check if instance is initialized (init() called)
   */
  get isInitialized(): boolean {
    const state = this.instanceStateField;
    return state !== LifecycleState.CREATED && 
           state !== LifecycleState.INITIALIZING;
  }
  
  /**
   * Check if instance is ready (views bound, fully operational)
   */
  get isReady(): boolean {
    return this.instanceStateField === LifecycleState.READY ||
           this.instanceStateField === LifecycleState.RUNNING;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // ABSTRACT MEMBERS (from Component.interface.ts)
  // ═══════════════════════════════════════════════════════════════
  
  /** Interoperable Object Reference */
  abstract get ior(): IORModel;
  
  /** Component model/state */
  abstract get model(): TModel;
  
  /** Initialize component with optional scenario */
  abstract init(scenario?: Scenario<TModel>): this;
  
  /** Convert component state to scenario for persistence */
  abstract toScenario(name?: string): Scenario<TModel>;
  
  // ═══════════════════════════════════════════════════════════════
  // METHOD DISCOVERY (from Component.interface.ts)
  // @pdca 2026-01-04-UTC-1630.cli-path-authority-full-migration.pdca.md CPA.3
  // ═══════════════════════════════════════════════════════════════
  
  /** Check if component has a method */
  abstract hasMethod(name: string): boolean;
  
  /** Get method signature for CLI routing */
  abstract getMethodSignature(name: string): import('./MethodSignature.interface.js').MethodSignature | null;
  
  /** List all available method names */
  abstract listMethods(): string[];
}

