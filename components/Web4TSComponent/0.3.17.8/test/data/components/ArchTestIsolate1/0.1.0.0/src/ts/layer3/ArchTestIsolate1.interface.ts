/**
 * ArchTestIsolate1 - ArchTestIsolate1 Component Interface
 * Web4 pattern: Component interface definition
 */

import { Scenario } from './Scenario.interface.js';
import { ArchTestIsolate1Model } from './ArchTestIsolate1Model.interface.js';

export interface ArchTestIsolate1 {
  init(scenario: Scenario<ArchTestIsolate1Model>): this;
  toScenario(name?: string): Promise<Scenario<ArchTestIsolate1Model>>;
  create(input: string, format?: string): Promise<this>;
  process(data: string): Promise<this>;
  info(): Promise<this>;
  test(): Promise<this>;
}
