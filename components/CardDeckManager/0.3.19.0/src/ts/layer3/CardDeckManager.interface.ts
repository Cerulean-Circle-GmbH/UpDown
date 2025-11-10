/**
 * CardDeckManager - CardDeckManager Component Interface
 * Web4 pattern: Component interface definition
 */

import { Scenario } from './Scenario.interface.js';
import { CardDeckManagerModel } from './CardDeckManagerModel.interface.js';

export interface CardDeckManager {
  init(scenario: Scenario<CardDeckManagerModel>): this;
  toScenario(name?: string): Promise<Scenario<CardDeckManagerModel>>;
  create(input: string, format?: string): Promise<this>;
  process(data: string): Promise<this>;
  info(): Promise<this>;
  test(): Promise<this>;
}
