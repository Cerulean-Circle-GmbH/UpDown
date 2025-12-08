/**
 * UcpComponent.ts - Abstract Base for All Web4 Components
 * 
 * All generated Web4 components extend this base class.
 * Provides lifecycle management and view delegation via UcpController.
 * Integrates with Unit for scenario storage.
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
 */

import { UcpController } from './UcpController.js';
import { TypeDescriptor } from '../layer3/TypeDescriptor.js';
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
  
  /** Component model state - protected for subclass access */
  protected model: Reference<TModel> = null;
  
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
   * Initialize component with scenario
   * @param scenario Optional initial scenario
   * @returns this for chaining
   */
  async init(scenario?: { model?: TModel }): Promise<this> {
    this.model = scenario?.model || this.modelDefault();
    this.controller.init(this.model);
    return this;
  }
  
  /**
   * Override to provide default model
   * Called when no scenario provided to init()
   */
  protected abstract modelDefault(): TModel;
  
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

