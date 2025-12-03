/**
 * Web4Requirement - Web4Requirement Component Interface
 * Web4 pattern: Component interface definition
 * 
 * ✅ Radical OOP: Requirements are objects with acceptance criteria
 * ✅ Replaces arrow function assertions with OOP validation
 * 
 * @pdca 2025-11-10-UTC-1845.eliminate-delegation-dry-violation.pdca.md
 * NOTE: Delegated methods (info, test, build, clean, tree, links, etc.) are NOT declared here.
 * They are automatically available via DelegationProxy wrapping in the CLI.
 */

import { Scenario } from './Scenario.interface.js';
import { Web4RequirementModel } from './Web4RequirementModel.interface.js';
import { AcceptanceCriterion } from './AcceptanceCriterion.interface.js';

export interface Web4Requirement {
  // Core Web4 methods
  init(scenario?: Scenario<Web4RequirementModel>): Promise<this>;
  toScenario(name?: string): Promise<Scenario<Web4RequirementModel>>;
  
  // ✅ Acceptance Criteria Methods (Radical OOP - replaces arrow function assertions)
  
  /**
   * Add an acceptance criterion to this requirement
   * @param id Unique ID (e.g., "AC-01")
   * @param description Human-readable description
   */
  addCriterion(id: string, description: string): this;
  
  /**
   * Validate an acceptance criterion with actual value
   * @param id Criterion ID to validate
   * @param condition Boolean condition (true = passed, false = failed)
   * @param evidence Optional evidence data
   */
  validateCriterion(id: string, condition: boolean, evidence?: any): this;
  
  /**
   * Get all acceptance criteria
   */
  getCriteria(): AcceptanceCriterion[];
  
  /**
   * Check if all acceptance criteria passed
   */
  allCriteriaPassed(): boolean;
  
  /**
   * Get failed criteria
   */
  getFailedCriteria(): AcceptanceCriterion[];
  
  /**
   * Generate markdown report of requirement status
   */
  generateReport(): string;
  
  // Legacy methods (for backward compatibility)
  create(input: string, format?: string): Promise<this>;
  process(data: string): Promise<this>;
  
  // Delegated methods (info, test, etc.) are available via DelegationProxy but not declared here
}

