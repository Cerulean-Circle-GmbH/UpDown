/**
 * VersionModel - State for SemanticVersion component
 * 
 * Web4 Principle 19: One File One Type
 * Migrated from Web4TSComponent/0.3.20.6
 * 
 * @pdca 2025-12-08-UTC-1400.web4tscomponent-migration.pdca.md
 */

import type { Model } from './Model.interface.js';

export interface VersionModel extends Model {
  major: number;
  minor: number;
  patch: number;
  revision: number;
  versionString: string;
}





