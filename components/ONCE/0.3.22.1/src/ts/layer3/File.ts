/**
 * File.ts - Runtime Interface for File Components
 * 
 * ✅ Web4 Principle 35: JsInterface for Runtime Interfaces
 * 
 * This is the RUNTIME representation of IFile.interface.ts.
 * 
 * Pattern: JsInterface Pattern
 * - IFile (IFile.interface.ts): Compile-time contract, erased at runtime
 * - File (this file): Abstract class extending JsInterface, implements IFile
 * - DefaultFile: Concrete class, implements File (and thus IFile)
 * 
 * TypeScript interfaces are erased at runtime. File extends JsInterface
 * to exist at runtime for:
 * - RelatedObjects: `image.relatedObjectRegister(File, imageFile)`
 * - Implementation lookup: `File.implementations` → [DefaultFile, DefaultFolder]
 * - Runtime polymorphism: Both DefaultFile and DefaultFolder implement File
 * 
 * IMPORTANT: Folder IS-A File!
 * - DefaultFile implements File (leaf node)
 * - DefaultFolder implements File (can have children)
 * - Both register with `File.implementationRegister(ClassName)`
 * 
 * Usage:
 * ```typescript
 * // In Image component - store related file
 * image.relatedObjectRegister(File, imageFile);
 * 
 * // Lookup later
 * const file = image.relatedObjectLookupFirst(File);
 * ```
 * 
 * @see ./web4-jsinterface-pattern.md for full pattern documentation
 * @ior ior:esm:/ONCE/{version}/File
 * @pdca 2025-12-22-UTC-1100.file-folder-inheritance.pdca.md
 */

import { JsInterface } from './JsInterface.js';
import type { IFile } from './IFile.interface.js';
import type { Model } from './Model.interface.js';

/**
 * File - Runtime interface for file system nodes
 * 
 * Both DefaultFile and DefaultFolder implement this interface.
 * - Extends JsInterface for runtime type introspection
 * - Implements IFile for compile-time contract enforcement
 * 
 * Note: Abstract methods use `File` (runtime type) not `IFile` (erased)
 * for parameters that need to exist at runtime.
 */
export abstract class File extends JsInterface implements IFile {
  
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
   * Called by Folder.childAdd() and Folder.childRemove()
   */
  abstract parentSet(folder: File | null): void;
  
  /**
   * Set the path of this file/folder
   * Called when moving files or updating child paths
   */
  abstract pathSet(newPath: string): void;
}

