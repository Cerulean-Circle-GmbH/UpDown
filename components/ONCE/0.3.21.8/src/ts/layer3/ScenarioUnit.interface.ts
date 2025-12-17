/**
 * ScenarioUnit Interface - Unit extension for Scenario
 * 
 * ✅ Web4 Principle 1: Everything is a Scenario
 * ✅ Web4 Principle 19: One File One Type
 * 
 * Purpose: Extends Scenario with Unit reference tracking and schema versioning
 * 
 * This interface adds Unit-specific metadata to scenarios:
 * - indexPath: Canonical storage location
 * - symlinkPaths: Created symlinks
 * - references: All references with sync status
 * - schemaVersion: For migration support
 * 
 * @pdca 2025-12-08-UTC-1000.scenario-unit-unification.pdca.md
 */

import type { UnitReference } from './UnitReference.interface.js';
import type { TypeM3 } from './TypeM3.enum.js';

/**
 * ScenarioUnit - Unit metadata extension for Scenario
 * 
 * All fields are optional for backward compatibility.
 * Existing scenarios without `unit` continue to work.
 */
export interface ScenarioUnit {
  // ═══════════════════════════════════════════════════════════════
  // Storage Location
  // ═══════════════════════════════════════════════════════════════
  
  /** 
   * Canonical storage location in scenarios/index/
   * e.g., "a/4/4/d/a/a44dada6-50cb-4d0e-901e-7a9a6970d5c6.scenario.json"
   */
  indexPath: string;
  
  // ═══════════════════════════════════════════════════════════════
  // Reference Tracking
  // ═══════════════════════════════════════════════════════════════
  
  /** 
   * Created symlinks for this scenario
   * e.g., ["type/ONCE/0.3.21.8/uuid.scenario.json", "domain/box/fritz/.../uuid.scenario.json"]
   */
  symlinkPaths: string[];
  
  /** 
   * All references to this unit with sync status
   * Tracks links created in ontology, MDA, etc.
   */
  references: UnitReference[];
  
  // ═══════════════════════════════════════════════════════════════
  // Classification (Optional)
  // ═══════════════════════════════════════════════════════════════
  
  /** 
   * MOF M3/M2/M1 hierarchy classification
   * CLASS, ATTRIBUTE, RELATIONSHIP
   */
  typeM3?: TypeM3;
  
  /** 
   * IOR string to original source
   * e.g., "ior:git:github.com/.../DefaultCLI.ts"
   */
  origin?: string;
  
  /** 
   * IOR string to definition
   * e.g., "ior:git:github.com/.../DefaultCLI.ts"
   */
  definition?: string;
  
  // ═══════════════════════════════════════════════════════════════
  // Schema Evolution
  // ═══════════════════════════════════════════════════════════════
  
  /** 
   * Schema version for migration support
   * e.g., "1.0.0" = no unit, "1.1.0" = with unit
   */
  schemaVersion: string;
  
  /** 
   * Component that created this scenario
   * e.g., "ONCE/0.3.21.8"
   */
  createdBy: string;
  
  // ═══════════════════════════════════════════════════════════════
  // Timestamps
  // ═══════════════════════════════════════════════════════════════
  
  /** ISO timestamp of unit creation */
  createdAt: string;
  
  /** ISO timestamp of last unit update */
  updatedAt: string;
}

/**
 * Current schema version for scenarios with unit extension
 */
export const SCENARIO_SCHEMA_VERSION = '1.1.0';

/**
 * Legacy schema version for scenarios without unit extension
 */
export const SCENARIO_SCHEMA_VERSION_LEGACY = '1.0.0';

























