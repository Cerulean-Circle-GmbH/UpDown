/**
 * FileModel.interface.ts - File Component Model
 * 
 * Represents a file in the Web4 FileSystem.
 * Content stored as Blob, with hash for deduplication.
 * 
 * Web4 Principles:
 * - P5: Reference<T> for nullable
 * - P19: One File One Type
 * - P24: RelatedObjects for file/unit/artefact (NOT explicit properties)
 * 
 * Note: File, Unit, and Artefact are stored in RelatedObjects,
 * NOT as explicit model properties. Access via:
 *   this.relatedObjectGet(File)
 *   this.relatedObjectGet(Unit)
 *   this.relatedObjectGet(Artefact)
 * 
 * @ior ior:esm:/ONCE/{version}/FileModel
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { Model } from './Model.interface.js';
import { Reference } from './Reference.interface.js';

/**
 * FileModel - Data model for File component
 * 
 * Lifecycle:
 * 1. File dropped → content extracted as Blob
 * 2. contentHash computed (SHA-256)
 * 3. Unit + Artefact created via UcpComponent.scenarioCreate()
 * 4. Synced to server via FileOrchestrator
 */
export interface FileModel extends Model {
  /** File path relative to FileSystem root */
  path: string;
  
  /** Original filename */
  filename: string;
  
  /** MIME type (e.g., "image/png", "text/plain") */
  mimetype: string;
  
  /** File size in bytes */
  size: number;
  
  /** SHA-256 hash of content (for deduplication/Artefact) */
  contentHash: Reference<string>;
  
  /** Creation timestamp */
  createdAt: number;
  
  /** Last modification timestamp */
  modifiedAt: number;
  
  /** Is this a symbolic link? */
  isLink: boolean;
  
  /** If isLink, the target path (stable reference) */
  linkTarget: Reference<string>;
}

/**
 * FileContent - Runtime content (NOT stored in model)
 * 
 * Kept separate from FileModel because:
 * - Blobs can't be serialized to JSON scenarios
 * - Content loaded on-demand via FileOrchestrator
 */
export interface FileContent {
  /** Binary content as Blob */
  blob: Blob;
  
  /** Object URL for display (created from Blob) */
  objectUrl: Reference<string>;
  
  /** ArrayBuffer for processing */
  arrayBuffer: Reference<ArrayBuffer>;
}



