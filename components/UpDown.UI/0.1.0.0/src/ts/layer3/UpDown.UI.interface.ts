/**
 * UpDown.UI - UpDown.UI Component Interface
 * Web4 pattern: Component interface definition
 */

import { Scenario } from './Scenario.interface.js';
import { UpDown.UIModel } from './UpDown.UIModel.interface.js';

export interface UpDown.UI {
  init(scenario: Scenario<UpDown.UIModel>): this;
  toScenario(name?: string): Promise<Scenario<UpDown.UIModel>>;
  create(input: string, format?: string): Promise<this>;
  process(data: string): Promise<this>;
  info(): Promise<this>;
  test(): Promise<this>;
}
