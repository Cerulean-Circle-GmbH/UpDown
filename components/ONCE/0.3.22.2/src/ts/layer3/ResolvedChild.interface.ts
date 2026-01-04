/**
 * ResolvedChild.interface.ts - Resolved child data for view rendering
 * 
 * P34: FolderModel.children is Collection<string> (IOR strings).
 * This interface represents resolved child data for rendering.
 * Data comes from resolved File/Folder scenarios - NO DUPLICATION.
 * 
 * Web4 Principles:
 * - P5: Reference<T> for nullable
 * - P19: One File One Type
 * - P34: IOR as Unified Entry Point
 * 
 * @ior ior:esm:/ONCE/{version}/ResolvedChild
 * @pdca 2025-12-22-UTC-0500.ffm-implementation.pdca.md (P34 compliance)
 */

import { Reference } from './Reference.interface.js';

/**
 * ResolvedChild - View interface for resolved IOR children
 * 
 * This is the result of resolving a child IOR string.
 * Contains the essential data needed for view rendering.
 */
export interface ResolvedChild {
  /** UUID of the resolved File/Folder */
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

