/**
 * ProjectStatusManager - ProjectStatusManager Component Interface
 * Web4 pattern: Component interface definition
 */

import { Scenario } from './Scenario.interface.js';
import { ProjectStatusManagerModel } from './ProjectStatusManagerModel.interface.js';

export interface ProjectStatusManager {
  init(scenario: Scenario<ProjectStatusManagerModel>): this;
  toScenario(name?: string): Promise<Scenario<ProjectStatusManagerModel>>;
  status(): Promise<this>;
  nextActions(): Promise<this>;
  progress(): Promise<this>;
  timeline(): Promise<this>;
  process(data: string): Promise<this>;
  info(): Promise<this>;
  test(): Promise<this>;
}
