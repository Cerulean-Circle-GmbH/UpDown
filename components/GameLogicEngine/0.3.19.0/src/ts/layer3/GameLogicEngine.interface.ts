/**
 * GameLogicEngine - GameLogicEngine Component Interface
 * Web4 pattern: Component interface definition
 */

import { Scenario } from './Scenario.interface.js';
import { GameLogicEngineModel } from './GameLogicEngineModel.interface.js';

export interface GameLogicEngine {
  init(scenario: Scenario<GameLogicEngineModel>): this;
  toScenario(name?: string): Promise<Scenario<GameLogicEngineModel>>;
  create(input: string, format?: string): Promise<this>;
  process(data: string): Promise<this>;
  info(): Promise<this>;
  test(): Promise<this>;
}
