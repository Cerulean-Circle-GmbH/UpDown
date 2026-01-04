/**
 * CLI - Base CLI component interface
 * 
 * Web4 Principle 19: One File One Type
 * Migrated from Web4TSComponent/0.3.20.6
 * 
 * @pdca 2025-12-08-UTC-1400.web4tscomponent-migration.pdca.md
 */

import type { Scenario } from './Scenario.interface.js';
import type { CLIModel } from './CLIModel.interface.js';

export interface CLI {
  /** Initialize CLI with Scenario */
  init(scenario: Scenario<CLIModel>): this;
  
  /** Execute CLI commands */
  execute(args: string[]): Promise<void>;
  
  /** Show usage information */
  showUsage(): void;
}
