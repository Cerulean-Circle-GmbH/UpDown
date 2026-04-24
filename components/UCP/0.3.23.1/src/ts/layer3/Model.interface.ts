/**
 * Model - Base Model Interface
 * Web4 pattern: Base model interface for all components
 * 
 * DRY: iorComponent and iorVersion are for toScenario() - NEVER hardcode versions!
 * Version comes from directory name at runtime (set by init()).
 * 
 * Note: Some components like Web4TSComponent have their own `version` as SemanticVersion.
 * Use iorVersion for the string version used in IOR/toScenario.
 */

export interface Model {
  uuid: string;
  name: string;
  /** Component name for IOR (class name - used by toScenario) */
  iorComponent?: string;
  /** Version string for IOR - NEVER hardcode! Set by init() from directory. */
  iorVersion?: string;
  // origin: string;
  // definition: string;
}