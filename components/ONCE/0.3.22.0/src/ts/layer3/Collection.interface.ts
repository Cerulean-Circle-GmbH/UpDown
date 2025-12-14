/**
 * Collection.interface.ts - Typed collection interface
 * 
 * Web4 Principle 22: Collection<T> for typed collections
 * 
 * Use instead of naked arrays (T[]) to provide:
 * - Type safety
 * - Consistent iteration API
 * - Future extensibility (lazy loading, pagination, etc.)
 * 
 * Web4 Principles:
 * - P19: One File One Type
 * - P22: Collection<T> (this interface)
 * 
 * @ior ior:esm:/ONCE/{version}/Collection
 * @pdca 2025-12-05-UTC-1600.phase-a1-oncepeeritemview-relatedobjects.pdca.md
 */

/**
 * Collection<T> - Typed collection interface
 * 
 * Usage:
 * ```typescript
 * // Return type
 * actionsDiscover(): Collection<Action>
 * 
 * // Implementation - arrays are Collection<T>
 * return [action1, action2];
 * ```
 * 
 * Note: Arrays satisfy this interface, so T[] is assignable to Collection<T>.
 * This allows gradual migration while maintaining type safety.
 */
export interface Collection<T> extends Iterable<T> {
  /** Number of items in the collection */
  readonly length: number;
  
  /** Access item by index */
  [index: number]: T;
}
