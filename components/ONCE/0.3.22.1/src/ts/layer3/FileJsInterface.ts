/**
 * FileJsInterface.ts - Runtime Interface for File Components
 * 
 * ✅ Web4 Principle 35: JsInterface for Runtime Interfaces
 * 
 * This is the RUNTIME representation of File.interface.ts.
 * 
 * Pattern: JsInterface Pattern
 * - File (File.interface.ts): Compile-time contract, erased at runtime
 * - FileJsInterface (this file): Abstract class extending JsInterface, implements File
 * - DefaultFile: Concrete class, implements FileJsInterface (and thus File)
 * 
 * TypeScript interfaces are erased at runtime. FileJsInterface extends JsInterface
 * to exist at runtime for:
 * - RelatedObjects: `image.relatedObjectRegister(FileJsInterface, imageFile)`
 * - Implementation lookup: `FileJsInterface.implementations` → [DefaultFile, DefaultFolder]
 * - Runtime polymorphism: Both DefaultFile and DefaultFolder implement FileJsInterface
 * 
 * IMPORTANT: Folder IS-A File!
 * - DefaultFile implements FileJsInterface (leaf node)
 * - DefaultFolder implements FileJsInterface (can have children)
 * - Both register with `FileJsInterface.implementationRegister(ClassName)`
 * 
 * Usage:
 * ```typescript
 * // In Image component - store related file
 * image.relatedObjectRegister(FileJsInterface, imageFile);
 * 
 * // Lookup later
 * const file = image.relatedObjectLookupFirst(FileJsInterface);
 * ```
 * 
 * @see session/web4-jsinterface-pattern.md for full pattern documentation
 * @see session/web4-component-anatomy-details.md for component anatomy
 * @ior ior:esm:/ONCE/{version}/FileJsInterface
 * @pdca 2025-12-22-UTC-1100.file-folder-inheritance.pdca.md
 */

import { JsInterface } from './JsInterface.js';
import type { File } from './File.interface.js';
import type { Model } from './Model.interface.js';

/**
 * FileJsInterface - Runtime interface for file system nodes
 * 
 * Both DefaultFile and DefaultFolder implement this interface.
 * - Extends JsInterface for runtime type introspection
 * - Implements File for compile-time contract enforcement
 * 
 * Note: Abstract methods use `FileJsInterface` (runtime type) not `File` (erased)
 * for parameters that need to exist at runtime.
 */
export abstract class FileJsInterface extends JsInterface implements File {
  
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
   * Called by FolderJsInterface.childAdd() and FolderJsInterface.childRemove()
   */
  abstract parentSet(folder: FileJsInterface | null): void;
  
  /**
   * Set the path of this file/folder
   * Called when moving files or updating child paths
   */
  abstract pathSet(newPath: string): void;
}

