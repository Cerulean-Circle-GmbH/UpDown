/**
 * DefaultUnit.ts - Unit Component Implementation
 * 
 * A Unit represents an instance of a component with its scenario data.
 * Created by UcpComponent.scenarioCreate() for all components.
 * 
 * Web4 Principles:
 * - P1: Everything is a Scenario - Units ARE scenarios
 * - P4: Radical OOP - Unit IS a UcpComponent
 * - P6: Empty constructor, init pattern
 * - P7: Layer 2 sync methods
 * - P24: RelatedObjects for artefact/file references
 * 
 * @ior ior:esm:/ONCE/{version}/DefaultUnit
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { UcpComponent } from './UcpComponent.js';
import { UnitModel } from '../layer3/UnitModel.interface.js';
import { Reference } from '../layer3/Reference.interface.js';

/**
 * DefaultUnit - Unit component implementation
 * 
 * Usage:
 * ```typescript
 * // Created automatically by component.scenarioCreate()
 * const image = new DefaultImage();
 * await image.initFromFile(file);
 * await image.scenarioCreate(); // Creates Unit + Artefact
 * ```
 */
export class DefaultUnit extends UcpComponent<UnitModel> {
  
  /**
   * Provide default model values
   */
  protected modelDefault(): UnitModel {
    return {
      uuid: this.uuidCreate(),
      name: 'Unit',
      componentType: '',
      componentIor: '',
      artefactUuid: null,
      fileUuid: null,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      storagePath: null,
      indexPath: null,
      references: []
    };
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Model Accessors (P16: TypeScript Accessors)
  // ═══════════════════════════════════════════════════════════════
  
  get componentType(): string {
    return this.model.componentType;
  }
  
  set componentType(value: string) {
    this.model.componentType = value;
    this.model.modifiedAt = Date.now();
  }
  
  get componentIor(): string {
    return this.model.componentIor;
  }
  
  set componentIor(value: string) {
    this.model.componentIor = value;
    this.model.modifiedAt = Date.now();
  }
  
  get artefactUuid(): Reference<string> {
    return this.model.artefactUuid;
  }
  
  set artefactUuid(value: Reference<string>) {
    this.model.artefactUuid = value;
    this.model.modifiedAt = Date.now();
  }
  
  get fileUuid(): Reference<string> {
    return this.model.fileUuid;
  }
  
  set fileUuid(value: Reference<string>) {
    this.model.fileUuid = value;
    this.model.modifiedAt = Date.now();
  }
  
  get storagePath(): Reference<string> {
    return this.model.storagePath;
  }
  
  set storagePath(value: Reference<string>) {
    this.model.storagePath = value;
    this.model.modifiedAt = Date.now();
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Initialization
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Initialize Unit for a component
   * 
   * @param componentType Component class name
   * @param componentIor Component IOR
   * @param fileUuid Optional file UUID
   */
  initForComponent(
    componentType: string,
    componentIor: string,
    fileUuid?: string
  ): void {
    this.model.componentType = componentType;
    this.model.componentIor = componentIor;
    this.model.fileUuid = fileUuid || null;
    this.model.name = `${componentType}-${this.model.uuid.substring(0, 8)}`;
  }
  
  /**
   * Link this Unit to an Artefact
   * 
   * @param artefactUuid UUID of the Artefact
   */
  artefactLink(artefactUuid: string): void {
    this.model.artefactUuid = artefactUuid;
    this.model.modifiedAt = Date.now();
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Scenario Storage
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Compute storage path for this Unit
   * 
   * Pattern: /scenarios/type/{ComponentType}/{version}/{uuid}.scenario.json
   */
  storagePathCompute(basePath: string, version: string): string {
    const path = `${basePath}/${this.model.componentType}/${version}/${this.model.uuid}.scenario.json`;
    this.model.storagePath = path;
    return path;
  }
  
  /**
   * Get scenario data for storage
   */
  scenarioData(): Record<string, unknown> {
    return {
      uuid: this.model.uuid,
      name: this.model.name,
      componentType: this.model.componentType,
      componentIor: this.model.componentIor,
      artefactUuid: this.model.artefactUuid,
      fileUuid: this.model.fileUuid,
      createdAt: this.model.createdAt,
      modifiedAt: this.model.modifiedAt
    };
  }
}

