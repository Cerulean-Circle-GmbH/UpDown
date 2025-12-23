/**
 * Collection.interface.ts - Lazy Collection Interface
 * 
 * Web4 Principle 22: Collection<T> for typed collections
 * 
 * Collection<T> extends Array with LazyReference semantics:
 * - Elements can be T (instance), IOR<T> (resolving), or string (IOR)
 * - Full array compatibility (map, filter, forEach, etc.)
 * - ISR pattern handled by UcpModel proxy
 * 
 * Web4 Principles:
 * - P19: One File One Type
 * - P22: Collection<T> (this interface)
 * - P34: IOR as Unified Entry Point
 * 
 * @ior ior:esm:/ONCE/{version}/Collection
 * @pdca 2025-12-22-UTC-1000.collection-generic-design.pdca.md
 */

import type { LazyReference } from './LazyReference.interface.js';

/**
 * Collection<T> - Lazy Collection extending Array
 * 
 * Elements are LazyReference<T>: can be T, IOR<T>, string, or null.
 * Extends Array for full compatibility with array methods.
 * 
 * ISR Pattern:
 * 1. string — IOR string "ior:..." (unresolved)
 * 2. IOR<T> — IOR object (resolving in background)
 * 3. T — Instance (resolved)
 * 
 * Usage:
 * ```typescript
 * // Model declaration - just specify target type
 * children: Collection<File>;
 * 
 * // Assignment works with arrays
 * model.children = ["ior:scenario:uuid1", file2];
 * model.children = [file1, file2];
 * 
 * // All array methods work
 * model.children.map(child => ...)
 * model.children.filter(child => ...)
 * ```
 */
export interface Collection<T> extends Array<LazyReference<T>> {
  // Inherits all Array methods: push, pop, map, filter, forEach, etc.
  // LazyReference<T> allows: T | IOR<T> | string | null
}
