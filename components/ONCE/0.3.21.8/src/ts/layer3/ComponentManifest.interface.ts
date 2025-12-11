/**
 * ComponentManifest - Interface for component.json structure
 * 
 * ✅ Web4 Principle 19: One File One Type
 * ✅ Preparation for Unit component extraction in 0.4.0.0
 * 
 * @extract Unit/0.4.0.0
 * @pdca 2025-12-08-UTC-1200.unit-manifest-generation.pdca.md
 */

import type { Model } from './Model.interface.js';

/**
 * Unit entry in component manifest
 */
export interface ManifestUnit {
  /** Unit UUID (from scenario) */
  uuid: string;
  
  /** Unit name (filename) */
  name: string;
  
  /** Path to the file relative to component root */
  path: string;
  
  /** Path to the .unit symlink */
  unitPath: string;
  
  /** MIME type */
  mimetype: string;
}

/**
 * Units section in component manifest
 */
export interface ManifestUnits {
  /** CSS stylesheet units */
  css: ManifestUnit[];
  
  /** HTML template units */
  templates: ManifestUnit[];
  
  /** TypeScript class units (optional) */
  typescript?: ManifestUnit[];
}

/**
 * Entry points for component
 */
export interface ManifestEntryPoints {
  /** CLI entry point */
  cli?: string;
  
  /** Node.js entry point */
  node?: string;
  
  /** Browser entry point */
  browser?: string;
}

/**
 * Component manifest model
 */
export interface ComponentManifestModel extends Model {
  /** Component name */
  name: string;
  
  /** Component version */
  version: string;
  
  /** Component description */
  description: string;
  
  /** Layer 2 implementation class name */
  layer2Implementation?: string;
  
  /** Entry points */
  entryPoints?: ManifestEntryPoints;
  
  /** Units discovered in component */
  units: ManifestUnits;
  
  /** Dependencies */
  dependencies?: Record<string, string>;
}

/**
 * Full component manifest (scenario format)
 */
export interface ComponentManifest {
  /** IOR for the manifest */
  ior: {
    uuid: string;
    component: string;
    version: string;
  };
  
  /** Owner */
  owner: string;
  
  /** Manifest model */
  model: ComponentManifestModel;
}




