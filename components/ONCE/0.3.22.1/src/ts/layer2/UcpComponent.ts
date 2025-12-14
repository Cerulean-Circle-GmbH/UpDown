/**
 * UcpComponent.ts - Abstract Base for All Web4 Components
 * 
 * All generated Web4 components extend this base class.
 * Provides lifecycle management and view delegation via UcpController.
 * Integrates with Unit for scenario storage.
 * Uses UcpModel for reactive model updates with change tracking.
 * 
 * Web4 Principles:
 * - P4: Radical OOP
 * - P5: Reference<T> for nullable
 * - P6: Empty constructor
 * - P7: Async in Layer 4 only
 * - P16: TypeScript accessors
 * 
 * @ior ior:esm:/ONCE/{version}/UcpComponent
 * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
 * @pdca 2025-12-12-UTC-2300.i9-1-ucpmodel-class.pdca.md
 */

import { UcpController } from './UcpController.js';
import { TypeDescriptor } from '../layer3/TypeDescriptor.js';
import { UcpModel } from '../layer3/UcpModel.js';
import { View } from '../layer3/View.interface.js';
import { Reference } from '../layer3/Reference.interface.js';
import type { Model } from '../layer3/Model.interface.js';
import type { UnitModel } from '../layer3/UnitModel.interface.js';
import type { UnitReference } from '../layer3/UnitReference.interface.js';
import type { Storage } from '../layer3/Storage.interface.js';

/**
 * UcpComponent - Abstract base class for all Web4 components
 * 
 * Hierarchy: Component interface → UcpComponent → DefaultXxx implementations
 * 
 * Features:
 * - Lifecycle management (init, start, stop, hibernate)
 * - View delegation via UcpController
 * - Scenario serialization
 * - Unit-based scenario storage integration
 * 
 * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
 */
export abstract class UcpComponent<TModel extends Model> {
  
  // ═══════════════════════════════════════════════════════════════
  // Static Type Descriptor - MDA MOF Runtime Metadata
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Static type descriptor - runtime metadata about this class
   * Set by TypeRegistry or static start() when class is loaded
   */
  static type: TypeDescriptor;
  
  /**
   * Static start method - called when class is loaded
   * Initializes type descriptor and registers with TypeRegistry
   */
  static start(): void {
    if (!this.type) {
      this.type = new TypeDescriptor().init({ name: this.name });
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Instance Properties
  // ═══════════════════════════════════════════════════════════════
  
  /** UcpModel wrapper - manages reactive model with change tracking */
  private ucpModel: Reference<UcpModel<TModel>> = null;
  
  /** Controller for view management */
  protected controller: UcpController<TModel>;
  
  /** Storage instance for scenario persistence */
  protected storage: Reference<Storage> = null;
  
  /**
   * Empty constructor - Web4 Principle 6
   */
  constructor() {
    this.controller = new UcpController<TModel>();
  }
  
  /**
   * Initialize component with scenario (async version)
   * 
   * Flow:
   * 1. Get raw model from modelDefault() or scenario
   * 2. Wrap in UcpModel for reactive updates
   * 3. UcpModel.model (proxy) triggers viewsUpdateAll() on set
   * 
   * @param scenario Optional initial scenario
   * @returns this for chaining
   */
  async init(scenario?: { model?: TModel }): Promise<this> {
    return this.initSync(scenario);
  }
  
  /**
   * Synchronous initialization - for constructor-based legacy patterns
   * 
   * @param scenario Optional initial scenario
   * @returns this for chaining
   */
  initSync(scenario?: { model?: TModel }): this {
    // Skip if already initialized
    if (this.ucpModel !== null) {
      // Merge scenario model if provided
      if (scenario?.model) {
        Object.assign(this.ucpModel.model, scenario.model);
      }
      return this;
    }
    
    const rawModel = scenario?.model ?? this.modelDefault();
    
    // Create UcpModel wrapper with view update callback
    this.ucpModel = new UcpModel<TModel>().init(
      rawModel,
      this.controller.viewsUpdateAll.bind(this.controller)
    );
    
    // Initialize controller with UcpModel
    this.controller.initWithUcpModel(this.ucpModel);
    
    return this;
  }
  
  /**
   * Override to provide default model
   * Called when no scenario provided to init()
   * Returns RAW model - will be wrapped in UcpModel by init()
   */
  protected abstract modelDefault(): TModel;
  
  // ═══════════════════════════════════════════════════════════════
  // MODEL ACCESSORS (via UcpModel)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * PUBLIC: Get proxied model
   * 
   * Assignments trigger IMMEDIATE view updates:
   *   this.model.state = LifecycleState.RUNNING  // → views re-render
   * 
   * Returns null if component not initialized (for backward compatibility)
   */
  get model(): TModel {
    if (this.ucpModel === null) {
      // Backward compatibility: return null before init() is called
      // Code accessing model before init() should check for null
      return null as unknown as TModel;
    }
    return this.ucpModel.model;
  }
  
  /**
   * Check if UcpModel is initialized
   */
  get hasModel(): boolean {
    return this.ucpModel !== null;
  }
  
  /**
   * PROTECTED: Get raw model (bypass view updates)
   * 
   * Assignments are TRACKED but do NOT trigger immediate updates:
   *   this.value.state = LifecycleState.RUNNING  // → tracked, no re-render
   * 
   * Use for:
   * - Batch operations (many property changes)
   * - Internal state tracking
   * - Performance-critical code
   * 
   * Call this.commit() after batch is complete.
   */
  protected get value(): TModel {
    if (this.ucpModel === null) {
      // Backward compatibility: return null before init() is called
      return null as unknown as TModel;
    }
    return this.ucpModel.value;
  }
  
  /**
   * Get accumulated changes (for inspection/debugging)
   * Shows which properties were changed via this.value since last commit
   */
  get updateObject(): Partial<TModel> {
    return this.ucpModel?.updateObject ?? {};
  }
  
  /**
   * Check if model has uncommitted changes
   * True when updateObject has any keys
   */
  get isDirty(): boolean {
    return this.ucpModel?.isDirty ?? false;
  }
  
  /**
   * Commit all tracked changes
   * 
   * 1. Updates all views (sync)
   * 2. Notifies PersistenceManagers via RelatedObjects
   * 3. Empties updateObject
   * 
   * Call after using this.value for batch operations.
   */
  commit(): void {
    this.ucpModel?.commit();
  }
  
  /**
   * Discard uncommitted changes
   */
  rollback(): void {
    this.ucpModel?.rollback();
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Unit Integration - Scenario Storage
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Set storage instance for scenario persistence
   * @param storage Storage implementation
   */
  storageSet(storage: Storage): void {
    this.storage = storage;
  }
  
  /**
   * Get index path for this component's scenario
   * Returns null if model doesn't extend UnitModel
   */
  get indexPath(): Reference<string> {
    const unitModel = this.model as unknown as UnitModel;
    return unitModel?.indexPath || null;
  }
  
  /**
   * Get references for this component's scenario
   * Returns empty array if model doesn't extend UnitModel
   */
  get references(): UnitReference[] {
    const unitModel = this.model as unknown as UnitModel;
    return unitModel?.references || [];
  }
  
  // ═══════════════════════════════════════════════════════════════
  // View Management - Delegated to UcpController
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Register a view for model updates
   * Delegates to UcpController
   * @param view View to register
   */
  viewRegister(view: View<TModel>): void {
    this.controller.viewRegister(view);
  }
  
  /**
   * Unregister a view
   * @param view View to unregister
   */
  viewUnregister(view: View<TModel>): void {
    this.controller.viewUnregister(view);
  }
  
  /**
   * Update all registered views - SYNCHRONOUS!
   * Delegates to UcpController
   */
  viewsUpdateAll(): void {
    this.controller.viewsUpdateAll();
  }
  
  /**
   * Receive scenario from WebSocket
   * Entry point from Layer 4 (async) into Layer 2 (sync)
   * @param scenario Incoming scenario
   */
  scenarioReceive(scenario: { model?: TModel }): void {
    this.controller.scenarioReceive(scenario);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Lifecycle & Serialization
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Hibernate component to scenario
   * Subclasses can override with more specific types
   * @returns Scenario representing current state
   */
  async toScenario(): Promise<any> {
    return {
      ior: this.iorGet(),
      owner: 'system',
      model: this.model
    };
  }
  
  /**
   * Hibernate component to storage
   * Saves scenario to index with symlinks
   * @param symlinkPaths Paths for symlinks (type/domain/capability)
   */
  async hibernate(symlinkPaths: string[] = []): Promise<void> {
    if (!this.storage) {
      console.warn('[UcpComponent] No storage configured, skipping hibernate');
      return;
    }
    
    const scenario = await this.toScenario();
    const uuid = scenario.ior?.uuid;
    
    if (!uuid) {
      console.error('[UcpComponent] Cannot hibernate: missing UUID in scenario');
      return;
    }
    
    await this.storage.scenarioSave(uuid, scenario, symlinkPaths);
  }
  
  /**
   * Restore component from storage
   * Loads scenario from index by UUID
   * @param uuid UUID of scenario to restore
   */
  async restore(uuid: string): Promise<this> {
    if (!this.storage) {
      throw new Error('[UcpComponent] No storage configured');
    }
    
    const scenario = await this.storage.scenarioLoad<TModel>(uuid);
    return this.init(scenario as { model?: TModel });
  }
  
  /**
   * Get IOR for this component
   * Override in subclass to provide actual IOR
   */
  protected iorGet(): any {
    return {
      uuid: 'unknown',
      component: this.constructor.name,
      version: '0.0.0.0'
    };
  }
}

