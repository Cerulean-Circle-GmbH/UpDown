/**
 * Folder.interface.ts - TypeScript Interface for Folder Components
 * 
 * Extends File with container capabilities.
 * This is the COMPILE-TIME contract — see FolderJsInterface.ts for runtime existence.
 * 
 * Pattern: JsInterface Pattern (P35)
 * - Folder (this file): Compile-time contract, erased at runtime
 * - FolderJsInterface (FolderJsInterface.ts): Abstract class extending FileJsInterface, implements Folder
 * - DefaultFolder: Concrete class, implements FolderJsInterface (and thus Folder)
 * 
 * Web4 Principles:
 * - P19: One File One Type
 * - P35: JsInterface for Runtime Interfaces
 * 
 * @see session/web4-jsinterface-pattern.md for full pattern documentation
 * @see session/web4-component-anatomy-details.md for component anatomy
 * @ior ior:esm:/ONCE/{version}/Folder
 */

import type { File } from './File.interface.js';
import type { Collection } from './Collection.interface.js';

/**
 * Folder - TypeScript interface for folder components
 * 
 * A folder IS-A file that can contain other files.
 * Extends File with container operations.
 */
export interface Folder extends File {
  // ═══════════════════════════════════════════════════════════════
  // Container Properties
  // ═══════════════════════════════════════════════════════════════
  
  /** Resolved children (filtered for instances only) */
  readonly children: File[];
  
  /** Raw child references (may include unresolved IORs) */
  readonly childReferences: Collection<File>;
  
  // ═══════════════════════════════════════════════════════════════
  // Container Operations
  // ═══════════════════════════════════════════════════════════════
  
  /** Add a child file or folder */
  childAdd(child: File): void;
  
  /** Remove a child file or folder */
  childRemove(child: File): boolean;
  
  /** Get child by UUID */
  childGet(uuid: string): File | null;
  
  /** Find child by name */
  childFindByName(name: string): File | null;
}

