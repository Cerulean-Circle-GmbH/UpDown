/**
 * DefaultFolder.ts - Folder Component Implementation
 * 
 * Represents a folder/directory in the Web4 FileSystem.
 * Manages child files and folders, supports link operations.
 * 
 * Folder implements Tree<FileSystemNode>:
 * - Folders ARE Files (specialized)
 * - Files CANNOT have children (leaf nodes)
 * - Folders CAN add files/folders as children
 * 
 * Cross-Platform:
 * - Same code runs on Node.js, Browser, and Service Worker
 * - Only difference is the underlying storage (fs vs IndexedDB vs Cache API)
 * 
 * Web4 Principles:
 * - P4: Radical OOP - Folder IS a File AND implements Tree
 * - P6: Empty constructor, async init
 * - P7: Layer 2 sync methods, Layer 4 for async I/O
 * - P22: Collection<T> for children
 * - P24: RelatedObjects for unit/artefact (via UcpComponent base)
 * 
 * @ior ior:esm:/ONCE/{version}/DefaultFolder
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 * @pdca 2025-12-22-UTC-0500.ffm-implementation.pdca.md (FFM.1)
 */

import { UcpComponent } from './UcpComponent.js';
import { FolderModel, FolderChildReference } from '../layer3/FolderModel.interface.js';
import { DefaultFile } from './DefaultFile.js';
import { Reference } from '../layer3/Reference.interface.js';
import { Collection } from '../layer3/Collection.interface.js';
import { Tree } from '../layer3/Tree.interface.js';
import { Container } from '../layer3/Container.interface.js';
import { FileSystemNode } from '../layer3/FileSystemNode.type.js';

// Re-export for backwards compatibility
export type { FileSystemNode };

/**
 * DefaultFolder - Folder component for Web4 FileSystem
 * 
 * Implements Tree<FileSystemNode>:
 * - parent: Reference<DefaultFolder> (from Tree)
 * - children: Collection<FileSystemNode> (from Tree)
 * 
 * Implements Container<FileSystemNode>:
 * - pathFromRoot(): for breadcrumb navigation
 * - navigateTo(): for animated panel transitions
 * 
 * Children are stored as lightweight references (FolderChildReference).
 * Full child components loaded on-demand when navigated.
 */
export class DefaultFolder extends UcpComponent<FolderModel> 
  implements Tree<FileSystemNode>, Container<FileSystemNode> {
  
  // ═══════════════════════════════════════════════════════════════
  // Tree Structure
  // ═══════════════════════════════════════════════════════════════
  
  /** Parent folder (null for root) */
  private parentFolder: Reference<DefaultFolder> = null;
  
  /** Child components cache (by UUID) */
  private childrenCache: Map<string, FileSystemNode> = new Map();
  
  // ═══════════════════════════════════════════════════════════════
  // Initialization
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Provide default model for new folders
   */
  protected modelDefault(): FolderModel {
    const now = Date.now();
    return {
      uuid: this.uuidCreate(),
      name: 'New Folder',
      path: '/',
      folderName: 'untitled',
      children: [],
      parentUuid: null,
      createdAt: now,
      modifiedAt: now,
      isLink: false,
      linkTarget: null
    };
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Tree Interface Implementation
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get parent folder (Tree interface)
   */
  get parent(): Reference<Tree<FileSystemNode>> {
    return this.parentFolder;
  }
  
  /**
   * Set parent folder (called by parent's childAdd)
   * @internal
   */
  parentSet(folder: Reference<DefaultFolder>): void {
    this.parentFolder = folder;
    if (folder) {
      this.model.parentUuid = folder.model.uuid;
    }
  }
  
  /**
   * Get children as Collection (Tree interface)
   */
  get children(): Collection<FileSystemNode> {
    return Array.from(this.childrenCache.values());
  }
  
  /**
   * Add a child (Tree interface)
   * 
   * Folders can add files or other folders.
   */
  childAdd(child: FileSystemNode): void {
    const isFolder = child instanceof DefaultFolder;
    const childModel = child.model;
    
    // Create lightweight reference for model
    const ref: FolderChildReference = {
      uuid: childModel.uuid,
      name: childModel.name,
      isFolder,
      mimetype: isFolder ? null : (childModel as any).mimetype,
      size: isFolder ? null : (childModel as any).size,
      hasChildren: isFolder ? (childModel as FolderModel).children.length > 0 : false
    };
    
    // Add to model children (lightweight references)
    this.model.children = [...this.model.children, ref];
    this.model.modifiedAt = Date.now();
    
    // Set parent on child
    child.parentSet(this);
    
    // Update child's path
    if (isFolder) {
      (child as DefaultFolder).model.path = this.childPath;
    } else {
      (child as DefaultFile).model.path = this.childPath;
    }
    
    // Cache the component
    this.childrenCache.set(childModel.uuid, child);
  }
  
  /**
   * Remove a child (Tree interface)
   * 
   * @param child Child to remove
   * @returns true if removed, false if not found
   */
  childRemove(child: FileSystemNode): boolean {
    const uuid = child.model.uuid;
    
    // P4a: Use function predicates instead of arrows
    function matchesUuid(c: FolderChildReference): boolean {
      return c.uuid === uuid;
    }
    function notMatchesUuid(c: FolderChildReference): boolean {
      return c.uuid !== uuid;
    }
    
    const index = Array.prototype.findIndex.call(this.model.children, matchesUuid);
    if (index === -1) return false;
    
    // Remove from model
    this.model.children = Array.prototype.filter.call(this.model.children, notMatchesUuid);
    this.model.modifiedAt = Date.now();
    
    // Clear parent on child
    child.parentSet(null);
    
    // Remove from cache
    this.childrenCache.delete(uuid);
    
    return true;
  }
  
  /**
   * Remove child by UUID (convenience method)
   */
  childRemoveByUuid(uuid: string): Reference<FileSystemNode> {
    const child = this.childrenCache.get(uuid);
    if (!child) return null;
    
    this.childRemove(child);
    return child;
  }
  
  /**
   * Get child by UUID (from cache)
   */
  childGet(uuid: string): Reference<FileSystemNode> {
    return this.childrenCache.get(uuid) || null;
  }
  
  /**
   * Check if folder has any children (Tree interface)
   */
  get hasChildren(): boolean {
    return this.childrenCache.size > 0 || this.model.children.length > 0;
  }
  
  /**
   * Get number of children (Tree interface)
   */
  get childCount(): number {
    return this.childrenCache.size || this.model.children.length;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Container Interface Implementation
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Display name for breadcrumb/UI (Container interface)
   */
  get displayName(): string {
    return this.model.name || this.model.folderName;
  }
  
  /**
   * UUID (Container interface)
   */
  get uuid(): string {
    return this.model.uuid;
  }
  
  /**
   * Get path from root to this folder (Container interface)
   * 
   * Used for breadcrumb navigation.
   */
  pathFromRoot(): Container<FileSystemNode>[] {
    const path: Container<FileSystemNode>[] = [];
    let current: Reference<DefaultFolder> = this;
    
    while (current) {
      path.unshift(current);
      current = current.parentFolder;
    }
    
    return path;
  }
  
  /**
   * Navigate to a child (Container interface)
   * 
   * For OverViews: triggers navigation/animation.
   */
  navigateTo(child: FileSystemNode): boolean {
    const exists = this.childrenCache.has(child.model.uuid);
    // Navigation logic handled by OverView, we just validate
    return exists;
  }
  
  /**
   * Get path for children (this folder's full path)
   */
  get childPath(): string {
    const path = this.model.path.endsWith('/') 
      ? this.model.path 
      : this.model.path + '/';
    return path + this.model.folderName;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Child Lookup
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Find child by name
   * 
   * @param name Name to search for
   * @returns Child reference or null
   */
  childFindByName(name: string): Reference<FolderChildReference> {
    // P4a: Use function predicate instead of arrow
    function matchesName(c: FolderChildReference): boolean {
      return c.name === name;
    }
    return Array.prototype.find.call(this.model.children, matchesName) || null;
  }
  
  /**
   * Get all files (not folders) - P22: Collection<T>
   */
  get files(): Collection<FolderChildReference> {
    // P4a: Use function predicate instead of arrow
    function isFile(child: FolderChildReference): boolean {
      return !child.isFolder;
    }
    return Array.prototype.filter.call(this.model.children, isFile);
  }
  
  /**
   * Get all subfolders - P22: Collection<T>
   */
  get folders(): Collection<FolderChildReference> {
    // P4a: Use function predicate instead of arrow
    function isFolder(child: FolderChildReference): boolean {
      return child.isFolder;
    }
    return Array.prototype.filter.call(this.model.children, isFolder);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Link Operations (Sync - Layer 2)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Create a symbolic link to this folder
   * 
   * @param linkPath Path where the link will be created
   * @returns New Folder component representing the link
   */
  linkCreate(linkPath: string): DefaultFolder {
    const link = new DefaultFolder();
    link.initSync({
      model: {
        ...this.modelDefault(),
        uuid: this.uuidCreate(),
        path: linkPath,
        folderName: this.model.folderName,
        name: this.model.name,
        children: [], // Links don't copy children
        isLink: true,
        linkTarget: this.fullPath
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
      throw new Error('[DefaultFolder] Cannot move link target: not a link');
    }
    this.model.linkTarget = newTarget;
    this.model.modifiedAt = Date.now();
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Path Operations
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get full path including folder name
   */
  get fullPath(): string {
    const path = this.model.path.endsWith('/') 
      ? this.model.path 
      : this.model.path + '/';
    return path + this.model.folderName;
  }
  
  /**
   * Move folder to new path
   * Updates all child paths recursively
   * 
   * @param newPath New path for the folder
   */
  pathMove(newPath: string): void {
    this.model.path = newPath;
    this.model.modifiedAt = Date.now();
    
    // Update cached children paths - P4a: Use for...of instead of arrow
    for (const child of this.childrenCache.values()) {
      if (child instanceof DefaultFolder) {
        child.model.path = this.childPath;
      } else {
        child.model.path = this.childPath;
      }
    }
  }
  
  /**
   * Rename folder
   * 
   * @param newName New folder name
   */
  rename(newName: string): void {
    this.model.folderName = newName;
    this.model.name = newName;
    this.model.modifiedAt = Date.now();
  }
  
  // ═══════════════════════════════════════════════════════════════
  // File System Operations (FFM.1.1)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Check if this folder exists in storage
   * 
   * Cross-platform:
   * - Node.js: Uses fs.existsSync
   * - Browser: Checks IndexedDB or model state
   * 
   * @returns true if folder exists
   */
  exists(): boolean {
    // Environment detection
    const isNodeJs = typeof process !== 'undefined' && process.versions?.node;
    
    if (isNodeJs) {
      // Node.js: Check filesystem
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        return fs.existsSync(this.fullPath);
      } catch {
        return false;
      }
    } else {
      // Browser: Folder exists if it has a valid UUID
      return this.model.uuid !== '';
    }
  }
  
  /**
   * Folder type accessor - Folder is NEVER a file
   */
  get isFile(): boolean {
    return false;
  }
  
  /**
   * Directory type accessor - Folder is ALWAYS a directory
   */
  get isDirectory(): boolean {
    return true;
  }
  
  /**
   * Create this folder in the filesystem (if it doesn't exist)
   * 
   * @param recursive Create parent directories if needed (like mkdir -p)
   */
  async create(recursive: boolean = true): Promise<void> {
    const isNodeJs = typeof process !== 'undefined' && process.versions?.node;
    
    if (isNodeJs) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        if (!fs.existsSync(this.fullPath)) {
          fs.mkdirSync(this.fullPath, { recursive });
        }
      } catch (error) {
        console.error('[DefaultFolder] create error:', error);
        throw error;
      }
    }
    // Browser: Folder creation is implicit in scenario storage
  }
  
  /**
   * List all entries in this folder (replaces fs.readdirSync)
   * 
   * @returns Array of entry names (files and folders)
   */
  async list(): Promise<string[]> {
    const isNodeJs = typeof process !== 'undefined' && process.versions?.node;
    
    if (isNodeJs) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        if (fs.existsSync(this.fullPath)) {
          return fs.readdirSync(this.fullPath);
        }
      } catch (error) {
        console.error('[DefaultFolder] list error:', error);
      }
    }
    
    // Return cached children names (P4a: Use for...of loop)
    const names: string[] = [];
    for (const child of this.model.children as FolderChildReference[]) {
      names.push(child.name);
    }
    return names;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Delete Operations (FFM.1.2) - Unit-Aware
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Delete a LINK only (not the original folder).
   * Safe operation — original folder remains.
   * Updates Unit references to remove this link path.
   * 
   * @throws Error if called on original folder (not a link)
   */
  async deleteLink(): Promise<void> {
    if (!this.model.isLink) {
      throw new Error('[DefaultFolder] deleteLink() called on original folder, not a link. Use delete() for originals.');
    }
    
    const isNodeJs = typeof process !== 'undefined' && process.versions?.node;
    
    // 1. Update Unit references (similar to DefaultFile)
    const unit = await this.unitGet();
    if (unit && unit.model && unit.model.references) {
      const fullPath = this.fullPath;
      unit.model.references = unit.model.references.filter(
        function filterNotThisPath(ref): boolean {
          return !ref.linkLocation.includes(fullPath);
        }
      );
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
        console.error('[DefaultFolder] deleteLink error:', error);
        throw error;
      }
    }
  }
  
  /**
   * Delete the ORIGINAL folder (RARE operation!).
   * - If called on a link, just deletes the link.
   * - If called on original: Recursively deletes ALL children + links + Units.
   * - P2P network broadcast for original deletion is handled by infrastructure.
   * 
   * @param force Delete even if folder has children
   */
  async delete(force: boolean = false): Promise<void> {
    // If this is a link, just delete the link
    if (this.model.isLink) {
      await this.deleteLink();
      return;
    }
    
    const isNodeJs = typeof process !== 'undefined' && process.versions?.node;
    
    // 1. Check if folder has children
    if (!force && this.hasChildren) {
      throw new Error('[DefaultFolder] Cannot delete folder with children. Use delete(true) to force.');
    }
    
    // 2. Recursively delete children first (if force)
    if (force) {
      for (const child of this.childrenCache.values()) {
        if ('delete' in child) {
          await (child as any).delete(true);
        }
      }
    }
    
    // 3. Delete °folder.unit symlink if exists
    if (isNodeJs) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        const folderUnitPath = this.fullPath + '/°folder.unit';
        if (fs.existsSync(folderUnitPath)) {
          fs.unlinkSync(folderUnitPath);
        }
      } catch {
        // Ignore unit symlink deletion errors
      }
    }
    
    // 4. Delete the folder itself
    if (isNodeJs) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        if (fs.existsSync(this.fullPath)) {
          fs.rmdirSync(this.fullPath, { recursive: force });
        }
      } catch (error) {
        console.error('[DefaultFolder] delete error:', error);
        throw error;
      }
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Unit Integration (FFM.1.3)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get Unit for this folder if it exists
   * Folders have a special °folder.unit symlink inside them
   * 
   * @returns Unit if exists, null otherwise
   */
  async unitGet(): Promise<Reference<import('./DefaultUnit.js').DefaultUnit>> {
    const unitSymlinkPath = this.fullPath + '/°folder.unit';
    const isNodeJs = typeof process !== 'undefined' && process.versions?.node;
    
    if (isNodeJs) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        if (fs.existsSync(unitSymlinkPath)) {
          const { DefaultUnit } = await import('./DefaultUnit.js');
          const unit = new DefaultUnit();
          await unit.init();
          const scenarioPath = fs.readlinkSync(unitSymlinkPath);
          if (fs.existsSync(scenarioPath)) {
            const scenarioContent = fs.readFileSync(scenarioPath, 'utf-8');
            const scenario = JSON.parse(scenarioContent);
            if (scenario.model) {
              Object.assign(unit.model, scenario.model);
            }
          }
          return unit;
        }
      } catch (error) {
        console.error('[DefaultFolder] unitGet error:', error);
      }
    }
    return null;
  }
  
  /**
   * Create a new Unit for this folder
   * 
   * @returns Newly created Unit
   */
  async unitCreate(): Promise<import('./DefaultUnit.js').DefaultUnit> {
    const { DefaultUnit } = await import('./DefaultUnit.js');
    const unit = new DefaultUnit();
    await unit.init();
    await unit.from(this.fullPath);
    return unit;
  }
  
  /**
   * Ensure Unit exists for this folder
   * 
   * @returns Existing or newly created Unit
   */
  async unitEnsure(): Promise<import('./DefaultUnit.js').DefaultUnit> {
    const existing = await this.unitGet();
    if (existing) {
      return existing;
    }
    return await this.unitCreate();
  }
  
  /**
   * Initialize folder from filesystem path
   * 
   * @param folderPath Absolute or relative path to folder
   * @returns this for chaining
   */
  async initFromPath(folderPath: string): Promise<this> {
    await this.init();
    
    // Parse path into parent path and folder name
    const lastSlash = folderPath.lastIndexOf('/');
    if (lastSlash >= 0) {
      this.model.path = folderPath.substring(0, lastSlash) || '/';
      this.model.folderName = folderPath.substring(lastSlash + 1);
    } else {
      this.model.path = '/';
      this.model.folderName = folderPath;
    }
    this.model.name = this.model.folderName;
    
    // Try to load stats from filesystem
    const isNodeJs = typeof process !== 'undefined' && process.versions?.node;
    if (isNodeJs && this.exists()) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        const stats = fs.statSync(this.fullPath);
        this.model.createdAt = stats.birthtime.getTime();
        this.model.modifiedAt = stats.mtime.getTime();
        
        // Check if this is a symlink
        const lstats = fs.lstatSync(this.fullPath);
        if (lstats.isSymbolicLink()) {
          this.model.isLink = true;
          this.model.linkTarget = fs.readlinkSync(this.fullPath);
        }
      } catch (error) {
        console.error('[DefaultFolder] initFromPath stats error:', error);
      }
    }
    
    // Try to rediscover existing Unit
    await this.unitGet();
    
    return this;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Cleanup
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Release resources (recursive)
   */
  dispose(): void {
    // Dispose all cached children - P4a: Use for...of instead of arrow
    for (const child of this.childrenCache.values()) {
      if ('dispose' in child) {
        (child as any).dispose();
      }
    }
    this.childrenCache.clear();
  }
}



















