/**
 * LegacyONCEScenario - Legacy ONCE scenario format (v0.2.0.0)
 * Renamed from Scenario to avoid conflict with Web4 Standard Scenario
 * Web4 Standard - One type per file
 * @pdca 2025-11-19-UTC-1342.migrate-scenarios-to-ior-owner-format.pdca.md
 */

import { ScenarioReference } from './ScenarioReference.interface.js';
import { ScenarioMetadata } from './ScenarioMetadata.interface.js';

/**
 * Legacy ONCE Scenario format (v0.2.0.0)
 * This is the format currently used in ONCE scenarios
 * Will be wrapped by Web4 Standard Scenario format
 */
export interface LegacyONCEScenario {
  /**
   * Unique identifier for this scenario
   */
  uuid: string;

  /**
   * Type of object this scenario represents
   */
  objectType: string;

  /**
   * Version of the object type
   */
  version: string;

  /**
   * Serialized state of the object
   */
  state: Record<string, any>;

  /**
   * References to other scenarios (IORs)
   */
  references?: ScenarioReference[];

  /**
   * Metadata about scenario creation
   */
  metadata: ScenarioMetadata;
}

