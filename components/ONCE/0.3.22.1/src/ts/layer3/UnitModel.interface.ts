/**
 * UnitModel.interface.ts - Unit Component Model
 * 
 * A Unit represents an instance of a component with its scenario data.
 * Units are linked to Artefacts (content-addressable) for deduplication.
 * 
 * Web4 Principles:
 * - P1: Everything is a Scenario - Units ARE scenarios
 * - P5: Reference<T> for nullable
 * - P19: One File One Type
 * 
 * @ior ior:esm:/ONCE/{version}/UnitModel
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { Model } from './Model.interface.js';
import { Reference } from './Reference.interface.js';
import { UnitReference } from './UnitReference.interface.js';

/**
 * UnitModel - Data model for Unit component
 * 
 * A Unit is a named instance that links:
 * - Component type (class name)
 * - Component IOR (for method invocation)
 * - Artefact (content hash for deduplication)
 * - File (if file-based component)
 */
export interface UnitModel extends Model {
  /** Component type (class name, e.g., 'Image', 'File') */
  componentType: string;
  
  /** IOR to the component */
  componentIor: string;
  
  /** UUID of linked Artefact (content hash) */
  artefactUuid: Reference<string>;
  
  /** UUID of linked File (if file-based) */
  fileUuid: Reference<string>;
  
  /** Creation timestamp */
  createdAt: number;
  
  /** Last modification timestamp */
  modifiedAt: number;
  
  /** Scenario storage path (symlink target) */
  storagePath: Reference<string>;
  
  /** Index path for scenario storage */
  indexPath: Reference<string>;
  
  /** References to related scenarios */
  references: UnitReference[];
}

