/**
 * UcpComponent.ts - Abstract Base for All Web4 Components
 * 
 * All generated Web4 components extend this base class.
 * Provides lifecycle management and view delegation via UcpController.
 * 
 * Web4 Principles:
 * - P4: Radical OOP
 * - P5: Reference<T> for nullable
 * - P6: Empty constructor
 * - P7: Async in Layer 4 only
 * - P16: TypeScript accessors
 * 
 * @ior ior:esm:/ONCE/{version}/UcpComponent
 * @pdca 2025-12-03-UTC-1200.mvc-lit3-views.pdca.md
 */

import { UcpController } from './UcpController.js';
import { View } from '../layer3/View.interface.js';
// Note: Using 'any' for Scenario to avoid circular dependency
// import { Scenario } from '../layer3/Scenario.interface.js';
import { Reference } from '../layer3/Reference.interface.js';

/**
 * UcpComponent - Abstract base class for all Web4 components
 * 
 * Hierarchy: Component interface → UcpComponent → DefaultXxx implementations
 * 
 * Features:
 * - Lifecycle management (init, start, stop, hibernate)
 * - View delegation via UcpController
 * - Scenario serialization
 */
export abstract class UcpComponent<TModel extends object> {
  
  /** Component model state */
  model: Reference<TModel> = null;
  
  /** Controller for view management */
  protected controller: UcpController<TModel>;
  
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
   * @returns Scenario representing current state
   */
  async toScenario(): Promise<{ ior: any; owner: string; model: TModel }> {
    return {
      ior: this.iorGet(),
      owner: 'system',
      model: this.model as TModel
    };
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

