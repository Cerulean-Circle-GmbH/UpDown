/**
 * DefaultFile.ts - File Component Implementation
 * 
 * Represents a file in the Web4 FileSystem.
 * Manages file content, hash computation, and link operations.
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
import { FileModel, FileContent } from '../layer3/FileModel.interface.js';
import { Reference } from '../layer3/Reference.interface.js';
/**
 * Generate UUID (browser-compatible)
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * DefaultFile - File component for Web4 FileSystem
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
  // Runtime Content (NOT in model - can't serialize Blobs)
  // ═══════════════════════════════════════════════════════════════
  
  /** Runtime file content */
  private _content: Reference<FileContent> = null;
  
  // ═══════════════════════════════════════════════════════════════
  // Initialization
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Provide default model for new files
   */
  protected modelDefault(): FileModel {
    const now = Date.now();
    return {
      uuid: generateUUID(),
      name: 'New File',
      path: '/',
      filename: 'untitled',
      mimetype: 'application/octet-stream',
      size: 0,
      contentHash: null,
      createdAt: now,
      modifiedAt: now,
      isLink: false,
      linkTarget: null
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
    
    // Store content
    this._content = {
      blob,
      objectUrl: null,
      arrayBuffer: null
    };
    
    // Compute content hash
    await this.contentHashCompute();
    
    return this;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Content Access
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get file content (loads if not in memory)
   */
  get content(): Reference<FileContent> {
    return this._content;
  }
  
  /**
   * Check if content is loaded
   */
  get hasContent(): boolean {
    return this._content !== null;
  }
  
  /**
   * Get Object URL for display (creates if needed)
   */
  get objectUrl(): Reference<string> {
    if (!this._content) return null;
    
    if (!this._content.objectUrl) {
      this._content.objectUrl = URL.createObjectURL(this._content.blob);
    }
    return this._content.objectUrl;
  }
  
  /**
   * Revoke Object URL when no longer needed
   */
  objectUrlRevoke(): void {
    if (this._content?.objectUrl) {
      URL.revokeObjectURL(this._content.objectUrl);
      this._content.objectUrl = null;
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
    if (!this._content?.blob) {
      throw new Error('[DefaultFile] No content to hash');
    }
    
    const arrayBuffer = await this._content.blob.arrayBuffer();
    this._content.arrayBuffer = arrayBuffer;
    
    // Compute SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
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
        uuid: generateUUID(),
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
    this._content = null;
  }
}
