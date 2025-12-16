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
    options: { path: string; folderName: string; parentUuid?: string }
  ): Promise<DefaultFolder> {
    folder.model.path = options.path;
    folder.model.folderName = options.folderName;
    folder.model.name = options.folderName;
    folder.model.parentUuid = options.parentUuid || null;
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
      parentUuid: parent?.model.uuid
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
}






