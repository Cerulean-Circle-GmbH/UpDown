/**
 * FileJs.ts - Runtime Interface for File Components
 * 
 * ✅ Web4 Principle 35: JsInterface for Runtime Interfaces
 * 
 * This is the RUNTIME representation of File.interface.ts.
 * Named "FileJs" to avoid collision with browser's global File type.
 * 
 * Pattern: JsInterface Pattern
 * - File (File.interface.ts): Compile-time contract, erased at runtime
 * - FileJs (this file): Abstract class extending JsInterface, implements File
 * - DefaultFile: Concrete class, implements FileJs (and thus File)
 * 
 * TypeScript interfaces are erased at runtime. FileJs extends JsInterface
 * to exist at runtime for:
 * - RelatedObjects: `image.relatedObjectRegister(FileJs, imageFile)`
 * - Implementation lookup: `FileJs.implementations` → [DefaultFile, DefaultFolder]
 * - Runtime polymorphism: Both DefaultFile and DefaultFolder implement FileJs
 * 
 * IMPORTANT: Folder IS-A File!
 * - DefaultFile implements FileJs (leaf node)
 * - DefaultFolder implements FileJs (can have children)
 * - Both declare in `static implements() { return [FileJs]; }`
 * 
 * Usage:
 * ```typescript
 * // In Image component - store related file
 * image.relatedObjectRegister(FileJs, imageFile);
 * 
 * // Lookup later
 * const file = image.relatedObjectLookupFirst(FileJs);
 * ```
 * 
 * @see session/web4-jsinterface-pattern.md for full pattern documentation
 * @see session/2025-12-22-UTC-1400.jsinterface-naming-impact.pdca.md
 * @ior ior:esm:/ONCE/{version}/FileJs
 * @pdca 2025-12-22-UTC-1100.file-folder-inheritance.pdca.md
 */

import { JsInterface } from './JsInterface.js';
import type { File } from './File.interface.js';
import type { Model } from './Model.interface.js';

/**
 * FileJs - Runtime interface for file system nodes
 * 
 * Both DefaultFile and DefaultFolder implement this interface.
 * - Extends JsInterface for runtime type introspection
 * - Implements File for compile-time contract enforcement
 * 
 * Note: Abstract methods use `FileJs` (runtime type) not `File` (erased)
 * for parameters that need to exist at runtime.
 */
export abstract class FileJs extends JsInterface implements File {
  
  // ═══════════════════════════════════════════════════════════════
  // Core Properties
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Model containing uuid, name, and type-specific properties
   * 
   * Returns Model (base type) — implementations return FileModel or FolderModel.
   * Model provides uuid and name which is sufficient for tree operations.
   */
  abstract get model(): Model;
  
  /**
   * Full path of the file/folder
   */
  abstract get path(): string;
  
  /**
   * Display name
   */
  abstract get name(): string;
  
  /**
   * UUID of this file/folder
   */
  abstract get uuid(): string;
  
  // ═══════════════════════════════════════════════════════════════
  // Type Discrimination
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * True if this is a file (leaf node)
   */
  abstract get isFile(): boolean;
  
  /**
   * True if this is a folder (can have children)
   */
  abstract get isFolder(): boolean;
  
  // ═══════════════════════════════════════════════════════════════
  // Existence & Operations
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Check if this file/folder exists on the underlying storage
   */
  abstract exists(): boolean;
  
  /**
   * Delete this file/folder
   * For folders: recursive delete of children
   */
  abstract delete(): Promise<void>;
  
  // ═══════════════════════════════════════════════════════════════
  // Tree Operations (for Folder.childAdd/childRemove)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Set parent folder reference
   * Called by FolderJs.childAdd() and FolderJs.childRemove()
   */
  abstract parentSet(folder: FileJs | null): void;
  
  /**
   * Set the path of this file/folder
   * Called when moving files or updating child paths
   */
  abstract pathSet(newPath: string): void;
}

