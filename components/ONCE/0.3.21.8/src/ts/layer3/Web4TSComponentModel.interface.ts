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

export interface Web4TSComponentModel extends Model {
  // uuid, name inherited from Model
  
  /** Component name (e.g., 'Web4TSComponent') */
  component: string;
  
  /** Version component INSTANCE (not string!) */
  version: SemanticVersion;
  
  /** Component's own root directory */
  componentRoot: string;
  
  /** Project root path */
  projectRoot: string;
  
  /** Target directory for component operations */
  targetDirectory: string;
  
  /** Pre-calculated components directory */
  componentsDirectory: string;
  
  /** Semantic flag indicating test isolation mode */
  isTestIsolation: boolean;
  
  /** Test data directory path (only when isTestIsolation = true) */
  testDataDirectory?: string;
  
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
  
  /** Context: Another component INSTANCE for delegation */
  context?: Reference<unknown>;
  
  /** Calculated path to TARGET component root */
  targetComponentRoot?: string;
  
  /** @deprecated Use targetComponentRoot instead */
  componentPath?: string;
  
  /** Layer2 implementation class name */
  implementationClassName?: string;
  
  /** Promotion level for release testing */
  promotionLevel?: string;
  
  /** Target version for upgrade operations */
  toVersion?: string;
}









