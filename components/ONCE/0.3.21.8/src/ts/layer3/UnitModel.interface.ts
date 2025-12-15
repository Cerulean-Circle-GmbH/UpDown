/**
 * UnitModel Interface - Unit component model extending base Model
 * 
 * ✅ Web4 Principle 1: Everything is a Scenario
 * ✅ Web4 Principle 19: One File One Type
 * 
 * Purpose: Unit-specific model with MOF classification and storage tracking
 * 
 * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
 */

import type { Model } from './Model.interface.js';
import type { TypeM3 } from './TypeM3.enum.js';
import type { UnitReference } from './UnitReference.interface.js';

export interface UnitModel extends Model {
  // Inherited from Model: uuid, name
  
  /** IOR string for unit origin (e.g., git commit) */
  origin: string;
  
  /** IOR string for unit definition (e.g., file:line:col) */
  definition: string;
  
  /** MOF M3/M2/M1 hierarchy classification */
  typeM3?: TypeM3;
  
  /** Path to this unit in scenarios/index/ */
  indexPath: string;
  
  /** Unified reference tracking (symlinks, named links) */
  references: UnitReference[];
  
  /** ISO timestamp of creation */
  createdAt: string;
  
  /** ISO timestamp of last update */
  updatedAt: string;
}









