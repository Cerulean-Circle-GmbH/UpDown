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
import type { LazyReference } from '../layer3/LazyReference.interface.js';
import { SyncStatus } from '../layer3/SyncStatus.enum.js';
import { Once } from '../layer1/ONCE.js';
import { FileJs } from '../layer3/FileJs.js';
import type { File } from '../layer3/File.interface.js';

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
export class DefaultFile extends UcpComponent<FileModel> implements FileJs {
  
  // ═══════════════════════════════════════════════════════════════
  // Static Registration (P35: JsInterface for Runtime Interfaces)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Declare JsInterfaces this class implements
   * @pdca 2025-12-22-UTC-1400.jsinterface-naming-impact.pdca.md
   */
  static implements() {
    return [FileJs];
  }
  
  /**
   * Called when class is loaded - auto-registers with JsInterfaces
   */
  static override async start(): Promise<void> {
    await super.start();  // Auto-registers with FileJs
  }
  
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
   * File interface implementation
   */
  parentSet(folder: FileJs | null): void {
    this.parentFolder = folder as Reference<DefaultFolder>;
  }
  
  /**
   * Set the path of this file
   * File interface implementation
   */
  pathSet(newPath: string): void {
    this.model.path = newPath;
    this.model.modifiedAt = Date.now();
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
    // Get default scenario, then customize the model
    const scenario = link.scenarioDefault();
    scenario.model = {
      ...scenario.model,
      path: linkPath,
      filename: this.model.filename,
      name: this.model.name,
      mimetype: this.model.mimetype,
      size: this.model.size,
      contentHash: this.model.contentHash,
      isLink: true,
      linkTarget: `ior:file://${this.model.path}`
    };
    link.init(scenario);
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
    // Store as IOR string for LazyReference
    this.model.linkTarget = `ior:file://${newTarget}`;
    this.model.modifiedAt = Date.now();
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Symlink Operations (FFM.3) - Filesystem Symlinks
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Create a filesystem symlink to this file
   * 
   * FFM.3: Creates actual filesystem symlink (not just model link)
   * Also updates Unit references with the new symlink path.
   * 
   * @param symlinkPath Path where the symlink will be created
   * @returns New File component representing the symlink
   */
  async symlinkCreate(symlinkPath: string): Promise<DefaultFile> {
    const isNodeJs = Once.isNode;
    
    // 1. Create filesystem symlink
    if (isNodeJs) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const path = require('path');
        
        // Ensure target directory exists
        const targetDir = path.dirname(symlinkPath);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        // Create symlink pointing to this file
        fs.symlinkSync(this.fullPath, symlinkPath);
      } catch (error) {
        console.error('[DefaultFile] symlinkCreate filesystem error:', error);
        throw error;
      }
    }
    
    // 2. Create link component with model
    const link = this.linkCreate(symlinkPath);
    
    // 3. Update Unit references
    const unit = await this.unitGet();
    if (unit && unit.model) {
      // Add new symlink reference to Unit
      const newRef = {
        linkLocation: `ior:local:ln:file://${symlinkPath}`,
        linkTarget: `ior:unit:${unit.model.uuid}`,
        syncStatus: SyncStatus.SYNCED
      };
      if (!unit.model.references) {
        unit.model.references = [];
      }
      unit.model.references.push(newRef);
      // TODO: Save updated unit
    }
    
    return link;
  }
  
  /**
   * Check if this file is a symlink on the filesystem
   * 
   * @returns true if this is a filesystem symlink
   */
  isSymlink(): boolean {
    const isNodeJs = Once.isNode;
    
    if (isNodeJs) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        if (fs.existsSync(this.fullPath)) {
          const stats = fs.lstatSync(this.fullPath);
          return stats.isSymbolicLink();
        }
      } catch {
        return false;
      }
    }
    
    // Fallback to model
    return this.model.isLink;
  }
  
  /**
   * Get the symlink target as LazyReference
   * 
   * Returns the target file reference (IOR string or resolved File instance).
   * Use symlinkTargetPath() for the raw filesystem path.
   */
  get linkTarget(): LazyReference<File> {
    return this.model.linkTarget;
  }
  
  /**
   * Get the symlink target path from filesystem
   * 
   * @returns Target path string or null if not a symlink
   */
  symlinkTargetPath(): Reference<string> {
    const isNodeJs = Once.isNode;
    
    if (isNodeJs && this.isSymlink()) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        return fs.readlinkSync(this.fullPath);
      } catch {
        return null;
      }
    }
    
    // Extract path from IOR if stored as IOR string
    const target = this.model.linkTarget;
    if (typeof target === 'string') {
      if (target.startsWith('ior:file://')) {
        return target.replace('ior:file://', '');
      }
      return target;
    }
    
    // If resolved to File instance, get its path
    if (target && typeof target === 'object' && 'path' in target) {
      return (target as File).path;
    }
    
    return null;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Type Mirror Operations (FFM.3.5) - scenarios/type/ structure
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Create symlink in scenarios/type/ mirror for this file
   * 
   * FFM.3.5: Dual symlinks
   * - Original file stays in components/{Component}/{version}/...
   * - Unit scenario in scenarios/index/{uuid-path}/
   * - Type mirror symlink: scenarios/type/{Component}/{version}/.../{filename}.unit → scenarios/index/...
   * 
   * TRON: "°folder.unit and {filename}.unit are ONLY in scenarios/type/, NOT in component!"
   * 
   * @param projectRoot Project root path (§/)
   * @param componentName Component name (e.g., 'ONCE')
   * @param componentVersion Component version (e.g., '0.3.22.1')
   * @param unitScenarioPath Path to the unit scenario in scenarios/index/
   */
  async typeMirrorCreate(
    projectRoot: string,
    componentName: string,
    componentVersion: string,
    unitScenarioPath: string
  ): Promise<void> {
    const isNodeJs = Once.isNode;
    if (!isNodeJs) return; // Browser: handled by PWA cache
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require('path');
      
      // Calculate relative path from component root
      const componentRoot = path.join(projectRoot, 'components', componentName, componentVersion);
      const relativePath = path.relative(componentRoot, this.fullPath);
      
      // Type mirror path: scenarios/type/{Component}/{version}/{relativePath}.unit
      const typeMirrorPath = path.join(
        projectRoot,
        'scenarios',
        'type',
        componentName,
        componentVersion,
        relativePath + '.unit'
      );
      
      // Ensure parent directory exists
      const typeMirrorDir = path.dirname(typeMirrorPath);
      if (!fs.existsSync(typeMirrorDir)) {
        fs.mkdirSync(typeMirrorDir, { recursive: true });
      }
      
      // Create symlink: scenarios/type/.../file.unit → scenarios/index/.../uuid.scenario.json
      if (!fs.existsSync(typeMirrorPath)) {
        fs.symlinkSync(unitScenarioPath, typeMirrorPath);
      }
    } catch (error) {
      console.error('[DefaultFile] typeMirrorCreate error:', error);
      throw error;
    }
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
   * Move file to new path (Unit-aware)
   * 
   * FFM.2.1: Unit-aware move operation
   * - Moves file on filesystem
   * - Updates symlinks pointing to this file
   * - Updates Unit references with new paths
   * 
   * TRON: "Unit-aware move is critical — changes paths in symlinks and
   *        unit references in their model"
   * 
   * @param newPath New directory path for the file
   */
  async pathMove(newPath: string): Promise<void> {
    const oldFullPath = this.fullPath;
    const oldPath = this.model.path;
    
    // Update model first
    this.model.path = newPath;
    this.model.modifiedAt = Date.now();
    
    const newFullPath = this.fullPath;
    const isNodeJs = Once.isNode;
    
    // 1. Move actual file on filesystem
    if (isNodeJs) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        if (fs.existsSync(oldFullPath)) {
          // Ensure target directory exists
          const targetDir = newPath;
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          // Move file
          fs.renameSync(oldFullPath, newFullPath);
        }
      } catch (error) {
        // Rollback model on error
        this.model.path = oldPath;
        console.error('[DefaultFile] pathMove filesystem error:', error);
        throw error;
      }
    }
    
    // 2. Update Unit references (if Unit exists)
    const unit = await this.unitGet();
    if (unit && unit.model && unit.model.references) {
      // Update each reference that points to old path
      for (const ref of unit.model.references) {
        if (ref.linkLocation.includes(oldFullPath)) {
          ref.linkLocation = ref.linkLocation.replace(oldFullPath, newFullPath);
        }
      }
      // TODO: Save updated unit via unit.save()
    }
    
    // 3. Move .unit symlink if exists
    if (isNodeJs) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        const oldUnitPath = oldFullPath + '.unit';
        const newUnitPath = newFullPath + '.unit';
        if (fs.existsSync(oldUnitPath)) {
          // Read symlink target (absolute scenario path)
          const scenarioPath = fs.readlinkSync(oldUnitPath);
          // Remove old symlink
          fs.unlinkSync(oldUnitPath);
          // Create new symlink at new location
          fs.symlinkSync(scenarioPath, newUnitPath);
        }
      } catch (error) {
        console.error('[DefaultFile] pathMove .unit symlink error:', error);
        // Non-fatal: continue even if symlink move fails
      }
    }
  }
  
  /**
   * Rename file (Unit-aware)
   * 
   * @param newName New filename
   */
  async rename(newName: string): Promise<void> {
    const oldFullPath = this.fullPath;
    const oldFilename = this.model.filename;
    
    // Update model
    this.model.filename = newName;
    this.model.name = newName;
    this.model.modifiedAt = Date.now();
    
    const newFullPath = this.fullPath;
    const isNodeJs = Once.isNode;
    
    // 1. Rename actual file on filesystem
    if (isNodeJs) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        if (fs.existsSync(oldFullPath)) {
          fs.renameSync(oldFullPath, newFullPath);
        }
      } catch (error) {
        // Rollback model on error
        this.model.filename = oldFilename;
        this.model.name = oldFilename;
        console.error('[DefaultFile] rename filesystem error:', error);
        throw error;
      }
    }
    
    // 2. Update Unit references
    const unit = await this.unitGet();
    if (unit && unit.model && unit.model.references) {
      for (const ref of unit.model.references) {
        if (ref.linkLocation.includes(oldFullPath)) {
          ref.linkLocation = ref.linkLocation.replace(oldFullPath, newFullPath);
        }
      }
    }
    
    // 3. Rename .unit symlink if exists
    if (isNodeJs) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        const oldUnitPath = oldFullPath + '.unit';
        const newUnitPath = newFullPath + '.unit';
        if (fs.existsSync(oldUnitPath)) {
          const scenarioPath = fs.readlinkSync(oldUnitPath);
          fs.unlinkSync(oldUnitPath);
          fs.symlinkSync(scenarioPath, newUnitPath);
        }
      } catch (error) {
        console.error('[DefaultFile] rename .unit symlink error:', error);
      }
    }
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
    if (Once.isNode) {
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
   * Folder type accessor - File is NEVER a folder
   * Overridden in DefaultFolder to return true
   */
  get isFolder(): boolean {
    return false;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // File Interface Implementation (P35: JsInterface)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get file path (delegated to model)
   */
  get path(): string {
    return this.model.path;
  }
  
  /**
   * Get file name (delegated to model)
   * P16: TypeScript accessor
   */
  get name(): string {
    return this.model.name;
  }
  
  /**
   * Set file name (sync - model only, no filesystem)
   * P16: TypeScript accessor
   * 
   * For filesystem rename, use rename() async method.
   */
  set name(value: string) {
    this.model.name = value;
    this.model.filename = value;
    this.model.modifiedAt = Date.now();
  }
  
  /**
   * Get file UUID (delegated to model)
   */
  get uuid(): string {
    return this.model.uuid;
  }
  
  /**
   * Get file size in bytes
   * P16: TypeScript accessor
   */
  get size(): number {
    return this.model.size;
  }
  
  /**
   * Get file MIME type
   * P16: TypeScript accessor
   */
  get mimetype(): string {
    return this.model.mimetype;
  }
  
  /**
   * Set file MIME type
   * P16: TypeScript accessor
   */
  set mimetype(value: string) {
    this.model.mimetype = value;
    this.model.modifiedAt = Date.now();
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
    const isNodeJs = Once.isNode;
    
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
    const isNodeJs = Once.isNode;
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
          // Store target as IOR string for LazyReference
          const targetPath = fs.readlinkSync(this.fullPath);
          this.model.linkTarget = `ior:file://${targetPath}`;
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
    
    const isNodeJs = Once.isNode;
    
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
    
    const isNodeJs = Once.isNode;
    
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



















