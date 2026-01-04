/**
 * File.interface.ts - TypeScript Interface for File Components
 * 
 * This is the COMPILE-TIME contract for file-like objects.
 * It is ERASED at runtime — for runtime existence, see FileJs.ts.
 * 
 * Pattern: JsInterface Pattern (P35)
 * - File (this file): Compile-time contract, erased at runtime
 * - FileJs (FileJs.ts): Abstract class extending JsInterface, implements File
 * - DefaultFile: Concrete class, implements FileJs (and thus File)
 * 
 * Web4 Principles:
 * - P19: One File One Type
 * - P35: JsInterface for Runtime Interfaces
 * 
 * @see session/web4-jsinterface-pattern.md for full pattern documentation
 * @see session/web4-component-anatomy-details.md for component anatomy
 * @ior ior:esm:/ONCE/{version}/File
 */

import type { Model } from './Model.interface.js';

/**
 * File - TypeScript interface for file-like objects
 * 
 * Both files and folders implement this interface.
 * Folders extend this with container capabilities (see Folder.interface.ts).
 */
export interface File {
  // ═══════════════════════════════════════════════════════════════
  // Identity
  // ═══════════════════════════════════════════════════════════════
  
  /** Unique identifier */
  readonly uuid: string;
  
  /** Display name */
  readonly name: string;
  
  /** Full path */
  readonly path: string;
  
  // ═══════════════════════════════════════════════════════════════
  // Type Discrimination
  // ═══════════════════════════════════════════════════════════════
  
  /** True if this is a leaf file (not a folder) */
  readonly isFile: boolean;
  
  /** True if this is a folder (can have children) */
  readonly isFolder: boolean;
  
  // ═══════════════════════════════════════════════════════════════
  // Model Access
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * The underlying model (FileModel or FolderModel)
   * 
   * Returns base Model type for covariance.
   * Implementations return their specific model type.
   */
  readonly model: Model;
  
  // ═══════════════════════════════════════════════════════════════
  // Existence & Operations
  // ═══════════════════════════════════════════════════════════════
  
  /** Check if this file/folder exists on storage */
  exists(): boolean;
  
  /** Delete this file/folder (folders: recursive) */
  delete(): Promise<void>;
  
  // ═══════════════════════════════════════════════════════════════
  // Tree Operations
  // ═══════════════════════════════════════════════════════════════
  
  /** Set parent reference (called by Folder.childAdd/childRemove) */
  parentSet(parent: File | null): void;
  
  /** Update path (called when moving) */
  pathSet(newPath: string): void;
}

