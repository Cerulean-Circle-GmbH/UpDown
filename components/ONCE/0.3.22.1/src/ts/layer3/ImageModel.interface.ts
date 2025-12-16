/**
 * ImageModel.interface.ts - Image Component Model
 * 
 * Data model for the Image component.
 * Contains image metadata and display properties.
 * 
 * Web4 Principles:
 * - P1: Everything is a Scenario (model can be serialized)
 * - P5: Reference<T> for nullable fields
 * - P19: One File One Type
 * 
 * @ior ior:esm:/ONCE/{version}/ImageModel.interface
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { Reference } from './Reference.interface.js';

/**
 * ImageModel - Data model for Image component
 * 
 * Serializable model containing image metadata.
 * The actual image binary is stored via the File component.
 */
export interface ImageModel {
  /** Unique identifier */
  uuid: string;
  
  /** Display name */
  name: string;
  
  /** MIME type (e.g., 'image/jpeg', 'image/png') */
  mimetype: string;
  
  /** Image width in pixels */
  width: number;
  
  /** Image height in pixels */
  height: number;
  
  /** UUID of the associated File component (stored in RelatedObjects) */
  fileUuid: Reference<string>;
  
  /** 
   * Object URL for displaying the image
   * Runtime-only, not serialized
   */
  objectUrl: Reference<string>;
  
  /** Alt text for accessibility */
  alt: string;
  
  /** Optional caption */
  caption: string;
}







