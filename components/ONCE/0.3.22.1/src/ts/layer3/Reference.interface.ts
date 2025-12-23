/**
 * Reference<T> - Internet Object Reference (IOR = Reference!)
 * 
 * Web4 Pattern: Reference<T> can hold THREE stages + null:
 * 
 * 1. **string (IOR)** — "ior:scenario:{uuid}" — can LOAD scenario
 * 2. **Scenario<M>** — { ior, uuid, model, owner } — can INSTANTIATE component
 * 3. **T (instance)** — DEREFERENCED, ready to use
 * 4. **null** — Not yet set
 * 
 * **Dereferencing Chain**:
 * ```
 * IOR string → Scenario → Instance (dereferenced)
 *      ↓           ↓           ↓
 *  "ior:..."   { model }   DefaultFile
 * ```
 * 
 * **Kernel Responsibilities**:
 * - `kernel.loadScenario(ior)` → Scenario JSON
 * - `kernel.instantiate(scenario)` → UcpComponent instance
 * - Instance is DEREFERENCED and ready to use
 * 
 * **NOT File-Specific**: This is the DEFAULT dereferencing pattern for ALL UcpComponents.
 * File/Folder are the REFERENCE IMPLEMENTATION, but works for:
 * - Reference<DefaultUser>
 * - Reference<DefaultServer>
 * - Reference<AnyUcpComponent>
 * 
 * **ONE LAYER LOOKAHEAD**:
 * - Folder "resolved" = children are DEREFERENCED instances
 * - Selection triggers next layer resolution
 * 
 * @layer3
 * @pdca 2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md
 * @pdca 2025-12-22-UTC-0400.file-folder-architecture-completion.pdca.md
 */

/**
 * Reference<T> — Simple nullable reference (T or null)
 * 
 * For properties that are either set to an instance or null.
 * Does NOT include IOR resolution stages.
 * 
 * @example
 *   parent: Reference<Folder>  // Folder instance or null
 */
export type Reference<T> = T | null;

// Forward declaration to avoid circular imports
// IOR<T> is the runtime implementation in layer4
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IORType<T> = { resolve(): Promise<T | null>; resolveAndReplace(): Promise<T | null>; initWithParent(parent: object, key: string, index?: number): IORType<T> };

/**
 * IORReference<T> — Can hold IOR string, IOR object, Instance, or null
 * 
 * ISR Pattern (IOR Self-Replacement):
 * 1. string — IOR string "ior:..." (unresolved)
 * 2. IOR<T> — IOR object (resolving in background)
 * 3. T — Instance (dereferenced)
 * 4. null — Not set
 * 
 * UcpModel proxy automatically upgrades strings → IOR → Instance.
 * 
 * @example
 *   children: Collection<IORReference<FileSystemNode>>
 *   // Contains strings, IORs, or instances as they resolve
 */
export type IORReference<T> = T | IORType<T> | string | null;

// Re-export ReferenceState for use with IOR
export { ReferenceState } from './ReferenceState.enum.js';

// IOR<T> is the unified Reference implementation (local + remote)
// Import from layer4/IOR.ts: import { IOR } from './layer4/IOR.js';
