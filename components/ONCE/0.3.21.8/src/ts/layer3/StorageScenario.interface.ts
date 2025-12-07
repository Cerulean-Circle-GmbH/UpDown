/**
 * StorageScenario Interface - Storage-specific scenario format
 * 
 * ✅ Web4 Principle 1: Everything is a Scenario
 * ✅ Web4 Principle 19: One File One Type
 * 
 * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
 */

import type { IOR } from './IOR.interface.js';
import type { StorageModel } from './StorageModel.interface.js';

export interface StorageScenario {
  /** Internet Object Reference */
  ior: IOR;
  /** Owner metadata as JSON string */
  owner: string;
  /** Storage model state */
  model: StorageModel;
}

