/**
 * FolderModel.interface.ts - Folder Component Model
 * 
 * Represents a folder/directory in the Web4 FileSystem.
 * Contains references to child files and folders.
 * 
 * Web4 Principles:
 * - P5: Reference<T> for nullable
 * - P19: One File One Type
 * - P22: Collection<T> for typed collections
 * 
 * TODO (P34 Migration): Children should be IOR strings, not FolderChildReference objects.
 * TRON: "Reference<File> or Reference<Folder> which is an IOR and stored as a file scenario"
 * This requires migrating FolderOverView/FolderItemView to resolve IORs.
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
 * Children stored as lightweight references (DEPRECATED - should be IOR strings).
 * Full child components loaded on-demand when navigated.
 */
export interface FolderModel extends Model {
  /** Folder path relative to FileSystem root */
  path: string;
  
  /** Folder name */
  folderName: string;
  
  /** 
   * Child references (files and folders) - P22: Collection<T>
   * TODO: Migrate to Collection<string> (IOR strings)
   */
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



















