/**
 * StorageModel Interface - Storage state management
 * 
 * ✅ Web4 Principle 19: One File One Type
 * 
 * Purpose: Model for scenario storage with index paths
 * 
 * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
 */

export interface StorageModel {
  /** Unique identifier for this storage instance */
  uuid: string;
  
  /** Project root path (where scenarios/ lives) */
  projectRoot: string;
  
  /** Base directory for index: scenarios/index/ */
  indexBaseDir: string;
  
  /** ISO timestamp of creation */
  createdAt: string;
  
  /** ISO timestamp of last update */
  updatedAt: string;
}





