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
 * Web4 Principles:
 * - P4: Radical OOP - Folder IS a File AND implements Tree
 * - P6: Empty constructor, async init
 * - P7: Layer 2 sync methods, Layer 4 for async I/O
 * - P22: Collection<T> for children
 * - P24: RelatedObjects for unit/artefact (via UcpComponent base)
 * 
 * @ior ior:esm:/ONCE/{version}/DefaultFolder
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
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



