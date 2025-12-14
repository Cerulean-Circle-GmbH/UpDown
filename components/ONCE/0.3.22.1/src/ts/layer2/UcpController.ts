/**
 * UcpController.ts - Web4 MVC Controller Base Class
 * 
 * Base class for all controllers in Web4 MVC architecture.
 * Manages views, handles model updates via Proxy, and provides
 * the RelatedObjects registry for infrastructure lookup.
 * 
 * Web4 Principles:
 * - P4: Radical OOP (no arrow functions)
 * - P5: Reference<T> for nullable
 * - P6: Empty constructor
 * - P7: Layer 2 is SYNCHRONOUS (except entry from Layer 4)
 * - P16: TypeScript accessors
 * - P24: RelatedObjects Registry
 * 
 * Layer Flow:
 *   Layer 4 (async) → scenarioReceive() → viewsUpdateAll() → view.update() (sync)
 * 
 * @ior ior:esm:/ONCE/{version}/UcpController
 * @pdca 2025-12-03-UTC-1200.mvc-lit3-views.pdca.md
 * @pdca 2025-12-05-UTC-1800.a1-1-core-interfaces.pdca.md
 */

import { Controller } from '../layer3/Controller.interface.js';
import type { View } from '../layer3/View.interface.js';
import type { Reference } from '../layer3/Reference.interface.js';
import type { RelatedObjects } from '../layer3/RelatedObjects.interface.js';
import { InterfaceKey } from '../layer3/InterfaceConstructor.type.js';

/**
 * UcpController - Base class for Web4 MVC Controllers
 * 
 * Uses JavaScript Proxy to detect model changes and automatically
 * notify all registered views to update.
 * 
 * Implements RelatedObjects registry (Web4 Principle 24) for
 * infrastructure lookup by interface type.
 * 
 * All methods are SYNCHRONOUS (Layer 2).
 */
export class UcpController<TModel extends object> extends Controller<TModel> implements RelatedObjects {
  
  /** Registered views - notified on model changes */
  private registeredViews: Set<View<TModel>> = new Set();
  
  /** Proxied model - changes trigger view updates */
  private modelProxy: Reference<TModel> = null;
  
  /** 
   * RelatedObjects registry - maps interface types (JsInterface classes) to instances
   * Web4 Principle 24
   * Uses JsInterface classes (abstract or concrete) as keys
   */
  private relatedObjectsRegistry: Map<InterfaceKey<unknown>, Set<unknown>> = new Map();
  
  /** 
   * Reverse lookup - maps instances to their registered interfaces
   * Used for efficient unregister
   */
  private instanceToInterfaces: Map<unknown, Set<InterfaceKey<unknown>>> = new Map();
  
  /**
   * Static start - Register as Controller implementation
   * 
   * @pdca 2025-12-08-UTC-1100.jsinterface-type-descriptors.pdca.md
   */
  static start(): void {
    Controller.implementationRegister(UcpController);
  }
  
  /**
   * Empty constructor - Web4 Principle 6
   */
  constructor() {
    super();
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
  
  // ═══════════════════════════════════════════════════════════════
  // RELATED OBJECTS REGISTRY (Web4 Principle 24)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Register a related object for an interface type (JsInterface class)
   * 
   * Also walks the prototype chain to register for all parent classes automatically.
   * 
   * @param interfaceKey The interface/class type (JsInterface) to register under
   * @param instance The object instance
   */
  relatedObjectRegister<T>(interfaceKey: InterfaceKey<T>, instance: T): void {
    // Get or create set for this interface
    let instances = this.relatedObjectsRegistry.get(interfaceKey);
    if (!instances) {
      instances = new Set();
      this.relatedObjectsRegistry.set(interfaceKey, instances);
    }
    instances.add(instance);
    
    // Track which interfaces this instance is registered under
    let interfaces = this.instanceToInterfaces.get(instance);
    if (!interfaces) {
      interfaces = new Set();
      this.instanceToInterfaces.set(instance, interfaces);
    }
    interfaces.add(interfaceKey);
    
    // Walk prototype chain to register for all parent classes
    this.prototypeChainRegister(instance, interfaceKey);
  }
  
  /**
   * Walk prototype chain and register instance for parent classes
   * @param instance The object instance
   * @param skipType Type already registered (avoid duplicate)
   */
  private prototypeChainRegister<T>(instance: T, skipType: InterfaceKey<T>): void {
    let proto = Object.getPrototypeOf(instance);
    
    while (proto && proto.constructor && proto.constructor !== Object) {
      const parentType = proto.constructor as InterfaceKey<unknown>;
      
      if (parentType !== skipType) {
        // Register under parent type
        let instances = this.relatedObjectsRegistry.get(parentType);
        if (!instances) {
          instances = new Set();
          this.relatedObjectsRegistry.set(parentType, instances);
        }
        instances.add(instance);
        
        // Track in reverse lookup
        const interfaces = this.instanceToInterfaces.get(instance);
        if (interfaces) {
          interfaces.add(parentType);
        }
      }
      
      proto = Object.getPrototypeOf(proto);
    }
  }
  
  /**
   * Lookup all objects implementing an interface (JsInterface class)
   * 
   * @param interfaceKey The interface/class type (JsInterface) to lookup
   * @returns Array of all matching instances (empty if none)
   */
  relatedObjectLookup<T>(interfaceKey: InterfaceKey<T>): T[] {
    const instances = this.relatedObjectsRegistry.get(interfaceKey);
    if (!instances) {
      return [];
    }
    return Array.from(instances) as T[];
  }
  
  /**
   * Lookup single object implementing an interface (JsInterface class)
   * 
   * @param interfaceKey The interface/class type (JsInterface) to lookup
   * @returns First matching instance or null (Reference<T>)
   */
  relatedObjectLookupFirst<T>(interfaceKey: InterfaceKey<T>): Reference<T> {
    const instances = this.relatedObjectsRegistry.get(interfaceKey);
    if (!instances || instances.size === 0) {
      return null;
    }
    return Array.from(instances)[0] as T;
  }
  
  /**
   * Unregister a related object from all interfaces
   * 
   * @param instance The object instance to unregister
   */
  relatedObjectUnregister<T>(instance: T): void {
    const interfaces = this.instanceToInterfaces.get(instance);
    if (!interfaces) {
      return;
    }
    
    // Remove from all interface registries
    interfaces.forEach(this.instanceRemoveFromInterface.bind(this, instance));
    
    // Clean up reverse lookup
    this.instanceToInterfaces.delete(instance);
  }
  
  /**
   * Remove instance from a single interface registry
   * Used as method reference in forEach
   */
  private instanceRemoveFromInterface(instance: unknown, interfaceKey: InterfaceKey<unknown>): void {
    const instances = this.relatedObjectsRegistry.get(interfaceKey);
    if (instances) {
      instances.delete(instance);
      if (instances.size === 0) {
        this.relatedObjectsRegistry.delete(interfaceKey);
      }
    }
  }
}

