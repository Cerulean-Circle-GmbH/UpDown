/**
 * Reference<T> - Polymorphic Reference Type
 * 
 * Web4 Pattern: Reference<T> can be THREE states:
 * 
 * 1. **Local resolved instance**: The actual UcpComponent (e.g., DefaultFile, DefaultFolder)
 * 2. **IOR string (unresolved)**: e.g., "ior:scenario:{uuid}" — needs resolution
 * 3. **null**: Not yet set or intentionally empty
 * 
 * TRON: "Reference<...> can be the local resolved instance or the IOR or the 
 * full persistent scenario. File is the Reference Implementation for how to
 * load files, make them UcpComponent instances and lazy dereference the first
 * layer of children until one of the children is selected, and the process
 * deepens one layer."
 * 
 * **Lazy Dereferencing Pattern**:
 * - FolderModel.children stores IOR strings (unresolved)
 * - On folder open, resolve first layer → create UcpComponent instances
 * - Child folder's children remain as IOR strings (not resolved yet)
 * - When user selects child folder, resolve THAT folder's children
 * - Process deepens ONE LAYER at a time
 * 
 * For remote resolution, use IOR<T> from layer4/IOR.ts
 * 
 * @layer3
 * @pdca 2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md
 * @pdca 2025-12-22-UTC-0400.file-folder-architecture-completion.pdca.md
 */

/**
 * Simple nullable type alias
 * 
 * In practice, FolderModel.children uses Collection<string> (IOR strings)
 * which are resolved to Reference<FileSystemNode> on demand.
 */
export type Reference<T> = T | null;

// Re-export ReferenceState for use with IOR
export { ReferenceState } from './ReferenceState.enum.js';

// IOR<T> is the unified Reference implementation (local + remote)
// Import from layer4/IOR.ts: import { IOR } from './layer4/IOR.js';
