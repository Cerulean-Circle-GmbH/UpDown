/**
 * UnitModel Interface - Unit component model extending minimal base Model
 * 
 * MASTER: Based on Unit/0.3.0.5 (clean, no CLI pollution)
 * 
 * Web4 Principles:
 * - P1: Everything is a Scenario - Units ARE scenarios
 * - P5: Reference<T> for nullable
 * - P19: One File One Type
 * 
 * Purpose: Unit-specific model with MOF classification and terminal identity
 * 
 * @pdca 2025-12-21-UTC-2100.defaultunit-inline-migration.pdca.md
 * @master Unit/0.3.0.5/src/ts/layer3/UnitModel.interface.ts
 */

import { Model } from './Model.interface.js';
import { TypeM3 } from './TypeM3.enum.js';
import { UnitReference } from './UnitReference.interface.js';
import { Reference } from './Reference.interface.js';

/**
 * UnitModel - Data model for Unit component
 * 
 * A Unit is a named instance that links:
 * - Origin (source file IOR)
 * - Definition (content IOR)
 * - MOF classification (typeM3)
 * - References (symlinks, named links)
 */
export interface UnitModel extends Model {
  // ═══════════════════════════════════════════════════════════════
  // Core Identity (from Unit/0.3.0.5 MASTER)
  // ═══════════════════════════════════════════════════════════════
  
  /** Human-readable unit name for terminal identification (uni-t) */
  name: string;
  
  /** IOR string: Source file/folder reference (GitTextIOR format) */
  origin: string;
  
  /** IOR string: Content/definition reference (GitTextIOR format) */
  definition: string;
  
  /** MOF M3/M2/M1 hierarchy classification */
  typeM3?: TypeM3;
  
  /** Path in scenarios/index/ for this unit */
  indexPath: string;
  
  // ═══════════════════════════════════════════════════════════════
  // Reference Tracking (from Unit/0.3.0.5 MASTER)
  // ═══════════════════════════════════════════════════════════════
  
  /** Unified reference array with IOR strings (replaces symlinkPaths + namedLinks) */
  references: UnitReference[];
  
  // ═══════════════════════════════════════════════════════════════
  // Timestamps (from Unit/0.3.0.5 MASTER — string format!)
  // ═══════════════════════════════════════════════════════════════
  
  /** Creation timestamp (ISO 8601 string) */
  createdAt: string;
  
  /** Last update timestamp (ISO 8601 string) */
  updatedAt: string;
  
  // ═══════════════════════════════════════════════════════════════
  // ONCE-specific Extensions (optional, not in Unit/0.3.0.5)
  // ═══════════════════════════════════════════════════════════════
  
  /** Component type (class name, e.g., 'Image', 'File') — ONCE extension */
  componentType?: string;
  
  /** IOR to the component — ONCE extension */
  componentIor?: string;
  
  /** UUID of linked Artefact (content hash) — ONCE extension */
  artefactUuid?: Reference<string>;
  
  /** UUID of linked File (if file-based) — ONCE extension */
  fileUuid?: Reference<string>;
  
  /** Scenario storage path (symlink target) — ONCE extension */
  storagePath?: Reference<string>;
}
