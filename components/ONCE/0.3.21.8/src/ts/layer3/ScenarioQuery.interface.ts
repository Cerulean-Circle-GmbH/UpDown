/**
 * ScenarioQuery Interface - Query parameters for finding scenarios
 * 
 * ✅ Web4 Principle 19: One File One Type
 * 
 * Used by PersistenceManager.scenarioFind() to filter scenarios.
 * 
 * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
 */

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





