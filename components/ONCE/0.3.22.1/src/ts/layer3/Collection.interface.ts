/**
 * Collection.interface.ts - Typed Collection Types
 * 
 * Web4 Principle 22: Collection<T> for typed collections
 * 
 * Two variants:
 * - Collection<T>: Simple typed array (T[])
 * - LazyCollection<T>: IOR-backed lazy array with ISR
 * 
 * Web4 Principles:
 * - P19: One File One Type
 * - P22: Collection<T> (this type)
 * - P34: IOR as Unified Entry Point (lazy resolution)
 * 
 * @ior ior:esm:/ONCE/{version}/Collection
 * @pdca 2025-12-22-UTC-0900.ior-self-replacement.pdca.md
 */

// Forward declaration for IOR type (avoids circular import)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IORType<T> = { 
  resolve(): Promise<T | null>; 
  resolveAndReplace(): Promise<T | null>; 
};

/**
 * Collection<T> - Simple typed array
 * 
 * Use for non-lazy collections where all elements are instances.
 */
export type Collection<T> = T[];

/**
 * LazyCollection<T> - IOR-backed Lazy Collection
 * 
 * Elements can be in three states (ISR pattern):
 * 1. string — IOR string "ior:..." (unresolved)
 * 2. IOR<T> — IOR object (resolving in background)
 * 3. T — Instance (resolved)
 * 
 * UcpModel proxy auto-resolves: string → IOR → T
 * 
 * Usage:
 * ```typescript
 * // Model declaration
 * children: LazyCollection<File>
 * 
 * // Assign IOR strings or instances
 * model.children = ["ior:scenario:uuid1", "ior:scenario:uuid2"];
 * model.children = [file1, file2];
 * ```
 */
export type LazyCollection<T> = (T | IORType<T> | string)[];

