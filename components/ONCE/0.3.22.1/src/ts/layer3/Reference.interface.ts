/**
 * Reference<T> - Resolved Instance Reference
 * 
 * Web4 Pattern: Reference<T> is fundamentally TWO states:
 * 1. **T** — Resolved local instance (DefaultFile, DefaultFolder)
 * 2. **null** — Not yet set
 * 
 * **Unresolved states** are stored differently (not in Reference<T>):
 * - IOR string: `"ior:scenario:{uuid}"` — compact reference
 * - Scenario JSON: `{ ior, uuid, model, owner }` — full data
 * - Both contain everything to CREATE an instance, but are not yet instantiated
 * - Both are THE SAME CONCEPT in different formats
 * 
 * **ONE LAYER LOOKAHEAD Pattern**:
 * - Folder "resolved" means children ARE instances, not IOR strings
 * - FolderModel.children stores IOR strings (grandchildren, not yet resolved)
 * - When folder resolves, it prefetches children as instances
 * - User selects child folder → resolve THAT folder's children
 * - Process deepens one layer on each selection
 * 
 * TRON: "Getting the root folder means resolving its children before the 
 * root folder counts as resolved. The first level is fully prefetched.
 * Selecting a child causes the next layer of lazy resolving and prefetching."
 * 
 * @layer3
 * @pdca 2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md
 * @pdca 2025-12-22-UTC-0400.file-folder-architecture-completion.pdca.md
 */

/**
 * Reference<T> — Resolved instance or null
 * 
 * FolderModel.children uses Collection<string> (IOR strings, unresolved)
 * These are converted to Reference<FileSystemNode> via folder.resolve()
 */
export type Reference<T> = T | null;

// Re-export ReferenceState for use with IOR
export { ReferenceState } from './ReferenceState.enum.js';

// IOR<T> is the unified Reference implementation (local + remote)
// Import from layer4/IOR.ts: import { IOR } from './layer4/IOR.js';
