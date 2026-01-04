/**
 * UnitDefinition - Definition for discovering and creating units
 * 
 * Web4 Principle 19: One File One Type
 * Preparation for Unit component extraction in 0.4.0.0
 * 
 * @pdca 2025-12-08-UTC-1200.unit-manifest-generation.pdca.md
 */

import { TypeM3 } from './TypeM3.enum.js';

/**
 * UnitDefinition - Describes a unit to be discovered/created
 */
export interface UnitDefinition {
  /** File name */
  filename: string;
  
  /** Relative path from component root */
  relativePath: string;
  
  /** Full absolute path to the file */
  fullPath: string;
  
  /** Human-readable description */
  description: string;
  
  /** MOF M3/M2/M1 classification */
  typeM3: TypeM3;
  
  /** MIME type */
  mimetype: string;
  
  /** File extension (optional, derived from filename) */
  extension?: string;
  
  /** Optional: Existing UUID if unit already exists */
  existingUuid?: string;
}

/**
 * UnitFilePattern - Pattern for discovering units by file type
 */
export interface UnitFilePattern {
  /** Glob pattern */
  glob: string;
  
  /** TypeM3 classification for this pattern */
  typeM3: TypeM3;
  
  /** MIME type for files matching this pattern */
  mimetype: string;
  
  /** Whether to recursively search */
  recursive: boolean;
  
  /** Directories to exclude */
  excludeDirs?: string[];
}
