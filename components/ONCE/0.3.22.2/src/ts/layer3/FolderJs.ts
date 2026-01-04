/**
 * FolderJs.ts - Runtime Interface for Folder Components
 * 
 * ✅ Web4 Principle 35: JsInterface for Runtime Interfaces
 * 
 * This is the RUNTIME representation of Folder.interface.ts.
 * Named "FolderJs" for consistency with FileJs (avoiding browser collision).
 * 
 * Pattern: JsInterface Pattern
 * - Folder (Folder.interface.ts): Compile-time contract, extends File
 * - FolderJs (this file): Abstract class extending FileJs, implements Folder
 * - DefaultFolder: Concrete class, implements FolderJs (and thus Folder)
 * 
 * FolderJs extends FileJs - a Folder IS-A File that can have children.
 * This extends JsInterface (via FileJs) for runtime polymorphism.
 * 
 * IMPORTANT: Only DefaultFolder implements FolderJs.
 * - DefaultFile declares: `static implements() { return [FileJs]; }`
 * - DefaultFolder declares: `static implements() { return [FileJs, FolderJs]; }`
 * 
 * Usage:
 * ```typescript
 * // Check if a FileJs is a FolderJs
 * if (file.isFolder) {
 *   const folder = file as FolderJs;
 *   folder.childAdd(newFile);
 * }
 * 
 * // Parent is always a FolderJs
 * const parent: LazyReference<FolderJs> = file.parent;
 * ```
 * 
 * @see session/web4-jsinterface-pattern.md for full pattern documentation
 * @see session/2025-12-22-UTC-1400.jsinterface-naming-impact.pdca.md
 * @ior ior:esm:/ONCE/{version}/FolderJs
 * @pdca 2025-12-22-UTC-1100.file-folder-inheritance.pdca.md
 */

import { FileJs } from './FileJs.js';
import type { Folder } from './Folder.interface.js';
import type { Collection } from './Collection.interface.js';

/**
 * FolderJs - Runtime interface for folder components
 * 
 * - Extends FileJs (which implements File)
 * - Implements Folder for compile-time contract enforcement
 * 
 * Only DefaultFolder implements this interface.
 * Note: Uses `FileJs` (runtime type) not `File` (erased) in signatures.
 */
export abstract class FolderJs extends FileJs implements Folder {
  
  // ═══════════════════════════════════════════════════════════════
  // Container Operations
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Resolved children only
   * 
   * TODO: Migrate to Collection<FileJs> once ISR is fully implemented
   */
  abstract get children(): FileJs[];
  
  /**
   * Raw child references (includes unresolved IORs)
   * @deprecated Will be replaced by children: Collection<FileJs>
   */
  abstract get childReferences(): Collection<FileJs>;
  
  /**
   * Add a child file or folder
   */
  abstract childAdd(child: FileJs): void;
  
  /**
   * Remove a child file or folder
   * @returns true if removed, false if not found
   */
  abstract childRemove(child: FileJs): boolean;
  
  /**
   * Get child by UUID
   */
  abstract childGet(uuid: string): FileJs | null;
  
  /**
   * Find child by name
   */
  abstract childFindByName(name: string): FileJs | null;
}

