/**
 * UpDown_Core - UpDown.Core Component Interface
 * Web4 pattern: Component interface definition
 */

import { Scenario } from './Scenario.interface.js';
import { UpDown_CoreModel } from './UpDown_CoreModel.interface.js';

export interface UpDown_Core {
  init(scenario: Scenario<UpDown_CoreModel>): this;
  toScenario(name?: string): Promise<Scenario<UpDown_CoreModel>>;
  startGame(playerCount?: string, gameMode?: string): Promise<this>;
  makeGuess(playerId: string, guess: string): Promise<this>;
  dealNextCard(cardValue?: string): Promise<this>;
  showGameStatus(): Promise<this>;
  process(data: string): Promise<this>;
  info(): Promise<this>;
  test(): Promise<this>;
}
