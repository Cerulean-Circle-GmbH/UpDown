/**
 * ArtefactModel.interface.ts - Artefact Component Model
 * 
 * An Artefact represents content-addressable storage (like git objects).
 * Same content always produces the same Artefact (by hash).
 * 
 * Web4 Principles:
 * - P1: Everything is a Scenario
 * - P5: Reference<T> for nullable
 * - P19: One File One Type
 * - P29: ContentIDProvider for hashing
 * 
 * @ior ior:esm:/ONCE/{version}/ArtefactModel
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { Model } from './Model.interface.js';

/**
 * ArtefactModel - Data model for Artefact component
 * 
 * Artefacts enable:
 * - Content deduplication (same content = same artefact)
 * - Integrity verification (hash matches content)
 * - Git-like storage (content-addressable)
 */
export interface ArtefactModel extends Model {
  /** SHA-256 hash of content (64 hex chars) */
  contentHash: string;
  
  /** Hash algorithm used (e.g., 'SHA-256') */
  algorithm: string;
  
  /** Content size in bytes */
  size: number;
  
  /** UUID of the Unit that created this Artefact */
  unitUuid: string;
  
  /** Creation timestamp */
  createdAt: number;
  
  /** MIME type of content */
  mimetype: string;
}

