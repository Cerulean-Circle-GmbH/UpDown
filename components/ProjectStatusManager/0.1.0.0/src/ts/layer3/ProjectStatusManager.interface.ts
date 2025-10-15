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
  addTask(taskName: string, description: string, priority?: string): Promise<this>;
  addSubtask(taskId: string, subtaskName: string, description: string): Promise<this>;
  refineSubtask(taskId: string, subtaskId: string, details: string): Promise<this>;
  updateTaskState(taskId: string, newState: string): Promise<this>;
  runThroughStates(taskId: string, autoMode?: boolean): Promise<this>;
  taskStatus(): Promise<this>;
  autonomousMode(): Promise<this>;
  intervene(reason: string): Promise<this>;
  confirmAction(actionId: string): Promise<this>;
  feedback(feedback: string): Promise<this>;
  override(actionId: string, reason: string): Promise<this>;
  autonomousStatus(): Promise<this>;
  process(data: string): Promise<this>;
  info(): Promise<this>;
  test(): Promise<this>;
}
