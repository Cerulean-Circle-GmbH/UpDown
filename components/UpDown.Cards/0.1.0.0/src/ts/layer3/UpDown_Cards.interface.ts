/**
 * UpDown_Cards - UpDown.Cards Component Interface
 * Web4 pattern: Component interface definition
 */

import { Scenario } from './Scenario.interface.js';
import { UpDown_CardsModel } from './UpDown_CardsModel.interface.js';

export interface UpDown_Cards {
  init(scenario: Scenario<UpDown_CardsModel>): this;
  toScenario(name?: string): Promise<Scenario<UpDown_CardsModel>>;
  createDeck(shuffle?: string): Promise<this>;
  shuffleDeck(): Promise<this>;
  dealCard(count?: string): Promise<this>;
  showDeck(): Promise<this>;
  process(data: string): Promise<this>;
  info(): Promise<this>;
  test(): Promise<this>;
}
