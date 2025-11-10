/**
 * TestIsolatedComponent - TestIsolatedComponent Component Interface
 * Web4 pattern: Component interface definition
 */

import { Scenario } from './Scenario.interface.js';
import { TestIsolatedComponentModel } from './TestIsolatedComponentModel.interface.js';

export interface TestIsolatedComponent {
  init(scenario: Scenario<TestIsolatedComponentModel>): this;
  toScenario(name?: string): Promise<Scenario<TestIsolatedComponentModel>>;
  create(input: string, format?: string): Promise<this>;
  process(data: string): Promise<this>;
  info(): Promise<this>;
  test(): Promise<this>;
}
