/**
 * Version - Semantic versioning behavior interface
 * 
 * Web4 Principle 19: One File One Type
 * Migrated from Web4TSComponent/0.3.20.6
 * 
 * @pdca 2025-12-08-UTC-1400.web4tscomponent-migration.pdca.md
 */

import type { VersionModel } from './VersionModel.interface.js';

export interface Version {
  /** Version model */
  model: VersionModel;
  
  /** Parse version string to model */
  parse(version: string): this;
  
  /** Convert to string representation */
  toString(): string;
  
  /** Compare versions (-1, 0, 1) */
  compareTo(other: Version): number;
  
  /** Promote to next major version (immutable) */
  promoteMajor(): Promise<Version>;
  
  /** Promote to next minor version (immutable) */
  promoteMinor(): Promise<Version>;
  
  /** Promote to next patch version (immutable) */
  promotePatch(): Promise<Version>;
  
  /** Promote to next revision (immutable) */
  promoteRevision(): Promise<Version>;
  
  /** Validate version string format */
  isValid(version: string): boolean;
}

























