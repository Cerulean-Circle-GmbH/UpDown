/**
 * IFolder.interface.ts - TypeScript Interface for Folder Components
 * 
 * Extends IFile with container capabilities.
 * This is the COMPILE-TIME contract — see Folder.ts for runtime existence.
 * 
 * Pattern: JsInterface Pattern (P35)
 * - IFolder (this file): Compile-time contract, erased at runtime
 * - Folder (Folder.ts): Abstract class extending File, implements IFolder
 * - DefaultFolder: Concrete class, implements Folder (and thus IFolder)
 * 
 * Web4 Principles:
 * - P19: One File One Type
 * - P35: JsInterface for Runtime Interfaces
 * 
 * @see ./web4-jsinterface-pattern.md for full pattern documentation
 * @ior ior:esm:/ONCE/{version}/IFolder
 */

import type { IFile } from './IFile.interface.js';
import type { Collection } from './Collection.interface.js';

/**
 * IFolder - TypeScript interface for folder components
 * 
 * A folder IS-A file that can contain other files.
 * Extends IFile with container operations.
 */
export interface IFolder extends IFile {
  // ═══════════════════════════════════════════════════════════════
  // Container Properties
  // ═══════════════════════════════════════════════════════════════
  
  /** Resolved children (filtered for instances only) */
  readonly children: IFile[];
  
  /** Raw child references (may include unresolved IORs) */
  readonly childReferences: Collection<IFile>;
  
  // ═══════════════════════════════════════════════════════════════
  // Container Operations
  // ═══════════════════════════════════════════════════════════════
  
  /** Add a child file or folder */
  childAdd(child: IFile): void;
  
  /** Remove a child file or folder */
  childRemove(child: IFile): boolean;
  
  /** Get child by UUID */
  childGet(uuid: string): IFile | null;
  
  /** Find child by name */
  childFindByName(name: string): IFile | null;
}

