/**
 * FolderModel.interface.ts - Folder Component Model
 * 
 * Represents a folder/directory in the Web4 FileSystem.
 * Folder IS-A File that can contain other Files.
 * 
 * Web4 Principles:
 * - P5: Reference<T> for nullable (simple)
 * - P19: One File One Type
 * - P22: Collection<T> for lazy collections
 * - P34: IOR as Unified Entry Point
 * 
 * TRON: "Reference<File> or Reference<Folder> which is an IOR and stored as a file scenario"
 * 
 * @ior ior:esm:/ONCE/{version}/FolderModel
 * @pdca 2025-12-22-UTC-0900.ior-self-replacement.pdca.md
 */

import { Model } from './Model.interface.js';
import { LazyReference } from './LazyReference.interface.js';
import { Collection } from './Collection.interface.js';
import type { File } from './File.js';
import type { Folder } from './Folder.js';

/**
 * FolderModel - Data model for Folder component
 * 
 * Collection<T> is inherently lazy - elements can be:
 * - IOR string → IOR object → Instance (ISR pattern)
 * 
 * UcpModel proxy handles all lazy resolution automatically.
 */
export interface FolderModel extends Model {
  /** Folder path relative to FileSystem root */
  path: string;
  
  /** Folder name */
  folderName: string;
  
  /** 
   * Child files and folders - Collection<T> with lazy resolution
   * 
   * Elements start as IOR strings, resolve to File instances
   * (DefaultFile or DefaultFolder, both implement File JsInterface).
   * UcpModel proxy handles ISR automatically.
   */
  children: Collection<File>;
  
  /** Parent folder (lazy reference, null for root) */
  parent: LazyReference<Folder>;
  
  /** Creation timestamp */
  createdAt: number;
  
  /** Last modification timestamp */
  modifiedAt: number;
  
  /** Is this a symbolic link? */
  isLink: boolean;
  
  /** If isLink, the target folder (lazy reference via IOR) */
  linkTarget: LazyReference<Folder>;
}



















