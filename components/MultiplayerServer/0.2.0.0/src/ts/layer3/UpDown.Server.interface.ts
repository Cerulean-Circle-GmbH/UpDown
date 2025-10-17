/**
 * UpDown.Server - UpDown.Server Component Interface
 * Web4 pattern: Component interface definition
 */

import { Scenario } from './Scenario.interface.js';
import { UpDown.ServerModel } from './UpDown.ServerModel.interface.js';

export interface UpDown.Server {
  init(scenario: Scenario<UpDown.ServerModel>): this;
  toScenario(name?: string): Promise<Scenario<UpDown.ServerModel>>;
  create(input: string, format?: string): Promise<this>;
  process(data: string): Promise<this>;
  info(): Promise<this>;
  test(): Promise<this>;
}
