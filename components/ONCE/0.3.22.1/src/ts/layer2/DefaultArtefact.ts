/**
 * DefaultArtefact.ts - Artefact Component Implementation
 * 
 * An Artefact represents content-addressable storage (like git objects).
 * Same content always produces the same Artefact (by hash).
 * 
 * Web4 Principles:
 * - P1: Everything is a Scenario
 * - P4: Radical OOP - Artefact IS a UcpComponent
 * - P6: Empty constructor, init pattern
 * - P7: Layer 2 sync methods
 * - P29: ContentIDProvider for hashing
 * 
 * @ior ior:esm:/ONCE/{version}/DefaultArtefact
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { UcpComponent } from './UcpComponent.js';
import { ArtefactModel } from '../layer3/ArtefactModel.interface.js';

/**
 * DefaultArtefact - Artefact component implementation
 * 
 * Usage:
 * ```typescript
 * // Created by component.scenarioCreate() when content hash available
 * const artefact = new DefaultArtefact();
 * artefact.initFromHash(contentHash, size, mimetype, unitUuid);
 * ```
 */
export class DefaultArtefact extends UcpComponent<ArtefactModel> {
  
  /**
   * Provide default model values
   */
  protected modelDefault(): ArtefactModel {
    return {
      uuid: this.uuidCreate(),
      name: 'Artefact',
      contentHash: '',
      algorithm: 'SHA-256',
      size: 0,
      unitUuid: '',
      createdAt: Date.now(),
      mimetype: 'application/octet-stream'
    };
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Model Accessors (P16: TypeScript Accessors)
  // ═══════════════════════════════════════════════════════════════
  
  get contentHash(): string {
    return this.model.contentHash;
  }
  
  get algorithm(): string {
    return this.model.algorithm;
  }
  
  get size(): number {
    return this.model.size;
  }
  
  get unitUuid(): string {
    return this.model.unitUuid;
  }
  
  get mimetype(): string {
    return this.model.mimetype;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Initialization
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Initialize Artefact from content hash
   * 
   * @param contentHash SHA-256 hash of content
   * @param size Content size in bytes
   * @param mimetype MIME type
   * @param unitUuid UUID of the creating Unit
   */
  initFromHash(
    contentHash: string,
    size: number,
    mimetype: string,
    unitUuid: string
  ): void {
    this.model.contentHash = contentHash;
    this.model.size = size;
    this.model.mimetype = mimetype;
    this.model.unitUuid = unitUuid;
    this.model.name = `Artefact-${contentHash.substring(0, 8)}`;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Scenario Storage
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Compute storage path for this Artefact
   * 
   * Artefacts are stored by content hash (content-addressable):
   * Pattern: /scenarios/artefact/{hash-prefix}/{hash}.artefact.json
   */
  storagePathCompute(basePath: string): string {
    const hashPrefix = this.model.contentHash.substring(0, 2);
    return `${basePath}/artefact/${hashPrefix}/${this.model.contentHash}.artefact.json`;
  }
  
  /**
   * Get scenario data for storage
   */
  scenarioData(): Record<string, unknown> {
    return {
      uuid: this.model.uuid,
      name: this.model.name,
      contentHash: this.model.contentHash,
      algorithm: this.model.algorithm,
      size: this.model.size,
      unitUuid: this.model.unitUuid,
      mimetype: this.model.mimetype,
      createdAt: this.model.createdAt
    };
  }
  
  /**
   * Check if another artefact has the same content hash
   * 
   * @param other Another artefact to compare
   * @returns true if content hashes match
   */
  contentEquals(other: DefaultArtefact): boolean {
    return this.model.contentHash === other.model.contentHash;
  }
}

