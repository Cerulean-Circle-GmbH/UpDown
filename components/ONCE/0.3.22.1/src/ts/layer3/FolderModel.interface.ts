/**
 * FolderModel.interface.ts - Folder Component Model
 * 
 * Represents a folder/directory in the Web4 FileSystem.
 * Contains references to child files and folders.
 * 
 * Web4 Principles:
 * - P5: Reference<T> for nullable
 * - P19: One File One Type
 * - P24: RelatedObjects for unit/artefact
 * 
 * @ior ior:esm:/ONCE/{version}/FolderModel
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { Model } from './Model.interface.js';
import { Reference } from './Reference.interface.js';
import { Collection } from './Collection.interface.js';
import { FolderChildReference } from './FolderChildReference.interface.js';

// Re-export for backwards compatibility
export type { FolderChildReference };

/**
 * FolderModel - Data model for Folder component
 * 
 * Children stored as lightweight references.
 * Full child components loaded on-demand when navigated.
 */
export interface FolderModel extends Model {
  /** Folder path relative to FileSystem root */
  path: string;
  
  /** Folder name */
  folderName: string;
  
  /** Child references (files and folders) - P22: Collection<T> */
  children: Collection<FolderChildReference>;
  
  /** Parent folder UUID (null for root) */
  parentUuid: Reference<string>;
  
  /** Creation timestamp */
  createdAt: number;
  
  /** Last modification timestamp */
  modifiedAt: number;
  
  /** Is this a symbolic link? */
  isLink: boolean;
  
  /** If isLink, the target path (stable reference) */
  linkTarget: Reference<string>;
}


