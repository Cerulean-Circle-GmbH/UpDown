/**
 * GameUserInterface - GameUserInterface Component Interface
 * Web4 pattern: Component interface definition
 */

import { Scenario } from './Scenario.interface.js';
import { GameUserInterfaceModel } from './GameUserInterfaceModel.interface.js';

export interface GameUserInterface {
  init(scenario: Scenario<GameUserInterfaceModel>): this;
  toScenario(name?: string): Promise<Scenario<GameUserInterfaceModel>>;
  create(input: string, format?: string): Promise<this>;
  process(data: string): Promise<this>;
  info(): Promise<this>;
  test(): Promise<this>;
}
