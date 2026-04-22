/**
 * LazyReference<T> - Lazy-Loading Reference with ISR Pattern
 * 
 * ISR Pattern (IOR Self-Replacement):
 * 1. string — IOR string "ior:..." (unresolved)
 * 2. IOR<T> — IOR object (resolving in background)
 * 3. T — Instance (dereferenced)
 * 4. null — Not set
 * 
 * UcpModel proxy automatically upgrades strings → IOR → Instance.
 * 
 * Web4 Principles:
 * - P19: One File One Type
 * - P34: IOR as Unified Entry Point
 * 
 * @layer3
 * @pdca 2025-12-22-UTC-0900.ior-self-replacement.pdca.md
 * 
 * @example
 * ```typescript
 * // In FolderModel
 * children: Collection<LazyReference<File>>
 * 
 * // Access triggers ISR:
 * const child = folder.model.children[0];
 * // If string → becomes IOR → resolves to instance
 * ```
 */

// Forward declaration to avoid circular imports
// IOR<T> is the runtime implementation in layer4
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IORType<T> = { 
  resolve(): Promise<T | null>; 
  resolveAndReplace(): Promise<T | null>; 
  initWithParent(parent: object, key: string, index?: number): IORType<T>;
};

/**
 * LazyReference<T> — Can hold IOR string, IOR object, Instance, or null
 * 
 * Use for properties that support lazy loading via IOR self-replacement.
 */
export type LazyReference<T> = T | IORType<T> | string | null;

