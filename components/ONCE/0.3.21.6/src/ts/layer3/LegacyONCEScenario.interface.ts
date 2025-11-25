/**
 * LegacyONCEScenario - Legacy ONCE scenario format (v0.2.0.0)
 * Renamed from Scenario to avoid conflict with Web4 Standard Scenario
 * Web4 Standard - One type per file
 * 
 * Extends Model (Web4 Principle 1a: All models extend base Model)
 * 
 * @deprecated Use Scenario<ONCEModel> instead
 * @pdca 2025-11-19-UTC-1342.migrate-scenarios-to-ior-owner-format.pdca.md
 */

import type { Model } from './Model.interface.js';
import { ScenarioReference } from './ScenarioReference.interface.js';
import { ScenarioMetadata } from './ScenarioMetadata.interface.js';

export interface LegacyONCEScenario extends Model {
  /**
   * Unique identifier & name (inherited from Model)
   */

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

