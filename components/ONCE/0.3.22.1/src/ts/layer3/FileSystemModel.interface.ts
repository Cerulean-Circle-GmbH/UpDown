/**
 * FileSystemModel.interface.ts - FileSystem Component Model
 * 
 * Root component for the Web4 virtual file system.
 * Manages files, folders, and mimetype handlers.
 * 
 * Web4 Principles:
 * - P5: Reference<T> for nullable
 * - P19: One File One Type
 * 
 * @ior ior:esm:/ONCE/{version}/FileSystemModel
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { Model } from './Model.interface.js';
import { Reference } from './Reference.interface.js';

/**
 * FileSystemModel - Root filesystem state
 */
export interface FileSystemModel extends Model {
  /** Root folder UUID */
  rootFolderUuid: string;
  
  /** Base path for storage (e.g., /scenarios/type/File) */
  basePath: string;
  
  /** Total files count */
  fileCount: number;
  
  /** Total folders count */
  folderCount: number;
  
  /** Total storage size in bytes */
  totalSize: number;
  
  /** Last sync timestamp */
  lastSyncAt: Reference<number>;
}
















