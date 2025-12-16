/**
 * DefaultFileSystem.ts - Virtual FileSystem Component
 * 
 * Root component managing the Web4 virtual file system.
 * Provides file/folder creation, mimetype handler registry,
 * and component creation from dropped files.
 * 
 * Web4 Principles:
 * - P4: Radical OOP - FileSystem IS a UcpComponent
 * - P6: Empty constructor, async init
 * - P7: Layer 2 sync methods, Layer 4 for async I/O
 * - P24: RelatedObjects for infrastructure
 * 
 * @ior ior:esm:/ONCE/{version}/DefaultFileSystem
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { UcpComponent } from './UcpComponent.js';
import { FileSystemModel } from '../layer3/FileSystemModel.interface.js';
import { DefaultFile } from './DefaultFile.js';
import { DefaultFolder } from './DefaultFolder.js';
import { Reference } from '../layer3/Reference.interface.js';
import { 
  DefaultMimetypeHandlerRegistry, 
  mimetypeRegistry 
} from './DefaultMimetypeHandlerRegistry.js';
import { MimetypeHandler, ComponentConstructor } from '../layer3/MimetypeHandler.interface.js';


/**
 * DefaultFileSystem - Virtual filesystem for Web4
 * 
 * Features:
 * - File and folder creation
 * - Mimetype handler registry
 * - Component creation from files
 * - Link operations (create, move)
 * 
 * Usage:
 * ```typescript
 * const fs = new DefaultFileSystem();
 * await fs.init();
 * 
 * // Create file from dropped blob
 * const file = await fs.fileCreate(blob, 'test.png', 'image/png');
 * 
 * // Create component if handler exists
 * const component = await fs.componentFromFile(file);
 * ```
 */
export class DefaultFileSystem extends UcpComponent<FileSystemModel> {
  
  // ═══════════════════════════════════════════════════════════════
  // Mimetype Handler Registry (uses singleton)
  // ═══════════════════════════════════════════════════════════════
  
  /** Access to singleton mimetype registry */
  get mimetypeRegistry(): DefaultMimetypeHandlerRegistry {
    return mimetypeRegistry;
  }
  
  /** Root folder */
  private rootFolderInstance: Reference<DefaultFolder> = null;
  
  // ═══════════════════════════════════════════════════════════════
  // Initialization
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Provide default model
   */
  protected modelDefault(): FileSystemModel {
    return {
      uuid: this.uuidCreate(),
      name: 'FileSystem',
      rootFolderUuid: '',
      basePath: '/scenarios/type/File',
      fileCount: 0,
      folderCount: 1, // Root folder
      totalSize: 0,
      lastSyncAt: null
    };
  }
  
  /**
   * Initialize filesystem with root folder
   */
  async init(scenario?: { model?: FileSystemModel }): Promise<this> {
    await super.init(scenario);
    
    // Create root folder if not exists
    if (!this.rootFolderInstance) {
      this.rootFolderInstance = new DefaultFolder();
      await this.rootFolderInstance.init({
        model: {
          uuid: this.uuidCreate(),
          name: 'Root',
          path: '',
          folderName: '',
          children: [],
          parentUuid: null,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          isLink: false,
          linkTarget: null
        }
      });
      this.model.rootFolderUuid = this.rootFolderInstance.model.uuid;
    }
    
    return this;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // File Operations
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Create a new file from Blob
   * 
   * @param blob File content
   * @param filename Original filename
   * @param mimetype MIME type
   * @param parentFolder Parent folder (defaults to root)
   * @returns Created file component
   */
  async fileCreate(
    blob: Blob,
    filename: string,
    mimetype: string,
    parentFolder?: DefaultFolder
  ): Promise<DefaultFile> {
    const file = new DefaultFile();
    await file.initFromBlob(blob, filename, mimetype);
    
    // Add to parent folder
    const parent = parentFolder || this.rootFolderInstance;
    if (parent) {
      parent.childAdd(file);
    }
    
    // Update stats
    this.model.fileCount++;
    this.model.totalSize += blob.size;
    
    return file;
  }
  
  /**
   * Create a new folder
   * 
   * @param name Folder name
   * @param parentFolder Parent folder (defaults to root)
   * @returns Created folder component
   */
  folderCreate(name: string, parentFolder?: DefaultFolder): DefaultFolder {
    const folder = new DefaultFolder();
    folder.initSync({
      model: {
        uuid: this.uuidCreate(),
        name,
        path: (parentFolder || this.rootFolderInstance)?.fullPath || '/',
        folderName: name,
        children: [],
        parentUuid: (parentFolder || this.rootFolderInstance)?.model.uuid || null,
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        isLink: false,
        linkTarget: null
      }
    });
    
    // Add to parent folder
    const parent = parentFolder || this.rootFolderInstance;
    if (parent) {
      parent.childAdd(folder);
    }
    
    // Update stats
    this.model.folderCount++;
    
    return folder;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Link Operations
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Create a symbolic link
   * 
   * @param target Target file or folder
   * @param linkPath Path for the link
   * @returns Link component
   */
  linkCreate(target: DefaultFile | DefaultFolder, linkPath: string): DefaultFile | DefaultFolder {
    return target.linkCreate(linkPath);
  }
  
  /**
   * Move a link to a new target
   * 
   * @param link Link to update
   * @param newTarget New target path
   */
  linkMove(link: DefaultFile | DefaultFolder, newTarget: string): void {
    link.linkMove(newTarget);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Mimetype Handler Registry (delegates to singleton)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Register a mimetype handler
   * 
   * Delegates to singleton registry.
   * 
   * @param pattern Mimetype pattern (e.g., "image/*", "text/plain")
   * @param componentClass Component class constructor
   * @param priority Priority (higher = checked first)
   * @param name Optional handler name
   */
  mimetypeHandlerRegister(
    pattern: string,
    componentClass: ComponentConstructor,
    priority: number = 0,
    name?: string
  ): void {
    mimetypeRegistry.register(pattern, componentClass, priority, name);
  }
  
  /**
   * Lookup handler for a mimetype
   * 
   * Delegates to singleton registry.
   * 
   * @param mimetype MIME type to match
   * @returns Handler or null
   */
  mimetypeHandlerLookup(mimetype: string): MimetypeHandler | null {
    return mimetypeRegistry.handlerLookup(mimetype);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Component Creation from Files
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Create component from native File (drag & drop)
   * 
   * Called by view.add() when file is dropped.
   * 
   * @param nativeFile Native File from DataTransfer
   * @returns Created component or DefaultFile if no handler
   */
  async componentFromFile(nativeFile: File): Promise<UcpComponent<any>> {
    // Create DefaultFile first - P4a: Avoid arrow in then()
    const arrayBuffer = await nativeFile.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: nativeFile.type });
    const file = await this.fileCreate(blob, nativeFile.name, nativeFile.type);
    
    // Lookup handler
    const handler = this.mimetypeHandlerLookup(nativeFile.type);
    
    if (handler) {
      // Create typed component
      const component = new handler.componentClass();
      // TODO: Initialize component with file as relatedObject
      // This will be implemented in FS.6 when UcpComponent gets scenarioCreate()
      return component;
    }
    
    // Return DefaultFile if no handler
    return file;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Root Folder Access
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get root folder
   */
  get rootFolder(): Reference<DefaultFolder> {
    return this.rootFolderInstance;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Cleanup
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Release resources
   */
  dispose(): void {
    if (this.rootFolderInstance) {
      this.rootFolderInstance.dispose();
      this.rootFolderInstance = null;
    }
    // Note: Registry is singleton, not cleared on FileSystem dispose
  }
}







