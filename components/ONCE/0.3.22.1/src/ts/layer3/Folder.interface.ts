/**
 * Folder.interface.ts - TypeScript Interface for Folder Components
 * 
 * Extends File with container capabilities.
 * This is the COMPILE-TIME contract — see FolderJs.ts for runtime existence.
 * 
 * Pattern: JsInterface Pattern (P35)
 * - Folder (this file): Compile-time contract, erased at runtime
 * - FolderJs (FolderJs.ts): Abstract class extending FileJs, implements Folder
 * - DefaultFolder: Concrete class, implements FolderJs (and thus Folder)
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
  
  /**
   * Resolved children only
   * 
   * TODO: Migrate to Collection<File> once ISR is fully implemented
   * Currently returns only resolved instances for backwards compatibility.
   */
  readonly children: File[];
  
  /**
   * Raw child references (includes unresolved IORs)
   * @deprecated Will be replaced by children: Collection<File>
   */
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

