/**
 * FileOrchestrator.ts - Async Operations for FileSystem Components
 * 
 * Layer 4 Orchestrator for async file operations.
 * Handles I/O operations that Layer 2 components delegate.
 * 
 * Web4 Principles:
 * - P7: Async Only in Layer 4 - All async operations here
 * - P4: Radical OOP - Orchestrator pattern
 * - P24: RelatedObjects for component lookup
 * 
 * Usage:
 * ```typescript
 * const orchestrator = new FileOrchestrator();
 * await orchestrator.fileInitFromBlob(file, blob, filename, mimetype);
 * const hash = await orchestrator.contentHashCompute(file);
 * ```
 * 
 * @ior ior:esm:/ONCE/{version}/FileOrchestrator
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { DefaultFile } from '../layer2/DefaultFile.js';
import { DefaultFolder } from '../layer2/DefaultFolder.js';
import { DefaultFileSystem } from '../layer2/DefaultFileSystem.js';
import { DefaultImage } from '../layer2/DefaultImage.js';
import { Reference } from '../layer3/Reference.interface.js';
import { FileModel } from '../layer3/FileModel.interface.js';
import { FolderModel } from '../layer3/FolderModel.interface.js';
import { FileSystemModel } from '../layer3/FileSystemModel.interface.js';
import { UcpComponent } from '../layer2/UcpComponent.js';

/**
 * FileOrchestrator - Async operations for FileSystem
 * 
 * All async I/O operations are delegated here from Layer 2 components.
 * Layer 2 components remain synchronous with callbacks/events.
 */
export class FileOrchestrator {
  
  // ═══════════════════════════════════════════════════════════════
  // File Operations
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Initialize a File from a Blob
   * 
   * @param file The DefaultFile instance to initialize
   * @param blob The Blob content
   * @param filename File name
   * @param mimetype MIME type
   * @returns The initialized file
   */
  async fileInitFromBlob(
    file: DefaultFile,
    blob: Blob,
    filename: string,
    mimetype: string
  ): Promise<DefaultFile> {
    // Delegate to DefaultFile.initFromBlob (which handles async internally)
    await file.initFromBlob(blob, filename, mimetype);
    return file;
  }
  
  /**
   * Compute content hash for a File
   * 
   * @param file The file to hash
   * @returns SHA-256 hash as hex string
   */
  async contentHashCompute(file: DefaultFile): Promise<string> {
    // Delegate to DefaultFile.contentHashCompute
    return file.contentHashCompute();
  }
  
  // ═══════════════════════════════════════════════════════════════
  // FileSystem Operations
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Initialize a FileSystem
   * 
   * @param fileSystem The FileSystem to initialize
   * @param scenario Optional scenario data
   * @returns Initialized FileSystem
   */
  async fileSystemInit(
    fileSystem: DefaultFileSystem,
    scenario?: { model?: FileSystemModel }
  ): Promise<DefaultFileSystem> {
    // Delegate to DefaultFileSystem.init
    await fileSystem.init(scenario);
    return fileSystem;
  }
  
  /**
   * Create a File in the FileSystem
   * 
   * @param fileSystem The FileSystem
   * @param blob File content
   * @param filename File name
   * @param mimetype MIME type
   * @param parentFolder Optional parent folder
   * @returns Created File
   */
  async fileCreate(
    fileSystem: DefaultFileSystem,
    blob: Blob,
    filename: string,
    mimetype: string,
    parentFolder?: DefaultFolder
  ): Promise<DefaultFile> {
    const file = new DefaultFile();
    await this.fileInitFromBlob(file, blob, filename, mimetype);
    
    // Compute content hash
    await this.contentHashCompute(file);
    
    // Set path
    const parent = parentFolder || fileSystem.rootFolder;
    if (parent) {
      file.model.path = parent.model.path + '/' + filename;
      parent.childAdd(file);
    } else {
      file.model.path = '/' + filename;
    }
    
    return file;
  }
  
  /**
   * Create a component from a native File
   * 
   * @param fileSystem The FileSystem
   * @param nativeFile Browser File object
   * @returns Created component (typed by mimetype or DefaultFile)
   */
  async componentFromFile(
    fileSystem: DefaultFileSystem,
    nativeFile: File
  ): Promise<UcpComponent<any>> {
    // Create blob from file
    const arrayBuffer = await nativeFile.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: nativeFile.type });
    
    // Create DefaultFile first
    const file = await this.fileCreate(
      fileSystem,
      blob,
      nativeFile.name,
      nativeFile.type
    );
    
    // Lookup handler for mimetype
    const handler = fileSystem.mimetypeHandlerLookup(nativeFile.type);
    
    if (handler) {
      // Create typed component
      const component = new handler.componentClass();
      
      // If it's an Image, initialize it
      if (component instanceof DefaultImage) {
        await this.imageInitFromFile(component, nativeFile);
      }
      
      return component;
    }
    
    return file;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Folder Operations
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Initialize a Folder
   * 
   * @param folder The Folder to initialize
   * @param options Folder options
   * @returns Initialized Folder
   */
  async folderInit(
    folder: DefaultFolder,
    options: { path: string; folderName: string; parentIor?: string }
  ): Promise<DefaultFolder> {
    folder.model.path = options.path;
    folder.model.folderName = options.folderName;
    folder.model.name = options.folderName;
    folder.model.parent = options.parentIor || null;
    folder.model.createdAt = Date.now();
    folder.model.modifiedAt = Date.now();
    
    return folder;
  }
  
  /**
   * Create a Folder in the FileSystem
   * 
   * @param fileSystem The FileSystem
   * @param folderName Folder name
   * @param parentFolder Optional parent folder
   * @returns Created Folder
   */
  async folderCreate(
    fileSystem: DefaultFileSystem,
    folderName: string,
    parentFolder?: DefaultFolder
  ): Promise<DefaultFolder> {
    const folder = new DefaultFolder();
    
    const parent = parentFolder || fileSystem.rootFolder;
    const path = parent 
      ? parent.model.path + '/' + folderName
      : '/' + folderName;
    
    await this.folderInit(folder, {
      path,
      folderName,
      parentIor: parent ? `ior:scenario:${parent.model.uuid}` : undefined
    });
    
    if (parent) {
      parent.childAdd(folder);
    }
    
    return folder;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Image Operations
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Initialize an Image from a File
   * 
   * @param image The Image component
   * @param file Browser File object
   * @returns Initialized Image
   */
  async imageInitFromFile(image: DefaultImage, file: File): Promise<DefaultImage> {
    // Delegate to DefaultImage.initFromFile
    await image.initFromFile(file);
    return image;
  }
  
  /**
   * Compute image dimensions from a File
   * 
   * @param file Browser File object
   * @returns Width and height
   */
  async imageDimensionsCompute(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      function handleLoad(): void {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(objectUrl);
      }
      
      function handleError(): void {
        resolve({ width: 0, height: 0 });
        URL.revokeObjectURL(objectUrl);
      }
      
      img.onload = handleLoad;
      img.onerror = handleError;
      img.src = objectUrl;
    });
  }
  
  // ═══════════════════════════════════════════════════════════════
  // File CRUD Operations (FS.3)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Delete a file
   * 
   * @param file The file to delete
   * @param parentFolder Optional parent folder to remove from
   */
  async fileDelete(file: DefaultFile, parentFolder?: DefaultFolder): Promise<void> {
    // Remove from parent first
    if (parentFolder) {
      parentFolder.childRemove(file);
    }
    
    // Delete file (handles filesystem, Unit, and symlinks)
    await file.delete();
  }
  
  /**
   * Move a file to a new path
   * 
   * @param file The file to move
   * @param newPath New directory path
   * @param oldParent Optional current parent folder
   * @param newParent Optional new parent folder
   */
  async fileMove(
    file: DefaultFile,
    newPath: string,
    oldParent?: DefaultFolder,
    newParent?: DefaultFolder
  ): Promise<void> {
    // Remove from old parent
    if (oldParent) {
      oldParent.childRemove(file);
    }
    
    // Move file on filesystem and update Unit references
    await file.pathMove(newPath);
    
    // Add to new parent
    if (newParent) {
      newParent.childAdd(file);
    }
  }
  
  /**
   * Rename a file
   * 
   * @param file The file to rename
   * @param newName New filename
   */
  async fileRename(file: DefaultFile, newName: string): Promise<void> {
    // Rename handles filesystem and Unit references
    await file.rename(newName);
  }
  
  /**
   * Copy a file to a new location
   * 
   * @param file The file to copy
   * @param newPath Path for the copy
   * @param newParent Parent folder for the copy
   * @returns The copied file
   */
  async fileCopy(
    file: DefaultFile,
    newPath: string,
    newParent?: DefaultFolder
  ): Promise<DefaultFile> {
    // Create new file with same content
    const copy = new DefaultFile();
    await copy.init();
    
    // Copy model properties
    copy.model.filename = file.model.filename;
    copy.model.name = file.model.name;
    copy.model.mimetype = file.model.mimetype;
    copy.model.size = file.model.size;
    copy.model.contentHash = file.model.contentHash;
    copy.model.content = file.model.content;
    copy.model.path = newPath;
    copy.model.modifiedAt = Date.now();
    
    // Add to parent
    if (newParent) {
      newParent.childAdd(copy);
    }
    
    return copy;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Folder CRUD Operations (FS.3)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Delete a folder
   * 
   * @param folder The folder to delete
   * @param force Delete even if folder has children
   * @param parentFolder Optional parent folder to remove from
   */
  async folderDelete(
    folder: DefaultFolder,
    force: boolean = false,
    parentFolder?: DefaultFolder
  ): Promise<void> {
    // Remove from parent first
    if (parentFolder) {
      parentFolder.childRemove(folder);
    }
    
    // Delete folder (handles recursive children, Units, and symlinks)
    await folder.delete(force);
  }
  
  /**
   * Move a folder to a new path
   * 
   * @param folder The folder to move
   * @param newPath New parent path
   * @param oldParent Optional current parent folder
   * @param newParent Optional new parent folder
   */
  async folderMove(
    folder: DefaultFolder,
    newPath: string,
    oldParent?: DefaultFolder,
    newParent?: DefaultFolder
  ): Promise<void> {
    // Remove from old parent
    if (oldParent) {
      oldParent.childRemove(folder);
    }
    
    // Move folder on filesystem and update children paths
    await folder.pathMove(newPath);
    
    // Add to new parent
    if (newParent) {
      newParent.childAdd(folder);
    }
  }
  
  /**
   * Rename a folder
   * 
   * @param folder The folder to rename
   * @param newName New folder name
   */
  async folderRename(folder: DefaultFolder, newName: string): Promise<void> {
    // Rename handles filesystem, children paths, and Unit references
    await folder.rename(newName);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Folder Loading (F.3: Views delegate fetch to layer4)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Load folder contents from server
   * 
   * Layer 5 views should call this instead of fetching directly.
   * Returns { contentType, data } for flexible parsing by caller.
   * 
   * Data may be string (fresh fetch) or object (cached by IOR).
   * Caller should handle both cases.
   * 
   * @param folderPath URL path to folder
   * @returns Object with contentType and data (string or object)
   * @pdca 2025-12-17-UTC-1740.fetch-centralization-dry.pdca.md
   * @pdca 2026-01-02-UTC-1200.filebrowser-fix.pdca.md FB.1
   */
  async folderLoadFromServer(folderPath: string): Promise<{ contentType: string; data: string | object }> {
    // Import IOR dynamically to avoid circular dependency
    const { IOR } = await import('./IOR.js');
    
    // Use ?format=json to bypass SPA catch-all route
    const fetchUrl = folderPath + (folderPath.includes('?') ? '&' : '?') + 'format=json';
    
    const ior = await new IOR().init(fetchUrl);
    const rawData = await ior.load<string | object>();
    
    // FB.1: Handle both string (fresh fetch) and object (cached by IOR)
    // IOR cache may return already-parsed JSON objects
    if (typeof rawData === 'object' && rawData !== null) {
      // Already parsed - return directly as JSON
      return { contentType: 'application/json', data: rawData };
    }
    
    // String - determine type by content
    const stringData = rawData as string;
    const isJson = stringData.trim().startsWith('{') || stringData.trim().startsWith('[');
    const contentType = isJson ? 'application/json' : 'text/html';
    
    return { contentType, data: stringData };
  }
  
  /**
   * Load file contents from server
   * 
   * Layer 5 views should call this instead of fetching directly.
   * 
   * @param filePath URL path to file
   * @returns File contents as string
   * @pdca 2025-12-17-UTC-1740.fetch-centralization-dry.pdca.md
   */
  async fileLoadFromServer(filePath: string): Promise<string> {
    const { IOR } = await import('./IOR.js');
    
    const ior = await new IOR().init(filePath);
    return await ior.load<string>();
  }
  
  // ═══════════════════════════════════════════════════════════════
  // IOR-based Loading (Option C: ISR Pattern)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Load folder via IOR (ISR Pattern)
   * 
   * Resolves a folder path to a DefaultFolder instance.
   * Children are automatically prefetched by UcpModel proxy.
   * 
   * @param path Folder path (e.g., "/EAMD.ucp/components/ONCE/0.3.22.1")
   * @param view Optional view to notify when folder is resolved
   * @returns Resolved folder instance
   * @pdca 2025-12-30-UTC-1200.lazy-reference-kernel-isr.pdca.md
   */
  async folderLoad(path: string): Promise<DefaultFolder> {
    const { IOR } = await import('./IOR.js');
    
    const ior = new IOR<DefaultFolder>();
    await ior.init(`ior:file://${path}`);
    
    const folder = await ior.resolve();
    if (!folder) {
      throw new Error(`[FileOrchestrator] Failed to resolve folder: ${path}`);
    }
    return folder;
  }
  
  /**
   * Load folder and set on view (ISR Pattern - P7 compliant)
   * 
   * This method handles async resolution in Layer 4,
   * then makes a SYNC call to the view's folderSet method.
   * 
   * @param path Folder path
   * @param view View with folderSet(folder: DefaultFolder) method
   * @pdca 2025-12-30-UTC-1200.lazy-reference-kernel-isr.pdca.md
   */
  folderLoadForView(path: string, view: { folderSet(folder: DefaultFolder): void }): void {
    this.folderLoad(path).then(function onFolderResolved(folder): void {
      view.folderSet(folder);  // ✅ SYNC call to Layer 5
    }).catch(function onError(error): void {
      console.error('[FileOrchestrator] folderLoadForView error:', error);
    });
  }
  
  /**
   * Load file via IOR (ISR Pattern)
   * 
   * Resolves a file path to a DefaultFile instance.
   * 
   * @param path File path
   * @returns Resolved file instance
   * @pdca 2025-12-30-UTC-1200.lazy-reference-kernel-isr.pdca.md
   */
  async fileLoad(path: string): Promise<DefaultFile> {
    const { IOR } = await import('./IOR.js');
    
    const ior = new IOR<DefaultFile>();
    await ior.init(`ior:file://${path}`);
    
    const file = await ior.resolve();
    if (!file) {
      throw new Error(`[FileOrchestrator] Failed to resolve file: ${path}`);
    }
    return file;
  }
  
  /**
   * Load file and set on view (ISR Pattern - P7 compliant)
   * 
   * @param path File path
   * @param view View with fileSet(file: DefaultFile) method
   * @pdca 2025-12-30-UTC-1200.lazy-reference-kernel-isr.pdca.md
   */
  fileLoadForView(path: string, view: { fileSet(file: DefaultFile): void }): void {
    this.fileLoad(path).then(function onFileResolved(file): void {
      view.fileSet(file);  // ✅ SYNC call to Layer 5
    }).catch(function onError(error): void {
      console.error('[FileOrchestrator] fileLoadForView error:', error);
    });
  }
}

















