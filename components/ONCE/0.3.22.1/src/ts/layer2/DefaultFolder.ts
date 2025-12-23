/**
 * DefaultFolder.ts - Folder Component Implementation
 * 
 * Represents a folder/directory in the Web4 FileSystem.
 * Manages child files and folders, supports link operations.
 * 
 * Folder implements Container<File>, File:
 * - Folder IS-A File (specialized for directories)
 * - Container extends Tree (parent/children navigation)
 * - Files are leaf nodes, Folders can have children
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
import type { LazyReference } from '../layer3/LazyReference.interface.js';
import { Collection } from '../layer3/Collection.interface.js';
import { Tree } from '../layer3/Tree.interface.js';
import { Container } from '../layer3/Container.interface.js';
import { FileJs } from '../layer3/FileJs.js';
import { FolderJs } from '../layer3/FolderJs.js';
import type { File } from '../layer3/File.interface.js';
import type { Folder } from '../layer3/Folder.interface.js';
import { SyncStatus } from '../layer3/SyncStatus.enum.js';
import { Once } from '../layer1/ONCE.js';

// FileSystemNode union type is now replaced by File JsInterface
// File now has `abstract get model(): Model;` for tree operations
// See layer3/FileSystemNode.type.ts for legacy union if needed

/**
 * DefaultFolder - Folder component for Web4 FileSystem
 * 
 * Implements Container<File>, File:
 * - parent: Reference<Tree<File>> (from Container→Tree)
 * - children: Collection<File> (from Container→Tree)
 * 
 * Container<File> provides:
 * - pathFromRoot(): for breadcrumb navigation
 * - navigateTo(): for animated panel transitions
 * 
 * P34: Children are stored as IOR strings (ior:scenario:{uuid}).
 * Full child components resolved on-demand via IOR.resolve().
 */
export class DefaultFolder extends UcpComponent<FolderModel> 
  implements Container<FileJs>, FolderJs {
  
  // ═══════════════════════════════════════════════════════════════
  // Static Registration (P35: JsInterface for Runtime Interfaces)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Declare JsInterfaces this class implements
   * Folder IS-A File (can have children)
   * @pdca 2025-12-22-UTC-1400.jsinterface-naming-impact.pdca.md
   */
  static implements() {
    return [FileJs, FolderJs];
  }
  
  /**
   * Called when class is loaded - auto-registers with JsInterfaces
   */
  static start(): void {
    super.start();  // Auto-registers with FileJs and FolderJs
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Tree Structure
  // ═══════════════════════════════════════════════════════════════
  
  /** Parent folder (null for root) */
  private parentFolder: Reference<DefaultFolder> = null;
  
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
      parent: null,
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
   * Get parent folder (from Container→Tree interface)
   */
  get parent(): Reference<Tree<FileJs>> {
    return this.parentFolder;
  }
  
  /**
   * Set parent folder (called by parent's childAdd)
   * File interface implementation
   */
  parentSet(folder: FileJs | null): void {
    this.parentFolder = folder as Reference<DefaultFolder>;
    if (folder) {
      this.model.parent = `ior:scenario:${folder.model.uuid}`;
    }
  }
  
  /**
   * Set the path of this folder
   * File interface implementation
   */
  pathSet(newPath: string): void {
    this.model.path = newPath;
    this.model.modifiedAt = Date.now();
  }
  
  /**
   * Get resolved children (Tree interface)
   * 
   * ISR: model.children contains LazyReference<File>
   * This accessor filters for resolved instances only.
   * 
   * @returns Array of resolved File instances (DefaultFile or DefaultFolder)
   */
  get children(): FileJs[] {
    // Filter for resolved instances (not IOR strings or IOR objects)
    const resolved: FileJs[] = [];
    for (const child of this.model.children) {
      if (child !== null && typeof child === 'object' && 'model' in child) {
        resolved.push(child as FileJs);
      }
    }
    return resolved;
  }
  
  /**
   * Add a child (Tree interface)
   * 
   * ISR: Stores child instance directly in model.children.
   * When persisted, instance serializes to IOR string.
   */
  childAdd(child: FileJs): void {
    // Set parent on child
    child.parentSet(this);
    
    // Update child's path via File interface
    child.pathSet(this.childPath);
    
    // Add instance directly to model.children (ISR-compatible)
    this.model.children = [...this.model.children, child];
    this.model.modifiedAt = Date.now();
  }
  
  /**
   * Remove a child (Tree interface)
   * 
   * ISR: Children can be instances, IORs, or strings.
   * 
   * @param child Child to remove
   * @returns true if removed, false if not found
   */
  childRemove(child: FileJs): boolean {
    const uuid = child.model.uuid;
    
    // Find by UUID (works for instances, IOR strings, or IOR objects)
    const index = this.model.children.findIndex(function matchChild(c) {
      if (typeof c === 'string') return c.includes(uuid);
      if (c && typeof c === 'object' && 'model' in c) return (c as File).model.uuid === uuid;
      return false;
    });
    
    if (index === -1) return false;
    
    // Remove from model
    this.model.children = this.model.children.filter(function notMatch(_, i) { return i !== index; });
    this.model.modifiedAt = Date.now();
    
    // Clear parent on child
    child.parentSet(null);
    
    return true;
  }
  
  /**
   * Remove child by UUID (convenience method)
   */
  childRemoveByUuid(uuid: string): Reference<FileJs> {
    const child = this.childGet(uuid);
    if (!child) return null;
    
    this.childRemove(child);
    return child;
  }
  
  /**
   * Get child by UUID
   * 
   * ISR: Searches model.children for resolved instances.
   */
  childGet(uuid: string): Reference<FileJs> {
    for (const child of this.model.children) {
      if (child && typeof child === 'object' && 'model' in child) {
        if ((child as FileJs).model.uuid === uuid) {
          return child as File;
        }
      }
    }
    return null;
  }
  
  /**
   * Check if folder has any children (Tree interface)
   */
  get hasChildren(): boolean {
    return this.model.children.length > 0;
  }
  
  /**
   * Get number of children (Tree interface)
   */
  get childCount(): number {
    return this.model.children.length;
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
  pathFromRoot(): Container<FileJs>[] {
    const path: Container<FileJs>[] = [];
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
  navigateTo(child: FileJs): boolean {
    // Check if child exists in model.children
    const exists = this.childGet(child.model.uuid) !== null;
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
   * Find child by name (searches resolved children)
   * 
   * ISR: Searches model.children for resolved instances.
   * 
   * @param name Name to search for
   * @returns Child component or null
   */
  childFindByName(name: string): Reference<FileJs> {
    for (const child of this.children) {
      if (child.model.name === name) {
        return child;
      }
    }
    return null;
  }
  
  /**
   * Get all files (not folders)
   */
  get files(): DefaultFile[] {
    const result: DefaultFile[] = [];
    for (const child of this.children) {
      if (child instanceof DefaultFile) {
        result.push(child);
      }
    }
    return result;
  }
  
  /**
   * Get all subfolders
   */
  get subfolders(): DefaultFolder[] {
    const result: DefaultFolder[] = [];
    for (const child of this.children) {
      if (child instanceof DefaultFolder) {
        result.push(child);
      }
    }
    return result;
  }
  
  /**
   * Get raw child references (may be strings, IORs, or instances)
   * 
   * ISR Pattern: References may be in any state:
   * - string: IOR "ior:..." (unresolved)
   * - IOR object: resolving in background
   * - File: resolved instance (DefaultFile or DefaultFolder)
   */
  get childReferences(): Collection<FileJs> {
    return this.model.children;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // ISR: Lazy resolution is now handled by UcpModel proxy
  // No explicit resolve() needed — accessing model.children triggers ISR
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Select a child — ISR handles resolution automatically
   * 
   * When accessing a child, the UcpModel proxy triggers ISR:
   * - IOR string → IOR object → resolved instance
   * 
   * @param uuid UUID of the child to select
   * @returns The selected child (resolved by ISR)
   */
  childSelect(uuid: string): Reference<FileJs> {
    return this.childGet(uuid);
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
        linkTarget: `ior:file://${this.fullPath}`
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
    // Store as IOR string for LazyReference
    this.model.linkTarget = `ior:file://${newTarget}`;
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
   * Get the symlink target as LazyReference
   * 
   * Returns the target folder reference (IOR string or resolved Folder instance).
   * Use symlinkTargetPath() for the raw filesystem path.
   */
  get linkTarget(): LazyReference<Folder> {
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
    
    // If resolved to Folder instance, get its path
    if (target && typeof target === 'object' && 'path' in target) {
      return (target as Folder).path;
    }
    
    return null;
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
    
    // 2. Update resolved children paths recursively (model only, fs already moved)
    for (const child of this.children) {
      child.pathSet(this.childPath);
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
    
    // 3. Update resolved children paths
    for (const child of this.children) {
      child.pathSet(this.childPath);
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
   * Folder type accessor - Folder is NEVER a file (it's a folder!)
   */
  get isFile(): boolean {
    return false;
  }
  
  /**
   * Folder type accessor - Folder IS a folder
   */
  get isFolder(): boolean {
    return true;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // File Interface Implementation (P35: JsInterface)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get folder path (delegated to model)
   */
  get path(): string {
    return this.model.path;
  }
  
  /**
   * Get folder name (delegated to model)
   */
  get name(): string {
    return this.model.name;
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
    
    // Return resolved children names (P4a: Use for...of loop)
    const names: string[] = [];
    for (const child of this.children) {
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
      for (const child of this.children) {
        if ('delete' in child) {
          await (child as DefaultFile | DefaultFolder).delete(true);
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
          // Store target as IOR string for LazyReference
          const targetPath = fs.readlinkSync(this.fullPath);
          this.model.linkTarget = `ior:file://${targetPath}`;
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
    // Dispose all resolved children - P4a: Use for...of instead of arrow
    for (const child of this.children) {
      if ('dispose' in child) {
        (child as DefaultFile | DefaultFolder).dispose();
      }
    }
    // Clear model children
    this.model.children = [];
  }
}



















