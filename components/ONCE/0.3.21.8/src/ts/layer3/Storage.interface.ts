/**
 * Storage Interface - Web4 compliant storage for scenarios
 * 
 * Extends PersistenceManager for RelatedObjects registry compatibility.
 * 
 * ✅ Web4 Principle 6: Empty Constructor + init()
 * ✅ Web4 Principle 19: One File One Type
 * ✅ Web4 Principle 24: RelatedObjects Registry lookup
 * 
 * Purpose: UUID index system with symlinks for scenarios
 * 
 * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
 */

import type { StorageScenario } from './StorageScenario.interface.js';
import type { PersistenceManager, ScenarioQuery } from './PersistenceManager.interface.js';

/**
 * Storage extends PersistenceManager with initialization and hibernation
 */
export interface Storage extends PersistenceManager {
  /**
   * Initialize from scenario - Web4 pattern
   */
  init(scenario: StorageScenario): this;

  /**
   * Convert to scenario for hibernation
   */
  toScenario(): Promise<StorageScenario>;
}

// Re-export ScenarioQuery for convenience
export type { ScenarioQuery } from './PersistenceManager.interface.js';

