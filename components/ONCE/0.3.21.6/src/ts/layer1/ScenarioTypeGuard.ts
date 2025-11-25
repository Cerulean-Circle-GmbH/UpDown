/**
 * ScenarioTypeGuard - TRUE Radical OOP type guard for scenario format detection
 * Web4 EAM Layer 1 - Infrastructure
 * @pdca 2025-11-19-UTC-1342.migrate-scenarios-to-ior-owner-format.pdca.md
 */

import { Model } from '../layer3/Model.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';
import { LegacyONCEScenario } from '../layer3/LegacyONCEScenario.interface.js';

/**
 * Type Guard - TRUE Radical OOP Pattern
 * ✅ Class with instance methods (NOT standalone functions)
 * ✅ Layer 1 - Infrastructure (type checking is infrastructure concern)
 */
export class ScenarioTypeGuard {
  private model: any;
  
  constructor() {
    this.model = {};
  }
  
  /**
   * Set scenario to check
   */
  public init(scenario: any): this {
    this.model = scenario;
    return this;
  }
  
  /**
   * Check if scenario is legacy format
   */
  public isLegacy(): boolean {
    return 'objectType' in this.model && 
           'state' in this.model && 
           !('ior' in this.model);
  }
  
  /**
   * Check if scenario is Web4 Standard format
   */
  public isWeb4(): boolean {
    return 'ior' in this.model && 
           'owner' in this.model && 
           'model' in this.model;
  }
  
  /**
   * Get scenario with type guard
   */
  public asLegacy(): LegacyONCEScenario | null {
    return this.isLegacy() ? (this.model as LegacyONCEScenario) : null;
  }
  
  /**
   * Get scenario with type guard (Web4 Standard format)
   * @param T - Model type (must extend Model)
   */
  public asWeb4<T extends Model = Model>(): Scenario<T> | null {
    return this.isWeb4() ? (this.model as Scenario<T>) : null;
  }
}

