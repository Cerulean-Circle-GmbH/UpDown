/**
 * MultiplayerServer - MultiplayerServer Component Interface
 * Web4 pattern: Component interface definition
 */

import { Scenario } from './Scenario.interface.js';
import { MultiplayerServerModel } from './MultiplayerServerModel.interface.js';

export interface MultiplayerServer {
  init(scenario: Scenario<MultiplayerServerModel>): this;
  toScenario(name?: string): Promise<Scenario<MultiplayerServerModel>>;
  create(input: string, format?: string): Promise<this>;
  process(data: string): Promise<this>;
  info(): Promise<this>;
  test(): Promise<this>;
}
