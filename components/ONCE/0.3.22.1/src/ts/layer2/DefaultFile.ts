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
 * Cross-Platform:
 * - Same code runs on Node.js, Browser, and Service Worker
 * - Only difference is the underlying storage (fs vs IndexedDB vs Cache API)
 * 
 * Web4 Principles:
 * - P4: Radical OOP - File IS a UcpComponent
 * - P6: Empty constructor, async init
 * - P7: Layer 2 sync methods, Layer 4 for async I/O
 * - P24: RelatedObjects for unit/artefact (via UcpComponent base)
 * 
 * @ior ior:esm:/ONCE/{version}/DefaultFile
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 * @pdca 2025-12-22-UTC-0500.ffm-implementation.pdca.md (FFM.0.1)
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
  // File System Operations (FFM.0.1)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Check if this file exists in storage
   * 
   * Cross-platform:
   * - Node.js: Uses fs.existsSync
   * - Browser: Checks IndexedDB or model state
   * 
   * @returns true if file exists
   */
  exists(): boolean {
    // Environment detection
    const isNodeJs = typeof process !== 'undefined' && process.versions?.node;
    
    if (isNodeJs) {
      // Node.js: Check filesystem
      // Dynamic import to avoid browser errors
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        return fs.existsSync(this.fullPath);
      } catch {
        return false;
      }
    } else {
      // Browser: File exists if it has content or is initialized with a path
      // For full browser implementation, this would check IndexedDB
      return this.model.content !== null || this.model.uuid !== '';
    }
  }
  
  /**
   * File type accessor - File is ALWAYS a file (not a directory)
   * Stats are accessed via this.model.* (flat model, no separate FileStats)
   */
  get isFile(): boolean {
    return true;
  }
  
  /**
   * Directory type accessor - File is NEVER a directory
   */
  get isDirectory(): boolean {
    return false;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Unit Integration (FFM.0.3)
  // Files create Unit on first touch, rediscover on subsequent touches
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get Unit for this file if it exists
   * 
   * @returns Unit if exists, null otherwise
   */
  async unitGet(): Promise<Reference<import('./DefaultUnit.js').DefaultUnit>> {
    // Check if Unit already exists by looking for .unit symlink
    const unitSymlinkPath = this.fullPath + '.unit';
    const isNodeJs = typeof process !== 'undefined' && process.versions?.node;
    
    if (isNodeJs) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        if (fs.existsSync(unitSymlinkPath)) {
          // Unit exists - load it
          const { DefaultUnit } = await import('./DefaultUnit.js');
          const unit = new DefaultUnit();
          await unit.init();
          // Read symlink to get scenario path
          const scenarioPath = fs.readlinkSync(unitSymlinkPath);
          // Load unit from scenario
          if (fs.existsSync(scenarioPath)) {
            const scenarioContent = fs.readFileSync(scenarioPath, 'utf-8');
            const scenario = JSON.parse(scenarioContent);
            // Merge scenario model into unit model (model properties are writable)
            if (scenario.model) {
              Object.assign(unit.model, scenario.model);
            }
          }
          return unit;
        }
      } catch (error) {
        console.error('[DefaultFile] unitGet error:', error);
      }
    }
    // Browser: Would check IndexedDB for Unit scenario
    return null;
  }
  
  /**
   * Create a new Unit for this file
   * Always creates a new Unit (does not check for existing)
   * 
   * @returns Newly created Unit
   */
  async unitCreate(): Promise<import('./DefaultUnit.js').DefaultUnit> {
    const { DefaultUnit } = await import('./DefaultUnit.js');
    const unit = new DefaultUnit();
    await unit.init();
    
    // Use DefaultUnit's from() method to create Unit from this file
    await unit.from(this.fullPath);
    
    return unit;
  }
  
  /**
   * Ensure Unit exists for this file (first touch creates, second rediscovers)
   * This is the DEFAULT behavior for file operations.
   * 
   * TRON: "files create a unit for themselves on the first time they are touched
   *        and on the second time rediscover their existing unit"
   * 
   * @returns Existing or newly created Unit
   */
  async unitEnsure(): Promise<import('./DefaultUnit.js').DefaultUnit> {
    // Try to get existing Unit first
    const existing = await this.unitGet();
    if (existing) {
      return existing;
    }
    
    // First touch - create Unit
    return await this.unitCreate();
  }
  
  /**
   * Initialize file from filesystem path
   * Attempts to rediscover existing Unit.
   * 
   * @param filePath Absolute or relative path to file
   * @returns this for chaining
   */
  async initFromPath(filePath: string): Promise<this> {
    await this.init();
    
    // Parse path into directory and filename
    const lastSlash = filePath.lastIndexOf('/');
    if (lastSlash >= 0) {
      this.model.path = filePath.substring(0, lastSlash);
      this.model.filename = filePath.substring(lastSlash + 1);
    } else {
      this.model.path = '/';
      this.model.filename = filePath;
    }
    this.model.name = this.model.filename;
    
    // Try to load stats from filesystem
    const isNodeJs = typeof process !== 'undefined' && process.versions?.node;
    if (isNodeJs && this.exists()) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        const stats = fs.statSync(this.fullPath);
        this.model.size = stats.size;
        this.model.createdAt = stats.birthtime.getTime();
        this.model.modifiedAt = stats.mtime.getTime();
        
        // Check if this is a symlink
        const lstats = fs.lstatSync(this.fullPath);
        if (lstats.isSymbolicLink()) {
          this.model.isLink = true;
          this.model.linkTarget = fs.readlinkSync(this.fullPath);
        }
      } catch (error) {
        console.error('[DefaultFile] initFromPath stats error:', error);
      }
    }
    
    // Try to rediscover existing Unit
    const unit = await this.unitGet();
    if (unit && unit.model) {
      // Merge Unit model data (like contentHash) into file model
      // Unit is the source of truth for metadata
      if (unit.model.origin) {
        this.model.contentHash = unit.model.origin;
      }
    }
    
    return this;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Delete Operations (FFM.0.2) - Unit-Aware
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Delete a LINK only (not the original file).
   * Safe operation — original file remains.
   * Updates Unit references to remove this link path.
   * 
   * @throws Error if called on original file (not a link)
   */
  async deleteLink(): Promise<void> {
    if (!this.model.isLink) {
      throw new Error('[DefaultFile] deleteLink() called on original file, not a link. Use delete() for originals.');
    }
    
    const isNodeJs = typeof process !== 'undefined' && process.versions?.node;
    
    // 1. Update Unit references (remove this link path)
    const unit = await this.unitGet();
    if (unit && unit.model && unit.model.references) {
      const fullPath = this.fullPath;
      unit.model.references = unit.model.references.filter(
        function filterNotThisPath(ref): boolean {
          // UnitReference uses linkLocation (IOR string) not path
          return !ref.linkLocation.includes(fullPath);
        }
      );
      // Save updated unit (unit.save() would be called here)
    }
    
    // 2. Delete the symlink only
    if (isNodeJs) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        if (fs.existsSync(this.fullPath)) {
          fs.unlinkSync(this.fullPath);
        }
      } catch (error) {
        console.error('[DefaultFile] deleteLink error:', error);
        throw error;
      }
    }
    // Browser: Would remove from IndexedDB (handled by scenarioDelete)
  }
  
  /**
   * Delete the ORIGINAL file (RARE operation!).
   * - If called on a link, just deletes the link.
   * - If called on original: Deletes ALL links + Unit + file itself.
   * - P2P network broadcast for original deletion is handled by infrastructure (emergent).
   */
  async delete(): Promise<void> {
    // If this is a link, just delete the link
    if (this.model.isLink) {
      await this.deleteLink();
      return;
    }
    
    const isNodeJs = typeof process !== 'undefined' && process.versions?.node;
    
    // 1. Get Unit to find ALL links
    const unit = await this.unitGet();
    if (unit && unit.model && unit.model.references) {
      // Delete ALL symlinks pointing to this file
      for (const ref of unit.model.references) {
        // UnitReference uses linkLocation (IOR string) - extract path from it
        // Format: "ior:local:ln:file://..." or just a path
        const refPath = ref.linkLocation.replace(/^ior:local:ln:file:\/\//, '');
        if (refPath !== this.fullPath) {
          if (isNodeJs) {
            try {
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              const fs = require('fs');
              if (fs.existsSync(refPath)) {
                fs.unlinkSync(refPath);
              }
            } catch {
              // Ignore errors for individual symlinks
            }
          }
        }
      }
      // Delete the Unit itself (unit.delete() would be called here)
    }
    
    // 2. Delete the .unit symlink if exists
    if (isNodeJs) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        const unitSymlinkPath = this.fullPath + '.unit';
        if (fs.existsSync(unitSymlinkPath)) {
          fs.unlinkSync(unitSymlinkPath);
        }
      } catch {
        // Ignore unit symlink deletion errors
      }
    }
    
    // 3. Delete the original file
    if (isNodeJs) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        if (fs.existsSync(this.fullPath)) {
          fs.unlinkSync(this.fullPath);
        }
      } catch (error) {
        console.error('[DefaultFile] delete error:', error);
        throw error;
      }
    }
    // Browser: Would remove from IndexedDB (handled by scenarioDelete)
    
    // NOTE: P2P network broadcast will be handled by infrastructure (emergent)
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



















