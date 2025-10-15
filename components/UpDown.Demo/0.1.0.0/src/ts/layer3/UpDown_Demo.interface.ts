/**
 * UpDown_Demo - UpDown.Demo Component Interface
 * Web4 pattern: Component interface definition
 */

import { Scenario } from './Scenario.interface.js';
import { UpDown_DemoModel } from './UpDown_DemoModel.interface.js';

export interface UpDown_Demo {
  init(scenario: Scenario<UpDown_DemoModel>): this;
  toScenario(name?: string): Promise<Scenario<UpDown_DemoModel>>;
  runDemo(scenario?: string): Promise<this>;
  runCardsDemo(): Promise<this>;
  runCoreDemo(): Promise<this>;
  runFullGameDemo(): Promise<this>;
  runAllDemos(): Promise<this>;
  showScenarios(): Promise<this>;
  process(data: string): Promise<this>;
  info(): Promise<this>;
  test(): Promise<this>;
}
