/**
 * Folder.ts - Runtime Interface for Folder Components
 * 
 * ✅ Web4 Principle 35: JsInterface for Runtime Interfaces
 * 
 * Folder extends File - a Folder IS-A File that can have children.
 * This extends JsInterface (via File) for runtime polymorphism.
 * 
 * IMPORTANT: Only DefaultFolder implements Folder.
 * - DefaultFile implements File (leaf node)
 * - DefaultFolder implements File AND Folder (can have children)
 * 
 * Usage:
 * ```typescript
 * // Check if a File is a Folder
 * if (file.isFolder) {
 *   const folder = file as Folder;
 *   folder.childAdd(newFile);
 * }
 * 
 * // Parent is always a Folder
 * const parent: LazyReference<Folder> = file.parent;
 * ```
 * 
 * @ior ior:esm:/ONCE/{version}/Folder
 * @pdca 2025-12-22-UTC-1100.file-folder-inheritance.pdca.md
 */

import { File } from './File.js';
import type { Collection } from './Collection.interface.js';

/**
 * Folder - Runtime interface for folder components
 * 
 * Extends File with container capabilities.
 * Only DefaultFolder implements this interface.
 */
export abstract class Folder extends File {
  
  // ═══════════════════════════════════════════════════════════════
  // Container Operations
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get resolved children
   * @returns Array of resolved File instances
   */
  abstract get children(): File[];
  
  /**
   * Get raw child references (may include unresolved IORs)
   */
  abstract get childReferences(): Collection<File>;
  
  /**
   * Add a child file or folder
   */
  abstract childAdd(child: File): void;
  
  /**
   * Remove a child file or folder
   * @returns true if removed, false if not found
   */
  abstract childRemove(child: File): boolean;
  
  /**
   * Get child by UUID
   */
  abstract childGet(uuid: string): File | null;
  
  /**
   * Find child by name
   */
  abstract childFindByName(name: string): File | null;
}

