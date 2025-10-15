/**
 * ComponentMigrator - ComponentMigrator Component Interface
 * Web4 pattern: Component interface definition
 */

import { Scenario } from './Scenario.interface.js';
import { ComponentMigratorModel } from './ComponentMigratorModel.interface.js';

export interface ComponentMigrator {
  init(scenario: Scenario<ComponentMigratorModel>): this;
  toScenario(name?: string): Promise<Scenario<ComponentMigratorModel>>;
  migrateComponent(oldName: string, newName: string, version?: string): Promise<this>;
  migrateAllUpDownComponents(version?: string): Promise<this>;
  showMigrationPlan(): Promise<this>;
  process(data: string): Promise<this>;
  info(): Promise<this>;
  test(): Promise<this>;
}
