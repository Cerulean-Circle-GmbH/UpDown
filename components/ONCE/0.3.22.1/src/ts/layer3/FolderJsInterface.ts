/**
 * FolderJsInterface.ts - Runtime Interface for Folder Components
 * 
 * ✅ Web4 Principle 35: JsInterface for Runtime Interfaces
 * 
 * This is the RUNTIME representation of Folder.interface.ts.
 * 
 * Pattern: JsInterface Pattern
 * - Folder (Folder.interface.ts): Compile-time contract, extends File
 * - FolderJsInterface (this file): Abstract class extending FileJsInterface, implements Folder
 * - DefaultFolder: Concrete class, implements FolderJsInterface (and thus Folder)
 * 
 * FolderJsInterface extends FileJsInterface - a Folder IS-A File that can have children.
 * This extends JsInterface (via FileJsInterface) for runtime polymorphism.
 * 
 * IMPORTANT: Only DefaultFolder implements FolderJsInterface.
 * - DefaultFile implements FileJsInterface (leaf node)
 * - DefaultFolder implements FileJsInterface AND FolderJsInterface (can have children)
 * 
 * Usage:
 * ```typescript
 * // Check if a FileJsInterface is a FolderJsInterface
 * if (file.isFolder) {
 *   const folder = file as FolderJsInterface;
 *   folder.childAdd(newFile);
 * }
 * 
 * // Parent is always a FolderJsInterface
 * const parent: LazyReference<FolderJsInterface> = file.parent;
 * ```
 * 
 * @see session/web4-jsinterface-pattern.md for full pattern documentation
 * @see session/web4-component-anatomy-details.md for component anatomy
 * @ior ior:esm:/ONCE/{version}/FolderJsInterface
 * @pdca 2025-12-22-UTC-1100.file-folder-inheritance.pdca.md
 */

import { FileJsInterface } from './FileJsInterface.js';
import type { Folder } from './Folder.interface.js';
import type { Collection } from './Collection.interface.js';

/**
 * FolderJsInterface - Runtime interface for folder components
 * 
 * - Extends FileJsInterface (which implements File)
 * - Implements Folder for compile-time contract enforcement
 * 
 * Only DefaultFolder implements this interface.
 * Note: Uses `FileJsInterface` (runtime type) not `File` (erased) in signatures.
 */
export abstract class FolderJsInterface extends FileJsInterface implements Folder {
  
  // ═══════════════════════════════════════════════════════════════
  // Container Operations
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get resolved children
   * @returns Array of resolved FileJsInterface instances
   */
  abstract get children(): FileJsInterface[];
  
  /**
   * Get raw child references (may include unresolved IORs)
   */
  abstract get childReferences(): Collection<FileJsInterface>;
  
  /**
   * Add a child file or folder
   */
  abstract childAdd(child: FileJsInterface): void;
  
  /**
   * Remove a child file or folder
   * @returns true if removed, false if not found
   */
  abstract childRemove(child: FileJsInterface): boolean;
  
  /**
   * Get child by UUID
   */
  abstract childGet(uuid: string): FileJsInterface | null;
  
  /**
   * Find child by name
   */
  abstract childFindByName(name: string): FileJsInterface | null;
}

