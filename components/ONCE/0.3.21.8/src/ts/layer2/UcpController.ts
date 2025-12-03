/**
 * UcpController.ts - Web4 MVC Controller Base Class
 * 
 * Base class for all controllers in Web4 MVC architecture.
 * Manages views and handles model updates via Proxy.
 * 
 * Web4 Principles:
 * - P4: Radical OOP (no arrow functions)
 * - P5: Reference<T> for nullable
 * - P6: Empty constructor
 * - P7: Layer 2 is SYNCHRONOUS (except entry from Layer 4)
 * - P16: TypeScript accessors
 * 
 * Layer Flow:
 *   Layer 4 (async) → scenarioReceive() → viewsUpdateAll() → view.update() (sync)
 * 
 * @ior ior:esm:/ONCE/{version}/UcpController
 * @pdca 2025-12-03-UTC-1200.mvc-lit3-views.pdca.md
 */

import { Controller } from '../layer3/Controller.interface.js';
import { View } from '../layer3/View.interface.js';
import { Reference } from '../layer3/Reference.interface.js';

/**
 * UcpController - Base class for Web4 MVC Controllers
 * 
 * Uses JavaScript Proxy to detect model changes and automatically
 * notify all registered views to update.
 * 
 * All methods are SYNCHRONOUS (Layer 2).
 */
export class UcpController<TModel extends object> implements Controller<TModel> {
  
  /** Registered views - notified on model changes */
  private registeredViews: Set<View<TModel>> = new Set();
  
  /** Proxied model - changes trigger view updates */
  private modelProxy: Reference<TModel> = null;
  
  /**
   * Empty constructor - Web4 Principle 6
   */
  constructor() {
    // Empty - initialization via init()
  }
  
  /**
   * Initialize controller with model
   * Creates proxy for auto-updates
   * @param model Initial model state
   * @returns this for chaining
   */
  init(model: TModel): this {
    this.modelProxy = this.proxyCreate(model);
    return this;
  }
  
  /**
   * Create proxy wrapper for model
   * Detects property changes and triggers view updates
   */
  private proxyCreate(model: TModel): TModel {
    const controller = this;
    
    return new Proxy(model, {
      set: function(target, property, value) {
        (target as any)[property] = value;
        controller.viewsUpdateAll();  // SYNCHRONOUS!
        return true;
      }
    });
  }
  
  /**
   * Get the proxied model
   */
  get model(): TModel {
    if (this.modelProxy === null) {
      throw new Error('Controller not initialized - call init() first');
    }
    return this.modelProxy;
  }
  
  /**
   * Receive scenario from WebSocket (entry point from Layer 4)
   * Updates model which triggers synchronous view updates.
   * 
   * Called from: BrowserOnce.ws.onmessage (async Layer 4)
   * Triggers: viewsUpdateAll() → view.update() (sync Layer 5)
   * 
   * @param scenario Incoming scenario from WebSocket
   */
  scenarioReceive(scenario: any): void {
    if (!this.modelProxy) {
      console.warn('Controller not initialized, ignoring scenario');
      return;
    }
    
    // Merge scenario.model into proxy
    // This triggers the Proxy set trap for each property
    if (scenario?.model) {
      Object.assign(this.modelProxy, scenario.model);
    }
  }
  
  /**
   * Register a view for model updates
   * @param view View to register
   */
  viewRegister(view: View<TModel>): void {
    this.registeredViews.add(view);
    if (this.modelProxy) {
      view.model = this.modelProxy;
    }
  }
  
  /**
   * Unregister a view
   * @param view View to unregister
   */
  viewUnregister(view: View<TModel>): void {
    this.registeredViews.delete(view);
  }
  
  /**
   * Update all registered views - SYNCHRONOUS!
   * 
   * Web4 Principle 7: Layer 5 interactions are synchronous
   * Uses method reference (not arrow function) per Principle 4.
   */
  viewsUpdateAll(): void {
    this.registeredViews.forEach(this.viewRefresh.bind(this));
  }
  
  /**
   * Update a single view - called via method reference
   * @param view View to update
   */
  private viewRefresh(view: View<TModel>): void {
    view.refresh();  // SYNCHRONOUS
  }
}

