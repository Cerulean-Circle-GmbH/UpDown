/**
 * PersistenceManager Interface - Common storage interface for all platforms
 * 
 * ✅ Web4 Principle 24: RelatedObjects Registry
 * ✅ Web4 Principle 19: One File One Type
 * 
 * Both NodeJS (filesystem) and Browser (IndexedDB) implement this interface.
 * Can be looked up from RelatedObjects registry by any component.
 * 
 * Usage:
 * ```typescript
 * // Register in init()
 * controller.relatedObjectRegister(PersistenceManager, storage);
 * 
 * // Lookup from anywhere
 * const storage = controller.relatedObjectLookup(PersistenceManager);
 * await storage.scenarioSave(uuid, scenario, symlinkPaths);
 * ```
 * 
 * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
 */

import type { Scenario } from './Scenario.interface.js';
import type { Model } from './Model.interface.js';

/**
 * Query interface for finding scenarios
 */
export interface ScenarioQuery {
  /** Filter by component type */
  component?: string;
  /** Filter by version */
  version?: string;
  /** Filter by domain */
  domain?: string;
  /** Filter by capability type */
  capabilityType?: string;
  /** Filter by capability value */
  capabilityValue?: string;
}

/**
 * PersistenceManager - Platform-agnostic scenario storage interface
 * 
 * Implementations:
 * - NodeJsScenarioStorage: Filesystem with UUID index + symlinks
 * - BrowserScenarioStorage: IndexedDB with same logical structure
 * 
 * @interface
 */
export interface PersistenceManager {
  
  /**
   * Save scenario to storage
   * 
   * @param uuid Scenario UUID
   * @param scenario Scenario to save
   * @param symlinkPaths Array of symlink paths (type/domain/capability)
   */
  scenarioSave<T extends Model>(
    uuid: string, 
    scenario: Scenario<T>, 
    symlinkPaths: string[]
  ): Promise<void>;
  
  /**
   * Load scenario from storage
   * 
   * @param uuid Scenario UUID to load
   * @returns Scenario or throws if not found
   */
  scenarioLoad<T extends Model>(uuid: string): Promise<Scenario<T>>;
  
  /**
   * Find scenarios by query
   * 
   * @param query Query with optional filters
   * @returns Array of matching scenarios
   */
  scenarioFind<T extends Model>(query: ScenarioQuery): Promise<Scenario<T>[]>;
  
  /**
   * Delete scenario from storage
   * 
   * @param uuid Scenario UUID to delete
   * @param removeSymlinks Also remove symlinks (default true)
   */
  scenarioDelete(uuid: string, removeSymlinks?: boolean): Promise<void>;
  
  /**
   * Check if scenario exists
   * 
   * @param uuid Scenario UUID to check
   */
  scenarioExists(uuid: string): Promise<boolean>;
}

/**
 * Symbol for RelatedObjects registry lookup
 * Use: controller.relatedObjectRegister(PersistenceManager, instance)
 */
export const PersistenceManager = Symbol('PersistenceManager');

