/**
 * Web4TSComponentModel - Web4 TypeScript Component Model Interface
 * 
 * Web4 Principle 19: One File One Type
 * Migrated from Web4TSComponent/0.3.20.6
 * 
 * @pdca 2025-12-08-UTC-1400.web4tscomponent-migration.pdca.md
 */

import type { Model } from './Model.interface.js';
import type { ComponentDependency } from './ComponentDependency.interface.js';
import type { SemanticVersion } from '../layer2/SemanticVersion.js';
import type { Reference } from './Reference.interface.js';
import type { Web4TSComponent } from './Web4TSComponent.interface.js';  // Type-only import avoids circular dep

export interface Web4TSComponentModel extends Model {
  // uuid, name inherited from Model
  
  /** Component name (e.g., 'Web4TSComponent') */
  component: string;
  
  /** Version component INSTANCE (not string!) */
  version: SemanticVersion;
  
  /** Component's own root directory */
  componentRoot: string;
  
  // NOTE: Path properties DELETED — Use accessors via CLI Path Authority
  // @pdca 2026-01-08-UTC-1400.path-calculation-consolidation.pdca.md PC.6
  // REMOVED: projectRoot — Use this.projectRoot accessor
  // REMOVED: targetDirectory — Use this.targetDirectory accessor (returns projectRoot)
  // REMOVED: componentsDirectory — Use this.componentsDirectory accessor
  // REMOVED: testDataDirectory — Use this.testDataDirectory accessor
  // REMOVED: isTestIsolation — Use this.isTestIsolation accessor (derived from projectRoot)
  
  /** Display identity - Component name to show */
  displayName: string;
  
  /** Display identity - Version to show */
  displayVersion: string;
  
  /** True if context exists (delegation mode) */
  isDelegation: boolean;
  
  /** Delegation info string */
  delegationInfo?: string;
  
  /** Test isolation context string */
  testIsolationContext?: string;
  
  /** Component dependencies with auto-build */
  dependencies?: ComponentDependency[];
  
  /** Unit IOR paths discovered for this component */
  units?: string[];
  
  /** Context: Another component INSTANCE for delegation */
  context?: Reference<Web4TSComponent>;
  
  /** Calculated path to TARGET component root (for 'on' command) */
  targetComponentRoot?: string;
  
  // REMOVED: componentPath — Use targetComponentRoot
  
  /** Layer2 implementation class name */
  implementationClassName?: string;
  
  /** Promotion level for release testing */
  promotionLevel?: string;
  
  /** Target version for upgrade operations */
  toVersion?: string;
}





