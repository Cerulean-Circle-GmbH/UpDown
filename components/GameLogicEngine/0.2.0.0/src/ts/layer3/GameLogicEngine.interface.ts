/**
 * GameLogicEngine - UpDown.Core Component Interface
 * Web4 pattern: Component interface definition
 */

import { Scenario } from './Scenario.interface.js';
import { GameLogicEngineModel } from './GameLogicEngineModel.interface.js';

export interface GameLogicEngine {
  init(scenario: Scenario<GameLogicEngineModel>): this;
  toScenario(name?: string): Promise<Scenario<GameLogicEngineModel>>;
  startGame(playerCount?: string, gameMode?: string): Promise<this>;
  makeGuess(playerId: string, guess: string): Promise<this>;
  dealNextCard(cardValue?: string): Promise<this>;
  showGameStatus(): Promise<this>;
  process(data: string): Promise<this>;
  info(): Promise<this>;
  test(): Promise<this>;
}
