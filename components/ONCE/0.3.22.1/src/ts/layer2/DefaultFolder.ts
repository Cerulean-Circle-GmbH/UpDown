/**
 * DefaultFolder.ts - Folder Component Implementation
 * 
 * Represents a folder/directory in the Web4 FileSystem.
 * Manages child files and folders, supports link operations.
 * 
 * Web4 Principles:
 * - P4: Radical OOP - Folder IS a UcpComponent
 * - P6: Empty constructor, async init
 * - P7: Layer 2 sync methods, Layer 4 for async I/O
 * - P24: RelatedObjects for unit/artefact (via UcpComponent base)
 * 
 * @ior ior:esm:/ONCE/{version}/DefaultFolder
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { UcpComponent } from './UcpComponent.js';
import { FolderModel, FolderChildReference } from '../layer3/FolderModel.interface.js';
import { DefaultFile } from './DefaultFile.js';
import { Reference } from '../layer3/Reference.interface.js';

/**
 * Generate UUID (browser-compatible)
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * DefaultFolder - Folder component for Web4 FileSystem
 * 
 * Children are stored as lightweight references (FolderChildReference).
 * Full child components loaded on-demand when navigated.
 */
export class DefaultFolder extends UcpComponent<FolderModel> {
  
  // ═══════════════════════════════════════════════════════════════
  // Child Component Cache (loaded on demand)
  // ═══════════════════════════════════════════════════════════════
  
  /** Cache of loaded child components (by UUID) */
  private childrenCache: Map<string, DefaultFile | DefaultFolder> = new Map();
  
  // ═══════════════════════════════════════════════════════════════
  // Initialization
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Provide default model for new folders
   */
  protected modelDefault(): FolderModel {
    const now = Date.now();
    return {
      uuid: generateUUID(),
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
  // Child Management
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Add a file to this folder
   * 
   * @param file File component to add
   */
  childAdd(file: DefaultFile): void;
  
  /**
   * Add a subfolder to this folder
   * 
   * @param folder Folder component to add
   */
  childAdd(folder: DefaultFolder): void;
  
  /**
   * Add a child (file or folder) to this folder
   */
  childAdd(child: DefaultFile | DefaultFolder): void {
    const isFolder = child instanceof DefaultFolder;
    const childModel = child.model;
    
    // Create reference
    const ref: FolderChildReference = {
      uuid: childModel.uuid,
      name: childModel.name,
      isFolder,
      mimetype: isFolder ? null : (childModel as any).mimetype,
      size: isFolder ? null : (childModel as any).size,
      hasChildren: isFolder ? (childModel as FolderModel).children.length > 0 : false
    };
    
    // Add to children
    this.model.children = [...this.model.children, ref];
    this.model.modifiedAt = Date.now();
    
    // Update child's path and parent
    if (isFolder) {
      (child as DefaultFolder).model.parentUuid = this.model.uuid;
      (child as DefaultFolder).model.path = this.childPath;
    } else {
      (child as DefaultFile).model.path = this.childPath;
    }
    
    // Cache the component
    this.childrenCache.set(childModel.uuid, child);
  }
  
  /**
   * Remove a child by UUID
   * 
   * @param uuid UUID of child to remove
   * @returns The removed child, or null if not found
   */
  childRemove(uuid: string): Reference<DefaultFile | DefaultFolder> {
    const index = this.model.children.findIndex(c => c.uuid === uuid);
    if (index === -1) return null;
    
    // Remove from model
    this.model.children = this.model.children.filter(c => c.uuid !== uuid);
    this.model.modifiedAt = Date.now();
    
    // Get from cache and remove
    const cached = this.childrenCache.get(uuid);
    this.childrenCache.delete(uuid);
    
    return cached || null;
  }
  
  /**
   * Get child by UUID (from cache or load)
   * 
   * @param uuid UUID of child
   * @returns Child component or null
   */
  childGet(uuid: string): Reference<DefaultFile | DefaultFolder> {
    return this.childrenCache.get(uuid) || null;
  }
  
  /**
   * Check if folder has any children
   */
  get hasChildren(): boolean {
    return this.model.children.length > 0;
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
    return this.model.children.find(c => c.name === name) || null;
  }
  
  /**
   * Get all files (not folders)
   */
  get files(): FolderChildReference[] {
    return this.model.children.filter(c => !c.isFolder);
  }
  
  /**
   * Get all subfolders
   */
  get folders(): FolderChildReference[] {
    return this.model.children.filter(c => c.isFolder);
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
        uuid: generateUUID(),
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
    const oldPath = this.fullPath;
    this.model.path = newPath;
    this.model.modifiedAt = Date.now();
    
    // Update cached children paths
    this.childrenCache.forEach(child => {
      if (child instanceof DefaultFolder) {
        child.model.path = this.childPath;
      } else {
        child.model.path = this.childPath;
      }
    });
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
    // Dispose all cached children
    this.childrenCache.forEach(child => {
      if ('dispose' in child) {
        (child as any).dispose();
      }
    });
    this.childrenCache.clear();
  }
}
