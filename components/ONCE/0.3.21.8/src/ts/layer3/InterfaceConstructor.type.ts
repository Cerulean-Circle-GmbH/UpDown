/**
 * InterfaceConstructor.type.ts - Type alias for constructor functions and symbols
 * 
 * Web4 Principles:
 * - P19: One File One Type
 * - P24: RelatedObjects Registry - supports both constructors and symbols
 * - NO 'any' - uses 'unknown' for truly unknown types
 * 
 * Used by RelatedObjects registry for interface-based lookup.
 * 
 * @ior ior:esm:/ONCE/{version}/InterfaceConstructor
 * @pdca 2025-12-05-UTC-1800.a1-1-core-interfaces.pdca.md
 */

/**
 * Constructor type for interface matching
 * 
 * Note: Uses 'unknown' instead of 'any' per Web4 principles.
 * The type parameter T defaults to 'unknown' for maximum safety.
 */
export type InterfaceConstructor<T = unknown> = new (...args: unknown[]) => T;

/**
 * Interface Key - Either a constructor or a symbol
 * 
 * Allows registration/lookup by:
 * - Class constructor: `relatedObjectRegister(UcpStorage, instance)`
 * - Symbol: `relatedObjectRegister(PersistenceManager, instance)`
 */
export type InterfaceKey<T = unknown> = InterfaceConstructor<T> | symbol;
