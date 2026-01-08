/**
 * IdealMinimalComponentModel - IdealMinimalComponent Component Model Interface
 * Web4 pattern: Component model following auto-discovery patterns
 */

import { Model } from './Model.interface.js';

export interface IdealMinimalComponentModel extends Model {
  uuid: string;
  name: string;
  origin: string;
  definition: string;
  createdAt: string;
  updatedAt: string;
  component?: string;             // Component name for CLI display
  version?: string;               // Component version for CLI display and test promotion
  
  // Component-specific (discovered from import.meta.url)
  componentRoot?: string;         // THIS component's root directory
  
  // @deprecated Path properties — Use accessors instead
  // @pdca 2026-01-08-UTC-1400.path-calculation-consolidation.pdca.md PC.5
  /** @deprecated Use this.projectRoot accessor */
  projectRoot?: string;
  /** @deprecated Use this.projectRoot accessor */
  targetDirectory?: string;
  /** @deprecated */
  targetComponentRoot?: string;
  
  context?: any;                  // Context for "on" delegation mode (holds delegated component instance)
  isTestIsolation?: boolean;      // Test isolation mode flag (for DelegationProxy context)
}
