/**
 * FolderChildReference.interface.ts - Reference to a child file or folder
 * 
 * Lightweight reference for folder listing.
 * Full component loaded on navigation.
 * 
 * TODO (P34): This interface violates DRY - it duplicates data from File/Folder scenarios.
 * Should be replaced with IOR strings: "ior:scenario:{uuid}" that resolve to File/Folder.
 * Requires migrating FolderOverView and FolderItemView to resolve IORs.
 * 
 * Web4 Principles:
 * - P5: Reference<T> for nullable
 * - P19: One File One Type
 * 
 * @ior ior:esm:/ONCE/{version}/FolderChildReference
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { Reference } from './Reference.interface.js';

/**
 * FolderChildReference - Reference to a child file or folder
 * 
 * Lightweight reference for folder listing.
 * Full component loaded on navigation.
 */
export interface FolderChildReference {
  /** UUID of the child component */
  uuid: string;
  
  /** Name for display */
  name: string;
  
  /** Is this a folder? (vs file) */
  isFolder: boolean;
  
  /** MIME type (for files only) */
  mimetype: Reference<string>;
  
  /** Size in bytes (for files only) */
  size: Reference<number>;
  
  /** Has nested children? (for folders - shows ">" icon) */
  hasChildren: boolean;
}

















