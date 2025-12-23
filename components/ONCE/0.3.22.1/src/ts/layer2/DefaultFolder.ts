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
import { FolderModel } from '../layer3/FolderModel.interface.js';
import { DefaultFile } from './DefaultFile.js';
import { Reference } from '../layer3/Reference.interface.js';
import { Collection } from '../layer3/Collection.interface.js';
import { Tree } from '../layer3/Tree.interface.js';
import { Container } from '../layer3/Container.interface.js';
import { FileSystemNode } from '../layer3/FileSystemNode.type.js';
import { SyncStatus } from '../layer3/SyncStatus.enum.js';
import { Once } from '../layer1/ONCE.js';

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
 * P34: Children are stored as IOR strings (ior:scenario:{uuid}).
 * Full child components resolved on-demand via IOR.resolve().
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
   * P34: Children stored as IOR strings, not duplicated data objects.
   * The IOR resolves to the File/Folder scenario with all data (DRY!).
   */
  childAdd(child: FileSystemNode): void {
    const isFolder = child instanceof DefaultFolder;
    const childModel = child.model;
    
    // P34: Store IOR string reference, NOT duplicated data
    // Format: ior:scenario:{uuid} - resolves to File/Folder scenario
    const childIor = `ior:scenario:${childModel.uuid}`;
    
    // Add to model children (IOR strings)
    this.model.children = [...(this.model.children as string[]), childIor];
    this.model.modifiedAt = Date.now();
    
    // Set parent on child
    child.parentSet(this);
    
    // Update child's path
    if (isFolder) {
      (child as DefaultFolder).model.path = this.childPath;
    } else {
      (child as DefaultFile).model.path = this.childPath;
    }
    
    // Cache the component (runtime only, for quick access)
    this.childrenCache.set(childModel.uuid, child);
  }
  
  /**
   * Remove a child (Tree interface)
   * 
   * P34: Children are IOR strings containing UUID.
   * 
   * @param child Child to remove
   * @returns true if removed, false if not found
   */
  childRemove(child: FileSystemNode): boolean {
    const uuid = child.model.uuid;
    const childIor = `ior:scenario:${uuid}`;
    
    // P4a: Use function predicates instead of arrows
    function matchesIor(ior: string): boolean {
      return ior === childIor || ior.includes(uuid);
    }
    function notMatchesIor(ior: string): boolean {
      return ior !== childIor && !ior.includes(uuid);
    }
    
    const index = Array.prototype.findIndex.call(this.model.children, matchesIor);
    if (index === -1) return false;
    
    // Remove from model (children are IOR strings)
    this.model.children = Array.prototype.filter.call(this.model.children, notMatchesIor);
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
   * Find child by name (searches resolved cache)
   * 
   * P34: Children are IOR strings, so we search the resolved cache.
   * 
   * @param name Name to search for
   * @returns Child component or null
   */
  childFindByName(name: string): Reference<FileSystemNode> {
    for (const child of this.childrenCache.values()) {
      if (child.model.name === name) {
        return child;
      }
    }
    return null;
  }
  
  /**
   * Get all files (not folders) from resolved cache - P22: Collection<T>
   */
  get files(): Collection<FileSystemNode> {
    const result: FileSystemNode[] = [];
    for (const child of this.childrenCache.values()) {
      if (!(child instanceof DefaultFolder)) {
        result.push(child);
      }
    }
    return result;
  }
  
  /**
   * Get all subfolders from resolved cache - P22: Collection<T>
   */
  get subfolders(): Collection<DefaultFolder> {
    const result: DefaultFolder[] = [];
    for (const child of this.childrenCache.values()) {
      if (child instanceof DefaultFolder) {
        result.push(child);
      }
    }
    return result;
  }
  
  /**
   * Get raw child IOR strings (unresolved)
   */
  get childIors(): Collection<string> {
    return this.model.children;
  }
  
  /**
   * Resolve all child IORs and populate the cache
   * 
   * P34: Children are IOR strings. This method resolves them to File/Folder components.
   * Call this when you need to iterate over resolved children.
   * 
   * KD.5: Uses IOR.dereference() for clean dereferencing (DRY!)
   * 
   * @returns Collection of resolved FileSystemNode components
   */
  async childrenResolve(): Promise<Collection<FileSystemNode>> {
    const { IOR } = await import('../layer4/IOR.js');
    const resolved: FileSystemNode[] = [];
    
    for (const ior of this.model.children as string[]) {
      // Skip if already in cache
      const uuid = ior.replace('ior:scenario:', '');
      if (this.childrenCache.has(uuid)) {
        const cached = this.childrenCache.get(uuid);
        if (cached) resolved.push(cached);
        continue;
      }
      
      try {
        // KD.5: Use IOR.dereference() for clean Reference<T> → Instance resolution
        const child = await IOR.dereference<FileSystemNode>(ior);
        
        if (child) {
          // Set parent
          child.parentSet(this);
          
          // Cache it
          this.childrenCache.set(child.model.uuid, child);
          resolved.push(child);
        }
      } catch (error) {
        console.error(`[DefaultFolder] Failed to resolve child IOR: ${ior}`, error);
      }
    }
    
    return resolved;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // FFM.3.6: ONE LAYER LOOKAHEAD Pattern
  // Web4 P34: Folder "resolved" = children ARE instances (prefetched)
  // ═══════════════════════════════════════════════════════════════
  
  /** Flag indicating if children have been prefetched */
  private childrenPrefetched: boolean = false;
  
  /**
   * Resolve this folder — includes ONE LAYER LOOKAHEAD
   * 
   * ISR Pattern: Uses UcpModel's self-replacing IOR mechanism.
   * - Accessing model.children[i] triggers IOR creation
   * - IOR.resolveAndReplace() runs in background
   * - This method awaits all pending IORs
   * 
   * Called when:
   * - Folder is opened/accessed
   * - Navigation enters this folder
   * - Folder assigned to a variable
   * 
   * @returns this (fluent API, folder is now resolved)
   * 
   * @example
   * ```typescript
   * const folder = await new IOR<DefaultFolder>().initRemote(ior).resolveInstance();
   * await folder.resolve();  // Prefetches children
   * // Now folder.model.children contains instances, not IOR strings
   * ```
   */
  async resolve(): Promise<this> {
    // Already prefetched? Skip
    if (this.childrenPrefetched) {
      return this;
    }
    
    const { IOR } = await import('../layer4/IOR.js');
    
    // ISR: children array may now contain strings, IOR objects, or instances
    // Type assertion needed because FolderModel.children is typed as Collection<string>
    const children = this.model.children as unknown[];
    
    // Access all children to trigger IOR creation via UcpModel proxy
    // Then await each IOR's resolution
    const resolvePromises: Promise<unknown>[] = [];
    
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      
      // If it's an IOR object (created by proxy), await its resolution
      if (child && typeof child === 'object' && child instanceof IOR) {
        resolvePromises.push(child.resolveAndReplace());
      }
      // If still a string (shouldn't happen after access, but handle it)
      else if (typeof child === 'string' && child.startsWith('ior:')) {
        const ior = new IOR().initRemote(child);
        ior.initWithParent(this.model, 'children', i);
        children[i] = ior;
        resolvePromises.push(ior.resolveAndReplace());
      }
      // Already an instance — set parent reference
      else if (child && typeof child === 'object') {
        const fileSystemNode = child as FileSystemNode;
        if (typeof fileSystemNode.parentSet === 'function') {
          fileSystemNode.parentSet(this);
        }
        // Cache it
        if (fileSystemNode.model && fileSystemNode.model.uuid) {
          this.childrenCache.set(fileSystemNode.model.uuid, fileSystemNode);
        }
      }
    }
    
    // Await all resolutions
    await Promise.all(resolvePromises);
    
    // Now all children are instances — set parent and cache them
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as unknown;
      if (child && typeof child === 'object' && typeof (child as FileSystemNode).parentSet === 'function') {
        const fileSystemNode = child as FileSystemNode;
        fileSystemNode.parentSet(this);
        if (fileSystemNode.model && fileSystemNode.model.uuid) {
          this.childrenCache.set(fileSystemNode.model.uuid, fileSystemNode);
        }
      }
    }
    
    // Mark as prefetched
    this.childrenPrefetched = true;
    
    console.log(`[DefaultFolder] Resolved: ${this.model.name} (${this.model.children.length} children prefetched)`);
    
    return this;
  }
  
  /**
   * Check if this folder has been resolved (children prefetched)
   * 
   * Web4 P16: Accessor pattern
   */
  get isResolved(): boolean {
    return this.childrenPrefetched;
  }
  
  /**
   * Select a child — triggers NEXT LAYER resolution
   * 
   * FFM.3.6.2: When a child is selected (clicked, assigned to variable),
   * resolve THAT child's children if it's a folder.
   * 
   * This creates the "deepening" effect:
   * - User sees folder → children prefetched
   * - User clicks subfolder → grandchildren prefetched
   * - And so on...
   * 
   * @param uuid UUID of the child to select
   * @returns The selected child (resolved if folder)
   * 
   * @example
   * ```typescript
   * const subFolder = await folder.childSelect('abc-123');
   * // If subFolder is a folder, its children are now prefetched
   * ```
   */
  async childSelect(uuid: string): Promise<Reference<FileSystemNode>> {
    // Ensure this folder is resolved first
    if (!this.childrenPrefetched) {
      await this.resolve();
    }
    
    // Get child from cache
    const child = this.childrenCache.get(uuid);
    if (!child) {
      console.warn(`[DefaultFolder] Child not found: ${uuid}`);
      return null;
    }
    
    // If child is a folder, resolve ITS children (NEXT LAYER)
    if (child instanceof DefaultFolder) {
      await child.resolve();
    }
    
    return child;
  }
  
  /**
   * Get resolved children (only if folder is resolved)
   * 
   * FFM.3.6.3: Convenience accessor for views.
   * Returns cached children if resolved, empty otherwise.
   * 
   * Use this instead of childrenResolve() when you expect
   * the folder to already be resolved.
   */
  get resolvedChildren(): Collection<FileSystemNode> {
    if (!this.childrenPrefetched) {
      console.warn('[DefaultFolder] Accessing resolvedChildren before resolve() called');
      return [];
    }
    return Array.from(this.childrenCache.values());
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
  // Symlink Operations (FFM.3) - Filesystem Symlinks
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Create a filesystem symlink to this folder
   * 
   * FFM.3: Creates actual filesystem symlink (not just model link)
   * Also updates Unit references with the new symlink path.
   * 
   * @param symlinkPath Path where the symlink will be created
   * @returns New Folder component representing the symlink
   */
  async symlinkCreate(symlinkPath: string): Promise<DefaultFolder> {
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
        
        // Create symlink pointing to this folder
        fs.symlinkSync(this.fullPath, symlinkPath);
      } catch (error) {
        console.error('[DefaultFolder] symlinkCreate filesystem error:', error);
        throw error;
      }
    }
    
    // 2. Create link component with model
    const link = this.linkCreate(symlinkPath);
    
    // 3. Update Unit references
    const unit = await this.unitGet();
    if (unit && unit.model) {
      const newRef = {
        linkLocation: `ior:local:ln:file://${symlinkPath}`,
        linkTarget: `ior:unit:${unit.model.uuid}`,
        syncStatus: SyncStatus.SYNCED
      };
      if (!unit.model.references) {
        unit.model.references = [];
      }
      unit.model.references.push(newRef);
    }
    
    return link;
  }
  
  /**
   * Check if this folder is a symlink on the filesystem
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
    
    return this.model.isLink;
  }
  
  /**
   * Get the symlink target path
   * 
   * @returns Target path or null if not a symlink
   */
  symlinkTarget(): Reference<string> {
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
    
    return this.model.linkTarget;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Type Mirror Operations (FFM.3.5) - scenarios/type/ structure
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Create °folder.unit symlink in scenarios/type/ mirror for this folder
   * 
   * FFM.3.5: Dual symlinks for folders
   * - Original folder stays in components/{Component}/{version}/...
   * - Unit scenario in scenarios/index/{uuid-path}/
   * - Type mirror: scenarios/type/{Component}/{version}/.../°folder.unit → scenarios/index/...
   * 
   * TRON: "Folders have a special °folder.unit symlink inside them"
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
      
      // Type mirror folder path: scenarios/type/{Component}/{version}/{relativePath}/
      const typeMirrorFolderPath = path.join(
        projectRoot,
        'scenarios',
        'type',
        componentName,
        componentVersion,
        relativePath
      );
      
      // Ensure the folder exists in type mirror
      if (!fs.existsSync(typeMirrorFolderPath)) {
        fs.mkdirSync(typeMirrorFolderPath, { recursive: true });
      }
      
      // °folder.unit symlink inside the type mirror folder
      const folderUnitPath = path.join(typeMirrorFolderPath, '°folder.unit');
      
      // Create symlink: scenarios/type/.../°folder.unit → scenarios/index/.../uuid.scenario.json
      if (!fs.existsSync(folderUnitPath)) {
        fs.symlinkSync(unitScenarioPath, folderUnitPath);
      }
    } catch (error) {
      console.error('[DefaultFolder] typeMirrorCreate error:', error);
      throw error;
    }
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
   * Move folder to new path (Unit-aware)
   * 
   * FFM.2.2: Unit-aware move operation for folders
   * - Moves folder on filesystem
   * - Recursively updates all children
   * - Updates Unit references with new paths
   * - Moves °folder.unit symlink
   * 
   * @param newPath New parent path for the folder
   */
  async pathMove(newPath: string): Promise<void> {
    const oldFullPath = this.fullPath;
    const oldPath = this.model.path;
    
    // Update model first
    this.model.path = newPath;
    this.model.modifiedAt = Date.now();
    
    const newFullPath = this.fullPath;
    const isNodeJs = Once.isNode;
    
    // 1. Move actual folder on filesystem
    if (isNodeJs) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        if (fs.existsSync(oldFullPath)) {
          // Ensure target parent directory exists
          if (!fs.existsSync(newPath)) {
            fs.mkdirSync(newPath, { recursive: true });
          }
          // Move folder
          fs.renameSync(oldFullPath, newFullPath);
        }
      } catch (error) {
        // Rollback model on error
        this.model.path = oldPath;
        console.error('[DefaultFolder] pathMove filesystem error:', error);
        throw error;
      }
    }
    
    // 2. Update cached children paths recursively (model only, fs already moved)
    for (const child of this.childrenCache.values()) {
      child.model.path = this.childPath;
    }
    
    // 3. Update Unit references (if Unit exists)
    const unit = await this.unitGet();
    if (unit && unit.model && unit.model.references) {
      for (const ref of unit.model.references) {
        if (ref.linkLocation.includes(oldFullPath)) {
          ref.linkLocation = ref.linkLocation.replace(oldFullPath, newFullPath);
        }
      }
    }
  }
  
  /**
   * Rename folder (Unit-aware)
   * 
   * @param newName New folder name
   */
  async rename(newName: string): Promise<void> {
    const oldFullPath = this.fullPath;
    const oldFolderName = this.model.folderName;
    
    // Update model
    this.model.folderName = newName;
    this.model.name = newName;
    this.model.modifiedAt = Date.now();
    
    const newFullPath = this.fullPath;
    const isNodeJs = Once.isNode;
    
    // 1. Rename actual folder on filesystem
    if (isNodeJs) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        if (fs.existsSync(oldFullPath)) {
          fs.renameSync(oldFullPath, newFullPath);
        }
      } catch (error) {
        // Rollback model on error
        this.model.folderName = oldFolderName;
        this.model.name = oldFolderName;
        console.error('[DefaultFolder] rename filesystem error:', error);
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
    
    // 3. Update cached children paths
    for (const child of this.childrenCache.values()) {
      child.model.path = this.childPath;
    }
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
    const isNodeJs = Once.isNode;
    
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
    const isNodeJs = Once.isNode;
    
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
    const isNodeJs = Once.isNode;
    
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
    for (const child of this.childrenCache.values()) {
      names.push(child.model.name);
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
    
    const isNodeJs = Once.isNode;
    
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
    
    const isNodeJs = Once.isNode;
    
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
    const isNodeJs = Once.isNode;
    
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
    const isNodeJs = Once.isNode;
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



















