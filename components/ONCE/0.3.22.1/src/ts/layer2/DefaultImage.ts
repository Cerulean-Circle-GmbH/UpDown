/**
 * DefaultImage.ts - Image Component Implementation
 * 
 * Web4 Image component for handling image files.
 * Demonstrates the FileSystem → MimetypeHandler → Component pattern.
 * 
 * Web4 Principles:
 * - P4: Radical OOP
 * - P6: Empty constructor + init()
 * - P24: RelatedObjects for file/unit/artefact
 * - P29: IDProvider for UUID generation
 * 
 * @ior ior:esm:/ONCE/{version}/DefaultImage
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { UcpComponent } from './UcpComponent.js';
import { ImageModel } from '../layer3/ImageModel.interface.js';
import { Reference } from '../layer3/Reference.interface.js';
import { DefaultFile } from './DefaultFile.js';
import { DefaultMimetypeHandlerRegistry } from './DefaultMimetypeHandlerRegistry.js';

/**
 * DefaultImage - Image component implementation
 * 
 * Handles image/* MIME types and displays them via ImageDefaultView.
 * 
 * Usage:
 * ```typescript
 * const image = new DefaultImage();
 * await image.init(scenario);
 * await image.initFromFile(droppedFile);
 * ```
 */
export class DefaultImage extends UcpComponent<ImageModel> {
  
  /** Associated file component (stored in RelatedObjects) */
  private fileInstance: Reference<DefaultFile> = null;
  
  /**
   * Register this component as a mimetype handler for image/*
   * Called once at module load time
   */
  static registerMimetypeHandler(): void {
    const registry = DefaultMimetypeHandlerRegistry.instance;
    
    // Register for all image types
    registry.handlerRegister({
      pattern: 'image/*',
      componentClass: DefaultImage,
      priority: 100,
      name: 'Image',
      description: 'Handles all image file types'
    });
    
    // Register specific high-priority handlers for common types
    const commonTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    for (const type of commonTypes) {
      registry.handlerRegister({
        pattern: type,
        componentClass: DefaultImage,
        priority: 200,
        name: `Image (${type.split('/')[1]})`,
        description: `Handles ${type} files`
      });
    }
  }
  
  /**
   * Default model for Image component
   */
  modelDefault(): ImageModel {
    return {
      uuid: this.uuidCreate(),
      name: 'Untitled Image',
      mimetype: 'image/jpeg',
      width: 0,
      height: 0,
      fileUuid: null,
      objectUrl: null,
      alt: '',
      caption: ''
    };
  }
  
  /**
   * Initialize from a File object (e.g., from drag & drop)
   * 
   * After initialization, automatically creates:
   * - Unit: Named instance for this image
   * - Artefact: Content-addressable storage with hash
   * 
   * @param file The File object to initialize from
   */
  async initFromFile(file: File): Promise<void> {
    // Create and initialize the underlying File component
    this.fileInstance = new DefaultFile();
    const mimetype = file.type || 'image/jpeg';
    await this.fileInstance.initFromBlob(file, file.name, mimetype);
    
    // Store in RelatedObjects for P24 compliance
    this.controller.relatedObjectRegister(DefaultFile, this.fileInstance);
    
    // Extract image dimensions
    const dimensions = await this.imageDimensionsCompute(file);
    
    // Update model with file info
    this.model.name = file.name;
    this.model.mimetype = mimetype;
    this.model.width = dimensions.width;
    this.model.height = dimensions.height;
    this.model.fileUuid = this.fileInstance.model.uuid;
    this.model.objectUrl = this.fileInstance.objectUrl;
    this.model.alt = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
    
    // FS.6: Create Unit + Artefact for this image
    // Compute content hash for the artefact
    const contentHash = await this.fileInstance.contentHashCompute();
    const contentSize = this.fileInstance.model.size;
    
    // Create scenario (Unit + Artefact) in base class
    await this.scenarioCreate(contentHash, contentSize, mimetype);
  }
  
  /**
   * Compute image dimensions from File
   * @param file The image file
   * @returns Promise with width and height
   */
  private async imageDimensionsCompute(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      // P4a: Use function declarations instead of arrow functions
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
  
  /**
   * Get the object URL for displaying the image
   */
  get objectUrl(): Reference<string> {
    return this.model.objectUrl;
  }
  
  /**
   * Get the underlying File component
   */
  get file(): Reference<DefaultFile> {
    return this.fileInstance;
  }
  
  /**
   * Get image width
   */
  get width(): number {
    return this.model.width;
  }
  
  /**
   * Get image height
   */
  get height(): number {
    return this.model.height;
  }
  
  /**
   * Get aspect ratio
   */
  get aspectRatio(): number {
    if (this.model.height === 0) return 1;
    return this.model.width / this.model.height;
  }
  
  /**
   * Set alt text
   */
  set alt(value: string) {
    this.model.alt = value;
  }
  
  /**
   * Get alt text
   */
  get alt(): string {
    return this.model.alt;
  }
  
  /**
   * Set caption
   */
  set caption(value: string) {
    this.model.caption = value;
  }
  
  /**
   * Get caption
   */
  get caption(): string {
    return this.model.caption;
  }
  
  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.fileInstance) {
      this.fileInstance.dispose();
      this.fileInstance = null;
    }
  }
}

// Auto-register mimetype handler when module is loaded
DefaultImage.registerMimetypeHandler();



