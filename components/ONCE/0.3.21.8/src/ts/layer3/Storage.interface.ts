/**
 * Storage Interface - Web4 compliant storage for scenarios
 * 
 * ✅ Web4 Principle 6: Empty Constructor + init()
 * ✅ Web4 Principle 19: One File One Type
 * 
 * Purpose: UUID index system with symlinks for scenarios
 * 
 * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
 */

import type { StorageScenario } from './StorageScenario.interface.js';
import type { Scenario } from './Scenario.interface.js';
import type { Model } from './Model.interface.js';

export interface Storage {
  /**
   * Initialize from scenario - Web4 pattern
   */
  init(scenario: StorageScenario): this;

  /**
   * Save scenario to UUID index with symlinks
   * 
   * @param uuid - Scenario UUID
   * @param scenario - Scenario to save
   * @param symlinkPaths - Array of symlink paths (type/domain/capability)
   */
  scenarioSave<T extends Model>(uuid: string, scenario: Scenario<T>, symlinkPaths: string[]): Promise<void>;

  /**
   * Load scenario from UUID index
   * 
   * @param uuid - Scenario UUID to load
   */
  scenarioLoad<T extends Model>(uuid: string): Promise<Scenario<T>>;

  /**
   * Find scenarios by query
   * 
   * @param query - Query object with optional filters
   */
  scenarioFind<T extends Model>(query: ScenarioQuery): Promise<Scenario<T>[]>;

  /**
   * Convert to scenario for hibernation
   */
  toScenario(): Promise<StorageScenario>;
}

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

