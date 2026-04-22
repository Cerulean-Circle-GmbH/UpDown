/**
 * User Interface - Clean user component interface
 *
 * Web4 principle: Single interface per file
 */

import { Scenario } from './Scenario.interface.js';

export interface User {
  /**
   * Initialize from scenario - Web4 pattern
   */
  init(scenario: Scenario): this;

  /**
   * Convert to scenario for hibernation
   */
  toScenario(): Promise<Scenario>;
}
