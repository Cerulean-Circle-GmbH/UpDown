/**
 * InterfaceConstructor.type.ts - Type alias for constructor functions
 * 
 * Web4 Principles:
 * - P19: One File One Type
 * - P24: RelatedObjects Registry - supports constructors (including abstract)
 * - NO 'any' - uses 'unknown' for truly unknown types
 * 
 * Used by RelatedObjects registry for interface-based lookup.
 * 
 * @ior ior:esm:/ONCE/{version}/InterfaceConstructor
 * @pdca 2025-12-05-UTC-1800.a1-1-core-interfaces.pdca.md
 * @pdca 2025-12-09-UTC-1500.jsinterface-migration-persistence-manager.pdca.md
 */

/**
 * Constructor type for interface matching (concrete classes only)
 * 
 * Note: Uses 'unknown' instead of 'any' per Web4 principles.
 * The type parameter T defaults to 'unknown' for maximum safety.
 */
export type InterfaceConstructor<T = unknown> = new (...args: unknown[]) => T;

/**
 * Abstract constructor type for JsInterface-based classes
 * 
 * Allows abstract classes like PersistenceManager to be used as keys.
 */
export type AbstractConstructor<T = unknown> = abstract new (...args: unknown[]) => T;

/**
 * Interface Key - Either a concrete or abstract constructor
 * 
 * Allows registration/lookup by:
 * - Concrete class: `relatedObjectRegister(UcpStorage, instance)`
 * - Abstract JsInterface: `relatedObjectRegister(PersistenceManager, instance)`
 * 
 * Note: Symbol keys removed per TRON decision (G.4.3) - use JsInterface classes instead.
 */
export type InterfaceKey<T = unknown> = InterfaceConstructor<T> | AbstractConstructor<T>;
