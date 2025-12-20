/**
 * DefaultFile.ts - File Component Implementation
 * 
 * Represents a file in the Web4 FileSystem.
 * Manages file content, hash computation, and link operations.
 * 
 * File is a LEAF node in the Tree hierarchy:
 * - Has parent (set by Folder when added)
 * - CANNOT have children (leaf node)
 * - Folder extends File and adds Tree capabilities
 * 
 * Web4 Principles:
 * - P4: Radical OOP - File IS a UcpComponent
 * - P6: Empty constructor, async init
 * - P7: Layer 2 sync methods, Layer 4 for async I/O
 * - P24: RelatedObjects for unit/artefact (via UcpComponent base)
 * 
 * @ior ior:esm:/ONCE/{version}/DefaultFile
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { UcpComponent } from './UcpComponent.js';
import { FileModel } from '../layer3/FileModel.interface.js';
import { Reference } from '../layer3/Reference.interface.js';

// Forward declaration to avoid circular import
import type { DefaultFolder } from './DefaultFolder.js';

/**
 * DefaultFile - File component for Web4 FileSystem
 * 
 * File is a LEAF node:
 * - Has parent (Folder that contains it)
 * - Cannot have children (use Folder for that)
 * 
 * Lifecycle:
 * 1. Created via FileSystem.fileCreate(blob, mimetype, name)
 * 2. Content hash computed (SHA-256)
 * 3. Unit + Artefact created via scenarioCreate()
 * 4. Synced to server via FileOrchestrator
 * 
 * Content Access:
 * - Content NOT stored in model (can't serialize Blob)
 * - Loaded on-demand via contentLoad()
 * - objectUrl created for display
 */
export class DefaultFile extends UcpComponent<FileModel> {
  
  // ═══════════════════════════════════════════════════════════════
  // Tree Structure (File is a LEAF - no children)
  // ═══════════════════════════════════════════════════════════════
  
  /** Parent folder (set when added to a folder) */
  private parentFolder: Reference<DefaultFolder> = null;
  
  /**
   * Get parent folder
   * 
   * Returns null for orphan files (not yet added to a folder).
   */
  get parent(): Reference<DefaultFolder> {
    return this.parentFolder;
  }
  
  /**
   * Set parent folder (called by Folder.childAdd)
   * @internal
   */
  parentSet(folder: Reference<DefaultFolder>): void {
    this.parentFolder = folder;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Runtime Content (NOT in model - can't serialize Blobs)
  // ═══════════════════════════════════════════════════════════════
  
  /** Runtime object URL for display (created from content Blob) */
  private runtimeObjectUrl: Reference<string> = null;
  
  /** Runtime array buffer (created on demand for hashing) */
  private runtimeArrayBuffer: Reference<ArrayBuffer> = null;
  
  // ═══════════════════════════════════════════════════════════════
  // Initialization
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Provide default model for new files
   */
  protected modelDefault(): FileModel {
    const now = Date.now();
    return {
      uuid: this.uuidCreate(),
      name: 'New File',
      path: '/',
      filename: 'untitled',
      mimetype: 'application/octet-stream',
      size: 0,
      contentHash: null,
      createdAt: now,
      modifiedAt: now,
      isLink: false,
      linkTarget: null,
      content: null
    };
  }
  
  /**
   * Initialize file from Blob content
   * 
   * @param blob File content as Blob
   * @param filename Original filename
   * @param mimetype MIME type
   * @returns this for chaining
   */
  async initFromBlob(blob: Blob, filename: string, mimetype: string): Promise<this> {
    // Initialize with defaults first
    await this.init();
    
    // Update model with file info
    this.model.filename = filename;
    this.model.name = filename;
    this.model.mimetype = mimetype;
    this.model.size = blob.size;
    this.model.modifiedAt = Date.now();
    
    // Store content in model (IndexedDB supports native Blob)
    this.model.content = blob;
    
    // Compute content hash
    await this.contentHashCompute();
    
    return this;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Content Access
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get file content Blob
   */
  get content(): Reference<Blob> {
    return this.model.content;
  }
  
  /**
   * Set file content Blob
   */
  set content(blob: Reference<Blob>) {
    this.model.content = blob;
  }
  
  /**
   * Check if content is loaded
   */
  get hasContent(): boolean {
    return this.model.content !== null;
  }
  
  /**
   * Get Object URL for display (creates if needed)
   */
  get objectUrl(): Reference<string> {
    if (!this.model.content) return null;
    
    if (!this.runtimeObjectUrl) {
      this.runtimeObjectUrl = URL.createObjectURL(this.model.content);
    }
    return this.runtimeObjectUrl;
  }
  
  /**
   * Revoke Object URL when no longer needed
   */
  objectUrlRevoke(): void {
    if (this.runtimeObjectUrl) {
      URL.revokeObjectURL(this.runtimeObjectUrl);
      this.runtimeObjectUrl = null;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Hash Computation
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Compute SHA-256 hash of content
   * Used for Artefact content hash (deduplication)
   */
  async contentHashCompute(): Promise<string> {
    if (!this.model.content) {
      throw new Error('[DefaultFile] No content to hash');
    }
    
    this.runtimeArrayBuffer = await this.model.content.arrayBuffer();
    
    // Use ContentIDProvider for SHA-256 (via UcpComponent)
    const hashHex = await this.contentIdCreate(this.runtimeArrayBuffer);
    
    this.model.contentHash = hashHex;
    return hashHex;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Link Operations (Sync - Layer 2)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Create a symbolic link to this file
   * 
   * @param linkPath Path where the link will be created
   * @returns New File component representing the link
   */
  linkCreate(linkPath: string): DefaultFile {
    const link = new DefaultFile();
    link.initSync({
      model: {
        ...this.modelDefault(),
        uuid: this.uuidCreate(),
        path: linkPath,
        filename: this.model.filename,
        name: this.model.name,
        mimetype: this.model.mimetype,
        size: this.model.size,
        contentHash: this.model.contentHash,
        isLink: true,
        linkTarget: this.model.path
      }
    });
    return link;
  }
  
  /**
   * Move a link to a new target (recalculates stable reference)
   * 
   * @param newTarget New target path
   */
  linkMove(newTarget: string): void {
    if (!this.model.isLink) {
      throw new Error('[DefaultFile] Cannot move link target: not a link');
    }
    this.model.linkTarget = newTarget;
    this.model.modifiedAt = Date.now();
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Path Operations
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get full path including filename
   */
  get fullPath(): string {
    const path = this.model.path.endsWith('/') 
      ? this.model.path 
      : this.model.path + '/';
    return path + this.model.filename;
  }
  
  /**
   * Move file to new path
   * 
   * @param newPath New path for the file
   */
  pathMove(newPath: string): void {
    this.model.path = newPath;
    this.model.modifiedAt = Date.now();
  }
  
  /**
   * Rename file
   * 
   * @param newName New filename
   */
  rename(newName: string): void {
    this.model.filename = newName;
    this.model.name = newName;
    this.model.modifiedAt = Date.now();
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Cleanup
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Release resources
   */
  dispose(): void {
    this.objectUrlRevoke();
    this.model.content = null;
    this.runtimeArrayBuffer = null;
  }
}



















