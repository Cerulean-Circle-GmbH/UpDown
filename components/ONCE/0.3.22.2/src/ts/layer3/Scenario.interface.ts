/**
 * Scenario - Web4 Scenario Interface with Complete IOR
 * Web4 pattern: Scenario support for component state management
 * 
 * Generic type T must extend Model (Web4 Principle 1a: All models extend Model)
 * 
 * Scenario is an aggregation of:
 * 1. IOR (Internet Object Reference) - identity & network location
 * 2. owner (UserModel) - ownership attribution
 * 3. model (T extends Model) - component-specific state
 * 4. unit (ScenarioUnit) - OPTIONAL reference tracking & schema versioning
 * 
 * @pdca session/2025-11-21-UTC-1900.iteration-01.6-once-architecture-consolidation.pdca.md
 * @pdca session/2025-12-08-UTC-1000.scenario-unit-unification.pdca.md
 */

import type { Model } from './Model.interface.js';
import type { ScenarioUnit } from './ScenarioUnit.interface.js';

export interface Scenario<T extends Model = Model> {
  /**
   * IOR — REQUIRED
   * @pdca 2026-01-04-UTC-1630.cli-path-authority-full-migration.pdca.md CPA.5
   */
  ior: {
    uuid: string;              // Object instance UUID
    component: string;         // Component name (ONCE, User, HTTPSServer)
    version: string;           // Component version (0.3.21.2)
    iorString?: string;        // Fully qualified IOR string (optional within ior)
  };
  
  /**
   * Owner — REQUIRED
   */
  owner: string;
  
  /**
   * Model — REQUIRED
   */
  model: T;
  
  /**
   * Unit extension - reference tracking & schema versioning
   * OPTIONAL for backward compatibility with existing scenarios
   * @since schema version 1.1.0
   */
  unit?: ScenarioUnit;
}
