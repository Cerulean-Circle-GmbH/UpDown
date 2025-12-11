/**
 * UnitReference Interface - IOR string-based reference tracking
 * 
 * ✅ Web4 Principle 1: Everything is a Scenario
 * ✅ Web4 Principle 19: One File One Type
 * 
 * Purpose: Track unit references with IOR strings and sync status
 * 
 * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
 */

import { SyncStatus } from './SyncStatus.enum.js';

export interface UnitReference {
  /** IOR string for link location: "ior:local:ln:file://..." */
  linkLocation: string;
  /** IOR string for link target: "ior:unit:uuid" */
  linkTarget: string;
  /** Synchronization status */
  syncStatus: SyncStatus;
}




