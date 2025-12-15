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
  
  /** Child references (files and folders) */
  children: FolderChildReference[];
  
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
