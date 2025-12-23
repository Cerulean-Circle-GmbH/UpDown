/**
 * File.ts - Runtime Interface for File Components
 * 
 * ✅ Web4 Principle 35: JsInterface for Runtime Interfaces
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
 * Note: Tree navigation (parent, children) is handled by Tree<T> interface.
 * File interface only defines core file properties and type discrimination.
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
 * @ior ior:esm:/ONCE/{version}/File
 * @pdca 2025-12-22-UTC-1100.file-folder-inheritance.pdca.md
 */

import { JsInterface } from './JsInterface.js';

/**
 * File - Runtime interface for file system nodes
 * 
 * Both DefaultFile and DefaultFolder implement this interface.
 * Extends JsInterface for runtime type introspection.
 * 
 * Note: This interface defines ONLY the properties needed for:
 * - RelatedObjects registration/lookup
 * - Type discrimination (isFile/isFolder)
 * - Basic identification (path, name, uuid)
 * 
 * Tree navigation (parent, children) is handled by Tree<T> interface.
 */
export abstract class File extends JsInterface {
  
  // ═══════════════════════════════════════════════════════════════
  // Core Properties
  // ═══════════════════════════════════════════════════════════════
  
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
}

