/**
 * RelatedObjects.interface.ts - Registry for related infrastructure objects
 * 
 * Web4 Principle 24: RelatedObjects Registry
 * 
 * Every UcpComponent has a registry of related infrastructure objects
 * (views, persistence managers, routers, CLI instances). Objects register
 * themselves AND all interfaces they implement. Lookup by JsInterface class
 * returns all matching instances.
 * 
 * Web4 Principles:
 * - P5: Reference<T> for nullable
 * - P16: Object-Action naming (relatedObjectRegister, relatedObjectLookup)
 * - P19: One File One Type
 * - NO 'any' - use typed parameters or generics
 * 
 * @ior ior:esm:/ONCE/{version}/RelatedObjects
 * @pdca 2025-12-05-UTC-1800.a1-1-core-interfaces.pdca.md
 * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
 */

import { InterfaceKey } from './InterfaceConstructor.type.js';
import { Reference } from './Reference.interface.js';

/**
 * RelatedObjects - Registry interface for infrastructure objects
 * 
 * Pattern:
 * ```typescript
 * // Registration - registers for ALL implemented interfaces
 * controller.relatedObjectRegister(OncePeerItemView, viewInstance);
 * // Automatically also registers for:
 * // - ItemView
 * // - View
 * 
 * // Registration via JsInterface class
 * import { PersistenceManager } from './PersistenceManager.interface.js';
 * controller.relatedObjectRegister(PersistenceManager, storageInstance);
 * 
 * // Lookup - returns all matching instances
 * const views = controller.relatedObjectLookup(View);        // All views
 * const itemViews = controller.relatedObjectLookup(ItemView); // All ItemViews
 * const storage = controller.relatedObjectLookupFirst(PersistenceManager); // Storage
 * ```
 */
export interface RelatedObjects {
  
  /**
   * Register a related object
   * 
   * Also registers the instance for all interfaces in its prototype chain automatically.
   * 
   * @param interfaceKey The interface/class type (JsInterface) to register under
   * @param instance The object instance
   */
  relatedObjectRegister<T>(interfaceKey: InterfaceKey<T>, instance: T): void;
  
  /**
   * Lookup all objects implementing an interface (JsInterface class)
   * 
   * @param interfaceKey The interface/class type (JsInterface) to lookup
   * @returns Array of all matching instances (empty if none)
   */
  relatedObjectLookup<T>(interfaceKey: InterfaceKey<T>): T[];
  
  /**
   * Lookup single object implementing an interface (JsInterface class)
   * 
   * Returns the first registered instance, or null if none found.
   * 
   * @param interfaceKey The interface/class type (JsInterface) to lookup
   * @returns First matching instance or null (Reference<T>)
   */
  relatedObjectLookupFirst<T>(interfaceKey: InterfaceKey<T>): Reference<T>;
  
  /**
   * Unregister a related object from all interfaces
   * 
   * Removes the instance from all interface types it was registered under.
   * 
   * @param instance The object instance to unregister (typed via generic)
   */
  relatedObjectUnregister<T>(instance: T): void;
}


