/**
 * FolderModel.interface.ts - Folder Component Model
 * 
 * Represents a folder/directory in the Web4 FileSystem.
 * Contains IOR references to child files and folders.
 * 
 * Web4 Principles:
 * - P5: Reference<T> for nullable
 * - P19: One File One Type
 * - P22: Collection<T> for typed collections
 * - P34: IOR as Unified Entry Point
 * 
 * TRON: "Reference<File> or Reference<Folder> which is an IOR and stored as a file scenario"
 * 
 * @ior ior:esm:/ONCE/{version}/FolderModel
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 * @pdca 2025-12-22-UTC-0500.ffm-implementation.pdca.md (P34 compliance)
 */

import { Model } from './Model.interface.js';
import { Reference } from './Reference.interface.js';
import { Collection } from './Collection.interface.js';

/**
 * FolderModel - Data model for Folder component
 * 
 * P34: Children are IOR strings that resolve to File/Folder scenarios.
 * NO DUPLICATION - resolve IOR to get name, size, mimetype, etc.
 */
export interface FolderModel extends Model {
  /** Folder path relative to FileSystem root */
  path: string;
  
  /** Folder name */
  folderName: string;
  
  /** 
   * Child IORs (files and folders) - P22: Collection<T>, P34: IOR
   * Each string is an IOR like "ior:scenario:{uuid}"
   * Resolve IOR to get File/Folder scenario with all data (DRY!)
   */
  children: Collection<string>;
  
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



















