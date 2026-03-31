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
 * Does NOT include lazy loading / IOR resolution stages.
 * 
 * Web4 Principles:
 * - P5: Reference<T> for nullable references
 * - P19: One File One Type
 * 
 * For lazy-loading references, use LazyReference<T>.
 * 
 * @layer3
 * @see LazyReference.interface.ts for ISR pattern
 * 
 * @example
 *   parent: Reference<Folder>  // Folder instance or null
 */
export type Reference<T> = T | null;

// Re-export ReferenceState for use with IOR
export { ReferenceState } from './ReferenceState.enum.js';

// IOR<T> is the unified Reference implementation (local + remote)
// Import from layer4/IOR.ts: import { IOR } from './layer4/IOR.js';
