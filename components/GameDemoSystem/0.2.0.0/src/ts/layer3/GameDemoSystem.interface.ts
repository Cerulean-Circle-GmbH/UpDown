/**
 * GameDemoSystem - UpDown.Demo Component Interface
 * Web4 pattern: Component interface definition
 */

import { Scenario } from './Scenario.interface.js';
import { GameDemoSystemModel } from './GameDemoSystemModel.interface.js';

export interface GameDemoSystem {
  init(scenario: Scenario<GameDemoSystemModel>): this;
  toScenario(name?: string): Promise<Scenario<GameDemoSystemModel>>;
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
