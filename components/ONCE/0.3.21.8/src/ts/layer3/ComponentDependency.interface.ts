/**
 * ComponentDependency - Component Dependency Interface
 * 
 * Web4 Principle 19: One File One Type
 * Migrated from Web4TSComponent/0.3.20.6
 * 
 * @pdca 2025-12-08-UTC-1400.web4tscomponent-migration.pdca.md
 */

export interface ComponentDependency {
  /** Component name (e.g., 'IOR', 'Scenario') */
  component: string;
  
  /** Required version in semantic format */
  version: string;
  
  /** Optional custom path (defaults to ../ComponentName/version) */
  path?: string;
}














