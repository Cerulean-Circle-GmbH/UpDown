/**
 * Storage Interface - Web4 compliant storage for scenarios
 * 
 * Extends PersistenceManager (JsInterface) for RelatedObjects registry compatibility.
 * 
 * ✅ Web4 Principle 6: Empty Constructor + init()
 * ✅ Web4 Principle 19: One File One Type
 * ✅ Web4 Principle 24: RelatedObjects Registry lookup
 * ✅ JsInterface: Runtime-existing abstract class
 * 
 * Purpose: UUID index system with symlinks for scenarios
 * 
 * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
 * @pdca 2025-12-08-UTC-1100.jsinterface-type-descriptors.pdca.md
 */

import type { StorageScenario } from './StorageScenario.interface.js';
import { PersistenceManager, ScenarioQuery } from './PersistenceManager.interface.js';

// Re-export ScenarioQuery for convenience
export type { ScenarioQuery } from './PersistenceManager.interface.js';

/**
 * Storage extends PersistenceManager with initialization and hibernation
 * 
 * Abstract class (JsInterface pattern) - extends PersistenceManager
 */
export abstract class Storage extends PersistenceManager {
  /**
   * Initialize from scenario - Web4 pattern
   */
  abstract init(scenario: StorageScenario): this;

  /**
   * Convert to scenario for hibernation
   */
  abstract toScenario(): Promise<StorageScenario>;
}
